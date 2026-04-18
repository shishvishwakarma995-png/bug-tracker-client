import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  return { toasts, show };
}

export function ToastContainer({ toasts }) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const colors = {
    success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', icon: '#22C55E' },
    error:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '#EF4444' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '#3B82F6' },
  };
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => {
        const c = colors[t.type];
        return (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-pulse"
            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, minWidth: '220px' }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: c.icon }}>{icons[t.type]}</span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}