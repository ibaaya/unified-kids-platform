import React, { useState } from 'react';
import { isSoundEnabled, setSoundEnabled } from '../engine/islamicSound';

/** كتم/تشغيل النطق التلقائي (الصوت اختياري وغير إجباري) */
const SoundToggle: React.FC = () => {
  const [on, setOn] = useState(isSoundEnabled());
  const label = on ? 'إِيقافُ الصَّوت' : 'تَشغيلُ الصَّوت';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        setSoundEnabled(!on);
        setOn(!on);
      }}
      style={{
        position: 'fixed',
        top: 'calc(14px + env(safe-area-inset-top, 0px))',
        left: 'calc(14px + env(safe-area-inset-left, 0px))',
        zIndex: 50,
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: 'none',
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,.15)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polygon points="4,9 4,15 9,15 15,19 15,5 9,9" fill={on ? '#4CAF50' : '#9E9E9E'} />
        {on ? (
          <path d="M18 9c1.6 1.6 1.6 4.4 0 6" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M18 9l4 6M22 9l-4 6" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
};

export default SoundToggle;
