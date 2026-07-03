'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { Dialog } from '@/src/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { CLEANING_AREAS, Area } from '@/src/mockData/cleaning';

export default function AreasTab() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đang hoạt động':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Đang hoạt động</Badge>;
      case 'Tạm dừng':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Tạm dừng</Badge>;
      case 'Cần kiểm tra':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Cần kiểm tra</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thành công", description: "Đã lưu thông tin khu vực vệ sinh." });
    setIsAddOpen(false);
    setEditArea(null);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Tìm kiếm khu vực..." className="pl-9" />
          </div>
          <Select defaultValue="all" className="w-[180px]">
            <option value="all">Tất cả</option>
            <option value="Lớp học">Lớp học</option>
            <option value="Nhà vệ sinh">Nhà vệ sinh</option>
            <option value="Hành lang">Hành lang</option>
            <option value="Sân trường">Sân trường</option>
            <option value="Nhà ăn">Nhà ăn</option>
          </Select>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm khu vực
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Danh sách khu vực vệ sinh</CardTitle>
          <CardDescription>Quản lý các khu vực cần làm sạch trong trường</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Mã KV</th>
                  <th className="px-4 py-3 font-medium">Tên khu vực</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Tầng/Khu</th>
                  <th className="px-4 py-3 font-medium">Người phụ trách</th>
                  <th className="px-4 py-3 font-medium">Tần suất</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {CLEANING_AREAS.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium">{area.code}</td>
                    <td className="px-4 py-3">{area.name}</td>
                    <td className="px-4 py-3 text-slate-500">{area.type}</td>
                    <td className="px-4 py-3 text-slate-500">{area.floor}</td>
                    <td className="px-4 py-3 text-slate-500">{area.assignee}</td>
                    <td className="px-4 py-3 text-slate-500">{area.frequency}</td>
                    <td className="px-4 py-3">{getStatusBadge(area.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditArea(area)}>Sửa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen || !!editArea} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditArea(null); } }} title={editArea ? "Cập nhật khu vực" : "Thêm khu vực mới"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã khu vực *</label>
              <Input required defaultValue={editArea?.code} placeholder="VD: KV01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên khu vực *</label>
              <Input required defaultValue={editArea?.name} placeholder="Nhập tên khu vực" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại khu vực *</label>
              <Select defaultValue={editArea?.type || "Lớp học"}>
                <option value="Lớp học">Lớp học</option>
                <option value="Nhà vệ sinh">Nhà vệ sinh</option>
                <option value="Hành lang">Hành lang</option>
                <option value="Sân trường">Sân trường</option>
                <option value="Nhà ăn">Nhà ăn</option>
                <option value="Phòng chức năng">Phòng chức năng</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tầng/Khu vực</label>
              <Input defaultValue={editArea?.floor} placeholder="VD: Tầng 1, Khu A..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Người phụ trách</label>
              <Input defaultValue={editArea?.assignee} placeholder="Tên nhân viên" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tần suất làm sạch</label>
              <Input defaultValue={editArea?.frequency} placeholder="VD: 2 lần/ngày" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái</label>
            <Select defaultValue={editArea?.status || "Đang hoạt động"}>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Cần kiểm tra">Cần kiểm tra</option>
              <option value="Tạm dừng">Tạm dừng</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setEditArea(null); }}>Hủy bỏ</Button>
            <Button type="submit">Lưu thông tin</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
