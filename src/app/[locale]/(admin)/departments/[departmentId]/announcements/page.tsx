'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Plus, Search, Filter, Bell, Clock, Eye, MessageCircle } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS, Announcement } from '@/src/libs/mock-data/department-mock';

const PRIORITY_LABELS: Record<string, string> = {
  'NORMAL': 'Thường',
  'IMPORTANT': 'Quan trọng',
  'URGENT': 'Khẩn cấp'
};

const PRIORITY_COLORS: Record<string, string> = {
  'NORMAL': 'bg-slate-100 text-slate-700',
  'IMPORTANT': 'bg-amber-100 text-amber-700',
  'URGENT': 'bg-rose-100 text-rose-700'
};

export default function DepartmentAnnouncementsPage() {
  const [announcements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Thông báo nội bộ</h1>
          <p className="text-sm text-slate-500 mt-1">Thông tin, nhắc nhở và thông báo chung cho bộ phận</p>
        </div>
        <Button className="font-bold gap-2">
          <Plus className="h-4 w-4" /> Tạo thông báo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map(ann => (
          <Card key={ann.id} className="shadow-none border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-black text-slate-600 dark:text-slate-300">
                  {ann.author.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{ann.title}</h3>
                    <Badge variant="outline" className={`shrink-0 border-transparent ${PRIORITY_COLORS[ann.priority]}`}>
                      {PRIORITY_LABELS[ann.priority]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="font-bold">{ann.author}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ann.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {ann.content}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Eye className="h-4 w-4" />
                      <span>{ann.readBy.length} người đã xem</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold">
                      <MessageCircle className="h-4 w-4 mr-1.5" /> Bình luận
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Bell className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p>Chưa có thông báo nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
