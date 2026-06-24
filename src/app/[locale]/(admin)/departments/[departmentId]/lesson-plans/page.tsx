'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Plus, Search, Filter, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MOCK_LESSON_PLANS, LessonPlan } from '@/src/libs/mock-data/department-mock';

const STATUS_LABELS: Record<string, string> = {
  'MISSING': 'Chưa nộp',
  'SUBMITTED': 'Đã nộp',
  'PENDING_REVIEW': 'Chờ duyệt',
  'REVISION_REQUESTED': 'Cần chỉnh sửa',
  'APPROVED': 'Đã duyệt'
};

const STATUS_COLORS: Record<string, string> = {
  'MISSING': 'bg-rose-100 text-rose-700',
  'SUBMITTED': 'bg-slate-100 text-slate-700',
  'PENDING_REVIEW': 'bg-amber-100 text-amber-700',
  'REVISION_REQUESTED': 'bg-orange-100 text-orange-700',
  'APPROVED': 'bg-emerald-100 text-emerald-700'
};

export default function DepartmentLessonPlansPage() {
  const [plans] = useState<LessonPlan[]>(MOCK_LESSON_PLANS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Duyệt giáo án</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và phê duyệt giáo án chuyên môn hàng tuần</p>
        </div>
        <Button className="font-bold gap-2">
          <Plus className="h-4 w-4" /> Nộp giáo án
        </Button>
      </div>

      <Card className="shadow-none border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm giáo viên, môn học..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="border border-slate-200 dark:border-slate-800 rounded-lg text-sm px-3 py-2 bg-white dark:bg-slate-950">
            <option>Tuần 5</option>
            <option>Tuần 4</option>
            <option>Tuần 3</option>
          </select>
          <Button variant="outline" className="gap-2 text-slate-600">
            <Filter className="h-4 w-4" /> Lọc
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-bold">Giáo viên</th>
                  <th className="px-4 py-3 font-bold">Môn học</th>
                  <th className="px-4 py-3 font-bold">Lớp/Khối</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold">Thời gian nộp</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {plan.teacherName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{plan.teacherName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {plan.subject}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {plan.grade}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={`border-transparent ${STATUS_COLORS[plan.status]}`}>
                        {STATUS_LABELS[plan.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      {plan.submittedAt ? (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(plan.submittedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <FileText className="h-4 w-4 mr-1" /> Xem file
                        </Button>
                        {plan.status === 'PENDING_REVIEW' && (
                          <>
                            <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Duyệt
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                              <XCircle className="h-4 w-4 mr-1" /> Sửa
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
