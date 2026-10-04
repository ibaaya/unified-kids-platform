// توليد أشكال الحرف (منعزل/أول/وسط/آخر) اعتمادًا على محرك تشكيل الخط العربي في المتصفح،
// بدل حفظ كل شكل يدويًا (وهذا يضمن دقة الأشكال تلقائيًا، بما في ذلك الحروف التي لا تتصل
// بما بعدها مثل ا/د/ذ/ر/ز/و — يتعامل الخط مع ذلك بنفسه).

import type { LetterForm } from '../types/content'

const TATWEEL = '\u0640' // حرف المطة (ـ) يُستخدم فقط لإجبار التشكيل، ولا يُنطق

export function getLetterForms(baseLetter: string): Record<LetterForm, string> {
  return {
    isolated: baseLetter,
    initial: baseLetter + TATWEEL,
    medial: TATWEEL + baseLetter + TATWEEL,
    final: TATWEEL + baseLetter,
  }
}
