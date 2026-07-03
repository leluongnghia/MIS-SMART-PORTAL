'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { FIRE_SAFETY_ITEMS, type FireSafetyItem } from '@/src/mockData/security';
import {
  Flame, MapPin, Clock, User, Search, AlertTriangle, CheckCircle2,
  Wrench, ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

type ItemStatus = FireSafetyItem['status'];

const statusConfig: Record<ItemStatus, { className: string; icon: React.ReactNode }> = {
  'Tốt': { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Cần bảo dưỡng': { className: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Wrench className="h-3 w-3" /> },
  'Hỏng': { className: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
  'Quá hạn kiểm tra': { className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock className="h-3 w-3" /> },
};

const typeIcons: Record<string, React.ReactNode> = {
  'Bình chữa cháy': <Flame className="h-4 w-4 text-red-500" />,
  'Lối thoát hiểm': <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  'Đèn exit': <ShieldCheck className="h-4 w-4 text-blue-500" />,
  'Nội quy an toàn': <ShieldCheck className="h-4 w-4 text-slate-500" />,
  'Thiết bị báo cháy': <AlertTriangle className="h-4 w-4 text-orange-500" />,
};

export default function FireSafetyTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<FireSafetyItem[]>(FIRE_SAFETY_ITEMS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || item.type === filterType;
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const overdueItems = items.filter((i) => i.status === 'Quá hạn kiểm tra' || i.status === 'Hỏng' || i.status === 'Cần bảo dưỡng');

  function handleInspect(id: string) {
    const today = new Date().toLocaleDateString('vi-VN');
    const next = new Date();
    next.setMonth(next.getMonth() + 6);
    const nextDate = next.toLocaleDateString('vi-VN');
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: 'Tốt', lastInspected: today, nextInspection: nextDate } : i
      )
    );
    toast({ title: '✅ Đã cập nhật kiểm tra', description: `Hạn kiểm tra tiếp theo: ${nextDate}` });
  }

  function handleReport(id: string) {
    setItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, status: 'Cần bảo dưỡng' } : i)
    );
    toast({ title: 'Đã báo cáo cần bảo dưỡng', description: 'Yêu cầu bảo dưỡng đã được tạo.' });
  }

  const types = [...new Set(items.map((i) => i.type))];

  return (
    <div className="space-y-4 mt-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.keys(statusConfig) as ItemStatus[]).map((s) => {
          const count = items.filter((i) => i.status === s).length;
          return (
            <button
              key={s}
              className={`rounded-lg p-3 border text-left transition-all ${
                filterStatus === s ? 'ring-2 ring-blue-500' : ''
              } ${statusConfig[s].className}`}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
            >
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs opacity-80 mt-0.5">{s}</div>
            </button>
          );
        })}
      </div>

      {/* Warning banner */}
      {overdueItems.length > 0 && (
        <div className="rounded-xl border-2 border-orange-400 bg-orange-50 dark:bg-orange-950/20 p-4">
          <div className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-2">
            <AlertTriangle className="h-5 w-5" />
            {overdueItems.length} thiết bị PCCC cần chú ý
          </div>
          <div className="space-y-1">
            {overdueItems.map((item) => (
              <div key={item.id} className="text-sm text-orange-600 flex items-center gap-2">
                <Badge className={`text-xs ${statusConfig[item.status].className}`}>{item.status}</Badge>
                {item.name} — {item.location}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm thiết bị, vị trí..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Tất cả loại</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {(Object.keys(statusConfig) as ItemStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {/* Items table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Thiết bị</th>
                  <th className="px-4 py-3 font-medium">Vị trí</th>
                  <th className="px-4 py-3 font-medium">Kiểm tra gần nhất</th>
                  <th className="px-4 py-3 font-medium">Hạn tiếp theo</th>
                  <th className="px-4 py-3 font-medium">Phụ trách</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">Không có dữ liệu</td></tr>
                )}
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                      item.status === 'Quá hạn kiểm tra' || item.status === 'Hỏng'
                        ? 'bg-orange-50/50 dark:bg-orange-950/10'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {typeIcons[item.type] ?? <Flame className="h-4 w-4 text-slate-400" />}
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.lastInspected}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        item.status === 'Quá hạn kiểm tra' ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {item.nextInspection}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.assignee}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs flex items-center gap-1 w-fit ${statusConfig[item.status].className}`}>
                        {statusConfig[item.status].icon}
                        {item.status}
                      </Badge>
                      {item.notes && (
                        <div className="text-xs text-slate-400 mt-0.5 italic">{item.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => handleInspect(item.id)} className="text-xs h-7 text-emerald-600 border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Đã KT
                        </Button>
                        {item.status === 'Tốt' && (
                          <Button size="sm" variant="outline" onClick={() => handleReport(item.id)} className="text-xs h-7">
                            <Wrench className="h-3 w-3 mr-1" />
                            Báo lỗi
                          </Button>
                        )}
                      </div>
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
