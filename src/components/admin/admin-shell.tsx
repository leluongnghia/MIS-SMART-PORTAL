'use client';
import { serverStorage } from '../../libs/client/server-storage';


import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  MessageSquare,
  Building,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import LoginPortal from '@/src/components/LoginPortal';
import { MOCK_USERS, WORKSPACES } from '@/src/mockData';
import type { UserProfile, Announcement, BoardDirective, Task } from '@/src/types';
import NotificationDrawer from '../NotificationDrawer';

type MenuItemGroup = {
  title: string;
  items: { label: string; href: string; icon: any; badgeKey?: 'tasks' | 'directives' | 'announcements' }[];
};

type NotificationSummary = {
  total: number;
  tasks: number;
  directives: number;
  announcements: number;
  urgent: number;
  latest: { id: string; type: string; title: string; href: string }[];
};

const menuGroups: MenuItemGroup[] = [
  {
    title: 'ĐIỀU HÀNH CHIẾN LƯỢC',
    items: [
      { label: 'Tổng quan điều hành', href: 'dashboard', icon: LayoutDashboard },
      { label: 'Báo cáo nhanh', href: 'reports', icon: FileBarChart },
      { label: 'Chiến lược & OKRs', href: 'okr', icon: Target },
      { label: 'Kế hoạch hoạt động', href: 'plans', icon: ClipboardCheck },
      { label: 'Báo cáo & Phân tích KPI', href: 'kpi', icon: LineChart },
      { label: 'Phân tích & Dự báo', href: 'forecast', icon: TrendingUp },
    ],
  },
  {
    title: 'VẬN HÀNH NỘI BỘ',
    items: [
      { label: 'Công việc & Quy trình', href: 'tasks', icon: CheckSquare, badgeKey: 'tasks' },
      { label: 'Phê duyệt', href: 'approvals', icon: UserCheck },
      { label: 'Lịch & Sự kiện', href: 'events', icon: Calendar },
      { label: 'Chỉ đạo BGH', href: 'directives', icon: ClipboardCheck, badgeKey: 'directives' },
      { label: 'Thông báo nội bộ', href: 'announcements', icon: Bell, badgeKey: 'announcements' },
    ],
  },
  {
    title: 'QUẢN TRỊ NGUỒN LỰC',
    items: [
      { label: 'Quản trị Nhân sự HRM', href: 'hrm', icon: Users },
      { label: 'CSVC, Thiết bị & Mua sắm', href: 'facilities', icon: Building },
      { label: 'Quản trị Rủi ro', href: 'risk', icon: ShieldAlert },
    ],
  },
  {
    title: 'TUYỂN SINH & HỌC SINH',
    items: [
      { label: 'Tuyển sinh & CRM', href: 'admissions', icon: Workflow },
      { label: 'Hồ sơ Học sinh 360', href: 'students', icon: GraduationCap },
      { label: 'Thời khóa biểu & Giáo án', href: 'schedule', icon: CalendarDays },
    ],
  },
  {
    title: 'DỮ LIỆU HỆ THỐNG',
    items: [
      { label: 'Danh mục hệ thống', href: 'system-data/categories', icon: List },
      { label: 'Trung tâm báo cáo', href: 'system-data/reports', icon: FileBarChart },
      { label: 'Lưu trữ & Dữ liệu', href: 'system-data/storage', icon: Database },
    ],
  },
  {
    title: 'QUẢN TRỊ NỀN TẢNG',
    items: [
      { label: 'Quản lý người dùng & phân quyền', href: 'users', icon: Users },
      { label: 'Cấu hình hệ thống', href: 'system-data/settings', icon: Settings },
    ],
  },
];

const titleColors: Record<string, { text: string; dot: string; activeBg: string }> = {
  'ĐIỀU HÀNH CHIẾN LƯỢC': { text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-600 dark:bg-indigo-400', activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' },
  'VẬN HÀNH NỘI BỘ': { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-600 dark:bg-amber-400', activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/20' },
  'QUẢN TRỊ NGUỒN LỰC': { text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-600 dark:bg-rose-400', activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/20' },
  'TUYỂN SINH & HỌC SINH': { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-600 dark:bg-emerald-400', activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' },
  'DỮ LIỆU HỆ THỐNG': { text: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-600 dark:bg-sky-400', activeBg: 'bg-sky-600 text-white shadow-md shadow-sky-500/20' },
  'QUẢN TRỊ NỀN TẢNG': { text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-600 dark:bg-purple-400', activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/20' },
  'TỔNG QUAN': { text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20' },
  'NGHIỆP VỤ BỘ PHẬN': { text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-600 dark:bg-blue-400', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20' },
  'HỌC VỤ & LỊCH': { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-600 dark:bg-emerald-400', activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' },
  'HỆ THỐNG': { text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20' },
  'KHẢO THÍ': { text: 'text-teal-600 dark:text-teal-400', dot: 'bg-teal-600 dark:bg-teal-400', activeBg: 'bg-teal-600 text-white shadow-md shadow-teal-500/20' },
  'DỮ LIỆU HỌC VỤ': { text: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-600 dark:bg-sky-400', activeBg: 'bg-sky-600 text-white shadow-md shadow-sky-500/20' },
  'ĐẢM BẢO CHẤT LƯỢNG': { text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-600 dark:bg-purple-400', activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/20' },
  'BÁO CÁO': { text: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-600 dark:bg-pink-400', activeBg: 'bg-pink-600 text-white shadow-md shadow-pink-500/20' },
  'CÀI ĐẶT': { text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20' },
  'TUYỂN SINH & CRM': { text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-600 dark:bg-indigo-400', activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' },
  'VẬN HÀNH BỘ PHẬN': { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-600 dark:bg-amber-400', activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/20' },
};


function segmentLabel(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\\b\\w/g, letter => letter.toUpperCase());
}

export default function AdminShell({ locale, children }: { locale: string; children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary>({
    total: 0,
    tasks: 0,
    directives: 0,
    announcements: 0,
    urgent: 0,
    latest: [],
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string>('');
  const [switcherAllowed, setSwitcherAllowed] = useState(false);
  const [switcherPolicy, setSwitcherPolicy] = useState<any>(null);
  const switcherRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTab = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get('tab'));
    };
    updateTab();
    window.addEventListener('popstate', updateTab);
    return () => window.removeEventListener('popstate', updateTab);
  }, [pathname]);

  useEffect(() => {
    const initAuth = async () => {
      await serverStorage.hydrate(['mis_edutask_logged_in', 'mis_edutask_logged_in_user_id']);
      const loggedIn = serverStorage.getItem('mis_edutask_logged_in') === 'true';
      const savedUserId = serverStorage.getItem('mis_edutask_logged_in_user_id');
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
    };
    initAuth();
  }, []);

  useEffect(() => {
    fetch('/api/settings/user-switcher', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setSwitcherAllowed(Boolean(data?.allowed));
        setSwitcherPolicy(data?.policy || null);
      })
      .catch(() => setSwitcherAllowed(false));
  }, [currentUser?.id]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (switcherRef.current && !switcherRef.current.contains(target)) {
        setSwitcherOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSwitchUser = async (user: UserProfile) => {
    try {
      const response = await fetch('/api/settings/user-switcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id }),
      });
      const data = await response.json();
      if (!response.ok || data?.status !== 'success') throw new Error(data?.error || 'Không đổi được user');
      await Promise.all([
        serverStorage.setItem('mis_edutask_logged_in', 'true'),
        serverStorage.setItem('mis_edutask_logged_in_user_id', user.id),
      ]);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setSwitcherOpen(false);
      setUserOpen(false);
      window.location.reload();
    } catch (error: any) {
      setToastNotice(error.message || 'Không đổi được user');
      window.setTimeout(() => setToastNotice(''), 3500);
    }
  };

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? serverStorage.getItem('mis_admin_theme') : null;
    const shouldDark = stored ? stored === 'dark' : document.documentElement.classList.contains('dark');
    setDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    serverStorage.setItem('mis_admin_theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    serverStorage.removeItem('mis_edutask_logged_in');
    serverStorage.removeItem('mis_edutask_logged_in_user_id');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserOpen(false);
    setSwitcherOpen(false);
  };

  useEffect(() => {
    if (!currentUser) return;

    let previousTotal: number | null = null;
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const response = await fetch('/api/notifications/summary', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || data?.status !== 'success') return;
        const nextSummary: NotificationSummary = {
          total: Number(data.total || 0),
          tasks: Number(data.tasks || 0),
          directives: Number(data.directives || 0),
          announcements: Number(data.announcements || 0),
          urgent: Number(data.urgent || 0),
          latest: Array.isArray(data.latest) ? data.latest : [],
        };
        if (previousTotal !== null && nextSummary.total > previousTotal) {
          setToastNotice(`Bạn có ${nextSummary.total - previousTotal} mục mới cần kiểm tra`);
          window.setTimeout(() => setToastNotice(''), 3500);
        }
        previousTotal = nextSummary.total;
        setNotificationSummary(nextSummary);
      } catch (error) {
        console.warn('Notification summary failed', error);
      }
    };

    loadSummary();
    const timer = window.setInterval(loadSummary, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [currentUser]);

  const getSimulatedEmail = (user: UserProfile) => {
    if (user.email) return user.email;
    const cleanName = user.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/\\s+/g, '.');
    return `${cleanName}@mis.edu.vn`;
  };

  const usersByWorkspace = useMemo(() => {
    const workspaceNameById = new Map(WORKSPACES.map(workspace => [workspace.id, workspace.name]));
    const grouped = MOCK_USERS.reduce<Record<string, UserProfile[]>>((acc, user) => {
      const key = user.workspaceId || 'OTHER';
      acc[key] = acc[key] || [];
      acc[key].push(user);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([workspaceId, users]) => ({
        workspaceId,
        workspaceName: workspaceNameById.get(workspaceId) || workspaceId || 'Chưa phân phòng ban',
        users: users.sort((a, b) => {
          const roleRank = { ADMIN: 0, MANAGER: 1, STAFF: 2, PARENT: 3, STUDENT: 4 } as const;
          return roleRank[a.role] - roleRank[b.role] || a.name.localeCompare(b.name, 'vi');
        }),
      }))
      .sort((a, b) => {
        const currentWorkspace = currentUser?.workspaceId;
        if (a.workspaceId === currentWorkspace) return -1;
        if (b.workspaceId === currentWorkspace) return 1;
        if (a.workspaceId === 'BGH') return -1;
        if (b.workspaceId === 'BGH') return 1;
        return a.workspaceName.localeCompare(b.workspaceName, 'vi');
      });
  }, [currentUser?.workspaceId]);

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean).slice(1);
    return parts.length ? parts : ['dashboard'];
  }, [pathname]);

  const isDepartment = currentUser?.workspaceId &&
    currentUser.workspaceId !== 'BGH' &&
    currentUser.workspaceId !== 'KHAO_THI' &&
    currentUser.workspaceId !== 'TUYEN_SINH_PR' &&
    currentUser?.role !== 'ADMIN';

  const departmentMenuGroups: MenuItemGroup[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan bộ phận', href: 'dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'NGHIỆP VỤ BỘ PHẬN',
      items: [
        { label: 'Công việc nội bộ', href: 'dashboard?tab=tasks', icon: CheckSquare, badgeKey: 'tasks' },
        { label: 'Duyệt giáo án', href: 'dashboard?tab=giaoan', icon: FileText },
        { label: 'Đề xuất nghỉ phép', href: 'dashboard?tab=nghiphep', icon: UserCheck },
        { label: 'Thành viên tổ', href: 'dashboard?tab=members', icon: Users },
        { label: 'Chỉ đạo BGH', href: 'directives', icon: ClipboardCheck, badgeKey: 'directives' },
        { label: 'Thông báo nội bộ', href: 'announcements', icon: Bell, badgeKey: 'announcements' },
      ],
    },
    {
      title: 'HỌC VỤ & LỊCH',
      items: [
        { label: 'Thời khóa biểu & Lịch dạy', href: 'dashboard?tab=schedule', icon: CalendarDays },
        { label: 'Hồ sơ Học sinh 360', href: 'students', icon: GraduationCap },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { label: 'Cấu hình cá nhân', href: 'settings', icon: Settings },
      ],
    },
  ];

  const admissionsMenuGroups: MenuItemGroup[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan điều hành', href: 'dashboard', icon: LayoutDashboard },
        { label: 'Báo cáo nhanh', href: 'reports', icon: FileBarChart },
      ],
    },
    {
      title: 'TUYỂN SINH & CRM',
      items: [
        { label: 'Dashboard', href: 'admissions?view=dashboard', icon: Workflow },
        { label: 'Lead & Thí sinh', href: 'admissions?view=leads', icon: Users },
        { label: 'Pipeline', href: 'admissions?view=pipeline', icon: Workflow },
        { label: 'Lịch hẹn & Test', href: 'admissions?view=appointments', icon: Calendar },
        { label: 'Hồ sơ tuyển sinh', href: 'admissions?view=documents', icon: FileText },
        { label: 'Thanh toán', href: 'admissions?view=payments', icon: CreditCard },
        { label: 'Báo cáo CRM', href: 'admissions?view=reports', icon: FileBarChart },
        { label: 'Chiến dịch', href: 'admissions?view=campaigns', icon: Bell },
        { label: 'Cài đặt Pipeline', href: 'admissions?view=settings', icon: Settings },
        { label: 'Hồ sơ Học sinh 360', href: 'students', icon: GraduationCap },
        { label: 'Lịch & Sự kiện', href: 'events', icon: Calendar },
      ],
    },
    {
      title: 'VẬN HÀNH BỘ PHẬN',
      items: [
        { label: 'Công việc & Quy trình', href: 'tasks', icon: CheckSquare, badgeKey: 'tasks' },
        { label: 'Chỉ đạo BGH', href: 'directives', icon: ClipboardCheck, badgeKey: 'directives' },
        { label: 'Thông báo nội bộ', href: 'announcements', icon: Bell, badgeKey: 'announcements' },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { label: 'Cấu hình cá nhân', href: 'settings', icon: Settings },
      ],
    },
  ];

  const rawMenuGroups = currentUser?.workspaceId === 'KHAO_THI' ? [
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
        { label: 'Danh mục', href: 'system-data/categories', icon: List }
      ]
    }
  ] : currentUser?.workspaceId === 'TUYEN_SINH_PR' ? admissionsMenuGroups : isDepartment ? departmentMenuGroups : menuGroups;

  const activeMenuGroups = useMemo(() => {
    const mapped = rawMenuGroups.map(group => {
      const targetTitles = ['VẬN HÀNH', 'VẬN HÀNH NỘI BỘ', 'NGHIỆP VỤ BỘ PHẬN', 'VẬN HÀNH BỘ PHẬN', 'CÀI ĐẶT'];
      if (targetTitles.includes(group.title)) {
        const extraItems: { label: string; href: string; icon: any; badgeKey?: 'tasks' | 'directives' | 'announcements' }[] = [
          { label: 'Chat nội bộ', href: 'chat', icon: MessageSquare }
        ];
        if (group.title !== 'VẬN HÀNH NỘI BỘ' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER')) {
          extraItems.push({ label: 'Quản lý người dùng & phân quyền', href: 'users', icon: Users });
        }
        
        // Remove duplicate hrefs if any
        const existingHrefs = new Set(group.items.map(i => i.href.split('?')[0]));
        const filteredExtra = extraItems.filter(item => !existingHrefs.has(item.href));
        
        return {
          ...group,
          items: [...group.items, ...filteredExtra]
        };
      }
      return group;
    });

    const finalGroups = mapped.filter(g => g.title !== 'DỮ LIỆU HỆ THỐNG' && g.title !== 'DỮ LIỆU & HỆ THỐNG' && g.title !== 'QUẢN TRỊ NỀN TẢNG');

    const systemDataItems: any[] = [];
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') {
      systemDataItems.push({ label: 'Danh mục hệ thống', href: 'system-data/categories', icon: List });
      systemDataItems.push({ label: 'Trung tâm báo cáo', href: 'system-data/reports', icon: FileBarChart });
      systemDataItems.push({ label: 'Lưu trữ & Dữ liệu', href: 'system-data/storage', icon: Database });
    } else if (currentUser?.role === 'STAFF') {
      systemDataItems.push({ label: 'Lưu trữ & Dữ liệu', href: 'system-data/storage', icon: Database });
    }

    if (systemDataItems.length > 0) {
      finalGroups.push({
        title: 'DỮ LIỆU HỆ THỐNG',
        items: systemDataItems,
      });
    }

    const platformItems: any[] = [];
    if (currentUser?.role === 'ADMIN') {
      platformItems.push({ label: 'Quản lý người dùng & phân quyền', href: 'users', icon: Users });
      platformItems.push({ label: 'Cấu hình hệ thống', href: 'system-data/settings', icon: Settings });
    } else if (currentUser?.role === 'MANAGER') {
      platformItems.push({ label: 'Quản lý người dùng & phân quyền', href: 'users', icon: Users });
    }

    if (platformItems.length > 0) {
      finalGroups.push({
        title: 'QUẢN TRỊ NỀN TẢNG',
        items: platformItems,
      });
    }

    return finalGroups;
  }, [rawMenuGroups, currentUser]);

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
          serverStorage.setItem('mis_edutask_logged_in', 'true');
          serverStorage.setItem('mis_edutask_logged_in_user_id', user.id);
          setCurrentUser(user);
          setIsLoggedIn(true);
        }}
        initialUser={MOCK_USERS[0]}
      />
    );
  }

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
        {activeMenuGroups.map((group, idx) => {
          const theme = titleColors[group.title] || { text: 'text-slate-400', dot: 'bg-slate-400', activeBg: 'bg-[#2563eb] text-white' };
          return (
            <div key={idx}>
              {!collapsed && (
                <div className="mb-2 px-3 flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", theme.dot)} />
                  <span className={cn("text-[10px] font-black tracking-wider uppercase", theme.text)}>
                    {group.title}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const [pathPart, queryPart] = item.href.split('?');
                  const href = `/${locale}/${pathPart}${queryPart ? `?${queryPart}` : ''}`;
                  
                  let active = false;
                  if (queryPart) {
                    const itemTab = new URLSearchParams(queryPart).get('tab');
                    active = pathname === `/${locale}/${pathPart}` && currentTab === itemTab;
                  } else {
                    if (item.href === 'dashboard') {
                      active = pathname === `/${locale}/dashboard` && (!currentTab || currentTab === 'overview');
                    } else {
                      active = pathname === href || pathname.startsWith(`${href}/`);
                    }
                  }
                  return (
                    <Link
                      key={item.href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? theme.activeBg
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                      )}
                    >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {item.badgeKey && notificationSummary[item.badgeKey] > 0 && (
                      <span className={cn(
                        'ml-auto flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black',
                        active ? 'bg-white text-blue-700' : 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      )}>
                        {notificationSummary[item.badgeKey] > 99 ? '99+' : notificationSummary[item.badgeKey]}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
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


            {toastNotice && (
              <div className="fixed right-5 top-20 z-[9999] rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-2xl shadow-blue-500/15">
                🔔 {toastNotice}
              </div>
            )}

            <Button variant="ghost" size="icon" onClick={() => setIsNotifOpen(true)} className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300" title={`${notificationSummary.total} mục cần kiểm tra`}>
              <Bell className="h-5 w-5" />
              {notificationSummary.total > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {notificationSummary.total > 99 ? '99+' : notificationSummary.total}
                </span>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-slate-500">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {switcherAllowed && (
            <div className="relative" ref={switcherRef}>
              <Button
                variant="ghost"
                className="h-9 gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-blue-950/30"
                onClick={() => {
                  setSwitcherOpen(value => !value);
                  setUserOpen(false);
                }}
                title="Chuyển user test"
              >
                <Users className="h-4 w-4" />
                <span className="hidden text-xs font-black md:inline">Đổi user</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {switcherPolicy && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" title="Demo mode đang được kiểm soát" />}
              {switcherOpen && (
                <div className="absolute right-0 z-[80] mt-2 w-[min(92vw,560px)] overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-slate-50 px-4 py-3 dark:border-slate-800 dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-900">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Chuyển user test</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-500">Chỉ Admin, có audit log, có thể tắt trong production.</div>
                      </div>
                      <div className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black text-white shadow-lg shadow-blue-500/25">
                        {MOCK_USERS.length} user
                      </div>
                    </div>
                  </div>
                  <div className="grid max-h-[520px] grid-cols-[190px_1fr] overflow-hidden max-sm:grid-cols-1">
                    <div className="border-r border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-900/60 max-sm:hidden">
                      <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Phòng ban</div>
                      <div className="max-h-[472px] space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                        {usersByWorkspace.map(group => (
                          <a key={group.workspaceId} href={`#switcher-${group.workspaceId}`} className={cn('flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition-colors hover:bg-white hover:text-blue-700 hover:shadow-sm dark:hover:bg-slate-950', currentUser.workspaceId === group.workspaceId ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-slate-950 dark:text-blue-300 dark:ring-blue-900/50' : 'text-slate-600 dark:text-slate-300')}><span className="line-clamp-2">{group.workspaceName}</span><span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{group.users.length}</span></a>
                        ))}
                      </div>
                    </div>
                    <div className="max-h-[520px] overflow-y-auto p-2 custom-scrollbar">
                      {usersByWorkspace.map(group => (
                        <section key={group.workspaceId} id={`switcher-${group.workspaceId}`} className="scroll-mt-2 pb-3">
                          <div className="sticky top-0 z-10 mb-2 flex items-center justify-between rounded-xl border border-slate-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"><div className="min-w-0"><div className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">{group.workspaceName}</div><div className="text-[10px] font-semibold text-slate-400">{group.users.length} tài khoản • {group.workspaceId}</div></div>{currentUser.workspaceId === group.workspaceId && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">Hiện tại</span>}</div>
                          <div className="space-y-1">
                            {group.users.map(user => (
                              <button key={user.id} type="button" onClick={() => handleSwitchUser(user)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-blue-50 hover:shadow-sm dark:hover:bg-blue-950/30', currentUser.id === user.id ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50' : 'text-slate-700 dark:text-slate-300')}>
                                <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black">{user.name}</span><span className="block truncate text-[11px] opacity-70">{user.title || user.roleName || user.workspaceId}</span></span><span className={cn('rounded-full px-2 py-0.5 text-[10px] font-black', user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : user.role === 'MANAGER' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>{user.role}</span>{currentUser.id === user.id && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">Đang dùng</span>}
                              </button>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
            
            <div className="relative" ref={userMenuRef}>
              <Button variant="ghost" className="h-9 px-2 gap-2 flex items-center" onClick={() => {
                setUserOpen(value => !value);
                setSwitcherOpen(false);
              }}>
                <img src={currentUser.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{currentUser.title || currentUser.roleName}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </Button>
              {userOpen && (
                <div className="absolute right-0 z-[80] mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <div className="px-3 py-2 text-sm border-b border-slate-100 dark:border-slate-800 mb-1">
                    <div className="font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                    <div className="text-xs text-slate-500">{getSimulatedEmail(currentUser)}</div>
                  </div>
                  {!(currentUser?.workspaceId === 'TUYEN_SINH_PR' && currentUser?.role === 'STAFF') && (
                    <Link href={`/${locale}/settings`} onClick={() => setUserOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
                      Cài đặt tài khoản
                    </Link>
                  )}
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

      <NotificationDrawer 
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        announcements={[]}
        directives={[]}
        tasks={[]}
        currentUser={currentUser}
        summaryItems={notificationSummary.latest}
      />
    </div>
  );
}
