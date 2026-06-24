'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Search, Filter, ClipboardCheck, Clock, Reply, CheckCircle2 } from 'lucide-react';
import { MOCK_DIRECTIVES, Directive } from '@/src/libs/mock-data/department-mock';

const STATUS_LABELS: Record<string, string> = {
  'NEW': 'Mới nhận',
  'ASSIGNED': 'Đã phân công',
  'IN_PROGRESS': 'Đang xử lý',
  'RESPONDED': 'Đã phản hồi',
  'COMPLETED': 'Hoàn thành'
};

const STATUS_COLORS: Record<string, string> = {
  'NEW': 'bg-rose-100 text-rose-700',
  'ASSIGNED': 'bg-amber-100 text-amber-700',
  'IN_PROGRESS': 'bg-blue-100 text-blue-700',
  'RESPONDED': 'bg-purple-100 text-purple-700',
  'COMPLETED': 'bg-emerald-100 text-emerald-700'
};

export default function DepartmentDirectivesPage() {
  const [directives] = useState<Directive[]>(MOCK_DIRECTIVES);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Chỉ đạo BGH</h1>
          <p className="text-sm text-slate-500 mt-1">Tiếp nhận, phân công và báo cáo kết quả chỉ đạo từ Ban Giám Hiệu</p>
        </div>
      </div>

      <Card className="shadow-none border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm chỉ đạo..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" className="gap-2 text-slate-600">
            <Filter className="h-4 w-4" /> Lọc
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {directives.map(directive => (
              <div key={directive.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`border-transparent ${STATUS_COLORS[directive.status]}`}>
                        {STATUS_LABELS[directive.status]}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded dark:bg-rose-900/30">
                        <Clock className="h-3.5 w-3.5" />
                        Hạn: {new Date(directive.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{directive.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{directive.content}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">Từ: <strong className="text-slate-700 dark:text-slate-300">{directive.from}</strong></span>
                      <span className="text-slate-500">Ngày giao: {new Date(directive.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="lg:w-72 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phân công xử lý</p>
                      {directive.assigneeName ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                            {directive.assigneeName.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{directive.assigneeName}</span>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
                          + Giao người xử lý
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1 font-bold gap-2" variant={directive.status === 'COMPLETED' ? 'outline' : 'default'}>
                        <Reply className="h-4 w-4" /> Phản hồi
                      </Button>
                      {directive.status !== 'COMPLETED' && (
                        <Button variant="outline" className="font-bold gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                          <CheckCircle2 className="h-4 w-4" /> Xong
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
