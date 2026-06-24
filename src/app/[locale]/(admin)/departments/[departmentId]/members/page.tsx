'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Plus, Search, UserPlus, ShieldAlert, BarChart } from 'lucide-react';
import { MOCK_DEPT_MEMBERS, DeptMember } from '@/src/libs/mock-data/department-mock';

const ROLE_COLORS: Record<string, string> = {
  'Trưởng bộ phận': 'bg-rose-100 text-rose-700',
  'Tổ phó': 'bg-amber-100 text-amber-700',
  'Thành viên': 'bg-slate-100 text-slate-700'
};

const STATUS_LABELS: Record<string, string> = {
  'ONLINE': 'Đang hoạt động',
  'OFFLINE': 'Ngoại tuyến',
  'ON_LEAVE': 'Nghỉ phép'
};

const STATUS_COLORS: Record<string, string> = {
  'ONLINE': 'bg-emerald-500',
  'OFFLINE': 'bg-slate-300',
  'ON_LEAVE': 'bg-amber-500'
};

export default function DepartmentMembersPage() {
  const [members] = useState<DeptMember[]>(MOCK_DEPT_MEMBERS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Thành viên tổ</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách thành viên và phân công nội bộ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="font-bold gap-2 text-slate-600">
            <BarChart className="h-4 w-4" /> Báo cáo hiệu suất
          </Button>
          <Button className="font-bold gap-2">
            <UserPlus className="h-4 w-4" /> Thêm thành viên
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map(member => (
          <Card key={member.id} className="shadow-none border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-black text-slate-600 dark:text-slate-300">
                      {member.name.charAt(0)}
                    </div>
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 ${STATUS_COLORS[member.status]}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="text-xs text-slate-500">{STATUS_LABELS[member.status]}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className={`border-transparent ${ROLE_COLORS[member.role]}`}>
                  {member.role}
                </Badge>
                {member.subjects.map(sub => (
                  <Badge key={sub} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    {sub}
                  </Badge>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{member.activeTasks}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-wider">Đang xử lý</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{member.completionRate}%</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-wider">Hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
