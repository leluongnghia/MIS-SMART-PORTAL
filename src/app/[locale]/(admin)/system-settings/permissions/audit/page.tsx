import { History } from 'lucide-react';
import { getPermissionAuditLogs } from '../actions';

export default async function AuditLogsPage() {
  const logs = await getPermissionAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950 dark:text-white">
          <History className="h-5 w-5 text-indigo-600" />
          Audit phan quyen
        </h2>
        <p className="text-sm text-slate-500">Moi thay doi module, role, group va override can co actor, before/after va ly do.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Thoi gian</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Doi tuong</th>
              <th className="px-4 py-3">Ly do</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map(log => (
              <tr key={log.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 font-bold">{log.actorUserId}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">{log.targetType}:{log.targetId}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.reason || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chua co audit log phan quyen.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
