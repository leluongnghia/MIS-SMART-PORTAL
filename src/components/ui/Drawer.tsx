'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawerSide = 'left' | 'right' | 'bottom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Tiêu đề ngăn kéo */
  title?: string;
  /** Mô tả phụ */
  description?: string;
  /** Phía mở */
  side?: DrawerSide;
  /** Chiều rộng (chỉ áp dụng left/right) */
  width?: 'sm' | 'md' | 'lg' | 'xl';
  /** Nội dung */
  children: React.ReactNode;
  /** Footer (nút hành động) */
  footer?: React.ReactNode;
  /** Ẩn nút đóng */
  hideCloseButton?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const WIDTH_CLASS: Record<string, string> = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[480px]',
  xl: 'w-[600px]',
};

const SIDE_CONFIG: Record<DrawerSide, {
  open: string;
  closed: string;
  panel: string;
}> = {
  right: {
    open:   'translate-x-0',
    closed: 'translate-x-full',
    panel:  'inset-y-0 right-0 flex-col',
  },
  left: {
    open:   'translate-x-0',
    closed: '-translate-x-full',
    panel:  'inset-y-0 left-0 flex-col',
  },
  bottom: {
    open:   'translate-y-0',
    closed: 'translate-y-full',
    panel:  'inset-x-0 bottom-0 flex-col rounded-t-3xl',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  side = 'right',
  width = 'md',
  children,
  footer,
  hideCloseButton = false,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cfg = SIDE_CONFIG[side];
  const widthClass = side === 'bottom' ? 'w-full max-h-[85vh]' : WIDTH_CLASS[width];

  // Focus trap + ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();

      // Focus trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Lock scroll
    document.body.style.overflow = 'hidden';
    // Focus panel
    setTimeout(() => panelRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={[
          'fixed z-[70] flex bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out focus:outline-none',
          cfg.panel,
          widthClass,
          isOpen ? cfg.open : cfg.closed,
        ].join(' ')}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              {title && (
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                aria-label="Đóng ngăn kéo"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
