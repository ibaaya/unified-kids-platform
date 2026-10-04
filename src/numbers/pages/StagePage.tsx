import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { STAGES, emojiFor } from "../data/content";
import { Dots } from "../components/Objects";
import { NAMES, fmt, loc } from "../lib/arabic";
import { useProgress } from "../lib/progress";
import { pathState, rangeNums } from "../lib/path";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

export function NumbersStagePage() {
  const { id } = useParams<{ id: string }>();
  const [p] = useProgress(); const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const idx = STAGES.findIndex((s) => s.id === id); const s = STAGES[idx];
  if (!ready) return null;
  if (!s?.range) return <NumbersPageFrame><Link to="/numbers/map" className="btn bg-yellow-300">🗺️ الخريطة</Link></NumbersPageFrame>;
  if (!pathState(p).open[idx]) return <NumbersPageFrame><div className="numbers-card text-center"><div className="text-6xl">🔒</div><p className="my-3 text-2xl font-extrabold">أكمل المسار السابق أولًا</p><Link to="/numbers/map" className="btn bg-yellow-300">🗺️ الخريطة</Link></div></NumbersPageFrame>;
  const nums = rangeNums(s); const got = nums.filter((n) => p.learned.includes(n)).length;
  return <NumbersPageFrame background={s.background}>
    <div className="numbers-card mb-3 flex items-center justify-between gap-2 !w-full !max-w-none py-3"><h1 className="text-2xl font-extrabold">{s.icon} {loc(s.title)}</h1><Link to="/numbers/map" className="btn whitespace-nowrap bg-white/80 px-3 py-2 text-sm">🏠 المسار</Link></div>
    <div className="numbers-card mb-4 !w-full !max-w-none py-3"><div className="flex items-center gap-3"><div className="numbers-quiz-progress-bar"><div className="numbers-quiz-progress-fill" style={{ width: `${(got / nums.length) * 100}%` }} /></div><span className="font-bold">{fmt(got, p.eastern)}/{fmt(nums.length, p.eastern)}</span></div></div>
    <div className="numbers-stage-grid grid gap-3">{nums.map((n, k) => { const learned = p.learned.includes(n); const unlocked = p.openAll || k === 0 || learned || p.learned.includes(n - 1); const body = <><span className="numbers-stage-number font-extrabold leading-none text-violet-700">{fmt(n, p.eastern)}</span><span className="text-lg font-extrabold">{NAMES[n]}</span><Dots n={n} e={emojiFor(n)} />{learned && <span className="absolute start-2 top-2 text-2xl">✅</span>}</>; const cls = "numbers-stage-tile relative flex flex-col items-center justify-center gap-1 rounded-3xl border-2 border-white/70 bg-white/78 p-3 text-center shadow-lg backdrop-blur-sm"; return unlocked ? <Link key={n} to={`/numbers/learn/${n}`} className={`${cls} transition hover:-translate-y-1`}>{body}</Link> : <div key={n} className={`${cls} opacity-55`}><span className="text-5xl">🔒</span><span className="text-lg font-extrabold">{NAMES[n]}</span></div>; })}</div>
  </NumbersPageFrame>;
}
