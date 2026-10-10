import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import StepPlayer from '../../components/StepPlayer';
import BadgeToast from '../../components/BadgeToast';
import { MosqueSvg, WaterDropSvg } from '../../components/IslamicSvg';
import { worshipLessons, prayerTimes } from '../../data/worship';
import type { WorshipLesson } from '../../data/types';
import { getIslamicProgress, markWorshipComplete } from '../../engine/islamicProgress';

const LESSON_ART: Record<string, React.ReactNode> = {
  wudu_01: <WaterDropSvg size={60} />,
  prayer_01: <MosqueSvg size={64} />,
  dua_01: <span style={{ fontSize: '2.6rem' }}>🤲</span>,
};

const WorshipPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<WorshipLesson | null>(null);
  const [showTimes, setShowTimes] = useState(false);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  const [progress, setProgress] = useState(getIslamicProgress());
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const complete = (id: string) => {
    const fresh = markWorshipComplete(id);
    setProgress(getIslamicProgress());
    setSelected(null);
    if (fresh.length) setNewBadges(fresh);
  };

  return (
    <PageShell onBack={() => navigate('/islamic')} icon="💧" title="عِباداتي" subtitle="الوُضوءُ وَالصَّلاةُ وَالدُّعاء">
      {/* بطاقات الدروس */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {worshipLessons.map((lesson, i) => {
          const done = progress.completedWorshipLessons.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              role="button"
              tabIndex={0}
              className="content-card fade-in"
              style={{
                borderRightColor: lesson.color,
                borderRightWidth: 6,
                borderRightStyle: 'solid',
                borderRadius: 22,
                padding: '18px 18px',
                background: done
                  ? `linear-gradient(135deg, ${lesson.color}14, #ffffff)`
                  : 'linear-gradient(135deg, #ffffff, #fbfbfb)',
                boxShadow: done
                  ? `0 10px 26px ${lesson.color}25, 0 2px 6px rgba(0,0,0,.04)`
                  : '0 8px 22px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04)',
                animationDelay: `${i * 0.08}s`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'transform .2s ease, box-shadow .25s ease',
              }}
              onClick={() => setSelected(lesson)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(lesson)}
            >
              {/* أيقونة الدرس */}
              <div
                style={{
                  flexShrink: 0,
                  width: 78,
                  height: 78,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${lesson.color}25, ${lesson.color}12)`,
                  border: `2px solid ${lesson.color}40`,
                  borderRadius: '50%',
                  boxShadow: `0 6px 14px ${lesson.color}25`,
                }}
              >
                {LESSON_ART[lesson.id]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h3 style={{ margin: 0, color: lesson.color, fontSize: '1.3rem', fontWeight: 900 }}>
                    {lesson.title}
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
                      title="تم إتقان هذا الدرس"
                    >
                      ✓ مُتْقَن
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 6px', fontSize: '1.05rem', lineHeight: 1.7, color: '#4a5560', fontWeight: 600 }}>
                  {lesson.subtitle}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '.9rem',
                    color: lesson.color,
                    fontWeight: 800,
                    background: `${lesson.color}15`,
                    borderRadius: 14,
                    padding: '4px 12px',
                    border: `1.5px solid ${lesson.color}35`,
                  }}
                >
                  📋 {lesson.steps.length} خُطُوات
                </span>
              </div>

              <SpeakButton text={`${lesson.title}. ${lesson.subtitle}`} size="sm" />
            </div>
          );
        })}
      </div>

      {/* قسم أوقات الصلاة */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff, #fbfefd)',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 10px 26px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)',
          border: '2px solid #e0f2f1',
        }}
      >
        <button
          type="button"
          onClick={() => setShowTimes((s) => !s)}
          style={{
            width: '100%',
            padding: '18px 22px',
            border: 'none',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '1.15rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(135deg,#009688,#26A69A)',
            transition: 'filter .2s ease',
            letterSpacing: '.01em',
          }}
          aria-expanded={showTimes}
        >
          <span>🕌 أَوقاتُ الصَّلَواتِ الخَمس</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.2)',
              fontSize: '1rem',
              transition: 'transform .3s ease',
              transform: showTimes ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>

        {showTimes && (
          <div style={{ padding: '12px 16px 16px' }} className="fade-in">
            {prayerTimes.map((pt, idx) => {
              const isOpen = expandedPrayer === pt.id;
              const r = (pt as any).rakaat;
              return (
                <div
                  key={pt.id}
                  style={{
                    borderRadius: 18,
                    marginBottom: idx < prayerTimes.length - 1 ? 10 : 0,
                    border: `2px solid ${isOpen ? pt.color + '50' : '#f0f4f3'}`,
                    overflow: 'hidden',
                    transition: 'border-color .25s ease',
                    background: isOpen ? `linear-gradient(135deg, ${pt.color}08, #fff)` : '#fff',
                  }}
                >
                  {/* رأس الصلاة — قابل للنقر */}
                  <button
                    type="button"
                    onClick={() => setExpandedPrayer(isOpen ? null : pt.id)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      textAlign: 'right',
                    }}
                    aria-expanded={isOpen}
                  >
                    {/* أيقونة */}
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${pt.color}30, ${pt.color}15)`,
                        border: `2px solid ${pt.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.6rem',
                        flexShrink: 0,
                        boxShadow: `0 4px 10px ${pt.color}25`,
                      }}
                      aria-hidden="true"
                    >
                      {pt.icon}
                    </div>

                    {/* اسم + وقت + إجمالي الركعات */}
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: pt.color, fontSize: '1.15rem' }}>{pt.name}</div>
                      <div style={{ fontSize: '.9rem', color: '#6b7a74', fontWeight: 600, marginTop: 2 }}>{pt.time}</div>
                      {r && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '.8rem', fontWeight: 800,
                            background: `${pt.color}18`, color: pt.color,
                            borderRadius: 10, padding: '2px 9px',
                            border: `1.5px solid ${pt.color}35`,
                          }}>
                            فَرض: {r.fard} ركعات
                          </span>
                          {r.sunnah.before > 0 && (
                            <span style={{
                              fontSize: '.8rem', fontWeight: 800,
                              background: '#FFF8E1', color: '#F57F17',
                              borderRadius: 10, padding: '2px 9px',
                              border: '1.5px solid #FFE08240',
                            }}>
                              سُنَّة قَبل: {r.sunnah.before}
                            </span>
                          )}
                          {r.sunnah.after > 0 && (
                            <span style={{
                              fontSize: '.8rem', fontWeight: 800,
                              background: '#F3E5F5', color: '#7B1FA2',
                              borderRadius: 10, padding: '2px 9px',
                              border: '1.5px solid #CE93D840',
                            }}>
                              سُنَّة بَعد: {r.sunnah.after}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* سهم التوسيع */}
                    <span style={{
                      fontSize: '.8rem', color: pt.color, flexShrink: 0,
                      transition: 'transform .3s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${pt.color}15`,
                    }}>
                      ▼
                    </span>
                  </button>

                  {/* التفاصيل الموسّعة */}
                  {isOpen && (
                    <div className="fade-in" style={{ padding: '0 14px 14px' }}>
                      {/* الوصف */}
                      <p style={{
                        margin: '0 0 10px',
                        fontSize: '1rem', color: '#4a5560',
                        fontWeight: 600, lineHeight: 1.7,
                        background: `${pt.color}0d`,
                        borderRadius: 12, padding: '10px 14px',
                        borderRight: `3px solid ${pt.color}`,
                      }}>
                        {pt.description}
                      </p>

                      {/* شرح الركعات */}
                      {(pt as any).rakaatDescription && (
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          background: '#E8F5E9', borderRadius: 12,
                          padding: '10px 14px', marginBottom: 10,
                          border: '1.5px solid #A5D6A740',
                        }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🕌</span>
                          <span style={{ fontSize: '.95rem', color: '#2E7D32', fontWeight: 700, lineHeight: 1.6 }}>
                            {(pt as any).rakaatDescription}
                          </span>
                        </div>
                      )}

                      {/* التلميح */}
                      {(pt as any).tip && (
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          background: '#FFF8E1', borderRadius: 12,
                          padding: '10px 14px',
                          border: '1.5px solid #FFE08260',
                        }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                          <span style={{ fontSize: '.9rem', color: '#E65100', fontWeight: 700, lineHeight: 1.6 }}>
                            {(pt as any).tip}
                          </span>
                        </div>
                      )}

                      {/* زر القراءة الصوتية */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                        <SpeakButton
                          text={`${pt.name}. ${pt.description}. ${(pt as any).rakaatDescription ?? ''}`}
                          size="sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* زر الاختبار */}
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/islamic/quiz/worship')}
          style={{
            fontSize: '1.15rem',
            padding: '14px 30px',
            borderRadius: 18,
            fontWeight: 900,
            boxShadow: '0 10px 24px rgba(0,150,136,.35)',
          }}
        >
          اختَبِر نَفسَكَ ⭐
        </button>
      </div>

      {selected && (
        <StepPlayer
          title={selected.title}
          color={selected.color}
          intro={`هَيّا نَتَعَلَّم: ${selected.title}`}
          steps={selected.steps}
          done={progress.completedWorshipLessons.includes(selected.id)}
          onClose={() => setSelected(null)}
          onComplete={() => complete(selected.id)}
        />
      )}
      {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
    </PageShell>
  );
};

export default WorshipPage;