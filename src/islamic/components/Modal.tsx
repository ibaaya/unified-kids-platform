import React from 'react';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  flush?: boolean;
}

const Modal: React.FC<Props> = ({ onClose, children, maxWidth = 440, flush = false }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
    <div
      className="modal-card fade-in"
      style={{ maxWidth, padding: flush ? 0 : 24 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

export default Modal;
