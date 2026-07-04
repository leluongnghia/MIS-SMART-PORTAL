'use client';

import React, { useState, useCallback } from 'react';
import {
  X, Calendar, Clock, Users, Video, MapPin, FileText,
  AlertCircle, CheckCircle2, Save, Send, ChevronDown,
  Plus, Trash2, Upload, Link, Building2, UserCircle,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  Meeting, MeetingType, MeetingStatus, MeetingParticipant,
  MEETING_ROOMS,
} from '@/src/mockData/meetings';

// ─── Types ────────────────────────────────────────────────────
export type MeetingMode = 'Trực tiếp' | 'Online' | 'Kết hợp';

export interface CreateMeetingForm {
  title: string;
  description: string;
  meetingType: MeetingType | '';
  meetingMode: MeetingMode;
  date: string;
  startTime: string;
  endTime: string;
  hostName: string;
  secretaryName: string;
  departmentName: string;
  roomId: string;
  onlineUrl: string;
  notes: string;
  participants: { name: string; role: string; department: string }[];
  agenda: string[];
}

const EMPTY_FORM: CreateMeetingForm = {
  title: '',
  description: '',
  meetingType: '',
  meetingMode: 'Trực tiếp',
  date: '',
  startTime: '',
  endTime: '',
  hostName: '',
  secretaryName: '',
  departmentName: '',
  roomId: '',
  onlineUrl: '',
  notes: '',
  participants: [],
  agenda: [''],
};

const MEETING_TYPES: MeetingType[] = [
  'Họp cá nhân', 'Họp phòng ban', 'Họp toàn trường',
  'Họp BGH', 'Họp chuyên môn',
];

const DEPARTMENTS = [
  'Ban Giám Hiệu', 'Tổ Tiểu học', 'Tổ THCS', 'Tổ THPT',
  'P. Tuyển sinh', 'P. Hành chính', 'P. Kế toán',
  'P. Marketing', 'CSVC & An ninh', 'Toàn trường',
];

// ─── Validation ──────────────────────────────────────────────
interface ValidationErrors {
  title?: string;
  meetingType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  hostName?: string;
  onlineUrl?: string;
  roomId?: string;
}

function validate(form: CreateMeetingForm, isDraft = false): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.title.trim()) errors.title = 'Tiêu đề không được bỏ trống';
  if (!isDraft) {
    if (!form.meetingType) errors.meetingType = 'Vui lòng chọn loại cuộc họp';
    if (!form.date) errors.date = 'Vui lòng chọn ngày họp';
    else {
      const today = new Date().toISOString().split('T')[0];
      if (form.date < today) errors.date = 'Ngày họp không được nhỏ hơn ngày hiện tại';
    }
    if (!form.startTime) errors.startTime = 'Vui lòng chọn giờ bắt đầu';
    if (!form.endTime) errors.endTime = 'Vui lòng chọn giờ kết thúc';
    else if (form.startTime && form.endTime <= form.startTime)
      errors.endTime = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
    if (!form.hostName.trim()) errors.hostName = 'Người chủ trì không được bỏ trống';
    if ((form.meetingMode === 'Online' || form.meetingMode === 'Kết hợp') && !form.onlineUrl.trim())
      errors.onlineUrl = 'Vui lòng nhập link họp online';
    if (form.meetingMode === 'Trực tiếp' && !form.roomId)
      errors.roomId = 'Vui lòng chọn phòng họp';
  }
  return errors;
}

// ─── Field wrapper ────────────────────────────────────────────
function FieldGroup({ label, required, error, children, hint }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
      <span className="text-blue-600">{icon}</span>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    </div>
  );
}

// ─── Main Form Component ──────────────────────────────────────
interface CreateMeetingFormProps {
  onClose: () => void;
  onCreated: (meeting: Partial<Meeting>, isDraft: boolean) => void;
}

export default function CreateMeetingForm({ onClose, onCreated }: CreateMeetingFormProps) {
  const [form, setForm] = useState<CreateMeetingForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState<'draft' | 'send' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', role: '', department: '' });

  const set = useCallback(<K extends keyof CreateMeetingForm>(key: K, value: CreateMeetingForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }, [errors]);

  const handleDraft = () => {
    const errs = validate(form, true);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting('draft');
    setTimeout(() => {
      const room = MEETING_ROOMS.find(r => r.id === form.roomId);
      const meeting: Partial<Meeting> = {
        id: `M${Date.now()}`,
        title: form.title,
        description: form.description,
        meetingType: (form.meetingType as MeetingType) || 'Họp cá nhân',
        startTime: form.date && form.startTime ? `${form.date}T${form.startTime}:00` : new Date().toISOString(),
        endTime: form.date && form.endTime ? `${form.date}T${form.endTime}:00` : new Date().toISOString(),
        roomId: form.roomId || null,
        roomName: room?.name ?? null,
        isOnline: form.meetingMode === 'Online' || form.meetingMode === 'Kết hợp',
        onlineUrl: form.onlineUrl || null,
        hostName: form.hostName || 'Chưa xác định',
        hostAvatar: form.hostName.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase(),
        departmentName: form.departmentName,
        participants: form.participants.map((p, i) => ({
          id: `p${i}`, name: p.name, role: p.role, department: p.department,
          response: 'Chưa phản hồi' as const,
          avatarInitials: p.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase(),
        })),
        status: 'Chờ duyệt phòng' as MeetingStatus,
        myResponseStatus: 'Tham dự' as const,
        attachments: [],
        minutesStatus: 'Chưa có' as const,
        agenda: form.agenda.filter(a => a.trim()),
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onCreated(meeting, true);
      setSubmitting(null);
    }, 600);
  };

  const handleSend = () => {
    const errs = validate(form, false);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setShowConfirm(true);
  };

  const confirmSend = () => {
    setSubmitting('send');
    setShowConfirm(false);
    setTimeout(() => {
      const room = MEETING_ROOMS.find(r => r.id === form.roomId);
      const meeting: Partial<Meeting> = {
        id: `M${Date.now()}`,
        title: form.title,
        description: form.description,
        meetingType: form.meetingType as MeetingType,
        startTime: `${form.date}T${form.startTime}:00`,
        endTime: `${form.date}T${form.endTime}:00`,
        roomId: form.roomId || null,
        roomName: room?.name ?? null,
        isOnline: form.meetingMode === 'Online' || form.meetingMode === 'Kết hợp',
        onlineUrl: form.onlineUrl || null,
        hostName: form.hostName,
        hostAvatar: form.hostName.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase(),
        departmentName: form.departmentName,
        participants: form.participants.map((p, i) => ({
          id: `p${i}`, name: p.name, role: p.role, department: p.department,
          response: 'Chưa phản hồi' as const,
          avatarInitials: p.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase(),
        })),
        status: 'Sắp diễn ra' as MeetingStatus,
        myResponseStatus: 'Tham dự' as const,
        attachments: [],
        minutesStatus: 'Chưa có' as const,
        agenda: form.agenda.filter(a => a.trim()),
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onCreated(meeting, false);
      setSubmitting(null);
    }, 800);
  };

  const addParticipant = () => {
    if (!newParticipant.name.trim()) return;
    set('participants', [...form.participants, { ...newParticipant }]);
    setNewParticipant({ name: '', role: '', department: '' });
  };

  const removeParticipant = (idx: number) => {
    set('participants', form.participants.filter((_, i) => i !== idx));
  };

  const needsOnline = form.meetingMode === 'Online' || form.meetingMode === 'Kết hợp';
  const needsRoom = form.meetingMode === 'Trực tiếp' || form.meetingMode === 'Kết hợp';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Xác nhận gửi thư mời</div>
                <div className="text-xs text-slate-500">Thông báo sẽ được gửi đến {form.participants.length} người tham gia</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 space-y-1">
              <div className="font-semibold">{form.title}</div>
              <div className="text-xs text-slate-500">
                {form.date} · {form.startTime}–{form.endTime} · {form.meetingMode}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>Quay lại</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={confirmSend}>
                <Send className="h-3.5 w-3.5 mr-1.5" />Gửi thư mời
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)]">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Calendar className="h-4.5 w-4.5 text-white h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Tạo lịch họp</div>
                <div className="text-xs text-slate-500">Điền đầy đủ thông tin cuộc họp mới</div>
              </div>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Section 1: Thông tin cơ bản */}
            <div className="space-y-4">
              <SectionHeader icon={<FileText className="h-4 w-4" />} title="Thông tin cơ bản" />

              <FieldGroup label="Tiêu đề cuộc họp" required error={errors.title}>
                <Input
                  placeholder="VD: Họp giao ban tuần – Tuần 28..."
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  className={cn(errors.title && 'border-rose-400 focus:border-rose-400')}
                />
              </FieldGroup>

              <FieldGroup label="Nội dung / Mô tả">
                <textarea
                  rows={3}
                  placeholder="Mô tả mục đích, nội dung chính của cuộc họp..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none resize-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950"
                />
              </FieldGroup>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Loại cuộc họp" required error={errors.meetingType}>
                  <Select value={form.meetingType} onChange={e => set('meetingType', e.target.value as MeetingType)}
                    className={cn(errors.meetingType && 'border-rose-400')}>
                    <option value="">-- Chọn loại họp --</option>
                    {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="Họp phụ huynh">Họp phụ huynh</option>
                    <option value="Họp vận hành">Họp vận hành</option>
                  </Select>
                </FieldGroup>

                <FieldGroup label="Phòng ban / Tổ liên quan">
                  <Select value={form.departmentName} onChange={e => set('departmentName', e.target.value)}>
                    <option value="">-- Chọn phòng ban --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </FieldGroup>
              </div>
            </div>

            {/* Section 2: Thời gian */}
            <div className="space-y-4">
              <SectionHeader icon={<Clock className="h-4 w-4" />} title="Thời gian" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FieldGroup label="Ngày họp" required error={errors.date}>
                  <Input type="date" value={form.date}
                    onChange={e => set('date', e.target.value)}
                    className={cn(errors.date && 'border-rose-400')} />
                </FieldGroup>
                <FieldGroup label="Giờ bắt đầu" required error={errors.startTime}>
                  <Input type="time" value={form.startTime}
                    onChange={e => set('startTime', e.target.value)}
                    className={cn(errors.startTime && 'border-rose-400')} />
                </FieldGroup>
                <FieldGroup label="Giờ kết thúc" required error={errors.endTime}>
                  <Input type="time" value={form.endTime}
                    onChange={e => set('endTime', e.target.value)}
                    className={cn(errors.endTime && 'border-rose-400')} />
                </FieldGroup>
              </div>
            </div>

            {/* Section 3: Nhân sự */}
            <div className="space-y-4">
              <SectionHeader icon={<UserCircle className="h-4 w-4" />} title="Nhân sự chủ trì" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Người chủ trì" required error={errors.hostName}>
                  <Input placeholder="VD: Nguyễn Văn Minh"
                    value={form.hostName} onChange={e => set('hostName', e.target.value)}
                    className={cn(errors.hostName && 'border-rose-400')} />
                </FieldGroup>
                <FieldGroup label="Thư ký cuộc họp">
                  <Input placeholder="VD: Trần Thị Lan"
                    value={form.secretaryName} onChange={e => set('secretaryName', e.target.value)} />
                </FieldGroup>
              </div>
            </div>

            {/* Section 4: Hình thức & Địa điểm */}
            <div className="space-y-4">
              <SectionHeader icon={<MapPin className="h-4 w-4" />} title="Hình thức & Địa điểm" />

              <FieldGroup label="Hình thức họp" required>
                <div className="flex flex-wrap gap-2">
                  {(['Trực tiếp', 'Online', 'Kết hợp'] as MeetingMode[]).map(mode => (
                    <button key={mode} type="button"
                      onClick={() => set('meetingMode', mode)}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        form.meetingMode === mode
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                      )}>
                      {mode === 'Trực tiếp' ? '🏢' : mode === 'Online' ? '💻' : '🔀'} {mode}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              {needsRoom && (
                <FieldGroup label="Phòng họp" required={form.meetingMode === 'Trực tiếp'} error={errors.roomId}
                  hint="Để trống nếu chưa xác định phòng (trạng thái: Chờ duyệt phòng)">
                  <Select value={form.roomId} onChange={e => set('roomId', e.target.value)}
                    className={cn(errors.roomId && 'border-rose-400')}>
                    <option value="">-- Chưa xác định phòng --</option>
                    {MEETING_ROOMS.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (tối đa {r.capacity} người)</option>
                    ))}
                  </Select>
                </FieldGroup>
              )}

              {needsOnline && (
                <FieldGroup label="Link họp online" required error={errors.onlineUrl}>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="https://zoom.us/j/... hoặc Google Meet..."
                      value={form.onlineUrl} onChange={e => set('onlineUrl', e.target.value)}
                      className={cn('pl-9', errors.onlineUrl && 'border-rose-400')} />
                  </div>
                </FieldGroup>
              )}
            </div>

            {/* Section 5: Chương trình họp */}
            <div className="space-y-4">
              <SectionHeader icon={<FileText className="h-4 w-4" />} title="Chương trình họp (Agenda)" />
              <div className="space-y-2">
                {form.agenda.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <Input
                      placeholder={`Nội dung ${i + 1}...`}
                      value={item}
                      onChange={e => {
                        const next = [...form.agenda];
                        next[i] = e.target.value;
                        set('agenda', next);
                      }}
                      className="flex-1"
                    />
                    <button type="button"
                      onClick={() => set('agenda', form.agenda.filter((_, j) => j !== i))}
                      className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button"
                  onClick={() => set('agenda', [...form.agenda, ''])}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <Plus className="h-3.5 w-3.5" />Thêm nội dung
                </button>
              </div>
            </div>

            {/* Section 6: Người tham gia */}
            <div className="space-y-4">
              <SectionHeader icon={<Users className="h-4 w-4" />} title="Người tham gia" />

              {/* Existing participants */}
              {form.participants.length > 0 && (
                <div className="space-y-2">
                  {form.participants.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                      <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {p.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.role}{p.department ? ` · ${p.department}` : ''}</div>
                      </div>
                      <button type="button" onClick={() => removeParticipant(i)}
                        className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add participant */}
              <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-3 space-y-2">
                <div className="text-xs font-semibold text-slate-600">Thêm người tham gia</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Họ tên" value={newParticipant.name}
                    onChange={e => setNewParticipant(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Chức danh" value={newParticipant.role}
                    onChange={e => setNewParticipant(p => ({ ...p, role: e.target.value }))} />
                  <Input placeholder="Phòng ban" value={newParticipant.department}
                    onChange={e => setNewParticipant(p => ({ ...p, department: e.target.value }))} />
                </div>
                <Button type="button" size="sm" variant="outline"
                  onClick={addParticipant}
                  disabled={!newParticipant.name.trim()}
                  className="text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />Thêm
                </Button>
              </div>
            </div>

            {/* Section 7: Ghi chú */}
            <div className="space-y-4">
              <SectionHeader icon={<FileText className="h-4 w-4" />} title="Ghi chú & Tài liệu" />
              <FieldGroup label="Ghi chú thêm">
                <textarea rows={2}
                  placeholder="Ghi chú đặc biệt, yêu cầu chuẩn bị..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none resize-none focus:border-slate-400"
                />
              </FieldGroup>
              <div className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors text-xs">
                <Upload className="h-4 w-4" />
                <span>Đính kèm tài liệu (PDF, Word, Excel...)</span>
                <span className="text-slate-400">— chức năng sẽ được bổ sung</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {Object.keys(errors).length > 0 && (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Vui lòng kiểm tra lại thông tin
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-600">
                  Hủy
                </Button>
                <Button variant="outline" size="sm"
                  onClick={handleDraft}
                  disabled={submitting !== null}
                  className="text-slate-700">
                  {submitting === 'draft' ? (
                    <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Đang lưu...</span>
                  ) : (
                    <><Save className="h-3.5 w-3.5 mr-1.5" />Lưu nháp</>
                  )}
                </Button>
                <Button size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSend}
                  disabled={submitting !== null}>
                  {submitting === 'send' ? (
                    <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang gửi...</span>
                  ) : (
                    <><Send className="h-3.5 w-3.5 mr-1.5" />Lưu &amp; Gửi thư mời</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
