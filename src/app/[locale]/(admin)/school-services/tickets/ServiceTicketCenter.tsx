'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, AlertTriangle, CheckCircle2, Clock,
  X, ChevronDown, ChevronRight, Star, Send, ArrowRight,
  User, Paperclip, MessageSquare, RefreshCw, BarChart3,
  TrendingUp, Eye, Edit3, Users, Zap, Shield,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MOCK_TICKETS, ServiceTicket, TicketStatus, TicketPriority,
  TicketGroup, SenderRole, TicketActivity, TicketRating,
  GROUP_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG,
  SERVICE_STAFF, SLA_HOURS, getSlaStatus, computeSlaDeadline,
} from '@/src/mockData/serviceTickets';

// ─── Helpers ──────────────────────────────────────────────────
function fmtDt(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtDate(d: string) {
  const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`;
}

// ─── Badge components ─────────────────────────────────────────
function StatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', c.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />{c.label}
    </span>
  );
}
function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', c.color)}>
      {c.label}
    </span>
  );
}
function GroupBadge({ group }: { group: TicketGroup }) {
  const c = GROUP_CONFIG[group];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', c.color)}>
      {c.icon} {c.label}
    </span>
  );
}

// ─── SLA indicator ────────────────────────────────────────────
function SlaIndicator({ ticket }: { ticket: ServiceTicket }) {
  const s = getSlaStatus(ticket);
  if (!s || s === 'ok') return null;
  if (!ticket.slaDeadline) return null;
  const remaining = new Date(ticket.slaDeadline).getTime() - Date.now();
  const h = Math.floor(Math.abs(remaining) / 3600000);
  const m = Math.floor((Math.abs(remaining) % 3600000) / 60000);
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border',
      s === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
      <Clock className="h-3 w-3" />
      {s === 'overdue' ? `Quá hạn ${h}h${m}m` : `Còn ${h}h${m}m`}
    </span>
  );
}

// ─── Star Rating ──────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={cn('transition-colors', (hover || value) >= n ? 'text-amber-400' : 'text-slate-200')}>
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
  );
}

// ─── Create Ticket Modal ──────────────────────────────────────
function CreateTicketModal({ onAdd, onClose }: {
  onAdd: (t: ServiceTicket) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: '', description: '', serviceGroup: 'facility' as TicketGroup,
    senderName: '', senderRole: 'parent' as SenderRole,
    studentName: '', classOrDept: '', priority: 'normal' as TicketPriority,
    desiredDeadline: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề';
    if (!form.senderName.trim()) e.senderName = 'Vui lòng nhập tên người gửi';
    if (!form.description.trim()) e.description = 'Vui lòng nhập nội dung';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const now = new Date().toISOString();
    const ticket: ServiceTicket = {
      id: `TK${Date.now()}`, code: `TK-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: form.title, description: form.description,
      serviceGroup: form.serviceGroup, senderName: form.senderName,
      senderRole: form.senderRole, studentName: form.studentName || null,
      classOrDept: form.classOrDept, priority: form.priority, status: 'NEW',
      assignedTo: null,
      desiredDeadline: form.desiredDeadline || null,
      slaDeadline: computeSlaDeadline(now, form.priority),
      attachments: [], activities: [], rating: null, createdAt: now, updatedAt: now,
    };
    onAdd(ticket);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4 flex flex-col max-h-[calc(100vh-2rem)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Tạo ticket mới</div>
                <div className="text-xs text-slate-500">Gửi yêu cầu dịch vụ đến nhà trường</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tiêu đề <span className="text-rose-500">*</span></label>
              <Input placeholder="VD: Con bị bỏ quên trên xe..." value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={cn(errors.title && 'border-rose-400')} />
              {errors.title && <p className="text-[11px] text-rose-600">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nhóm dịch vụ</label>
                <Select value={form.serviceGroup} onChange={e => setForm(f => ({ ...f, serviceGroup: e.target.value as TicketGroup }))}>
                  {Object.entries(GROUP_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Mức độ ưu tiên</label>
                <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nội dung chi tiết <span className="text-rose-500">*</span></label>
              <textarea rows={4} placeholder="Mô tả đầy đủ vấn đề, thời gian xảy ra, học sinh liên quan..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className={cn('w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:border-slate-400',
                  errors.description ? 'border-rose-400' : 'border-slate-200')} />
              {errors.description && <p className="text-[11px] text-rose-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Người gửi <span className="text-rose-500">*</span></label>
                <Input placeholder="Họ tên" value={form.senderName}
                  onChange={e => setForm(f => ({ ...f, senderName: e.target.value }))}
                  className={cn(errors.senderName && 'border-rose-400')} />
                {errors.senderName && <p className="text-[11px] text-rose-600">{errors.senderName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Vai trò</label>
                <Select value={form.senderRole} onChange={e => setForm(f => ({ ...f, senderRole: e.target.value as SenderRole }))}>
                  <option value="parent">Phụ huynh</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="staff">Nhân viên</option>
                  <option value="student">Học sinh</option>
                  <option value="bgh">BGH</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Học sinh liên quan</label>
                <Input placeholder="Họ tên học sinh" value={form.studentName}
                  onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Lớp / Phòng ban</label>
                <Input placeholder="VD: Lớp 3A" value={form.classOrDept}
                  onChange={e => setForm(f => ({ ...f, classOrDept: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Hạn mong muốn xử lý</label>
              <Input type="date" value={form.desiredDeadline}
                onChange={e => setForm(f => ({ ...f, desiredDeadline: e.target.value }))} />
            </div>

            {/* SLA info */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-700">SLA theo mức độ ưu tiên</div>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', v.dot)} />
                  <span>{v.label}:</span>
                  <span className="font-medium">{SLA_HOURS[k as TicketPriority] ? `Trong ${SLA_HOURS[k as TicketPriority]}h` : 'Định kỳ'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
              <Send className="h-3.5 w-3.5 mr-1.5" />Gửi yêu cầu
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Ticket Detail Panel ──────────────────────────────────────
function TicketDetail({ ticket, onClose, onUpdate }: {
  ticket: ServiceTicket;
  onClose: () => void;
  onUpdate: (t: ServiceTicket) => void;
}) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [assignTo, setAssignTo] = useState(ticket.assignedTo || '');
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status);
  const [showRating, setShowRating] = useState(ticket.status === 'RESOLVED' && !ticket.rating);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const slaStatus = getSlaStatus(ticket);

  const addActivity = (action: TicketActivity['action'], content: string, extra?: Partial<TicketActivity>) => {
    const act: TicketActivity = {
      id: `act_${Date.now()}`, actorName: 'Người dùng',
      action, content, isInternal, createdAt: new Date().toISOString(), ...extra,
    };
    onUpdate({ ...ticket, activities: [...ticket.activities, act], updatedAt: new Date().toISOString() });
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    addActivity('comment', newComment);
    setNewComment('');
    showToast('Đã gửi phản hồi');
  };

  const handleStatusChange = () => {
    if (newStatus === ticket.status) return;
    const updated: ServiceTicket = {
      ...ticket, status: newStatus,
      activities: [...ticket.activities, {
        id: `act_${Date.now()}`, actorName: 'Người dùng',
        action: 'status_change', fromStatus: ticket.status, toStatus: newStatus,
        content: `Chuyển từ "${STATUS_CONFIG[ticket.status].label}" → "${STATUS_CONFIG[newStatus].label}"`,
        isInternal: true, createdAt: new Date().toISOString(),
      }],
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updated);
    showToast(`Đã cập nhật: ${STATUS_CONFIG[newStatus].label}`);
  };

  const handleAssign = () => {
    if (!assignTo) return;
    const updated: ServiceTicket = {
      ...ticket, assignedTo: assignTo,
      activities: [...ticket.activities, {
        id: `act_${Date.now()}`, actorName: 'Người dùng',
        action: 'assign', content: `Giao cho: ${assignTo}`,
        isInternal: true, createdAt: new Date().toISOString(),
      }],
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updated);
    showToast(`Đã giao cho ${assignTo}`);
  };

  const handleRating = () => {
    if (!ratingStars) return;
    const rating: TicketRating = { stars: ratingStars, comment: ratingComment, ratedAt: new Date().toISOString() };
    onUpdate({ ...ticket, rating, status: 'CLOSED', updatedAt: new Date().toISOString() });
    setShowRating(false);
    showToast('Cảm ơn đánh giá của bạn!');
  };

  const NEXT_STATUSES: TicketStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_INFO', 'WAITING_APPROVAL', 'RESOLVED', 'CLOSED', 'CANCELLED', 'REJECTED'];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white overflow-y-auto flex flex-col shadow-2xl">
        {toast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />{toast}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 z-10 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">{ticket.code}</span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <SlaIndicator ticket={ticket} />
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{ticket.title}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 py-4 space-y-5">
          {/* Overdue warning */}
          {slaStatus === 'overdue' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-800 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Ticket này đã vượt quá thời gian xử lý SLA. Cần xử lý ngay!</span>
            </div>
          )}

          {/* Rating prompt */}
          {showRating && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="font-semibold text-amber-900 text-sm flex items-center gap-2"><Star className="h-4 w-4" />Đánh giá kết quả xử lý</div>
              <StarRating value={ratingStars} onChange={setRatingStars} />
              <Input placeholder="Góp ý thêm (không bắt buộc)" value={ratingComment}
                onChange={e => setRatingComment(e.target.value)} className="text-sm" />
              <div className="flex gap-2">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRating}>Gửi đánh giá</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowRating(false)}>Để sau</Button>
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="font-semibold text-slate-700">Thông tin yêu cầu</div>
              <div><span className="text-slate-400">Nhóm dịch vụ: </span><GroupBadge group={ticket.serviceGroup} /></div>
              <div><span className="text-slate-400">Người gửi: </span><span className="font-medium text-slate-700">{ticket.senderName}</span></div>
              {ticket.studentName && <div><span className="text-slate-400">Học sinh: </span><span className="text-slate-700">{ticket.studentName}</span></div>}
              {ticket.classOrDept && <div><span className="text-slate-400">Lớp/BP: </span><span className="text-slate-700">{ticket.classOrDept}</span></div>}
              <div><span className="text-slate-400">Tạo lúc: </span><span className="text-slate-700">{fmtDt(ticket.createdAt)}</span></div>
              {ticket.desiredDeadline && <div><span className="text-slate-400">Hạn mong muốn: </span><span className="text-slate-700">{fmtDate(ticket.desiredDeadline)}</span></div>}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-3">
              <div className="font-semibold text-slate-700">Xử lý</div>
              {/* Assign */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Người phụ trách</label>
                <div className="flex gap-1">
                  <Select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="h-7 text-[10px] flex-1">
                    <option value="">-- Chọn --</option>
                    {SERVICE_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <button onClick={handleAssign} className="px-2 bg-blue-600 text-white rounded-lg text-[10px] hover:bg-blue-700">Giao</button>
                </div>
              </div>
              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Cập nhật trạng thái</label>
                <div className="flex gap-1">
                  <Select value={newStatus} onChange={e => setNewStatus(e.target.value as TicketStatus)} className="h-7 text-[10px] flex-1">
                    {NEXT_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </Select>
                  <button onClick={handleStatusChange} className="px-2 bg-emerald-600 text-white rounded-lg text-[10px] hover:bg-emerald-700">Lưu</button>
                </div>
              </div>
              {/* SLA info */}
              {ticket.slaDeadline && (
                <div>
                  <span className="text-[10px] text-slate-400">SLA deadline: </span>
                  <span className={cn('text-[10px] font-semibold', slaStatus === 'overdue' ? 'text-rose-700' : slaStatus === 'warning' ? 'text-amber-700' : 'text-slate-700')}>
                    {fmtDt(ticket.slaDeadline)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-700">Nội dung yêu cầu</div>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed">{ticket.description}</div>
          </div>

          {/* Attachments */}
          {ticket.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map(a => (
                <div key={a.name} className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                  <Paperclip className="h-3 w-3 text-slate-400" />{a.name} <span className="text-slate-400">{a.size}</span>
                </div>
              ))}
            </div>
          )}

          {/* Rating display */}
          {ticket.rating && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="font-semibold text-amber-900 text-xs mb-1">Đánh giá của người gửi</div>
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={cn('h-4 w-4', n <= ticket.rating!.stars ? 'text-amber-400 fill-current' : 'text-slate-200')} />
                ))}
                <span className="text-xs text-amber-700 ml-1">{ticket.rating.stars}/5</span>
              </div>
              {ticket.rating.comment && <div className="text-xs text-amber-800 italic">"{ticket.rating.comment}"</div>}
            </div>
          )}

          {/* Activity timeline */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">Lịch sử hoạt động</div>
            {ticket.activities.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">Chưa có hoạt động nào</div>
            ) : (
              <div className="space-y-2">
                {ticket.activities.map(a => (
                  <div key={a.id} className={cn('flex gap-3 p-3 rounded-xl border text-xs',
                    a.isInternal ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/50 border-blue-100')}>
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-600">
                      {a.actorName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{a.actorName}</span>
                        {a.isInternal && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">Nội bộ</span>}
                        <span className="text-slate-400 ml-auto">{fmtDt(a.createdAt)}</span>
                      </div>
                      {a.action === 'status_change' && a.fromStatus && a.toStatus && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <StatusBadge status={a.fromStatus} />
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <StatusBadge status={a.toStatus} />
                        </div>
                      )}
                      <div className="text-slate-600 mt-0.5">{a.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment box */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsInternal(false)}
                className={cn('text-xs px-2 py-1 rounded-lg border font-semibold transition-all',
                  !isInternal ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200')}>
                Phản hồi người gửi
              </button>
              <button onClick={() => setIsInternal(true)}
                className={cn('text-xs px-2 py-1 rounded-lg border font-semibold transition-all',
                  isInternal ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200')}>
                Ghi chú nội bộ
              </button>
            </div>
            <div className="flex gap-2">
              <textarea rows={2} placeholder={isInternal ? 'Ghi chú nội bộ (không gửi cho người tạo ticket)...' : 'Phản hồi cho người gửi...'}
                value={newComment} onChange={e => setNewComment(e.target.value)}
                className={cn('flex-1 rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:border-slate-400',
                  isInternal ? 'border-slate-300 bg-slate-50' : 'border-blue-200 bg-blue-50/30')} />
              <button onClick={handleComment}
                className="px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard KPI ────────────────────────────────────────────
function DashboardView({ tickets }: { tickets: ServiceTicket[] }) {
  const kpis = useMemo(() => ({
    total:    tickets.length,
    new_:     tickets.filter(t => t.status === 'NEW').length,
    inProg:   tickets.filter(t => t.status === 'IN_PROGRESS').length,
    waiting:  tickets.filter(t => ['WAITING_INFO','WAITING_APPROVAL'].includes(t.status)).length,
    overdue:  tickets.filter(t => t.status === 'OVERDUE' || getSlaStatus(t) === 'overdue').length,
    done:     tickets.filter(t => ['RESOLVED','CLOSED'].includes(t.status)).length,
  }), [tickets]);

  const byGroup = useMemo(() =>
    Object.keys(GROUP_CONFIG).map(g => ({
      key: g as TicketGroup,
      count: tickets.filter(t => t.serviceGroup === g).length,
    })).filter(x => x.count > 0), [tickets]);

  const urgent = tickets.filter(t => ['urgent','high'].includes(t.priority) && !['RESOLVED','CLOSED','CANCELLED','REJECTED'].includes(t.status));
  const doneCount = kpis.done;
  const onTimeRate = tickets.length > 0 ? Math.round((doneCount / tickets.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Tổng ticket', value: kpis.total, color: 'text-slate-800', bg: 'bg-white', border: 'border-slate-200' },
          { label: 'Mới tạo', value: kpis.new_, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Đang xử lý', value: kpis.inProg, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Chờ phản hồi', value: kpis.waiting, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
          { label: 'Quá hạn', value: kpis.overdue, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
          { label: 'Hoàn thành', value: kpis.done, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        ].map(k => (
          <div key={k.label} className={cn('rounded-2xl border p-4 text-center', k.bg, k.border)}>
            <div className={cn('text-3xl font-black', k.color)}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* By group + SLA rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />Ticket theo nhóm dịch vụ
          </div>
          <div className="space-y-2.5">
            {byGroup.map(g => {
              const cfg = GROUP_CONFIG[g.key];
              const pct = Math.round((g.count / kpis.total) * 100);
              return (
                <div key={g.key} className="flex items-center gap-3">
                  <div className="text-base w-6 text-center">{cfg.icon}</div>
                  <div className="text-xs text-slate-600 w-28 shrink-0 truncate">{cfg.label}</div>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', cfg.dot)} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-6 text-right">{g.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />Tỷ lệ xử lý đúng hạn
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="10"
                  strokeDasharray={`${onTimeRate * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-emerald-700">{onTimeRate}%</div>
                <div className="text-[10px] text-slate-400">Đúng hạn</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <div className="font-bold text-emerald-700">{kpis.done}</div>
              <div className="text-slate-500">Đã xử lý</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-2 text-center">
              <div className="font-bold text-rose-700">{kpis.overdue}</div>
              <div className="text-slate-500">Quá hạn</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority tickets */}
      {urgent.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-rose-500" />Ticket ưu tiên cao cần xử lý
            <span className="ml-auto text-xs text-rose-600 font-semibold">{urgent.length} ticket</span>
          </div>
          <div className="divide-y divide-slate-50">
            {urgent.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-base">{GROUP_CONFIG[t.serviceGroup].icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.senderName} · {fmtDt(t.createdAt)}</div>
                </div>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
                <SlaIndicator ticket={t} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ticket List View ─────────────────────────────────────────
function TicketListView({ tickets, onSelect }: { tickets: ServiceTicket[]; onSelect: (t: ServiceTicket) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-slate-100">
        {tickets.map(t => (
          <div key={t.id} onClick={() => onSelect(t)} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{t.code}</span>
                <div className="font-semibold text-sm text-slate-900 line-clamp-1">{t.title}</div>
              </div>
              <SlaIndicator ticket={t} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <GroupBadge group={t.serviceGroup} />
              <StatusBadge status={t.status} />
              <PriorityBadge priority={t.priority} />
            </div>
            <div className="text-xs text-slate-400 mt-1.5">{t.senderName} · {fmtDt(t.createdAt)}</div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-left font-bold">Mã</th>
              <th className="px-4 py-3 text-left font-bold">Tiêu đề & Nhóm</th>
              <th className="px-4 py-3 text-left font-bold">Người gửi</th>
              <th className="px-4 py-3 text-left font-bold">Ưu tiên</th>
              <th className="px-4 py-3 text-left font-bold">Trạng thái</th>
              <th className="px-4 py-3 text-left font-bold">SLA</th>
              <th className="px-4 py-3 text-left font-bold">Phụ trách</th>
              <th className="px-4 py-3 text-left font-bold">Tạo lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickets.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-slate-400 text-sm">Không tìm thấy ticket nào</td></tr>
            ) : tickets.map(t => (
              <tr key={t.id} onClick={() => onSelect(t)}
                className="hover:bg-blue-50/30 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400 shrink-0">{t.code}</td>
                <td className="px-4 py-3 max-w-[220px]">
                  <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                  <GroupBadge group={t.serviceGroup} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{t.senderName}</td>
                <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><SlaIndicator ticket={t} /></td>
                <td className="px-4 py-3 text-xs text-slate-500">{t.assignedTo || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{fmtDt(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
const GROUPS_ALL = Object.keys(GROUP_CONFIG) as TicketGroup[];
const STATUSES_ALL: TicketStatus[] = ['NEW','ASSIGNED','IN_PROGRESS','WAITING_INFO','WAITING_APPROVAL','RESOLVED','CLOSED','OVERDUE','CANCELLED','REJECTED'];

export default function ServiceTicketCenter({ initialTickets = [] }: { initialTickets?: any[] }) {
  // Merge DB tickets (mapped to ServiceTicket shape) with mock data
  const [tickets, setTickets] = useState<ServiceTicket[]>(() => {
    const dbMapped: ServiceTicket[] = initialTickets.map(t => ({
      id: t.id, code: t.code || t.id.slice(0, 8),
      title: t.title, description: t.description || '',
      serviceGroup: (t.serviceGroup || t.category || 'other') as TicketGroup,
      senderName: t.createdBy || t.senderName || 'N/A',
      senderRole: (t.senderRole || 'staff') as SenderRole,
      studentName: t.studentName || null,
      classOrDept: t.classOrDept || '',
      priority: (t.priority || 'normal') as TicketPriority,
      status: (t.status || 'NEW') as TicketStatus,
      assignedTo: t.assignedTo || null,
      desiredDeadline: t.desiredDeadline || null,
      slaDeadline: t.slaDeadline || computeSlaDeadline(t.createdAt, t.priority || 'normal'),
      attachments: [], activities: [], rating: null,
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
      updatedAt: typeof t.updatedAt === 'string' ? (t.updatedAt || t.createdAt) : new Date(t.updatedAt || t.createdAt).toISOString(),
    }));
    return dbMapped.length > 0 ? dbMapped : MOCK_TICKETS;
  });

  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<ServiceTicket | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filtered = useMemo(() => tickets.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.code.toLowerCase().includes(search.toLowerCase()) &&
        !t.senderName.toLowerCase().includes(search.toLowerCase())) return false;
    if (groupFilter !== 'all' && t.serviceGroup !== groupFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  }), [tickets, search, groupFilter, statusFilter, priorityFilter]);

  const updateTicket = (updated: ServiceTicket) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (selected?.id === updated.id) setSelected(updated);
  };

  const addTicket = (t: ServiceTicket) => {
    setTickets(prev => [t, ...prev]);
    setShowCreate(false);
    showToast(`Đã tạo ticket ${t.code}`);
  };

  return (
    <div className="space-y-5 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />{toast}
        </div>
      )}
      {showCreate && <CreateTicketModal onAdd={addTicket} onClose={() => setShowCreate(false)} />}
      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} onUpdate={updateTicket} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">🎫 Trung tâm Ticket Dịch vụ</h2>
          <p className="text-sm text-slate-500 mt-0.5">Tiếp nhận và xử lý yêu cầu dịch vụ trong nhà trường</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />Tạo ticket mới
        </Button>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setView('dashboard')}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
            view === 'dashboard' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400')}>
          <BarChart3 className="h-3.5 w-3.5" />Dashboard
        </button>
        <button onClick={() => setView('list')}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
            view === 'list' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400')}>
          <Filter className="h-3.5 w-3.5" />Danh sách ({filtered.length})
        </button>
      </div>

      {/* Filters — show in list mode */}
      {view === 'list' && (
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm tiêu đề, mã, người gửi..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="h-10 text-sm w-[170px]">
            <option value="all">Tất cả nhóm</option>
            {GROUPS_ALL.map(g => <option key={g} value={g}>{GROUP_CONFIG[g].icon} {GROUP_CONFIG[g].label}</option>)}
          </Select>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 text-sm w-[170px]">
            <option value="all">Mọi trạng thái</option>
            {STATUSES_ALL.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </Select>
          <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-10 text-sm w-[140px]">
            <option value="all">Mọi ưu tiên</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>
      )}

      {view === 'dashboard'
        ? <DashboardView tickets={tickets} />
        : <TicketListView tickets={filtered} onSelect={setSelected} />}
    </div>
  );
}
