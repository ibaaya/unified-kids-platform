import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { voicePromptAudioId } from './src/utils/voicePromptIds.js'

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

      const buildItems = () => {
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
        const manifest = fs.existsSync(manifestPath) ? readJson<Record<string, any>>(manifestPath) : {}

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
              variants = letters.map((letter) => ({ id: String(letter.id), values: { letterName: String(letter.name) } }))
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

        return items.map((item) => {
          const saved = manifest[item.id]
          const expectedFile = path.resolve(projectRoot, 'public', item.relativePath.replace(/^\//, ''))
          if (saved?.contentHash && saved.contentHash !== item.contentHash) {
            return { ...item, status: 'stale' as const }
          }
          if (saved?.status === 'approved' && saved.relativePath) {
            const savedFile = path.resolve(projectRoot, 'public', saved.relativePath.replace(/^\//, ''))
            if (savedFile.startsWith(path.resolve(projectRoot, 'public') + path.sep) && fs.existsSync(savedFile)) {
              return { ...item, status: 'approved' as const, relativePath: saved.relativePath }
            }
          }
          return { ...item, status: fs.existsSync(expectedFile) ? 'recorded' as const : 'missing' as const }
        })
      }

      server.middlewares.use('/__voice-studio/items', (_req, res) => {
        try {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(buildItems()))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error) }))
        }
      })

      server.middlewares.use('/__voice-studio/manifest', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        try {
          const manifest = fs.existsSync(manifestPath) ? readJson<Record<string, any>>(manifestPath) : {}
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
        req.on('end', () => {
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

            // المسار لا يأتي من المتصفح كمسار حر؛ نأخذ المسار المولّد من محتوى المشروع نفسه.
            // هذا يمنع أخطاء 400 الناتجة عن اختلاف اسم الملف، ويضمن الحفظ داخل public/audio فقط.
            const relativeAudio = currentItem.relativePath.replace(/^\/+/, '')
            if (!/^audio\/[a-z-]+\/[a-z0-9_-]+\.mp3$/i.test(relativeAudio)) {
              throw new Error(`مسار MP3 غير صالح للعنصر: ${relativeAudio}`)
            }

            const target = path.resolve(projectRoot, 'public', relativeAudio)
            const publicRoot = path.resolve(projectRoot, 'public')
            if (!target.startsWith(publicRoot + path.sep)) throw new Error('مسار غير مسموح.')

            const currentManifest = fs.existsSync(manifestPath)
              ? readJson<Record<string, any>>(manifestPath)
              : {}
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

            const manifest = fs.existsSync(manifestPath)
              ? readJson<Record<string, any>>(manifestPath)
              : {}

            manifest[payload.itemId] = {
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
              processing: {
                format: 'mp3',
                channels: 1,
                sampleRate: 24000,
                bitrateKbps: 64,
                trimSilence: true,
                normalizeDb: -1,
              },
            }

            fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              localSave: true,
              item: buildItems().find((item) => item.id === payload.itemId),
              entry: manifest[payload.itemId],
              savedBytes: audioBuffer.length,
            }))
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        })
      })

      server.middlewares.use('/__voice-studio/delete', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const payload = JSON.parse(body) as { itemId: string }
            if (!payload.itemId) throw new Error('لم يتم تحديد التسجيل.')

            const manifest = fs.existsSync(manifestPath) ? readJson<Record<string, any>>(manifestPath) : {}
            const entry = manifest[payload.itemId]
            const currentItem = buildItems().find((item) => item.id === payload.itemId)
            if (!entry && !currentItem) throw new Error('العنصر المطلوب غير موجود في محتوى المشروع.')

            const relativePath = entry?.relativePath || currentItem?.relativePath
            if (relativePath) {
              const target = path.resolve(projectRoot, 'public', String(relativePath).replace(/^\/+/, ''))
              const publicRoot = path.resolve(projectRoot, 'public')
              if (target.startsWith(publicRoot + path.sep) && fs.existsSync(target)) fs.unlinkSync(target)
            }

            delete manifest[payload.itemId]
            fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

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

export default defineConfig({
  plugins: [react(), tailwindcss(), voiceStudioPlugin()],
})
