
import { useEffect, useState } from "react";
import { fmt, speak } from "../../lib/arabic";
import { emojiFor } from "../../data/content";
import { Dots } from "../Objects";
import { shuffle, uniq, useStar, TRY } from "./shared";
// بيت الرقم: اسحب الرقم إلى البيت الذي يحمل العدد نفسه من الأشياء (أو اضغط الرقم ثم البيت لمن لا يستطيع السحب)
export default function House({ onDone }: { onDone: () => void }) {
  const { p, star } = useStar(); const praise = ["أَحْسَنْتَ", "مُمْتَازٌ", "رَائِعٌ"] as const; const [praiseIndex, setPraiseIndex] = useState(0); const [round, setRound] = useState(0); const [nums, setNums] = useState(() => uniq(3, 1, 10)); const [done, setDone] = useState<number[]>([]); const [sel, setSel] = useState<number | null>(null); const [msg, setMsg] = useState("");
  const [order, setOrder] = useState(() => shuffle([0, 1, 2]));
  const instruction = "اِسْحَبِ الرَّقْمَ إِلَى الْبَيْتِ الَّذِي فِيهِ نَفْسُ الْعَدَدِ مِنَ الْأَشْيَاءِ، أَوِ اضْغَطِ الرَّقْمَ ثُمَّ الْبَيْت";
  useEffect(() => { speak(instruction, p.sound); }, [p.sound]);
  const place = (n: number, h: number) => { if (done.includes(n)) return; if (n !== h) { setMsg(TRY); speak(TRY, p.sound); return; } const d = [...done, n]; const cheer = praise[praiseIndex % praise.length]; setPraiseIndex((index) => index + 1); setMsg(`${cheer}! ⭐`); speak(cheer, p.sound); star(); setDone(d); setSel(null);
    if (d.length === 3) setTimeout(() => { if (round + 1 >= p.questionCount) return onDone(); const nn = uniq(3, 1, 10); setRound(round + 1); setNums(nn); setDone([]); setOrder(shuffle([0, 1, 2])); setMsg(""); }, 900); };
  return (<div className="numbers-card numbers-game-card text-center"><h2 className="text-3xl font-extrabold">ضَعِ الرَّقْمَ فِي بَيْتِه 🏠 <button aria-label="استمع إلى التعليمات" onClick={() => speak(instruction, p.sound)}>🔊</button></h2><p className="mx-auto my-2 max-w-3xl font-bold text-slate-600">اسحب الرقم إلى البيت الذي يحتوي العدد نفسه من الأشياء، أو اضغط الرقم ثم البيت.</p>
    <div className="my-4 grid grid-cols-3 gap-3">{order.map((i) => { const n = nums[i]; return (<button key={n} data-house={n} onClick={() => sel !== null && place(sel, n)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const raw = e.dataTransfer.getData("text/plain"); const dragged = Number(raw); if (Number.isFinite(dragged)) place(dragged, n); }} className="rounded-2xl bg-orange-100 p-2 shadow">🏠<Dots n={n} e={emojiFor(n)} />{done.includes(n) && <div className="text-5xl font-extrabold text-grape">{fmt(n, p.eastern)}</div>}</button>); })}</div>
    <div className="flex flex-wrap justify-center gap-4">{nums.filter((n) => !done.includes(n)).map((n, i) => (<button key={n} draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(n)); setSel(n); }} onDragEnd={(e) => { const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-house]"); if (el) place(n, Number(el.getAttribute("data-house"))); setSel(null); }} onClick={() => setSel(n)} className={`flex h-16 w-16 touch-none cursor-grab items-center justify-center rounded-2xl border-4 border-white text-4xl font-black shadow-lg active:cursor-grabbing ${sel === n ? "scale-110 bg-violet-600 text-white ring-4 ring-violet-200" : ["bg-amber-300","bg-sky-300","bg-emerald-300"][i%3]}`}>{fmt(n, p.eastern)}</button>))}</div>
    <p className="mt-3 h-8 text-2xl">{msg}</p></div>);
}
