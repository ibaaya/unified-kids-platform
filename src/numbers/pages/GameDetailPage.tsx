
import { Link, useParams } from "react-router-dom";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import Balloons from "../components/games/Balloons";
import Catch from "../components/games/Catch";
import Memory from "../components/games/Memory";
import Train from "../components/games/Train";
import House from "../components/games/House";
import Maze from "../components/games/Maze";
import Fast from "../components/games/Fast";
import Quiz from "../components/Quiz";
import CompletionActions from "../components/CompletionActions";
import { makeSet } from "../lib/questions";
import { loc, speak, stopSpeaking } from "../lib/arabic";
import { markCompleted, useProgress } from "../lib/progress";
import { NumbersPageFrame } from "../components/NumbersPageFrame";
// لإضافة لعبة: مكوّن في components/games (أو مولّد أسئلة في lib/questions) + سطر في GAMES + شرح في HOW + بطاقة في app/games/page.tsx
type G = ComponentType<{ onDone: () => void }>;
const mk = (t: string): G => function QuizGame({ onDone }) { const [p] = useProgress(); const learnedKey = p.learned.join(","); const learned = useMemo(() => learnedKey ? learnedKey.split(",").map(Number) : [], [learnedKey]); const qs = useMemo(() => makeSet(t, p.questionCount, learned), [t, p.questionCount, learned]); return <Quiz key={`${t}-${p.questionCount}-${learnedKey}`} questions={qs} onDone={onDone} topic={t} />; };
const GAMES: Record<string, G> = { balloons: Balloons, catch: Catch, memory: Memory, train: Train, house: House, maze: Maze, fast: Fast, missing: mk("missing"), bigger: mk("bigger"), oddeven: mk("oddeven"), compare: mk("compare") };
// شرح اللعبة: [نص التعليمات، العنصر المتحرك، الهدف]
const HOW: Record<string, [string, string, string]> = {
  balloons: ["اِسْمَعِ الرَّقْمَ ثُمَّ اضْغَطْ عَلَى الْبَالُونِ الَّذِي عَلَيْهِ هَذَا الرَّقْم", "٥", "🎈٥"], catch: ["اِضْغَطْ عَلَى الرَّقْمِ الْمَطْلُوبِ وَهُوَ يَسْقُط", "٧", "⭐٧"],
  memory: ["اِقْلِبْ بِطَاقَتَيْنِ وَابْحَثْ عَنِ الرَّقْمِ وَمَا يُنَاسِبُهُ مِنَ الْأَشْيَاء", "٣", "🍎🍎🍎"], train: ["اِضْغَطِ الْعَرَبَاتِ بِالتَّرْتِيبِ مِنَ الْأَصْغَرِ إِلَى الْأَكْبَر", "١", "🚂"],
  house: ["اِسْحَبِ الرَّقْمَ إِلَى الْبَيْتِ الَّذِي فِيهِ نَفْسُ الْعَدَدِ مِنَ الْأَشْيَاء، أَوِ اضْغَطِ الرَّقْمَ ثُمَّ الْبَيْت", "٣", "🏠⭐⭐⭐"], maze: ["اِضْغَطِ الْأَرْقَامَ بِالتَّرْتِيبِ: ابدأ بالرقم ٢ ثم اضغط ٣ ثم ٤، وهكذا حتى نهاية المسار", "٢", "٢ → ٣ → ٤"],
  fast: ["اِخْتَرِ الرَّقْمَ الَّذِي تَسْمَعُهُ قَبْلَ انْتِهَاءِ الشَّرِيط", "٨", "⚡"], missing: ["اِخْتَرِ الرَّقْمَ النَّاقِصَ فِي الصَّفّ", "٤", "٣ – ؟ – ٥"], compare: ["انْظُرْ إِلَى الْعَدَدَيْنِ وَاخْتَرِ الْعَلامَةَ الصَّحِيحَة", "٧", "٧ > ٣"],
  bigger: ["اِخْتَرِ الْعَدَدَ الْأَكْبَر", "٩", "أَكْبَرُ مِنْ ٤"], oddeven: ["الْعَدَدُ الزَّوْجِيُّ يَنْقَسِمُ إِلَى مَجْمُوعَتَيْنِ مُتَسَاوِيَتَيْن", "٦", "زَوْجِيّ"] };
export function NumbersGameDetailPage() {
  const { id: gameId } = useParams<{ id: string }>();
  const params = { id: gameId! };
  const [p, up] = useProgress(); const [done, setDone] = useState(0); const [help, setHelp] = useState(false);
  const G = GAMES[params.id]; const h = HOW[params.id];
  useEffect(() => { if (!localStorage.getItem("adad-seen-" + params.id)) setHelp(true); }, [params.id]);
  useEffect(() => { if (help && h) speak(h[0], p.sound); }, [help, h, p.sound]);
  const close = () => { stopSpeaking(); localStorage.setItem("adad-seen-" + params.id, "1"); setHelp(false); };
  const finishGame = () => { stopSpeaking(); up((s) => markCompleted(s, `game:${params.id}`)); setDone(1); };
  if (!G) return <NumbersPageFrame><Link to="/numbers/games">عودة</Link></NumbersPageFrame>;
  return <NumbersPageFrame background="/images/numbers-bg.webp"><div className="space-y-4">
    {done ? <div className="numbers-card text-center text-2xl">🎉 أَحْسَنْتَ! أَنْهَيْتَ اللُّعْبَة<CompletionActions nextHref="/numbers/games" replayLabel="🔄 إِعَادَة" onReplay={() => setDone(0)} /></div> : !help && <G key={done} onDone={finishGame} />}
    <div className="flex justify-center gap-3"><button className="btn bg-white/90" onClick={() => setHelp(true)}>❓ كَيْفَ أَلْعَب؟</button><Link to="/numbers/games" className="btn bg-white/90">↩ الأَلْعَاب</Link></div>
    {help && h && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4"><div className="numbers-card numbers-game-help text-center"><h2 className="text-2xl font-extrabold">كَيْفَ أَلْعَب؟ 👋</h2><div className="my-5 flex flex-wrap items-center justify-center gap-4 text-4xl font-extrabold"><span className="rounded-2xl bg-yellow-300 px-4 py-3">{loc(h[1])} 👆</span><span className="rounded-2xl bg-orange-100 px-4 py-3">{loc(h[2])}</span></div><p className="text-xl leading-loose">{h[0]} <button aria-label="اسْتَمِع" onClick={() => speak(h[0], p.sound)}>🔊</button></p><button className="btn numbers-action-button mt-4 bg-emerald-400 text-white" onClick={close}>فَهِمْتُ، لِنَلْعَب! 🎮</button></div></div>}
  </div></NumbersPageFrame>;
}
