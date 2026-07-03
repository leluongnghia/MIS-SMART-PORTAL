'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import {
  OPERATION_EVENTS, type OperationEvent, type EventTask,
} from '@/src/mockData/schedule';
import { CalendarDays, MapPin, CheckCircle2, Clock, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

const PREP_ITEMS = ['Âm thanh & ánh sáng', 'Bàn ghế & sân khấu', 'Vệ sinh', 'Bảo vệ & trật tự', 'Y tế trực', 'Nước uống & hậu cần', 'Trang trí'];
const EVENT_STATUS_COLORS: Record<string, string> = {
  'Lên kế hoạch': 'bg-slate-100 text-slate-600',
  'Đang chuẩn bị': 'bg-amber-100 text-amber-700',
  'Sẵn sàng': 'bg-emerald-100 text-emerald-700',
  'Đang diễn ra': 'bg-blue-100 text-blue-700',
  'Hoàn thành': 'bg-slate-100 text-slate-500',
};
const PREP_STATUS_COLORS: Record<string, string> = {
  'Chưa làm': 'bg-slate-100 text-slate-600',
  'Đang chuẩn bị': 'bg-amber-100 text-amber-700',
  'Hoàn thành': 'bg-emerald-100 text-emerald-700',
};

export default function EventsTab() {
  const { toast } = useToast();
  const [events, setEvents] = useState<OperationEvent[]>(OPERATION_EVENTS);
  const [expanded, setExpanded] = useState<string | null>('ev001');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    startDatetime: '',
    endDatetime: '',
    location: '',
    organizer: '',
    description: '',
  });

  function handleTogglePreCheck(evId: string, idx: number) {
    setEvents(prev =>
      prev.map(ev =>
        ev.id === evId
          ? { ...ev, preChecklist: ev.preChecklist.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c) }
          : ev
      )
    );
  }

  function handleTogglePostCheck(evId: string, idx: number) {
    setEvents(prev =>
      prev.map(ev =>
        ev.id === evId
          ? { ...ev, postChecklist: ev.postChecklist.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c) }
          : ev
      )
    );
  }

  function handlePrepStatus(evId: string, idx: number, status: EventTask['status']) {
    setEvents(prev =>
      prev.map(ev =>
        ev.id === evId
          ? { ...ev, preparations: ev.preparations.map((p, i) => i === idx ? { ...p, status } : p) }
          : ev
      )
    );
  }

  function handleEventStatus(evId: string, status: OperationEvent['status']) {
    setEvents(prev => prev.map(ev => ev.id === evId ? { ...ev, status } : ev));
    toast({ title: 'Cập nhật trạng thái sự kiện' });
  }

  function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.startDatetime || !form.location) {
      toast({ title: 'Thiếu thông tin', description: 'Nhập tên, thời gian và địa điểm', variant: 'destructive' });
      return;
    }
    const newEv: OperationEvent = {
      id: `ev${Date.now()}`,
      ...form,
      preparations: PREP_ITEMS.map(item => ({ item, assignedTo: '', status: 'Chưa làm' })),
      preChecklist: [
        { item: 'Kiểm tra thiết bị', checked: false },
        { item: 'Bố trí khu vực', checked: false },
      ],
      postChecklist: [
        { item: 'Thu dọn', checked: false },
        { item: 'Báo cáo sự kiện', checked: false },
      ],
      status: 'Lên kế hoạch',
    };
    setEvents(prev => [newEv, ...prev]);
    setForm({ title: '', startDatetime: '', endDatetime: '', location: '', organizer: '', description: '' });
    setShowForm(false);
    toast({ title: '✅ Tạo sự kiện thành công', description: newEv.title });
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Sự kiện cần hỗ trợ vận hành</h3>
          <p className="text-sm text-slate-500">{events.filter(e => e.status !== 'Hoàn thành').length} sự kiện đang theo dõi</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4 mr-1" />Tạo sự kiện
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tạo sự kiện mới</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-sm font-medium">Tên sự kiện *</label>
                <Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: Lễ khai giảng..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Bắt đầu *</label>
                <Input type="datetime-local" required value={form.startDatetime} onChange={e => setForm(f => ({ ...f, startDatetime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Kết thúc</label>
                <Input type="datetime-local" value={form.endDatetime} onChange={e => setForm(f => ({ ...f, endDatetime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Địa điểm *</label>
                <Input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Hội trường, Sân trường..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Bộ phận tổ chức</label>
                <Input value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} placeholder="Ban Giám Hiệu..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-sm font-medium">Mô tả</label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả sự kiện..." />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Tạo sự kiện</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events */}
      <div className="space-y-4">
        {events.map(ev => {
          const preOK = ev.preChecklist.filter(c => c.checked).length;
          const postOK = ev.postChecklist.filter(c => c.checked).length;
          const prepDone = ev.preparations.filter(p => p.status === 'Hoàn thành').length;

          return (
            <Card key={ev.id}>
              <CardHeader className="cursor-pointer" onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CalendarDays className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold">{ev.title}</span>
                      <Badge className={`text-xs ${EVENT_STATUS_COLORS[ev.status]}`}>{ev.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.startDatetime} → {ev.endDatetime}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>
                      <span>Tổ chức: {ev.organizer}</span>
                    </div>
                    {/* Mini progress */}
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-slate-500">Hạng mục: <strong className="text-slate-700 dark:text-slate-300">{prepDone}/{ev.preparations.length}</strong></span>
                      <span className="text-slate-500">Checklist trước: <strong className="text-slate-700 dark:text-slate-300">{preOK}/{ev.preChecklist.length}</strong></span>
                    </div>
                  </div>
                  {expanded === ev.id ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </div>
              </CardHeader>

              {expanded === ev.id && (
                <CardContent>
                  <div className="space-y-5">
                    {/* Description */}
                    {ev.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">{ev.description}</p>
                    )}

                    {/* Preparations */}
                    <div>
                      <div className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">📋 Hạng mục chuẩn bị ({prepDone}/{ev.preparations.length})</div>
                      <div className="space-y-2">
                        {ev.preparations.map((prep, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`flex-1 text-sm ${prep.status === 'Hoàn thành' ? 'text-emerald-600' : prep.status === 'Đang chuẩn bị' ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
                              {prep.item}
                              {prep.assignedTo && <span className="text-slate-400 ml-2">· {prep.assignedTo}</span>}
                            </div>
                            <Select
                              value={prep.status}
                              onChange={e => handlePrepStatus(ev.id, i, e.target.value as EventTask['status'])}
                              className="w-36 h-7 text-xs"
                            >
                              <option value="Chưa làm">Chưa làm</option>
                              <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                              <option value="Hoàn thành">Hoàn thành</option>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checklists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">✅ Checklist trước sự kiện ({preOK}/{ev.preChecklist.length})</div>
                        <div className="space-y-1.5">
                          {ev.preChecklist.map((c, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 text-sm p-2 rounded-lg cursor-pointer transition-colors ${
                                c.checked ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100'
                              }`}
                              onClick={() => handleTogglePreCheck(ev.id, i)}
                            >
                              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${c.checked ? 'text-emerald-500' : 'text-slate-300'}`} />
                              <span className={c.checked ? 'line-through text-slate-400' : ''}>{c.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">🧹 Checklist sau sự kiện ({postOK}/{ev.postChecklist.length})</div>
                        <div className="space-y-1.5">
                          {ev.postChecklist.map((c, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 text-sm p-2 rounded-lg cursor-pointer transition-colors ${
                                c.checked ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100'
                              }`}
                              onClick={() => handleTogglePostCheck(ev.id, i)}
                            >
                              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${c.checked ? 'text-blue-500' : 'text-slate-300'}`} />
                              <span className={c.checked ? 'line-through text-slate-400' : ''}>{c.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Status update */}
                    {ev.status !== 'Hoàn thành' && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t">
                        {(['Đang chuẩn bị', 'Sẵn sàng', 'Đang diễn ra', 'Hoàn thành'] as const).map(s => (
                          <Button
                            key={s}
                            size="sm"
                            variant={ev.status === s ? 'default' : 'outline'}
                            onClick={() => handleEventStatus(ev.id, s)}
                            className="text-xs h-7"
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
