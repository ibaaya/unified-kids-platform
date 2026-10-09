import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { speak } from '../engine/speech';
import { toAr } from '../data/kit';

const TEXT = [
  '',
  'أَحْسَنْتَ! أَنْهَيْتَ الْمُسْتَوَى. حَاوِلْ مَرَّةً أُخْرَى لِتَنَالَ نُجُومًا أَكْثَرَ.',
  '  ! نَجْمَتَانِ. أَنْتَ تَتَقَدَّمُ بِسُرْعَةٍ.',
  '  !ثَلَاثُ نُجُومٍ. أَنْتَ بَطَلٌ حَقِيقِيٌّ.',
];

export default function ResultPanel({ score, stars, mistakes, gameId, level, hasNext, onRetry }: {
  score: number; stars: number; mistakes: number; gameId: string; level: number; hasNext: boolean; onRetry: () => void;
}) {
  useEffect(() => { speak(TEXT[stars]); }, [stars]);
  const btn = 'rounded-3xl px-6 py-3 text-xl font-black shadow-lg transition hover:scale-105';
  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border-4 border-white bg-white/90 p-8 text-center shadow-2xl skills-pop">
      <div className="text-7xl" aria-hidden="true">🎉</div>
      <h2 className="mt-2 text-3xl font-black text-indigo-900">أَحْسَنْتَ!</h2>
      <div className="my-3 text-5xl tracking-widest" aria-hidden="true">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
      <p className="text-xl font-extrabold text-slate-700">{TEXT[stars]}</p>
      <p className="mt-2 text-lg font-bold text-slate-500">النَّتِيجَةُ: {toAr(Math.round(score))}٪ — الْأَخْطَاءُ: {toAr(mistakes)}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasNext && <Link to={`/skills/${gameId}/${level + 1}`} className={`${btn} bg-amber-400 text-slate-900`}>الْمُسْتَوَى التَّالِي 🚀</Link>}
        <button type="button" onClick={onRetry} className={`${btn} bg-indigo-500 text-white`}>أُعِيدُ اللَّعِبَ 🔁</button>
        <Link to="/skills" className={`${btn} bg-white text-indigo-900 border-2 border-indigo-200`}>أَلْعَابٌ أُخْرَى</Link>
      </div>
    </section>
  );
}
