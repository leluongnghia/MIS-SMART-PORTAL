'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  UserCircle,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

const menu = [
  { label: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: 'leads', icon: Users },
  { label: 'Admissions Pipeline', href: 'admissions', icon: Workflow },
  { label: 'Students', href: 'students', icon: UserCircle },
  { label: 'Payments', href: 'payments', icon: CreditCard },
  { label: 'Reports', href: 'reports', icon: FileBarChart },
  { label: 'Settings', href: 'settings', icon: Settings },
];

function segmentLabel(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

export default function AdminShell({ locale, children }: { locale: string; children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mis_admin_theme') : null;
    const shouldDark = stored ? stored === 'dark' : document.documentElement.classList.contains('dark');
    setDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('mis_admin_theme', next ? 'dark' : 'light');
  };

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean).slice(1);
    return parts.length ? parts : ['dashboard'];
  }, [pathname]);

  const Sidebar = (
    <aside className={cn('flex h-full flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-950', collapsed ? 'w-20' : 'w-72')}>
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
        <Link href={`/${locale}/dashboard`} className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-slate-950 dark:text-white">MIS SMART</div>
              <div className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">Admin Portal</div>
            </div>
          )}
        </Link>
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed(value => !value)}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menu.map(item => {
          const Icon = item.icon;
          const href = `/${locale}/${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors',
                active
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{Sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/55" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" />
          <div className="absolute inset-y-0 left-0 w-72">
            {Sidebar}
            <Button variant="ghost" size="icon" className="absolute right-3 top-3" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className={cn('transition-all', collapsed ? 'lg:pl-20' : 'lg:pl-72')}>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Link href={`/${locale}/dashboard`} className="hover:text-slate-950 dark:hover:text-white">Admin</Link>
                {breadcrumbs.map((crumb, index) => (
                  <span key={`${crumb}-${index}`} className="flex items-center gap-1">
                    <span>/</span>
                    <span className={index === breadcrumbs.length - 1 ? 'text-slate-950 dark:text-white' : ''}>{segmentLabel(crumb)}</span>
                  </span>
                ))}
              </div>
              <h1 className="truncate text-lg font-black">{segmentLabel(breadcrumbs[breadcrumbs.length - 1] || 'Dashboard')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="relative">
              <Button variant="outline" className="h-9 px-2.5" onClick={() => setUserOpen(value => !value)}>
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <div className="px-3 py-2 text-sm">
                    <div className="font-black">MIS Admin</div>
                    <div className="text-xs text-slate-500">Local operator</div>
                  </div>
                  <Link href={`/${locale}/settings`} className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
                    Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
