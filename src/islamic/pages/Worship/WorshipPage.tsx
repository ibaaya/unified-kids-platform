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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 22 }}>
        {worshipLessons.map((lesson, i) => {
          const done = progress.completedWorshipLessons.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              role="button"
              tabIndex={0}
              className="content-card fade-in"
              style={{ borderRightColor: lesson.color, alignItems: 'center', animationDelay: `${i * 0.08}s` }}
              onClick={() => setSelected(lesson)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(lesson)}
            >
              <div style={{ flexShrink: 0, width: 66, display: 'flex', justifyContent: 'center' }}>{LESSON_ART[lesson.id]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, color: lesson.color }}>{lesson.title}</h3>
                  {done && <span style={{ fontSize: '.72rem', background: '#E8F5E9', color: '#388E3C', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>✓</span>}
                </div>
                <p style={{ margin: '4px 0 0' }}>{lesson.subtitle}</p>
                <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: '#aaa' }}>{lesson.steps.length} خُطُوات</p>
              </div>
              <SpeakButton text={`${lesson.title}. ${lesson.subtitle}`} size="sm" />
            </div>
          );
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,.08)' }}>
        <button
          type="button"
          onClick={() => setShowTimes((s) => !s)}
          style={{
            width: '100%',
            padding: '16px 20px',
            border: 'none',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg,#009688,#26A69A)',
          }}
        >
          <span>🕌 أَوقاتُ الصَّلَواتِ الخَمس</span>
          <span>{showTimes ? '▲' : '▼'}</span>
        </button>
        {showTimes && (
          <div style={{ padding: 14 }} className="fade-in">
            {prayerTimes.map((pt) => (
              <div key={pt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${pt.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  {pt.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: pt.color }}>{pt.name}</div>
                  <div style={{ fontSize: '.8rem', color: '#888' }}>{pt.time}</div>
                </div>
                <SpeakButton text={`${pt.name}. ${pt.description}`} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button type="button" className="btn-primary" onClick={() => navigate('/islamic/quiz/worship')}>
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
