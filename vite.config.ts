import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// [AZURE-0] أضفنا loadEnv لقراءة مفاتيح Azure من ملف .env داخل الخادم فقط (لا تصل للمتصفح أبدًا).
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { voicePromptAudioId } from './src/utils/voicePromptIds.js'
import { DISCOVER_WORLDS } from './src/discover/data/discoverData.ts'
import { DISCOVER_QUIZ_QUESTIONS } from './src/discover/data/discoverQuizData.ts'
import { ENGLISH_ENCOURAGEMENTS, ENGLISH_FIXED_GAME_SPEECH, ENGLISH_FINAL_QUESTION_VOICE, ENGLISH_LETTER_QUESTION_VOICE } from './src/english/data/voicePrompts.ts'
import { SUCCESS_FEEDBACK, RETRY_FEEDBACK } from './src/utils/feedbackPrompts.ts'
import { getDefiniteLetterName } from './src/utils/arabicLetterNames.ts'
// [SPEECH-0] قواعد توليد «نص النطق» للحركات والمقاطع (الملف الجديد src/utils/arabicSpeech.ts).

import { buildHarakatWorldItems } from './src/data/harakatWorldVoiceItems.ts'

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g
const ARABIC_LETTER_MAP: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ء': 'hamza', 'ؤ': 'w', 'ئ': 'y',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'ain', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ﻻ': 'la',
}
const POSITION_MAP: Record<string, string> = { start: 'start', middle: 'middle', end: 'end' }

function slugArabic(text: string): string {
  const normalized = text.normalize('NFKD').replace(ARABIC_DIACRITICS, '')
  const converted = [...normalized]
    .map((char) => ARABIC_LETTER_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return converted || 'item'
}

function safeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'item'
}

function uniqueFilename(base: string, used: Set<string>): string {
  const extension = path.extname(base).toLowerCase()
  const stem = safeName(extension ? base.slice(0, -extension.length) : base)
  const clean = `${stem}${extension}`
  if (!used.has(clean)) {
    used.add(clean)
    return clean
  }
  let n = 2
  while (used.has(`${stem}_${n}${extension}`)) n += 1
  const result = `${stem}_${n}${extension}`
  used.add(result)
  return result
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function contentHash(parts: unknown[]): string {
  return crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex')
}

// ════════════════════════════════════════════════════════════════════
// [AZURE-1] مزوّد Azure Speech — دالة جديدة مستقلة تمامًا عن edge-tts.
//   - تستدعي واجهة Azure الرسمية (REST) وتُرجع ملف MP3 جاهزًا.
//   - الصيغة audio-24khz-48kbitrate-mono-mp3 هي نفس صيغة edge-tts تقريبًا.
//   - تُعيد المحاولة تلقائيًا عند 429 (كثرة الطلبات) أو أخطاء الخادم 5xx.
//   - عند 401/403 (مفتاح أو منطقة خاطئة) تفشل فورًا برسالة واضحة.
// لإضافة مزوّد ثالث لاحقًا (مثل ElevenLabs) انسخ هذا النمط: دالة تأخذ النص والصوت وتُرجع Buffer.
// ════════════════════════════════════════════════════════════════════
type TtsProvider = 'edge-tts' | 'azure'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
// ✅ تنظيف النص من الإيموجي والرموز قبل إرساله لأي محرك TTS
function stripForTts(text: string): string {
  return text
    // احذف كل Unicode خارج نطاق العربية واللاتيني والأرقام والترقيم الأساسي
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s.,،؛:؟!()\-]/gu, '')
    // احذف variation selectors و ZWJ
    .replace(/[\uFE0F\uFE0E\u200D\u200C\u200B]/g, '')
    // نظّف المسافات الزائدة
    .replace(/\s+/g, ' ')
    .trim()
}

// [SPEECH-7] خياران جديدان: ipa (نطق دقيق عبر <phoneme>) و rate (سرعة مخصصة مثل '-20%').
async function synthesizeAzure(opts: { text: string; voice: string; key: string; region: string; ipa?: string; rate?: string }): Promise<Buffer> {
  const { text, voice, key, region, ipa, rate } = opts
  if (!/^[a-z0-9-]+$/i.test(region)) throw new Error('قيمة AZURE_SPEECH_REGION غير صالحة (مثال صحيح: westeurope).')
  const lang = voice.split('-').slice(0, 2).join('-') // ar-SA-ZariyahNeural → ar-SA
  // IPA لا يقبل مسافات داخل <phoneme>. النص الداخلي يبقى احتياطيًا ولا يُنطق عند نجاح الـ phoneme.
  const cleanIpa = ipa ? ipa.replace(/\s+/g, '') : ''
  const inner = cleanIpa
    ? `<phoneme alphabet="ipa" ph="${escapeXml(cleanIpa)}">${escapeXml(text)}</phoneme>`
    : escapeXml(text)
  // نفس ضبط edge-tts للعربية (--rate=-10% --pitch=+5Hz) حتى تتسق الأصوات القديمة والجديدة.
  const effectiveRate = rate ?? (voice.startsWith('ar-') ? '-10%' : undefined)
  const prosodyAttrs = `${effectiveRate ? ` rate="${effectiveRate}"` : ''}${voice.startsWith('ar-') ? ' pitch="+5Hz"' : ''}`
  const body = prosodyAttrs ? `<prosody${prosodyAttrs}>${inner}</prosody>` : inner
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${voice}">${body}</voice></speak>`
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`

  let lastError: Error = new Error('فشل Azure Speech.')
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'arabic-kids-voice-studio',
        },
        body: ssml,
        signal: AbortSignal.timeout(30000),
      })
      if (response.ok) return Buffer.from(await response.arrayBuffer())
      const detail = (await response.text().catch(() => '')).slice(0, 300)
      if (response.status === 401 || response.status === 403) {
        throw Object.assign(new Error(`Azure رفض المفتاح (${response.status}). تحقق من AZURE_SPEECH_KEY ومن أن AZURE_SPEECH_REGION هي منطقة المورد نفسه. ${detail}`), { fatal: true })
      }
      if (response.status === 400) {
        throw Object.assign(new Error(`Azure رفض الطلب (400): ${detail}`), { fatal: true })
      }
      lastError = new Error(`Azure Speech أعاد ${response.status}. ${detail}`)
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after'))
        const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 3000 * (attempt + 1)
        await new Promise((resolve) => setTimeout(resolve, wait))
        continue
      }
    } catch (error) {
      if ((error as { fatal?: boolean }).fatal) throw error
      lastError = error instanceof Error ? error : new Error(String(error))
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
  }
  throw lastError
}

// [SPEECH-1] بصمة نص النطق: تُحفظ في المانيفست وقت التوليد، وتُقارَن لاحقًا لمعرفة هل تغيّر النطق.
function speechKey(item: { speechText?: string; speechIpa?: string }): string | undefined {
  if (!item.speechText && !item.speechIpa) return undefined
  return crypto.createHash('sha256').update(`${item.speechText ?? ''}\u0000${item.speechIpa ?? ''}`, 'utf8').digest('hex')
}

function voiceStudioPlugin(): Plugin {
  return {
    name: 'arabic-kids-voice-studio',
    configureServer(server) {
      const projectRoot = server.config.root
      const dataDir = path.join(projectRoot, 'src', 'data')
      const manifestPath = path.join(dataDir, 'audio-manifest.json')
      const activeGenerationItems = new Set<string>()
      const cacheTtlMs = 2000
      const cacheTtlActiveMs = 10000

      // ---- Build cache (with source-watcher invalidation) ----
      let buildCache: { items: any[]; at: number } | null = null
      const invalidateBuildCache = () => { buildCache = null }
      const sourceRoot = path.resolve(projectRoot, 'src') + path.sep
      const invalidateOnSourceChange = (file: string) => {
        const absolute = path.isAbsolute(file) ? path.resolve(file) : path.resolve(projectRoot, file)
        if (absolute.startsWith(sourceRoot) && absolute !== path.resolve(manifestPath)) invalidateBuildCache()
        if (absolute.includes('audio-manifest.json.tmp-')) return
        } 
      
      server.watcher.on('change', invalidateOnSourceChange)
      server.watcher.on('add', invalidateOnSourceChange)
      server.watcher.on('unlink', invalidateOnSourceChange)

      // ---- Manifest in-memory + serialized write queue (prevents race conditions) ----
      let manifestMemory: Record<string, any> | null = null
      let manifestWriteQueue: Promise<void> = Promise.resolve()
      const readManifest = (): Record<string, any> => {
        if (manifestMemory) return manifestMemory
        manifestMemory = fs.existsSync(manifestPath) ? readJson<Record<string, any>>(manifestPath) : {}
        return manifestMemory
      }
      const writeManifestQueued = (mutator: (manifest: Record<string, any>) => void): Promise<void> => {
        manifestWriteQueue = manifestWriteQueue.then(async () => {
          const manifest = readManifest()
          mutator(manifest)
          const serialized = `${JSON.stringify(manifest, null, 2)}\n`
          // على Windows، rename قد يفشل بـ EPERM/EBUSY إذا كان الملف مقفلاً
          // من Vite watcher أو antivirus. الكتابة المباشرة مع retry أكثر موثوقية.
          let lastError: unknown
          for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
              fs.writeFileSync(manifestPath, serialized, 'utf8')
              return
            } catch (error) {
              lastError = error
              const code = (error as NodeJS.ErrnoException)?.code
              if (code !== 'EPERM' && code !== 'EBUSY' && code !== 'EACCES') throw error
              await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)))
            }
          }
          throw lastError
        }).catch((error) => {
          console.error('[voice-studio] manifest write failed', error)
        })
        return manifestWriteQueue
      }

      // ---- Build items (cached scan of all sources) ----
      const buildItemsUncached = () => {
        type Item = {
          id: string
          type: string
          group: string
          groupLabel: string
          text: string
          filename: string
          relativePath: string
          sourceId: string
          order: number
          contentHash: string
          // [SPEECH-2] حقلان اختياريان: نص النطق (للمحرك) و IPA (لـ Azure). النص المعروض text لا يتغير.
          speechText?: string
          speechIpa?: string
          meta?: Record<string, string | number | undefined>
        }

        const letters = readJson<Array<Record<string, any>>>(path.join(dataDir, 'letters.json'))
        const words = readJson<Array<Record<string, any>>>(path.join(dataDir, 'words.json'))
        const sentences = readJson<Array<Record<string, any>>>(path.join(dataDir, 'sentences.json'))
        const stories = readJson<Array<Record<string, any>>>(path.join(dataDir, 'stories.json'))
        const voicePrompts = readJson<{ worlds: Array<Record<string, any>> }>(path.join(dataDir, 'voice-prompts.json'))
        const items: Item[] = []
        const usedNames = new Set<string>()

        letters
          .sort((a, b) => Number(a.order) - Number(b.order))
          .forEach((item, index) => {
            const name = safeName(
              item.id === 'ا' ? 'alif' :
              item.id === 'ب' ? 'baa' :
              item.id === 'ت' ? 'taa' :
              item.id === 'ث' ? 'thaa' :
              slugArabic(item.name),
            )
            const filename = uniqueFilename(`letter_${name}.mp3`, usedNames)
            items.push({
              id: `letter:${item.id}`,
              type: 'letter',
              group: 'letters',
              groupLabel: 'الحروف',
              text: item.name,
              filename,
              relativePath: `/audio/letters/${filename}`,
              sourceId: item.soundId,
              order: index + 1,
              contentHash: contentHash([`letter:${item.id}`, item.soundId, item.name, item.forms]),
              meta: { letter: item.id },
            })
          })

        words.forEach((item, index) => {
          const position = POSITION_MAP[item.position] ?? item.position
          const filename = uniqueFilename(
            `word_${slugArabic(item.text)}_${position}.mp3`,
            usedNames,
          )
          items.push({
            id: `word:${item.id}`,
            type: 'word',
            group: 'words',
            groupLabel: 'الكلمات',
            text: item.text,
            filename,
            relativePath: `/audio/words/${filename}`,
            sourceId: item.soundId || item.id,
            order: index + 1,
            contentHash: contentHash([`word:${item.id}`, item.id, item.text, item.letterId, item.position, item.soundId]),
            meta: { letter: item.letterId, position },
          })
        })

        sentences.forEach((item, index) => {
          const filename = uniqueFilename(`sentence_${String(index + 1).padStart(3, '0')}.mp3`, usedNames)
          items.push({
            id: `sentence:${item.id}`,
            type: 'sentence',
            group: 'sentences',
            groupLabel: 'الجمل',
            text: item.audioPrompt || item.text,
            filename,
            relativePath: `/audio/sentences/${filename}`,
            sourceId: item.id,
            order: index + 1,
            contentHash: contentHash([`sentence:${item.id}`, item.id, item.text, item.audioPrompt]),
          })
        })

        stories.forEach((story, storyIndex) => {
          story.pages?.forEach((page: Record<string, any>, pageIndex: number) => {
            const filename = uniqueFilename(
              `story_${String(story.storyNumber ?? storyIndex + 1).padStart(3, '0')}_page_${String(pageIndex + 1).padStart(2, '0')}.mp3`,
              usedNames,
            )
            const sourceId = `${story.id}:page:${pageIndex + 1}`
            items.push({
              id: `story-page:${sourceId}`,
              type: 'story-page',
              group: 'stories',
              groupLabel: 'صفحات القصص',
              text: page.text,
              filename,
              relativePath: `/audio/stories/${filename}`,
              sourceId,
              order: storyIndex * 100 + pageIndex + 1,
              contentHash: contentHash([`story-page:${sourceId}`, story.id, story.title, story.storyNumber, pageIndex + 1, page.text]),
              meta: { storyNumber: Number(story.storyNumber ?? storyIndex + 1), page: pageIndex + 1, title: story.title },
            })
          })

          story.comprehensionQuestions?.forEach((q: Record<string, any>, qIndex: number) => {
            const filename = uniqueFilename(
              `story_${String(story.storyNumber ?? storyIndex + 1).padStart(3, '0')}_question_${String(qIndex + 1).padStart(2, '0')}.mp3`,
              usedNames,
            )
            const sourceId = `${story.id}:question:${qIndex + 1}`
            items.push({
              id: `story-question:${sourceId}`,
              type: 'story-question',
              group: 'stories',
              groupLabel: 'أسئلة القصص',
              text: q.question,
              filename,
              relativePath: `/audio/stories/${filename}`,
              sourceId,
              order: storyIndex * 100 + 50 + qIndex,
              contentHash: contentHash([`story-question:${sourceId}`, story.id, story.storyNumber, qIndex + 1, q.question]),
              meta: { storyNumber: Number(story.storyNumber ?? storyIndex + 1), question: qIndex + 1, title: story.title },
            })
          })
        })

        const worldGroups: Record<string, string> = {
          letters: 'letters-prompts',
          harakat: 'harakat-prompts',
          words: 'words-prompts',
          sentences: 'sentences-prompts',
        }
        voicePrompts.worlds.forEach((world) => {
          let promptOrder = 0
          world.prompts.forEach((prompt: Record<string, any>) => {
            let variants: Array<{ id?: string; values?: Record<string, string> }> = []
            if (prompt.variantsFrom === 'letters') {
              variants = letters.map((letter) => ({ id: String(letter.id), values: { letterName: String(letter.name), letterNameWithDefiniteArticle: getDefiniteLetterName(String(letter.id)) } }))
            } else if (Array.isArray(prompt.variants) && prompt.variants.length > 0) {
              variants = prompt.variants
            } else {
              variants = [{}]
            }

            variants.forEach((variant) => {
              const text = String(prompt.text ?? prompt.template ?? '').replace(
                /\{([a-zA-Z0-9_]+)\}/g,
                (_match: string, key: string) => String(variant.values?.[key] ?? `{${key}}`),
              )
              if (!text.trim()) return
              const variantId = variant.id ? String(variant.id) : undefined
              const id = voicePromptAudioId(String(world.id), String(prompt.id), variantId)
              const variantSlug = variantId ? slugArabic(variantId) : 'shared'
              const filename = uniqueFilename(
                `prompt_${safeName(world.id)}_${safeName(prompt.id)}_${safeName(variantSlug)}.mp3`,
                usedNames,
              )
              promptOrder += 1
              items.push({
                id,
                type: 'prompt',
                group: worldGroups[String(world.id)] ?? `${safeName(world.id)}-prompts`,
                groupLabel: `أسئلة ${String(world.label)}`,
                text,
                filename,
                relativePath: `/audio/prompts/${filename}`,
                sourceId: id,
                order: promptOrder,
                contentHash: contentHash([id, text]),
                meta: {
                  title: String(prompt.label),
                  worldId: String(world.id),
                  promptId: String(prompt.id),
                  ...(variantId ? { variantId } : {}),
                },
              })
            })
          })
        })

        SUCCESS_FEEDBACK.forEach((text, index) => {
          const id = `feedback:success:${index + 1}`
          const filename = uniqueFilename(`feedback_success_${index + 1}.mp3`, usedNames)
          items.push({ id, type: 'prompt', group: 'feedback-success', groupLabel: 'رسائل التشجيع بعد الإجابة الصحيحة', text, filename, relativePath: `/audio/feedback/${filename}`, sourceId: id, order: index + 1, contentHash: contentHash([id, text]), meta: { feedbackType: 'success' } })
        })
        RETRY_FEEDBACK.forEach((text, index) => {
          const id = `feedback:retry:${index + 1}`
          const filename = uniqueFilename(`feedback_retry_${index + 1}.mp3`, usedNames)
          items.push({ id, type: 'prompt', group: 'feedback-retry', groupLabel: 'رسائل إعادة المحاولة', text, filename, relativePath: `/audio/feedback/${filename}`, sourceId: id, order: index + 1, contentHash: contentHash([id, text]), meta: { feedbackType: 'retry' } })
        })

        // Keep all language/subject recordings grouped under their own public/audio directory.
        items.forEach((item) => {
          item.meta = { ...item.meta, section: 'arabic' }
          item.relativePath = item.relativePath.replace(/^\/audio\//, '/audio/arabic/')
        })
        items.push(...buildHarakatWorldItems())

        const englishLetters = readJson<Array<Record<string, any>>>(path.join(projectRoot, 'src', 'english', 'data', 'letters.json'))
        const englishWords = readJson<Array<Record<string, any>>>(path.join(projectRoot, 'src', 'english', 'data', 'words.json'))
        const englishSentences = readJson<Array<Record<string, any>>>(path.join(projectRoot, 'src', 'english', 'data', 'sentences.json'))
        const englishStories = readJson<Array<Record<string, any>>>(path.join(projectRoot, 'src', 'english', 'data', 'stories.json'))
        const addProjectItem = (item: Item) => items.push(item)
        const gameVoiceItems = new Set<string>()
        let gameVoiceOrder = 0
        const addEnglishGameVoice = (stableId: string, group: string, groupLabel: string, text: string) => {
          const normalizedText = text.trim().replace(/\s+/g, ' ')
          if (!normalizedText || gameVoiceItems.has(normalizedText)) return
          gameVoiceItems.add(normalizedText)
          gameVoiceOrder += 1
          const id = `english:game-voice:${stableId}`
          const filename = uniqueFilename(`english_game_${safeName(stableId)}.mp3`, usedNames)
          addProjectItem({
            id, type: 'prompt', group, groupLabel, text: normalizedText, filename,
            relativePath: `/audio/english/games/${filename}`, sourceId: id, order: gameVoiceOrder,
            contentHash: contentHash([id, normalizedText]),
            meta: { section: 'english', contentId: stableId, kind: group },
          })
        }

        englishLetters.forEach((entry, index) => {
          const id = `english:letter:${String(entry.id)}`
          const filename = uniqueFilename(`english_letter_${safeName(String(entry.id))}.mp3`, usedNames)
          addProjectItem({ id, type: 'prompt', group: 'letters', groupLabel: 'الحروف', text: String(entry.name), filename, relativePath: `/audio/english/letters/${filename}`, sourceId: String(entry.soundId ?? entry.id), order: index + 1, contentHash: contentHash([id, entry.name]), meta: { section: 'english', contentId: String(entry.id) } })
        })
        englishWords.forEach((entry, index) => {
          const id = `english:word:${String(entry.id)}`
          const filename = uniqueFilename(`english_word_${safeName(String(entry.id))}.mp3`, usedNames)
          addProjectItem({ id, type: 'prompt', group: 'words', groupLabel: 'الكلمات', text: String(entry.text), filename, relativePath: `/audio/english/words/${filename}`, sourceId: String(entry.soundId ?? entry.id), order: index + 1, contentHash: contentHash([id, entry.text]), meta: { section: 'english', contentId: String(entry.id) } })
        })
        englishLetters.forEach((entry, index) => {
          const id = `english:phonics:${String(entry.id)}`
          const filename = uniqueFilename(`english_phonics_${safeName(String(entry.id))}.mp3`, usedNames)
          addProjectItem({ id, type: 'prompt', group: 'phonics', groupLabel: 'الأصوات الصوتية', text: String(entry.phonicSound), filename, relativePath: `/audio/english/phonics/${filename}`, sourceId: id, order: index + 1, contentHash: contentHash([id, entry.phonicSound]), meta: { section: 'english', contentId: String(entry.id), kind: 'phonicSound' } })
          const combinedId = `english:phonics-example:${String(entry.id)}`
          const combinedText = `${String(entry.name)}. ${String(entry.phonicSound)}. ${String(entry.exampleWord)}`
          const combinedFilename = uniqueFilename(`english_phonics_example_${safeName(String(entry.id))}.mp3`, usedNames)
          addProjectItem({ id: combinedId, type: 'prompt', group: 'phonics', groupLabel: 'الأصوات الصوتية', text: combinedText, filename: combinedFilename, relativePath: `/audio/english/phonics/${combinedFilename}`, sourceId: combinedId, order: 100 + index + 1, contentHash: contentHash([combinedId, combinedText]), meta: { section: 'english', contentId: String(entry.id), kind: 'phonicExample' } })
        })
        englishSentences.forEach((entry, index) => {
          const id = `english:sentence:${String(entry.id)}`
          const text = String(entry.audioPrompt || entry.text)
          const filename = uniqueFilename(`english_sentence_${String(index + 1).padStart(3, '0')}.mp3`, usedNames)
          addProjectItem({ id, type: 'prompt', group: 'sentences', groupLabel: 'الجمل', text, filename, relativePath: `/audio/english/sentences/${filename}`, sourceId: String(entry.id), order: index + 1, contentHash: contentHash([id, text]), meta: { section: 'english', contentId: String(entry.id) } })
        })
        englishStories.forEach((story, storyIndex) => {
          story.pages?.forEach((page: Record<string, any>, pageIndex: number) => {
            const id = `english:story-page:${String(story.id)}:${pageIndex + 1}`
            const filename = uniqueFilename(`english_story_${safeName(String(story.id))}_page_${String(pageIndex + 1).padStart(2, '0')}.mp3`, usedNames)
            addProjectItem({ id, type: 'prompt', group: 'stories', groupLabel: 'القصص', text: String(page.text), filename, relativePath: `/audio/english/stories/${filename}`, sourceId: id, order: storyIndex * 100 + pageIndex + 1, contentHash: contentHash([id, story.title, page.text]), meta: { section: 'english', storyId: String(story.id), page: pageIndex + 1 } })
          })
          story.comprehensionQuestions?.forEach((question: Record<string, any>, questionIndex: number) => {
            const id = `english:story-question:${String(story.id)}:${questionIndex + 1}`
            const filename = uniqueFilename(`english_story_${safeName(String(story.id))}_question_${String(questionIndex + 1).padStart(2, '0')}.mp3`, usedNames)
            addProjectItem({ id, type: 'prompt', group: 'stories', groupLabel: 'القصص', text: String(question.question), filename, relativePath: `/audio/english/stories/${filename}`, sourceId: id, order: storyIndex * 100 + 50 + questionIndex, contentHash: contentHash([id, question.question]), meta: { section: 'english', storyId: String(story.id), question: questionIndex + 1 } })
          })
        })

        // Capture the exact voice strings produced by QuizRunner, including every
        // data-driven letter/word variant used by Letter World and Final Test.
        const questionLabel = 'أسئلة الألعاب'
        const letterRules = ['start', 'middle', 'end', 'contains'] as const
        englishLetters.forEach((letter) => {
          letterRules.forEach((kind) => addEnglishGameVoice(`letter-${kind}-${letter.id}`, 'game-questions', questionLabel, ENGLISH_LETTER_QUESTION_VOICE[kind](String(letter.name))))
        })
        const countCharacter = (word: string, letter: string) => [...word.toUpperCase()].filter((character) => character === letter.toUpperCase()).length
        const letterById = new Map(englishLetters.map((letter) => [String(letter.id).toUpperCase(), String(letter.name)]))
        englishWords.forEach((word) => {
          const wordId = String(word.id)
          const wordText = String(word.text)
          for (const character of [...new Set(wordText.toUpperCase())]) {
            const letter = englishLetters.find((entry) => String(entry.id).toUpperCase() === character)
            if (letter && countCharacter(wordText, character) === 1) {
              addEnglishGameVoice(`where-${letter.id}-${wordId}`, 'game-questions', questionLabel, ENGLISH_LETTER_QUESTION_VOICE.whereIs(String(letter.name), wordText))
            }
          }
          addEnglishGameVoice(`find-picture-${wordId}`, 'game-questions', questionLabel, ENGLISH_FINAL_QUESTION_VOICE.findPicture(wordText))
          addEnglishGameVoice(`first-letter-${wordId}`, 'game-questions', questionLabel, ENGLISH_FINAL_QUESTION_VOICE.firstLetter(wordText))
          addEnglishGameVoice(`last-letter-${wordId}`, 'game-questions', questionLabel, ENGLISH_FINAL_QUESTION_VOICE.lastLetter(wordText))
          for (const character of new Set(wordText.toUpperCase())) {
            const letterName = letterById.get(character) ?? character
            addEnglishGameVoice(`count-${wordId}-${character}`, 'game-questions', questionLabel, ENGLISH_FINAL_QUESTION_VOICE.countLetter(letterName, wordText))
          }
        })
        ENGLISH_FIXED_GAME_SPEECH.forEach((prompt) => addEnglishGameVoice(prompt.id, 'game-messages', 'التشجيع والمحاولة وتعليمات اللعبة', prompt.text))
        ENGLISH_ENCOURAGEMENTS.forEach((text, index) => addEnglishGameVoice(`encouragement-${index + 1}`, 'game-messages', 'التشجيع والمحاولة وتعليمات اللعبة', text))

        const numberNames = ['', 'وَاحِد', 'اثْنَان', 'ثَلَاثَة', 'أَرْبَعَة', 'خَمْسَة', 'سِتَّة', 'سَبْعَة', 'ثَمَانِيَة', 'تِسْعَة', 'عَشَرَة', 'أَحَدَ عَشَر', 'اثْنَا عَشَر', 'ثَلَاثَةَ عَشَر', 'أَرْبَعَةَ عَشَر', 'خَمْسَةَ عَشَر', 'سِتَّةَ عَشَر', 'سَبْعَةَ عَشَر', 'ثَمَانِيَةَ عَشَر', 'تِسْعَةَ عَشَر', 'عِشْرُون']
        const numberPrompts: Array<{ id: string; text: string }> = []
        for (let n = 1; n <= 20; n += 1) numberPrompts.push({ id: `num_${n}`, text: numberNames[n] })
        numberPrompts.push(
          { id: 'fragment_balloon', text: 'فَرْقِعِ الْبَالُونَ رَقْمَ' },
          { id: 'fragment_catch', text: 'اِضْغَطْ عَلَى الرَّقْمِ' },
          { id: 'fragment_find', text: 'أَيْنَ الرَّقْمُ' },
          { id: 'fragment_choose_group', text: 'اخْتَرِ الْمَجْمُوعَةَ الَّتِي تُمَثِّلُ الرَّقْمَ' },
          { id: 'fragment_before', text: 'مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ' },
          { id: 'fragment_after', text: 'مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ' },
          { id: 'fragment_compare', text: 'قَارِنْ بَيْنَ' },
          { id: 'fragment_and', text: 'وَ' },
          { id: 'fragment_add', text: 'زَائِدُ' },
          { id: 'fragment_subtract', text: 'نَاقِصُ' },
          { id: 'fragment_how-much', text: 'كَمْ يُسَاوِي؟' },
          { id: 'fragment_equals-how-much', text: 'يُسَاوِي كَمْ؟' },
          { id: 'fragment_subtract-how-much', text: 'نَاقِصُ كَمْ يُسَاوِي' },
          { id: 'q_missing', text: 'أَيُّ رَقْمٍ نَاقِص؟' },
          { id: 'q_recognize', text: 'مَا هَذَا الرَّقْمُ؟' },
          { id: 'q_count', text: 'كَمْ عَدَدُ الْأَشْيَاءِ؟' },
          { id: 'q_compare', text: 'مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟' },
          { id: 'q_bigger', text: 'أَيُّ الْعَدَدَيْنِ أَكْبَرُ؟' },
          { id: 'cheer_correct', text: 'أَحْسَنْتَ' },
          { id: 'cheer_try', text: 'حاول مرة أخرى' },
          { id: 'welcome', text: 'مَرْحَبًا بِكَ فِي مُغَامَرَةِ الْأَرْقَامِ! هَلْ أَنْتَ مُسْتَعِدٌّ؟' },
          { id: 'fragment_game-house', text: 'اِسْحَبِ الرَّقْمَ إِلَى الْبَيْتِ الَّذِي فِيهِ نَفْسُ الْعَدَدِ مِنَ الْأَشْيَاءِ، أَوِ اضْغَطِ الرَّقْمَ ثُمَّ الْبَيْت' },
          { id: 'fragment_game-catch', text: 'اِضْغَطْ عَلَى الرَّقْمِ الْمَطْلُوبِ وَهُوَ يَسْقُط' },
          { id: 'fragment_game-memory', text: 'اِقْلِبْ بِطَاقَتَيْنِ وَابْحَثْ عَنِ الرَّقْمِ وَمَا يُنَاسِبُهُ مِنَ الْأَشْيَاءِ' },
          { id: 'fragment_game-train', text: 'رَتِّبِ الْقِطَارَ مِنَ الْأَصْغَرِ لِلْأَكْبَر' },
          { id: 'fragment_game-balloons-help', text: 'اِسْمَعِ الرَّقْمَ ثُمَّ اضْغَطْ عَلَى الْبَالُونِ الَّذِي عَلَيْهِ هَذَا الرَّقْم' },
          { id: 'fragment_game-train-help', text: 'اِضْغَطِ الْعَرَبَاتِ بِالتَّرْتِيبِ مِنَ الْأَصْغَرِ إِلَى الْأَكْبَر' },
          { id: 'fragment_game-maze', text: 'اِضْغَطِ الْأَرْقَامَ بِالتَّرْتِيبِ: ابدأ بالرقم ٢ ثم اضغط ٣ ثم ٤، وهكذا حتى نهاية المسار' },
          { id: 'fragment_game-fast', text: 'اِخْتَرِ الرَّقْمَ الَّذِي تَسْمَعُهُ قَبْلَ انْتِهَاءِ الشَّرِيط' },
          { id: 'fragment_game-missing', text: 'اِخْتَرِ الرَّقْمَ النَّاقِصَ فِي الصَّفّ' },
          { id: 'fragment_game-compare', text: 'انْظُرْ إِلَى الْعَدَدَيْنِ وَاخْتَرِ الْعَلامَةَ الصَّحِيحَة' },
          { id: 'fragment_game-bigger', text: 'اِخْتَرِ الْعَدَدَ الْأَكْبَر' },
          { id: 'fragment_game-oddeven', text: 'الْعَدَدُ الزَّوْجِيُّ يَنْقَسِمُ إِلَى مَجْمُوعَتَيْنِ مُتَسَاوِيَتَيْن' },
          { id: 'fragment_retry-long', text: 'اقْتَرَبْتَ! حَاوِلْ مَرَّةً أُخْرَى 😊' },
          { id: 'fragment_excellent', text: 'مُمْتَازٌ' },
          { id: 'fragment_wonderful', text: 'رَائِعٌ' },
          { id: 'fragment_welcome', text: 'مَرْحَبًا بِكَ فِي مُغَامَرَةِ الْأَرْقَامِ! هَلْ أَنْتَ مُسْتَعِدٌّ؟' },
        )
        numberPrompts.forEach((entry, index) => {
          const id = `numbers:${entry.id}`
          const filename = uniqueFilename(`numbers_${safeName(entry.id)}.mp3`, usedNames)
          addProjectItem({ id, type: 'prompt', group: 'numbers', groupLabel: 'الأرقام والأسئلة', text: entry.text, filename, relativePath: `/audio/numbers/prompts/${filename}`, sourceId: id, order: index + 1, contentHash: contentHash([id, entry.text]), meta: { section: 'numbers', contentId: entry.id } })
        })

        const addDiscoverItem = (id: string, group: string, groupLabel: string, text: string, order: number, meta: Record<string, string | number> = {}) => {
          const filename = uniqueFilename(`discover_${safeName(id)}.mp3`, usedNames)
          addProjectItem({ id, type: 'prompt', group, groupLabel, text, filename, relativePath: `/audio/discover/${group}/${filename}`, sourceId: id, order, contentHash: contentHash([id, text]), meta: { section: 'discover', ...meta } })
        }
        let discoverOrder = 0
        DISCOVER_WORLDS.forEach((world) => {
          addDiscoverItem(`discover:world:${world.id}:title`, 'worlds', 'أسماء العوالم', world.titleAr, ++discoverOrder, { worldId: world.id, kind: 'title' })
          addDiscoverItem(`discover:world:${world.id}:welcome`, 'worlds', 'أسماء العوالم', `مَرْحَبًا بِكَ فِي ${world.titleAr}`, ++discoverOrder, { worldId: world.id, kind: 'welcome' })
          world.items.forEach((entry) => {
            addDiscoverItem(`discover:item:${world.id}:${entry.id}`, 'items', 'أسماء الأشياء', entry.nameAr, ++discoverOrder, { worldId: world.id, itemId: entry.id })
            addDiscoverItem(`discover:prompt:choose:${world.id}:${entry.id}`, 'prompts', 'التعليمات والتشجيع', `اخْتَرْ ${entry.nameAr}`, ++discoverOrder, { worldId: world.id, itemId: entry.id, kind: 'choose' })
            addDiscoverItem(`discover:prompt:where:${world.id}:${entry.id}`, 'prompts', 'التعليمات والتشجيع', `أَيْنَ ${entry.nameAr}؟`, ++discoverOrder, { worldId: world.id, itemId: entry.id, kind: 'where' })
          })
        })
        for (const phrase of ['مَا هَذَا؟', 'أَحْسَنْتَ!', 'رَائِع!', 'مُمْتَاز!', 'صَحِيح!', 'حَاوِلْ مَرَّةً أُخْرَى!']) {
          addDiscoverItem(`discover:phrase:${discoverOrder}`, 'prompts', 'التعليمات والتشجيع', phrase, ++discoverOrder, { kind: 'phrase' })
        }
        DISCOVER_QUIZ_QUESTIONS.forEach((question, index) => {
          addDiscoverItem(`discover:quiz:${question.id}`, 'quiz', 'أسئلة الاختبار', question.prompt, index + 1, { worldId: question.worldId, level: question.level, questionId: question.id })
        })

        const addLearningItems = (section: 'islamic' | 'skills', sourceDirectories: string[]) => {
          const seen = new Set<string>()
          let order = 0
          const addLearningText = (relative: string, group: string, text: string) => {
            const cleanText = text.trim()
            if (!/[\u0600-\u06ff]/u.test(cleanText) || cleanText.includes('${') || cleanText.length < 2 || seen.has(`${group}:${cleanText}`)) return
            seen.add(`${group}:${cleanText}`)
            const sourceHash = crypto.createHash('sha1').update(`${relative}\0${cleanText}`).digest('hex').slice(0, 12)
            const id = `${section}:${group}:${sourceHash}`
            const filename = uniqueFilename(`${section}_${group}_${sourceHash}.mp3`, usedNames)
            order += 1
            addProjectItem({ id, type: 'prompt', group, groupLabel: section === 'islamic' ? `أخلاقي الجميلة · ${group}` : `مدينة المهارات · ${group}`, text: cleanText, filename, relativePath: `/audio/${section}/${group}/${filename}`, sourceId: id, order, contentHash: contentHash([id, cleanText]), meta: { section, contentId: `${relative}#${order}` } })
          }
          const visit = (directory: string): void => {
            for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
              const absolute = path.join(directory, entry.name)
              if (entry.isDirectory()) { visit(absolute); continue }
              if (!entry.isFile() || !/\.tsx?$/i.test(entry.name) || /(?:types|index)\.tsx?$/i.test(entry.name)) continue
              const relative = path.relative(projectRoot, absolute).replaceAll(path.sep, '/')
              const group = safeName(path.basename(entry.name, path.extname(entry.name)))
              const source = fs.readFileSync(absolute, 'utf8')
              const quotePattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
              for (const match of source.matchAll(quotePattern)) {
                const text = match[2].replace(/\\(['"`\\])/g, '$1').trim()
                addLearningText(relative, group, text)
              }

              // Complete, reusable speech phrase for every اخلاق/أسرة example.
              // The child hears the same sentence that the Voice Studio can record.
              if (section === 'islamic' && relative.endsWith('/data/values.ts')) {
                const valueBlocks = source.split(/\n\s*\},/).filter((block) => /\bid:\s*'/.test(block) && /\bexample:\s*'/.test(block))
                for (const block of valueBlocks) {
                  const title = block.match(/\btitle:\s*'([^']+)'/)?.[1]
                  const example = block.match(/\bexample:\s*'([^']+)'/)?.[1]
                  if (title && example) addLearningText(relative, 'value_examples', `مِثالٌ على ${title}: ${example}`)
                }
              }

              // Resolve Arabic template prompts used by randomized skill questions
              // into the finite set of phrases users can actually hear in a game.
              if (section === 'skills' && relative.endsWith('/generators/colors.ts') && source.includes('COLORS[col].name')) {
                const kit = fs.readFileSync(path.join(projectRoot, 'src/skills/data/kit.ts'), 'utf8')
                const names = Array.from(kit.matchAll(/name:\s*'([^']+)'/g), (entry) => entry[1])
                for (const name of names) addLearningText(relative, group, `أَيُّ شَيْءٍ لَوْنُهُ ${name}؟`)
              }
              if (section === 'skills' && relative.endsWith('/generators/puzzles.ts') && source.includes('prompt: `كَمْ عَدَدُ ${name}؟`')) {
                const countable = source.match(/const COUNTABLE:[\s\S]*?\n\];/)?.[0] ?? ''
                const names = Array.from(countable.matchAll(/,\s*'([^']+)'\s*\]/g), (entry) => entry[1])
                for (const name of names) addLearningText(relative, group, `كَمْ عَدَدُ ${name}؟`)
              }
            }
          }
          for (const sourceDirectory of sourceDirectories) visit(path.join(projectRoot, sourceDirectory))
        }
        addLearningItems('islamic', ['src/islamic/data'])
        addLearningItems('skills', ['src/skills/data', 'src/skills/components'])

        return items
      }

      const buildItems = () => {
        const ttl = activeGenerationItems.size > 0 ? cacheTtlActiveMs : cacheTtlMs
        let baseItems: any[]
        if (buildCache && Date.now() - buildCache.at < ttl) baseItems = buildCache.items
        else {
          baseItems = buildItemsUncached()
          buildCache = { items: baseItems, at: Date.now() }
        }
        const manifest = readManifest()
        return baseItems.map((item) => {
          const saved = manifest[item.id]
          // [SPEECH-3] إذا تغيّر نص النطق (أو لم يكن موجودًا عند التوليد القديم) يصبح الملف «قديمًا» ليُعاد توليده.
          //   يُطبَّق فقط على الأصوات الآلية؛ التسجيلات اليدوية (source: 'manual') لا تُمسّ أبدًا.
          if (item.speechText || item.speechIpa) {
            if (saved?.source && saved.source !== 'manual' && saved.speechHash !== speechKey(item)) {
              return { ...item, status: 'stale' as const }
            }
          }
          const expectedFile = path.resolve(projectRoot, 'public', item.relativePath.replace(/^\//, ''))
          if (saved?.contentHash && saved.contentHash !== item.contentHash) {
            return { ...item, status: 'stale' as const }
          }
          if ((saved?.status === 'approved' || saved?.status === 'generated' || saved?.status === 'pending') && saved.relativePath) {
            const savedFile = path.resolve(projectRoot, 'public', saved.relativePath.replace(/^\//, ''))
            if (savedFile.startsWith(path.resolve(projectRoot, 'public') + path.sep) && fs.existsSync(savedFile)) {
              return { ...item, status: saved.status as 'approved' | 'generated' | 'pending', filename: saved.filename ?? item.filename, relativePath: saved.relativePath, source: saved.source, voice: saved.voice, textHash: saved.textHash }
            }
          }
          return { ...item, status: fs.existsSync(expectedFile) ? 'recorded' as const : 'missing' as const }
        })
      }

      // ---- GET /__voice-studio/items ----
      server.middlewares.use('/__voice-studio/items', (_req, res) => {
        try {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(buildItems()))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error) }))
        }
      })

      // ---- GET /__voice-studio/manifest ----
      server.middlewares.use('/__voice-studio/manifest', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        try {
          const manifest = readManifest()
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.end(JSON.stringify(manifest))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        }
      })

      // ---- POST /__voice-studio/generate-batch ----
      // Supports both { itemId } (legacy single) and { itemIds: string[] } (new batch).
      server.middlewares.use('/__voice-studio/generate-batch', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk; if (body.length > 4 * 1024 * 1024) req.destroy() })
        req.on('end', async () => {
          const lockedItemIds: string[] = []
          try {
            // [AZURE-2] أضفنا provider إلى الحمولة القادمة من الواجهة: 'edge-tts' (الافتراضي) أو 'azure'.
            const payload = JSON.parse(body) as { section?: string; voice?: string; itemId?: string; itemIds?: string[]; provider?: string }
            const supportedSections = ['arabic', 'english', 'numbers', 'discover', 'islamic', 'skills']
            if (!payload.section || !supportedSections.includes(payload.section)) throw new Error('القسم المحدد غير مدعوم للتوليد الآلي.')

            const requestedIds: string[] = Array.isArray(payload.itemIds) && payload.itemIds.length
              ? payload.itemIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
              : payload.itemId ? [payload.itemId] : []
            if (requestedIds.length === 0) throw new Error('يلزم تحديد عنصر واحد على الأقل للتوليد.')
            if (requestedIds.length > 32) throw new Error('الحد الأقصى 32 عنصراً في الدفعة الواحدة.')

            const voice = String(payload.voice || (payload.section === 'english' ? 'en-US-AnaNeural' : 'ar-SA-ZariyahNeural'))
            const ALLOWED_VOICES = new Set([
              'ar-SA-ZariyahNeural', 'ar-SA-HamedNeural', 'ar-EG-ShakirNeural', 'ar-EG-SalmaNeural',
              'en-US-AnaNeural', 'en-US-AriaNeural', 'en-GB-SoniaNeural', 'en-GB-RyanNeural',
            ])
            if (!ALLOWED_VOICES.has(voice)) throw new Error('اسم صوت Edge-TTS غير مسموح.')

            // [AZURE-3] اختيار المزوّد + قراءة مفاتيح Azure من .env (الخادم فقط).
            //   نفس قائمة ALLOWED_VOICES تصلح لـ Azure لأن أسماء الأصوات (ar-SA-ZariyahNeural ...) متطابقة.
            //   أي قيمة غير 'azure' ترجع إلى edge-tts، فلا يتأثر السلوك القديم.
            const provider: TtsProvider = payload.provider === 'azure' ? 'azure' : 'edge-tts'
            const azureEnv = loadEnv(server.config.mode, projectRoot, '')
            const azureKey = (azureEnv.AZURE_SPEECH_KEY || process.env.AZURE_SPEECH_KEY || '').trim()
            const azureRegion = (azureEnv.AZURE_SPEECH_REGION || process.env.AZURE_SPEECH_REGION || '').trim()
            if (provider === 'azure' && (!azureKey || !azureRegion)) {
              throw new Error('مفاتيح Azure غير مضبوطة. أضف AZURE_SPEECH_KEY و AZURE_SPEECH_REGION في ملف .env ثم أعد تشغيل npm run dev.')
            }

            const uniqueIds = [...new Set(requestedIds)]
            const lockable = uniqueIds.filter((id) => !activeGenerationItems.has(id))
            for (const id of lockable) activeGenerationItems.add(id)
            lockedItemIds.push(...lockable)
            invalidateBuildCache()

            const currentItems = buildItems()
            const itemById = new Map(currentItems.map((item) => [item.id, item]))
            const candidates = lockable
              .map((id) => itemById.get(id))
              .filter((item): item is NonNullable<typeof item> => Boolean(item && item.meta?.section === payload.section && item.text.trim() && item.status !== 'approved'))

            const results: Array<{ itemId: string; ok: boolean; error?: string; entry?: Record<string, any> }> = []
            const python = process.env.EDGE_TTS_PYTHON || process.env.PYTHON_EXECUTABLE || (process.platform === 'win32' ? 'py' : 'python3')

            type Job = {
              item: typeof candidates[number]
              textHash: string
              spoken: string // [SPEECH-4] النص الذي يُرسَل فعليًا للمحرك (نص النطق أو النص المعروض)
              speechIpa?: string
              speechHash?: string
              relativeAudio: string
              target: string
              textFile: string
              outputFile: string
            }
            const jobs: Job[] = []
            const publicRoot = path.resolve(projectRoot, 'public')
            for (const item of candidates) {
              // [SPEECH-4] اسم الملف يُشتق من نص النطق، فتتغير الأسماء عند تغيير النطق ولا يبقى الكاش القديم في المتصفح.
              //   للعناصر التي ليس لها نص نطق لا يتغير شيء (spoken = text فيبقى الاسم كما كان).
              const spoken = stripForTts(item.speechText || item.text)
              const textHash = crypto.createHash('sha256').update(spoken, 'utf8').digest('hex')
              const itemDir = path.posix.dirname(item.relativePath.replace(/^\/+/, ''))
              const field = safeName(item.type || 'content')
              const contentId = safeName(String(item.meta?.contentId || item.sourceId || item.id))
              const filename = `${contentId}_${field}__${textHash.slice(0, 16)}.mp3`
              const relativeAudio = `${itemDir}/${filename}`
              if (!/^audio\/(?:arabic|english|numbers|discover|islamic|skills)\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\/[a-z0-9_-]+\.mp3$/i.test(relativeAudio)) {
                results.push({ itemId: item.id, ok: false, error: `مسار MP3 غير صالح: ${relativeAudio}` })
                continue
              }
              const target = path.resolve(projectRoot, 'public', relativeAudio)
              if (!target.startsWith(publicRoot + path.sep)) {
                results.push({ itemId: item.id, ok: false, error: 'مسار الحفظ خارج مجلد الصوت.' })
                continue
              }
              const tempBase = path.join(os.tmpdir(), `voice-studio-${crypto.randomUUID()}`)
              jobs.push({ item, textHash, spoken, speechIpa: item.speechIpa, speechHash: speechKey(item), relativeAudio, target, textFile: `${tempBase}.txt`, outputFile: `${tempBase}.mp3` })
            }

            const generateOne = async (job: Job): Promise<{ ok: boolean; error?: string; entry?: Record<string, any> }> => {
              const { item, textHash, spoken, speechIpa, speechHash, relativeAudio, target, textFile, outputFile } = job
              try {
                 await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 350))
                // [AZURE-4] فرع Azure: يُنتج الصوت مباشرة في الذاكرة (بدون Python وبدون ملفات مؤقتة).
                //   فرع edge-tts القديم بقي كما هو داخل else، ويُنتج المتغير audio في نهايته.
                let audio: Buffer
                if (provider === 'azure') {
                  // [SPEECH-5] Azure يستلم نص النطق + IPA إن وُجد، وبسرعة أبطأ قليلًا للحروف والمقاطع (وضوح أكبر للأطفال).
                  const slow = item.type === 'haraka' || item.type === 'syllable'
                  audio = await synthesizeAzure({ text: spoken, ipa: speechIpa, rate: slow ? '-20%' : undefined, voice, key: azureKey, region: azureRegion })
                } else {
                fs.writeFileSync(textFile, spoken, 'utf8') // [SPEECH-5] edge-tts أيضًا يستلم نص النطق
                let lastGenerationError: unknown
                for (let attempt = 0; attempt < 2; attempt += 1) {
                  try {
                    await new Promise<void>((resolve, reject) => {
                      const ttsArgs = ['-m', 'edge_tts', '--voice', voice]
                      if (voice.startsWith('ar-')) ttsArgs.push('--rate=-10%', '--pitch=+5Hz')
                      ttsArgs.push('--file', textFile, '--write-media', outputFile)
                      const child = spawn(python, ttsArgs, { windowsHide: true })
                      let stderr = ''
                      let settled = false
                      const finish = (error?: Error) => {
                        if (settled) return
                        settled = true
                        clearTimeout(timeout)
                        if (error) reject(error)
                        else resolve()
                      }
                      child.stderr.setEncoding('utf8')
                      child.stderr.on('data', (chunk: string) => { stderr = (stderr + chunk).slice(-4000) })
                      const timeout = setTimeout(() => { child.kill(); finish(new Error('انتهت مهلة توليد الصوت.')) }, 30000)
                      child.on('error', (error) => finish(new Error(`تعذر تشغيل Python/edge-tts (${error.message}). ثبّت حزمة edge-tts في بيئة Python المستخدمة أو عيّن EDGE_TTS_PYTHON.`)))
                      child.on('close', (code) => code === 0 ? finish() : finish(new Error(stderr.trim() || `انتهى Edge-TTS برمز ${code}.`)))
                    })
                    lastGenerationError = undefined
                    break
                  } catch (error) {
                    lastGenerationError = error
                    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 2000))
                  }
                }
                if (lastGenerationError) throw lastGenerationError
                audio = fs.readFileSync(outputFile)
                } // [AZURE-4] نهاية else الخاص بـ edge-tts
                // التحقق من صحة MP3 أدناه يعمل لكلا المزوّدين.
                if (audio.length < 128 || audio.toString('ascii', 0, 3) !== 'ID3' && !(audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0)) throw new Error('الناتج ليس ملف MP3 صالحاً.')
                fs.mkdirSync(path.dirname(target), { recursive: true })
                const staged = `${target}.tmp-${crypto.randomUUID()}`
                fs.writeFileSync(staged, audio)
                fs.renameSync(staged, target)
                const entry = {
                  itemId: item.id, sourceId: item.sourceId, type: item.type, text: item.text,
                  filename: path.basename(relativeAudio), relativePath: `/${relativeAudio}`, status: 'approved', updatedAt: new Date().toISOString(),
                  contentHash: item.contentHash, textHash, source: provider /* [AZURE-5] كان 'edge-tts' ثابتًا؛ الآن يحفظ المزوّد الفعلي في المانيفست */, voice, speechHash /* [SPEECH-6] */,
                }
                return { ok: true, entry }
              } catch (error) {
                return { ok: false, error: error instanceof Error ? error.message : String(error) }
              } finally {
                for (const temp of [textFile, outputFile]) if (fs.existsSync(temp)) fs.unlinkSync(temp)
              }
            }

            // [AZURE-6] التوازي: edge-tts يبقى 4. Azure افتراضيًا 2 (تقدر تغيّره بـ AZURE_TTS_CONCURRENCY في .env).
            //   الطبقة المجانية F0 لها حد منخفض للطلبات في الدقيقة؛ عند تجاوزه تتولى synthesizeAzure إعادة المحاولة.
            const azureConcurrency = Math.min(8, Math.max(1, Number(azureEnv.AZURE_TTS_CONCURRENCY) || 2))
            const concurrency = Math.min(provider === 'azure' ? azureConcurrency : 4, jobs.length)
            const queue = [...jobs]
            // [AZURE-7] إصلاح خلل موجود سابقًا: النتائج كانت تُخزَّن بترتيب انتهاء التوليد ثم تُقرأ بترتيب المهام،
            //   فمع التوازي قد يُنسب نجاح/فشل عنصر إلى عنصر آخر في الواجهة. الآن تُربط كل نتيجة بمهمتها.
            const settled = new Map<Job, { ok: boolean; error?: string; entry?: Record<string, any> }>()
            const runWorker = async () => {
              while (queue.length) {
                const job = queue.shift()
                if (!job) return
                settled.set(job, await generateOne(job))
              }
            }
            await Promise.all(Array.from({ length: concurrency }, () => runWorker()))

            const okEntries: Record<string, any>[] = []
            for (let i = 0; i < jobs.length; i += 1) {
              const job = jobs[i]
              const outcome = settled.get(job)
              if (outcome?.ok && outcome.entry) {
                results.push({ itemId: job.item.id, ok: true, entry: outcome.entry })
                okEntries.push(outcome.entry)
              } else {
                results.push({ itemId: job.item.id, ok: false, error: outcome?.error || 'فشل غير معروف' })
              }
            }
            if (okEntries.length) {
              await writeManifestQueued((manifest) => {
                for (const entry of okEntries) manifest[entry.itemId] = entry
              })
            }

            for (const id of uniqueIds) {
              if (!results.some((r) => r.itemId === id) && !candidates.some((c) => c.id === id)) {
                results.push({ itemId: id, ok: false, error: 'العنصر غير مؤهل للتوليد (معتمد مسبقاً أو غير موجود في القسم).' })
              }
            }

            invalidateBuildCache()
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              generated: results.filter((r) => r.ok).length,
              failed: results.filter((r) => !r.ok).length,
              results,
            }))
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          } finally {
            for (const id of lockedItemIds) activeGenerationItems.delete(id)
          }
        })
      })

      // ---- POST /__voice-studio/approve-generated ----
      server.middlewares.use('/__voice-studio/approve-generated', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk; if (body.length > 1024 * 1024) req.destroy() })
        req.on('end', async () => {
          try {
            const { section } = JSON.parse(body) as { section?: string }
            if (!section || !['arabic', 'english', 'numbers', 'discover', 'islamic', 'skills'].includes(section)) throw new Error('القسم المحدد غير مدعوم.')
            const manifest = readManifest()
            const currentItems = new Map(buildItems().map((item) => [item.id, item]))
            const approved: Record<string, any>[] = []
            for (const [itemId, entry] of Object.entries(manifest)) {
              const current = currentItems.get(itemId)
              if (!current || current.meta?.section !== section || entry.status !== 'generated' || entry.contentHash !== current.contentHash || !entry.relativePath) continue
              const target = path.resolve(projectRoot, 'public', String(entry.relativePath).replace(/^\/+/, ''))
              const publicRoot = path.resolve(projectRoot, 'public')
              if (!target.startsWith(publicRoot + path.sep) || !fs.existsSync(target)) continue
              entry.status = 'approved'
              entry.updatedAt = new Date().toISOString()
              manifest[itemId] = entry
              approved.push(entry)
            }
            if (approved.length) {
              const snapshot = JSON.parse(JSON.stringify(manifest))
              await writeManifestQueued((target) => {
                for (const [k, v] of Object.entries(snapshot)) target[k] = v
              })
            }
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ approved }))
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        })
      })

      // ---- POST /__voice-studio/approve ----
      server.middlewares.use('/__voice-studio/approve', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk; if (body.length > 1024 * 1024) req.destroy() })
        req.on('end', async () => {
          try {
            const { itemId } = JSON.parse(body) as { itemId: string }
            const manifest = readManifest()
            const entry = manifest[itemId]
            const current = buildItems().find((item) => item.id === itemId)
            if (!entry || entry.status !== 'generated' || !current || entry.contentHash !== current.contentHash) throw new Error('لا يمكن اعتماد هذا التسجيل؛ أعد التوليد أو حدّث القائمة.')
            const target = path.resolve(projectRoot, 'public', String(entry.relativePath).replace(/^\/+/, ''))
            const publicRoot = path.resolve(projectRoot, 'public')
            if (!target.startsWith(publicRoot + path.sep) || !fs.existsSync(target)) throw new Error('ملف الصوت المولّد غير موجود في المسار المتوقع.')
            entry.status = 'approved'
            entry.updatedAt = new Date().toISOString()
            manifest[itemId] = entry
            const snapshot = JSON.parse(JSON.stringify(manifest))
            await writeManifestQueued((target2) => {
              for (const [k, v] of Object.entries(snapshot)) target2[k] = v
            })
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ entry }))
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        })
      })

      // ---- POST /__voice-studio/save ----
      server.middlewares.use('/__voice-studio/save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => {
          body += chunk
          if (body.length > 100 * 1024 * 1024) req.destroy()
        })
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body) as {
              itemId: string
              sourceId: string
              type: string
              text: string
              filename: string
              relativePath: string
              audioBase64: string
              durationMs: number
              contentHash: string
            }

            if (!payload.itemId || !payload.audioBase64 || !payload.contentHash) {
              throw new Error('بيانات التسجيل غير مكتملة.')
            }

            const currentItem = buildItems().find((item) => item.id === payload.itemId)
            if (!currentItem) throw new Error('العنصر المطلوب غير موجود في محتوى المشروع.')
            if (currentItem.contentHash !== payload.contentHash) {
              throw new Error('تم تغيير المحتوى منذ فتح الاستوديو. اضغط «تحديث» ثم سجّل الصوت الجديد.')
            }

            const relativeAudio = currentItem.relativePath.replace(/^\/+/, '')
            if (!/^audio\/(?:arabic|english|numbers|discover|islamic|skills)\/[a-z0-9_-]+\/[a-z0-9_-]+\.mp3$/i.test(relativeAudio)) {
              throw new Error(`مسار MP3 غير صالح للعنصر: ${relativeAudio}`)
            }

            const target = path.resolve(projectRoot, 'public', relativeAudio)
            const publicRoot = path.resolve(projectRoot, 'public')
            if (!target.startsWith(publicRoot + path.sep)) throw new Error('مسار غير مسموح.')

            const currentManifest = readManifest()
            const oldEntry = currentManifest[payload.itemId]
            if (oldEntry?.relativePath && oldEntry.relativePath !== `/${relativeAudio}`) {
              const oldFile = path.resolve(projectRoot, 'public', String(oldEntry.relativePath).replace(/^\/+/, ''))
              if (oldFile.startsWith(path.resolve(projectRoot, 'public') + path.sep) && fs.existsSync(oldFile)) {
                fs.unlinkSync(oldFile)
              }
            }

            fs.mkdirSync(path.dirname(target), { recursive: true })
            const audioBuffer = Buffer.from(payload.audioBase64, 'base64')
            if (audioBuffer.length < 128) throw new Error('ملف MP3 الناتج فارغ أو غير صالح.')
            fs.writeFileSync(target, audioBuffer)
            if (!fs.existsSync(target) || fs.statSync(target).size !== audioBuffer.length) {
              throw new Error('تعذر التحقق من حفظ ملف MP3 داخل المشروع.')
            }

            const entry = {
              itemId: payload.itemId,
              sourceId: currentItem.sourceId,
              type: currentItem.type,
              text: currentItem.text,
              filename: currentItem.filename,
              relativePath: `/${relativeAudio}`,
              status: 'approved',
              updatedAt: new Date().toISOString(),
              durationMs: payload.durationMs,
              contentHash: payload.contentHash,
              textHash: crypto.createHash('sha256').update(currentItem.text, 'utf8').digest('hex'),
              source: 'manual',
              processing: {
                format: 'mp3',
                channels: 1,
                sampleRate: 24000,
                bitrateKbps: 64,
                trimSilence: true,
                normalizeDb: -1,
              },
            }
            await writeManifestQueued((manifest) => { manifest[payload.itemId] = entry })

            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              localSave: true,
              item: buildItems().find((item) => item.id === payload.itemId),
              entry,
              savedBytes: audioBuffer.length,
            }))
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        })
      })

      // ---- POST /__voice-studio/delete-group ----
      server.middlewares.use('/__voice-studio/delete-group', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk; if (body.length > 1024 * 1024) req.destroy() })
        req.on('end', async () => {
          try {
            const { section, group, confirmed } = JSON.parse(body) as { section?: string; group?: string; confirmed?: boolean }
            const supportedSections = ['arabic', 'english', 'numbers', 'discover', 'islamic', 'skills']
            if (!section || !supportedSections.includes(section)) throw new Error('القسم المحدد غير مدعوم للحذف.')
            if (!group || !/^[a-z0-9_-]+$/i.test(group)) throw new Error('المجموعة المحددة غير صالحة.')
            if (confirmed !== true) throw new Error('يلزم تأكيد حذف تسجيلات المجموعة المحددة.')

            const currentItems = buildItems()
            const groupItems = currentItems.filter((item) => item.meta?.section === section && item.group === group)
            if (!groupItems.length) throw new Error('لم يتم العثور على مجموعة بهذا الاسم داخل القسم.')
            if (groupItems.some((item) => activeGenerationItems.has(item.id))) {
              res.statusCode = 409
              throw new Error('أوقف التوليد وانتظر انتهاء الأصوات الجارية قبل حذف المجموعة.')
            }

            const publicAudioRoot = path.resolve(projectRoot, 'public', 'audio')
            const audioRoot = path.resolve(publicAudioRoot, section, group)
            if (!audioRoot.startsWith(publicAudioRoot + path.sep)) throw new Error('مسار المجموعة غير صالح.')
            let deletedFiles = 0
            const removeMp3Files = (directory: string) => {
              if (!fs.existsSync(directory)) return
              for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                const target = path.join(directory, entry.name)
                if (entry.isDirectory()) removeMp3Files(target)
                else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.mp3') {
                  fs.unlinkSync(target)
                  deletedFiles += 1
                }
              }
            }
            removeMp3Files(audioRoot)

            const manifest = readManifest()
            const groupItemIds = new Set(groupItems.map((item) => item.id))
            const relativePrefix = `audio/${section}/${group}/`
            const removedItemIds: string[] = []
            for (const [itemId, entry] of Object.entries(manifest)) {
              const relativePath = String(entry.relativePath || '').replaceAll('\\', '/').replace(/^\/+/, '')
              if (groupItemIds.has(itemId) || relativePath.startsWith(relativePrefix)) {
                delete manifest[itemId]
                removedItemIds.push(itemId)
              }
            }
            const snapshot = JSON.parse(JSON.stringify(manifest))
            await writeManifestQueued((target) => {
              for (const key of Object.keys(target)) delete target[key]
              for (const [key, value] of Object.entries(snapshot)) target[key] = value
            })
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ section, group, deletedFiles, removedEntries: removedItemIds.length, removedItemIds, localSave: true }))
          } catch (error) {
            if (!res.statusCode || res.statusCode < 400) res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        })
      })

      // ---- POST /__voice-studio/delete-section ----
      server.middlewares.use('/__voice-studio/delete-section', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk; if (body.length > 1024 * 1024) req.destroy() })
        req.on('end', async () => {
          try {
            const { section, confirmed } = JSON.parse(body) as { section?: string; confirmed?: boolean }
            const supportedSections = ['arabic', 'english', 'numbers', 'discover', 'islamic', 'skills']
            if (!section || !supportedSections.includes(section)) throw new Error('القسم المحدد غير مدعوم للحذف.')
            if (confirmed !== true) throw new Error('يلزم تأكيد حذف التسجيلات الصوتية للقسم.')
            const currentItems = buildItems()
            const sectionItems = currentItems.filter((item) => item.meta?.section === section)
            if (sectionItems.some((item) => activeGenerationItems.has(item.id))) {
              res.statusCode = 409
              throw new Error('أوقف التوليد وانتظر انتهاء الأصوات الجارية قبل حذف ملفات القسم.')
            }

            const audioRoot = path.resolve(projectRoot, 'public', 'audio', section)
            const publicAudioRoot = path.resolve(projectRoot, 'public', 'audio')
            if (!audioRoot.startsWith(publicAudioRoot + path.sep)) throw new Error('مسار القسم غير صالح.')
            let deletedFiles = 0
            const removeMp3Files = (directory: string) => {
              if (!fs.existsSync(directory)) return
              for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                const target = path.join(directory, entry.name)
                if (entry.isDirectory()) removeMp3Files(target)
                else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.mp3') {
                  fs.unlinkSync(target)
                  deletedFiles += 1
                }
              }
            }
            removeMp3Files(audioRoot)

            const manifest = readManifest()
            const sectionItemIds = new Set(sectionItems.map((item) => item.id))
            let removedEntries = 0
            const removedItemIds: string[] = []
            for (const [itemId, entry] of Object.entries(manifest)) {
              const relativePath = String(entry.relativePath || '').replaceAll('\\', '/').replace(/^\/+/, '')
              if (sectionItemIds.has(itemId) || relativePath.startsWith(`audio/${section}/`)) {
                delete manifest[itemId]
                removedEntries += 1
                removedItemIds.push(itemId)
              }
            }
            const snapshot = JSON.parse(JSON.stringify(manifest))
            await writeManifestQueued((target) => {
              for (const key of Object.keys(target)) delete target[key]
              for (const [k, v] of Object.entries(snapshot)) target[k] = v
            })
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ section, deletedFiles, removedEntries, removedItemIds, localSave: true }))
          } catch (error) {
            if (!res.statusCode || res.statusCode < 400) res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        })
      })

      // ---- POST /__voice-studio/delete ----
      server.middlewares.use('/__voice-studio/delete', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk })
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body) as { itemId: string }
            if (!payload.itemId) throw new Error('لم يتم تحديد التسجيل.')

            const manifest = readManifest()
            const entry = manifest[payload.itemId]
            const currentItem = buildItems().find((item) => item.id === payload.itemId)
            if (!entry && !currentItem) throw new Error('العنصر المطلوب غير موجود في محتوى المشروع.')

            const relativePath = entry?.relativePath || currentItem?.relativePath
            if (relativePath) {
              const target = path.resolve(projectRoot, 'public', String(relativePath).replace(/^\/+/, ''))
              const publicRoot = path.resolve(projectRoot, 'public')
              if (target.startsWith(publicRoot + path.sep) && fs.existsSync(target)) fs.unlinkSync(target)
            }

            await writeManifestQueued((m) => { delete m[payload.itemId] })

            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ localSave: true, itemId: payload.itemId }))
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        })
      })
    },
  }
}

// وضع البناء:
//   npm run build         -> موقع + PWA (يولّد manifest و service worker)
//   npm run build:native  -> نسخة التطبيق (Capacitor) بدون PWA
export default defineConfig(({ mode }) => {
  const isNative = mode === 'native'

  return {
    plugins: [
      react(),
      tailwindcss(),
      voiceStudioPlugin(),
      VitePWA({
        disable: isNative,
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['apple-touch-icon.png'],
        manifest: {
          name: 'رحلتي — منصة التعلم للأطفال',
          short_name: 'رحلتي',
          description: 'تعلم العربية والإنجليزية والأرقام والاكتشاف والأخلاق والمهارات للأطفال',
          lang: 'ar',
          dir: 'rtl',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          background_color: '#edf8f5',
          theme_color: '#6d28d9',
          icons: [
            { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // الهيكل فقط: الكود والخطوط والأيقونات
          globPatterns: ['**/*.{js,css,html,svg,woff,woff2}', 'pwa-*.png', 'apple-touch-icon.png'],
          // الحزمة الرئيسية الحالية 5.2 MiB؛ نسمح بها مع استبعاد كل الوسائط الكبيرة.
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/__voice-studio/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/audio/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'kids-audio-v1',
                rangeRequests: true,
                expiration: { maxEntries: 6500, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request }: { request: Request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'kids-images-v1',
                expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/video/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'kids-video-v1',
                rangeRequests: true,
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  }
})
