import { CheckCircle2, Search, XCircle } from 'lucide-react';
import { getEffectivePermissions } from '@/src/libs/server/permission-service';
import { Button } from '@/src/components/ui/button';
import { getPermissionUsers } from '../actions';

export default async function PermissionCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; permissionCode?: string }>;
}) {
  const params = await searchParams;
  const users = await getPermissionUsers();
  const selectedUserId = params.userId || users[0]?.id || '';
  const permissionCode = params.permissionCode || 'crm.lead.view';
  const result = selectedUserId ? await getEffectivePermissions(selectedUserId) : null;
  const permission = result?.permissions.get(permissionCode);
  const allowed = permission?.effect === 'ALLOW';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Kiểm tra quyền người dùng</h2>
        <p className="text-sm text-slate-500">
          Công cụ này hiển thị quyền hiệu dụng thực tế (Effective Permissions) sau khi gộp từ Vai trò, Phòng ban, Nhóm và Ngoại lệ người dùng.
        </p>
      </div>

      <form className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_1fr_auto] dark:border-slate-800">
        <select name="userId" defaultValue={selectedUserId} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
          ))}
        </select>
        <input
          name="permissionCode"
          defaultValue={permissionCode}
          placeholder="crm.lead.view"
          className="h-10 rounded-md border border-slate-200 bg-white px-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Kiểm tra
        </Button>
      </form>

      {result && (
        <div className={allowed
          ? 'rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'
          : 'rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100'}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {allowed ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : <XCircle className="mt-0.5 h-5 w-5" />}
              <div>
                <h3 className="font-black">{allowed ? 'ALLOW (Cho phép)' : 'DENY (Chặn)'}</h3>
                <p className="mt-1 text-sm">
                  Quyền hạn <code className="font-mono">{permissionCode}</code> có phạm vi dữ liệu cuối cùng là <b>{allowed ? permission.dataScope : 'none'}</b>.
                </p>
              </div>
            </div>
            <span className="rounded bg-white/70 px-2 py-1 font-mono text-xs dark:bg-black/20">
              ID: {selectedUserId}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-950 dark:text-white">Phân hệ (Module) được truy cập</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {result?.allowedModules.map(module => (
              <span key={module} className="rounded bg-indigo-50 px-2 py-1 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {module}
              </span>
            ))}
            {result?.allowedModules.length === 0 && <span className="text-sm text-slate-500">Không có module nào.</span>}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-950 dark:text-white">Quyền bị chặn (DENY override) hiệu lực</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {result?.deniedPermissions.map(code => (
              <span key={code} className="rounded bg-rose-50 px-2 py-1 font-mono text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {code}
              </span>
            ))}
            {result?.deniedPermissions.length === 0 && <span className="text-sm text-slate-500">Không có quyền DENY nào bị ghi đè.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
