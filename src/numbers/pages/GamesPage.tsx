
import { Link } from "react-router-dom";
import { useProgress } from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

const G: [string, string, string][] = [
  ["🎈", "بَالُونَاتُ الْأَرْقَام", "balloons"],
  ["⭐", "اصْطَدِ الرَّقْم", "catch"],
  ["🧠", "ذَاكِرَةُ الْأَرْقَام", "memory"],
  ["🚂", "قِطَارُ الْأَرْقَام", "train"],
  ["🏠", "بَيْتُ الرَّقْم", "house"],
  ["🧩", "مَتَاهَةُ الْأَرْقَام", "maze"],
  ["⚡", "مَنِ الْأَسْرَع؟", "fast"],
  ["🔍", "الرَّقْمُ النَّاقِص", "missing"],
  ["🐘", "أَيُّهُمَا أَكْبَر؟", "bigger"],
  ["🧺", "زَوْجِيٌّ أَمْ فَرْدِيّ؟", "oddeven"],
  ["⚖️", "اخْتَرِ الْعَلامَةَ الصَّحِيحَة", "compare"],
];

export function NumbersGamesPage() {
  const [p] = useProgress();

  return (
    <NumbersPageFrame background="/images/numbers-bg.webp">
      <div className="mx-auto w-full max-w-3xl">
        {/* الرئيسية */}
        <div className="mb-3 flex justify-start">
          <Link
            to="/numbers"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/85 px-4 py-2 text-sm font-bold text-violet-700 shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
          >
            <span className="text-lg">🏠</span>
            <span>الرئيسية</span>
          </Link>
        </div>

        {/* العنوان */}
        <div className="mb-5 text-center">
          <div className="mb-1 text-3xl">🎮</div>

          <h1 className="text-3xl font-extrabold text-violet-800 sm:text-4xl">
            الأَلْعَاب
          </h1>

          <p className="mt-1 text-sm font-bold text-violet-700/80">
            هَيَّا نَلْعَبْ وَنَتَعَلَّمْ! 🌟
          </p>
        </div>

        {/* الألعاب */}
        
        <div className="numbers-games-grid !grid !grid-cols-3 gap-2.5 sm:gap-3">
          {G.map(([icon, title, id]) => (
            <Link
              key={id}
              to={`/numbers/games/${id}`}
              className="group relative flex h-[125px] flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border-2 border-white/80 bg-white/85 p-2 text-center shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg active:scale-[0.98]"
            >
              {/* زخرفة خفيفة */}
              <div className="pointer-events-none absolute -right-4 -top-4 h-10 w-10 rounded-full bg-violet-100/70 transition-transform duration-300 group-hover:scale-150" />

              <div className="pointer-events-none absolute -bottom-4 -left-4 h-9 w-9 rounded-full bg-pink-100/60 transition-transform duration-300 group-hover:scale-150" />

              {/* حالة الإنجاز */}
              {p.completed.includes(`game:${id}`) && (
                <span className="absolute end-1.5 top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] shadow-sm">
                  ✓
                </span>
              )}

              {/* الأيقونة */}
              <div className="relative z-10 mb-1.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-2 ring-violet-100 transition-transform duration-200 group-hover:scale-110">
                {icon}
              </div>

              {/* اسم اللعبة */}
              <span className="relative z-10 max-w-full px-1 text-[11px] font-extrabold leading-4 text-gray-800 sm:text-xs sm:leading-5">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </NumbersPageFrame>
  );
}