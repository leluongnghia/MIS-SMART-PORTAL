import { serverStorage } from '../libs/client/server-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  Megaphone,
  RefreshCw,
  Send,
  Server,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SystemSettingsModalProps {
  onClose: () => void;
  currentUserId?: string;
}

type ConfigStatus = {
  gemini: {
    configured: boolean;
    requiredEnv: string[];
  };
  smtp: {
    configured: boolean;
    host: string;
    port: string;
    secure: boolean;
    userConfigured: boolean;
    passConfigured: boolean;
    from: string;
    testReceiverConfigured: boolean;
    requiredEnv: string[];
  };
  zalo: {
    configured: boolean;
    oaIdConfigured: boolean;
    appIdConfigured: boolean;
    appSecretConfigured: boolean;
    accessTokenConfigured: boolean;
    refreshTokenConfigured: boolean;
    defaultAudience: string;
    requiredEnv: string[];
  };
};

type BroadcastDraft = {
  id: string;
  title: string;
  content: string;
  audience: string;
  labels: string[];
  scheduledAt: string;
  articleUrl: string;
  createdAt: string;
};

const BROADCAST_LOG_KEY = 'mis_zalo_broadcast_drafts';

const envTemplate = `APP_URL=https://duong.nghiadev.vn
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="MIS Smart Portal <your_email@gmail.com>"
TEST_RECEIVER_EMAIL=
MAX_EMAIL_REMINDERS_PER_RUN=5
MAX_CAMPAIGN_EMAILS_PER_RUN=20
ZALO_OA_ID=
ZALO_APP_ID=
ZALO_APP_SECRET=
ZALO_ACCESS_TOKEN=
ZALO_REFRESH_TOKEN=
ZALO_DEFAULT_AUDIENCE="Người quan tâm OA"`;

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
      active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

function FieldStatus({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
      <span className="font-semibold text-slate-600">{label}</span>
      <StatusPill active={active} label={active ? 'OK' : 'Thiếu'} />
    </div>
  );
}

export default function SystemSettingsModal({ onClose, currentUserId }: SystemSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'EMAIL' | 'ZALO' | 'ENV'>('EMAIL');
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('MIS Smart Portal - Kiểm thử SMTP');
  const [testMessage, setTestMessage] = useState('Email kiểm thử từ phần Cài đặt hệ thống MIS Smart Portal.');
  const [testResult, setTestResult] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('Thông báo chung từ MIS Smart Portal');
  const [broadcastContent, setBroadcastContent] = useState('Nhà trường gửi thông báo tới phụ huynh/học sinh qua Zalo OA Broadcast.');
  const [broadcastAudience, setBroadcastAudience] = useState('Toàn bộ người quan tâm OA');
  const [broadcastLabels, setBroadcastLabels] = useState('PHHS, TUYEN_SINH');
  const [broadcastSchedule, setBroadcastSchedule] = useState('');
  const [broadcastArticleUrl, setBroadcastArticleUrl] = useState('');
  const [broadcastResult, setBroadcastResult] = useState('');
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastDraft[]>(() => {
    try {
      return JSON.parse(serverStorage.getItem(BROADCAST_LOG_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // SMTP Settings States
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState('false');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');

  // Zalo Settings States
  const [zaloOaId, setZaloOaId] = useState('');
  const [zaloAppId, setZaloAppId] = useState('');
  const [zaloAppSecret, setZaloAppSecret] = useState('');
  const [zaloAccessToken, setZaloAccessToken] = useState('');
  const [zaloRefreshToken, setZaloRefreshToken] = useState('');

  // Gemini Settings States
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const [savingConfig, setSavingConfig] = useState(false);

  const canTestEmail = useMemo(() => /\S+@\S+\.\S+/.test(testEmail), [testEmail]);

  const loadStatus = async () => {
    setLoadingConfig(true);
    try {
      const response = await fetch('/api/notification/config-status', {
        headers: currentUserId ? { 'x-user-id': currentUserId } : {},
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Không thể tải trạng thái cấu hình.');
      }
      setConfig(data.config);

      if (data.config) {
        const smtp = data.config.smtp;
        setSmtpHost(smtp.host || '');
        setSmtpPort(smtp.port || '587');
        setSmtpSecure(smtp.secure ? 'true' : 'false');
        setSmtpUser(smtp.userConfigured ? '••••••••' : '');
        setSmtpPass(smtp.passConfigured ? '••••••••' : '');
        setSmtpFrom(smtp.from || '');

        const zalo = data.config.zalo;
        setZaloOaId(zalo.oaId || '');
        setZaloAppId(zalo.appId || '');
        setZaloAppSecret(zalo.appSecretConfigured ? '••••••••' : '');
        setZaloAccessToken(zalo.accessTokenConfigured ? '••••••••' : '');
        setZaloRefreshToken(zalo.refreshTokenConfigured ? '••••••••' : '');

        const gemini = data.config.gemini;
        setGeminiApiKey(gemini.configured ? '••••••••' : '');
      }
    } catch (error: any) {
      setTestResult(`Không thể tải trạng thái cấu hình: ${error.message || error}`);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setTestResult('');
    try {
      const response = await fetch('/api/notification/config-save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
        },
        body: JSON.stringify({
          smtp: {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom,
          },
          zalo: {
            oaId: zaloOaId,
            appId: zaloAppId,
            appSecret: zaloAppSecret,
            accessToken: zaloAccessToken,
            refreshToken: zaloRefreshToken,
          },
          gemini: {
            apiKey: geminiApiKey,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Lưu cấu hình thất bại.');
      }
      setTestResult('Đã lưu cấu hình thành công vào file .env và cập nhật bộ nhớ!');
      await loadStatus();
    } catch (error: any) {
      setTestResult(`Lỗi khi lưu cấu hình: ${error.message || error}`);
    } finally {
      setSavingConfig(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCopyEnv = async () => {
    await navigator.clipboard.writeText(envTemplate);
    setTestResult('Đã sao chép mẫu biến môi trường Render.');
  };

  const handleSendTestEmail = async () => {
    if (!canTestEmail) {
      setTestResult('Vui lòng nhập email nhận test hợp lệ.');
      return;
    }

    setTestingEmail(true);
    setTestResult('');
    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
        },
        body: JSON.stringify({
          to: testEmail,
          subject: testSubject,
          message: testMessage,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Gửi email test thất bại.');
      }
      setTestResult(
        data.provider === 'SMTP'
          ? `Đã gửi email test qua SMTP. Message ID: ${data.messageId}`
          : `SMTP thật chưa cấu hình, đã tạo email test ${data.provider}. ${data.previewUrl ? `Xem trước: ${data.previewUrl}` : ''}`
      );
      await loadStatus();
    } catch (error: any) {
      setTestResult(`Lỗi gửi email test: ${error.message || error}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const handlePrepareBroadcast = async () => {
    setBroadcastResult('');
    try {
      const labels = broadcastLabels.split(',').map(label => label.trim()).filter(Boolean);
      const response = await fetch('/api/zalo/broadcast/prepare', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
        },
        body: JSON.stringify({
          title: broadcastTitle,
          content: broadcastContent,
          audience: broadcastAudience,
          labels,
          scheduledAt: broadcastSchedule,
          articleUrl: broadcastArticleUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Không thể tạo nháp broadcast.');
      }
      const updated = [data.draft as BroadcastDraft, ...broadcastLogs].slice(0, 20);
      setBroadcastLogs(updated);
      serverStorage.setItem(BROADCAST_LOG_KEY, JSON.stringify(updated));
      setBroadcastResult(
        data.configured
          ? 'Đã tạo nháp broadcast. OA đã có token môi trường, có thể triển khai bước gửi qua OA/Zalo.'
          : 'Đã tạo nháp broadcast. Zalo OA chưa có đủ env, hãy cấu hình trên Render và gửi thủ công trong OA trước.'
      );
    } catch (error: any) {
      setBroadcastResult(`Lỗi tạo nháp broadcast: ${error.message || error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold leading-tight">Cài đặt hệ thống</h2>
              <p className="text-[11px] text-slate-300">SMTP email, trạng thái AI và Zalo OA Broadcast</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50 px-4 py-2 gap-2 overflow-x-auto">
          {[
            { id: 'EMAIL', label: 'Email SMTP', icon: Mail },
            { id: 'ZALO', label: 'Zalo OA Broadcast', icon: Megaphone },
            { id: 'ENV', label: 'Biến môi trường', icon: Server },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  activeTab === item.id
                    ? 'bg-white border-indigo-200 text-indigo-700 shadow-3xs'
                    : 'border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <button onClick={loadStatus} className="ml-auto px-3 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingConfig ? 'animate-spin' : ''}`} />
            Kiểm tra lại
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'EMAIL' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-black text-slate-900">Thiết lập SMTP</h3>
                  {config?.smtp && <StatusPill active={config.smtp.configured} label={config.smtp.configured ? 'Đã cấu hình' : 'Chưa cấu hình'} />}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">SMTP Host</label>
                    <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">SMTP Port</label>
                      <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Mã hóa (SSL/TLS)</label>
                      <select value={smtpSecure} onChange={e => setSmtpSecure(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
                        <option value="false">STARTTLS (Port 587 - Gmail)</option>
                        <option value="true">SSL (Port 465)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Tài khoản (SMTP User)</label>
                    <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="email_cua_ban@gmail.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Mật khẩu (SMTP Pass)</label>
                    <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="Mật khẩu ứng dụng (App Password)" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Tên & Email gửi (From)</label>
                    <input value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)} placeholder='"MIS Smart Portal" <noreply@mis.edu.vn>' className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
                  </div>
                </div>

                <button onClick={handleSaveConfig} disabled={savingConfig} className="w-full mt-4 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Lưu cấu hình SMTP
                </button>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">Gửi email kiểm thử</h3>
                </div>
                <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Email nhận test" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                <input value={testSubject} onChange={e => setTestSubject(e.target.value)} placeholder="Tiêu đề email" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                <textarea value={testMessage} onChange={e => setTestMessage(e.target.value)} rows={4} placeholder="Nội dung test" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                <button onClick={handleSendTestEmail} disabled={testingEmail} className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {testingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Gửi email test
                </button>
                {testResult && <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-900">{testResult}</div>}
              </section>
            </div>
          )}

          {activeTab === 'ZALO' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-5 h-5 text-sky-600" />
                  <h3 className="text-sm font-black text-slate-900">Thiết lập Zalo OA & Gemini</h3>
                  {config?.zalo && <StatusPill active={config.zalo.configured} label={config.zalo.configured ? 'Đã liên kết' : 'Chưa cấu hình'} />}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Zalo OA ID</label>
                    <input value={zaloOaId} onChange={e => setZaloOaId(e.target.value)} placeholder="ID tài khoản OA" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Zalo App ID</label>
                    <input value={zaloAppId} onChange={e => setZaloAppId(e.target.value)} placeholder="App ID Zalo Developer" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Zalo App Secret</label>
                    <input type="password" value={zaloAppSecret} onChange={e => setZaloAppSecret(e.target.value)} placeholder="App Secret Key" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Zalo Access Token</label>
                    <input type="password" value={zaloAccessToken} onChange={e => setZaloAccessToken(e.target.value)} placeholder="Zalo OA Access Token" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">Zalo Refresh Token</label>
                    <input type="password" value={zaloRefreshToken} onChange={e => setZaloRefreshToken(e.target.value)} placeholder="Zalo OA Refresh Token" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white" />
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-[10.5px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-between">
                      <span>Mã khóa Gemini API Key</span>
                      {config?.gemini && <StatusPill active={config.gemini.configured} label={config.gemini.configured ? 'OK' : 'Thiếu'} />}
                    </label>
                    <input type="password" value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} placeholder="Gemini AI Studio API Key" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white" />
                  </div>
                </div>

                <button onClick={handleSaveConfig} disabled={savingConfig} className="w-full mt-4 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Lưu cấu hình Zalo & Gemini
                </button>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-600" />
                  <h3 className="text-sm font-black text-slate-900">Tạo nháp broadcast</h3>
                </div>
                <input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="Tiêu đề broadcast" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200" />
                <textarea value={broadcastContent} onChange={e => setBroadcastContent(e.target.value)} rows={4} placeholder="Nội dung thông báo" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={broadcastAudience} onChange={e => setBroadcastAudience(e.target.value)} placeholder="Nhóm nhận" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                  <input value={broadcastLabels} onChange={e => setBroadcastLabels(e.target.value)} placeholder="Nhãn OA, cách nhau bằng dấu phẩy" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="datetime-local" value={broadcastSchedule} onChange={e => setBroadcastSchedule(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                  <input value={broadcastArticleUrl} onChange={e => setBroadcastArticleUrl(e.target.value)} placeholder="Link bài viết OA nếu có" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <button onClick={handlePrepareBroadcast} className="w-full px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-wider hover:bg-sky-700 flex items-center justify-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  Lưu nháp broadcast
                </button>
                {broadcastResult && <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs text-sky-900">{broadcastResult}</div>}
              </section>

              <section className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-black text-slate-900">Nháp broadcast gần đây</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {broadcastLogs.map(log => (
                    <div key={log.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1">
                      <strong className="text-slate-900">{log.title}</strong>
                      <p className="text-slate-600 line-clamp-2">{log.content}</p>
                      <p className="text-slate-500">Nhóm: {log.audience} · Nhãn: {log.labels.join(', ') || 'Không'}</p>
                    </div>
                  ))}
                  {broadcastLogs.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có nháp broadcast.</p>}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'ENV' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">Cấu hình trên Render</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vào Render Dashboard → service MIS Smart Portal → Environment → thêm các biến dưới đây → Save, rebuild, and deploy. Không nhập mật khẩu SMTP/Zalo token vào trình duyệt nếu chưa có backend lưu secret an toàn.
                </p>
              </div>
              <pre className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs overflow-auto whitespace-pre-wrap">{envTemplate}</pre>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleCopyEnv} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800">
                  <Copy className="w-4 h-4" />
                  Sao chép mẫu env
                </button>
                <a href="https://dashboard.render.com/" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-50">
                  <ExternalLink className="w-4 h-4" />
                  Mở Render Dashboard
                </a>
              </div>
              {testResult && <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-900">{testResult}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
