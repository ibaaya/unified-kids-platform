// أنواع بيانات المحتوى التعليمي — يُستخدم لاحقًا مع letters.json, words.json ... إلخ

export type LetterForm = 'isolated' | 'initial' | 'medial' | 'final'

/** الشكل المُخزَّن في letters.json — الأشكال (forms) تُبنى تلقائيًا وقت التشغيل */
export interface LetterSeed {
  id: string // slug لاتيني، مثال: "ba"
  letter: string // الحرف العربي نفسه، مثال: "ب"
  name: string // اسم الحرف، مثال: "باء"
  soundId: string
  exampleWordId: string
  imageEmoji: string
  order: number
}

export interface Letter extends LetterSeed {
  forms: Record<LetterForm, string>
}

export type HarakaType =
  | 'fatha'
  | 'damma'
  | 'kasra'
  | 'sukun'
  | 'shadda'
  | 'tanween_fath'
  | 'tanween_damm'
  | 'tanween_kasr'
  | 'madd_alif'
  | 'madd_waw'
  | 'madd_yaa'

export interface HarakaVariant {
  letterId: string
  haraka: HarakaType
  form: string
  soundId: string
}

export interface Word {
  id: string
  text: string
  letterId: string
  position: 'start' | 'middle' | 'end'
  letters?: string[]
  imageEmoji: string
  soundId: string
  difficulty: 1 | 2 | 3
  relatedLetterIds: string[]
}

export type SyllableType = 'short' | 'madd'

export interface Syllable {
  id: string
  letterId: string
  haraka: string
  text: string
  type: SyllableType
}

export interface Sentence {
  id: string
  text: string
  wordIds: string[]
  imageEmoji?: string
  comprehensionQuestion?: {
    question: string
    options: string[]
    correctIndex: number
  }
}

export interface StoryPage {
  text: string
  imageEmoji: string
  soundId: string
}

export interface Story {
  id: string
  storyNumber?: number
  title: string
  pages: StoryPage[]
  newWordIds: string[]
  comprehensionQuestions: {
    question: string
    options: string[]
    correctIndex: number
  }[]
  theme: string
}

export type WorldId =
  | 'letters'
  | 'harakat'
  | 'syllables'
  | 'words'
  | 'sentences'
  | 'stories'

export interface WorldDefinition {
  id: WorldId
  title: string
  emoji: string
  colorVar: string
  order: number
  unlockRequirement: { worldId: WorldId; masteryPercent: number } | null
}

export interface GameDefinition {
  id: string
  templateId: string
  skillTarget: 'letter' | 'haraka' | 'syllable' | 'word' | 'sentence'
  contentIds: string[]
  difficulty: 1 | 2 | 3
}

export interface LessonNode {
  id: string
  worldId: WorldId
  title: string
  contentRefs: string[]
  gameRefs: string[]
  requiredMasteryToUnlockNext: number
}
