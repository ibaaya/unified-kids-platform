// src/skills/data/types.ts
// أنواع البيانات المشتركة لموديول «مدينة المهارات»

/** رمز صورة: إيموجي مباشرة، أو "shape:<شكل>:<لون hex>"، أو "color:<hex>"، أو "?" لخانة فارغة */
export type Token = string;

export interface Opt {
  id: string;
  label?: string;   // نص عربي مشكَّل
  visual?: Token;   // صورة (لا تُنطق أبدًا)
  scale?: number;   // لتكبير/تصغير الصورة (للترتيب حسب الحجم)
}

interface Base {
  id: string;
  prompt: string;          // نص السؤال (مشكَّل) — يُنطق تلقائيًا بعد حذف الإيموجي
  speech?: string;         // نص بديل للنطق عند الحاجة
  hint?: string;           // تلميح يظهر بعد خطأين
  explain?: string;        // جملة قصيرة تظهر بعد الإجابة الصحيحة
  pictureRows?: Token[][]; // صفوف صور تُعرض فوق الخيارات
}

export interface ChoiceQ extends Base {
  type: 'choice';
  options: Opt[];
  answer: string | string[];
  multi?: boolean;                    // اختيار عدة إجابات ثم زر «تحقّق»
  openEnded?: boolean;                // كل الإجابات مقبولة (للإبداع)
  sequence?: Token[];                 // تسلسل صور (يمكن أن يحتوي "?")
  flash?: { items: Token[]; seconds: number }; // عرض مؤقت للذاكرة
}
export interface OrderQ extends Base { type: 'order'; items: Opt[] }                        // الترتيب الصحيح = ترتيب المصفوفة
export interface MatchQ extends Base { type: 'match'; pairs: { left: Opt; right: Opt }[] }
export interface MemoryQ extends Base { type: 'memory'; cards: Opt[] }                      // كل بطاقة تظهر مرتين
export interface PathQ extends Base { type: 'path'; grid: string[]; mustCollect?: boolean }  // S بداية، G هدف، # عائق، X حفرة، * نجمة
export type Backdrop = 'garden' | 'sea' | 'desert' | 'night' | 'sky';
export interface SceneQ extends Base { type: 'scene'; backdrop: Backdrop; stickers: Token[]; need: number }
export type PaintTemplate = 'house' | 'flower' | 'fish' | 'mosque';
export interface PaintQ extends Base { type: 'paint'; template: PaintTemplate; palette: string[] }

export type Question = ChoiceQ | OrderQ | MatchQ | MemoryQ | PathQ | SceneQ | PaintQ;

export type LevelNo = 1 | 2 | 3;
export interface GameLevel {
  level: LevelNo;
  title: string;
  goal: string;
  /** يُستدعى عند بدء كل محاولة: يسحب أسئلة عشوائية من البنك أو يولّدها */
  build: () => Question[];
}

export type ThemeKey =
  | 'amber' | 'sky' | 'violet' | 'pink' | 'emerald' | 'orange' | 'teal'
  | 'indigo' | 'rose' | 'lime' | 'cyan' | 'fuchsia' | 'blue';

export interface SkillGame {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  skill: string;
  theme: ThemeKey;
  levels: GameLevel[];
}
