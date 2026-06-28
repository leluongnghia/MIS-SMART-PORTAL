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
  BookOpen,
  AlertTriangle,
  Bus,
  Utensils,
  HeartPulse,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import LoginPortal from '@/src/components/LoginPortal';
import { MOCK_USERS, WORKSPACES } from '@/src/mockData';
import type { UserProfile, Announcement, BoardDirective, Task } from '@/src/types';
import NotificationDrawer from '../NotificationDrawer';
import { DepartmentSidebar } from '@/src/components/department/DepartmentSidebar';
import { usePermissions } from '@/src/hooks/usePermissions';
import { inferPrimaryRole, ROLE_DASHBOARD } from '@/src/libs/server/rbac-config';

type MenuItemGroup = {
  title: string;
  items: { label: string; href: string; icon: any; badgeKey?: 'tasks' | 'directives' | 'announcements'; roles?: string[]; moduleCode?: string }[];
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
    title: 'BỘ MÁY ĐIỀU HÀNH',
    items: [
      { label: 'Dashboard Hội đồng', href: 'dashboard/council', icon: LayoutDashboard, roles: ['ADMIN'], moduleCode: 'DASHBOARD' },
      { label: 'Dashboard Hiệu trưởng', href: 'dashboard/academic', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'], moduleCode: 'DASHBOARD' },
      { label: 'Mục tiêu chiến lược', href: 'dashboard/okrs', icon: Target, roles: ['ADMIN', 'MANAGER'], moduleCode: 'DASHBOARD' },
      { label: 'Quản trị rủi ro', href: 'risk', icon: ShieldAlert, roles: ['ADMIN'], moduleCode: 'DASHBOARD' },
      { label: 'Chỉ đạo BGH', href: 'directives', icon: ClipboardCheck, badgeKey: 'directives', roles: ['ADMIN', 'MANAGER'], moduleCode: 'DASHBOARD' },
      { label: 'Nhiệm vụ & Dự án', href: 'tasks', icon: CheckSquare, badgeKey: 'tasks', moduleCode: 'DASHBOARD' },
      { label: 'Đơn từ & Phê duyệt', href: 'approvals', icon: UserCheck, moduleCode: 'DASHBOARD' },
      { label: 'Thông báo nội bộ', href: 'announcements', icon: Bell, badgeKey: 'announcements', moduleCode: 'DASHBOARD' },
    ],
  },
  {
    title: 'HỌC VỤ & NHÂN SỰ',
    items: [
      { label: 'Hồ sơ Học sinh 360', href: 'students', icon: GraduationCap, moduleCode: 'ACADEMIC' },
      { label: 'Quản lý Lớp học', href: 'classes', icon: Users, moduleCode: 'ACADEMIC' },
      { label: 'Giáo án & Dự giờ', href: 'lesson-plans', icon: BookOpen, moduleCode: 'ACADEMIC' },
      { label: 'Thời khóa biểu & Lịch', href: 'schedule', icon: CalendarDays, moduleCode: 'ACADEMIC' },
      { label: 'Kiểm tra & Đánh giá', href: 'exams', icon: FileText, moduleCode: 'ACADEMIC' },
      { label: 'Sổ liên lạc & Nề nếp', href: 'conduct', icon: CheckSquare, moduleCode: 'ACADEMIC' },
      { label: 'Nhân sự trường học', href: 'hrm', icon: Users, roles: ['ADMIN', 'MANAGER'], moduleCode: 'ACADEMIC' },
    ],
  },
  {
    title: 'VẬN HÀNH & NGUỒN LỰC',
    items: [
      { label: 'Tuyển sinh CRM', href: 'admissions', icon: Workflow, moduleCode: 'CRM_ADMISSIONS' },
      { label: 'CSKH Phụ huynh', href: 'tickets', icon: MessageSquare, moduleCode: 'OPERATIONS' },
      { label: 'Sự kiện & Truyền thông', href: 'events', icon: Calendar, moduleCode: 'OPERATIONS' },
      { label: 'Xe đưa đón học sinh', href: 'transport', icon: Bus, moduleCode: 'OPERATIONS' },
      { label: 'Bán trú & Bếp ăn', href: 'meals', icon: Utensils, moduleCode: 'OPERATIONS' },
      { label: 'Tài sản & Cơ sở VC', href: 'facilities', icon: Building, moduleCode: 'OPERATIONS' },
      { label: 'Kho Quy trình & Tri thức', href: 'knowledge', icon: BookOpen, moduleCode: 'OPERATIONS' },
      { label: 'Hành chính & Cuộc họp', href: 'meetings', icon: Users, moduleCode: 'OPERATIONS' },
    ],
  },
  {
    title: 'CÀI ĐẶT HỆ THỐNG',
    items: [
      { label: 'Cấu hình cá nhân', href: 'settings', icon: Settings, moduleCode: 'SYSTEM' },
      { label: 'Quản trị phân quyền (Mới)', href: 'system-settings/permissions', icon: ShieldCheck, roles: ['ADMIN', 'MANAGER'], moduleCode: 'SYSTEM' },
    ],
  },
  {
    title: 'DỊCH VỤ HỌC ĐƯỜNG',
    items: [
      { label: 'Tổng quan Dịch vụ học đường', href: 'school-services', icon: LayoutDashboard, moduleCode: 'SERVICES' },
      { label: 'Trung tâm Ticket Dịch vụ', href: 'school-services/tickets', icon: MessageSquare, moduleCode: 'SERVICES' },
      { label: 'Xe đưa đón', href: 'transport', icon: Bus, moduleCode: 'SERVICES' },
      { label: 'Suất ăn / Căng tin', href: 'meals', icon: Utensils, moduleCode: 'SERVICES' },
      { label: 'Y tế học đường', href: 'health', icon: HeartPulse, moduleCode: 'SERVICES' },
      { label: 'Bán trú / Nội trú', href: 'school-services/boarding', icon: Moon, moduleCode: 'SERVICES' },
      { label: 'Cơ sở vật chất', href: 'school-services/facilities', icon: Building, moduleCode: 'SERVICES' },
      { label: 'Vệ sinh / Môi trường', href: 'school-services/cleaning', icon: CheckSquare, moduleCode: 'SERVICES' },
      { label: 'An ninh / An toàn', href: 'school-services/security', icon: ShieldAlert, moduleCode: 'SERVICES' },
      { label: 'Lịch vận hành', href: 'school-services/schedule', icon: CalendarDays, moduleCode: 'SERVICES' },
      { label: 'Nhân sự dịch vụ', href: 'school-services/staff', icon: Users, moduleCode: 'SERVICES' },
      { label: 'Báo cáo & KPI', href: 'school-services/reports', icon: FileBarChart, moduleCode: 'SERVICES' },
      { label: 'Cấu hình vận hành cơ bản', href: 'school-services/settings', icon: Settings, moduleCode: 'SERVICES' },
      { label: 'Thông báo / Cảnh báo', href: 'school-services/notifications', icon: Bell, moduleCode: 'SERVICES' },
    ],
  },
];


const titleColors: Record<string, { text: string; dot: string; activeBg: string }> = {
  'BỘ MÁY ĐIỀU HÀNH': { text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-600 dark:bg-indigo-400', activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' },
  'HỌC VỤ & NHÂN SỰ': { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-600 dark:bg-emerald-400', activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' },
  'VẬN HÀNH & NGUỒN LỰC': { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-600 dark:bg-amber-400', activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/20' },
  'CÀI ĐẶT HỆ THỐNG': { text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20' },
  'DỊCH VỤ HỌC ĐƯỜNG': { text: 'text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-600 dark:bg-cyan-400', activeBg: 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' },
};


function segmentLabel(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\\b\\w/g, letter => letter.toUpperCase());
}

export default function AdminShell({ locale, children }: { locale: string; children: ReactNode }) {
  const { allowedModules, canAccessModule, isLoading: isPermissionsLoading } = usePermissions();
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
  const [sopAlert, setSopAlert] = useState<{
    id: string;
    title: string;
    module: string;
    severity: string;
    owner: string;
    deadline: string;
  } | null>(null);
  const [sopCompletedSteps, setSopCompletedSteps] = useState<number[]>([]);
  const [switcherAllowed, setSwitcherAllowed] = useState(false);

  useEffect(() => {
    const handleUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const sopAlertId = params.get('sopAlertId');
      if (sopAlertId) {
        setSopAlert({
          id: sopAlertId,
          title: params.get('sopTitle') || 'Cảnh báo',
          module: params.get('sopModule') || 'Tổng hợp',
          severity: params.get('sopSeverity') || 'Cao',
          owner: params.get('sopOwner') || 'Chưa rõ',
          deadline: params.get('sopDeadline') || 'Trong ngày',
        });
      } else {
        setSopAlert(null);
      }
    };

    handleUrlParams();
    
    window.addEventListener('popstate', handleUrlParams);
    window.addEventListener('click', () => setTimeout(handleUrlParams, 150));
    return () => {
      window.removeEventListener('popstate', handleUrlParams);
      window.removeEventListener('click', handleUrlParams);
    };
  }, [pathname]);
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

  const refreshNotificationSummary = async () => {
    try {
      const response = await fetch('/api/notifications/summary', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (data?.status !== 'success') return;
      setNotificationSummary({
        total: Number(data.total || 0),
        tasks: Number(data.tasks || 0),
        directives: Number(data.directives || 0),
        announcements: Number(data.announcements || 0),
        urgent: Number(data.urgent || 0),
        latest: Array.isArray(data.latest) ? data.latest : [],
      });
    } catch (error) {
      console.warn('Notification summary failed', error);
    }
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
    return `${cleanName}@misvn.edu.vn`;
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

  const WORKSPACE_MENU_MAPPING: Record<string, string[]> = {
    ALL: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'VẬN HÀNH & NGUỒN LỰC', 'DỊCH VỤ HỌC ĐƯỜNG', 'CÀI ĐẶT HỆ THỐNG'],
    BGH: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'VẬN HÀNH & NGUỒN LỰC', 'DỊCH VỤ HỌC ĐƯỜNG', 'CÀI ĐẶT HỆ THỐNG'],
    TUYEN_SINH_PR: ['BỘ MÁY ĐIỀU HÀNH', 'VẬN HÀNH & NGUỒN LỰC', 'CÀI ĐẶT HỆ THỐNG'],
    QUOC_TE: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    CTHS_TAM_LY: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'VẬN HÀNH & NGUỒN LỰC', 'CÀI ĐẶT HỆ THỐNG'],
    DICH_VU_HOC_DUONG: ['BỘ MÁY ĐIỀU HÀNH', 'DỊCH VỤ HỌC ĐƯỜNG', 'CÀI ĐẶT HỆ THỐNG'],
    TOAN_TIN: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    VAN: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    NGOAI_NGU: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    KHTN: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    LS_DL: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    GDCD_KTPL: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    NT_TC_QPAN: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    CN_TRAI_NGHIEM: ['BỘ MÁY ĐIỀU HÀNH', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
    HANH_CHINH: ['BỘ MÁY ĐIỀU HÀNH', 'VẬN HÀNH & NGUỒN LỰC', 'HỌC VỤ & NHÂN SỰ', 'CÀI ĐẶT HỆ THỐNG'],
  };

  const allowedGroups = WORKSPACE_MENU_MAPPING[currentUser?.workspaceId || 'ALL'] || ['BỘ MÁY ĐIỀU HÀNH', 'CÀI ĐẶT HỆ THỐNG'];

  const rawMenuGroups = (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') 
    ? menuGroups 
    : currentUser?.workspaceId === 'KHAO_THI' ? [
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
  ] : menuGroups.filter(g => allowedGroups.includes(g.title));
  
  const activeMenuGroups = useMemo(() => {
    const mapped = rawMenuGroups.map(group => {
        const targetTitles = ['BỘ MÁY ĐIỀU HÀNH', 'CÀI ĐẶT HỆ THỐNG'];
        if (targetTitles.includes(group.title)) {
          const extraItems: { label: string; href: string; icon: any; badgeKey?: 'tasks' | 'directives' | 'announcements'; roles?: string[]; moduleCode?: string }[] = [];
          
          if (group.title === 'BỘ MÁY ĐIỀU HÀNH') {
            extraItems.push({ label: 'Chat nội bộ', href: 'chat', icon: MessageSquare, moduleCode: 'DASHBOARD' });
          }
        
        if (group.title === 'CÀI ĐẶT HỆ THỐNG' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER')) {
          extraItems.push({ label: 'Cấu hình hệ thống', href: 'system-data/settings', icon: Settings, moduleCode: 'SYSTEM' });
          extraItems.push({ label: 'Danh mục hệ thống', href: 'system-data/categories', icon: List, moduleCode: 'SYSTEM' });
        }
        
        const existingHrefs = new Set(group.items.map(i => i.href.split('?')[0]));
        const filteredExtra = extraItems.filter(item => !existingHrefs.has(item.href));
        
        return {
          ...group,
          items: [...group.items, ...filteredExtra]
        };
      }
      return group;
    });

    const hasDynamicPermissions = !isPermissionsLoading && allowedModules.length > 0;

    const MODULE_CODE_TO_SLUG: Record<string, string[]> = {
      'DASHBOARD': ['dashboard'],
      'ACADEMIC': ['academic', 'classes', 'schedule', 'exams'],
      'CRM_ADMISSIONS': ['crm', 'admissions'],
      'OPERATIONS': ['operations', 'services', 'dashboard', 'hrm'],
      'SYSTEM': ['settings', 'system'],
      'SERVICES': ['services'],
      'FINANCE': ['finance'],
    };

    return mapped.map(group => ({
      ...group,
      items: group.items.filter(item => {
        // 1. Nếu item có yêu cầu vai trò cụ thể (ví dụ ADMIN, MANAGER), người dùng bắt buộc phải có vai trò đó
        if (item.roles && (!currentUser || !item.roles.includes(currentUser.role))) {
          return false;
        }
        // 2. Các chức năng chuyên biệt của BGH chỉ dành cho workspace BGH hoặc ADMIN
        const bghOnlyHrefs = ['dashboard/council', 'dashboard/academic', 'dashboard/okrs', 'risk', 'directives'];
        const baseHref = item.href.split('?')[0];
        if (bghOnlyHrefs.includes(baseHref)) {
          if (currentUser?.workspaceId !== 'BGH' && currentUser?.role !== 'ADMIN') {
            return false;
          }
        }

        const hasLegacyAccess = !item.roles || (currentUser && item.roles.includes(currentUser.role));
        if (item.moduleCode === 'SYSTEM' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER')) {
          return true;
        }
        if (item.moduleCode && hasDynamicPermissions) {
          const targetSlugs = MODULE_CODE_TO_SLUG[item.moduleCode] || [item.moduleCode.toLowerCase()];
          return targetSlugs.some(slug => canAccessModule(slug));
        }
        return hasLegacyAccess;
      })
    })).filter(group => group.items.length > 0);
  }, [rawMenuGroups, currentUser, allowedModules, canAccessModule, isPermissionsLoading]);

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
        onLoginSuccess={async (user) => {
          try {
            await fetch('/api/settings/user-switcher', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetUserId: user.id }),
            });
          } catch (e) {
            console.error('Failed to set login cookie', e);
          }
          serverStorage.setItem('mis_edutask_logged_in', 'true');
          serverStorage.setItem('mis_edutask_logged_in_user_id', user.id);
          setCurrentUser(user);
          setIsLoggedIn(true);
          window.location.reload();
        }}
        initialUser={MOCK_USERS[0]}
      />
    );
  }

  const isDepartmentRoute = pathname.includes('/departments/');
  const currentDepartmentId = isDepartmentRoute ? pathname.split('/departments/')[1]?.split('/')[0] : null;
  const currentDepartmentName = currentDepartmentId ? WORKSPACES.find(w => w.id === currentDepartmentId)?.name || 'Phòng ban' : '';

  const roleDashboard = ROLE_DASHBOARD[inferPrimaryRole(currentUser)] || '/dashboard';
  const homeHref = `/${locale}${roleDashboard}`;

  const Sidebar = isDepartmentRoute && currentDepartmentId ? (
    <aside className={cn('flex h-full flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-950', collapsed ? 'w-20' : 'w-72')}>
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
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
      <DepartmentSidebar 
        locale={locale} 
        departmentId={currentDepartmentId} 
        departmentName={currentDepartmentName} 
        collapsed={collapsed} 
      />
    </aside>
  ) : (
    <aside className={cn('flex h-full flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-950', collapsed ? 'w-20' : 'w-72')}>
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3">
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

  const removeSopParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('sopAlertId');
    url.searchParams.delete('sopTitle');
    url.searchParams.delete('sopModule');
    url.searchParams.delete('sopSeverity');
    url.searchParams.delete('sopOwner');
    url.searchParams.delete('sopDeadline');
    window.history.pushState({}, '', url.toString());
    setSopAlert(null);
  };

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
        <header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
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

            <Button variant="ghost" size="icon" onClick={() => setIsNotifOpen(true)} className="relative text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-300" title={`${notificationSummary.total} mục cần kiểm tra`}>
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
                <div className="absolute right-0 z-[120] mt-2 w-[min(92vw,560px)] overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-800 dark:bg-slate-950">
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
        onChanged={refreshNotificationSummary}
      />

      {/* SOP Regulatory Handling Drawer */}
      {sopAlert && (
        <div className="fixed inset-0 z-[999] flex justify-end bg-black/45 backdrop-blur-xs">
          <button 
            type="button" 
            onClick={removeSopParams} 
            className="absolute inset-0 w-full h-full cursor-default bg-transparent border-0"
            aria-label="Đóng ngăn kéo"
          />
          <div className="relative w-[480px] max-w-full h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-widest block mb-1">
                  Quy trình chuẩn SOP
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {sopAlert.title}
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={removeSopParams}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                ✕
              </Button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Alert Meta Info */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800 rounded-sm grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Nguồn sự vụ:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sopAlert.module}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Độ nghiêm trọng:</span>
                  <span className="font-bold text-red-650">{sopAlert.severity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phụ trách xử lý:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sopAlert.owner}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Hạn giải quyết:</span>
                  <span className="font-bold text-red-650">{sopAlert.deadline}</span>
                </div>
              </div>

              {/* Timeline Steps (SOP Timeline) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Các bước xử lý theo quy định</h4>
                  <span className="text-[10px] font-bold text-slate-500">
                    {sopCompletedSteps.length}/4 hoàn thành
                  </span>
                </div>

                <div className="relative pl-6 space-y-5 border-l border-slate-200 dark:border-slate-800 ml-3">
                  {[
                    ...(sopAlert.module === 'Phê duyệt' ? [
                      { step: 1, name: 'Kiểm tra thông tin & lịch trình', desc: 'Rà soát lý do nghỉ phép, kế hoạch giảng dạy hoặc báo cáo đề xuất thiết bị để đảm bảo tính hợp lý.' },
                      { step: 2, name: 'Kiểm tra định mức phép còn lại', desc: 'Xem xét số ngày phép năm còn lại của nhân sự hoặc định mức ngân sách của phòng ban đề xuất.' },
                      { step: 3, name: 'Xác nhận ý kiến Trưởng bộ phận', desc: 'Đảm bảo Trưởng phòng ban đã phê duyệt sơ bộ trước khi trình BGH ký duyệt cuối cùng.' },
                      { step: 4, name: 'Ký duyệt & Cập nhật hệ thống', desc: 'Sử dụng các tính năng phê duyệt trên trang để hoàn tất quy trình phê duyệt.' }
                    ] : []),
                    ...(sopAlert.module === 'Rủi ro' ? [
                      { step: 1, name: 'Xác minh hiện trạng rủi ro', desc: 'Khảo sát thực tế, đánh giá mức độ nghiêm trọng và khả năng tác động tiêu cực đến vận hành trường.' },
                      { step: 2, name: 'Thiết lập chốt kiểm soát khẩn cấp', desc: 'Áp dụng ngay các chốt chặn tạm thời để ngăn chặn rủi ro phát sinh hoặc lan rộng thêm.' },
                      { step: 3, name: 'Ban hành kế hoạch khắc phục CAPA', desc: 'Chỉ định nhân viên phụ trách trực tiếp và thời hạn hoàn thành biện pháp khắc phục triệt để.' },
                      { step: 4, name: 'Thẩm định hiệu lực chốt kiểm soát', desc: 'Tổ chức đoàn rà soát độc lập để nghiệm thu và kiểm tra định kỳ tính ổn định.' }
                    ] : []),
                    ...(sopAlert.module === 'Tài sản' ? [
                      { step: 1, name: 'Tiếp nhận & Xác minh lỗi kỹ thuật', desc: 'Kỹ thuật viên phòng CSVC kiểm tra trực tiếp hiện trạng thiết bị báo hỏng.' },
                      { step: 2, name: 'Lập phương án sửa chữa / thay thế', desc: 'Đánh giá chi phí khắc phục. Nếu chi phí vượt 50% giá trị thiết bị mới, lập đề xuất thanh lý và mua sắm.' },
                      { step: 3, name: 'Thực hiện bảo trì & Sửa chữa phần cứng', desc: 'Kỹ thuật viên hoặc đơn vị dịch vụ bên ngoài tiến hành sửa chữa theo phê duyệt.' },
                      { step: 4, name: 'Nghiệm thu bàn giao & Cập nhật mã QR', desc: 'Kiểm tra vận hành thực tế tại phòng học, dán lại mã QR và ký biên bản bàn giao.' }
                    ] : []),
                    ...(sopAlert.module === 'Nhân sự' ? [
                      { step: 1, name: 'Đánh giá hiệu quả công việc', desc: 'Xem xét kết quả KPI, thái độ và đóng góp của nhân viên trong chu kỳ hợp đồng hiện tại.' },
                      { step: 2, name: 'Tổ chức phỏng vấn tái ký hợp đồng', desc: 'Trưởng bộ phận trao đổi về nguyện vọng gắn bó và định hướng phát triển của nhân sự.' },
                      { step: 3, name: 'Thống nhất điều khoản hợp đồng mới', desc: 'Phòng HCNS soạn thảo phụ lục, điều chỉnh mức lương/thưởng theo quy định mới.' },
                      { step: 4, name: 'Ký kết và cập nhật hồ sơ lưu trữ', desc: 'BGH ký duyệt hợp đồng chính thức, lưu trữ hồ sơ giấy và cập nhật dữ liệu trên module HRM.' }
                    ] : []),
                    ...(sopAlert.module === 'Văn bản' ? [
                      { step: 1, name: 'Thu thập thông tin thay đổi thực tế', desc: 'Thu thập ý kiến đóng góp từ các bộ phận trực tiếp áp dụng quy trình/biểu mẫu để phát hiện điểm bất cập.' },
                      { step: 2, name: 'Soạn thảo bản cập nhật quy trình (SOP)', desc: 'Cập nhật nội dung, rút ngắn các bước rườm rà, điều chỉnh thời gian hoàn thành (SLA) phù hợp thực tế.' },
                      { step: 3, name: 'Trình thẩm định & Phê duyệt pháp lý', desc: 'Ban kiểm soát kiểm tra tính tuân thủ quy chế hoạt động của trường trước khi trình BGH.' },
                      { step: 4, name: 'Truyền thông và tổ chức tập huấn', desc: 'Ban hành văn bản mới, lưu trữ văn bản cũ vào kho Archive và tổ chức tập huấn áp dụng cho toàn trường.' }
                    ] : []),
                    ...(!['Phê duyệt', 'Rủi ro', 'Tài sản', 'Nhân sự', 'Văn bản'].includes(sopAlert.module) ? [
                      { step: 1, name: 'Xác minh thông tin sự việc', desc: 'Liên hệ các bên liên quan để nắm rõ thông tin chi tiết và nguyên nhân sự vụ.' },
                      { step: 2, name: 'Đề xuất phương án xử lý lên BGH', desc: 'Tham mưu các phương án giải quyết tối ưu theo quy chế và tiền lệ xử lý của nhà trường.' },
                      { step: 3, name: 'Thực hiện phương án được phê duyệt', desc: 'Bộ phận chuyên môn triển khai giải pháp xử lý theo đúng chỉ đạo.' },
                      { step: 4, name: 'Lưu trữ hồ sơ và rút kinh nghiệm', desc: 'Cập nhật báo cáo kết quả xử lý và ghi nhận chốt kiểm soát ngăn ngừa tái phát.' }
                    ] : [])
                  ].map((s) => {
                    const isCompleted = sopCompletedSteps.includes(s.step);
                    return (
                      <div key={s.step} className="relative">
                        <div 
                          className={cn(
                            "absolute -left-[30px] top-0.5 h-4.5 w-4.5 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all z-10 bg-white dark:bg-slate-950",
                            isCompleted 
                              ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950" 
                              : "border-slate-300 text-slate-500"
                          )}
                        >
                          {s.step}
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSopCompletedSteps(prev => [...prev, s.step]);
                              } else {
                                setSopCompletedSteps(prev => prev.filter(x => x !== s.step));
                              }
                            }}
                            className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 shrink-0"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <label className={cn(
                              "text-xs font-bold block cursor-pointer transition-colors",
                              isCompleted ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-200"
                            )}>
                              {s.name}
                            </label>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              {s.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-2">
              <Button 
                onClick={() => {
                  const dismissedStr = serverStorage.getItem('mis_dismissed_alerts') || '[]';
                  let dismissed: string[] = [];
                  try {
                    dismissed = JSON.parse(dismissedStr);
                  } catch (e) {}
                  
                  if (!dismissed.includes(sopAlert.id)) {
                    dismissed.push(sopAlert.id);
                    serverStorage.setItem('mis_dismissed_alerts', JSON.stringify(dismissed));
                  }

                  removeSopParams();
                  
                  setToastNotice('Đã xử lý sự vụ thành công. Hệ thống đã ghi nhận hoàn thành quy trình SOP.');
                  window.setTimeout(() => setToastNotice(''), 4000);
                  
                  window.dispatchEvent(new Event('sop-dismissed'));
                }}
                disabled={sopCompletedSteps.length < 4}
                className="w-full bg-slate-900 text-white rounded-sm hover:bg-slate-800 text-xs font-bold py-2.5 transition-colors duration-150"
              >
                Hoàn tất xử lý & Đóng cảnh báo
              </Button>
              <Button 
                variant="ghost" 
                onClick={removeSopParams}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Hủy bỏ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
