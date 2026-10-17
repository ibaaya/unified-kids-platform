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
    <PageShell
      onBack={() => navigate('/islamic')}
      icon="🕌"
      title="آدَابِي"
      subtitle="تَعَلَّم الآدابَ الإِسلامِيَّةَ الجَميلَة"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          // دعم الحواف الآمنة في PWA وتطبيقات WebView
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {islamicManners.map((m, i) => {
          const done = progress.completedManners.includes(m.id);
          const bigEmoji = m.emojiBig || m.icon;
          const soft = m.colorSoft || `${m.color}14`;

          return (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              aria-label={`${m.title} — ${m.description}`}
              className="content-card fade-in"
              style={{
                borderRightColor: m.color,
                borderRightWidth: 8,
                borderRightStyle: 'solid',
                borderRadius: 24,
                padding: '20px 18px',
                background: done
                  ? `linear-gradient(135deg, ${soft}, #ffffff)`
                  : 'linear-gradient(135deg, #ffffff, #fbfbfb)',
                boxShadow: done
                  ? `0 12px 30px ${m.color}30, 0 2px 6px rgba(0,0,0,.05)`
                  : '0 10px 26px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)',
                animationDelay: `${i * 0.05}s`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'transform .2s ease, box-shadow .25s ease',
                // منع تحديد النص على الضغط الطويل في التطبيق
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              onClick={() => setSelected(m)}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && setSelected(m)
              }
            >
              {/* أيقونة/صورة الأدب — كبيرة وواضحة */}
              <div
                className="card-icon"
                style={{
                  background: `linear-gradient(135deg, ${m.color}35, ${m.color}18)`,
                  border: `3px solid ${m.color}55`,
                  borderRadius: '50%',
                  width: 92,
                  height: 92,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  lineHeight: 1,
                  boxShadow: `0 8px 20px ${m.color}30`,
                  overflow: 'hidden',
                }}
                aria-hidden="true"
              >
                {m.image ? (
                  <img
                    src={m.image}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <span>{bigEmoji}</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: m.color,
                      fontSize: '1.55rem',
                      fontWeight: 900,
                      lineHeight: 1.3,
                    }}
                  >
                    {m.title}
                  </h3>
                  {done && (
                    <span
                      style={{
                        fontSize: '1rem',
                        background:
                          'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
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
                    fontSize: '1.1rem',
                    lineHeight: 1.9,
                    color: '#3a4550',
                    fontWeight: 600,
                  }}
                >
                  {m.description}
                </p>

                {/* شريط إيموجي الخطوات — دليل بصري سريع للطفل */}
                {m.emojis && m.emojis.length > 0 && (
                  <div
                    aria-hidden="true"
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {m.emojis.map((em, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 34,
                          height: 34,
                          borderRadius: 12,
                          background: `${m.color}12`,
                          border: `1.5px solid ${m.color}30`,
                          fontSize: '1.15rem',
                          lineHeight: 1,
                        }}
                      >
                        {em}
                      </span>
                    ))}
                  </div>
                )}
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
            fontSize: '1.2rem',
            padding: '16px 34px',
            borderRadius: 20,
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
      {newBadges.length > 0 && (
        <BadgeToast
          badgeIds={newBadges}
          onClose={() => setNewBadges((b) => b.slice(1))}
        />
      )}
    </PageShell>
  );
};

export default MannersPage;