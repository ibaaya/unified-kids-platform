import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Quiz from "../components/Quiz";
import { makeFinalSets, makeSet } from "../lib/questions";
import { fmt } from "../lib/arabic";
import {
  markCompleted,
  readProgressSnapshot,
  useProgress,
} from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

type Level = {
  id: "easy" | "medium" | "hard";
  title: string;
  range: [number, number];
};

const LEVELS: Level[] = [
  { id: "easy", title: "المستوى السهل", range: [1, 10] },
  { id: "medium", title: "المستوى المتوسط", range: [1, 15] },
  { id: "hard", title: "المستوى الصعب", range: [1, 20] },
];

/* =========================================================
   درس الجمع / الطرح
========================================================= */

function OperationLesson({
  subtract,
  eastern,
  onStart,
}: {
  subtract: boolean;
  eastern: boolean;
  onStart: () => void;
}) {
  const first = subtract ? 6 : 3;
  const change = 2;
  const answer = subtract ? first - change : first + change;
  const fruit = "🍎";

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/85 p-4 text-center shadow-[0_15px_45px_rgba(71,85,105,0.13)] backdrop-blur-xl sm:p-6">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-emerald-200/25 blur-3xl" />

      <div className="relative">

        {/* Header */}
        <div className="mb-5">
          <div
            className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-[1.7rem] border-2 border-white text-5xl shadow-lg ${
              subtract
                ? "bg-gradient-to-br from-rose-100 to-orange-100"
                : "bg-gradient-to-br from-emerald-100 to-cyan-100"
            }`}
          >
            {subtract ? "➖" : "➕"}
          </div>

          <div className="mb-1 text-xs font-black tracking-wide text-violet-500">
            🌟 لِنَتَعَلَّمْ مَعًا
          </div>

          <h1 className="text-2xl font-black text-violet-800 sm:text-4xl">
            {subtract
              ? "نَتَعَلَّمُ الطَّرْحَ"
              : "نَتَعَلَّمُ الْجَمْعَ"}
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm font-bold leading-7 text-slate-600 sm:text-lg">
            {subtract
              ? "الطرح يعني أن نأخذ أشياء من المجموعة، ثم نعدّ ما بقي."
              : "الجمع يعني أن نضمّ مجموعتين معًا، ثم نعدّ الأشياء كلها."}
          </p>
        </div>

        {/* Example */}
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">

          {/* First group */}
          <div className="relative overflow-hidden rounded-[1.7rem] border border-white bg-sky-50/90 p-4 shadow-md">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-sky-400" />

            <p className="text-sm font-black text-sky-700 sm:text-base">
              {subtract ? "لدينا" : "في السلة"}
            </p>

            <div className="mt-1 text-2xl font-black text-slate-800">
              {fmt(first, eastern)}
            </div>

            <div className="my-3 flex min-h-[70px] flex-wrap items-center justify-center gap-1 text-3xl">
              {Array.from({ length: first }, (_, i) => (
                <span key={i}>{fruit}</span>
              ))}
            </div>
          </div>

          {/* Operator */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-3xl font-black text-violet-700 shadow-sm">
            {subtract ? "−" : "+"}
          </div>

          {/* Change */}
          <div className="relative overflow-hidden rounded-[1.7rem] border border-white bg-amber-50/90 p-4 shadow-md">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-amber-400" />

            <p className="text-sm font-black text-amber-700 sm:text-base">
              {subtract ? "نأخذ" : "نضيف"}
            </p>

            <div className="mt-1 text-2xl font-black text-slate-800">
              {fmt(change, eastern)}
            </div>

            <div className="my-3 flex min-h-[70px] items-center justify-center gap-1 text-3xl">
              {Array.from({ length: change }, (_, i) => (
                <span key={i}>{fruit}</span>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl shadow-sm">
            ➡️
          </div>

          {/* Result */}
          <div className="relative overflow-hidden rounded-[1.7rem] border border-white bg-emerald-50/90 p-4 shadow-md">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-emerald-400" />

            <p className="text-sm font-black text-emerald-700 sm:text-base">
              {subtract ? "بقي" : "أصبح لدينا"}
            </p>

            <div className="mt-1 text-2xl font-black text-slate-800">
              {fmt(answer, eastern)}
            </div>

            <div className="my-3 flex min-h-[70px] flex-wrap items-center justify-center gap-1 text-3xl">
              {Array.from({ length: answer }, (_, i) => (
                <span key={i}>{fruit}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Equation */}
        <div
          dir="ltr"
          className="mx-auto my-5 inline-flex rounded-2xl border border-white bg-white/90 px-5 py-3 text-2xl font-black text-orange-600 shadow-md sm:text-3xl"
        >
          {fmt(first, eastern)} {subtract ? "−" : "+"}{" "}
          {fmt(change, eastern)} = {fmt(answer, eastern)}
        </div>

        <div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-7 py-3.5 text-base font-black text-white shadow-[0_8px_22px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 sm:px-9 sm:text-lg"
            onClick={onStart}
          >
            هَيَّا نَتَدَرَّب ▶
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   الاختبار النهائي
========================================================= */

function FinalExam({ onExit }: { onExit: () => void }) {
  const savedExam = useMemo(() => readProgressSnapshot(), []);

  const [level, setLevel] = useState(
    Math.min(savedExam.finalExamScores.length, 3)
  );

  const [scores, setScores] = useState<number[]>(
    savedExam.finalExamScores
  );

  const [firstTryScores, setFirstTryScores] = useState<number[]>(
    savedExam.finalExamFirstTryScores
  );

  const [errors, setErrors] = useState<number[]>(
    savedExam.finalExamErrors
  );

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

    setScores((old) => [
      ...old.slice(0, level),
      finalScore,
    ]);

    setFirstTryScores((old) => [
      ...old.slice(0, level),
      finalFirstTryScore,
    ]);

    setErrors((old) => [
      ...old.slice(0, level),
      finalErrors,
    ]);

    scoreRef.current = 0;
    firstTryRef.current = 0;
    errorsRef.current = 0;
    attemptsRef.current = {};

    up((state) => {
      const next = {
        ...state,
        finalExamScores: [
          ...state.finalExamScores.slice(0, level),
          finalScore,
        ],
        finalExamFirstTryScores: [
          ...state.finalExamFirstTryScores.slice(0, level),
          finalFirstTryScore,
        ],
        finalExamErrors: [
          ...state.finalExamErrors.slice(0, level),
          finalErrors,
        ],
      };

      return level === 2
        ? markCompleted(next, "practice:final")
        : next;
    });

    setShowResult(true);
  };

  /* =======================================================
     نتيجة المستوى
  ======================================================= */

  if (showResult && level < LEVELS.length) {
    const score = resultScore;
    const lastLevel = level === LEVELS.length - 1;

    return (
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/88 p-5 text-center shadow-[0_15px_45px_rgba(71,85,105,0.13)] backdrop-blur-xl sm:p-7">

        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-emerald-200/20 blur-3xl" />

        <div className="relative">

          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-white bg-gradient-to-br from-amber-100 to-yellow-100 text-6xl shadow-lg">
            {score >= 8
              ? ["🌟", "🏅", "👑"][level]
              : score >= 5
              ? "👏"
              : "📚"}
          </div>

          <div className="mb-1 text-xs font-black text-violet-500">
            🎯 نَتِيجَةُ الْمُسْتَوَى
          </div>

          <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
            {current.title}
          </h1>

          <div className="mx-auto my-5 flex w-fit items-end gap-2 rounded-[1.7rem] border border-white bg-gradient-to-br from-violet-50 to-purple-100 px-7 py-4 shadow-md">
            <span className="text-5xl font-black text-violet-700">
              {fmt(score, p.eastern)}
            </span>
            <span className="mb-1 text-xl font-black text-slate-400">
              / {fmt(10, p.eastern)}
            </span>
          </div>

          <p className="mb-5 text-base font-bold text-slate-600 sm:text-xl">
            أَجَبْتَ إِجَابَةً صَحِيحَةً عَنْ{" "}
            <span className="text-violet-700">
              {fmt(score, p.eastern)}
            </span>{" "}
            مِنْ ١٠.
          </p>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 font-black text-emerald-700 shadow-sm">
              🏅 شارة{" "}
              {["المبتدئ", "المتوسط", "المتقدم"][level]}
              <span className="mx-1">·</span>
              {["⭐", "🏅", "👑"][level]}
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 font-bold text-amber-700 shadow-sm">
              المحاولة الأولى الصحيحة:{" "}
              {fmt(resultFirstTry, p.eastern)}
              <span className="mx-1">·</span>
              الأخطاء: {fmt(resultErrors, p.eastern)}
            </div>
          </div>

          <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-base font-bold leading-7 text-sky-800 shadow-sm">
            {score >= 8
              ? "ممتاز! يمكنك الانتقال للمستوى التالي. 🌟"
              : score >= 5
              ? "جيد! راجع بعض المهارات ثم واصل. 👏"
              : "لنراجع هذا المستوى بهدوء ثم نواصل. 📚"}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-7 py-3.5 text-base font-black text-white shadow-[0_8px_22px_rgba(139,92,246,0.25)] transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 sm:px-9 sm:text-lg"
            onClick={() => {
              if (lastLevel) {
                setLevel(LEVELS.length);
              } else {
                setLevel((x) => x + 1);
                setShowResult(false);
              }
            }}
          >
            {lastLevel
              ? "عرض النتيجة النهائية ▶"
              : "الانتقال إلى المستوى التالي ▶"}
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     النتيجة النهائية
  ======================================================= */

  if (level >= LEVELS.length) {
    const finalScores =
      scores.length === 3
        ? scores
        : [...scores, 0, 0, 0].slice(0, 3);

    const finalFirstTry =
      firstTryScores.length === 3
        ? firstTryScores
        : [...firstTryScores, 0, 0, 0].slice(0, 3);

    const finalErrors =
      errors.length === 3
        ? errors
        : [...errors, 0, 0, 0].slice(0, 3);

    const total = finalScores.reduce((a, b) => a + b, 0);
    const totalFirstTry = finalFirstTry.reduce((a, b) => a + b, 0);
    const totalErrors = finalErrors.reduce((a, b) => a + b, 0);

    const best = finalScores.indexOf(Math.max(...finalScores));
    const weakest = finalScores.indexOf(Math.min(...finalScores));

    return (
      <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/88 p-5 text-center shadow-[0_15px_45px_rgba(71,85,105,0.13)] backdrop-blur-xl sm:p-7">

        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-yellow-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-200/20 blur-3xl" />

        <div className="relative">

          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-[2.2rem] border-2 border-white bg-gradient-to-br from-yellow-100 to-amber-100 text-7xl shadow-lg">
            🏆
          </div>

          <div className="mb-1 text-xs font-black tracking-wide text-amber-500">
            🎉 أَحْسَنْتَ يَا بَطَل!
          </div>

          <h1 className="text-3xl font-black text-slate-800 sm:text-4xl">
            النَّتِيجَةُ النِّهَائِيَّة
          </h1>

          <p className="mt-2 text-base font-bold text-slate-500 sm:text-lg">
            أَنْهَيْتَ الْمُسْتَوَيَاتِ الثَّلَاثَةَ كُلَّهَا.
          </p>

          {/* Levels */}
          <div className="my-7 grid gap-3 sm:grid-cols-3">
            {LEVELS.map((x, i) => (
              <div
                key={x.id}
                className={`relative overflow-hidden rounded-[1.7rem] border border-white p-4 shadow-md ${
                  i === 0
                    ? "bg-sky-50/90"
                    : i === 1
                    ? "bg-violet-50/90"
                    : "bg-amber-50/90"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 ${
                    i === 0
                      ? "bg-sky-400"
                      : i === 1
                      ? "bg-violet-400"
                      : "bg-amber-400"
                  }`}
                />

                <div className="text-sm font-black text-slate-700">
                  {x.title}
                </div>

                <div className="mt-2 text-3xl font-black text-violet-700">
                  {fmt(finalScores[i] ?? 0, p.eastern)}
                  <span className="text-lg text-slate-400">
                    /١٠
                  </span>
                </div>

                <div className="mt-2 text-xs font-bold text-emerald-700">
                  أولى: {fmt(finalFirstTry[i] ?? 0, p.eastern)}
                  <span className="mx-1">·</span>
                  أخطاء: {fmt(finalErrors[i] ?? 0, p.eastern)}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mx-auto mb-5 max-w-xl rounded-[1.7rem] border border-emerald-100 bg-emerald-50/80 p-5 shadow-sm">
            <div className="text-xs font-black text-emerald-600">
              المجموع الكلي
            </div>

            <div className="mt-1 text-4xl font-black text-emerald-700 sm:text-5xl">
              {fmt(total, p.eastern)}
              <span className="text-xl text-slate-400">
                /٣٠
              </span>
            </div>

            <div className="mt-1 text-lg font-black text-emerald-600">
              {Math.round((total / 30) * 100)}%
            </div>
          </div>

          <p className="mb-4 text-xl font-black text-slate-800">
            {total >= 27
              ? "مستوى متميز 🌟"
              : total >= 21
              ? "مستوى جيد جدًا 🏅"
              : total >= 15
              ? "مستوى جيد 👏"
              : "نواصل التدريب خطوة خطوة 📚"}
          </p>

          <p className="mb-6 text-sm font-bold text-slate-500 sm:text-lg">
            المحاولة الأولى: {fmt(totalFirstTry, p.eastern)}
            /٣٠
            <span className="mx-2">·</span>
            الأخطاء: {fmt(totalErrors, p.eastern)}
          </p>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 font-black text-emerald-700 shadow-sm">
              💪 المستوى الأعلى:
              <span className="mx-1">{LEVELS[best]?.title}</span>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 font-black text-amber-700 shadow-sm">
              📚 يحتاج مراجعة أكثر:
              <span className="mx-1">{LEVELS[weakest]?.title}</span>
            </div>

          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-3.5 text-base font-black text-white shadow-[0_8px_22px_rgba(139,92,246,0.25)] transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 sm:text-lg"
            onClick={onExit}
          >
            العودة إلى مسار المغامرة
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     مستوى الاختبار
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-5xl">

      {/* Level Header */}
      <div className="relative mb-4 overflow-hidden rounded-[2rem] border border-white/90 bg-white/85 px-4 py-4 shadow-[0_10px_30px_rgba(71,85,105,0.10)] backdrop-blur-xl sm:px-6 sm:py-5">

        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-200/25 blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-violet-100 to-purple-100 text-3xl shadow-md sm:h-16 sm:w-16 sm:text-4xl">
              {level === 0 ? "⭐" : level === 1 ? "🏅" : "👑"}
            </div>

            <div className="min-w-0">
              <div className="mb-0.5 text-[10px] font-black tracking-wide text-violet-500 sm:text-xs">
                🧠 الاختبار النهائي
              </div>

              <h1 className="truncate text-xl font-black text-slate-800 sm:text-3xl">
                {current.title}
              </h1>

              <p className="mt-0.5 text-xs font-bold text-slate-500 sm:text-sm">
                المستوى {fmt(level + 1, p.eastern)} من ٣ · ١٠ أسئلة متنوعة
              </p>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-white bg-white/90 px-4 py-2 text-center shadow-sm sm:block">
            <div className="text-[10px] font-black text-slate-400">
              الأسئلة
            </div>
            <div className="text-lg font-black text-violet-700">
              {fmt(10, p.eastern)}
            </div>
          </div>
        </div>
      </div>

      <Quiz
        key={level}
        questions={questions}
        topic={`final-${current.id}`}
        firstAttemptOnly={!p.finalExamAllowRetry}
        onAnswer={(ok, question) => {
          const key = String(questions.indexOf(question));
          const previous = attemptsRef.current[key] ?? 0;

          if (previous === 0) {
            if (ok) {
              scoreRef.current += 1;
              firstTryRef.current += 1;
            } else {
              errorsRef.current += 1;
            }
          } else if (!ok) {
            errorsRef.current += 1;
          }

          attemptsRef.current[key] = previous + 1;
        }}
        onDone={finishLevel}
      />
    </div>
  );
}

/* =========================================================
   صفحة التدريب
========================================================= */

export function NumbersPracticePage() {
  const { topic: topicStr } = useParams<{ topic: string }>();
  const topic = topicStr!;

  const [p] = useProgress();
  const [started, setStarted] = useState(false);

  const size = p.questionCount;

  const learnedKey = p.learned.join(",");

  const learned = useMemo(
    () =>
      learnedKey
        ? learnedKey.split(",").map(Number)
        : [],
    [learnedKey]
  );

  const qs = useMemo(
    () => makeSet(topic, size, learned),
    [topic, size, learned]
  );

  /* Final Exam */
  if (topic === "final") {
    return (
      <NumbersPageFrame>
        <FinalExam
          onExit={() =>
            window.location.assign("/numbers/map")
          }
        />
      </NumbersPageFrame>
    );
  }

  /* Addition / subtraction lesson */
  if (
    (topic === "add" || topic === "subtract") &&
    !started
  ) {
    return (
      <NumbersPageFrame>
        <OperationLesson
          subtract={topic === "subtract"}
          eastern={p.eastern}
          onStart={() => setStarted(true)}
        />
      </NumbersPageFrame>
    );
  }

  /* =======================================================
     Comparison lesson
  ======================================================= */

  if (topic === "compare" && !started) {
    return (
      <NumbersPageFrame>
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/85 p-4 text-center shadow-[0_15px_45px_rgba(71,85,105,0.13)] backdrop-blur-xl sm:p-6">

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-violet-200/20 blur-3xl" />

          <div className="relative">

            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.7rem] border-2 border-white bg-gradient-to-br from-sky-100 to-indigo-100 text-5xl shadow-lg">
              ⚖️
            </div>

            <div className="mb-1 text-xs font-black tracking-wide text-sky-500">
              🧠 لِنَتَعَلَّمْ
            </div>

            <h1 className="text-2xl font-black text-violet-800 sm:text-4xl">
              نَتَعَلَّمُ عَلامَاتِ الْمُقَارَنَة
            </h1>

            <p className="mx-auto mb-6 mt-2 max-w-2xl text-sm font-bold leading-7 text-slate-600 sm:text-lg">
              ننظر إلى العددين من اليسار إلى اليمين، ثم نختار العلامة المناسبة.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">

              {[
                [
                  5,
                  "<",
                  7,
                  "العدد الأيسر أصغر من العدد الأيمن",
                ],
                [
                  10,
                  ">",
                  9,
                  "العدد الأيسر أكبر من العدد الأيمن",
                ],
                [
                  4,
                  "=",
                  4,
                  "العددان متساويان",
                ],
              ].map(([a, sign, b, meaning]) => (
                <div
                  key={`${a}${sign}${b}`}
                  className="relative overflow-hidden rounded-[1.7rem] border border-white bg-sky-50/80 p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-sky-400" />

                  <div
                    dir="ltr"
                    className="flex items-center justify-center gap-3 text-3xl font-black text-slate-800 sm:text-4xl"
                  >
                    <span>{fmt(Number(a), p.eastern)}</span>
                    <span className="text-violet-600">
                      {sign}
                    </span>
                    <span>{fmt(Number(b), p.eastern)}</span>
                  </div>

                  <div className="mx-auto my-3 h-px w-16 bg-sky-200" />

                  <p
                    dir="rtl"
                    className="text-sm font-black leading-6 text-slate-600 sm:text-base"
                  >
                    {meaning}
                  </p>
                </div>
              ))}

            </div>

            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-8 py-3.5 text-base font-black text-white shadow-[0_8px_22px_rgba(16,185,129,0.25)] transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 sm:text-lg"
              onClick={() => setStarted(true)}
            >
              هَيَّا نَتَدَرَّب ▶
            </button>
          </div>
        </div>
      </NumbersPageFrame>
    );
  }

  /* =======================================================
     Regular Quiz
  ======================================================= */

  return (
    <NumbersPageFrame>
      <Quiz
        key={`${topic}-${size}-${learnedKey}`}
        questions={qs}
        next="/numbers/map"
        topic={topic}
        completionId={`practice:${topic}`}
      />
    </NumbersPageFrame>
  );
}