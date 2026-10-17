// =====================================================
// أخلاقي الجميلة - Types
// =====================================================

export interface IslamicValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  example: string;
  badgeId: string;
}

export interface IslamicManner {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  steps?: string[];
  badgeId: string;
  /** إيموجي كبير يظهر كصورة رئيسية في الكارت (بديل أوضح للأطفال) */
  emojiBig?: string;
  /** إيموجي صغيرة تمثّل خطوات الأدب كدليل بصري سريع */
  emojis?: string[];
  /** مسار صورة محلية اختيارية (SVG/PNG) — تُستخدم بدل الإيموجي إن وُجدت */
  image?: string;
  /** لون خلفية فاتح مشتق (اختياري) لتحسين التباين */
  colorSoft?: string;
}

export interface WorshipStep {
  id: string;
  step: number;
  title: string;
  description: string;
  note?: string;
}

export interface WorshipLesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  steps: WorshipStep[];
  gameId: string;
  badgeId: string;
}

export interface IslamPillar {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ImanPillar {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface StoryScene {
  id: string;
  text: string;
  character: string; // SVG character type
  choices?: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  autoNext?: boolean;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  valueId: string;
  icon: string;
  color: string;
  scenes: StoryScene[];
  moralLesson: string;
  activity?: {
    prompt: string;
    options: string[];
    correctIndex: number;
  };
}

export interface CultureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  svgType: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  level: 'easy' | 'medium' | 'hard';
  category: string;
  worldId: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  worldId: string;
  condition: string;
}

export interface IslamicGame {
  id: string;
  type: 'scenario' | 'order' | 'match' | 'memory' | 'challenge';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  worldId: string;
}

export interface IslamicProgress {
  completedValues: string[];
  completedManners: string[];
  completedStories: string[];
  completedWorshipLessons: string[];
  completedFaith: string[];
  completedGames: string[];
  completedQuizzes: Record<string, { score: number; level: string }>;
  earnedBadges: string[];
  todayActivities: number;
  totalActivities: number;
  lastVisited: string;
}

export type IslamicWorldId =
  | 'values'
  | 'family'
  | 'manners'
  | 'worship'
  | 'faith'
  | 'stories'
  | 'culture';

// ─── الخطوات التعليمية (أتعلم خطوة بخطوة) ───
export interface StepItem {
  id: string;
  title: string;
  description: string;
  note?: string;
  /** نصٌّ قرآني: يُعرض بتمييز بصري ولا يُنطَق آلياً */
  quran?: { text: string; ref: string };
}

export interface StepTopic {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  steps: StepItem[];
  /** يربط إكمال الموضوع بنظام التقدم والشارات الموجود */
  source: { kind: 'worship' | 'manner' | 'value'; id: string };
}

// ─── الألعاب ───
export interface OrderGameDef {
  id: string;
  prompt: string;
  /** العناصر بالترتيب الصحيح */
  items: { id: string; text: string }[];
}

export interface ScenarioDef {
  id: string;
  situation: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MatchPairDef {
  id: string;
  left: string;
  right: string;
}

export type SceneKey = 'sharing' | 'helping' | 'washing' | 'greeting' | 'mosque' | 'thanks';

export interface PicturePuzzleDef {
  id: string;
  scene: SceneKey;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CollectItemDef {
  id: string;
  text: string;
  icon: string;
  good: boolean;
}

export interface MemoryPairDef {
  id: string;
  label: string;
  icon: string;
}

export interface GameMeta {
  id: string;
  kind: 'order' | 'scenario' | 'match' | 'picture' | 'memory' | 'collect';
  title: string;
  desc: string;
  icon: string;
  color: string;
  /** مفتاح مجموعة البيانات داخل data/games.ts */
  dataId?: string;
}