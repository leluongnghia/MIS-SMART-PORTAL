import React from 'react';
import { TaskStatus, TaskPriority } from '../../types';

// ─── Task Status Badge ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string; dot: string }> = {
  CHUA_BAT_DA: {
    label: 'Chưa bắt đầu',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  DANG_TIEN_HANH: {
    label: 'Đang tiến hành',
    className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
    dot: 'bg-indigo-500 animate-pulse',
  },
  CHO_DUYET: {
    label: 'Chờ duyệt',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    dot: 'bg-amber-500 animate-pulse',
  },
  HOAN_THANH: {
    label: 'Đã hoàn thành',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
};

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-lg border ${sizeClass} ${cfg.className}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      )}
      {cfg.label}
    </span>
  );
}

// ─── Task Priority Badge ──────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string; icon: string }> = {
  CAO: {
    label: 'Cao',
    className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
    icon: '↑',
  },
  TRUNG_BINH: {
    label: 'Trung bình',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    icon: '→',
  },
  THAP: {
    label: 'Thấp',
    className: 'bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60',
    icon: '↓',
  },
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function PriorityBadge({ priority, size = 'md', showIcon = true }: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority];
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-lg border ${sizeClass} ${cfg.className}`}>
      {showIcon && <span className="font-bold">{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}

// ─── Generic Color Badge ──────────────────────────────────────────────────────

type BadgeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'violet' | 'sky' | 'teal';

const COLOR_MAP: Record<BadgeColor, string> = {
  indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  rose:    'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
  amber:   'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
  slate:   'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  violet:  'bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
  sky:     'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
  teal:    'bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60',
};

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ label, color = 'slate', size = 'md', className = '' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center font-semibold rounded-lg border ${sizeClass} ${COLOR_MAP[color]} ${className}`}>
      {label}
    </span>
  );
}
