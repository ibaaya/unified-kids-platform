import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fmt, NAMES, speak } from "../lib/arabic";
import { r } from "../components/games/shared";
import { markCompleted, useProgress } from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

const newQ = () => ({ a: r(1, 5), b: r(1, 4) });

export function NumberLinePage() {
  const [p, up] = useProgress();
  const [q, setQ] = useState(newQ);
  const [pos, setPos] = useState(q.a);
  const [hop, setHop] = useState(0);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current !== null) window.clearInterval(timerRef.current); }, []);
  const jump = () => {
    if (busy) return;
    setBusy(true);
    setPos(q.a);
    setHop(0);
    let step = 0;
    timerRef.current = window.setInterval(() => {
      step += 1;
      const nextPosition = q.a + step;
      setPos(nextPosition);
      setHop(step);
      speak(NAMES[nextPosition], p.sound);
      if (step >= q.b) {
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setBusy(false);
        if (round + 1 >= p.questionCount) up((state) => markCompleted(state, "game:numberline"));
      }
    }, 850);
  };
  const next = () => {
    const nextQuestion = newQ();
    setQ(nextQuestion);
    setPos(nextQuestion.a);
    setHop(0);
    setRound((value) => value + 1);
  };
  const complete = hop === q.b;
  const done = complete && round + 1 >= p.questionCount;

  return (
    <NumbersPageFrame background="/images/numbers-bg.webp">
      <div className="numbers-card text-center">
        <h1 className="text-2xl font-extrabold">🐇 خَطُّ الْأَعْدَاد</h1>
        <div dir="ltr" className="my-3 flex items-center justify-center gap-2 text-4xl font-extrabold text-violet-600">
          <span dir="ltr">{fmt(q.a, p.eastern)}</span><span>+</span><span dir="ltr">{fmt(q.b, p.eastern)}</span><span>=</span><span dir="ltr">{complete ? fmt(q.a + q.b, p.eastern) : "?"}</span>
        </div>
        <p className="mb-2 min-h-8 text-lg font-extrabold text-emerald-700">{hop > 0 ? `القفزة ${fmt(hop, p.eastern)}` : "ابدأ من الرقم الملوّن واقفز إلى اليمين"}</p>

        <div dir="ltr" className="relative mx-auto mt-16 max-w-3xl px-2">
          <div className="absolute -top-14 z-10 transition-[left] duration-700 ease-out" style={{ left: `calc((${pos} + .5) * 100% / 11)`, transform: "translateX(-50%)" }} aria-label={`الأرنب عند الرقم ${pos}`}>
            <span className="numberline-rabbit" role="img" aria-label="أرنب يقفز">🐇</span>
          </div>
          <div className="absolute left-[4.55%] right-[4.55%] top-4 h-2 rounded-full bg-slate-400" />
          <div className="relative grid grid-cols-11 text-center text-base font-extrabold">
            {Array.from({ length: 11 }, (_, i) => <span key={i} className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full transition-colors ${i === pos ? "bg-violet-600 text-white ring-4 ring-violet-200" : i > q.a && i <= pos ? "bg-emerald-400 text-white" : "bg-white/85"}`}>{fmt(i, p.eastern)}</span>)}
          </div>
        </div>

        <p className="mt-5 text-xl font-extrabold">المطلوب: ابدأ من {fmt(q.a, p.eastern)} واقفز {fmt(q.b, p.eastern)} {q.b === 1 ? "قفزة" : "قفزات"}</p>
        <div className="mt-4 flex justify-center gap-3">
          {!complete && <button className="btn numbers-action-button bg-emerald-400 text-white" onClick={jump} disabled={busy}>🐇 اقْفِزْ</button>}
          {complete && !done && <button className="btn numbers-action-button bg-yellow-300" onClick={next}>التَّالِي</button>}
          {done && <span className="btn bg-emerald-400 text-white">أَحْسَنْتَ! أَكْمَلْتَ {fmt(p.questionCount, p.eastern)} جَوْلَات ⭐</span>}
        </div>
        <Link to="/numbers/games" className="mt-4 inline-block underline">عودة</Link>
      </div>
    </NumbersPageFrame>
  );
}
