'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { CalendarDays, Clock, PlayCircle } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/Toast';

export default function SchedulePage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lịch Vận Hành</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lịch hoạt động của các bộ phận dịch vụ học đường.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toast({ title: "Thông báo", description: "Mở form thêm sự kiện..." })}>Thêm sự kiện</Button>
          <Button variant="outline" onClick={() => toast({ title: "Thông báo", description: "Đang tạo file PDF lịch trình..." })}>Tải lịch (PDF)</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch trình hôm nay</CardTitle>
          <CardDescription>Các sự kiện và nhiệm vụ vận hành đã lên lịch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-slate-900 dark:text-white">Kiểm tra an toàn thực phẩm buổi sáng</p>
                <div className="flex items-center text-sm text-slate-500 gap-4">
                  <span>06:00 - 06:30</span>
                  <span>Khu vực: Bếp ăn</span>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Đã xong</Badge>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <PlayCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-slate-900 dark:text-white">Đón học sinh ngoại khóa</p>
                <div className="flex items-center text-sm text-slate-500 gap-4">
                  <span>14:00 - 16:30</span>
                  <span>Khu vực: Cổng chính, Nhà thể chất</span>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Đang chờ</Badge>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-slate-900 dark:text-white">Vệ sinh tổng thể sau giờ học</p>
                <div className="flex items-center text-sm text-slate-500 gap-4">
                  <span>17:00 - 18:30</span>
                  <span>Khu vực: Toàn trường</span>
                </div>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100">Chưa bắt đầu</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
