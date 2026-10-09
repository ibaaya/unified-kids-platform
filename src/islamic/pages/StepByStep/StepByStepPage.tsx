import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StepPlayer from '../../components/StepPlayer';
import BadgeToast from '../../components/BadgeToast';
import { stepTopics } from '../../data/stepByStep';
import type { StepTopic } from '../../data/types';
import {
  getIslamicProgress,
  markMannerComplete,
  markValueComplete,
  markWorshipComplete,
} from '../../engine/islamicProgress';

const StepByStepPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<StepTopic | null>(null);
  const [progress, setProgress] = useState(getIslamicProgress());
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const isDone = (t: StepTopic) => {
    const { kind, id } = t.source;
    return kind === 'worship'
      ? progress.completedWorshipLessons.includes(id)
      : kind === 'manner'
        ? progress.completedManners.includes(id)
        : progress.completedValues.includes(id);
  };

  const complete = (t: StepTopic) => {
    const { kind, id } = t.source;
    const fresh = kind === 'worship' ? markWorshipComplete(id) : kind === 'manner' ? markMannerComplete(id) : markValueComplete(id);
    setProgress(getIslamicProgress());
    setSelected(null);
    if (fresh.length) setNewBadges(fresh);
  };

  return (
    <PageShell onBack={() => navigate('/islamic')} icon="👣" title="أَتَعَلَّمُ خُطوَةً خُطوَة" subtitle="اخْتَر ما تُريدُ أَن تَتَعَلَّمَه">
      <div className="islamic-grid">
        {stepTopics.map((t, i) => (
          <button
            type="button"
            key={t.id}
            className="world-card game-card-btn fade-in"
            style={{ background: `${t.color}14`, animationDelay: `${i * 0.05}s`, borderColor: isDone(t) ? t.color : 'transparent' }}
            onClick={() => setSelected(t)}
          >
            {isDone(t) && <span className="progress-dot" />}
            <span className="world-icon">{t.icon}</span>
            <h3 style={{ color: t.color }}>{t.title}</h3>
            <p>{t.subtitle}</p>
          </button>
        ))}
      </div>

      {selected && (
        <StepPlayer
          title={selected.title}
          color={selected.color}
          intro={`هَيّا نَتَعَلَّم: ${selected.title}`}
          steps={selected.steps}
          done={isDone(selected)}
          onClose={() => setSelected(null)}
          onComplete={() => complete(selected)}
        />
      )}
      {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
    </PageShell>
  );
};

export default StepByStepPage;
