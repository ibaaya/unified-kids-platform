
import { useState } from "react";
import { fmt } from "../../lib/arabic";
import { shuffle, uniq, useStar } from "./shared";
import { emojiFor } from "../../data/content";
import { Dots } from "../Objects";
// ذاكرة الأرقام: طَابِقِ الرَّقْمَ مَعَ الْكَمِّيَّة المناسبة (٦ أزواج)
type Card = { key: string; n: number; kind: "num" | "qty" };
const deal = (): Card[] => shuffle(uniq(6, 1, 10).flatMap((n) => [{ key: `a${n}`, n, kind: "num" as const }, { key: `b${n}`, n, kind: "qty" as const }]));
export default function Memory({ onDone }: { onDone: () => void }) {
  const { p, star } = useStar(); const [round, setRound] = useState(0); const [cards, setCards] = useState(deal); const [open, setOpen] = useState<string[]>([]); const [won, setWon] = useState<number[]>([]);
  const flip = (c: Card) => { if (open.length === 2 || open.includes(c.key) || won.includes(c.n)) return; const o = [...open, c.key]; setOpen(o);
    if (o.length === 2) { const [a, b] = o.map((k) => cards.find((x) => x.key === k)!); setTimeout(() => { if (a.n === b.n && a.kind !== b.kind) { star(); const w = [...won, a.n]; setWon(w); if (w.length === 6) { if (round + 1 >= p.questionCount) onDone(); else { setRound((x) => x + 1); setCards(deal()); setWon([]); } } } setOpen([]); }, 900); } };
  return (<div className="numbers-card numbers-game-card text-center"><h2 className="mb-3 text-3xl font-extrabold">طَابِقِ الرَّقْمَ مَعَ الْكَمِّيَّة 🧠</h2>
    <div className="grid grid-cols-3 gap-3">{cards.map((c) => { const show = open.includes(c.key) || won.includes(c.n); return (<button key={c.key} onClick={() => flip(c)} className={`min-h-28 p-1 rounded-2xl text-2xl font-extrabold shadow ${show ? "bg-yellow-100" : "bg-grape text-white"}`}>
      {show ? (c.kind === "num" ? <span className="text-5xl">{fmt(c.n, p.eastern)}</span> : <Dots n={c.n} e={emojiFor(c.n)} />) : "؟"}</button>); })}</div></div>);
}
