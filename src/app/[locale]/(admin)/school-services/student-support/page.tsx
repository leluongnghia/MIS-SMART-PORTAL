'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Users, HeartHandshake, PhoneCall, CheckCircle2, Clock } from 'lucide-react';
import { SERVICE_TICKETS } from '@/src/mockData/schoolServices';
import { Badge } from '@/src/components/ui/badge';

export default function StudentSupportPage() {
  const supportTickets = SERVICE_TICKETS.filter(t => t.category === 'Hỗ trợ học sinh');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hỗ Trợ Học Sinh & Tâm Lý</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi, ghi nhận và xử lý các ca tư vấn tâm lý, hành vi hoặc hỗ trợ học tập đặc biệt.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert('Tính năng đang được phát triển')}  variant="outline" className="shadow-sm">Danh sách theo dõi</Button>
          <Button onClick={() => alert('Tính năng đang được phát triển')}  className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
            <HeartHandshake className="mr-2 h-4 w-4" />
            Mở ca tư vấn mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ca tư vấn đang thực hiện</CardTitle>
              <CardDescription>Các trường hợp đang được chuyên viên tâm lý theo dõi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map(ticket => (
                  <div key={ticket.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-base">{ticket.title}</h4>
                      <Badge className={ticket.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}>
                        {ticket.priority === 'urgent' ? 'Cấp bách' : 'Bình thường'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-slate-500 block text-xs">Người yêu cầu</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{ticket.createdBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Thời gian tạo</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                      <Button onClick={() => alert('Tính năng đang được phát triển')}  variant="outline" size="sm">Cập nhật tiến trình</Button>
                      <Button onClick={() => alert('Tính năng đang được phát triển')}  size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">Lên lịch hẹn</Button>
                    </div>
                  </div>
                ))}
                {supportTickets.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Hiện tại không có ca tư vấn nào.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-800 dark:text-purple-400 text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thống kê tháng này
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Số ca tiếp nhận:</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Đã hoàn thành:</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">8</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Đang theo dõi dài hạn:</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">4</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto dark:bg-blue-900/30 dark:text-blue-400">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Đường dây nóng Tâm lý</h3>
                <p className="text-xs text-slate-500 mt-1">Học sinh có thể liên hệ ẩn danh</p>
              </div>
              <div className="text-lg font-bold tracking-wider text-blue-600 dark:text-blue-400">
                1900 1234 (Ext 5)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
