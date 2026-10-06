import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { voicePromptAudioId } from './src/utils/voicePromptIds.js'
import { DISCOVER_WORLDS } from './src/discover/data/discoverData.ts'
import { DISCOVER_QUIZ_QUESTIONS } from './src/discover/data/discoverQuizData.ts'

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
            if (!/^audio\/(?:arabic|english|numbers|discover)\/[a-z-]+\/[a-z0-9_-]+\.mp3$/i.test(relativeAudio)) {
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
        // 'prompt': النسخة الجديدة تُطبَّق عند فتح التطبيق مرة أخرى، فلا تُقاطع الطفل أثناء اللعب
        registerType: 'prompt',
        injectRegister: false, // التسجيل يتم يدوياً من src/platform/initPlatform.ts
        includeAssets: ['apple-touch-icon.png'],
        manifest: {
          name: 'منصة التعلم الموحدة',
          short_name: 'منصة التعلم',
          description: 'تعلم العربية والإنجليزية والأرقام واكتشف ما حولك — للأطفال',
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
          // نخزّن مسبقاً الكود والخطوط فقط. الصوت والصور الكبيرة تُخزَّن عند أول استخدام.
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
                rangeRequests: true, // مهم لتشغيل الصوت على Safari/iOS
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
