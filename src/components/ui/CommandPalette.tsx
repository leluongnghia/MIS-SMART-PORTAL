'use client';
import { serverStorage } from '../../libs/client/server-storage';


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, X, Briefcase, ChevronRight, Layers, Layout, ListTodo, TrendingUp, 
  FileCheck, Users, Smartphone, CalendarDays, BookOpen, UserCheck, AlertCircle, 
  FileSpreadsheet, Clock, Star
} from 'lucide-react';
import { Task, UserProfile } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  tasks: Task[];
  users: UserProfile[];
  workspaces: any[];
  onOpenSection: (tab: any) => void;
  onOpenTask: (task: Task) => void;
  onOpenWorkspace: (workspaceId: string) => void;
  onOpenUser: (user: UserProfile) => void;
  onSearchQuerySubmit: (query: string) => void;
  getSafeAvatar: (avatar?: string, name?: string) => string;
  getStatusLabel: (status: string) => string;
}

interface CommandItem {
  id: string;
  type: 'SECTION' | 'TASK' | 'USER' | 'WORKSPACE';
  label: string;
  description: string;
  icon?: any;
  avatar?: string;
  payload: any;
}

export default function CommandPalette({
  isOpen,
  onClose,
  currentUser,
  tasks = [],
  users = [],
  workspaces = [],
  onOpenSection,
  onOpenTask,
  onOpenWorkspace,
  onOpenUser,
  onSearchQuerySubmit,
  getSafeAvatar,
  getStatusLabel,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State lưu lịch sử truy cập gần đây (lưu trữ trong server storage)
  const [recentItems, setRecentItems] = useState<CommandItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Load recent items from server storage
      try {
        const saved = serverStorage.getItem('mis_command_recent');
        if (saved) {
          setRecentItems(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading recent command items', e);
      }
      // Auto focus input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Hàm lưu một mục vừa truy cập vào lịch sử gần đây
  const saveToRecent = (item: CommandItem) => {
    const updated = [item, ...recentItems.filter(x => x.id !== item.id)].slice(0, 5);
    setRecentItems(updated);
    try {
      serverStorage.setItem('mis_command_recent', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const searchTerm = query.trim().toLowerCase();
  const matchesTerm = (...values: Array<string | undefined>) => {
    if (!searchTerm) return true;
    return values.some(value => value?.toLowerCase().includes(searchTerm));
  };

  // 1. Lọc Màn hình
  const sections = useMemo(() => {
    return [
      { id: 'DASHBOARD', label: 'Tổng quan điều hành', description: 'Bảng điều khiển, thống kê, hiệu suất', tab: 'DASHBOARD', icon: Layout },
      { id: 'TASKS', label: 'Quản lý công việc', description: 'Kanban, lịch biểu, danh sách việc', tab: 'TASKS', icon: ListTodo },
      { id: 'STRATEGY_OKRS', label: 'OKRs chiến lược', description: 'Mục tiêu, KPI, kết quả then chốt', tab: 'STRATEGY_OKRS', icon: TrendingUp },
      { id: 'WORKFLOW_APPROVALS', label: 'Phê duyệt quy trình', description: 'Hồ sơ, luồng duyệt, nhật ký', tab: 'WORKFLOW_APPROVALS', icon: FileCheck },
      { id: 'CRM_ADMISSIONS', label: 'CRM tuyển sinh', description: 'Phụ huynh, học sinh, chăm sóc', tab: 'CRM_ADMISSIONS', icon: Users },
      { id: 'PARENT_PORTAL', label: 'Cổng PHHS/Học sinh', description: 'Điểm, chuyên cần, học phí, thời khóa biểu, thư viện', tab: 'PARENT_PORTAL', icon: Smartphone },
      { id: 'ACADEMIC_OPS', label: 'Thời khóa biểu tổng', description: 'Lịch dạy tuần, giáo án, phân công giáo viên', tab: 'ACADEMIC_OPS', icon: CalendarDays },
      { id: 'LOGISTICS', label: 'Thư viện & Thiết bị', description: 'Sách, thiết bị, mượn trả, kiểm kê', tab: 'LOGISTICS', icon: BookOpen },
      { id: 'TEACHER_HR', label: 'Nhân sự giáo viên', description: 'Danh bạ, KPI, nghỉ phép', tab: 'TEACHER_HR', icon: UserCheck },
      { id: 'RISK_CENTER', label: 'Quản trị rủi ro', description: 'Cảnh báo, giám sát, xử lý', tab: 'RISK_CENTER', icon: AlertCircle },
      { id: 'ANALYTICS', label: 'Báo cáo phân tích', description: 'Báo cáo, biểu đồ, truy vấn', tab: 'ANALYTICS', icon: FileSpreadsheet }
    ]
      .filter(item => matchesTerm(item.label, item.description))
      .slice(0, 6)
      .map(item => ({
        id: `section_${item.id}`,
        type: 'SECTION' as const,
        label: item.label,
        description: item.description,
        icon: item.icon,
        payload: item.tab
      }));
  }, [searchTerm]);

  // 2. Lọc Công việc
  const matchedTasks = useMemo(() => {
    return tasks
      .filter(task => matchesTerm(task.title, task.description, task.assignedName, task.createdBy, task.tag))
      .slice(0, 6)
      .map(task => ({
        id: `task_${task.id}`,
        type: 'TASK' as const,
        label: task.title,
        description: `${task.assignedName} · ${getStatusLabel(task.status)} · ${task.deadline}`,
        icon: Briefcase,
        payload: task
      }));
  }, [tasks, searchTerm]);

  // 3. Lọc Nhân sự
  const matchedUsers = useMemo(() => {
    return users
      .filter(user => matchesTerm(user.name, user.title, user.roleName))
      .slice(0, 5)
      .map(user => ({
        id: `user_${user.id}`,
        type: 'USER' as const,
        label: user.name,
        description: `${translateTitle(user.title)} (${user.roleName})`,
        avatar: getSafeAvatar(user.avatar, user.name),
        payload: user
      }));
  }, [users, searchTerm]);

  // Helper dịch title tiếng Việt gọn
  function translateTitle(title?: string) {
    if (!title) return '';
    return title;
  }

  // 4. Lọc Bộ phận (Workspaces)
  const matchedWorkspaces = useMemo(() => {
    return workspaces
      .filter(workspace => matchesTerm(workspace.name, workspace.description))
      .slice(0, 5)
      .map(workspace => ({
        id: `workspace_${workspace.id}`,
        type: 'WORKSPACE' as const,
        label: workspace.name,
        description: workspace.description || '',
        icon: Layers,
        payload: workspace.id
      }));
  }, [workspaces, searchTerm]);

  // Danh sách phẳng chứa tất cả kết quả để điều hướng mũi tên lên/xuống dễ dàng
  const filteredResults = useMemo(() => {
    if (!searchTerm) {
      return recentItems;
    }
    return [...sections, ...matchedTasks, ...matchedUsers, ...matchedWorkspaces];
  }, [searchTerm, sections, matchedTasks, matchedUsers, matchedWorkspaces, recentItems]);

  useEffect(() => {
    // Reset selected index khi danh sách kết quả thay đổi
    setSelectedIndex(0);
  }, [filteredResults]);

  // Hàm xử lý khi chọn một mục
  const handleSelectItem = (item: CommandItem) => {
    saveToRecent(item);
    
    if (item.type === 'SECTION') {
      onOpenSection(item.payload);
    } else if (item.type === 'TASK') {
      onOpenTask(item.payload);
    } else if (item.type === 'WORKSPACE') {
      onOpenWorkspace(item.payload);
    } else if (item.type === 'USER') {
      onOpenUser(item.payload);
    }
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && selectedIndex < filteredResults.length) {
        handleSelectItem(filteredResults[selectedIndex]);
      } else if (query.trim()) {
        onSearchQuerySubmit(query.trim());
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/45 backdrop-blur-xs px-3 pt-20 md:pt-24 print:hidden">
      {/* Background overlay click closure */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      
      {/* Palette Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up font-sans">
        
        {/* Input header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 shrink-0 text-indigo-650 dark:text-indigo-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm nhanh chức năng, công việc, nhân sự, bộ phận... (↑↓ di chuyển, Enter chọn)"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-850 dark:text-white outline-none placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-450 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            title="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 text-left">
          
          {/* Header Label */}
          <div className="mb-2.5 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            <span>{searchTerm ? 'Kết quả tìm kiếm' : 'Tìm kiếm nhanh & Gần đây'}</span>
            <span className="rounded-md border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 font-mono normal-case text-slate-500">Esc đóng</span>
          </div>

          {/* Render flat results */}
          {filteredResults.length > 0 ? (
            <div className="space-y-1">
              
              {/* Nếu không có search query, hiển thị tiêu đề "Gần đây" */}
              {!searchTerm && (
                <div className="px-1 py-1.5 text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Mục truy cập gần đây
                </div>
              )}

              {filteredResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/70 dark:border-indigo-600 dark:bg-indigo-950/30' 
                        : 'border-transparent hover:border-slate-200/60 dark:hover:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    {/* Icon or Avatar */}
                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.label} 
                        className="h-8 w-8 shrink-0 rounded-lg object-cover border border-white dark:border-slate-800" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-4xs ${
                        isSelected 
                          ? 'bg-white text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {Icon ? <Icon className="h-4.5 w-4.5" /> : <Layers className="h-4.5 w-4.5" />}
                      </span>
                    )}

                    {/* Text Label & Desc */}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                        {item.label}
                        {item.type === 'SECTION' && (
                          <span className="text-[8px] font-black uppercase bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-1 py-0.2 rounded font-mono">Chức năng</span>
                        )}
                        {item.type === 'TASK' && (
                          <span className="text-[8px] font-black uppercase bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1 py-0.2 rounded font-mono">Công việc</span>
                        )}
                        {item.type === 'USER' && (
                          <span className="text-[8px] font-black uppercase bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 px-1 py-0.2 rounded font-mono">Nhân sự</span>
                        )}
                        {item.type === 'WORKSPACE' && (
                          <span className="text-[8px] font-black uppercase bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 px-1 py-0.2 rounded font-mono">Tổ bộ phận</span>
                        )}
                      </span>
                      <span className="block truncate text-[11px] font-semibold text-slate-450 dark:text-slate-400 mt-0.5">{item.description}</span>
                    </span>

                    {/* End arrow/action */}
                    <span className="shrink-0 flex items-center gap-1">
                      {isSelected && (
                        <span className="text-[9.5px] font-mono font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded shadow-3xs">Enter</span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-10 text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Không tìm thấy kết quả phù hợp</p>
              <p className="mt-1 text-xs text-slate-400">Nhấn Enter để áp dụng từ khóa này "{query}" vào bộ lọc danh sách công việc chính.</p>
            </div>
          )}

        </div>

        {/* Footer info helper */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] text-slate-400">
          <span>Sử dụng phím <kbd className="font-mono bg-white dark:bg-slate-800 px-1 rounded border">↑</kbd> <kbd className="font-mono bg-white dark:bg-slate-800 px-1 rounded border">↓</kbd> để duyệt và <kbd className="font-mono bg-white dark:bg-slate-800 px-1 rounded border">Enter</kbd> để kích hoạt</span>
          <span className="font-bold text-slate-500">MIS Smart Portal 2026</span>
        </div>

      </div>
    </div>
  );
}
