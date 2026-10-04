import { Link } from "react-router-dom";
import { STAGES } from "../data/content";
import { useProgress } from "../lib/progress";
import { fmt, loc } from "../lib/arabic";
import { pathState, rangeNums, resumeHref } from "../lib/path";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

// ألوان مختلفة تماماً — لا تكرار (11 لوناً فريداً لـ 11 مرحلة)
// كل لون يحتوي: bg (خلفية شفافة) + accent (شريط علوي + حدود الحالة)
const TILE_STYLES = [
  { bg: "rgba(251,191,36,0.22)",  accent: "#f59e0b", glow: "rgba(245,158,11,0.30)", icon: "from-amber-300  to-orange-400" },
  { bg: "rgba(56,189,248,0.22)",  accent: "#0ea5e9", glow: "rgba(14,165,233,0.30)",  icon: "from-sky-400    to-blue-500"   },
  { bg: "rgba(52,211,153,0.22)",  accent: "#10b981", glow: "rgba(16,185,129,0.30)", icon: "from-emerald-400 to-teal-500"  },
  { bg: "rgba(196,181,253,0.22)", accent: "#8b5cf6", glow: "rgba(139,92,246,0.30)", icon: "from-violet-400  to-purple-600" },
  { bg: "rgba(244,114,182,0.22)", accent: "#ec4899", glow: "rgba(236,72,153,0.30)", icon: "from-pink-400    to-rose-500"  },
  { bg: "rgba(251,146,60,0.22)",  accent: "#f97316", glow: "rgba(249,115,22,0.30)", icon: "from-orange-400  to-red-500"   },
  { bg: "rgba(34,211,238,0.22)",  accent: "#06b6d4", glow: "rgba(6,182,212,0.30)",  icon: "from-cyan-400   to-sky-500"   },
  { bg: "rgba(163,230,53,0.22)",  accent: "#84cc16", glow: "rgba(132,204,22,0.30)", icon: "from-lime-400   to-green-500" },
  { bg: "rgba(251,113,133,0.22)", accent: "#f43f5e", glow: "rgba(244,63,94,0.30)",  icon: "from-rose-400   to-pink-600"  },
  { bg: "rgba(99,102,241,0.22)",  accent: "#6366f1", glow: "rgba(99,102,241,0.30)", icon: "from-indigo-400  to-violet-500"},
  { bg: "rgba(20,184,166,0.22)",  accent: "#14b8a6", glow: "rgba(20,184,166,0.30)", icon: "from-teal-400   to-emerald-600"},
];

export function NumbersMapPage() {
  const [p] = useProgress();
  const { done, open, current } = pathState(p);

  return (
    <NumbersPageFrame background="/images/numbers-bg.webp">

      {/* ——— ترويسة ——— */}
      <div
        className="numbers-card !w-full !max-w-none py-4 text-center"
        style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(14px)" }}
      >
        <h1 className="text-3xl font-extrabold text-violet-800">🗺️ مَسَارُ الْمُغَامَرَة</h1>
        <div className="mt-3">
          <Link
            to={resumeHref(p)}
            className="numbers-action-button inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-500"
          >
            ▶ تَابِعْ مِنْ حَيْثُ تَوَقَّفْتَ
          </Link>
        </div>
      </div>

      {/* ——— شبكة المسارات ——— */}
      {/*
        grid-cols-4 → أربعة مربعات في كل سطر
        gap-2.5 → مسافة مناسبة
        كل li: بدون aspect-square (ارتفاع أقصر)، ونستخدم min-h لتحديد الارتفاع
      */}
      <ol className="mt-4 grid grid-cols-4 gap-2.5">
        {STAGES.map((s, idx) => {
          const got    = rangeNums(s).filter((n) => p.learned.includes(n)).length;
          const total  = rangeNums(s).length;
          const style  = TILE_STYLES[idx % TILE_STYLES.length];
          const isOpen = open[idx];
          const isCurrent = idx === current;
          const isDone    = done[idx];
          const href = s.range ? `/numbers/stage/${s.id}` : `/numbers${s.href}`;

          /* الحدود الخارجية: بيضاء دائماً لجميع المربعات، مع حواف ناعمة */
          const tileStyle: React.CSSProperties = {
            background:     isOpen ? style.bg : "rgba(148,163,184,0.12)",
            borderColor:    "rgba(255,255,255,0.85)",   // ← أبيض لجميع المربعات
            borderWidth:    "2px",
            borderStyle:    "solid",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: isOpen && isCurrent
              ? `0 0 0 2px ${style.accent}, 0 6px 18px ${style.glow}`
              : isOpen
              ? `0 3px 12px ${style.glow}`
              : "0 2px 8px rgba(0,0,0,0.06)",
          };

          /* المحتوى الداخلي مشترك بين Link و div */
          const inner = (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 pt-3 pb-1.5">

              {/* أيقونة دائرية — أكبر */}
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-2xl shadow-md sm:h-12 sm:w-12 sm:text-3xl ${
                  isCurrent ? "animate-bounce" : ""
                } ${isOpen ? `bg-gradient-to-br ${style.icon}` : "bg-slate-300/60"}`}
              >
                {isOpen ? s.icon : "🔒"}
              </div>

              {/* اسم المرحلة — أكبر */}
              <span
                className={`text-center text-sm font-extrabold leading-tight sm:text-base ${
                  isOpen ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {loc(s.title)}
                {isDone && <span className="ms-0.5 text-emerald-500">✅</span>}
              </span>

              {/* شريط تقدم — فقط للمراحل الرقمية غير المكتملة */}
              {s.range && isOpen && !isDone && total > 0 && (
                <div className="w-full px-0.5">
                  <div className="mb-0.5 text-center text-[9px] font-bold text-slate-500">
                    {fmt(got, p.eastern)}/{fmt(total, p.eastern)}
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/50">
                    <div
                      className="h-1 rounded-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.round((got / total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );

          /* كلاس المربع — border-2 لجعل الأبيض ظاهراً، rounded-2xl لحواف ناعمة
             min-h لتقليل الارتفاع (بدلاً من aspect-square) */
          const tileClass =
            "relative block min-h-[92px] w-full overflow-hidden rounded-3xl border-2 text-center transition-all duration-200 sm:min-h-[160px] " +
            (isOpen
              ? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl active:scale-95"
              : "cursor-not-allowed opacity-55");

          /* شريط لوني في أعلى المربع */
          const topBar = (
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{
                background: isOpen ? style.accent : "rgba(148,163,184,0.35)",
              }}
            />
          );

          return (
            <li key={s.id} className="list-none">
              {isOpen ? (
                <Link to={href} className={tileClass} style={tileStyle}>
                  {topBar}
                  {inner}
                </Link>
              ) : (
                <div className={tileClass} style={tileStyle}>
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