'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useToast } from '@/src/components/ui/Toast';
import {
  TRAINING_RECORDS, type TrainingRecord, STAFF_PROFILES, MANDATORY_TRAININGS,
} from '@/src/mockData/staff';
import { GraduationCap, Plus, X, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

export default function TrainingTab() {
  const { toast } = useToast();
  const [records, setRecords] = useState<TrainingRecord[]>(TRAINING_RECORDS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '',
    instructor: '',
    expiryDate: '',
    notes: '',
    selectedIds: [] as string[],
  });

  const mandatoryTitles = MANDATORY_TRAININGS.map(tid => {
    return TRAINING_RECORDS.find(r => r.id === tid)?.title ?? tid;
  });

  // Coverage: who completed each mandatory training
  const mandatoryCoverage = MANDATORY_TRAININGS.map(tid => {
    const tr = TRAINING_RECORDS.find(r => r.id === tid);
    const trained = STAFF_PROFILES.filter(p => p.trainingCompleted.includes(tid));
    return { tid, title: tr?.title ?? tid, trained: trained.length, total: STAFF_PROFILES.length };
  });

  const notExpired = (r: TrainingRecord) => !r.expiryDate || r.expiryDate >= '2026-07-03';

  function toggleStaff(id: string) {
    setForm(f => ({
      ...f,
      selectedIds: f.selectedIds.includes(id)
        ? f.selectedIds.filter(i => i !== id)
        : [...f.selectedIds, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || form.selectedIds.length === 0) {
      toast({ title: 'Thiếu thông tin', description: 'Nhập tên khóa và chọn ít nhất 1 nhân sự', variant: 'destructive' });
      return;
    }
    const participants = form.selectedIds.map(id => STAFF_PROFILES.find(p => p.id === id)?.name ?? id);
    const newRecord: TrainingRecord = {
      id: `tr${Date.now()}`,
      title: form.title,
      participants,
      participantIds: form.selectedIds,
      date: form.date,
      result: 'Chờ kết quả',
      instructor: form.instructor,
      expiryDate: form.expiryDate || undefined,
      notes: form.notes || undefined,
    };
    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    setForm({ title: '', date: '', instructor: '', expiryDate: '', notes: '', selectedIds: [] });
    toast({ title: '✅ Tạo khóa đào tạo thành công', description: `${participants.length} nhân sự tham gia` });
  }

  function handleResult(id: string, result: TrainingRecord['result']) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, result } : r));
    toast({ title: 'Cập nhật kết quả đào tạo', description: `→ ${result}` });
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Đào tạo & Chứng nhận</h3>
          <p className="text-sm text-slate-500">{records.length} khóa đào tạo đã ghi nhận</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4 mr-1" />Tạo khóa đào tạo
        </Button>
      </div>

      {/* Mandatory coverage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Đào tạo bắt buộc — Tỷ lệ hoàn thành
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mandatoryCoverage.map(m => (
              <div key={m.tid} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{m.title}</span>
                <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(m.trained / m.total) >= 0.9 ? 'bg-emerald-500' : (m.trained / m.total) >= 0.7 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${(m.trained / m.total) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold w-12 text-right ${(m.trained / m.total) >= 0.9 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {m.trained}/{m.total}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-base">Tạo khóa đào tạo</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <Label>Tên khóa đào tạo *</Label>
                  <Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: PCCC & Thoát hiểm..." />
                </div>
                <div className="space-y-1">
                  <Label>Ngày đào tạo</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Giảng viên</Label>
                  <Input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} placeholder="Tên người hướng dẫn..." />
                </div>
                <div className="space-y-1">
                  <Label>Ngày hết hạn</Label>
                  <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Ghi chú</Label>
                  <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Ghi chú..." />
                </div>
              </div>

              {/* Staff selection */}
              <div className="space-y-2">
                <Label>Nhân sự tham gia * ({form.selectedIds.length} đã chọn)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-2 border rounded-lg">
                  {STAFF_PROFILES.map(p => (
                    <div
                      key={p.id}
                      onClick={() => toggleStaff(p.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                        form.selectedIds.includes(p.id)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${form.selectedIds.includes(p.id) ? 'text-emerald-500' : 'text-slate-200'}`} />
                      <span className="truncate font-medium">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Tạo khóa</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records */}
      <div className="space-y-3">
        {records.map(r => (
          <Card key={r.id}>
            <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <GraduationCap className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{r.title}</span>
                      <Badge className={`text-xs ${r.result === 'Đạt' ? 'bg-emerald-100 text-emerald-700' : r.result === 'Không đạt' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {r.result}
                      </Badge>
                      {MANDATORY_TRAININGS.includes(r.id) && (
                        <Badge className="text-xs bg-indigo-100 text-indigo-700">Bắt buộc</Badge>
                      )}
                      {r.expiryDate && !notExpired(r) && (
                        <Badge className="text-xs bg-red-100 text-red-700">Hết hạn</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{r.date}</span>
                      <span>Giảng viên: {r.instructor}</span>
                      <span>{r.participants.length} nhân sự</span>
                      {r.expiryDate && <span className="flex items-center gap-1">HH: {r.expiryDate}</span>}
                    </div>
                  </div>
                </div>
                {expanded === r.id ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
              </div>
            </CardHeader>

            {expanded === r.id && (
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1.5">Nhân sự tham gia:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.participants.map((name, i) => (
                        <Badge key={i} className="text-xs bg-slate-100 text-slate-600">{name}</Badge>
                      ))}
                    </div>
                  </div>
                  {r.certificate && (
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      📎 Chứng nhận: {r.certificate}
                    </div>
                  )}
                  {r.notes && <p className="text-xs text-slate-500 italic">{r.notes}</p>}
                  {r.result === 'Chờ kết quả' && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" onClick={() => handleResult(r.id, 'Đạt')} className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700">Đạt</Button>
                      <Button size="sm" onClick={() => handleResult(r.id, 'Không đạt')} className="text-xs h-7 bg-red-600 hover:bg-red-700">Không đạt</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
