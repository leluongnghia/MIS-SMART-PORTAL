import React from 'react';
import { getSafeAvatar } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  /** Hiển thị chấm trạng thái online */
  online?: boolean;
  /** Hiển thị shape vuông */
  square?: boolean;
}

// ─── Size Config ──────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  xs:  { container: 'w-6 h-6',   text: 'text-[9px]',  dot: 'w-1.5 h-1.5 ring-1' },
  sm:  { container: 'w-8 h-8',   text: 'text-[10px]', dot: 'w-2 h-2 ring-1' },
  md:  { container: 'w-10 h-10', text: 'text-xs',     dot: 'w-2.5 h-2.5 ring-2' },
  lg:  { container: 'w-12 h-12', text: 'text-sm',     dot: 'w-3 h-3 ring-2' },
  xl:  { container: 'w-14 h-14', text: 'text-base',   dot: 'w-3.5 h-3.5 ring-2' },
  '2xl': { container: 'w-16 h-16', text: 'text-lg',   dot: 'w-4 h-4 ring-2' },
};

// ─── Hàm lấy chữ cái đầu ─────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Màu nền theo tên ────────────────────────────────────────────────────────

const BG_COLORS = [
  'from-indigo-400 to-indigo-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-rose-400 to-rose-600',
  'from-sky-400 to-sky-600',
  'from-amber-400 to-amber-600',
  'from-teal-400 to-teal-600',
  'from-pink-400 to-pink-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
  online,
  square = false,
}: AvatarProps) {
  const cfg = SIZE_CONFIG[size];
  const safeUrl = getSafeAvatar(src, name);
  const initials = getInitials(name || 'U');
  const bgGradient = getAvatarColor(name || 'default');
  const radius = square ? 'rounded-xl' : 'rounded-full';

  return (
    <div className={`relative inline-flex shrink-0 ${cfg.container} ${className}`}>
      {safeUrl ? (
        <img
          src={safeUrl}
          alt={name || 'Avatar'}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover ${radius} border border-slate-200/60 dark:border-slate-700/60`}
          onError={(e) => {
            // Fallback về initials khi ảnh lỗi
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}

      {/* Fallback initials */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${bgGradient} ${radius} ${safeUrl ? 'hidden' : 'flex'}`}
        aria-hidden={!!safeUrl}
      >
        <span className={`font-bold text-white select-none ${cfg.text}`}>{initials}</span>
      </div>

      {/* Online dot */}
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${cfg.dot} rounded-full ring-white dark:ring-slate-800 ${online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          aria-label={online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
        />
      )}
    </div>
  );
}
