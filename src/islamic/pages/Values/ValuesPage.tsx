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
  const speech = `${value.title}. ${value.description}. مِثالٌ على ${value.title}: ${value.example}`;
  useAutoSpeak(speech, value.id);
  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            margin: '0 auto 12px',
            background: `linear-gradient(135deg, ${value.color}30, ${value.color}15)`,
            border: `3px solid ${value.color}40`,
            fontSize: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 24px ${value.color}30`,
          }}
        >
          {value.icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: value.color, fontSize: '1.6rem', fontWeight: 900 }}>{value.title}</h2>
          <SpeakButton text={speech} />
        </div>
      </div>
      <div
        style={{
          background: `linear-gradient(135deg, ${value.color}18, ${value.color}0a)`,
          borderRadius: 18,
          padding: '16px 18px',
          marginBottom: 16,
          border: `2px solid ${value.color}25`,
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.9, color: '#3a4652', fontSize: '1.05rem' }}>{value.description}</p>
      </div>
      <div
        style={{
          width: '100%',
          background: `linear-gradient(135deg, ${value.color}12, #ffffff)`,
          border: `2px dashed ${value.color}50`,
          borderRadius: 18,
          padding: '14px 18px',
          textAlign: 'right',
          cursor: 'default',
          fontFamily: 'inherit',
          marginBottom: 18,
          transition: 'all .2s ease',
        }}
      >
        <span style={{ color: '#3a4652', lineHeight: 1.8, fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <strong style={{ color: value.color }}>مِثال: </strong>
            {value.example}
            <SpeakButton text={`مِثالٌ على ${value.title}: ${value.example}`} label="استمع إلى المثال" />
          </span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ flex: 1, fontSize: '1.05rem', padding: '12px 18px', borderRadius: 16, fontWeight: 800 }}
          onClick={onClose}
        >
          عَودَة
        </button>
        {done ? (
          <div
            style={{
              flex: 2,
              background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#2E7D32',
              fontSize: '1.1rem',
              border: '2px solid #A5D6A7',
              boxShadow: '0 4px 12px rgba(46,125,50,.15)',
            }}
          >
            ✓ أَحْسَنْت!
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary"
            style={{
              flex: 2,
              background: `linear-gradient(135deg, ${value.color}, ${value.color}cc)`,
              fontSize: '1.1rem',
              padding: '12px 18px',
              borderRadius: 16,
              fontWeight: 900,
              boxShadow: `0 8px 20px ${value.color}40`,
            }}
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
     <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 22,
          background: 'linear-gradient(135deg, #fdf2f8, #f3e8ff)',
          padding: 8,
          borderRadius: 20,
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,.05)',
        }}
      >
        {(
          [
            ['values', '❤️ أَخلاقي', '#E91E63'],
            ['family', '👨‍👩‍👧 أُسرَتي', '#FF9800'],
          ] as const
        ).map(([key, label, color]) => {
          const isActive = tab === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: 14,
                border: isActive ? `2px solid ${color}` : '2px solid transparent',
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? color : '#8a8a8a',
                boxShadow: isActive ? `0 6px 16px ${color}33` : 'none',
                transition: 'all .2s ease',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {list.map((v) => {
          const done = progress.completedValues.includes(v.id);
          return (
            <div
              key={v.id}
              role="button"
              tabIndex={0}
              className="content-card fade-in"
              style={{
                borderRightColor: v.color,
                borderRightWidth: 6,
                borderRightStyle: 'solid',
                borderRadius: 22,
                padding: '18px 18px',
                background: done
                  ? `linear-gradient(135deg, ${v.color}14, #ffffff)`
                  : 'linear-gradient(135deg, #ffffff, #fbfbfb)',
                boxShadow: done
                  ? `0 10px 26px ${v.color}25, 0 2px 6px rgba(0,0,0,.04)`
                  : '0 8px 22px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'transform .2s ease, box-shadow .25s ease',
              }}
              onClick={() => setSelected(v)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(v)}
            >
              <div
                className="card-icon"
                style={{
                  background: `linear-gradient(135deg, ${v.color}30, ${v.color}15)`,
                  border: `2px solid ${v.color}40`,
                  borderRadius: '50%',
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: `0 6px 14px ${v.color}25`,
                }}
                aria-hidden="true"
              >
                {v.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, color: v.color, fontSize: '1.3rem', fontWeight: 900 }}>{v.title}</h3>
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
                    >
                      ✓ مُتْقَن
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.8, color: '#4a5560', fontWeight: 600 }}>
                  {v.description}
                </p>
              </div>
              <SpeakButton text={`${v.title}. ${v.description}`} size="sm" />
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate(`/islamic/quiz/${tab === 'values' ? 'values' : 'family'}`)}
          style={{
            fontSize: '1.15rem',
            padding: '14px 30px',
            borderRadius: 18,
            fontWeight: 900,
            boxShadow: '0 10px 24px rgba(233,30,99,.35)',
          }}
        >
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
