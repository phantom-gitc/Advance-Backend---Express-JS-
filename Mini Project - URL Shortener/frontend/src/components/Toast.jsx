import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-dot" />
      <span className="toast-text">{toast.message}</span>
      <button className="toast-close-btn" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
