import { useEffect, useState } from "react";
import { setDigits } from "./arabic";

export type Progress = {
  stars: number; learned: number[]; questionCount: 7 | 10; textScale: number; openAll: boolean; openTo: number; sound: boolean; eastern: boolean;
  skills: Record<string, { ok: number; total: number }>; weak: Record<number, number>; last: string; completed: string[];
  finalExamAllowRetry: boolean; finalExamScores: number[]; finalExamFirstTryScores: number[]; finalExamErrors: number[];
};
const KEY = "adad-progress-v1";
const EMPTY: Progress = { questionCount: 7, textScale: 1, openAll: true, openTo: 0, stars: 0, learned: [], sound: true, eastern: false, skills: {}, weak: {}, last: "", completed: [], finalExamAllowRetry: true, finalExamScores: [], finalExamFirstTryScores: [], finalExamErrors: [] };
export const GAME_IDS = ["balloons", "catch", "memory", "train", "house", "maze", "fast", "missing", "bigger", "oddeven", "compare", "numberline"] as const;
const load = (): Progress => { try { const saved = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Progress>; return { ...EMPTY, ...saved, finalExamScores: Array.isArray(saved.finalExamScores) ? saved.finalExamScores.slice(0, 3) : [], finalExamFirstTryScores: Array.isArray(saved.finalExamFirstTryScores) ? saved.finalExamFirstTryScores.slice(0, 3) : [], finalExamErrors: Array.isArray(saved.finalExamErrors) ? saved.finalExamErrors.slice(0, 3) : [], completed: Array.isArray(saved.completed) ? saved.completed.filter((id): id is string => typeof id === "string") : [] }; } catch { return EMPTY; } };
export const readProgressSnapshot = (): Progress => load();
export const markCompleted = (p: Progress, id: string): Progress => p.completed.includes(id) ? p : { ...p, completed: [...p.completed, id] };

// مفتاح broadcast لمزامنة textScale بين المكوّنات في نفس الصفحة
const listeners = new Set<() => void>();
const notifyAll = () => listeners.forEach((fn) => fn());

export function useProgress() {
  const [p, setP] = useState<Progress>(EMPTY);
  useEffect(() => {
    const l = load(); setDigits(l.eastern); setP(l);
    // الاستماع لتحديثات من مكوّنات أخرى في نفس الصفحة
    const sync = () => { const l2 = load(); setDigits(l2.eastern); setP(l2); };
    listeners.add(sync);
    return () => { listeners.delete(sync); };
  }, []);
  const update = (fn: (p: Progress) => Progress) => setP((old) => {
    const n = fn({ ...old });
    setDigits(n.eastern);
    localStorage.setItem(KEY, JSON.stringify(n));
    notifyAll(); // أبلغ جميع المكوّنات بالتحديث
    return n;
  });
  return [p, update] as const;
}
