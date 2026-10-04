import { STAGES } from "../data/content";
import type { Stage } from "../data/content";
import type { Progress } from "./progress";
export const rangeNums = (s: Stage) => (s.range ? Array.from({ length: s.range[1] - s.range[0] + 1 }, (_, i) => s.range![0] + i) : []);
export const stageDone = (s: Stage, p: Progress) => (s.range ? rangeNums(s).every((n) => p.learned.includes(n)) : p.completed.includes(`practice:${s.topic}`) || (p.skills[s.topic!]?.ok ?? 0) >= 5);
export function pathState(p: Progress) {
  const done = STAGES.map((s) => stageDone(s, p)); const first = done.indexOf(false); const current = first === -1 ? STAGES.length - 1 : first;
  const open = STAGES.map((_, i) => p.openAll || i <= Math.max(current, p.openTo ?? 0));
  return { done, open, current };
}
export function resumeHref(p: Progress) {
  const { current } = pathState(p); const s = STAGES[current];
  if (!s.range) return `/numbers${s.href}`; const n = rangeNums(s).find((x) => !p.learned.includes(x));
  return n ? `/numbers/learn/${n}` : `/numbers/stage/${s.id}`;
}
