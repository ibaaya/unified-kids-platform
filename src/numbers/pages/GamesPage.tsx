import { Link } from "react-router-dom";
import { useProgress } from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";

const G: [string, string, string][] = [["🎈", "بَالُونَاتُ الْأَرْقَام", "balloons"],["⭐", "اصْطَدِ الرَّقْم", "catch"],["🧠", "ذَاكِرَةُ الْأَرْقَام", "memory"],["🚂", "قِطَارُ الْأَرْقَام", "train"],["🏠", "بَيْتُ الرَّقْم", "house"],["🧩", "مَتَاهَةُ الْأَرْقَام", "maze"],["⚡", "مَنِ الْأَسْرَع؟", "fast"],["🔍", "الرَّقْمُ النَّاقِص", "missing"],["🐘", "أَيُّهُمَا أَكْبَر؟", "bigger"],["🧺", "زَوْجِيٌّ أَمْ فَرْدِيّ؟", "oddeven"],["⚖️", "اخْتَرِ الْعَلامَةَ الصَّحِيحَة", "compare"]];
export function NumbersGamesPage() {
  const [p] = useProgress();
  return <NumbersPageFrame background="/images/numbers-bg.webp"><h1 className="mb-4 text-center text-3xl font-extrabold text-violet-800">🎮 الأَلْعَاب</h1><div className="numbers-games-grid grid gap-3">{G.map(([icon,title,id]) => <Link key={id} to={`/numbers/games/${id}`} className="relative flex min-h-32 flex-col items-center justify-center rounded-3xl border-2 border-white/70 bg-white/78 p-3 text-center shadow-lg backdrop-blur-sm transition hover:-translate-y-1">{p.completed.includes(`game:${id}`) && <span className="absolute end-2 top-2 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-700">✅ مُنْجَز</span>}<div className="numbers-game-icon mb-2">{icon}</div><span className="text-base font-extrabold">{title}</span></Link>)}</div><div className="mt-5 text-center"><Link to="/numbers" className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-violet-700 shadow">🏠 الرئيسية</Link></div></NumbersPageFrame>;
}
