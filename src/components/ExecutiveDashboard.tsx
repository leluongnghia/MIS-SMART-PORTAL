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
  onShowTaskList
}: ExecutiveDashboardProps) {
  const [selectedDirective, setSelectedDirective] = useState<BoardDirective | null>(null);

  // Current Date logic
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // LEVEL 1: Executive Summary calculations
  const summaryMetrics = useMemo(() => {
    // 1. Overdue Tasks
    const overdue = tasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).length;
    // 2. Pending Approval Tasks
    const pendingApproval = tasks.filter(t => t.status === 'CHO_DUYET').length;
    // 3. In Progress Tasks
    const inProgress = tasks.filter(t => t.status === 'DANG_TIEN_HANH' || t.status === 'CHUA_BAT_DA').length;
    // 4. Overall Completion Rate
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'HOAN_THANH').length;
    const kpiRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { overdue, pendingApproval, inProgress, kpiRate };
  }, [tasks, todayStr]);

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
    tasks.filter(t => t.status === 'CHO_DUYET').forEach(t => {
      items.push({
        id: `approve-${t.id}`,
        type: 'duyệt',
        title: `Nghiệm thu chỉ đạo: ${t.title}`,
        sub: `Người nộp: ${t.assignedName} • Phòng: ${t.workspaceId}`,
        originalTask: t
      });
    });

    // Overdue tasks
    tasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).slice(0, 3).forEach(t => {
      items.push({
        id: `overdue-${t.id}`,
        type: 'quá_hạn',
        title: `Trễ hạn: ${t.title}`,
        sub: `Hạn xử lý: ${t.deadline} • Người phụ trách: ${t.assignedName}`,
        originalTask: t
      });
    });

    // Due today tasks
    tasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline === todayStr).forEach(t => {
      items.push({
        id: `due-${t.id}`,
        type: 'hạn_chót',
        title: `Đến hạn hôm nay: ${t.title}`,
        sub: `Phụ trách: ${t.assignedName} • Độ ưu tiên: ${t.priority}`,
        originalTask: t
      });
    });

    // Unresolved urgent directives
    directives.slice(0, 2).forEach(d => {
      const isUrgent = d.urgency === 'KHAN';
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
  }, [tasks, directives, currentUser.id, todayStr]);

  // LEVEL 3: Risk & Alert Center calculations
  const riskAlerts = useMemo(() => {
    const alerts: {
      type: 'critical' | 'warning' | 'info';
      text: string;
    }[] = [];

    // 1. Overdue tasks count
    if (summaryMetrics.overdue > 0) {
      alerts.push({
        type: 'critical',
        text: `${summaryMetrics.overdue} công việc quá hạn học vụ cần chỉ đạo khắc phục ngay.`
      });
    }

    // 2. Departments below KPI threshold (75%)
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

    // 3. Pending approvals older than 7 days
    const pendingTasks = tasks.filter(t => t.status === 'CHO_DUYET');
    let oldPendingCount = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    pendingTasks.forEach(t => {
      // Check last history log to see when it was sent for approval
      const submissionLog = [...t.history].reverse().find(h => h.action.includes('báo cáo minh chứng'));
      if (submissionLog) {
        const submissionDate = submissionLog.createdAt.split(' ')[0];
        if (submissionDate < sevenDaysAgoStr) {
          oldPendingCount++;
        }
      }
    });

    if (oldPendingCount > 0) {
      alerts.push({
        type: 'warning',
        text: `${oldPendingCount} hồ sơ học vụ chờ duyệt tồn đọng trên 7 ngày.`
      });
    }

    // 4. Hardcoded weekly progression alert for demo variety
    alerts.push({
      type: 'info',
      text: 'Tỷ lệ hoàn thành tuần này giảm nhẹ 8% so với tuần trước. Ban Giám hiệu đề xuất tăng tốc rà soát.'
    });

    return alerts;
  }, [summaryMetrics.overdue, tasks, workspaces]);

  // LEVEL 4: KPI & Analytics Chart Data
  const chartData = useMemo(() => {
    // Generate organic points leading to current performance
    const points = [];
    const now = new Date();
    const currentRate = summaryMetrics.kpiRate;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - (i * 4)); // 4-day steps
      const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      // Compute progress ratio
      const ratio = (6 - i) / 6;
      // Synthesize actual data point moving toward currentRate
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

  // LEVEL 5: Department Performance calculations
  const departmentPerformance = useMemo(() => {
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

    // Sort by risk priority (Nguy cơ first, then Cảnh báo, then An toàn)
    // Secondary sort by KPI ascending
    return list.sort((a, b) => {
      const getWeight = (s: string) => s === 'Nguy cơ' ? 3 : s === 'Cảnh báo' ? 2 : 1;
      const weightDiff = getWeight(b.status) - getWeight(a.status);
      if (weightDiff !== 0) return weightDiff;
      return a.kpi - b.kpi;
    });
  }, [tasks, workspaces, todayStr]);

  // LEVEL 6: Simplified Task Management
  const simplifiedTasks = useMemo(() => {
    // Show top 6 important non-completed tasks
    return tasks
      .filter(t => t.status !== 'HOAN_THANH')
      .sort((a, b) => {
        // High priority first
        const priorityVal = (p: TaskPriority) => p === 'CAO' ? 3 : p === 'TRUNG_BINH' ? 2 : 1;
        const pDiff = priorityVal(b.priority) - priorityVal(a.priority);
        if (pDiff !== 0) return pDiff;
        // Earliest deadline first
        return a.deadline.localeCompare(b.deadline);
      })
      .slice(0, 6);
  }, [tasks]);

  // ACTIVITY FEED: timeline of recent updates
  const recentActivities = useMemo(() => {
    const allHistory = tasks.flatMap(t => 
      t.history.map(h => ({
        ...h,
        taskTitle: t.title,
        taskId: t.id
      }))
    );
    // Sort descending by log timestamp/id
    return allHistory.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  }, [tasks]);

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
      <section className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Overdue (Critical red) */}
          <div 
            onClick={() => onShowTaskList && onShowTaskList('OVERDUE')}
            className="cursor-pointer bg-white border-2 border-rose-500/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none"
          >
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-rose-600 dark:text-rose-400 block font-mono">
                Công việc quá hạn
              </span>
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                {summaryMetrics.overdue}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-1.5 font-medium">
                Yêu cầu giải trình khẩn cấp
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Card 2: Pending Approval */}
          <div 
            onClick={() => onShowTaskList && onShowTaskList('PENDING')}
            className="cursor-pointer bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none"
          >
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-amber-600 dark:text-amber-400 block font-mono">
                Chờ phê duyệt
              </span>
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                {summaryMetrics.pendingApproval}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-1.5 font-medium">
                Văn bản / Báo cáo đang chờ
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border border-amber-100 dark:border-amber-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <Hourglass className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div 
            onClick={() => onShowTaskList && onShowTaskList('IN_PROGRESS')}
            className="cursor-pointer bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none"
          >
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-blue-600 dark:text-blue-400 block font-mono">
                Đang thực hiện
              </span>
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                {summaryMetrics.inProgress}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-1.5 font-medium">
                Đang phân bổ triển khai
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 border border-blue-100 dark:border-blue-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Overall Completion Rate */}
          <div 
            onClick={() => onShowTaskList && onShowTaskList('COMPLETED')}
            className="cursor-pointer bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none"
          >
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-emerald-600 dark:text-emerald-400 block font-mono">
                KPI Toàn Trường
              </span>
              <span className="text-4xl font-display font-extrabold text-emerald-600 dark:text-emerald-450 mt-1 block">
                {summaryMetrics.kpiRate}%
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-1.5 font-medium">
                Chỉ tiêu hoàn thành học vụ
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Row 2: Operational and Strategic KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 5: Kế hoạch năm học */}
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none">
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-indigo-600 dark:text-indigo-400 block font-mono">
                Kế Hoạch Năm Học
              </span>
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                78%
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-1.5 font-medium">
                Tiến độ mốc học kỳ II
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-450 border border-indigo-100 dark:border-indigo-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 6: Mục tiêu chiến lược */}
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none">
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-purple-600 dark:text-purple-400 block font-mono">
                Mục Tiêu Chiến Lược
              </span>
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                82%
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-1.5 font-medium">
                Tiến độ chỉ tiêu OKRs chung
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-450 border border-purple-100 dark:border-purple-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Card 7: Tuyển sinh */}
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none">
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-orange-600 dark:text-orange-400 block font-mono">
                Tuyển sinh CRM
              </span>
              <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                1,280 / 1,500
              </span>
              <span className="text-[11px] text-slate-450 dark:text-slate-400 block mt-1.5 font-medium">
                Đạt 85.3% chỉ tiêu tuyển sinh
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-450 border border-orange-100 dark:border-orange-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 8: Tình hình nhân sự */}
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex items-center justify-between transition-[border-color,box-shadow,transform] duration-200 hover:shadow-md hover:scale-[1.01] select-none">
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-sky-600 dark:text-sky-450 block font-mono">
                Tải lực nhân sự
              </span>
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                48
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-1.5 font-medium">
                Cán bộ / Giáo viên hoạt động
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-450 border border-sky-100 dark:border-sky-900/35 flex items-center justify-center shadow-3xs shrink-0">
              <User className="w-6 h-6" />
            </div>
          </div>

        </div>
      </section>

      {/* Grid for Actions + Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEVEL 2: Action Center */}
        <section className="lg:col-span-8 bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                <Bell className="w-4.5 h-4.5" />
              </span>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
                Cần xử lý hôm nay
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono font-bold">
              {actionItems.length} công việc khẩn
            </span>
          </div>

          {actionItems.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Tất cả chỉ đạo của bạn đã được giải quyết hoặc nghiệm thu sạch sẽ!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {actionItems.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider ${getActionBadgeClass(item.type)}`}>
                        {getActionLabel(item.type)}
                      </span>
                      <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 truncate">
                      {item.sub}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (item.originalTask) {
                        onViewDetails(item.originalTask);
                      } else if (item.originalDirective) {
                        setSelectedDirective(item.originalDirective);
                      }
                    }}
                    className="shrink-0 px-3 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-3xs cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Xử lý ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LEVEL 3: Risk & Alert Center */}
        <section className="lg:col-span-4 bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
            <span className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 rounded-lg">
              <ShieldAlert className="w-4.5 h-4.5" />
            </span>
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
              Risk & Alert Center
            </h3>
          </div>

          <div className="space-y-3">
            {riskAlerts.map((alert, idx) => {
              let colorClasses = '';
              let badgeText = '';
              if (alert.type === 'critical') {
                colorClasses = 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/25 dark:border-rose-900/40 dark:text-rose-300';
                badgeText = '🚨 critical';
              } else if (alert.type === 'warning') {
                colorClasses = 'bg-amber-50 border border-amber-200/60 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300';
                badgeText = '⚠️ warning';
              } else {
                colorClasses = 'bg-blue-50 border border-blue-200/50 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300';
                badgeText = 'ℹ️ info';
              }

              return (
                <div key={idx} className={`p-3 rounded-xl flex items-start gap-2.5 ${colorClasses}`}>
                  <span className="text-[9px] font-black uppercase font-mono tracking-wider shrink-0 mt-0.5 opacity-90">
                    {badgeText}
                  </span>
                  <p className="text-[11px] leading-relaxed font-semibold">
                    {alert.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Grid for Chart + Department table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEVEL 4: KPI & Analytics */}
        <section className="lg:col-span-6 bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <TrendingUp className="w-4.5 h-4.5" />
                </span>
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
                  Hiệu suất giáo dục (Actual vs Target)
                </h3>
              </div>

              {/* Weekly/Monthly Comparison badges */}
              <div className="flex items-center gap-2 text-[10.5px]">
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg">
                  <TrendingUp className="w-3 h-3" />
                  +4% tuần trước
                </span>
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg">
                  <TrendingUp className="w-3 h-3" />
                  +12% tháng trước
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 mb-4 font-sans leading-relaxed">
              Mục tiêu hoàn thành KPI toàn trường đặt ra là <strong className="text-slate-800 dark:text-white">80%</strong>. 
              Tỷ lệ hoàn thành thực tế hiện tại đạt <strong className="text-indigo-650 dark:text-indigo-400 font-extrabold">{summaryMetrics.kpiRate}%</strong>.
            </div>
          </div>

          {/* Recharts Composed Chart with target ReferenceLine */}
          <div className="h-56 w-full mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Target: 80%', fill: '#EF4444', fontSize: 9, position: 'top' }} />
                
                {/* Area under Actual */}
                <Area type="monotone" dataKey="Hiện tại (Actual)" fill="rgba(59, 130, 246, 0.08)" stroke="#3B82F6" strokeWidth={2.5} />
                {/* Target Line */}
                <Line type="monotone" dataKey="Mục tiêu (Target)" stroke="rgba(245, 158, 11, 0.5)" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* LEVEL 5: Department Performance */}
        <section className="lg:col-span-6 bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 rounded-lg">
                <Layers className="w-4.5 h-4.5" />
              </span>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
                Xếp hạng bộ phận theo rủi ro học vụ
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px]">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 font-bold uppercase tracking-wider font-mono text-[9px] pb-2">
                    <th className="pb-2 font-bold">Tên đơn vị</th>
                    <th className="pb-2 text-center font-bold">KPI %</th>
                    <th className="pb-2 text-center font-bold">Quá hạn</th>
                    <th className="pb-2 text-center font-bold">Chờ duyệt</th>
                    <th className="pb-2 text-right font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {departmentPerformance.map(dept => {
                    let statusColor = 'text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/30';
                    if (dept.status === 'Nguy cơ') {
                      statusColor = 'text-rose-600 bg-rose-50 dark:text-rose-450 dark:bg-rose-950/30';
                    } else if (dept.status === 'Cảnh báo') {
                      statusColor = 'text-amber-600 bg-amber-50 dark:text-amber-450 dark:bg-amber-950/30';
                    }

                    return (
                      <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-bold text-slate-800 dark:text-white max-w-[130px] truncate">
                          {dept.name}
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold text-slate-750 dark:text-slate-200">
                          {dept.kpi}%
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold text-rose-650 dark:text-rose-400">
                          {dept.overdue}
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold text-amber-650 dark:text-amber-400">
                          {dept.pending}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider font-mono ${statusColor}`}>
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* LEVEL 6: Task Management (Simplified Card list) */}
      <section className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
          <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Activity className="w-4.5 h-4.5" />
          </span>
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
            Công việc đang điều hành (Trực quan hóa tối giản)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simplifiedTasks.map(task => {
            const isTaskOverdue = task.deadline < todayStr;
            const progress = task.status === 'HOAN_THANH' ? 100 : task.status === 'CHO_DUYET' ? 75 : task.status === 'DANG_TIEN_HANH' ? 50 : 25;
            
            // Priority colors
            let priorityBadge = 'bg-slate-150 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border border-slate-200/50';
            if (task.priority === 'CAO') {
              priorityBadge = 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/40';
            } else if (task.priority === 'TRUNG_BINH') {
              priorityBadge = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/40';
            }

            return (
              <div 
                key={task.id}
                onClick={() => onViewDetails(task)}
                className={`group cursor-pointer p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white hover:border-blue-400 dark:hover:border-blue-400 transition-[border-color,box-shadow] duration-200 hover:shadow-md flex flex-col justify-between gap-3 select-none ${
                  isTaskOverdue ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-blue-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      {task.tag}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black font-mono uppercase tracking-wider ${priorityBadge}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      <span>Tiến độ</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          progress === 100 ? 'bg-emerald-550' : progress === 75 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/40 pt-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-800 font-bold text-[9px] text-slate-600 dark:text-slate-300 shrink-0">
                        {task.assignedName.charAt(0)}
                      </div>
                      <span className="truncate">{task.assignedName}</span>
                    </div>
                    <span className={`font-mono text-[10.5px] shrink-0 flex items-center gap-1 ${isTaskOverdue ? 'text-rose-650 font-bold' : ''}`}>
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

      {/* ACTIVITY FEED */}
      <section className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
          <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 rounded-lg">
            <Activity className="w-4.5 h-4.5 animate-pulse" />
          </span>
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
            Nhật Ký Hoạt Động & Tiến Trình Xử Lý
          </h3>
        </div>

        <div className="relative border-l border-slate-150 dark:border-slate-800/80 pl-4 ml-2.5 space-y-4 py-2">
          {recentActivities.map((log, idx) => (
            <div key={log.id} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[22.5px] top-1.5 block w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900"></span>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[9.5px] text-slate-400 dark:text-slate-400 font-mono font-bold">
                  {log.createdAt}
                </span>
              </div>
              <p className="text-[12px] text-slate-700 dark:text-slate-200 mt-1 leading-normal font-medium">
                <strong className="text-slate-900 dark:text-white">{log.userName}</strong> ({log.userTitle}): {log.action}
              </p>
              <div className="text-[11px] italic text-indigo-650 dark:text-indigo-400 mt-0.5 flex items-center gap-1 font-semibold">
                <span>📌 Chỉ đạo:</span>
                <span className="truncate max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg" title={log.taskTitle}>
                  {log.taskTitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

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

