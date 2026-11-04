import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompletionActions from "./CompletionActions";
import Objects, { Dots } from "./Objects";
import type { Q } from "../lib/questions";
import { emojiFor } from "../data/content";
import { fmt, loc, NAMES, speak, stopSpeaking } from "../lib/arabic";
import { markCompleted, useProgress } from "../lib/progress";
import "../numbers.css";

const CHEERS = ["أَحْسَنْتَ! ⭐", "مُمْتَاز! 🎉", "رَائِع! 🌟"];
const RETRY  = ["حَاوِلْ مَرَّةً أُخْرَى 😊", "فَكِّرْ قَلِيلًا 🤔", "اقْتَرَبْتَ! جَرِّبْ مُجَدَّدًا 💪"];
type Fb = { ok: boolean; t: string } | null;

type Props = {
  questions: Q[];
  next?: string;
  topic?: string;
  completionId?: string;
  onDone?: () => void;
  onAnswer?: (ok: boolean, question: Q) => void;
  firstAttemptOnly?: boolean;
};

function speechTextFor(q: Q): string {
  if (q.say) return q.say;
  if (q.skill === "compare" && q.groups && q.groups.length >= 2) {
    // اقرأ العددين بنفس ترتيب ظهورهما في المعادلة ذات الاتجاه LTR.
    return `قَارِنْ بَيْنَ ${NAMES[q.groups[0]] ?? q.groups[0]} وَ ${NAMES[q.groups[1]] ?? q.groups[1]}`;
  }
  if (q.skill === "subtract" && q.groups && q.groups.length >= 2) {
    const [minuend, subtrahend] = q.groups;
    return `${NAMES[minuend] ?? minuend} نَاقِصُ ${NAMES[subtrahend] ?? subtrahend} يُسَاوِي كَمْ؟`;
  }
  return q.prompt;
}

export default function Quiz({ questions, next, topic, completionId, onDone, onAnswer, firstAttemptOnly = false }: Props) {
  const [p, up] = useProgress();
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<Fb>(null);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<string | number | null>(null);

  const q = questions[i];

  // نطق السؤال عند الانتقال لسؤال جديد
  useEffect(() => {
    if (!q) return;
    const t = setTimeout(() => {
      speak(speechTextFor(q), p.sound);
    }, 120);
    return () => clearTimeout(t);
  }, [i, p.sound, q]);

  // أوقف التسجيل أو النطق الآلي عند مغادرة التمرين.
  useEffect(() => () => stopSpeaking(), []);

  const advance = () => {
    setFb(null);
    setPicked(null);
    if (i + 1 >= questions.length) {
      if (completionId) up((s) => markCompleted(s, completionId));
      if (onDone) onDone();
      else setDone(true);
    } else {
      setI((x) => x + 1);
    }
  };

  const pick = (v: string | number) => {
    if (!q || fb) return;
    stopSpeaking();
    const ok = String(v) === String(q.answer);
    setPicked(v);
    onAnswer?.(ok, q);

    up((s) => {
      const sk = { ...s.skills };
      [q.skill, ...(topic && topic !== q.skill ? [topic] : [])].forEach((k) => {
        const c = sk[k] ?? { ok: 0, total: 0 };
        sk[k] = { ok: c.ok + (ok ? 1 : 0), total: c.total + 1 };
      });
      s.skills = sk;
      s.last = q.skill;
      if (ok) s.stars += 1;
      else if (q.num) s.weak = { ...s.weak, [q.num]: (s.weak[q.num] ?? 0) + 1 };
      return s;
    });

    const retryText = RETRY[i % RETRY.length];
    const feedback = ok ? CHEERS[i % CHEERS.length] : retryText;
    setFb({ ok, t: feedback });
    speak(ok ? "أَحْسَنْتَ" : "حاول مرة أخرى", p.sound);
  };

  // إعادة المحاولة على نفس السؤال — لا ننتقل
  const retryQuestion = () => {
    setFb(null);
    setPicked(null);
    // لا نعيد تشغيل صوت السؤال تلقائيًا أثناء تفاعل الطفل؛ يمكنه استخدام زر الاستماع.
  };

  if (!questions.length) return <div className="numbers-card text-center">لا توجد أسئلة متاحة.</div>;
  if (done) return (
    <div className="numbers-card text-center">
      <div className="text-6xl">🎉</div>
      <h2 className="my-3 text-3xl font-extrabold">أَنْهَيْتَ التَّدْرِيب!</h2>
      <CompletionActions nextHref={next ?? "/numbers/map"} replayLabel="🔄 إِعَادَة" onReplay={() => { setI(0); setDone(false); }} />
    </div>
  );

  const sep = q.skill === "add" ? "+" : q.skill === "subtract" ? "−" : "؟";
  const progress = ((i + 1) / questions.length) * 100;

  const optionClass = (o: { value: string | number }) => {
    const base = "numbers-option";
    if (!fb) return base;
    const isWrong = picked !== null && String(o.value) === String(picked) && !fb.ok;

    if (fb.ok) {
      const isCorrect = String(o.value) === String(q.answer);
      if (isCorrect) return `${base} !bg-emerald-100 !border-emerald-400 !text-emerald-700`;
      return `${base} opacity-50`;
    }

    if (isWrong) return `${base} !bg-red-100 !border-red-400 !text-red-600`;
    return base;
  };

  const optionsDisabled = !!fb && (fb.ok || firstAttemptOnly);

  // ——— حالة الزر السفلي ———
  // - عند الصح: زر "التالي" (أو "إنهاء" في السؤال الأخير)
  // - عند الخطأ العادي: زر "حاول مرة أخرى" + إمكانية تجربة خيار آخر
  // - عند الخطأ في firstAttemptOnly: زر "التالي" مباشرة
  const isLast = i + 1 >= questions.length;

  return (
    <div className="numbers-card numbers-quiz-card text-center">
      {/* شريط التقدم */}
      <div className="numbers-quiz-progress">
        <div className="numbers-quiz-progress-bar" aria-label={`السؤال ${i + 1} من ${questions.length}`}>
          <div className="numbers-quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-base font-bold text-slate-600">{fmt(i + 1, p.eastern)}/{fmt(questions.length, p.eastern)}</span>
      </div>

      {/* نص السؤال */}
      <h2 className={`${q.skill === "missing" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"} font-extrabold leading-relaxed`}>
        {q.skill === "missing"
          ? loc(q.prompt).split("؟").map((part, index, all) =>
              <Fragment key={index}>{part}{index < all.length - 1 && <span className="mx-2 inline-block rounded-2xl bg-amber-200 px-3 py-1 text-amber-700">؟</span>}</Fragment>)
          : loc(q.prompt)}
        <button
          type="button"
          aria-label="اسْتَمِع"
          className="mx-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-200 text-xl"
          onClick={() => speak(speechTextFor(q), p.sound)}
        >🔊</button>
      </h2>

      {/* الرقم الكبير */}
      {q.big && <div className="my-3 text-7xl font-extrabold leading-none text-violet-600">{fmt(q.big, p.eastern)}</div>}

      {/* منطقة العرض */}
      {q.groups && (
        q.skill === "compare"
          ? (
            <div dir="ltr" className="my-4 flex flex-nowrap items-center justify-center gap-4 rounded-3xl bg-sky-50 p-4 sm:gap-10 sm:p-6">
              <span className="shrink-0 text-6xl font-extrabold tabular-nums text-slate-800 sm:text-8xl">
                {fmt(q.groups[0], p.eastern)}
              </span>
              <span className="shrink-0 rounded-2xl border-2 border-violet-300 bg-white px-3 py-2 text-4xl font-extrabold text-violet-400 shadow sm:text-6xl">
                ☐
              </span>
              <span className="shrink-0 text-6xl font-extrabold tabular-nums text-slate-800 sm:text-8xl">
                {fmt(q.groups[1], p.eastern)}
              </span>
            </div>
          )
          : (
            <div className="my-4 flex flex-wrap items-center justify-center gap-4 rounded-3xl bg-sky-50 p-3 sm:p-5">
              {q.groups.map((g, k) => (
                <Fragment key={k}>
                  {k > 0 && <span className="shrink-0 text-4xl font-extrabold text-violet-500 sm:text-6xl">{sep}</span>}
                  <Objects n={g} salt={k * 3 + i} e={q.emoji} />
                </Fragment>
              ))}
            </div>
          )
      )}
      {q.skill === "compare" && q.groups && fb && (fb.ok || firstAttemptOnly) && (
        <p dir="rtl" className="mx-auto my-3 w-fit rounded-xl bg-violet-50 px-4 py-2 text-lg font-extrabold text-violet-800" aria-live="polite">
          {q.answer === ">" ? "العدد على اليسار أكبر من العدد على اليمين." : q.answer === "<" ? "العدد على اليسار أصغر من العدد على اليمين." : "العددان متساويان."}
        </p>
      )}

      {/* خيارات الإجابة */}
      <div className="numbers-option-grid">
        {q.options.map((o, index) => {
          const isMathSymbol = typeof o.value === "string" && [">", "<", "="].includes(o.value);
          return (
            <button
              type="button"
              key={`${String(o.value)}-${index}`}
              className={optionClass(o)}
              onClick={() => pick(o.value)}
              disabled={optionsDisabled}
              dir={isMathSymbol ? "ltr" : undefined}
              style={isMathSymbol ? { unicodeBidi: "isolate" } : undefined}
            >
              {o.count
                ? <Dots n={o.count} e={emojiFor(q.num ?? 0)} />
                : typeof o.value === "number"
                  ? fmt(o.value, p.eastern)
                  : isMathSymbol && o.label
                    ? <><span dir="rtl">{loc(o.label)}</span><bdi dir="ltr" className="mx-1">{o.value}</bdi></>
                  : loc(String(o.label ?? o.value))}
            </button>
          );
        })}
      </div>

      {/* منطقة التغذية الراجعة + أزرار الإجراء */}
      <div className="mt-4 min-h-20" aria-live="polite">
        {fb && (
          <div className={`flex flex-col items-center gap-3 rounded-2xl px-4 py-3 ${fb.ok ? "bg-emerald-50" : "bg-amber-50"}`}>
            <p className={`text-xl font-extrabold ${fb.ok ? "text-emerald-700" : "text-amber-700"}`}>
              {fb.t}{q.skill === "compare" ? (fb.ok ? " العلامة صحيحة." : firstAttemptOnly ? " تم تسجيل إجابتك الأولى." : " اختر علامة أخرى بعد إعادة المحاولة.") : ""}
            </p>

            {/* ✅ عند الصح: زر "التالي" يدوي */}
            {fb.ok && (
              <button
                type="button"
                onClick={advance}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:scale-105 hover:bg-emerald-600"
              >
                {isLast ? "إنهاء التمرين" : "السؤال التالي ←"}
              </button>
            )}

            {/* عند الخطأ في وضع firstAttemptOnly: زر "التالي" مباشرة */}
            {!fb.ok && firstAttemptOnly && (
              <button
                type="button"
                onClick={advance}
                className="flex items-center gap-2 rounded-2xl bg-violet-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:scale-105 hover:bg-violet-600"
              >
                {isLast ? "إنهاء التمرين" : "السؤال التالي ←"}
              </button>
            )}

            {/* عند الخطأ العادي: زر "حاول مرة أخرى" — يبقى على نفس السؤال */}
            {!fb.ok && !firstAttemptOnly && (
              <button
                type="button"
                onClick={retryQuestion}
                className="flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 text-base font-extrabold text-white shadow transition hover:scale-105 hover:bg-amber-500"
              >
                🔄 حَاوِلْ مَرَّةً أُخْرَى
              </button>
            )}
          </div>
        )}
      </div>

      {/* رابط مراجعة رقم ضعيف */}
      {q.num && (p.weak[q.num] ?? 0) >= 3 && (
        <Link className="text-lg font-bold text-violet-600 underline" to={`/numbers/learn/${q.num}`}>
          لِنُرَاجِعِ الرَّقْمَ {fmt(q.num, p.eastern)} معًا
        </Link>
      )}
    </div>
  );
}
