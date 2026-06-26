"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Search, Shield, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

const MOCK_MEMBERS = [
  { id: '1', name: 'Nguyễn Văn A', email: 'a.nguyen@school.edu.vn', dept: 'Tuyển sinh', role: 'Nhân viên tuyển sinh', groupRole: 'LEADER' },
  { id: '2', name: 'Trần Thị B', email: 'b.tran@school.edu.vn', dept: 'Truyền thông', role: 'Nhân viên truyền thông', groupRole: 'MEMBER' },
  { id: '3', name: 'Lê Văn C', email: 'c.le@school.edu.vn', dept: 'BGH', role: 'Hiệu trưởng', groupRole: 'APPROVER' },
];

export default function GroupMembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vi/system-settings/permissions/groups">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Thành viên: Nhóm tuyển sinh cao điểm 2026</h2>
          <p className="text-sm text-slate-500">Mã nhóm: ADMISSIONS_CAMPAIGN_2026</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm thành viên..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Thêm thành viên
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Thành viên</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Phòng ban chính</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Vai trò chính</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Vai trò trong nhóm</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {MOCK_MEMBERS.map(member => (
              <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 dark:text-white">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.email}</div>
                </td>
                <td className="px-6 py-4">{member.dept}</td>
                <td className="px-6 py-4 text-slate-500">{member.role}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {member.groupRole === 'LEADER' && <Shield className="w-4 h-4 text-amber-500" />}
                    <select 
                      className="bg-transparent border-0 p-0 text-sm font-medium focus:ring-0 text-slate-700 dark:text-slate-300 cursor-pointer"
                      defaultValue={member.groupRole}
                    >
                      <option value="LEADER">Trưởng nhóm</option>
                      <option value="APPROVER">Người duyệt</option>
                      <option value="MEMBER">Thành viên</option>
                      <option value="VIEWER">Người xem</option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
