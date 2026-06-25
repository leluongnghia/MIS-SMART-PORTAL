'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Play, UserPlus, AlertCircle, FolderInput, XCircle, CheckCircle2, MessageSquare, StickyNote, Paperclip, Send, RotateCcw, Lock, PhoneCall, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Ticket } from '@/src/mockData/schoolServices';
import { cn } from '@/src/lib/utils';

interface TicketActionDropdownProps {
  ticket: Ticket;
  onAction: (action: string, ticketId: string) => void;
  isManager?: boolean;
}

export function TicketActionDropdown({ ticket, onAction, isManager }: TicketActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: string) => {
    if (['cancel', 'close', 'delete'].includes(action)) {
      if (!window.confirm(`Bạn có chắc chắn muốn thực hiện hành động này không?`)) {
        return;
      }
    }
    setIsOpen(false);
    onAction(action, ticket.id);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div 
        title="Thao tác" 
        className="inline-flex"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Button>
      </div>

      {isOpen && (
        <div 
          className="absolute right-full mr-2 top-0 z-50 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 focus:outline-none animate-in fade-in zoom-in-95 duration-200"
          style={{ minWidth: 'max-content' }}
        >
          {ticket.priority === 'urgent' && (
            <>
              <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-rose-500">
                Khẩn cấp
              </div>
              <button onClick={() => handleAction('call_now')} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-2 font-medium">
                <PhoneCall className="h-4 w-4" /> Gọi xử lý ngay
              </button>
              <button onClick={() => handleAction('set_sla')} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4" /> Gắn SLA xử lý
              </button>
              <button onClick={() => handleAction('report_manager')} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-2 font-medium">
                <ShieldAlert className="h-4 w-4" /> Báo BGH/Quản lý
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            </>
          )}

          <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
            Cơ bản
          </div>
          <button onClick={() => handleAction('view')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-400" /> Xem chi tiết
          </button>

          {['open', 'NEW', 'ASSIGNED'].includes(ticket.status) && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button onClick={() => handleAction('accept')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-500" /> Tiếp nhận
              </button>
              <button onClick={() => handleAction('assign')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-500" /> Phân công người xử lý
              </button>
              <button onClick={() => handleAction('change_priority')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Đổi ưu tiên
              </button>
              <button onClick={() => handleAction('change_category')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <FolderInput className="h-4 w-4 text-purple-500" /> Chuyển danh mục
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button onClick={() => handleAction('cancel')} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Hủy ticket
              </button>
              {isManager && (
                <button onClick={() => handleAction('escalate')} className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Chuyển cấp (Escalate)
                </button>
              )}
            </>
          )}

          {['in_progress', 'IN_PROGRESS'].includes(ticket.status) && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button onClick={() => handleAction('update_progress')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-500" /> Cập nhật tiến độ
              </button>
              <button onClick={() => handleAction('reply')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" /> Gửi phản hồi
              </button>
              <button onClick={() => handleAction('add_note')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-amber-500" /> Thêm ghi chú nội bộ
              </button>
              <button onClick={() => handleAction('attach')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-500" /> Đính kèm minh chứng
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button onClick={() => handleAction('resolve')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Đánh dấu đã giải quyết
              </button>
              {isManager && (
                <button onClick={() => handleAction('escalate')} className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30 flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" /> Chuyển cấp xử lý (Escalate)
                </button>
              )}
            </>
          )}

          {['resolved', 'RESOLVED'].includes(ticket.status) && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button onClick={() => handleAction('send_result')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-500" /> Gửi kết quả
              </button>
              <button onClick={() => handleAction('reopen')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-500" /> Mở lại ticket
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button onClick={() => handleAction('close')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium">
                <Lock className="h-4 w-4 text-slate-500" /> Đóng ticket
              </button>
              {isManager && (
                <>
                  <button onClick={() => handleAction('confirm_closed')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Phê duyệt (Confirm Close)
                  </button>
                  <button onClick={() => handleAction('reject')} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 flex items-center gap-2 font-medium">
                    <XCircle className="h-4 w-4" /> Từ chối giải quyết (Reject)
                  </button>
                </>
              )}
            </>
          )}

          {['closed', 'CLOSED'].includes(ticket.status) && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button onClick={() => handleAction('history')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" /> Xem lịch sử xử lý
              </button>
              <button onClick={() => handleAction('reopen_complaint')} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30 flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Mở lại (khiếu nại)
              </button>
            </>
          )}

        </div>
      )}
    </div>
  );
}
