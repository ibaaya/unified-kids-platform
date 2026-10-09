// src/skills/pages/SkillsGamePage.tsx — خريطة مستويات اللعبة
import { Link, Navigate, useParams } from 'react-router-dom';
import SkillsShell from '../components/SkillsShell';
import { THEMES } from '../components/themes';
import { getGame } from '../data/games';
import { getLevelProgress, isLevelUnlocked } from '../engine/progress';
import { toAr } from '../data/kit';
import { speak } from '../engine/speech';

export default function SkillsGamePage() {
  const { gameId } = useParams();
  const game = getGame(gameId);
  if (!game) return <Navigate to="/skills" replace />;
  const t = THEMES[game.theme];

  return (
    <SkillsShell title={`${game.icon} ${game.title}`} back={{ to: '/skills', label: '🏠 مَدِينَةُ الْمَهَارَاتِ' }}>
      <p className="mb-6 text-center text-xl font-bold text-slate-600">{game.skill}</p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {game.levels.map((lv) => {
          const unlocked = isLevelUnlocked(game.id, lv.level);
          const p = getLevelProgress(game.id, lv.level);
          const body = (
            <>
              <span className="text-5xl" aria-hidden="true">{unlocked ? game.icon : '🔒'}</span>
              <h3 className="mt-2 text-2xl font-black">الْمُسْتَوَى {toAr(lv.level)}</h3>
              <p className="text-lg font-extrabold">{lv.title}</p>
              <p className="mt-1 text-base font-bold opacity-75">{lv.goal}</p>
              <p className="mt-3 text-2xl" aria-hidden="true">{'⭐'.repeat(p.stars)}{'☆'.repeat(3 - p.stars)}</p>
              {!unlocked && <p className="mt-1 text-sm font-extrabold">أَكْمِلِ الْمُسْتَوَى السَّابِقَ لِتَفْتَحَهُ</p>}
            </>
          );
          const cls = 'flex flex-col items-center rounded-3xl border-4 p-5 text-center shadow-lg';
          return unlocked
            ? <Link key={lv.level} to={`/skills/${game.id}/${lv.level}`} className={`${cls} transition hover:-translate-y-1 ${t.card}`}>{body}</Link>
            : <button key={lv.level} type="button" onClick={() => speak('أَكْمِلِ الْمُسْتَوَى السَّابِقَ أَوَّلًا.')} className={`${cls} border-slate-300 bg-slate-100 text-slate-500`}>{body}</button>;
        })}
      </div>
    </SkillsShell>
  );
}
