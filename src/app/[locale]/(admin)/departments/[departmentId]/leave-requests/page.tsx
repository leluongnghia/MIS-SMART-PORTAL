'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Plus, Search, Filter, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { MOCK_LEAVE_REQUESTS, LeaveRequest } from '@/src/libs/mock-data/department-mock';

const STATUS_LABELS: Record<string, string> = {
  'PENDING_DEPT': 'Chờ TT duyệt',
  'PENDING_HR': 'Chờ BGH duyệt',
  'APPROVED': 'Đã duyệt',
  'REJECTED': 'Từ chối'
};

const STATUS_COLORS: Record<string, string> = {
  'PENDING_DEPT': 'bg-amber-100 text-amber-700',
  'PENDING_HR': 'bg-blue-100 text-blue-700',
  'APPROVED': 'bg-emerald-100 text-emerald-700',
  'REJECTED': 'bg-rose-100 text-rose-700'
};

export default function DepartmentLeaveRequestsPage() {
  const [requests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Đề xuất nghỉ phép</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và phê duyệt đơn nghỉ phép của thành viên tổ</p>
        </div>
        <Button className="font-bold gap-2">
          <Plus className="h-4 w-4" /> Tạo đơn nghỉ
        </Button>
      </div>

      <Card className="shadow-none border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
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
                  <th className="px-4 py-3 font-bold">Người tạo đơn</th>
                  <th className="px-4 py-3 font-bold">Loại nghỉ</th>
                  <th className="px-4 py-3 font-bold">Thời gian</th>
                  <th className="px-4 py-3 font-bold">Người bàn giao</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">
                          {req.requesterName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{req.requesterName}</p>
                          <p className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {req.type}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{req.startDate} đến {req.endDate}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Lý do: {req.reason}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {req.handoverTo}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={`border-transparent ${STATUS_COLORS[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'PENDING_DEPT' && (
                          <>
                            <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Duyệt
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                              <XCircle className="h-4 w-4 mr-1" /> Từ chối
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
