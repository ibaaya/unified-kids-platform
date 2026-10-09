// src/skills/pages/SkillsHome.tsx
import { Link } from 'react-router-dom';
import SkillsShell from '../components/SkillsShell';
import { THEMES } from '../components/themes';
import { SKILLS_GAMES } from '../data/games';
import { getGameStars } from '../engine/progress';
import { toAr } from '../data/kit';

export default function SkillsHome() {
  return (
    <SkillsShell title="مَدِينَةُ الْمَهَارَاتِ">
      <section className="mb-8 text-center">
        <h2 className="text-2xl font-black text-indigo-900 md:text-4xl">أَلْعَبُ • أُفَكِّرُ • أَكْتَشِفُ • أُقَرِّرُ • أُبْدِعُ</h2>
        <p className="mt-2 text-lg font-bold text-slate-600 md:text-xl">اخْتَرْ لُعْبَةً، وَاجْمَعِ النُّجُومَ!</p>
      </section>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS_GAMES.map((g) => {
          const t = THEMES[g.theme];
          return (
            <Link key={g.id} to={`/skills/${g.id}`}
              className={`group flex flex-col items-center rounded-3xl border-4 p-5 text-center shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${t.card}`}>
              <span className="text-6xl transition group-hover:scale-110" aria-hidden="true">{g.icon}</span>
              <h3 className="mt-2 text-2xl font-black">{g.title}</h3>
              <span className={`mt-1 rounded-full px-3 py-1 text-sm font-extrabold ${t.chip}`}>{g.skill}</span>
              <p className="mt-2 text-base font-bold opacity-80">{g.desc}</p>
              <span className="mt-3 text-lg font-black text-amber-600" aria-label="النُّجُومُ">⭐ {toAr(getGameStars(g.id))} / {toAr(9)}</span>
            </Link>
          );
        })}
      </div>
    </SkillsShell>
  );
}
