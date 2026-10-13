// مختبر النطق: يولّد عدة صيغ لنطق حرف واحد عبر Azure لتسمعها وتختار الأفضل.
//
// التشغيل (من جذر المشروع، بعد وضع المفاتيح في .env):
//   node scripts/tts-lab.mjs ب
//   node scripts/tts-lab.mjs ث ar-SA-HamedNeural θ
//
// المعاملات: 1) الحرف  2) اسم الصوت (اختياري)  3) رمز IPA للحرف الساكن (اختياري)
// الناتج: ملفات mp3 في مجلد tts-lab/ باسم الصيغة، افتحها واستمع واحدًا واحدًا.
// بعد اختيار الصيغة الأفضل عدّل جدول SPOKEN_TEMPLATES في src/utils/arabicSpeech.ts.

import fs from 'node:fs'
import path from 'node:path'

// ── قراءة .env بسيطة (بدون مكتبات) ──
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}
const env = { ...loadEnvFile('.env'), ...loadEnvFile('.env.local'), ...process.env }
const KEY = (env.AZURE_SPEECH_KEY || '').trim()
const REGION = (env.AZURE_SPEECH_REGION || '').trim()
if (!KEY || !REGION) { console.error('ضع AZURE_SPEECH_KEY و AZURE_SPEECH_REGION في .env أولًا.'); process.exit(1) }

const letter = process.argv[2] || 'ب'
const voice = process.argv[3] || 'ar-SA-ZariyahNeural'
const DEFAULT_IPA = { 'ب': 'b', 'ت': 't', 'ث': 'θ', 'د': 'd', 'ذ': 'ð', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'ʃ', 'ف': 'f', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h' }
const ipaC = process.argv[4] || DEFAULT_IPA[letter]

const F = '\u064E', D = '\u064F', K = '\u0650', T = '\u0640', W = '\u0648', Y = '\u064A', A = '\u0627'
const variants = {
  '01_fatha_plain': `${letter}${F}`,
  '02_fatha_tatweel': `${letter}${F}${T}`,
  '03_damma_plain': `${letter}${D}`,
  '04_damma_waw2': `${letter}${D}${W}${W}`,
  '05_kasra_plain': `${letter}${K}`,
  '06_kasra_yaa2': `${letter}${K}${Y}${Y}`,
  '07_madd_alif_plain': `${letter}${F}${A}`,
  '08_madd_alif_x2': `${letter}${F}${A}${A}`,
  '09_madd_waw_plain': `${letter}${D}${W}`,
  '10_madd_waw_x3': `${letter}${D}${W}${W}${W}`,
  '11_madd_yaa_plain': `${letter}${K}${Y}`,
  '12_madd_yaa_x3': `${letter}${K}${Y}${Y}${Y}`,
}
const ipaVariants = ipaC ? {
  'i1_fatha_ipa': [`${letter}${F}`, `${ipaC}a`],
  'i2_damma_ipa': [`${letter}${D}`, `${ipaC}u`],
  'i3_kasra_ipa': [`${letter}${K}`, `${ipaC}i`],
  'i4_madd_alif_ipa': [`${letter}${F}${A}`, `${ipaC}aː`],
  'i5_madd_waw_ipa': [`${letter}${D}${W}`, `${ipaC}uː`],
  'i6_madd_yaa_ipa': [`${letter}${K}${Y}`, `${ipaC}iː`],
} : {}
if (!ipaC) console.log('(لم تُعطَ رمز IPA لهذا الحرف، لذا سأولّد الصيغ النصية فقط. مرّر الرمز كمعامل ثالث لتجربة IPA.)')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
async function synth(inner) {
  const lang = voice.split('-').slice(0, 2).join('-')
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${voice}"><prosody rate="-20%">${inner}</prosody></voice></speak>`
  const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'tts-lab' },
    body: ssml,
  })
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
  return Buffer.from(await res.arrayBuffer())
}

const outDir = path.join('tts-lab', `${letter}_${voice}`)
fs.mkdirSync(outDir, { recursive: true })
const jobs = [
  ...Object.entries(variants).map(([name, text]) => [name, esc(text), text]),
  ...Object.entries(ipaVariants).map(([name, [text, ph]]) => [name, `<phoneme alphabet="ipa" ph="${esc(ph)}">${esc(text)}</phoneme>`, `${text}  ← IPA: ${ph}`]),
]
for (const [name, inner, shown] of jobs) {
  try {
    fs.writeFileSync(path.join(outDir, `${name}.mp3`), await synth(inner))
    console.log('✔', name.padEnd(20), shown)
  } catch (e) {
    console.log('✘', name.padEnd(20), e.message)
  }
  await new Promise((r) => setTimeout(r, 400)) // لطف مع حدود الطبقة المجانية
}
console.log(`\nانتهى. افتح المجلد: ${outDir}`)
