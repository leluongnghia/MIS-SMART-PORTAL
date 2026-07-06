'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart, Users, AlertTriangle, Pill, ClipboardList,
  Package, Plus, Search, X, CheckCircle2, Bell,
  ChevronRight, BarChart3, User, Phone, Calendar,
  ArrowRight, Shield,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MOCK_PROFILES, MOCK_LOGS, MOCK_INCIDENTS, MOCK_DRUGS,
  MOCK_CHECKUPS, MOCK_SUPPLIES, STAFF,
  INCIDENT_TYPE, INCIDENT_STATUS, SEVERITY_COLOR,
  HealthIncident, HealthProfile, MedLog, MedSupply,
  IncidentType, IncidentStatus, DrugSource,
  getHealthStats,
} from '@/src/mockData/health';

// ─── Helpers ──────────────────────────────────────────────────
function fmtDt(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('vi-VN') : '—';
}
function bmi(h: number, w: number) { return (w / ((h / 100) ** 2)).toFixed(1); }

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
function DashboardTab({ incidents, supplies }: { incidents: HealthIncident[]; supplies: MedSupply[] }) {
  const stats = getHealthStats(incidents, supplies);
  const kpis = [
    { label: 'Lượt lên PY hôm nay', value: stats.todayVisits, icon: Heart, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    { label: 'Sự cố đang theo dõi', value: stats.activeIncidents, icon: AlertTriangle, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'Đã báo phụ huynh', value: stats.notified, icon: Bell, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Chờ PH đón', value: stats.awaitingPickup, icon: Users, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Vật tư sắp hết', value: stats.lowStock, icon: Package, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Cảnh báo sức khỏe', value: stats.specialAlert, icon: Shield, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  ];

  const activeIncidents = incidents.filter(i => i.status !== 'completed');
  const lowStock = supplies.filter(s => s.quantity <= s.minLevel);

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={cn('rounded-2xl border p-4', k.bg, k.border)}>
            <k.icon className={cn('h-4 w-4 mb-1', k.color)} />
            <div className={cn('text-2xl font-black', k.color)}>{k.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Active incidents */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />Sự cố đang xử lý
            {activeIncidents.length > 0 && (
              <span className="ml-auto text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold">{activeIncidents.length} đang mở</span>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {activeIncidents.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Không có sự cố đang theo dõi</div>
            ) : activeIncidents.map(inc => (
              <div key={inc.id} className="px-5 py-3 flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{INCIDENT_TYPE[inc.type].icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-sm text-slate-900">{inc.studentName}</span>
                    <span className="text-xs text-slate-400">{inc.className}</span>
                    <Badge color={SEVERITY_COLOR[INCIDENT_TYPE[inc.type].severity]}>
                      {INCIDENT_TYPE[inc.type].severity === 'critical' ? '🆘 Nghiêm trọng' : INCIDENT_TYPE[inc.type].label}
                    </Badge>
                    <Badge color={INCIDENT_STATUS[inc.status].color}>{INCIDENT_STATUS[inc.status].label}</Badge>
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-1">{inc.description}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{fmtDt(inc.occurredAt)} · {inc.handler}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock + special alerts */}
        <div className="space-y-4">
          {/* Low stock */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-red-500" />Vật tư sắp hết
            </div>
            <div className="divide-y divide-slate-50">
              {lowStock.length === 0 ? <div className="py-4 text-center text-xs text-slate-400">Đủ hàng</div>
                : lowStock.map(s => (
                  <div key={s.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-800">{s.name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-red-600">{s.quantity}/{s.minLevel} {s.unit}</span>
                      <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-bold">Sắp hết</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Special alerts */}
          <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl p-4 text-white">
            <div className="font-bold text-sm mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />Cảnh báo sức khỏe đặc biệt
            </div>
            <div className="space-y-1.5">
              {MOCK_PROFILES.filter(p => p.conditions.length > 0 || p.allergies.length > 0).map(p => (
                <div key={p.id} className="bg-white/10 rounded-lg px-3 py-2 text-xs">
                  <div className="font-bold">{p.studentName} <span className="opacity-70">({p.className})</span></div>
                  <div className="opacity-80 mt-0.5">
                    {[...p.conditions, ...p.allergies.map(a => `Dị ứng: ${a}`)].join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today visits */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-blue-500" />Nhật ký lên phòng y tế hôm nay
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                {['Học sinh', 'Giờ', 'Lý do', 'Xử lý', 'Thuốc', 'PH biết', 'Kết quả'].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2"><div className="font-semibold text-slate-900">{log.studentName}</div><div className="text-[10px] text-slate-400">{log.className}</div></td>
                  <td className="px-4 py-2 text-xs font-mono text-slate-600">{fmtDt(log.visitTime)}</td>
                  <td className="px-4 py-2 text-xs text-slate-700">{log.reason}</td>
                  <td className="px-4 py-2 text-xs text-slate-600 max-w-[160px] line-clamp-1">{log.treatment}</td>
                  <td className="px-4 py-2">{log.drugsGiven ? <Badge color="bg-amber-50 text-amber-700 border-amber-200">Có</Badge> : <span className="text-xs text-slate-400">Không</span>}</td>
                  <td className="px-4 py-2">{log.parentNotified ? <Badge color="bg-emerald-50 text-emerald-700 border-emerald-200">✅</Badge> : <span className="text-xs text-slate-400">—</span>}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{log.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Profiles Tab ─────────────────────────────────────────────
function ProfilesTab({ profiles }: { profiles: HealthProfile[] }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HealthProfile | null>(null);
  const { show, el } = useToast();

  const filtered = profiles.filter(p =>
    !search || p.studentName.toLowerCase().includes(search.toLowerCase()) ||
    p.className.toLowerCase().includes(search.toLowerCase())
  );

  const BLOOD_COLOR: Record<string, string> = {
    A: 'bg-red-100 text-red-700', B: 'bg-blue-100 text-blue-700',
    AB: 'bg-purple-100 text-purple-700', O: 'bg-emerald-100 text-emerald-700',
    unknown: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm học sinh, lớp..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
        </div>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
          <Plus className="h-3.5 w-3.5" />Thêm hồ sơ
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filtered.map(p => (
              <button key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
                className={cn('w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left',
                  selected?.id === p.id && 'bg-rose-50 border-r-2 border-rose-500')}>
                <div className="h-9 w-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {p.studentName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{p.studentName}</div>
                  <div className="text-xs text-slate-400">{p.className}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', BLOOD_COLOR[p.bloodGroup])}>{p.bloodGroup}</span>
                  {(p.conditions.length > 0 || p.allergies.length > 0) && (
                    <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">⚠️ Cảnh báo</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">{selected.studentName[0]}</div>
              <div>
                <div className="font-bold text-slate-900">{selected.studentName}</div>
                <div className="text-xs text-slate-400">{selected.className} · Sinh: {fmtDate(selected.dob)}</div>
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={() => show('Đã lưu hồ sơ')}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu thay đổi</button>
              </div>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              {[
                ['Chiều cao', `${selected.height} cm`],
                ['Cân nặng', `${selected.weight} kg`],
                ['BMI', `${bmi(selected.height, selected.weight)} kg/m²`],
                ['Nhóm máu', selected.bloodGroup === 'unknown' ? 'Chưa xác định' : selected.bloodGroup],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">{k}</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{v}</div>
                </div>
              ))}

              {selected.conditions.length > 0 && (
                <div className="sm:col-span-2 bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-orange-700 mb-1">Bệnh nền</div>
                  <div className="flex flex-wrap gap-1">{selected.conditions.map(c => <Badge key={c} color="bg-orange-100 text-orange-800 border-orange-200">{c}</Badge>)}</div>
                </div>
              )}

              {selected.allergies.length > 0 && (
                <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-red-700 mb-1">Dị ứng ⚠️</div>
                  <div className="flex flex-wrap gap-1">{selected.allergies.map(a => <Badge key={a} color="bg-red-100 text-red-800 border-red-200">{a}</Badge>)}</div>
                </div>
              )}

              {selected.currentMeds.length > 0 && (
                <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-blue-700 mb-1">Thuốc đang dùng</div>
                  <div className="space-y-0.5">{selected.currentMeds.map(m => <div key={m} className="text-xs text-blue-900">{m}</div>)}</div>
                </div>
              )}

              <div className="sm:col-span-2 bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] font-semibold uppercase text-slate-500 mb-1">Liên hệ khẩn cấp</div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" /><span className="font-medium">{selected.emergencyContact}</span>
                  <Phone className="h-4 w-4 text-slate-400 ml-2" /><span>{selected.emergencyPhone}</span>
                </div>
              </div>

              {selected.medNotes && (
                <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-700 mb-1">Ghi chú y tế đặc biệt</div>
                  <div className="text-xs text-amber-900 leading-relaxed">{selected.medNotes}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12">
            <div className="text-center text-slate-400 text-sm">
              <User className="h-8 w-8 mx-auto mb-2 opacity-40" />Chọn học sinh để xem hồ sơ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Incidents Tab ────────────────────────────────────────────
function IncidentsTab({ incidents, onAdd, onUpdate }: {
  incidents: HealthIncident[];
  onAdd: (i: HealthIncident) => void;
  onUpdate: (i: HealthIncident) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ studentName: '', className: '', type: 'fever' as IncidentType, description: '', handler: '' });
  const { show, el } = useToast();

  const filtered = statusFilter === 'all' ? incidents : incidents.filter(i => i.status === statusFilter);

  const NEXT_STATUS: Record<IncidentStatus, IncidentStatus | null> = {
    recorded: 'monitoring', monitoring: 'parent_notified', parent_notified: 'awaiting_pickup',
    awaiting_pickup: 'completed', transferred: 'completed', completed: null,
  };

  const submit = () => {
    if (!form.studentName.trim() || !form.description.trim()) { show('Điền đầy đủ thông tin'); return; }
    onAdd({ id: `INC${Date.now()}`, studentId: '', studentName: form.studentName, className: form.className, type: form.type, description: form.description, occurredAt: new Date().toISOString(), handler: form.handler, status: 'recorded', parentNotified: false, notes: '' });
    setShowForm(false);
    setForm({ studentName: '', className: '', type: 'fever', description: '', handler: '' });
    show('Đã ghi nhận sự cố');
  };

  const advance = (inc: HealthIncident) => {
    const next = NEXT_STATUS[inc.status];
    if (!next) return;
    const updated: HealthIncident = { ...inc, status: next, parentNotified: next === 'parent_notified' ? true : inc.parentNotified };
    onUpdate(updated);
    show(`Cập nhật: ${INCIDENT_STATUS[next].label}`);
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {['all', ...Object.keys(INCIDENT_STATUS)].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('text-xs px-2 py-1 rounded-lg border font-semibold transition-all',
                statusFilter === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400')}>
              {s === 'all' ? 'Tất cả' : INCIDENT_STATUS[s as IncidentStatus].label}
            </button>
          ))}
        </div>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shrink-0" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-3.5 w-3.5" />Đóng</> : <><Plus className="h-3.5 w-3.5" />Ghi nhận sự cố</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
          <div className="font-semibold text-rose-900 text-sm">Ghi nhận sự cố y tế</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Học sinh *</label>
              <Input placeholder="Họ tên" value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="h-9 text-sm" /></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Lớp</label>
              <Input placeholder="VD: 3A" value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} className="h-9 text-sm" /></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Loại sự cố</label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as IncidentType }))} className="h-9 text-sm">
                {Object.entries(INCIDENT_TYPE).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</Select></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Người tiếp nhận</label>
              <Select value={form.handler} onChange={e => setForm(f => ({ ...f, handler: e.target.value }))} className="h-9 text-sm">
                <option value="">-- Chọn --</option>{STAFF.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
            <div className="space-y-1 col-span-2"><label className="text-xs font-semibold text-slate-700">Mô tả *</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-slate-400"
                placeholder="Mô tả triệu chứng và tình trạng..." /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-700" onClick={submit}>Ghi nhận</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(inc => (
          <div key={inc.id} className={cn('bg-white rounded-2xl border shadow-sm',
            INCIDENT_TYPE[inc.type].severity === 'critical' ? 'border-rose-300' : 'border-slate-200')}>
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xl">{INCIDENT_TYPE[inc.type].icon}</span>
              <span className="font-semibold text-sm text-slate-900">{inc.studentName}</span>
              <span className="text-xs text-slate-400">{inc.className}</span>
              <Badge color={SEVERITY_COLOR[INCIDENT_TYPE[inc.type].severity]}>{INCIDENT_TYPE[inc.type].label}</Badge>
              <Badge color={INCIDENT_STATUS[inc.status].color}>{INCIDENT_STATUS[inc.status].label}</Badge>
              {inc.parentNotified && <Badge color="bg-emerald-50 text-emerald-700 border-emerald-200">✅ Đã báo PH</Badge>}
              <div className="ml-auto flex gap-1.5">
                {NEXT_STATUS[inc.status] && (
                  <button onClick={() => advance(inc)}
                    className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {INCIDENT_STATUS[NEXT_STATUS[inc.status]!].label}
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 py-3 space-y-1">
              <div className="text-sm text-slate-700">{inc.description}</div>
              {inc.notes && <div className="text-xs text-slate-500 italic">{inc.notes}</div>}
              <div className="text-[10px] text-slate-400">{fmtDt(inc.occurredAt)} · {inc.handler}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Không có sự cố nào</div>
        )}
      </div>
    </div>
  );
}

// ─── Drugs Tab ────────────────────────────────────────────────
function DrugsTab({ drugs: initialDrugs }: { drugs: typeof MOCK_DRUGS }) {
  const [drugs, setDrugs] = useState(initialDrugs);
  const { show, el } = useToast();

  const confirm = (id: string) => {
    setDrugs(prev => prev.map(d => d.id === id ? { ...d, confirmed: true } : d));
    show('Đã xác nhận học sinh dùng thuốc');
  };

  const SOURCE_COLOR: Record<DrugSource, string> = {
    parent: 'bg-purple-50 text-purple-700 border-purple-200',
    school: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{drugs.length} lần cấp phát · {drugs.filter(d => d.confirmed).length} đã xác nhận</div>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
          <Plus className="h-3.5 w-3.5" />Ghi nhận cấp thuốc
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>{['Học sinh', 'Thuốc / Liều', 'Giờ dùng', 'Nguồn', 'Người cấp', 'Giờ cấp', 'Trạng thái', 'Phản ứng'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {drugs.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="font-semibold text-slate-900">{d.studentName}</div><div className="text-[10px] text-slate-400">{d.className}</div></td>
                  <td className="px-4 py-3 text-xs"><div className="font-medium text-slate-800">{d.drugName}</div><div className="text-slate-500">{d.dose}</div></td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{d.schedule}</td>
                  <td className="px-4 py-3"><Badge color={SOURCE_COLOR[d.source]}>{d.source === 'parent' ? '👨‍👩‍👦 PH gửi' : '🏫 Trường'}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{d.dispensedBy}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{fmtDt(d.dispensedAt)}</td>
                  <td className="px-4 py-3">
                    {d.confirmed
                      ? <Badge color="bg-emerald-50 text-emerald-700 border-emerald-200">✅ Đã dùng</Badge>
                      : <button onClick={() => confirm(d.id)} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 font-semibold">Xác nhận</button>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{d.reaction || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Checkups Tab ─────────────────────────────────────────────
function CheckupsTab({ checkups: initialCheckups }: { checkups: typeof MOCK_CHECKUPS }) {
  const [checkups, setCheckups] = useState(initialCheckups);
  const { show, el } = useToast();

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{checkups.length} học sinh khám hôm nay · {checkups.filter(c => c.parentReportSent).length} đã gửi PH</div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="border border-slate-200 gap-1.5"
            onClick={() => { setCheckups(prev => prev.map(c => ({ ...c, parentReportSent: true }))); show('Đã xuất báo cáo cho toàn bộ phụ huynh'); }}>
            Xuất báo cáo tất cả
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Plus className="h-3.5 w-3.5" />Thêm kết quả
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {checkups.map(ck => (
          <div key={ck.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{ck.studentName}</div>
                <div className="text-[10px] text-slate-400">{ck.className} · {fmtDate(ck.date)}</div>
              </div>
              {ck.parentReportSent
                ? <Badge color="bg-emerald-50 text-emerald-700 border-emerald-200">✅ Đã gửi PH</Badge>
                : <button onClick={() => { setCheckups(prev => prev.map(c => c.id === ck.id ? { ...c, parentReportSent: true } : c)); show(`Đã gửi báo cáo cho PH ${ck.studentName}`); }}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-semibold">Gửi PH</button>}
            </div>
            <div className="p-4 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[['Chiều cao', `${ck.height} cm`], ['Cân nặng', `${ck.weight} kg`],
                  ['BMI', `${bmi(ck.height, ck.weight)}`], ['Thị lực', ck.vision]].map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-lg p-2">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">{k}</div>
                    <div className="font-semibold text-slate-800">{v}</div>
                  </div>
                ))}
              </div>
              {[['Răng', ck.dental], ['Tai mũi họng', ck.ent]].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-400 w-24 shrink-0">{k}:</span>
                  <span className={v === 'Bình thường' ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>{v}</span>
                </div>
              ))}
              {ck.recommendations && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-800 text-[10px] leading-relaxed">
                  💡 {ck.recommendations}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Supplies Tab ─────────────────────────────────────────────
function SuppliesTab({ supplies: initialSupplies }: { supplies: MedSupply[] }) {
  const [supplies, setSupplies] = useState(initialSupplies);
  const { show, el } = useToast();

  const lowItems = supplies.filter(s => s.quantity <= s.minLevel);
  const expiringSoon = supplies.filter(s => {
    const days = (new Date(s.expiry).getTime() - Date.now()) / 86400000;
    return days < 90 && days > 0;
  });

  const CAT_LABEL = { medicine: 'Thuốc', equipment: 'Thiết bị', consumable: 'Vật tư tiêu hao' };

  return (
    <div className="space-y-4">
      {el}
      {lowItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{lowItems.length} mặt hàng dưới mức tồn kho tối thiểu: <strong>{lowItems.map(s => s.name).join(', ')}</strong></span>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-800 text-sm">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{expiringSoon.length} mặt hàng sắp hết hạn (trong 90 ngày): <strong>{expiringSoon.map(s => s.name).join(', ')}</strong></span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{supplies.length} mặt hàng · {lowItems.length} sắp hết</div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
          <Plus className="h-3.5 w-3.5" />Nhập vật tư
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>{['Tên', 'Loại', 'Số lượng', 'Mức tối thiểu', 'Hạn dùng', 'Tình trạng', 'Cập nhật'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {supplies.map(s => {
                const pct = Math.min(100, (s.quantity / (s.minLevel * 2)) * 100);
                const low = s.quantity <= s.minLevel;
                const daysLeft = Math.floor((new Date(s.expiry).getTime() - Date.now()) / 86400000);
                return (
                  <tr key={s.id} className={cn('hover:bg-slate-50/50', low && 'bg-rose-50/30')}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{CAT_LABEL[s.category]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold text-sm', low ? 'text-red-600' : 'text-slate-800')}>{s.quantity} {s.unit}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                          <div className={cn('h-full rounded-full', low ? 'bg-red-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{s.minLevel} {s.unit}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={cn(daysLeft < 90 ? 'text-amber-700 font-semibold' : 'text-slate-600')}>{fmtDate(s.expiry)}</span>
                      {daysLeft < 90 && <div className="text-[9px] text-amber-600">còn {daysLeft} ngày</div>}
                    </td>
                    <td className="px-4 py-3">
                      {low ? <Badge color="bg-red-50 text-red-700 border-red-200">⚠️ Sắp hết</Badge>
                           : <Badge color="bg-emerald-50 text-emerald-700 border-emerald-200">Đủ hàng</Badge>}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400">{fmtDt(s.lastUpdated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
const TABS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: BarChart3      },
  { id: 'profiles',   label: 'Hồ sơ sức khỏe',   icon: User           },
  { id: 'incidents',  label: 'Sự cố y tế',        icon: AlertTriangle  },
  { id: 'drugs',      label: 'Cấp phát thuốc',    icon: Pill           },
  { id: 'checkups',   label: 'Khám định kỳ',      icon: Calendar       },
  { id: 'supplies',   label: 'Vật tư y tế',       icon: Package        },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function HealthCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const stats = getHealthStats(incidents, MOCK_SUPPLIES);

  const openIncidents = incidents.filter(i => i.status !== 'completed').length;
  const lowSupplies = MOCK_SUPPLIES.filter(s => s.quantity <= s.minLevel).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Y tế học đường</h1>
          <p className="text-sm text-slate-500">Hồ sơ sức khỏe · Sự cố · Cấp phát thuốc · Vật tư</p>
        </div>
        {(openIncidents > 0 || lowSupplies > 0) && (
          <div className="ml-auto flex gap-2">
            {openIncidents > 0 && <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5 text-xs font-bold text-orange-700">{openIncidents} sự cố đang theo dõi</div>}
            {lowSupplies > 0 && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 text-xs font-bold text-red-700">{lowSupplies} vật tư sắp hết</div>}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const badge = tab.id === 'incidents' ? openIncidents : tab.id === 'supplies' ? lowSupplies : 0;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all relative',
                activeTab === tab.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400')}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'dashboard' && <DashboardTab incidents={incidents} supplies={MOCK_SUPPLIES} />}
      {activeTab === 'profiles'  && <ProfilesTab profiles={MOCK_PROFILES} />}
      {activeTab === 'incidents' && <IncidentsTab incidents={incidents} onAdd={i => setIncidents(p => [i, ...p])} onUpdate={i => setIncidents(p => p.map(x => x.id === i.id ? i : x))} />}
      {activeTab === 'drugs'     && <DrugsTab drugs={MOCK_DRUGS} />}
      {activeTab === 'checkups'  && <CheckupsTab checkups={MOCK_CHECKUPS} />}
      {activeTab === 'supplies'  && <SuppliesTab supplies={MOCK_SUPPLIES} />}
    </div>
  );
}
