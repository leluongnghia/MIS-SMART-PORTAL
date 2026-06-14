'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, CheckSquare, Megaphone, Calendar, FileText, HelpCircle } from 'lucide-react';

interface FloatingActionButtonProps {
  currentUser: any;
  onCreateTask: () => void;
  onCreateDirective: () => void;
  onCreateMeeting: () => void;
  onCreateDocument: () => void;
  onOpenHelp?: () => void;
}

export default function FloatingActionButton({
  currentUser,
  onCreateTask,
  onCreateDirective,
  onCreateMeeting,
  onCreateDocument,
  onOpenHelp,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasAccessToDirective = currentUser?.role === 'ADMIN' || currentUser?.workspaceId === 'BGH';
  const hasAccessToMeeting = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const hasAccessToDocument = currentUser?.role === 'ADMIN' || currentUser?.role === 'HANH_CHINH';

  const actions = [
    {
      label: 'Nhiệm vụ mới',
      icon: <CheckSquare className="w-4 h-4" />,
      onClick: onCreateTask,
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      show: true,
    },
    {
      label: 'Chỉ đạo khẩn',
      icon: <Megaphone className="w-4 h-4" />,
      onClick: onCreateDirective,
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      show: hasAccessToDirective,
    },
    {
      label: 'Lên lịch họp',
      icon: <Calendar className="w-4 h-4" />,
      onClick: onCreateMeeting,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      show: hasAccessToMeeting,
    },
    {
      label: 'Tải văn bản lên',
      icon: <FileText className="w-4 h-4" />,
      onClick: onCreateDocument,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      show: hasAccessToDocument,
    },
    {
      label: 'Hướng dẫn nhanh',
      icon: <HelpCircle className="w-4 h-4" />,
      onClick: onOpenHelp || (() => {}),
      color: 'bg-slate-600 hover:bg-slate-700 text-white',
      show: !!onOpenHelp,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print" ref={menuRef}>
      {/* Mini actions lists */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 transition-all duration-200 animate-slide-up-fade">
          {actions
            .filter((a) => a.show)
            .map((action, idx) => (
              <div key={idx} className="flex items-center gap-2.5 group cursor-pointer" onClick={() => { action.onClick(); setIsOpen(false); }}>
                <span className="px-2.5 py-1 text-[10.5px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
                <button
                  type="button"
                  className={`w-9.5 h-9.5 rounded-full flex items-center justify-center shadow-md transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer ${action.color}`}
                  title={action.label}
                >
                  {action.icon}
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Primary Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white dark:border-slate-850 ${
          isOpen
            ? 'bg-slate-800 dark:bg-slate-700 rotate-135'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-650 dark:to-indigo-700 shadow-indigo-500/20 dark:shadow-indigo-950/40'
        }`}
        title={isOpen ? 'Đóng menu hành động' : 'Hành động nhanh'}
        type="button"
      >
        <Plus className="w-6 h-6 transition-transform" />
      </button>
    </div>
  );
}
