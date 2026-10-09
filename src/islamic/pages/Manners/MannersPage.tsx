import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import StepPlayer from '../../components/StepPlayer';
import BadgeToast from '../../components/BadgeToast';
import { islamicManners } from '../../data/manners';
import { mannerToSteps } from '../../data/stepByStep';
import type { IslamicManner } from '../../data/types';
import { getIslamicProgress, markMannerComplete } from '../../engine/islamicProgress';

const MannersPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<IslamicManner | null>(null);
  const [progress, setProgress] = useState(getIslamicProgress());
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const complete = (id: string) => {
    const fresh = markMannerComplete(id);
    setProgress(getIslamicProgress());
    setSelected(null);
    if (fresh.length) setNewBadges(fresh);
  };

  return (
    <PageShell onBack={() => navigate('/islamic')} icon="🕌" title="آدَابِي" subtitle="تَعَلَّم الآدابَ الإِسلامِيَّةَ الجَميلَة">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {islamicManners.map((m, i) => {
          const done = progress.completedManners.includes(m.id);
          return (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              className="content-card fade-in"
              style={{ borderRightColor: m.color, animationDelay: `${i * 0.05}s` }}
              onClick={() => setSelected(m)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(m)}
            >
              <div className="card-icon" style={{ background: `${m.color}18` }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ margin: 0, color: m.color }}>{m.title}</h3>
                  {done && <span style={{ fontSize: '.72rem', background: '#E8F5E9', color: '#388E3C', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>✓</span>}
                </div>
                <p>{m.description}</p>
              </div>
              <SpeakButton text={`${m.title}. ${m.description}`} size="sm" />
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button type="button" className="btn-primary" onClick={() => navigate('/islamic/quiz/manners')}>
          اختَبِر نَفسَكَ ⭐
        </button>
      </div>

      {selected && (
        <StepPlayer
          title={selected.title}
          color={selected.color}
          intro={`${selected.title}. ${selected.description}`}
          steps={mannerToSteps(selected)}
          done={progress.completedManners.includes(selected.id)}
          onClose={() => setSelected(null)}
          onComplete={() => complete(selected.id)}
        />
      )}
      {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
    </PageShell>
  );
};

export default MannersPage;
