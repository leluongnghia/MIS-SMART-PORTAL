'use client';

import React, { useState, useMemo } from 'react';
import { Bell, Megaphone, Calendar, CheckCircle2, Info, ChevronRight, Inbox, Trash2 } from 'lucide-react';
import Drawer from './ui/Drawer';
import { Announcement, BoardDirective, Task } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
  directives: BoardDirective[];
  tasks: Task[];
  currentUser: any;
  onViewTask?: (task: Task) => void;
  onViewDirective?: (directive: BoardDirective) => void;
}

type TabType = 'all' | 'announcements' | 'directives' | 'tasks';

export default function NotificationDrawer({
  isOpen,
  onClose,
  announcements = [],
  directives = [],
  tasks = [],
  currentUser,
  onViewTask,
  onViewDirective,
}: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Lọc thông báo cho user hiện tại (ví dụ: filter theo targetRoles nếu có)
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      if (!a.targetRoles || a.targetRoles.length === 0) return true;
      return a.targetRoles.includes(currentUser?.role);
    });
  }, [announcements, currentUser]);

  // Lọc chỉ đạo liên quan đến user (ví dụ: được giao hoặc tạo bởi user, hoặc thuộc phòng ban của user)
  const filteredDirectives = useMemo(() => {
    return directives.filter(d => {
      if (currentUser?.role === 'ADMIN') return true;
      // Trưởng phòng hoặc giáo viên liên quan
      return d.senderId === currentUser?.id || d.implementations?.some(imp => imp.userId === currentUser?.id);
    });
  }, [directives, currentUser]);

  // Lọc tasks liên quan: các task chờ duyệt (nếu là quản lý) hoặc task được giao sắp trễ hạn
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Task chờ duyệt
      if (t.status === 'CHO_DUYET' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER')) {
        return true;
      }
      // Task của bản thân sắp đến hạn hoặc trễ hạn
      const isMyTask = t.assignedId === currentUser?.id;
      if (isMyTask && (t.status === 'CHUA_BAT_DA' || t.status === 'DANG_TIEN_HANH')) {
        // Kiểm tra xem có trễ hạn hoặc sắp đến hạn không (VD: trong vòng 2 ngày)
        if (t.deadline) {
          const due = new Date(t.deadline).getTime();
          const now = Date.now();
          const diff = due - now;
          return diff < 2 * 24 * 60 * 60 * 1000; // trễ hạn hoặc < 2 ngày
        }
      }
      return false;
    });
  }, [tasks, currentUser]);

  // Gộp tất cả các loại thông báo để hiển thị tab "Tất cả"
  const allNotifications = useMemo(() => {
    const items = [
      ...filteredAnnouncements.map(a => ({
        id: a.id,
        type: 'announcement' as const,
        title: a.title,
        content: a.content,
        time: a.createdAt,
        sender: a.senderName,
        senderTitle: a.senderTitle,
        isMeeting: a.isMeeting,
        originalData: a,
      })),
      ...filteredDirectives.map(d => ({
        id: d.id,
        type: 'directive' as const,
        title: d.title,
        content: d.content,
        time: d.createdAt,
        sender: d.senderName,
        senderTitle: 'Ban Giám Hiệu',
        isMeeting: false,
        originalData: d,
      })),
      ...filteredTasks.map(t => {
        let title = '';
        let content = '';
        if (t.status === 'CHO_DUYET') {
          title = `Nhiệm vụ cần phê duyệt`;
          content = `"${t.title}" đang chờ bạn phê duyệt hoàn thành.`;
        } else {
          title = `Nhiệm vụ sắp đến hạn`;
          content = `"${t.title}" có hạn chót vào ngày ${t.deadline}.`;
        }
        return {
          id: t.id,
          type: 'task' as const,
          title,
          content,
          time: t.createdAt,
          sender: 'Hệ thống',
          senderTitle: 'Hệ thống tự động',
          isMeeting: false,
          originalData: t,
        };
      }),
    ];

    // Sắp xếp theo thời gian giảm dần
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [filteredAnnouncements, filteredDirectives, filteredTasks]);

  const itemsToDisplay = useMemo(() => {
    if (activeTab === 'all') return allNotifications;
    if (activeTab === 'announcements') {
      return allNotifications.filter(n => n.type === 'announcement');
    }
    if (activeTab === 'directives') {
      return allNotifications.filter(n => n.type === 'directive');
    }
    if (activeTab === 'tasks') {
      return allNotifications.filter(n => n.type === 'task');
    }
    return [];
  }, [activeTab, allNotifications]);

  const getIcon = (type: string, isMeeting: boolean) => {
    if (isMeeting) return <Calendar className="w-4 h-4 text-amber-500" />;
    if (type === 'announcement') return <Bell className="w-4 h-4 text-indigo-500" />;
    if (type === 'directive') return <Megaphone className="w-4 h-4 text-rose-500" />;
    return <Info className="w-4 h-4 text-emerald-500" />;
  };

  const getBgColor = (type: string, isMeeting: boolean) => {
    if (isMeeting) return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400';
    if (type === 'announcement') return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400';
    if (type === 'directive') return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450';
    return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400';
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('vi-VN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const handleItemClick = (item: any) => {
    if (item.type === 'task' && onViewTask) {
      onViewTask(item.originalData as Task);
    } else if (item.type === 'directive' && onViewDirective) {
      onViewDirective(item.originalData as BoardDirective);
    } else if (item.type === 'announcement' && item.isMeeting && onViewTask) {
      // Nếu là cuộc họp, chuyển hướng phù hợp hoặc xử lý
    }
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Trung tâm Thông báo"
      description="Xem tất cả cập nhật, chỉ đạo và cuộc họp của trường"
      width="md"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Tất cả ({allNotifications.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Thông báo ({allNotifications.filter(n => n.type === 'announcement').length})
        </button>
        <button
          onClick={() => setActiveTab('directives')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'directives'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Chỉ đạo ({allNotifications.filter(n => n.type === 'directive').length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Nhiệm vụ ({allNotifications.filter(n => n.type === 'task').length})
        </button>
      </div>

      {/* Notifications list */}
      <div className="p-4 space-y-3">
        {itemsToDisplay.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
              Hộp thông báo trống
            </p>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Bạn đã xử lý hết mọi thông tin của hôm nay. Hãy tiếp tục duy trì!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {itemsToDisplay.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-950 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-all duration-200 cursor-pointer flex gap-3 group relative overflow-hidden"
              >
                {/* Left icon wrapper */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getBgColor(item.type, item.isMeeting)}`}>
                  {getIcon(item.type, item.isMeeting)}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500">
                      {item.sender}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {formatTime(item.time)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-normal line-clamp-2">
                    {item.content}
                  </p>

                  {/* Add action hint */}
                  {(item.type === 'task' || item.type === 'directive') && (
                    <div className="mt-2 flex items-center gap-1 text-[9.5px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
