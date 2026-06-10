import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './context/LanguageContext';
import { translateWorkspace, translateUser, translateTask, translateAnnouncement, translateDirective } from './utils/translations';
import { Task, Workspace, UserProfile, Role, TaskStatus, TaskPriority, Comment, RbacConfig, RolePermissions, Announcement, BoardDirective, RELIABLE_AVATARS, getSafeAvatar } from './types';
import { WORKSPACES as INITIAL_WORKSPACES, MOCK_USERS, INITIAL_TASKS } from './mockData';
import { enrichUserWithMIDetails, MI_KEY_DETAILS } from './miAndOkrUtils';
import { MIProfile } from './types';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import TaskCard from './components/TaskCard';
import WorkspaceStats from './components/WorkspaceStats';
import ProductivityTrendChart from './components/ProductivityTrendChart';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import TaskCalendar from './components/TaskCalendar';
import TaskModal from './components/TaskModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import GoogleSheetsCenter from './components/GoogleSheetsCenter';
import LoginPortal from './components/LoginPortal';
import WorkspaceManager from './components/WorkspaceManager';
import StrategyOkrHub from './components/StrategyOkrHub';
import WorkflowBuilder from './components/WorkflowBuilder';
import SchoolCrmHub from './components/SchoolCrmHub';
import StudentSuccessHub from './components/StudentSuccessHub';
import TeacherHrHub from './components/TeacherHrHub';
import RiskManagementCenter from './components/RiskManagementCenter';
import ReportingAnalyticsBuilder from './components/ReportingAnalyticsBuilder';
import AcademicOperations from './components/AcademicOperations';
import SchoolLogistics from './components/SchoolLogistics';
import SchoolRequests from './components/SchoolRequests';
import HrmCenter from './components/HrmCenter';
import BoardDirectivePanel from './components/BoardDirectivePanel';
import IntelligenceAndOkrHub from './components/IntelligenceAndOkrHub';
import MisLmsCenter from './components/MisLmsCenter';
import DocumentCenter from './components/DocumentCenter';
import MeetingCenter from './components/MeetingCenter';
import KnowledgeBase from './components/KnowledgeBase';
import EventManagement from './components/EventManagement';
import RbacSettingsModal, { DEFAULT_RBAC_CONFIG } from './components/RbacSettingsModal';
import GuideModal from './components/GuideModal';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  School, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Layers, 
  Calendar as CalendarIcon, 
  ListTodo, 
  Grid, 
  UserCheck, 
  Layout, 
  TrendingUp, 
  FileCheck,
  Bell,
  CheckCircle2,
  Cpu,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Users,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Award,
  FileSpreadsheet,
  Settings,
  Shield,
  Smartphone,
  Tablet,
  Laptop,
  QrCode,
  Copy,
  ExternalLink,
  Check,
  Menu,
  X,
  Brain,
  BookOpen,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  Megaphone,
  FileText,
  CalendarDays,
  GraduationCap,
  Building2,
  ClipboardList,
  Volume2,
  FolderOpen
} from 'lucide-react';

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'annce_1',
    title: 'Họp Giao Ban Đột Xuất: Rà soát hạ tầng thiết bị quạt máy mùa tuyển sinh & thi cử',
    content: 'Kính gửi các Thầy Cô Tổ trưởng chuyên môn và Phó Hiệu trưởng,\n\nCEO đề nghị chúng ta họp khẩn để thống nhất phương án kiểm định rà soát thiết bị, đảm bảo tối đa điều kiện làm mát tại 40 phòng thi chính thức phục vụ kỳ thi Tốt nghiệp THPT và các sự kiện tuyển sinh khối Tiểu học sắp tới.\n\nYêu cầu các đồng chí:\n1. Báo cáo nhanh tiến độ thực tế sửa chữa lắp đặt thiết bị.\n2. Chuẩn bị tài liệu kinh phí phát sinh nếu có.\n\nKính mời đồng chí dự họp đầy đủ và đúng giờ.',
    senderName: 'HVL',
    senderTitle: 'Giám đốc Điều hành (CEO)',
    senderAvatar: 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?w=150&h=150&fit=crop&crop=face',
    createdAt: '2026-05-30 09:00',
    targetRoles: ['ADMIN', 'MANAGER'],
    meetingTime: '14:30 Thứ 2 (01/06)',
    meetingLocation: 'Phòng họp Hội đồng tầng 3 (MIS)',
    isMeeting: true,
    acknowledgedBy: [
      {
        userId: 'user_chutich',
        userName: 'Thầy PGS.TS. Nguyễn Văn Minh',
        userTitle: 'Chủ tịch Hội đồng Trường',
        status: 'DA_XAC_NHAN'
      },
      {
        userId: 'user_triet',
        userName: 'Thầy Chưa Biết Chừng',
        userTitle: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
        status: 'DA_XAC_NHAN',
        note: 'Đã sẵn sàng kịch bản ôn tập và rà soát hạ tầng phòng chuyên môn'
      }
    ]
  },
  {
    id: 'annce_2',
    title: 'Thông cáo phối hợp kiểm tra hồ sơ học vụ đổi mới phương pháp giảng dạy Ngữ văn mới',
    content: 'Ban Giám hiệu trân quý ghi nhận tinh thần đổi mới giảng dạy của Tổ Ngữ văn. Đề nghị Tổ trưởng Tổ Ngữ văn phối hợp kiểm tra hồ sơ giáo án mẫu tích hợp công nghệ để phổ biến rộng rãi cho toàn trường trong tuần tới. \n\nTrân trọng.',
    senderName: 'Thầy Chưa Biết Chừng',
    senderTitle: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2026-05-29 14:00',
    targetRoles: ['ADMIN', 'MANAGER', 'STAFF'],
    isMeeting: false,
    acknowledgedBy: []
  }
];

const INITIAL_DIRECTIVES: BoardDirective[] = [
  {
    id: 'directive_1',
    title: 'Nghị quyết số 08/NQ-HĐ: Định hướng chiến lược đầu tư cơ sở vật chất kỹ thuật & Phòng Lab AI',
    content: 'Hội đồng Trường nhất trí thông qua đề án cải tạo phòng nghiên cứu Công nghệ số, bổ sung trang thiết bị máy tính cấu hình cao phục vụ các dự án đột phá về Robotics, AI ứng dụng và Đa trí tuệ trong niên khóa mới.\n\nSẽ phân bổ đợt 1 bắt đầu từ 01/07/2026. Giao Ban Giám hiệu và bộ phận Hành chính thiết bị triển khai kết hợp cùng các tổ chuyên môn, lập biểu mẫu giám sát chất lượng.',
    senderId: 'user_chutich',
    senderName: 'Thầy PGS.TS. Nguyễn Văn Minh',
    senderTitle: 'Chủ tịch Hội đồng Trường',
    senderAvatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face',
    createdAt: '2026-05-30 08:00',
    category: 'CHI_DAO_CHIEN_LUOC',
    urgency: 'THUONG',
    implementations: [
      {
        userId: 'user_triet',
        userName: 'Thầy Chưa Biết Chừng',
        userTitle: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
        status: 'DA_TIEP_THU',
        feedback: 'Ban Giám hiệu đã tiếp nhận ý kiến của Hội đồng trường và bắt đầu lập hội đồng thẩm định ngân sách.',
        updatedAt: '2026-05-30 11:15'
      }
    ]
  },
  {
    id: 'directive_2',
    title: 'Chỉ thị khẩn quyết định triển khai rà soát an toàn vệ sinh an học đường tối cao',
    content: 'Đề nghị Tổng quản lý Bếp ăn học đường phối hợp chặt chẽ trực tiếp với Phòng Vận hành, tiến hành kiểm liên đới toàn bộ hồ sơ chất lượng nhập thực phẩm, quy trình bảo quản tươi và lưu mẫu thực phẩm trong 24h.\n\nYêu cầu nộp báo cáo kết quả rà soát lên trực tiếp CEO trước ngày 05/06/2026.',
    senderId: 'user_ceo',
    senderName: 'HVL',
    senderTitle: 'Giám đốc Điều hành (CEO)',
    senderAvatar: 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?w=150&h=150&fit=crop&crop=face',
    createdAt: '2026-05-30 10:15',
    category: 'CHI_THI_KHAN',
    urgency: 'KHAN',
    implementations: [
      {
        userId: 'user_triet',
        userName: 'Thầy Chưa Biết Chừng',
        userTitle: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
        status: 'DANG_TRIEN_KHAI',
        feedback: 'Đã lập biên bản kiểm tra đột xuất cùng cô Hoàng Kim Oanh lúc 15:00 hôm nay. Đang tổng hợp các điểm lưu ý mẫu thức ăn.',
        updatedAt: '2026-05-30 15:30'
      }
    ]
  }
];

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandQuery('');
        setIsCommandPaletteOpen(true);
        window.setTimeout(() => commandInputRef.current?.focus(), 0);
      }

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mis_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mis_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mis_theme', 'light');
    }
  }, [darkMode]);

  // Persistence state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Stateful users directory
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('school_task_manager_users_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const initUsers = MOCK_USERS.map(u => {
      const enriched = enrichUserWithMIDetails(u);
      return {
        ...enriched,
        cpdHours: u.id === 'user_nhan' ? 24 : u.id === 'user_nhung' ? 18 : u.id === 'user_dat' ? 12 : 8,
        cpdLog: [
          { id: 'cpd_1', title: 'Tập huấn Sư phạm Số & Tích hợp AI hỗ trợ soạn bài', hours: 4, date: '2026-05-12' },
          { id: 'cpd_2', title: 'Hội thảo Đổi mới Phương pháp Giáo dục liên môn', hours: 4, date: '2026-05-18' }
        ],
        kpiLocked: false
      };
    });
    localStorage.setItem('school_task_manager_users_profiles', JSON.stringify(initUsers));
    return initUsers;
  });

  const saveUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('school_task_manager_users_profiles', JSON.stringify(updatedUsers));
  };

  const [selectedStaffProfile, setSelectedStaffProfile] = useState<UserProfile | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'INFO' | 'MI' | 'KPI' | 'CPD'>('INFO');
  const [newCpdTitle, setNewCpdTitle] = useState('');
  const [newCpdHours, setNewCpdHours] = useState('4');
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mis_edutask_logged_in') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUserId = localStorage.getItem('mis_edutask_logged_in_user_id');
    const localUsersStr = localStorage.getItem('school_task_manager_users_profiles');
    if (localUsersStr) {
      try {
        const parsed = JSON.parse(localUsersStr) as UserProfile[];
        const matched = parsed.find(u => u.id === savedUserId);
        if (matched) return matched;
      } catch (e) {}
    }
    const matched = MOCK_USERS.find(u => u.id === savedUserId);
    return matched ? enrichUserWithMIDetails(matched) : enrichUserWithMIDetails(MOCK_USERS[0]);
  });

  const handleOnboardUser = (newStaff: { name: string; workspaceId: string; title: string; role: Role }) => {
    const roleName = newStaff.role === 'ADMIN' ? 'Ban Giám hiệu' : newStaff.role === 'MANAGER' ? 'Tổ trưởng Chuyên môn' : 'Giáo viên / Nhân viên';
    const newId = `user_${newStaff.name.toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}_${Date.now().toString().slice(-4)}`;
    const avatar = getSafeAvatar('', newStaff.name);
    
    const newUser: UserProfile = {
      id: newId,
      name: newStaff.name,
      role: newStaff.role,
      roleName: roleName,
      title: newStaff.title,
      avatar: avatar,
      workspaceId: newStaff.workspaceId,
      miProfile: {
        logical: 60,
        linguistic: 60,
        spatial: 60,
        musical: 60,
        kinesthetic: 60,
        interpersonal: 60,
        intrapersonal: 60,
        naturalist: 60
      },
      badges: ['🌱 Thành viên Onboard mới'],
      cpdHours: 0,
      cpdLog: [],
      kpiLocked: false
    };

    saveUsers([...users, newUser]);
  };

  // Browser notifications integration
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const isFirstLoadRef = useRef(true);
  const prevTasksRef = useRef<Task[]>([]);

  useEffect(() => {
    // Reset load tracker and tracking cache when switching users to avoid triggering mock notifications
    isFirstLoadRef.current = true;
    prevTasksRef.current = [];
  }, [currentUser.id]);

  const showBrowserNotification = (task: Task) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: `Người giao: ${task.createdBy}\nĐộ ưu tiên: ${task.priority} | Tag: ${task.tag}\nHạn chót: ${task.deadline}\nNội dung: ${task.description.slice(0, 120)}${task.description.length > 120 ? '...' : ''}`,
        icon: 'https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png',
        tag: `task-${task.id}`,
        requireInteraction: true,
      };

      const n = new Notification(`🔔 Chỉ đạo mới từ MIS: ${task.title}`, options);
      n.onclick = () => {
        window.focus();
        setSelectedTaskForDetail(task);
        n.close();
      };
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng thông báo.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        const welcome = new Notification('🔔 Bật thông báo thành công!', {
          body: 'Hệ thống MIS Smart Portal sẽ tự động hiển thị thông báo ngay khi có chỉ đạo mới được phân công cho thầy/cô.',
          icon: 'https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png',
        });
        welcome.onclick = () => {
          window.focus();
          welcome.close();
        };
      }
    } catch (err) {
      console.error('Không thể kích hoạt quyền thông báo:', err);
    }
  };

  const [rbacConfig, setRbacConfig] = useState<RbacConfig>(DEFAULT_RBAC_CONFIG);
  const [userOverrides, setUserOverrides] = useState<Record<string, Partial<RolePermissions>>>({});
  const [groupByDepartment, setGroupByDepartment] = useState<boolean>(true);
  const [mobileActiveWorkspace, setMobileActiveWorkspace] = useState<string>('');
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);
  const [showPermissionsPopover, setShowPermissionsPopover] = useState(false);

  const saveRbacConfig = async (updatedConfig: RbacConfig) => {
    setRbacConfig(updatedConfig);
    localStorage.setItem('school_task_manager_rbac', JSON.stringify(updatedConfig));
    try {
      await setDoc(doc(db, 'config', 'rbac'), { config: updatedConfig });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'config/rbac');
    }
  };

  const saveUserOverrides = async (updatedOverrides: Record<string, Partial<RolePermissions>>) => {
    setUserOverrides(updatedOverrides);
    try {
      await setDoc(doc(db, 'config', 'user_overrides'), { overrides: updatedOverrides });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'config/user_overrides');
    }
  };

  const hasPermission = (permissionKey: keyof RolePermissions, taskContext?: Task) => {
    if (!currentUser) return false;
    const role = currentUser.role;

    // 1. ADMIN has absolute access to everything
    if (role === 'ADMIN') return true;

    // 2. Check task context if provided (restrict writing actions if cross-workspace or unassigned)
    if (taskContext) {
      // MANAGER (Tổ trưởng) can only edit/manipulate tasks within their own department/workspace
      if (role === 'MANAGER' && taskContext.workspaceId !== currentUser.workspaceId) {
        if (['editTask', 'deleteTask', 'approveReport', 'rejectReport', 'submitReport'].includes(permissionKey)) {
          return false; // Cross-department mutation forbidden
        }
      }
      
      // STAFF (Giáo viên) can only edit, changeStatus, submitReport on tasks assigned to them
      if (role === 'STAFF' && taskContext.assignedId !== currentUser.id) {
        if (['changeStatus', 'submitReport', 'editTask', 'approveReport', 'rejectReport', 'deleteTask'].includes(permissionKey)) {
          return false; // Cannot modify peers' work
        }
      }
    }

    // 3. User overrides first (phân quyền theo user)
    const userOverride = userOverrides[currentUser.id];
    if (userOverride && userOverride[permissionKey] !== undefined) {
      return userOverride[permissionKey] as boolean;
    }

    // 4. Fall back to role-based safety (RBAC)
    return rbacConfig[role]?.[permissionKey] ?? false;
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<TaskStatus>('DANG_TIEN_HANH');

  const handleSelectViewOnMobile = (view: 'KANBAN' | 'CALENDAR' | 'LIST') => {
    setActiveView(view);
    setOverviewTab('TASKS');
    setIsSidebarOpen(false);
  };

  const handleSelectWorkspaceOnMobile = (wId: string) => {
    setSelectedWorkspace(wId);
    setIsSidebarOpen(false);
  };

  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [activeView, setActiveView] = useState<'KANBAN' | 'CALENDAR' | 'LIST'>('KANBAN');
  const [overviewTab, setOverviewTab] = useState<'DASHBOARD' | 'STRATEGY_OKRS' | 'TASKS' | 'WORKFLOW_APPROVALS' | 'CRM_ADMISSIONS' | 'STUDENT_SUCCESS' | 'TEACHER_HR' | 'RISK_CENTER' | 'ANALYTICS' | 'BOARD_DIRECTIVES' | 'ACADEMIC_OPS' | 'LOGISTICS' | 'REQUESTS' | 'HRM' | 'LMS' | 'GOOGLE_SHEETS' | 'DOCUMENT' | 'MEETING' | 'KNOWLEDGE' | 'EVENTS'>('DASHBOARD');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tagFilter, setTagFilter] = useState<string>('ALL');
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<'ALL' | 'TODAY' | 'THIS_WEEK' | 'OVERDUE'>('ALL');
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({
    BGH: false,
    TOAN_TIN: false,
    VAN: false,
    HANH_CHINH: false
  });

  const toggleBranch = (workspaceId: string) => {
    setExpandedBranches(prev => ({
      ...prev,
      [workspaceId]: !prev[workspaceId]
    }));
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    foundation: true,
    operation: true,
    strategy: true,
    business: true,
    campus: true,
  });

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Panels visibility state to avoid long page (tránh để tình trạng trang quá dài)
  const [visiblePanels, setVisiblePanels] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mis_visible_panels');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      directives: true,
      stats: true,
      charts: false
    };
  });

  const togglePanel = (panelKey: string) => {
    setVisiblePanels(prev => {
      const updated = {
        ...prev,
        [panelKey]: !prev[panelKey]
      };
      localStorage.setItem('mis_visible_panels', JSON.stringify(updated));
      return updated;
    });
  };

  // Modal control states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [directives, setDirectives] = useState<BoardDirective[]>([]);

  const saveAnnouncements = (updated: Announcement[]) => {
    setAnnouncements(updated);
    localStorage.setItem('school_task_manager_announcements', JSON.stringify(updated));
  };

  const saveDirectives = (updated: BoardDirective[]) => {
    setDirectives(updated);
    localStorage.setItem('school_task_manager_directives', JSON.stringify(updated));
  };

  // central effect to trigger silent anonymous auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Firebase anonymous authentication completed.");
        setIsAuthReady(true);
      } catch (err) {
        console.warn("Firebase Auth is bypassed or offline:", err);
        setIsAuthReady(true); // proceed to sync anyway
      }
    };
    initAuth();
  }, []);

  // Syncing workspaces
  useEffect(() => {
    if (!isAuthReady) return;
    const unsub = onSnapshot(collection(db, 'workspaces'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const w of INITIAL_WORKSPACES) {
            await setDoc(doc(db, 'workspaces', w.id), w);
          }
        } catch (err) {
          console.error("Error seeding workspaces to Firestore:", err);
        }
      } else {
        const loaded: Workspace[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as Workspace);
        });
        setWorkspaces(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'workspaces');
    });
    return () => unsub();
  }, [isAuthReady]);

  // Syncing tasks
  useEffect(() => {
    if (!isAuthReady) return;
    const unsub = onSnapshot(collection(db, 'tasks'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const t of INITIAL_TASKS) {
            await setDoc(doc(db, 'tasks', t.id), t);
          }
        } catch (err) {
          console.error("Error seeding tasks to Firestore:", err);
        }
      } else {
        const loaded: Task[] = [];
        let hasDemo1 = false;
        let hasDemo2 = false;
        snapshot.forEach((doc) => {
          const t = doc.data() as Task;
          loaded.push(t);
          if (t.id === 'task_demo_minh_1') hasDemo1 = true;
          if (t.id === 'task_demo_minh_2') hasDemo2 = true;
        });

        // Trigger dynamic notification if a new task is assigned to current user
        if (!isFirstLoadRef.current) {
          loaded.forEach((task) => {
            const isAssignedToMe = task.assignedId === currentUser.id;
            if (isAssignedToMe) {
              const prevTask = prevTasksRef.current.find(p => p.id === task.id);
              const isNewlyAssigned = !prevTask || prevTask.assignedId !== currentUser.id;
              if (isNewlyAssigned) {
                showBrowserNotification(task);
              }
            }
          });
        }

        prevTasksRef.current = loaded;
        isFirstLoadRef.current = false;
        setTasks(loaded);

        // Auto seed any missing standard/demo mock tasks directly to keep the system visually rich with all 50+ tasks
        if (loaded.length < 48) {
          try {
            for (const t of INITIAL_TASKS) {
              const alreadyExists = loaded.some(l => l.id === t.id);
              if (!alreadyExists) {
                await setDoc(doc(db, 'tasks', t.id), t);
              }
            }
          } catch (err) {
            console.error("Auto seeding of missing mock tasks failed:", err);
          }
        } else if (!hasDemo1 || !hasDemo2) {
          const d1 = INITIAL_TASKS.find(t => t.id === 'task_demo_minh_1');
          const d2 = INITIAL_TASKS.find(t => t.id === 'task_demo_minh_2');
          try {
            if (!hasDemo1 && d1) await setDoc(doc(db, 'tasks', 'task_demo_minh_1'), d1);
            if (!hasDemo2 && d2) await setDoc(doc(db, 'tasks', 'task_demo_minh_2'), d2);
          } catch (err) {
            console.error("Auto seeding demo tasks failed:", err);
          }
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });
    return () => unsub();
  }, [isAuthReady, currentUser.id]);

  // Syncing directives
  useEffect(() => {
    if (!isAuthReady) return;
    const unsub = onSnapshot(collection(db, 'directives'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const d of INITIAL_DIRECTIVES) {
            await setDoc(doc(db, 'directives', d.id), d);
          }
        } catch (err) {
          console.error("Error seeding directives to Firestore:", err);
        }
      } else {
        const loaded: BoardDirective[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as BoardDirective);
        });
        setDirectives(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'directives');
    });
    return () => unsub();
  }, [isAuthReady]);

  // Syncing rbacConfig
  useEffect(() => {
    if (!isAuthReady) return;
    const unsub = onSnapshot(doc(db, 'config', 'rbac'), async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(doc(db, 'config', 'rbac'), { config: rbacConfig });
        } catch (err) {
          console.error("Error seeding RBAC config to Firestore:", err);
        }
      } else {
        const rbacDoc = snapshot.data();
        if (rbacDoc && rbacDoc.config) {
          setRbacConfig(rbacDoc.config as RbacConfig);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/rbac');
    });
    return () => unsub();
  }, [isAuthReady, rbacConfig]);

  // Syncing userOverrides
  useEffect(() => {
    if (!isAuthReady) return;
    const unsub = onSnapshot(doc(db, 'config', 'user_overrides'), async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(doc(db, 'config', 'user_overrides'), { overrides: {} });
        } catch (err) {
          console.error("Error seeding User Overrides to Firestore:", err);
        }
      } else {
        const docData = snapshot.data();
        if (docData && docData.overrides) {
          setUserOverrides(docData.overrides);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/user_overrides');
    });
    return () => unsub();
  }, [isAuthReady]);

  // Syncing selectedTaskForDetail
  useEffect(() => {
    if (selectedTaskForDetail) {
      const refreshed = tasks.find(t => t.id === selectedTaskForDetail.id);
      if (refreshed) {
        setSelectedTaskForDetail(refreshed);
      } else {
        setSelectedTaskForDetail(null);
      }
    }
  }, [tasks]);

  const handlePublishAnnouncement = (newData: Omit<Announcement, 'id' | 'createdAt' | 'senderName' | 'senderTitle' | 'senderAvatar' | 'acknowledgedBy'>) => {
    const newAnnce: Announcement = {
      ...newData,
      id: `annce_${Date.now()}`,
      createdAt: getCurrentTimeFormatted(),
      senderName: displayCurrentUser.name,
      senderTitle: displayCurrentUser.title,
      senderAvatar: currentUser.avatar,
      acknowledgedBy: []
    };
    saveAnnouncements([newAnnce, ...announcements]);
  };

  const handleConfirmAttendance = (announcementId: string, status: 'DA_XAC_NHAN' | 'VANG_CO_LY_DO', note?: string) => {
    const updated = displayAnnouncements.map(a => {
      if (a.id === announcementId) {
        const currentAcks = a.acknowledgedBy || [];
        const filtered = currentAcks.filter(r => r.userId !== currentUser.id);
        const newAck = {
          userId: currentUser.id,
          userName: displayCurrentUser.name,
          userTitle: displayCurrentUser.title,
          status,
          note: note?.trim() || undefined
        };
        return {
          ...a,
          acknowledgedBy: [...filtered, newAck]
        };
      }
      return a;
    });
    saveAnnouncements(updated);
  };

  const handleSummarizeDailyTasks = async () => {
    setIsSummarizing(true);
    setShowSummaryModal(true);
    setAiSummary('');

    // find incomplete tasks for the current user
    const incompleteTasks = tasks.filter(t => t.assignedId === currentUser.id && t.status !== 'HOAN_THANH');

    try {
      const response = await fetch('/api/gemini/summarize-daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tasks: incompleteTasks,
          teacherName: displayCurrentUser.name 
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setAiSummary(result.summary);
      } else {
        setAiSummary('Rất tiếc, AI Server đã phản hồi lỗi hoặc chưa được kết nối API Key (\n\n' + (result.error || '') + ')');
      }
    } catch (err) {
      console.error(err);
      setAiSummary('Lỗi mạng. Vui lòng thử lại sau.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter(a => a.id !== id);
    saveAnnouncements(updated);
  };

  const handlePublishDirective = async (newData: Omit<BoardDirective, 'id' | 'createdAt' | 'senderId' | 'senderName' | 'senderTitle' | 'senderAvatar' | 'implementations'>) => {
    const newDirId = `directive_${Date.now()}`;
    const newDir: BoardDirective = {
      ...newData,
      id: newDirId,
      createdAt: getCurrentTimeFormatted(),
      senderId: currentUser.id,
      senderName: displayCurrentUser.name,
      senderTitle: displayCurrentUser.title,
      senderAvatar: currentUser.avatar,
      implementations: []
    };
    try {
      await setDoc(doc(db, 'directives', newDirId), newDir);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `directives/${newDirId}`);
    }
  };

  const handleUpdateDirectiveStatus = async (directiveId: string, status: 'DA_TIEP_THU' | 'DANG_TRIEN_KHAI' | 'DA_HOAN_THANH', feedback?: string) => {
    const d = directives.find(item => item.id === directiveId);
    if (!d) return;
    const currentImps = d.implementations || [];
    const filtered = currentImps.filter(i => i.userId !== currentUser.id);
    const newImp = {
      userId: currentUser.id,
      userName: displayCurrentUser.name,
      userTitle: displayCurrentUser.title,
      status,
      feedback: feedback?.trim() || undefined,
      updatedAt: getCurrentTimeFormatted()
    };
    const updatedDir = {
      ...d,
      implementations: [...filtered, newImp]
    };
    try {
      await setDoc(doc(db, 'directives', directiveId), updatedDir);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `directives/${directiveId}`);
    }
  };

  const handleDeleteDirective = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'directives', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `directives/${id}`);
    }
  };

  const saveWorkspaces = async (updatedWorkspaces: Workspace[]) => {
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem('school_task_manager_workspaces', JSON.stringify(updatedWorkspaces));
    try {
      for (const w of updatedWorkspaces) {
        await setDoc(doc(db, 'workspaces', w.id), w);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'workspaces');
    }
  };

  // Switch workspace restriction based on roles if they have a constrained scope
  const handleUserSwitch = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('mis_edutask_logged_in_user_id', user.id);
    localStorage.setItem('mis_edutask_logged_in', 'true');
    // If the selected user belongs to a specific department and is NOT Admin, filter that department initially
    if (user.role !== 'ADMIN') {
      setSelectedWorkspace(user.workspaceId);
    } else {
      setSelectedWorkspace('ALL');
    }
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Helper: Format Current Date Hour
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    const minStr = String(now.getMinutes()).padStart(2, '0');
    const hrStr = String(now.getHours()).padStart(2, '0');
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${hrStr}:${minStr}`;
  };

  const handleSyncComplete = async (syncedTasks: Task[]) => {
    setTasks(syncedTasks);
    try {
      for (const t of syncedTasks) {
        await setDoc(doc(db, 'tasks', t.id), t);
      }
    } catch (e) {
      console.error("Error syncing tasks from Google Sheets:", e);
    }
  };

  // CREATE TASK
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'comments' | 'history'>) => {
    if (!hasPermission('createTask')) {
      alert('Tài khoản của bạn không được cấp quyền khởi tạo chỉ đạo / nhiệm vụ mới.');
      return;
    }
    const newTaskId = `task_${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      comments: [],
      history: [
        {
          id: `h_${Date.now()}`,
          userName: displayCurrentUser.name,
          userTitle: displayCurrentUser.title,
          action: `Đã khởi tạo và giao công việc`,
          createdAt: getCurrentTimeFormatted()
        }
      ]
    };

    try {
      await setDoc(doc(db, 'tasks', newTaskId), newTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `tasks/${newTaskId}`);
    }
    setIsCreateModalOpen(false);
  };

  // UPDATE STATUS (With report evidence support)
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus, evidence?: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (evidence) {
      if (!hasPermission('submitReport', t)) {
        alert('Tài khoản của bạn không có quyền gửi báo cáo & minh chứng thực hiện.');
        return;
      }
    } else if (newStatus === 'HOAN_THANH') {
      if (!hasPermission('approveReport', t)) {
        alert('Tài khoản của bạn không có quyền nghiệm thu hoặc duyệt báo cáo hoàn thành.');
        return;
      }
    } else {
      if (!hasPermission('changeStatus', t)) {
        alert('Tài khoản của bạn không được cấp quyền thay đổi tiến độ công việc.');
        return;
      }
    }

    const historyAction = evidence 
      ? `Đã gửi báo cáo minh chứng: "${evidence.substring(0, 50)}..."`
      : `Đã chuyển đổi trạng thái công việc thành "${getStatusLabel(newStatus)}"`;

    const updatedHistory = [
      ...t.history,
      {
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: historyAction,
        createdAt: getCurrentTimeFormatted()
      }
    ];

    const updatedTask = {
      ...t,
      status: newStatus,
      history: updatedHistory,
      rejectionReason: newStatus === 'HOAN_THANH' ? '' : (t.rejectionReason || ''),
      reportEvidence: evidence !== undefined ? evidence : (t.reportEvidence || '')
    };

    try {
      await setDoc(doc(db, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // REJECT TASK (Managers/Admin requests changes)
  const handleRejectTask = async (taskId: string, reason: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (!hasPermission('rejectReport', t)) {
      alert('Tài khoản của bạn không được cấp quyền yêu cầu điều chỉnh báo cáo.');
      return;
    }

    const updatedHistory = [
      ...t.history,
      {
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: `Yêu cầu chỉnh sửa lại: "${reason}"`,
        createdAt: getCurrentTimeFormatted()
      }
    ];

    const updatedTask = {
      ...t,
      status: 'DANG_TIEN_HANH' as TaskStatus,
      rejectionReason: reason,
      history: updatedHistory
    };

    try {
      await setDoc(doc(db, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // DELETE TASK
  const handleDeleteTask = async (taskId: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (!hasPermission('deleteTask', t)) {
      alert('Tài khoản của bạn không được cấp quyền xóa chỉ đạo.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
        setSelectedTaskForDetail(null);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  // UPDATE TASK
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    const isOnlyChecklistUpdate = Object.keys(updates).length === 1 && updates.checklist !== undefined;
    const canEditTask = hasPermission('editTask', t);
    const isAssignee = t.assignedId === currentUser.id;

    if (!canEditTask && !(isOnlyChecklistUpdate && isAssignee)) {
      alert('Tài khoản của bạn không được cấp quyền chỉnh sửa nhiệm vụ.');
      return;
    }

    const updatedHistory = [...t.history];
    const changes: string[] = [];
    if (updates.title && updates.title !== t.title) changes.push('tiêu đề');
    if (updates.description && updates.description !== t.description) changes.push('mô tả');
    if (updates.deadline && updates.deadline !== t.deadline) changes.push('hạn chót');
    if (updates.assignedId && updates.assignedId !== t.assignedId) {
      changes.push(`người thực hiện (${updates.assignedName})`);
    }

    if (changes.length > 0) {
      updatedHistory.push({
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: `Đã chỉnh sửa ${changes.join(', ')} của công việc`,
        createdAt: getCurrentTimeFormatted()
      });
    } else if (isOnlyChecklistUpdate) {
      const oldChecklist = t.checklist || [];
      const newChecklist = updates.checklist || [];
      if (newChecklist.length > oldChecklist.length) {
        updatedHistory.push({
          id: `h_${Date.now()}`,
          userName: displayCurrentUser.name,
          userTitle: displayCurrentUser.title,
          action: `Đã thêm mục checklist mới`,
          createdAt: getCurrentTimeFormatted()
        });
      } else if (newChecklist.length < oldChecklist.length) {
        updatedHistory.push({
          id: `h_${Date.now()}`,
          userName: displayCurrentUser.name,
          userTitle: displayCurrentUser.title,
          action: `Đã xóa mục checklist`,
          createdAt: getCurrentTimeFormatted()
        });
      } else {
        const changedItem = newChecklist.find((item, idx) => oldChecklist[idx] && item.done !== oldChecklist[idx].done);
        if (changedItem) {
          updatedHistory.push({
            id: `h_${Date.now()}`,
            userName: displayCurrentUser.name,
            userTitle: displayCurrentUser.title,
            action: `Đã đánh dấu ${changedItem.done ? 'hoàn thành' : 'chưa hoàn thành'} mục checklist "${changedItem.text}"`,
            createdAt: getCurrentTimeFormatted()
          });
        }
      }
    }

    const updatedTask = {
      ...t,
      ...updates,
      history: updatedHistory
    };

    try {
      await setDoc(doc(db, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // ADD COMMENT
  const handleAddComment = async (taskId: string, commentContent: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (!hasPermission('addComment', t)) {
      alert('Tài khoản của bạn không được cấp quyền thảo luận góp ý ý kiến.');
      return;
    }

    const newC: Comment = {
      id: `c_${Date.now()}`,
      userName: displayCurrentUser.name,
      userTitle: displayCurrentUser.title,
      content: commentContent,
      createdAt: getCurrentTimeFormatted().split(' ')[1] + ' ' + getCurrentTimeFormatted().split(' ')[0]
    };

    const updatedHistory = [
      ...t.history,
      {
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: `Đã đóng góp thảo luận mới`,
        createdAt: getCurrentTimeFormatted()
      }
    ];

    const updatedTask = {
      ...t,
      comments: [...t.comments, newC],
      history: updatedHistory
    };

    try {
      await setDoc(doc(db, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'CHUA_BAT_DA': return 'Chưa bắt đầu';
      case 'DANG_TIEN_HANH': return 'Đang tiến hành';
      case 'CHO_DUYET': return 'Chờ duyệt';
      case 'HOAN_THANH': return 'Đã hoàn thành';
    }
  };

  // FILTER LOGIC
  // 1. Filter by role access limit
  const getTasksByRoleLimit = () => {
    // If currentUser is Admin (BGH), they see everything
    if (currentUser.role === 'ADMIN') return tasks;
    
    // If manager, they see everything in their own department (workspace)
    if (currentUser.role === 'MANAGER') {
      return tasks.filter(t => t.workspaceId === currentUser.workspaceId || t.assignedId === currentUser.id);
    }

    // If STAFF: They only see tasks assigned directly to them
    return tasks.filter(t => t.assignedId === currentUser.id);
  };

  const roleFilteredTasks = getTasksByRoleLimit().map(t => translateTask(t, lang));

  const visibleWorkspaces = (currentUser?.role === 'STAFF'
    ? workspaces.filter(w => w.id === currentUser.workspaceId)
    : workspaces).map(w => translateWorkspace(w, lang));

  // 2. Filter by currently selected Workspace
  const workspaceFilteredTasks = roleFilteredTasks.filter(t => {
    if (selectedWorkspace === 'ALL') return true;
    
    // If selected department is BGH, also display directives created by Admin/BGH members across all departments
    if (selectedWorkspace === 'BGH') {
      const bghUserNames = MOCK_USERS.filter(u => u.role === 'ADMIN').map(u => u.name);
      return t.workspaceId === 'BGH' || bghUserNames.includes(t.createdBy);
    }
    
    return t.workspaceId === selectedWorkspace;
  });

  // 3. Filter by other dropdown filters (Search, Priority, Status, Tag)
  const finalFilteredTasks = workspaceFilteredTasks.filter(t => {
    // Search
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    // Priority
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    // Status
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    // Tag
    const matchesTag = tagFilter === 'ALL' || t.tag === tagFilter;

    // Deadline 
    const matchesDeadline = (() => {
      if (deadlineFilter === 'ALL') return true;
      if (t.status === 'HOAN_THANH') return true; // Optionally we might exclude completed, but maybe just filter all

      const deadlineDate = new Date(t.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (deadlineFilter === 'TODAY') {
        return diffDays === 0;
      }
      if (deadlineFilter === 'THIS_WEEK') {
        return diffDays >= 0 && diffDays <= 7;
      }
      if (deadlineFilter === 'OVERDUE') {
        return diffDays < 0;
      }
      return true;
    })();

    return matchesSearch && matchesPriority && matchesStatus && matchesTag && matchesDeadline;
  });

  // Collect unique Tags for filter options
  const uniqueTags = Array.from(new Set(tasks.map(t => t.tag)));

  // Shadow state variables for display translation
  const displayAnnouncements = announcements.map(a => translateAnnouncement(a, lang));
  const displayDirectives = directives.map(d => translateDirective(d, lang));
  const displayUsers = users.map(u => translateUser(u, lang));
  const displayCurrentUser = translateUser(currentUser, lang);

  // Current active Workspace metadata
  const activeWorkspaceMeta = visibleWorkspaces.find(w => w.id === selectedWorkspace) || visibleWorkspaces[0];

  const openCommandPalette = (initialQuery = '') => {
    setCommandQuery(initialQuery);
    setIsCommandPaletteOpen(true);
    window.setTimeout(() => commandInputRef.current?.focus(), 0);
  };

  const closeCommandPalette = () => {
    setIsCommandPaletteOpen(false);
  };

  const openOverviewSection = (tab: typeof overviewTab) => {
    setOverviewTab(tab);
    closeCommandPalette();
  };

  const openTaskFromCommand = (task: Task) => {
    setOverviewTab('TASKS');
    setSearchQuery('');
    setSelectedWorkspace(task.workspaceId);
    setSelectedTaskForDetail(task);
    closeCommandPalette();
  };

  const openWorkspaceFromCommand = (workspaceId: string) => {
    setOverviewTab('TASKS');
    setSelectedWorkspace(workspaceId);
    setSearchQuery('');
    closeCommandPalette();
  };

  const openUserFromCommand = (user: UserProfile) => {
    setSelectedStaffProfile(user);
    setProfileActiveTab('INFO');
    closeCommandPalette();
  };

  const commandSearchTerm = commandQuery.trim().toLowerCase();
  const matchesCommandTerm = (...values: Array<string | undefined>) => {
    if (!commandSearchTerm) return true;
    return values.some(value => value?.toLowerCase().includes(commandSearchTerm));
  };

  const commandSectionResults = [
    { id: 'DASHBOARD', label: 'Tong quan dieu hanh', description: 'Dashboard, thong ke, hieu suat', tab: 'DASHBOARD' as const, icon: Layout },
    { id: 'TASKS', label: 'Quan ly cong viec', description: 'Kanban, lich bieu, danh sach viec', tab: 'TASKS' as const, icon: ListTodo },
    { id: 'STRATEGY_OKRS', label: 'OKRs chien luoc', description: 'Muc tieu, KPI, ket qua then chot', tab: 'STRATEGY_OKRS' as const, icon: TrendingUp },
    { id: 'WORKFLOW_APPROVALS', label: 'Phe duyet quy trinh', description: 'Ho so, luong duyet, nhat ky', tab: 'WORKFLOW_APPROVALS' as const, icon: FileCheck },
    { id: 'CRM_ADMISSIONS', label: 'CRM tuyen sinh', description: 'Phu huynh, hoc sinh, cham soc', tab: 'CRM_ADMISSIONS' as const, icon: Users },
    { id: 'TEACHER_HR', label: 'Nhan su giao vien', description: 'Danh ba, KPI, nghi phep', tab: 'TEACHER_HR' as const, icon: UserCheck },
    { id: 'RISK_CENTER', label: 'Quan tri rui ro', description: 'Canh bao, giam sat, xu ly', tab: 'RISK_CENTER' as const, icon: AlertCircle },
    { id: 'ANALYTICS', label: 'Bao cao phan tich', description: 'Bao cao, bieu do, truy van', tab: 'ANALYTICS' as const, icon: FileSpreadsheet }
  ].filter(item => matchesCommandTerm(item.label, item.description)).slice(0, 6);

  const commandTaskResults = roleFilteredTasks
    .filter(task => matchesCommandTerm(task.title, task.description, task.assignedName, task.createdBy, task.tag))
    .slice(0, 6);

  const commandUserResults = displayUsers
    .filter(user => matchesCommandTerm(user.name, user.title, user.roleName))
    .slice(0, 5);

  const commandWorkspaceResults = visibleWorkspaces
    .filter(workspace => matchesCommandTerm(workspace.name, workspace.description))
    .slice(0, 5);

  const totalTasksCount = roleFilteredTasks.length;
  const completedTasksCount = roleFilteredTasks.filter(t => t.status === 'HOAN_THANH').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  if (!isLoggedIn) {
    return (
      <LoginPortal
        initialUser={displayCurrentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          localStorage.setItem('mis_edutask_logged_in', 'true');
          localStorage.setItem('mis_edutask_logged_in_user_id', user.id);
          if (user.role !== 'ADMIN') {
            setSelectedWorkspace(user.workspaceId);
          } else {
            setSelectedWorkspace('ALL');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-all">
      
      {/* Header Navigation with premium glassmorphism */}
      <nav className="h-16 sticky top-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 px-2 sm:px-3 lg:px-4 shrink-0 shadow-xs z-30 transition-all w-full min-w-0">
        <div className="flex items-center gap-2 lg:gap-3 shrink-0 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            id="btn-toggle-mobile-sidebar"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-450 rounded-xl transition-all focus:outline-none md:hidden block cursor-pointer border border-slate-200/70 dark:border-slate-850 shadow-3xs"
            title="Sơ đồ tổ / Phòng ban"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative w-12 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 border border-slate-200 shrink-0 shadow-3xs">
              <img 
                src="https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png" 
                alt="MIS Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'text-indigo-600 font-bold text-sm';
                    fallback.innerText = 'MIS';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <span className="text-sm md:text-base font-display font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight max-w-[150px] md:max-w-[190px] xl:max-w-[260px] truncate">
              MIS SMART PORTAL
            </span>
            <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black hidden sm:flex items-center gap-1.5 leading-none mt-0.5">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Quản Trị Giáo Dục
            </span>
          </div>
        </div>

        {/* Prominent Global Search in Header */}
        <div className="hidden lg:flex items-center flex-1 justify-center max-w-[min(50vw,620px)] mx-2 xl:mx-4 z-40 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => openCommandPalette(searchQuery)}
              onClick={() => openCommandPalette(searchQuery)}
              placeholder="Tìm giáo viên, hồ sơ, công việc..."
              className="w-full pl-9 pr-28 xl:pr-32 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50/80 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="button"
              onClick={() => openCommandPalette(searchQuery)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg border border-indigo-100 bg-indigo-50 px-2 xl:px-2.5 py-1 text-[10px] font-extrabold text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 whitespace-nowrap"
            >
              Tìm kiếm nhanh
            </button>
          </div>

          <div className="hidden">
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="w-[150px] xl:w-[185px] justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-3xs flex items-center gap-2 text-xs font-bold focus:outline-none"
            >
              <span className="truncate">Bộ phận: {activeWorkspaceMeta.name}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showWorkspaceDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 text-xs z-50">
                {visibleWorkspaces.map(w => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWorkspace(w.id);
                      setShowWorkspaceDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 flex items-center justify-between ${
                      selectedWorkspace === w.id ? 'font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-450' : ''
                    }`}
                  >
                    <span>{w.name}</span>
                    {selectedWorkspace === w.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 shrink-0">
          {/* Cloud Sync Status Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10.5px] font-semibold animate-fade-in no-print">
            <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="hidden 2xl:inline">Đã kết nối đám mây</span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 text-[10px] font-extrabold focus:outline-none no-print"
            title={lang === 'vi' ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            type="button"
          >
            <span>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 md:p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-3xs flex items-center justify-center focus:outline-none no-print"
            title={darkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            type="button"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500 animate-pulse" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Custom Browser Notification Toggle */}
          <button
            onClick={requestNotificationPermission}
            id="btn-browser-notifications"
            className={`px-2 xl:px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1 xl:gap-1.5 cursor-pointer shadow-3xs ${
              notificationPermission === 'granted'
                ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/60'
                : notificationPermission === 'denied'
                ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                : 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/50'
            }`}
            title={
              notificationPermission === 'granted'
                ? 'Thông báo trình duyệt đang Hoạt Động'
                : notificationPermission === 'denied'
                ? 'Thông báo trình duyệt đang tắt hoặc bị chặn'
                : 'Bật thông báo trình duyệt'
            }
          >
            <Bell className={`w-3.5 h-3.5 ${
              notificationPermission === 'granted' 
                ? 'text-indigo-600 animate-pulse' 
                : notificationPermission === 'denied' 
                ? 'text-slate-400' 
                : 'text-amber-500 animate-bounce'
            }`} />
            <span className="leading-none hidden 2xl:inline">
              {notificationPermission === 'granted' 
                ? 'Thông báo: Bật' 
                : notificationPermission === 'denied' 
                ? 'Thông báo: Tắt' 
                : 'Bật thông báo'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              notificationPermission === 'granted' 
                ? 'bg-emerald-500' 
                : notificationPermission === 'denied' 
                ? 'bg-slate-300' 
                : 'bg-amber-500 animate-pulse'
            }`}></span>
          </button>

          <div className="hidden 2xl:flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">Học kỳ I - 2026/27</span>
          </div>

          {/* Sandbox Mock SSO Controller - Solution 1 */}
          <div className="relative" id="sandbox-sso-container">
            <button
              onClick={() => setIsSandboxOpen(!isSandboxOpen)}
              className="px-2 xl:px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 hover:border-amber-400 text-amber-800 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none [&>span:nth-of-type(2)]:hidden 2xl:[&>span:nth-of-type(2)]:inline [&>span:nth-of-type(3)]:inline 2xl:[&>span:nth-of-type(3)]:hidden"
              title="Vùng chạy thử nghiệm - Giả lập đăng nhập SSO"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="hidden sm:inline">Giả lập Demo (SSO) 🧪</span>
              <span className="sm:hidden text-[10px]">SSO</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSandboxOpen ? 'rotate-180' : ''} hidden sm:block`} />
            </button>

            {isSandboxOpen && (
              <div className="absolute right-0 mt-2.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 text-left font-sans">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 font-mono">Bảng điều khiển Giả lập SSO</span>
                  <button 
                    onClick={() => setIsSandboxOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-normal mb-3 font-normal">
                  Chọn một nhân sự dưới đây để chuyển đổi vai nhanh (Mock SSO) phục vụ thẩm định thử nghiệm tính năng liên kết quyền hạn.
                </p>

                <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-1">
                  {workspaces.filter(w => w.id !== 'ALL').map((w) => {
                    const branchUsers = users.filter(u => u.workspaceId === w.id);
                    if (branchUsers.length === 0) return null;

                    return (
                      <div key={w.id} className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest px-1">
                          🏢 {w.name}
                        </span>
                        <div className="flex flex-col gap-1">
                          {branchUsers.map((u) => {
                            const isSelectedMe = currentUser.id === u.id;
                            return (
                              <button
                                key={u.id}
                                onClick={() => {
                                  handleUserSwitch(u);
                                  setIsSandboxOpen(false);
                                }}
                                type="button"
                                className={`w-full px-2 py-1.5 rounded-lg flex items-center gap-2 text-left transition-all cursor-pointer ${
                                  isSelectedMe 
                                    ? 'bg-amber-50/50 border border-amber-300 text-amber-900 font-bold shadow-3xs' 
                                    : 'hover:bg-slate-50 border border-transparent text-slate-700'
                                }`}
                              >
                                <img 
                                  src={getSafeAvatar(u.avatar, u.name)} 
                                  alt={u.name} 
                                  className="w-5.5 h-5.5 rounded-full object-cover shrink-0 border border-slate-250"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-semibold truncate leading-none">{u.name}</span>
                                    {isSelectedMe && <span className="text-[8px] px-1 bg-amber-500 text-white rounded font-mono font-bold leading-none">BẠN</span>}
                                  </div>
                                  <span className="text-[9px] text-slate-450 block truncate leading-none mt-0.5">{u.title}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3 border-l pl-2 md:pl-6 border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{displayCurrentUser.name}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-500 font-medium leading-none">{displayCurrentUser.title}</span>
                <span className="text-slate-300 select-none text-[10px]">•</span>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    localStorage.removeItem('mis_edutask_logged_in');
                    localStorage.removeItem('mis_edutask_logged_in_user_id');
                  }}
                  id="btn-header-logout"
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer focus:outline-none transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
            
            {/* Mobile logout option helper */}
            <div className="flex flex-col items-center gap-1 sm:hidden">
              <img
                src={getSafeAvatar(currentUser.avatar, displayCurrentUser.name)}
                alt={displayCurrentUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl bg-slate-200 border-2 border-slate-200 shadow-sm object-cover"
              />
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  localStorage.removeItem('mis_edutask_logged_in');
                  localStorage.removeItem('mis_edutask_logged_in_user_id');
                }}
                className="text-[9px] font-extrabold text-rose-600 active:underline leading-none"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-39 md:hidden transition-all animate-fade-in"
          id="sidebar-backdrop-mobile"
        />
      )}

      {/* Flex Layout Container with Sidebar + Main Workspace */}
      <div className="flex flex-1 min-h-0 relative">
        
        {/* Sidebar Navigation matching the design HTML */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 flex flex-col shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 min-h-full transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}>
          {/* Mobile close button inside sidebar */}
          <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-850 bg-slate-50 dark:bg-slate-900">
            <span className="font-display font-black text-xs text-indigo-950 dark:text-indigo-400 uppercase tracking-widest">Danh mục chỉ đạo</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
              title="Đóng sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-3.5 flex-1 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-0.5 px-3 font-mono">School OS 2.0</p>

            {/* GROUP 1: FOUNDATION */}
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <button 
                onClick={() => toggleGroup('foundation')}
                className="w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span className={expandedGroups.foundation ? 'text-indigo-650 font-extrabold' : ''}>1. Foundation</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGroups.foundation ? 'text-indigo-650' : '-rotate-90'}`} />
              </button>
              
              {expandedGroups.foundation && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-indigo-100 dark:border-indigo-900 transition-all duration-300">
                  {/* Định hướng & OKRs */}
                  <button 
                    onClick={() => { setOverviewTab('STRATEGY_OKRS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'STRATEGY_OKRS' 
                        ? 'bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-300 font-extrabold border-l-4 border-indigo-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-indigo-50/35 hover:text-indigo-700 dark:hover:bg-slate-800 dark:hover:text-indigo-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className={`w-4 h-4 transition-colors ${overviewTab === 'STRATEGY_OKRS' ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-400 dark:text-indigo-550'}`} />
                      <span>Định hướng &amp; OKRs</span>
                    </div>
                  </button>

                  {/* Văn bản */}
                  <button 
                    onClick={() => { setOverviewTab('DOCUMENT'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'DOCUMENT' 
                        ? 'bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-300 font-extrabold border-l-4 border-indigo-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-indigo-50/35 hover:text-indigo-700 dark:hover:bg-slate-800 dark:hover:text-indigo-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 transition-colors ${overviewTab === 'DOCUMENT' ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-400 dark:text-indigo-550'}`} />
                      <span>Quản lý Văn bản</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'DOCUMENT' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>NEW</span>
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 2: OPERATION */}
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <button 
                onClick={() => toggleGroup('operation')}
                className="w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  <span className={expandedGroups.operation ? 'text-violet-650 font-extrabold' : ''}>2. Operation</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGroups.operation ? 'text-violet-655' : '-rotate-90'}`} />
              </button>
              
              {expandedGroups.operation && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-violet-100 dark:border-violet-900 transition-all duration-300">
                  {/* Nhiệm vụ & Dự án */}
                  <button 
                    onClick={() => { setOverviewTab('TASKS'); handleSelectViewOnMobile('KANBAN'); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'TASKS' 
                        ? 'bg-violet-50 dark:bg-violet-950/45 text-violet-700 dark:text-violet-300 font-extrabold border-l-4 border-violet-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-violet-50/35 hover:text-violet-750 dark:hover:bg-slate-800 dark:hover:text-violet-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ListTodo className={`w-4 h-4 transition-colors ${overviewTab === 'TASKS' ? 'text-violet-600 dark:text-violet-400' : 'text-violet-400 dark:text-violet-550'}`} />
                      <span>Nhiệm vụ &amp; Dự án</span>
                    </div>
                  </button>

                  {/* Quy trình & Phê duyệt */}
                  <button 
                    onClick={() => { setOverviewTab('WORKFLOW_APPROVALS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'WORKFLOW_APPROVALS' 
                        ? 'bg-violet-50 dark:bg-violet-950/45 text-violet-700 dark:text-violet-300 font-extrabold border-l-4 border-violet-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-violet-50/35 hover:text-violet-750 dark:hover:bg-slate-800 dark:hover:text-violet-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className={`w-4 h-4 transition-colors ${overviewTab === 'WORKFLOW_APPROVALS' ? 'text-violet-600 dark:text-violet-400' : 'text-violet-400 dark:text-violet-550'}`} />
                      <span>Quy trình &amp; Phê duyệt</span>
                    </div>
                  </button>

                  {/* Cuộc họp */}
                  <button 
                    onClick={() => { setOverviewTab('MEETING'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'MEETING' 
                        ? 'bg-violet-50 dark:bg-violet-950/45 text-violet-700 dark:text-violet-300 font-extrabold border-l-4 border-violet-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-violet-50/35 hover:text-violet-750 dark:hover:bg-slate-800 dark:hover:text-violet-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className={`w-4 h-4 transition-colors ${overviewTab === 'MEETING' ? 'text-violet-600 dark:text-violet-400' : 'text-violet-400 dark:text-violet-550'}`} />
                      <span>Quản lý Cuộc họp</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'MEETING' ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-750 dark:bg-violet-950 dark:text-violet-300'
                    }`}>NEW</span>
                  </button>

                  {/* Kho tri thức */}
                  <button 
                    onClick={() => { setOverviewTab('KNOWLEDGE'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'KNOWLEDGE' 
                        ? 'bg-violet-50 dark:bg-violet-950/45 text-violet-700 dark:text-violet-300 font-extrabold border-l-4 border-violet-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-violet-50/35 hover:text-violet-750 dark:hover:bg-slate-800 dark:hover:text-violet-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className={`w-4 h-4 transition-colors ${overviewTab === 'KNOWLEDGE' ? 'text-violet-600 dark:text-violet-400' : 'text-violet-400 dark:text-violet-550'}`} />
                      <span>Kho Tri Th�                  {/* Dashboard */}
                  <button 
                    onClick={() => { setOverviewTab('DASHBOARD'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'DASHBOARD' 
                        ? 'bg-rose-50 dark:bg-rose-950/45 text-rose-700 dark:text-rose-300 font-extrabold border-l-4 border-rose-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-rose-50/35 hover:text-rose-700 dark:hover:bg-slate-800 dark:hover:text-rose-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layout className={`w-4 h-4 transition-colors ${overviewTab === 'DASHBOARD' ? 'text-rose-600 dark:text-rose-400' : 'text-rose-400 dark:text-rose-550'}`} />
                      <span>Executive Dashboard</span>
                    </div>
                  </button>

                  {/* Chỉ đạo BGH */}
                  <button 
                    onClick={() => { setOverviewTab('BOARD_DIRECTIVES'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'BOARD_DIRECTIVES' 
                        ? 'bg-rose-50 dark:bg-rose-950/45 text-rose-700 dark:text-rose-300 font-extrabold border-l-4 border-rose-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-rose-50/35 hover:text-rose-700 dark:hover:bg-slate-800 dark:hover:text-rose-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Megaphone className={`w-4 h-4 transition-colors ${overviewTab === 'BOARD_DIRECTIVES' ? 'text-rose-600 dark:text-rose-400' : 'text-rose-400 dark:text-rose-550'}`} />
                      <span>Chỉ đạo BGH</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'BOARD_DIRECTIVES' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>NEW</span>
                  </button>

                  {/* Báo cáo */}
                  <button 
                    onClick={() => { setOverviewTab('ANALYTICS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'ANALYTICS' 
                        ? 'bg-rose-50 dark:bg-rose-950/45 text-rose-700 dark:text-rose-300 font-extrabold border-l-4 border-rose-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-rose-50/35 hover:text-rose-700 dark:hover:bg-slate-800 dark:hover:text-rose-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className={`w-4 h-4 transition-colors ${overviewTab === 'ANALYTICS' ? 'text-rose-600 dark:text-rose-400' : 'text-rose-400 dark:text-rose-550'}`} />
                      <span>Báo cáo &amp; Phân tích</span>
                    </div>
                  </button>

                  {/* Rủi ro */}
                  <button 
                    onClick={() => { setOverviewTab('RISK_CENTER'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'RISK_CENTER' 
                        ? 'bg-rose-50 dark:bg-rose-950/45 text-rose-700 dark:text-rose-300 font-extrabold border-l-4 border-rose-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-rose-50/35 hover:text-rose-700 dark:hover:bg-slate-800 dark:hover:text-rose-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className={`w-4 h-4 transition-colors ${overviewTab === 'RISK_CENTER' ? 'text-rose-600 dark:text-rose-400' : 'text-rose-400 dark:text-rose-550'}`} />
                      <span>Quản trị Rủi ro</span>
                    </div>
                  </button>ate-350 hover:bg-rose-50/35 hover:text-rose-750 dark:hover:bg-slate-800 dark:hover:text-rose-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className={`w-4 h-4 transition-colors ${overviewTab === 'ANALYTICS' ? 'text-rose-500' : 'text-rose-400 dark:text-rose-550'}`} />
                      <span>Báo cáo &amp; Phân tích</span>
                    </div>
                  </button>

                  {/* Rủi ro */}
                  <button 
                    onClick={() => { setOverviewTab('RISK_CENTER'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'RISK_CENTER' 
                        ? 'bg-rose-50 dark:bg-rose-950/45 text-rose-700 dark:text-rose-300 font-extrabold border-l-4 border-rose-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-rose-50/35 hover:text-rose-750 dark:hover:bg-slate-800 dark:hover:text-rose-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className={`w-4 h-4 transition-colors ${overviewTab === 'RISK_CENTER' ? 'text-rose-500' : 'text-rose-400 dark:text-rose-550'}`} />
                      <span>Quản trị Rủi ro</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 4: BUSINESS */}
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <button 
                onClick={() => toggleGroup('business')}
                className="w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className={expandedGroups.business ? 'text-emerald-600 font-extrabold' : ''}>4. School Business</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGroups.business ? 'text-emerald-600' : '-rotate-90'}`} />
              </button>
              
              {expandedGroups.business && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-emerald-100 dark:border-emerald-900 transition-all duration-300">
                  {/* Tuyển sinh & CRM */}
                  <button 
                    onClick={() => { setOverviewTab('CRM_ADMISSIONS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'CRM_ADMISSIONS' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-4 border-emerald-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-emerald-50/35 hover:text-emerald-750 dark:hover:bg-slate-800 dark:hover:text-emerald-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal className={`w-4 h-4 transition-colors ${overviewTab === 'CRM_ADMISSIONS' ? 'text-emerald-600' : 'text-emerald-400 dark:text-emerald-550'}`} />
                      <span>Tuyển sinh &amp; CRM</span>
                    </div>
                  </button>

                  {/* Học sinh 360 */}
                  <button 
                    onClick={() => { setOverviewTab('STUDENT_SUCCESS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'STUDENT_SUCCESS' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-4 border-emerald-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-emerald-50/35 hover:text-emerald-755 dark:hover:bg-slate-800 dark:hover:text-emerald-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className={`w-4 h-4 transition-colors ${overviewTab === 'STUDENT_SUCCESS' ? 'text-emerald-600' : 'text-emerald-400 dark:text-emerald-550'}`} />
                      <span>Hồ sơ Học sinh 360°</span>
                    </div>
                  </button>

                  {/* Nhân sự & Giáo viên */}
                  <button 
                    onClick={() => { setOverviewTab('TEACHER_HR'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'TEACHER_HR' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-4 border-emerald-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-emerald-50/35 hover:text-emerald-750 dark:hover:bg-slate-800 dark:hover:text-emerald-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className={`w-4 h-4 transition-colors ${overviewTab === 'TEACHER_HR' ? 'text-emerald-600' : 'text-emerald-400 dark:text-emerald-550'}`} />
                      <span>Nhân sự &amp; Giáo viên</span>
                    </div>
                  </button>

                  {/* HRM */}
                  <button 
                    onClick={() => { setOverviewTab('HRM'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'HRM' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-4 border-emerald-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-emerald-50/35 hover:text-emerald-755 dark:hover:bg-slate-800 dark:hover:text-emerald-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className={`w-4 h-4 transition-colors ${overviewTab === 'HRM' ? 'text-emerald-600' : 'text-emerald-400 dark:text-emerald-550'}`} />
                      <span>Quản trị HRM</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'HRM' ? 'bg-emerald-650 text-white' : 'bg-emerald-100 text-emerald-755 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>NEW</span>
                  </button>

                  {/* LMS */}
                  <button 
                    onClick={() => { setOverviewTab('LMS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'LMS' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-4 border-emerald-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-emerald-50/35 hover:text-emerald-750 dark:hover:bg-slate-800 dark:hover:text-emerald-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Laptop className={`w-4 h-4 transition-colors ${overviewTab === 'LMS' ? 'text-emerald-600' : 'text-emerald-400 dark:text-emerald-550'}`} />
                      <span>Hệ thống LMS</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'LMS' ? 'bg-emerald-650 text-white' : 'bg-emerald-100 text-emerald-755 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>NEW</span>
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 5: CAMPUS */}
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <button 
                onClick={() => toggleGroup('campus')}
                className="w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span className={expandedGroups.campus ? 'text-sky-600 font-extrabold' : ''}>5. Campus Operations</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGroups.campus ? 'text-sky-600' : '-rotate-90'}`} />
              </button>
              
              {expandedGroups.campus && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-sky-100 dark:border-sky-900 transition-all duration-300">
                  {/* Sự kiện */}
                  <button 
                    onClick={() => { setOverviewTab('EVENTS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'EVENTS' 
                        ? 'bg-sky-50 dark:bg-sky-950/45 text-sky-700 dark:text-sky-300 font-extrabold border-l-4 border-sky-600 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-sky-50/35 hover:text-sky-750 dark:hover:bg-slate-800 dark:hover:text-sky-400 font-semibold border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className={`w-4 h-4 transition-colors ${overviewTab === 'EVENTS' ? 'text-sky-600' : 'text-sky-500/80'}`} />
                      <span>Quản lý Sự kiện</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'EVENTS' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-755 dark:bg-sky-950 dark:text-sky-300'
                    }`}>NEW</span>
                  </button>

                  {/* Vận hành Học thuật */}
                  <button 
                    onClick={() => { setOverviewTab('ACADEMIC_OPS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'ACADEMIC_OPS' 
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 font-semibold border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className={`w-4 h-4 transition-colors ${overviewTab === 'ACADEMIC_OPS' ? 'text-sky-500' : 'text-slate-400'}`} />
                      <span>Vận hành Học thuật</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'ACADEMIC_OPS' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
                    }`}>NEW</span>
                  </button>

                  {/* Logistics */}
                  <button 
                    onClick={() => { setOverviewTab('LOGISTICS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'LOGISTICS' 
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 font-semibold border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <School className={`w-4 h-4 transition-colors ${overviewTab === 'LOGISTICS' ? 'text-sky-500' : 'text-slate-400'}`} />
                      <span>Logistics &amp; CSVC</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'LOGISTICS' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
                    }`}>NEW</span>
                  </button>

                  {/* Yêu cầu */}
                  <button 
                    onClick={() => { setOverviewTab('REQUESTS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'REQUESTS' 
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 font-semibold border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className={`w-4 h-4 transition-colors ${overviewTab === 'REQUESTS' ? 'text-sky-500' : 'text-slate-400'}`} />
                      <span>Yêu cầu &amp; Dịch vụ</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'REQUESTS' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
                    }`}>NEW</span>
                  </button>

                  {/* Sheets Sync */}
                  <button 
                    onClick={() => { setOverviewTab('GOOGLE_SHEETS'); setIsSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-[12px] cursor-pointer transition-all text-left ${
                      overviewTab === 'GOOGLE_SHEETS' 
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500 shadow-3xs scale-[1.01]' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 font-semibold border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className={`w-4 h-4 transition-colors ${overviewTab === 'GOOGLE_SHEETS' ? 'text-sky-500' : 'text-slate-400'}`} />
                      <span>Đồng bộ Sheets</span>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${
                      overviewTab === 'GOOGLE_SHEETS' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
                    }`}>NEW</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Goal Completion Meter bottom segment matching the design HTML */}
          <div className="mt-auto p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono">
              <span className="font-semibold text-slate-600">Đạt tiến độ mục tiêu</span>
              <span className="font-bold text-indigo-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 border border-slate-200/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-tight mt-2 font-sans">
              Hoàn thành các mục tiêu tháng 10
            </p>
          </div>
        </aside>

        {/* Main Content Area on the Right */}
        <main className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto bg-slate-50 min-h-0">
          
          {/* Current Switched User Notification Banner - modern premium design */}
          <div className="bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/20 border border-indigo-100/80 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 shadow-sm transform transition-all hover:scale-[1.005] duration-300">
            <div className="flex items-start gap-4 flex-1">
              <div className="relative">
                <img 
                  src={getSafeAvatar(currentUser.avatar, displayCurrentUser.name)} 
                  alt={displayCurrentUser.name} 
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm mt-0.5 shrink-0"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white bg-emerald-500"></span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-display font-black text-slate-900">
                    Chào mừng, {displayCurrentUser.name}
                  </h2>
                  <span className="text-[9.5px] font-black px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-lg uppercase font-mono tracking-wider">
                    {displayCurrentUser.roleName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-lg">• Workspace: <span className="text-indigo-600 font-extrabold">{currentUser.workspaceId}</span></span>
                </div>
                
                 {/* Phân quyền cán bộ (RBAC) button - placed under name/role for ADMIN and styled smaller */}
                {currentUser.role === 'ADMIN' && (
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <button
                      id="btn-nav-rbac-settings"
                      onClick={() => setIsRbacModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 rounded-lg shadow-3xs transition-all cursor-pointer"
                      title="Thiết lập phân quyền thành viên"
                    >
                      <Shield className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                      <span>Phân quyền cán bộ (RBAC)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats on banner */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 border border-indigo-100 bg-white rounded-xl p-2 px-4 shadow-3xs text-xs font-semibold">
                <div className="text-center pr-3 border-r border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block font-mono">Chỉ đạo liên quan</span>
                  <span className="text-base font-black text-indigo-600 mt-0.5 block">{roleFilteredTasks.length}</span>
                </div>
                <div className="text-center pl-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block font-mono">Chờ phê duyệt</span>
                  <span className="text-base font-black text-amber-500 mt-0.5 block">
                    {roleFilteredTasks.filter(t => t.status === 'CHO_DUYET').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Redesigned Executive Dashboard View */}
          {overviewTab === 'DASHBOARD' && (
            <ExecutiveDashboard
              tasks={roleFilteredTasks}
              workspaces={workspaces}
              users={users}
              directives={directives}
              currentUser={currentUser}
              onViewDetails={setSelectedTaskForDetail}
              onUpdateStatus={handleUpdateStatus}
              onSelectWorkspace={(wId) => {
                setSelectedWorkspace(wId);
                setOverviewTab('TASKS');
              }}
            />
          )}

          {overviewTab === 'STRATEGY_OKRS' && (
            <StrategyOkrHub />
          )}

          {overviewTab === 'WORKFLOW_APPROVALS' && (
            <WorkflowBuilder />
          )}

          {overviewTab === 'CRM_ADMISSIONS' && (
            <SchoolCrmHub />
          )}

          {overviewTab === 'STUDENT_SUCCESS' && (
            <StudentSuccessHub />
          )}

          {overviewTab === 'TEACHER_HR' && (
            <TeacherHrHub 
              currentUser={currentUser}
              users={users}
              onUpdateUsers={saveUsers}
            />
          )}

          {overviewTab === 'RISK_CENTER' && (
            <RiskManagementCenter />
          )}

          {overviewTab === 'ANALYTICS' && (
            <ReportingAnalyticsBuilder />
          )}

          {overviewTab === 'ACADEMIC_OPS' && (
            <AcademicOperations 
              currentUser={currentUser} 
              users={users} 
            />
          )}

          {overviewTab === 'LOGISTICS' && (
            <SchoolLogistics 
              currentUser={currentUser} 
            />
          )}

          {overviewTab === 'REQUESTS' && (
            <SchoolRequests 
              currentUser={currentUser} 
            />
          )}

          {overviewTab === 'HRM' && (
            <HrmCenter 
              currentUser={currentUser} 
              users={users} 
              onUpdateUsers={saveUsers} 
            />
          )}

          {overviewTab === 'BOARD_DIRECTIVES' && (
            <BoardDirectivePanel 
              directives={directives} 
              currentUser={currentUser} 
              onPublish={handlePublishDirective} 
              onUpdateStatus={handleUpdateDirectiveStatus} 
              onDelete={handleDeleteDirective} 
            />
          )}

          {overviewTab === 'LMS' && (
            <MisLmsCenter 
              currentUser={currentUser} 
              tasks={tasks} 
              onAddTask={handleCreateTask} 
            />
          )}

          {overviewTab === 'GOOGLE_SHEETS' && (
            <GoogleSheetsCenter 
              tasks={tasks} 
              onSyncComplete={handleSyncComplete} 
            />
          )}

          {overviewTab === 'DOCUMENT' && (
            <DocumentCenter />
          )}

          {overviewTab === 'MEETING' && (
            <MeetingCenter />
          )}

          {overviewTab === 'KNOWLEDGE' && (
            <KnowledgeBase />
          )}

          {overviewTab === 'EVENTS' && (
            <EventManagement />
          )}

            {overviewTab === 'TASKS' && (
              <>
                {/* Dynamic Stats & Charts shown only on Tasks view */}
                {isStatsCollapsed ? (
                  <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-150/65 rounded-2xl p-4 flex items-center justify-between shadow-3xs animate-fade-in mb-6">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                        <Layers className="w-5 h-5 text-indigo-600 animate-pulse" />
                      </span>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs">Bảng thống kê phân tích số liệu học thuật đã thu gọn</h4>
                        <p className="text-[10.5px] text-slate-500">Ẩn bớt để tối ưu hóa không gian hiển thị danh sách nhiệm vụ và văn bản ban bộ.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsStatsCollapsed(false)}
                      className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-slate-50 border border-indigo-200 rounded-xl shadow-3xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span>Hiện lại chỉ số tổng quan</span>
                    </button>
                  </div>
                ) : (
                  <WorkspaceStats 
                    tasks={workspaceFilteredTasks} 
                    activeWorkspace={activeWorkspaceMeta} 
                    onMinimize={() => setIsStatsCollapsed(true)}
                  />
                )}

                {isChartCollapsed ? (
                  <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-150/65 rounded-2xl p-4 flex items-center justify-between shadow-3xs animate-fade-in mb-6">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                        <TrendingUp className="w-5 h-5 text-indigo-600 animate-pulse" />
                      </span>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs">Biểu đồ tải lượng giáo dục & xu hướng hoàn thành đã thu gọn</h4>
                        <p className="text-[10.5px] text-slate-500">Ẩn bớt biểu đồ phân tích để tăng tốc cuộn lướt và xử lý công vụ.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsChartCollapsed(false)}
                      className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-slate-50 border border-indigo-200 rounded-xl shadow-3xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span>Hiện lại biểu đồ hiệu suất</span>
                    </button>
                  </div>
                ) : (
                  <ProductivityTrendChart 
                    tasks={workspaceFilteredTasks} 
                    workspaceName={activeWorkspaceMeta.name} 
                    onMinimize={() => setIsChartCollapsed(true)}
                  />
                )}
            {/* Quick Workspace Selection Carousel on Mobile */}
            <div className="md:hidden flex flex-col gap-2 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-3.5 mb-2.5 shrink-0 animate-fade-in" id="mobile-workspaces-carousel-container">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Không gian phòng ban / tổ chuyên môn:
              </span>
              <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-thin scrollbar-indigo" id="mobile-workspaces-list-slider">
                {visibleWorkspaces.map((w) => {
                  const isSelected = selectedWorkspace === w.id;
                  const count = roleFilteredTasks.filter(t => w.id === 'ALL' || t.workspaceId === w.id).length;
                  
                  let dotColor = 'bg-blue-500';
                  if (w.id === 'ALL') dotColor = 'bg-indigo-400';
                  else if (w.id === 'BGH') dotColor = 'bg-amber-500';
                  else if (w.color) {
                    const match = w.color.match(/from-([a-z]+-\d+)/);
                    if (match) {
                      dotColor = `bg-${match[1]}`;
                    } else {
                      dotColor = 'bg-indigo-500';
                    }
                  }

                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWorkspace(w.id)}
                      className={`px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 shadow-3xs'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span>{w.name}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-indigo-900 text-white font-extrabold' : 'bg-slate-100 text-slate-500 font-medium'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Command Directive Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-800">
                  {activeWorkspaceMeta.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-slate-200 text-slate-600 font-bold font-mono rounded">
                  {workspaceFilteredTasks.length} chỉ đạo
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                   onClick={handleSummarizeDailyTasks}
                   className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                   <Sparkles className="w-3.5 h-3.5" />
                   <span className="hidden sm:inline">Trợ lý AI Cuối ngày</span>
                   <span className="sm:hidden">AI</span>
                </button>

                {/* Create Directive Trigger - dynamic access check */}
                {hasPermission('createTask') && (
                  <button
                    id="btn-assign-new-directive"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition-all hover:translate-y-[-1px] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Giao việc</span>
                  </button>
                )}
              </div>
            </div>

          {/* FILTER CONTROLS GRID */}
          <div id="filter-controls-grid" className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-sm">
            
            {/* Search text */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-fulltext-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tiêu đề, người giao (VD: PGS.TS), người nhận, nội dung..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Quick Filters Group */}
            <div className="md:col-span-8 flex flex-wrap items-center gap-3 md:justify-end">
              
              <>
                {/* Priority Select */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Ưu tiên:</span>
                    <select
                      id="select-priority-filter"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      <option value="ALL">Tất cả</option>
                      <option value="CAO">⚠️ Cao</option>
                      <option value="TRUNG_BINH">⏰ Trung bình</option>
                      <option value="THAP">☕ Thấp</option>
                    </select>
                  </div>

                  {/* Status Select */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Trạng thái:</span>
                    <select
                      id="select-status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      <option value="ALL">Tất cả</option>
                      <option value="CHUA_BAT_DA">Chưa bắt đầu</option>
                      <option value="DANG_TIEN_HANH">Đang tiến hành</option>
                      <option value="CHO_DUYET">Chờ phê duyệt</option>
                      <option value="HOAN_THANH">Đã hoàn thành</option>
                    </select>
                  </div>

                  {/* Tag filter selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Thẻ:</span>
                    <select
                      id="select-tag-filter"
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      <option value="ALL">Tất cả</option>
                      {uniqueTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </>

              {/* View Switcher button list */}
              <div className="border-l border-slate-200 pl-3 flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-0.5">
                <button
                  id="btn-switch-kanban"
                  onClick={() => setActiveView('KANBAN')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeView === 'KANBAN' 
                      ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>

                <button
                  id="btn-switch-calendar"
                  onClick={() => setActiveView('CALENDAR')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeView === 'CALENDAR' 
                      ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Lịch biểu</span>
                </button>

                <button
                  id="btn-switch-list"
                  onClick={() => setActiveView('LIST')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeView === 'LIST' 
                      ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Dạng bảng</span>
                </button>
              </div>

              {/* Grouping Toggle for department breakdown */}
              {(activeView === 'KANBAN' || activeView === 'LIST') && (
                <div className="flex items-center gap-2">
                  {activeView === 'KANBAN' && (
                    <button
                      onClick={() => setIsCompactView(prev => !prev)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                        isCompactView 
                          ? 'bg-blue-600 border-blue-700 text-white' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                      title={isCompactView ? "Chế độ bình thường" : "Chế độ gọn nhẹ"}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Gọn nhẹ {isCompactView ? 'bật' : 'tắt'}</span>
                    </button>
                  )}
                  <button
                    id="btn-toggle-groupby"
                    onClick={() => setGroupByDepartment(prev => !prev)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                      groupByDepartment 
                        ? 'bg-indigo-600 border-indigo-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    title="Giao diện gom nhóm chi tiết theo từng ban tổ chuyên môn"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gom nhóm tổ {groupByDepartment ? 'bật' : 'tắt'}</span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* PRIMARY ACTION ABILITY VIEW CONTAINER */}
          <div id="central-view-workspace">
          {activeView === 'KANBAN' && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-1 shrink-0">Hạn chót:</span>
              <button 
                onClick={() => setDeadlineFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border cursor-pointer ${deadlineFilter === 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-3xs font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setDeadlineFilter('TODAY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border cursor-pointer ${deadlineFilter === 'TODAY' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-3xs font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Hôm nay
              </button>
              <button 
                onClick={() => setDeadlineFilter('THIS_WEEK')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border cursor-pointer ${deadlineFilter === 'THIS_WEEK' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-3xs font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Tuần này
              </button>
              <button 
                onClick={() => setDeadlineFilter('OVERDUE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border cursor-pointer ${deadlineFilter === 'OVERDUE' ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-3xs font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}`}
              >
                Quá hạn
              </button>
            </div>
          )}

          {finalFilteredTasks.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl py-12 px-6 text-center shadow-sm">
              <h4 className="text-slate-800 font-display font-semibold text-sm">Không tìm thấy công việc nào phù hợp</h4>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                Hãy đổi bộ lọc, xóa bớt truy vấn tìm kiếm hoặc giao thêm một chỉ đạo mới cho tổ.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('ALL');
                  setStatusFilter('ALL');
                  setTagFilter('ALL');
                  setDeadlineFilter('ALL');
                }}
                className="mt-4 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all"
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          )}

          {finalFilteredTasks.length > 0 && activeView === 'KANBAN' && (
            <div className="flex flex-col">
              {/* On Mobile: Responsive Column Tabs for Kanban */}
              {!groupByDepartment && (
                /* Classic status select tabs on mobile */
                <div className="md:hidden flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 mb-4 overflow-x-auto scrollbar-none" id="mobile-kanban-column-tabs">
                  {(['CHUA_BAT_DA', 'DANG_TIEN_HANH', 'CHO_DUYET', 'HOAN_THANH'] as TaskStatus[]).map((status) => {
                    const count = finalFilteredTasks.filter(t => t.status === status).length;
                    const isActive = mobileActiveColumn === status;
                    
                    let activeStyle = '';
                    if (status === 'CHUA_BAT_DA') activeStyle = 'bg-white text-slate-700 font-bold shadow-3xs ring-1 ring-slate-200';
                    else if (status === 'DANG_TIEN_HANH') activeStyle = 'bg-white text-sky-700 font-bold shadow-3xs ring-1 ring-sky-100';
                    else if (status === 'CHO_DUYET') activeStyle = 'bg-white text-amber-705 font-bold shadow-3xs ring-1 ring-amber-100 animate-pulse';
                    else if (status === 'HOAN_THANH') activeStyle = 'bg-white text-emerald-705 font-bold shadow-3xs ring-1 ring-emerald-100';

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setMobileActiveColumn(status)}
                        className={`flex-1 text-center py-2 text-[11px] rounded-lg transition-all cursor-pointer ${
                          isActive ? activeStyle : 'text-slate-500 hover:text-slate-800 font-semibold'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="truncate max-w-[55px] sm:max-w-none">{getStatusLabel(status)}</span>
                          <span className="text-[10px] font-mono leading-none mt-0.5 opacity-80 font-bold">({count})</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {groupByDepartment ? (
                /* Grouped Accordions by Workspace */
                <div id="view-kanban-board-grouped" className="flex flex-col gap-3">
                  {visibleWorkspaces.filter(w => w.id !== 'ALL' && finalFilteredTasks.some(t => t.workspaceId === w.id)).map((w, idx, filteredArr) => {
                    const wsTasks = finalFilteredTasks.filter(t => t.workspaceId === w.id);
                    const defaultActive = mobileActiveWorkspace || filteredArr[0]?.id;
                    const isActive = defaultActive === w.id;
                    
                    let dotColor = 'bg-indigo-500';
                    if (w.id === 'BGH') dotColor = 'bg-amber-500';
                    else if (w.color) {
                      const match = w.color.match(/from-([a-z]+-\d+)/);
                      if (match) dotColor = `bg-${match[1]}`;
                    }

                    return (
                      <div key={w.id} className="bg-slate-50 border border-slate-200/60 rounded-xl shadow-3xs overflow-hidden transition-all duration-300">
                        {/* Accordion Header */}
                        <button 
                          onClick={() => setMobileActiveWorkspace(isActive ? '' : w.id)}
                          className={`w-full flex items-center justify-between p-4 transition-colors ${isActive ? 'bg-white' : 'hover:bg-slate-100/50'}`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                            <span className="text-sm font-black uppercase tracking-wider text-slate-800 font-display truncate">
                              {w.name}
                            </span>
                            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-mono font-bold shrink-0">
                              {wsTasks.length} CÔNG VIỆC
                            </span>
                          </div>
                          
                          {/* Chevron Icon */}
                          <div className={`p-1 rounded-full transition-transform duration-300 ease-in-out ${isActive ? 'rotate-180 bg-slate-100' : 'rotate-0 bg-transparent'}`}>
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        
                        {/* Accordion Content */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isActive ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="p-4 pt-1 bg-slate-100/30 border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {wsTasks.map(t => (
                                <TaskCard 
                                  isCompact={isCompactView}
                                  key={t.id} 
                                  task={t} 
                                  currentUser={displayCurrentUser}
                                  rbacConfig={rbacConfig}
                                  onViewDetails={setSelectedTaskForDetail}
                                  onUpdateStatus={handleUpdateStatus}
                                  onRejectTask={handleRejectTask}
                                  onDeleteTask={handleDeleteTask}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Classic Kanban status-based board columns */
                <div id="view-kanban-board" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                  
                  {/* Column 1: CHUA_BAT_DA */}
                  <div className={`bg-slate-100/60 rounded-2xl p-3 border border-slate-200/60 ${mobileActiveColumn === 'CHUA_BAT_DA' ? 'block' : 'hidden md:block'}`}>
                    <div className="flex items-center justify-between px-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Chưa bắt đầu</span>
                      <span className="text-xs bg-slate-300/80 text-slate-700 px-2 py-0.2 rounded-full font-bold">
                        {finalFilteredTasks.filter(t => t.status === 'CHUA_BAT_DA').length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {finalFilteredTasks.filter(t => t.status === 'CHUA_BAT_DA').map(t => (
                        <TaskCard 
                          isCompact={isCompactView}
                          key={t.id} 
                          task={t} 
                          currentUser={displayCurrentUser}
                          rbacConfig={rbacConfig}
                          onViewDetails={setSelectedTaskForDetail}
                          onUpdateStatus={handleUpdateStatus}
                          onRejectTask={handleRejectTask}
                          onDeleteTask={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Column 2: DANG_TIEN_HANH */}
                  <div className={`bg-sky-50/20 rounded-2xl p-3 border border-sky-100/60 ${mobileActiveColumn === 'DANG_TIEN_HANH' ? 'block' : 'hidden md:block'}`}>
                    <div className="flex items-center justify-between px-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700 font-mono">Đang tiến hành</span>
                      <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.2 rounded-full font-bold">
                        {finalFilteredTasks.filter(t => t.status === 'DANG_TIEN_HANH').length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {finalFilteredTasks.filter(t => t.status === 'DANG_TIEN_HANH').map(t => (
                        <TaskCard 
                          isCompact={isCompactView}
                          key={t.id} 
                          task={t} 
                          currentUser={displayCurrentUser}
                          rbacConfig={rbacConfig}
                          onViewDetails={setSelectedTaskForDetail}
                          onUpdateStatus={handleUpdateStatus}
                          onRejectTask={handleRejectTask}
                          onDeleteTask={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Column 3: CHO_DUYET */}
                  <div className={`bg-amber-50/20 rounded-2xl p-3 border border-amber-100/60 ${mobileActiveColumn === 'CHO_DUYET' ? 'block' : 'hidden md:block'}`}>
                    <div className="flex items-center justify-between px-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">Chờ duyệt</span>
                      <span className="text-xs bg-amber-100/80 text-amber-800 px-2 py-0.2 rounded-full font-bold animate-pulse">
                        {finalFilteredTasks.filter(t => t.status === 'CHO_DUYET').length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {finalFilteredTasks.filter(t => t.status === 'CHO_DUYET').map(t => (
                        <TaskCard 
                          isCompact={isCompactView}
                          key={t.id} 
                          task={t} 
                          currentUser={displayCurrentUser}
                          rbacConfig={rbacConfig}
                          onViewDetails={setSelectedTaskForDetail}
                          onUpdateStatus={handleUpdateStatus}
                          onRejectTask={handleRejectTask}
                          onDeleteTask={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Column 4: HOAN_THANH */}
                  <div className={`bg-emerald-50/20 rounded-2xl p-3 border border-emerald-100/60 ${mobileActiveColumn === 'HOAN_THANH' ? 'block' : 'hidden md:block'}`}>
                    <div className="flex items-center justify-between px-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">Hoàn thành</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                        {finalFilteredTasks.filter(t => t.status === 'HOAN_THANH').length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {finalFilteredTasks.filter(t => t.status === 'HOAN_THANH').map(t => (
                        <TaskCard 
                          isCompact={isCompactView}
                          key={t.id} 
                          task={t} 
                          currentUser={displayCurrentUser}
                          rbacConfig={rbacConfig}
                          onViewDetails={setSelectedTaskForDetail}
                          onUpdateStatus={handleUpdateStatus}
                          onRejectTask={handleRejectTask}
                          onDeleteTask={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {finalFilteredTasks.length > 0 && activeView === 'CALENDAR' && (
            <div id="view-calendar-wrapper" className="animate-fade-in">
              <TaskCalendar tasks={finalFilteredTasks} onViewDetails={setSelectedTaskForDetail} />
            </div>
          )}

          {finalFilteredTasks.length > 0 && activeView === 'LIST' && (
            <div id="view-spreadsheet-list" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Thẻ / Phân loại</th>
                      <th className="px-6 py-3.5 font-bold">Công việc nhiệm vụ</th>
                      <th className="px-6 py-3.5 font-bold">Cán bộ đảm nhiệm</th>
                      <th className="px-6 py-3.5 font-bold text-center">Độ ưu tiên</th>
                      <th className="px-6 py-3.5">Hạn chót</th>
                      <th className="px-6 py-3.5 text-center">Trạng thái</th>
                      <th className="px-6 py-3.5 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupByDepartment ? (
                      /* Grouped by department inside table body */
                      visibleWorkspaces.filter(w => w.id !== 'ALL').map((w) => {
                        const wsTasks = finalFilteredTasks.filter(t => t.workspaceId === w.id);
                        if (wsTasks.length === 0) return null;

                        let dotColor = 'bg-blue-500';
                        if (w.id === 'BGH') dotColor = 'bg-amber-500';
                        else if (w.color) {
                          const match = w.color.match(/from-([a-z]+-\d+)/);
                          if (match) {
                            dotColor = `bg-${match[1]}`;
                          } else {
                            dotColor = 'bg-indigo-500';
                          }
                        }

                        return (
                          <React.Fragment key={w.id}>
                            {/* Department title banner inside table */}
                            <tr className="bg-slate-100/50 border-y border-slate-200/50">
                              <td colSpan={7} className="px-6 py-2.5 font-bold text-[11px] text-slate-700 uppercase font-mono tracking-wider select-none">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                    <span>{w.name} ({wsTasks.length} chỉ đạo)</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-sans normal-case font-normal italic hidden sm:inline">{w.description}</span>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Rows of this workspace */}
                            {wsTasks.map((t) => (
                              <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 font-semibold rounded-md">
                                    {t.tag}
                                  </span>
                                </td>
                                <td className="px-6 py-4 min-w-[200px] max-w-[250px] sm:max-w-xs md:max-w-sm lg:max-w-md overflow-hidden">
                                  <button 
                                    onClick={() => setSelectedTaskForDetail(t)}
                                    className="font-bold text-slate-900 text-left hover:text-indigo-600 hover:underline transition-all block truncate w-full cursor-pointer"
                                  >
                                    {t.title}
                                  </button>
                                  <span className="text-slate-500 text-[10.5px] block truncate w-full mt-0.5 font-medium" title={t.description}>
                                    {t.description}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-800">{t.assignedName}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{t.assignedRole}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    t.priority === 'CAO' 
                                      ? 'bg-rose-50 border border-rose-250 text-rose-700' 
                                      : t.priority === 'TRUNG_BINH' 
                                        ? 'bg-amber-50 border border-amber-250 text-amber-700' 
                                        : 'bg-slate-50 border border-slate-200 text-slate-700'
                                  }`}>
                                    {t.priority}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-700">
                                  {t.deadline}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans border ${
                                    t.status === 'HOAN_THANH' 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                      : t.status === 'CHO_DUYET' 
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' 
                                        : t.status === 'DANG_TIEN_HANH' 
                                          ? 'bg-sky-50 text-sky-800 border-sky-200' 
                                          : 'bg-slate-100 text-slate-800 border-slate-200'
                                  }`}>
                                    {getStatusLabel(t.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    onClick={() => setSelectedTaskForDetail(t)}
                                    className="text-indigo-600 hover:text-indigo-800 font-extrabold hover:underline cursor-pointer"
                                  >
                                    Chi tiết
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      /* Flat standard rows style */
                      finalFilteredTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 font-semibold rounded-md">
                              {t.tag}
                            </span>
                          </td>
                          <td className="px-6 py-4 min-w-[200px] max-w-[250px] sm:max-w-xs md:max-w-sm lg:max-w-md overflow-hidden">
                            <button 
                              onClick={() => setSelectedTaskForDetail(t)}
                              className="font-bold text-slate-900 text-left hover:text-indigo-600 hover:underline transition-all block truncate w-full cursor-pointer"
                            >
                              {t.title}
                            </button>
                            <span className="text-slate-500 text-[10.5px] block truncate w-full mt-0.5 font-medium" title={t.description}>
                              {t.description}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">{t.assignedName}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{t.assignedRole}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.priority === 'CAO' 
                                ? 'bg-rose-50 border border-rose-250 text-rose-700' 
                                : t.priority === 'TRUNG_BINH' 
                                  ? 'bg-amber-50 border border-amber-250 text-amber-700' 
                                  : 'bg-slate-50 border border-slate-200 text-slate-700'
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-700">
                            {t.deadline}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans border ${
                              t.status === 'HOAN_THANH' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : t.status === 'CHO_DUYET' 
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' 
                                  : t.status === 'DANG_TIEN_HANH' 
                                    ? 'bg-sky-50 text-sky-800 border-sky-200' 
                                    : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}>
                              {getStatusLabel(t.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedTaskForDetail(t)}
                              className="text-indigo-600 hover:text-indigo-800 font-extrabold hover:underline cursor-pointer"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
            </>
          )}

        {/* System activity logs footer tracking */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mt-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <Cpu className="w-4.5 h-4.5 text-indigo-600" />
              Nhật Ký Giao Việc & Xử Lý Tiến Độ
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Thời gian UTC: 2026-05-30</span>
          </div>

          <div id="full-system-logs" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-[11px] text-slate-600 max-h-[160px] overflow-y-auto pr-1">
            {tasks.flatMap(t => t.history.map(l => ({ ...l, taskTitle: t.title }))).sort((a,b) => b.id.localeCompare(a.id)).slice(0, 9).map((l, ix) => (
              <div key={ix} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 relative">
                <span className="text-[9px] text-slate-400 font-mono block mb-1">{l.createdAt}</span>
                <p className="line-clamp-2 leading-relaxed">
                  <strong className="text-slate-800 font-sans">{l.userName}</strong> ({l.userTitle}): {l.action}
                </p>
                <span className="text-[10.5px] italic text-indigo-600 truncate block mt-1" title={l.taskTitle}>
                  📌 C/V: {l.taskTitle}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>
      </div>

      {/* MODALS GATE */}
      {isCreateModalOpen && (
        <TaskModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateTask}
          currentUser={displayCurrentUser}
          workspaces={workspaces}
        />
      )}

      {isWorkspaceModalOpen && (
        <WorkspaceManager 
          onClose={() => setIsWorkspaceModalOpen(false)}
          workspaces={workspaces}
          onUpdateWorkspaces={saveWorkspaces}
        />
      )}

      {selectedTaskForDetail && (
        <TaskDetailsModal 
          task={selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
          currentUser={displayCurrentUser}
          rbacConfig={rbacConfig}
          onUpdateStatus={handleUpdateStatus}
          onRejectTask={handleRejectTask}
          onAddComment={handleAddComment}
          tasks={tasks}
          onSwitchTask={(t) => setSelectedTaskForDetail(t)}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {isRbacModalOpen && (
        <RbacSettingsModal
          onClose={() => setIsRbacModalOpen(false)}
          config={rbacConfig}
          onSaveConfig={saveRbacConfig}
        />
      )}

      {/* Unified Multi-intelligence Staff Profile & Development Center */}
      {selectedStaffProfile && (
        <div id="unified-staff-profile-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedStaffProfile(null)} className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-fade-in" />
          
          <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-scale-up flex flex-col font-sans max-h-[90vh] z-50">
            {/* Header: Dynamic workspace gradient color fallback */}
            <div className="bg-slate-900 text-white p-6 relative">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  type="button"
                  onClick={() => setSelectedStaffProfile(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={getSafeAvatar(selectedStaffProfile.avatar, selectedStaffProfile.name)} 
                    alt={selectedStaffProfile.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  {currentUser.id === selectedStaffProfile.id && (
                    <span className="absolute -bottom-1 -right-1 block px-1.5 py-0.5 text-[8px] bg-emerald-500 font-bold border border-white text-white rounded font-mono uppercase">
                      BẠN
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                    {selectedStaffProfile.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">Chức vụ: <span className="text-white font-bold">{selectedStaffProfile.title}</span></p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                    Sơ đồ Tổ: {workspaces.find(w => w.id === selectedStaffProfile.workspaceId)?.name || selectedStaffProfile.workspaceId}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub navigation Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-4">
              {(['INFO', 'MI', 'KPI', 'CPD'] as const).map((tab) => {
                const label = tab === 'INFO' ? 'Thông tin & Đổi vai' : tab === 'MI' ? 'Trí Tuệ (MI)' : tab === 'KPI' ? 'Thi đua & KPI' : 'Học tập (CPD)';
                const icon = tab === 'INFO' ? <UserCheck className="w-4 h-4" /> : tab === 'MI' ? <Brain className="w-4 h-4" /> : tab === 'KPI' ? <Award className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setProfileActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold leading-none border-b-2 transition-all cursor-pointer focus:outline-none ${
                      profileActiveTab === tab 
                        ? 'border-indigo-600 text-indigo-700 font-black bg-white' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Tab Panels */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh] scrollbar-thin">
              {profileActiveTab === 'INFO' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                      <span className="text-slate-400 block font-medium">Họ & Tên</span>
                      <strong className="text-slate-800 text-sm font-bold block mt-0.5">{selectedStaffProfile.name}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                      <span className="text-slate-400 block font-medium">Mã Số Nhân Sự</span>
                      <strong className="text-slate-850 font-mono text-sm block mt-0.5">{selectedStaffProfile.id.toUpperCase()}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                      <span className="text-slate-400 block font-medium">Vai trò hệ thống</span>
                      <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg uppercase">
                        🛡️ {selectedStaffProfile.role}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                      <span className="text-slate-400 block font-medium">Nhóm Học Thuật</span>
                      <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg uppercase">
                        💼 {selectedStaffProfile.roleName}
                      </span>
                    </div>
                  </div>

                  {/* Mock SSO Sandbox switch - Solution 1 */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-amber-250 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-amber-850 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-amber-600 animate-pulse" />
                      Giả lập Đăng Nhập SSO (Sandbox) 🧪
                    </h4>
                    <p className="text-[11px] text-amber-700 leading-normal mt-1 mb-3 font-normal">
                      Ban Giám Hiệu và Admin có thể đăng nhập thử vai nhân sự này ngay để trải nghiệm và rà soát các tiến trình nhiệm vụ, OKRs riêng biệt của tổ chuyên môn dưới góc nhìn của họ.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleUserSwitch(selectedStaffProfile);
                        setSelectedStaffProfile(null);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-550 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer focus:outline-none"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Đăng nhập thử vai nhân sự này</span>
                    </button>
                  </div>
                </div>
              )}

              {profileActiveTab === 'MI' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Điểm Khung Năng Lực Đa Trí Tuệ (8 mảng MI)</h4>
                      <p className="text-[10px] text-slate-500 font-normal">Điều chỉnh trực tiếp bởi Ban Giám hiệu tuyển sinh.</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-750 px-2 py-0.5 rounded-lg font-bold">
                      {currentUser.role === 'ADMIN' ? '✍️ Chế độ Biên tập' : '👁️ Chế độ Xem'}
                    </span>
                  </div>

                  {selectedStaffProfile.miProfile ? (
                    <>
                      <div className="h-64 w-full bg-slate-50 border border-slate-100 rounded-xl p-2 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={
                            Object.entries(MI_KEY_DETAILS).map(([key, details]) => {
                              const scoreKey = key as keyof MIProfile;
                              return {
                                subject: details.name.replace('Trí tuệ ', ''),
                                fullMark: 100,
                                score: selectedStaffProfile.miProfile?.[scoreKey] || 60
                              };
                            })
                          }>
                            <PolarGrid strokeDasharray="3 3" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4f46e5', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Chỉ số MI" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} isAnimationActive={false} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {currentUser.role === 'ADMIN' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(MI_KEY_DETAILS).map(([key, details]) => {
                            const scoreKey = key as keyof MIProfile;
                            const scoreValue = selectedStaffProfile.miProfile?.[scoreKey] || 60;
                            return (
                              <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                    <span>{details.emoji}</span>
                                    <span>{details.name.replace('Trí tuệ ', '')}</span>
                                  </span>
                                  <strong className="text-xs font-mono text-indigo-600">{scoreValue}/100</strong>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-[9px] text-slate-400 font-mono">Trượt:</span>
                                  <input 
                                    type="range"
                                    min="20"
                                    max="100"
                                    value={scoreValue}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      const updatedUsersList = users.map(u => {
                                        if (u.id === selectedStaffProfile.id) {
                                          return {
                                            ...u,
                                            miProfile: {
                                              ...u.miProfile!,
                                              [scoreKey]: val
                                            }
                                          };
                                        }
                                        return u;
                                      });
                                      saveUsers(updatedUsersList);
                                      setSelectedStaffProfile(prev => {
                                        if (!prev) return null;
                                        return {
                                          ...prev,
                                          miProfile: {
                                            ...prev.miProfile!,
                                            [scoreKey]: val
                                          }
                                        };
                                      });
                                    }}
                                    className="flex-1 accent-indigo-600 h-1 cursor-pointer bg-slate-200 rounded-lg appearance-none"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <p className="col-span-2 text-xs text-slate-401 text-center italic font-normal">Không tìm thấy thông tin MI khả dụng.</p>
                    </div>
                  )}
                </div>
              )}

              {profileActiveTab === 'KPI' && (
                <div className="space-y-4">
                  {/* KPI lock and summaries */}
                  {(() => {
                    const staffTasks = tasks.filter(t => t.assignedId === selectedStaffProfile.id);
                    const completedTasks = staffTasks.filter(t => t.status === 'HOAN_THANH');
                    const kpiScore = completedTasks.length * 10 + 50;

                    return (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 border p-3 rounded-xl text-center">
                            <span className="text-[9.5px] uppercase tracking-wider text-slate-400 block font-medium">Tổng nhiệm vụ</span>
                            <strong className="text-base font-mono text-slate-800 font-extrabold">{staffTasks.length}</strong>
                          </div>
                          <div className="bg-slate-50 border p-3 rounded-xl text-center">
                            <span className="text-[9.5px] uppercase tracking-wider text-slate-400 block font-medium">Hoàn thành</span>
                            <strong className="text-base font-mono text-emerald-600 font-extrabold">{completedTasks.length}</strong>
                          </div>
                          <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-xl text-center">
                            <span className="text-[9.5px] uppercase tracking-wider text-indigo-505 block font-bold">Điểm thi đua</span>
                            <strong className="text-base font-mono text-indigo-700 font-extrabold">{kpiScore} điểm</strong>
                          </div>
                        </div>

                        {/* Approved and Lock section */}
                        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                          selectedStaffProfile.kpiLocked 
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-900' 
                            : 'bg-slate-50 border-slate-200/80 text-slate-800'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            {selectedStaffProfile.kpiLocked ? (
                              <Lock className="w-5 h-5 text-emerald-600 animate-pulse" />
                            ) : (
                              <Unlock className="w-5 h-5 text-slate-400" />
                            )}
                            <div>
                              <h4 className="text-xs font-bold">Xét duyệt và Chốt điểm Thi đua Học kỳ I</h4>
                              <p className="text-[10px] text-slate-500 leading-normal font-normal">
                                {selectedStaffProfile.kpiLocked ? 'Điểm số học phần đã khóa chính thức bởi Hiệu Trưởng.' : 'Trạng thái mở: Đang rà soát và cho phép tích lũy thành tích.'}
                              </p>
                            </div>
                          </div>

                          {currentUser.role === 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedUsersList = users.map(u => {
                                  if (u.id === selectedStaffProfile.id) {
                                    return {
                                      ...u,
                                      kpiLocked: !u.kpiLocked
                                    };
                                  }
                                  return u;
                                });
                                saveUsers(updatedUsersList);
                                setSelectedStaffProfile(prev => prev ? { ...prev, kpiLocked: !prev.kpiLocked } : null);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer focus:outline-none ${
                                selectedStaffProfile.kpiLocked 
                                  ? 'bg-white border-slate-300 text-slate-705 hover:bg-slate-50' 
                                  : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-750'
                              }`}
                            >
                              {selectedStaffProfile.kpiLocked ? 'Mở Khóa KPI' : 'Chốt Điểm & Khóa 🔒'}
                            </button>
                          )}
                        </div>

                        {/* Assigned Task Titles */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide font-sans">Chi tiết các chỉ đạo đảm nhận ({staffTasks.length})</h4>
                          <div className="max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                            {staffTasks.map(t => {
                              const isTaskCompleted = t.status === 'HOAN_THANH';
                              return (
                                <div key={t.id} className="p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-between gap-3 text-[11px]">
                                  <div className="min-w-0 flex-1">
                                    <strong className={`font-semibold block truncate text-slate-800 ${isTaskCompleted ? 'line-through text-slate-400' : ''}`}>{t.title}</strong>
                                    <span className="text-[10px] text-slate-450 block truncate mt-0.5">Phân loại: {t.tag} | Hạn chót: {t.deadline}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded font-bold font-mono text-[9px] shrink-0 ${
                                    isTaskCompleted 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : t.status === 'TIEN_TRINH' 
                                      ? 'bg-blue-50 text-blue-700' 
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {t.status.replace('_', ' ')}
                                  </span>
                                </div>
                              );
                            })}
                            {staffTasks.length === 0 && (
                              <p className="text-[11px] text-slate-450 italic py-2 text-center font-normal font-sans">Chưa có chỉ đạo học thuật phân bổ cho cán bộ nhân sự này.</p>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {profileActiveTab === 'CPD' && (
                <div className="space-y-4">
                  {/* Total hours summary */}
                  <div className="bg-slate-50 border rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Bồi dưỡng Giảng dạy Giáo viên (CPD Hours)</h4>
                        <p className="text-[10px] text-slate-500 font-normal">Tích lũy giờ bồi dưỡng nâng cao chuyên môn.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-xl font-mono text-indigo-700 font-black">{selectedStaffProfile.cpdHours || 0} giờ</strong>
                      <span className="text-[9px] text-slate-400 block font-medium">tích lũy</span>
                    </div>
                  </div>

                  {/* CPD Log details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nhật ký hoạt động bồi dưỡng ({selectedStaffProfile.cpdLog?.length || 0})</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                      {selectedStaffProfile.cpdLog?.map((l) => (
                        <div key={l.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <strong className="font-semibold text-slate-800 block leading-normal">{l.title}</strong>
                            <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">🗓️ Ngày ghi nhận: {l.date}</span>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 font-mono">+{l.hours} giờ</span>
                        </div>
                      ))}
                      {(!selectedStaffProfile.cpdLog || selectedStaffProfile.cpdLog.length === 0) && (
                        <p className="text-[11px] text-slate-400 italic py-2 text-center font-normal font-sans">Chưa có nhật ký hoạt động bồi dưỡng.</p>
                      )}
                    </div>
                  </div>

                  {/* Add hours if current user is admin */}
                  {currentUser.role === 'ADMIN' && (
                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-3 mt-2">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1 font-sans">
                        <Plus className="w-4 h-4 text-indigo-600" />
                        Ghi nhận thêm giờ hoạt động CPD bồi dưỡng mới
                      </h4>
                      <div className="flex gap-2 text-xs">
                        <input 
                          type="text" 
                          placeholder="Nhập tên hội thảo tập huấn..."
                          value={newCpdTitle}
                          onChange={(e) => setNewCpdTitle(e.target.value)}
                          className="flex-1 p-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                        <select
                          value={newCpdHours}
                          onChange={(e) => setNewCpdHours(e.target.value)}
                          className="p-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-800 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                          <option value="2">2 giờ</option>
                          <option value="4">4 giờ</option>
                          <option value="6">6 giờ</option>
                          <option value="8">8 giờ</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCpdTitle.trim()) {
                              alert('Vui lòng nhập tên cuộc tập huấn hội thảo bồi dưỡng chuyên môn.');
                              return;
                            }
                            const hours = parseInt(newCpdHours);
                            const newLogItem = {
                              id: `cp_log_${Date.now()}`,
                              title: newCpdTitle,
                              hours: hours,
                              date: new Date().toISOString().slice(0, 10)
                            };

                            const updatedUsersList = users.map(u => {
                              if (u.id === selectedStaffProfile.id) {
                                return {
                                  ...u,
                                  cpdHours: (u.cpdHours || 0) + hours,
                                  cpdLog: [...(u.cpdLog || []), newLogItem]
                                };
                              }
                              return u;
                            });

                            saveUsers(updatedUsersList);
                            setSelectedStaffProfile(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                cpdHours: (prev.cpdHours || 0) + hours,
                                cpdLog: [...(prev.cpdLog || []), newLogItem]
                              };
                            });
                            setNewCpdTitle('');
                            setNewCpdHours('4');
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white font-bold rounded-xl shadow-3xs transition-all cursor-pointer focus:outline-none"
                        >
                          Lưu giờ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50 p-4 px-6 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Đa Trí Tuệ School SaaS Integrated CMS</span>
              <button 
                type="button"
                onClick={() => setSelectedStaffProfile(null)}
                className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer focus:outline-none"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Cán bộ Nhân sự Mới Modal - Solution 2 */}
      {isOnboardingModalOpen && (
        <div id="onboard-staff-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsOnboardingModalOpen(false)} className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-fade-in" />
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const workspaceId = formData.get('workspaceId') as string;
              const title = formData.get('title') as string;
              const role = formData.get('role') as 'ADMIN' | 'MANAGER' | 'STAFF';

              if (!name || !title || !workspaceId) {
                alert('Vui lòng hoàn tất điền đủ thông tin nhân sự!');
                return;
              }

              handleOnboardUser({ name, workspaceId, title, role });
              setIsOnboardingModalOpen(false);
            }}
            className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-150 p-6 space-y-4 font-sans animate-scale-up z-50"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Onboard Cán bộ Nhân sự Mới</h3>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Thêm tài khoản đồng bộ vào trường học Đa Trí Tuệ.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsOnboardingModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 block font-bold">Họ & Tên Nhân Sự mới:</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  placeholder="Ví dụ: Thầy Thích Trí Tuệ"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block font-bold">Chức danh / Chức vụ giảng dạy:</label>
                <input 
                  required
                  type="text" 
                  name="title"
                  placeholder="Ví dụ: Giáo viên Lịch sử THPT"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 block font-bold">Tổ chuyên môn:</label>
                  <select
                    name="workspaceId"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer"
                  >
                    {workspaces.filter(w => w.id !== 'ALL').map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-250 block font-bold" style={{ color: '#64748b' }}>Vai trò hệ thống (RBAC):</label>
                  <select
                    name="role"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer"
                  >
                    <option value="STAFF">Giáo viên / Nhân viên</option>
                    <option value="MANAGER">Tổ trưởng chuyên môn</option>
                    <option value="ADMIN">Ban Giám hiệu (BGH)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end text-xs font-bold leading-none">
              <button
                type="button"
                onClick={() => setIsOnboardingModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                Kích Hoạt và Onboard 🚀
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 print:hidden animate-fade-in fade-in transition-all">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center gap-2 p-5 border-b border-slate-100 bg-slate-50/50">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Trợ lý AI Cuối ngày</h2>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="ml-auto p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-700 leading-relaxed min-h-[150px]">
              {isSummarizing ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 opacity-70">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  <p className="font-medium animate-pulse text-indigo-600">AI đang thiết lập lịch làm việc cho ngày mai...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{aiSummary}</div>
              )}
            </div>
            
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/45 backdrop-blur-sm px-3 pt-20 md:pt-24 print:hidden">
          <div
            className="absolute inset-0"
            onClick={closeCommandPalette}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-750 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <Search className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(commandQuery);
                    setOverviewTab('TASKS');
                    closeCommandPalette();
                  }
                }}
                placeholder="Tim nhanh chuc nang, cong viec, nhan su, bo phan..."
                className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <button
                type="button"
                onClick={closeCommandPalette}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Dong"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-3">
              <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <span>Command Palette</span>
                <span className="rounded-md border border-slate-200 px-1.5 py-0.5 font-mono normal-case text-slate-500 dark:border-slate-700">Esc</span>
              </div>

              {commandSectionResults.length > 0 && (
                <div className="mb-4">
                  <div className="px-1 pb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Man hinh</div>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {commandSectionResults.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openOverviewSection(item.tab)}
                          className="flex min-h-16 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-3xs dark:bg-slate-900 dark:text-indigo-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-extrabold text-slate-850 dark:text-white">{item.label}</span>
                            <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{item.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {commandTaskResults.length > 0 && (
                <div className="mb-4">
                  <div className="px-1 pb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Cong viec</div>
                  <div className="space-y-1.5">
                    {commandTaskResults.map(task => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => openTaskFromCommand(task)}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                      >
                        <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-extrabold text-slate-850 dark:text-white">{task.title}</span>
                          <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {task.assignedName} · {getStatusLabel(task.status)} · {task.deadline}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(commandUserResults.length > 0 || commandWorkspaceResults.length > 0) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {commandUserResults.length > 0 && (
                    <div>
                      <div className="px-1 pb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Nhan su</div>
                      <div className="space-y-1.5">
                        {commandUserResults.map(user => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => openUserFromCommand(user)}
                            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                          >
                            <img src={getSafeAvatar(user.avatar, user.name)} alt={user.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-extrabold text-slate-850 dark:text-white">{user.name}</span>
                              <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{user.title}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {commandWorkspaceResults.length > 0 && (
                    <div>
                      <div className="px-1 pb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Bo phan</div>
                      <div className="space-y-1.5">
                        {commandWorkspaceResults.map(workspace => (
                          <button
                            key={workspace.id}
                            type="button"
                            onClick={() => openWorkspaceFromCommand(workspace.id)}
                            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                          >
                            <Layers className="h-4 w-4 shrink-0 text-indigo-500" />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-extrabold text-slate-850 dark:text-white">{workspace.name}</span>
                              <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{workspace.description}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {commandSectionResults.length === 0 && commandTaskResults.length === 0 && commandUserResults.length === 0 && commandWorkspaceResults.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Khong tim thay ket qua phu hop</p>
                  <p className="mt-1 text-xs text-slate-400">Nhan Enter de ap dung tu khoa nay vao bo loc cong viec.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Help */}
      <button 
        onClick={() => setIsGuideModalOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 z-40 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        title="Hướng dẫn nhanh"
      >
        <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Quick Guide Overlay Modal */}
      <GuideModal 
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
