import { Link } from "react-router-dom";
import { STAGES } from "../data/content";
import { useProgress } from "../lib/progress";
import { fmt, loc } from "../lib/arabic";
import { pathState, rangeNums, resumeHref } from "../lib/path";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

// ألوان مختلفة وهادئة — هوية مستقلة لكل مرحلة
const TILE_STYLES = [
  { bg: "rgba(255,248,225,0.94)", accent: "#F59E0B", glow: "rgba(245,158,11,0.22)", icon: "from-amber-300 to-orange-400" },
  { bg: "rgba(230,247,255,0.94)", accent: "#0EA5E9", glow: "rgba(14,165,233,0.20)", icon: "from-sky-300 to-blue-500" },
  { bg: "rgba(229,250,242,0.94)", accent: "#10B981", glow: "rgba(16,185,129,0.20)", icon: "from-emerald-300 to-teal-500" },
  { bg: "rgba(243,238,255,0.95)", accent: "#8B5CF6", glow: "rgba(139,92,246,0.20)", icon: "from-violet-300 to-purple-500" },
  { bg: "rgba(255,237,247,0.95)", accent: "#EC4899", glow: "rgba(236,72,153,0.18)", icon: "from-pink-300 to-rose-500" },
  { bg: "rgba(255,241,231,0.95)", accent: "#F97316", glow: "rgba(249,115,22,0.20)", icon: "from-orange-300 to-red-500" },
  { bg: "rgba(229,250,253,0.95)", accent: "#06B6D4", glow: "rgba(6,182,212,0.20)", icon: "from-cyan-300 to-sky-500" },
  { bg: "rgba(241,251,222,0.95)", accent: "#84CC16", glow: "rgba(132,204,22,0.20)", icon: "from-lime-300 to-green-500" },
  { bg: "rgba(244, 244, 244, 0.98)", accent: "#954383", glow: "rgba(93, 7, 21, 0.18)", icon: "from-rose-300 to-pink-500" },
  { bg: "rgba(235,237,255,0.97)", accent: "#6366F1", glow: "rgba(99,102,241,0.20)", icon: "from-indigo-300 to-violet-500" },
  { bg: "rgba(229,249,246,0.97)", accent: "#14B8A6", glow: "rgba(20,184,166,0.20)", icon: "from-teal-300 to-emerald-500" },
];

export function NumbersMapPage() {
  const [p] = useProgress();
  const { done, open, current } = pathState(p);

  return (
    <NumbersPageFrame background="/images/numbers-bg.webp">

      {/* ——— ترويسة اللعبة ——— */}
      <div
        className="relative w-full overflow-hidden rounded-[2rem] border border-white/90 bg-white/80 px-4 py-6 text-center shadow-[0_14px_35px_rgba(71,85,105,0.12)] backdrop-blur-xl sm:px-6"
      >
        <div className="pointer-events-none absolute -left-10 -top-12 h-28 w-28 rounded-full bg-amber-200/35 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-12 h-32 w-32 rounded-full bg-violet-200/30 blur-2xl" />

        <div className="relative">
          <div className="mb-2 flex items-center justify-center gap-2 text-xs font-extrabold text-violet-600 sm:text-sm">
            <span>✨</span>
            <span>مَغَامَرَةُ الأَرْقَامِ</span>
            <span>✨</span>
          </div>

          <h1 className="text-2xl font-black leading-tight tracking-wide text-slate-800 sm:text-4xl">
            🗺️ مَسَارُ الْمُغَامَرَةِ السِّحْرِيَّةِ
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm font-bold text-slate-500 sm:text-base">
            تعلّم الأرقام واكتشف مغامرة جديدة في كل مرحلة 🌟
          </p>

          <div className="mt-5">
            <Link
              to={resumeHref(p)}
              className="numbers-action-button group inline-flex items-center gap-2.5 rounded-2xl border-2 border-white/80 bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-base font-black text-white shadow-[0_8px_22px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(16,185,129,0.30)] active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-lg"
            >
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-0.5">
                ▶
              </span>
              <span>تَابِعْ مِنْ حَيْثُ تَوَقَّفْتَ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ——— شبكة المسارات التفاعلية ——— */}
      <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {STAGES.map((s, idx) => {
          const got = rangeNums(s).filter((n) => p.learned.includes(n)).length;
          const total = rangeNums(s).length;
          const style = TILE_STYLES[idx % TILE_STYLES.length];
          const isOpen = open[idx];
          const isCurrent = idx === current;
          const isDone = done[idx];
          const needsAllNumbers = s.topic === "final" && Array.from({ length: 20 }, (_, i) => i + 1).some((n) => !p.learned.includes(n));
          const tileIsOpen = isOpen && !needsAllNumbers;
          const href = s.range ? `/numbers/stage/${s.id}` : `/numbers${s.href}`;

          const tileStyle: React.CSSProperties = {
            background: tileIsOpen ? style.bg : "rgba(241,245,249,0.86)",
            borderColor: isCurrent
              ? `${style.accent}55`
              : "rgba(255,255,255,0.92)",
            borderWidth: isCurrent ? "2px" : "1px",
            borderStyle: "solid",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow:
              tileIsOpen && isCurrent
                ? `0 0 0 3px ${style.accent}30, 0 12px 30px ${style.glow}`
                : tileIsOpen
                ? `0 7px 22px ${style.glow}`
                : "0 4px 14px rgba(51,65,85,0.07)",
          };

          const inner = (
            <div className="flex h-full w-full flex-col items-center justify-between gap-2 p-3 pt-5 sm:min-h-[178px] sm:p-4 sm:pt-6">

              {/* أيقونة المرحلة */}
              <div
                className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.15rem] border-2 border-white/85 text-3xl shadow-[0_7px_16px_rgba(15,23,42,0.12)] transition-transform duration-300 sm:h-16 sm:w-16 ${
                  isCurrent ? "scale-105 animate-pulse" : ""
                } ${
                  tileIsOpen
                    ? `bg-gradient-to-br ${style.icon}`
                    : "bg-slate-300/80 grayscale"
                }`}
              >
                <span className="drop-shadow-sm">
                  {tileIsOpen ? s.icon : "🔒"}
                </span>

                {isCurrent && (
                  <span
                    className="absolute -right-2 -top-2 rounded-full border-2 border-white bg-white px-1.5 py-0.5 text-[9px] font-black shadow-sm"
                    style={{ color: style.accent }}
                  >
                    الآن
                  </span>
                )}
              </div>

              {/* اسم المرحلة */}
              <div className="flex min-h-9 items-center justify-center">
                <span
                  className={`px-1 text-center text-sm font-black leading-snug sm:text-base ${
                    tileIsOpen ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {loc(s.title)}

                  {isDone && (
                    <span className="ms-1.5 inline-block align-middle text-base text-emerald-600 sm:text-lg">
                      ✓
                    </span>
                  )}
                </span>
              </div>

              {/* التقدم */}
              {s.range && tileIsOpen && !isDone && total > 0 && (
                <div className="mt-1 w-full px-0.5">
                  <div className="mb-1.5 flex items-center justify-between px-0.5 text-[10px] font-black text-slate-500 sm:text-[11px]">
                    <span>الإنجاز</span>

                    <span className="rounded-lg border border-white/80 bg-white/75 px-1.5 py-0.5 text-slate-600 shadow-sm">
                      {fmt(got, p.eastern)} / {fmt(total, p.eastern)}
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/80 bg-white/65 p-[2px] shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm transition-all duration-700"
                      style={{
                        width: `${Math.round((got / total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* مكتملة */}
              {isDone && (
                <div className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-[10px] font-black text-emerald-700 shadow-sm sm:text-xs">
                  🎉 اكتملت المرحلة
                </div>
              )}

              {/* مقفلة */}
              {!tileIsOpen && (
                <div className="rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1 text-[9px] font-bold text-slate-400 shadow-sm sm:text-[10px]">
                  🔒 أكمل السابقة أولًا
                </div>
              )}
            </div>
          );

          const tileClass =
            "relative block min-h-[148px] w-full overflow-hidden rounded-[1.6rem] text-center transition-all duration-300 sm:min-h-[178px] " +
            (tileIsOpen
              ? "cursor-pointer hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-2xl active:scale-[0.99]"
              : "cursor-not-allowed opacity-75");

          const topBar = (
            <div
              className="absolute inset-x-0 top-0 h-1.5 rounded-t-[1.6rem]"
              style={{
                background: tileIsOpen
                  ? style.accent
                  : "rgba(148,163,184,0.35)",
              }}
            />
          );

          return (
            <li key={s.id} className="list-none">
              {tileIsOpen ? (
                <Link
                  to={href}
                  className={tileClass}
                  style={tileStyle}
                >
                  {topBar}
                  {inner}
                </Link>
              ) : (
                <div
                  className={tileClass}
                  style={tileStyle}
                >
                  {topBar}
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>

    </NumbersPageFrame>
  );
}
