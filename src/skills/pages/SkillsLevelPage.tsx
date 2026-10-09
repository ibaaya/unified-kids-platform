// src/skills/pages/SkillsLevelPage.tsx
import { Navigate, useParams } from 'react-router-dom';
import SkillsShell from '../components/SkillsShell';
import LevelRunner from '../components/LevelRunner';
import { getGame, getLevel } from '../data/games';
import { isLevelUnlocked } from '../engine/progress';

export default function SkillsLevelPage() {
  const { gameId, level } = useParams();
  const game = getGame(gameId);
  const lv = getLevel(game, Number(level));
  if (!game || !lv) return <Navigate to="/skills" replace />;
  if (!isLevelUnlocked(game.id, lv.level)) return <Navigate to={`/skills/${game.id}`} replace />;

  return (
    <SkillsShell title={`${game.icon} ${game.title}`} back={{ to: `/skills/${game.id}`, label: '⬅️ الْمُسْتَوَيَاتُ' }}>
      <LevelRunner key={`${game.id}-${lv.level}`} game={game} level={lv} />
    </SkillsShell>
  );
}
