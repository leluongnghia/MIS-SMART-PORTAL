import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  const variantStyles = variant === 'outline' 
    ? 'border border-slate-200 bg-transparent text-slate-950 dark:border-slate-800 dark:text-slate-50' 
    : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';
  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', 
        variantStyles, 
        className
      )} 
      {...props} 
    />
  );
}
