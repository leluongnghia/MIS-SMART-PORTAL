'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  FileText, Plus, Check, X, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, Send, Download,
  Printer, Edit3, Eye, Trash2, Calendar, MapPin,
  Users, UserCheck, ClipboardCheck, RefreshCw, Star,
  ArrowRight, Paperclip, Target, TrendingUp,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MEETING_MINUTES, MeetingMinutes, PostMeetingTask,
  MinutesStatus, TaskPriority, TaskStatus,
  MINUTES_STATUS_CONFIG, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG,
} from '@/src/mockData/meetingMinutes';
import { SCHOOL_STAFF } from '@/src/mockData/meetingParticipants';

// ─── Helpers ──────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
function fmtDateTime(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function isOverdue(dueDate: string, status: TaskStatus) {
  if (status === 'Hoàn thành') return false;
  return dueDate < new Date().toISOString().split('T')[0];
}

const TASK_PRIORITIES: TaskPriority[] = ['Thấp', 'Bình thường', 'Cao', 'Khẩn cấp'];
const TASK_STATUSES: TaskStatus[] = ['Chưa thực hiện', 'Đang thực hiện', 'Chờ xác nhận', 'Hoàn thành', 'Quá hạn'];

// ─── StatusBadge ──────────────────────────────────────────────
function MinutesBadge({ status }: { status: MinutesStatus }) {
  const cfg = MINUTES_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />{status}
    </span>
  );
}
function TaskBadge({ status }: { status: TaskStatus }) {
  const cfg = TASK_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />{status}
    </span>
  );
}
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = TASK_PRIORITY_CONFIG[priority];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.color)}>
      {priority}
    </span>
  );
}

// ─── Add Task Modal ───────────────────────────────────────────
interface AddTaskModalProps {
  minutesId: string;
  meetingId: string;
  onAdd: (task: PostMeetingTask) => void;
  onClose: () => void;
}
function AddTaskModal({ minutesId, meetingId, onAdd, onClose }: AddTaskModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignee: '',
    collaborators: '',
    department: '',
    dueDate: '',
    priority: 'Bình thường' as TaskPriority,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề';
    if (!form.assignee.trim()) e.assignee = 'Vui lòng chọn người phụ trách';
    if (!form.dueDate) e.dueDate = 'Vui lòng chọn hạn hoàn thành';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const task: PostMeetingTask = {
      id: `T${Date.now()}`,
      minutesId, meetingId,
      title: form.title,
      description: form.description,
      assignee: form.assignee,
      assigneeId: SCHOOL_STAFF.find(s => s.fullName === form.assignee)?.id ?? '',
      collaborators: form.collaborators.split(',').map(s => s.trim()).filter(Boolean),
      department: form.department,
      dueDate: form.dueDate,
      priority: form.priority,
      status: 'Chưa thực hiện',
      notes: form.notes,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAdd(task);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Tạo nhiệm vụ sau họp</div>
                <div className="text-xs text-slate-500">Giao việc từ kết luận cuộc họp</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tiêu đề <span className="text-rose-500">*</span></label>
              <Input placeholder="VD: Lập kế hoạch chiến dịch tuyển sinh..."
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={cn(errors.title && 'border-rose-400')} />
              {errors.title && <p className="text-[11px] text-rose-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nội dung chi tiết</label>
              <textarea rows={3} placeholder="Mô tả chi tiết công việc cần thực hiện..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-slate-400" />
            </div>

            {/* Assignee */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Người phụ trách <span className="text-rose-500">*</span></label>
                <Select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                  className={cn(errors.assignee && 'border-rose-400')}>
                  <option value="">-- Chọn --</option>
                  {SCHOOL_STAFF.map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
                </Select>
                {errors.assignee && <p className="text-[11px] text-rose-600">{errors.assignee}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phòng ban</label>
                <Input placeholder="VD: P. Tuyển sinh" value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
              </div>
            </div>

            {/* Collaborators */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Người phối hợp</label>
              <Input placeholder="VD: Lý Thị Hạnh, Lê Văn Bình (phân cách bằng dấu phẩy)"
                value={form.collaborators} onChange={e => setForm(f => ({ ...f, collaborators: e.target.value }))} />
            </div>

            {/* Due date & priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Hạn hoàn thành <span className="text-rose-500">*</span></label>
                <Input type="date" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className={cn(errors.dueDate && 'border-rose-400')} />
                {errors.dueDate && <p className="text-[11px] text-rose-600">{errors.dueDate}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Mức độ ưu tiên</label>
                <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}>
                  {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Ghi chú</label>
              <Input placeholder="Ghi chú thêm..." value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Tạo nhiệm vụ
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Task Row ─────────────────────────────────────────────────
function TaskRow({ task, onStatusChange, onDelete }: {
  task: PostMeetingTask;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);
  const actualStatus: TaskStatus = overdue && task.status !== 'Hoàn thành' ? 'Quá hạn' : task.status;

  return (
    <div className={cn('bg-white rounded-xl border shadow-sm transition-all',
      overdue && task.status !== 'Hoàn thành' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200')}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Priority stripe */}
          <div className={cn('w-1 self-stretch rounded-full shrink-0', TASK_PRIORITY_CONFIG[task.priority].dot)} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <TaskBadge status={actualStatus} />
              <PriorityBadge priority={task.priority} />
              {overdue && task.status !== 'Hoàn thành' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
                  <AlertTriangle className="h-3 w-3" />Quá hạn
                </span>
              )}
            </div>
            <div className="font-semibold text-slate-900 text-sm">{task.title}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />{task.assignee}</span>
              {task.department && <span>{task.department}</span>}
              <span className="flex items-center gap-1">
                <Clock className={cn('h-3 w-3', overdue && task.status !== 'Hoàn thành' ? 'text-rose-500' : '')} />
                <span className={cn(overdue && task.status !== 'Hoàn thành' ? 'text-rose-600 font-semibold' : '')}>
                  {fmtDate(task.dueDate)}
                </span>
              </span>
            </div>
            {task.collaborators.length > 0 && (
              <div className="text-xs text-slate-400 mt-0.5">Phối hợp: {task.collaborators.join(', ')}</div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Select value={task.status}
              onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
              className="h-7 text-[10px] w-[130px]">
              {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <button onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 pl-3">
            {task.description && <p>{task.description}</p>}
            {task.notes && <p className="italic text-slate-500">📝 {task.notes}</p>}
            <p className="text-slate-400">Tạo lúc: {fmtDateTime(task.createdAt)}</p>
            {task.completedAt && <p className="text-emerald-700">✅ Hoàn thành: {fmtDateTime(task.completedAt)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Minutes Editor ───────────────────────────────────────────
interface MinutesEditorProps {
  minutes: MeetingMinutes;
  onSave: (m: MeetingMinutes) => void;
  onClose: () => void;
}
function MinutesEditor({ minutes, onSave, onClose }: MinutesEditorProps) {
  const [form, setForm] = useState({
    secretary: minutes.secretary || '',
    attendees: minutes.attendees.join('\n'),
    absentees: minutes.absentees.join('\n'),
    meetingSummary: minutes.meetingSummary || '',
    discussionNotes: minutes.discussionNotes || '',
    conclusion: minutes.conclusion || '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'>('idle');

  const handleSave = (status: MinutesStatus) => {
    setSaveStatus('saving');
    setTimeout(() => {
      onSave({
        ...minutes,
        secretary: form.secretary,
        attendees: form.attendees.split('\n').map(s => s.trim()).filter(Boolean),
        absentees: form.absentees.split('\n').map(s => s.trim()).filter(Boolean),
        meetingSummary: form.meetingSummary,
        discussionNotes: form.discussionNotes,
        conclusion: form.conclusion,
        status,
        createdBy: minutes.createdBy || 'Lê Văn Bình',
        createdAt: minutes.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSaveStatus('saved');
    }, 500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  {minutes.status === 'Chưa tạo' ? 'Tạo biên bản họp' : 'Chỉnh sửa biên bản'}
                </div>
                <div className="text-xs text-slate-500">{minutes.meetingTitle}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Meeting info (read-only) */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-semibold">Ngày họp:</span> {fmtDate(minutes.meetingDate)}</div>
                <div><span className="font-semibold">Thời gian:</span> {minutes.startTime} – {minutes.endTime}</div>
                <div><span className="font-semibold">Địa điểm:</span> {minutes.location}</div>
                <div><span className="font-semibold">Chủ trì:</span> {minutes.host}</div>
              </div>
            </div>

            {/* Thư ký */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Thư ký</label>
              <Input value={form.secretary} onChange={e => setForm(f => ({ ...f, secretary: e.target.value }))} />
            </div>

            {/* Attendees / Absentees */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Danh sách có mặt (mỗi dòng 1 người)</label>
                <textarea rows={4} value={form.attendees}
                  onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none focus:border-slate-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Danh sách vắng mặt</label>
                <textarea rows={4} value={form.absentees}
                  onChange={e => setForm(f => ({ ...f, absentees: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none focus:border-slate-400" />
              </div>
            </div>

            {/* Nội dung chính */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nội dung chính cuộc họp</label>
              <textarea rows={5} placeholder="Tóm tắt các vấn đề được trình bày trong cuộc họp..."
                value={form.meetingSummary}
                onChange={e => setForm(f => ({ ...f, meetingSummary: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none focus:border-slate-400" />
            </div>

            {/* Ý kiến thảo luận */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Ý kiến thảo luận</label>
              <textarea rows={4} placeholder="Ghi lại các ý kiến đóng góp, thảo luận..."
                value={form.discussionNotes}
                onChange={e => setForm(f => ({ ...f, discussionNotes: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none focus:border-slate-400" />
            </div>

            {/* Kết luận */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500" />Kết luận cuộc họp
              </label>
              <textarea rows={5} placeholder="Ghi lại kết luận chính thức và các quyết định đã được thông qua..."
                value={form.conclusion}
                onChange={e => setForm(f => ({ ...f, conclusion: e.target.value }))}
                className="w-full rounded-lg border border-emerald-300 bg-emerald-50/30 px-3 py-2 text-sm outline-none resize-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0 flex flex-wrap justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSave('Đang soạn')}
                disabled={saveStatus === 'saving'}>
                {saveStatus === 'saving' ? <span className="flex items-center gap-1.5"><span className="h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Lưu...</span>
                  : <><Edit3 className="h-3.5 w-3.5 mr-1" />Lưu nháp</>}
              </Button>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => handleSave('Chờ duyệt')}>
                <Send className="h-3.5 w-3.5 mr-1.5" />Gửi chờ duyệt
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleSave('Đã duyệt')}>
                <Check className="h-3.5 w-3.5 mr-1.5" />Duyệt ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Minutes Detail View ──────────────────────────────────────
function MinutesDetail({ minutes, onEdit, onUpdate }: {
  minutes: MeetingMinutes;
  onEdit: () => void;
  onUpdate: (m: MeetingMinutes) => void;
}) {
  const [tasks, setTasks] = useState<PostMeetingTask[]>(minutes.tasks);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const taskKpi = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'Chưa thực hiện').length,
    doing: tasks.filter(t => t.status === 'Đang thực hiện').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
    done: tasks.filter(t => t.status === 'Hoàn thành').length,
  }), [tasks]);

  const filteredTasks = useMemo(() =>
    taskFilter === 'all' ? tasks : tasks.filter(t => t.status === taskFilter),
    [tasks, taskFilter]
  );

  const warnings: string[] = [];
  if (minutes.status === 'Chờ duyệt') warnings.push('Biên bản đang chờ duyệt');
  if (taskKpi.overdue > 0) warnings.push(`${taskKpi.overdue} nhiệm vụ sau họp bị quá hạn`);

  const handleTaskStatus = (id: string, status: TaskStatus) => {
    const updated = tasks.map(t => t.id === id
      ? { ...t, status, completedAt: status === 'Hoàn thành' ? new Date().toISOString() : null, updatedAt: new Date().toISOString() }
      : t);
    setTasks(updated);
    showToast('Đã cập nhật trạng thái nhiệm vụ');
  };

  const handleApprove = () => {
    onUpdate({ ...minutes, status: 'Đã duyệt', approvedBy: 'Nguyễn Văn Minh', approvedAt: new Date().toISOString() });
    showToast('Đã duyệt biên bản');
  };

  const handleSendToParticipants = () => {
    onUpdate({ ...minutes, status: 'Đã gửi người tham gia' });
    showToast(`Đã gửi biên bản đến ${minutes.attendees.length} người tham dự`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />{toast}
        </div>
      )}
      {showAddTask && (
        <AddTaskModal
          minutesId={minutes.id}
          meetingId={minutes.meetingId}
          onAdd={task => { setTasks(prev => [...prev, task]); setShowAddTask(false); showToast('Đã tạo nhiệm vụ mới'); }}
          onClose={() => setShowAddTask(false)} />
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{w}
            </div>
          ))}
        </div>
      )}

      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MinutesBadge status={minutes.status} />
          {minutes.approvedBy && (
            <span className="text-xs text-emerald-700">Duyệt bởi: {minutes.approvedBy} · {fmtDateTime(minutes.approvedAt ?? '')}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onEdit}>
            <Edit3 className="h-3.5 w-3.5 mr-1" />Chỉnh sửa
          </Button>
          {minutes.status === 'Chờ duyệt' && (
            <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove}>
              <Check className="h-3.5 w-3.5 mr-1" />Duyệt
            </Button>
          )}
          {minutes.status === 'Đã duyệt' && (
            <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSendToParticipants}>
              <Send className="h-3.5 w-3.5 mr-1" />Gửi người tham gia
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1" />In
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />Xuất PDF
          </Button>
        </div>
      </div>

      {/* Minutes content */}
      <div ref={printRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 text-white">
          <div className="text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Biên bản họp</div>
            <h2 className="text-lg font-black">{minutes.meetingTitle}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs text-slate-300">
            <div><span className="font-semibold text-white block">Ngày</span>{fmtDate(minutes.meetingDate)}</div>
            <div><span className="font-semibold text-white block">Thời gian</span>{minutes.startTime} – {minutes.endTime}</div>
            <div><span className="font-semibold text-white block">Địa điểm</span>{minutes.location}</div>
            <div><span className="font-semibold text-white block">Chủ trì</span>{minutes.host}</div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Participants */}
          {(minutes.attendees.length > 0 || minutes.absentees.length > 0) && (
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />Có mặt ({minutes.attendees.length})
                </div>
                <div className="space-y-1">
                  {minutes.attendees.map(a => (
                    <div key={a} className="text-xs text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{a}
                    </div>
                  ))}
                </div>
              </div>
              {minutes.absentees.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1">
                    <X className="h-3.5 w-3.5" />Vắng mặt ({minutes.absentees.length})
                  </div>
                  <div className="space-y-1">
                    {minutes.absentees.map(a => (
                      <div key={a} className="text-xs text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nội dung chính */}
          {minutes.meetingSummary && (
            <div className="px-6 py-4">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-500" />Nội dung chính
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{minutes.meetingSummary}</div>
            </div>
          )}

          {/* Ý kiến thảo luận */}
          {minutes.discussionNotes && (
            <div className="px-6 py-4">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-500" />Ý kiến thảo luận
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{minutes.discussionNotes}</div>
            </div>
          )}

          {/* Kết luận */}
          {minutes.conclusion && (
            <div className="px-6 py-4 bg-emerald-50/50">
              <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />Kết luận cuộc họp
              </div>
              <div className="text-sm text-emerald-900 whitespace-pre-line leading-relaxed font-medium">{minutes.conclusion}</div>
            </div>
          )}

          {/* Attachments */}
          {minutes.attachments.length > 0 && (
            <div className="px-6 py-4">
              <div className="text-xs font-bold text-slate-700 mb-2">Tài liệu đính kèm</div>
              <div className="flex flex-wrap gap-2">
                {minutes.attachments.map(a => (
                  <div key={a.name} className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
                    <Paperclip className="h-3 w-3 text-slate-400" />
                    <span>{a.name}</span>
                    <span className="text-slate-400">{a.size}</span>
                    <button className="text-blue-600 hover:underline ml-1"><Download className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer signature */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
            <div>
              <div className="font-semibold mb-6">Thư ký</div>
              <div className="font-bold text-slate-900">{minutes.secretary || '___________'}</div>
            </div>
            <div>
              <div className="font-semibold mb-6">Chủ trì</div>
              <div className="font-bold text-slate-900">{minutes.host}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Post-meeting tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Nhiệm vụ sau họp</h3>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
            onClick={() => setShowAddTask(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Thêm nhiệm vụ
          </Button>
        </div>

        {/* Task KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'Tổng', value: taskKpi.total, color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Chưa làm', value: taskKpi.todo, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Đang làm', value: taskKpi.doing, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Quá hạn', value: taskKpi.overdue, color: 'text-rose-700', bg: 'bg-rose-50' },
            { label: 'Hoàn thành', value: taskKpi.done, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ].map(k => (
            <div key={k.label} className={cn('rounded-xl p-3 text-center border border-slate-200', k.bg)}>
              <div className={cn('text-xl font-black', k.color)}>{k.value}</div>
              <div className="text-[10px] text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Task filter */}
        <Select value={taskFilter} onChange={e => setTaskFilter(e.target.value)} className="h-8 text-xs w-[180px]">
          <option value="all">Tất cả trạng thái</option>
          {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>

        {/* Task list */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <div className="text-sm">Chưa có nhiệm vụ nào</div>
            </div>
          ) : filteredTasks.map(t => (
            <TaskRow key={t.id} task={t}
              onStatusChange={handleTaskStatus}
              onDelete={id => { setTasks(prev => prev.filter(t => t.id !== id)); showToast('Đã xóa nhiệm vụ'); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function MinutesManager() {
  const [minutesList, setMinutesList] = useState<MeetingMinutes[]>(MEETING_MINUTES);
  const [selected, setSelected] = useState<MeetingMinutes>(MEETING_MINUTES[0]);
  const [editing, setEditing] = useState(false);

  const updateMinutes = (updated: MeetingMinutes) => {
    setMinutesList(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelected(updated);
    setEditing(false);
  };

  const noMinutesCount = minutesList.filter(m => m.status === 'Chưa tạo').length;
  const overdueTaskCount = minutesList.flatMap(m => m.tasks).filter(t => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Biên bản họp & Giao việc</h2>
          <p className="text-sm text-slate-500">Lập biên bản, kết luận họp và theo dõi nhiệm vụ sau họp</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {noMinutesCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />{noMinutesCount} cuộc họp chưa có biên bản
            </div>
          )}
          {overdueTaskCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 text-rose-700">
              <Clock className="h-3.5 w-3.5" />{overdueTaskCount} nhiệm vụ quá hạn
            </div>
          )}
        </div>
      </div>

      {/* Meeting selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {minutesList.map(m => (
          <button key={m.id} onClick={() => { setSelected(m); setEditing(false); }}
            className={cn('flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
              selected.id === m.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-blue-200')}>
            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-lg">
              {MINUTES_STATUS_CONFIG[m.status].icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-900 truncate">{m.meetingTitle}</div>
              <div className="text-xs text-slate-500 mt-0.5">{fmtDate(m.meetingDate)} · {m.startTime}–{m.endTime}</div>
              <div className="flex items-center gap-2 mt-1">
                <MinutesBadge status={m.status} />
                {m.tasks.length > 0 && (
                  <span className="text-[10px] text-slate-500">{m.tasks.length} nhiệm vụ</span>
                )}
              </div>
            </div>
            {selected.id === m.id && <Check className="h-4 w-4 text-blue-600 shrink-0 mt-1" />}
          </button>
        ))}
      </div>

      {/* Content */}
      {editing ? (
        <MinutesEditor
          minutes={selected}
          onSave={updateMinutes}
          onClose={() => setEditing(false)} />
      ) : selected.status === 'Chưa tạo' ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-slate-700 font-semibold mb-1">Chưa có biên bản cho cuộc họp này</div>
          <div className="text-sm text-slate-400 mb-5">Tạo biên bản để lưu kết luận và giao việc sau họp</div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setEditing(true)}>
            <Plus className="h-4 w-4 mr-2" />Tạo biên bản họp
          </Button>
        </div>
      ) : (
        <MinutesDetail
          minutes={selected}
          onEdit={() => setEditing(true)}
          onUpdate={updateMinutes} />
      )}
    </div>
  );
}
