'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar, Clock, MapPin, Users, Video, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, ClockIcon, Eye, FileText,
  Paperclip, MoreHorizontal, UserCheck, Bell, Filter, Search,
  CalendarDays, List, RefreshCw, Zap, Check, X, MessageSquare, Plus,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  Meeting, MeetingStatus, ResponseStatus, MeetingType,
  MEETINGS, MEETING_ROOMS,
} from '@/src/mockData/meetings';
import CreateMeetingForm from './CreateMeetingForm';

// ─── Status config ──────────────────────────────────────────────
const STATUS_CONFIG: Record<MeetingStatus, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  'Sắp diễn ra':       { label: 'Sắp diễn ra',       color: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-500',    icon: <ClockIcon className="h-3 w-3" /> },
  'Đang diễn ra':      { label: 'Đang diễn ra',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: <Zap className="h-3 w-3" /> },
  'Đã hoàn thành':     { label: 'Hoàn thành',         color: 'bg-slate-100 text-slate-600 border-slate-200',  dot: 'bg-slate-400',   icon: <CheckCircle2 className="h-3 w-3" /> },
  'Đã hủy':            { label: 'Đã hủy',             color: 'bg-rose-100 text-rose-700 border-rose-200',    dot: 'bg-rose-500',    icon: <XCircle className="h-3 w-3" /> },
  'Chờ duyệt phòng':   { label: 'Chờ duyệt phòng',   color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500',   icon: <AlertCircle className="h-3 w-3" /> },
  'Từ chối đặt phòng': { label: 'Từ chối phòng',      color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', icon: <XCircle className="h-3 w-3" /> },
};

const RESPONSE_CONFIG: Record<ResponseStatus, { label: string; color: string }> = {
  'Chưa phản hồi': { label: 'Chưa phản hồi', color: 'bg-slate-100 text-slate-500' },
  'Tham dự':       { label: 'Tham dự',        color: 'bg-emerald-100 text-emerald-700' },
  'Vắng mặt':      { label: 'Vắng mặt',       color: 'bg-rose-100 text-rose-700' },
  'Xin phép vắng': { label: 'Xin phép vắng',  color: 'bg-amber-100 text-amber-700' },
};

const TYPE_COLORS: Record<MeetingType, string> = {
  'Họp cá nhân':    'bg-sky-50 text-sky-700 border-sky-200',
  'Họp phòng ban':  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Họp toàl trường':'bg-purple-50 text-purple-700 border-purple-200',
  'Họp BGH':        'bg-rose-50 text-rose-700 border-rose-200',
  'Họp chuyên môn': 'bg-teal-50 text-teal-700 border-teal-200',
} as Record<MeetingType, string>;

// ─── Helpers ────────────────────────────────────────────────────
function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
}
function minutesUntil(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}
function avatarBg(name: string) {
  const colors = ['bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-indigo-500','bg-teal-500','bg-purple-500'];
  return colors[name.charCodeAt(0) % colors.length];
}

// ─── KPI Card ───────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub }: {
  label: string; value: number; icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div className={cn('rounded-xl border p-4 flex items-start gap-3 bg-white shadow-sm', color)}>
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="text-xs font-medium text-slate-600 leading-tight">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Meeting Card ───────────────────────────────────────────────
function MeetingCard({ meeting, onRespond }: {
  meeting: Meeting;
  onRespond: (id: string, resp: ResponseStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [responding, setResponding] = useState(false);
  const sc = STATUS_CONFIG[meeting.status];
  const rc = RESPONSE_CONFIG[meeting.myResponseStatus];
  const minsLeft = minutesUntil(meeting.startTime);
  const isAlert = meeting.status === 'Sắp diễn ra' && minsLeft > 0 && minsLeft <= 30;
  const confirmed = meeting.participants.filter(p => p.response === 'Tham dự').length;
  const total = meeting.participants.length;

  return (
    <div className={cn(
      'rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md',
      isAlert && 'border-amber-400 ring-1 ring-amber-300',
      meeting.status === 'Đang diễn ra' && 'border-emerald-300 ring-1 ring-emerald-200',
      meeting.status === 'Đã hủy' && 'opacity-60',
    )}>
      {/* Alert bar */}
      {isAlert && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-b border-amber-200 rounded-t-xl text-amber-700 text-xs font-semibold">
          <Bell className="h-3 w-3 animate-pulse" />
          Sắp diễn ra trong {minsLeft} phút!
        </div>
      )}
      {meeting.status === 'Đang diễn ra' && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border-b border-emerald-200 rounded-t-xl text-emerald-700 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Đang diễn ra
        </div>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Time column */}
          <div className="text-center min-w-[48px] flex flex-col items-center">
            <div className="text-sm font-bold text-slate-900">{fmt(meeting.startTime)}</div>
            <div className="text-[10px] text-slate-400">–</div>
            <div className="text-xs text-slate-500">{fmt(meeting.endTime)}</div>
            <div className="text-[10px] text-slate-400 mt-1">{fmtDate(meeting.startTime)}</div>
          </div>

          {/* Left divider */}
          <div className={cn('w-0.5 self-stretch rounded-full mt-1', sc.dot)} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', TYPE_COLORS[meeting.meetingType] ?? 'bg-slate-100 text-slate-600')}>
                {meeting.meetingType}
              </span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1', sc.color)}>
                {sc.icon}{sc.label}
              </span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', rc.color)}>
                {rc.label}
              </span>
              {meeting.minutesStatus === 'Chưa có' && meeting.status === 'Đã hoàn thành' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  Chưa có biên bản
                </span>
              )}
              {meeting.changedAt && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                  <RefreshCw className="h-2.5 w-2.5" />Đã thay đổi
                </span>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5 line-clamp-2">
              {meeting.title}
            </h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0', avatarBg(meeting.hostName))}>
                  {meeting.hostAvatar}
                </div>
                {meeting.hostName}
              </span>
              {meeting.roomName ? (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meeting.roomName}</span>
              ) : meeting.isOnline ? (
                <span className="flex items-center gap-1 text-blue-600"><Video className="h-3 w-3" />Online</span>
              ) : null}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {confirmed}/{total} tham dự
              </span>
              {meeting.attachments.length > 0 && (
                <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />{meeting.attachments.length} tài liệu</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {/* Description */}
            {meeting.description && (
              <p className="text-xs text-slate-600 leading-relaxed">{meeting.description}</p>
            )}

            {/* Agenda */}
            {meeting.agenda.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">Chương trình họp</div>
                <ol className="space-y-1">
                  {meeting.agenda.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="shrink-0 h-4 w-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Participants preview */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                Người tham gia ({meeting.participants.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.slice(0, 6).map(p => (
                  <div key={p.id} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1 border border-slate-200">
                    <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white', avatarBg(p.name))}>
                      {p.avatarInitials}
                    </div>
                    <span className="text-[11px] text-slate-700">{p.name}</span>
                    <span className={cn('text-[9px] font-semibold px-1 rounded', RESPONSE_CONFIG[p.response].color)}>
                      {p.response === 'Tham dự' ? '✓' : p.response === 'Vắng mặt' ? '✗' : p.response === 'Xin phép vắng' ? '~' : '?'}
                    </span>
                  </div>
                ))}
                {meeting.participants.length > 6 && (
                  <div className="flex items-center justify-center bg-slate-100 rounded-lg px-2 py-1 text-[11px] text-slate-500 border border-slate-200">
                    +{meeting.participants.length - 6} người khác
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {meeting.attachments.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">Tài liệu đính kèm</div>
                <div className="flex flex-wrap gap-2">
                  {meeting.attachments.map(a => (
                    <a key={a.id} href={a.url}
                      className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-3 py-1.5 text-xs border border-blue-200 transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      {a.name}
                      <span className="text-[10px] text-blue-400">({a.sizeMb}MB)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Online link */}
            {meeting.isOnline && meeting.onlineUrl && (
              <a href={meeting.onlineUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Video className="h-3.5 w-3.5" />
                Tham gia Zoom
              </a>
            )}

            {/* Minutes */}
            {meeting.status === 'Đã hoàn thành' && (
              <div className="flex items-center gap-2 text-xs">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-600">Biên bản:</span>
                <span className={cn('font-semibold',
                  meeting.minutesStatus === 'Đã hoàn thành' ? 'text-emerald-600' :
                  meeting.minutesStatus === 'Đang soạn' ? 'text-amber-600' : 'text-rose-600'
                )}>
                  {meeting.minutesStatus}
                </span>
                {meeting.minutesStatus === 'Đã hoàn thành' && (
                  <button className="text-blue-600 underline hover:text-blue-800">Xem biên bản</button>
                )}
              </div>
            )}

            {/* Cancel reason */}
            {meeting.status === 'Đã hủy' && meeting.cancelReason && (
              <div className="flex items-start gap-2 bg-rose-50 rounded-lg p-3 text-xs text-rose-700 border border-rose-200">
                <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div><span className="font-semibold">Lý do hủy:</span> {meeting.cancelReason}</div>
              </div>
            )}

            {/* Response actions */}
            {(meeting.status === 'Sắp diễn ra' || meeting.status === 'Đang diễn ra' || meeting.status === 'Chờ duyệt phòng') && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Phản hồi:</span>
                {!responding ? (
                  <>
                    {meeting.myResponseStatus !== 'Tham dự' && (
                      <Button size="sm" variant="outline"
                        className="h-7 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => { onRespond(meeting.id, 'Tham dự'); setResponding(true); setTimeout(() => setResponding(false), 1500); }}
                      >
                        <Check className="h-3 w-3 mr-1" />Tham dự
                      </Button>
                    )}
                    {meeting.myResponseStatus !== 'Xin phép vắng' && (
                      <Button size="sm" variant="outline"
                        className="h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                        onClick={() => { onRespond(meeting.id, 'Xin phép vắng'); setResponding(true); setTimeout(() => setResponding(false), 1500); }}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />Xin phép vắng
                      </Button>
                    )}
                    {meeting.myResponseStatus !== 'Vắng mặt' && (
                      <Button size="sm" variant="outline"
                        className="h-7 text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                        onClick={() => { onRespond(meeting.id, 'Vắng mặt'); setResponding(true); setTimeout(() => setResponding(false), 1500); }}
                      >
                        <X className="h-3 w-3 mr-1" />Vắng mặt
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />Đã ghi nhận phản hồi
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Week Calendar strip ─────────────────────────────────────────
function WeekStrip({ selectedDate, onSelect }: { selectedDate: string; onSelect: (d: string) => void }) {
  const base = new Date('2026-07-04');
  // Find Monday of current week
  const monday = new Date(base);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayNames = ['T2','T3','T4','T5','T6','T7','CN'];

  return (
    <div className="flex gap-1">
      {days.map((d, i) => {
        const iso = d.toISOString().split('T')[0];
        const isSelected = iso === selectedDate;
        const isToday = iso === '2026-07-04';
        const hasMeetings = MEETINGS.some(m => m.startTime.startsWith(iso));
        return (
          <button key={iso} onClick={() => onSelect(iso)}
            className={cn(
              'flex-1 flex flex-col items-center py-2 rounded-xl transition-all text-xs font-medium',
              isSelected ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-100 text-slate-600',
              isToday && !isSelected && 'ring-2 ring-blue-300',
            )}
          >
            <span className="text-[10px] opacity-70">{dayNames[i]}</span>
            <span className="text-sm font-bold">{d.getDate()}</span>
            {hasMeetings && (
              <span className={cn('h-1 w-1 rounded-full mt-0.5', isSelected ? 'bg-white' : 'bg-blue-500')} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────
export default function MeetingDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [view, setView] = useState<'week' | 'day' | 'list'>('week');
  const [selectedDate, setSelectedDate] = useState('2026-07-04');
  const [meetings, setMeetings] = useState<Meeting[]>(MEETINGS);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleMeetingCreated = (meeting: Partial<Meeting>, isDraft: boolean) => {
    setMeetings(prev => [meeting as Meeting, ...prev]);
    setShowCreate(false);
    showToast(
      isDraft
        ? `Đã lưu nháp: "${meeting.title}"`
        : `Đã tạo và gửi thư mời: "${meeting.title}"`,
      isDraft ? 'info' : 'success'
    );
  };

  const kpi = useMemo(() => ({
    todayTotal: meetings.filter(m => m.startTime.startsWith('2026-07-04')).length,
    upcoming: meetings.filter(m => m.status === 'Sắp diễn ra').length,
    ongoing: meetings.filter(m => m.status === 'Đang diễn ra').length,
    pending: meetings.filter(m => m.status === 'Chờ duyệt phòng').length,
    completed: meetings.filter(m => m.status === 'Đã hoàn thành').length,
    cancelled: meetings.filter(m => m.status === 'Đã hủy').length,
    unconfirmed: meetings.filter(m => m.myResponseStatus === 'Chưa phản hồi' && m.status !== 'Đã hủy' && m.status !== 'Đã hoàn thành').length,
    noMinutes: meetings.filter(m => m.status === 'Đã hoàn thành' && m.minutesStatus === 'Chưa có').length,
  }), [meetings]);

  const filtered = useMemo(() => {
    let list = meetings;
    if (view === 'day' || view === 'week') {
      if (view === 'day') list = list.filter(m => m.startTime.startsWith(selectedDate));
      // week: show selected week (Mon-Sun of selectedDate's week)
    }
    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.hostName.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') list = list.filter(m => m.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter(m => m.meetingType === typeFilter);
    if (roomFilter !== 'all') list = list.filter(m => m.roomId === roomFilter);
    return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [meetings, search, statusFilter, typeFilter, roomFilter, view, selectedDate]);

  const handleRespond = (id: string, resp: ResponseStatus) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, myResponseStatus: resp } : m));
  };

  // Alerts
  const alerts = useMemo(() => {
    const res: { type: 'warning' | 'error' | 'info'; msg: string }[] = [];
    if (kpi.unconfirmed > 0) res.push({ type: 'warning', msg: `${kpi.unconfirmed} cuộc họp chưa xác nhận tham dự` });
    if (kpi.noMinutes > 0) res.push({ type: 'info', msg: `${kpi.noMinutes} cuộc họp đã xong nhưng chưa có biên bản` });
    meetings.filter(m => m.status === 'Sắp diễn ra').forEach(m => {
      const mins = minutesUntil(m.startTime);
      if (mins > 0 && mins <= 30) res.push({ type: 'warning', msg: `"${m.title}" bắt đầu trong ${mins} phút` });
    });
    return res;
  }, [kpi, meetings]);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fade-in',
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'
        )}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast.msg}
        </div>
      )}
      {/* Create form modal */}
      {showCreate && (
        <CreateMeetingForm
          onClose={() => setShowCreate(false)}
          onCreated={handleMeetingCreated}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard lịch họp</h1>
          <p className="text-sm text-slate-500">Theo dõi lịch họp cá nhân, phòng ban và toàn trường</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />Tạo lịch họp
          </Button>
          <Button size="sm" variant="outline">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />Đặt phòng
          </Button>
          <Button size="sm" variant="outline">
            <FileText className="h-3.5 w-3.5 mr-1.5" />Xuất lịch
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={cn(
              'flex items-start gap-2 rounded-xl px-4 py-2.5 text-sm border',
              a.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              a.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            )}>
              <Bell className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{a.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard label="Họp hôm nay" value={kpi.todayTotal} color="border-blue-200"
          icon={<Calendar className="h-5 w-5 text-blue-500" />} />
        <KpiCard label="Sắp diễn ra" value={kpi.upcoming} color="border-blue-200"
          icon={<ClockIcon className="h-5 w-5 text-blue-600" />}
          sub={kpi.unconfirmed > 0 ? `${kpi.unconfirmed} chưa xác nhận` : undefined} />
        <KpiCard label="Đang diễn ra" value={kpi.ongoing} color="border-emerald-200"
          icon={<Zap className="h-5 w-5 text-emerald-500" />} />
        <KpiCard label="Chờ duyệt phòng" value={kpi.pending} color="border-amber-200"
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Đã hoàn thành" value={kpi.completed} color="border-slate-200"
          icon={<CheckCircle2 className="h-5 w-5 text-slate-400" />}
          sub={kpi.noMinutes > 0 ? `${kpi.noMinutes} chưa có biên bản` : undefined} />
        <KpiCard label="Đã hủy" value={kpi.cancelled} color="border-rose-200"
          icon={<XCircle className="h-5 w-5 text-rose-400" />} />
        <KpiCard label="Chưa xác nhận" value={kpi.unconfirmed} color="border-amber-200"
          icon={<UserCheck className="h-5 w-5 text-amber-500" />} />
        <KpiCard label="Thiếu biên bản" value={kpi.noMinutes} color="border-orange-200"
          icon={<FileText className="h-5 w-5 text-orange-400" />} />
      </div>

      {/* View switcher + Week strip */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {([['day','Ngày'],['week','Tuần'],['list','Danh sách']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1.5 text-xs font-semibold transition-colors',
                  view === v ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                )}>
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {view === 'day' ? `Ngày ${selectedDate}` : view === 'week' ? 'Tuần 04–10/07/2026' : `${filtered.length} cuộc họp`}
          </span>
        </div>

        {(view === 'week' || view === 'day') && (
          <WeekStrip selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setView('day'); }} />
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm cuộc họp, chủ trì..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm" />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 w-[160px] text-sm">
            <option value="all">Tất cả trạng thái</option>
            {(['Sắp diễn ra','Đang diễn ra','Đã hoàn thành','Đã hủy','Chờ duyệt phòng','Từ chối đặt phòng'] as MeetingStatus[]).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 w-[160px] text-sm">
            <option value="all">Tất cả loại họp</option>
            {(['Họp cá nhân','Họp phòng ban','Họp toàn trường','Họp BGH','Họp chuyên môn'] as MeetingType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="h-9 w-[150px] text-sm">
            <option value="all">Tất cả phòng</option>
            {MEETING_ROOMS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
          {(search || statusFilter !== 'all' || typeFilter !== 'all' || roomFilter !== 'all') && (
            <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); setRoomFilter('all'); }}
              className="h-9 text-xs text-slate-500">
              <X className="h-3.5 w-3.5 mr-1" />Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Meeting list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <div className="font-medium">Không có cuộc họp nào</div>
          <div className="text-xs mt-1">Thử thay đổi bộ lọc hoặc chọn ngày khác</div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Group by date */}
          {Array.from(new Set(filtered.map(m => m.startTime.split('T')[0]))).map(date => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{filtered.filter(m => m.startTime.startsWith(date)).length} cuộc họp</span>
              </div>
              <div className="space-y-2">
                {filtered.filter(m => m.startTime.startsWith(date)).map(m => (
                  <MeetingCard key={m.id} meeting={m} onRespond={handleRespond} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
