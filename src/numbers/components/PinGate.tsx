
import { useEffect, useState } from "react";
import { fmt } from "../lib/arabic";
import { hasUnlockedParentSession, unlockParentSession } from "../../app/parentSession";
// بوابة ولي الأمر: مسألة ضرب بسيطة بدل الرمز (تمنع الطفل الصغير فقط، وليست أمانًا حقيقيًا)
const mk = () => ({ a: 3 + Math.floor(Math.random() * 7), b: 3 + Math.floor(Math.random() * 7) });
export default function PinGate({ children }: { children: React.ReactNode }) {
  const [q, setQ] = useState<{ a: number; b: number } | null>(null); const [ok, setOk] = useState(hasUnlockedParentSession); const [v, setV] = useState(""); const [bad, setBad] = useState(false);
  useEffect(() => setQ(mk()), []);
  if (ok) return <>{children}</>; if (!q) return null;
  const go = () => { const w = v.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))); if (+w === q.a * q.b) { unlockParentSession(); setOk(true); } else { setBad(true); setQ(mk()); setV(""); } };
  return (<div className="numbers-card text-center"><h2 className="text-2xl font-extrabold">👨‍👩‍👧 لَوْحَةُ وَلِيِّ الْأَمْر</h2><p className="my-2">أَجِبْ لِلدُّخُول:</p>
    <p className="text-5xl font-extrabold text-violet-600">{fmt(q.a)} × {fmt(q.b)} = ؟</p>
    <input dir="ltr" inputMode="numeric" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} className="my-3 w-32 rounded-2xl border-4 border-violet-200 p-2 text-center text-3xl" />
    <div><button className="btn bg-emerald-400 text-white" onClick={go}>دُخُول</button></div>{bad && <p className="mt-2 text-amber-600">حَاوِلْ مَرَّةً أُخْرَى</p>}</div>);
}
