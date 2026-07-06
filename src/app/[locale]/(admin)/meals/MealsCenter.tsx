'use client';

import React, { useState, useMemo } from 'react';
import {
  Utensils, Users, AlertTriangle, CheckCircle2, Star,
  Plus, Search, X, MessageSquare, ShoppingCart, Bell,
  BarChart3, ChevronDown, ChevronRight, Send, Filter,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  MOCK_MENU, MOCK_SPECIAL_DIETS, MOCK_ATTENDANCE, MOCK_FEEDBACK, MOCK_CANTEEN,
  DIET_CONFIG, FEEDBACK_CATEGORY, ATTEND_STATUS, ITEM_STATUS,
  MenuDay, MealAttendance, MealFeedback, CanteenItem,
  AttendStatus, FeedbackStatus, CanteenItemStatus, DietType,
  getMealStats,
} from '@/src/mockData/meals';

// ─── Helpers ──────────────────────────────────────────────────
function fmtDt(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtPrice(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', color)}>{children}</span>;
}

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };
  const el = msg ? (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-2">
      <CheckCircle2 className="h-4 w-4 shrink-0" />{msg}
    </div>
  ) : null;
  return { show, el };
}

// ─── Star rating display ──────────────────────────────────────
function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={cn('h-3 w-3', n <= value ? 'text-amber-400 fill-current' : 'text-slate-200')} />
      ))}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────
function DashboardTab({ attendance, feedback, specialDiets }: {
  attendance: MealAttendance[];
  feedback: MealFeedback[];
  specialDiets: typeof MOCK_SPECIAL_DIETS;
}) {
  const stats = getMealStats(attendance);
  const newFeedback = feedback.filter(f => f.status === 'new').length;
  const allergyToday = attendance.filter(a => a.dietType !== null);

  const kpis = [
    { label: 'Tổng suất ăn hôm nay', value: stats.total, color: 'text-slate-800', bg: 'bg-white', border: 'border-slate-200', icon: Utensils },
    { label: 'Đã đăng ký ăn', value: stats.registered, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Users },
    { label: 'Hủy / Vắng', value: stats.cancelled, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: X },
    { label: 'Suất đặc biệt', value: stats.special, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
    { label: 'Phản hồi mới', value: newFeedback, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: MessageSquare },
    { label: 'Cảnh báo dị ứng', value: allergyToday.length, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: Bell },
  ];

  // Today's menu
  const todayMenu = MOCK_MENU.find(m => m.date === new Date().toISOString().split('T')[0]) || MOCK_MENU[0];

  // By class stats
  const byClass = useMemo(() => {
    const map: Record<string, { ate: number; absent: number; total: number }> = {};
    attendance.forEach(a => {
      if (!map[a.className]) map[a.className] = { ate: 0, absent: 0, total: 0 };
      map[a.className].total++;
      if (a.status === 'ate' || a.status === 'substitute') map[a.className].ate++;
      if (a.status === 'absent') map[a.className].absent++;
    });
    return Object.entries(map).map(([cls, v]) => ({ cls, ...v }));
  }, [attendance]);

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
        {/* Today's menu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Utensils className="h-4 w-4 text-amber-500" />
            <div className="font-bold text-slate-900 text-sm">Thực đơn hôm nay — {todayMenu.dayLabel}</div>
            {todayMenu.allergyNotes && (
              <span className="ml-auto text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                ⚠️ {todayMenu.allergyNotes}
              </span>
            )}
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Bữa sáng', value: todayMenu.breakfast || '—' },
                { label: 'Bữa trưa', value: todayMenu.lunch },
                { label: 'Bữa phụ', value: todayMenu.snack },
                { label: 'Canh',    value: todayMenu.soup },
                { label: 'Món phụ', value: todayMenu.side },
                { label: 'Tráng miệng', value: todayMenu.dessert },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">{item.label}</div>
                  <div className="text-sm font-medium text-slate-800">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                🔥 <span className="font-semibold text-amber-800">{todayMenu.calories} kcal</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                💪 Protein: <span className="font-semibold text-blue-800">{todayMenu.protein}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Allergy alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />Cảnh báo dị ứng
          </div>
          <div className="p-3 space-y-2">
            {specialDiets.slice(0, 5).map(s => (
              <div key={s.id} className={cn('rounded-xl p-3 border', DIET_CONFIG[s.dietType].color)}>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span>{DIET_CONFIG[s.dietType].icon}</span>{s.studentName}
                  <span className="ml-auto opacity-70">{s.className}</span>
                </div>
                <div className="text-[10px] mt-0.5 opacity-80 line-clamp-1">{s.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By class */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />Tổng hợp suất ăn theo lớp hôm nay
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2 text-left font-bold">Lớp</th>
                <th className="px-4 py-2 text-center font-bold">Tổng</th>
                <th className="px-4 py-2 text-center font-bold">Đã ăn</th>
                <th className="px-4 py-2 text-center font-bold">Vắng</th>
                <th className="px-4 py-2 text-left font-bold">Tỷ lệ ăn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {byClass.map(c => (
                <tr key={c.cls} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-semibold text-slate-800">{c.cls}</td>
                  <td className="px-4 py-2 text-center text-slate-600">{c.total}</td>
                  <td className="px-4 py-2 text-center text-emerald-700 font-semibold">{c.ate}</td>
                  <td className="px-4 py-2 text-center text-rose-600">{c.absent}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((c.ate / c.total) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 w-8">{Math.round((c.ate / c.total) * 100)}%</span>
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

// ─── Menu Tab ─────────────────────────────────────────────────
function MenuTab({ menu }: { menu: MenuDay[] }) {
  const [selected, setSelected] = useState<MenuDay | null>(null);
  const { show, el } = useToast();
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">Thực đơn tuần này</div>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
          <Plus className="h-3.5 w-3.5" />Thêm/Sửa thực đơn
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {menu.map(day => (
          <div key={day.id}
            onClick={() => setSelected(selected?.id === day.id ? null : day)}
            className={cn('bg-white rounded-2xl border shadow-sm cursor-pointer transition-all',
              day.date === todayIso ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200',
              selected?.id === day.id ? 'shadow-md' : 'hover:shadow-md hover:border-slate-300')}>
            <div className={cn('px-4 py-2 rounded-t-2xl border-b text-xs font-bold flex items-center justify-between',
              day.date === todayIso ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-600')}>
              <span>{day.dayLabel}</span>
              <span className="opacity-60">{day.date.slice(5).replace('-', '/')}</span>
              {day.date === todayIso && <span className="bg-amber-400 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">HÔM NAY</span>}
            </div>
            <div className="p-3 space-y-1.5 text-xs">
              {day.breakfast && (
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Sáng</span>
                  <div className="text-slate-700 line-clamp-1">{day.breakfast}</div>
                </div>
              )}
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400">Trưa</span>
                <div className="text-slate-800 font-semibold line-clamp-1">{day.lunch}</div>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400">Phụ</span>
                <div className="text-slate-600 line-clamp-1">{day.snack}</div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">🔥 {day.calories} kcal</span>
                {day.allergyNotes && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 rounded font-bold">⚠️ Dị ứng</span>}
              </div>
            </div>

            {selected?.id === day.id && (
              <div className="border-t border-slate-100 px-3 py-3 bg-slate-50/50 space-y-1.5 rounded-b-2xl text-xs">
                {[['Canh', day.soup], ['Món phụ', day.side], ['Tráng miệng', day.dessert]].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-400 w-20 shrink-0">{k}:</span>
                    <span className="text-slate-700 font-medium">{v}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 shrink-0">Protein:</span>
                  <span className="text-slate-700 font-medium">{day.protein}g</span>
                </div>
                {day.allergyNotes && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 text-orange-700 text-[10px]">
                    ⚠️ {day.allergyNotes}
                  </div>
                )}
                <button onClick={e => { e.stopPropagation(); show(`Đã lưu thực đơn ${day.dayLabel}`); }}
                  className="w-full mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 font-semibold">
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Special Diets Tab ────────────────────────────────────────
function SpecialDietsTab({ diets }: { diets: typeof MOCK_SPECIAL_DIETS }) {
  const { show, el } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: '', className: '', dietType: 'seafood_allergy' as DietType, description: '', approvedBy: '', validUntil: '' });

  const handleAdd = () => {
    if (!form.studentName.trim() || !form.description.trim()) { show('Vui lòng điền đầy đủ'); return; }
    show(`Đã thêm suất ăn đặc biệt cho ${form.studentName}`);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{diets.length} học sinh có suất ăn đặc biệt</div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-3.5 w-3.5" />Đóng</> : <><Plus className="h-3.5 w-3.5" />Thêm mới</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-3">
          <div className="font-semibold text-orange-900 text-sm">Đăng ký suất ăn đặc biệt</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Học sinh *</label>
              <Input placeholder="Họ tên" value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="h-9 text-sm" /></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Lớp</label>
              <Input placeholder="VD: 3A" value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} className="h-9 text-sm" /></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Loại chế độ *</label>
              <Select value={form.dietType} onChange={e => setForm(f => ({ ...f, dietType: e.target.value as DietType }))} className="h-9 text-sm">
                {Object.entries(DIET_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</Select></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Người duyệt</label>
              <Input placeholder="BS. / BGH..." value={form.approvedBy} onChange={e => setForm(f => ({ ...f, approvedBy: e.target.value }))} className="h-9 text-sm" /></div>
            <div className="space-y-1 col-span-2"><label className="text-xs font-semibold text-slate-700">Mô tả *</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-slate-400"
                placeholder="Mô tả chi tiết yêu cầu dinh dưỡng đặc biệt..." /></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-700">Hiệu lực đến</label>
              <Input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="h-9 text-sm" /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600" onClick={handleAdd}>Lưu đăng ký</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {diets.map(s => (
          <div key={s.id} className={cn('rounded-2xl border p-4 space-y-2', DIET_CONFIG[s.dietType].color)}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{DIET_CONFIG[s.dietType].icon}</span>
                <div>
                  <div className="font-bold text-sm">{s.studentName}</div>
                  <div className="text-[10px] opacity-70">{s.className}</div>
                </div>
              </div>
              <Badge color={DIET_CONFIG[s.dietType].color}>{DIET_CONFIG[s.dietType].label}</Badge>
            </div>
            <div className="text-xs leading-relaxed opacity-90">{s.description}</div>
            <div className="flex flex-wrap gap-2 text-[10px] opacity-70">
              <span>Duyệt bởi: {s.approvedBy}</span>
              <span>HH: {s.validUntil.split('T')[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────
function AttendanceTab({ attendance, onUpdate }: {
  attendance: MealAttendance[];
  onUpdate: (a: MealAttendance) => void;
}) {
  const [classFilter, setClassFilter] = useState('all');
  const { show, el } = useToast();

  const classes = [...new Set(attendance.map(a => a.className))];
  const filtered = classFilter === 'all' ? attendance : attendance.filter(a => a.className === classFilter);

  const stats = {
    ate: filtered.filter(a => a.status === 'ate').length,
    absent: filtered.filter(a => a.status === 'absent').length,
    substitute: filtered.filter(a => a.status === 'substitute').length,
    not_recorded: filtered.filter(a => a.status === 'not_recorded').length,
  };

  const updateStatus = (rec: MealAttendance, status: AttendStatus) => {
    onUpdate({ ...rec, status });
    show(`${rec.studentName}: ${ATTEND_STATUS[status].label}`);
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[['ate', 'Đã ăn', 'emerald'], ['absent', 'Vắng', 'rose'], ['substitute', 'Thay thế', 'blue'], ['not_recorded', 'Chưa điểm', 'slate']].map(([k, label, c]) => (
            <div key={k} className={`bg-${c}-50 border border-${c}-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-${c}-700`}>
              {stats[k as AttendStatus]} {label}
            </div>
          ))}
        </div>
        <Select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="h-9 text-sm w-[130px]">
          <option value="all">Tất cả lớp</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Học sinh</th>
                <th className="px-4 py-3 text-left font-bold">Chế độ đặc biệt</th>
                <th className="px-4 py-3 text-left font-bold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-bold">Ghi chú</th>
                <th className="px-4 py-3 text-left font-bold">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{a.studentName}</div>
                    <div className="text-xs text-slate-400">{a.className}</div>
                  </td>
                  <td className="px-4 py-3">
                    {a.dietType ? <Badge color={DIET_CONFIG[a.dietType].color}>{DIET_CONFIG[a.dietType].icon} {DIET_CONFIG[a.dietType].label}</Badge> : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3"><Badge color={ATTEND_STATUS[a.status].color}>{ATTEND_STATUS[a.status].label}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">{a.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(['ate', 'absent', 'substitute'] as AttendStatus[]).map(s => (
                        <button key={s} onClick={() => updateStatus(a, s)} disabled={a.status === s}
                          className={cn('text-[9px] px-1.5 py-0.5 rounded-lg border font-semibold transition-colors',
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

// ─── Feedback Tab ─────────────────────────────────────────────
function FeedbackTab({ feedback, onUpdate }: {
  feedback: MealFeedback[];
  onUpdate: (f: MealFeedback) => void;
}) {
  const [catFilter, setCatFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const { show, el } = useToast();

  const filtered = catFilter === 'all' ? feedback : feedback.filter(f => f.category === catFilter);
  const newCount = feedback.filter(f => f.status === 'new').length;

  const handleReply = (fb: MealFeedback) => {
    if (!replyText.trim()) return;
    onUpdate({ ...fb, status: 'replied' });
    setReplyTo(null);
    setReplyText('');
    show('Đã gửi phản hồi');
  };

  const STATUS_COLOR: Record<FeedbackStatus, string> = {
    new: 'bg-rose-50 text-rose-700 border-rose-200',
    read: 'bg-slate-100 text-slate-600 border-slate-200',
    replied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const STATUS_LABEL: Record<FeedbackStatus, string> = { new: 'Mới', read: 'Đã xem', replied: 'Đã phản hồi' };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex flex-wrap gap-2 items-center">
        {newCount > 0 && (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2 py-1 rounded-full">{newCount} phản hồi mới</span>
        )}
        <div className="flex gap-1.5 ml-auto flex-wrap">
          {['all', ...Object.keys(FEEDBACK_CATEGORY)].map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={cn('text-xs px-2 py-1 rounded-lg border font-semibold transition-all',
                catFilter === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400')}>
              {cat === 'all' ? 'Tất cả' : `${FEEDBACK_CATEGORY[cat as keyof typeof FEEDBACK_CATEGORY].icon} ${FEEDBACK_CATEGORY[cat as keyof typeof FEEDBACK_CATEGORY].label}`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(fb => (
          <div key={fb.id} className={cn('bg-white rounded-2xl border shadow-sm', fb.status === 'new' ? 'border-rose-200' : 'border-slate-200')}>
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">
                {fb.sender[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900">{fb.sender}</div>
                <div className="text-[10px] text-slate-400">{fmtDt(fb.date)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StarDisplay value={fb.rating} />
                <Badge color={STATUS_COLOR[fb.status]}>{STATUS_LABEL[fb.status]}</Badge>
                <span className="text-xs text-slate-500">{FEEDBACK_CATEGORY[fb.category].icon} {FEEDBACK_CATEGORY[fb.category].label}</span>
                {fb.hasImage && <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">📷 Ảnh</span>}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-sm text-slate-700 leading-relaxed">{fb.content}</div>
              <div className="flex gap-2 mt-2">
                {fb.status === 'new' && (
                  <button onClick={() => onUpdate({ ...fb, status: 'read' })}
                    className="text-xs text-slate-500 hover:text-slate-700 underline">Đánh dấu đã xem</button>
                )}
                <button onClick={() => setReplyTo(replyTo === fb.id ? null : fb.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline">
                  {replyTo === fb.id ? 'Đóng' : 'Phản hồi'}
                </button>
              </div>
              {replyTo === fb.id && (
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Nhập phản hồi..." value={replyText} onChange={e => setReplyText(e.target.value)} className="text-sm" />
                  <button onClick={() => handleReply(fb)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Không có phản hồi nào</div>
        )}
      </div>
    </div>
  );
}

// ─── Canteen Tab ──────────────────────────────────────────────
function CanteenTab({ items, onUpdate }: {
  items: CanteenItem[];
  onUpdate: (i: CanteenItem) => void;
}) {
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { show, el } = useToast();

  const categories = [...new Set(items.map(i => i.category))];
  const filtered = items.filter(i =>
    (catFilter === 'all' || i.category === catFilter) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = (item: CanteenItem) => {
    const next: CanteenItemStatus = item.status === 'available' ? 'out_of_stock' : 'available';
    onUpdate({ ...item, status: next });
    show(`${item.name}: ${ITEM_STATUS[next].label}`);
  };

  return (
    <div className="space-y-4">
      {el}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm mặt hàng..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
        </div>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="h-10 text-sm w-[150px]">
          <option value="all">Tất cả nhóm</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 h-10">
          <Plus className="h-3.5 w-3.5" />Thêm mặt hàng
        </Button>
      </div>

      {/* Warning: inappropriate for students */}
      {items.filter(i => !i.ageAppropriate && i.status === 'available').length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{items.filter(i => !i.ageAppropriate && i.status === 'available').length} mặt hàng không phù hợp với học sinh đang được bán — cần kiểm tra lại!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Tên mặt hàng</th>
                <th className="px-4 py-3 text-left font-bold">Nhóm</th>
                <th className="px-4 py-3 text-right font-bold">Giá</th>
                <th className="px-4 py-3 text-left font-bold">Phù hợp HS</th>
                <th className="px-4 py-3 text-left font-bold">Cảnh báo</th>
                <th className="px-4 py-3 text-left font-bold">Tình trạng</th>
                <th className="px-4 py-3 text-left font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(item => (
                <tr key={item.id} className={cn('hover:bg-slate-50/50', !item.ageAppropriate && 'bg-rose-50/30')}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.category}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-800">{fmtPrice(item.price)}</td>
                  <td className="px-4 py-3">
                    {item.ageAppropriate
                      ? <span className="text-emerald-600 text-xs font-semibold">✅ Phù hợp</span>
                      : <span className="text-rose-600 text-xs font-bold">❌ Không phù hợp</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-orange-700">{item.allergyWarning || '—'}</td>
                  <td className="px-4 py-3"><Badge color={ITEM_STATUS[item.status].color}>{ITEM_STATUS[item.status].label}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(item)}
                      className={cn('text-xs px-2 py-1 rounded-lg border font-semibold transition-colors',
                        item.status === 'available' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100')}>
                      {item.status === 'available' ? 'Đánh dấu hết' : 'Mở lại'}
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

// ─── Main Component ───────────────────────────────────────────
const TABS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: BarChart3     },
  { id: 'menu',       label: 'Thực đơn',          icon: Utensils      },
  { id: 'special',    label: 'Suất đặc biệt',     icon: AlertTriangle },
  { id: 'attendance', label: 'Điểm danh ăn',      icon: CheckCircle2  },
  { id: 'feedback',   label: 'Phản hồi',          icon: MessageSquare },
  { id: 'canteen',    label: 'Căng tin',           icon: ShoppingCart  },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function MealsCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [canteen, setCanteen] = useState(MOCK_CANTEEN);

  const newFeedback = feedback.filter(f => f.status === 'new').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Utensils className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Suất ăn / Căng tin</h1>
          <p className="text-sm text-slate-500">Quản lý thực đơn, điểm danh ăn và vận hành căng tin</p>
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
              {tab.id === 'feedback' && newFeedback > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">{newFeedback}</span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'dashboard'  && <DashboardTab attendance={attendance} feedback={feedback} specialDiets={MOCK_SPECIAL_DIETS} />}
      {activeTab === 'menu'       && <MenuTab menu={MOCK_MENU} />}
      {activeTab === 'special'    && <SpecialDietsTab diets={MOCK_SPECIAL_DIETS} />}
      {activeTab === 'attendance' && <AttendanceTab attendance={attendance} onUpdate={a => setAttendance(prev => prev.map(x => x.id === a.id ? a : x))} />}
      {activeTab === 'feedback'   && <FeedbackTab feedback={feedback} onUpdate={f => setFeedback(prev => prev.map(x => x.id === f.id ? f : x))} />}
      {activeTab === 'canteen'    && <CanteenTab items={canteen} onUpdate={i => setCanteen(prev => prev.map(x => x.id === i.id ? i : x))} />}
    </div>
  );
}
