'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/Toast';
import { Download } from 'lucide-react';
import { CLEANING_KPI } from '@/src/mockData/cleaning';

export default function ReportsTab() {
  const { toast } = useToast();

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Báo cáo & Phân tích</h3>
          <p className="text-sm text-slate-500">Dữ liệu tổng hợp về công tác vệ sinh môi trường</p>
        </div>
        <Button onClick={() => toast({ title: "Thông báo", description: "Đang tải báo cáo PDF..." })}>
          <Download className="mr-2 h-4 w-4" /> Xuất báo cáo PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất theo khu vực</CardTitle>
            <CardDescription>Tỷ lệ đạt chuẩn vệ sinh theo từng khu vực</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Khu vực Lớp học</span>
                  <span className="font-medium text-emerald-600">95%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Khu vực Hành lang</span>
                  <span className="font-medium text-emerald-600">88%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nhà vệ sinh</span>
                  <span className="font-medium text-amber-600">65%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sân trường & Ngoại cảnh</span>
                  <span className="font-medium text-rose-600">40%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê sự cố</CardTitle>
            <CardDescription>Phân bố sự cố theo mức độ nghiêm trọng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 border border-dashed border-slate-200 rounded-lg">
              <div className="text-center text-slate-500">
                <p>Biểu đồ tròn phân bố sự cố</p>
                <p className="text-xs">(Cần tích hợp thư viện Chart.js hoặc Recharts)</p>
                <div className="flex justify-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500"></div>Khẩn cấp (2)</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Cao (3)</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div>TB (5)</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Thấp (2)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top khu vực cần cải thiện</CardTitle>
          <CardDescription>Các khu vực có nhiều phản ánh và điểm checklist thấp nhất tháng qua</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Tên khu vực</th>
                  <th className="px-4 py-3 font-medium">Số phản ánh</th>
                  <th className="px-4 py-3 font-medium">Điểm TB Checklist</th>
                  <th className="px-4 py-3 font-medium">Người phụ trách chính</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-medium text-rose-600">Nhà vệ sinh nam Tầng 2</td>
                  <td className="px-4 py-3">8 sự cố</td>
                  <td className="px-4 py-3">3.2/5</td>
                  <td className="px-4 py-3 text-slate-500">Trần Văn Quý</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-amber-600">Khu vực Căng tin</td>
                  <td className="px-4 py-3">5 sự cố</td>
                  <td className="px-4 py-3">3.8/5</td>
                  <td className="px-4 py-3 text-slate-500">Phạm Thị Mai</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-amber-600">Sân bóng rổ</td>
                  <td className="px-4 py-3">3 sự cố</td>
                  <td className="px-4 py-3">4.0/5</td>
                  <td className="px-4 py-3 text-slate-500">Phạm Thị D</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
