'use client';

import React from 'react';
import { Bell, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Inbox, Clock } from 'lucide-react';
import Drawer from './ui/Drawer';
import { Task, BoardDirective } from '../types';

export interface ActionItem {
  id: string;
  type: 'duyệt' | 'hạn_chót' | 'quá_hạn' | 'chỉ_thị';
  title: string;
  sub: string;
  originalTask?: Task;
  originalDirective?: BoardDirective;
}

interface ActionCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actionItems: ActionItem[];
  onActionClick: (item: ActionItem) => void;
}

export default function ActionCenterDrawer({
  isOpen,
  onClose,
  actionItems = [],
  onActionClick,
}: ActionCenterDrawerProps) {

  const getActionBadgeClass = (type: ActionItem['type']) => {
    switch (type) {
      case 'duyệt':
        return 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300';
      case 'quá_hạn':
        return 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/35 dark:text-rose-300';
      case 'hạn_chót':
        return 'bg-indigo-50 border border-indigo-200 text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900/35 dark:text-indigo-300';
      case 'chỉ_thị':
        return 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300';
      default:
        return 'bg-slate-50 text-slate-800';
    }
  };

  const getActionLabel = (type: ActionItem['type']) => {
    switch (type) {
      case 'duyệt': return '📥 Chờ duyệt';
      case 'quá_hạn': return '🚨 Quá hạn';
      case 'hạn_chót': return '⏰ Hạn chót';
      case 'chỉ_thị': return '⚡ Chỉ thị khẩn';
      default: return 'Công việc';
    }
  };

  const handleItemClick = (item: ActionItem) => {
    onActionClick(item);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Trung tâm Xử lý Công việc"
      description="Các công việc khẩn cấp yêu cầu bạn phê duyệt hoặc giải quyết ngay trong ngày"
      width="md"
    >
      <div className="p-4 space-y-4">
        {actionItems.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Tất cả đã hoàn tất!</p>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Bạn không có công việc khẩn cấp nào cần xử lý hôm nay. Giao diện sạch sẽ!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="font-semibold">Danh sách việc khẩn</span>
              <span className="font-mono">{actionItems.length} việc cần xử lý</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl hover:border-amber-300 dark:hover:border-amber-950 transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider ${getActionBadgeClass(item.type)}`}>
                      {getActionLabel(item.type)}
                    </span>
                    
                    {item.type === 'quá_hạn' && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-0.5 font-mono">
                        <Clock className="w-3 h-3" />
                        Trễ
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-normal font-medium">
                      {item.sub}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5 mt-0.5 flex justify-end">
                    <button
                      onClick={() => handleItemClick(item)}
                      className="px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-755 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg shadow-3xs cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>Xử lý ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
