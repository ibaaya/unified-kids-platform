import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import Modal from '../../components/Modal';
import SpeakButton from '../../components/SpeakButton';
import { cultureItems } from '../../data/culture';
import type { CultureItem } from '../../data/types';
import { useAutoSpeak } from '../../engine/useAutoSpeak';

const CultureDetail: React.FC<{ item: CultureItem; onClose: () => void }> = ({ item, onClose }) => {
  const speech = `${item.title}. ${item.description}`;
  useAutoSpeak(speech, item.id);
  return (
    <Modal onClose={onClose} maxWidth={380}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: '3.2rem', marginBottom: 6 }}>{item.icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, color: item.color }}>{item.title}</h2>
          <SpeakButton text={speech} />
        </div>
      </div>
      <div style={{ background: `${item.color}10`, borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
        <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.8, color: '#333' }}>{item.description}</p>
      </div>
      <button type="button" className="btn-primary" style={{ width: '100%', background: `linear-gradient(135deg, ${item.color}, ${item.color}bb)` }} onClick={onClose}>
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
            style={{ background: `${item.color}14`, animationDelay: `${i * 0.06}s` }}
            onClick={() => setSelected(item)}
          >
            <span className="world-icon">{item.icon}</span>
            <h3 style={{ color: item.color }}>{item.title}</h3>
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button type="button" className="btn-primary" onClick={() => navigate('/islamic/quiz/culture')}>
          اختَبِر نَفسَكَ ⭐
        </button>
      </div>
      {selected && <CultureDetail item={selected} onClose={() => setSelected(null)} />}
    </PageShell>
  );
};

export default CulturePage;
