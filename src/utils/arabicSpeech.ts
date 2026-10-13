// ════════════════════════════════════════════════════════════════════
// نص النطق (Speech Text) للحركات والمقاطع العربية
//
// المشكلة: محركات TTS تنطق الحرف المشكول وحده (بُ، بِ، ثَ...) نطقًا غير واضح،
//   لأنها تتوقع كلمة كاملة. الحل: نبقي النص المعروض كما هو (text)، ونرسل للمحرك
//   نصًا مختلفًا مهيّأً للنطق (speechText).
//
// ترتيب الأولوية (من الأقوى إلى الأضعف) — يطبَّقه vite.config.ts:
//   1) "ipa"    في ملف JSON  → يُرسَل لـ Azure عبر <phoneme> (تحكم كامل بالنطق والمد)
//   2) "speech" في ملف JSON  → نص نطق تكتبه يدويًا لعنصر معيّن
//   3) buildSpokenArabic()   → القواعد التلقائية أدناه
//   4) text المعروض           → إن لم يوجد شيء مما سبق
//
// القواعد أدناه نقطة بداية مبنية على تجاربك (بَـ، بُوو، بِيي). عدّلها في الجدول
// SPOKEN_TEMPLATES بعد الاستماع، وكل التغييرات تُطبَّق على كل الحروف دفعة واحدة.
// ════════════════════════════════════════════════════════════════════

const FATHA = '\u064E'
const DAMMA = '\u064F'
const KASRA = '\u0650'
const SUKUN = '\u0652'
const SHADDA = '\u0651'
const TATWEEL = '\u0640'
const HAMZA_ALIF = '\u0623' // أ

// ما يدخل في "علامات التشكيل" ويُحذف عند استخراج الحرف الأساسي
const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g

/** Remove pictographs so speech engines do not pronounce emoji names. */
export function stripEmojiForSpeech(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?/gu, '')
    .replace(/\u200D|\uFE0E|\uFE0F/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * قوالب النطق: L = الحرف الأساسي.
 * غيّر هذا الجدول فقط عند تعديل طريقة النطق بعد التجربة بالسمع.
 *
 * فكرة الطول: القصير يُمدّ قليلًا ليُسمع بوضوح، والمد (ا/و/ي) أطول منه،
 * فيبقى الفرق بين "بُ" و"بُو" مسموعًا للطفل.
 */
export const SPOKEN_TEMPLATES: Record<string, (L: string) => string> = {
  // حركات قصيرة
  fatha: (L) => `${L}${FATHA}${TATWEEL}`,            // بَـ        (جرّبتها ونجحت)
  damma: (L) => `${L}${DAMMA}\u0648\u0648`,           // بُوو       (جرّبتها وكانت أفضل)
  kasra: (L) => `${L}${KASRA}\u064A\u064A`,           // بِيي       (جرّبتها وكانت أفضل)
  // حروف المد (أطول من القصيرة)
  madd_alif: (L) => `${L}${FATHA}\u0627\u0627`,       // بَاا
  madd_waw: (L) => `${L}${DAMMA}\u0648\u0648\u0648`,  // بُووو
  madd_yaa: (L) => `${L}${KASRA}\u064A\u064A\u064A`,  // بِييي
  // السكون والشدة: لا يُنطقان وحدهما، فنسبقهما بحرف مساعد
  sukun: (L) => `${HAMZA_ALIF}${FATHA}${L}${SUKUN}`,                          // أَبْ
  shadda: (L) => `${HAMZA_ALIF}${FATHA}${L}${FATHA}${SHADDA}${TATWEEL}`,      // أَبَّـ
  // التنوين: نُظهر النون صراحةً
  tanween_fath: (L) => `${L}${FATHA}\u0646${SUKUN}`,  // بَنْ
  tanween_damm: (L) => `${L}${DAMMA}\u0646${SUKUN}`,  // بُنْ
  tanween_kasr: (L) => `${L}${KASRA}\u0646${SUKUN}`,  // بِنْ
}

/** استخراج الحرف الأساسي (أول حرف عربي بدون تشكيل) من النص المعروض، مثل «ثَا» ← «ث». */
export function baseLetterOf(displayText: string): string {
  const stripped = displayText.replace(DIACRITICS, '').replace(new RegExp(TATWEEL, 'g'), '').trim()
  return [...stripped][0] ?? ''
}

export interface SpokenArabicInput {
  /** النص المعروض في الصفحة (لا يتغير أبدًا) */
  text: string
  /** مفتاح الحركة من ملف JSON: fatha | damma | kasra | madd_alif | ... */
  haraka?: string
}

/**
 * يُرجع نص النطق، أو undefined إذا لا توجد قاعدة (فيُستخدم النص المعروض كما هو).
 * لا يغيّر الكلمات ولا الجمل؛ مخصص للحروف المشكولة والمقاطع فقط.
 */
export function buildSpokenArabic(input: SpokenArabicInput): string | undefined {
  const template = input.haraka ? SPOKEN_TEMPLATES[input.haraka] : undefined
  if (!template) return undefined
  const letter = baseLetterOf(input.text)
  if (!letter) return undefined
  return template(letter)
}
