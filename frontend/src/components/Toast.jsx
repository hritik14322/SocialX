import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon success-icon" />,
    error: <AlertCircle size={18} className="toast-icon error-icon" />,
    info: <Info size={18} className="toast-icon info-icon" />,
  };

  return (
    <div className={`toast-container toast-${toast.type} animate-fade-in`}>
      {icons[toast.type] || icons.info}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
};
