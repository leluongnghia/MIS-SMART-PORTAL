'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Users, UserPlus, Briefcase, Award } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/Toast';

export default function StaffPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nhân Sự Dịch Vụ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý đội ngũ nhân viên vệ sinh, bảo vệ, tài xế, cấp dưỡng.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toast({ title: "Thông báo", description: "Tính năng Thêm nhân sự đang được phát triển" })}><UserPlus className="mr-2 h-4 w-4" /> Thêm nhân sự</Button>
          <Button variant="outline" onClick={() => toast({ title: "Thông báo", description: "Tính năng Phân ca làm việc đang được phát triển" })}>Phân ca làm việc</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng nhân sự</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Đang trong ca trực</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">32</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Xin nghỉ phép</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Đánh giá xuất sắc (Tháng)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">12</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân sự (Hôm nay)</CardTitle>
          <CardDescription>Trạng thái trực và vị trí làm việc hiện tại</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Họ và tên</th>
                  <th className="px-4 py-3 font-medium">Chức vụ / Bộ phận</th>
                  <th className="px-4 py-3 font-medium">Ca làm việc</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Nguyễn Văn Bình</td>
                  <td className="px-4 py-3 text-slate-500">Bảo vệ - Tổ an ninh</td>
                  <td className="px-4 py-3 text-slate-500">Ca Sáng (06:00 - 14:00)</td>
                  <td className="px-4 py-3"><Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Đang làm việc</Badge></td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => toast({ title: "Chi tiết", description: "Xem thông tin nhân sự..." })}>Chi tiết</Button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Trần Thị Lan</td>
                  <td className="px-4 py-3 text-slate-500">Tạp vụ - Tổ vệ sinh</td>
                  <td className="px-4 py-3 text-slate-500">Ca Hành chính (07:30 - 16:30)</td>
                  <td className="px-4 py-3"><Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Đang làm việc</Badge></td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => toast({ title: "Chi tiết", description: "Xem thông tin nhân sự..." })}>Chi tiết</Button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Lê Minh Cường</td>
                  <td className="px-4 py-3 text-slate-500">Tài xế - Tổ xe tuyến</td>
                  <td className="px-4 py-3 text-slate-500">Ca Sáng (06:00 - 08:30)</td>
                  <td className="px-4 py-3"><Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100">Kết thúc ca</Badge></td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => toast({ title: "Chi tiết", description: "Xem thông tin nhân sự..." })}>Chi tiết</Button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Phạm Tú Dũng</td>
                  <td className="px-4 py-3 text-slate-500">Bảo vệ - Tổ an ninh</td>
                  <td className="px-4 py-3 text-slate-500">Ca Chiều (14:00 - 22:00)</td>
                  <td className="px-4 py-3"><Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Nghỉ phép</Badge></td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => toast({ title: "Chi tiết", description: "Xem thông tin nhân sự..." })}>Chi tiết</Button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
