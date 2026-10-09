import React, { useState } from 'react';
import Modal from './Modal';
import SpeakButton from './SpeakButton';
import type { StepItem } from '../data/types';
import { useAutoSpeak } from '../engine/useAutoSpeak';

interface Props {
  title: string;
  color: string;
  steps: StepItem[];
  done: boolean;
  /** شاشة مقدمة اختيارية قبل الخطوات */
  intro?: string;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * مشغّل خُطُوَات تفاعلي مشترك (الوضوء، الصلاة، الآدَاب...).
 * ينطق كل خطوة تلقائياً ويوفّر زر إعادة السماع.
 * النص القرآني يُعرض بإطار مميز ولا يُنطق آلياً.
 */
const StepPlayer: React.FC<Props> = ({ title, color, steps, done, intro, onClose, onComplete }) => {
  const [idx, setIdx] = useState(intro ? -1 : 0);
  const [finished, setFinished] = useState(false);
  const step = idx >= 0 ? steps[idx] : null;
  const last = idx === steps.length - 1;

  const spoken = finished
    ? `َأَحْسَنْت! تَعَلَّمتَ: ${title}`
    : step
      ? `${step.title}. ${step.description}${step.note ? `. ${step.note}` : ''}`
      : `${intro ?? ''}`;
  useAutoSpeak(spoken, `${idx}-${finished}`);

  if (finished) {
    return (
      <Modal onClose={onClose} maxWidth={400}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.6rem', marginBottom: 8 }}>🌟</div>
          <h2 style={{ margin: '0 0 8px', color }}>َأَحْسَنْت!</h2>
          <p style={{ color: '#555', margin: '0 0 20px', lineHeight: 1.7 }}>تَعَلَّمتَ: {title}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              عَودَة
            </button>
            {!done && (
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 2, background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
                onClick={onComplete}
              >
                أَتمَمتُ الدَّرسَ ⭐
              </button>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="step-nav" style={{ marginBottom: 14 }}>
        {steps.map((s, i) => (
          <div key={s.id} className={`step-dot ${i === idx ? 'active' : i < idx ? 'done' : ''}`} />
        ))}
      </div>

      {!step ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', color }}>{title}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <SpeakButton text={intro ?? title} size="lg" />
          </div>
          <p style={{ margin: '0 0 18px', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.8, color: '#333' }}>{intro}</p>
          <button
            type="button"
            className="btn-primary"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
            onClick={() => setIdx(0)}
          >
            هَيّا نَبدَأ ←
          </button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                margin: '0 auto 10px',
                background: `linear-gradient(135deg, ${color}, ${color}99)`,
                color: 'white',
                fontSize: '1.4rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 14px ${color}44`,
              }}
            >
              {idx + 1}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color }}>{step.title}</h3>
              <SpeakButton text={spoken} size="md" />
            </div>
          </div>

          <div style={{ background: `${color}0f`, borderRadius: 16, padding: '16px 18px', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.8, color: '#333', fontWeight: 600 }}>{step.description}</p>
            {step.note && <p className="step-note">{step.note}</p>}
          </div>

          {step.quran && (
            <div className="quran-box">
              <div className="quran-label">مِنَ القُرآنِ الكَريم</div>
              <div className="quran-text">﴿ {step.quran.text} ﴾</div>
              <div className="quran-ref">{step.quran.ref}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setIdx((i) => (i === 0 && intro ? -1 : Math.max(0, i - 1)))}
              disabled={idx === 0 && !intro}
            >
              السّابِق
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 2, background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
              onClick={() => (last ? setFinished(true) : setIdx((i) => i + 1))}
            >
              {last ? 'أَنهَيتُ 🎉' : 'التّالي ←'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, color: '#aaa', fontSize: '.82rem' }}>
            {idx + 1} / {steps.length}
          </div>
        </>
      )}
    </Modal>
  );
};

export default StepPlayer;
