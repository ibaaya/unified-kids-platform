import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../islamic.css';
import BackButton from './BackButton';
import SoundToggle from './SoundToggle';
import { stopSpeech } from '../engine/islamicSound';

interface Props {
  onBack: () => void;
  icon?: string;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

/** هيكل موحّد لكل صفحات القسم: خلفية + رجوع + كتم الصوت + ترويسة */
const PageShell: React.FC<Props> = ({ onBack, icon, title, subtitle, maxWidth = 900, children }) => {
  const navigate = useNavigate();
  useEffect(() => () => stopSpeech(), []);
  return (
    <div className="islamic-page" dir="rtl">
      <div className="islamic-page-bg" />
      <BackButton onClick={onBack} />
      <button
        type="button"
        className="islamic-home-button"
        onClick={() => { stopSpeech(); navigate('/islamic'); }}
        aria-label="العودة إلى الصفحة الرئيسية لأخلاقي الجميلة"
      >
        🏠 <span>الرئيسية</span>
      </button>
      <SoundToggle />
      <div className="islamic-container" style={{ maxWidth }}>
        {title && (
          <header className="islamic-header fade-in">
            {icon && <div className="header-icon">{icon}</div>}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageShell;
