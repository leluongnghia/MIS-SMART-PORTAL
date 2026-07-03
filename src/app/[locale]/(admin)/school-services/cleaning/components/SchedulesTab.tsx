'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { Dialog } from '@/src/components/ui/dialog';
import { Search, Plus, Calendar } from 'lucide-react';
import { CLEANING_SCHEDULES, Schedule } from '@/src/mockData/cleaning';

export default function SchedulesTab() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Hoàn thành</Badge>;
      case 'Đang thực hiện':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Đang thực hiện</Badge>;
      case 'Chưa thực hiện':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Chưa thực hiện</Badge>;
      case 'Quá hạn':
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Quá hạn</Badge>;
      case 'Cần làm lại':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Cần làm lại</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thành công", description: "Đã lưu lịch phân công vệ sinh." });
    setIsAddOpen(false);
    setEditSchedule(null);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Tìm kiếm lịch..." className="pl-9" />
          </div>
          <Select defaultValue="today" className="w-[150px]">
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </Select>
          <Select defaultValue="all" className="w-[150px]">
            <option value="all">Tất cả</option>
            <option value="Chưa thực hiện">Chưa thực hiện</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Quá hạn">Quá hạn</option>
          </Select>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Phân công lịch
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Lịch vệ sinh</CardTitle>
          <CardDescription>Theo dõi phân công và trạng thái ca làm việc</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Ngày</th>
                  <th className="px-4 py-3 font-medium">Ca trực</th>
                  <th className="px-4 py-3 font-medium">Khu vực</th>
                  <th className="px-4 py-3 font-medium">Người phụ trách</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {CLEANING_SCHEDULES.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> {schedule.date}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{schedule.shift}</td>
                    <td className="px-4 py-3">{schedule.areaName}</td>
                    <td className="px-4 py-3 text-slate-500">{schedule.assignee}</td>
                    <td className="px-4 py-3">{getStatusBadge(schedule.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditSchedule(schedule)}>Cập nhật</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen || !!editSchedule} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditSchedule(null); } }} title={editSchedule ? "Cập nhật lịch trực" : "Phân công lịch vệ sinh"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày thực hiện *</label>
              <Input type="date" required defaultValue={editSchedule?.date || new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ca trực *</label>
              <Select defaultValue={editSchedule?.shift || "Sáng"}>
                <option value="Sáng">Sáng (06:00 - 10:00)</option>
                <option value="Trưa">Trưa (11:00 - 13:00)</option>
                <option value="Chiều">Chiều (14:00 - 17:00)</option>
                <option value="Tối">Tối (18:00 - 21:00)</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Khu vực *</label>
            <Select defaultValue={editSchedule?.areaName || ""}>
              <option value="">-- Chọn khu vực --</option>
              <option value="Nhà vệ sinh nam tầng 1">Nhà vệ sinh nam tầng 1</option>
              <option value="Nhà ăn học sinh">Nhà ăn học sinh</option>
              <option value="Hành lang khu B">Hành lang khu B</option>
              <option value="Sân bóng rổ">Sân bóng rổ</option>
              <option value="Phòng Lab Hóa">Phòng Lab Hóa</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Người phụ trách *</label>
            <Input required defaultValue={editSchedule?.assignee} placeholder="Tên nhân viên..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái</label>
            <Select defaultValue={editSchedule?.status || "Chưa thực hiện"}>
              <option value="Chưa thực hiện">Chưa thực hiện</option>
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Quá hạn">Quá hạn</option>
              <option value="Cần làm lại">Cần làm lại</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setEditSchedule(null); }}>Hủy bỏ</Button>
            <Button type="submit">Lưu phân công</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
