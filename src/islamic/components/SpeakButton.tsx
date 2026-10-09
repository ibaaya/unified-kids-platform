import React, { useEffect, useRef, useState } from 'react';
import { speakArabic, stopSpeech } from '../engine/islamicSound';

interface SpeakButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZES = { sm: 34, md: 42, lg: 52 } as const;

/** زر الاستماع / إعادة السماع. يعمل حتى لو كان الصوت التلقائي مكتوماً. */
const SpeakButton: React.FC<SpeakButtonProps> = ({ text, size = 'md', label = 'استَمِع' }) => {
  const [speaking, setSpeaking] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const done = () => mounted.current && setSpeaking(false);
    speakArabic(text, { force: true, onEnd: done, onStop: done });
  };

  const s = SIZES[size];
  return (
    <button
      type="button"
      onClick={handle}
      title={label}
      aria-label={label}
      style={{
        width: s,
        height: s,
        borderRadius: '50%',
        border: 'none',
        flexShrink: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        background: speaking ? 'linear-gradient(135deg,#FF9800,#F44336)' : 'linear-gradient(135deg,#4CAF50,#2196F3)',
        boxShadow: speaking ? '0 0 0 4px rgba(255,152,0,.3)' : '0 2px 8px rgba(0,0,0,.18)',
        animation: speaking ? 'speakPulse .9s ease-in-out infinite' : 'none',
      }}
    >
      <svg width={s * 0.5} height={s * 0.5} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {speaking ? (
          <>
            <rect x="6" y="5" width="4" height="14" rx="2" fill="white" />
            <rect x="14" y="5" width="4" height="14" rx="2" fill="white" />
          </>
        ) : (
          <>
            <polygon points="4,9 4,15 9,15 15,19 15,5 9,9" fill="white" />
            <path d="M18 9c1.6 1.6 1.6 4.4 0 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M20.5 6.5c3 3 3 8 0 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".6" />
          </>
        )}
      </svg>
    </button>
  );
};

export default SpeakButton;
