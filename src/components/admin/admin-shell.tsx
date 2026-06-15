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
  FileText,
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
  Target,
  LineChart,
  TrendingUp,
  CheckSquare,
  Calendar,
  Bell,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Database,
  List,
  GraduationCap,
  CalendarDays,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import LoginPortal from '@/src/components/LoginPortal';
import { MOCK_USERS } from '@/src/mockData';
import type { UserProfile } from '@/src/types';

type MenuItemGroup = {
  title: string;
  items: { label: string; href: string; icon: any }[];
};

const menuGroups: MenuItemGroup[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      { label: 'Tổng quan điều hành', href: 'dashboard', icon: LayoutDashboard },
      { label: 'Báo cáo nhanh', href: 'reports', icon: FileBarChart },
    ],
  },
  {
    title: 'CHIẾN LƯỢC & KẾ HOẠCH',
    items: [
      { label: 'Chiến lược & OKRs', href: 'okr', icon: Target },
      { label: 'Kế hoạch hoạt động', href: 'plans', icon: ClipboardCheck },
      { label: 'Báo cáo & Phân tích KPI', href: 'kpi', icon: LineChart },
      { label: 'Phân tích & Dự báo', href: 'forecast', icon: TrendingUp },
    ],
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { label: 'Công việc & Quy trình', href: 'tasks', icon: CheckSquare },
      { label: 'Phê duyệt', href: 'approvals', icon: UserCheck },
      { label: 'Lịch & Sự kiện', href: 'events', icon: Calendar },
      { label: 'Chỉ đạo BGH', href: 'directives', icon: ClipboardCheck },
      { label: 'Thông báo nội bộ', href: 'announcements', icon: Bell },
      { label: 'Quản trị Nhân sự HRM', href: 'hrm', icon: Users },
      { label: 'Quản trị Rủi ro', href: 'risk', icon: ShieldAlert },
      { label: 'Tuyển sinh & CRM', href: 'admissions', icon: Workflow },
      { label: 'Hồ sơ Học sinh 360', href: 'students', icon: GraduationCap },
      { label: 'Thời khóa biểu & Giáo án', href: 'schedule', icon: CalendarDays },
    ],
  },
  {
    title: 'DỮ LIỆU & HỆ THỐNG',
    items: [
      { label: 'Danh mục', href: 'categories', icon: List },
      { label: 'Báo cáo', href: 'system-reports', icon: FileBarChart },
      { label: 'Kho dữ liệu', href: 'data', icon: Database },
      { label: 'Cấu hình hệ thống', href: 'settings', icon: Settings },
    ],
  },
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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('mis_edutask_logged_in') === 'true';
    const savedUserId = localStorage.getItem('mis_edutask_logged_in_user_id');
    if (loggedIn && savedUserId) {
      const matched = MOCK_USERS.find(u => u.id === savedUserId);
      if (matched) {
        setCurrentUser(matched);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(MOCK_USERS[0]);
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
    setIsAuthReady(true);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('mis_edutask_logged_in');
    localStorage.removeItem('mis_edutask_logged_in_user_id');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserOpen(false);
  };

  const getSimulatedEmail = (user: UserProfile) => {
    if (user.email) return user.email;
    const cleanName = user.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/\s+/g, '.');
    return `${cleanName}@mis.edu.vn`;
  };

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean).slice(1);
    return parts.length ? parts : ['dashboard'];
  }, [pathname]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <LoginPortal
        onLoginSuccess={(user) => {
          localStorage.setItem('mis_edutask_logged_in', 'true');
          localStorage.setItem('mis_edutask_logged_in_user_id', user.id);
          setCurrentUser(user);
          setIsLoggedIn(true);
        }}
        initialUser={MOCK_USERS[0]}
      />
    );
  }

  const activeMenuGroups = currentUser?.workspaceId === 'KHAO_THI' ? [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan', href: 'dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'KHẢO THÍ',
      items: [
        { label: 'Kế hoạch kiểm tra', href: 'dashboard?tab=kehoach', icon: ClipboardCheck },
        { label: 'Lịch thi', href: 'dashboard?tab=lichthi', icon: Calendar },
        { label: 'Tổ chức thi', href: 'dashboard?tab=tochuc', icon: Users },
        { label: 'Chấm thi', href: 'dashboard?tab=chamthi', icon: CheckSquare },
        { label: 'Phúc khảo', href: 'dashboard?tab=phuckhao', icon: Target },
        { label: 'Ngân hàng đề thi', href: 'dashboard?tab=nganhang', icon: Database }
      ]
    },
    {
      title: 'DỮ LIỆU HỌC VỤ',
      items: [
        { label: 'Cơ sở dữ liệu học vụ', href: 'dashboard?tab=csdl', icon: Database },
        { label: 'Kết quả học tập', href: 'dashboard?tab=ketqua', icon: LineChart },
        { label: 'Thống kê học tập', href: 'dashboard?tab=thongke', icon: TrendingUp },
        { label: 'Báo cáo học vụ', href: 'dashboard?tab=baocaohocvu', icon: FileBarChart }
      ]
    },
    {
      title: 'ĐẢM BẢO CHẤT LƯỢNG',
      items: [
        { label: 'Khảo sát', href: 'dashboard?tab=khaosat', icon: Users },
        { label: 'Kiểm định chất lượng', href: 'dashboard?tab=kiemdinh', icon: ShieldCheck },
        { label: 'Tiêu chí & Chuẩn', href: 'dashboard?tab=tieuchi', icon: List },
        { label: 'Minh chứng', href: 'dashboard?tab=minhchung', icon: FileText },
        { label: 'Báo cáo ĐBCL', href: 'dashboard?tab=baocaodbcl', icon: FileBarChart }
      ]
    },
    {
      title: 'BÁO CÁO',
      items: [
        { label: 'Báo cáo khảo thí', href: 'dashboard?tab=report_kt', icon: FileBarChart },
        { label: 'Báo cáo ĐBCL', href: 'dashboard?tab=report_dbcl', icon: FileBarChart },
        { label: 'Báo cáo thống kê', href: 'dashboard?tab=report_tk', icon: FileBarChart }
      ]
    },
    {
      title: 'CÀI ĐẶT',
      items: [
        { label: 'Cấu hình', href: 'settings', icon: Settings },
        { label: 'Phân quyền', href: 'dashboard?tab=rbac', icon: ShieldCheck },
        { label: 'Danh mục', href: 'categories', icon: List }
      ]
    }
  ] : menuGroups;

  const Sidebar = (
    <aside className={cn('flex h-full flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-950', collapsed ? 'w-20' : 'w-72')}>
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
        <Link href={`/${locale}/dashboard`} className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb] text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-[#2563eb] dark:text-blue-400">MIS SMART PORTAL</div>
              {currentUser?.workspaceId === 'KHAO_THI' && (
                <div className="text-[10px] font-black text-slate-400 truncate mt-0.5">Phòng Khảo thí & ĐBCL</div>
              )}
            </div>
          )}
        </Link>
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed(value => !value)}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3 custom-scrollbar">
        {activeMenuGroups.map((group, idx) => (
          <div key={idx}>
            {!collapsed && (
              <div className="mb-2 px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const href = `/${locale}/${item.href}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={item.href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[#2563eb] text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{Sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/55" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" />
          <div className="absolute inset-y-0 left-0 w-72">
            {Sidebar}
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 text-slate-500" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className={cn('transition-all', collapsed ? 'lg:pl-20' : 'lg:pl-72')}>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search Bar matching design */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh..."
                  className="block w-64 rounded-md border-0 py-1.5 pl-10 pr-12 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <kbd className="inline-flex items-center rounded border border-slate-200 px-1 font-sans text-xs text-slate-400 dark:border-slate-700">Ctrl + K</kbd>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">


            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">12</span>
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-slate-500">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <div className="relative">
              <Button variant="ghost" className="h-9 px-2 gap-2 flex items-center" onClick={() => setUserOpen(value => !value)}>
                <img src={currentUser.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{currentUser.title || currentUser.roleName}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </Button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <div className="px-3 py-2 text-sm border-b border-slate-100 dark:border-slate-800 mb-1">
                    <div className="font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                    <div className="text-xs text-slate-500">{getSimulatedEmail(currentUser)}</div>
                  </div>
                  <Link href={`/${locale}/settings`} onClick={() => setUserOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
                    Cài đặt tài khoản
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer">
                    Đăng xuất
                  </button>
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
