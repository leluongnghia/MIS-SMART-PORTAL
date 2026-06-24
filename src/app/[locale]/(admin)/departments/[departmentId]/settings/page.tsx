'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { ShieldCheck, Users, Save, Lock, UserCog } from 'lucide-react';
import { MOCK_DEPT_MEMBERS, DeptMember } from '@/src/libs/mock-data/department-mock';

const ROLE_PERMISSIONS = {
  'Trưởng bộ phận': ['Xem báo cáo', 'Duyệt giáo án', 'Duyệt nghỉ phép', 'Phân công công việc', 'Quản lý thành viên'],
  'Tổ phó': ['Xem báo cáo', 'Duyệt giáo án', 'Phân công công việc'],
  'Thành viên': ['Nộp giáo án', 'Tạo đơn nghỉ phép', 'Cập nhật công việc']
};

export default function DepartmentSettingsPage() {
  const [members] = useState<DeptMember[]>(MOCK_DEPT_MEMBERS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Người dùng & phân quyền</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý quyền truy cập và vai trò của các thành viên trong tổ</p>
        </div>
        <Button className="font-bold gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
          <Save className="h-4 w-4" /> Lưu thay đổi
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-none border-slate-200 dark:border-slate-800">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Danh sách người dùng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-white dark:bg-slate-950 uppercase border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3 font-bold">Thành viên</th>
                      <th className="px-5 py-3 font-bold">Vai trò</th>
                      <th className="px-5 py-3 font-bold text-right">Cập nhật vai trò</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                              {member.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={
                            member.role === 'Trưởng bộ phận' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            member.role === 'Tổ phó' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {member.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <select 
                            className="border border-slate-200 dark:border-slate-800 rounded-lg text-sm px-3 py-1.5 bg-white dark:bg-slate-950 w-40"
                            defaultValue={member.role}
                          >
                            <option value="Trưởng bộ phận">Trưởng bộ phận</option>
                            <option value="Tổ phó">Tổ phó</option>
                            <option value="Thành viên">Thành viên</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-none border-slate-200 dark:border-slate-800">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Chi tiết phân quyền
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                <div key={role} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-slate-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white">{role}</h3>
                  </div>
                  <ul className="space-y-1.5 pl-6">
                    {perms.map(perm => (
                      <li key={perm} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-5 flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100">Bảo mật dữ liệu</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Dữ liệu của bộ phận chỉ được truy cập bởi thành viên trong tổ và Ban Giám Hiệu. Trưởng bộ phận chịu trách nhiệm phân quyền nội bộ.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
