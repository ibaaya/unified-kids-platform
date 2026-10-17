import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import Modal from '../../components/Modal';
import SpeakButton from '../../components/SpeakButton';
import { cultureItems } from '../../data/culture';
import type { CultureItem } from '../../data/types';
import { speakArabic } from '../../engine/islamicSound';

const CultureDetail: React.FC<{ item: CultureItem; onClose: () => void }> = ({ item, onClose }) => {
  useEffect(() => {
    // نطق العنوان ثم الوصف، كلاً بنصه الأصلي المسجَّل — لا دمج
    const t1 = window.setTimeout(() => speakArabic(item.title), 300);
    const t2 = window.setTimeout(() => speakArabic(item.description), 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [item.id, item.title, item.description]);

  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            margin: '0 auto 12px',
            background: `linear-gradient(135deg, ${item.color}30, ${item.color}15)`,
            border: `3px solid ${item.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.4rem',
            boxShadow: `0 10px 24px ${item.color}30`,
          }}
        >
          {item.icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: item.color, fontSize: '1.6rem', fontWeight: 900 }}>{item.title}</h2>
          {/* زر الاستماع: نطق الوصف (المسجَّل في الاستوديو) */}
          <SpeakButton text={item.description} />
        </div>
      </div>
      <div
        style={{
          background: `linear-gradient(135deg, ${item.color}18, ${item.color}0a)`,
          borderRadius: 18,
          padding: '16px 18px',
          marginBottom: 18,
          border: `2px solid ${item.color}25`,
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.9, color: '#3a4652', fontSize: '1.05rem' }}>
          {item.description}
        </p>
      </div>
      <button
        type="button"
        className="btn-primary"
        style={{
          width: '100%',
          background: `linear-gradient(135deg, ${item.color}, ${item.color}bb)`,
          fontSize: '1.15rem',
          padding: '14px 20px',
          borderRadius: 18,
          fontWeight: 900,
          boxShadow: `0 10px 22px ${item.color}40`,
        }}
        onClick={onClose}
      >
        جَميل! 🌟
      </button>
    </Modal>
  );
};

const CulturePage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CultureItem | null>(null);
  return (
    <PageShell onBack={() => navigate('/islamic')} icon="🏜️" title="ثَقافَتُنا العَرَبِيَّة" subtitle="تَعَرَّف عَلى جَمالِ ثَقافَتِنا وَتُراثِنا">
      <div className="islamic-grid">
        {cultureItems.map((item, i) => (
          <button
            type="button"
            key={item.id}
            className="world-card game-card-btn fade-in"
            style={{
              background: `linear-gradient(135deg, ${item.color}20, ${item.color}0e)`,
              animationDelay: `${i * 0.06}s`,
              border: `3px solid ${item.color}30`,
              borderRadius: 22,
              boxShadow: `0 8px 20px ${item.color}22`,
              padding: '20px 14px',
              transition: 'transform .2s ease, box-shadow .25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => setSelected(item)}
          >
            <span
              className="world-icon"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${item.color}30, ${item.color}15)`,
                border: `2px solid ${item.color}40`,
                fontSize: '2.4rem',
                lineHeight: 1,
                margin: '0 auto 12px',
                boxShadow: `0 6px 14px ${item.color}25`,
              }}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <h3 style={{ color: item.color, fontSize: '1.2rem', fontWeight: 900, margin: 0, textAlign: 'center' }}>
              {item.title}
            </h3>
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/islamic/quiz/culture')}
          style={{ fontSize: '1.15rem', padding: '14px 30px', borderRadius: 18, fontWeight: 900, boxShadow: '0 10px 24px rgba(121,85,72,.35)' }}
        >
          اختَبِر نَفسَكَ ⭐
        </button>
      </div>
      {selected && <CultureDetail item={selected} onClose={() => setSelected(null)} />}
    </PageShell>
  );
};

export default CulturePage;