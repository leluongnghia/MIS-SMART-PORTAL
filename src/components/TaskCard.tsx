import React from 'react';
import { motion } from 'motion/react';
import { Task, UserProfile, TaskStatus, RbacConfig, getSafeAvatar } from '../types';
import { getTaskIntelligences, MOCK_USERS } from '../mockData';
import { getScoreColorClass, getScoreBgClass } from '../utils/colorUtils';
import { 
  Calendar, 
  AlertCircle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Play, 
  Send, 
  Check, 
  RotateCcw, 
  Eye,
  Trash2,
  FileText
} from 'lucide-react';

interface TaskCardProps {
  key?: React.Key | string;
  isCompact?: boolean;
  task: Task;
  currentUser: UserProfile;
  rbacConfig?: RbacConfig;
  onViewDetails: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus, evidence?: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskCard({
  task,
  currentUser,
  rbacConfig,
  isCompact = false,
  onViewDetails,
  onUpdateStatus,
  onRejectTask,
  onDeleteTask
}: TaskCardProps) {
  
  // Custom badges for Tag types
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'Chuyên môn':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Báo cáo':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Hội họp':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hoạt động':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Border & background based on priority
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CAO':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Cao',
          dot: 'bg-rose-500'
        };
      case 'TRUNG_BINH':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Trung bình',
          dot: 'bg-amber-500'
        };
      case 'THAP':
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Thấp',
          dot: 'bg-slate-400'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Thường',
          dot: 'bg-slate-300'
        };
    }
  };

  const getStatusDetails = (status: TaskStatus) => {
    switch (status) {
      case 'CHUA_BAT_DA':
        return {
          label: 'Chưa bắt đầu',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: Clock
        };
      case 'DANG_TIEN_HANH':
        return {
          label: 'Đang làm',
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: Play
        };
      case 'CHO_DUYET':
        return {
          label: 'Chờ duyệt',
          color: 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse',
          icon: FileText
        };
      case 'HOAN_THANH':
        return {
          label: 'Hoàn thành',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2
        };
    }
  };

  const priorityInfo = getPriorityStyle(task.priority);
  const statusInfo = getStatusDetails(task.status);
  const StatusIcon = statusInfo.icon;

  const workspaceMap: Record<string, string> = {
    'BGH': 'BGH & Hội đồng',
    'TUYEN_SINH_PR': 'Tuyển sinh & PR',
    'QUOC_TE': 'Ban Quốc tế',
    'KHAO_THI': 'Khảo thí & ĐBCL',
    'CTHS_TAM_LY': 'CTHS & Tâm lý',
    'DICH_VU_HOC_DUONG': 'Dịch vụ & Vận hành',
    'TOAN_TIN': 'Tổ Toán - Tin',
    'VAN': 'Tổ Ngữ Văn',
    'HANH_CHINH': 'Hành chính & Kế toán'
  };
  const deptName = workspaceMap[task.workspaceId] || task.workspaceId;

  // Determine permissions
  const isAdmin = currentUser.role === 'ADMIN';
  const isManager = currentUser.role === 'MANAGER';
  const isAssignedToMe = task.assignedId === currentUser.id;
  
  // Manager is supervisor if task workspace matches manager workspace
  const isMyDepartmentManager = isManager && currentUser.workspaceId === task.workspaceId;
  const isSupervisorDef = isAdmin || isMyDepartmentManager;

  // Enforce dynamic RBAC rules
  const rolePermissions = rbacConfig ? rbacConfig[currentUser.role] : {
    createTask: isAdmin || isManager,
    editTask: isAdmin || isManager,
    deleteTask: isAdmin,
    changeStatus: true,
    submitReport: true,
    approveReport: isAdmin || isManager,
    rejectReport: isAdmin || isManager,
    addComment: true,
    manageWorkspaces: isAdmin,
  };

  const hasChangeStatusPermission = rolePermissions.changeStatus;
  const hasSubmitReportPermission = rolePermissions.submitReport;
  const hasApproveReportPermission = rolePermissions.approveReport && isSupervisorDef;
  const hasRejectReportPermission = rolePermissions.rejectReport && isSupervisorDef;
  const hasDeleteTaskPermission = rolePermissions.deleteTask && (isAdmin || task.createdBy === currentUser.name);

  // Check if deadline is overdue (and not finished)
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'HOAN_THANH';
  const isCompleted = task.status === 'HOAN_THANH';

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'CHUA_BAT_DA': return 25;
      case 'DANG_TIEN_HANH': return 50;
      case 'CHO_DUYET': return 75;
      case 'HOAN_THANH': return 100;
      default: return 0;
    }
  };
  const progressPercent = getProgressPercentage(task.status);

  return (
    <div 
      id={`task-card-${task.id}`}
      className={`group relative flex flex-col justify-between border rounded-2xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/50 transition-all duration-300 ease-out overflow-hidden ${
        isOverdue 
          ? 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/5' 
          : isCompleted 
            ? 'border-emerald-200 bg-emerald-50/40 opacity-80'
            : 'border-slate-200/90'
      } ${isCompact ? 'p-3' : 'p-5'}`}
    >
      {/* Dynamic top elements */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5 items-center flex-1">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-sans tracking-tight">
              {deptName}
            </span>
            {!isCompact && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${getTagStyle(task.tag)}`}>
                {task.tag}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 uppercase tracking-wider ${priorityInfo.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`}></span>
              {!isCompact && priorityInfo.label}
            </span>
          </div>
          
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 uppercase tracking-wider shrink-0 ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3" />
            {!isCompact && statusInfo.label}
          </span>
        </div>

        {/* Title with modern heavy display font */}
        <h4 
          className={`font-display font-black leading-tight transition-colors duration-200 line-clamp-2 ${
            isCompact ? 'text-[12px] mb-1.5' : 'text-[13px] mb-1.5'
          } ${
            isCompleted ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-indigo-600'
          }`}
          title={task.title}
        >
          {task.title}
        </h4>

        {/* Description */}
        {!isCompact && (
          <p 
            className={`text-[11px] leading-relaxed line-clamp-2 mb-3 ${
              isCompleted ? 'text-slate-400' : 'text-slate-500'
            }`}
            title={task.description}
          >
            {task.description}
          </p>
        )}

        {/* Multiple Intelligences Development Tags */}
        {!isCompact && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {getTaskIntelligences(task).map((intel, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border antialiased ${intel.bg}`}
                title={intel.description}
              >
                <span>{intel.icon}</span>
                <span>{intel.name.replace('Trí tuệ ', '')}</span>
              </span>
            ))}
          </div>
        )}

        {/* Evidence feedback hint */}
        {task.status === 'CHO_DUYET' && task.reportEvidence && (
          <div 
            className="mb-4 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-800 line-clamp-2"
            title={task.reportEvidence}
          >
            <span className="font-semibold block mb-0.5">📝 Báo cáo tiến độ:</span>
            {task.reportEvidence}
          </div>
        )}

        {task.rejectionReason && task.status === 'DANG_TIEN_HANH' && (
          <div 
            className="mb-4 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-800 line-clamp-2"
            title={task.rejectionReason}
          >
            <span className="font-semibold block mb-0.5">⚠️ Yêu cầu sửa đổi:</span>
            {task.rejectionReason}
          </div>
        )}

        {/* Progress Bar */}
        {!isCompact && (
          <div className="mb-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>Hiệu suất Học thuật & OKR</span>
              <motion.span 
                key={progressPercent}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={getScoreColorClass(progressPercent)}
              >
                {progressPercent}%
              </motion.span>
            </div>
            <div className="w-full h-1.5 bg-slate-100/80 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeInOut", type: "spring", bounce: 0.2 }}
                className={`h-full rounded-full ${getScoreBgClass(progressPercent)}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer info & Actions */}
      <div className={`${isCompact ? 'mt-2' : 'mt-3'} flex flex-col ${isCompact ? 'gap-1.5' : 'gap-2.5'}`}>
        {/* Assingee & Deadline */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className={`flex items-center gap-2 ${isCompleted ? 'grayscale opacity-70' : ''}`}>
            <img 
              src={getSafeAvatar(
                task.assignedId ? MOCK_USERS_AVATAR_MAP[task.assignedId] || MOCK_USERS.find(u => u.id === task.assignedId)?.avatar : undefined,
                task.assignedName
              )}
              alt={task.assignedName}
              referrerPolicy="no-referrer"
              className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full object-cover border border-slate-200`}
            />
            <div className="flex flex-col">
              <span className={`font-medium ${isCompact ? 'text-[10px]' : 'text-[11px]'} line-clamp-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{task.assignedName}</span>
              {!isCompact && <span className="text-[10px] text-slate-400 font-normal line-clamp-1">{task.assignedRole}</span>}
            </div>
          </div>

          <div className={`flex items-center gap-1 font-mono ${isCompact ? 'text-[10px]' : 'text-[11px]'} ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
            <Calendar className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
            <span>{formatVietnameseDate(task.deadline)}</span>
          </div>
        </div>

        {/* Action Buttons list */}
        {!isCompact && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100/50">
            {/* Quick info feedback icons */}
            <div className="flex items-center gap-2.5 text-slate-400 text-xs">
            <button 
              id={`btn-view-${task.id}`}
              onClick={() => onViewDetails(task)}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors p-1.5"
              title="Xem Chi Tiết & Thảo luận"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-[11px] text-slate-500">Chi tiết</span>
            </button>
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px]" title="Số lượng thảo luận">
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </span>
            )}
          </div>

          {/* Supervisor & Assignee custom operations */}
          <div className="flex flex-wrap items-center gap-2">
            {/* If assigned to me, I can change states */}
            {isAssignedToMe && task.status === 'CHUA_BAT_DA' && hasChangeStatusPermission && (
              <button
                id={`btn-start-${task.id}`}
                onClick={() => onUpdateStatus(task.id, 'DANG_TIEN_HANH')}
                className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-medium text-[11px] rounded-lg shadow-sm transition-all"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Bắt đầu</span>
              </button>
            )}

            {isAssignedToMe && task.status === 'DANG_TIEN_HANH' && hasSubmitReportPermission && (
              <button
                id={`btn-submit-${task.id}`}
                onClick={() => onViewDetails(task)} // Opens modal to prompt submission notes (reports)
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] rounded-lg shadow-sm transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Nộp báo cáo</span>
              </button>
            )}

            {/* Quick Approve (Duyệt nhanh) for supervisors when task is not yet completed or under review */}
            {isSupervisorDef && task.status !== 'HOAN_THANH' && task.status !== 'CHO_DUYET' && (
              <button
                id={`btn-quick-approve-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(task.id, 'HOAN_THANH');
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-[10px] rounded-lg shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer border border-amber-400/20 active:scale-95"
                title="Duyệt nhanh công việc này sang trạng thái Hoàn thành ngay lập tức (không cần báo cáo từ giáo viên)"
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span>Duyệt nhanh</span>
              </button>
            )}

            {/* If supervisor, I can approve or request changes on CHO_DUYET */}
            {task.status === 'CHO_DUYET' && (hasRejectReportPermission || hasApproveReportPermission) && (
              <div className="flex gap-1.5">
                {hasRejectReportPermission && (
                  <button
                    id={`btn-reject-${task.id}`}
                    onClick={() => onViewDetails(task)} // open details to fill in request change reason
                    className="px-2 py-1 border border-rose-200 hover:bg-rose-50 text-rose-700 font-medium text-[10px] rounded-lg transition-colors"
                    title="Yêu cầu sửa báo cáo"
                  >
                    Yêu cầu sửa
                  </button>
                )}
                {hasApproveReportPermission && (
                  <button
                    id={`btn-approve-${task.id}`}
                    onClick={() => onUpdateStatus(task.id, 'HOAN_THANH')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[10px] rounded-lg shadow-sm transition-all"
                    title="Duyệt hoàn thành công việc"
                  >
                    <Check className="w-3 h-3" />
                    <span>Duyệt</span>
                  </button>
                )}
              </div>
            )}

            {/* Delete button (only Creator or Admin can delete tasks) */}
            {hasDeleteTaskPermission && (
              <button
                id={`btn-delete-${task.id}`}
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xóa công việc "${task.title}"?`)) {
                    onDeleteTask(task.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Xóa công việc"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

// Maps user IDs to avatars in case avatars contain broken relative links
const MOCK_USERS_AVATAR_MAP: Record<string, string> = {
  'user_triet': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'user_nhan': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  'user_dat': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'user_nam': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
  'user_nhung': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'user_kha': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=110&fit=crop&crop=face'
};

// Formats date string to 'DD/MM/YYYY'
function formatVietnameseDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}
