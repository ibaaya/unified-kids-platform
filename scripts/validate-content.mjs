import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', name), 'utf8'))
const letters = readJson('letters.json')
const words = readJson('words.json')
const prompts = readJson('voice-prompts.json')
const stories = readJson('stories.json')
const errors = []

function uniqueById(items, label) {
  const seen = new Set()
  for (const item of items) {
    if (!item.id || seen.has(item.id)) errors.push(`${label}: معرّف مفقود أو مكرر: ${item.id ?? '(فارغ)'}`)
    seen.add(item.id)
  }
}

function normalizeArabic(value) {
  return value
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
}

function getPositions(text, letter) {
  const chars = [...normalizeArabic(text)]
  const target = normalizeArabic(letter)
  const positions = new Set()
  chars.forEach((char, index) => {
    if (char !== target) return
    positions.add(index === 0 ? 'start' : index === chars.length - 1 ? 'end' : 'middle')
  })
  return positions
}

uniqueById(letters, 'الحروف')
uniqueById(words, 'الكلمات')
uniqueById(stories, 'القصص')

const validPositions = ['start', 'middle', 'end']
for (const letter of letters) {
  for (const position of validPositions) {
    const count = words.filter((word) => word.letterId === letter.id && word.position === position).length
    if (count !== 3) errors.push(`الحرف ${letter.id}: موضع ${position} يحتوي ${count} كلمات، والمطلوب 3.`)
  }
}

for (const word of words) {
  if (!word.text?.trim() || !word.imageEmoji?.trim() || !word.soundId?.trim()) {
    errors.push(`الكلمة ${word.id}: ينقصها النص أو الصورة أو معرّف الصوت.`)
    continue
  }

  const positions = getPositions(word.text, word.letterId)
  if (positions.size !== 1 || !positions.has(word.position)) {
    errors.push(`الكلمة ${word.id} (${word.text}): الحرف المستهدف غير موجود في موضع وحيد يطابق ${word.position}.`)
  }

  const target = normalizeArabic(word.letterId)
  const safeEmojis = new Set(words
    .filter((candidate) => candidate.id !== word.id)
    .filter((candidate) => candidate.imageEmoji !== word.imageEmoji)
    .filter((candidate) => !normalizeArabic(candidate.text).includes(target))
    .map((candidate) => candidate.imageEmoji))
  if (safeEmojis.size < 2) {
    errors.push(`الكلمة ${word.id}: لا تتوفر صورتان مشتتتان لا تحتوي كلمتاهما على الحرف ${word.letterId}.`)
  }
}

if (!Array.isArray(prompts.worlds) || prompts.worlds.some((world) => world.id === 'stories')) {
  errors.push('كتالوج الأسئلة يجب أن يستثني عالم القصص وأن يحتوي قائمة عوالم صالحة.')
} else {
  uniqueById(prompts.worlds, 'عوالم الأسئلة')
  for (const world of prompts.worlds) {
    uniqueById(world.prompts ?? [], `أسئلة ${world.id}`)
    for (const prompt of world.prompts ?? []) {
      if (!(prompt.text || prompt.template)) {
        errors.push(`السؤال ${world.id}/${prompt.id}: لا يوجد نص أو قالب.`)
      }
    }
  }
}

if (errors.length) {
  console.error(`فشل فحص المحتوى (${errors.length} ملاحظات):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`نجح فحص المحتوى: ${letters.length} حرفًا، ${words.length} كلمة، 3 كلمات في كل موضع،`)
  console.log('كل كلمة تضع الحرف المستهدف في موضع واحد فقط، ولكل سؤال صورتان مشتتتان على الأقل.')
  console.log(`${prompts.worlds.length} عوالم في كتالوج التسجيل، والقصص (${stories.length}) مستثناة منه.`)
}
