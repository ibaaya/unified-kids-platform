
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fmt, NAMES, speak } from "../../lib/arabic";
import { r, useStar, TRY } from "./shared";
// اصْطَدِ الرَّقْمَ: أرقام تسقط ببطء؛ لا خسارة عند تفويت الرقم (بدون ضغط)
type Item = { id: number; n: number; x: number };
export default function Catch({ onDone }: { onDone: () => void }) {
  const { p, star } = useStar(); const [celebrate, setCelebrate] = useState(false); const [items, setItems] = useState<Item[]>([]); const [t, setT] = useState(r(1, 20)); const [score, setScore] = useState(0); const [msg, setMsg] = useState(""); const id = useRef(0); const tRef = useRef(t);
  useEffect(() => { tRef.current = t; speak(`اضغط على الرقم ${NAMES[t]}`, p.sound); }, [t]);
  useEffect(() => { const h = setInterval(() => { const n = Math.random() < 0.35 ? tRef.current : r(1, 20); const it = { id: id.current++, n, x: r(5, 80) }; setItems((a) => [...a.slice(-5), it]); setTimeout(() => setItems((a) => a.filter((x) => x.id !== it.id)), 7000); }, 1300); return () => clearInterval(h); }, []);
  const tap = (it: Item) => { if (it.n !== t) { setMsg(TRY); return; } star(); setCelebrate(true); window.setTimeout(() => setCelebrate(false), 700); setItems((a) => a.filter((x) => x.id !== it.id)); setMsg("أَحْسَنْتَ! ⭐"); if (score + 1 >= p.questionCount) return onDone(); setScore(score + 1); setT(r(1, 20)); };
  return (<div className="numbers-card numbers-game-card text-center"><h2 className="text-3xl font-extrabold">اصْطَدِ الرَّقْمَ {fmt(t, p.eastern)} ({fmt(score, p.eastern)}/{fmt(p.questionCount, p.eastern)}) <button aria-label="اسْتَمِع" onClick={() => speak(`اضْغَطْ عَلَى الرَّقْمِ ${NAMES[t]}`, p.sound)}>🔊</button></h2>
    <div className="relative mt-3 h-80 overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-b from-sky-100 to-amber-50">{items.map((it) => (<motion.button key={it.id} initial={{ y: -60 }} animate={{ y: 380 }} transition={{ duration: 7, ease: "linear" }} style={{ right: `${it.x}%` }} className="absolute h-16 w-16 rounded-full bg-sun text-3xl font-extrabold shadow" onClick={() => tap(it)}>{fmt(it.n, p.eastern)}</motion.button>))}</div>
    <p className="mt-2 h-8 text-2xl">{msg}</p>{celebrate && <div className="numbers-catch-celebration" aria-hidden="true">🎉 ✨ 🌟</div>}</div>);
}
