// harakaLabels.ts

import type { HarakaType } from '../types/content'

export const HARAKA_ORDER: HarakaType[] = [
  'fatha',
  'damma',
  'kasra',
  'sukun',
  'tanween_fath',
  'tanween_damm',
  'tanween_kasr',
  'shadda',
  'madd_alif',
  'madd_waw',
  'madd_yaa',
]

export const HARAKA_LABELS: Record<HarakaType, string> = {
  fatha: 'الفَتْحَة',
  damma: 'الضَمَة',
  kasra: 'الكَسْرَة',
  sukun: 'السُكُوْن',
  tanween_fath: 'تَنْوِيْن الفَتْح',
  tanween_damm: ' تَنْوِيْن الضَم',
  tanween_kasr: 'تَنْوِيْن الكَسْر',
  shadda: 'الشَدة',
  madd_alif: 'المَدُ بِالأَلِف',
  madd_waw: 'المَدُ بِالوَاو',
  madd_yaa: 'المَدُ بِاليَا',
}

/**
 * الرمز البصري لكل حركة، يُعرض بجانب الاسم في عالم الحركات.
 * ملاحظة: لرموز التنوين والمدود نعرضها مركّبة على حرف "ب" ليكون
 * الشكل واضحاً للطفل (مثل "بً" بدل رمز منفصل غير مفهوم).
 */
export const HARAKA_SYMBOLS: Record<HarakaType, string> = {
  fatha: ' َ',
  damma: ' ُ',
  kasra: ' ِ',
  sukun: ' ْ',
  tanween_fath: ' ً',
  tanween_damm: ' ٌ',
  tanween_kasr: ' ٍ',
  shadda: ' ـّ',
  madd_alif: 'بَا',
  madd_waw: 'بُو',
  madd_yaa: 'بِي',
}