'use client';

import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Mail, Check, X, Clock, AlertTriangle,
  ChevronDown, ChevronRight, Send, RefreshCw, Search,
  UserCheck, Filter, Building2, Mic, Eye, FileText,
  CheckCircle2, XCircle, HelpCircle, Bell, Trash2,
  ClipboardCheck, Calendar, MapPin, Video,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MEETING_DETAILS, SCHOOL_STAFF, SCHOOL_DEPARTMENTS,
  MeetingDetail, MeetingParticipantDetail, SchoolStaff,
  MeetingRole, ParticipantResponse, AttendanceStatus,
  ROLE_CONFIG, RESPONSE_CONFIG, ATTENDANCE_CONFIG,
} from '@/src/mockData/meetingParticipants';

// ─── Helpers ──────────────────────────────────────────────────
function fmtTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function initials(name: string) {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

const MEETING_ROLES: MeetingRole[] = [
  'Chủ trì', 'Thư ký', 'Người tham dự', 'Khách mời', 'Người theo dõi', 'Người chuẩn bị nội dung',
];

// ─── Avatar ───────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-amber-500', 'bg-teal-500', 'bg-purple-500', 'bg-orange-500',
];
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const sz = size === 'sm' ? 'h-7 w-7 text-[10px]' : size === 'lg' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-xs';
  return (
    <div className={cn('rounded-full flex items-center justify-center text-white font-bold shrink-0', sz, AVATAR_COLORS[idx])}>
      {initials(name)}
    </div>
  );
}

// ─── Response Badge ───────────────────────────────────────────
function ResponseBadge({ resp }: { resp: ParticipantResponse }) {
  const cfg = RESPONSE_CONFIG[resp];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />{resp}
    </span>
  );
}

// ─── Attendance Badge ─────────────────────────────────────────
function AttendanceBadge({ status }: { status: AttendanceStatus | null }) {
  if (!status) return <span className="text-[10px] text-slate-400">Chưa điểm danh</span>;
  const cfg = ATTENDANCE_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />{status}
    </span>
  );
}

// ─── Add Participant Modal ────────────────────────────────────
interface AddParticipantModalProps {
  meeting: MeetingDetail;
  existingIds: string[];
  onAdd: (participants: Partial<MeetingParticipantDetail>[]) => void;
  onClose: () => void;
}
function AddParticipantModal({ meeting, existingIds, onAdd, onClose }: AddParticipantModalProps) {
  const [tab, setTab] = useState<'individual' | 'department' | 'all'>('individual');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [roles, setRoles] = useState<Record<string, MeetingRole>>({});

  const available = useMemo(() =>
    SCHOOL_STAFF.filter(s => !existingIds.includes(s.id)),
    [existingIds]
  );

  const filtered = useMemo(() => available.filter(s => {
    if (deptFilter !== 'all' && s.department !== deptFilter) return false;
    if (search && !s.fullName.toLowerCase().includes(search.toLowerCase()) && !s.department.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [available, deptFilter, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    if (!roles[id]) setRoles(r => ({ ...r, [id]: 'Người tham dự' }));
  };

  const selectDept = (dept: string) => {
    const deptStaff = available.filter(s => s.department === dept);
    setSelectedIds(prev => {
      const next = new Set(prev);
      deptStaff.forEach(s => next.add(s.id));
      return next;
    });
    deptStaff.forEach(s => {
      if (!roles[s.id]) setRoles(r => ({ ...r, [s.id]: 'Người tham dự' }));
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(available.map(s => s.id)));
    available.forEach(s => {
      if (!roles[s.id]) setRoles(r => ({ ...r, [s.id]: 'Người tham dự' }));
    });
  };

  const handleAdd = () => {
    const toAdd = SCHOOL_STAFF.filter(s => selectedIds.has(s.id)).map(s => ({
      id: `P${Date.now()}-${s.id}`,
      userId: s.id,
      fullName: s.fullName,
      position: s.position,
      department: s.department,
      email: s.email,
      phone: s.phone,
      role: roles[s.id] || 'Người tham dự',
      response: 'Chưa phản hồi' as ParticipantResponse,
      responseReason: null,
      responseAt: null,
      inviteSentAt: null,
      inviteResendCount: 0,
      attendance: null,
      attendanceNote: null,
      attendanceAt: null,
      attendanceBy: null,
      avatarInitials: initials(s.fullName),
    }));
    onAdd(toAdd);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Thêm người tham gia</div>
                <div className="text-xs text-slate-500">{meeting.title}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
          </div>

          {/* Tab row */}
          <div className="flex gap-1 mx-6 mt-4 bg-slate-100 rounded-lg p-1 shrink-0">
            {(['individual', 'department', 'all'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('flex-1 py-1.5 text-xs font-semibold rounded-md transition-all',
                  tab === t ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700')}>
                {t === 'individual' ? '👤 Cá nhân' : t === 'department' ? '🏢 Phòng ban' : '🌐 Toàn trường'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {tab === 'individual' && (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Tìm nhân sự..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
                  </div>
                  <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="h-9 w-[150px] text-sm">
                    <option value="all">Tất cả PB</option>
                    {SCHOOL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div className="text-xs text-slate-500">{filtered.length} nhân sự — đã chọn {selectedIds.size}</div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {filtered.map(s => {
                    const sel = selectedIds.has(s.id);
                    return (
                      <div key={s.id} className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                        sel ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-blue-200')}>
                        <input type="checkbox" checked={sel} onChange={() => toggleSelect(s.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer" />
                        <Avatar name={s.fullName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-slate-900">{s.fullName}</div>
                          <div className="text-xs text-slate-500">{s.position} · {s.department}</div>
                        </div>
                        {sel && (
                          <Select value={roles[s.id] || 'Người tham dự'}
                            onChange={e => setRoles(r => ({ ...r, [s.id]: e.target.value as MeetingRole }))}
                            className="h-7 text-[11px] w-[150px]">
                            {MEETING_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {tab === 'department' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCHOOL_DEPARTMENTS.map(dept => {
                  const count = available.filter(s => s.department === dept).length;
                  if (count === 0) return null;
                  return (
                    <button key={dept} onClick={() => selectDept(dept)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50 transition-all text-left">
                      <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{dept}</div>
                        <div className="text-xs text-slate-500">{count} người có thể thêm</div>
                      </div>
                      <Check className="h-4 w-4 text-blue-500 ml-auto" />
                    </button>
                  );
                })}
              </div>
            )}

            {tab === 'all' && (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1.5" />
                  Thêm toàn bộ {available.length} nhân sự còn lại vào cuộc họp này.
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={selectAll}>
                  <Users className="h-4 w-4 mr-2" />Chọn tất cả {available.length} nhân sự
                </Button>
                <div className="text-center text-xs text-slate-500">Đã chọn: {selectedIds.size} người</div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0 flex justify-between items-center">
            <span className="text-sm text-slate-600">Đã chọn <strong>{selectedIds.size}</strong> người</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={selectedIds.size === 0} onClick={handleAdd}>
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />Thêm & Gửi thư mời
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Response Modal (participant self-response) ───────────────
function ResponseModal({ participant, onSave, onClose }: {
  participant: MeetingParticipantDetail;
  onSave: (id: string, resp: ParticipantResponse, reason: string) => void;
  onClose: () => void;
}) {
  const [resp, setResp] = useState<ParticipantResponse>(participant.response === 'Chưa phản hồi' ? 'Tham dự' : participant.response);
  const [reason, setReason] = useState(participant.responseReason ?? '');
  const needsReason = resp === 'Vắng mặt' || resp === 'Xin phép vắng';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={participant.fullName} />
            <div>
              <div className="font-bold text-slate-900">{participant.fullName}</div>
              <div className="text-xs text-slate-500">Xác nhận tham dự</div>
            </div>
          </div>

          <div className="space-y-2">
            {(['Tham dự', 'Vắng mặt', 'Xin phép vắng', 'Chưa chắc chắn'] as ParticipantResponse[]).map(r => {
              const cfg = RESPONSE_CONFIG[r];
              return (
                <button key={r} onClick={() => setResp(r)}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left',
                    resp === r ? cn(cfg.color, 'border-2') : 'bg-white border-slate-200 hover:border-slate-300')}>
                  <span className={cn('h-3 w-3 rounded-full', cfg.dot)} />
                  {cfg.icon} {r}
                </button>
              );
            })}
          </div>

          {needsReason && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Lý do <span className="text-rose-500">*</span></label>
              <textarea rows={2} placeholder="Nhập lý do vắng mặt..."
                value={reason} onChange={e => setReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none focus:border-slate-400" />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={needsReason && !reason.trim()}
              onClick={() => onSave(participant.id, resp, reason)}>
              <Check className="h-3.5 w-3.5 mr-1" />Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Attendance Modal ─────────────────────────────────────────
function AttendanceModal({ participant, onSave, onClose }: {
  participant: MeetingParticipantDetail;
  onSave: (id: string, status: AttendanceStatus, note: string) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<AttendanceStatus>(participant.attendance ?? 'Có mặt');
  const [note, setNote] = useState(participant.attendanceNote ?? '');

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={participant.fullName} />
            <div>
              <div className="font-bold text-slate-900">{participant.fullName}</div>
              <div className="text-xs text-slate-500">Điểm danh</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['Có mặt', 'Vắng mặt', 'Đi muộn', 'Rời sớm', 'Không xác định'] as AttendanceStatus[]).map(s => {
              const cfg = ATTENDANCE_CONFIG[s];
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all',
                    status === s ? cn(cfg.color, 'border-2') : 'bg-white border-slate-200 hover:border-slate-300')}>
                  <span className={cn('h-2.5 w-2.5 rounded-full', cfg.dot)} />{s}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Ghi chú</label>
            <Input placeholder="VD: Vào lúc 08:10, rời lúc 09:30..." value={note}
              onChange={e => setNote(e.target.value)} className="text-sm" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onSave(participant.id, status, note)}>
              <ClipboardCheck className="h-3.5 w-3.5 mr-1" />Lưu điểm danh
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Participant Row ──────────────────────────────────────────
function ParticipantRow({ p, canEdit, canAttend, onRespond, onAttend, onResend, onRemove, onChangeRole }: {
  p: MeetingParticipantDetail;
  canEdit: boolean;
  canAttend: boolean;
  onRespond: (p: MeetingParticipantDetail) => void;
  onAttend: (p: MeetingParticipantDetail) => void;
  onResend: (id: string) => void;
  onRemove: (id: string) => void;
  onChangeRole: (id: string, role: MeetingRole) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const rc = ROLE_CONFIG[p.role];

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all">
      <Avatar name={p.fullName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm text-slate-900">{p.fullName}</span>
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border', rc.color)}>
            {rc.icon} {p.role}
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{p.position} · {p.department}</div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <ResponseBadge resp={p.response} />
          <AttendanceBadge status={p.attendance} />
          {p.inviteSentAt && (
            <span className="text-[10px] text-slate-400">
              Mời {fmtTime(p.inviteSentAt)}
              {p.inviteResendCount > 0 && ` (+${p.inviteResendCount} lần)`}
            </span>
          )}
        </div>
        {p.responseReason && (
          <div className="text-[11px] text-slate-500 mt-1 italic">Lý do: {p.responseReason}</div>
        )}
        {p.attendanceNote && (
          <div className="text-[11px] text-amber-700 mt-0.5 italic">📝 {p.attendanceNote}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Self-response button */}
        <button onClick={() => onRespond(p)}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Xác nhận tham dự">
          <CheckCircle2 className="h-4 w-4" />
        </button>
        {canAttend && (
          <button onClick={() => onAttend(p)}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Điểm danh">
            <ClipboardCheck className="h-4 w-4" />
          </button>
        )}
        {canEdit && (
          <>
            <button onClick={() => onResend(p.id)}
              className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="Gửi lại thư mời">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onRemove(p.id)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" title="Xóa khỏi danh sách">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Meeting Participant Panel ────────────────────────────────
function MeetingParticipantPanel({ meeting, onUpdate }: {
  meeting: MeetingDetail;
  onUpdate: (m: MeetingDetail) => void;
}) {
  const [participants, setParticipants] = useState<MeetingParticipantDetail[]>(meeting.participants);
  const [showAdd, setShowAdd] = useState(false);
  const [respondingTo, setRespondingTo] = useState<MeetingParticipantDetail | null>(null);
  const [attendingTo, setAttendingTo] = useState<MeetingParticipantDetail | null>(null);
  const [responseFilter, setResponseFilter] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const kpi = useMemo(() => ({
    total: participants.length,
    confirmed: participants.filter(p => p.response === 'Tham dự').length,
    absent: participants.filter(p => p.response === 'Vắng mặt' || p.response === 'Xin phép vắng').length,
    pending: participants.filter(p => p.response === 'Chưa phản hồi').length,
    attended: participants.filter(p => p.attendance === 'Có mặt').length,
    notAttended: participants.filter(p => p.attendance !== null && p.attendance !== 'Có mặt').length,
  }), [participants]);

  const warnings: string[] = [];
  if (kpi.pending > Math.floor(kpi.total * 0.3)) warnings.push(`${kpi.pending} / ${kpi.total} người chưa phản hồi (>30%)`);
  const importantNoResp = participants.filter(p =>
    (p.role === 'Chủ trì' || p.role === 'Thư ký') && p.response === 'Chưa phản hồi'
  );
  if (importantNoResp.length > 0) warnings.push(`Người quan trọng chưa phản hồi: ${importantNoResp.map(p => p.fullName).join(', ')}`);

  const filtered = useMemo(() =>
    participants.filter(p => responseFilter === 'all' || p.response === responseFilter),
    [participants, responseFilter]
  );

  const handleAdd = (newOnes: Partial<MeetingParticipantDetail>[]) => {
    const toAdd = newOnes.map(n => ({
      ...n,
      inviteSentAt: new Date().toISOString(),
    } as MeetingParticipantDetail));
    setParticipants(prev => [...prev, ...toAdd]);
    setShowAdd(false);
    showToast(`Đã thêm ${toAdd.length} người và gửi thư mời`);
  };

  const handleRespond = (id: string, resp: ParticipantResponse, reason: string) => {
    setParticipants(prev => prev.map(p => p.id === id
      ? { ...p, response: resp, responseReason: reason || null, responseAt: new Date().toISOString() }
      : p));
    setRespondingTo(null);
    showToast('Đã cập nhật xác nhận tham dự');
  };

  const handleAttend = (id: string, status: AttendanceStatus, note: string) => {
    setParticipants(prev => prev.map(p => p.id === id
      ? { ...p, attendance: status, attendanceNote: note || null, attendanceAt: new Date().toISOString(), attendanceBy: 'Lê Văn Bình' }
      : p));
    setAttendingTo(null);
    showToast('Đã lưu điểm danh');
  };

  const handleResend = (id: string) => {
    setParticipants(prev => prev.map(p => p.id === id
      ? { ...p, inviteResendCount: p.inviteResendCount + 1, inviteSentAt: new Date().toISOString() }
      : p));
    showToast('Đã gửi lại thư mời');
  };

  const handleRemove = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    showToast('Đã xóa người tham gia');
  };

  const handleSendAll = () => {
    setParticipants(prev => prev.map(p =>
      p.inviteSentAt ? p : { ...p, inviteSentAt: new Date().toISOString() }
    ));
    showToast(`Đã gửi thư mời đến ${participants.filter(p => !p.inviteSentAt).length} người chưa nhận`);
  };

  const isCompleted = meeting.status === 'Đã hoàn thành';

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />{toast}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddParticipantModal
          meeting={meeting}
          existingIds={participants.map(p => p.userId)}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)} />
      )}
      {respondingTo && (
        <ResponseModal
          participant={respondingTo}
          onSave={handleRespond}
          onClose={() => setRespondingTo(null)} />
      )}
      {attendingTo && (
        <AttendanceModal
          participant={attendingTo}
          onSave={handleAttend}
          onClose={() => setAttendingTo(null)} />
      )}

      {/* Meeting info bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="font-bold text-slate-900 mb-2 text-sm">{meeting.title}</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{meeting.date} · {meeting.startTime}–{meeting.endTime}</span>
          {meeting.roomName && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meeting.roomName}</span>}
          {meeting.isOnline && <span className="flex items-center gap-1 text-blue-600"><Video className="h-3 w-3" />Online</span>}
        </div>
      </div>

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

      {/* KPI */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Được mời',       value: kpi.total,       color: 'text-slate-700',   bg: 'bg-slate-50'    },
          { label: 'Xác nhận dự',    value: kpi.confirmed,   color: 'text-emerald-700', bg: 'bg-emerald-50'  },
          { label: 'Vắng/Xin phép',  value: kpi.absent,      color: 'text-rose-700',    bg: 'bg-rose-50'     },
          { label: 'Chưa phản hồi',  value: kpi.pending,     color: 'text-amber-700',   bg: 'bg-amber-50'    },
          { label: 'Có mặt',         value: kpi.attended,    color: 'text-blue-700',    bg: 'bg-blue-50'     },
          { label: 'Vắng (điểm danh)',value: kpi.notAttended, color: 'text-orange-700', bg: 'bg-orange-50'   },
        ].map(k => (
          <div key={k.label} className={cn('rounded-xl p-3 text-center border border-slate-200', k.bg)}>
            <div className={cn('text-2xl font-black', k.color)}>{k.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
            onClick={() => setShowAdd(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1" />Thêm người
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleSendAll}>
            <Send className="h-3.5 w-3.5 mr-1" />Gửi thư mời tất cả
          </Button>
          {isCompleted && (
            <Button size="sm" variant="outline" className="h-8 text-xs border-emerald-300 text-emerald-700">
              <ClipboardCheck className="h-3.5 w-3.5 mr-1" />Điểm danh hàng loạt
            </Button>
          )}
        </div>
        <Select value={responseFilter} onChange={e => setResponseFilter(e.target.value)} className="h-8 text-xs w-[160px]">
          <option value="all">Tất cả phản hồi</option>
          <option value="Tham dự">Tham dự</option>
          <option value="Vắng mặt">Vắng mặt</option>
          <option value="Xin phép vắng">Xin phép vắng</option>
          <option value="Chưa chắc chắn">Chưa chắc chắn</option>
          <option value="Chưa phản hồi">Chưa phản hồi</option>
        </Select>
      </div>

      {/* Participant list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <div>Không có người tham gia</div>
          </div>
        ) : filtered.map(p => (
          <ParticipantRow key={p.id} p={p}
            canEdit
            canAttend={isCompleted}
            onRespond={setRespondingTo}
            onAttend={setAttendingTo}
            onResend={handleResend}
            onRemove={handleRemove}
            onChangeRole={(id, role) => setParticipants(prev => prev.map(pp => pp.id === id ? { ...pp, role } : pp))}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function ParticipantManager() {
  const [meetings, setMeetings] = useState<MeetingDetail[]>(MEETING_DETAILS);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDetail>(MEETING_DETAILS[0]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quản lý người tham gia</h2>
          <p className="text-sm text-slate-500">Thêm người, gửi thư mời, theo dõi phản hồi và điểm danh</p>
        </div>
      </div>

      {/* Meeting selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="text-xs font-semibold text-slate-700 mb-2">Chọn cuộc họp</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {meetings.map(m => (
            <button key={m.id} onClick={() => setSelectedMeeting(m)}
              className={cn('flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                selectedMeeting.id === m.id
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-slate-200 hover:border-blue-200')}>
              <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900 truncate">{m.title}</div>
                <div className="text-xs text-slate-500">{m.date} · {m.startTime}–{m.endTime}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500">{m.participants.length} người</span>
                  <span className="text-[10px] font-semibold text-emerald-700">
                    {m.participants.filter(p => p.response === 'Tham dự').length} xác nhận
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700">
                    {m.participants.filter(p => p.response === 'Chưa phản hồi').length} chưa phản hồi
                  </span>
                </div>
              </div>
              {selectedMeeting.id === m.id && (
                <Check className="h-4 w-4 text-blue-600 shrink-0 mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <MeetingParticipantPanel
        key={selectedMeeting.id}
        meeting={selectedMeeting}
        onUpdate={updated => setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m))}
      />
    </div>
  );
}
