import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Objects from "../components/Objects";
import Quiz from "../components/Quiz";
import CompletionActions from "../components/CompletionActions";
import Trace from "../components/Trace";
import { STAGES } from "../data/content";
import { NAMES, fmt, loc, speak } from "../lib/arabic";
import { learnSet } from "../lib/questions";
import { useProgress } from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

function TypeStep({ n, onOk }: { n: number; onOk: () => void }) {
  const [v, setV] = useState(""); const [ok, setOk] = useState<boolean | null>(null);
  const check = () => { const w = v.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))); setOk(w !== "" && +w === n); };
  return <div className="numbers-card text-center"><h2 className="text-2xl font-extrabold">اُكْتُبِ الرَّقْمَ بِلَوْحَةِ الْمَفَاتِيح ⌨️</h2><div className="my-3 text-7xl font-extrabold text-violet-200">{fmt(n)}</div><input autoFocus dir="ltr" inputMode="numeric" maxLength={2} value={v} onChange={(e) => { setV(e.target.value); setOk(null); }} onKeyDown={(e) => e.key === "Enter" && check()} className="w-36 rounded-3xl border-4 border-violet-300 p-2 text-center text-5xl font-extrabold outline-none focus:border-violet-500" /><div className="mt-3 min-h-10 text-xl font-extrabold">{ok === true && "أَحْسَنْتَ! ⭐"}{ok === false && "حَاوِلْ مَرَّةً أُخْرَى 😊"}</div>{ok ? <button className="btn numbers-action-button bg-emerald-400 text-white" onClick={onOk}>تَمْرِين ▶</button> : <button className="btn numbers-action-button bg-yellow-300" onClick={check}>تَحَقَّقْ ✓</button>}</div>;
}

export function NumbersLearnPage() {
  const { n: nStr } = useParams<{ n: string }>(); const n = Math.min(20, Math.max(1, +(nStr || 1)));
  const [p, up] = useProgress(); const [step, setStep] = useState(0);
  const qs = useMemo(() => learnSet(n, p.questionCount), [n, p.questionCount]);
  const st = STAGES.find((s) => s.range && n >= s.range[0] && n <= s.range[1]);
  useEffect(() => { setStep(0); speak(NAMES[n], p.sound); }, [n]);
  useEffect(() => { if (step === 4) up((s) => ({ ...s, learned: Array.from(new Set([...s.learned, n])) })); }, [step]);
  if (!st?.range) return <NumbersPageFrame><div className="numbers-card text-center">الرقم غير متاح.</div></NumbersPageFrame>;
  const last = n === st.range[1];
  return <NumbersPageFrame background={st.background}>
    <div className="mb-3 flex justify-start"><Link to={`/numbers/stage/${st.id}`} className="btn bg-white/80 px-3 py-2 text-sm">🏠 مَسَارُ الْمُغَامَرَة</Link></div>
    {step === 0 && <div className="numbers-card text-center"><button className="text-8xl font-extrabold leading-none text-violet-600" onClick={() => speak(NAMES[n], p.sound)}>{fmt(n, p.eastern)}</button><div className="my-2 text-2xl font-extrabold">{NAMES[n]} <button aria-label="اسْتَمِع" onClick={() => speak(NAMES[n], p.sound)}>🔊</button></div><div className="my-4 rounded-3xl bg-sky-50/85 p-3"><Objects n={n} onTap={(i) => speak(NAMES[i], p.sound)} /></div><button className="btn numbers-action-button bg-yellow-300" onClick={() => setStep(1)}>✏️ تَتَبَّعِ الرَّقْم</button></div>}
    {step === 1 && <div className="numbers-card"><Trace n={n}/><div className="mt-3 text-center"><button className="btn numbers-action-button bg-emerald-400 text-white" onClick={() => setStep(2)}>اُكْتُبْهُ ⌨️</button></div></div>}
    {step === 2 && <TypeStep n={n} onOk={() => setStep(3)} />}
    {step === 3 && <Quiz questions={qs} onDone={() => setStep(4)} topic="learn" />}
    {step === 4 && <div className="numbers-card text-center"><div className="text-6xl">✅</div><h2 className="my-3 text-3xl font-extrabold">أَنْهَيْتَ الرَّقْمَ {fmt(n, p.eastern)}!</h2>{last && <p className="mb-3 text-xl">🏆 {loc(st.title)}</p>}<CompletionActions nextHref={last ? `/numbers/challenge/${st.id}` : `/numbers/learn/${n + 1}`} nextLabel={last ? "🎮 تَحَدِّي الْمَجْمُوعَة ▶" : "التَّالِي ▶"} replayLabel="🔄 إِعَادَة" onReplay={() => setStep(0)} /><Link to={`/numbers/stage/${st.id}`} className="mt-3 inline-block font-bold text-violet-700 underline">العودة إلى أرقام هذه المرحلة</Link></div>}
  </NumbersPageFrame>;
}
