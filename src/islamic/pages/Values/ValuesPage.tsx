import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import Modal from '../../components/Modal';
import SpeakButton from '../../components/SpeakButton';
import BadgeToast from '../../components/BadgeToast';
import { islamicValues, familyValues } from '../../data/values';
import type { IslamicValue } from '../../data/types';
import { getIslamicProgress, markValueComplete } from '../../engine/islamicProgress';
import { useAutoSpeak } from '../../engine/useAutoSpeak';

interface Props {
  initialTab?: 'values' | 'family';
}

const ValueDetail: React.FC<{ value: IslamicValue; done: boolean; onClose: () => void; onComplete: () => void }> = ({
  value,
  done,
  onClose,
  onComplete,
}) => {
  const [showExample, setShowExample] = useState(false);
  const speech = `${value.title}. ${value.description}`;
  useAutoSpeak(speech, value.id);
  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            margin: '0 auto 12px',
            background: `${value.color}22`,
            fontSize: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {value.icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, color: value.color }}>{value.title}</h2>
          <SpeakButton text={`${speech}. مِثال: ${value.example}`} />
        </div>
      </div>
      <div style={{ background: `${value.color}10`, borderRadius: 16, padding: '14px 18px', marginBottom: 14 }}>
        <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.8, color: '#333' }}>{value.description}</p>
      </div>
      <button
        type="button"
        onClick={() => setShowExample(true)}
        style={{
          width: '100%',
          background: '#f8f8f8',
          border: '2px dashed #ddd',
          borderRadius: 14,
          padding: '12px 16px',
          textAlign: 'right',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: 16,
        }}
      >
        {showExample ? (
          <span style={{ color: '#555', lineHeight: 1.7 }}>
            <strong style={{ color: value.color }}>مِثال: </strong>
            {value.example}
          </span>
        ) : (
          <span style={{ color: value.color, fontWeight: 700 }}>اضغَط لِتَرى مِثالاً ✨</span>
        )}
      </button>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
          عَودَة
        </button>
        {done ? (
          <div style={{ flex: 2, background: '#E8F5E9', borderRadius: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#388E3C' }}>
            ✓ َأَحْسَنْت!
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 2, background: `linear-gradient(135deg, ${value.color}, ${value.color}cc)` }}
            onClick={onComplete}
          >
            أَتمَمتُ الدَّرسَ ⭐
          </button>
        )}
      </div>
    </Modal>
  );
};

const ValuesPage: React.FC<Props> = ({ initialTab = 'values' }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'values' | 'family'>(initialTab);
  const [selected, setSelected] = useState<IslamicValue | null>(null);
  const [progress, setProgress] = useState(getIslamicProgress());
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const list = tab === 'values' ? islamicValues : familyValues;

  const complete = (id: string) => {
    const fresh = markValueComplete(id);
    setProgress(getIslamicProgress());
    setSelected(null);
    if (fresh.length) setNewBadges(fresh);
  };

  return (
    <PageShell
      onBack={() => navigate('/islamic')}
      icon={tab === 'values' ? '❤️' : '👨‍👩‍👧'}
      title={tab === 'values' ? 'أَخلاقي' : 'أُسرَتي'}
      subtitle={tab === 'values' ? 'تَعَلَّم أَجمَلَ الأَخلاق' : 'كَيفَ أُحِبُّ أُسرَتي وَأَحتَرِمُها'}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: '#f0f0f0', padding: 6, borderRadius: 16 }}>
        {(
          [
            ['values', '❤️ أَخلاقي'],
            ['family', '👨‍👩‍👧 أُسرَتي'],
          ] as const
        ).map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 12,
              border: 'none',
              fontFamily: 'inherit',
              fontWeight: 700,
              cursor: 'pointer',
              background: tab === key ? '#fff' : 'transparent',
              color: tab === key ? '#E91E63' : '#888',
              boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,.1)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((v) => {
          const done = progress.completedValues.includes(v.id);
          return (
            <div
              key={v.id}
              role="button"
              tabIndex={0}
              className="content-card fade-in"
              style={{ borderRightColor: v.color }}
              onClick={() => setSelected(v)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(v)}
            >
              <div className="card-icon" style={{ background: `${v.color}18` }}>{v.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ margin: 0, color: v.color }}>{v.title}</h3>
                  {done && <span style={{ fontSize: '.72rem', background: '#E8F5E9', color: '#388E3C', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>✓</span>}
                </div>
                <p>{v.description}</p>
              </div>
              <SpeakButton text={`${v.title}. ${v.description}`} size="sm" />
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button type="button" className="btn-primary" onClick={() => navigate(`/islamic/quiz/${tab === 'values' ? 'values' : 'family'}`)}>
          اختَبِر نَفسَكَ ⭐
        </button>
      </div>

      {selected && (
        <ValueDetail
          value={selected}
          done={progress.completedValues.includes(selected.id)}
          onClose={() => setSelected(null)}
          onComplete={() => complete(selected.id)}
        />
      )}
      {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
    </PageShell>
  );
};

export default ValuesPage;
