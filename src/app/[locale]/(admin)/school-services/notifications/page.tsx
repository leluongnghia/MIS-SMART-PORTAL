'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Bell, Send, CheckCircle2, Search } from 'lucide-react';

export default function NotificationsPage() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Thông Báo Dịch Vụ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gửi thông báo về thay đổi tuyến xe, thực đơn hoặc nhắc nhở thanh toán phí dịch vụ.
          </p>
        </div>
        <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Send className="mr-2 h-4 w-4" />
          Soạn thông báo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <CardTitle>Lịch sử gửi thông báo</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Tìm kiếm..." className="pl-9 h-8 bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3">Tiêu đề</th>
                    <th className="px-6 py-3">Đối tượng nhận</th>
                    <th className="px-6 py-3">Ngày gửi</th>
                    <th className="px-6 py-3">Tỷ lệ xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Thực đơn bán trú Tuần 4 Tháng 6</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Tất cả Phụ huynh (Bán trú)</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">24/06/2026</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">85%</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Thông báo trễ chuyến xe Tuyến 03</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Phụ huynh Tuyến 03</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">22/06/2026</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">100%</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Lịch nhận đồng phục bổ sung</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Tất cả Học sinh Khối 10</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">18/06/2026</td>
                    <td className="px-6 py-4 text-amber-600 font-medium">65%</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Nhắc nhở đóng phí Bán trú tháng 6</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Phụ huynh (Chưa đóng)</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">15/06/2026</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">92%</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 dark:text-blue-400 text-base flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Hiệu quả Truyền thông
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/60 dark:bg-slate-900/50 rounded-lg">
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">85.5%</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">Tỷ lệ đọc tin trung bình</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Kênh App Push: <span className="font-semibold text-slate-900 dark:text-white ml-auto">Hiệu quả nhất</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
