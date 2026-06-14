import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  MessageSquare,
  RotateCcw,
  UserCheck,
  Users,
} from 'lucide-react';
import { Task, UserProfile, Workspace, TaskStatus } from '../types';

interface DepartmentDashboardProps {
  tasks: Task[];
  users: UserProfile[];
  workspaces: Workspace[];
  currentUser: UserProfile;
  onViewTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus, evidence?: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
  onNavigateTab: (tab: 'TASKS' | 'ACADEMIC_OPS' | 'TEACHER_HR') => void;
}

const lessonPlanSamples = [
  {
    id: 'lp-week-1',
    title: 'Chuyen de ham so bac hai va ung dung',
    teacherId: 'user_lan',
    submittedAt: '2026-06-12',
    fileName: 'giao-an-ham-so-bac-hai.pdf',
    status: 'CHO_DUYET',
  },
  {
    id: 'lp-week-2',
    title: 'Tich hop AI trong tiet Tin hoc 10',
    teacherId: 'user_nam',
    submittedAt: '2026-06-11',
    fileName: 'ai-tin-hoc-10.docx',
    status: 'CHO_DUYET',
  },
];

const leaveRequests = [
  {
    id: 'leave-1',
    teacherId: 'user_lan',
    period: 'Thu 4, tiet 3',
    reason: 'Kham suc khoe dinh ky',
    replacementHint: 'Thay Tran Hoang Nam trong tiet nay dang trong lich.',
  },
  {
    id: 'leave-2',
    teacherId: 'user_nhung',
    period: 'Thu 6, tiet 2',
    reason: 'Cong tac chuyen mon',
    replacementHint: 'Co Le Thi Thanh Nhan co the ho tro thay the.',
  },
];

export default function DepartmentDashboard({
  tasks,
  users,
  workspaces,
  currentUser,
  onViewTask,
  onUpdateStatus,
  onRejectTask,
  onNavigateTab,
}: DepartmentDashboardProps) {
  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [approvedPlans, setApprovedPlans] = useState<Record<string, boolean>>({});
  const [confirmedLeave, setConfirmedLeave] = useState<Record<string, boolean>>({});

  const workspace = workspaces.find((item) => item.id === currentUser.workspaceId);
  const departmentUsers = users.filter((user) => user.workspaceId === currentUser.workspaceId && user.role !== 'ADMIN');
  const departmentTasks = tasks.filter((task) => task.workspaceId === currentUser.workspaceId);
  const pendingReports = departmentTasks.filter((task) => task.status === 'CHO_DUYET');

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
    .map((plan) => ({ ...plan, teacher: users.find((user) => user.id === plan.teacherId) }))
    .filter((plan) => plan.teacher?.workspaceId === currentUser.workspaceId);

  const scopedLeaveRequests = leaveRequests
    .map((request) => ({ ...request, teacher: users.find((user) => user.id === request.teacherId) }))
    .filter((request) => request.teacher?.workspaceId === currentUser.workspaceId);

  const handleReject = (taskId: string) => {
    const note = rejectNotes[taskId]?.trim();
    if (!note) return;
    onRejectTask(taskId, note);
    setRejectingTaskId(null);
    setRejectNotes((prev) => ({ ...prev, [taskId]: '' }));
  };

  return (
    <div className="space-y-5">
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 font-mono">Department Dashboard</p>
            <h2 className="text-xl font-display font-black text-slate-900 mt-1">{workspace?.name || currentUser.workspaceId}</h2>
            <p className="text-xs text-slate-500 mt-1">Hang doi duyet bao cao, giao an va lich thay the cua to chuyen mon.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-[260px]">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase text-amber-700">Cho duyet</p>
              <p className="text-2xl font-black text-amber-700">{pendingReports.length}</p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase text-indigo-700">Thanh vien</p>
              <p className="text-2xl font-black text-indigo-700">{departmentUsers.length}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase text-emerald-700">Hoan thanh</p>
              <p className="text-2xl font-black text-emerald-700">
                {departmentTasks.filter((task) => task.status === 'HOAN_THANH').length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <section className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900">Hop thu bao cao cho duyet</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('TASKS')}
              className="text-[11px] font-bold text-indigo-700 hover:underline"
            >
              Mo Kanban to
            </button>
          </div>

          {pendingReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="mt-2 text-xs font-semibold text-slate-500">Khong co bao cao nao dang cho duyet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReports.map((task) => (
                <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{task.assignedName}</p>
                      <button
                        type="button"
                        onClick={() => onViewTask(task)}
                        className="mt-1 text-left text-sm font-black text-slate-900 hover:text-indigo-700 hover:underline"
                      >
                        {task.title}
                      </button>
                      <blockquote className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                        {task.reportEvidence || 'Chua co noi dung minh chung. Mo chi tiet de kiem tra lich su nop.'}
                      </blockquote>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(task.id, 'HOAN_THANH')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Duyet hoan thanh
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingTaskId(rejectingTaskId === task.id ? null : task.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Yeu cau sua
                      </button>
                    </div>
                  </div>

                  {rejectingTaskId === task.id && (
                    <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                      <textarea
                        value={rejectNotes[task.id] || ''}
                        onChange={(event) => setRejectNotes((prev) => ({ ...prev, [task.id]: event.target.value }))}
                        rows={2}
                        placeholder="Nhap phan hoi de giao vien chinh sua bao cao..."
                        className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReject(task.id)}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700"
                        >
                          Gui yeu cau sua
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="xl:col-span-4 space-y-5">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Tien do thanh vien</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('TEACHER_HR')}
                className="text-[11px] font-bold text-indigo-700 hover:underline"
              >
                HRM
              </button>
            </div>
            <div className="space-y-3">
              {memberProgress.map(({ user, total, completed, overdue, percent }) => (
                <div key={user.id} title={`Da hoan thanh ${completed}/${total} nhiem vu, ${overdue} qua han`}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-bold text-slate-800">{user.name}</span>
                    <span className="font-mono text-[11px] font-black text-slate-500">{completed}/{total}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${overdue > 0 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-sky-600" />
                <h3 className="text-sm font-black text-slate-900">Giao an trong tuan</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('ACADEMIC_OPS')}
                className="text-[11px] font-bold text-indigo-700 hover:underline"
              >
                Mo TKB
              </button>
            </div>
            <div className="space-y-2">
              {scopedLessonPlans.length === 0 ? (
                <p className="text-xs text-slate-500">Chua co giao an moi trong to.</p>
              ) : scopedLessonPlans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-black text-slate-900">{plan.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{plan.teacher?.name} - {plan.submittedAt}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600">
                      <Download className="w-3 h-3" />
                      Tai ve
                    </button>
                    <button
                      type="button"
                      onClick={() => setApprovedPlans((prev) => ({ ...prev, [plan.id]: true }))}
                      className={`rounded-lg px-2 py-1 text-[10px] font-bold ${approvedPlans[plan.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white'}`}
                    >
                      {approvedPlans[plan.id] ? 'Da phe duyet' : 'Phe duyet'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">Quet thay the tiet day</h3>
            </div>
            <div className="space-y-2">
              {scopedLeaveRequests.length === 0 ? (
                <p className="text-xs text-slate-500">Khong co don nghi phep can xu ly.</p>
              ) : scopedLeaveRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs font-black text-slate-900">{request.teacher?.name}</p>
                      <p className="text-[11px] text-slate-500">{request.period} - {request.reason}</p>
                      <p className="mt-1 text-[11px] font-semibold text-emerald-700">{request.replacementHint}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmedLeave((prev) => ({ ...prev, [request.id]: true }))}
                    className={`mt-2 w-full rounded-lg px-3 py-1.5 text-[11px] font-bold ${confirmedLeave[request.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white'}`}
                  >
                    {confirmedLeave[request.id] ? 'Da dong y thay the' : 'Dong y thay the'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-slate-500" />
          <p className="text-xs font-semibold text-slate-500">
            Giao dien nay chi hien thi cong viec trong to cua manager, giup xu ly bao cao theo hang doi thay vi trai rong tren dashboard dieu hanh.
          </p>
        </div>
      </section>
    </div>
  );
}
