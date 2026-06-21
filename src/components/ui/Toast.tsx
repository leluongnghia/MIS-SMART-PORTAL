'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // ms, default 5000, 0 = không tự đóng
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => string;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được dùng bên trong <ToastProvider>');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((options: Omit<Toast, 'id'>): string => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newToast: Toast = { duration: 5000, ...options, id };
    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Tối đa 5 toast cùng lúc
    return id;
  }, []);

  const success = useCallback((title: string, message?: string) =>
    toast({ variant: 'success', title, message }), [toast]);

  const error = useCallback((title: string, message?: string) =>
    toast({ variant: 'error', title, message, duration: 8000 }), [toast]);

  const warning = useCallback((title: string, message?: string) =>
    toast({ variant: 'warning', title, message }), [toast]);

  const info = useCallback((title: string, message?: string) =>
    toast({ variant: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, {
  icon: React.ElementType;
  containerClass: string;
  iconClass: string;
  progressClass: string;
}> = {
  success: {
    icon: CheckCircle2,
    containerClass: 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/60 shadow-emerald-100/50 dark:shadow-emerald-900/20',
    iconClass: 'text-emerald-500',
    progressClass: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    containerClass: 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800/60 shadow-rose-100/50 dark:shadow-rose-900/20',
    iconClass: 'text-rose-500',
    progressClass: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800/60 shadow-amber-100/50 dark:shadow-amber-900/20',
    iconClass: 'text-amber-500',
    progressClass: 'bg-amber-500',
  },
  info: {
    icon: Info,
    containerClass: 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/60 shadow-indigo-100/50 dark:shadow-indigo-900/20',
    iconClass: 'text-indigo-500',
    progressClass: 'bg-indigo-500',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = VARIANT_CONFIG[toast.variant];
  const Icon = config.icon;

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto dismiss countdown
  useEffect(() => {
    if (!toast.duration || toast.duration === 0) return;
    const step = 100;
    const decrement = (step / toast.duration) * 100;

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(intervalRef.current!);
          handleDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, step);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [toast.duration, toast.id]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
      }}
      className={`relative flex gap-3 w-full max-w-sm rounded-2xl border p-4 shadow-lg overflow-hidden ${config.containerClass}`}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${config.iconClass}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Đóng thông báo"
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full transition-all ease-linear ${config.progressClass}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Thông báo hệ thống"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 48px)' }}
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
