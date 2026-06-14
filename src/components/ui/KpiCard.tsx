import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type KpiColor = 'indigo' | 'rose' | 'emerald' | 'amber' | 'violet' | 'sky';

interface KpiCardProps {
  /** Giá trị chính hiển thị (số, text, %) */
  value: string | number;
  /** Nhãn phía trên */
  label: string;
  /** Icon Lucide */
  icon?: LucideIcon;
  /** Màu chủ đạo */
  color?: KpiColor;
  /** Xu hướng: up/down/flat */
  trend?: 'up' | 'down' | 'flat';
  /** Giá trị xu hướng (VD: "+8%" hoặc "-3 nhiệm vụ") */
  trendLabel?: string;
  /** Mô tả phụ bên dưới */
  sublabel?: string;
  /** Click handler */
  onClick?: () => void;
  /** CSS class bổ sung */
  className?: string;
}

// ─── Color Config ─────────────────────────────────────────────────────────────

const COLOR_CONFIG: Record<KpiColor, {
  card: string;
  iconBg: string;
  iconText: string;
  value: string;
  trendUp: string;
  trendDown: string;
}> = {
  indigo: {
    card:      'border-indigo-100/80 dark:border-indigo-900/40 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20',
    iconBg:    'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900',
    iconText:  'text-indigo-600 dark:text-indigo-400',
    value:     'text-indigo-700 dark:text-indigo-300',
    trendUp:   'text-emerald-600',
    trendDown: 'text-rose-600',
  },
  rose: {
    card:      'border-rose-100/80 dark:border-rose-900/40 bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-800 dark:to-rose-950/20',
    iconBg:    'bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900',
    iconText:  'text-rose-600 dark:text-rose-400',
    value:     'text-rose-700 dark:text-rose-300',
    trendUp:   'text-rose-600',
    trendDown: 'text-emerald-600',
  },
  emerald: {
    card:      'border-emerald-100/80 dark:border-emerald-900/40 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-950/20',
    iconBg:    'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900',
    iconText:  'text-emerald-600 dark:text-emerald-400',
    value:     'text-emerald-700 dark:text-emerald-300',
    trendUp:   'text-emerald-600',
    trendDown: 'text-rose-600',
  },
  amber: {
    card:      'border-amber-100/80 dark:border-amber-900/40 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-800 dark:to-amber-950/20',
    iconBg:    'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900',
    iconText:  'text-amber-600 dark:text-amber-400',
    value:     'text-amber-700 dark:text-amber-300',
    trendUp:   'text-emerald-600',
    trendDown: 'text-rose-600',
  },
  violet: {
    card:      'border-violet-100/80 dark:border-violet-900/40 bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-800 dark:to-violet-950/20',
    iconBg:    'bg-violet-50 dark:bg-violet-950/50 border-violet-100 dark:border-violet-900',
    iconText:  'text-violet-600 dark:text-violet-400',
    value:     'text-violet-700 dark:text-violet-300',
    trendUp:   'text-emerald-600',
    trendDown: 'text-rose-600',
  },
  sky: {
    card:      'border-sky-100/80 dark:border-sky-900/40 bg-gradient-to-br from-white to-sky-50/30 dark:from-slate-800 dark:to-sky-950/20',
    iconBg:    'bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-900',
    iconText:  'text-sky-600 dark:text-sky-400',
    value:     'text-sky-700 dark:text-sky-300',
    trendUp:   'text-emerald-600',
    trendDown: 'text-rose-600',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function KpiCard({
  value,
  label,
  icon: Icon,
  color = 'indigo',
  trend,
  trendLabel,
  sublabel,
  onClick,
  className = '',
}: KpiCardProps) {
  const cfg = COLOR_CONFIG[color];
  const isClickable = !!onClick;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? cfg.trendUp : trend === 'down' ? cfg.trendDown : 'text-slate-400';

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={[
        'relative rounded-2xl border p-5 shadow-sm transition-all duration-200',
        cfg.card,
        isClickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
          : '',
        className,
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-snug flex-1">
          {label}
        </p>
        {Icon && (
          <div className={`p-2 rounded-xl border ${cfg.iconBg} shrink-0`}>
            <Icon className={`w-4 h-4 ${cfg.iconText}`} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Giá trị chính */}
      <p className={`text-3xl font-black leading-none mb-1 ${cfg.value}`}>
        {value}
      </p>

      {/* Xu hướng + phụ đề */}
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {trendLabel}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-slate-400 dark:text-slate-500 leading-none">
            {sublabel}
          </span>
        )}
      </div>

      {/* Indicator click */}
      {isClickable && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold text-slate-400">Xem →</span>
        </div>
      )}
    </div>
  );
}
