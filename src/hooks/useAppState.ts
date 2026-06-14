import { useState } from 'react';
import { TaskStatus } from '../types';

export function useAppState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [activeView, setActiveView] = useState<'KANBAN' | 'CALENDAR' | 'LIST' | 'GANTT'>('KANBAN');
  const [overviewTab, setOverviewTab] = useState<'DASHBOARD' | 'STRATEGY_OKRS' | 'TASKS' | 'WORKFLOW_APPROVALS' | 'CRM_ADMISSIONS' | 'STUDENT_SUCCESS' | 'PARENT_PORTAL' | 'TEACHER_HR' | 'RISK_CENTER' | 'ANALYTICS' | 'BOARD_DIRECTIVES' | 'ACADEMIC_OPS' | 'LOGISTICS' | 'REQUESTS' | 'HRM' | 'LMS' | 'GOOGLE_SHEETS' | 'DOCUMENT' | 'MEETING' | 'KNOWLEDGE' | 'EVENTS'>('DASHBOARD');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<TaskStatus>('DANG_TIEN_HANH');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('ALL');
  const [mobileActiveWorkspace, setMobileActiveWorkspace] = useState<string>('');
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  const [showPermissionsPopover, setShowPermissionsPopover] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);

  const [visiblePanels, setVisiblePanels] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mis_visible_panels');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('mis_visible_panels', JSON.stringify(updated));
      }
      return updated;
    });
  };

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

  return {
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
  };
}
