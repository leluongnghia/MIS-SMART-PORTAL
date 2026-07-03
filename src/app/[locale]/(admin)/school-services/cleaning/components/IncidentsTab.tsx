'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { Dialog } from '@/src/components/ui/dialog';
import { Plus } from 'lucide-react';
import { CLEANING_INCIDENTS, Incident } from '@/src/mockData/cleaning';

export default function IncidentsTab() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editIncident, setEditIncident] = useState<Incident | null>(null);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Khẩn cấp':
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Khẩn cấp</Badge>;
      case 'Cao':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Cao</Badge>;
      case 'Trung bình':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Trung bình</Badge>;
      case 'Thấp':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Thấp</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã hoàn thành':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Đã hoàn thành</Badge>;
      case 'Đang xử lý':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Đang xử lý</Badge>;
      case 'Chưa xử lý':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Chưa xử lý</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thành công", description: "Đã lưu thông tin sự cố." });
    setIsAddOpen(false);
    setEditIncident(null);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Theo dõi sự cố vệ sinh/môi trường</h3>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Báo cáo sự cố
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Danh sách sự cố</CardTitle>
          <CardDescription>Các phản ánh từ cán bộ, giáo viên và nhân viên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Khu vực</th>
                  <th className="px-4 py-3 font-medium">Loại sự cố</th>
                  <th className="px-4 py-3 font-medium">Mô tả</th>
                  <th className="px-4 py-3 font-medium">Người báo</th>
                  <th className="px-4 py-3 font-medium">Mức độ</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {CLEANING_INCIDENTS.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium">{incident.areaName}</td>
                    <td className="px-4 py-3">{incident.type}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-slate-500">{incident.description}</td>
                    <td className="px-4 py-3 text-slate-500">{incident.reporter}</td>
                    <td className="px-4 py-3">{getSeverityBadge(incident.severity)}</td>
                    <td className="px-4 py-3">{getStatusBadge(incident.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditIncident(incident)}>Xử lý</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen || !!editIncident} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditIncident(null); } }} title={editIncident ? "Cập nhật xử lý sự cố" : "Báo cáo sự cố mới"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Khu vực xảy ra sự cố *</label>
              <Select defaultValue={editIncident?.areaName || ""}>
                <option value="">-- Chọn khu vực --</option>
                <option value="Hành lang khu B">Hành lang khu B</option>
                <option value="Nhà vệ sinh nữ tầng 2">Nhà vệ sinh nữ tầng 2</option>
                <option value="Nhà ăn học sinh">Nhà ăn học sinh</option>
                <option value="Khác">Khác...</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại sự cố *</label>
              <Select defaultValue={editIncident?.type || "Bẩn"}>
                <option value="Bẩn">Rác/Bẩn</option>
                <option value="Mùi hôi">Mùi hôi</option>
                <option value="Tràn nước">Tràn nước/Ngập</option>
                <option value="Hỏng hóc thiết bị">Hỏng hóc thiết bị</option>
                <option value="Hết vật tư">Hết vật tư</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mức độ nghiêm trọng *</label>
            <Select defaultValue={editIncident?.severity || "Trung bình"}>
              <option value="Thấp">Thấp</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Cao">Cao</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả chi tiết *</label>
            <Input required defaultValue={editIncident?.description} placeholder="Mô tả cụ thể vấn đề gặp phải..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Người báo cáo</label>
              <Input defaultValue={editIncident?.reporter || "Người dùng hiện tại"} readOnly={!!editIncident} className="bg-slate-50 dark:bg-slate-900" />
            </div>
            {editIncident && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái xử lý</label>
                <Select defaultValue={editIncident?.status || "Chưa xử lý"}>
                  <option value="Chưa xử lý">Chưa xử lý</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setEditIncident(null); }}>Hủy bỏ</Button>
            <Button type="submit">Lưu thông tin</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
