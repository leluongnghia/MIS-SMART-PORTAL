import React from 'react';
import { Task, Workspace } from '../types';
import { getScoreColorClass, getScoreBgClass } from '../utils/colorUtils';
import { getTaskIntelligences } from '../mockData';
import { 
  CheckCircle2, 
  Hourglass, 
  AlertCircle, 
  CalendarRange, 
  Percent,
  TrendingUp,
  Award,
  EyeOff,
  X
} from 'lucide-react';

interface WorkspaceStatsProps {
  tasks: Task[];
  activeWorkspace: Workspace;
  onMinimize?: () => void;
  onShowTaskList?: (type: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS' | 'OVERDUE') => void;
}

export default function WorkspaceStats({ tasks, activeWorkspace, onMinimize, onShowTaskList }: WorkspaceStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'HOAN_THANH').length;
  const pendingTasks = tasks.filter(t => t.status === 'CHO_DUYET').length;
  const inProgressTasks = tasks.filter(t => t.status === 'DANG_TIEN_HANH').length;
  const notStartedTasks = tasks.filter(t => t.status === 'CHUA_BAT_DA').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate overdue tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline && t.deadline < todayStr).length;

  return (
    <div id="workspace-stats-outer" className="space-y-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            📊 Phân tích định lượng & Hiệu suất phòng ban ({activeWorkspace.name})
          </span>
        </div>
        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Ẩn bảng thống kê"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Thu gọn bảng phân tích</span>
          </button>
        )}
      </div>

      <div id="workspace-stats-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Percentage Circle / Overall Summary Card with modern gradient */}
        <div 
          id="stat-box-percentage"
          className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="absolute right-[-20px] top-[-20px] opacity-15 blur-2xl w-40 h-40 bg-indigo-500 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          
          <div>
            <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase font-mono">
              Hiệu suất mục tiêu
            </span>
            <h3 className={`text-2xl font-display font-extrabold mt-1 tracking-tight leading-tight ${getScoreColorClass(completionRate)}`}>
              {completionRate}% <span className="text-white text-lg font-bold">Đã hoàn thành</span>
            </h3>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="w-full">
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/30">
                <div 
                  className={`h-1 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(129,140,248,0.5)] ${getScoreBgClass(completionRate)}`} 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2.5">
                <span className="flex items-center gap-1.5 font-medium font-sans">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Tiến độ tối ưu phòng ban
                </span>
                <span className="font-mono font-bold text-indigo-200">{completedTasks}/{totalTasks} tác vụ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 1: Đã Hoàn Thành */}
        <div 
          id="stat-box-completed"
          onClick={() => onShowTaskList && onShowTaskList('COMPLETED')}
          className="bg-emerald-55/15 hover:bg-emerald-55/30 border border-emerald-200/90 hover:border-emerald-400 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-emerald-850 text-xs font-bold font-sans">Đã hoàn thành</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-3xs">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-black text-emerald-950 leading-none">{completedTasks}</span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1.5 uppercase tracking-wide font-mono">Đã duyệt &amp; lưu</span>
          </div>
        </div>

        {/* Metric 2: Chờ Phê Duyệt */}
        <div 
          id="stat-box-pending"
          onClick={() => onShowTaskList && onShowTaskList('PENDING')}
          className={`border rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
            pendingTasks > 0 
              ? 'border-amber-400 bg-amber-50/40 hover:bg-amber-50/65 text-slate-905' 
              : 'border-amber-200 bg-amber-50/15 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-850 text-xs font-bold font-sans">Đang chờ duyệt</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-3xs ${
              pendingTasks > 0 ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              <Hourglass className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-black text-amber-950 leading-none">{pendingTasks}</span>
            {pendingTasks > 0 ? (
              <span className="text-[10px] text-amber-700 font-black block mt-1.5 uppercase tracking-wide font-mono">Cần phê duyệt gấp</span>
            ) : (
              <span className="text-[10px] text-amber-650 font-bold block mt-1.5 uppercase tracking-wide font-mono">Không có hồ sơ chờ</span>
            )}
          </div>
        </div>

        {/* Metric 3: Đang Thực Hiện */}
        <div 
          id="stat-box-inprogress"
          onClick={() => onShowTaskList && onShowTaskList('IN_PROGRESS')}
          className="bg-sky-55/15 hover:bg-sky-55/30 border border-sky-200/90 hover:border-indigo-400 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-sky-850 text-xs font-bold font-sans">Đang tiến hành</span>
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200 shadow-3xs">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-black text-sky-950 leading-none">{inProgressTasks}</span>
            <span className="text-[10px] text-sky-700 font-bold block mt-1.5 uppercase tracking-wide font-mono">{notStartedTasks} việc chưa bắt đầu</span>
          </div>
        </div>

        {/* Metric 4: Trễ Hạn */}
        <div 
          id="stat-box-overdue"
          onClick={() => onShowTaskList && onShowTaskList('OVERDUE')}
          className={`border rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
            overdueTasks > 0 
              ? 'border-rose-400 bg-rose-50/40 hover:bg-rose-50/65 text-slate-905' 
              : 'border-rose-200 bg-rose-50/15 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-rose-850 text-xs font-bold font-sans">Công việc trễ hạn</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-3xs ${
              overdueTasks > 0 ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-rose-50 text-rose-500 border-rose-100'
            }`}>
              <CalendarRange className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-display font-black leading-none ${overdueTasks > 0 ? 'text-rose-700' : 'text-rose-955'}`}>
              {overdueTasks}
            </span>
            {overdueTasks > 0 ? (
              <span className="text-[10px] text-rose-700 font-extrabold block mt-1.5 uppercase tracking-wide font-mono">Cần hoàn thiện ngay</span>
            ) : (
              <span className="text-[10px] text-rose-600 font-bold block mt-1.5 uppercase tracking-wide font-mono">Đúng tiến trình</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}