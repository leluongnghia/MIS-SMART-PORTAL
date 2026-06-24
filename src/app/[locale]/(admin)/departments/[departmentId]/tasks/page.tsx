'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Plus, Search, Filter, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { MOCK_DEPT_TASKS, DeptTask } from '@/src/libs/mock-data/department-mock';

const PRIORITY_COLORS: Record<string, string> = {
  'LOW': 'bg-slate-100 text-slate-700',
  'NORMAL': 'bg-blue-50 text-blue-700 border-blue-200',
  'HIGH': 'bg-amber-50 text-amber-700 border-amber-200',
  'URGENT': 'bg-rose-50 text-rose-700 border-rose-200'
};

const STATUS_LABELS: Record<string, string> = {
  'NEW': 'Mới',
  'IN_PROGRESS': 'Đang xử lý',
  'PENDING_REVIEW': 'Chờ duyệt',
  'COMPLETED': 'Hoàn thành',
  'OVERDUE': 'Quá hạn'
};

const STATUS_COLORS: Record<string, string> = {
  'NEW': 'bg-slate-100 text-slate-700',
  'IN_PROGRESS': 'bg-blue-100 text-blue-700',
  'PENDING_REVIEW': 'bg-amber-100 text-amber-700',
  'COMPLETED': 'bg-emerald-100 text-emerald-700',
  'OVERDUE': 'bg-rose-100 text-rose-700'
};

export default function DepartmentTasksPage() {
  const [tasks] = useState<DeptTask[]>(MOCK_DEPT_TASKS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Công việc nội bộ</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi tiến độ công việc trong bộ phận</p>
        </div>
        <Button className="font-bold gap-2">
          <Plus className="h-4 w-4" /> Tạo công việc
        </Button>
      </div>

      <Card className="shadow-none border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm công việc..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" className="gap-2 text-slate-600">
            <Filter className="h-4 w-4" /> Lọc
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-bold">Tên công việc</th>
                  <th className="px-4 py-3 font-bold">Phụ trách</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold">Ưu tiên</th>
                  <th className="px-4 py-3 font-bold">Hạn chót</th>
                  <th className="px-4 py-3 font-bold text-right">Tương tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {task.assigneeName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{task.assigneeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={`border-transparent ${STATUS_COLORS[task.status]}`}>
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{task.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{task.comments}</span>
                          </div>
                        )}
                        {task.attachments > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{task.attachments}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <CheckSquare className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                <p>Chưa có công việc nào.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
