import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
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
          meta?: Record<string, string | number | undefined>
        }

        const letters = readJson<Array<Record<string, any>>>(path.join(dataDir, 'letters.json'))
        const harakat = readJson<Array<Record<string, any>>>(path.join(dataDir, 'harakat.json'))
        const syllables = readJson<Array<Record<string, any>>>(path.join(dataDir, 'syllables.json'))
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

        const harakaOrder = ['fatha', 'damma', 'kasra', 'sukun', 'shadda', 'tanween_fath', 'tanween_damm', 'tanween_kasr', 'madd_alif', 'madd_waw', 'madd_yaa']
        harakat
          .sort((a, b) => harakaOrder.indexOf(a.haraka) - harakaOrder.indexOf(b.haraka))
          .forEach((item, index) => {
            const filename = uniqueFilename(
              `haraka_${safeName(item.haraka)}_${slugArabic(item.letterId)}.mp3`,
              usedNames,
            )
            items.push({
              id: `haraka:${item.soundId}`,
              type: 'haraka',
              group: 'harakat',
              groupLabel: 'الحركات',
              text: item.form,
              filename,
              relativePath: `/audio/harakat/${filename}`,
              sourceId: item.soundId,
              order: index + 1,
              contentHash: contentHash([`haraka:${item.soundId}`, item.soundId, item.letterId, item.haraka, item.form]),
              meta: { letter: item.letterId, haraka: item.haraka },
            })
          })

        syllables.forEach((item, index) => {
          const filename = uniqueFilename(
            `syllable_${slugArabic(item.text)}_${safeName(item.type)}.mp3`,
            usedNames,
          )
          items.push({
            id: `syllable:${item.id}`,
            type: 'syllable',
            group: 'syllables',
            groupLabel: 'المقاطع',
            text: item.text,
            filename,
            relativePath: `/audio/syllables/${filename}`,
            sourceId: item.id,
            order: index + 1,
            contentHash: contentHash([`syllable:${item.id}`, item.id, item.text, item.letterId, item.haraka, item.type]),
            meta: { letter: item.letterId, haraka: item.haraka, syllableType: item.type },
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
          syllables: 'syllables-prompts',
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
          { id: 'q_recognize', text: 'مَا هَذَا الرَّقْمُ؟' },
          { id: 'q_count', text: 'كَمْ عَدَدُ الْأَشْيَاءِ؟' },
          { id: 'q_compare', text: 'مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟' },
          { id: 'q_bigger', text: 'أَيُّ الْعَدَدَيْنِ أَكْبَرُ؟' },
          { id: 'q_missing', text: 'أَيُّ رَقْمٍ نَاقِص؟' },
          { id: 'cheer_correct', text: 'أَحْسَنْتَ' },
          { id: 'cheer_try', text: 'حاول مرة أخرى' },
          { id: 'welcome', text: 'مَرْحَبًا بِكَ فِي مُغَامَرَةِ الْأَرْقَامِ! هَلْ أَنْتَ مُسْتَعِدٌّ؟' },
        )
        for (let n = 1; n <= 20; n += 1) numberPrompts.push({ id: `hear_${n}`, text: `أَيْنَ الرَّقْمُ ${numberNames[n]}؟` })
        for (let n = 2; n <= 19; n += 1) {
          numberPrompts.push({ id: `before_${n}`, text: `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${numberNames[n]}؟` })
          numberPrompts.push({ id: `after_${n}`, text: `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${numberNames[n]}؟` })
        }
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

        const addLearningItems = (section: 'islamic' | 'skills', sourceDirectory: string) => {
          const seen = new Set<string>()
          let order = 0
          const visit = (directory: string): void => {
            for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
              const absolute = path.join(directory, entry.name)
              if (entry.isDirectory()) { visit(absolute); continue }
              if (!entry.isFile() || !entry.name.endsWith('.ts') || /(?:types|index)\.ts$/i.test(entry.name)) continue
              const relative = path.relative(projectRoot, absolute).replaceAll(path.sep, '/')
              const group = safeName(path.basename(entry.name, '.ts'))
              const source = fs.readFileSync(absolute, 'utf8')
              const quotePattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
              for (const match of source.matchAll(quotePattern)) {
                const text = match[2].replace(/\\(['"`\\])/g, '$1').trim()
                if (!/[\u0600-\u06ff]/u.test(text) || text.includes('${') || text.length < 2 || seen.has(`${group}:${text}`)) continue
                seen.add(`${group}:${text}`)
                const sourceHash = crypto.createHash('sha1').update(`${relative}\0${text}`).digest('hex').slice(0, 12)
                const id = `${section}:${group}:${sourceHash}`
                const filename = uniqueFilename(`${section}_${group}_${sourceHash}.mp3`, usedNames)
                order += 1
                addProjectItem({ id, type: 'prompt', group, groupLabel: section === 'islamic' ? `أخلاقي الجميلة · ${group}` : `مدينة المهارات · ${group}`, text, filename, relativePath: `/audio/${section}/${group}/${filename}`, sourceId: id, order, contentHash: contentHash([id, text]), meta: { section, contentId: `${relative}#${order}` } })
              }
            }
          }
          visit(path.join(projectRoot, sourceDirectory))
        }
        addLearningItems('islamic', 'src/islamic/data')
        addLearningItems('skills', 'src/skills/data')

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
            const payload = JSON.parse(body) as { section?: string; voice?: string; itemId?: string; itemIds?: string[] }
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
              relativeAudio: string
              target: string
              textFile: string
              outputFile: string
            }
            const jobs: Job[] = []
            const publicRoot = path.resolve(projectRoot, 'public')
            for (const item of candidates) {
              const textHash = crypto.createHash('sha256').update(item.text, 'utf8').digest('hex')
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
              jobs.push({ item, textHash, relativeAudio, target, textFile: `${tempBase}.txt`, outputFile: `${tempBase}.mp3` })
            }

            const generateOne = async (job: Job): Promise<{ ok: boolean; error?: string; entry?: Record<string, any> }> => {
              const { item, textHash, relativeAudio, target, textFile, outputFile } = job
              try {
                fs.writeFileSync(textFile, item.text, 'utf8')
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
                const audio = fs.readFileSync(outputFile)
                if (audio.length < 128 || audio.toString('ascii', 0, 3) !== 'ID3' && !(audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0)) throw new Error('الناتج ليس ملف MP3 صالحاً.')
                fs.mkdirSync(path.dirname(target), { recursive: true })
                const staged = `${target}.tmp-${crypto.randomUUID()}`
                fs.writeFileSync(staged, audio)
                fs.renameSync(staged, target)
                const entry = {
                  itemId: item.id, sourceId: item.sourceId, type: item.type, text: item.text,
                  filename: path.basename(relativeAudio), relativePath: `/${relativeAudio}`, status: 'approved', updatedAt: new Date().toISOString(),
                  contentHash: item.contentHash, textHash, source: 'edge-tts', voice,
                }
                return { ok: true, entry }
              } catch (error) {
                return { ok: false, error: error instanceof Error ? error.message : String(error) }
              } finally {
                for (const temp of [textFile, outputFile]) if (fs.existsSync(temp)) fs.unlinkSync(temp)
              }
            }

            //const concurrency = Math.min(4, jobs.length)
            const concurrency = Math.min(8, jobs.length)
            const queue = [...jobs]
            const settled: Array<{ ok: boolean; error?: string; entry?: Record<string, any> }> = []
            const runWorker = async () => {
              while (queue.length) {
                const job = queue.shift()
                if (!job) return
                settled.push(await generateOne(job))
              }
            }
            await Promise.all(Array.from({ length: concurrency }, () => runWorker()))

            const okEntries: Record<string, any>[] = []
            for (let i = 0; i < jobs.length; i += 1) {
              const job = jobs[i]
              const outcome = settled[i]
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
          globPatterns: ['**/*.{js,css,html,svg,woff2}', 'pwa-*.png', 'apple-touch-icon.png'],
          globIgnores: ['audio/**', 'images/**', 'video/**'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
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
                expiration: { maxEntries: 800, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/images/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'kids-images-v1',
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  }
})
