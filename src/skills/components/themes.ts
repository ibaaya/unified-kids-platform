import type { ThemeKey } from '../data/types';

// Tailwind يحتاج أسماء الأصناف كاملة وثابتة، لذلك لا نبنيها ديناميكيًا
export const THEMES: Record<ThemeKey, { card: string; chip: string; btn: string }> = {
  amber:   { card: 'bg-amber-50 border-amber-300 hover:bg-amber-100',     chip: 'bg-amber-200 text-amber-900',     btn: 'bg-amber-500 text-white' },
  sky:     { card: 'bg-sky-50 border-sky-300 hover:bg-sky-100',           chip: 'bg-sky-200 text-sky-900',         btn: 'bg-sky-500 text-white' },
  violet:  { card: 'bg-violet-50 border-violet-300 hover:bg-violet-100',  chip: 'bg-violet-200 text-violet-900',   btn: 'bg-violet-500 text-white' },
  pink:    { card: 'bg-pink-50 border-pink-300 hover:bg-pink-100',        chip: 'bg-pink-200 text-pink-900',       btn: 'bg-pink-500 text-white' },
  emerald: { card: 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100', chip: 'bg-emerald-200 text-emerald-900', btn: 'bg-emerald-500 text-white' },
  orange:  { card: 'bg-orange-50 border-orange-300 hover:bg-orange-100',  chip: 'bg-orange-200 text-orange-900',   btn: 'bg-orange-500 text-white' },
  teal:    { card: 'bg-teal-50 border-teal-300 hover:bg-teal-100',        chip: 'bg-teal-200 text-teal-900',       btn: 'bg-teal-500 text-white' },
  indigo:  { card: 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100',  chip: 'bg-indigo-200 text-indigo-900',   btn: 'bg-indigo-500 text-white' },
  rose:    { card: 'bg-rose-50 border-rose-300 hover:bg-rose-100',        chip: 'bg-rose-200 text-rose-900',       btn: 'bg-rose-500 text-white' },
  lime:    { card: 'bg-lime-50 border-lime-300 hover:bg-lime-100',        chip: 'bg-lime-200 text-lime-900',       btn: 'bg-lime-600 text-white' },
  cyan:    { card: 'bg-cyan-50 border-cyan-300 hover:bg-cyan-100',        chip: 'bg-cyan-200 text-cyan-900',       btn: 'bg-cyan-500 text-white' },
  fuchsia: { card: 'bg-fuchsia-50 border-fuchsia-300 hover:bg-fuchsia-100', chip: 'bg-fuchsia-200 text-fuchsia-900', btn: 'bg-fuchsia-500 text-white' },
  blue:    { card: 'bg-blue-50 border-blue-300 hover:bg-blue-100',        chip: 'bg-blue-200 text-blue-900',       btn: 'bg-blue-500 text-white' },
};
