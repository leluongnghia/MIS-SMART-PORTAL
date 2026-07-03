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
  SECURITY_INCIDENTS,
  type SecurityIncident,
  type SeverityLevel,
  type IncidentStatus,
  type IncidentType,
} from '@/src/mockData/security';
import {
  AlertTriangle, Search, Filter, Plus, ChevronDown, ChevronUp,
  Clock, MapPin, User, FileText,
} from 'lucide-react';

const severityConfig: Record<SeverityLevel, { className: string; pulse?: boolean }> = {
  'Khẩn cấp': { className: 'bg-red-100 text-red-700 border-red-300', pulse: true },
  'Cao': { className: 'bg-orange-100 text-orange-700 border-orange-300' },
  'Trung bình': { className: 'bg-amber-100 text-amber-700 border-amber-300' },
  'Thấp': { className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const statusConfig: Record<IncidentStatus, string> = {
  'Mới ghi nhận': 'bg-red-100 text-red-700',
  'Đang xử lý': 'bg-amber-100 text-amber-700',
  'Chờ xác minh': 'bg-blue-100 text-blue-700',
  'Đã xử lý': 'bg-emerald-100 text-emerald-700',
  'Đóng sự cố': 'bg-slate-100 text-slate-500',
};

const INCIDENT_TYPES: IncidentType[] = [
  'Người lạ', 'Học sinh ra khỏi khu vực', 'Té ngã', 'Xô xát',
  'Mất đồ', 'Va chạm', 'Cháy nổ', 'Nguy cơ mất an toàn', 'Sự cố khác',
];

const emptyIncident: Omit<SecurityIncident, 'id' | 'createdAt'> = {
  type: 'Sự cố khác',
  severity: 'Thấp',
  location: '',
  occurredAt: '',
  reportedBy: '',
  handledBy: '',
  studentsInvolved: [],
  description: '',
  status: 'Mới ghi nhận',
  resolution: '',
};

export default function IncidentsTab() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<SecurityIncident[]>(SECURITY_INCIDENTS);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyIncident);
  const [studentInput, setStudentInput] = useState('');
  const [updateStatus, setUpdateStatus] = useState<Record<string, IncidentStatus>>({});

  const filtered = incidents.filter((inc) => {
    const matchSearch =
      inc.type.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === 'all' || inc.severity === filterSeverity;
    const matchStatus = filterStatus === 'all' || inc.status === filterStatus;
    return matchSearch && matchSeverity && matchStatus;
  });

  // Sort: khẩn cấp lên đầu, rồi cao, rồi theo thời gian
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<SeverityLevel, number> = { 'Khẩn cấp': 0, 'Cao': 1, 'Trung bình': 2, 'Thấp': 3 };
    if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
    return b.createdAt.localeCompare(a.createdAt);
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.location || !form.description || !form.reportedBy) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập đầy đủ thông tin bắt buộc', variant: 'destructive' });
      return;
    }
    const newInc: SecurityIncident = {
      ...form,
      id: `sc${String(incidents.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      occurredAt: form.occurredAt || new Date().toLocaleString('vi-VN'),
    };
    setIncidents((prev) => [newInc, ...prev]);
    setShowForm(false);
    setForm(emptyIncident);
    setStudentInput('');
    if (newInc.severity === 'Khẩn cấp' || newInc.severity === 'Cao') {
      toast({
        title: '🚨 Sự cố nghiêm trọng đã được ghi nhận!',
        description: `[${newInc.severity}] ${newInc.type} — ${newInc.location}. Đã gửi thông báo cho BGH và bộ phận liên quan.`,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Ghi nhận sự cố thành công', description: `${newInc.type} — ${newInc.location}` });
    }
  }

  function handleStatusUpdate(id: string) {
    const newStatus = updateStatus[id];
    if (!newStatus) return;
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
    setUpdateStatus((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    toast({ title: 'Cập nhật trạng thái thành công' });
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Urgent banner */}
      {incidents.some(i => i.severity === 'Khẩn cấp' && i.status !== 'Đã xử lý' && i.status !== 'Đóng sự cố') && (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-700">🚨 CẢNH BÁO KHẨN CẤP</div>
            {incidents.filter(i => i.severity === 'Khẩn cấp' && i.status !== 'Đã xử lý').map(i => (
              <div key={i.id} className="text-sm text-red-600 mt-1">{i.type} — {i.location} — {i.occurredAt}</div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & action */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm sự cố..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="all">Tất cả mức độ</option>
          {(['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp'] as SeverityLevel[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {(['Mới ghi nhận', 'Đang xử lý', 'Chờ xác minh', 'Đã xử lý', 'Đóng sự cố'] as IncidentStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Button onClick={() => setShowForm((v) => !v)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Tạo sự cố
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Ghi nhận sự cố mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Loại sự cố *</Label>
                <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as IncidentType }))}>
                  {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Mức độ *</Label>
                <Select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as SeverityLevel }))}>
                  {(['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'] as SeverityLevel[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Vị trí xảy ra *</Label>
                <Input required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Hành lang tầng 2, Cổng trường..." />
              </div>
              <div className="space-y-1">
                <Label>Thời gian xảy ra</Label>
                <Input type="datetime-local" value={form.occurredAt} onChange={(e) => setForm((f) => ({ ...f, occurredAt: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Người phát hiện *</Label>
                <Input required value={form.reportedBy} onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))} placeholder="BV. Tên, GV. Tên..." />
              </div>
              <div className="space-y-1">
                <Label>Người xử lý</Label>
                <Input value={form.handledBy ?? ''} onChange={(e) => setForm((f) => ({ ...f, handledBy: e.target.value }))} placeholder="BV. Tên..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Mô tả sự cố *</Label>
                <Input required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Mô tả chi tiết sự cố..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Học sinh liên quan</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tên HS - Lớp rồi nhấn Thêm"
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && studentInput.trim()) {
                        e.preventDefault();
                        setForm((f) => ({ ...f, studentsInvolved: [...(f.studentsInvolved ?? []), studentInput.trim()] }));
                        setStudentInput('');
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => {
                    if (studentInput.trim()) {
                      setForm((f) => ({ ...f, studentsInvolved: [...(f.studentsInvolved ?? []), studentInput.trim()] }));
                      setStudentInput('');
                    }
                  }}>Thêm</Button>
                </div>
                {(form.studentsInvolved ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(form.studentsInvolved ?? []).map((s, i) => (
                      <Badge key={i} className="bg-blue-100 text-blue-700 cursor-pointer" onClick={() =>
                        setForm((f) => ({ ...f, studentsInvolved: f.studentsInvolved?.filter((_, j) => j !== i) }))
                      }>{s} ×</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit" className={form.severity === 'Khẩn cấp' || form.severity === 'Cao' ? 'bg-red-600 hover:bg-red-700' : ''}>
                  Ghi nhận sự cố
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Incidents list */}
      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="text-center py-10 text-slate-400">Không có sự cố nào</div>
        )}
        {sorted.map((inc) => (
          <Card
            key={inc.id}
            className={`${
              inc.severity === 'Khẩn cấp' && inc.status !== 'Đã xử lý'
                ? 'border-red-400 dark:border-red-700 shadow-red-100 shadow-md'
                : inc.severity === 'Cao' && inc.status !== 'Đã xử lý'
                ? 'border-orange-300 dark:border-orange-700'
                : ''
            }`}
          >
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(inc.severity === 'Khẩn cấp' || inc.severity === 'Cao') && inc.status !== 'Đã xử lý' && (
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white">{inc.type}</span>
                    <Badge className={`text-xs ${severityConfig[inc.severity].className}`}>{inc.severity}</Badge>
                    <Badge className={`text-xs ${statusConfig[inc.status]}`}>{inc.status}</Badge>
                    <span className="text-xs text-slate-400">#{inc.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{inc.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{inc.occurredAt}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />Báo: {inc.reportedBy}</span>
                  </div>
                </div>
                {expanded === inc.id ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
              </div>
            </CardHeader>

            {expanded === inc.id && (
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Mô tả: </span>
                    <span className="text-slate-600 dark:text-slate-400">{inc.description}</span>
                  </div>
                  {inc.handledBy && (
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Người xử lý: </span>
                      <span className="text-slate-600 dark:text-slate-400">{inc.handledBy}</span>
                    </div>
                  )}
                  {(inc.studentsInvolved ?? []).length > 0 && (
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Học sinh liên quan: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {inc.studentsInvolved!.map((s, i) => (
                          <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {inc.resolution && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200">
                      <div className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                        <FileText className="h-3.5 w-3.5 inline mr-1" />Biên bản xử lý:
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-300">{inc.resolution}</div>
                    </div>
                  )}

                  {/* Status update */}
                  {inc.status !== 'Đóng sự cố' && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Select
                        value={updateStatus[inc.id] ?? inc.status}
                        onChange={(e) => setUpdateStatus((prev) => ({ ...prev, [inc.id]: e.target.value as IncidentStatus }))}
                        className="flex-1"
                      >
                        {(['Mới ghi nhận', 'Đang xử lý', 'Chờ xác minh', 'Đã xử lý', 'Đóng sự cố'] as IncidentStatus[]).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(inc.id)} className="shrink-0">
                        Cập nhật
                      </Button>
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
