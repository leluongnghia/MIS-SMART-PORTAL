'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { PICKUP_RECORDS, type PickupRecord, type PickupStatus } from '@/src/mockData/security';
import { UserCheck, AlertTriangle, Search, Clock, CheckCircle2, User } from 'lucide-react';

const statusConfig: Record<PickupStatus, { className: string; icon: React.ReactNode }> = {
  'Đã đón': {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  'Chưa đón': {
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: <Clock className="h-3 w-3" />,
  },
  'Đón muộn': {
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock className="h-3 w-3" />,
  },
  'Đón thay': {
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <User className="h-3 w-3" />,
  },
  'Bất thường': {
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

export default function PickupTab() {
  const { toast } = useToast();
  const [records, setRecords] = useState<PickupRecord[]>(PICKUP_RECORDS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState({ pickedBy: '', relation: '', phone: '', notes: '' });

  const filtered = records.filter((r) => {
    const matchSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.class.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats: Record<PickupStatus, number> = {
    'Đã đón': 0, 'Chưa đón': 0, 'Đón muộn': 0, 'Đón thay': 0, 'Bất thường': 0,
  };
  records.forEach((r) => { stats[r.status]++; });

  function handleConfirm(id: string) {
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const rec = records.find((r) => r.id === id)!;
    const isAuthorized = rec.authorizedPickups.some(
      (a) => a.name.toLowerCase() === confirmData.pickedBy.toLowerCase()
    );
    const newStatus: PickupStatus = !isAuthorized ? 'Bất thường' :
      confirmData.relation !== rec.authorizedPickups.find(a => a.name === confirmData.pickedBy)?.relation ? 'Đón thay' :
      'Đã đón';

    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              pickedBy: confirmData.pickedBy,
              pickedByRelation: confirmData.relation,
              pickedByPhone: confirmData.phone,
              time: now,
              notes: confirmData.notes,
            }
          : r
      )
    );
    setConfirmId(null);
    setConfirmData({ pickedBy: '', relation: '', phone: '', notes: '' });

    if (newStatus === 'Bất thường') {
      toast({
        title: '⚠️ Cảnh báo bất thường!',
        description: `Người đón ${confirmData.pickedBy} không trong danh sách được phép. Đã tạo sự cố an ninh.`,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Xác nhận đón thành công', description: `${rec.studentName} — ${newStatus}` });
    }
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Alert: Bất thường */}
      {stats['Bất thường'] > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/20 p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <span className="font-semibold text-red-700">Cảnh báo: </span>
            <span className="text-red-600 text-sm">{stats['Bất thường']} trường hợp đón bất thường cần xử lý ngay</span>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(stats) as [PickupStatus, number][]).map(([s, count]) => (
          <button
            key={s}
            className={`rounded-lg p-2 border text-center transition-all ${
              filterStatus === s ? 'ring-2 ring-blue-500' : ''
            } ${statusConfig[s].className}`}
            onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
          >
            <div className="text-xl font-bold">{count}</div>
            <div className="text-xs opacity-80 leading-tight mt-0.5">{s}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm học sinh, lớp..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {(Object.keys(statusConfig) as PickupStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">Không có dữ liệu</div>
        )}
        {filtered.map((rec) => (
          <Card key={rec.id} className={rec.status === 'Bất thường' ? 'border-red-300 dark:border-red-700' : ''}>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white">{rec.studentName}</span>
                    <Badge variant="outline" className="text-xs">{rec.class}</Badge>
                    <Badge className={`text-xs flex items-center gap-1 ${statusConfig[rec.status].className}`}>
                      {statusConfig[rec.status].icon}
                      {rec.status}
                    </Badge>
                  </div>

                  {/* Authorized pickups */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500">Được phép đón:</span>
                    {rec.authorizedPickups.map((a) => (
                      <span key={a.name} className="text-xs bg-slate-100 dark:bg-slate-700 rounded px-2 py-0.5">
                        {a.name} ({a.relation}) — {a.phone}
                      </span>
                    ))}
                  </div>

                  {/* Pickup info */}
                  {rec.pickedBy && (
                    <div className={`mt-2 text-sm rounded-lg p-2 ${
                      rec.status === 'Bất thường'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/20'
                        : 'bg-slate-50 text-slate-700 dark:bg-slate-800/50'
                    }`}>
                      <strong>Người đón:</strong> {rec.pickedBy} ({rec.pickedByRelation}) — {rec.pickedByPhone}
                      {rec.time && <> | <Clock className="h-3 w-3 inline mx-1" />{rec.time}</>}
                      {rec.confirmedBy && <> | Xác nhận: {rec.confirmedBy}</>}
                    </div>
                  )}

                  {rec.notes && (
                    <div className="mt-1.5 text-xs text-slate-500 italic">{rec.notes}</div>
                  )}
                </div>

                {/* Action */}
                {rec.status === 'Chưa đón' && (
                  <div>
                    {confirmId === rec.id ? (
                      <div className="space-y-2 min-w-[220px]">
                        <Input
                          placeholder="Tên người đón"
                          value={confirmData.pickedBy}
                          onChange={(e) => setConfirmData((d) => ({ ...d, pickedBy: e.target.value }))}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Quan hệ (Bố/Mẹ/...)"
                          value={confirmData.relation}
                          onChange={(e) => setConfirmData((d) => ({ ...d, relation: e.target.value }))}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Số điện thoại"
                          value={confirmData.phone}
                          onChange={(e) => setConfirmData((d) => ({ ...d, phone: e.target.value }))}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Ghi chú (nếu có)"
                          value={confirmData.notes}
                          onChange={(e) => setConfirmData((d) => ({ ...d, notes: e.target.value }))}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleConfirm(rec.id)} className="flex-1 text-xs">Xác nhận</Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmId(null)} className="text-xs">Hủy</Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setConfirmId(rec.id); setConfirmData({ pickedBy: '', relation: '', phone: '', notes: '' }); }}
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        Xác nhận đón
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
