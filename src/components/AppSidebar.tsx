'use client';

import React from 'react';
import { 
  X, Search, ChevronDown, Layout, Megaphone, FileSpreadsheet, AlertCircle, 
  ListTodo, FileCheck, CalendarDays, BookOpen, Layers, FileText, 
  SlidersHorizontal, Users, Smartphone, UserCheck, Laptop, Sparkles, 
  GraduationCap, Briefcase, RefreshCw 
} from 'lucide-react';

interface AppSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  sidebarSearchQuery: string;
  setSidebarSearchQuery: (val: string) => void;
  overviewTab: string;
  setOverviewTab: (val: string) => void;
  completionRate: number;
  isGroupOpen: (group: string) => boolean;
  toggleGroup: (group: string) => void;
  canDisplayTab: (tabId: string) => boolean;
  matchesSearch: (tabId: string) => boolean;
  hasVisibleStrategy: boolean;
  hasVisibleOperation: boolean;
  hasVisibleFoundation: boolean;
  hasVisibleBusiness: boolean;
  hasVisibleCampus: boolean;
  handleSelectViewOnMobile: (view: string) => void;
}

export default function AppSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  sidebarSearchQuery,
  setSidebarSearchQuery,
  overviewTab,
  setOverviewTab,
  completionRate,
  isGroupOpen,
  toggleGroup,
  canDisplayTab,
  matchesSearch,
  hasVisibleStrategy,
  hasVisibleOperation,
  hasVisibleFoundation,
  hasVisibleBusiness,
  hasVisibleCampus,
  handleSelectViewOnMobile,
}: AppSidebarProps) {

  const groupHeaderClass = (groupName: string) => {
    const isOpen = isGroupOpen(groupName);
    let colorHover = '';
    let colorActive = '';
    let bgDot = '';
    
    if (groupName === 'strategy') {
      colorHover = 'hover:text-rose-600 dark:hover:text-rose-400';
      colorActive = isOpen ? 'text-rose-600 dark:text-rose-400 font-extrabold' : '';
      bgDot = 'bg-rose-500';
    } else if (groupName === 'operation') {
      colorHover = 'hover:text-violet-600 dark:hover:text-violet-400';
      colorActive = isOpen ? 'text-violet-600 dark:text-violet-400 font-extrabold' : '';
      bgDot = 'bg-violet-500';
    } else if (groupName === 'foundation') {
      colorHover = 'hover:text-indigo-600 dark:hover:text-indigo-400';
      colorActive = isOpen ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : '';
      bgDot = 'bg-indigo-500';
    } else if (groupName === 'business') {
      colorHover = 'hover:text-emerald-600 dark:hover:text-emerald-400';
      colorActive = isOpen ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : '';
      bgDot = 'bg-emerald-500';
    } else if (groupName === 'campus') {
      colorHover = 'hover:text-sky-600 dark:hover:text-sky-400';
      colorActive = isOpen ? 'text-sky-600 dark:text-sky-400 font-extrabold' : '';
      bgDot = 'bg-sky-500';
    }
    
    return { colorHover, colorActive, bgDot };
  };

  const getTabClass = (tabId: string, baseGroup: 'strategy' | 'operation' | 'foundation' | 'business' | 'campus') => {
    const isActive = overviewTab === tabId;
    let activeClass = '';
    let inactiveClass = '';
    
    if (baseGroup === 'strategy') {
      activeClass = 'bg-rose-50 dark:bg-rose-950/45 text-rose-700 dark:text-rose-300 font-extrabold border-l-4 border-rose-600 shadow-3xs scale-[1.01]';
      inactiveClass = 'text-slate-600 dark:text-slate-350 hover:bg-rose-50/35 hover:text-rose-705 dark:hover:bg-slate-800 dark:hover:text-rose-400 font-semibold border-l-4 border-transparent';
    } else if (baseGroup === 'operation') {
      activeClass = 'bg-violet-50 dark:bg-violet-950/45 text-violet-700 dark:text-violet-300 font-extrabold border-l-4 border-violet-600 shadow-3xs scale-[1.01]';
      inactiveClass = 'text-slate-600 dark:text-slate-350 hover:bg-violet-50/35 hover:text-violet-750 dark:hover:bg-slate-800 dark:hover:text-violet-400 font-semibold border-l-4 border-transparent';
    } else if (baseGroup === 'foundation') {
      activeClass = 'bg-indigo-50 dark:bg-indigo-950/45 text-indigo-705 dark:text-indigo-300 font-extrabold border-l-4 border-indigo-600 shadow-3xs scale-[1.01]';
      inactiveClass = 'text-slate-600 dark:text-slate-350 hover:bg-indigo-50/35 hover:text-indigo-700 dark:hover:bg-slate-800 dark:hover:text-indigo-400 font-semibold border-l-4 border-transparent';
    } else if (baseGroup === 'business') {
      activeClass = 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 font-extrabold border-l-4 border-emerald-600 shadow-3xs scale-[1.01]';
      inactiveClass = 'text-slate-600 dark:text-slate-350 hover:bg-emerald-50/35 hover:text-emerald-750 dark:hover:bg-slate-800 dark:hover:text-emerald-400 font-semibold border-l-4 border-transparent';
    } else if (baseGroup === 'campus') {
      activeClass = 'bg-sky-50 dark:bg-sky-950/45 text-sky-700 dark:text-sky-300 font-extrabold border-l-4 border-sky-600 shadow-3xs scale-[1.01]';
      inactiveClass = 'text-slate-600 dark:text-slate-350 hover:bg-sky-50/35 hover:text-sky-750 dark:hover:bg-slate-800 dark:hover:text-sky-400 font-semibold border-l-4 border-transparent';
    }

    return `w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-[12.5px] cursor-pointer transition-all text-left ${
      isActive ? activeClass : inactiveClass
    }`;
  };

  const getIconClass = (tabId: string, baseGroup: string) => {
    const isActive = overviewTab === tabId;
    if (baseGroup === 'strategy') return isActive ? 'text-rose-600 dark:text-rose-450' : 'text-rose-400 dark:text-rose-550';
    if (baseGroup === 'operation') return isActive ? 'text-violet-600 dark:text-violet-450' : 'text-violet-400 dark:text-violet-550';
    if (baseGroup === 'foundation') return isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-indigo-400 dark:text-indigo-550';
    if (baseGroup === 'business') return isActive ? 'text-emerald-600 dark:text-emerald-450' : 'text-emerald-400' ;
    return isActive ? 'text-sky-600 dark:text-sky-455' : 'text-sky-400';
  };

  const getBadgeClass = (tabId: string, baseGroup: string) => {
    const isActive = overviewTab === tabId;
    if (baseGroup === 'strategy') return isActive ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
    if (baseGroup === 'operation') return isActive ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-750 dark:bg-violet-950 dark:text-violet-300';
    if (baseGroup === 'foundation') return isActive ? 'bg-indigo-650 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
    if (baseGroup === 'business') return isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    return isActive ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-755 dark:bg-sky-950 dark:text-sky-300';
  };

  return (
    <>
      {/* Sidebar Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-39 md:hidden transition-all animate-fade-in"
          id="sidebar-backdrop-mobile"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside 
        role="navigation" 
        aria-label="Menu chính"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex flex-col shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 min-h-full transition-transform duration-305 md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
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

          {/* Sidebar Search Input */}
          <div className="px-3 mb-1.5 relative">
            <span className="absolute inset-y-0 left-3 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tính năng..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-250 placeholder-slate-400 transition-all font-medium"
              aria-label="Tìm kiếm tính năng"
            />
            {sidebarSearchQuery && (
              <button
                onClick={() => setSidebarSearchQuery('')}
                className="absolute inset-y-0 right-3 pr-3 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
                title="Xoá tìm kiếm"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* GROUP 1: STRATEGY (Chiến lược) */}
          {hasVisibleStrategy && (
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <button 
                onClick={() => toggleGroup('strategy')}
                aria-expanded={isGroupOpen('strategy')}
                className={`w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors ${groupHeaderClass('strategy').colorHover}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${groupHeaderClass('strategy').bgDot}`}></span>
                  <span className={groupHeaderClass('strategy').colorActive}>1. Chiến lược</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupOpen('strategy') ? groupHeaderClass('strategy').colorActive : '-rotate-90'}`} />
              </button>
              
              {isGroupOpen('strategy') && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-rose-100 dark:border-rose-950 transition-all duration-300">
                  {canDisplayTab('DASHBOARD') && matchesSearch('DASHBOARD') && (
                    <button 
                      onClick={() => { setOverviewTab('DASHBOARD'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'DASHBOARD' ? 'page' : undefined}
                      className={getTabClass('DASHBOARD', 'strategy')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layout className={`w-4 h-4 transition-colors ${getIconClass('DASHBOARD', 'strategy')}`} />
                        <span>Bảng điều khiển Điều hành</span>
                      </div>
                    </button>
                  )}

                  {canDisplayTab('BOARD_DIRECTIVES') && matchesSearch('BOARD_DIRECTIVES') && (
                    <button 
                      onClick={() => { setOverviewTab('BOARD_DIRECTIVES'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'BOARD_DIRECTIVES' ? 'page' : undefined}
                      className={getTabClass('BOARD_DIRECTIVES', 'strategy')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Megaphone className={`w-4 h-4 transition-colors ${getIconClass('BOARD_DIRECTIVES', 'strategy')}`} />
                        <span>Chỉ đạo BGH</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('BOARD_DIRECTIVES', 'strategy')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('ANALYTICS') && matchesSearch('ANALYTICS') && (
                    <button 
                      onClick={() => { setOverviewTab('ANALYTICS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'ANALYTICS' ? 'page' : undefined}
                      className={getTabClass('ANALYTICS', 'strategy')}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className={`w-4 h-4 transition-colors ${getIconClass('ANALYTICS', 'strategy')}`} />
                        <span>Báo cáo &amp; Phân tích</span>
                      </div>
                    </button>
                  )}

                  {canDisplayTab('RISK_CENTER') && matchesSearch('RISK_CENTER') && (
                    <button 
                      onClick={() => { setOverviewTab('RISK_CENTER'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'RISK_CENTER' ? 'page' : undefined}
                      className={getTabClass('RISK_CENTER', 'strategy')}
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertCircle className={`w-4 h-4 transition-colors ${getIconClass('RISK_CENTER', 'strategy')}`} />
                        <span>Quản trị Rủi ro</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP 2: OPERATION (Vận hành) */}
          {hasVisibleOperation && (
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <button 
                onClick={() => toggleGroup('operation')}
                aria-expanded={isGroupOpen('operation')}
                className={`w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors ${groupHeaderClass('operation').colorHover}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${groupHeaderClass('operation').bgDot}`}></span>
                  <span className={groupHeaderClass('operation').colorActive}>2. Vận hành</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupOpen('operation') ? groupHeaderClass('operation').colorActive : '-rotate-90'}`} />
              </button>
              
              {isGroupOpen('operation') && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-violet-100 dark:border-violet-950 transition-all duration-300">
                  {canDisplayTab('TASKS') && matchesSearch('TASKS') && (
                    <button 
                      onClick={() => { setOverviewTab('TASKS'); handleSelectViewOnMobile('KANBAN'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'TASKS' ? 'page' : undefined}
                      className={getTabClass('TASKS', 'operation')}
                    >
                      <div className="flex items-center gap-2.5">
                        <ListTodo className={`w-4 h-4 transition-colors ${getIconClass('TASKS', 'operation')}`} />
                        <span>Nhiệm vụ &amp; Dự án</span>
                      </div>
                    </button>
                  )}

                  {canDisplayTab('WORKFLOW_APPROVALS') && matchesSearch('WORKFLOW_APPROVALS') && (
                    <button 
                      onClick={() => { setOverviewTab('WORKFLOW_APPROVALS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'WORKFLOW_APPROVALS' ? 'page' : undefined}
                      className={getTabClass('WORKFLOW_APPROVALS', 'operation')}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck className={`w-4 h-4 transition-colors ${getIconClass('WORKFLOW_APPROVALS', 'operation')}`} />
                        <span>Quy trình &amp; Phê duyệt</span>
                      </div>
                    </button>
                  )}

                  {canDisplayTab('MEETING') && matchesSearch('MEETING') && (
                    <button 
                      onClick={() => { setOverviewTab('MEETING'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'MEETING' ? 'page' : undefined}
                      className={getTabClass('MEETING', 'operation')}
                    >
                      <div className="flex items-center gap-2.5">
                        <CalendarDays className={`w-4 h-4 transition-colors ${getIconClass('MEETING', 'operation')}`} />
                        <span>Quản lý Cuộc họp</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('MEETING', 'operation')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('KNOWLEDGE') && matchesSearch('KNOWLEDGE') && (
                    <button 
                      onClick={() => { setOverviewTab('KNOWLEDGE'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'KNOWLEDGE' ? 'page' : undefined}
                      className={getTabClass('KNOWLEDGE', 'operation')}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className={`w-4 h-4 transition-colors ${getIconClass('KNOWLEDGE', 'operation')}`} />
                        <span>Kho Tri Thức</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP 3: FOUNDATION (Nền tảng) */}
          {hasVisibleFoundation && (
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <button 
                onClick={() => toggleGroup('foundation')}
                aria-expanded={isGroupOpen('foundation')}
                className={`w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors ${groupHeaderClass('foundation').colorHover}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${groupHeaderClass('foundation').bgDot}`}></span>
                  <span className={groupHeaderClass('foundation').colorActive}>3. Nền tảng</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupOpen('foundation') ? groupHeaderClass('foundation').colorActive : '-rotate-90'}`} />
              </button>
              
              {isGroupOpen('foundation') && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-indigo-100 dark:border-indigo-950 transition-all duration-300">
                  {canDisplayTab('STRATEGY_OKRS') && matchesSearch('STRATEGY_OKRS') && (
                    <button 
                      onClick={() => { setOverviewTab('STRATEGY_OKRS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'STRATEGY_OKRS' ? 'page' : undefined}
                      className={getTabClass('STRATEGY_OKRS', 'foundation')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className={`w-4 h-4 transition-colors ${getIconClass('STRATEGY_OKRS', 'foundation')}`} />
                        <span>Định hướng &amp; OKRs</span>
                      </div>
                    </button>
                  )}

                  {canDisplayTab('DOCUMENT') && matchesSearch('DOCUMENT') && (
                    <button 
                      onClick={() => { setOverviewTab('DOCUMENT'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'DOCUMENT' ? 'page' : undefined}
                      className={getTabClass('DOCUMENT', 'foundation')}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className={`w-4 h-4 transition-colors ${getIconClass('DOCUMENT', 'foundation')}`} />
                        <span>Quản lý Văn bản</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('DOCUMENT', 'foundation')}`}>NEW</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP 4: BUSINESS (Nghiệp vụ Trường học) */}
          {hasVisibleBusiness && (
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <button 
                onClick={() => toggleGroup('business')}
                aria-expanded={isGroupOpen('business')}
                className={`w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors ${groupHeaderClass('business').colorHover}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${groupHeaderClass('business').bgDot}`}></span>
                  <span className={groupHeaderClass('business').colorActive}>4. Nghiệp vụ Trường học</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupOpen('business') ? groupHeaderClass('business').colorActive : '-rotate-90'}`} />
              </button>
              
              {isGroupOpen('business') && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-emerald-100 dark:border-emerald-950 transition-all duration-300">
                  {canDisplayTab('CRM_ADMISSIONS') && matchesSearch('CRM_ADMISSIONS') && (
                    <button 
                      onClick={() => { setOverviewTab('CRM_ADMISSIONS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'CRM_ADMISSIONS' ? 'page' : undefined}
                      className={getTabClass('CRM_ADMISSIONS', 'business')}
                    >
                      <div className="flex items-center gap-2.5">
                        <SlidersHorizontal className={`w-4 h-4 transition-colors ${getIconClass('CRM_ADMISSIONS', 'business')}`} />
                        <span>Tuyển sinh &amp; CRM</span>
                      </div>
                    </button>
                  )}

                  {canDisplayTab('STUDENT_SUCCESS') && matchesSearch('STUDENT_SUCCESS') && (
                    <button 
                      onClick={() => { setOverviewTab('STUDENT_SUCCESS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'STUDENT_SUCCESS' ? 'page' : undefined}
                      className={getTabClass('STUDENT_SUCCESS', 'business')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className={`w-4 h-4 transition-colors ${getIconClass('STUDENT_SUCCESS', 'business')}`} />
                        <span>Hồ sơ Học sinh 360°</span>
                      </div>
                    </button>
                  )}

                  {canDisplayTab('PARENT_PORTAL') && matchesSearch('PARENT_PORTAL') && (
                    <button 
                      onClick={() => { setOverviewTab('PARENT_PORTAL'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'PARENT_PORTAL' ? 'page' : undefined}
                      className={getTabClass('PARENT_PORTAL', 'business')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className={`w-4 h-4 transition-colors ${getIconClass('PARENT_PORTAL', 'business')}`} />
                        <span>Cổng PHHS / Học sinh</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('PARENT_PORTAL', 'business')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('HRM') && matchesSearch('HRM') && (
                    <button 
                      onClick={() => { setOverviewTab('HRM'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'HRM' ? 'page' : undefined}
                      className={getTabClass('HRM', 'business')}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck className={`w-4 h-4 transition-colors ${getIconClass('HRM', 'business')}`} />
                        <span>Quản trị HRM</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('HRM', 'business')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('LMS') && matchesSearch('LMS') && (
                    <button 
                      onClick={() => { setOverviewTab('LMS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'LMS' ? 'page' : undefined}
                      className={getTabClass('LMS', 'business')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Laptop className={`w-4 h-4 transition-colors ${getIconClass('LMS', 'business')}`} />
                        <span>Hệ thống LMS</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('LMS', 'business')}`}>NEW</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP 5: CAMPUS (Vận hành Học đường) */}
          {hasVisibleCampus && (
            <div className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <button 
                onClick={() => toggleGroup('campus')}
                aria-expanded={isGroupOpen('campus')}
                className={`w-full flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 py-1.5 px-3 uppercase font-mono cursor-pointer transition-colors ${groupHeaderClass('campus').colorHover}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${groupHeaderClass('campus').bgDot}`}></span>
                  <span className={groupHeaderClass('campus').colorActive}>5. Vận hành Học đường</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupOpen('campus') ? groupHeaderClass('campus').colorActive : '-rotate-90'}`} />
              </button>
              
              {isGroupOpen('campus') && (
                <div className="flex flex-col gap-1 pl-2 ml-2 mt-1 border-l border-sky-100 dark:border-sky-955 transition-all duration-300">
                  {canDisplayTab('EVENTS') && matchesSearch('EVENTS') && (
                    <button 
                      onClick={() => { setOverviewTab('EVENTS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'EVENTS' ? 'page' : undefined}
                      className={getTabClass('EVENTS', 'campus')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className={`w-4 h-4 transition-colors ${getIconClass('EVENTS', 'campus')}`} />
                        <span>Quản lý Sự kiện</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('EVENTS', 'campus')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('ACADEMIC_OPS') && matchesSearch('ACADEMIC_OPS') && (
                    <button 
                      onClick={() => { setOverviewTab('ACADEMIC_OPS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'ACADEMIC_OPS' ? 'page' : undefined}
                      className={getTabClass('ACADEMIC_OPS', 'campus')}
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className={`w-4 h-4 transition-colors ${getIconClass('ACADEMIC_OPS', 'campus')}`} />
                        <span>Thời khóa biểu &amp; Giáo án</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('ACADEMIC_OPS', 'campus')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('LOGISTICS') && matchesSearch('LOGISTICS') && (
                    <button 
                      onClick={() => { setOverviewTab('LOGISTICS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'LOGISTICS' ? 'page' : undefined}
                      className={getTabClass('LOGISTICS', 'campus')}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className={`w-4 h-4 transition-colors ${getIconClass('LOGISTICS', 'campus')}`} />
                        <span>Thư viện &amp; Thiết bị</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('LOGISTICS', 'campus')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('REQUESTS') && matchesSearch('REQUESTS') && (
                    <button 
                      onClick={() => { setOverviewTab('REQUESTS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'REQUESTS' ? 'page' : undefined}
                      className={getTabClass('REQUESTS', 'campus')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase className={`w-4 h-4 transition-colors ${getIconClass('REQUESTS', 'campus')}`} />
                        <span>Yêu cầu &amp; Dịch vụ</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('REQUESTS', 'campus')}`}>NEW</span>
                    </button>
                  )}

                  {canDisplayTab('GOOGLE_SHEETS') && matchesSearch('GOOGLE_SHEETS') && (
                    <button 
                      onClick={() => { setOverviewTab('GOOGLE_SHEETS'); setIsSidebarOpen(false); }}
                      aria-current={overviewTab === 'GOOGLE_SHEETS' ? 'page' : undefined}
                      className={getTabClass('GOOGLE_SHEETS', 'campus')}
                    >
                      <div className="flex items-center gap-2.5">
                        <RefreshCw className={`w-4 h-4 transition-colors ${getIconClass('GOOGLE_SHEETS', 'campus')}`} />
                        <span>Đồng bộ Sheets</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono shrink-0 select-none ${getBadgeClass('GOOGLE_SHEETS', 'campus')}`}>NEW</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Goal Completion Meter */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Đạt tiến độ mục tiêu</span>
            <span className="font-bold text-indigo-650 dark:text-indigo-400">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-650 dark:bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-450 leading-tight mt-2 font-sans">
            Hoàn thành các mục tiêu tháng 10
          </p>
        </div>
      </aside>
    </>
  );
}
