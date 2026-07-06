'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell, BellRing, BarChart3, AlertTriangle, CheckCircle2,
  X, Mail, MessageSquare, Clock, Download, Printer,
  FileSpreadsheet, Calendar, Building2, Users, Target,
  TrendingUp, TrendingDown, Filter, RefreshCw, Eye,
  EyeOff, ChevronRight, Zap, Shield, Send,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MEETING_NOTIFS, REMINDER_CONFIGS, MONTHLY_STATS,
  DEPT_STATS, TYPE_STATS, ROOM_USAGE, ADMIN_ALERTS,
  ATTENDANCE_SUMMARY,
  MeetingNotif, ReminderConfig, NotifChannel, NotifStatus,
  AdminAlert,
} from '@/src/mockData/meetingReports';

// ─── Helpers ──────────────────────────────────────────────────
function fmtDt(iso: string) {
  if (!iso || iso === '—') return iso;
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const NOTIF_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  meeting_new:       { icon: '📅', color: 'bg-blue-50 border-blue-200' },
  meeting_invited:   { icon: '✉️', color: 'bg-blue-50 border-blue-200' },
  meeting_changed:   { icon: '🔄', color: 'bg-amber-50 border-amber-200' },
  meeting_cancelled: { icon: '🚫', color: 'bg-rose-50 border-rose-200' },
  room_approved:     { icon: '✅', color: 'bg-emerald-50 border-emerald-200' },
  room_rejected:     { icon: '❌', color: 'bg-rose-50 border-rose-200' },
  minutes_sent:      { icon: '📝', color: 'bg-indigo-50 border-indigo-200' },
  task_assigned:     { icon: '🎯', color: 'bg-emerald-50 border-emerald-200' },
  task_overdue:      { icon: '🚨', color: 'bg-rose-50 border-rose-200' },
  reminder:          { icon: '⏰', color: 'bg-amber-50 border-amber-200' },
};

const CHANNEL_CONFIG: Record<NotifChannel, { icon: React.ReactNode; label: string; color: string }> = {
  system: { icon: <Bell className="h-3 w-3" />,          label: 'Hệ thống', color: 'bg-slate-100 text-slate-700' },
  email:  { icon: <Mail className="h-3 w-3" />,          label: 'Email',    color: 'bg-blue-100 text-blue-700'  },
  zalo:   { icon: <MessageSquare className="h-3 w-3" />, label: 'Zalo',     color: 'bg-sky-100 text-sky-700'   },
};

// ─── Simple Bar Chart ─────────────────────────────────────────
function BarChart({ data, maxVal, colorClass }: {
  data: { label: string; value: number; value2?: number }[];
  maxVal: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="text-xs text-slate-600 w-28 shrink-0 truncate">{d.label}</div>
          <div className="flex-1 space-y-0.5">
            <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700', colorClass)}
                style={{ width: `${(d.value / maxVal) * 100}%` }} />
            </div>
            {d.value2 !== undefined && (
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(d.value2 / maxVal) * 100}%` }} />
              </div>
            )}
          </div>
          <div className="text-xs font-bold text-slate-700 w-8 text-right">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart (CSS) ─────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const SIZE = 100;
  const R = 35;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  function polarToXY(deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  }

  function arc(start: number, end: number) {
    const s = polarToXY(start);
    const e = polarToXY(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-28 h-28">
      {segments.map((seg, i) => {
        const start = (cumulative / total) * 360;
        cumulative += seg.value;
        const end = (cumulative / total) * 360;
        return <path key={i} d={arc(start, end)} fill={seg.color} opacity={0.85} />;
      })}
      <circle cx={CX} cy={CY} r={20} fill="white" />
      <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#1e293b">{total}</text>
    </svg>
  );
}

// ─── NOTIF TAB ─────────────────────────────────────────────────
function NotifTab() {
  const [notifs, setNotifs] = useState<MeetingNotif[]>(MEETING_NOTIFS);
  const [filter, setFilter] = useState<'all' | NotifStatus>('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const unread = notifs.filter(n => n.status === 'unread').length;

  const filtered = useMemo(() => notifs.filter(n => {
    if (filter !== 'all' && n.status !== filter) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  }), [notifs, filter, typeFilter]);

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, status: 'read' })));
  const archive = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: 'archived' } : n));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BellRing className="h-5 w-5 text-blue-600" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">{unread}</span>
            )}
          </div>
          <h3 className="font-bold text-slate-900">Thông báo lịch họp</h3>
          {unread > 0 && <span className="text-xs text-rose-600 font-semibold">{unread} chưa đọc</span>}
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={markAll}>
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'unread', 'read', 'archived'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1 rounded-full text-xs font-semibold border transition-all',
              filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300')}>
            {f === 'all' ? 'Tất cả' : f === 'unread' ? 'Chưa đọc' : f === 'read' ? 'Đã đọc' : 'Lưu trữ'}
          </button>
        ))}
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-7 text-xs w-[160px]">
          <option value="all">Tất cả loại</option>
          <option value="reminder">Nhắc lịch</option>
          <option value="meeting_invited">Lời mời họp</option>
          <option value="room_approved">Duyệt phòng</option>
          <option value="room_rejected">Từ chối phòng</option>
          <option value="task_assigned">Giao việc</option>
          <option value="task_overdue">Quá hạn</option>
          <option value="meeting_cancelled">Hủy họp</option>
          <option value="minutes_sent">Biên bản</option>
        </Select>
      </div>

      {/* Notif list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <div>Không có thông báo</div>
          </div>
        ) : filtered.map(n => {
          const cfg = NOTIF_TYPE_CONFIG[n.type] ?? { icon: '📣', color: 'bg-white border-slate-200' };
          return (
            <div key={n.id}
              className={cn('flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer', cfg.color,
                n.status === 'unread' ? 'shadow-sm' : 'opacity-70')}
              onClick={() => markRead(n.id)}>
              <div className="text-xl shrink-0">{cfg.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-slate-900">{n.title}</span>
                  {n.status === 'unread' && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400">{fmtDt(n.createdAt)}</span>
                  {n.channel.map(ch => {
                    const cc = CHANNEL_CONFIG[ch];
                    return (
                      <span key={ch} className={cn('inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full', cc.color)}>
                        {cc.icon}{cc.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); archive(n.id); }}
                className="p-1 rounded hover:bg-black/5 text-slate-400 shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REMINDER TAB ─────────────────────────────────────────────
function ReminderTab() {
  const [configs, setConfigs] = useState<ReminderConfig[]>(REMINDER_CONFIGS);
  const [saved, setSaved] = useState(false);

  const toggleEnabled = (id: string) => setConfigs(c => c.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const toggleChannel = (id: string, ch: NotifChannel) => setConfigs(c => c.map(r => {
    if (r.id !== id) return r;
    const has = r.channels.includes(ch);
    return { ...r, channels: has ? r.channels.filter(x => x !== ch) : [...r.channels, ch] };
  }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const CHANNEL_LIST: NotifChannel[] = ['system', 'email', 'zalo'];

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
        <div className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4" />Nhắc lịch tự động</div>
        <div className="text-xs">Hệ thống tự động gửi thông báo trước mỗi cuộc họp theo cấu hình bên dưới.</div>
      </div>

      {/* Reminder configs */}
      <div className="space-y-3">
        {configs.map(r => (
          <div key={r.id} className={cn('bg-white rounded-xl border p-4 transition-all',
            r.enabled ? 'border-slate-200 shadow-sm' : 'border-dashed border-slate-200 opacity-60')}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleEnabled(r.id)}
                  className={cn('relative h-6 w-10 rounded-full transition-colors duration-200',
                    r.enabled ? 'bg-blue-500' : 'bg-slate-300')}>
                  <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200',
                    r.enabled ? 'left-4' : 'left-0.5')} />
                </button>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{r.label}</div>
                  <div className="text-xs text-slate-500">{r.minutesBefore} phút trước cuộc họp</div>
                </div>
              </div>

              {/* Channel toggles */}
              <div className="flex gap-1.5">
                {CHANNEL_LIST.map(ch => {
                  const cfg = CHANNEL_CONFIG[ch];
                  const active = r.channels.includes(ch);
                  const isZalo = ch === 'zalo';
                  return (
                    <button key={ch}
                      onClick={() => !isZalo && toggleChannel(r.id, ch)}
                      title={isZalo ? 'Zalo chưa tích hợp — dự kiến hỗ trợ sau' : undefined}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all',
                        active && !isZalo ? cfg.color + ' border-current' : 'bg-slate-50 text-slate-400 border-slate-200',
                        isZalo ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:opacity-90',
                      )}>
                      {cfg.icon}{cfg.label}
                      {isZalo && <span className="text-[8px] ml-0.5">*</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Channel legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <div className="font-semibold text-slate-700">Trạng thái kênh thông báo</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Thông báo hệ thống — <span className="text-emerald-700 font-semibold">Đang hoạt động</span></div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Email — <span className="text-emerald-700 font-semibold">Đang hoạt động</span> (SMTP đã cấu hình)</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400" />Zalo / SMS — <span className="text-slate-500">Chưa tích hợp</span> (cấu trúc sẵn sàng mở rộng)</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className={cn('gap-2', saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700', 'text-white')}>
          {saved ? <><CheckCircle2 className="h-4 w-4" />Đã lưu</> : <><BellRing className="h-4 w-4" />Lưu cấu hình nhắc lịch</>}
        </Button>
      </div>
    </div>
  );
}

// ─── REPORT TAB ───────────────────────────────────────────────
function ReportTab() {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-07-31');
  const [deptFilter, setDeptFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const totalMeetings = MONTHLY_STATS.reduce((s, m) => s + m.total, 0);
  const totalCancelled = MONTHLY_STATS.reduce((s, m) => s + m.cancelled, 0);
  const totalCompleted = MONTHLY_STATS.reduce((s, m) => s + m.completed, 0);
  const maxMonthly = Math.max(...MONTHLY_STATS.map(m => m.total));
  const maxDept = Math.max(...DEPT_STATS.map(d => d.count));
  const maxRoom = Math.max(...ROOM_USAGE.map(r => r.bookings));

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />{toast}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" />Bộ lọc báo cáo</div>
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">Từ ngày</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs w-[130px]" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">Đến ngày</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs w-[130px]" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">Phòng ban</label>
            <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="h-8 text-xs w-[150px]">
              <option value="all">Tất cả</option>
              {DEPT_STATS.map(d => <option key={d.dept} value={d.dept}>{d.dept}</option>)}
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />Cập nhật
            </Button>
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => showToast('Đang xuất Excel...')}>
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1 text-emerald-600" />Xuất Excel
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => showToast('Đang xuất PDF...')}>
          <Download className="h-3.5 w-3.5 mr-1 text-rose-600" />Xuất PDF
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5 mr-1 text-slate-500" />In
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng cuộc họp', value: totalMeetings, sub: 'YTD 2026', color: 'text-blue-700', bg: 'bg-blue-50', icon: <Calendar className="h-5 w-5 text-blue-400" /> },
          { label: 'Hoàn thành',    value: totalCompleted, sub: `${Math.round(totalCompleted/totalMeetings*100)}% tổng`, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
          { label: 'Đã hủy',        value: totalCancelled, sub: `${Math.round(totalCancelled/totalMeetings*100)}% tổng`, color: 'text-rose-700', bg: 'bg-rose-50', icon: <X className="h-5 w-5 text-rose-400" /> },
          { label: 'Tỷ lệ tham dự', value: `${ATTENDANCE_SUMMARY.attendRate}%`, sub: `${ATTENDANCE_SUMMARY.attended}/${ATTENDANCE_SUMMARY.totalInvited}`, color: 'text-amber-700', bg: 'bg-amber-50', icon: <Users className="h-5 w-5 text-amber-400" /> },
        ].map(k => (
          <div key={k.label} className={cn('rounded-2xl border border-slate-200 p-4 flex items-center gap-3', k.bg)}>
            <div className="shrink-0">{k.icon}</div>
            <div>
              <div className={cn('text-2xl font-black', k.color)}>{k.value}</div>
              <div className="text-xs font-semibold text-slate-600">{k.label}</div>
              <div className="text-[10px] text-slate-400">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span className="font-bold text-slate-900 text-sm">Cuộc họp theo tháng (2026)</span>
          <div className="flex items-center gap-3 ml-auto text-[10px]">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-500" />Tổng</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-400" />Hủy</span>
          </div>
        </div>
        <BarChart
          data={MONTHLY_STATS.map(m => ({ label: m.month, value: m.total, value2: m.cancelled }))}
          maxVal={maxMonthly + 2}
          colorClass="bg-blue-500" />
      </div>

      {/* Dept & Type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* By dept */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-slate-900 text-sm">Theo phòng ban</span>
          </div>
          <BarChart
            data={DEPT_STATS.map(d => ({ label: d.dept, value: d.count }))}
            maxVal={maxDept + 2}
            colorClass="bg-indigo-500" />
        </div>

        {/* By type - Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-slate-900 text-sm">Theo loại cuộc họp</span>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart segments={TYPE_STATS.map(t => ({ value: t.count, color: t.color, label: t.type }))} />
            <div className="space-y-1.5 flex-1 min-w-0">
              {TYPE_STATS.map(t => (
                <div key={t.type} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-slate-600 truncate flex-1">{t.type}</span>
                  <span className="font-bold text-slate-800">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="font-bold text-slate-900 text-sm">Tỷ lệ tham dự</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Được mời',    value: ATTENDANCE_SUMMARY.totalInvited, color: 'text-slate-700', dot: 'bg-slate-400' },
            { label: 'Có mặt',      value: ATTENDANCE_SUMMARY.attended,     color: 'text-emerald-700', dot: 'bg-emerald-500' },
            { label: 'Vắng mặt',   value: ATTENDANCE_SUMMARY.absent,       color: 'text-rose-700',    dot: 'bg-rose-500' },
            { label: 'Xin phép',    value: ATTENDANCE_SUMMARY.excused,      color: 'text-amber-700',   dot: 'bg-amber-500' },
            { label: 'Chưa phản hồi',value: ATTENDANCE_SUMMARY.pending,    color: 'text-slate-500',   dot: 'bg-slate-300' },
          ].map(k => (
            <div key={k.label} className="text-center">
              <div className={cn('text-xl font-black', k.color)}>{k.value}</div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
                <span className={cn('h-1.5 w-1.5 rounded-full', k.dot)} />{k.label}
              </div>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="h-4 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 transition-all" style={{ width: `${(ATTENDANCE_SUMMARY.attended/ATTENDANCE_SUMMARY.totalInvited)*100}%` }} />
          <div className="bg-rose-400 transition-all" style={{ width: `${(ATTENDANCE_SUMMARY.absent/ATTENDANCE_SUMMARY.totalInvited)*100}%` }} />
          <div className="bg-amber-400 transition-all" style={{ width: `${(ATTENDANCE_SUMMARY.excused/ATTENDANCE_SUMMARY.totalInvited)*100}%` }} />
          <div className="bg-slate-200 flex-1" />
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded" />Có mặt</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-rose-400 rounded" />Vắng</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-400 rounded" />Xin phép</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-slate-200 rounded" />Chưa phản hồi</span>
        </div>
      </div>

      {/* Room usage */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-4 w-4 text-amber-500" />
          <span className="font-bold text-slate-900 text-sm">Tỷ lệ sử dụng phòng họp</span>
        </div>
        <div className="space-y-3">
          {ROOM_USAGE.map(r => (
            <div key={r.room} className="flex items-center gap-3">
              <div className="text-xs text-slate-600 w-40 shrink-0 truncate">{r.room}</div>
              <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700',
                  r.utilPct >= 70 ? 'bg-rose-500' : r.utilPct >= 50 ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${r.utilPct}%` }} />
              </div>
              <div className="text-xs text-slate-500 w-20 shrink-0 text-right">
                <span className="font-bold text-slate-800">{r.utilPct}%</span> · {r.bookings} lần
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded" />&lt;50%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-500 rounded" />50–70%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-rose-500 rounded" />&gt;70% quá tải</span>
        </div>
      </div>
    </div>
  );
}

// ─── ALERTS TAB ────────────────────────────────────────────────
function AlertsTab() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = ADMIN_ALERTS.filter(a => !dismissed.has(a.id));

  const SEV_CONFIG = {
    high:   { bg: 'bg-rose-50 border-rose-200',   label: 'bg-rose-500 text-white',   text: 'text-rose-800',   badge: 'Cao'    },
    medium: { bg: 'bg-amber-50 border-amber-200', label: 'bg-amber-500 text-white',  text: 'text-amber-800', badge: 'Trung bình' },
    low:    { bg: 'bg-blue-50 border-blue-200',   label: 'bg-blue-400 text-white',   text: 'text-blue-800',  badge: 'Thấp'   },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">Cảnh báo quản trị</h3>
          <p className="text-xs text-slate-500 mt-0.5">Hiển thị cho Admin / BGH / Hành chính</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1 text-rose-700 font-semibold"><span className="h-2 w-2 bg-rose-500 rounded-full" />{visible.filter(a => a.severity === 'high').length} cao</span>
          <span className="flex items-center gap-1 text-amber-700 font-semibold"><span className="h-2 w-2 bg-amber-500 rounded-full" />{visible.filter(a => a.severity === 'medium').length} trung bình</span>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-12 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
          <div className="text-emerald-700 font-semibold">Không có cảnh báo nào</div>
          <div className="text-sm text-emerald-600">Hệ thống đang hoạt động bình thường</div>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(alert => {
            const cfg = SEV_CONFIG[alert.severity];
            return (
              <div key={alert.id} className={cn('flex items-start gap-4 p-4 rounded-xl border shadow-sm', cfg.bg)}>
                <div className="text-2xl shrink-0">{alert.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', cfg.label)}>{cfg.badge}</span>
                    <span className={cn('font-bold text-sm', cfg.text)}>{alert.title}</span>
                  </div>
                  <p className={cn('text-xs leading-relaxed', cfg.text, 'opacity-80')}>{alert.detail}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={cn('text-lg font-black', cfg.text)}>{alert.count}</div>
                  <button onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
                    className="text-[10px] text-slate-400 hover:text-slate-600 underline">
                    Bỏ qua
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dismissed.size > 0 && (
        <button className="text-xs text-slate-400 hover:text-blue-600 underline"
          onClick={() => setDismissed(new Set())}>
          Hiển thị lại {dismissed.size} cảnh báo đã bỏ qua
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
const SUB_TABS = [
  { id: 'notifs',   label: 'Thông báo',   icon: Bell      },
  { id: 'reminder', label: 'Nhắc lịch',   icon: BellRing  },
  { id: 'report',   label: 'Báo cáo',     icon: BarChart3 },
  { id: 'alerts',   label: 'Cảnh báo',    icon: AlertTriangle },
] as const;
type SubTabId = (typeof SUB_TABS)[number]['id'];

export default function MeetingReportsPanel() {
  const [activeTab, setActiveTab] = useState<SubTabId>('alerts');
  const unreadCount = MEETING_NOTIFS.filter(n => n.status === 'unread').length;
  const alertCount = ADMIN_ALERTS.filter(a => a.severity === 'high').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Thông báo, Nhắc lịch & Báo cáo</h2>
          <p className="text-sm text-slate-500">Quản lý thông báo, cấu hình nhắc lịch và xem báo cáo thống kê</p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-1">
        {SUB_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn(
                'relative flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
                activeTab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700',
              )}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
              {t.id === 'notifs' && unreadCount > 0 && (
                <span className="ml-0.5 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">{unreadCount}</span>
              )}
              {t.id === 'alerts' && alertCount > 0 && (
                <span className="ml-0.5 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">{alertCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'notifs'   && <NotifTab />}
      {activeTab === 'reminder' && <ReminderTab />}
      {activeTab === 'report'   && <ReportTab />}
      {activeTab === 'alerts'   && <AlertsTab />}
    </div>
  );
}
