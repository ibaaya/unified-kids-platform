import React from 'react';

interface Props {
  onClick: () => void;
  label?: string;
}

/** زر الرجوع (سهم لليمين لأن الواجهة RTL) يحترم المساحات الآمنة للجوال */
const BackButton: React.FC<Props> = ({ onClick, label = 'رُجوع' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    style={{
      position: 'fixed',
      top: 'calc(14px + env(safe-area-inset-top, 0px))',
      right: 'calc(14px + env(safe-area-inset-right, 0px))',
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
      <path d="M9 6l6 6-6 6" stroke="#333" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

export default BackButton;
