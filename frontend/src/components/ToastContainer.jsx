import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-coffee-900 text-white border-coffee-700';
        let Icon = Info;
        let iconColor = 'text-amber-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-900/95 text-white border-emerald-700';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-300';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-900/95 text-white border-rose-700';
          Icon = AlertCircle;
          iconColor = 'text-rose-300';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900/95 text-white border-amber-700';
          Icon = AlertTriangle;
          iconColor = 'text-amber-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md animate-fade-in transition-all ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
