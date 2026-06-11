import React, { useState } from 'react';
import { 
  School, 
  KeyRound, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  Users, 
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Building
} from 'lucide-react';
import { UserProfile, getSafeAvatar } from '../types';
import { MOCK_USERS, WORKSPACES } from '../mockData';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginPortalProps {
  onLoginSuccess: (user: UserProfile) => void;
  initialUser: UserProfile;
}

const QUICK_STUDENT_PARENTS = [
  {
    student: {
      id: 'student_gen_1',
      name: 'Nguyễn Minh Quân',
      role: 'STUDENT' as const,
      roleName: 'Học sinh',
      title: 'Học sinh lớp 10A1',
      avatar: 'https://xsgames.co/randomusers/assets/avatars/male/1.jpg',
      workspaceId: 'STUDENT',
      studentCode: 'MIS-10A1-001'
    },
    parent: {
      id: 'parent_gen_1',
      name: 'Nguyễn Văn Hải',
      role: 'PARENT' as const,
      roleName: 'Phụ huynh',
      title: 'Phụ huynh HS Nguyễn Minh Quân',
      avatar: 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg',
      workspaceId: 'PARENT',
      parentEmail: 'parent.1@parent.mis.edu.vn'
    }
  },
  {
    student: {
      id: 'student_gen_2',
      name: 'Trần Mỹ Lệ',
      role: 'STUDENT' as const,
      roleName: 'Học sinh',
      title: 'Học sinh lớp 11A2',
      avatar: 'https://xsgames.co/randomusers/assets/avatars/female/2.jpg',
      workspaceId: 'STUDENT',
      studentCode: 'MIS-11A2-002'
    },
    parent: {
      id: 'parent_gen_2',
      name: 'Lê Thị Thu Trà',
      role: 'PARENT' as const,
      roleName: 'Phụ huynh',
      title: 'Phụ huynh HS Trần Mỹ Lệ',
      avatar: 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg',
      workspaceId: 'PARENT',
      parentEmail: 'parent.2@parent.mis.edu.vn'
    }
  },
  {
    student: {
      id: 'student_gen_3',
      name: 'Phạm Hồng Thái',
      role: 'STUDENT' as const,
      roleName: 'Học sinh',
      title: 'Học sinh lớp 12A1',
      avatar: 'https://xsgames.co/randomusers/assets/avatars/male/3.jpg',
      workspaceId: 'STUDENT',
      studentCode: 'MIS-12A1-003'
    },
    parent: {
      id: 'parent_gen_3',
      name: 'Phạm Hồng Sơn',
      role: 'PARENT' as const,
      roleName: 'Phụ huynh',
      title: 'Phụ huynh HS Phạm Hồng Thái',
      avatar: 'https://xsgames.co/randomusers/assets/avatars/male/4.jpg',
      workspaceId: 'PARENT',
      parentEmail: 'parent.3@parent.mis.edu.vn'
    }
  }
];

export default function LoginPortal({ onLoginSuccess, initialUser }: LoginPortalProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(initialUser);
  const [portalMode, setPortalMode] = useState<'STAFF' | 'STUDENT_PARENT'>('STAFF');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  
  // Derive simple email for mock users
  const getSimulatedEmail = (user: UserProfile) => {
    if (user.role === 'PARENT') return user.parentEmail || '';
    if (user.role === 'STUDENT') return `${user.studentCode?.toLowerCase()}@student.mis.edu.vn`;
    const cleanName = user.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/\s+/g, '.');
    return `${cleanName}@mis.edu.vn`;
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const email = user.email || "";
      const matched = MOCK_USERS.find(u => {
        const simEmail = getSimulatedEmail(u);
        return email.toLowerCase() === simEmail.toLowerCase() ||
               email.toLowerCase().startsWith(u.id);
      });

      const loggedUser: UserProfile = matched || {
        id: user.uid,
        name: user.displayName || "Cán bộ Google",
        role: 'ADMIN',
        roleName: 'Cán bộ Ban Giám hiệu',
        title: 'Đại biểu Hội đồng / Cán bộ chuyên trách',
        avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        workspaceId: 'BGH'
      };

      onLoginSuccess(loggedUser);
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      setErrorMsg("Không thể đăng nhập bằng Google. Vui lòng kết nối lại hoặc sử dụng Đăng nhập nhanh.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [emailInput, setEmailInput] = useState(() => getSimulatedEmail(initialUser));
  const [passwordInput, setPasswordInput] = useState('●●●●●●●●');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('BGH');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectUserCard = (user: UserProfile) => {
    setSelectedUser(user);
    setEmailInput(getSimulatedEmail(user));
    setPasswordInput('mis_secure_pass_2026');
    setErrorMsg(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg('Vui lòng điền tên đăng nhập hoặc chọn cán bộ trong danh sách!');
      return;
    }
    
    setIsLoggingIn(true);
    setErrorMsg(null);
    
    // Simulate high-security SSO loading
    setTimeout(() => {
      setIsLoggingIn(false);
      onLoginSuccess(selectedUser);
    }, 1000);
  };

  // Filter workspaces that actually have users
  const activeWorkspaces = WORKSPACES.filter(w => w.id !== 'ALL');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans select-none">
      
      {/* Absolute decorative gradient highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Decorative corporate frame accents */}
      <div className="absolute top-4 left-6 text-[10px] text-slate-500 font-mono tracking-widest hidden md:block">
        MIS PORTAL v3.2 • SECURE SSO
      </div>
      <div className="absolute bottom-4 right-6 text-[10px] text-slate-500 font-mono tracking-widest hidden md:block">
        © 2026 TRƯỜNG PHỔ THÔNG LIÊN CẤP ĐA TRÍ TUỆ
      </div>

      <div className="w-full max-w-5xl bg-slate-950/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col md:flex-row z-10">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-[420px] p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div>
            {/* Header branding */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-md border border-slate-800 shrink-0">
                <img 
                  src="https://misvn.edu.vn/wp-content/uploads/2021/11/logo.png" 
                  alt="MIS Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'text-indigo-600 font-black text-lg';
                      fallback.innerText = 'MIS';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-sm font-black text-white leading-tight uppercase font-display tracking-wide max-w-[220px]">
                  Hệ thống Giáo dục<br/>Đa Trí Tuệ MIS
                </h1>
                <p className="text-[10px] text-slate-450 uppercase font-bold tracking-widest leading-none mt-1">
                  Đồng bộ Google Sheets
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold font-display text-white tracking-tight">Đăng nhập tài khoản</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Vui lòng nhập Email cơ quan hoặc nhấp chọn cán bộ/nhân sự ở bảng danh bạ bên cạnh để tự động cấp quyền đăng nhập nhanh.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-[11px] text-rose-300 leading-relaxed font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              
              {/* Username Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Tài khoản chuyên môn (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@mis.edu.vn"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Mật khẩu đồng nhất
                  </label>
                  <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">Quên mật khẩu?</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember account option checkbox */}
              <div className="flex items-start gap-2.5 mt-1 select-none">
                <input
                  type="checkbox"
                  id="remember-login"
                  defaultChecked
                  className="mt-0.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="remember-login" className="text-[11px] text-slate-400 cursor-pointer leading-tight">
                  Ghi nhớ phiên đăng nhập trên trình duyệt này để đồng bộ nhanh lần sau.
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 active:translate-y-0.2 hover:scale-[1.01] transition-all font-sans disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang thiết lập định danh SSO...
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Đăng nhập hệ thống an toàn
                  </>
                )}
              </button>

              <div className="relative my-2 text-center select-none">
                <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-2 uppercase font-mono tracking-widest relative z-10">HOẶC DÙNG DỊCH VỤ DỰ PHÒNG</span>
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-900 z-0"></div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.2 disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24c0-1.63-.15-3.2-.43-4.72H24v9h12.75c-.55 2.97-2.22 5.5-4.75 7.18l7.38 5.72c4.32-3.98 6.82-9.85 6.82-17.18z"/>
                  <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.38-5.72c-2.03 1.36-4.63 2.18-8.51 2.18-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Xác thực tài khoản Google thực
              </button>
            </form>
          </div>

          {/* School core philosophy info */}
          <div className="mt-8 pt-4 border-t border-slate-900">
            <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-850">
              <School className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-widest font-mono">
                  Sứ mệnh Giáo dục Đa Trí Tuệ
                </p>
                <p className="text-[10px] text-slate-450 leading-relaxed font-sans mt-0.5">
                  "Tôn trọng sự khác biệt - Phát triển mọi tiềm năng". Điều phối tối ưu dựa trên cấu trúc minh chứng và phân nhiệm khoa học.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Directory Selection (Select User directly to login) */}
        <div className="w-full md:w-auto flex-1 p-8 bg-slate-950/40 flex flex-col justify-between">
          <div>
            {/* Top Mode Selector Tabs */}
            <div className="flex border-b border-slate-800 mb-5 select-none">
              <button
                type="button"
                onClick={() => setPortalMode('STAFF')}
                className={`flex-1 pb-2.5 text-center text-xs font-bold border-b-2 transition-all ${
                  portalMode === 'STAFF' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                💼 Cán bộ / Giáo viên
              </button>
              <button
                type="button"
                onClick={() => setPortalMode('STUDENT_PARENT')}
                className={`flex-1 pb-2.5 text-center text-xs font-bold border-b-2 transition-all ${
                  portalMode === 'STUDENT_PARENT' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                👪 Phụ huynh / Học sinh
              </button>
            </div>

            {portalMode === 'STAFF' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-500" />
                    Danh bạ cán bộ trường (Chọn nhanh)
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[8.5px] font-mono rounded font-bold uppercase">
                    {MOCK_USERS.length} Cán bộ
                  </span>
                </div>

                {/* Department filters tabs */}
                <div className="flex flex-wrap gap-1.5 mb-5 select-none">
                  {activeWorkspaces.map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setActiveTab(w.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all cursor-pointer border ${
                        activeTab === w.id
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm font-semibold'
                          : 'border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {w.id === 'BGH' ? '👑 BGH' : w.name.split(' & ')[0].split(' - ')[0].replace('Tổ Chuyên môn ', 'Tổ ')}
                    </button>
                  ))}
                </div>

                {/* User card list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {MOCK_USERS.filter(u => u.workspaceId === activeTab || (activeTab === 'BGH' && u.role === 'ADMIN')).map(user => {
                    const isSelected = selectedUser.id === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUserCard(user)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-sm shadow-indigo-500/5'
                            : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/80 hover:border-slate-800'
                        }`}
                      >
                        <img
                          src={getSafeAvatar(user.avatar, user.name)}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className={`w-9 h-9 rounded-full object-cover shrink-0 border ${
                            isSelected ? 'border-indigo-400' : 'border-slate-750'
                          }`}
                        />
                        <div className="min-w-0 pr-6">
                          <p className={`text-[11px] font-bold truncate leading-tight ${
                            isSelected ? 'text-indigo-200' : 'text-slate-200'
                          }`}>
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-450 truncate leading-relaxed mt-0.5">
                            {user.title}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {user.role === 'ADMIN' ? 'Ban Giám hiệu' : user.role === 'MANAGER' ? 'Trưởng bộ phận' : 'Thành viên'}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-indigo-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <School className="w-4 h-4 text-indigo-500" />
                    Cổng học sinh & phụ huynh liên cấp
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[8.5px] font-mono rounded font-bold uppercase">
                    SSO Active
                  </span>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    placeholder="Tìm tên hoặc lớp (ví dụ: Quân, 10A1)..."
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Student / Parent selector grid */}
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {QUICK_STUDENT_PARENTS.filter(item => 
                    item.student.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
                    item.student.title.toLowerCase().includes(searchStudentQuery.toLowerCase())
                  ).map(item => {
                    const isStudentSelected = selectedUser.id === item.student.id;
                    const isParentSelected = selectedUser.id === item.parent.id;
                    return (
                      <div key={item.student.id} className="p-3 bg-slate-900/20 border border-slate-850 rounded-2xl space-y-2.5">
                        <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-850 pb-1">
                          Hồ sơ: {item.student.name} ({item.student.studentCode})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Student Card */}
                          <div
                            onClick={() => handleSelectUserCard(item.student)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 relative ${
                              isStudentSelected
                                ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                                : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/80'
                            }`}
                          >
                            <img
                              src={item.student.avatar}
                              alt={item.student.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0 pr-5">
                              <p className="text-[10px] font-bold text-slate-200 truncate">{item.student.name}</p>
                              <span className="text-[8px] text-slate-450 block font-mono">Vai trò: Học sinh</span>
                            </div>
                            {isStudentSelected && (
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-400 absolute right-2 top-1/2 -translate-y-1/2" />
                            )}
                          </div>

                          {/* Parent Card */}
                          <div
                            onClick={() => handleSelectUserCard(item.parent)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 relative ${
                              isParentSelected
                                ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                                : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/80'
                            }`}
                          >
                            <img
                              src={item.parent.avatar}
                              alt={item.parent.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0 pr-5">
                              <p className="text-[10px] font-bold text-slate-200 truncate">{item.parent.name}</p>
                              <span className="text-[8px] text-slate-450 block font-mono">Vai trò: Phụ huynh</span>
                            </div>
                            {isParentSelected && (
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-400 absolute right-2 top-1/2 -translate-y-1/2" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900 text-slate-500 text-[10px] leading-relaxed flex items-start gap-2 select-none">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-350 font-sans">Độ tin cậy được thiết lập đồng bộ đám mây:</p>
              <p className="font-medium text-slate-450 mt-0.5">Hệ thống áp dụng chính sách cấp quyền theo phân tách nhiệm vụ (RBAC). Phụ huynh và học sinh sau khi đăng nhập chỉ có quyền xem thông tin điểm số, chuyên cần và học phí cá nhân của chính mình.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
