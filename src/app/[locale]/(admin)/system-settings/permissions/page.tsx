import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, KeyRound, Layers, Shield, UserCog } from 'lucide-react';
import { getPermissionOverview } from './actions';

export default async function PermissionsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const overview = await getPermissionOverview();
  const cards = [
    {
      label: 'Phan he cap 1 dang bat',
      value: `${overview.enabledModuleCount}/${overview.moduleCount}`,
      icon: Layers,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50/40 dark:bg-blue-950/10',
      borderClass: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      label: 'Chuc nang con',
      value: overview.featureCount,
      icon: Shield,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50/40 dark:bg-emerald-950/10',
      borderClass: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      label: 'Permission chi tiet',
      value: overview.permissionCount,
      icon: KeyRound,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50/40 dark:bg-amber-950/10',
      borderClass: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      label: 'User override',
      value: overview.overrideCount,
      icon: UserCog,
      colorClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-50/40 dark:bg-rose-950/10',
      borderClass: 'border-rose-100 dark:border-rose-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Tong quan phan quyen</h2>
        <p className="text-sm text-slate-500">
          6 module la phan he cap 1. Moi phan he co nhieu chuc nang con va permission chi tiet de gan theo vai tro, phong ban/nhom hoac ngoai le user.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-sm ${card.borderClass} ${card.bgClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.colorClass}`} />
            </div>
            <div className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Luong cau hinh nhanh
          </h3>
          <div className="mt-4 grid gap-2">
            {[
              { label: '1. Bat/tat module', href: 'modules' },
              { label: '2. Gan quyen mac dinh theo vai tro', href: 'roles' },
              { label: '3. Bo sung theo phong ban/nhom', href: 'departments' },
              { label: '4. Kiem tra quyen user', href: 'check' },
            ].map(item => (
              <Link
                key={item.href}
                href={`/${locale}/system-settings/permissions/${item.href}`}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                {item.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Canh bao can xu ly
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Module dang tat</span>
              <b>{overview.disabledModules.length}</b>
            </div>
            <div className="flex items-center justify-between">
              <span>User DENY override</span>
              <b>{overview.denyOverrideCount}</b>
            </div>
            <div className="flex items-center justify-between">
              <span>Vai tro hoat dong</span>
              <b>{overview.activeRoleCount}/{overview.roleCount}</b>
            </div>
            <div className="flex items-center justify-between">
              <span>Nhom tam thoi</span>
              <b>{overview.temporaryGroupCount}</b>
            </div>
            {overview.disabledModules.length > 0 && (
              <div className="rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Kiem tra sidebar, route va API lien quan cac module dang tat truoc khi mo lai.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h3 className="text-sm font-black text-slate-950 dark:text-white">Audit gan day</h3>
        <div className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {overview.auditLogs.map(log => (
            <div key={log.id} className="grid gap-2 py-3 md:grid-cols-[160px_1fr_120px]">
              <span className="font-mono text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
              <span className="font-bold">{log.action} {log.targetType}:{log.targetId}</span>
              <span className="text-xs text-slate-500">{log.actorUserId}</span>
            </div>
          ))}
          {overview.auditLogs.length === 0 && <div className="py-6 text-center text-slate-500">Chua co audit log.</div>}
        </div>
      </div>
    </div>
  );
}
