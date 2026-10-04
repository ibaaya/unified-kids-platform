import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fmt, NAMES, speak, stopSpeaking } from "../../lib/arabic";
import { r, uniq, shuffle, useStar, TRY } from "./shared";

export default function Fast({ onDone }: { onDone: () => void }) {
  const { p, star } = useStar();
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  const [round, setRound] = useState(0);
  const [opts, setOpts] = useState<number[]>([]);
  const [target, setTarget] = useState(1);
  const [answered, setAnswered] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (round >= p.questionCount) { onDoneRef.current(); return; }
    const choices = uniq(4); const answer = choices[r(0, 3)];
    setOpts(shuffle(choices)); setTarget(answer); setAnswered(null); setMsg(""); setSettled(false);
    speak(`أَيْنَ الرَّقْمُ ${NAMES[answer]}؟`, p.sound);
    const timeout = window.setTimeout(() => {
      setMsg("انتهى الوقت. خذ وقتك، ثم انتقل عندما تكون مستعدًا.");
      setAnswered(answer);
      setSettled(true);
    }, 10000);
    return () => window.clearTimeout(timeout);
  }, [round, p.questionCount, p.sound]);

  const tap = (number: number) => {
    if (settled) return;
    stopSpeaking();
    if (number !== target) { setMsg(TRY); return; }
    star(); setAnswered(number); setMsg("إجابة صحيحة! أحسنت ⭐"); setSettled(true);
  };
  const next = () => setRound((value) => value + 1);

  return <div className="numbers-card numbers-game-card text-center">
    <h2 className="text-3xl font-extrabold">أَيْنَ الرَّقْمُ {fmt(target, p.eastern)}؟ ⚡ <button aria-label="استمع إلى السؤال" onClick={() => speak(`أَيْنَ الرَّقْمُ ${NAMES[target]}؟`, p.sound)}>🔊</button></h2>
    <div className="my-3 h-4 rounded-full bg-slate-200"><motion.div key={round} initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 10, ease: "linear" }} className="h-3 rounded bg-rose-500" /></div>
    <div className="grid grid-cols-2 gap-4">{opts.map((number) => <button key={number} disabled={settled} className={`numbers-option disabled:opacity-70 ${answered === number ? "!border-emerald-400 !bg-emerald-100 !text-emerald-700" : ""}`} onClick={() => tap(number)}>{fmt(number, p.eastern)}</button>)}</div>
    <p className="mt-3 min-h-8 text-xl font-extrabold" aria-live="polite">{msg}</p>
    {settled && <button type="button" className="btn numbers-action-button mx-auto mt-3 bg-emerald-500 text-white" onClick={next}>{round + 1 >= p.questionCount ? "إنهاء اللعبة" : "السؤال التالي ←"}</button>}
  </div>;
}
