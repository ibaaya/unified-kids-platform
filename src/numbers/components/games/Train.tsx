
import { useEffect, useState } from "react";
import { fmt, speak } from "../../lib/arabic";
import { uniq, useStar, TRY } from "./shared";
// قطار الأرقام: اضغط العربات من الأصغر إلى الأكبر (٣ قطارات)
export default function Train({ onDone }: { onDone: () => void }) {
  const { p, star } = useStar(); const [round, setRound] = useState(0); const [cars, setCars] = useState(() => uniq(5)); const [placed, setPlaced] = useState<number[]>([]); const [msg, setMsg] = useState("");
  const sorted = [...cars].sort((a, b) => a - b);
  const instruction = "رَتِّبِ الْقِطَارَ مِنَ الْأَصْغَرِ لِلْأَكْبَر";
  useEffect(() => { speak(instruction, p.sound); }, [round, p.sound]);
  const tap = (n: number) => { if (placed.includes(n)) return; if (n !== sorted[placed.length]) { setMsg(TRY); return; } setMsg(""); speak(String(n), false); const pl = [...placed, n]; setPlaced(pl);
    if (pl.length === 5) { star(); setTimeout(() => { if (round + 1 >= p.questionCount) return onDone(); setRound(round + 1); setCars(uniq(5)); setPlaced([]); }, 900); } };
  return (<div className="numbers-card numbers-game-card text-center"><h2 className="flex items-center justify-center gap-2 text-3xl font-extrabold">{instruction} 🚂 <button className="rounded-full bg-sky-100 p-2 text-2xl" aria-label="استمع إلى السؤال" onClick={() => speak(instruction, p.sound)}>🔊</button></h2>
    <div className="my-4 flex min-h-20 flex-wrap items-center justify-center gap-2 text-4xl"><span>🚂</span>{placed.map((n, idx) => <span key={n} className={`numbers-train-car ${idx % 3 === 0 ? "bg-violet-500" : idx % 3 === 1 ? "bg-sky-500" : "bg-emerald-500"}`}>{fmt(n, p.eastern)}<span className="mx-1 text-sm">●</span></span>)}</div>
    <div className="flex flex-wrap justify-center gap-3">{cars.filter((n) => !placed.includes(n)).map((n) => (<button key={n} onClick={() => tap(n)} className="numbers-option max-w-32">{fmt(n, p.eastern)}</button>))}</div>
    <p className="mt-3 h-8 text-2xl">{msg}</p></div>);
}
