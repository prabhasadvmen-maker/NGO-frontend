import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = React.createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastCounterRef = React.useRef(0);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = `${Date.now()}-${++toastCounterRef.current}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = React.useMemo(() => ({
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(({ id, message, type }) => (
          <Toast key={id} message={message} type={type} onClose={() => removeToast(id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const config = {
  success: {
    bg: '#16a34a',
    border: '#15803d',
    icon: CheckCircle,
  },
  error: {
    bg: '#dc2626',
    border: '#b91c1c',
    icon: AlertCircle,
  },
  info: {
    bg: '#2563eb',
    border: '#1d4ed8',
    icon: Info,
  },
};

const Toast = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const { bg, border, icon: Icon } = config[type] || config.success;

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl min-w-[280px] max-w-[360px] transition-all duration-300"
      style={{
        backgroundColor: bg,
        border: `2px solid ${border}`,
        color: '#ffffff',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.95)',
        opacity: visible ? 1 : 0,
      }}
    >
      <Icon size={22} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      <span className="text-sm font-semibold flex-1 leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-white/20 transition-colors"
        style={{ flexShrink: 0 }}
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};
