'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createTask, updateTaskStatus, seedTasks } from './actions';
import { APPROVAL_MOCK_DATA, SEED_TASKS } from './tasks.constants';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  Filter,
  Plus,
  MoreVertical,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Paperclip
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Dialog } from '@/src/components/ui/dialog';
import { cn } from '@/src/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';

// constants moved to tasks.constants.ts

type TaskRow = {
  id?: string;
  title?: string;
  description?: string | null;
  workspaceId?: string;
  assignedName?: string | null;
  assignedId?: string | null;
  deadline?: string | null;
  status?: string;
  priority?: string;
  tag?: string | null;
  createdAt?: string | Date | null;
};

const STATUS_COLUMNS = [
  { title: 'Cần làm', statuses: ['CHUA_BAT_DA', 'todo', 'received', 'open', 'new'] },
  { title: 'Đang xử lý', statuses: ['DANG_TIEN_HANH', 'in_progress', 'doing', 'processing'] },
  { title: 'Chờ duyệt', statuses: ['CHO_DUYET', 'pending_approval', 'pending', 'review'] },
  { title: 'Hoàn thành', statuses: ['HOAN_THANH', 'completed', 'done', 'closed'] },
];

const formatTaskDate = (deadline?: string | Date | null) => {
  if (!deadline) return 'Không có hạn';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return String(deadline);
  return date.toLocaleDateString('vi-VN');
};

const TERMINAL_STATUSES = new Set(['HOAN_THANH', 'completed', 'done', 'closed', 'canceled', 'cancelled', 'archived', 'ARCHIVED', 'HUY']);

const getTaskDate = (task: TaskRow) => {
  const raw = task.deadline || task.createdAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinDateRange = (task: TaskRow, from: string, to: string) => {
  const date = getTaskDate(task);
  if (!date) return false;
  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (date < start) return false;
  }
  if (to) {
    const end = new Date(`${to}T23:59:59.999`);
    if (date > end) return false;
  }
  return true;
};

const isOverdueTask = (task: TaskRow) => {
  if (!task.deadline || TERMINAL_STATUSES.has(String(task.status || ''))) return false;
  const date = new Date(task.deadline);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
};

export type OverdueLevel = "NONE" | "LIGHT" | "MEDIUM" | "HIGH" | "CRITICAL";

export const getOverdueDays = (task: TaskRow): number => {
  if (!task.deadline || TERMINAL_STATUSES.has(String(task.status || ''))) return 0;
  const deadline = new Date(task.deadline).getTime();
  const now = Date.now();
  if (now <= deadline) return 0;
  return Math.floor((now - deadline) / (1000 * 60 * 60 * 24));
};

export const getOverdueLevel = (task: TaskRow): OverdueLevel => {
  const days = getOverdueDays(task);
  if (days === 0) return "NONE";
  if (days > 14 || task.priority === 'URGENT') return "CRITICAL";
  if (days >= 8) return "HIGH";
  if (days >= 3) return "MEDIUM";
  return "LIGHT";
};

export const getOverdueLevelColor = (level: OverdueLevel) => {
  switch (level) {
    case "LIGHT": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "MEDIUM": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "HIGH": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "CRITICAL": return "bg-rose-600 text-white dark:bg-rose-600 dark:text-white";
    default: return "";
  }
};

export default function TasksDashboard({ initialData, defaultTab, defaultTaskId }: { initialData?: { data?: TaskRow[] }, defaultTab?: string, defaultTaskId?: string }) {
  const tasksList = initialData?.data || [];
  const workspaces = (initialData as any)?.workspaces || [];
  const users = (initialData as any)?.users || [];
  const params = useParams();
  const locale = params?.locale || 'vi';

  const [isPending, startTransition] = useTransition();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newWorkspaceId, setNewWorkspaceId] = useState('');
  const [newAssignedId, setNewAssignedId] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTag, setNewTag] = useState('');

  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(
    defaultTaskId ? tasksList.find((t) => t.id === defaultTaskId) : null
  );
  const [isTaskOpen, setIsTaskOpen] = useState(!!defaultTaskId);
  const [selectedApprovalTaskId, setSelectedApprovalTaskId] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'in_progress' | 'overdue' | 'pending' | 'completed' | null>(null);
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'reports'>(defaultTab === 'list' ? 'list' : defaultTab === 'reports' ? 'reports' : 'kanban');
  const [taskTab, setTaskTab] = useState<'details' | 'comments' | 'attachments' | 'history' | 'extension'>('details');
  const today = new Date();
  const defaultDateTo = today.toISOString().slice(0, 10);
  const defaultDateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);

  const filteredTasks = useMemo(
    () => tasksList.filter((task) => isWithinDateRange(task, dateFrom, dateTo)),
    [tasksList, dateFrom, dateTo]
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // optional logic during drag over
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // active.data could have current status
    const overStatus = over.data.current?.status;
    const task = tasksList.find(t => t.id === activeIdStr);

    if (task && overStatus && task.status !== overStatus) {
      // Optimistic update logic could go here, or just trigger server action
      startTransition(async () => {
        const res = await updateTaskStatus(activeIdStr, overStatus);
        if (!res.success) {
          alert('Lỗi cập nhật: ' + res.error);
        }
      });
    }
  };

  const handleApproveTask = (taskId: string) => {
    startTransition(async () => {
      const res = await updateTaskStatus(taskId, 'HOAN_THANH');
      if (res.success) {
        setIsTaskOpen(false);
        setSelectedTask(null);
      } else {
        alert('Lỗi phê duyệt: ' + res.error);
      }
    });
  };

  const handleRejectTask = (taskId: string) => {
    startTransition(async () => {
      const res = await updateTaskStatus(taskId, 'DANG_TIEN_HANH');
      if (res.success) {
        setIsTaskOpen(false);
        setSelectedTask(null);
      } else {
        alert('Lỗi yêu cầu chỉnh sửa: ' + res.error);
      }
    });
  };

  const filteredUsers = newWorkspaceId 
    ? users.filter((u: any) => u.workspaceId === newWorkspaceId)
    : users;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newWorkspaceId || !newAssignedId) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (Tiêu đề, Phòng ban, Người phụ trách)');
      return;
    }

    startTransition(async () => {
      const res = await createTask({
        title: newTitle,
        description: newDescription,
        workspaceId: newWorkspaceId,
        assignedId: newAssignedId,
        priority: newPriority,
        deadline: newDeadline || undefined,
        tag: newTag || undefined,
      });

      if (res.success) {
        setIsCreateOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewWorkspaceId('');
        setNewAssignedId('');
        setNewPriority('medium');
        setNewDeadline('');
        setNewTag('');
      } else {
        alert('Lỗi: ' + res.error);
      }
    });
  };

  const getCardsByStatus = (statuses: string[]) => filteredTasks
    .filter(task => {
      if (!statuses.includes(String(task.status || ''))) return false;
      if (activeFilter === 'in_progress') {
        return ['DANG_TIEN_HANH', 'in_progress', 'doing', 'processing'].includes(String(task.status));
      }
      if (activeFilter === 'overdue') {
        return isOverdueTask(task);
      }
      if (activeFilter === 'pending') {
        return ['CHO_DUYET', 'pending_approval', 'pending', 'review'].includes(String(task.status));
      }
      if (activeFilter === 'completed') {
        return ['HOAN_THANH', 'completed', 'done', 'closed'].includes(String(task.status));
      }
      return true;
    })
    .map(task => ({
      id: task.id,
      title: task.title || 'Công việc chưa đặt tên',
      description: task.description || '',
      user: task.assignedName || task.assignedId || 'Chưa phân công',
      date: formatTaskDate(task.deadline),
      tag: task.priority === 'high' || isOverdueTask(task) ? (isOverdueTask(task) ? 'Quá hạn' : 'Ưu tiên') : task.tag || undefined,
      tagCol: isOverdueTask(task) ? 'bg-orange-100 text-orange-700' : task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
      payload: (task as any).payload,
    }));
  const kanbanColumns = STATUS_COLUMNS.map(column => {
    const cards = getCardsByStatus(column.statuses);
    return { ...column, count: cards.length, cards };
  });
  const totalTasks = filteredTasks.length;
  const pendingApprovalTasks = filteredTasks.filter(task => 
    ['CHO_DUYET', 'pending_approval', 'pending', 'review'].includes(String(task.status || ''))
  );

  const selectedApprovalTask = useMemo(() => {
    return pendingApprovalTasks.find(t => t.id === selectedApprovalTaskId) || pendingApprovalTasks[0] || filteredTasks.find(t => t.status === 'CHO_DUYET');
  }, [pendingApprovalTasks, selectedApprovalTaskId, filteredTasks]);

  const approvalDetails = useMemo(() => {
    if (!selectedApprovalTask) return null;
    const title = selectedApprovalTask.title || '';
    const matchedKey = Object.keys(APPROVAL_MOCK_DATA).find(key => title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase()));
    
    if (matchedKey) {
      return (APPROVAL_MOCK_DATA as any)[matchedKey];
    }
    
    return {
      code: selectedApprovalTask.id || 'DX-DYNAMIC',
      dept: selectedApprovalTask.workspaceId || 'Chuyên môn',
      user: selectedApprovalTask.assignedName || 'Thành viên',
      deadline: selectedApprovalTask.deadline ? formatTaskDate(selectedApprovalTask.deadline) : 'Chưa đặt hạn',
      purpose: selectedApprovalTask.description || 'Đề xuất phê duyệt công việc chuyên môn học kỳ.',
      budget: 'N/A',
      items: [
        { name: selectedApprovalTask.title, qty: 1, price: 'N/A', total: 'N/A' }
      ],
      attachments: [],
      timeline: [
        { step: 1, role: 'Lập đề xuất', user: selectedApprovalTask.assignedName || 'Thành viên', date: formatTaskDate(selectedApprovalTask.createdAt), done: true },
        { step: 2, role: 'Ban Giám hiệu', user: 'Chờ duyệt', date: '', active: true }
      ]
    };
  }, [selectedApprovalTask]);
  const inProgressCount = filteredTasks.filter(task => ['DANG_TIEN_HANH', 'in_progress', 'doing', 'processing'].includes(String(task.status))).length;
  const overdueCount = filteredTasks.filter(isOverdueTask).length;
  const pendingCount = filteredTasks.filter(task => ['CHO_DUYET', 'pending_approval', 'pending', 'review'].includes(String(task.status))).length;
  const completedCount = filteredTasks.filter(task => ['HOAN_THANH', 'completed', 'done', 'closed'].includes(String(task.status))).length;
  const completionRate = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;
  const taskStatsData = [
    { name: 'Cần làm', value: kanbanColumns[0]?.count || 0, color: '#3b82f6' },
    { name: 'Đang xử lý', value: inProgressCount, color: '#f59e0b' },
    { name: 'Chờ duyệt', value: pendingCount, color: '#8b5cf6' },
    { name: 'Hoàn thành', value: completedCount, color: '#10b981' },
  ];
  const chartTotal = Math.max(totalTasks, 1);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Công việc & Quy trình phê duyệt
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý công việc, theo dõi tiến độ và các quy trình phê duyệt
          </p>
        </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="block w-40 rounded-md border-0 py-1.5 pl-3 pr-8 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
              <option>Tất cả quy trình</option>
            </select>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:bg-slate-900 dark:border-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="bg-transparent text-xs outline-none dark:text-slate-100"
                aria-label="Từ ngày"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="bg-transparent text-xs outline-none dark:text-slate-100"
                aria-label="Đến ngày"
              />
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" /> Tạo công việc
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={cn(
            "border-blue-100 shadow-sm dark:border-blue-900/30 transition-all cursor-pointer hover:shadow-md",
            activeFilter === 'in_progress' && "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
          )}
          onClick={() => {
            setActiveFilter(activeFilter === 'in_progress' ? null : 'in_progress');
            scrollToSection('kanban-board');
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Việc đang thực hiện</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</h3>
                  <span className="text-xs font-medium text-emerald-600">Từ dữ liệu DB</span>
                </div>
              </div>
            </div>
            <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-orange-100 shadow-sm dark:border-orange-900/30 transition-all cursor-pointer hover:shadow-md",
            activeFilter === 'overdue' && "ring-2 ring-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
          )}
          onClick={() => {
            setActiveFilter(activeFilter === 'overdue' ? null : 'overdue');
            scrollToSection('kanban-board');
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quá hạn</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{overdueCount}</h3>
                  <span className="text-xs font-medium text-red-500">Đang quá hạn</span>
                </div>
              </div>
            </div>
            <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-purple-100 shadow-sm dark:border-purple-900/30 transition-all cursor-pointer hover:shadow-md",
            activeFilter === 'pending' && "ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
          )}
          onClick={() => {
            setActiveFilter(activeFilter === 'pending' ? null : 'pending');
            scrollToSection('approvals-section');
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Chờ phê duyệt</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{pendingCount}</h3>
                  <span className="text-xs font-medium text-emerald-600">Chờ xử lý</span>
                </div>
              </div>
            </div>
            <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">Xem chi tiết</Button>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-emerald-100 shadow-sm dark:border-emerald-900/30 transition-all cursor-pointer hover:shadow-md",
            activeFilter === 'completed' && "ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
          )}
          onClick={() => {
            setActiveFilter(activeFilter === 'completed' ? null : 'completed');
            scrollToSection('kanban-board');
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tỷ lệ hoàn thành</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</h3>
                  <span className="text-xs font-medium text-emerald-600">{completedCount}/{totalTasks || 0} việc</span>
                </div>
              </div>
            </div>
            <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">Xem chi tiết</Button>
          </CardContent>
        </Card>
      </div>

      {/* Work board: Kanban + List View */}
      <div className="w-full" id="kanban-board">
        <Tabs className="w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-fit border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <TabsTrigger active={activeView === 'kanban'} onClick={() => setActiveView('kanban')}>
                Bảng chung
              </TabsTrigger>
              <TabsTrigger active={activeView === 'list'} onClick={() => setActiveView('list')}>
                Công việc của tôi
              </TabsTrigger>
              <TabsTrigger active={activeView === 'reports'} onClick={() => setActiveView('reports')}>
                Thống kê & Báo cáo
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Link href={`/${locale}/tasks/overdue`}>
                <Button onClick={() => alert('Tính năng đang được phát triển')} type="button" 
                  variant="outline"
                  className="h-10 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 shadow-sm"
                >
                  <Clock className="mr-2 h-4 w-4" /> Trung tâm xử lý quá hạn
                </Button>
              </Link>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="h-10 bg-emerald-600 px-5 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Thêm công việc mới
              </Button>
            </div>
          </div>

          {filteredTasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              Không có công việc trong khoảng ngày đã chọn.
            </div>
          )}

          {activeFilter && (
            <div className="px-3 py-2 bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-205">
              <span>
                Đang hiển thị danh sách: <strong className="text-blue-900 dark:text-blue-200">{
                  activeFilter === 'in_progress' ? 'Việc đang thực hiện' :
                  activeFilter === 'overdue' ? 'Việc quá hạn' :
                  activeFilter === 'pending' ? 'Việc chờ phê duyệt' : 'Việc đã hoàn thành'
                }</strong>
              </span>
              <button 
                onClick={() => setActiveFilter(null)} 
                className="text-blue-700 dark:text-blue-400 hover:text-blue-950 dark:hover:text-blue-200 font-bold underline cursor-pointer"
              >
                Hiển thị tất cả
              </button>
            </div>
          )}

          <TabsContent value="kanban" activeValue={activeView} className="mt-0">
            <Card className="flex flex-col h-[650px] w-full overflow-hidden">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <CardContent className="p-4 flex-1 overflow-x-auto custom-scrollbar flex gap-4 bg-slate-50/50 dark:bg-slate-900/30">
                  {kanbanColumns.map((col, i) => (
                    <div key={i} className="min-w-[220px] flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {col.title} <Badge className={cn("px-1.5 py-0", col.title === 'Cần làm' ? 'bg-blue-100 text-blue-700' : col.title === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' : col.title === 'Chờ duyệt' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>{col.count}</Badge>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                        {col.cards.map((card, j) => {
                          const isOverdue = isOverdueTask(card);
                          const overdueDays = getOverdueDays(card);
                          const overdueLevel = getOverdueLevel(card);
                          const overdueColor = getOverdueLevelColor(overdueLevel);
                          
                          return (
                            <div 
                              key={card.id || j} 
                              onClick={() => {
                                setSelectedTask({ ...card, status: col.title });
                                setIsTaskOpen(true);
                              }}
                              className={cn(
                                "bg-white dark:bg-slate-950 p-3 rounded-lg shadow-sm relative group cursor-pointer hover:border-blue-400 dark:hover:border-blue-800 transition-colors border-l-4",
                                isOverdue ? "border-y border-r border-slate-200 dark:border-slate-800" : "border border-slate-200 dark:border-slate-800",
                                isOverdue && overdueLevel === 'LIGHT' ? "border-l-amber-400" : 
                                isOverdue && overdueLevel === 'MEDIUM' ? "border-l-orange-500" : 
                                isOverdue && overdueLevel === 'HIGH' ? "border-l-red-500" : 
                                isOverdue && overdueLevel === 'CRITICAL' ? "border-l-rose-700 bg-rose-50/30 dark:bg-rose-950/10" : "border-l-transparent"
                              )}
                            >
                              <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="ghost" size="icon" className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100"><MoreVertical className="h-3 w-3" /></Button>
                              <h4 className="text-xs font-bold leading-snug pr-6 mb-2">{card.title}</h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                                <UserCircle className="h-3 w-3" /> {card.user}
                              </div>
                              <div className={cn("flex items-center gap-1.5 text-[10px] mb-3 font-medium", isOverdue ? "text-red-500" : "text-slate-500")}>
                                <CalendarIcon className="h-3 w-3" /> {card.date}
                              </div>
                              
                              {isOverdue && (
                                <div className="mb-3 flex flex-col gap-1 items-start">
                                  <Badge className={cn("text-[9px] px-1.5 py-0 border-0 uppercase", overdueColor)}>
                                    Quá hạn {overdueDays} ngày
                                  </Badge>
                                  {(!card.payload?.overdueReason) && (
                                    <span className="text-[9px] text-red-500 animate-pulse italic">Chưa cập nhật lý do!</span>
                                  )}
                                </div>
                              )}

                              <div className="flex justify-between items-end">
                                {card.tag ? <Badge className={cn("text-[9px] py-0 border-0", card.tagCol)}>{card.tag}</Badge> : <div />}
                                <div className="flex -space-x-1">
                                  <img src={`https://i.pravatar.cc/150?u=${i}${j}1`} className="w-5 h-5 rounded-full border border-white dark:border-slate-950 object-cover" alt="Người tham gia" />
                                  <img src={`https://i.pravatar.cc/150?u=${i}${j}2`} className="w-5 h-5 rounded-full border border-white dark:border-slate-950 object-cover" alt="Người tham gia" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsCreateOpen(true)}
                          className="w-full text-xs text-blue-600 gap-1 mt-2 bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800"
                        >
                          <Plus className="h-3 w-3" /> Thêm công việc
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </DndContext>
            </Card>
          </TabsContent>

          <TabsContent value="list" activeValue={activeView} className="mt-0">
            <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
              <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <CardTitle className="text-base font-bold">Danh sách công việc</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Công việc</TableHead>
                      <TableHead>Người phụ trách</TableHead>
                      <TableHead>Hạn chót</TableHead>
                      <TableHead>Ưu tiên</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => {
                      const statusLabel = STATUS_COLUMNS.find((col) => col.statuses.includes(String(task.status || '')))?.title || 'Khác';
                      return (
                        <TableRow key={task.id} className="cursor-pointer" onClick={() => { setSelectedTask({ ...task, user: task.assignedName || task.assignedId || 'Chưa phân công', date: formatTaskDate(task.deadline), status: statusLabel }); setIsTaskOpen(true); }}>
                          <TableCell>
                            <div className="font-bold text-slate-900 dark:text-white">{task.title || 'Công việc chưa đặt tên'}</div>
                            <div className="line-clamp-1 text-xs text-slate-500">{task.description || task.tag || 'Không có mô tả'}</div>
                          </TableCell>
                          <TableCell className="text-sm">{task.assignedName || 'Chưa phân công'}</TableCell>
                          <TableCell className={cn("text-sm font-medium", isOverdueTask(task) && "text-orange-600")}>{formatTaskDate(task.deadline)}</TableCell>
                          <TableCell>
                            <Badge className={cn("border-0", task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700')}>
                              {task.priority === 'high' ? 'Cao' : task.priority === 'low' ? 'Thấp' : 'Trung bình'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border-0", statusLabel === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' : statusLabel === 'Chờ duyệt' ? 'bg-purple-100 text-purple-700' : statusLabel === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700')}>
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedTask({ ...task, user: task.assignedName || task.assignedId || 'Chưa phân công', date: formatTaskDate(task.deadline), status: statusLabel }); setIsTaskOpen(true); }}>
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" activeValue={activeView} className="mt-0">
            <Card className="border-slate-200 shadow-sm dark:border-slate-800">
              <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <CardTitle className="text-base font-bold">Thống kê & Báo cáo</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Biểu đồ công việc theo trạng thái</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taskStatsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {taskStatsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Công việc theo phòng ban</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={workspaces.map((w: any) => ({
                            name: w.name,
                            total: filteredTasks.filter(t => t.workspaceId === w.id).length,
                            completed: filteredTasks.filter(t => t.workspaceId === w.id && ['HOAN_THANH', 'completed', 'done', 'closed'].includes(String(t.status))).length,
                            overdue: filteredTasks.filter(t => t.workspaceId === w.id && isOverdueTask(t)).length
                          }))}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{fontSize: 12}} />
                          <YAxis tick={{fontSize: 12}} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name="Tổng số" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="completed" name="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="overdue" name="Quá hạn" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Row 2: Grid containing Process Detail and Pending Approvals side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">
        
        {/* Left Card: Process Detail */}
        <Card className="xl:col-span-7 h-[650px] flex flex-col">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Quy trình phê duyệt</CardTitle>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Tính năng đang được phát triển'); }}  className="text-xs font-medium text-blue-600">Xem tất cả</a>
          </CardHeader>
          <CardContent className="p-6 flex-1 overflow-y-auto">
            {approvalDetails ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="font-bold text-sm">Quy trình: {selectedApprovalTask?.title}</h3>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-[10px] px-1.5 py-0">Đang thực hiện</Badge>
                </div>
                
                {/* Timeline Graphic */}
                <div className="relative flex justify-between mb-8 px-4">
                  <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800" />
                  <div className="absolute top-4 left-6 h-1 bg-blue-600" style={{ width: approvalDetails.timeline.some((s: any) => s.step === 2 && s.done) ? '50%' : '25%' }} />
                  
                  {approvalDetails.timeline.map((s: any, idx: number) => (
                    <div key={idx} className="relative flex flex-col items-center z-10 w-16">
                      {s.sla && <div className="absolute -top-6 text-[9px] text-slate-400 whitespace-nowrap">{s.sla}</div>}
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ring-4 ring-white dark:ring-slate-950", 
                        s.done ? "bg-blue-600 border-blue-600 text-white" : 
                        s.active ? "bg-orange-500 border-orange-500 text-white" : 
                        "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                      )}>
                        {s.done ? <FileText className="h-4 w-4" /> : s.step}
                      </div>
                      <div className="text-center mt-2">
                        <p className={cn("text-[10px] font-bold leading-tight", s.active ? "text-orange-600" : "text-slate-700 dark:text-slate-300")}>{s.role}</p>
                        <p className="text-[9px] text-slate-500 truncate w-20">{s.user}</p>
                        {s.date && <p className={cn("text-[9px]", s.active ? "text-orange-600 font-medium" : "text-slate-400")}>{s.date}</p>}
                        {s.done && <CheckCircle2 className="h-3 w-3 text-emerald-500 mx-auto mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold">Thông tin đề xuất</h4>
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Mã đề xuất</span><span className="font-medium">{approvalDetails.code}</span></div>
                      <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Người đề xuất</span><span className="font-medium">{approvalDetails.user}</span></div>
                      <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Phòng/Bộ phận</span><span className="font-medium">{approvalDetails.dept}</span></div>
                      <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Ngày tạo</span><span className="font-medium">{approvalDetails.deadline}</span></div>
                      <div className="grid grid-cols-1 gap-1"><span className="text-slate-500">Mục đích</span><p className="text-slate-700 dark:text-slate-300">{approvalDetails.purpose}</p></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold">Chi tiết chi phí</h4>
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2"><span className="text-slate-500">Ngân sách dự chi</span><span className="font-bold text-blue-600">{approvalDetails.budget || 'N/A'}</span></div>
                      {approvalDetails.items?.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-slate-500 block font-bold text-[10px]">Hạng mục:</span>
                          {approvalDetails.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                              <span>{item.name} (x{item.qty})</span>
                              <span className="font-bold">{item.total}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Chọn một yêu cầu để xem quy trình chi tiết
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Pending Approvals in the sidebar */}
        <div className="xl:col-span-5 space-y-6 h-[650px] flex flex-col" id="approvals-section">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-4 pb-0 border-b border-transparent">
              <CardTitle className="text-base font-bold">Danh sách chờ phê duyệt</CardTitle>
            </CardHeader>
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 font-bold text-xs gap-4">
              <button className="pb-2 border-b-2 border-blue-600 text-blue-600">Của tôi ({pendingApprovalTasks.length})</button>
              <button className="pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700">Tất cả ({pendingApprovalTasks.length})</button>
            </div>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
              {pendingApprovalTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">Không có yêu cầu chờ phê duyệt nào</div>
              ) : (
                pendingApprovalTasks.map((task, i) => (
                  <div 
                    key={task.id || i} 
                    onClick={() => {
                      setSelectedApprovalTaskId(task.id || '');
                    }}
                    className={cn(
                      "p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors border-l-4",
                      selectedApprovalTask?.id === task.id
                        ? "border-l-blue-600 bg-blue-50/30 dark:bg-blue-950/10"
                        : "border-l-transparent"
                    )}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{task.title}</h4>
                      <p className="text-[10px] text-slate-500">Mã: {task.id} · Phòng ban: {task.workspaceId}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><UserCircle className="h-3 w-3" /> {task.assignedName || 'Chưa phân công'}</span>
                      <span className="text-red-500 font-medium">{formatTaskDate(task.deadline)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask({ ...task, status: 'Chờ duyệt' });
                          setIsTaskOpen(true);
                        }}
                        className="flex-1 h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-xs"
                      >
                        Xem & Duyệt
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Pending Approval Details Dialog */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen} title="Phê duyệt yêu cầu">
        {selectedApproval && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{selectedApproval.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedApproval.code} · Bộ phận: {selectedApproval.dept}</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0">Chờ phê duyệt</Badge>
            </div>
            
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Mục đích đề xuất:</p>
              <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                {selectedApproval.purpose}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Kinh phí đề xuất:</p>
              <p className="font-black text-blue-600 text-sm">{selectedApproval.budget}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Chi tiết hạng mục:</p>
              <table className="w-full text-left border border-slate-200 dark:border-slate-850 rounded overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500">
                  <tr>
                    <th className="p-2">Hạng mục</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {selectedApproval.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-right">{item.price}</td>
                      <td className="p-2 text-right font-bold text-slate-800 dark:text-slate-200">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Tệp đính kèm:</p>
              <div className="flex flex-wrap gap-2">
                {selectedApproval.attachments?.map((file: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px]">
                    <FileText className="h-3.5 w-3.5 text-red-500" />
                    <span className="font-medium truncate max-w-[150px]">{file}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Luồng phê duyệt:</p>
              <div className="space-y-2 pl-2 border-l-2 border-blue-500 dark:border-l-blue-900">
                {selectedApproval.timeline?.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="font-medium">{step.role}: <span className="font-bold">{step.user}</span></span>
                    <span className="text-slate-400">{step.date || 'Chờ xử lý'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Ý kiến phê duyệt:</label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Nhập phản hồi/lý do..."
                rows={2}
                className="w-full text-xs p-2 rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-850 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <Button 
                onClick={() => {
                  alert('Phê duyệt thành công đề xuất ' + selectedApproval.code);
                  setIsApprovalOpen(false);
                  setApprovalNote('');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-9"
              >
                Duyệt thông qua
              </Button>
              <Button 
                onClick={() => {
                  alert('Đã từ chối đề xuất ' + selectedApproval.code);
                  setIsApprovalOpen(false);
                  setApprovalNote('');
                }}
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-rose-50 hover:text-red-700 text-xs h-9"
              >
                Từ chối đề xuất
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Kanban Task Details Dialog */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen} title="Chi tiết công việc">
        {selectedTask && (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{selectedTask.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5">Người phụ trách: {selectedTask.user}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block">Thời hạn:</span>
                <span className="font-bold flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> {selectedTask.date}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Trạng thái hiện tại:</span>
                <Badge className={cn("px-2 py-0 border-0 font-bold text-[10px]", 
                  selectedTask.status === 'Cần làm' ? 'bg-blue-100 text-blue-700' :
                  selectedTask.status === 'Đang xử lý' ? 'bg-amber-100 text-amber-700' :
                  selectedTask.status === 'Chờ duyệt' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                )}>{selectedTask.status}</Badge>
              </div>
            </div>

            {/* Enhanced Dialog Tabs */}
            <Tabs className="w-full">
              <TabsList className="w-full border-b border-slate-200 dark:border-slate-800 rounded-none bg-transparent h-auto p-0 justify-start">
                <TabsTrigger active={taskTab === 'details'} onClick={() => setTaskTab('details')} className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent py-2">Chi tiết</TabsTrigger>
                <TabsTrigger active={taskTab === 'comments'} onClick={() => setTaskTab('comments')} className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent py-2">Bình luận</TabsTrigger>
                <TabsTrigger active={taskTab === 'attachments'} onClick={() => setTaskTab('attachments')} className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent py-2">Tệp đính kèm</TabsTrigger>
                <TabsTrigger active={taskTab === 'history'} onClick={() => setTaskTab('history')} className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent py-2">Lịch sử</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" activeValue={taskTab} className="pt-4 space-y-4">
                
                {isOverdueTask(selectedTask) && !selectedTask.payload?.overdueReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-3 text-red-800 dark:text-red-300 animate-in fade-in slide-in-from-top-1">
                    <p className="text-xs font-bold mb-2 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> BẮT BUỘC: Cập nhật lý do quá hạn
                    </p>
                    <p className="text-[10px] mb-3 opacity-80">
                      Công việc đã quá hạn. Theo quy định vận hành, bạn cần phải cập nhật nguyên nhân / khó khăn hiện tại.
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nhập lý do quá hạn..." 
                        id={`reason-${selectedTask.id}`}
                        className="flex-1 text-xs p-2 rounded border border-red-200 dark:border-red-800 bg-white dark:bg-slate-950 focus:ring-1 focus:ring-red-500" 
                      />
                      <Button 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs h-auto"
                        onClick={async () => {
                          const val = (document.getElementById(`reason-${selectedTask.id}`) as HTMLInputElement)?.value;
                          if (!val?.trim()) { alert("Lý do không được bỏ trống!"); return; }
                          // optimistic update could go here, or real server action
                          alert("Đã cập nhật lý do: " + val);
                        }}
                      >
                        Lưu lý do
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTask.payload?.overdueReason && (
                  <div className="space-y-1 text-xs bg-red-50/50 dark:bg-red-900/10 p-3 rounded border border-red-100 dark:border-red-900/30">
                    <span className="text-red-700 dark:text-red-400 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Lý do quá hạn:
                    </span>
                    <p className="text-red-600 dark:text-red-300 italic">
                      {selectedTask.payload.overdueReason}
                    </p>
                  </div>
                )}

                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 block">Mô tả công việc:</span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description || 'Nhiệm vụ thuộc kế hoạch chiến lược phát triển chuyên môn học kỳ.'}
                  </p>
                </div>

                {isOverdueTask(selectedTask) && selectedTask.payload?.deadlineExtensionStatus !== 'PENDING' && selectedTask.payload?.deadlineExtensionStatus !== 'APPROVED' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      variant="outline"
                      className="w-full text-xs text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      onClick={() => setTaskTab('extension')} // Add tab logic for extension later, or just simple prompt for now
                    >
                      Xin gia hạn thời gian
                    </Button>
                  </div>
                )}

                {selectedTask.payload?.deadlineExtensionStatus === 'PENDING' && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-2 rounded text-xs text-orange-700 dark:text-orange-400 flex justify-between items-center">
                    <span>Đang chờ duyệt gia hạn đến {formatTaskDate(selectedTask.payload?.proposedNewDueDate)}</span>
                    <Badge className="bg-orange-100 text-orange-700 border-0">PENDING</Badge>
                  </div>
                )}

                {selectedTask.status === 'Chờ duyệt' ? (
                  <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      onClick={() => handleApproveTask(selectedTask.id)}
                      disabled={isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs h-9 font-bold"
                    >
                      {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : null}
                      Duyệt hoàn thành
                    </Button>
                    <Button 
                      onClick={() => handleRejectTask(selectedTask.id)}
                      variant="outline"
                      disabled={isPending}
                      className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 text-xs h-9 font-bold"
                    >
                      {isPending ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-orange-600/20 border-t-orange-600" /> : null}
                      Yêu cầu chỉnh sửa
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={() => setIsTaskOpen(false)} className="text-xs h-9">
                      Đóng
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments" activeValue={taskTab} className="pt-4 space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedTask.payload?.comments?.length > 0 ? selectedTask.payload.comments.map((c: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.authorName?.charAt(0) || 'U'}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-3 flex-1 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{c.authorName}</span>
                          <span className="text-[10px] text-slate-400">{formatTaskDate(c.createdAt)}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{c.content}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-xs text-slate-500 py-4">Chưa có bình luận nào.</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Nhập bình luận..." className="flex-1 text-xs p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-1 focus:ring-blue-500" />
                  <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  className="h-auto text-xs bg-blue-600 hover:bg-blue-700">Gửi</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="attachments" activeValue={taskTab} className="pt-4 space-y-4">
                <div className="space-y-2">
                  {selectedTask.payload?.attachments?.length > 0 ? selectedTask.payload.attachments.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-blue-500" />
                        <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">{a.name}</a>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatTaskDate(a.uploadedAt)}</span>
                    </div>
                  )) : (
                    <div className="text-center text-xs text-slate-500 py-4">Chưa có tệp đính kèm nào.</div>
                  )}
                </div>
                <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="outline" className="w-full text-xs border-dashed border-2 py-6 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Plus className="h-4 w-4 mr-1" /> Thêm đính kèm
                </Button>
              </TabsContent>

              <TabsContent value="history" activeValue={taskTab} className="pt-4 space-y-4">
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800"></div>
                  {selectedTask.payload?.history?.length > 0 ? selectedTask.payload.history.map((h: any, i: number) => (
                    <div key={i} className="relative flex gap-4 text-xs">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-2 border-blue-500 flex items-center justify-center shrink-0 z-10 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-900 dark:text-white">{h.actorName}</strong> {h.action.toLowerCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatTaskDate(h.timestamp)}</p>
                      </div>
                    </div>
                  )).reverse() : (
                    <div className="text-center text-xs text-slate-500 py-4 ml-6">Không có lịch sử thay đổi.</div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="extension" activeValue={taskTab} className="pt-4 space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg text-orange-800 dark:text-orange-300">
                    <p className="text-xs font-bold mb-1">Quy trình xin gia hạn deadline</p>
                    <p className="text-[10px]">Yêu cầu gia hạn sẽ được gửi đến người phân công để phê duyệt. Vui lòng cung cấp lý do chính đáng và thời gian hoàn thành dự kiến mới hợp lý.</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hạn chót hiện tại</label>
                    <div className="text-xs p-2 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-slate-500 line-through">
                      {formatTaskDate(selectedTask.deadline)}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Đề xuất hạn chót mới <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      id={`ext-date-${selectedTask.id}`}
                      className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Lý do & Kế hoạch hoàn thành <span className="text-red-500">*</span></label>
                    <textarea 
                      rows={3}
                      id={`ext-reason-${selectedTask.id}`}
                      placeholder="Trình bày lý do xin gia hạn và kế hoạch đảm bảo tiến độ..." 
                      className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  
                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setTaskTab('details')} className="text-xs h-8">
                      Hủy
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
                      onClick={() => {
                        const date = (document.getElementById(`ext-date-${selectedTask.id}`) as HTMLInputElement)?.value;
                        const reason = (document.getElementById(`ext-reason-${selectedTask.id}`) as HTMLTextAreaElement)?.value;
                        if (!date || !reason?.trim()) {
                          alert('Vui lòng chọn ngày mới và nhập lý do!');
                          return;
                        }
                        alert(`Đã gửi yêu cầu gia hạn đến ${date} với lý do: ${reason}`);
                        setTaskTab('details');
                      }}
                    >
                      Gửi yêu cầu phê duyệt
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Dialog>

      {/* Modern Add Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Tạo công việc mới">
        <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Tiêu đề công việc <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800 focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Workspace / Phòng ban */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Tổ chuyên môn / Phòng ban <span className="text-red-500">*</span></label>
              <select
                required
                value={newWorkspaceId}
                onChange={(e) => {
                  setNewWorkspaceId(e.target.value);
                  setNewAssignedId(''); // reset assigned user when department changes
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Chọn phòng ban --</option>
                {workspaces.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Người phụ trách */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Người phụ trách <span className="text-red-500">*</span></label>
              <select
                required
                value={newAssignedId}
                onChange={(e) => setNewAssignedId(e.target.value)}
                disabled={!newWorkspaceId}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800 focus:ring-1 focus:ring-blue-500 bg-white disabled:opacity-50"
              >
                <option value="">{newWorkspaceId ? "-- Chọn người phụ trách --" : "-- Hãy chọn phòng ban trước --"}</option>
                {filteredUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.roleName || u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Thời hạn */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Hạn chót</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Nhãn dán */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Nhãn dán</label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="VD: Kế hoạch, Giáo án..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Priority / Mức độ ưu tiên */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Mức độ ưu tiên</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'low', label: 'Thấp', activeCol: 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
                { val: 'medium', label: 'Trung bình', activeCol: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400' },
                { val: 'high', label: 'Cao', activeCol: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-955/20 dark:text-red-400' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setNewPriority(p.val)}
                  className={cn(
                    "py-2 px-3 text-xs border rounded-lg font-bold text-center transition-all cursor-pointer",
                    newPriority === p.val 
                      ? p.activeCol
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Mô tả chi tiết</label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Nhập nội dung mô tả chi tiết công việc..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800 focus:ring-1 focus:ring-blue-500 bg-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 text-xs h-9"
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0 text-xs h-9 font-bold"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Đang tạo...
                </>
              ) : 'Tạo công việc'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Lịch</CardTitle>
            <div className="text-xs font-bold">Tháng 5, 2025</div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center text-slate-500 text-sm py-8 border border-dashed rounded-lg">Calendar Placeholder</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Hạn chót sắp tới</CardTitle>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Tính năng đang được phát triển'); }}  className="text-xs font-medium text-blue-600">Xem tất cả</a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { title: 'Đề xuất mua sắm thiết bị CNTT', user: 'Phê duyệt bởi: Nguyễn Văn Nam', deadline: 'Hạn: Hôm nay 17:00', tag: 'Quá hạn', tagCol: 'text-red-600 bg-red-50' },
                { title: 'Kế hoạch tổ chức Ngày hội STEM', user: 'Phê duyệt bởi: Nguyễn Văn Nam', deadline: 'Hạn: 1 ngày nữa', tag: 'Sắp đến hạn', tagCol: 'text-orange-600 bg-orange-50' },
                { title: 'Quy chế chi tiêu nội bộ 2025-2026', user: 'Phê duyệt bởi: Nguyễn Văn Nam', deadline: 'Hạn: 2 ngày nữa', tag: 'Sắp đến hạn', tagCol: 'text-orange-600 bg-orange-50' },
              ].map((item, i) => (
                <div key={i} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0">D</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.user}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <span className={cn("text-[10px] font-medium", item.deadline.includes('Hôm nay') ? "text-red-500" : "text-orange-500")}>{item.deadline}</span>
                    <Badge  className={cn("border-0 text-[9px] px-1.5 py-0 mt-0.5", item.tagCol)}>{item.tag}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Thống kê theo trạng thái</CardTitle>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Tính năng đang được phát triển'); }}  className="text-xs font-medium text-blue-600">Xem báo cáo</a>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {taskStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{fontSize: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{totalTasks}</span>
                <span className="text-[9px] text-slate-500">Tổng công việc</span>
              </div>
            </div>
            <div className="space-y-3 text-xs w-32">
              {taskStatsData.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {item.value} <span className="text-[9px] text-slate-400 font-normal">({Math.round((item.value / chartTotal) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
