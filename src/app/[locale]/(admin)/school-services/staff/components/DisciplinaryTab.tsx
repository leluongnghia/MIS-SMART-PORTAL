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
  DISCIPLINARY_RECORDS, type DisciplinaryRecord, type Department, type RecordType,
  RECORD_TYPE_COLORS, DEPARTMENT_COLORS, ALL_DEPARTMENTS, STAFF_PROFILES,
} from '@/src/mockData/staff';
import { Plus, X, Award, AlertTriangle } from 'lucide-react';

export default function DisciplinaryTab() {
  const { toast } = useToast();
  const [records, setRecords] = useState<DisciplinaryRecord[]>(DISCIPLINARY_RECORDS);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDept, setFilterDept] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staffId: '',
    type: 'Nhắc nhở' as RecordType,
    date: '2026-07-03',
    content: '',
    severity: 'Nhẹ' as DisciplinaryRecord['severity'],
    recordedBy: '',
    action: '',
    notes: '',
  });

  const filtered = records.filter(r =>
    (filterType === 'all' || r.type === filterType) &&
    (filterDept === 'all' || r.department === filterDept)
  );

  const awards = records.filter(r => r.type === 'Khen thưởng').length;
  const violations = records.filter(r => r.type === 'Vi phạm' || r.type === 'Kỷ luật').length;
  const warnings = records.filter(r => r.type === 'Nhắc nhở').length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile = STAFF_PROFILES.find(p => p.id === form.staffId);
    if (!profile || !form.content.trim()) {
      toast({ title: 'Thiếu thông tin', variant: 'destructive' });
      return;
    }
    const newRecord: DisciplinaryRecord = {
      id: `dr${Date.now()}`,
      staffId: form.staffId,
      staffName: profile.name,
      department: profile.department,
      type: form.type,
      date: form.date,
      content: form.content,
      severity: form.severity,
      recordedBy: form.recordedBy,
      action: form.action,
      notes: form.notes || undefined,
    };
    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    setForm({ staffId: '', type: 'Nhắc nhở', date: '2026-07-03', content: '', severity: 'Nhẹ', recordedBy: '', action: '', notes: '' });
    toast({
      title: form.type === 'Khen thưởng' ? '🏆 Đã ghi nhận khen thưởng' : '📝 Đã ghi nhận vi phạm/nhắc nhở',
      description: profile.name,
    });
  }

  const TYPE_ICON = (type: RecordType) => {
    if (type === 'Khen thưởng') return <Award className="h-4 w-4 text-emerald-500" />;
    if (type === 'Vi phạm' || type === 'Kỷ luật') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-center cursor-pointer" onClick={() => setFilterType('Khen thưởng')}>
          <div className="text-xl font-bold text-emerald-600">{awards}</div>
          <div className="text-xs text-emerald-600 mt-0.5">Khen thưởng</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-center cursor-pointer" onClick={() => setFilterType('Nhắc nhở')}>
          <div className="text-xl font-bold text-amber-600">{warnings}</div>
          <div className="text-xs text-amber-600 mt-0.5">Nhắc nhở</div>
        </div>
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-center cursor-pointer" onClick={() => setFilterType('Vi phạm')}>
          <div className="text-xl font-bold text-red-600">{violations}</div>
          <div className="text-xs text-red-600 mt-0.5">Vi phạm / Kỷ luật</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Tất cả loại</option>
          <option value="Khen thưởng">Khen thưởng</option>
          <option value="Nhắc nhở">Nhắc nhở</option>
          <option value="Vi phạm">Vi phạm</option>
          <option value="Kỷ luật">Kỷ luật</option>
        </Select>
        <Select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">Tất cả bộ phận</option>
          {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Button onClick={() => setShowForm(v => !v)} className="ml-auto shrink-0">
          <Plus className="h-4 w-4 mr-1" />Ghi nhận
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-base">Ghi nhận khen thưởng / vi phạm</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
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
                <Label>Loại</Label>
                <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as RecordType }))}>
                  {['Khen thưởng', 'Nhắc nhở', 'Vi phạm', 'Kỷ luật'].map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Mức độ</Label>
                <Select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as DisciplinaryRecord['severity'] }))}>
                  {['Nhẹ', 'Trung bình', 'Nặng'].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Người ghi nhận</Label>
                <Input value={form.recordedBy} onChange={e => setForm(f => ({ ...f, recordedBy: e.target.value }))} placeholder="Tổ trưởng, BGH..." />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <Label>Nội dung *</Label>
                <Input required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Mô tả chi tiết vi phạm hoặc khen thưởng..." />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <Label>Hướng xử lý</Label>
                <Input value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} placeholder="Nhắc nhở, phạt, thưởng tiền mặt..." />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Lưu ghi nhận</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">Không có dữ liệu</div>
        )}
        {filtered.map(r => (
          <Card key={r.id} className={r.type === 'Khen thưởng' ? 'border-emerald-200' : r.type === 'Vi phạm' || r.type === 'Kỷ luật' ? 'border-red-200' : ''}>
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-3">
                {TYPE_ICON(r.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{r.staffName}</span>
                    <Badge className={`text-xs ${DEPARTMENT_COLORS[r.department]}`}>{r.department}</Badge>
                    <Badge className={`text-xs border ${RECORD_TYPE_COLORS[r.type]}`}>{r.type}</Badge>
                    <Badge className={`text-xs ${r.severity === 'Nặng' ? 'bg-red-100 text-red-700' : r.severity === 'Trung bình' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {r.severity}
                    </Badge>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{r.content}</p>
                  {r.action && (
                    <div className="text-xs text-slate-400 mt-0.5">↳ {r.action}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-0.5">Ghi nhận bởi: {r.recordedBy}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
