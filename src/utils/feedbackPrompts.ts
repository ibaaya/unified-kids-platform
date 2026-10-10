/** Shared, recorded Arabic answer feedback used throughout the learning areas. */
export const SUCCESS_FEEDBACK = [
  'أَحْسَنْتَ!',
  'رَائِعٌ!',
  'مُمْتَازٌ!',
  'إِجَابَةٌ صَحِيحَةٌ!',
  'اِسْتَمِرَّ!',
] as const

export const RETRY_FEEDBACK = [
  'حَاوِلْ مَرَّةً أُخْرَى!',
  'فَكِّرْ قَلِيلًا ثُمَّ حَاوِلْ!',
] as const

export function pickSuccessMessage(index: number): string {
  return SUCCESS_FEEDBACK[index % SUCCESS_FEEDBACK.length]
}

export function pickTryAgainMessage(index: number): string {
  return RETRY_FEEDBACK[index % RETRY_FEEDBACK.length]
}

let successAliasIndex = 0
let retryAliasIndex = 0

function normalizeFeedbackText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[\p{Extended_Pictographic}\u200d\ufe0f]/gu, ' ')
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const successAliases = new Set([
  'احسنت', 'احسنت يا بطل', 'احسنت على المحاولة', 'رائع', 'ممتاز', 'صحيح',
  'اجابة صحيحة', 'اجابة صحيحة احسنت', 'احسنت اجابة صحيحة', 'استمر',
  'ممتاز واصل', 'عمل ممتاز',
].map(normalizeFeedbackText))

const retryAliases = new Set([
  'حاول مرة اخرى', 'حاول مجددا', 'فكر قليلا', 'فكر قليلا ثم حاول',
  'اقتربت جرب مجددا', 'لا بأس حاول مجددا', 'حاول مرة ثانية',
].map(normalizeFeedbackText))

/** Map legacy short praise/retry variants to the shared recorded message set. */
export function normalizeAnswerFeedback(text: string): string {
  const normalized = normalizeFeedbackText(text)
  if (SUCCESS_FEEDBACK.some((message) => normalizeFeedbackText(message) === normalized)) return text.trim()
  if (RETRY_FEEDBACK.some((message) => normalizeFeedbackText(message) === normalized)) return text.trim()
  if (successAliases.has(normalized)) return pickSuccessMessage(successAliasIndex++)
  if (retryAliases.has(normalized)) return pickTryAgainMessage(retryAliasIndex++)
  return text
}
