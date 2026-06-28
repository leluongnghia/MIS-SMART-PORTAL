'use client';
import { serverStorage } from './libs/client/server-storage';


import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './context/LanguageContext';
import { translateWorkspace, translateUser, translateTask, translateAnnouncement, translateDirective } from './utils/translations';
import { Task, Workspace, UserProfile, Role, TaskStatus, TaskPriority, Comment, RbacConfig, RolePermissions, Announcement, BoardDirective, RELIABLE_AVATARS, getSafeAvatar } from './types';
import { WORKSPACES as INITIAL_WORKSPACES, MOCK_USERS, INITIAL_TASKS } from './mockData';
import { enrichUserWithMIDetails, MI_KEY_DETAILS } from './miAndOkrUtils';
import { MIProfile } from './types';
import { firestoreDb, auth, handleFirestoreError, OperationType } from './firebase';
import { encryptData, decryptData } from './utils/security';
import { normalizeTaskAssigneeRoles, normalizeUserProfile, normalizeUserProfiles } from './utils/peopleDirectory';
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
import ProjectGanttView from './components/ProjectGanttView';
import TaskModal from './components/TaskModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import GoogleSheetsCenter from './components/GoogleSheetsCenter';
import LoginPortal from './components/LoginPortal';
import WorkspaceManager from './components/WorkspaceManager';
import StrategyOkrHub from './components/StrategyOkrHub';
import WorkflowBuilder from './components/WorkflowBuilder';
import AdmissionsEnterpriseDashboard, { type AdmissionsModule } from './components/AdmissionsEnterpriseDashboard';
import StudentSuccessHub from './components/StudentSuccessHub';
import RiskManagementCenter from './components/RiskManagementCenter';
import ReportingAnalyticsBuilder from './components/ReportingAnalyticsBuilder';
import AcademicOperations from './components/AcademicOperations';
import SchoolLogistics from './components/SchoolLogistics';
import SchoolRequests from './components/SchoolRequests';
import HrmCenter from './components/HrmCenter';
import ParentStudentPortal from './components/ParentStudentPortal';
import BoardDirectivePanel from './components/BoardDirectivePanel';
import IntelligenceAndOkrHub from './components/IntelligenceAndOkrHub';
import MisLmsCenter from './components/MisLmsCenter';
import DocumentCenter from './components/DocumentCenter';
import MeetingCenter from './components/MeetingCenter';
import KnowledgeBase from './components/KnowledgeBase';
import EventManagement from './components/EventManagement';
import SystemSettingsModal from './components/SystemSettingsModal';
import RbacSettingsModal, { DEFAULT_RBAC_CONFIG } from './components/RbacSettingsModal';
import GuideModal from './components/GuideModal';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import NotificationDrawer from './components/NotificationDrawer';
import ActionCenterDrawer from './components/ActionCenterDrawer';
import FloatingActionButton from './components/FloatingActionButton';
import CommandPalette from './components/ui/CommandPalette';
import { ToastProvider, useToast } from './components/ui/Toast';
import { useAppState } from './hooks/useAppState';
import { useTaskHandlers } from './hooks/useTaskHandlers';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
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
  FolderOpen,
  Milestone
} from 'lucide-react';

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'annce_1',
    title: 'Họp giao ban đột xuất: Rà soát thiết bị làm mát mùa tuyển sinh và thi cử',
    content: 'Kính gửi Thầy/Cô Tổ trưởng chuyên môn và Phó Hiệu trưởng,\n\nBan điều hành đề nghị họp khẩn để thống nhất phương án rà soát thiết bị, bảo đảm điều kiện làm mát tại 40 phòng thi chính thức phục vụ kỳ thi tốt nghiệp THPT và các sự kiện tuyển sinh khối Tiểu học sắp tới.\n\nĐề nghị Thầy/Cô:\n1. Báo cáo nhanh tiến độ sửa chữa, lắp đặt thiết bị.\n2. Chuẩn bị tài liệu về kinh phí phát sinh nếu có.\n\nKính mời Thầy/Cô tham dự đầy đủ và đúng giờ.',
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
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
        status: 'DA_XAC_NHAN',
        note: 'Đã sẵn sàng kịch bản ôn tập và rà soát hạ tầng phòng chuyên môn'
      }
    ]
  },
  {
    id: 'annce_2',
    title: 'Thông báo phối hợp kiểm tra hồ sơ đổi mới phương pháp giảng dạy Ngữ văn',
    content: 'Ban Giám hiệu ghi nhận tinh thần đổi mới giảng dạy của Tổ Ngữ văn. Đề nghị Tổ trưởng Tổ Ngữ văn phối hợp kiểm tra hồ sơ giáo án mẫu tích hợp công nghệ để phổ biến rộng rãi trong toàn trường trong tuần tới.\n\nTrân trọng.',
    senderName: 'Thầy Nguyễn Minh Triết',
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
    title: 'Nghị quyết số 08/NQ-HĐ: Định hướng đầu tư cơ sở vật chất và phòng thí nghiệm AI',
    content: 'Hội đồng Trường nhất trí thông qua đề án cải tạo phòng nghiên cứu Công nghệ số, bổ sung máy tính cấu hình cao để phục vụ các dự án Robotics, AI ứng dụng và giáo dục đa trí tuệ trong niên khóa mới.\n\nĐợt phân bổ đầu tiên bắt đầu từ ngày 01/07/2026. Giao Ban Giám hiệu và bộ phận Hành chính - Thiết bị phối hợp với các tổ chuyên môn triển khai, đồng thời lập biểu mẫu giám sát chất lượng.',
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
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
        status: 'DA_TIEP_THU',
        feedback: 'Ban Giám hiệu đã tiếp nhận ý kiến của Hội đồng Trường và bắt đầu thành lập hội đồng thẩm định ngân sách.',
        updatedAt: '2026-05-30 11:15'
      }
    ]
  },
  {
    id: 'directive_2',
    title: 'Chỉ thị khẩn: Rà soát an toàn vệ sinh thực phẩm học đường',
    content: 'Đề nghị Tổng quản lý Bếp ăn học đường phối hợp trực tiếp với Phòng Vận hành để kiểm tra toàn bộ hồ sơ chất lượng thực phẩm đầu vào, quy trình bảo quản và việc lưu mẫu thực phẩm trong 24 giờ.\n\nYêu cầu nộp báo cáo kết quả rà soát cho Ban điều hành trước ngày 05/06/2026.',
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
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
        status: 'DANG_TRIEN_KHAI',
        feedback: 'Đã lập biên bản kiểm tra đột xuất cùng cô Hoàng Kim Oanh lúc 15:00 hôm nay. Đang tổng hợp các điểm lưu ý mẫu thức ăn.',
        updatedAt: '2026-05-30 15:30'
      }
    ]
  }
];

const LOCAL_TASKS_KEY = 'school_task_manager_tasks_fallback';
const LOCAL_WORKSPACES_KEY = 'school_task_manager_workspaces';
const LOCAL_DIRECTIVES_KEY = 'school_task_manager_directives';
const LOCAL_RBAC_KEY = 'school_task_manager_rbac';
const LOCAL_USER_OVERRIDES_KEY = 'school_task_manager_user_overrides';

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const saved = serverStorage.getItem(key);
    if (!saved) return fallback;
    if (key === LOCAL_RBAC_KEY || key === LOCAL_DIRECTIVES_KEY) {
      return decryptData(saved) || fallback;
    }
    return JSON.parse(saved) as T;
  } catch (error) {
    console.warn(`[Local fallback] Cannot read ${key}:`, error);
    return fallback;
  }
}

function writeLocalJson<T>(key: string, value: T) {
  try {
    if (key === LOCAL_RBAC_KEY || key === LOCAL_DIRECTIVES_KEY) {
      serverStorage.setItem(key, encryptData(value));
    } else {
      serverStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`[Local fallback] Cannot write ${key}:`, error);
  }
}

type OverviewTab = 'DASHBOARD' | 'STRATEGY_OKRS' | 'TASKS' | 'WORKFLOW_APPROVALS' | 'CRM_ADMISSIONS' | 'STUDENT_SUCCESS' | 'PARENT_PORTAL' | 'TEACHER_HR' | 'RISK_CENTER' | 'ANALYTICS' | 'BOARD_DIRECTIVES' | 'ACADEMIC_OPS' | 'LOGISTICS' | 'REQUESTS' | 'HRM' | 'LMS' | 'GOOGLE_SHEETS' | 'DOCUMENT' | 'MEETING' | 'KNOWLEDGE' | 'EVENTS';

const canDisplayTabWithWorkspace = (tab: OverviewTab, role: Role, workspaceId?: string) => {
  if (tab === 'TEACHER_HR') return false;
  if (tab === 'CRM_ADMISSIONS') return workspaceId === 'TUYEN_SINH_PR';
  if (role === 'ADMIN' || workspaceId === 'BGH') return true;

  switch (tab) {
    case 'DASHBOARD':
    case 'BOARD_DIRECTIVES':
      return role === 'MANAGER' || workspaceId === 'HANH_CHINH' || workspaceId === 'TUYEN_SINH_PR';
    
    case 'STRATEGY_OKRS':
    case 'RISK_CENTER':
    case 'ANALYTICS':
    case 'GOOGLE_SHEETS':
      return false;

    case 'TASKS':
    case 'KNOWLEDGE':
      return true;

    case 'WORKFLOW_APPROVALS':
      return workspaceId === 'HANH_CHINH' || role === 'MANAGER';

    case 'STUDENT_SUCCESS':
      return workspaceId === 'CTHS_TAM_LY';

    case 'ACADEMIC_OPS':
      return true;

    case 'LOGISTICS':
      return workspaceId === 'HANH_CHINH' || workspaceId === 'DICH_VU_HOC_DUONG';

    case 'REQUESTS':
      return role === 'STAFF' || workspaceId === 'HANH_CHINH';

    case 'HRM':
      return true;

    case 'LMS':
      return role === 'STAFF' || workspaceId === 'QUOC_TE';

    case 'DOCUMENT':
      return workspaceId === 'HANH_CHINH';

    case 'MEETING':
      return workspaceId === 'HANH_CHINH' || role === 'MANAGER';

    case 'EVENTS':
      return workspaceId === 'TUYEN_SINH_PR';

    case 'PARENT_PORTAL':
      return false;

    default:
      return false;
  }
};

const canRoleAccessTab = (role: Role, workspaceId: string | undefined, tab: OverviewTab) => {
  return canDisplayTabWithWorkspace(tab, role, workspaceId);
};

function AppInner() {
  const { lang, setLang, t } = useLanguage();
  const toast = useToast();
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
    return serverStorage.getItem('mis_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      serverStorage.setItem('mis_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      serverStorage.setItem('mis_theme', 'light');
    }
  }, [darkMode]);

  // Multi-campus state
  const [selectedCampus, setSelectedCampus] = useState<'ALL' | 'CAMPUS_HN' | 'CAMPUS_HCM'>('ALL');
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);

  // Persistence state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const rawTasks = normalizeTaskAssigneeRoles(readLocalJson<Task[]>(LOCAL_TASKS_KEY, INITIAL_TASKS), normalizeUserProfiles(MOCK_USERS));
    return rawTasks.map((t, idx) => ({
      ...t,
      campusId: t.campusId || (t.workspaceId === 'BGH' ? 'ALL' : (idx % 2 === 0 ? 'CAMPUS_HN' : 'CAMPUS_HCM'))
    }));
  });
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => readLocalJson<Workspace[]>(LOCAL_WORKSPACES_KEY, INITIAL_WORKSPACES));
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Stateful users directory
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = serverStorage.getItem('school_task_manager_users_profiles');
    if (saved) {
      try {
        // Try decrypting first; fallback to plain JSON for backward compatibility
        const decrypted = decryptData(saved);
        if (decrypted !== null) return normalizeUserProfiles(decrypted as UserProfile[]);
        return normalizeUserProfiles(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    const initUsers = MOCK_USERS.map((u, index) => {
      const enriched = enrichUserWithMIDetails(u);
      return normalizeUserProfile({
        ...enriched,
        cpdHours: u.id === 'user_nhan' ? 24 : u.id === 'user_nhung' ? 18 : u.id === 'user_dat' ? 12 : 8,
        cpdLog: [
          { id: 'cpd_1', title: 'Tập huấn Sư phạm Số & Tích hợp AI hỗ trợ soạn bài', hours: 4, date: '2026-05-12' },
          { id: 'cpd_2', title: 'Hội thảo Đổi mới Phương pháp Giáo dục liên môn', hours: 4, date: '2026-05-18' }
        ],
        kpiLocked: false
      }, index);
    });
    serverStorage.setItem('school_task_manager_users_profiles', encryptData(initUsers));
    return initUsers;
  });

  const saveUsers = (updatedUsers: UserProfile[]) => {
    const normalizedUsers = normalizeUserProfiles(updatedUsers);
    setUsers(normalizedUsers);
    serverStorage.setItem('school_task_manager_users_profiles', encryptData(normalizedUsers));
  };

  const [selectedStaffProfile, setSelectedStaffProfile] = useState<UserProfile | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'INFO' | 'MI' | 'KPI' | 'CPD'>('INFO');
  const [newCpdTitle, setNewCpdTitle] = useState('');
  const [newCpdHours, setNewCpdHours] = useState('4');
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return serverStorage.getItem('mis_edutask_logged_in') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUserId = serverStorage.getItem('mis_edutask_logged_in_user_id');
    const localUsersStr = serverStorage.getItem('school_task_manager_users_profiles');
    if (localUsersStr) {
      try {
        const decrypted = decryptData(localUsersStr);
        const parsed = normalizeUserProfiles((decrypted !== null ? decrypted : JSON.parse(localUsersStr)) as UserProfile[]);
        const matched = parsed.find(u => u.id === savedUserId);
        if (matched) return normalizeUserProfile(matched);
      } catch (e) {}
    }
    const matched = MOCK_USERS.find(u => u.id === savedUserId);
    return matched ? normalizeUserProfile(enrichUserWithMIDetails(matched)) : normalizeUserProfile(enrichUserWithMIDetails(MOCK_USERS[0]));
  });

  const displayCurrentUser = translateUser(currentUser, lang);

  const handleOnboardUser = (newStaff: { name: string; workspaceId: string; title: string; role: Role }) => {
    const roleName = newStaff.role === 'ADMIN' ? 'Ban Giám hiệu' : newStaff.role === 'MANAGER' ? 'Tổ trưởng Chuyên môn' : 'Giáo viên / Nhân viên';
    const newId = `user_${newStaff.name.toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}_${Date.now().toString().slice(-4)}`;
    const avatar = getSafeAvatar('', newStaff.name);
    
    const newUser: UserProfile = normalizeUserProfile({
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
    });

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
      toast.warning('Trình duyệt không hỗ trợ', 'Trình duyệt của bạn không hỗ trợ tính năng thông báo.');
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

  const [rbacConfig, setRbacConfig] = useState<RbacConfig>(() => readLocalJson<RbacConfig>(LOCAL_RBAC_KEY, DEFAULT_RBAC_CONFIG));
  const [userOverrides, setUserOverrides] = useState<Record<string, Partial<RolePermissions>>>(() => readLocalJson<Record<string, Partial<RolePermissions>>>(LOCAL_USER_OVERRIDES_KEY, {}));
  const [groupByDepartment, setGroupByDepartment] = useState<boolean>(true);

  const saveRbacConfig = async (updatedConfig: RbacConfig) => {
    setRbacConfig(updatedConfig);
    serverStorage.setItem('school_task_manager_rbac', encryptData(updatedConfig));
    try {
      await setDoc(doc(firestoreDb, 'config', 'rbac'), { config: updatedConfig });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'config/rbac');
    }
  };

  const saveUserOverrides = async (updatedOverrides: Record<string, Partial<RolePermissions>>) => {
    setUserOverrides(updatedOverrides);
    writeLocalJson(LOCAL_USER_OVERRIDES_KEY, updatedOverrides);
    try {
      await setDoc(doc(firestoreDb, 'config', 'user_overrides'), { overrides: updatedOverrides });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'config/user_overrides');
    }
  };

  useEffect(() => {
    const normalizedTasks = normalizeTaskAssigneeRoles(tasks, users);
    if (JSON.stringify(normalizedTasks) !== JSON.stringify(tasks)) {
      setTasks(normalizedTasks);
      writeLocalJson(LOCAL_TASKS_KEY, normalizedTasks);
    }
  }, [tasks, users]);

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

  const handleSelectViewOnMobile = (view: 'KANBAN' | 'CALENDAR' | 'LIST' | 'GANTT') => {
    setActiveView(view);
    setOverviewTab('TASKS');
    setIsSidebarOpen(false);
  };

  const handleSelectWorkspaceOnMobile = (wId: string) => {
    setSelectedWorkspace(wId);
    setIsSidebarOpen(false);
  };

  const canDisplayTab = (tab: any) => {
    return canDisplayTabWithWorkspace(tab, currentUser.role, currentUser.workspaceId);
  };

  const hasCapability = (capability: string, action: string = 'read', resourceOwnerId?: string) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    const ws = currentUser.workspaceId;

    if (role === 'ADMIN' || ws === 'BGH') return true;

    if (resourceOwnerId && currentUser.id === resourceOwnerId) {
      return true;
    }

    switch (capability) {
      case 'CRM_ADMISSIONS':
        return ws === 'TUYEN_SINH_PR';
      
      case 'PAYROLL':
      case 'ATTENDANCE':
      case 'SENSITIVE_PROFILE':
        return ws === 'HANH_CHINH';

      case 'LESSON_PLAN_APPROVAL':
        return role === 'MANAGER' && ws !== 'HANH_CHINH';

      case 'DEPARTMENT_HR':
        return role === 'MANAGER';

      default:
        return false;
    }
  };


  const appState = useAppState();
  const {
    searchQuery, setSearchQuery,
    sidebarSearchQuery, setSidebarSearchQuery,
    isCommandPaletteOpen, setIsCommandPaletteOpen,
    commandQuery, setCommandQuery,
    activeView, setActiveView,
    overviewTab, setOverviewTab,
    priorityFilter, setPriorityFilter,
    statusFilter, setStatusFilter,
    tagFilter, setTagFilter,
    isStatsCollapsed, setIsStatsCollapsed,
    isChartCollapsed, setIsChartCollapsed,
    isCompactView, setIsCompactView,
    deadlineFilter, setDeadlineFilter,
    aiSummary, setAiSummary,
    isSummarizing, setIsSummarizing,
    showSummaryModal, setShowSummaryModal,
    isSidebarOpen, setIsSidebarOpen,
    isGuideModalOpen, setIsGuideModalOpen,
    mobileActiveColumn, setMobileActiveColumn,
    selectedWorkspace, setSelectedWorkspace,
    mobileActiveWorkspace, setMobileActiveWorkspace,
    isRbacModalOpen, setIsRbacModalOpen,
    isSystemSettingsOpen, setIsSystemSettingsOpen,
    showPermissionsPopover, setShowPermissionsPopover,
    isNotificationsOpen, setIsNotificationsOpen,
    isActionCenterOpen, setIsActionCenterOpen,
    visiblePanels, setVisiblePanels, togglePanel,
    expandedBranches, setExpandedBranches, toggleBranch,
    expandedGroups, setExpandedGroups, toggleGroup
  } = appState;

  const admissionsDefaultAppliedRef = useRef(false);
  const [activeAdmissionsModule, setActiveAdmissionsModule] = useState<AdmissionsModule>('dashboard');

  useEffect(() => {
    if (!isLoggedIn || admissionsDefaultAppliedRef.current) return;
    if (currentUser.workspaceId === 'TUYEN_SINH_PR') {
      admissionsDefaultAppliedRef.current = true;
      setActiveAdmissionsModule('dashboard');
      setOverviewTab('CRM_ADMISSIONS');
    }
  }, [currentUser.workspaceId, isLoggedIn, setOverviewTab]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (overviewTab === 'CRM_ADMISSIONS' && currentUser.workspaceId !== 'TUYEN_SINH_PR') {
      setOverviewTab('DASHBOARD');
    }
  }, [currentUser.workspaceId, isLoggedIn, overviewTab, setOverviewTab]);

  useEffect(() => {
    if (!isLoggedIn || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const requestedTab = url.searchParams.get('tab') || serverStorage.getItem('mis_pending_overview_tab');
    if (requestedTab === 'CRM_ADMISSIONS') {
      serverStorage.removeItem('mis_pending_overview_tab');
      if (canRoleAccessTab(currentUser.role, currentUser.workspaceId, 'CRM_ADMISSIONS')) {
        setActiveAdmissionsModule('dashboard');
        setOverviewTab('CRM_ADMISSIONS');
      }
      if (url.searchParams.has('tab')) {
        url.searchParams.delete('tab');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
    }
  }, [currentUser.role, currentUser.workspaceId, isLoggedIn, setOverviewTab]);

  const tabLabels: Record<string, string> = {
    DASHBOARD: 'Bảng điều khiển Điều hành',
    BOARD_DIRECTIVES: 'Chỉ đạo BGH',
    ANALYTICS: 'Báo cáo & Phân tích',
    RISK_CENTER: 'Quản trị Rủi ro',
    STRATEGY_OKRS: 'Định hướng & OKRs',
    DOCUMENT: 'Quản lý Văn bản',
    TASKS: 'Nhiệm vụ & Dự án',
    WORKFLOW_APPROVALS: 'Quy trình & Phê duyệt',
    MEETING: 'Quản lý Cuộc họp',
    KNOWLEDGE: 'Kho Tri Thức',
    CRM_ADMISSIONS: 'Tuyển sinh & CRM',
    STUDENT_SUCCESS: 'Hồ sơ Học sinh 360°',
    PARENT_PORTAL: 'Cổng PHHS / Học sinh',
    HRM: 'Quản trị HRM',
    LMS: 'Hệ thống LMS',
    EVENTS: 'Quản lý Sự kiện',
    ACADEMIC_OPS: 'Thời khóa biểu tổng & Giáo án',
    LOGISTICS: 'Thư viện & Thiết bị',
    REQUESTS: 'Yêu cầu & Dịch vụ',
    GOOGLE_SHEETS: 'Đồng bộ Sheets'
  };

  const matchesSearch = (tabId: string) => {
    if (!sidebarSearchQuery) return true;
    const label = tabLabels[tabId] || '';
    return label.toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  };

  const hasVisibleStrategy = 
    (canDisplayTab('DASHBOARD') && matchesSearch('DASHBOARD')) ||
    (canDisplayTab('BOARD_DIRECTIVES') && matchesSearch('BOARD_DIRECTIVES')) ||
    (canDisplayTab('ANALYTICS') && matchesSearch('ANALYTICS')) ||
    (canDisplayTab('RISK_CENTER') && matchesSearch('RISK_CENTER'));

  const hasVisibleOperation = 
    (canDisplayTab('TASKS') && matchesSearch('TASKS')) ||
    (canDisplayTab('WORKFLOW_APPROVALS') && matchesSearch('WORKFLOW_APPROVALS')) ||
    (canDisplayTab('MEETING') && matchesSearch('MEETING')) ||
    (canDisplayTab('KNOWLEDGE') && matchesSearch('KNOWLEDGE'));

  const hasVisibleFoundation = 
    (canDisplayTab('STRATEGY_OKRS') && matchesSearch('STRATEGY_OKRS')) ||
    (canDisplayTab('DOCUMENT') && matchesSearch('DOCUMENT'));

  const hasVisibleBusiness = 
    (canDisplayTab('CRM_ADMISSIONS') && matchesSearch('CRM_ADMISSIONS')) ||
    (canDisplayTab('STUDENT_SUCCESS') && matchesSearch('STUDENT_SUCCESS')) ||
    (canDisplayTab('PARENT_PORTAL') && matchesSearch('PARENT_PORTAL')) ||
    (canDisplayTab('HRM') && matchesSearch('HRM')) ||
    (canDisplayTab('LMS') && matchesSearch('LMS'));

  const hasVisibleCampus = 
    (canDisplayTab('HRM') && matchesSearch('HRM')) ||
    (canDisplayTab('EVENTS') && matchesSearch('EVENTS')) ||
    (canDisplayTab('ACADEMIC_OPS') && matchesSearch('ACADEMIC_OPS')) ||
    (canDisplayTab('LMS') && matchesSearch('LMS'));

  const hasVisibleSystem =
    currentUser.role === 'ADMIN' ||
    (canDisplayTab('LOGISTICS') && matchesSearch('LOGISTICS')) ||
    (canDisplayTab('REQUESTS') && matchesSearch('REQUESTS'));

  const isGroupOpen = (groupKey: 'strategy' | 'operation' | 'foundation' | 'business' | 'campus' | 'system') => {
    if (sidebarSearchQuery) return true;
    return expandedGroups[groupKey];
  };

  // Modal control states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [activeStatsTaskType, setActiveStatsTaskType] = useState<'COMPLETED' | 'PENDING' | 'IN_PROGRESS' | 'OVERDUE' | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [directives, setDirectives] = useState<BoardDirective[]>(() => readLocalJson<BoardDirective[]>(LOCAL_DIRECTIVES_KEY, INITIAL_DIRECTIVES));

  const saveAnnouncements = (updated: Announcement[]) => {
    setAnnouncements(updated);
    serverStorage.setItem('school_task_manager_announcements', encryptData(updated));
  };

  const saveDirectives = (updated: BoardDirective[]) => {
    setDirectives(updated);
    serverStorage.setItem('school_task_manager_directives', encryptData(updated));
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
    const unsub = onSnapshot(collection(firestoreDb, 'workspaces'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const w of INITIAL_WORKSPACES) {
            await setDoc(doc(firestoreDb, 'workspaces', w.id), w);
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
        writeLocalJson(LOCAL_WORKSPACES_KEY, loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'workspaces');
    });
    return () => unsub();
  }, [isAuthReady]);

  // Syncing tasks
  useEffect(() => {
    if (!isAuthReady) return;
    const unsub = onSnapshot(collection(firestoreDb, 'tasks'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const t of INITIAL_TASKS) {
            await setDoc(doc(firestoreDb, 'tasks', t.id), t);
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

        const normalizedLoaded = normalizeTaskAssigneeRoles(loaded, users);
        prevTasksRef.current = normalizedLoaded;
        isFirstLoadRef.current = false;
        setTasks(normalizedLoaded);
        writeLocalJson(LOCAL_TASKS_KEY, normalizedLoaded);

        // Auto seed any missing standard/demo mock tasks directly to keep the system visually rich with all 50+ tasks
        if (loaded.length < 48) {
          try {
            for (const t of INITIAL_TASKS) {
              const alreadyExists = loaded.some(l => l.id === t.id);
              if (!alreadyExists) {
                await setDoc(doc(firestoreDb, 'tasks', t.id), t);
              }
            }
          } catch (err) {
            console.error("Auto seeding of missing mock tasks failed:", err);
          }
        } else if (!hasDemo1 || !hasDemo2) {
          const d1 = INITIAL_TASKS.find(t => t.id === 'task_demo_minh_1');
          const d2 = INITIAL_TASKS.find(t => t.id === 'task_demo_minh_2');
          try {
            if (!hasDemo1 && d1) await setDoc(doc(firestoreDb, 'tasks', 'task_demo_minh_1'), d1);
            if (!hasDemo2 && d2) await setDoc(doc(firestoreDb, 'tasks', 'task_demo_minh_2'), d2);
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
    const unsub = onSnapshot(collection(firestoreDb, 'directives'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const d of INITIAL_DIRECTIVES) {
            await setDoc(doc(firestoreDb, 'directives', d.id), d);
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
        writeLocalJson(LOCAL_DIRECTIVES_KEY, loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'directives');
    });
    return () => unsub();
  }, [isAuthReady]);

  // Syncing rbacConfig
  useEffect(() => {
    if (!isAuthReady) return;
    const unsub = onSnapshot(doc(firestoreDb, 'config', 'rbac'), async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(doc(firestoreDb, 'config', 'rbac'), { config: rbacConfig });
        } catch (err) {
          console.error("Error seeding RBAC config to Firestore:", err);
        }
      } else {
        const rbacDoc = snapshot.data();
        if (rbacDoc && rbacDoc.config) {
          setRbacConfig(rbacDoc.config as RbacConfig);
          writeLocalJson(LOCAL_RBAC_KEY, rbacDoc.config as RbacConfig);
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
    const unsub = onSnapshot(doc(firestoreDb, 'config', 'user_overrides'), async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(doc(firestoreDb, 'config', 'user_overrides'), { overrides: {} });
        } catch (err) {
          console.error("Error seeding User Overrides to Firestore:", err);
        }
      } else {
        const docData = snapshot.data();
        if (docData && docData.overrides) {
          setUserOverrides(docData.overrides);
          writeLocalJson(LOCAL_USER_OVERRIDES_KEY, docData.overrides);
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

  // Automated Email Reminders for Overdue & Near-Deadline Tasks
  useEffect(() => {
    if (!isAuthReady || tasks.length === 0) return;

    let cancelled = false;

    const runReminderBatch = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch('/api/email/run-deadline-reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id,
          },
          body: JSON.stringify({
            tasks,
            users: [...MOCK_USERS, ...users],
            nearDeadlineDays: 2,
            registerSource: true,
          }),
        });

        if (!res.ok) {
          console.error('[Auto-Reminder] Failed to run deadline reminder batch.');
          return;
        }

        const data = await res.json();
        if (cancelled || !Array.isArray(data.sent) || data.sent.length === 0) return;

        await Promise.all(data.sent.map(async (item: { taskId: string; type: 'OVERDUE' | 'NEAR_DEADLINE'; reminderDate: string }) => {
          const task = tasks.find(t => t.id === item.taskId);
          if (!task) return;

          const updatedTask = {
            ...task,
            [item.type === 'OVERDUE' ? 'overdueReminderSent' : 'nearDeadlineReminderSent']: true,
            [item.type === 'OVERDUE' ? 'lastOverdueReminderDate' : 'lastNearDeadlineReminderDate']: item.reminderDate,
          };
          persistTaskLocally(updatedTask);
          await setDoc(doc(firestoreDb, 'tasks', task.id), updatedTask);
        }));

        console.log(`[Auto-Reminder] Updated ${data.sent.length} reminder flag(s) in Firestore.`);
      } catch (err) {
        console.error('[Auto-Reminder] Error running reminder batch:', err);
      }
    };

    runReminderBatch();

    return () => {
      cancelled = true;
    };
  }, [isAuthReady, tasks, users]);

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
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
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
    persistDirectiveLocally(newDir);
    try {
      await setDoc(doc(firestoreDb, 'directives', newDirId), newDir);
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
    persistDirectiveLocally(updatedDir);
    try {
      await setDoc(doc(firestoreDb, 'directives', directiveId), updatedDir);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `directives/${directiveId}`);
    }
  };

  const handleDeleteDirective = async (id: string) => {
    removeDirectiveLocally(id);
    try {
      await deleteDoc(doc(firestoreDb, 'directives', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `directives/${id}`);
    }
  };

  const saveWorkspaces = async (updatedWorkspaces: Workspace[]) => {
    setWorkspaces(updatedWorkspaces);
    serverStorage.setItem('school_task_manager_workspaces', JSON.stringify(updatedWorkspaces));
    try {
      for (const w of updatedWorkspaces) {
        await setDoc(doc(firestoreDb, 'workspaces', w.id), w);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'workspaces');
    }
  };

  // Switch workspace restriction based on roles if they have a constrained scope
  const handleUserSwitch = (user: UserProfile) => {
    const normalizedUser = normalizeUserProfile(user);
    setCurrentUser(normalizedUser);
    serverStorage.setItem('mis_edutask_logged_in_user_id', user.id);
    serverStorage.setItem('mis_edutask_logged_in', 'true');
    // If the selected user belongs to a specific department and is NOT Admin, filter that department initially
    if (normalizedUser.role !== 'ADMIN') {
      setSelectedWorkspace(normalizedUser.workspaceId);
    } else {
      setSelectedWorkspace('ALL');
    }
    if (normalizedUser.workspaceId === 'TUYEN_SINH_PR') {
      setActiveAdmissionsModule('dashboard');
      setOverviewTab('CRM_ADMISSIONS');
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

  const persistTasksLocally = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    writeLocalJson(LOCAL_TASKS_KEY, updatedTasks);
  };

  const persistTaskLocally = (updatedTask: Task) => {
    const updatedTasks = tasks.some(t => t.id === updatedTask.id)
      ? tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      : [updatedTask, ...tasks];
    persistTasksLocally(updatedTasks);
  };

  const removeTaskLocally = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    persistTasksLocally(updatedTasks);
  };

  const persistDirectiveLocally = (updatedDirective: BoardDirective) => {
    const updatedDirectives = directives.some(d => d.id === updatedDirective.id)
      ? directives.map(d => d.id === updatedDirective.id ? updatedDirective : d)
      : [updatedDirective, ...directives];
    setDirectives(updatedDirectives);
    writeLocalJson(LOCAL_DIRECTIVES_KEY, updatedDirectives);
  };

  const removeDirectiveLocally = (directiveId: string) => {
    const updatedDirectives = directives.filter(d => d.id !== directiveId);
    setDirectives(updatedDirectives);
    writeLocalJson(LOCAL_DIRECTIVES_KEY, updatedDirectives);
  };

  const handleSyncComplete = async (syncedTasks: Task[]) => {
    persistTasksLocally(syncedTasks);
    try {
      for (const t of syncedTasks) {
        await setDoc(doc(firestoreDb, 'tasks', t.id), t);
      }
    } catch (e) {
      console.error("Error syncing tasks from Google Sheets:", e);
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

  const taskHandlers = useTaskHandlers({
    tasks,
    setTasks,
    currentUser,
    displayCurrentUser,
    hasPermission,
    toast,
    setSelectedTaskForDetail,
    selectedTaskForDetail,
    setIsCreateModalOpen,
    writeLocalJson,
    LOCAL_TASKS_KEY,
    getStatusLabel,
  });

  const {
    handleCreateTask,
    handleUpdateStatus,
    handleRejectTask,
    handleDeleteTask,
    handleUpdateTask,
    handleAddComment
  } = taskHandlers;

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

  // Dynamically assign campusId to tasks and filter based on selectedCampus
  const roleFilteredTasks = getTasksByRoleLimit().map((t, idx) => {
    const tCampusId = t.workspaceId === 'BGH' ? 'ALL' : (t.campusId || (idx % 2 === 0 ? 'CAMPUS_HN' : 'CAMPUS_HCM'));
    return { ...translateTask(t, lang), campusId: tCampusId };
  }).filter(t => {
    if (selectedCampus === 'ALL') return true;
    if (t.campusId === 'ALL') return true;
    return t.campusId === selectedCampus;
  });

  // Dynamically assign campusId to users and filter based on selectedCampus
  const campusFilteredUsers = users.map((u, idx) => {
    const uCampusId = u.id === 'user_chutich' || u.id === 'user_ceo' || u.id === 'user_triet'
      ? 'ALL'
      : (u.campusId || (idx % 2 === 0 ? 'CAMPUS_HN' : 'CAMPUS_HCM'));
    return { ...u, campusId: uCampusId };
  }).filter(u => {
    if (selectedCampus === 'ALL') return true;
    if (u.campusId === 'ALL') return true;
    return u.campusId === selectedCampus;
  });

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
    { id: 'DASHBOARD', label: 'Tổng quan điều hành', description: 'Bảng điều khiển, thống kê, hiệu suất', tab: 'DASHBOARD' as const, icon: Layout },
    { id: 'TASKS', label: 'Quản lý công việc', description: 'Kanban, lịch biểu, danh sách việc', tab: 'TASKS' as const, icon: ListTodo },
    { id: 'STRATEGY_OKRS', label: 'OKRs chiến lược', description: 'Mục tiêu, KPI, kết quả then chốt', tab: 'STRATEGY_OKRS' as const, icon: TrendingUp },
    { id: 'WORKFLOW_APPROVALS', label: 'Phê duyệt quy trình', description: 'Hồ sơ, luồng duyệt, nhật ký', tab: 'WORKFLOW_APPROVALS' as const, icon: FileCheck },
    { id: 'CRM_ADMISSIONS', label: 'CRM tuyển sinh', description: 'Phụ huynh, học sinh, chăm sóc', tab: 'CRM_ADMISSIONS' as const, icon: Users },
    { id: 'PARENT_PORTAL', label: 'Cổng PHHS/Học sinh', description: 'Điểm, chuyên cần, học phí, thời khóa biểu, thư viện', tab: 'PARENT_PORTAL' as const, icon: Smartphone },
    { id: 'ACADEMIC_OPS', label: 'Thời khóa biểu tổng', description: 'Lịch dạy tuần, giáo án, phân công giáo viên', tab: 'ACADEMIC_OPS' as const, icon: CalendarDays },
    { id: 'LOGISTICS', label: 'Thư viện & Thiết bị', description: 'Sách, thiết bị, mượn trả, kiểm kê', tab: 'LOGISTICS' as const, icon: BookOpen },
    { id: 'TEACHER_HR', label: 'Nhân sự giáo viên', description: 'Danh bạ, KPI, nghỉ phép', tab: 'TEACHER_HR' as const, icon: UserCheck },
    { id: 'RISK_CENTER', label: 'Quản trị rủi ro', description: 'Cảnh báo, giám sát, xử lý', tab: 'RISK_CENTER' as const, icon: AlertCircle },
    { id: 'ANALYTICS', label: 'Báo cáo phân tích', description: 'Báo cáo, biểu đồ, truy vấn', tab: 'ANALYTICS' as const, icon: FileSpreadsheet }
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
          const normalizedUser = normalizeUserProfile(user);
          setCurrentUser(normalizedUser);
          setIsLoggedIn(true);
          serverStorage.setItem('mis_edutask_logged_in', 'true');
          serverStorage.setItem('mis_edutask_logged_in_user_id', user.id);
          if (normalizedUser.role !== 'ADMIN') {
            setSelectedWorkspace(normalizedUser.workspaceId);
          } else {
            setSelectedWorkspace('ALL');
          }
          if (normalizedUser.workspaceId === 'TUYEN_SINH_PR') {
            setActiveAdmissionsModule('dashboard');
            setOverviewTab('CRM_ADMISSIONS');
          }
        }}
      />
    );
  }

  if (currentUser && (currentUser.role === 'PARENT' || currentUser.role === 'STUDENT')) {
    return (
      <ParentStudentPortal 
        currentUser={currentUser} 
        onLogout={() => {
          setIsLoggedIn(false);
          serverStorage.removeItem('mis_edutask_logged_in');
          serverStorage.removeItem('mis_edutask_logged_in_user_id');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-all">
      
      <AppHeader
        currentUser={currentUser}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openCommandPalette={openCommandPalette}
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        notificationPermission={notificationPermission}
        requestNotificationPermission={requestNotificationPermission}
        workspaces={workspaces}
        users={users}
        handleUserSwitch={handleUserSwitch}
        getSafeAvatar={getSafeAvatar}
        onLogout={() => {
          setIsLoggedIn(false);
          serverStorage.removeItem('mis_edutask_logged_in');
          serverStorage.removeItem('mis_edutask_logged_in_user_id');
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenActionCenter={() => setIsActionCenterOpen(true)}
        actionItemsCount={
          roleFilteredTasks.filter(t => t.status === 'CHO_DUYET').length +
          roleFilteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < new Date().toISOString().split('T')[0]).length
        }
      />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        sidebarSearchQuery={sidebarSearchQuery}
        setSidebarSearchQuery={setSidebarSearchQuery}
        overviewTab={overviewTab}
        setOverviewTab={setOverviewTab}
        activeAdmissionsModule={activeAdmissionsModule}
        setActiveAdmissionsModule={setActiveAdmissionsModule}
        completionRate={completionRate}
        isGroupOpen={isGroupOpen}
        toggleGroup={toggleGroup}
        canDisplayTab={canDisplayTab}
        matchesSearch={matchesSearch}
        hasVisibleStrategy={hasVisibleStrategy}
        hasVisibleOperation={hasVisibleOperation}
        hasVisibleFoundation={hasVisibleFoundation}
        hasVisibleBusiness={hasVisibleBusiness}
        hasVisibleCampus={hasVisibleCampus}
        hasVisibleSystem={hasVisibleSystem}
        handleSelectViewOnMobile={handleSelectViewOnMobile}
        openSystemSettings={() => setIsSystemSettingsOpen(true)}
        openRbacSettings={() => setIsRbacModalOpen(true)}
      />
      
        {/* Main Content Area on the Right */}
        <main id="main-content" className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto bg-slate-50 min-h-0">

          {/* Context Bar – gọn nhẹ, thay thế Welcome Banner cũ (không còn chiếm 100px) */}
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-3 shadow-sm">
            {/* Left: Avatar + tên + role */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={getSafeAvatar(currentUser.avatar, displayCurrentUser.name)}
                  alt={displayCurrentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 bg-emerald-500" aria-label="Đang trực tuyến" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayCurrentUser.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg uppercase font-mono tracking-wider shrink-0">
                    {displayCurrentUser.roleName}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{displayCurrentUser.title}</span>
              </div>
            </div>

            {/* Right: Quick stats + Admin actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {/* Số liệu nhanh */}
              <div className="hidden sm:flex items-center gap-3 border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl px-3 py-1.5 text-xs">
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block font-mono">Chỉ đạo</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block leading-none">{roleFilteredTasks.length}</span>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block font-mono">Chờ duyệt</span>
                  <span className="text-sm font-black text-amber-500 block leading-none">
                    {roleFilteredTasks.filter(t => t.status === 'CHO_DUYET').length}
                  </span>
                </div>
              </div>

              {/* Admin buttons */}
              {currentUser.role === 'ADMIN' && (
                <>
                  <button
                    id="btn-nav-rbac-settings"
                    onClick={() => setIsRbacModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg shadow-3xs transition-all cursor-pointer"
                    title="Thiết lập phân quyền thành viên"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden md:inline">Phân quyền (RBAC)</span>
                  </button>
                  <button
                    id="btn-system-settings"
                    onClick={() => setIsSystemSettingsOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg shadow-3xs transition-all cursor-pointer"
                    title="Cài đặt SMTP, AI và Zalo OA Broadcast"
                  >
                    <Settings className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden md:inline">Cài đặt</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Redesigned Executive Dashboard View */}
          {overviewTab === 'DASHBOARD' && (
            <ExecutiveDashboard
              tasks={roleFilteredTasks}
              workspaces={workspaces}
              users={campusFilteredUsers}
              directives={directives}
              currentUser={currentUser}
              onViewDetails={setSelectedTaskForDetail}
              onUpdateStatus={handleUpdateStatus}
              onSelectWorkspace={(wId) => {
                setSelectedWorkspace(wId);
                setOverviewTab('TASKS');
              }}
              onShowTaskList={(type) => {
                setSelectedWorkspace('ALL');
                setActiveStatsTaskType(type);
              }}
              selectedCampus={selectedCampus}
            />
          )}

          {overviewTab === 'STRATEGY_OKRS' && (
            <IntelligenceAndOkrHub 
              tasks={tasks}
              users={campusFilteredUsers}
              currentUser={currentUser}
              onAddTask={handleCreateTask}
            />
          )}

          {overviewTab === 'WORKFLOW_APPROVALS' && (
            <WorkflowBuilder />
          )}

          {overviewTab === 'CRM_ADMISSIONS' && currentUser.workspaceId === 'TUYEN_SINH_PR' && (
            <AdmissionsEnterpriseDashboard activeModule={activeAdmissionsModule} />
          )}

          {overviewTab === 'STUDENT_SUCCESS' && (
            <StudentSuccessHub currentUser={currentUser} />
          )}

          {overviewTab === 'PARENT_PORTAL' && (
            <ParentStudentPortal
              currentUser={
                currentUser.role === 'PARENT' || currentUser.role === 'STUDENT'
                  ? currentUser
                  : {
                      ...currentUser,
                      role: 'PARENT' as Role,
                      roleName: 'Phụ huynh học sinh',
                      title: 'Tài khoản xem thử cổng PHHS',
                      parentEmail: 'parent.1@parent.mis.edu.vn',
                    }
              }
              onLogout={() => setOverviewTab('DASHBOARD')}
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
              users={campusFilteredUsers} 
              onNavigateTab={(tab) => setOverviewTab(tab as typeof overviewTab)}
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
              users={campusFilteredUsers} 
              onUpdateUsers={saveUsers} 
              hasCapability={hasCapability}
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
                    onShowTaskList={(type) => setActiveStatsTaskType(type)}
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
                  id="btn-switch-gantt"
                  onClick={() => setActiveView('GANTT')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeView === 'GANTT'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Milestone className="w-3.5 h-3.5" />
                  <span>Gantt</span>
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

          {finalFilteredTasks.length > 0 && activeView === 'GANTT' && (
            <div id="view-gantt-board" className="animate-fade-in">
              <ProjectGanttView
                tasks={finalFilteredTasks}
                workspaces={visibleWorkspaces}
                onViewDetails={setSelectedTaskForDetail}
              />
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
          allTasks={tasks}
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

      {/* Task List Modal Overlay from stats cards */}
      {activeStatsTaskType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="stats-task-list-modal-overlay">
          {/* Backdrop absolute underlay */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveStatsTaskType(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-up z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-800 dark:text-white font-extrabold text-sm font-sans flex items-center gap-2">
                <span>
                  {activeStatsTaskType === 'COMPLETED' && 'Danh sách công việc đã hoàn thành'}
                  {activeStatsTaskType === 'PENDING' && 'Danh sách công việc đang chờ duyệt'}
                  {activeStatsTaskType === 'IN_PROGRESS' && 'Danh sách công việc đang tiến hành'}
                  {activeStatsTaskType === 'OVERDUE' && 'Danh sách công việc trễ hạn'}
                </span>
                <span className="text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (activeStatsTaskType === 'COMPLETED') return workspaceFilteredTasks.filter(t => t.status === 'HOAN_THANH').length;
                    if (activeStatsTaskType === 'PENDING') return workspaceFilteredTasks.filter(t => t.status === 'CHO_DUYET').length;
                    if (activeStatsTaskType === 'IN_PROGRESS') return workspaceFilteredTasks.filter(t => t.status === 'DANG_TIEN_HANH' || t.status === 'CHUA_BAT_DA').length;
                    if (activeStatsTaskType === 'OVERDUE') return workspaceFilteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).length;
                    return 0;
                  })()}
                </span>
              </span>
              <button 
                onClick={() => setActiveStatsTaskType(null)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 space-y-3 flex-1">
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const list = (() => {
                  if (activeStatsTaskType === 'COMPLETED') return workspaceFilteredTasks.filter(t => t.status === 'HOAN_THANH');
                  if (activeStatsTaskType === 'PENDING') return workspaceFilteredTasks.filter(t => t.status === 'CHO_DUYET');
                  if (activeStatsTaskType === 'IN_PROGRESS') return workspaceFilteredTasks.filter(t => t.status === 'DANG_TIEN_HANH' || t.status === 'CHUA_BAT_DA');
                  if (activeStatsTaskType === 'OVERDUE') return workspaceFilteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr);
                  return [];
                })();

                const getTaskProgress = (task: Task) => {
                  if (task.checklist && task.checklist.length > 0) {
                    const done = task.checklist.filter(item => item.done).length;
                    return Math.round((done / task.checklist.length) * 100);
                  }
                  if (task.status === 'HOAN_THANH') return 100;
                  if (task.status === 'CHO_DUYET') return 85;
                  if (task.status === 'DANG_TIEN_HANH') return 50;
                  return 0;
                };

                if (list.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-450 dark:text-slate-500 text-xs">
                      Không có công việc nào trong danh mục này.
                    </div>
                  );
                }

                return list.map(task => {
                  const progress = getTaskProgress(task);
                  
                  let progressBg = 'bg-indigo-600';
                  let progressText = 'text-indigo-600 dark:text-indigo-400';
                  if (activeStatsTaskType === 'COMPLETED') {
                    progressBg = 'bg-emerald-500';
                    progressText = 'text-emerald-600 dark:text-emerald-400';
                  } else if (activeStatsTaskType === 'OVERDUE') {
                    progressBg = 'bg-rose-500';
                    progressText = 'text-rose-600 dark:text-rose-400';
                  } else if (activeStatsTaskType === 'PENDING') {
                    progressBg = 'bg-amber-500';
                    progressText = 'text-amber-600 dark:text-amber-400';
                  } else if (activeStatsTaskType === 'IN_PROGRESS') {
                    progressBg = 'bg-sky-500';
                    progressText = 'text-sky-600 dark:text-sky-400';
                  }

                  return (
                    <div 
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskForDetail(task);
                        setActiveStatsTaskType(null);
                      }}
                      className="group border border-slate-150 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/35 hover:scale-[1.01] transition-all shadow-3xs"
                    >
                      <div className="flex-1 pr-4">
                        <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {task.title}
                        </h4>
                        <div className="text-[10.5px] text-slate-450 dark:text-slate-500 mt-1 font-sans">
                          Phụ trách: <span className="font-semibold text-slate-600 dark:text-slate-400">{task.assignedName}</span>
                          {task.deadline && (
                            <>
                              <span className="mx-1.5 text-slate-300">|</span>
                              <span>Hạn chót: <span className="font-semibold text-rose-600 dark:text-rose-400">{task.deadline}</span></span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1.5">
                        <span className={`text-xs font-mono font-bold ${progressText}`}>
                          {progress}%
                        </span>
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden p-0">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${progressBg}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {isRbacModalOpen && (
        <RbacSettingsModal
          onClose={() => setIsRbacModalOpen(false)}
          config={rbacConfig}
          onSaveConfig={saveRbacConfig}
        />
      )}

      {isSystemSettingsOpen && (
        <SystemSettingsModal
          onClose={() => setIsSystemSettingsOpen(false)}
          currentUserId={currentUser?.id}
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
                      <span className="text-slate-400 block font-medium">Mã số nhân sự</span>
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
                      Ban Giám hiệu và quản trị viên có thể đăng nhập thử vai nhân sự này để trải nghiệm và rà soát tiến trình nhiệm vụ, OKRs riêng của tổ chuyên môn dưới góc nhìn của họ.
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
                                      : t.status === 'DANG_TIEN_HANH' 
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
                              toast.warning('Thiếu thông tin', 'Vui lòng nhập tên cuộc tập huấn hội thảo bồi dưỡng chuyên môn.');
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
                toast.warning('Thiếu thông tin', 'Vui lòng hoàn tất điền đủ thông tin nhân sự!');
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
                className="text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 block font-bold">Họ và tên nhân sự mới:</label>
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

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        currentUser={currentUser}
        tasks={roleFilteredTasks}
        users={displayUsers}
        workspaces={visibleWorkspaces}
        onOpenSection={openOverviewSection}
        onOpenTask={openTaskFromCommand}
        onOpenWorkspace={openWorkspaceFromCommand}
        onOpenUser={openUserFromCommand}
        onSearchQuerySubmit={(query) => {
          setSearchQuery(query);
          setOverviewTab('TASKS');
        }}
        getSafeAvatar={getSafeAvatar}
        getStatusLabel={getStatusLabel}
      />

      

      {/* Quick Guide Overlay Modal */}
      <GuideModal 
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        announcements={announcements}
        directives={directives}
        tasks={tasks}
        currentUser={currentUser}
        onViewTask={(task) => {
          setSelectedTaskForDetail(task);
          setIsNotificationsOpen(false);
        }}
        onViewDirective={(directive) => {
          setOverviewTab('BOARD_DIRECTIVES');
          setIsNotificationsOpen(false);
        }}
      />

      {/* Action Center Drawer */}
      <ActionCenterDrawer
        isOpen={isActionCenterOpen}
        onClose={() => setIsActionCenterOpen(false)}
        actionItems={(() => {
          const items = [];
          const todayStr = new Date().toISOString().split('T')[0];
          
          // Chờ duyệt
          if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
            roleFilteredTasks.filter(t => t.status === 'CHO_DUYET').forEach(t => {
              items.push({
                id: `approve-${t.id}`,
                type: 'duyệt',
                title: `Nghiệm thu chỉ đạo: ${t.title}`,
                sub: `Người nộp: ${t.assignedName} • Phòng: ${t.workspaceId}`,
                originalTask: t
              });
            });
          }
          
          // Trễ hạn
          roleFilteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline < todayStr).slice(0, 5).forEach(t => {
            items.push({
              id: `overdue-${t.id}`,
              type: 'quá_hạn',
              title: `Trễ hạn: ${t.title}`,
              sub: `Hạn xử lý: ${t.deadline} • Người phụ trách: ${t.assignedName}`,
              originalTask: t
            });
          });
          
          // Hạn hôm nay
          roleFilteredTasks.filter(t => t.status !== 'HOAN_THANH' && t.deadline === todayStr).forEach(t => {
            items.push({
              id: `due-${t.id}`,
              type: 'hạn_chót',
              title: `Đến hạn hôm nay: ${t.title}`,
              sub: `Phụ trách: ${t.assignedName}`,
              originalTask: t
            });
          });
          
          // Chỉ đạo khẩn
          directives.slice(0, 2).forEach(d => {
            items.push({
              id: `dir-${d.id}`,
              type: 'chỉ_thị',
              title: `Chỉ đạo BGH: ${d.title}`,
              sub: `Người giao: ${d.senderName}`,
              originalDirective: d
            });
          });
          
          return items;
        })()}
        onActionClick={(item) => {
          if (item.originalTask) {
            setSelectedTaskForDetail(item.originalTask);
            setIsActionCenterOpen(false);
          } else if (item.originalDirective) {
            setOverviewTab('BOARD_DIRECTIVES');
            setIsActionCenterOpen(false);
          }
        }}
      />

      {/* Floating Action Button (FAB) */}
      <FloatingActionButton
        currentUser={currentUser}
        onCreateTask={() => setIsCreateModalOpen(true)}
        onCreateDirective={() => {
          setOverviewTab('BOARD_DIRECTIVES');
        }}
        onCreateMeeting={() => {
          setOverviewTab('MEETING');
        }}
        onCreateDocument={() => {
          setOverviewTab('DOCUMENT');
        }}
        onOpenHelp={() => setIsGuideModalOpen(true)}
      />

    </div>
  );
}

// ─── Root Export: bao bọ ToastProvider để useToast hoạt động khắp ứng dụng ───
export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
