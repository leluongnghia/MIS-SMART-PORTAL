'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import {
  SHIFT_ASSIGNMENTS, type ShiftAssignment, type Department,
  DEPARTMENT_COLORS, SHIFT_STATUS_COLORS, ALL_DEPARTMENTS, ALL_SHIFT_TYPES,
  STAFF_PROFILES,
} from '@/src/mockData/staff';
import { Plus, MapPin, Clock, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

const SHIFT_TIME: Record<string, { start: string; end: string }> = {
  'Sáng': { start: '06:00', end: '14:00' },
  'Chiều': { start: '14:00', end: '22:00' },
  'Tối': { start: '18:00', end: '22:00' },
  'Đêm': { start: '22:00', end: '06:00' },
  'Sự kiện': { start: '07:00', end: '17:00' },
  'Tăng cường': { start: '06:00', end: '08:30' },
};

export default function ShiftsTab() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<ShiftAssignment[]>(SHIFT_ASSIGNMENTS);
  const [showForm, setShowForm] = useState(false);
  const [filterDept, setFilterDept] = useState('all');
  const [filterDate, setFilterDate] = useState('2026-07-03');
  const [form, setForm] = useState({
    staffId: '',
    department: 'Bảo vệ' as Department,
    shiftType: 'Sáng' as typeof ALL_SHIFT_TYPES[number],
    area: '',
    date: '2026-07-03',
    substitute: '',
  });

  const filtered = shifts.filter(s =>
    (filterDept === 'all' || s.department === filterDept) &&
    s.date === filterDate
  );

  const absent = filtered.filter(s => s.status === 'Vắng mặt');
  const noSub = absent.filter(s => !s.substitute);

  function handleUpdateStatus(id: string, status: ShiftAssignment['status']) {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast({ title: 'Cập nhật trạng thái ca', description: `→ ${status}` });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile = STAFF_PROFILES.find(p => p.id === form.staffId);
    if (!profile) {
      toast({ title: 'Chọn nhân sự', variant: 'destructive' });
      return;
    }
    const times = SHIFT_TIME[form.shiftType];
    const newShift: ShiftAssignment = {
      id: `sh${Date.now()}`,
      staffId: form.staffId,
      staffName: profile.name,
      department: form.department,
      shiftName: `Ca ${form.shiftType} - ${form.area}`,
      shiftType: form.shiftType,
      startTime: times.start,
      endTime: times.end,
      area: form.area,
      date: form.date,
      status: 'Chưa bắt đầu',
      substitute: form.substitute || undefined,
    };
    setShifts(prev => [...prev, newShift]);
    setShowForm(false);
    toast({ title: '✅ Đã phân ca', description: `${profile.name} — Ca ${form.shiftType}` });
  }

  // Group by shift type
  const SHIFT_ORDER = ['Sáng', 'Chiều', 'Tối', 'Đêm', 'Sự kiện', 'Tăng cường'];
  const grouped = SHIFT_ORDER.reduce<Record<string, ShiftAssignment[]>>((acc, type) => {
    const list = filtered.filter(s => s.shiftType === type);
    if (list.length) acc[type] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-4 mt-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-40" />
        <Select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">Tất cả bộ phận</option>
          {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Button onClick={() => setShowForm(v => !v)} className="ml-auto shrink-0">
          <Plus className="h-4 w-4 mr-1" />Phân ca
        </Button>
      </div>

      {/* Warnings */}
      {noSub.length > 0 && (
        <div className="p-3 rounded-xl border-2 border-red-300 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-700 text-sm">⚠️ Ca vắng chưa có người thay thế!</div>
              {noSub.map(s => (
                <div key={s.id} className="text-xs text-red-600 mt-0.5">{s.staffName} — {s.shiftName}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-base">Phân ca làm việc</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label>Nhân sự *</Label>
                <Select required value={form.staffId} onChange={e => {
                  const p = STAFF_PROFILES.find(p => p.id === e.target.value);
                  setForm(f => ({ ...f, staffId: e.target.value, department: p?.department ?? f.department }));
                }}>
                  <option value="">Chọn nhân sự...</option>
                  {STAFF_PROFILES.filter(p => p.status === 'Đang làm').map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.department}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Ngày</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Ca trực</Label>
                <Select value={form.shiftType} onChange={e => setForm(f => ({ ...f, shiftType: e.target.value as typeof ALL_SHIFT_TYPES[number] }))}>
                  {ALL_SHIFT_TYPES.map(t => <option key={t} value={t}>Ca {t} ({SHIFT_TIME[t].start}–{SHIFT_TIME[t].end})</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Khu vực / Vị trí</Label>
                <Input required value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Cổng chính, Khu A..." />
              </div>
              <div className="space-y-1">
                <Label>Người thay thế</Label>
                <Input value={form.substitute} onChange={e => setForm(f => ({ ...f, substitute: e.target.value }))} placeholder="Nếu có..." />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Phân ca</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grouped shifts */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-slate-400">Không có ca nào trong ngày {filterDate}</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([shiftType, shiftList]) => (
            <Card key={shiftType}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Ca {shiftType}
                  <span className="text-xs text-slate-400 font-normal">({SHIFT_TIME[shiftType]?.start}–{SHIFT_TIME[shiftType]?.end})</span>
                  <Badge className="text-xs bg-slate-100 text-slate-600">{shiftList.length} ca</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {shiftList.map(shift => (
                    <div key={shift.id} className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${
                      shift.status === 'Vắng mặt' ? 'bg-red-50 border-red-200 dark:bg-red-950/20' :
                      shift.status === 'Đang trực' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20' :
                      'bg-slate-50 border-slate-100 dark:bg-slate-800/30'
                    }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{shift.staffName}</span>
                          <Badge className={`text-xs ${DEPARTMENT_COLORS[shift.department]}`}>{shift.department}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />{shift.area}
                          {shift.substitute && <span className="text-blue-600">· Thay: {shift.substitute}</span>}
                        </div>
                        <Badge className={`text-xs mt-1.5 ${SHIFT_STATUS_COLORS[shift.status]}`}>{shift.status}</Badge>
                      </div>
                      {/* Quick action */}
                      {shift.status === 'Chưa bắt đầu' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(shift.id, 'Đang trực')} className="text-xs h-7 shrink-0">Bắt đầu</Button>
                      )}
                      {shift.status === 'Đang trực' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(shift.id, 'Hoàn thành')} className="text-xs h-7 shrink-0 bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />Xong
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
