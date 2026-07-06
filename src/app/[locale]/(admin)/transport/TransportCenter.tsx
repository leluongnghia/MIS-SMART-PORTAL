'use client';

import React, { useState, useMemo } from 'react';
import {
  Bus, MapPin, Users, AlertTriangle, CheckCircle2, Clock,
  Plus, Search, X, ChevronRight, Phone, User, FileText,
  Bell, BarChart3, Zap, Edit3, Shield, ArrowRight,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MOCK_ROUTES, MOCK_STUDENTS, MOCK_ATTENDANCE, MOCK_INCIDENTS,
  MOCK_STAFF, TransportRoute, TransportStudent, AttendanceRecord, TransportIncident,
  RouteStatus, BoardStatus, IncidentType, IncidentSeverity, IncidentStatus,
  ROUTE_STATUS, BOARD_STATUS, INCIDENT_TYPE, SEVERITY, INCIDENT_STATUS,
} from '@/src/mockData/transport';

// ─── Helpers ──────────────────────────────────────────────────
function fmtDt(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ─── Generic badge ────────────────────────────────────────────
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', color)}>{children}</span>;
}

// ─── Toast ────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };
  const el = msg ? (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium">
      <CheckCircle2 className="h-4 w-4 shrink-0" />{msg}
    </div>
  ) : null;
  return { show, el };
}

// ─── Dashboard Tab ────────────────────────────────────────────
function DashboardTab({ routes, attendance, incidents }: {
  routes: TransportRoute[];
  attendance: AttendanceRecord[];
  incidents: TransportIncident[];
}) {
  const activeRoutes = routes.filter(r => r.status === 'active');
  const totalStudents = routes.reduce((s, r) => s + r.studentCount, 0);
  const boardedTotal = attendance.filter(a => a.status === 'boarded').length;
  const alightedTotal = attendance.filter(a => a.status === 'alighted').length;
  const lateRoutes = incidents.filter(i => i.type === 'traffic' && i.status !== 'resolved').length;
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;

  const kpis = [
    { label: 'Tổng số tuyến', value: routes.length, icon: MapPin, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'HS đăng ký', value: totalStudents, icon: Users, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { label: 'Xe đang chạy', value: activeRoutes.length, icon: Bus, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'HS đã lên xe', value: boardedTotal, icon: CheckCircle2, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    { label: 'HS đã xuống xe', value: alightedTotal, icon: ArrowRight, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Tuyến trễ giờ', value: lateRoutes, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Sự cố đang xử lý', value: openIncidents, icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  ];

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={cn('rounded-2xl border p-4 text-center', k.bg, k.border)}>
            <k.icon className={cn('h-5 w-5 mx-auto mb-1', k.color)} />
            <div className={cn('text-2xl font-black', k.color)}>{k.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Route status list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Bus className="h-4 w-4 text-blue-500" />Tình trạng tuyến xe hôm nay
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {routes.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <Bus className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{r.code}</span>
                    <span className="text-sm font-semibold text-slate-900 truncate">{r.name}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{r.driverName} · {r.plate}</div>
                </div>
                <div className="text-right shrink-0">
                  <Badge color={ROUTE_STATUS[r.status].color}>{ROUTE_STATUS[r.status].label}</Badge>
                  <div className="text-xs text-slate-400 mt-0.5">{r.boardedCount}/{r.studentCount} HS</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open incidents */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-rose-500" />Sự cố cần xử lý
            </div>
            {incidents.filter(i => i.status !== 'resolved').length > 0 && (
              <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                {incidents.filter(i => i.status !== 'resolved').length} đang mở
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {incidents.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Không có sự cố</div>
            ) : incidents.map(inc => (
              <div key={inc.id} className="px-5 py-3 flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{INCIDENT_TYPE[inc.type].icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">{inc.routeName}</span>
                    <Badge color={SEVERITY[inc.severity].color}>{SEVERITY[inc.severity].label}</Badge>
                    <Badge color={INCIDENT_STATUS[inc.status].color}>{INCIDENT_STATUS[inc.status].label}</Badge>
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-1">{inc.description}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{fmtDt(inc.occurredAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications preview */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 font-bold mb-2"><Bell className="h-4 w-4" />Thông báo phụ huynh tự động</div>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-blue-100">
          {['✅ HS đã lên xe', '✅ HS đã xuống xe', '⏰ Xe đến muộn', '⚠️ HS chưa thấy tại điểm đón', '🔔 Xe đổi tuyến', '🚨 Sự cố trên tuyến'].map(n => (
            <div key={n} className="bg-white/10 rounded-lg px-3 py-1.5">{n}</div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-blue-200">Gửi qua: Hệ thống · Email · Zalo (khi tích hợp)</div>
      </div>
    </div>
  );
}

// ─── Routes Tab ───────────────────────────────────────────────
function RoutesTab({ routes, onUpdate }: { routes: TransportRoute[]; onUpdate: (r: TransportRoute) => void }) {
  const [selected, setSelected] = useState<TransportRoute | null>(null);
  const { show, el } = useToast();

  const toggleStatus = (route: TransportRoute) => {
    const next: RouteStatus = route.status === 'active' ? 'paused' : 'active';
    onUpdate({ ...route, status: next });
    show(`Tuyến ${route.code}: ${ROUTE_STATUS[next].label}`);
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{routes.length} tuyến đang quản lý</div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
          <Plus className="h-3.5 w-3.5" />Thêm tuyến
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {routes.map(r => (
          <div key={r.id} className={cn('bg-white rounded-2xl border shadow-sm overflow-hidden',
            selected?.id === r.id ? 'border-blue-400 shadow-blue-100' : 'border-slate-200')}>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-slate-800 text-white px-2 py-0.5 rounded">{r.code}</span>
                <Badge color={ROUTE_STATUS[r.status].color}>{ROUTE_STATUS[r.status].label}</Badge>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setSelected(selected?.id === r.id ? null : r)}
                  className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                  {selected?.id === r.id ? 'Thu gọn' : 'Chi tiết'}
                </button>
                <button onClick={() => toggleStatus(r)}
                  className={cn('text-xs px-2 py-1 rounded-lg border transition-colors',
                    r.status === 'active' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100')}>
                  {r.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                </button>
              </div>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="font-bold text-slate-900">{r.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-400" />{r.area}</div>
                <div className="flex items-center gap-1.5">
                  <div className="px-1.5 py-0.5 bg-yellow-300 text-yellow-900 font-bold rounded text-[10px]">{r.plate}</div>
                </div>
                <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-slate-400" />{r.driverName}</div>
                <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" />{r.driverPhone}</div>
                <div className="flex items-center gap-1.5 col-span-2"><Users className="h-3 w-3 text-slate-400" />Phụ xe: {r.assistantName}</div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">{r.studentCount} HS</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">{r.boardedCount} đã lên</span>
                <span className="text-slate-400">{r.stops.length} điểm dừng</span>
              </div>
            </div>

            {/* Stops detail */}
            {selected?.id === r.id && r.stops.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                <div className="text-xs font-semibold text-slate-600 mb-2">Các điểm dừng</div>
                <div className="space-y-1.5">
                  {r.stops.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-700">{s.name}</div>
                        <div className="text-slate-400">{s.address}</div>
                      </div>
                      <div className="text-right text-slate-500 shrink-0">
                        <div>Đón: {s.pickupTime}</div>
                        <div>Trả: {s.dropoffTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────
function StudentsTab({ students, routes }: { students: TransportStudent[]; routes: TransportRoute[] }) {
  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { show, el } = useToast();

  const filtered = useMemo(() => students.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.className.toLowerCase().includes(search.toLowerCase())) return false;
    if (routeFilter !== 'all' && s.routeId !== routeFilter) return false;
    if (statusFilter !== 'all' && s.regStatus !== statusFilter) return false;
    return true;
  }), [students, search, routeFilter, statusFilter]);

  const REG_STATUS: Record<string, { label: string; color: string }> = {
    active:    { label: 'Đang đi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    paused:    { label: 'Tạm dừng', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    cancelled: { label: 'Hủy dịch vụ', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm tên, lớp..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
        </div>
        <Select value={routeFilter} onChange={e => setRouteFilter(e.target.value)} className="h-10 text-sm w-[180px]">
          <option value="all">Tất cả tuyến</option>
          {routes.map(r => <option key={r.id} value={r.id}>{r.code}</option>)}
        </Select>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 text-sm w-[150px]">
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang đi</option>
          <option value="paused">Tạm dừng</option>
          <option value="cancelled">Hủy dịch vụ</option>
        </Select>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-10">
          <Plus className="h-3.5 w-3.5" />Đăng ký mới
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Học sinh</th>
                <th className="px-4 py-3 text-left font-bold">Tuyến xe</th>
                <th className="px-4 py-3 text-left font-bold">Điểm đón/trả</th>
                <th className="px-4 py-3 text-left font-bold">Phụ huynh</th>
                <th className="px-4 py-3 text-left font-bold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Không tìm thấy học sinh</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.className}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-slate-700">{s.routeName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div>Đón: {s.pickupStop}</div>
                    <div>Trả: {s.dropoffStop}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="text-slate-700">{s.parentName}</div>
                    <div className="text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" />{s.parentPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={REG_STATUS[s.regStatus]?.color || ''}>{REG_STATUS[s.regStatus]?.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => show(`Đang chỉnh sửa HS ${s.name}`)}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200">
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────
function AttendanceTab({ attendance, routes, onUpdate }: {
  attendance: AttendanceRecord[];
  routes: TransportRoute[];
  onUpdate: (a: AttendanceRecord) => void;
}) {
  const [routeFilter, setRouteFilter] = useState('all');
  const [dirFilter, setDirFilter] = useState<'pickup' | 'dropoff' | 'all'>('all');
  const [noteModal, setNoteModal] = useState<AttendanceRecord | null>(null);
  const [noteText, setNoteText] = useState('');
  const { show, el } = useToast();

  const filtered = useMemo(() =>
    attendance.filter(a =>
      (routeFilter === 'all' || a.routeId === routeFilter) &&
      (dirFilter === 'all' || a.direction === dirFilter)
    ), [attendance, routeFilter, dirFilter]);

  const updateStatus = (rec: AttendanceRecord, status: BoardStatus) => {
    const updated: AttendanceRecord = {
      ...rec, status,
      checkinTime: status === 'absent' || status === 'parent_pickup' || status === 'no_show'
        ? null : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdate(updated);
    show(`${rec.studentName}: ${BOARD_STATUS[status].label}`);
  };

  const today = new Date().toLocaleDateString('vi-VN');
  const boarded = filtered.filter(a => a.status === 'boarded').length;
  const absent = filtered.filter(a => a.status === 'absent').length;

  return (
    <div className="space-y-4">
      {el}
      {noteModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setNoteModal(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-5 shadow-2xl w-80">
            <div className="font-bold text-slate-900 mb-2">Ghi chú — {noteModal.studentName}</div>
            <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-slate-400"
              placeholder="Ghi chú bất thường..." />
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="bg-blue-600 text-white" onClick={() => {
                onUpdate({ ...noteModal, notes: noteText });
                setNoteModal(null);
                show('Đã lưu ghi chú');
              }}>Lưu</Button>
              <Button size="sm" variant="ghost" onClick={() => setNoteModal(null)}>Hủy</Button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-700">{boarded} đã lên xe</div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-700">{absent} vắng mặt</div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-500">Hôm nay {today}</div>
        </div>
        <div className="flex gap-2">
          <Select value={routeFilter} onChange={e => setRouteFilter(e.target.value)} className="h-9 text-xs w-[160px]">
            <option value="all">Tất cả tuyến</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.code}</option>)}
          </Select>
          <Select value={dirFilter} onChange={e => setDirFilter(e.target.value as any)} className="h-9 text-xs w-[130px]">
            <option value="all">Sáng + Chiều</option>
            <option value="pickup">Sáng (Đón)</option>
            <option value="dropoff">Chiều (Trả)</option>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Học sinh</th>
                <th className="px-4 py-3 text-left font-bold">Tuyến</th>
                <th className="px-4 py-3 text-left font-bold">Ca</th>
                <th className="px-4 py-3 text-left font-bold">Giờ</th>
                <th className="px-4 py-3 text-left font-bold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-bold">Ghi chú</th>
                <th className="px-4 py-3 text-left font-bold">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">Không có dữ liệu điểm danh</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{a.studentName}</div>
                    <div className="text-xs text-slate-400">{a.className}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{a.routeName}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      a.direction === 'pickup' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200')}>
                      {a.direction === 'pickup' ? '☀️ Sáng' : '🌙 Chiều'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-700">{a.checkinTime || '—'}</td>
                  <td className="px-4 py-3"><Badge color={BOARD_STATUS[a.status].color}>{BOARD_STATUS[a.status].label}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{a.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(['boarded', 'alighted', 'absent', 'parent_pickup', 'no_show'] as BoardStatus[]).map(s => (
                        <button key={s} onClick={() => updateStatus(a, s)}
                          disabled={a.status === s}
                          className={cn('text-[9px] px-1.5 py-0.5 rounded-lg border font-semibold transition-colors',
                            a.status === s ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-default' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50')}>
                          {BOARD_STATUS[s].label}
                        </button>
                      ))}
                      <button onClick={() => { setNoteModal(a); setNoteText(a.notes); }}
                        className="text-[9px] px-1.5 py-0.5 rounded-lg border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold">
                        Ghi chú
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Incidents Tab ────────────────────────────────────────────
function IncidentsTab({ incidents, routes, onAdd, onUpdate }: {
  incidents: TransportIncident[];
  routes: TransportRoute[];
  onAdd: (i: TransportIncident) => void;
  onUpdate: (i: TransportIncident) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    routeId: '', studentName: '', type: 'late' as IncidentType,
    severity: 'medium' as IncidentSeverity, description: '', handler: '',
  });
  const { show, el } = useToast();

  const submit = () => {
    if (!form.routeId || !form.description.trim()) {
      show('Vui lòng điền đầy đủ thông tin'); return;
    }
    const route = routes.find(r => r.id === form.routeId);
    const inc: TransportIncident = {
      id: `INC${Date.now()}`, routeId: form.routeId,
      routeName: route?.name || '', studentId: null,
      studentName: form.studentName || null,
      type: form.type, severity: form.severity, description: form.description,
      handler: form.handler, status: 'open',
      occurredAt: new Date().toISOString(), resolvedAt: null, attachments: [],
    };
    onAdd(inc);
    setShowForm(false);
    setForm({ routeId: '', studentName: '', type: 'late', severity: 'medium', description: '', handler: '' });
    show('Đã ghi nhận sự cố');
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{incidents.length} sự cố — {incidents.filter(i => i.status !== 'resolved').length} đang mở</div>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-3.5 w-3.5" />Đóng</> : <><Plus className="h-3.5 w-3.5" />Báo sự cố</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
          <div className="font-semibold text-rose-900 text-sm">Ghi nhận sự cố mới</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700">Tuyến xe <span className="text-rose-500">*</span></label>
              <Select value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))} className="h-9 text-sm">
                <option value="">-- Chọn tuyến --</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.code} – {r.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Loại sự cố</label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as IncidentType }))} className="h-9 text-sm">
                {Object.entries(INCIDENT_TYPE).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Mức độ nghiêm trọng</label>
              <Select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as IncidentSeverity }))} className="h-9 text-sm">
                {Object.entries(SEVERITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Người xử lý</label>
              <Select value={form.handler} onChange={e => setForm(f => ({ ...f, handler: e.target.value }))} className="h-9 text-sm">
                <option value="">-- Chọn --</option>
                {MOCK_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Học sinh liên quan</label>
              <Input placeholder="Tên học sinh (nếu có)" value={form.studentName}
                onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-700">Mô tả <span className="text-rose-500">*</span></label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-slate-400"
                placeholder="Mô tả chi tiết sự cố..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-700" onClick={submit}>Ghi nhận sự cố</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {incidents.map(inc => (
          <div key={inc.id} className={cn('bg-white rounded-2xl border shadow-sm',
            inc.status === 'open' ? 'border-rose-200' : inc.status === 'in_progress' ? 'border-amber-200' : 'border-slate-200')}>
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base">{INCIDENT_TYPE[inc.type].icon}</span>
                <span className="font-semibold text-sm text-slate-900">{INCIDENT_TYPE[inc.type].label}</span>
                <Badge color={SEVERITY[inc.severity].color}>{SEVERITY[inc.severity].label}</Badge>
                <Badge color={INCIDENT_STATUS[inc.status].color}>{INCIDENT_STATUS[inc.status].label}</Badge>
              </div>
              <div className="flex gap-1.5">
                {inc.status !== 'resolved' && (
                  <button onClick={() => { onUpdate({ ...inc, status: inc.status === 'open' ? 'in_progress' : 'resolved', resolvedAt: inc.status === 'in_progress' ? new Date().toISOString() : null }); show('Đã cập nhật trạng thái'); }}
                    className={cn('text-xs px-2 py-1 rounded-lg border font-semibold',
                      inc.status === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')}>
                    {inc.status === 'open' ? 'Tiếp nhận' : 'Đánh dấu xong'}
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 py-3 space-y-1">
              <div className="text-sm text-slate-600">{inc.description}</div>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-1">
                <span>Tuyến: <span className="text-slate-600 font-medium">{inc.routeName}</span></span>
                {inc.studentName && <span>HS: <span className="text-slate-600 font-medium">{inc.studentName}</span></span>}
                <span>Người xử lý: <span className="text-slate-600 font-medium">{inc.handler || '—'}</span></span>
                <span>Lúc: {fmtDt(inc.occurredAt)}</span>
                {inc.resolvedAt && <span className="text-emerald-600">Xong lúc: {fmtDt(inc.resolvedAt)}</span>}
              </div>
              {inc.attachments.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {inc.attachments.map(a => (
                    <span key={a} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {incidents.length === 0 && (
          <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Không có sự cố nào</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
const TABS = [
  { id: 'dashboard',  label: 'Dashboard',      icon: BarChart3    },
  { id: 'routes',     label: 'Tuyến xe',       icon: MapPin       },
  { id: 'students',   label: 'Học sinh',       icon: Users        },
  { id: 'attendance', label: 'Điểm danh',      icon: CheckCircle2 },
  { id: 'incidents',  label: 'Sự cố',          icon: AlertTriangle},
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function TransportCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [routes, setRoutes] = useState<TransportRoute[]>(MOCK_ROUTES);
  const [students] = useState<TransportStudent[]>(MOCK_STUDENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [incidents, setIncidents] = useState<TransportIncident[]>(MOCK_INCIDENTS);

  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Xe đưa đón học sinh</h1>
          <p className="text-sm text-slate-500">Quản lý tuyến xe, điểm danh và sự cố</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">GPS Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all relative',
                activeTab === tab.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400')}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
              {tab.id === 'incidents' && openIncidents > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {openIncidents}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <DashboardTab routes={routes} attendance={attendance} incidents={incidents} />}
      {activeTab === 'routes' && <RoutesTab routes={routes} onUpdate={r => setRoutes(prev => prev.map(x => x.id === r.id ? r : x))} />}
      {activeTab === 'students' && <StudentsTab students={students} routes={routes} />}
      {activeTab === 'attendance' && <AttendanceTab attendance={attendance} routes={routes} onUpdate={a => setAttendance(prev => prev.map(x => x.id === a.id ? a : x))} />}
      {activeTab === 'incidents' && (
        <IncidentsTab incidents={incidents} routes={routes}
          onAdd={i => setIncidents(prev => [i, ...prev])}
          onUpdate={i => setIncidents(prev => prev.map(x => x.id === i.id ? i : x))} />
      )}
    </div>
  );
}
