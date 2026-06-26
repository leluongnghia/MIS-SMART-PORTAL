import { Save, Shield } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { getPermissionModules, getPermissionRoles, saveRoleModulePreset } from '../actions';

const PRESETS = [
  { value: 'view', label: 'Chỉ xem' },
  { value: 'operator', label: 'Xử lý' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'admin', label: 'Quản trị module' },
];

const SCOPES = [
  { value: 'own', label: 'Của tôi' },
  { value: 'group', label: 'Nhóm' },
  { value: 'department', label: 'Phòng ban' },
  { value: 'school', label: 'Toàn trường' },
  { value: 'all', label: 'Tất cả' },
];

export default async function RolesPage() {
  const [roles, modules] = await Promise.all([
    getPermissionRoles(),
    getPermissionModules(),
  ]);
  const configurableModules = modules.filter(module => module.permissionCount > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Vai trò & Preset quyền</h2>
        <p className="text-sm text-slate-500">
          Gán quyền theo vai trò là luồng chính. Chọn module, mức quyền và phạm vi (scope); hệ thống sẽ cấp các quyền hạn phù hợp.
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map(role => (
          <div key={role.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-950 dark:text-white">{role.name}</h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {role.code}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {role.userCount} người dùng / {role.permissionCount} quyền / cấp độ {role.level}
                  </p>
                </div>
              </div>

              <form action={saveRoleModulePreset} className="grid gap-2 md:grid-cols-[180px_150px_150px_1fr_auto]">
                <input type="hidden" name="roleId" value={role.id} />
                <select name="moduleCode" className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                  {configurableModules.map(module => (
                    <option key={module.id} value={module.code}>{module.name}</option>
                  ))}
                </select>
                <select name="preset" className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                  {PRESETS.map(preset => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </select>
                <select name="dataScope" className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                  {SCOPES.map(scope => (
                    <option key={scope.value} value={scope.value}>{scope.label}</option>
                  ))}
                </select>
                <input
                  name="reason"
                  placeholder="Lý do thay đổi"
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <Button type="submit" size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Lưu
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
