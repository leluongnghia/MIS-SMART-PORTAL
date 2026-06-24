'use client';

import { useState, useTransition } from 'react';
import { createTicket, assignTicket, resolveTicket, addTicketComment } from './actions';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, UserCheck, Plus, Filter } from 'lucide-react';

type Ticket = Awaited<ReturnType<typeof import('./actions').getTickets>>[number];

const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Học vụ', service: 'Dịch vụ', finance: 'Học phí', other: 'Khác',
};
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Đang xử lý', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Đã giải quyết', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Đóng', color: 'bg-slate-100 text-slate-600' },
};
const PRIORITY_COLORS: Record<string, string> = {
  normal: 'border-l-slate-300', high: 'border-l-amber-400', urgent: 'border-l-rose-500',
};

export default function TicketsClient({
  initialTickets,
  initialSlaBreaches,
}: {
  initialTickets: Ticket[];
  initialSlaBreaches: Ticket[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [slaBreaches] = useState(initialSlaBreaches);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [form, setForm] = useState({
    parentName: '', parentPhone: '', category: 'academic',
    subject: '', description: '', priority: 'normal',
  });

  const filtered = tickets.filter(t => filterStatus ? t.status === filterStatus : true);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    sla: slaBreaches.length,
  };

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createTicket(form);
      setShowCreateForm(false);
      setForm({ parentName: '', parentPhone: '', category: 'academic', subject: '', description: '', priority: 'normal' });
      // Reload
      window.location.reload();
    });
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !comment.trim()) return;
    startTransition(async () => {
      await addTicketComment(selected.id, 'Nhân viên CSKH', comment);
      setComment('');
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CSKH Phụ huynh</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý phản ánh, yêu cầu và khiếu nại từ phụ huynh</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Tạo Ticket
        </button>
      </div>

      {/* SLA Alert */}
      {stats.sla > 0 && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-700 font-medium">
            {stats.sla} ticket đã quá hạn SLA — cần xử lý ngay!
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng', value: stats.total, icon: MessageSquare, color: 'text-indigo-600' },
          { label: 'Mới', value: stats.open, icon: Clock, color: 'text-blue-600' },
          { label: 'Đang xử lý', value: stats.inProgress, icon: UserCheck, color: 'text-amber-600' },
          { label: 'Giải quyết', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Ticket List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="open">Mới</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đóng</option>
            </select>
          </div>
          <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Không có ticket nào</div>
            ) : filtered.map(t => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-colors border-l-4 ${PRIORITY_COLORS[t.priority]} ${selected?.id === t.id ? 'bg-indigo-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-slate-800 text-sm line-clamp-1">{t.subject}</span>
                  {t.slaBreached && <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full shrink-0">Quá hạn</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{t.parentName}</span>
                  <span>·</span>
                  <span>{CATEGORY_LABELS[t.category] ?? t.category}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[t.status]?.color}`}>
                    {STATUS_LABELS[t.status]?.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          {!selected ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400 text-sm">
              Chọn một ticket để xem chi tiết
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{selected.subject}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{selected.parentName} · {selected.parentPhone}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_LABELS[selected.status]?.color}`}>
                  {STATUS_LABELS[selected.status]?.label}
                </span>
              </div>

              {selected.description && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 mb-4">{selected.description}</div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                <div><span className="text-slate-400">Loại</span><br /><span className="font-medium">{CATEGORY_LABELS[selected.category]}</span></div>
                <div><span className="text-slate-400">Ưu tiên</span><br /><span className="font-medium capitalize">{selected.priority}</span></div>
                <div><span className="text-slate-400">SLA</span><br /><span className={`font-medium ${selected.slaBreached ? 'text-rose-600' : 'text-emerald-600'}`}>{selected.hoursElapsed}h / {selected.slaHours}h</span></div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                {selected.status === 'open' && (
                  <button
                    onClick={() => startTransition(async () => { await assignTicket(selected.id, 'me', 'Nhân viên CSKH'); window.location.reload(); })}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Nhận xử lý
                  </button>
                )}
                {selected.status === 'in_progress' && (
                  <button
                    onClick={() => startTransition(async () => { await resolveTicket(selected.id, 'Nhân viên CSKH', 'Đã giải quyết xong'); window.location.reload(); })}
                    className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Đánh dấu giải quyết xong
                  </button>
                )}
              </div>

              {/* Comment */}
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Thêm ghi chú / phản hồi..."
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="submit"
                  disabled={isPending || !comment.trim()}
                  className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tạo Ticket mới</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Họ tên phụ huynh *</label>
                <input required value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Số điện thoại</label>
                <input value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Loại</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="academic">Học vụ</option>
                    <option value="service">Dịch vụ</option>
                    <option value="finance">Học phí</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Ưu tiên</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="normal">Thường</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Chủ đề *</label>
                <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Mô tả chi tiết</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">Tạo Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
