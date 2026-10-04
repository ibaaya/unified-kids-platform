
import { useEffect, useState } from "react";
import { fmt } from "../../lib/arabic";
import { r, useStar, TRY } from "./shared";
// متاهة الأرقام: مسار متصل داخل شبكة ٤×٤؛ اضغط الأرقام بالترتيب من البداية للنهاية
const S = 4, LEN = 6;
function walk(): number[] { for (;;) { const path = [r(0, S * S - 1)]; while (path.length < LEN) { const c = path[path.length - 1], x = c % S, y = Math.floor(c / S);
    const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && a < S && b >= 0 && b < S).map(([a, b]) => b * S + a).filter((k) => !path.includes(k)); if (!nb.length) break; path.push(nb[r(0, nb.length - 1)]); } if (path.length === LEN) return path; } }
export default function Maze({ onDone }: { onDone: () => void }) {
  const { p, star } = useStar(); const [g, setG] = useState<{ cells: number[]; start: number }>({ cells: [], start: 1 }); const [k, setK] = useState(0); const [round, setRound] = useState(0); const [msg, setMsg] = useState("");
  useEffect(() => { const path = walk(), start = r(1, 14), cells = Array.from({ length: S * S }, () => 0); path.forEach((c, i) => (cells[c] = start + i));
    cells.forEach((v, i) => { if (!v) { let d; do d = r(1, 20); while (d >= start && d < start + LEN); cells[i] = d; } }); setG({ cells, start }); }, []);
  const tap = (v: number) => { if (v !== g.start + k) { setMsg(TRY); return; } setMsg(""); if (k + 1 === LEN) { star(); if (round + 1 >= p.questionCount) return setTimeout(onDone, 500); setTimeout(() => { const path = walk(), start = r(1, 14), cells = Array.from({ length: S * S }, () => 0); path.forEach((c, i) => (cells[c] = start + i)); cells.forEach((v, i) => { if (!v) { let d; do d = r(1, 20); while (d >= start && d < start + LEN); cells[i] = d; } }); setG({ cells, start }); setK(0); setRound((x) => x + 1); }, 500); } else setK(k + 1); };
  return (<div className="numbers-card numbers-game-card text-center"><h2 className="text-3xl font-extrabold">ابْدَأْ مِنْ {fmt(g.start, p.eastern)} وَاتَّبِعِ الْأَرْقَامَ بِالتَّرْتِيب 🧩</h2>
    <div className="mx-auto my-4 grid max-w-xs grid-cols-4 gap-2">{g.cells.map((v, i) => (<button key={i} onClick={() => tap(v)} className={`h-16 rounded-xl text-3xl font-extrabold shadow ${v >= g.start && v < g.start + k ? "bg-emerald-400 text-white" : "border-2 border-violet-200 bg-white"}`}>{fmt(v, p.eastern)}</button>))}</div>
    <p className="h-8 text-2xl">{msg}</p></div>);
}
