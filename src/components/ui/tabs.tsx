'use client';

import type { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

export function Tabs({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900', className)}>{children}</div>;
}

export function TabsTrigger({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('rounded-lg px-3 py-2 text-sm font-bold transition-colors', active ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white')}
    >
      {children}
    </button>
  );
}
