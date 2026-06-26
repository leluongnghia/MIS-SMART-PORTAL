"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ShieldCheck, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function RolePermissionMatrixPage() {
  const [showWarning, setShowWarning] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vi/system-settings/permissions/roles">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ma trận quyền: Giáo viên</h2>
            <p className="text-sm text-slate-500">Mã vai trò: TEACHER | Loại: Tùy chỉnh | Đang được sử dụng bởi 120 người</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Hủy bỏ</Button>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {showWarning && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-4 rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-300">Cấu hình Mẫu quyền (Role Template)</h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1 max-w-3xl">
                Bạn đang cấu hình mẫu quyền cho một Vai trò. Bất kỳ người dùng hoặc phòng ban nào được gán vai trò này sẽ tự động kế thừa các quyền được check bên dưới, kết hợp với Data Scope (Phạm vi dữ liệu) mặc định.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowWarning(false)} className="text-indigo-700 hover:bg-indigo-100">
            Đã hiểu
          </Button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex gap-4">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <CheckSquare className="w-4 h-4" /> Chọn tất cả quyền XEM
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Square className="w-4 h-4" /> Bỏ chọn tất cả
          </Button>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 w-1/4">Phân hệ / Chức năng</th>
              <th className="px-3 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Xem</th>
              <th className="px-3 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Tạo</th>
              <th className="px-3 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Sửa</th>
              <th className="px-3 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Xóa</th>
              <th className="px-3 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Gửi duyệt</th>
              <th className="px-3 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Duyệt</th>
              <th className="px-3 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Xuất</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Data Scope mặc định</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
              <td colSpan={9} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase">Học vụ & Nhân sự</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/25">
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white pl-10">Hồ sơ học sinh</td>
              <td className="px-3 py-4 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center">-</td>
              <td className="px-3 py-4 text-center">-</td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-6 py-4">
                <select className="text-xs bg-slate-100 dark:bg-slate-800 border-0 rounded-md py-1 px-2 font-medium" defaultValue="class">
                  <option value="own">Cá nhân (Own)</option>
                  <option value="class">Lớp giảng dạy (Class)</option>
                  <option value="department">Phòng ban (Dept)</option>
                  <option value="school">Toàn trường (School)</option>
                  <option value="all">Toàn hệ thống (All)</option>
                </select>
              </td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/25">
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white pl-10">Giáo án & Dự giờ</td>
              <td className="px-3 py-4 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-6 py-4">
                <select className="text-xs bg-slate-100 dark:bg-slate-800 border-0 rounded-md py-1 px-2 font-medium" defaultValue="own">
                  <option value="own">Cá nhân (Own)</option>
                  <option value="department">Tổ chuyên môn (Dept)</option>
                  <option value="school">Toàn trường (School)</option>
                </select>
              </td>
            </tr>
            
            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
              <td colSpan={9} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase">Dịch vụ học đường</td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/25">
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white pl-10">Trung tâm Ticket</td>
              <td className="px-3 py-4 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" /></td>
              <td className="px-3 py-4 text-center">-</td>
              <td className="px-3 py-4 text-center">-</td>
              <td className="px-3 py-4 text-center">-</td>
              <td className="px-3 py-4 text-center">-</td>
              <td className="px-6 py-4">
                <select className="text-xs bg-slate-100 dark:bg-slate-800 border-0 rounded-md py-1 px-2 font-medium" defaultValue="own">
                  <option value="own">Cá nhân (Own)</option>
                  <option value="school">Toàn trường (School)</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
