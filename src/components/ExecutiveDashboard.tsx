import React, { useMemo, useState } from 'react';
import { Task, Workspace, UserProfile, BoardDirective, TaskPriority } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Hourglass, 
  TrendingUp, 
  TrendingDown,
  ChevronRight, 
  Activity, 
  ShieldAlert, 
  ArrowUpRight,
  Layers,
  Sparkles,
  Calendar,
  User,
  Users,
  ArrowRight,
  Bell,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';

interface ExecutiveDashboardProps {
  tasks: Task[];
  workspaces: Workspace[];
  users: UserProfile[];
  directives: BoardDirective[];
  currentUser: UserProfile;
  onViewDetails: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: any) => void;
  onSelectWorkspace: (workspaceId: string) => void;
  onShowTaskList?: (type: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS' | 'OVERDUE') => void;
  selectedCampus?: 'ALL' | 'CAMPUS_HN' | 'CAMPUS_HCM';
}

export default function ExecutiveDashboard({
  tasks,
  workspaces,
  users,
  directives,
  currentUser,
  onViewDetails,
  onUpdateStatus,
  onSelectWorkspace,
  onShowTaskList,
  selectedCampus = 'ALL'
}: ExecutiveDashboardProps) {
  const [selectedDirective, setSelectedDirective] = useState<BoardDirective | null>(null);

  // Current Date logic
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const dashboardView = useMemo(() => {
    if (currentUser.role === 'ADMIN' || currentUser.workspaceId === 'BGH') {
      return 'DIEU_HANH';
    }
    if (currentUser.role === 'MANAGER') {
      return 'TRUONG_PHONG';
    }
    return 'NHAN_SU';
  }, [currentUser]);

  const filteredTasks = useMemo(() => {
    if (dashboardView === 'DIEU_HANH') {
      return tasks;
    }
    if (dashboardView === 'TRUONG_PHONG') {
      return tasks.filter(t => t.workspaceId === currentUser.workspaceId || t.assignedId === currentUser.id);
    }
    return tasks.filter(t => t.assignedId === currentUser.id);
  }, [tasks, dashboardView, currentUser.workspaceId, currentUser.id]);

  const filteredDirectives = useMemo(() => {
    if (dashboardView === 'DIEU_HANH') {
      return directives;
    }
    return directives.filter(d => 
      d.senderId === currentUser.id || 
      d.implementations.some(i => i.userId === currentUser.id)
    );
  }, [directives, dashboardView, currentUser.id]);

  const summaryMetrics = useMemo(() => {
    // 1. Overdue Tasks
    const overdue = filteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).length;
    // 2. Pending Approval Tasks
    const pendingApproval = filteredTasks.filter(t => t.status === 'CHO_DUYET').length;
    // 3. In Progress Tasks
    const inProgress = filteredTasks.filter(t => t.status === 'DANG_TIEN_HANH' || t.status === 'CHUA_BAT_DA').length;
    // 4. Overall Completion Rate
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'HOAN_THANH').length;
    const kpiRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const urgentDirectives = filteredDirectives.filter(d => d.urgency === 'KHAN' || d.urgency === 'DAC_BIET').length;
    const admissionsRate = 85;

    return { overdue, pendingApproval, inProgress, kpiRate, urgentDirectives, admissionsRate };
  }, [filteredTasks, filteredDirectives, todayStr]);

  // LEVEL 2: Action Center - items to process today
  const actionItems = useMemo(() => {
    const items: {
      id: string;
      type: 'duyệt' | 'hạn_chót' | 'quá_hạn' | 'chỉ_thị';
      title: string;
      sub: string;
      originalTask?: Task;
      originalDirective?: BoardDirective;
    }[] = [];

    // Pending approvals (High priority for Ban Giám hiệu/Managers)
    if (dashboardView === 'DIEU_HANH' || dashboardView === 'TRUONG_PHONG') {
      filteredTasks.filter(t => t.status === 'CHO_DUYET').forEach(t => {
        items.push({
          id: `approve-${t.id}`,
          type: 'duyệt',
          title: `Nghiệm thu chỉ đạo: ${t.title}`,
          sub: `Người nộp: ${t.assignedName} • Phòng: ${t.workspaceId}`,
          originalTask: t
        });
      });
    }

    // Overdue tasks
    filteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).slice(0, 3).forEach(t => {
      items.push({
        id: `overdue-${t.id}`,
        type: 'quá_hạn',
        title: `Trễ hạn: ${t.title}`,
        sub: `Hạn xử lý: ${t.deadline} • Người phụ trách: ${t.assignedName}`,
        originalTask: t
      });
    });

    // Due today tasks
    filteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline === todayStr).forEach(t => {
      items.push({
        id: `due-${t.id}`,
        type: 'hạn_chót',
        title: `Đến hạn hôm nay: ${t.title}`,
        sub: `Phụ trách: ${t.assignedName} • Độ ưu tiên: ${t.priority}`,
        originalTask: t
      });
    });

    // Unresolved urgent directives
    filteredDirectives.slice(0, 2).forEach(d => {
      const myImp = d.implementations.find(i => i.userId === currentUser.id);
      if (!myImp || myImp.status !== 'DA_HOAN_THANH') {
        items.push({
          id: `directive-${d.id}`,
          type: 'chỉ_thị',
          title: `Chỉ thị Ban Giám hiệu: ${d.title}`,
          sub: `Người giao: ${d.senderName} • Yêu cầu phản hồi`,
          originalDirective: d
        });
      }
    });

    return items.slice(0, 5); // display top 5 urgent actions
  }, [filteredTasks, filteredDirectives, currentUser.id, todayStr, dashboardView]);

  // LEVEL 3: Risk & Alert Center calculations
  const riskAlerts = useMemo(() => {
    const alerts: {
      type: 'critical' | 'warning' | 'info';
      text: string;
    }[] = [];

    if (dashboardView === 'NHAN_SU') {
      const myOverdue = filteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).length;
      if (myOverdue > 0) {
        alerts.push({
          type: 'critical',
          text: `Bạn đang có ${myOverdue} công việc quá hạn học vụ cần hoàn thành gấp.`
        });
      }
      
      const myPendingApprovals = filteredTasks.filter(t => t.status === 'CHO_DUYET').length;
      if (myPendingApprovals > 0) {
        alerts.push({
          type: 'warning',
          text: `Bạn có ${myPendingApprovals} hồ sơ học vụ đang chờ Ban Giám hiệu phê duyệt.`
        });
      }
      
      alerts.push({
        type: 'info',
        text: 'Đảm bảo cập nhật báo cáo minh chứng học vụ đầy đủ trước hạn chót.'
      });
      return alerts;
    }

    // 1. Overdue tasks count
    if (summaryMetrics.overdue > 0) {
      const scopeText = dashboardView === 'TRUONG_PHONG' ? 'của bộ phận' : 'toàn trường';
      alerts.push({
        type: 'critical',
        text: `${summaryMetrics.overdue} công việc quá hạn học vụ ${scopeText} cần chỉ đạo khắc phục ngay.`
      });
    }

    // 2. Departments below KPI threshold (75%)
    if (dashboardView === 'DIEU_HANH') {
      let belowKpiCount = 0;
      workspaces.filter(w => w.id !== 'ALL').forEach(w => {
        const wsTasks = tasks.filter(t => t.workspaceId === w.id);
        const completed = wsTasks.filter(t => t.status === 'HOAN_THANH').length;
        const total = wsTasks.length;
        const rate = total > 0 ? (completed / total) * 100 : 100;
        if (rate < 75 && total > 0) {
          belowKpiCount++;
        }
      });

      if (belowKpiCount > 0) {
        alerts.push({
          type: 'warning',
          text: `${belowKpiCount} bộ phận/tổ chuyên môn có tỷ lệ hoàn thành dưới mục tiêu (75%).`
        });
      }
    } else if (dashboardView === 'TRUONG_PHONG') {
      const myWs = workspaces.find(w => w.id === currentUser.workspaceId);
      if (myWs) {
        const wsTasks = filteredTasks.filter(t => t.workspaceId === myWs.id);
        const completed = wsTasks.filter(t => t.status === 'HOAN_THANH').length;
        const total = wsTasks.length;
        const rate = total > 0 ? (completed / total) * 100 : 100;
        if (rate < 75 && total > 0) {
          alerts.push({
            type: 'warning',
            text: `Hiệu suất tổ ${myWs.name} đang ở mức ${Math.round(rate)}%, dưới mục tiêu (75%).`
          });
        }
      }
    }

    // 3. Pending approvals older than 7 days
    const pendingTasks = filteredTasks.filter(t => t.status === 'CHO_DUYET');
    let oldPendingCount = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    pendingTasks.forEach(t => {
      const submissionLog = [...t.history].reverse().find(h => h.action.includes('báo cáo minh chứng'));
      if (submissionLog) {
        const submissionDate = submissionLog.createdAt.split(' ')[0];
        if (submissionDate < sevenDaysAgoStr) {
          oldPendingCount++;
        }
      }
    });

    if (oldPendingCount > 0) {
      const scopeText = dashboardView === 'TRUONG_PHONG' ? 'bộ phận' : 'học vụ';
      alerts.push({
        type: 'warning',
        text: `${oldPendingCount} hồ sơ chờ duyệt ${scopeText} tồn đọng trên 7 ngày.`
      });
    }

    // 4. Weekly progression alert
    const trendText = dashboardView === 'TRUONG_PHONG'
      ? 'Tỷ lệ hoàn thành của bộ phận tuần này giảm nhẹ. Đề xuất rà soát tiến độ.'
      : 'Tỷ lệ hoàn thành tuần này giảm nhẹ 8% so với tuần trước. Ban Giám hiệu đề xuất tăng tốc rà soát.';
    alerts.push({
      type: 'info',
      text: trendText
    });

    return alerts;
  }, [summaryMetrics.overdue, filteredTasks, workspaces, dashboardView, todayStr, currentUser.workspaceId, tasks]);

  // LEVEL 4: KPI & Analytics Chart Data
  const chartData = useMemo(() => {
    const points = [];
    const now = new Date();
    const currentRate = summaryMetrics.kpiRate;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - (i * 4)); // 4-day steps
      const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      const ratio = (6 - i) / 6;
      const baseVal = 40 + (currentRate - 40) * ratio;
      const noise = Math.sin(i * 1.2) * 4;
      const actualVal = Math.max(15, Math.min(100, Math.round(baseVal + noise)));

      points.push({
        name: label,
        'Hiện tại (Actual)': i === 0 ? currentRate : actualVal,
        'Mục tiêu (Target)': 80, // target line
      });
    }
    return points;
  }, [summaryMetrics.kpiRate]);

  // LEVEL 5: Department Performance calculations (For Executive)
  const departmentPerformance = useMemo(() => {
    if (dashboardView !== 'DIEU_HANH') return [];
    const list: {
      id: string;
      name: string;
      kpi: number;
      overdue: number;
      pending: number;
      status: 'An toàn' | 'Cảnh báo' | 'Nguy cơ';
      color: string;
    }[] = [];

    workspaces.filter(w => w.id !== 'ALL').forEach(w => {
      const wsTasks = tasks.filter(t => t.workspaceId === w.id);
      const total = wsTasks.length;
      const completed = wsTasks.filter(t => t.status === 'HOAN_THANH').length;
      const overdue = wsTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).length;
      const pending = wsTasks.filter(t => t.status === 'CHO_DUYET').length;

      const kpi = total > 0 ? Math.round((completed / total) * 100) : 100;

      let status: 'An toàn' | 'Cảnh báo' | 'Nguy cơ' = 'An toàn';
      if (overdue > 3 || kpi < 70) {
        status = 'Nguy cơ';
      } else if (overdue > 0 || kpi < 80) {
        status = 'Cảnh báo';
      }

      list.push({
        id: w.id,
        name: w.name,
        kpi,
        overdue,
        pending,
        status,
        color: w.color || 'from-blue-500 to-indigo-500'
      });
    });

    return list.sort((a, b) => {
      const getWeight = (s: string) => s === 'Nguy cơ' ? 3 : s === 'Cảnh báo' ? 2 : 1;
      const weightDiff = getWeight(b.status) - getWeight(a.status);
      if (weightDiff !== 0) return weightDiff;
      return a.kpi - b.kpi;
    });
  }, [tasks, workspaces, todayStr, dashboardView]);

  // LEVEL 5.2: Member Performance calculations (For Managers)
  const memberPerformance = useMemo(() => {
    if (dashboardView !== 'TRUONG_PHONG') return [];
    const myMembers = users.filter(u => u.workspaceId === currentUser.workspaceId && u.role === 'STAFF');
    return myMembers.map(u => {
      const userTasks = tasks.filter(t => t.assignedId === u.id);
      const total = userTasks.length;
      const completed = userTasks.filter(t => t.status === 'HOAN_THANH').length;
      const overdue = userTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).length;
      const pending = userTasks.filter(t => t.status === 'CHO_DUYET').length;
      const kpi = total > 0 ? Math.round((completed / total) * 100) : 100;
      
      let status: 'An toàn' | 'Cảnh báo' | 'Nguy cơ' = 'An toàn';
      if (overdue > 1 || kpi < 70) {
        status = 'Nguy cơ';
      } else if (overdue > 0 || kpi < 85) {
        status = 'Cảnh báo';
      }
      return { id: u.id, name: u.name, title: u.title, kpi, overdue, pending, status };
    });
  }, [users, tasks, currentUser.workspaceId, dashboardView, todayStr]);

  // LEVEL 6: Simplified Task Management
  const simplifiedTasks = useMemo(() => {
    return filteredTasks
      .filter(t => t.status !== 'HOAN_THANH')
      .sort((a, b) => {
        const priorityVal = (p: TaskPriority) => p === 'CAO' ? 3 : p === 'TRUNG_BINH' ? 2 : 1;
        const pDiff = priorityVal(b.priority) - priorityVal(a.priority);
        if (pDiff !== 0) return pDiff;
        return a.deadline.localeCompare(b.deadline);
      })
      .slice(0, 6);
  }, [filteredTasks]);

  // ACTIVITY FEED: timeline of recent updates
  const recentActivities = useMemo(() => {
    const allHistory = filteredTasks.flatMap(t => 
      t.history.map(h => ({
        ...h,
        taskTitle: t.title,
        taskId: t.id
      }))
    );
    return allHistory.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  }, [filteredTasks]);

  // Helpers for Action Center type styling
  const getActionBadgeClass = (type: string) => {
    switch (type) {
      case 'duyệt':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50';
      case 'quá_hạn':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50';
      case 'hạn_chót':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50';
      case 'chỉ_thị':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border border-slate-200/50';
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'duyệt': return 'Chờ phê duyệt';
      case 'qu?_h?n': return 'Qu? h?n';
      case 'h?n_ch?t': return 'S?p h?n h?n ch?t';
      case 'ch?_th?': return 'Ch? th?c hi?n';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 p-1">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — EXECUTIVE ALERT BANNER (Glassmorphism)
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)' }}
      >
        {/* Subtle top accent line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-400 to-blue-500 opacity-60" />

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

          {/* Alert 1 — Overdue Tasks */}
          <div
            onClick={() => onShowTaskList && onShowTaskList('OVERDUE')}
            className="group relative flex items-center gap-4 p-5 cursor-pointer hover:bg-rose-50/40 transition-colors duration-200"
          >
            <div className="absolute left-0 inset-y-0 w-1 bg-rose-500 rounded-r-full opacity-80" />
            <div className="ml-3 flex items-center justify-center w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 shrink-0">
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{summaryMetrics.overdue}</span>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">Cần xử lý ngay</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 truncate">Công việc quá hạn toàn trường</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors shrink-0" />
          </div>

          {/* Alert 2 — Pending Approvals */}
          <div
            onClick={() => onShowTaskList && onShowTaskList('PENDING')}
            className="group relative flex items-center gap-4 p-5 cursor-pointer hover:bg-amber-50/40 transition-colors duration-200"
          >
            <div className="absolute left-0 inset-y-0 w-1 bg-amber-400 rounded-r-full opacity-80" />
            <div className="ml-3 flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{summaryMetrics.pendingApproval}</span>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Chờ bạn phê duyệt</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 truncate">Phê duyệt đang chờ xử lý</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
          </div>

          {/* Alert 3 — Enrollment Warning */}
          <div
            onClick={() => onShowTaskList && onShowTaskList('IN_PROGRESS')}
            className="group relative flex items-center gap-4 p-5 cursor-pointer hover:bg-blue-50/40 transition-colors duration-200"
          >
            <div className="absolute left-0 inset-y-0 w-1 bg-blue-500 rounded-r-full opacity-80" />
            <div className="ml-3 flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{summaryMetrics.admissionsRate}%</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                  {summaryMetrics.admissionsRate < 90 ? 'Cảnh báo tuyển sinh' : 'Đạt mục tiêu'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1 truncate">KPI tuyển sinh năm học</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — SIX KPI CARDS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

        {/* KPI 1 — School KPI */}
        <div
          onClick={() => onShowTaskList && onShowTaskList('COMPLETED')}
          className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 hover:-translate-y-0.5 select-none"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">KPI Toàn Trường</p>
          <p className="text-2xl font-extrabold text-slate-900 leading-none">{summaryMetrics.kpiRate}%</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600">+5% tuần trước</span>
          </div>
        </div>

        {/* KPI 2 — Enrollment Rate */}
        <div
          onClick={() => onShowTaskList && onShowTaskList('IN_PROGRESS')}
          className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-orange-200 transition-all duration-200 hover:-translate-y-0.5 select-none"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tuyển Sinh</p>
          <p className="text-2xl font-extrabold text-slate-900 leading-none">{summaryMetrics.admissionsRate}%</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-3 h-3 text-rose-500" />
            <span className="text-[11px] font-semibold text-rose-600">−8% tháng trước</span>
          </div>
        </div>

        {/* KPI 3 — Teacher Count */}
        <div
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-violet-200 transition-all duration-200 hover:-translate-y-0.5 select-none"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Giáo Viên</p>
          <p className="text-2xl font-extrabold text-slate-900 leading-none">312</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600">+12 tháng trước</span>
          </div>
        </div>

        {/* KPI 4 — Student Count */}
        <div
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 hover:-translate-y-0.5 select-none"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Học Sinh</p>
          <p className="text-2xl font-extrabold text-slate-900 leading-none">2,415</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600">+38 tháng trước</span>
          </div>
        </div>

        {/* KPI 5 — Revenue */}
        <div
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-teal-200 transition-all duration-200 hover:-translate-y-0.5 select-none"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Doanh Thu</p>
          <p className="text-2xl font-extrabold text-slate-900 leading-none">12.45<span className="text-base font-bold text-slate-500 ml-0.5">tỷ</span></p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600">+15% tháng trước</span>
          </div>
        </div>

        {/* KPI 6 — Attendance */}
        <div
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-200 transition-all duration-200 hover:-translate-y-0.5 select-none"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Chuyên Cần TB</p>
          <p className="text-2xl font-extrabold text-slate-900 leading-none">98.2%</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600">+2.1% tuần trước</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — THREE-COLUMN: Action Center / Chart / Timeline
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* LEFT — Action Center */}
        <section className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Action Center</h3>
                <p className="text-[11px] text-slate-400 font-medium">Cần xử lý hôm nay</p>
              </div>
            </div>
            {actionItems.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[10px] font-black text-white bg-rose-500 rounded-full">
                {actionItems.length}
              </span>
            )}
          </div>

          {/* Action items list */}
          <div className="flex-1 divide-y divide-slate-50">
            {actionItems.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2.5" />
                <p className="text-xs font-semibold text-slate-500">Tất cả đã được xử lý!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Không có công việc khẩn nào</p>
              </div>
            ) : (
              actionItems.map((item, idx) => {
                let dotColor = 'bg-slate-300';
                let badgeColor = 'bg-slate-100 text-slate-600';
                let badgeLabel = item.type;
                if (item.type === 'quá_hạn') {
                  dotColor = 'bg-rose-500';
                  badgeColor = 'bg-rose-50 text-rose-700 border border-rose-100';
                  badgeLabel = 'Quá hạn';
                } else if (item.type === 'duyệt') {
                  dotColor = 'bg-amber-400';
                  badgeColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                  badgeLabel = 'Chờ duyệt';
                } else if (item.type === 'hạn_chót') {
                  dotColor = 'bg-orange-400';
                  badgeColor = 'bg-orange-50 text-orange-700 border border-orange-100';
                  badgeLabel = 'Sắp hết hạn';
                } else if (item.type === 'chỉ_thị') {
                  dotColor = 'bg-blue-500';
                  badgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                  badgeLabel = 'Chỉ thị BGH';
                }

                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor}`}>{badgeLabel}</span>
                      </div>
                      <p className="text-[12.5px] font-semibold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.sub}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (item.originalTask) {
                          onViewDetails(item.originalTask);
                        } else if (item.originalDirective) {
                          setSelectedDirective(item.originalDirective);
                        }
                      }}
                      className="shrink-0 px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1 active:scale-95"
                    >
                      Xử lý
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100">
            <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Xem tất cả ({actionItems.length + 7})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* CENTER — Interactive Line Chart */}
        <section className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Biểu Đồ Xu Hướng</h3>
                <p className="text-[11px] text-slate-400 font-medium">Actual vs Target KPI</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" />+4% tuần
              </span>
              <span className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                +12% tháng
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-5 pt-3 pb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-blue-500 rounded-full" />
              <span className="text-[11px] font-medium text-slate-500">Thực tế</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-amber-400 rounded-full opacity-70" style={{ backgroundImage: 'repeating-linear-gradient(to right, #f59e0b 0, #f59e0b 4px, transparent 4px, transparent 7px)' }} />
              <span className="text-[11px] font-medium text-slate-500">Mục tiêu (80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-rose-400 rounded-full opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(to right, #f87171 0, #f87171 4px, transparent 4px, transparent 7px)' }} />
              <span className="text-[11px] font-medium text-slate-500">Target line</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-52 w-full px-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="kpiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(148,163,184,0.12)" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                  tick={{ fill: '#94a3b8', fontWeight: 600 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: '#94a3b8', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(226,232,240,0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '8px 12px',
                  }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#f87171"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                  label={{ value: 'Target 80%', fill: '#f87171', fontSize: 9.5, fontWeight: 700, position: 'insideTopRight' }}
                />
                <Area
                  type="monotone"
                  dataKey="Hiện tại (Actual)"
                  fill="url(#kpiAreaGrad)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff', filter: 'drop-shadow(0 2px 4px rgba(59,130,246,0.4))' }}
                />
                <Line
                  type="monotone"
                  dataKey="Mục tiêu (Target)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                  strokeOpacity={0.65}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100">
            <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Xem báo cáo chi tiết
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* RIGHT — Activity Timeline */}
        <section className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hoạt Động</h3>
                <p className="text-[11px] text-slate-400 font-medium">Gần đây nhất</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Timeline */}
          <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-[12px] text-slate-400 text-center py-6">Chưa có hoạt động nào</p>
            ) : (
              recentActivities.map((log, idx) => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-400', 'bg-rose-500'];
                const dotColor = colors[idx % colors.length];
                const timeStr = log.createdAt.split(' ')[1]?.substring(0, 5) || log.createdAt.substring(0, 5);

                return (
                  <div key={log.id} className="flex items-start gap-3">
                    {/* Avatar dot */}
                    <div className={`w-8 h-8 rounded-full ${dotColor} flex items-center justify-center text-white text-[11px] font-black shrink-0`}>
                      {log.userName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[12px] font-bold text-slate-800 truncate">{log.userName}</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">{timeStr}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{log.action}</p>
                      <p className="text-[10.5px] text-blue-600 font-semibold mt-0.5 truncate">📌 {log.taskTitle}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100">
            <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Xem tất cả hoạt động
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — BOTTOM ROW: Schedule / Risk Table / Docs
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* LEFT — Today's Schedule */}
        <section className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lịch Hôm Nay</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 space-y-3">
            {[
              { time: '08:00 – 09:00', title: 'Họp giao ban Ban Giám hiệu', room: 'Phòng họp 1', color: 'bg-blue-500' },
              { time: '10:00 – 11:00', title: 'Làm việc với Phòng Tuyển sinh', room: 'Phòng họp 2', color: 'bg-violet-500' },
              { time: '14:00 – 15:30', title: 'Ký duyệt hồ sơ nhân sự', room: 'Phòng làm việc', color: 'bg-amber-400' },
            ].map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100/60 hover:border-slate-200">
                <div className={`w-1 self-stretch rounded-full ${event.color} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-400 font-mono">{event.time}</p>
                  <p className="text-[13px] font-semibold text-slate-800 mt-0.5 truncate">{event.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{event.room}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-100">
            <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Xem lịch đầy đủ
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* CENTER — Top Risk Departments Table */}
        <section className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top Phòng Ban Có Vấn Đề</h3>
                <p className="text-[11px] text-slate-400 font-medium">Rủi ro theo bộ phận</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-2.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">Phòng ban</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">Vấn đề</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Mức độ</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Xu hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardView === 'DIEU_HANH' ? (
                  departmentPerformance.slice(0, 5).map((dept) => {
                    const isRisk = dept.status === 'Nguy cơ';
                    const isWarn = dept.status === 'Cảnh báo';
                    return (
                      <tr
                        key={dept.id}
                        onClick={() => onSelectWorkspace(dept.id)}
                        className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span className="text-[12.5px] font-semibold text-slate-800 truncate max-w-[120px] block">{dept.name}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[11.5px] text-slate-500">{isRisk ? 'KPI giảm mạnh' : isWarn ? 'Chậm tiến độ' : 'Đang theo dõi'}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isRisk ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            isWarn ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>{dept.status === 'An toàn' ? 'Thấp' : dept.status === 'Cảnh báo' ? 'Trung bình' : 'Cao'}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {isRisk ? (
                            <TrendingDown className="w-4 h-4 text-rose-500 mx-auto" />
                          ) : isWarn ? (
                            <svg className="w-4 h-4 text-amber-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                          ) : (
                            <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  [
                    { name: 'Tuyển sinh', issue: 'KPI giảm 8%', severity: 'Cao', trend: 'down' },
                    { name: 'Học vụ', issue: 'Chậm nhập điểm', severity: 'Trung bình', trend: 'neutral' },
                    { name: 'Thiết bị', issue: 'Cơ sở vật chất cũ', severity: 'Trung bình', trend: 'neutral' },
                    { name: 'Kế toán', issue: 'Công nợ quá hạn', severity: 'Cao', trend: 'down' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3"><span className="text-[12.5px] font-semibold text-slate-800">{row.name}</span></td>
                      <td className="px-3 py-3"><span className="text-[11.5px] text-slate-500">{row.issue}</span></td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          row.severity === 'Cao' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>{row.severity}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.trend === 'down'
                          ? <TrendingDown className="w-4 h-4 text-rose-500 mx-auto" />
                          : <svg className="w-4 h-4 text-amber-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100">
            <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Xem chi tiết
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* RIGHT — Documents & Announcements */}
        <section className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tài Liệu & Thông Báo</h3>
                <p className="text-[11px] text-slate-400 font-medium">Mới nhất</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 space-y-0 divide-y divide-slate-50">
            {[
              { title: 'Thông báo nghỉ lễ 30/4 – 1/5', time: '1 giờ trước', type: 'notice', color: 'text-rose-500' },
              { title: 'Quyết định bổ nhiệm giáo viên', time: '3 giờ trước', type: 'decision', color: 'text-blue-500' },
              { title: 'Kế hoạch tổ chức thi cuối kỳ', time: '5 giờ trước', type: 'plan', color: 'text-violet-500' },
              { title: 'Hướng dẫn sử dụng LMS mới', time: '1 ngày trước', type: 'guide', color: 'text-emerald-500' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 hover:bg-slate-50/50 -mx-5 px-5 cursor-pointer transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0`}>
                  <svg className={`w-4 h-4 ${doc.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-slate-800 leading-tight truncate">{doc.title}</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">{doc.time}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-100">
            <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Xem tất cả tài liệu
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — TASK MANAGEMENT CARDS (below if in executive view)
      ═══════════════════════════════════════════════════════════════ */}
      {simplifiedTasks.length > 0 && (
        <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Công Việc Đang Điều Hành</h3>
                <p className="text-[11px] text-slate-400 font-medium">Tiến độ thực tế</p>
              </div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simplifiedTasks.map(task => {
              const isTaskOverdue = task.deadline < todayStr;
              const progress = task.status === 'HOAN_THANH' ? 100 : task.status === 'CHO_DUYET' ? 75 : task.status === 'DANG_TIEN_HANH' ? 50 : 25;

              let priorityBadge = 'bg-slate-100 text-slate-600 border border-slate-200';
              if (task.priority === 'CAO') {
                priorityBadge = 'bg-rose-50 text-rose-700 border border-rose-100';
              } else if (task.priority === 'TRUNG_BINH') {
                priorityBadge = 'bg-amber-50 text-amber-700 border border-amber-100';
              }

              let accentColor = 'border-l-blue-500';
              if (isTaskOverdue) accentColor = 'border-l-rose-500';
              else if (task.priority === 'CAO') accentColor = 'border-l-orange-400';

              return (
                <div
                  key={task.id}
                  onClick={() => onViewDetails(task)}
                  className={`group cursor-pointer p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 border-l-4 ${accentColor} flex flex-col gap-3 select-none`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{task.tag}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge}`}>{task.priority}</span>
                    </div>
                    <h4 className="text-[13px] font-semibold text-slate-900 mt-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">
                        <span>Tiến độ</span>
                        <span className="font-mono">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress === 100 ? 'bg-emerald-500' : progress >= 75 ? 'bg-amber-400' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600 border border-slate-200">
                          {task.assignedName.charAt(0)}
                        </div>
                        <span className="truncate max-w-[80px]">{task.assignedName}</span>
                      </div>
                      <span className={`font-mono text-[10.5px] flex items-center gap-1 ${isTaskOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Directive Detail Modal */}
      {selectedDirective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedDirective(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="min-w-0">
                <span className="mb-2 inline-flex rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  Chỉ đạo điều hành
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {selectedDirective.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {selectedDirective.senderName} · {selectedDirective.senderTitle} · {selectedDirective.createdAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDirective(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                  {selectedDirective.category}
                </span>
                <span className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                  {selectedDirective.urgency}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {selectedDirective.content}
              </p>
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                  Tình trạng tiếp nhận
                </h3>
                <div className="space-y-2">
                  {selectedDirective.implementations.map((impl) => (
                    <div key={impl.userId} className="rounded-lg bg-white p-3 text-xs shadow-3xs dark:bg-slate-900">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-slate-800 dark:text-white">{impl.userName}</strong>
                        <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {impl.status}
                        </span>
                      </div>
                      {impl.feedback && (
                        <p className="mt-2 leading-relaxed text-slate-500 dark:text-slate-400">{impl.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}