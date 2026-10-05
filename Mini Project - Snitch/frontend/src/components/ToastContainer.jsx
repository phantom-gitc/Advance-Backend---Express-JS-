import React from 'react';
import { useUIStore } from '../store/useUIStore';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-none shadow-xl border backdrop-blur-md transition-all animate-fade-in ${
            toast.type === 'error'
              ? 'bg-primary text-white border-error/50'
              : toast.type === 'success'
              ? 'bg-primary text-white border-neutral-700'
              : 'bg-surface-container-lowest text-on-surface border-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`material-symbols-outlined text-[18px] ${
                toast.type === 'error'
                  ? 'text-error'
                  : toast.type === 'success'
                  ? 'text-emerald-400'
                  : 'text-on-surface'
              }`}
            >
              {toast.type === 'error'
                ? 'error'
                : toast.type === 'success'
                ? 'check_circle'
                : 'info'}
            </span>
            <span className="font-hanken text-[13px] tracking-wide font-medium">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
