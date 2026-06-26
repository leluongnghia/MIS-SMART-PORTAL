"use client";

import React from 'react';
import { Users2, Search, Filter, ShieldAlert, XCircle, CheckCircle2, UserCog } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

const MOCK_USERS = [
  { id: '1', name: 'Trần Văn A', email: 'a.tran@school.edu.vn', role: 'Giáo viên', overrides: 2, hasDeny: true },
  { id: '2', name: 'Lê Thị B', email: 'b.le@school.edu.vn', role: 'Nhân viên dịch vụ', overrides: 1, hasDeny: false },
  { id: '3', name: 'Nguyễn Văn C', email: 'c.nguyen@school.edu.vn', role: 'Tổ trưởng chuyên môn', overrides: 3, hasDeny: false },
];

export default function UserOverridesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ghi đè phân quyền cá nhân</h2>
          <p className="text-sm text-slate-500">Cấp thêm quyền riêng biệt hoặc chặn quyền của một cá nhân cụ thể.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Lọc người có ngoại lệ
        </Button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800 dark:text-amber-300">Lưu ý khi cấu hình ghi đè</h4>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Quyền cấp ở mức cá nhân có độ ưu tiên cao nhất. Nếu đặt quyền là
            <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-amber-900 dark:text-amber-200 mx-1">DENY</code>
            người dùng sẽ không thể truy cập chức năng đó dù vai trò hoặc phòng ban có quyền.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Người dùng</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Vai trò / Phòng ban chính</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Số ngoại lệ</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {user.name}
                        {user.hasDeny && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-1.5 py-0.5 rounded uppercase">
                            <XCircle className="w-3 h-3" /> Bị chặn quyền
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.role}</td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {user.overrides}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-slate-600">
                      <UserCog className="w-3.5 h-3.5" />
                      Chi tiết quyền
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-500/30 dark:hover:bg-indigo-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sửa ngoại lệ
                    </Button>
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
