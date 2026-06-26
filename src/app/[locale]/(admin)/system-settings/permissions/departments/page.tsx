"use client";

import React from 'react';
import Link from 'next/link';
import { Building2, Plus, Search, Filter, ShieldCheck, Copy, Users } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

const MOCK_DEPARTMENTS = [
  { id: '1', code: 'ACADEMIC_OFFICE', name: 'Phòng Học vụ', type: 'ACADEMIC_OFFICE', membersCount: 15, roleTemplate: 'Trưởng phòng Học vụ' },
  { id: '2', code: 'MATH_GROUP', name: 'Tổ Toán', type: 'SUBJECT_GROUP', parentDept: 'Phòng Học vụ', membersCount: 24, roleTemplate: 'Tổ trưởng chuyên môn' },
  { id: '3', code: 'STUDENT_SERVICES', name: 'Dịch vụ Học đường', type: 'SERVICE_OFFICE', membersCount: 42, roleTemplate: 'Trưởng phòng dịch vụ' },
  { id: '4', code: 'ADMISSIONS', name: 'Phòng Tuyển sinh', type: 'ADMISSIONS', membersCount: 8, roleTemplate: 'Trưởng phòng tuyển sinh' },
];

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Phân quyền theo Phòng ban</h2>
          <p className="text-sm text-slate-500">Gán quyền mặc định cho toàn bộ thành viên trong một phòng ban/tổ chuyên môn.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm Phòng ban
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm phòng ban..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Lọc theo loại
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Phòng ban</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Trực thuộc</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Nhân sự</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Mẫu quyền đang dùng</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {MOCK_DEPARTMENTS.map(dept => (
              <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{dept.name}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{dept.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {dept.parentDept || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium">{dept.membersCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {dept.roleTemplate}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-slate-600">
                      <Copy className="w-3.5 h-3.5" />
                      Copy quyền
                    </Button>
                    <Link href={`/vi/system-settings/permissions/departments/${dept.id}/permissions`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-500/30 dark:hover:bg-indigo-500/10">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Ma trận quyền
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
