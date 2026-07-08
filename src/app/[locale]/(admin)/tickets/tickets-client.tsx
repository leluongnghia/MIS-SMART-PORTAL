'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  createTicket, 
  assignTicket, 
  updateTicketStatus, 
  reopenTicket, 
  addTicketComment, 
  getTicketActivities,
  reassignTicket,
  rateTicket
} from './actions';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  UserCheck, 
  Plus, 
  Filter, 
  UserPlus, 
  Undo2, 
  AlertOctagon, 
  X, 
  Send,
  Loader2,
  ListFilter,
  CalendarClock,
  ArrowRightLeft,
  Star,
  BarChart2
} from 'lucide-react';
import type { Actor } from '@/src/libs/server/auth-helper';

type Ticket = {
  id: string;
  studentId: string | null;
  parentName: string;
  parentPhone: string | null;
  category: string;
  subject: string;
  description: string | null;
  priority: string;
  status: string;
  assignedTo: string | null;
  firstRespondedAt: Date | null;
  resolvedAt: Date | null;
  satisfactionRating: number | null;
  createdAt: Date;
  updatedAt: Date;
  assigneeName: string | null;
  slaBreached: boolean;
  hoursElapsed: number;
  slaHours: number;
  hoursRemaining: number;
  isOverdue: boolean;
  isNearOverdue: boolean;
  isUnassigned: boolean;
  isUrgentUnprocessed: boolean;
  deadline: Date | string;
  expectedResolutionDate?: Date | null | string;
};

type StaffUser = {
  id: string;
  name: string;
  role: string;
  title: string | null;
};

const CATEGORY_MAP: Record<string, { label: string; bg: string; text?: string }> = {
  academic: { label: 'Học vụ', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  admissions: { label: 'Tuyển sinh', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' },
  support: { label: 'Chăm sóc phụ huynh', bg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300' },
  services: { label: 'Dịch vụ học đường', bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300' },
  transport: { label: 'Xe đưa đón', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  meals: { label: 'Suất ăn / Căng tin', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  health: { label: 'Y tế học đường', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  facilities: { label: 'Cơ sở vật chất', bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
  pr: { label: 'Truyền thông', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
  events: { label: 'Sự kiện', bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' },
  urgent: { label: 'Khẩn cấp', bg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: 'Mới tạo', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' },
  received: { label: 'Đã tiếp nhận', color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400' },
  in_progress: { label: 'Đang xử lý', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400' },
  pending_response: { label: 'Chờ phản hồi', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400' },
  pending_approval: { label: 'Chờ duyệt', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400' },
  resolved: { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' },
  overdue: { label: 'Quá hạn', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400' },
  reopened: { label: 'Mở lại', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
  cancelled: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
};

const PRIORITY_MAP: Record<string, { label: string; color: string; border: string }> = {
  normal: { label: 'Thường', color: 'text-slate-600 bg-slate-50', border: 'border-l-slate-300' },
  high: { label: 'Cao', color: 'text-amber-700 bg-amber-50', border: 'border-l-amber-400' },
  urgent: { label: 'Khẩn', color: 'text-rose-700 bg-rose-50', border: 'border-l-rose-500' },
};

export default function TicketsClient({
  initialTickets,
  initialSlaBreaches,
  staffUsers,
  currentActor,
  students,
  classes,
  initialStats,
}: {
  initialTickets: Ticket[];
  initialSlaBreaches: Ticket[];
  staffUsers: StaffUser[];
  currentActor: Actor | null;
  students: { id: string; fullName: string; className: string | null }[];
  classes: { id: string; name: string }[];
  initialStats?: any;
}) {
  const [tickets] = useState<Ticket[]>(initialTickets);
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  // Interactive forms state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [showReassignForm, setShowReassignForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  const [assigneeId, setAssigneeId] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [commentText, setCommentText] = useState('');

  const [reassignForm, setReassignForm] = useState({
    category: '',
    assignedToId: '',
    priority: '',
    expectedResolutionDate: '',
    note: ''
  });

  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: '',
    isReopen: false
  });

  // Create Form State
  const [form, setForm] = useState({
    parentName: currentActor?.role === 'PARENT' ? currentActor.name : '',
    parentPhone: currentActor?.email || '',
    category: 'academic',
    subject: '',
    description: '',
    priority: 'normal',
  });

  // Load activities when selected ticket changes
  useEffect(() => {
    if (selected) {
      setLoadingActivities(true);
      getTicketActivities(selected.id)
        .then(res => setActivities(res))
        .catch(err => console.error(err))
        .finally(() => setLoadingActivities(false));
    } else {
      setActivities([]);
    }
  }, [selected]);

  // Filter Logic
  const filtered = tickets.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterAssignee && t.assignedTo !== filterAssignee) return false;
    return true;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open' || t.status === 'reopened').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    sla: tickets.filter(t => t.isOverdue).length,
    nearSla: tickets.filter(t => t.isNearOverdue).length,
    unassigned: tickets.filter(t => t.isUnassigned).length,
    urgentUnprocessed: tickets.filter(t => t.isUrgentUnprocessed).length,
  };

  const actorName = currentActor?.name || 'Nhân viên';
  const isAdmin = currentActor?.role === 'ADMIN' || currentActor?.role === 'SUPER_ADMIN' || currentActor?.workspaceId === 'BGH';
  const isDeptHead = currentActor?.role === 'MANAGER';
  const isParentOrStudent = currentActor?.role === 'PARENT' || currentActor?.role === 'STUDENT';

  // Handlers
  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createTicket(form);
      setShowCreateForm(false);
      setForm({
        parentName: currentActor?.role === 'PARENT' ? currentActor.name : '',
        parentPhone: currentActor?.email || '',
        category: 'academic',
        subject: '',
        description: '',
        priority: 'normal',
      });
      window.location.reload();
    });
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !assigneeId) return;
    startTransition(async () => {
      await assignTicket(selected.id, assigneeId, actorName);
      setShowAssignForm(false);
      window.location.reload();
    });
  }

  function handleReassign(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    startTransition(async () => {
      await reassignTicket(
        selected.id,
        reassignForm.category,
        reassignForm.assignedToId || null,
        reassignForm.expectedResolutionDate || null,
        reassignForm.priority,
        reassignForm.note,
        actorName
      );
      setShowReassignForm(false);
      window.location.reload();
    });
  }

  function handleRateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    startTransition(async () => {
      await rateTicket(
        selected.id,
        ratingForm.rating,
        ratingForm.comment,
        ratingForm.isReopen,
        actorName
      );
      setShowRatingForm(false);
      window.location.reload();
    });
  }

  function handleStatusChange(status: string, note?: string) {
    if (!selected) return;
    startTransition(async () => {
      await updateTicketStatus(selected.id, status, actorName, note);
      window.location.reload();
    });
  }

  function handleReopen(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !reopenReason.trim()) return;
    startTransition(async () => {
      await reopenTicket(selected.id, actorName, reopenReason);
      setShowReopenForm(false);
      setReopenReason('');
      window.location.reload();
    });
  }

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !commentText.trim()) return;
    startTransition(async () => {
      await addTicketComment(selected.id, actorName, commentText);
      setCommentText('');
      // Reload activities dynamically
      const res = await getTicketActivities(selected.id);
      setActivities(res);
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 p-4 lg:p-6 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Trung tâm Ticket</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tiếp nhận, xử lý và theo dõi phản hồi phản ánh dịch vụ học đường</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(isAdmin || isDeptHead) && (
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Danh sách
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                <BarChart2 className="w-4 h-4" /> Báo cáo
              </button>
            </div>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow transition-all text-sm font-semibold cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            Tạo Ticket mới
          </button>
        </div>
      </div>

      {/* SLA Alert */}
      {(stats.sla > 0 || stats.nearSla > 0 || stats.urgentUnprocessed > 0) && (
        <div className="flex flex-col gap-2 mb-6">
          {stats.sla > 0 && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 dark:bg-rose-950/20 dark:border-rose-900/50">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
              <p className="text-sm text-rose-800 dark:text-rose-300 font-semibold">
                Có {stats.sla} ticket đã vượt quá hạn cam kết SLA. Vui lòng xử lý khẩn cấp!
              </p>
            </div>
          )}
          {stats.nearSla > 0 && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 dark:bg-orange-950/20 dark:border-orange-900/50">
              <CalendarClock className="w-5 h-5 text-orange-600 shrink-0" />
              <p className="text-sm text-orange-800 dark:text-orange-300 font-semibold">
                Có {stats.nearSla} ticket sắp quá hạn (dưới 4 giờ). Cần tập trung xử lý ngay!
              </p>
            </div>
          )}
          {stats.urgentUnprocessed > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 dark:bg-red-950/20 dark:border-red-900/50">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
                Có {stats.urgentUnprocessed} ticket MỨC KHẨN CẤP chưa có người tiếp nhận!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng số ticket', value: stats.total, icon: MessageSquare, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
          { label: 'Chờ tiếp nhận / Mở lại', value: stats.open, icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Đang xử lý', value: stats.inProgress, icon: UserCheck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
          { label: 'Đã hoàn thành', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex items-center gap-4 shadow-3xs">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Layout (List Tab) */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Sidebar Filter and List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Filter Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-3xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <ListFilter className="w-4 h-4" />
              <span>Bộ lọc tìm kiếm</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:outline-none"
              >
                <option value="">Trạng thái (Tất cả)</option>
                {Object.entries(STATUS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:outline-none"
              >
                <option value="">Độ ưu tiên (Tất cả)</option>
                {Object.entries(PRIORITY_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:outline-none col-span-2"
              >
                <option value="">Loại vấn đề (Tất cả 11 loại)</option>
                {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              {!isParentOrStudent && (
                <select
                  value={filterAssignee}
                  onChange={e => setFilterAssignee(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:outline-none col-span-2"
                >
                  <option value="">Người phụ trách (Tất cả)</option>
                  <option value="unassigned">Chưa phân công</option>
                  {staffUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.title || 'Nhân viên'})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Ticket List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-3xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Danh sách hiển thị ({filtered.length})</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Không tìm thấy ticket nào</div>
              ) : filtered.map(t => {
                const priorityInfo = PRIORITY_MAP[t.priority] || PRIORITY_MAP.normal;
                const statusInfo = STATUS_MAP[t.status] || STATUS_MAP.open;
                const catInfo = CATEGORY_MAP[t.category] || { label: t.category, bg: 'bg-slate-50', text: 'text-slate-700' };

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-l-4 ${priorityInfo.border} ${selected?.id === t.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{t.subject}</span>
                      {t.slaBreached && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          Quá hạn
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{t.parentName}</span>
                      <span>·</span>
                      <span className={`px-2 py-0.5 rounded-md font-medium ${catInfo.bg} ${catInfo.text}`}>
                        {catInfo.label}
                      </span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-3xs p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-400 text-sm">
              <MessageSquare className="w-12 h-12 opacity-25 mb-3" />
              <p>Chọn một ticket từ danh sách bên trái để xem tiến độ và phản hồi</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-3xs p-5 lg:p-6 space-y-6">
              
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${CATEGORY_MAP[selected.category]?.bg} ${CATEGORY_MAP[selected.category]?.text}`}>
                      {CATEGORY_MAP[selected.category]?.label || selected.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_MAP[selected.priority]?.color}`}>
                      Ưu tiên: {PRIORITY_MAP[selected.priority]?.label}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{selected.subject}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Người gửi: <strong className="text-slate-700 dark:text-slate-300">{selected.parentName}</strong> {selected.parentPhone ? `(${selected.parentPhone})` : ''} · Gửi lúc: {new Date(selected.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_MAP[selected.status]?.color}`}>
                    {STATUS_MAP[selected.status]?.label}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Chi tiết nội dung:</h3>
                  {selected.description}
                </div>
              )}

              {/* Assignee & SLA Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Người phụ trách</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selected.assigneeName || 'Chưa phân công'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">SLA Cam kết</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selected.slaHours} giờ ({PRIORITY_MAP[selected.priority]?.label})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Hạn xử lý</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(selected.deadline).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Thời gian còn lại</span>
                  {selected.status === 'resolved' || selected.status === 'cancelled' ? (
                    <span className="font-bold text-slate-500">-</span>
                  ) : (
                    <span className={`font-bold ${selected.isOverdue ? 'text-rose-600' : selected.isNearOverdue ? 'text-orange-500' : 'text-emerald-600'}`}>
                      {selected.isOverdue ? `Quá hạn ${Math.abs(selected.hoursRemaining)} giờ` : `Còn ${selected.hoursRemaining} giờ`}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Workflow Box */}
              {!isParentOrStudent && (
                <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-3">Quy trình xử lý nghiệp vụ</h3>
                  
                  <div className="flex flex-wrap gap-2.5">
                    
                    {/* Reassign / SLA Action */}
                    {(isAdmin || isDeptHead) && (
                      <button
                        onClick={() => {
                          setReassignForm({
                            category: selected.category,
                            assignedToId: selected.assignedTo || '',
                            priority: selected.priority,
                            expectedResolutionDate: selected.expectedResolutionDate ? new Date(selected.expectedResolutionDate).toISOString().slice(0, 16) : '',
                            note: ''
                          });
                          setShowReassignForm(true);
                        }}
                        className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl hover:border-slate-300 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer shadow-3xs"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                        Phân công & SLA
                      </button>
                    )}

                    {/* Received status change */}
                    {selected.status === 'open' && (
                      <button
                        onClick={() => handleStatusChange('received', 'Nhân viên bắt đầu tiếp nhận')}
                        className="text-xs bg-sky-600 text-white px-3.5 py-2 rounded-xl hover:bg-sky-700 font-semibold cursor-pointer shadow-sm"
                      >
                        Tiếp nhận ticket
                      </button>
                    )}

                    {/* in_progress status change */}
                    {selected.status === 'received' && (
                      <button
                        onClick={() => handleStatusChange('in_progress', 'Đang thực hiện giải quyết')}
                        className="text-xs bg-amber-600 text-white px-3.5 py-2 rounded-xl hover:bg-amber-700 font-semibold cursor-pointer shadow-sm"
                      >
                        Bắt đầu xử lý
                      </button>
                    )}

                    {/* Resolve status change */}
                    {(selected.status === 'in_progress' || selected.status === 'reopened') && (
                      <>
                        <button
                          onClick={() => handleStatusChange('pending_response', 'Chờ phụ huynh bổ sung thông tin')}
                          className="text-xs bg-orange-500 text-white px-3.5 py-2 rounded-xl hover:bg-orange-600 font-semibold cursor-pointer shadow-sm"
                        >
                          Chờ phản hồi
                        </button>
                        <button
                          onClick={() => handleStatusChange('pending_approval', 'Gửi BGH phê duyệt hoàn thành')}
                          className="text-xs bg-purple-600 text-white px-3.5 py-2 rounded-xl hover:bg-purple-700 font-semibold cursor-pointer shadow-sm"
                        >
                          Chờ duyệt
                        </button>
                        <button
                          onClick={() => handleStatusChange('resolved', 'Đã xử lý xong')}
                          className="text-xs bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 font-semibold cursor-pointer shadow-sm"
                        >
                          Hoàn thành
                        </button>
                      </>
                    )}

                    {/* Pending response/approval resolve */}
                    {selected.status === 'pending_response' && (
                      <button
                        onClick={() => handleStatusChange('in_progress', 'Phụ huynh đã phản hồi, tiếp tục xử lý')}
                        className="text-xs bg-amber-600 text-white px-3.5 py-2 rounded-xl hover:bg-amber-700 font-semibold cursor-pointer shadow-sm"
                      >
                        Tiếp tục xử lý
                      </button>
                    )}

                    {selected.status === 'pending_approval' && isAdmin && (
                      <button
                        onClick={() => handleStatusChange('resolved', 'Phê duyệt hoàn thành bởi BGH')}
                        className="text-xs bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 font-semibold cursor-pointer shadow-sm"
                      >
                        Duyệt hoàn thành
                      </button>
                    )}

                    {/* Cancel button */}
                    {selected.status !== 'resolved' && selected.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Nhập lý do hủy ticket:');
                          if (reason) handleStatusChange('cancelled', reason);
                        }}
                        className="text-xs bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950 text-red-600 px-3.5 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold cursor-pointer shadow-3xs"
                      >
                        Hủy ticket
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Rating & Reopen Action (For Parent/Admin when ticket is resolved/cancelled) */}
              {(selected.status === 'resolved' || selected.status === 'cancelled') && (
                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Ticket đã được giải quyết</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selected.satisfactionRating 
                        ? `Đánh giá chất lượng: ${selected.satisfactionRating} sao.` 
                        : 'Vui lòng đánh giá chất lượng hỗ trợ. Nếu chưa hài lòng, bạn có thể gửi yêu cầu mở lại.'}
                    </p>
                  </div>
                  {!selected.satisfactionRating && (
                    <button
                      onClick={() => setShowRatingForm(true)}
                      className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-semibold cursor-pointer shadow-sm shrink-0"
                    >
                      <Star className="w-3.5 h-3.5" /> Đánh giá dịch vụ
                    </button>
                  )}
                </div>
              )}

              {/* Activity Logs & Comments */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Lịch sử xử lý & Trao đổi
                </h3>

                {/* Log Feed */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {loadingActivities ? (
                    <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Đang tải lịch sử...
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Chưa có lịch sử hoạt động</div>
                  ) : (
                    activities.map((act) => {
                      let iconColor = 'bg-slate-100 text-slate-500';
                      if (act.action === 'assign') iconColor = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400';
                      else if (act.action === 'status_change') iconColor = 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400';
                      else if (act.action === 'resolve') iconColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400';
                      else if (act.action === 'reopen') iconColor = 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400';

                      return (
                        <div key={act.id} className="flex gap-3 text-xs leading-normal">
                          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[9px] ${iconColor}`}>
                            {act.actorName?.[0] || 'A'}
                          </div>
                          <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <strong className="text-slate-800 dark:text-slate-200">{act.actorName}</strong>
                              <span className="text-[10px] text-slate-400">{new Date(act.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{act.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment Input */}
                {selected.status !== 'cancelled' && (
                  <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Viết phản hồi hoặc ghi chú nội bộ..."
                      className="flex-1 text-xs border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isPending || !commentText.trim()}
                      className="flex items-center justify-center bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Dashboard Layout (Dashboard Tab) */}
      {activeTab === 'dashboard' && initialStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-3xs">
              <div>
                <p className="text-slate-500 text-sm font-semibold mb-1">Điểm hài lòng (CSAT)</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{initialStats.avgRating} <span className="text-yellow-500 text-xl">★</span></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-3xs">
              <div>
                <p className="text-slate-500 text-sm font-semibold mb-1">Tỷ lệ hoàn thành đúng hạn</p>
                <div className="text-3xl font-black text-emerald-600">{initialStats.total > 0 ? Math.round(((initialStats.total - initialStats.overdue) / initialStats.total) * 100) : 100}%</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-3xs">
              <div>
                <p className="text-slate-500 text-sm font-semibold mb-1">Ticket phải mở lại</p>
                <div className="text-3xl font-black text-rose-600">{initialStats.reopened}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                <Undo2 className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Phân bổ theo bộ phận</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={initialStats.categoryCount} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {initialStats.categoryCount.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: string) => [value, CATEGORY_MAP[name]?.label || name]} />
                    <Legend formatter={(value: string) => CATEGORY_MAP[value]?.label || value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Khối lượng công việc theo nhân sự</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={initialStats.assigneeCount} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Ticket đang xử lý" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Ticket */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-3xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 relative">
            <button 
              onClick={() => setShowCreateForm(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tạo Ticket Yêu cầu/Phản ánh mới</h2>
            
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Tên người gửi *</label>
                  <input 
                    required 
                    value={form.parentName} 
                    onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} 
                    className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Thông tin liên hệ *</label>
                  <input 
                    required 
                    value={form.parentPhone} 
                    placeholder="Số điện thoại hoặc Email"
                    onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} 
                    className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Loại sự cố / Bộ phận</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                    className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-slate-900"
                  >
                    {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Độ khẩn cấp</label>
                  <select 
                    value={form.priority} 
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} 
                    className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-slate-900"
                  >
                    <option value="normal">Bình thường (48h)</option>
                    <option value="high">Cao (24h)</option>
                    <option value="urgent">Khẩn cấp (4h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Chủ đề yêu cầu *</label>
                <input 
                  required 
                  value={form.subject} 
                  placeholder="VD: Cấp lại thẻ đưa đón học sinh"
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Mô tả nội dung cụ thể</label>
                <textarea 
                  rows={4} 
                  value={form.description} 
                  placeholder="Ghi rõ chi tiết sự cố hoặc phản ánh để phòng ban dễ xử lý..."
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 resize-none" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)} 
                  className="flex-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Tạo Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reassign / SLA Ticket */}
      {showReassignForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-3xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 relative my-auto">
            <button 
              onClick={() => setShowReassignForm(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Phân công & Cập nhật SLA</h2>
            
            <form onSubmit={handleReassign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Bộ phận xử lý</label>
                  <select 
                    value={reassignForm.category} 
                    onChange={e => setReassignForm({...reassignForm, category: e.target.value})} 
                    className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-slate-900"
                  >
                    {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Mức độ ưu tiên</label>
                  <select 
                    value={reassignForm.priority} 
                    onChange={e => setReassignForm({...reassignForm, priority: e.target.value})} 
                    className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-slate-900"
                  >
                    <option value="low">Thấp (Định kỳ)</option>
                    <option value="normal">Bình thường (48h)</option>
                    <option value="high">Cao (24h)</option>
                    <option value="urgent">Khẩn cấp (Trong ngày)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Cán bộ phụ trách (Tùy chọn)</label>
                <select 
                  value={reassignForm.assignedToId} 
                  onChange={e => setReassignForm({...reassignForm, assignedToId: e.target.value})} 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-slate-900"
                >
                  <option value="">-- Chưa phân công --</option>
                  {staffUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.title || user.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Hạn xử lý mới (Tùy chọn)</label>
                <input 
                  type="datetime-local" 
                  value={reassignForm.expectedResolutionDate} 
                  onChange={e => setReassignForm({...reassignForm, expectedResolutionDate: e.target.value})} 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">Bỏ trống để hệ thống tự tính toán SLA theo độ ưu tiên</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Ghi chú phân công / chuyển giao</label>
                <textarea 
                  value={reassignForm.note} 
                  onChange={e => setReassignForm({...reassignForm, note: e.target.value})} 
                  placeholder="Lý do chuyển bộ phận, hoặc lưu ý xử lý..."
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-slate-900 min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowReassignForm(false)} 
                  className="flex-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Cập nhật phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reopen Ticket */}
      {showReopenForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-3xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setShowReopenForm(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Yêu cầu mở lại Ticket</h2>
            
            <form onSubmit={handleReopen} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Lý do mở lại *</label>
                <textarea 
                  required
                  rows={3}
                  value={reopenReason} 
                  placeholder="Ghi rõ lý do tại sao kết quả xử lý chưa đạt yêu cầu..."
                  onChange={e => setReopenReason(e.target.value)} 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowReopenForm(false)} 
                  className="flex-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || !reopenReason.trim()} 
                  className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Gửi yêu cầu mở lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: Rating Form */}
      {showRatingForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-3xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setShowRatingForm(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Đánh giá chất lượng dịch vụ</h2>
            
            <form onSubmit={handleRateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">Mức độ hài lòng của bạn</label>
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingForm({...ratingForm, rating: star})}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${ratingForm.rating >= star ? 'bg-yellow-100 text-yellow-500' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                    >
                      <Star className="w-5 h-5" fill={ratingForm.rating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Góp ý thêm (Không bắt buộc)</label>
                <textarea 
                  rows={2}
                  value={ratingForm.comment} 
                  placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                  onChange={e => setRatingForm({...ratingForm, comment: e.target.value})} 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              {ratingForm.rating <= 2 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-2 items-start text-xs text-rose-700">
                  <input
                    type="checkbox"
                    id="isReopen"
                    checked={ratingForm.isReopen}
                    onChange={e => setRatingForm({...ratingForm, isReopen: e.target.checked})}
                    className="mt-0.5 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isReopen" className="font-semibold cursor-pointer">
                    Tôi chưa hài lòng và muốn yêu cầu mở lại ticket để xử lý tiếp.
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
