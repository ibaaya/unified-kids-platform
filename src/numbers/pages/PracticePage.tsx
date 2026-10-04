import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Quiz from "../components/Quiz";
import { makeFinalSets, makeSet } from "../lib/questions";
import { fmt } from "../lib/arabic";
import { markCompleted, readProgressSnapshot, useProgress } from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

type Level = { id: "easy" | "medium" | "hard"; title: string; range: [number, number] };
const LEVELS: Level[] = [
  { id: "easy", title: "المستوى السهل", range: [1, 10] },
  { id: "medium", title: "المستوى المتوسط", range: [1, 15] },
  { id: "hard", title: "المستوى الصعب", range: [1, 20] },
];

function OperationLesson({ subtract, eastern, onStart }: { subtract: boolean; eastern: boolean; onStart: () => void }) {
  const first = subtract ? 6 : 3; const change = 2; const answer = subtract ? first - change : first + change; const fruit = "🍎";
  return <div className="numbers-card text-center"><div className="text-5xl">{subtract ? "➖" : "➕"}</div><h1 className="my-2 text-3xl font-extrabold text-violet-700">{subtract ? "نَتَعَلَّمُ الطَّرْحَ" : "نَتَعَلَّمُ الْجَمْعَ"}</h1>
    <p className="mb-4 text-xl font-bold">{subtract ? "الطرح يعني أن نأخذ أشياء من المجموعة، ثم نعدّ ما بقي." : "الجمع يعني أن نضمّ مجموعتين معًا، ثم نعدّ الأشياء كلها."}</p>
    <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <div className="rounded-3xl bg-sky-100 p-3"><p className="font-extrabold">{subtract ? "لدينا" : "في السلة"} {fmt(first, eastern)}</p><div className="my-2 flex flex-wrap justify-center text-3xl">{Array.from({ length: first }, (_, i) => <span key={i}>{fruit}</span>)}</div></div>
      <span className="text-4xl font-extrabold text-violet-600">{subtract ? "−" : "+"}</span>
      <div className="rounded-3xl bg-amber-100 p-3"><p className="font-extrabold">{subtract ? "نأخذ" : "نضيف"} {fmt(change, eastern)}</p><div className="my-2 flex justify-center text-3xl">{Array.from({ length: change }, (_, i) => <span key={i}>{fruit}</span>)}</div></div>
      <span className="text-4xl font-extrabold text-emerald-600">➡️</span>
      <div className="rounded-3xl bg-emerald-100 p-3"><p className="font-extrabold">{subtract ? "بقي" : "أصبح لدينا"} {fmt(answer, eastern)}</p><div className="my-2 flex flex-wrap justify-center text-3xl">{Array.from({ length: answer }, (_, i) => <span key={i}>{fruit}</span>)}</div></div>
    </div>
    <p dir="ltr" className="my-4 text-3xl font-extrabold text-orange-600">{fmt(first, eastern)} {subtract ? "−" : "+"} {fmt(change, eastern)} = {fmt(answer, eastern)}</p>
    <button type="button" className="btn numbers-action-button mx-auto bg-emerald-400 text-white" onClick={onStart}>هَيَّا نَتَدَرَّب ▶</button></div>;
}

function FinalExam({ onExit }: { onExit: () => void }) {
  const savedExam = useMemo(() => readProgressSnapshot(), []);
  const [level, setLevel] = useState(Math.min(savedExam.finalExamScores.length, 3));
  const [scores, setScores] = useState<number[]>(savedExam.finalExamScores);
  const [firstTryScores, setFirstTryScores] = useState<number[]>(savedExam.finalExamFirstTryScores);
  const [errors, setErrors] = useState<number[]>(savedExam.finalExamErrors);
  const [showResult, setShowResult] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultFirstTry, setResultFirstTry] = useState(0);
  const [resultErrors, setResultErrors] = useState(0);
  const [p, up] = useProgress();
  const allQuestions = useMemo(() => makeFinalSets(10), []);
  const scoreRef = useRef(0);
  const firstTryRef = useRef(0);
  const errorsRef = useRef(0);
  const attemptsRef = useRef<Record<string, number>>({});
  const current = LEVELS[level];
  const questions = level < LEVELS.length ? allQuestions[level] : [];

  const finishLevel = () => {
    const finalScore = scoreRef.current;
    const finalFirstTryScore = firstTryRef.current;
    const finalErrors = errorsRef.current;
    setResultScore(finalScore);
    setResultFirstTry(finalFirstTryScore);
    setResultErrors(finalErrors);
    setScores((old) => [...old.slice(0, level), finalScore]);
    setFirstTryScores((old) => [...old.slice(0, level), finalFirstTryScore]);
    setErrors((old) => [...old.slice(0, level), finalErrors]);
    scoreRef.current = 0;
    firstTryRef.current = 0;
    errorsRef.current = 0;
    attemptsRef.current = {};
    up((state) => {
      const next = { ...state,
      finalExamScores: [...state.finalExamScores.slice(0, level), finalScore],
      finalExamFirstTryScores: [...state.finalExamFirstTryScores.slice(0, level), finalFirstTryScore],
      finalExamErrors: [...state.finalExamErrors.slice(0, level), finalErrors],
      };
      return level === 2 ? markCompleted(next, "practice:final") : next;
    });
    setShowResult(true);
  };

  if (showResult && level < LEVELS.length) {
    const score = resultScore;
    const lastLevel = level === LEVELS.length - 1;
    return <div className="numbers-card text-center numbers-result-card">
       <div className="text-5xl">{score >= 8 ? ["🌟", "🏅", "👑"][level] : score >= 5 ? "👏" : "📚"}</div>
      <h1 className="my-3 text-3xl font-extrabold">نَتِيجَةُ {current.title}</h1>
      <div className="numbers-level-score">{fmt(score, p.eastern)} <span>/ {fmt(10, p.eastern)}</span></div>
      <p className="my-3 text-xl font-bold">أَجَبْتَ إِجَابَةً صَحِيحَةً عَنْ {fmt(score, p.eastern)} مِنْ ١٠.</p>
       <div className="grid gap-3 sm:grid-cols-2 mb-5">
         <div className="rounded-2xl bg-emerald-50 p-4 font-bold">🏅 شارة {['المبتدئ','المتوسط','المتقدم'][level]} · {['⭐','🏅','👑'][level]}</div>
         <div className="rounded-2xl bg-amber-50 p-4 font-bold">إجابات المحاولة الأولى الصحيحة: {fmt(resultFirstTry, p.eastern)} · أخطاء: {fmt(resultErrors, p.eastern)}</div>
       </div>
      <div className="mx-auto mb-5 max-w-xl rounded-2xl bg-sky-50 p-4 text-lg font-bold">
        {score >= 8 ? "ممتاز! يمكنك الانتقال للمستوى التالي." : score >= 5 ? "جيد! راجع بعض المهارات ثم واصل." : "لنراجع هذا المستوى بهدوء ثم نواصل."}
      </div>
      <button type="button" className="numbers-next-button" onClick={() => {
        if (lastLevel) setLevel(LEVELS.length);
        else { setLevel((x) => x + 1); setShowResult(false); }
      }}>{lastLevel ? "عرض النتيجة النهائية ▶" : "الانتقال إلى المستوى التالي ▶"}</button>
    </div>;
  }

  if (level >= LEVELS.length) {
    const finalScores = scores.length === 3 ? scores : [...scores, 0, 0, 0].slice(0, 3);
    const finalFirstTry = firstTryScores.length === 3 ? firstTryScores : [...firstTryScores, 0, 0, 0].slice(0, 3);
    const finalErrors = errors.length === 3 ? errors : [...errors, 0, 0, 0].slice(0, 3);
    const total = finalScores.reduce((a, b) => a + b, 0);
    const totalFirstTry = finalFirstTry.reduce((a, b) => a + b, 0);
    const totalErrors = finalErrors.reduce((a, b) => a + b, 0);
    const best = finalScores.indexOf(Math.max(...finalScores));
    const weakest = finalScores.indexOf(Math.min(...finalScores));
    return <div className="numbers-card text-center numbers-result-card">
      <div className="text-6xl">🏆</div>
      <h1 className="my-3 text-3xl font-extrabold">النَّتِيجَةُ النِّهَائِيَّة</h1>
      <p className="mb-5 text-xl font-bold">أَنْهَيْتَ الْمُسْتَوَيَاتِ الثَّلَاثَةَ كُلَّهَا.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {LEVELS.map((x, i) => <div key={x.id} className="numbers-level-result"><b>{x.title}</b><div className="mt-1 text-3xl font-extrabold">{fmt(finalScores[i] ?? 0, p.eastern)}/١٠</div><div className="mt-2 text-sm font-bold text-emerald-700">أولى: {fmt(finalFirstTry[i] ?? 0, p.eastern)} · أخطاء: {fmt(finalErrors[i] ?? 0, p.eastern)}</div></div>)}
      </div>
      <p className="my-5 text-3xl font-extrabold text-emerald-700">المجموع: {fmt(total, p.eastern)}/٣٠ · {Math.round(total / 30 * 100)}%</p>
      <p className="mb-3 text-xl font-extrabold">{total >= 27 ? "مستوى متميز 🌟" : total >= 21 ? "مستوى جيد جدًا 🏅" : total >= 15 ? "مستوى جيد 👏" : "نواصل التدريب خطوة خطوة 📚"}</p>
      <p className="mb-5 text-lg font-extrabold">المحاولة الأولى: {fmt(totalFirstTry, p.eastern)}/٣٠ · الأخطاء: {fmt(totalErrors, p.eastern)}</p>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-4 font-bold">💪 المستوى الأعلى: {LEVELS[best]?.title}</div>
        <div className="rounded-2xl bg-amber-50 p-4 font-bold">📚 يحتاج مراجعة أكثر: {LEVELS[weakest]?.title}</div>
      </div>
      <button type="button" className="numbers-next-button" onClick={onExit}>العودة إلى مسار المغامرة</button>
    </div>;
  }

  return <div className="numbers-final-level">
    <div className="numbers-card text-center">
      <div className="text-xl font-extrabold">{current.title}</div>
      <p className="mt-1 text-sm text-slate-600">المستوى {fmt(level + 1, p.eastern)} من ٣ · ١٠ أسئلة متنوعة</p>
    </div>
    <Quiz key={level} questions={questions} topic={`final-${current.id}`} firstAttemptOnly={!p.finalExamAllowRetry} onAnswer={(ok, question) => {
      const key = String(questions.indexOf(question));
      const previous = attemptsRef.current[key] ?? 0;
      if (previous === 0) { if (ok) { scoreRef.current += 1; firstTryRef.current += 1; } else errorsRef.current += 1; }
      else if (!ok) errorsRef.current += 1;
      attemptsRef.current[key] = previous + 1;
  }} onDone={finishLevel} />
  </div>;
}

export function NumbersPracticePage() {
  const { topic: topicStr } = useParams<{ topic: string }>();
  const topic = topicStr!;
  const [p] = useProgress(); const [started, setStarted] = useState(false);
  const size = p.questionCount;
  const learnedKey = p.learned.join(",");
  const learned = useMemo(() => learnedKey ? learnedKey.split(",").map(Number) : [], [learnedKey]);
  const qs = useMemo(() => makeSet(topic, size, learned), [topic, size, learned]);
  if (topic === "final") return <NumbersPageFrame><FinalExam onExit={() => window.location.assign("/numbers/map")} /></NumbersPageFrame>;
  if ((topic === "add" || topic === "subtract") && !started) return <NumbersPageFrame><OperationLesson subtract={topic === "subtract"} eastern={p.eastern} onStart={() => setStarted(true)} /></NumbersPageFrame>;
  if (topic === "compare" && !started) return <NumbersPageFrame><div className="numbers-card text-center"><div className="text-5xl">⚖️</div><h1 className="my-3 text-3xl font-extrabold text-violet-700">نَتَعَلَّمُ عَلامَاتِ الْمُقَارَنَة</h1><p className="mb-5 text-xl">ننظر إلى العددين من اليسار إلى اليمين، ثم نختار العلامة المناسبة:</p><div className="grid gap-3 sm:grid-cols-3">{[[5, "<", 7, "العدد الأيسر أصغر من العدد الأيمن"],[10, ">", 9, "العدد الأيسر أكبر من العدد الأيمن"],[4, "=", 4, "العددان متساويان"]].map(([a, sign, b, meaning]) => <div key={`${a}${sign}${b}`} className="rounded-3xl bg-sky-50 p-4"><div dir="ltr" className="flex items-center justify-center gap-3 text-4xl font-extrabold"><span>{fmt(Number(a), p.eastern)}</span><span>{sign}</span><span>{fmt(Number(b), p.eastern)}</span></div><p dir="rtl" className="mt-2 text-lg font-extrabold">{meaning}</p></div>)}</div><button className="btn numbers-action-button mx-auto mt-6 bg-emerald-400 text-white" onClick={() => setStarted(true)}>هَيَّا نَتَدَرَّب ▶</button></div></NumbersPageFrame>;
  return <NumbersPageFrame><Quiz key={`${topic}-${size}-${learnedKey}`} questions={qs} next="/numbers/map" topic={topic} completionId={`practice:${topic}`} /></NumbersPageFrame>;
}
