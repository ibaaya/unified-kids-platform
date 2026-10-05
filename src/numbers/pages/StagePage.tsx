import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { STAGES, emojiFor } from "../data/content";
import { Dots } from "../components/Objects";
import { NAMES, fmt, loc } from "../lib/arabic";
import { useProgress } from "../lib/progress";
import { pathState, rangeNums } from "../lib/path";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

export function NumbersStagePage() {
  const { id } = useParams<{ id: string }>();
  const [p] = useProgress();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const idx = STAGES.findIndex((s) => s.id === id);
  const s = STAGES[idx];

  if (!ready) return null;

  if (!s?.range) {
    return (
      <NumbersPageFrame>
        <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/90 bg-white/85 p-6 text-center shadow-[0_15px_40px_rgba(71,85,105,0.12)] backdrop-blur-xl">
          <div className="mb-4 text-6xl">🗺️</div>
          <p className="mb-5 text-xl font-black text-slate-800">
            هذه المرحلة غير متاحة
          </p>
          <Link
            to="/numbers/map"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-3 font-black text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
          >
            🗺️ العودة إلى الخريطة
          </Link>
        </div>
      </NumbersPageFrame>
    );
  }

  if (!pathState(p).open[idx]) {
    return (
      <NumbersPageFrame>
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/85 p-7 text-center shadow-[0_15px_40px_rgba(71,85,105,0.14)] backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-100/90 text-6xl shadow-inner">
            🔒
          </div>

          <p className="mb-2 text-2xl font-black text-slate-800">
            المرحلة مقفلة
          </p>

          <p className="mb-6 text-base font-bold leading-relaxed text-slate-500">
            أكمل المسار السابق أولًا لتفتح هذه المغامرة 🌟
          </p>

          <Link
            to="/numbers/map"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-3 font-black text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)] transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
          >
            🗺️ العودة إلى الخريطة
          </Link>
        </div>
      </NumbersPageFrame>
    );
  }

  const nums = rangeNums(s);
  const got = nums.filter((n) => p.learned.includes(n)).length;
  const progress = nums.length ? Math.round((got / nums.length) * 100) : 0;

  return (
    <NumbersPageFrame background={s.background}>

      {/* ——— ترويسة المرحلة ——— */}
      <div className="relative mb-4 w-full overflow-hidden rounded-[2rem] border border-white/90 bg-white/82 px-4 py-4 shadow-[0_12px_30px_rgba(71,85,105,0.11)] backdrop-blur-xl sm:px-6 sm:py-5">

        <div
          className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full opacity-40 blur-2xl"
          style={{ background: "rgba(139,92,246,0.25)" }}
        />

        <div className="relative flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-violet-100 to-purple-100 text-3xl shadow-md sm:h-16 sm:w-16 sm:text-4xl">
              {s.icon}
            </div>

            <div className="min-w-0">
              <div className="mb-0.5 text-[10px] font-black tracking-wide text-violet-500 sm:text-xs">
                🌟 مَغَامَرَةٌ جَدِيدَة
              </div>

              <h1 className="truncate text-xl font-black leading-tight text-slate-800 sm:text-3xl">
                {loc(s.title)}
              </h1>
            </div>
          </div>

          <Link
            to="/numbers/map"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-2xl border border-white bg-white/90 px-3 py-2 text-xs font-black text-violet-700 shadow-md transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg active:scale-95 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">الخريطة</span>
          </Link>
        </div>
      </div>

      {/* ——— شريط التقدم ——— */}
      <div className="mb-5 w-full rounded-[1.7rem] border border-white/90 bg-white/80 px-4 py-3.5 shadow-[0_8px_25px_rgba(71,85,105,0.09)] backdrop-blur-xl sm:px-5">

        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-600 sm:text-sm">
            <span>⭐</span>
            <span>تقدّمك في المغامرة</span>
          </div>

          <span className="rounded-xl border border-white bg-white/90 px-2.5 py-1 text-xs font-black text-emerald-600 shadow-sm sm:text-sm">
            {fmt(got, p.eastern)} / {fmt(nums.length, p.eastern)}
          </span>
        </div>

        <div className="relative h-3.5 w-full overflow-hidden rounded-full border border-white/80 bg-slate-200/70 p-[2px] shadow-inner">
          <div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-sm transition-all duration-700"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20" />
          </div>
        </div>

        <div className="mt-1.5 text-center text-[10px] font-bold text-slate-400">
          {progress === 100
            ? "🎉 أحسنت! أكملت جميع الأرقام"
            : `${fmt(progress, p.eastern)}٪ من المرحلة مكتمل`}
        </div>
      </div>

      {/* ——— شبكة الأرقام ——— */}
      <div className="numbers-stage-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
        {nums.map((n, k) => {
          const learned = p.learned.includes(n);
          const unlocked =
            p.openAll ||
            k === 0 ||
            learned ||
            p.learned.includes(n - 1);

          const body = (
            <>
              {/* شارة الإنجاز */}
              {learned && (
                <span className="absolute end-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-sm shadow-md sm:end-3 sm:top-3">
                  ✓
                </span>
              )}

              {/* الرقم */}
              <span
                className={`numbers-stage-number font-black leading-none transition-transform duration-300 ${
                  unlocked
                    ? "text-violet-700"
                    : "text-slate-400"
                } text-4xl drop-shadow-sm sm:text-5xl`}
              >
                {fmt(n, p.eastern)}
              </span>

              {/* اسم الرقم */}
              <span
                className={`text-center text-sm font-black sm:text-lg ${
                  unlocked ? "text-slate-800" : "text-slate-500"
                }`}
              >
                {NAMES[n]}
              </span>

              {/* تمثيل بصري */}
              <div
                className={`my-1 rounded-2xl border border-white/80 px-2.5 py-1.5 shadow-inner ${
                  unlocked
                    ? "bg-slate-50/80"
                    : "bg-slate-100/70"
                }`}
              >
                <Dots n={n} e={emojiFor(n)} />
              </div>

              {/* مؤشر جاهزية */}
              {unlocked && !learned && (
                <span className="rounded-full bg-violet-50/90 px-2.5 py-1 text-[9px] font-black text-violet-500 sm:text-[10px]">
                  ابدأ الآن ✨
                </span>
              )}

              {learned && (
                <span className="rounded-full bg-emerald-50/90 px-2.5 py-1 text-[9px] font-black text-emerald-600 sm:text-[10px]">
                  تم التعلم 🎉
                </span>
              )}
            </>
          );

          const cls =
            "numbers-stage-tile relative flex min-h-[175px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.7rem] border border-white/90 bg-white/85 p-3 text-center shadow-[0_8px_22px_rgba(71,85,105,0.10)] backdrop-blur-md transition-all duration-300 sm:min-h-[200px] sm:p-4";

          return unlocked ? (
            <Link
              key={n}
              to={`/numbers/learn/${n}`}
              className={`${cls} cursor-pointer hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_16px_32px_rgba(71,85,105,0.16)] active:translate-y-0 active:scale-[0.98]`}
            >
              {/* لمعة علوية */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 rounded-t-[1.7rem] bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-80" />

              {body}
            </Link>
          ) : (
            <div
              key={n}
              className={`${cls} cursor-not-allowed border-slate-200/80 bg-slate-100/70 opacity-70 grayscale-[20%]`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 rounded-t-[1.7rem] bg-slate-300/70" />

              <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/80 text-4xl shadow-inner">
                🔒
              </span>

              <span className="text-sm font-black text-slate-500 sm:text-lg">
                {NAMES[n]}
              </span>

              <span className="rounded-full bg-white/70 px-3 py-1 text-[9px] font-bold text-slate-400 sm:text-[10px]">
                أكمل الرقم السابق أولًا
              </span>
            </div>
          );
        })}
      </div>

    </NumbersPageFrame>
  );
}