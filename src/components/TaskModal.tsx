import React, { useState } from 'react';
import { Task, Workspace, UserProfile, TaskPriority } from '../types';
import { MOCK_USERS, getTaskIntelligences } from '../mockData';
import { MOCK_DEPARTMENT_OKRS, enrichUserWithMIDetails } from '../miAndOkrUtils';
import { X, Plus, Users, Calendar, Milestone, AlertTriangle, FileText, Award, Target } from 'lucide-react';
import { useToast } from './ui/Toast';

interface TaskModalProps {
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'comments' | 'history'>) => void;
  currentUser: UserProfile;
  workspaces: Workspace[];
  allTasks?: Task[];
}

export default function TaskModal({ onClose, onSave, currentUser, workspaces, allTasks = [] }: TaskModalProps) {
  const { error: toastError } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('GENERAL');
  const [projectName, setProjectName] = useState('Công việc thường');
  const [parentTaskId, setParentTaskId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('TOAN_TIN');
  const [assignedId, setAssignedId] = useState('user_nam');
  const [priority, setPriority] = useState<TaskPriority>('TRUNG_BINH');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState('2026-06-15');
  const [tag, setTag] = useState('Chuyên môn');
  const [linkedOkrId, setLinkedOkrId] = useState('');

  // Determine predicted Multiple Intelligences dynamically based on live input matching MIS guidelines
  const pseudoTask: Task = {
    id: '',
    title,
    description,
    projectId,
    projectName,
    parentTaskId: parentTaskId || undefined,
    startDate,
    workspaceId,
    assignedId: '',
    assignedName: '',
    assignedRole: '',
    priority,
    status: 'CHUA_BAT_DA',
    deadline,
    tag,
    createdBy: '',
    comments: [],
    history: []
  };
  const predictedIntelligences = getTaskIntelligences(pseudoTask);

  // Filter workspaces that the current user can create tasks for.
  // BGH (Admin) can create tasks anywhere. 
  // Managers can only create tasks inside their own workspace department.
  const eligibleWorkspaces = workspaces.filter(w => {
    if (w.id === 'ALL') return false;
    if (currentUser.role === 'ADMIN') return true;
    return w.id === currentUser.workspaceId;
  });

  // Filter list of eligible teachers based on the chosen workspace
  const getEligibleAssignees = () => {
    if (workspaceId === 'BGH') {
      // General tasks can be assigned to anyone
      return MOCK_USERS;
    }
    // Match department users or include BGH members too
    return MOCK_USERS.filter(u => u.workspaceId === workspaceId || u.role === 'ADMIN');
  };

  const eligibleAssignees = getEligibleAssignees();
  const parentTaskOptions = allTasks.filter(task => task.workspaceId === workspaceId && task.status !== 'HOAN_THANH');

  // Filter OKRs linked to the selected department
  const eligibleOkrs = MOCK_DEPARTMENT_OKRS.filter(o => o.departmentId === workspaceId);

  // Calculate top 3 recommended teachers based on task MI profile matching user MI profile
  const getRecommendedAssignees = () => {
    if (predictedIntelligences.length === 0) return [];
    
    return eligibleAssignees
      .map(user => {
        const enriched = enrichUserWithMIDetails(user);
        const profile = enriched.miProfile!;
        
        let score = 0;
        predictedIntelligences.forEach(inte => {
          const key = inte.text as keyof typeof profile;
          if (profile[key]) {
            score += profile[key];
          }
        });
        
        const average = score / predictedIntelligences.length;
        return { user, score: Math.round(average) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const recommendedTeachers = getRecommendedAssignees();

  // Handle workspace change to automatically auto-assign a user from that department
  const handleWorkspaceChange = (wId: string) => {
    setWorkspaceId(wId);
    setParentTaskId('');
    
    // Auto reset OKR and assign top user
    const okrs = MOCK_DEPARTMENT_OKRS.filter(o => o.departmentId === wId);
    setLinkedOkrId(okrs.length > 0 ? okrs[0].id : '');

    const users = MOCK_USERS.filter(u => u.workspaceId === wId || u.role === 'ADMIN');
    if (users.length > 0) {
      setAssignedId(users[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toastError('Thiếu thông tin', 'Vui lòng nhập đầy đủ Tiêu đề và Mô tả công việc.');
      return;
    }

    const assignedUser = MOCK_USERS.find(u => u.id === assignedId)!;

    onSave({
      title,
      description,
      projectId,
      projectName,
      parentTaskId: parentTaskId || undefined,
      startDate,
      workspaceId,
      assignedId,
      assignedName: assignedUser.name,
      assignedRole: assignedUser.title,
      priority,
      status: 'CHUA_BAT_DA',
      deadline,
      tag,
      createdBy: currentUser.name,
      linkedOkrId: linkedOkrId || undefined
    });
  };

  const tagsList = ['Chuyên môn', 'Báo cáo', 'Hội họp', 'Hoạt động', 'Đại hội', 'Đột xuất'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-overlay p-4 animate-fade-in">
      <div 
        id="create-task-modal"
        className="glass-modal rounded-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] md:border md:border-white/80 animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 bg-white/40 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50/70 border border-indigo-150 text-indigo-700 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">Giao Chỉ Đạo Mới</h3>
              <p className="text-[11px] text-slate-500 font-normal">Tạo nhiệm vụ công tác, chỉ định chuyên môn</p>
            </div>
          </div>
          <button 
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-white/80 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-200/40 bg-white/20 shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tiêu đề công việc <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              id="input-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hoàn tất biên soạn chuyên đề hè môn Ngữ Văn..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nội dung mô tả yêu cầu <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể tiến trình, kết quả đầu ra cần đạt được và các tài liệu đính kèm liên quan..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Dự án</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setProjectName(e.target.options[e.target.selectedIndex].text);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="GENERAL">Công việc thường</option>
                <option value="PROJECT_ACADEMIC">Dự án học vụ</option>
                <option value="PROJECT_OPERATIONS">Dự án vận hành</option>
                <option value="PROJECT_ADMISSIONS">Dự án tuyển sinh</option>
                <option value="PROJECT_DIGITAL">Dự án chuyển đổi số</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Công việc cha</label>
              <select
                value={parentTaskId}
                onChange={(e) => setParentTaskId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Không có</option>
                {parentTaskOptions.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Workspace Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phòng ban / Tổ <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-task-workspace"
                value={workspaceId}
                onChange={(e) => handleWorkspaceChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {eligibleWorkspaces.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nhân sự phân công <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-task-assignee"
                value={assignedId}
                onChange={(e) => setAssignedId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {eligibleAssignees.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Top 3 MI Recommendations Box */}
          {recommendedTeachers.length > 0 && (
            <div className="text-[11px] bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/15">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                ✨ Trợ lý Đa Trí Tuệ (MI) gợi ý nhân sự phù hợp nhất:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {recommendedTeachers.map(({ user, score }) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setAssignedId(user.id)}
                    className={`text-left p-2 rounded-lg border text-[10px] transition-all cursor-pointer flex flex-col justify-between ${
                      assignedId === user.id
                        ? 'bg-emerald-100/90 border-emerald-400 font-bold text-emerald-900 shadow-3xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-650'
                    }`}
                  >
                    <span className="truncate font-semibold block">{user.name.split(' ').pop()}</span>
                    <span className="text-[9px] text-slate-450 truncate block mt-0.5">{user.title.replace('Giáo viên', 'GV').replace('Cán bộ', 'CB')}</span>
                    <span className="font-mono font-bold text-emerald-700 text-[10px] tracking-tight mt-1.5 bg-emerald-50 px-1 py-0.5 rounded leading-none text-center self-stretch">
                      {score}% khớp
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OKR / KPI linkage field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              Liên kết Mục tiêu / KPI phòng ban (OKR)
            </label>
            <select
              value={linkedOkrId}
              onChange={(e) => setLinkedOkrId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Không liên kết mục tiêu cụ thể --</option>
              {eligibleOkrs.map(o => (
                <option key={o.id} value={o.id}>
                  🎯 [{o.unit}] {o.objective} ({o.kpi})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mức độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="CAO">⚠️ Cao</option>
                <option value="TRUNG_BINH">⏰ Trung bình</option>
                <option value="THAP">☕ Thấp</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hạn chót
              </label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Tag Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phân loại thẻ
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {tagsList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Predictive Multi-Intelligence tag box */}
          <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-150/60">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block font-mono flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-indigo-600 shrink-0" />
              Chỉ số rèn luyện Đa Trí Tuệ (MIS) rà soát tự động:
            </span>
            {predictedIntelligences.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {predictedIntelligences.map((u, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-3xs transition-all ${u.bg}`}
                    title={u.description}
                  >
                    <span>{u.icon}</span>
                    <span>{u.name}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">
                Chưa phát hiện từ khóa rèn luyện phù hợp. Hãy nhập tiêu đề hoặc nội dung giáo án để tự động phân lớp.
              </p>
            )}
            <p className="text-[9px] text-slate-450 leading-normal mt-2.5">
              💡 <span className="font-semibold text-slate-500">Mẹo từ MIS Hà Nội:</span> Mô tả chi tiết hoạt động học vụ (ví dụ: thiết kế vẽ tranh, tranh biện tiếng anh, học cụ dã ngoại, sinh thái vườn cỏ) để tự động định lượng mật độ 8 loại thông minh cần rèn luyện.
            </p>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm hover:shadow-indigo-100 transition-all flex items-center gap-1.5"
          >
            Giao công việc
          </button>
        </div>
      </div>
    </div>
  );
}
