'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { CAMERAS, type Camera, type CameraStatus } from '@/src/mockData/security';
import { Video, VideoOff, MapPin, Clock, User, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

const statusConfig: Record<CameraStatus, { className: string; dot: string; icon: React.ReactNode }> = {
  'Hoạt động': {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  'Lỗi': {
    className: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  'Mất kết nối': {
    className: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    icon: <VideoOff className="h-3 w-3" />,
  },
  'Đang bảo trì': {
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-400',
    icon: <Clock className="h-3 w-3" />,
  },
};

export default function CameraTab() {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>(CAMERAS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = cameras.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.deviceCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats: Record<CameraStatus, number> = {
    'Hoạt động': 0, 'Lỗi': 0, 'Mất kết nối': 0, 'Đang bảo trì': 0,
  };
  cameras.forEach((c) => { stats[c.status]++; });

  function handleReport(id: string) {
    toast({ title: 'Đã báo kỹ thuật', description: `Yêu cầu kiểm tra camera ${cameras.find(c => c.id === id)?.name} đã được gửi.` });
  }

  function handleUpdateStatus(id: string, status: CameraStatus) {
    const now = new Date().toLocaleDateString('vi-VN');
    setCameras((prev) => prev.map((c) => c.id === id ? { ...c, status, lastChecked: now } : c));
    toast({ title: 'Cập nhật trạng thái thành công' });
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(stats) as [CameraStatus, number][]).map(([s, count]) => (
          <button
            key={s}
            className={`rounded-lg p-3 border text-left transition-all ${
              filterStatus === s ? 'ring-2 ring-blue-500' : ''
            } ${statusConfig[s].className}`}
            onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${statusConfig[s].dot}`} />
              <span className="text-xl font-bold">{count}</span>
            </div>
            <div className="text-xs opacity-80 mt-0.5">{s}</div>
          </button>
        ))}
      </div>

      {/* Error cameras alert */}
      {(stats['Lỗi'] > 0 || stats['Mất kết nối'] > 0) && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/20 p-3 text-sm text-orange-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>{stats['Lỗi'] + stats['Mất kết nối']} camera</strong> có vấn đề cần kiểm tra.
            Camera không hoạt động tạo điểm mù an ninh.
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm camera, vị trí, mã thiết bị..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {(Object.keys(statusConfig) as CameraStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {/* Camera cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400">Không có camera nào</div>
        )}
        {filtered.map((cam) => (
          <Card
            key={cam.id}
            className={`${
              cam.status === 'Lỗi' || cam.status === 'Mất kết nối'
                ? 'border-orange-300 dark:border-orange-700'
                : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${statusConfig[cam.status].dot} ${
                    cam.status === 'Hoạt động' ? 'animate-pulse' : ''
                  }`} />
                  <div>
                    <div className="font-medium text-sm leading-tight">{cam.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{cam.deviceCode}</div>
                  </div>
                </div>
                <Badge className={`text-xs flex items-center gap-1 ${statusConfig[cam.status].className}`}>
                  {statusConfig[cam.status].icon}
                  {cam.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  {cam.location}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  KT lần cuối: {cam.lastChecked}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <User className="h-3.5 w-3.5" />
                  {cam.assignee}
                </div>
                {cam.notes && (
                  <div className="text-xs text-orange-600 dark:text-orange-400 italic mt-1.5">{cam.notes}</div>
                )}
              </div>

              {cam.status !== 'Hoạt động' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleReport(cam.id)} className="text-xs flex-1 h-7">
                    Báo kỹ thuật
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(cam.id, 'Hoạt động')}
                    className="text-xs h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    Đã sửa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
