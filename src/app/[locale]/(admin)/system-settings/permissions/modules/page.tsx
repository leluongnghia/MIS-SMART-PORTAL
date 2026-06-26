import { Fragment } from 'react';
import { Layers, Lock, Power } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { getPermissionModules, togglePermissionModule } from '../actions';

export default async function ModulesPage() {
  const modules = await getPermissionModules();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Phân hệ & Chức năng</h2>
        <p className="text-sm text-slate-500">
          Bảng này hiển thị phân hệ cấp 1; các chức năng con nằm ngay bên dưới từng phân hệ. Bật/tắt phân hệ sẽ ảnh hưởng đến thanh bên (sidebar), định tuyến (route) và bộ bảo vệ phía máy chủ (backend guard).
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Phân hệ</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Quy mô</th>
              <th className="px-4 py-3">Đang được gán</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {modules.map(module => (
              <Fragment key={module.id}>
                <tr className={!module.isEnabled ? 'bg-slate-50/60 text-slate-500 dark:bg-slate-900/40' : ''}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
                          {module.name}
                          {module.isSystem && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                        </div>
                        <div className="font-mono text-xs text-slate-500">{module.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={module.isEnabled ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>
                      {module.isEnabled ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                    {module.featureCount} chức năng / {module.permissionCount} quyền
                  </td>
                  <td className="px-4 py-4 font-bold">{module.assignmentCount}</td>
                  <td className="px-4 py-4">
                    <form action={togglePermissionModule} className="flex justify-end">
                      <input type="hidden" name="moduleId" value={module.id} />
                      <input type="hidden" name="nextEnabled" value={String(!module.isEnabled)} />
                      <input type="hidden" name="reason" value="Toggle module from simplified permission UI" />
                      <Button type="submit" variant={module.isEnabled ? 'outline' : 'default'} size="sm" className="gap-2">
                        <Power className="h-4 w-4" />
                        {module.isEnabled ? 'Tắt' : 'Bật'}
                      </Button>
                    </form>
                  </td>
                </tr>
                <tr className={!module.isEnabled ? 'bg-slate-50/60 dark:bg-slate-900/40' : ''}>
                  <td colSpan={5} className="px-4 pb-4 pt-0">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="mb-2 text-xs font-bold uppercase text-slate-500">Chức năng con</div>
                      {module.features.length > 0 ? (
                        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {module.features.map(feature => (
                            <div key={feature.id} className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-bold text-slate-950 dark:text-white">{feature.name}</div>
                                  <div className="font-mono text-xs text-slate-500">{feature.code}</div>
                                </div>
                                <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                                  {feature.permissionCount} quyền
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-1">
                                {feature.actions.map(action => (
                                  <span key={action} className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                          Chưa có chức năng con nào trong danh mục.
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
