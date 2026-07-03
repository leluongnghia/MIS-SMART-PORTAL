'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { GUARD_LOGS, type GuardLog, type ShiftType } from '@/src/mockData/security';
import { Shield, Clock, User, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

const shiftColors: Record<ShiftType, string> = {
  'Sáng': 'bg-amber-100 text-amber-700',
  'Chiều': 'bg-blue-100 text-blue-700',
  'Tối': 'bg-indigo-100 text-indigo-700',
  'Đêm': 'bg-slate-700 text-slate-200',
};

const emptyLog: Omit<GuardLog, 'id'> = {
  shift: 'Sáng',
  staff: [],
  startTime: '',
  gateStatus: '',
  incidents: '',
  handoverNotes: '',
  handoverTo: '',
  status: 'Đang trực',
};

export default function GuardLogTab() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<GuardLog[]>(GUARD_LOGS);
  const [expanded, setExpanded] = useState<string | null>('gl2');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyLog);
  const [staffInput, setStaffInput] = useState('');

  function handleAddStaff() {
    if (!staffInput.trim()) return;
    setForm((f) => ({ ...f, staff: [...f.staff, staffInput.trim()] }));
    setStaffInput('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.staff.length === 0 || !form.startTime) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập nhân sự và giờ bắt đầu', variant: 'destructive' });
      return;
    }
    const newLog: GuardLog = { ...form, id: `gl${Date.now()}` };
    setLogs((prev) => [newLog, ...prev]);
    setForm(emptyLog);
    setStaffInput('');
    setShowForm(false);
    toast({ title: 'Tạo nhật ký thành công', description: `Ca ${form.shift} — ${form.startTime}` });
  }

  function handleHandover(id: string) {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: 'Đã bàn giao', endTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) } : l
      )
    );
    toast({ title: 'Bàn giao ca thành công' });
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Nhật ký ca trực</h3>
          <p className="text-sm text-slate-500">{logs.filter(l => l.status === 'Đang trực').length} ca đang hoạt động</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Tạo nhật ký
        </Button>
      </div>

      {/* Form tạo nhật ký */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-base">Tạo nhật ký ca mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Ca trực</Label>
                <Select value={form.shift} onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value as ShiftType }))}>
                  {(['Sáng', 'Chiều', 'Tối', 'Đêm'] as ShiftType[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Giờ bắt đầu *</Label>
                <Input type="time" required value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Nhân sự trực</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tên nhân sự rồi nhấn Thêm"
                    value={staffInput}
                    onChange={(e) => setStaffInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStaff())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddStaff}>Thêm</Button>
                </div>
                {form.staff.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.staff.map((s, i) => (
                      <Badge key={i} className="bg-blue-100 text-blue-700 cursor-pointer" onClick={() => setForm((f) => ({ ...f, staff: f.staff.filter((_, j) => j !== i) }))}>
                        {s} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Tình hình cổng trường</Label>
                <Input value={form.gateStatus} onChange={(e) => setForm((f) => ({ ...f, gateStatus: e.target.value }))} placeholder="Cổng chính mở bình thường..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Sự việc phát sinh</Label>
                <Input value={form.incidents} onChange={(e) => setForm((f) => ({ ...f, incidents: e.target.value }))} placeholder="Không có sự việc phát sinh" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Nội dung bàn giao ca</Label>
                <Input value={form.handoverNotes} onChange={(e) => setForm((f) => ({ ...f, handoverNotes: e.target.value }))} placeholder="Lưu ý cho ca tiếp theo..." />
              </div>
              <div className="space-y-1">
                <Label>Người nhận bàn giao</Label>
                <Input value={form.handoverTo ?? ''} onChange={(e) => setForm((f) => ({ ...f, handoverTo: e.target.value }))} placeholder="BV. Tên nhân sự..." />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" className="flex-1">Lưu nhật ký</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Log list */}
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className={log.status === 'Đang trực' ? 'border-emerald-300 dark:border-emerald-700' : ''}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${shiftColors[log.shift]} text-xs`}>Ca {log.shift}</Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5" />
                    {log.startTime}{log.endTime ? ` — ${log.endTime}` : ' (đang trực)'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    {log.staff.join(', ')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={log.status === 'Đang trực' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                    {log.status}
                  </Badge>
                  {expanded === log.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>
            </CardHeader>

            {expanded === log.id && (
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Tình hình cổng: </span>
                    <span className="text-slate-600 dark:text-slate-400">{log.gateStatus || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Sự việc phát sinh: </span>
                    <span className="text-slate-600 dark:text-slate-400">{log.incidents || 'Không có'}</span>
                  </div>
                  {log.handoverNotes && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200">
                      <div className="font-medium text-amber-700 dark:text-amber-400 mb-1">📋 Nội dung bàn giao:</div>
                      <div className="text-amber-600 dark:text-amber-300">{log.handoverNotes}</div>
                      {log.handoverTo && (
                        <div className="text-xs text-amber-500 mt-1">Giao cho: {log.handoverTo}</div>
                      )}
                    </div>
                  )}
                  {log.status === 'Đang trực' && (
                    <Button size="sm" variant="outline" onClick={() => handleHandover(log.id)} className="mt-2">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      Bàn giao ca
                    </Button>
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
