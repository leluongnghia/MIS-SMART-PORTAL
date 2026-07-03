'use client';

import React from 'react';

export default function AuditLogsClient({ initialLogs }: { initialLogs: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Lịch sử cấp quyền (Audit Logs)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Xem lại các thay đổi về phân quyền trong hệ thống</p>
        </div>
      </div>

      <div className="rounded-md border dark:border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="p-4 font-medium border-b dark:border-slate-800">Thời gian</th>
              <th className="p-4 font-medium border-b dark:border-slate-800">Loại tài nguyên</th>
              <th className="p-4 font-medium border-b dark:border-slate-800">Đối tượng</th>
              <th className="p-4 font-medium border-b dark:border-slate-800">Hành động</th>
              <th className="p-4 font-medium border-b dark:border-slate-800">Người thực hiện</th>
              <th className="p-4 font-medium border-b dark:border-slate-800">Lý do</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {initialLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
                    {log.targetType}
                  </span>
                </td>
                <td className="p-4 text-slate-700 dark:text-slate-300 font-mono text-xs">
                  {log.targetName}
                </td>
                <td className="p-4 font-medium text-slate-900 dark:text-white">
                  {log.action}
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">
                  {log.actorName ? `${log.actorName} (${log.actorEmail})` : 'Unknown'}
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">
                  {log.reason || '-'}
                </td>
              </tr>
            ))}
            {initialLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Chưa có dữ liệu lịch sử phân quyền
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
