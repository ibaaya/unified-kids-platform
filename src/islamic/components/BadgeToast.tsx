import React from 'react';
import Modal from './Modal';
import { BadgeIcon } from './IslamicSvg';
import { islamicBadges } from '../data/badges';
import { useAutoSpeak } from '../engine/useAutoSpeak';

interface Props {
  badgeIds: string[];
  onClose: () => void;
}

/** نافذة تهنئة بالشارة الجديدة (تُعرض شارة واحدة في كل مرة) */
const BadgeToast: React.FC<Props> = ({ badgeIds, onClose }) => {
  const badge = islamicBadges.find((b) => b.id === badgeIds[0]);
  useAutoSpeak(badge ? `مُبارَك! حَصَلتَ عَلى شارَة: ${badge.title}` : null, badge?.id);
  if (!badge) return null;
  return (
    <Modal onClose={onClose} maxWidth={340}>
      <div style={{ textAlign: 'center' }}>
        <div className="badge-earned" style={{ marginBottom: 10 }}>
          <BadgeIcon size={96} color={badge.color} icon={badge.icon} />
        </div>
        <h2 style={{ margin: '0 0 6px', color: badge.color }}>شارَةٌ جَديدَة!</h2>
        <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.1rem' }}>{badge.title}</p>
        <p style={{ margin: '0 0 18px', color: '#666', fontSize: '.9rem' }}>{badge.description}</p>
        <button className="btn-primary" type="button" onClick={onClose}>
          رائِع! ⭐
        </button>
      </div>
    </Modal>
  );
};

export default BadgeToast;
