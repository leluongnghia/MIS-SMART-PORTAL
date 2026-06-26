"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Filter, MoreVertical, ShieldCheck, UserPlus, Clock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

const MOCK_GROroups = [
  { id: '1', code: 'ADMISSIONS_CAMPAIGN_2026', name: 'Nhóm tuyển sinh cao điểm 2026', type: 'CAMPAIGN', membersCount: 15, isTemporary: true, endDate: '31/08/2026', status: 'ACTIVE' },
  { id: '2', code: 'EVENT_OPENING_TEAM', name: 'Nhóm sự kiện khai giảng', type: 'EVENT', membersCount: 24, isTemporary: true, endDate: '15/09/2026', status: 'ACTIVE' },
  { id: '3', code: 'DIGITAL_TRANSFORMATION', name: 'Ban chuyển đổi số', type: 'TASK_FORCE', membersCount: 8, isTemporary: false, status: 'ACTIVE' },
];

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Danh sách Nhóm linh hoạt</h2>
          <p className="text-sm text-slate-500">Quản lý các nhóm dự án, tổ chuyên trách tạm thời hoặc cố định và gán quyền đặc thù.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo nhóm mới
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhóm..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Lọc theo trạng thái
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Tên nhóm</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Loại nhóm</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Thành viên</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Thời hạn</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {MOCK_GROroups.map(group => (
              <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{group.name}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{group.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {group.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{group.membersCount}</span>
                </td>
                <td className="px-6 py-4">
                  {group.isTemporary ? (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Đến {group.endDate}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Cố định</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/vi/system-settings/permissions/groups/${group.id}/members`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-slate-600">
                        <UserPlus className="w-3.5 h-3.5" />
                        Thành viên
                      </Button>
                    </Link>
                    <Link href={`/vi/system-settings/permissions/groups/${group.id}/permissions`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-500/30 dark:hover:bg-indigo-500/10">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Phân quyền
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
