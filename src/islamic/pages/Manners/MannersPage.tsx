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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {islamicManners.map((m, i) => {
          const done = progress.completedManners.includes(m.id);
          return (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              className="content-card fade-in"
              style={{
                borderRightColor: m.color,
                borderRightWidth: 6,
                borderRightStyle: 'solid',
                borderRadius: 22,
                padding: '18px 18px',
                background: done
                  ? `linear-gradient(135deg, ${m.color}14, #ffffff)`
                  : 'linear-gradient(135deg, #ffffff, #fbfbfb)',
                boxShadow: done
                  ? `0 10px 26px ${m.color}25, 0 2px 6px rgba(0,0,0,.04)`
                  : '0 8px 22px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04)',
                animationDelay: `${i * 0.05}s`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'transform .2s ease, box-shadow .25s ease',
              }}
              onClick={() => setSelected(m)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(m)}
            >
              {/* أيقونة الأدب */}
              <div
                className="card-icon"
                style={{
                  background: `linear-gradient(135deg, ${m.color}30, ${m.color}15)`,
                  border: `2px solid ${m.color}40`,
                  borderRadius: '50%',
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: `0 6px 14px ${m.color}25`,
                }}
                aria-hidden="true"
              >
                {m.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, color: m.color, fontSize: '1.3rem', fontWeight: 900 }}>
                    {m.title}
                  </h3>
                  {done && (
                    <span
                      style={{
                        fontSize: '.95rem',
                        background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                        color: '#2E7D32',
                        borderRadius: 20,
                        padding: '4px 12px',
                        fontWeight: 800,
                        border: '1.5px solid #A5D6A7',
                        boxShadow: '0 2px 6px rgba(46,125,50,.15)',
                      }}
                      title="تم إتقان هذا الأدب"
                    >
                      ✓ مُتْقَن
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                    color: '#4a5560',
                    fontWeight: 600,
                  }}
                >
                  {m.description}
                </p>
              </div>

              <SpeakButton text={`${m.title}. ${m.description}`} size="sm" />
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/islamic/quiz/manners')}
          style={{
            fontSize: '1.15rem',
            padding: '14px 30px',
            borderRadius: 18,
            fontWeight: 900,
            boxShadow: '0 10px 24px rgba(76,175,80,.35)',
          }}
        >
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