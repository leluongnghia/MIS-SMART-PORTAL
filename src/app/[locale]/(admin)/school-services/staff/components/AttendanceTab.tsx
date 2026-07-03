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
  ATTENDANCE_RECORDS, type AttendanceRecord, type Department,
  DEPARTMENT_COLORS, ATTENDANCE_COLORS, ALL_DEPARTMENTS, STAFF_PROFILES,
} from '@/src/mockData/staff';
import { Plus, X, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AttendanceTab() {
  const { toast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>(ATTENDANCE_RECORDS);
  const [filterDept, setFilterDept] = useState('all');
  const [filterDate, setFilterDate] = useState('2026-07-03');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staffId: '',
    date: '2026-07-03',
    checkIn: '',
    checkOut: '',
    type: 'Bình thường' as AttendanceRecord['type'],
    overtime: '',
    notes: '',
    approvedBy: '',
  });

  const filtered = records.filter(r =>
    r.date === filterDate &&
    (filterDept === 'all' || r.department === filterDept)
  );

  const onTime = filtered.filter(r => r.type === 'Bình thường').length;
  const late = filtered.filter(r => r.type === 'Đi muộn').length;
  const absent = filtered.filter(r => r.type === 'Vắng có phép' || r.type === 'Vắng không phép').length;
  const noPermit = filtered.filter(r => r.type === 'Vắng không phép').length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile = STAFF_PROFILES.find(p => p.id === form.staffId);
    if (!profile) {
      toast({ title: 'Chọn nhân sự', variant: 'destructive' });
      return;
    }
    const newRecord: AttendanceRecord = {
      id: `at${Date.now()}`,
      staffId: form.staffId,
      staffName: profile.name,
      department: profile.department,
      date: form.date,
      checkIn: form.checkIn || undefined,
      checkOut: form.checkOut || undefined,
      type: form.type,
      overtime: form.overtime ? Number(form.overtime) : undefined,
      notes: form.notes || undefined,
      approvedBy: form.approvedBy || undefined,
    };
    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    setForm({ staffId: '', date: '2026-07-03', checkIn: '', checkOut: '', type: 'Bình thường', overtime: '', notes: '', approvedBy: '' });
    toast({ title: '✅ Đã thêm chấm công', description: `${profile.name} — ${form.date}` });
  }

  function handleApprove(id: string) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, approvedBy: r.approvedBy ?? 'Trưởng phòng' } : r));
    toast({ title: 'Đã duyệt chấm công' });
  }

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
          <Plus className="h-4 w-4 mr-1" />Nhập chấm công
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-center">
          <div className="text-xl font-bold text-emerald-600">{onTime}</div>
          <div className="text-xs text-emerald-600 mt-0.5">Đúng giờ</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-center">
          <div className="text-xl font-bold text-amber-600">{late}</div>
          <div className="text-xs text-amber-600 mt-0.5">Đi muộn</div>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 text-center">
          <div className="text-xl font-bold text-blue-600">{absent}</div>
          <div className="text-xs text-blue-600 mt-0.5">Nghỉ phép</div>
        </div>
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-center">
          <div className="text-xl font-bold text-red-600">{noPermit}</div>
          <div className="text-xs text-red-600 mt-0.5">Vắng không phép</div>
        </div>
      </div>

      {/* Alert */}
      {noPermit > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {filtered.filter(r => r.type === 'Vắng không phép').map(r => r.staffName).join(', ')} vắng không phép!
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-base">Nhập chấm công thủ công</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label>Nhân sự *</Label>
                <Select required value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}>
                  <option value="">Chọn nhân sự...</option>
                  {STAFF_PROFILES.map(p => <option key={p.id} value={p.id}>{p.name} — {p.department}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Ngày</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Giờ vào</Label>
                <Input type="time" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Giờ ra</Label>
                <Input type="time" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Loại</Label>
                <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AttendanceRecord['type'] }))}>
                  {['Bình thường', 'Đi muộn', 'Về sớm', 'Vắng có phép', 'Vắng không phép', 'Tăng ca'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              {form.type === 'Tăng ca' && (
                <div className="space-y-1">
                  <Label>Giờ tăng ca</Label>
                  <Input type="number" min="0" max="8" step="0.5" value={form.overtime} onChange={e => setForm(f => ({ ...f, overtime: e.target.value }))} placeholder="2.5" />
                </div>
              )}
              <div className="space-y-1">
                <Label>Người duyệt</Label>
                <Input value={form.approvedBy} onChange={e => setForm(f => ({ ...f, approvedBy: e.target.value }))} placeholder="Tổ trưởng..." />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <Label>Ghi chú</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Lý do muộn, nghỉ phép..." />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Nhân sự</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Bộ phận</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Vào</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Ra</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Ghi chú</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Không có dữ liệu chấm công</td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} className={r.type === 'Vắng không phép' ? 'bg-red-50/50 dark:bg-red-950/10' : ''}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.staffName}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${DEPARTMENT_COLORS[r.department]}`}>{r.department}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {r.checkIn ? (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.checkIn}</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {r.checkOut ? (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.checkOut}</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${ATTENDANCE_COLORS[r.type]}`}>{r.type}</Badge>
                      {r.overtime && <span className="text-xs text-purple-600 ml-1">+{r.overtime}h</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px] truncate">{r.notes || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {r.approvedBy ? (
                        <span className="flex items-center justify-end gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />{r.approvedBy}
                        </span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(r.id)} className="text-xs h-6">Duyệt</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
