'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, Check, School, Sun, Moon, Bell, X, LogOut, Shield, Settings, HelpCircle, Languages } from 'lucide-react';

interface AppHeaderProps {
  currentUser: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  openCommandPalette: (initialQuery?: string) => void;
  selectedCampus: 'ALL' | 'CAMPUS_HN' | 'CAMPUS_HCM';
  setSelectedCampus: (val: 'ALL' | 'CAMPUS_HN' | 'CAMPUS_HCM') => void;
  notificationPermission: string;
  requestNotificationPermission: () => void;
  workspaces: any[];
  users: any[];
  handleUserSwitch: (user: any) => void;
  getSafeAvatar: (avatar: string | undefined, name: string) => string;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenActionCenter: () => void;
  actionItemsCount: number;
}

export default function AppHeader({
  currentUser,
  darkMode,
  setDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  openCommandPalette,
  selectedCampus,
  setSelectedCampus,
  notificationPermission,
  requestNotificationPermission,
  workspaces,
  users,
  handleUserSwitch,
  getSafeAvatar,
  onLogout,
  onOpenNotifications,
  onOpenActionCenter,
  actionItemsCount,
}: AppHeaderProps) {
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const campusRef = useRef<HTMLDivElement>(null);
  const sandboxRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [logoUrl, setLogoUrl] = useState<string>('https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png');

  // Load logo from localStorage and register listeners
  useEffect(() => {
    const cachedLogo = localStorage.getItem('school_logo_url');
    if (cachedLogo) {
      setLogoUrl(cachedLogo);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'school_logo_url') {
        setLogoUrl(e.newValue || 'https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png');
      }
    };

    const handleCustomLogoChange = (e: any) => {
      setLogoUrl(e.detail || 'https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('school_logo_changed', handleCustomLogoChange as any);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('school_logo_changed', handleCustomLogoChange as any);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (campusRef.current && !campusRef.current.contains(e.target as Node)) {
        setShowCampusDropdown(false);
      }
      if (sandboxRef.current && !sandboxRef.current.contains(e.target as Node)) {
        setIsSandboxOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-16 sticky top-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 px-2 sm:px-3 lg:px-4 shrink-0 shadow-xs z-30 transition-all w-full min-w-0">
      
      {/* Brand Logo & Toggle */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0 min-w-0">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          id="btn-toggle-mobile-sidebar"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-455 rounded-xl transition-all focus:outline-none md:hidden block cursor-pointer border border-slate-200/70 dark:border-slate-850 shadow-3xs"
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative w-12 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 border border-slate-200 shrink-0 shadow-3xs">
            <img 
              src={logoUrl} 
              alt="MIS Logo" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain transform group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'text-indigo-650 font-bold text-sm';
                  fallback.innerText = 'MIS';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>

        <div className="min-w-0">
          <span className="text-sm md:text-base font-display font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight max-w-[120px] md:max-w-[190px] xl:max-w-[260px] truncate">
            MIS SMART PORTAL
          </span>
          <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black hidden sm:flex items-center gap-1.5 leading-none mt-0.5">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Quản Trị Giáo Dục
          </span>
        </div>
      </div>

      {/* Prominent Global Search */}
      <div className="hidden lg:flex items-center flex-1 justify-center max-w-[min(40vw,560px)] mx-2 xl:mx-4 z-40 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => openCommandPalette(searchQuery)}
            onClick={() => openCommandPalette(searchQuery)}
            placeholder="Tìm nhanh tính năng, chỉ đạo, hồ sơ..."
            className="w-full pl-9 pr-28 xl:pr-32 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50/80 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="button"
            onClick={() => openCommandPalette(searchQuery)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 whitespace-nowrap cursor-pointer"
          >
            Tìm kiếm nhanh
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 shrink-0 no-print">
        
        {/* Campus Switcher Dropdown */}
        <div className="relative" ref={campusRef}>
          <button
            onClick={() => setShowCampusDropdown(!showCampusDropdown)}
            className="px-2.5 py-1.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 text-indigo-850 dark:text-indigo-300 rounded-xl hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 text-[11px] font-extrabold focus:outline-none"
            title="Chuyển đổi Cơ sở"
            type="button"
          >
            <School className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400" />
            <span className="hidden sm:inline">
              {selectedCampus === 'ALL' 
                ? 'Tất cả cơ sở' 
                : selectedCampus === 'CAMPUS_HN' 
                ? 'Cơ sở Hà Nội' 
                : 'Cơ sở TP.HCM'}
            </span>
            <span className="sm:hidden">
              {selectedCampus === 'ALL' ? 'Tất cả' : selectedCampus === 'CAMPUS_HN' ? 'HN' : 'HCM'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          
          {showCampusDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 text-xs z-50 animate-slide-up-fade">
              <button
                onClick={() => { setSelectedCampus('ALL'); setShowCampusDropdown(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-255 ${
                  selectedCampus === 'ALL' ? 'font-bold bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' : ''
                }`}
                type="button"
              >
                <span>Tất cả cơ sở (Tập đoàn)</span>
                {selectedCampus === 'ALL' && <Check className="w-3 h-3 text-indigo-650" />}
              </button>
              <button
                onClick={() => { setSelectedCampus('CAMPUS_HN'); setShowCampusDropdown(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-255 ${
                  selectedCampus === 'CAMPUS_HN' ? 'font-bold bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' : ''
                }`}
                type="button"
              >
                <span>Cơ sở Hà Nội (HN)</span>
                {selectedCampus === 'CAMPUS_HN' && <Check className="w-3 h-3 text-indigo-650" />}
              </button>
              <button
                onClick={() => { setSelectedCampus('CAMPUS_HCM'); setShowCampusDropdown(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-255 ${
                  selectedCampus === 'CAMPUS_HCM' ? 'font-bold bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' : ''
                }`}
                type="button"
              >
                <span>Cơ sở TP.HCM (HCM)</span>
                {selectedCampus === 'CAMPUS_HCM' && <Check className="w-3 h-3 text-indigo-650" />}
              </button>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 md:p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-3xs flex items-center justify-center focus:outline-none"
          title={darkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          type="button"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500 animate-pulse" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Action Center Trigger Button */}
        <button
          onClick={onOpenActionCenter}
          className="relative p-1.5 md:p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-3xs flex items-center justify-center focus:outline-none"
          title="Danh sách việc cần làm khẩn"
          type="button"
        >
          <Bell className="w-4 h-4 text-slate-650 dark:text-slate-300" />
          {actionItemsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm animate-pulse">
              {actionItemsCount}
            </span>
          )}
        </button>

        {/* Browser Notifications Toggle */}
        <button
          onClick={requestNotificationPermission}
          className={`px-2 py-1.5 rounded-xl border text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-3xs ${
            notificationPermission === 'granted'
              ? 'bg-indigo-50/70 text-indigo-750 border-indigo-100/60 hover:bg-indigo-100/50 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400'
              : notificationPermission === 'denied'
              ? 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-450'
              : 'bg-amber-50 text-amber-705 border-amber-200/50 hover:bg-amber-100/40 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
          }`}
          title={notificationPermission === 'granted' ? 'Thông báo trình duyệt hoạt động' : 'Bật thông báo trình duyệt'}
          type="button"
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            notificationPermission === 'granted' ? 'bg-emerald-500' : notificationPermission === 'denied' ? 'bg-slate-400' : 'bg-amber-500 animate-pulse'
          }`} />
          <span className="hidden xl:inline">
            {notificationPermission === 'granted' ? 'Nhận tin: Bật' : 'Nhận tin: Tắt'}
          </span>
        </button>

        {/* Mock SSO Sandbox Controller */}
        <div className="relative" ref={sandboxRef}>
          <button
            onClick={() => setIsSandboxOpen(!isSandboxOpen)}
            className="px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/25 border border-amber-300 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 text-[10.5px] font-extrabold rounded-xl shadow-3xs hover:border-amber-400 transition-all flex items-center gap-1 cursor-pointer focus:outline-none"
            title="Đăng nhập giả lập vai trò (SSO)"
            type="button"
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            <span className="hidden md:inline">Giả lập SSO 🧪</span>
            <span className="md:hidden">SSO</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isSandboxOpen && (
            <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 text-left font-sans animate-slide-up-fade">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <span className="text-[9px] uppercase font-black tracking-wider text-amber-700 dark:text-amber-400 font-mono">Bảng điều khiển Giả lập SSO</span>
                <button 
                  onClick={() => setIsSandboxOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer focus:outline-none"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed mb-3 font-normal">
                Chọn một nhân sự dưới đây để chuyển đổi vai nhanh (Mock SSO) phục vụ kiểm toán phân quyền.
              </p>

              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
                {workspaces.filter(w => w.id !== 'ALL').map((w) => {
                  const branchUsers = users.filter(u => u.workspaceId === w.id);
                  if (branchUsers.length === 0) return null;

                  return (
                    <div key={w.id} className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 block tracking-widest px-1 font-mono">
                        🏢 {w.name}
                      </span>
                      <div className="flex flex-col gap-0.5">
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
                              className={`w-full px-2 py-1 rounded-lg flex items-center gap-2 text-left transition-all cursor-pointer ${
                                isSelectedMe 
                                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/40 text-amber-900 dark:text-amber-400 font-bold shadow-3xs' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <img 
                                src={getSafeAvatar(u.avatar, u.name)} 
                                alt={u.name} 
                                className="w-5.5 h-5.5 rounded-full object-cover shrink-0 border border-slate-200/50 dark:border-slate-800/50"
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

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
            type="button"
          >
            <div className="relative">
              <img
                src={getSafeAvatar(currentUser?.avatar, currentUser?.name || 'User')}
                alt={currentUser?.name || 'Avatar'}
                className="w-8 h-8 rounded-xl object-cover border border-slate-250/60 dark:border-slate-700 shadow-3xs"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-emerald-500" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800 dark:hover:text-white" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 text-xs z-50 animate-slide-up-fade font-sans">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate mt-0.5 font-mono">{currentUser?.title}</p>
              </div>

              {/* Quick links */}
              <div className="px-1 py-1">
                <button
                  onClick={onOpenNotifications}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <Bell className="w-4 h-4 text-slate-450" />
                  <span>Trung tâm Thông báo</span>
                </button>
                
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                  type="button"
                >
                  <Languages className="w-4 h-4 text-slate-450" />
                  <span>Ngôn ngữ: Tiếng Việt</span>
                </button>

                {(currentUser?.role === 'ADMIN' || currentUser?.workspaceId === 'BGH') && (
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-250 flex items-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <Settings className="w-4 h-4 text-slate-450" />
                    <span>Cấu hình Hệ thống</span>
                  </button>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

              {/* Logout button */}
              <div className="px-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer font-bold"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </nav>
  );
}
