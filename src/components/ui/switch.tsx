import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ className, onCheckedChange, readOnly, ...props }: SwitchProps) {
  const isReadOnly = readOnly ?? (!onCheckedChange && props.checked !== undefined);

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        readOnly={isReadOnly}
        onChange={onCheckedChange ? (event) => onCheckedChange(event.target.checked) : undefined}
        {...props}
      />
      <div className={cn(
        "w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full dark:bg-slate-700 peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600",
        className
      )}></div>
    </label>
  );
}
