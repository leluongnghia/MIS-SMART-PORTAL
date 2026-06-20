import React, { useState, useEffect } from 'react';
import { Task, UserProfile, Comment, TaskStatus, RbacConfig } from '../types';
import { getTaskIntelligences, MOCK_USERS } from '../mockData';
import { MOCK_DEPARTMENT_OKRS } from '../miAndOkrUtils';
import { useToast } from './ui/Toast';
import { 
  X, 
  User, 
  Calendar, 
  AlertCircle, 
  MessageSquare, 
  Milestone, 
  History, 
  Send, 
  Check, 
  RotateCcw,
  FileText,
  AlertTriangle,
  Award,
  Pencil,
  Trash2,
  Plus,
  CheckSquare,
  Play
} from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  currentUser: UserProfile;
  rbacConfig?: RbacConfig;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus, evidence?: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
  onAddComment: (taskId: string, commentContent: string) => void;
  tasks?: Task[];
  onSwitchTask?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskDetailsModal({
  task,
  onClose,
  currentUser,
  rbacConfig,
  onUpdateStatus,
  onRejectTask,
  onAddComment,
  tasks = [],
  onSwitchTask,
  onUpdateTask
}: TaskDetailsModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [newComment, setNewComment] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRelatedPopup, setShowRelatedPopup] = useState(false);

  // States for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDeadline, setEditDeadline] = useState(task.deadline);
  const [editAssignedId, setEditAssignedId] = useState(task.assignedId);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');

  // Keep state in sync when task changes (e.g. via navigation)
  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditDeadline(task.deadline);
    setEditAssignedId(task.assignedId);
    setEditPriority(task.priority);
    setIsEditing(false);
  }, [task]);

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      toastError('Lỗi', 'Vui lòng nhập tiêu đề công việc.');
      return;
    }
    if (!editDescription.trim()) {
      toastError('Lỗi', 'Vui lòng nhập mô tả công việc.');
      return;
    }

    const assignedUser = MOCK_USERS.find(u => u.id === editAssignedId);
    if (!assignedUser) return;

    if (onUpdateTask) {
      onUpdateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        deadline: editDeadline,
        assignedId: editAssignedId,
        assignedName: assignedUser.name,
        assignedRole: assignedUser.title,
        priority: editPriority
      });
    }
    setIsEditing(false);
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!task.checklist || !onUpdateTask) return;
    const updatedChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdateTask(task.id, { checklist: updatedChecklist });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItemText.trim() || !onUpdateTask) return;
    const newItem = {
      id: `chk_${Date.now()}`,
      text: newChecklistItemText.trim(),
      done: false
    };
    const updatedChecklist = [...(task.checklist || []), newItem];
    onUpdateTask(task.id, { checklist: updatedChecklist });
    setNewChecklistItemText('');
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    if (!task.checklist || !onUpdateTask) return;
    const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
    onUpdateTask(task.id, { checklist: updatedChecklist });
  };

  // Returns eligible users who can be reassigned to this task
  const getEligibleAssignees = (): UserProfile[] => {
    // Filter by same workspace if possible, otherwise return all users
    const sameDept = MOCK_USERS.filter(u => u.workspaceId === task.workspaceId);
    return sameDept.length > 0 ? sameDept : MOCK_USERS;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CAO':
        return 'bg-rose-100 text-rose-800 font-bold border-rose-200';
      case 'TRUNG_BINH':
        return 'bg-amber-100 text-amber-800 font-semibold border-amber-200';
      case 'THAP':
        return 'bg-slate-100 text-slate-700 font-medium border-slate-200';
      default:
        return 'bg-slate-100/80 text-slate-700 border-slate-200';
    }
  };

  const statusMap: Record<TaskStatus, { label: string; color: string }> = {
    'CHUA_BAT_DA': { label: 'Chưa bắt đầu', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    'DANG_TIEN_HANH': { label: 'Đang tiến hành', color: 'bg-sky-100 text-sky-800 border-sky-300' },
    'CHO_DUYET': { label: 'Chờ duyệt báo cáo', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    'HOAN_THANH': { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment.trim());
    setNewComment('');
  };

  const handleSendProgressReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceText.trim()) {
      toastError('Lỗi', 'Vui lòng nhập báo cáo kết quả và minh chứng thực hiện.');
      return;
    }
    onUpdateStatus(task.id, 'CHO_DUYET', evidenceText.trim());
    setEvidenceText('');
    setIsSubmittingReport(false);
  };

  const handleSendRejectionBack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toastError('Lỗi', 'Vui lòng chỉ rõ lý do và nội dung cần sửa đổi.');
      return;
    }
    onRejectTask(task.id, rejectionReason.trim());
    setRejectionReason('');
    setIsRejecting(false);
  };

  // Roles verification
  const isAdmin = currentUser.role === 'ADMIN';
  const isManager = currentUser.role === 'MANAGER';
  const isAssignedToMe = task.assignedId === currentUser.id;
  const isMyDepartment = currentUser.workspaceId === task.workspaceId;
  const isSupervisorDef = isAdmin || (isManager && isMyDepartment);

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

  const hasSubmitReportPermission = rolePermissions.submitReport;
  const hasApproveReportPermission = rolePermissions.approveReport && isSupervisorDef;
  const hasRejectReportPermission = rolePermissions.rejectReport && isSupervisorDef;
  const hasCommentPermission = rolePermissions.addComment;
  const canEditTask = rolePermissions.editTask && isSupervisorDef;

  // Stepper state workflow configurations
  const statuses: TaskStatus[] = ['CHUA_BAT_DA', 'DANG_TIEN_HANH', 'CHO_DUYET', 'HOAN_THANH'];
  const statusLabels: Record<TaskStatus, string> = {
    'CHUA_BAT_DA': 'Chưa bắt đầu',
    'DANG_TIEN_HANH': 'Đang tiến hành',
    'CHO_DUYET': 'Chờ duyệt',
    'HOAN_THANH': 'Hoàn thành'
  };

  const canTransitionTo = (targetStatus: TaskStatus) => {
    if (targetStatus === task.status) return false;
    if (isAdmin) return true;

    if (isAssignedToMe) {
      if (targetStatus === 'CHUA_BAT_DA' && task.status === 'DANG_TIEN_HANH' && rolePermissions.changeStatus) return true;
      if (targetStatus === 'DANG_TIEN_HANH' && task.status === 'CHUA_BAT_DA' && rolePermissions.changeStatus) return true;
      if (targetStatus === 'CHO_DUYET' && task.status === 'DANG_TIEN_HANH' && rolePermissions.submitReport) return true;
    }

    if (isSupervisorDef) {
      if (task.status === 'CHO_DUYET') {
        if (targetStatus === 'HOAN_THANH' && rolePermissions.approveReport) return true;
        if (targetStatus === 'DANG_TIEN_HANH' && rolePermissions.rejectReport) return true;
      }
      if (rolePermissions.changeStatus) {
        if (targetStatus !== 'HOAN_THANH') return true;
      }
    }

    return false;
  };

  const handleTransitionTo = (targetStatus: TaskStatus) => {
    if (!canTransitionTo(targetStatus)) return;
    
    if (targetStatus === 'CHO_DUYET') {
      setIsSubmittingReport(true);
      setTimeout(() => {
        const textEv = document.getElementById('textarea-evidence');
        if (textEv) {
          textEv.focus();
          textEv.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (targetStatus === 'HOAN_THANH') {
      onUpdateStatus(task.id, 'HOAN_THANH');
    } else if (targetStatus === 'DANG_TIEN_HANH' && task.status === 'CHO_DUYET') {
      setIsRejecting(true);
      setTimeout(() => {
        const textRe = document.getElementById('rejection-reason-textarea');
        if (textRe) {
          textRe.focus();
          textRe.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      onUpdateStatus(task.id, targetStatus);
    }
  };

  // Find related tasks (excluding current task id)
  const relatedTasks = tasks.filter(t => t.id !== task.id && (
    task.linkedOkrId 
      ? t.linkedOkrId === task.linkedOkrId 
      : (t.workspaceId === task.workspaceId && t.tag === task.tag)
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-overlay p-4 animate-fade-in">
      <div 
        id={`task-detail-modal-${task.id}`}
        className="glass-modal rounded-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] md:border md:border-white/80 animate-scale-up"
      >
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 bg-white/40 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1.5 bg-slate-100/55 px-2.5 py-1 rounded-md border border-slate-200/40">
                <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider font-mono">Độ ưu tiên:</span>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="text-[10px] font-semibold text-slate-800 border border-slate-200 rounded p-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="CAO">Cao</option>
                  <option value="TRUNG_BINH">Trung bình</option>
                  <option value="THAP">Thấp</option>
                </select>
              </div>
            ) : (
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 font-mono font-semibold rounded-md border ${getPriorityBadge(task.priority)}`}>
                Độ ưu tiên: {task.priority === 'CAO' ? 'Cao' : task.priority === 'TRUNG_BINH' ? 'Trung bình' : 'Thấp'}
              </span>
            )}
            <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 font-semibold rounded-md border ${statusMap[task.status].color}`}>
              {statusMap[task.status].label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canEditTask && (
              isEditing ? (
                <div className="flex items-center gap-1.5 mr-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-lg transition-colors mr-2 cursor-pointer shadow-4xs"
                >
                  <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chỉnh sửa</span>
                </button>
              )
            )}
            <button 
              id="btn-close-details"
              onClick={onClose}
              className="p-1.5 hover:bg-white/80 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-200/40 bg-white/20 shadow-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200/50 flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] font-mono">Tiến trình xử lý:</span>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-1 max-w-2xl justify-around sm:justify-start">
            {statuses.map((st, idx) => {
              const isActive = task.status === st;
              const isPassed = statuses.indexOf(task.status) >= idx;
              const canClick = canTransitionTo(st);
              
              let nodeColor = 'bg-slate-100 text-slate-400 border-slate-200';
              if (isActive) {
                nodeColor = st === 'HOAN_THANH' ? 'bg-emerald-600 text-white border-emerald-600'
                  : st === 'CHO_DUYET' ? 'bg-amber-500 text-white border-amber-500'
                  : st === 'DANG_TIEN_HANH' ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-650 text-white border-slate-650';
              } else if (isPassed) {
                nodeColor = 'bg-indigo-50 text-indigo-750 border-indigo-200';
              }
              
              return (
                <React.Fragment key={st}>
                  {idx > 0 && (
                    <div className={`h-0.5 flex-1 min-w-[12px] sm:min-w-[24px] ${isPassed ? 'bg-indigo-300' : 'bg-slate-250'}`} />
                  )}
                  <button
                    type="button"
                    disabled={!canClick}
                    onClick={() => handleTransitionTo(st)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${nodeColor} ${
                      canClick 
                        ? 'hover:scale-105 hover:shadow-xs active:scale-95 cursor-pointer' 
                        : 'cursor-default opacity-90'
                    }`}
                    title={canClick ? `Bấm để chuyển trạng thái sang: ${statusLabels[st]}` : statusLabels[st]}
                  >
                    <span className="w-1.2 h-1.2 rounded-full bg-current" />
                    <span>{statusLabels[st]}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body (Grid) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Main Left Side (Content & Discussion) */}
          <div className="lg:col-span-2 p-6 flex flex-col space-y-6">
            <div>
              <span className="text-slate-400 font-bold text-[10px] uppercase block tracking-wider mb-1.5 font-mono">Nội dung nhiệm vụ</span>
              {isEditing ? (
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Tiêu đề nhiệm vụ</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-sm font-bold text-slate-900 border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-3 bg-white"
                      placeholder="Nhập tiêu đề nhiệm vụ..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Mô tả chi tiết</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full text-xs text-slate-800 border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-3 bg-white font-sans"
                      placeholder="Mô tả công việc chi tiết..."
                      rows={5}
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-display font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h2>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-100 p-4 rounded-xl font-sans">
                    {task.description}
                  </p>
                </>
              )}
            </div>

            {/* Checklist / Sub-tasks Section */}
            <div className="border-t border-slate-150/60 pt-5">
              <h3 className="font-display font-semibold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                Danh sách checklist công việc ({task.checklist ? task.checklist.filter(c => c.done).length : 0}/{task.checklist ? task.checklist.length : 0})
              </h3>

              {/* Progress bar for checklist */}
              {task.checklist && task.checklist.length > 0 && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden">
                  <div 
                    className="bg-indigo-605 h-full transition-all duration-300 rounded-full" 
                    style={{ width: `${(task.checklist.filter(c => c.done).length / task.checklist.length) * 100}%` }}
                    // bg-indigo-605 is custom or we can use bg-indigo-600
                  />
                </div>
              )}
              
              <div className="space-y-2 mb-3">
                {(!task.checklist || task.checklist.length === 0) ? (
                  <p className="text-slate-400 text-[11px] italic py-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
                    Chưa có hạng mục checklist nào.
                  </p>
                ) : (
                  task.checklist.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50/50 hover:bg-slate-55 border border-slate-100 rounded-xl px-3.5 py-2 hover:border-indigo-150 transition-all group">
                      <label className="flex items-center gap-3.5 cursor-pointer flex-1 select-none">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="w-4.5 h-4.5 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className={`text-xs ${item.done ? 'line-through text-slate-400 font-normal' : 'text-slate-700 font-semibold'}`}>
                          {item.text}
                        </span>
                      </label>
                      
                      {/* Only allow delete for people who can edit or assignee */}
                      {(canEditTask || isAssignedToMe) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add checklist item Form */}
              {(canEditTask || isAssignedToMe) && (
                <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistItemText}
                    onChange={(e) => setNewChecklistItemText(e.target.value)}
                    placeholder="Thêm hạng mục công việc phụ cần làm..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </form>
              )}
            </div>

            {/* Current report feedback notes */}
            {task.status === 'CHO_DUYET' && task.reportEvidence && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-slate-800 text-xs">
                <span className="font-bold flex items-center gap-1 text-amber-900 text-sm mb-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  Báo cáo của nhân sự đang chờ duyệt:
                </span>
                <p className="leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-100/60 font-medium">
                  "{task.reportEvidence}"
                </p>
              </div>
            )}

            {task.rejectionReason && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-slate-800 text-xs">
                <span className="font-bold flex items-center gap-1 text-rose-900 text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Ghi chú yêu cầu điều chỉnh lại lý do:
                </span>
                <p className="leading-relaxed font-semibold text-rose-800 bg-white/70 p-3 rounded-lg border border-rose-100">
                  {task.rejectionReason}
                </p>
              </div>
            )}

            {/* Accept Task / Start Work Block */}
            {isAssignedToMe && task.status === 'CHUA_BAT_DA' && rolePermissions.changeStatus && (
              <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sky-950 text-xs">Bạn chưa bắt đầu nhiệm vụ này?</h4>
                  <p className="text-[11px] text-sky-700">Nhấp vào đây để nhận việc và bắt đầu thực hiện.</p>
                </div>
                <button
                  id="btn-start-task-modal"
                  onClick={() => onUpdateStatus(task.id, 'DANG_TIEN_HANH')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-4xs"
                >
                  <Play className="w-3 h-3 fill-white text-white" />
                  <span>Bắt đầu thực hiện</span>
                </button>
              </div>
            )}

            {/* Teacher Submit Engine Block */}
            {isAssignedToMe && task.status === 'DANG_TIEN_HANH' && !isSubmittingReport && hasSubmitReportPermission && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-indigo-900 text-xs">Bạn đã hoàn thành nhiệm vụ này?</h4>
                  <p className="text-[11px] text-indigo-700">Hãy gửi báo cáo kết quả cùng minh chứng để được phê duyệt.</p>
                </div>
                <button
                  id="btn-trigger-report-form"
                  onClick={() => setIsSubmittingReport(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-transform"
                >
                  Nộp báo cáo công việc
                </button>
              </div>
            )}

            {isSubmittingReport && (
              <form onSubmit={handleSendProgressReport} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Báo cáo kết quả và Tài liệu minh chứng</h4>
                <textarea
                  id="textarea-evidence"
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Ghi rõ thông tin kết quả: ví dụ như đường link Thư mục học liệu, số lượng tiết dạy, văn bản đã nộp..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  rows={3}
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmittingReport(false)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Gửi yêu cầu kiểm duyệt
                  </button>
                </div>
              </form>
            )}

            {/* Discussion / Comments section */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-display font-semibold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-4.5 h-4.5 text-slate-400" />
                Ý kiến đóng góp & Thảo luận ({task.comments.length})
              </h3>

              {/* Comments list */}
              <div id="comments-list" className="space-y-3 max-h-[220px] overflow-y-auto mb-4 pr-1.5 scrollbar-thin">
                {task.comments.length === 0 ? (
                  <p className="text-slate-400 text-[11px] italic text-center py-4 bg-slate-50/50 rounded-lg">
                    Chưa có ý kiến trao đổi nào cho công việc này.
                  </p>
                ) : (
                  task.comments.map(c => (
                    <div key={c.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[11px] text-slate-800">{c.userName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded font-normal">
                            {c.userTitle}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment Form */}
              {hasCommentPermission ? (
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    id="add-comment-input"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Gõ ý kiến phản hồi hoặc ghi chú bảo vệ chuyên môn..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center text-[11px] text-slate-400 italic">
                  Vai trò của bạn chưa được cấp quyền đóng góp ý kiến thảo luận.
                </div>
              )}
            </div>
          </div>

          {/* Right Side Column (Meta Infos, Audits & Supervisor Gateway) */}
          <div className="p-6 bg-slate-50/70 flex flex-col space-y-6">
            {/* Meta Information */}
            <div>
              <span className="text-slate-400 font-bold text-[10px] uppercase block tracking-wider mb-3 font-mono">Thông tin phân công</span>
              
              <div className="space-y-3.5">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Người đảm nhận</span>
                  {isEditing ? (
                    <select
                      value={editAssignedId}
                      onChange={(e) => setEditAssignedId(e.target.value)}
                      className="mt-1 w-full text-xs text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-2 bg-white"
                    >
                      {getEligibleAssignees().map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.title})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-slate-800">{task.assignedName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 ml-4 block">{task.assignedRole}</span>
                    </>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Ngày phân công</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                    {(() => {
                      if (task.history && task.history.length > 0) {
                        const firstLog = task.history[0];
                        if (firstLog.createdAt) {
                          const datePart = firstLog.createdAt.split(' ')[0];
                          if (datePart.includes('-')) {
                            return datePart.split('-').reverse().join('/');
                          }
                          return datePart;
                        }
                      }
                      return '30/05/2026';
                    })()}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Hạn nộp báo cáo</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="mt-1 w-full text-xs text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-2 bg-white"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-700 block mt-0.5">{task.deadline}</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Người phê duyệt chỉ thị</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">{task.createdBy}</span>
                </div>

                {task.linkedOkrId && (
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                    <span className="text-[10px] text-indigo-700 font-bold block mb-1">🎯 OKR / KPI Liên kết:</span>
                    {(() => {
                      const matchedOkr = MOCK_DEPARTMENT_OKRS.find(o => o.id === task.linkedOkrId);
                      return matchedOkr ? (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800 leading-tight">
                            {matchedOkr.objective}
                          </p>
                          <p className="text-[10px] text-slate-500 italic mt-1 font-sans">
                            Chỉ số KPI: {matchedOkr.kpi} ({matchedOkr.currentValue}/{matchedOkr.targetValue} {matchedOkr.unit})
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-450 italic">Không tìm thấy OKR tương ứng</p>
                      );
                    })()}
                  </div>
                )}

                {/* Related tasks element with interactive hover popup */}
                <div className="relative pt-1" id="related-tasks-wrapper">
                  <span className="text-[11px] text-slate-400 font-medium block">Công việc liên quan</span>
                  <div 
                    className="relative mt-1"
                    onMouseEnter={() => setShowRelatedPopup(true)}
                    onMouseLeave={() => setShowRelatedPopup(false)}
                  >
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl cursor-default transition-all shadow-4xs text-xs font-semibold text-slate-700">
                      <Milestone className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{relatedTasks.length > 0 ? `${relatedTasks.length} nhiệm vụ liên quan` : '0 nhiệm vụ liên quan'}</span>
                      <span className="ml-auto text-[10px] text-slate-400 font-normal">Xem ▽</span>
                    </div>

                    {showRelatedPopup && (
                      <div 
                        className="absolute right-0 bottom-full lg:bottom-auto lg:top-full mt-2 lg:mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-72 md:w-80 animate-scale-up space-y-2 text-left"
                        style={{ transformOrigin: 'top right' }}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide font-sans flex items-center gap-1">
                            <span>🔗</span> Đầu việc liên quan ({relatedTasks.length})
                          </span>
                          <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">HOVER POPUP</span>
                        </div>
                        
                        {relatedTasks.length > 0 ? (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                            {relatedTasks.map(t => {
                              const statusColor = t.status === 'HOAN_THANH' ? 'bg-emerald-100 text-emerald-800' 
                                : t.status === 'CHO_DUYET' ? 'bg-amber-100 text-amber-800' 
                                : t.status === 'DANG_TIEN_HANH' ? 'bg-sky-100 text-sky-800' 
                                : 'bg-slate-100 text-slate-800';
                              
                              return (
                                <div 
                                  key={t.id}
                                  onClick={() => {
                                    if (onSwitchTask) {
                                      onSwitchTask(t);
                                      setShowRelatedPopup(false);
                                    }
                                  }}
                                  className={`p-2 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-150 rounded-lg border border-slate-100 transition-all text-left ${
                                    onSwitchTask ? 'cursor-pointer' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <h5 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-snug flex-1">
                                      {t.title}
                                    </h5>
                                    <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-tight ${statusColor}`}>
                                      {t.status === 'HOAN_THANH' ? 'Xong' : t.status === 'CHO_DUYET' ? 'Chờ' : t.status === 'DANG_TIEN_HANH' ? 'Làm' : 'Chưa'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-[10px] text-slate-405 mt-1.5 font-sans border-t border-slate-100/60 pt-1.5">
                                    <span className="truncate max-w-[120px] text-slate-500">👤 {t.assignedName}</span>
                                    <span className="text-slate-400">🕒 {t.deadline.split('-').reverse().slice(0, 2).join('/')}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-slate-450 italic text-[11px]">
                            Không tìm thấy công việc liên quan khác trong cùng chuyên mục này.
                          </div>
                        )}
                        
                        {relatedTasks.length > 0 && onSwitchTask && (
                          <p className="text-[9.5px] text-indigo-600 text-center font-medium italic pt-1 border-t border-slate-150 mt-1">
                            💡 Nhấp vào để chuyển nhanh chế độ xem
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>



            {/* Supervisor Action Gate - Approve / Edit requests */}
            {(hasApproveReportPermission || hasRejectReportPermission) && task.status === 'CHO_DUYET' && (
              <div id="supervisor-decision-panel" className="border-t border-slate-200/80 pt-5 space-y-3">
                <span className="text-amber-800 font-bold text-[10px] uppercase block tracking-wider font-mono">Dành cho cấp quản lý</span>
                
                {!isRejecting ? (
                  <div className="flex flex-col gap-2">
                    {hasApproveReportPermission && (
                      <button
                        id="btn-approve-detailed"
                        onClick={() => onUpdateStatus(task.id, 'HOAN_THANH')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Duyệt hoàn thành nhiệm vụ
                      </button>
                    )}
                    
                    {hasRejectReportPermission && (
                      <button
                        id="btn-trigger-reject-detailed"
                        onClick={() => setIsRejecting(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-xl transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Yêu cầu điều chỉnh lại
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSendRejectionBack} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2.5">
                    <label className="block text-[10px] font-bold text-rose-800">
                      Vui lòng nhập lý do & nội dung cần bổ sung:
                    </label>
                    <textarea
                      id="rejection-reason-textarea"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ví dụ: Thiếu danh sách giáo viên dạy thay. Đề nghị bổ sung thêm chi tiết..."
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                      rows={2.5}
                      required
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="px-2.5 py-1 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-[10px] rounded-lg font-semibold"
                      >
                        Bỏ qua
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] rounded-lg"
                      >
                        Gửi phản hồi
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Audit History Timeline Logs */}
            <div className="border-t border-slate-200 pt-5 flex-1 flex flex-col">
              <span className="text-slate-400 font-bold text-[10px] uppercase block tracking-wider mb-3.5 font-mono">Nhật ký xử lý (Audit)</span>
              
              <div id="history-trail" className="space-y-3.5 overflow-y-auto max-h-[180px] pr-1 scrollbar-thin flex-1 text-[11px]">
                {task.history.map((log, ix) => (
                  <div key={log.id} className="relative pl-4 flex gap-2">
                    {/* Left node border line */}
                    {ix !== task.history.length - 1 && (
                      <span className="absolute left-1.5 top-3.5 bottom-[-20px] w-0.5 bg-slate-200" />
                    )}
                    <span className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                      <History className="w-1.8 h-1.8 text-slate-500" />
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-600 leading-normal font-sans">
                        <span className="font-semibold text-slate-800">{log.userName}</span>: {log.action}
                      </p>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{log.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
