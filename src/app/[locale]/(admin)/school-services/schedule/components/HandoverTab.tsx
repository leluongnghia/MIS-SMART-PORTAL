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
  SHIFT_HANDOVERS, type ShiftHandover, type ShiftType,
} from '@/src/mockData/schedule';
import { Shield, Plus, ChevronDown, ChevronUp, CheckCircle2, Clock, X } from 'lucide-react';

const SHIFT_COLORS: Record<ShiftType, string> = {
  'Sáng': 'bg-amber-100 text-amber-700',
  'Chiều': 'bg-blue-100 text-blue-700',
  'Tối': 'bg-indigo-100 text-indigo-700',
  'Đêm': 'bg-slate-700 text-slate-200',
};

const emptyHandover: Omit<ShiftHandover, 'id'> = {
  shift: 'Sáng',
  handoverBy: '',
  handoverTo: '',
  date: '2026-07-03',
  completedItems: [],
  pendingItems: [],
  incidents: '',
  assets: '',
  status: 'Chờ xác nhận',
};

export default function HandoverTab() {
  const { toast } = useToast();
  const [handovers, setHandovers] = useState<ShiftHandover[]>(SHIFT_HANDOVERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyHandover);
  const [completedInput, setCompletedInput] = useState('');
  const [pendingInput, setPendingInput] = useState('');
  const [expanded, setExpanded] = useState<string | null>('sh001');

  function addItem(type: 'completed' | 'pending') {
    const val = type === 'completed' ? completedInput : pendingInput;
    if (!val.trim()) return;
    setForm(f => ({
      ...f,
      completedItems: type === 'completed' ? [...f.completedItems, val.trim()] : f.completedItems,
      pendingItems: type === 'pending' ? [...f.pendingItems, val.trim()] : f.pendingItems,
    }));
    if (type === 'completed') setCompletedInput('');
    else setPendingInput('');
  }

  function removeItem(type: 'completed' | 'pending', idx: number) {
    setForm(f => ({
      ...f,
      completedItems: type === 'completed' ? f.completedItems.filter((_, i) => i !== idx) : f.completedItems,
      pendingItems: type === 'pending' ? f.pendingItems.filter((_, i) => i !== idx) : f.pendingItems,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.handoverBy.trim() || !form.handoverTo.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Nhập người bàn giao và người nhận', variant: 'destructive' });
      return;
    }
    const newH: ShiftHandover = { ...form, id: `sh${Date.now()}` };
    setHandovers(prev => [newH, ...prev]);
    setForm(emptyHandover);
    setCompletedInput('');
    setPendingInput('');
    setShowForm(false);
    toast({ title: '✅ Tạo bàn giao ca thành công', description: `Ca ${form.shift} — ${form.date}` });
  }

  function handleConfirm(id: string) {
    const now = new Date().toLocaleString('vi-VN');
    setHandovers(prev =>
      prev.map(h => h.id === id ? { ...h, status: 'Đã xác nhận', confirmedAt: now, confirmedBy: h.handoverTo } : h)
    );
    toast({ title: 'Xác nhận bàn giao thành công' });
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Bàn giao ca</h3>
          <p className="text-sm text-slate-500">
            {handovers.filter(h => h.status === 'Chờ xác nhận').length} ca chờ xác nhận
          </p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4 mr-1" />Tạo bàn giao
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tạo biên bản bàn giao ca</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label>Ca trực</Label>
                  <Select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value as ShiftType }))}>
                    {(['Sáng', 'Chiều', 'Tối', 'Đêm'] as ShiftType[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Ngày</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Người bàn giao *</Label>
                  <Input required value={form.handoverBy} onChange={e => setForm(f => ({ ...f, handoverBy: e.target.value }))} placeholder="BV. Nguyễn..." />
                </div>
                <div className="space-y-1">
                  <Label>Người nhận *</Label>
                  <Input required value={form.handoverTo} onChange={e => setForm(f => ({ ...f, handoverTo: e.target.value }))} placeholder="BV. Trần..." />
                </div>
              </div>

              {/* Completed items */}
              <div className="space-y-2">
                <Label>Nội dung đã hoàn thành</Label>
                <div className="flex gap-2">
                  <Input
                    value={completedInput}
                    onChange={e => setCompletedInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('completed'))}
                    placeholder="Thêm hạng mục đã hoàn thành..."
                  />
                  <Button type="button" variant="outline" onClick={() => addItem('completed')}>Thêm</Button>
                </div>
                {form.completedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-3 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="flex-1">{item}</span>
                    <button type="button" onClick={() => removeItem('completed', i)} className="text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>

              {/* Pending items */}
              <div className="space-y-2">
                <Label>Nội dung còn tồn đọng</Label>
                <div className="flex gap-2">
                  <Input
                    value={pendingInput}
                    onChange={e => setPendingInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('pending'))}
                    placeholder="Thêm hạng mục còn tồn..."
                  />
                  <Button type="button" variant="outline" onClick={() => addItem('pending')}>Thêm</Button>
                </div>
                {form.pendingItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="flex-1">{item}</span>
                    <button type="button" onClick={() => removeItem('pending', i)} className="text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Sự cố cần theo dõi</Label>
                  <Input value={form.incidents} onChange={e => setForm(f => ({ ...f, incidents: e.target.value }))} placeholder="Mô tả sự cố nếu có..." />
                </div>
                <div className="space-y-1">
                  <Label>Tài sản / Vật tư bàn giao</Label>
                  <Input value={form.assets} onChange={e => setForm(f => ({ ...f, assets: e.target.value }))} placeholder="Bộ đàm: 2, Chìa khoá: 3..." />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Tạo biên bản</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Handover list */}
      <div className="space-y-3">
        {handovers.map(h => (
          <Card key={h.id} className={h.status === 'Chờ xác nhận' ? 'border-amber-300 dark:border-amber-700' : ''}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${SHIFT_COLORS[h.shift]} text-xs`}>Ca {h.shift}</Badge>
                  <span className="text-sm font-medium">{h.date}</span>
                  <span className="text-sm text-slate-500">{h.handoverBy} → {h.handoverTo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${h.status === 'Đã xác nhận' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {h.status}
                  </Badge>
                  {expanded === h.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>
            </CardHeader>

            {expanded === h.id && (
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Đã hoàn thành
                    </div>
                    <div className="space-y-1.5">
                      {h.completedItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded px-2.5 py-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Còn tồn đọng
                    </div>
                    <div className="space-y-1.5">
                      {h.pendingItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded px-2.5 py-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                      {h.pendingItems.length === 0 && <span className="text-slate-400 text-xs">Không có</span>}
                    </div>
                  </div>
                </div>

                {(h.incidents || h.assets) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {h.incidents && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                        <div className="font-medium text-orange-700 dark:text-orange-400 mb-1">⚠️ Sự cố cần theo dõi</div>
                        <div className="text-orange-600 dark:text-orange-300">{h.incidents}</div>
                      </div>
                    )}
                    {h.assets && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200">
                        <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">📦 Tài sản bàn giao</div>
                        <div className="text-slate-600 dark:text-slate-400">{h.assets}</div>
                      </div>
                    )}
                  </div>
                )}

                {h.status === 'Chờ xác nhận' && (
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button onClick={() => handleConfirm(h.id)} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Xác nhận bàn giao
                    </Button>
                  </div>
                )}
                {h.confirmedAt && (
                  <div className="mt-2 text-xs text-slate-400 text-right">
                    Xác nhận bởi {h.confirmedBy} lúc {h.confirmedAt}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
