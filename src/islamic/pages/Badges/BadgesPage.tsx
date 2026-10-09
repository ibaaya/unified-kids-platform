import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import { BadgeIcon } from '../../components/IslamicSvg';
import { islamicBadges } from '../../data/badges';
import { getIslamicProgress } from '../../engine/islamicProgress';

const BadgesPage: React.FC = () => {
  const navigate = useNavigate();
  const progress = getIslamicProgress();
  const earned = new Set(progress.earnedBadges);
  const superstar = earned.has('badge_superstar');

  return (
    <PageShell
      onBack={() => navigate('/islamic')}
      icon="🏅"
      title="شَارَاتِي"
      subtitle={`حَصَلتَ عَلى ${earned.size} مِن ${islamicBadges.length} شارَة`}
    >
      {superstar && (
        <div className="result-screen" style={{ marginTop: 0, marginBottom: 18 }}>
          <div className="result-emoji">🌟</div>
          <h2 style={{ color: '#F9A825' }}>بَطَلُ الأَخلاق!</h2>
        </div>
      )}
      <div className="islamic-grid">
        {islamicBadges.map((b) => {
          const got = earned.has(b.id);
          return (
            <div
              key={b.id}
              className="world-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(b.worldId === 'all' ? '/islamic' : `/islamic/${b.worldId}`)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(b.worldId === 'all' ? '/islamic' : `/islamic/${b.worldId}`) }}
              aria-label={`${b.title}، ${got ? 'مكتسبة' : 'لم تكتسب بعد'}، فتح ${b.worldId === 'all' ? 'القسم الرئيسي' : 'العالم المرتبط'}`}
              style={{ cursor: 'pointer', opacity: got ? 1 : 0.55, filter: got ? 'none' : 'grayscale(1)', borderColor: got ? b.color : 'transparent' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <BadgeIcon size={64} color={b.color} icon={got ? b.icon : '🔒'} />
              </div>
              <h3 style={{ color: got ? b.color : '#777', fontSize: '.92rem' }}>{b.title}</h3>
              <p style={{ marginBottom: 6 }}>{b.description}</p>
              <SpeakButton text={`${b.title}. ${b.description}`} size="sm" />
            </div>
          );
        })}
      </div>
    </PageShell>
  );
};

export default BadgesPage;
