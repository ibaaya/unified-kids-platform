// المحتوى التعليمي منفصل عن الواجهة: أضف مراحل أو صورًا هنا فقط
export const EMOJIS = ["🍎", "⭐", "⚽", "🎈", "🦋", "🐟", "🚗", "🐰", "✏️", "🧊", "🌹", "🧸", "🍓", "🍊", "🍉", "🍍", "🍒", "🍪", "🧁", "🍦", "🐻", "🦁", "🐼", "🐸", "🐬", "🦄", "🦕", "🐞", "🐣", "🐙", "🌈", "🌻", "🌷", "💎", "🎁", "🚂", "🚀", "🪁", "🐢", "🐱"];
export const emojiFor = (n: number, salt = 0) => EMOJIS[(n + salt) % EMOJIS.length];
export type Stage = { id: string; title: string; icon: string; href: string; topic?: string; range?: [number, number]; background?: string };
// خلفيات صفحات تعلم الأرقام ومراحلها: ضع الصورة المضغوطة المناسبة في public/images ثم حدّث هذا المسار.
export const STAGES: Stage[] = [
  { id: "s1", title: "الْأَرْقَامُ ١–٥", icon: "🌳", href: "/learn/1", range: [1, 5], background: "/images/NUMBER1TO5.webp" },
  { id: "s2", title: "الْأَرْقَامُ ٦–١٠", icon: "🚀", href: "/learn/6", range: [6, 10], background: "/images/NUMBER6TO10.webp" },
  { id: "s3", title: "الْأَرْقَامُ ١١–١٥", icon: "🐠", href: "/learn/11", range: [11, 15], background: "/images/NUMBERS11TO15.webp" },
  { id: "s4", title: "الْأَرْقَامُ ١٦–٢٠", icon: "🐄", href: "/learn/16", range: [16, 20], background: "/images/NUMBERS16TO20.webp" },
  { id: "s5", title: "الْعَدّ", icon: "🔢", href: "/practice/count", topic: "count" },
  { id: "s6", title: "الْمُقَارَنَة", icon: "⚖️", href: "/practice/compare", topic: "compare" },
  { id: "s7", title: "قَبْلُ وَبَعْدُ", icon: "↔️", href: "/practice/neighbors", topic: "neighbors" },
  { id: "s8", title: "الْجَمْع", icon: "➕", href: "/practice/add", topic: "add" },
  { id: "s9", title: "اسْتَمِعْ وَاخْتَر", icon: "🔊", href: "/practice/hear", topic: "hear" },
  { id: "s11", title: "الطَّرْح", icon: "➖", href: "/practice/subtract", topic: "subtract" },
  { id: "s10", title: "الِاخْتِبَارُ الْكَبِير", icon: "🏆", href: "/practice/final", topic: "final" },
];
export const BADGES = [
  { id: "explorer", name: "مكتشف الأرقام", need: 5 }, { id: "friend", name: "صديق الأرقام", need: 15 },
  { id: "counter", name: "سيد العد", need: 30 }, { id: "hero", name: "بطل الأرقام", need: 60 },
];
