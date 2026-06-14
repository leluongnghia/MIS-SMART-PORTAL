import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  /** Icon hiển thị (Lucide) */
  icon?: LucideIcon;
  /** Tiêu đề chính */
  title: string;
  /** Mô tả thêm */
  message?: string;
  /** Nút hành động chính */
  action?: EmptyStateAction;
  /** Nút hành động phụ */
  secondaryAction?: EmptyStateAction;
  /** Kích thước (sm, md, lg) */
  size?: 'sm' | 'md' | 'lg';
  /** Class CSS bổ sung */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      container: 'py-8 px-4',
      iconWrapper: 'w-12 h-12',
      icon: 'w-6 h-6',
      title: 'text-sm font-bold',
      message: 'text-xs',
    },
    md: {
      container: 'py-16 px-6',
      iconWrapper: 'w-16 h-16',
      icon: 'w-8 h-8',
      title: 'text-base font-bold',
      message: 'text-sm',
    },
    lg: {
      container: 'py-24 px-8',
      iconWrapper: 'w-20 h-20',
      icon: 'w-10 h-10',
      title: 'text-lg font-bold',
      message: 'text-sm',
    },
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${sizeConfig.container} ${className}`}
      aria-label={title}
    >
      {/* Icon với vòng tròn gradient */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 blur-xl opacity-80" />
        <div
          className={`relative ${sizeConfig.iconWrapper} rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/50 border border-indigo-100/80 dark:border-indigo-800/40 flex items-center justify-center shadow-sm`}
        >
          <Icon className={`${sizeConfig.icon} text-indigo-400 dark:text-indigo-400`} aria-hidden="true" />
        </div>
      </div>

      {/* Tiêu đề */}
      <h3 className={`${sizeConfig.title} text-slate-700 dark:text-slate-200 leading-snug`}>
        {title}
      </h3>

      {/* Mô tả */}
      {message && (
        <p className={`${sizeConfig.message} text-slate-400 dark:text-slate-500 mt-2 max-w-xs leading-relaxed`}>
          {message}
        </p>
      )}

      {/* Nút hành động */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {action && (
            <button
              onClick={action.onClick}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
