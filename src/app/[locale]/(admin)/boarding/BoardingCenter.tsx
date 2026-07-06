'use client';

import React, { useState, useMemo } from 'react';
import {
  Home, Users, AlertTriangle, CheckCircle2, BookOpen,
  Plus, Search, X, BarChart3, User, Phone, Moon,
  Utensils, Heart, Shield, ArrowRight, Bell,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MOCK_STUDENTS, MOCK_ATTEND, MOCK_ROOMS, MOCK_LOGS, MOCK_INCIDENTS, STAFF_LIST,
  BOARDING_TYPE, ATTEND_STATUS, INCIDENT_TYPE, INCIDENT_STATUS, NEP_STATUS,
  BoardingStudent, AttendRecord, BoardingRoom, DailyLog, BoardingIncident,
  AttendStatus, IncidentType, IncidentStatus, NepStatus,
  getStats,
} from '@/src/mockData/boarding';

// ─── Helpers ──────────────────────────────────────────────────
function fmtDt(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', color)}>{children}</span>;
}

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
function DashboardTab({ students, attend, incidents, rooms, logs }: {
  students: BoardingStudent[]; attend: AttendRecord[]; incidents: BoardingIncident[];
  rooms: BoardingRoom[]; logs: DailyLog[];
}) {
  const stats = getStats(students, attend, incidents, rooms);

  const kpis = [
    { label: 'Tổng HS bán/nội trú', value: stats.total,        icon: Users,         color: 'text-slate-800', bg: 'bg-white', border: 'border-slate-200' },
    { label: 'Có mặt hôm nay',      value: stats.present,      icon: CheckCircle2,  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Vắng mặt',            value: stats.absent,       icon: X,             color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    { label: 'Chưa điểm danh',      value: stats.notRecorded,  icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Sự cố đang xử lý',    value: stats.openIncidents,icon: Shield,        color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'Phòng đang dùng',      value: stats.activeRooms,  icon: Home,          color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'HS cần theo dõi',      value: stats.special,      icon: Bell,          color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  ];

  // Nep summary
  const nepSummary = {
    good: logs.filter(l => l.nep === 'good').length,
    average: logs.filter(l => l.nep === 'average').length,
    poor: logs.filter(l => l.nep === 'poor').length,
  };

  // Open incidents
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={cn('rounded-2xl border p-4', k.bg, k.border)}>
            <k.icon className={cn('h-4 w-4 mb-1', k.color)} />
            <div className={cn('text-2xl font-black', k.color)}>{k.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Room occupancy */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-500" />Tình trạng phòng
          </div>
          <div className="divide-y divide-slate-50">
            {rooms.map(r => {
              const pct = r.capacity > 0 ? Math.round((r.currentCount / r.capacity) * 100) : 0;
              return (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-400">{r.area} · {r.staffInCharge}</div>
                    </div>
                    <Badge color={r.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                      {r.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full">
                      <div className={cn('h-full rounded-full', pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 shrink-0">{r.currentCount}/{r.capacity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active incidents */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />Sự cố đang theo dõi
            {activeIncidents.length > 0 && <span className="ml-auto text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full font-bold">{activeIncidents.length}</span>}
          </div>
          <div className="divide-y divide-slate-50">
            {activeIncidents.length === 0
              ? <div className="py-6 text-center text-xs text-slate-400">Không có sự cố đang mở</div>
              : activeIncidents.map(inc => (
                <div key={inc.id} className="px-4 py-3 flex items-start gap-2">
                  <span className="text-lg shrink-0">{INCIDENT_TYPE[inc.type].icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{inc.studentName} <span className="text-slate-400">({inc.className})</span></div>
                    <div className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">{inc.description}</div>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      <Badge color={INCIDENT_STATUS[inc.status].color}>{INCIDENT_STATUS[inc.status].label}</Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Nep summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />Nề nếp hôm nay
            </div>
            <div className="p-4 space-y-2">
              {[
                { k: 'good',    label: 'Tốt',             v: nepSummary.good,    color: 'bg-emerald-500' },
                { k: 'average', label: 'Bình thường',     v: nepSummary.average, color: 'bg-amber-500' },
                { k: 'poor',    label: 'Cần cải thiện',   v: nepSummary.poor,    color: 'bg-rose-500' },
              ].map(n => (
                <div key={n.k} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-28 shrink-0">{n.label}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full">
                    <div className={cn('h-full rounded-full', n.color)} style={{ width: `${logs.length > 0 ? (n.v / logs.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-4 text-right">{n.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
            <div className="font-bold text-sm mb-2 flex items-center gap-2"><Bell className="h-4 w-4" />Thông báo phụ huynh</div>
            <div className="space-y-1 text-xs text-blue-100">
              {['✅ HS có mặt bình thường', '⚠️ HS vắng bất thường', '🤒 HS mệt/ốm', '🚨 Sự cố sinh hoạt', '📋 Cần PH phối hợp'].map(n => (
                <div key={n} className="bg-white/10 rounded-lg px-2 py-1">{n}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today attend summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />Điểm danh hôm nay
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>{['Học sinh', 'Lớp', 'Phòng', 'Ca', 'Trạng thái', 'Ghi chú'].map(h => (
                <th key={h} className="px-4 py-2 text-left font-bold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attend.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-semibold text-slate-900">{a.studentName}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">{a.className}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{a.roomId}</td>
                  <td className="px-4 py-2"><Badge color={a.session === 'lunch' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>{a.session === 'lunch' ? '☀️ Trưa' : '🌙 Chiều'}</Badge></td>
                  <td className="px-4 py-2"><Badge color={ATTEND_STATUS[a.status].color}>{ATTEND_STATUS[a.status].label}</Badge></td>
                  <td className="px-4 py-2 text-xs text-slate-500">{a.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────
function StudentsTab({ students, rooms }: { students: BoardingStudent[]; rooms: BoardingRoom[] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<BoardingStudent | null>(null);
  const { show, el } = useToast();

  const filtered = students.filter(s =>
    (typeFilter === 'all' || s.type === typeFilter) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.className.toLowerCase().includes(search.toLowerCase()))
  );

  const getRoom = (id: string) => rooms.find(r => r.id === id);

  return (
    <div className="space-y-4">
      {el}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm tên, lớp..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
        </div>
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-10 text-sm w-[150px]">
          <option value="all">Tất cả hình thức</option>
          <option value="ban_tru">Bán trú</option>
          <option value="noi_tru">Nội trú</option>
        </Select>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-10">
          <Plus className="h-3.5 w-3.5" />Thêm học sinh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {filtered.map(s => (
              <button key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)}
                className={cn('w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left',
                  selected?.id === s.id && 'bg-blue-50 border-r-2 border-blue-500')}>
                <div className="h-9 w-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">{s.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{s.className} · Khối {s.grade}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge color={BOARDING_TYPE[s.type].color}>{BOARDING_TYPE[s.type].label}</Badge>
                  {s.notes && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">⚠️</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">{selected.name[0]}</div>
              <div>
                <div className="font-bold text-slate-900">{selected.name}</div>
                <div className="text-xs text-slate-400">{selected.className} · Khối {selected.grade} · <Badge color={BOARDING_TYPE[selected.type].color}>{BOARDING_TYPE[selected.type].label}</Badge></div>
              </div>
              <button onClick={() => show(`Đã lưu thông tin ${selected.name}`)} className="ml-auto text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-3">
              {[
                ['Phòng ngủ', getRoom(selected.roomId)?.name || selected.roomId],
                ['Khu vực', getRoom(selected.roomId)?.area || '—'],
                ['Vị trí giường', selected.bedPosition],
                ['Sức chứa phòng', `${getRoom(selected.roomId)?.currentCount || 0}/${getRoom(selected.roomId)?.capacity || 0} HS`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">{k}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{v}</div>
                </div>
              ))}

              <div className="sm:col-span-2 bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Giáo viên phụ trách</div>
                <div className="text-sm font-semibold text-slate-800">{selected.staffInCharge}</div>
              </div>

              <div className="sm:col-span-2 bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Liên hệ phụ huynh</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-800">{selected.parentName}</span>
                  <span className="flex items-center gap-1 text-slate-500"><Phone className="h-3.5 w-3.5" />{selected.parentPhone}</span>
                </div>
              </div>

              {selected.notes && (
                <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-700 mb-1">⚠️ Ghi chú đặc biệt</div>
                  <div className="text-xs text-amber-900">{selected.notes}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
            <div className="text-center text-slate-400 text-sm"><User className="h-8 w-8 mx-auto mb-2 opacity-40" />Chọn học sinh để xem chi tiết</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────
function AttendanceTab({ attend, students, onUpdate }: {
  attend: AttendRecord[]; students: BoardingStudent[];
  onUpdate: (a: AttendRecord) => void;
}) {
  const [roomFilter, setRoomFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'lunch' | 'afternoon'>('all');
  const { show, el } = useToast();

  const rooms = [...new Set(students.map(s => s.roomId))];
  const filtered = attend.filter(a =>
    (roomFilter === 'all' || a.roomId === roomFilter) &&
    (sessionFilter === 'all' || a.session === sessionFilter)
  );

  const notRecorded = students.filter(s => !attend.find(a => a.studentId === s.id));

  const updateStatus = (rec: AttendRecord, status: AttendStatus) => {
    onUpdate({ ...rec, status });
    show(`${rec.studentName}: ${ATTEND_STATUS[status].label}`);
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-700">{attend.filter(a => a.status === 'present').length} có mặt</div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-700">{attend.filter(a => a.status === 'absent').length} vắng</div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-700">{notRecorded.length} chưa điểm</div>
        </div>
        <div className="flex gap-2">
          <Select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="h-9 text-xs w-[130px]">
            <option value="all">Tất cả phòng</option>
            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select value={sessionFilter} onChange={e => setSessionFilter(e.target.value as any)} className="h-9 text-xs w-[130px]">
            <option value="all">Sáng + Chiều</option>
            <option value="lunch">☀️ Trưa</option>
            <option value="afternoon">🌙 Chiều</option>
          </Select>
        </div>
      </div>

      {notRecorded.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Chưa điểm danh: <strong>{notRecorded.map(s => s.name).join(', ')}</strong>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>{['Học sinh', 'Phòng', 'Ca', 'Trạng thái', 'Ghi chú', 'Cập nhật'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="font-semibold text-slate-900">{a.studentName}</div><div className="text-[10px] text-slate-400">{a.className}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{a.roomId}</td>
                  <td className="px-4 py-3"><Badge color={a.session === 'lunch' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>{a.session === 'lunch' ? '☀️ Trưa' : '🌙 Chiều'}</Badge></td>
                  <td className="px-4 py-3"><Badge color={ATTEND_STATUS[a.status].color}>{ATTEND_STATUS[a.status].label}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{a.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(['present', 'absent', 'early_leave', 'parent_pickup'] as AttendStatus[]).map(s => (
                        <button key={s} onClick={() => updateStatus(a, s)} disabled={a.status === s}
                          className={cn('text-[9px] px-1.5 py-0.5 rounded-lg border font-semibold',
                            a.status === s ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-default' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50')}>
                          {ATTEND_STATUS[s].label}
                        </button>
                      ))}
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

// ─── Rooms Tab ────────────────────────────────────────────────
function RoomsTab({ rooms, students }: { rooms: BoardingRoom[]; students: BoardingStudent[] }) {
  const { show, el } = useToast();

  const ROOM_STATUS = { active: { label: 'Hoạt động', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, maintenance: { label: 'Bảo trì', color: 'bg-amber-50 text-amber-700 border-amber-200' }, closed: { label: 'Đóng cửa', color: 'bg-slate-100 text-slate-600 border-slate-200' } };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{rooms.length} phòng · {rooms.filter(r => r.status === 'active').length} đang hoạt động</div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"><Plus className="h-3.5 w-3.5" />Thêm phòng</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {rooms.map(r => {
          const roomStudents = students.filter(s => s.roomId === r.id);
          const pct = r.capacity > 0 ? Math.round((r.currentCount / r.capacity) * 100) : 0;
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{r.name}</div>
                  <div className="text-[10px] text-slate-400">{r.area} · {r.staffInCharge}</div>
                </div>
                <Badge color={ROOM_STATUS[r.status].color}>{ROOM_STATUS[r.status].label}</Badge>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Sĩ số</span>
                    <span className="font-bold text-slate-800">{r.currentCount}/{r.capacity} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full">
                    <div className={cn('h-full rounded-full', pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {roomStudents.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1.5">Học sinh trong phòng</div>
                    <div className="flex flex-wrap gap-1">
                      {roomStudents.map(s => (
                        <span key={s.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                          {s.name} ({s.className})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {r.hygieneNote && <div className="bg-emerald-50 rounded-lg p-2 text-emerald-800"><span className="font-bold block text-[9px] uppercase mb-0.5">Vệ sinh</span>{r.hygieneNote}</div>}
                  {r.safetyNote && <div className="bg-blue-50 rounded-lg p-2 text-blue-800"><span className="font-bold block text-[9px] uppercase mb-0.5">An toàn</span>{r.safetyNote}</div>}
                </div>
                <button onClick={() => show(`Đã lưu phòng ${r.name}`)} className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-1.5 font-semibold transition-colors">Chỉnh sửa phòng</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────
function LogsTab({ logs }: { logs: DailyLog[] }) {
  const { show, el } = useToast();

  const MEAL_LABEL: Record<string, { label: string; color: string }> = {
    good:    { label: 'Ăn tốt',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    average: { label: 'Bình thường',color: 'bg-amber-50 text-amber-700 border-amber-200' },
    poor:    { label: 'Ăn ít',     color: 'bg-rose-50 text-rose-700 border-rose-200' },
    skipped: { label: 'Bỏ bữa',   color: 'bg-red-50 text-red-700 border-red-200' },
  };
  const SLEEP_LABEL: Record<string, { label: string; color: string }> = {
    good:     { label: 'Ngủ ngon', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    restless: { label: 'Ngủ không sâu', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    no_sleep: { label: 'Không ngủ', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  const HEALTH_LABEL: Record<string, { label: string; color: string }> = {
    normal: { label: 'Bình thường', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    tired:  { label: 'Mệt mỏi',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
    sick:   { label: 'Ốm',         color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{logs.length} học sinh có nhật ký hôm nay</div>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"><Plus className="h-3.5 w-3.5" />Thêm nhật ký</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {logs.map(log => (
          <div key={log.id} className={cn('bg-white rounded-2xl border shadow-sm', log.nep === 'poor' ? 'border-rose-200' : 'border-slate-200')}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{log.studentName}</div>
                <div className="text-[10px] text-slate-400">{log.className} · {log.staffName}</div>
              </div>
              <Badge color={NEP_STATUS[log.nep].color}>{NEP_STATUS[log.nep].label}</Badge>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <Badge color={MEAL_LABEL[log.mealStatus].color}><Utensils className="h-3 w-3" />{MEAL_LABEL[log.mealStatus].label}</Badge>
                <Badge color={SLEEP_LABEL[log.sleepStatus].color}><Moon className="h-3 w-3" />{SLEEP_LABEL[log.sleepStatus].label}</Badge>
                <Badge color={HEALTH_LABEL[log.healthStatus].color}><Heart className="h-3 w-3" />{HEALTH_LABEL[log.healthStatus].label}</Badge>
              </div>
              {log.violations && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg px-2 py-1.5 text-xs text-rose-800">⚠️ Vi phạm: {log.violations}</div>
              )}
              {log.teacherNote && (
                <div className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2">{log.teacherNote}</div>
              )}
              <button onClick={() => show(`Đã lưu nhật ký ${log.studentName}`)} className="text-[10px] text-blue-600 hover:underline">Chỉnh sửa nhật ký</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Incidents Tab ────────────────────────────────────────────
function IncidentsTab({ incidents, onAdd, onUpdate }: {
  incidents: BoardingIncident[];
  onAdd: (i: BoardingIncident) => void;
  onUpdate: (i: BoardingIncident) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: '', className: '', type: 'discipline' as IncidentType, description: '', handler: '' });
  const { show, el } = useToast();

  const NEXT: Record<IncidentStatus, IncidentStatus | null> = {
    new: 'processing', processing: 'parent_notified', parent_notified: 'resolved', resolved: null, bgh_review: 'resolved',
  };

  const submit = () => {
    if (!form.studentName.trim() || !form.description.trim()) { show('Điền đầy đủ'); return; }
    onAdd({ id: `INC${Date.now()}`, studentId: '', studentName: form.studentName, className: form.className, roomId: '', type: form.type, description: form.description, occurredAt: new Date().toISOString(), handler: form.handler, status: 'new', parentNotified: false, notes: '' });
    setShowForm(false);
    setForm({ studentName: '', className: '', type: 'discipline', description: '', handler: '' });
    show('Đã ghi nhận sự cố');
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{incidents.length} sự cố · {incidents.filter(i => i.status !== 'resolved').length} đang mở</div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-3.5 w-3.5" />Đóng</> : <><Plus className="h-3.5 w-3.5" />Ghi sự cố</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-3">
          <div className="font-semibold text-orange-900 text-sm">Ghi nhận sự cố bán/nội trú</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Học sinh *</label>
              <Input placeholder="Họ tên" value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="h-9 text-sm" /></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Lớp</label>
              <Input placeholder="VD: 3A" value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} className="h-9 text-sm" /></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Loại sự cố</label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as IncidentType }))} className="h-9 text-sm">
                {Object.entries(INCIDENT_TYPE).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</Select></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Người xử lý</label>
              <Select value={form.handler} onChange={e => setForm(f => ({ ...f, handler: e.target.value }))} className="h-9 text-sm">
                <option value="">-- Chọn --</option>{STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
            <div className="space-y-1 col-span-2"><label className="text-xs font-semibold text-slate-700">Mô tả *</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-slate-400" placeholder="Mô tả chi tiết..." /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600" onClick={submit}>Ghi nhận</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {incidents.map(inc => (
          <div key={inc.id} className={cn('bg-white rounded-2xl border shadow-sm', inc.status === 'new' ? 'border-orange-200' : 'border-slate-200')}>
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-lg">{INCIDENT_TYPE[inc.type].icon}</span>
              <span className="font-semibold text-sm text-slate-900">{inc.studentName}</span>
              <span className="text-xs text-slate-400">{inc.className}</span>
              <Badge color="bg-slate-100 text-slate-700 border-slate-200">{INCIDENT_TYPE[inc.type].label}</Badge>
              <Badge color={INCIDENT_STATUS[inc.status].color}>{INCIDENT_STATUS[inc.status].label}</Badge>
              {inc.parentNotified && <Badge color="bg-emerald-50 text-emerald-700 border-emerald-200">✅ Báo PH</Badge>}
              <div className="ml-auto flex gap-1.5">
                {NEXT[inc.status] && (
                  <button onClick={() => { const next = NEXT[inc.status]!; onUpdate({ ...inc, status: next, parentNotified: next === 'parent_notified' ? true : inc.parentNotified }); show(`Cập nhật: ${INCIDENT_STATUS[next].label}`); }}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-semibold flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />{INCIDENT_STATUS[NEXT[inc.status]!].label}
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-sm text-slate-700">{inc.description}</div>
              {inc.notes && <div className="text-xs text-slate-500 italic mt-1">{inc.notes}</div>}
              <div className="text-[10px] text-slate-400 mt-1">{fmtDt(inc.occurredAt)} · {inc.handler}</div>
            </div>
          </div>
        ))}
        {incidents.length === 0 && <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Không có sự cố</div>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
const TABS = [
  { id: 'dashboard',  label: 'Dashboard',       icon: BarChart3    },
  { id: 'students',   label: 'Học sinh',        icon: Users        },
  { id: 'attendance', label: 'Điểm danh',       icon: CheckCircle2 },
  { id: 'rooms',      label: 'Phòng ngủ',       icon: Home         },
  { id: 'logs',       label: 'Nhật ký sinh hoạt',icon: BookOpen    },
  { id: 'incidents',  label: 'Sự cố',           icon: AlertTriangle},
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function BoardingCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [attend, setAttend] = useState(MOCK_ATTEND);
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Home className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Bán trú / Nội trú</h1>
          <p className="text-sm text-slate-500">Điểm danh · Phòng ngủ · Nhật ký sinh hoạt · Sự cố</p>
        </div>
        {openIncidents > 0 && (
          <div className="ml-auto bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5 text-xs font-bold text-orange-700">{openIncidents} sự cố đang xử lý</div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const badge = tab.id === 'incidents' ? openIncidents : 0;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all relative',
                activeTab === tab.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400')}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
              {badge > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>}
            </button>
          );
        })}
      </div>

      {activeTab === 'dashboard'  && <DashboardTab students={MOCK_STUDENTS} attend={attend} incidents={incidents} rooms={MOCK_ROOMS} logs={MOCK_LOGS} />}
      {activeTab === 'students'   && <StudentsTab students={MOCK_STUDENTS} rooms={MOCK_ROOMS} />}
      {activeTab === 'attendance' && <AttendanceTab attend={attend} students={MOCK_STUDENTS} onUpdate={a => setAttend(p => p.map(x => x.id === a.id ? a : x))} />}
      {activeTab === 'rooms'      && <RoomsTab rooms={MOCK_ROOMS} students={MOCK_STUDENTS} />}
      {activeTab === 'logs'       && <LogsTab logs={MOCK_LOGS} />}
      {activeTab === 'incidents'  && <IncidentsTab incidents={incidents} onAdd={i => setIncidents(p => [i, ...p])} onUpdate={i => setIncidents(p => p.map(x => x.id === i.id ? i : x))} />}
    </div>
  );
}
