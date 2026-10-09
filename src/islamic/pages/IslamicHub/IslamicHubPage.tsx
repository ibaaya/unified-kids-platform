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

  return (
    <PageShell onBack={() => navigate('/')} icon="🌙" title="أَخلاقي الجَميلَة" subtitle="هَيّا نَتَعَلَّمُ الخَيرَ وَنَفعَلُه!">
      <div style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', marginBottom: 22, boxShadow: '0 2px 12px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.4rem' }}>⭐</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '.9rem', fontWeight: 700, color: '#333' }}>أَكمَلتُ اليَومَ: {progress.todayActivities} أَنشِطَة</span>
            <span style={{ fontSize: '.8rem', color: '#888' }}>{total} / {TOTAL_TRACKABLE}</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${Math.min((total / TOTAL_TRACKABLE) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="islamic-grid">
        {WORLDS.map((w, i) => (
          <button
            type="button"
            key={w.id}
            className="world-card game-card-btn fade-in"
            style={{ background: `${w.color}14`, animationDelay: `${i * 0.05}s`, borderColor: started(w.id) ? w.color : 'transparent' }}
            onClick={() => navigate(w.path)}
          >
            {started(w.id) && <span className="progress-dot" />}
            <IslamicPatternBg width={200} height={200} color={w.color} opacity={0.05} />
            <span className="world-icon">{w.icon}</span>
            <h3 style={{ color: w.color }}>{w.title}</h3>
            <p>{w.desc}</p>
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button type="button" className="btn-primary" onClick={() => navigate('/islamic/badges')}>
          🏅 شَارَاتِي ({progress.earnedBadges.length})
        </button>
      </div>
    </PageShell>
  );
};

export default IslamicHubPage;
