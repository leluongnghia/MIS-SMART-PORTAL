'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { SERVICE_TICKETS } from '@/src/mockData/schoolServices';
import { Button } from '@/src/components/ui/button';
import { FileText, ShieldAlert } from 'lucide-react';

export default function FeedbackPage() {
  const { toast } = useToast();
  const feedbacks = SERVICE_TICKETS.filter(t => t.priority === 'urgent' || t.priority === 'high');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Phản Ánh & Khiếu Nại</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Xử lý các ý kiến đóng góp, khiếu nại mức độ nghiêm trọng cần Ban giám hiệu can thiệp.
          </p>
        </div>
        <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="shadow-sm">
          <FileText className="mr-2 h-4 w-4" />
          Xuất Báo Cáo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {feedbacks.map(feedback => (
          <Card key={feedback.id} className="relative overflow-hidden border-rose-100 dark:border-rose-900/30">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base line-clamp-2 pr-4">{feedback.title}</CardTitle>
                <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
              </div>
              <CardDescription className="mt-2 text-xs">
                Mã: {feedback.id} • Ngày tạo: {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500">Danh mục:</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{feedback.category}</div>
                  
                  <div className="text-slate-500">Người gửi:</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{feedback.createdBy}</div>
                  
                  <div className="text-slate-500">Trạng thái:</div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${feedback.status === 'open' ? 'bg-amber-100 text-amber-700' : feedback.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {feedback.status === 'open' ? 'Chưa xử lý' : feedback.status === 'in_progress' ? 'Đang xử lý' : 'Đã giải quyết'}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Xem chi tiết</Button>
                  <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  size="sm" className="ml-2 bg-rose-600 hover:bg-rose-700 text-white">Xử lý ngay</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {feedbacks.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl dark:border-slate-800">
            <ShieldAlert className="mx-auto h-8 w-8 text-emerald-500 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Không có khiếu nại nào</h3>
            <p className="text-sm text-slate-500 mt-1">Hệ thống hiện không ghi nhận phản ánh khẩn cấp nào chưa được xử lý.</p>
          </div>
        )}
      </div>
    </div>
  );
}
