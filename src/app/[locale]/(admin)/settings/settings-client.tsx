'use client';
import { serverStorage } from '../../../../libs/client/server-storage';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { 
  Settings, 
  Mail, 
  Megaphone, 
  Server, 
  CreditCard, 
  User, 
  Moon, 
  Sun, 
  Bell, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Save, 
  ExternalLink, 
  Copy 
} from 'lucide-react';
import { MOCK_USERS } from '@/src/mockData';
import type { UserProfile } from '@/src/types';

export default function settingsPage({ initialData }: { initialData?: any }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('PROFILE');

  // Loading states
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Status message
  const [statusResult, setStatusResult] = useState('');

  // Global Config states
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState('false');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [testReceiverEmail, setTestReceiverEmail] = useState('');
  const [maxCampaignEmailsPerRun, setMaxCampaignEmailsPerRun] = useState('20');
  const [maxEmailRemindersPerRun, setMaxEmailRemindersPerRun] = useState('5');

  const [zaloOaId, setZaloOaId] = useState('');
  const [zaloAppId, setZaloAppId] = useState('');
  const [zaloAppSecret, setZaloAppSecret] = useState('');
  const [zaloAccessToken, setZaloAccessToken] = useState('');
  const [zaloRefreshToken, setZaloRefreshToken] = useState('');
  const [zaloDefaultAudience, setZaloDefaultAudience] = useState('Người quan tâm OA');

  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Admissions SMTP states
  const [admissionsUseCustom, setAdmissionsUseCustom] = useState(false);
  const [admissionsHost, setAdmissionsHost] = useState('');
  const [admissionsPort, setAdmissionsPort] = useState('587');
  const [admissionsSecure, setAdmissionsSecure] = useState('false');
  const [admissionsUser, setAdmissionsUser] = useState('');
  const [admissionsPass, setAdmissionsPass] = useState('');
  const [admissionsFrom, setAdmissionsFrom] = useState('');

  // Bank VietQR states
  const [bankBin, setBankBin] = useState('970436');
  const [bankAccountNo, setBankAccountNo] = useState('0123456789');
  const [bankAccountName, setBankAccountName] = useState('MIS SMART SCHOOL');
  const [reservationPrefix, setReservationPrefix] = useState('GCHO');
  const [enrollmentPrefix, setEnrollmentPrefix] = useState('NHAPHOC');
  const [crmBaseTuitionFee, setCrmBaseTuitionFee] = useState('60000000');
  const [crmReservationFee, setCrmReservationFee] = useState('5000000');

  // Personal Settings states
  const [personalTheme, setPersonalTheme] = useState('light');
  const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(true);
  const [browserNotifStatus, setBrowserNotifStatus] = useState('default');

  // Email Test states
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    // 1. Get logged-in user profile
    const savedUserId = serverStorage.getItem('mis_edutask_logged_in_user_id');
    let userProfile: UserProfile | null = null;
    if (savedUserId) {
      const matched = MOCK_USERS.find(u => u.id === savedUserId);
      if (matched) {
        userProfile = matched;
        setCurrentUser(matched);
      }
    }
    
    // Set default active tab based on department
    if (userProfile?.role === 'ADMIN' || userProfile?.workspaceId === 'BGH') {
      setActiveTab('SYSTEM_SMTP');
    } else if (userProfile?.workspaceId === 'TUYEN_SINH_PR') {
      setActiveTab('ADMISSIONS_SMTP');
    } else {
      setActiveTab('PROFILE');
    }

    // 2. Get theme from document
    const storedTheme = serverStorage.getItem('mis_admin_theme') || 'light';
    setPersonalTheme(storedTheme);

    // 3. Load config values from APIs
    loadStatus(savedUserId || undefined);

    // 4. Check browser notification status
    if ('Notification' in window) {
      setBrowserNotifStatus(Notification.permission);
    }

    setIsLoaded(true);
  }, []);

  const loadStatus = async (userIdOverride?: string) => {
    const uId = userIdOverride || currentUser?.id;
    if (!uId) return;

    setLoadingConfig(true);
    try {
      const response = await fetch('/api/notification/config-status', {
        headers: { 'x-user-id': uId },
      });
      const data = await response.json();
      if (response.ok && data.status === 'success' && data.config) {
        const c = data.config;
        
        // SMTP Global
        if (c.smtp) {
          setSmtpHost(c.smtp.host || '');
          setSmtpPort(c.smtp.port || '587');
          setSmtpSecure(c.smtp.secure ? 'true' : 'false');
          setSmtpUser(c.smtp.userConfigured ? '••••••••' : '');
          setSmtpPass(c.smtp.passConfigured ? '••••••••' : '');
          setSmtpFrom(c.smtp.from || '');
          setTestReceiverEmail(c.smtp.testReceiverEmail || '');
          setMaxCampaignEmailsPerRun(c.smtp.maxCampaignEmailsPerRun || '20');
          setMaxEmailRemindersPerRun(c.smtp.maxEmailRemindersPerRun || '5');
        }

        // Zalo OA
        if (c.zalo) {
          setZaloOaId(c.zalo.oaId || '');
          setZaloAppId(c.zalo.appId || '');
          setZaloAppSecret(c.zalo.appSecretConfigured ? '••••••••' : '');
          setZaloAccessToken(c.zalo.accessTokenConfigured ? '••••••••' : '');
          setZaloRefreshToken(c.zalo.refreshTokenConfigured ? '••••••••' : '');
          setZaloDefaultAudience(c.zalo.defaultAudience || 'Người quan tâm OA');
        }

        // Gemini AI Key
        if (c.gemini) {
          setGeminiApiKey(c.gemini.configured ? '••••••••' : '');
        }

        // Admissions SMTP
        if (c.admissionsSmtp) {
          setAdmissionsUseCustom(c.admissionsSmtp.useCustom);
          setAdmissionsHost(c.admissionsSmtp.host || '');
          setAdmissionsPort(c.admissionsSmtp.port || '587');
          setAdmissionsSecure(c.admissionsSmtp.secure ? 'true' : 'false');
          setAdmissionsUser(c.admissionsSmtp.userConfigured ? '••••••••' : '');
          setAdmissionsPass(c.admissionsSmtp.passConfigured ? '••••••••' : '');
          setAdmissionsFrom(c.admissionsSmtp.from || '');
        }

        // Bank settings
        if (c.bank) {
          setBankBin(c.bank.bankBin || '970436');
          setBankAccountNo(c.bank.bankAccountNo || '0123456789');
          setBankAccountName(c.bank.bankAccountName || 'MIS SMART SCHOOL');
          setReservationPrefix(c.bank.reservationPrefix || 'GCHO');
          setEnrollmentPrefix(c.bank.enrollmentPrefix || 'NHAPHOC');
          setCrmBaseTuitionFee(c.bank.crmBaseTuitionFee || '60000000');
          setCrmReservationFee(c.bank.crmReservationFee || '5000000');
        }
      }
    } catch (error: any) {
      console.error('Failed to load system config status:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!currentUser) return;
    setSavingConfig(true);
    setStatusResult('');
    
    const isAdmin = currentUser.role === 'ADMIN' || currentUser.workspaceId === 'BGH';

    try {
      const payload: any = {};

      if (isAdmin) {
        if (activeTab === 'SYSTEM_SMTP') {
          payload.smtp = {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom,
            testReceiverEmail,
            maxCampaignEmailsPerRun,
            maxEmailRemindersPerRun,
          };
        } else if (activeTab === 'SYSTEM_ZALO') {
          payload.zalo = {
            oaId: zaloOaId,
            appId: zaloAppId,
            appSecret: zaloAppSecret,
            accessToken: zaloAccessToken,
            refreshToken: zaloRefreshToken,
            defaultAudience: zaloDefaultAudience,
          };
          payload.gemini = {
            apiKey: geminiApiKey,
          };
        } else if (activeTab === 'SYSTEM_BANK') {
          payload.bank = {
            bankBin,
            bankAccountNo,
            bankAccountName,
            reservationPrefix,
            enrollmentPrefix,
            crmBaseTuitionFee,
            crmReservationFee,
          };
        }
      }

      if ((currentUser.workspaceId === 'TUYEN_SINH_PR' || isAdmin) && activeTab === 'ADMISSIONS_SMTP') {
        payload.admissionsSmtp = {
          useCustom: admissionsUseCustom,
          host: admissionsHost,
          port: admissionsPort,
          secure: admissionsSecure,
          user: admissionsUser,
          pass: admissionsPass,
          from: admissionsFrom,
        };
      }

      const response = await fetch('/api/notification/config-save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Lưu cấu hình thất bại.');
      }
      setStatusResult('Đã lưu cấu hình thành công!');
      await loadStatus();
      setTimeout(() => setStatusResult(''), 4000);
    } catch (error: any) {
      setStatusResult(`Lỗi khi lưu cấu hình: ${error.message || error}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendTestEmail = async (useAdmissionsSmtp: boolean) => {
    if (!testEmail || !currentUser) {
      setStatusResult('Vui lòng nhập email nhận test hợp lệ.');
      return;
    }

    setTestingEmail(true);
    setStatusResult('');
    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          to: testEmail,
          subject: useAdmissionsSmtp 
            ? 'MIS Smart Portal - Kiểm thử SMTP Tuyển sinh'
            : 'MIS Smart Portal - Kiểm thử SMTP Hệ thống',
          message: useAdmissionsSmtp
            ? 'Email kiểm thử được gửi từ cấu hình SMTP riêng của phòng Tuyển sinh.'
            : 'Email kiểm thử được gửi từ cấu hình SMTP chung của hệ thống.',
          useAdmissionsSmtp,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Gửi email test thất bại.');
      }
      setStatusResult(
        data.provider.includes('SMTP')
          ? `Gửi email test thành công qua ${data.provider}! (Đến: ${data.to})`
          : `Đã giả lập gửi email test ${data.provider}. ${data.previewUrl ? `Xem trước: ${data.previewUrl}` : ''}`
      );
      setTimeout(() => setStatusResult(''), 7000);
    } catch (error: any) {
      setStatusResult(`Lỗi gửi email test: ${error.message || error}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserNotifStatus(permission);
    }
  };

  const toggleTheme = () => {
    const nextTheme = personalTheme === 'light' ? 'dark' : 'light';
    setPersonalTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    serverStorage.setItem('mis_admin_theme', nextTheme);
  };

  if (!isLoaded || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.workspaceId === 'BGH';
  const isAdmissions = currentUser.workspaceId === 'TUYEN_SINH_PR';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Cấu hình & Thiết lập</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý các tham số phần mềm, SMTP, VietQR và cài đặt giao diện cá nhân</p>
        </div>
        <button 
          onClick={() => loadStatus()} 
          disabled={loadingConfig}
          className="self-start px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingConfig ? 'animate-spin' : ''}`} />
          Tải lại dữ liệu
        </button>
      </div>

      {statusResult && (
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-900 text-xs font-semibold animate-fade-in shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-indigo-400">
          ✨ {statusResult}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          {/* Admin Tabs */}
          {isAdmin && (
            <>
              <p className="text-[10px] font-black tracking-widest text-slate-450 dark:text-slate-500 px-3 uppercase mb-2">QUẢN TRỊ HỆ THỐNG</p>
              <button
                onClick={() => setActiveTab('SYSTEM_SMTP')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'SYSTEM_SMTP'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Cấu hình SMTP chung</span>
              </button>
              
              <button
                onClick={() => setActiveTab('SYSTEM_ZALO')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'SYSTEM_ZALO'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                <span>Zalo OA & Gemini AI</span>
              </button>

              <button
                onClick={() => setActiveTab('SYSTEM_BANK')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'SYSTEM_BANK'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Tài khoản VietQR</span>
              </button>

              <button
                onClick={() => setActiveTab('SYSTEM_ENV')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'SYSTEM_ENV'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Server className="w-4 h-4 shrink-0" />
                <span>Biến môi trường (.env)</span>
              </button>
            </>
          )}

          {/* Admissions Tabs */}
          {(isAdmissions || isAdmin) && (
            <>
              <p className="text-[10px] font-black tracking-widest text-slate-450 dark:text-slate-500 px-3 uppercase mb-2">CRM TUYỂN SINH</p>
              <button
                onClick={() => setActiveTab('ADMISSIONS_SMTP')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'ADMISSIONS_SMTP'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>SMTP gửi thư Tuyển sinh</span>
              </button>
            </>
          )}

          {/* Personal Settings group */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black tracking-widest text-slate-450 dark:text-slate-500 px-3 uppercase mb-2">CÀI ĐẶT CÁ NHÂN</p>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeTab === 'PROFILE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Hồ sơ & Giao diện</span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="md:col-span-3 space-y-6">
          {/* TAB: SYSTEM_SMTP (Only Admin) */}
          {activeTab === 'SYSTEM_SMTP' && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-indigo-650" />
                  Cấu hình SMTP hệ thống chung
                </CardTitle>
                <CardDescription>Cấu hình máy chủ gửi thư điện tử mặc định cho toàn hệ thống.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SMTP Host</label>
                    <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SMTP Port</label>
                    <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tài khoản (SMTP User)</label>
                    <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="email@gmail.com" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mật khẩu (SMTP Pass)</label>
                    <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mã hóa kết nối (SSL/TLS)</label>
                    <select value={smtpSecure} onChange={e => setSmtpSecure(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white">
                      <option value="false">STARTTLS (Port 587)</option>
                      <option value="true">SSL/TLS (Port 465)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Danh tính gửi (From)</label>
                    <input value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)} placeholder='"MIS Smart Portal" <noreply@misvn.edu.vn>' className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider mb-3">Kiểm thử & Hạn mức email</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email nhận thư thử nghiệm (TEST_RECEIVER_EMAIL)</label>
                      <input value={testReceiverEmail} onChange={e => setTestReceiverEmail(e.target.value)} placeholder="qa-test@example.com (Để trống để gửi cho người nhận thật)" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">Khi cấu hình, tất cả thư hệ thống và thư tự động sẽ chuyển hướng về hòm thư này để kiểm thử an toàn, không gửi cho email thực tế của phụ huynh/học sinh.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hạn mức chiến dịch (MAX_CAMPAIGN_EMAILS_PER_RUN)</label>
                        <input type="number" value={maxCampaignEmailsPerRun} onChange={e => setMaxCampaignEmailsPerRun(e.target.value)} placeholder="20" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">Số lượng email tối đa gửi đi trong mỗi đợt chạy của một chiến dịch gửi hàng loạt.</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hạn mức nhắc việc (MAX_EMAIL_REMINDERS_PER_RUN)</label>
                        <input type="number" value={maxEmailRemindersPerRun} onChange={e => setMaxEmailRemindersPerRun(e.target.value)} placeholder="5" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white" />
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">Số lượng email tối đa gửi đi mỗi khi chạy tự động nhắc việc trễ hạn/sắp hạn.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
                  <button onClick={handleSaveConfig} disabled={savingConfig} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
                    <Save className="w-4 h-4" />
                    Lưu cấu hình
                  </button>
                </div>

                {/* Email Test Area */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Gửi thử thư kiểm tra</h4>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={testEmail} 
                      onChange={e => setTestEmail(e.target.value)} 
                      placeholder="Nhập email nhận thư test..." 
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs focus:outline-none" 
                    />
                    <button 
                      onClick={() => handleSendTestEmail(false)} 
                      disabled={testingEmail}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {testingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Gửi thư test
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: SYSTEM_ZALO (Only Admin) */}
          {activeTab === 'SYSTEM_ZALO' && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Megaphone className="w-4.5 h-4.5 text-indigo-650" />
                  Cấu hình Zalo OA & Gemini AI
                </CardTitle>
                <CardDescription>Cấu hình các API bên thứ ba cho Zalo Broadcast và phân tích AI.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100 dark:border-slate-800">1. Zalo OA Broadcast API</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Zalo OA ID</label>
                      <input value={zaloOaId} onChange={e => setZaloOaId(e.target.value)} placeholder="Tài khoản Zalo Official Account" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Zalo App ID</label>
                      <input value={zaloAppId} onChange={e => setZaloAppId(e.target.value)} placeholder="Zalo Developer App ID" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Zalo App Secret</label>
                      <input type="password" value={zaloAppSecret} onChange={e => setZaloAppSecret(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Zalo Access Token</label>
                      <input type="password" value={zaloAccessToken} onChange={e => setZaloAccessToken(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Zalo Refresh Token</label>
                      <input type="password" value={zaloRefreshToken} onChange={e => setZaloRefreshToken(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đối tượng nhận mặc định (ZALO_DEFAULT_AUDIENCE)</label>
                    <input value={zaloDefaultAudience} onChange={e => setZaloDefaultAudience(e.target.value)} placeholder="Người quan tâm OA" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">Đối tượng mặc định dùng để chuẩn bị các bản nháp gửi tin nhắn Zalo OA Broadcast.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 pb-1 border-b border-indigo-100 dark:border-slate-800">2. Google Gemini AI Studio</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gemini API Key</label>
                    <input type="password" value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={handleSaveConfig} disabled={savingConfig} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
                    <Save className="w-4 h-4" />
                    Lưu Zalo & Gemini API
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: SYSTEM_BANK (Only Admin) */}
          {activeTab === 'SYSTEM_BANK' && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-650" />
                  Cấu hình Thanh toán VietQR & Học phí
                </CardTitle>
                <CardDescription>Cấu hình thông tin tài khoản ngân hàng của trường học để tạo mã QR nộp học phí và thanh toán CRM tự động.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mã ngân hàng (BANK_BIN)</label>
                    <input value={bankBin} onChange={e => setBankBin(e.target.value)} placeholder="970436 (Vietcombank)" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                    <p className="text-[10px] text-slate-400 mt-1">Sử dụng mã BIN 6 số chuẩn Napas (ví dụ 970436 cho VCB, 970415 cho Vietinbank)</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số tài khoản thụ hưởng</label>
                    <input value={bankAccountNo} onChange={e => setBankAccountNo(e.target.value)} placeholder="0123456789" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tên chủ tài khoản thụ hưởng</label>
                    <input value={bankAccountName} onChange={e => setBankAccountName(e.target.value.toUpperCase())} placeholder="MIS SMART SCHOOL" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-semibold uppercase" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiền tố giao dịch Giữ chỗ (Reservation)</label>
                    <input value={reservationPrefix} onChange={e => setReservationPrefix(e.target.value)} placeholder="GCHO" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiền tố giao dịch Nhập học (Enrollment)</label>
                    <input value={enrollmentPrefix} onChange={e => setEnrollmentPrefix(e.target.value)} placeholder="NHAPHOC" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-indigo-655 dark:text-indigo-400 uppercase tracking-wider mb-3">Thông số Học phí mặc định CRM</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Học phí cơ bản (CRM_BASE_TUITION_FEE)</label>
                      <input type="number" value={crmBaseTuitionFee} onChange={e => setCrmBaseTuitionFee(e.target.value)} placeholder="60000000" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">Học phí mặc định của trường (ví dụ: 60000000 VNĐ) gán cho lead mới.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phí giữ chỗ (CRM_RESERVATION_FEE)</label>
                      <input type="number" value={crmReservationFee} onChange={e => setCrmReservationFee(e.target.value)} placeholder="5000000" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">Phí đặt cọc giữ chỗ mặc định khi đăng ký nhập học (ví dụ: 5000000 VNĐ).</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={handleSaveConfig} disabled={savingConfig} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
                    <Save className="w-4 h-4" />
                    Lưu cấu hình VietQR
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: SYSTEM_ENV (Only Admin) */}
          {activeTab === 'SYSTEM_ENV' && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Server className="w-4.5 h-4.5 text-indigo-650" />
                  Tài liệu biến môi trường Render (.env)
                </CardTitle>
                <CardDescription>Mẫu cấu hình biến môi trường toàn hệ thống để áp dụng trên nền tảng đám mây.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-650 dark:text-slate-400">
                  Để triển khai ứng dụng trên máy chủ đám mây (Render, Heroku hoặc Vercel), hãy thiết lập các biến sau tại phần cấu hình biến môi trường của dịch vụ:
                </p>
                <pre className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs overflow-auto whitespace-pre-wrap font-mono">
{`APP_URL="https://duong.nghiadev.vn"
SMTP_HOST="${smtpHost}"
SMTP_PORT="${smtpPort}"
SMTP_SECURE="${smtpSecure}"
SMTP_USER="${smtpUser === '••••••••' ? 'your_smtp_user' : smtpUser}"
SMTP_PASS="${smtpPass === '••••••••' ? 'your_smtp_password' : smtpPass}"
EMAIL_FROM="${smtpFrom}"
TEST_RECEIVER_EMAIL="${testReceiverEmail}"
MAX_CAMPAIGN_EMAILS_PER_RUN="${maxCampaignEmailsPerRun}"
MAX_EMAIL_REMINDERS_PER_RUN="${maxEmailRemindersPerRun}"
ZALO_OA_ID="${zaloOaId}"
ZALO_APP_ID="${zaloAppId}"
ZALO_APP_SECRET="${zaloAppSecret === '••••••••' ? 'your_app_secret' : zaloAppSecret}"
ZALO_ACCESS_TOKEN="${zaloAccessToken === '••••••••' ? 'your_access_token' : zaloAccessToken}"
ZALO_REFRESH_TOKEN="${zaloRefreshToken === '••••••••' ? 'your_refresh_token' : zaloRefreshToken}"
ZALO_DEFAULT_AUDIENCE="${zaloDefaultAudience}"
GEMINI_API_KEY="${geminiApiKey === '••••••••' ? 'your_gemini_api_key' : geminiApiKey}"
BANK_BIN="${bankBin}"
BANK_ACCOUNT_NO="${bankAccountNo}"
BANK_ACCOUNT_NAME="${bankAccountName}"
PAYMENT_PREFIX_RESERVATION="${reservationPrefix}"
PAYMENT_PREFIX_ENROLLMENT="${enrollmentPrefix}"
CRM_BASE_TUITION_FEE="${crmBaseTuitionFee}"
CRM_RESERVATION_FEE="${crmReservationFee}"
ADMISSIONS_SMTP_USE_CUSTOM="${admissionsUseCustom}"
ADMISSIONS_SMTP_HOST="${admissionsHost}"
ADMISSIONS_SMTP_PORT="${admissionsPort}"
ADMISSIONS_SMTP_SECURE="${admissionsSecure}"
ADMISSIONS_SMTP_USER="${admissionsUser === '••••••••' ? 'your_admissions_smtp_user' : admissionsUser}"
ADMISSIONS_SMTP_PASS="${admissionsPass === '••••••••' ? 'your_admissions_smtp_password' : admissionsPass}"
ADMISSIONS_SMTP_FROM="${admissionsFrom}"`}
                </pre>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      const text = document.querySelector('pre')?.textContent || '';
                      await navigator.clipboard.writeText(text);
                      setStatusResult('Đã sao chép cấu hình env vào bộ nhớ đệm!');
                      setTimeout(() => setStatusResult(''), 3000);
                    }} 
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép Env
                  </button>
                  <a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Render Dashboard
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: ADMISSIONS_SMTP (Admissions department & Admins) */}
          {activeTab === 'ADMISSIONS_SMTP' && (isAdmissions || isAdmin) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-indigo-650" />
                  SMTP gửi thư riêng biệt của bộ phận Tuyển sinh
                </CardTitle>
                <CardDescription>Cấu hình máy chủ gửi thư điện tử riêng cho các chiến dịch quảng bá tuyển sinh, School Tour và thông báo kết quả kiểm tra.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Custom/Global Toggle Option */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Lựa chọn nguồn cấu hình gửi thư</label>
                  <div className="flex flex-col sm:flex-row gap-3 mt-1.5">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input 
                        type="radio" 
                        name="smtpSource" 
                        checked={!admissionsUseCustom} 
                        onChange={() => setAdmissionsUseCustom(false)} 
                        className="text-blue-600 focus:ring-0" 
                      />
                      <span>Sử dụng cấu hình SMTP chung của hệ thống (do Admin cấu hình)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input 
                        type="radio" 
                        name="smtpSource" 
                        checked={admissionsUseCustom} 
                        onChange={() => setAdmissionsUseCustom(true)} 
                        className="text-blue-600 focus:ring-0" 
                      />
                      <span className="font-bold text-indigo-650 dark:text-indigo-400">Tự cấu hình SMTP riêng cho Tuyển sinh</span>
                    </label>
                  </div>
                </div>

                {admissionsUseCustom ? (
                  <div className="space-y-4 animate-slide-up-fade">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SMTP Host</label>
                        <input value={admissionsHost} onChange={e => setAdmissionsHost(e.target.value)} placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SMTP Port</label>
                        <input value={admissionsPort} onChange={e => setAdmissionsPort(e.target.value)} placeholder="587" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tài khoản gửi (SMTP User)</label>
                        <input value={admissionsUser} onChange={e => setAdmissionsUser(e.target.value)} placeholder="admissions@misvn.edu.vn" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mật khẩu gửi (SMTP Pass)</label>
                        <input type="password" value={admissionsPass} onChange={e => setAdmissionsPass(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mã hóa bảo mật (SSL/TLS)</label>
                        <select value={admissionsSecure} onChange={e => setAdmissionsSecure(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs bg-white">
                          <option value="false">STARTTLS (Port 587)</option>
                          <option value="true">SSL/TLS (Port 465)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Danh tính & Email gửi (From)</label>
                        <input value={admissionsFrom} onChange={e => setAdmissionsFrom(e.target.value)} placeholder='"Phòng Tuyển sinh MIS" <admissions@misvn.edu.vn>' className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-800">
                    ℹ️ Hệ thống đang được cấu hình sử dụng SMTP chung của Trường học. Mọi email gửi đi từ CRM Tuyển sinh sẽ đi qua máy chủ mail trung tâm do Quản trị viên chỉ định.
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={handleSaveConfig} disabled={savingConfig} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
                    <Save className="w-4 h-4" />
                    Lưu cấu hình SMTP Tuyển sinh
                  </button>
                </div>

                {/* Email Test Area */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Gửi thử thư kiểm tra (Admissions Test)</h4>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={testEmail} 
                      onChange={e => setTestEmail(e.target.value)} 
                      placeholder="Nhập email nhận thư test tuyển sinh..." 
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs focus:outline-none" 
                    />
                    <button 
                      onClick={() => handleSendTestEmail(true)} 
                      disabled={testingEmail}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {testingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Gửi thư test riêng
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: PROFILE (Personal Preferences for everyone) */}
          {activeTab === 'PROFILE' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-indigo-650" />
                  Hồ sơ cá nhân & Thiết lập giao diện
                </CardTitle>
                <CardDescription>Cài đặt giao diện hiển thị, cấu hình thông báo cá nhân.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile detail card */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-250/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
                  <img src={currentUser.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} className="w-14 h-14 rounded-full object-cover border border-slate-200" alt="Avatar" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser.title || currentUser.roleName}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Phòng ban: {currentUser.workspaceId}</p>
                  </div>
                </div>

                {/* Display settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">1. Giao diện phần mềm</h4>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Chế độ tối (Dark Mode)</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Chuyển đổi giữa giao diện sáng và tối.</p>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                    >
                      {personalTheme === 'dark' ? (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold">
                          <Sun className="w-4.5 h-4.5 text-yellow-500" />
                          <span>Giao diện sáng</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-650 font-bold">
                          <Moon className="w-4.5 h-4.5 text-indigo-650" />
                          <span>Giao diện tối</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Notification preferences */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">2. Tùy chọn thông báo</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Nhận thông báo qua Email</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Tự động nhận thư nhắc việc hàng ngày và chỉ thị BGH.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={emailNotifsEnabled} 
                          onChange={() => setEmailNotifsEnabled(!emailNotifsEnabled)} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-650"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Thông báo đẩy trình duyệt (Push Notification)</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Nhận thông báo trực tiếp trên màn hình máy tính.</p>
                      </div>
                      <button 
                        onClick={requestNotificationPermission}
                        disabled={browserNotifStatus === 'granted'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          browserNotifStatus === 'granted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250 cursor-default'
                            : 'bg-indigo-50 border-indigo-150 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {browserNotifStatus === 'granted' ? 'Đã kích hoạt' : 'Bật thông báo'}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
