import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { IslamicPatternBg } from '../../components/IslamicSvg';
import { getIslamicProgress, getTotalCompleted, TOTAL_TRACKABLE } from '../../engine/islamicProgress';
import { validateIslamicContent } from '../../engine/validateContent';
import { useAutoSpeak } from '../../engine/useAutoSpeak';

// =====================================================
// الصفحة الرئيسية لقسم «أخلاقي الجميلة»
// =====================================================

interface World {
  id: string;
  path: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
}

const WORLDS: World[] = [
  { id: 'values', path: '/islamic/values', icon: '❤️', title: 'أَخلاقي', desc: 'الصِّدقُ وَالأَمانَةُ وَالرَّحمَة', color: '#E91E63' },
  { id: 'family', path: '/islamic/family', icon: '👨‍👩‍👧', title: 'أُسرَتي', desc: 'بِرُّ الوالِدَينِ وَالأُسرَة', color: '#FF9800' },
  { id: 'manners', path: '/islamic/manners', icon: '🕌', title: 'آدَابِي', desc: 'السَّلامُ وَالطَّعامُ وَالنَّوم', color: '#009688' },
  { id: 'worship', path: '/islamic/worship', icon: '💧', title: 'عِباداتي', desc: 'الوُضوءُ وَالصَّلاةُ وَالدُّعاء', color: '#2196F3' },
  { id: 'faith', path: '/islamic/faith', icon: '☪️', title: 'دِينِي الجَميل', desc: 'أَركانُ الإِسلامِ وَالإِيمان', color: '#4CAF50' },
  { id: 'stories', path: '/islamic/stories', icon: '📖', title: 'قِصَصٌ وَقِيَم', desc: 'قِصَصٌ تُعَلِّمُنا الخَير', color: '#9C27B0' },
  { id: 'culture', path: '/islamic/culture', icon: '🏜️', title: 'ثَقافَتُنا العَرَبِيَّة', desc: 'الكَرَمُ وَالضِّيافَةُ وَالتُّراث', color: '#795548' },
  { id: 'steps', path: '/islamic/steps', icon: '👣', title: 'أَتَعَلَّمُ خُطوَةً خُطوَة', desc: 'الوُضوءُ وَالصَّلاةُ وَالآداب', color: '#00ACC1' },
  { id: 'challenge', path: '/islamic/challenge', icon: '⭐', title: 'تَحَدِّي الأَخلاق', desc: 'أَلعابٌ وَأَلغاز', color: '#FFB300' },
];

const IslamicHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(getIslamicProgress());
  const [total, setTotal] = useState(0);
  useAutoSpeak('أَخلاقي الجَميلَة. هَيّا نَتَعَلَّمُ الخَيرَ وَنَفعَلُه!');

  useEffect(() => {
    setProgress(getIslamicProgress());
    setTotal(getTotalCompleted());
    if (import.meta.env.DEV) {
      const issues = validateIslamicContent();
      if (issues.length) console.warn('[islamic] مشاكل في المُحتَوَى:\n' + issues.join('\n'));
    }
  }, []);

  const started = (id: string): boolean => {
    switch (id) {
      case 'values': return progress.completedValues.some((v) => v.startsWith('value_'));
      case 'family': return progress.completedValues.some((v) => v.startsWith('family_'));
      case 'manners': return progress.completedManners.length > 0;
      case 'worship': return progress.completedWorshipLessons.length > 0;
      case 'faith': return progress.completedFaith.length > 0;
      case 'stories': return progress.completedStories.length > 0;
      case 'challenge': return progress.completedGames.length > 0;
      default: return false;
    }
  };

  const progressPercent = Math.min((total / TOTAL_TRACKABLE) * 100, 100);

  return (
    <PageShell onBack={() => navigate('/')} icon="🌙" title="أَخلاقي الجَميلَة" subtitle="هَيّا نَتَعَلَّمُ الخَيرَ وَنَفعَلُه!">
      {/* بطاقة التقدم */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff, #fbfefb)',
          borderRadius: 22,
          padding: '18px 20px',
          marginBottom: 24,
          boxShadow: '0 10px 26px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)',
          border: '2px solid #e8f3ea',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: '2.2rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 3px 6px rgba(255,179,0,.35))',
          }}
          aria-hidden="true"
        >
          ⭐
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 10 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2b3a34' }}>
              أَكمَلتُ اليَومَ: <span style={{ color: '#4CAF50', fontSize: '1.25rem' }}>{progress.todayActivities}</span> أَنشِطَة
            </span>
            <span style={{ fontSize: '.95rem', color: '#6b7a74', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {total} / {TOTAL_TRACKABLE}
            </span>
          </div>
          <div className="progress-bar-wrap" style={{ height: 14, borderRadius: 999, background: 'rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #7ED957, #4CAF50)',
                borderRadius: 999,
                transition: 'width .6s cubic-bezier(.34,1.56,.64,1)',
                boxShadow: '0 2px 8px rgba(76,175,80,.4)',
              }}
            />
          </div>
        </div>
      </div>

      {/* شبكة العوالم */}
      <div className="islamic-grid">
        {WORLDS.map((w, i) => {
          const isStarted = started(w.id);
          return (
            <button
              type="button"
              key={w.id}
              className="world-card game-card-btn fade-in"
              style={{
                background: `linear-gradient(135deg, ${w.color}20, ${w.color}0e)`,
                animationDelay: `${i * 0.05}s`,
                borderColor: isStarted ? w.color : 'transparent',
                borderWidth: 3,
                borderStyle: 'solid',
                borderRadius: 22,
                boxShadow: isStarted
                  ? `0 10px 26px ${w.color}33`
                  : '0 8px 20px rgba(0,0,0,.06)',
                transition: 'transform .2s ease, box-shadow .25s ease',
                position: 'relative',
                overflow: 'hidden',
                padding: '20px 14px',
              }}
              onClick={() => navigate(w.path)}
            >
              {isStarted && <span className="progress-dot" />}
              <IslamicPatternBg width={200} height={200} color={w.color} opacity={0.05} />

              {/* أيقونة العالم في دائرة ملوّنة */}
              <span
                className="world-icon"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${w.color}30, ${w.color}15)`,
                  border: `2px solid ${w.color}40`,
                  fontSize: '2.4rem',
                  lineHeight: 1,
                  margin: '0 auto 12px',
                  boxShadow: `0 6px 14px ${w.color}25`,
                }}
                aria-hidden="true"
              >
                {w.icon}
              </span>

              <h3
                style={{
                  color: w.color,
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  margin: '0 0 6px',
                  textAlign: 'center',
                }}
              >
                {w.title}
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#4a5560',
                  fontWeight: 600,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {w.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* زر الشارات */}
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/islamic/badges')}
          style={{
            fontSize: '1.15rem',
            padding: '14px 30px',
            borderRadius: 18,
            fontWeight: 900,
            boxShadow: '0 10px 24px rgba(255,179,0,.35)',
          }}
        >
          🏅 شَارَاتِي ({progress.earnedBadges.length})
        </button>
      </div>
    </PageShell>
  );
};

export default IslamicHubPage;