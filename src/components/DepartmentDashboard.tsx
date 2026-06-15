import React, { useMemo, useState, useEffect } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  RotateCcw,
  UserCheck,
  Users,
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Clock,
  XCircle,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react';
import { Task, UserProfile, Workspace, TaskStatus } from '../types';

interface DepartmentDashboardProps {
  tasks: Task[];
  users: UserProfile[];
  workspaces: Workspace[];
  currentUser: UserProfile;
  tab?: string;
  onViewTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus, evidence?: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
  onNavigateTab: (tab: string) => void;
}

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'tasks', label: 'Công việc nội bộ', icon: CheckSquare },
  { id: 'giaoan', label: 'Duyệt giáo án', icon: FileText },
  { id: 'nghiphep', label: 'Đề xuất nghỉ phép', icon: UserCheck },
  { id: 'schedule', label: 'Thời khóa biểu', icon: CalendarDays },
  { id: 'members', label: 'Thành viên tổ', icon: Users },
];

// Sample lesson plans (per workspace)
const lessonPlanSamples = [
  {
    id: 'lp-1',
    title: 'Chuyên đề hàm số bậc hai và ứng dụng',
    teacherId: 'user_nam',
    submittedAt: '2026-06-12',
    fileName: 'giao-an-ham-so-bac-hai.pdf',
    status: 'CHO_DUYET',
    workspaceId: 'TOAN_TIN',
  },
  {
    id: 'lp-2',
    title: 'Tích hợp AI trong tiết Tin học 10',
    teacherId: 'user_phong',
    submittedAt: '2026-06-11',
    fileName: 'ai-tin-hoc-10.docx',
    status: 'CHO_DUYET',
    workspaceId: 'TOAN_TIN',
  },
  {
    id: 'lp-3',
    title: 'Phân tích tác phẩm Truyện Kiều',
    teacherId: 'user_lan',
    submittedAt: '2026-06-13',
    fileName: 'truyen-kieu-phan-tich.pdf',
    status: 'CHO_DUYET',
    workspaceId: 'VAN',
  },
  {
    id: 'lp-4',
    title: 'Thực hành viết đoạn văn nghị luận',
    teacherId: 'user_nhung',
    submittedAt: '2026-06-10',
    fileName: 'nghi-luan-thuc-hanh.docx',
    status: 'DA_DUYET',
    workspaceId: 'VAN',
  },
  {
    id: 'lp-5',
    title: 'Phản ứng hóa học lớp 10',
    teacherId: 'user_khtn_mgr',
    submittedAt: '2026-06-14',
    fileName: 'hoa-hoc-10.pdf',
    status: 'CHO_DUYET',
    workspaceId: 'KHTN',
  },
];

const leaveRequests = [
  {
    id: 'leave-1',
    teacherId: 'user_nam',
    period: 'Thứ 4, tiết 3',
    reason: 'Khám sức khỏe định kỳ',
    replacementHint: 'Thầy Bùi Hải Phong đang trong lịch trống tiết này.',
    workspaceId: 'TOAN_TIN',
  },
  {
    id: 'leave-2',
    teacherId: 'user_phong',
    period: 'Thứ 6, tiết 2',
    reason: 'Công tác chuyên môn',
    replacementHint: 'Cô Nguyễn Mai Chi có thể hỗ trợ thay thế.',
    workspaceId: 'TOAN_TIN',
  },
  {
    id: 'leave-3',
    teacherId: 'user_nhung',
    period: 'Thứ 3, tiết 4',
    reason: 'Việc gia đình',
    replacementHint: 'Cô Nguyễn Thanh Lan có thể hỗ trợ.',
    workspaceId: 'VAN',
  },
];

// Mini schedule mock
const scheduleData = [
  { day: 'Thứ 2', periods: ['Toán 10A1 - P.201', 'Toán 11B2 - P.203', '', 'Tin học 10A3 - P.Lab1', '', ''] },
  { day: 'Thứ 3', periods: ['', 'Toán 10A2 - P.201', 'Tin học 11B1 - P.Lab2', '', 'Toán 12A1 - P.205', ''] },
  { day: 'Thứ 4', periods: ['Tin học 10A1 - P.Lab1', '', 'Toán 11B3 - P.202', 'Toán 10A4 - P.201', '', ''] },
  { day: 'Thứ 5', periods: ['', 'Tin học 12A2 - P.Lab2', '', '', 'Toán 10A1 - P.201', 'Toán 11B2 - P.203'] },
  { day: 'Thứ 6', periods: ['Toán 12A3 - P.205', 'Toán 10A5 - P.201', '', 'Tin học 10A2 - P.Lab1', '', ''] },
];

export default function DepartmentDashboard({
  tasks,
  users,
  workspaces,
  currentUser,
  tab,
  onViewTask,
  onUpdateStatus,
  onRejectTask,
  onNavigateTab,
}: DepartmentDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(tab || 'overview');
  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [approvedPlans, setApprovedPlans] = useState<Record<string, boolean>>({});
  const [rejectedPlans, setRejectedPlans] = useState<Record<string, boolean>>({});
  const [confirmedLeave, setConfirmedLeave] = useState<Record<string, boolean>>({});
  const [rejectedLeave, setRejectedLeave] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const newUrl = tabId === 'overview'
      ? window.location.pathname
      : `${window.location.pathname}?tab=${tabId}`;
    window.history.pushState(null, '', newUrl);
    onNavigateTab(tabId);
  };

  const workspace = workspaces.find((item) => item.id === currentUser.workspaceId);
  const departmentUsers = users.filter((user) => user.workspaceId === currentUser.workspaceId && user.role !== 'ADMIN');
  const departmentTasks = tasks.filter((task) => task.workspaceId === currentUser.workspaceId);
  const pendingReports = departmentTasks.filter((task) => task.status === 'CHO_DUYET');
  const inProgressTasks = departmentTasks.filter((task) => task.status === 'DANG_TIEN_HANH');
  const completedTasks = departmentTasks.filter((task) => task.status === 'HOAN_THANH');

  const memberProgress = useMemo(() => {
    return departmentUsers.map((user) => {
      const assigned = departmentTasks.filter((task) => task.assignedId === user.id);
      const completed = assigned.filter((task) => task.status === 'HOAN_THANH').length;
      const overdue = assigned.filter((task) => task.status !== 'HOAN_THANH' && task.deadline < new Date().toISOString().slice(0, 10)).length;
      const total = assigned.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { user, total, completed, overdue, percent };
    });
  }, [departmentTasks, departmentUsers]);

  const scopedLessonPlans = lessonPlanSamples
    .filter((plan) => plan.workspaceId === currentUser.workspaceId)
    .map((plan) => ({ ...plan, teacher: users.find((u) => u.id === plan.teacherId) }));

  const scopedLeaveRequests = leaveRequests
    .filter((req) => req.workspaceId === currentUser.workspaceId)
    .map((req) => ({ ...req, teacher: users.find((u) => u.id === req.teacherId) }));

  const handleReject = (taskId: string) => {
    const note = rejectNotes[taskId]?.trim();
    if (!note) return;
    onRejectTask(taskId, note);
    setRejectingTaskId(null);
    setRejectNotes((prev) => ({ ...prev, [taskId]: '' }));
  };

  // ─── Header ───────────────────────────────────────────────────────────────
  const Header = (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg mb-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 font-mono">
            Department Dashboard
          </p>
          <h2 className="text-xl font-black mt-1">{workspace?.name || currentUser.workspaceId}</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Xin chào, {currentUser.name} · {currentUser.title || currentUser.roleName}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-[260px]">
          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2 text-center">
            <p className="text-[9px] font-black uppercase text-indigo-100">Chờ duyệt</p>
            <p className="text-2xl font-black">{pendingReports.length}</p>
          </div>
          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2 text-center">
            <p className="text-[9px] font-black uppercase text-indigo-100">Thành viên</p>
            <p className="text-2xl font-black">{departmentUsers.length}</p>
          </div>
          <div className="rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2 text-center">
            <p className="text-[9px] font-black uppercase text-indigo-100">Hoàn thành</p>
            <p className="text-2xl font-black">{completedTasks.length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Tab Bar ──────────────────────────────────────────────────────────────
  const TabBar = (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-5 overflow-x-auto">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );

  // ─── Tab: Tổng quan ───────────────────────────────────────────────────────
  const OverviewTab = (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* Left: pending reports */}
      <section className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Hộp thư báo cáo chờ duyệt</h3>
          </div>
          <button type="button" onClick={() => handleTabChange('tasks')} className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {pendingReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 py-10 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Không có báo cáo nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReports.slice(0, 3).map((task) => (
              <article key={task.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-xs">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{task.assignedName}</p>
                    <button type="button" onClick={() => onViewTask(task)} className="mt-1 text-left text-sm font-black text-slate-900 dark:text-white hover:text-indigo-700 hover:underline">
                      {task.title}
                    </button>
                    <blockquote className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {task.reportEvidence || 'Chưa có nội dung minh chứng. Mở chi tiết để kiểm tra.'}
                    </blockquote>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={() => onUpdateStatus(task.id, 'HOAN_THANH')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700">
                      <Check className="w-3.5 h-3.5" /> Duyệt
                    </button>
                    <button type="button" onClick={() => setRejectingTaskId(rejectingTaskId === task.id ? null : task.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100">
                      <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu sửa
                    </button>
                  </div>
                </div>
                {rejectingTaskId === task.id && (
                  <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                    <textarea
                      value={rejectNotes[task.id] || ''}
                      onChange={(e) => setRejectNotes((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      rows={2}
                      placeholder="Nhập phản hồi để giáo viên chỉnh sửa..."
                      className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => handleReject(task.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700">
                        Gửi yêu cầu sửa
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Right: members + quick lesson plans */}
      <aside className="xl:col-span-4 space-y-5">
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Tiến độ thành viên</h3>
            </div>
            <button type="button" onClick={() => handleTabChange('members')} className="text-[11px] font-bold text-indigo-700 hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {memberProgress.slice(0, 5).map(({ user, total, completed, overdue, percent }) => (
              <div key={user.id} title={`${completed}/${total} nhiệm vụ, ${overdue} quá hạn`}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                  <span className="font-mono text-[11px] font-black text-slate-500">{completed}/{total}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className={`h-full rounded-full transition-all ${overdue > 0 ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Giáo án chờ duyệt</h3>
            </div>
            <button type="button" onClick={() => handleTabChange('giaoan')} className="text-[11px] font-bold text-indigo-700 hover:underline">
              Xem tất cả
            </button>
          </div>
          {scopedLessonPlans.filter(p => p.status === 'CHO_DUYET').length === 0 ? (
            <p className="text-xs text-slate-500">Chưa có giáo án mới trong tổ.</p>
          ) : scopedLessonPlans.filter(p => p.status === 'CHO_DUYET').slice(0, 2).map((plan) => (
            <div key={plan.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 mb-2 last:mb-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{plan.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{plan.teacher?.name} · {plan.submittedAt}</p>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );

  // ─── Tab: Công việc nội bộ ────────────────────────────────────────────────
  const TasksTab = (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Chờ duyệt', count: pendingReports.length, color: 'amber', icon: Clock },
          { label: 'Đang làm', count: inProgressTasks.length, color: 'blue', icon: CheckSquare },
          { label: 'Hoàn thành', count: completedTasks.length, color: 'emerald', icon: CheckCircle2 },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border border-${color}-200 bg-${color}-50 dark:bg-${color}-950/20 dark:border-${color}-900/30 px-4 py-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 text-${color}-600`} />
              <p className={`text-[10px] font-black uppercase text-${color}-700 dark:text-${color}-400`}>{label}</p>
            </div>
            <p className={`text-3xl font-black text-${color}-700 dark:text-${color}-300`}>{count}</p>
          </div>
        ))}
      </div>

      {/* All pending tasks */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <ClipboardCheck className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Tất cả báo cáo chờ duyệt</h3>
        </div>
        {pendingReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-10 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Tuyệt vời! Không có báo cáo nào chờ duyệt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((task) => (
              <article key={task.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{task.assignedName}</p>
                    <button type="button" onClick={() => onViewTask(task)} className="mt-1 text-left text-sm font-black text-slate-900 dark:text-white hover:text-indigo-700 hover:underline">
                      {task.title}
                    </button>
                    {task.deadline && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold">Hạn:</span> {task.deadline}
                      </p>
                    )}
                    <blockquote className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {task.reportEvidence || 'Chưa có nội dung minh chứng.'}
                    </blockquote>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={() => onUpdateStatus(task.id, 'HOAN_THANH')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700">
                      <Check className="w-3.5 h-3.5" /> Duyệt hoàn thành
                    </button>
                    <button type="button" onClick={() => setRejectingTaskId(rejectingTaskId === task.id ? null : task.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100">
                      <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu sửa
                    </button>
                  </div>
                </div>
                {rejectingTaskId === task.id && (
                  <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                    <textarea
                      value={rejectNotes[task.id] || ''}
                      onChange={(e) => setRejectNotes((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      rows={2}
                      placeholder="Nhập phản hồi..."
                      className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => handleReject(task.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700">
                        Gửi yêu cầu sửa
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  // ─── Tab: Duyệt giáo án ───────────────────────────────────────────────────
  const GiaoAnTab = (
    <div className="space-y-5">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <FileText className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Giáo án trong tuần ({scopedLessonPlans.length} giáo án)</h3>
        </div>
        {scopedLessonPlans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-12 text-center">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Chưa có giáo án nào được nộp trong tổ.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scopedLessonPlans.map((plan) => {
              const isDone = approvedPlans[plan.id];
              const isRejected = rejectedPlans[plan.id];
              return (
                <div key={plan.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{plan.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{plan.teacher?.name} · Nộp: {plan.submittedAt}</p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDone ? 'bg-emerald-100 text-emerald-700' : isRejected ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isDone ? '✓ Đã phê duyệt' : isRejected ? '✗ Yêu cầu sửa' : '⏳ Chờ duyệt'}
                        </span>
                      </div>
                    </div>
                    {!isDone && !isRejected && (
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100">
                          <Download className="w-3 h-3" /> Tải về
                        </button>
                        <button type="button" onClick={() => setApprovedPlans((prev) => ({ ...prev, [plan.id]: true }))} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700">
                          <Check className="w-3 h-3" /> Phê duyệt
                        </button>
                        <button type="button" onClick={() => setRejectedPlans((prev) => ({ ...prev, [plan.id]: true }))} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100">
                          <XCircle className="w-3 h-3" /> Yêu cầu sửa
                        </button>
                      </div>
                    )}
                    {(isDone || isRejected) && (
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100">
                        <Download className="w-3 h-3" /> Tải về
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  // ─── Tab: Đề xuất nghỉ phép ───────────────────────────────────────────────
  const NghiPhepTab = (
    <div className="space-y-5">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Quét thay thế tiết dạy ({scopedLeaveRequests.length} đơn)</h3>
        </div>
        {scopedLeaveRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-12 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Không có đơn nghỉ phép cần xử lý.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scopedLeaveRequests.map((request) => {
              const isDone = confirmedLeave[request.id];
              const isRejected = rejectedLeave[request.id];
              return (
                <div key={request.id} className={`rounded-xl border p-4 ${isDone ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20' : isRejected ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20' : 'border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20'}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${isDone ? 'text-emerald-600' : isRejected ? 'text-rose-600' : 'text-amber-600'}`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{request.teacher?.name}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            <span className="font-semibold">Tiết:</span> {request.period} · <span className="font-semibold">Lý do:</span> {request.reason}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">💡 {request.replacementHint}</p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDone ? 'bg-emerald-100 text-emerald-700' : isRejected ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isDone ? '✓ Đã đồng ý' : isRejected ? '✗ Từ chối' : '⏳ Chờ xử lý'}
                        </span>
                      </div>
                      {!isDone && !isRejected && (
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => setConfirmedLeave((prev) => ({ ...prev, [request.id]: true }))} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700">
                            ✓ Đồng ý thay thế
                          </button>
                          <button type="button" onClick={() => setRejectedLeave((prev) => ({ ...prev, [request.id]: true }))} className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100">
                            ✗ Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  // ─── Tab: Thời khóa biểu ─────────────────────────────────────────────────
  const ScheduleTab = (
    <div className="space-y-5">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <CalendarDays className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Thời khóa biểu tuần này (Tổ {workspace?.name || currentUser.workspaceId})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-slate-500 font-bold w-20">Ngày</th>
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <th key={p} className="text-center py-2 px-2 text-slate-500 font-bold">Tiết {p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {scheduleData.map((row) => (
                <tr key={row.day} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.day}</td>
                  {row.periods.map((period, i) => (
                    <td key={i} className="py-3 px-2 text-center">
                      {period ? (
                        <span className="inline-block rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                          {period}
                        </span>
                      ) : (
                        <span className="text-slate-200 dark:text-slate-700">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-slate-400 text-center">* Dữ liệu minh họa · Tích hợp TKB thực từ module Học vụ</p>
      </section>
    </div>
  );

  // ─── Tab: Thành viên tổ ───────────────────────────────────────────────────
  const MembersTab = (
    <div className="space-y-5">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <Users className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Thành viên tổ ({departmentUsers.length} người)</h3>
        </div>
        {departmentUsers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-10 text-center">
            <Users className="w-8 h-8 mx-auto text-slate-400" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Chưa có thành viên nào trong tổ.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memberProgress.map(({ user, total, completed, overdue, percent }) => (
              <div key={user.id} className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.title || user.roleName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {overdue > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {overdue} quá hạn
                        </span>
                      )}
                      <span className="text-[11px] font-mono font-black text-slate-500">{completed}/{total}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <div
                      className={`h-full rounded-full transition-all ${overdue > 0 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">{percent}% hoàn thành</p>
                </div>
                {user.id === currentUser.id && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    <Award className="w-3 h-3" /> Bạn
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    overview: OverviewTab,
    tasks: TasksTab,
    giaoan: GiaoAnTab,
    nghiphep: NghiPhepTab,
    schedule: ScheduleTab,
    members: MembersTab,
  };

  return (
    <div className="space-y-0">
      {Header}
      {TabBar}
      <div className="transition-all">
        {tabContent[activeTab] || tabContent['overview']}
      </div>
    </div>
  );
}
