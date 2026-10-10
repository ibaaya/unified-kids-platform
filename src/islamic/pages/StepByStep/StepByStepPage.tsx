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
        {stepTopics.map((t, i) => {
          const done = isDone(t);
          return (
            <button
              type="button"
              key={t.id}
              className="world-card game-card-btn fade-in"
              style={{
                background: done
                  ? `linear-gradient(135deg, ${t.color}22, ${t.color}0e)`
                  : `linear-gradient(135deg, ${t.color}18, ${t.color}08)`,
                animationDelay: `${i * 0.05}s`,
                border: `3px solid ${done ? t.color : `${t.color}30`}`,
                borderRadius: 22,
                boxShadow: done ? `0 10px 26px ${t.color}33` : `0 8px 20px ${t.color}1a`,
                padding: '20px 14px',
                transition: 'transform .2s ease, box-shadow .25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => setSelected(t)}
            >
              {done && <span className="progress-dot" />}
              <span
                className="world-icon"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}30, ${t.color}15)`,
                  border: `2px solid ${t.color}40`,
                  fontSize: '2.4rem',
                  lineHeight: 1,
                  margin: '0 auto 12px',
                  boxShadow: `0 6px 14px ${t.color}25`,
                }}
                aria-hidden="true"
              >
                {t.icon}
              </span>
              <h3 style={{ color: t.color, fontSize: '1.2rem', fontWeight: 900, margin: '0 0 6px', textAlign: 'center' }}>
                {t.title}
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#4a5560', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                {t.subtitle}
              </p>
            </button>
          );
        })}
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