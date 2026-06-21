'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { 
  getSettings, 
  saveSettings, 
  uploadSchoolLogo,
  testSmtpConnection, 
  getIntegrationSettings,
  updateIntegrationSettings,
  sendTestEmail,
  generateTestPaymentQr,
  getSecuritySettings,
  updateSecuritySettings,
  getUserSwitcherSettings,
  updateUserSwitcherSettings,
  getAuditLogs,
} from './actions';
import { 
  Loader2, Save, Mail, QrCode, Building2, Shield, Settings2,
  Upload, X, Check, Image as ImageIcon, Globe, Info, Clock, GraduationCap,
  Lock, History, AlertTriangle, KeyRound, MonitorCog
} from 'lucide-react';

export default function SettingsClient({ isAdmin }: { isAdmin: boolean }) {
  const [activeTab, setActiveTab] = React.useState('general');
  const { toast } = useToast();
  const [settings, setSettings] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingQr, setTestingQr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Integration settings state
  const [integrationData, setIntegrationData] = useState<Record<string, string>>({});
  const [savingIntegration, setSavingIntegration] = useState<Record<string, boolean>>({});
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [qrTestParams, setQrTestParams] = useState({ leadCode: 'LD-2026-TEST01', studentName: 'Nguyễn Văn An', amount: '5000000', paymentType: 'reservation' as 'reservation' | 'enrollment' });
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrResult, setQrResult] = useState<any>(null);

  const [securityData, setSecurityData] = useState<Record<string, string>>({});
  const [userSwitcherData, setUserSwitcherData] = useState<Record<string, string>>({});
  const [savingSecurity, setSavingSecurity] = useState<Record<string, boolean>>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditFilters, setAuditFilters] = useState({ actor: '', module: '', action: '', success: '', from: '', to: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, integrationSettings, securitySettings, switcherSettings, logs] = await Promise.all([
        getSettings(),
        getIntegrationSettings(),
        getSecuritySettings(),
        getUserSwitcherSettings(),
        getAuditLogs({}),
      ]);
      setSettings(data);
      const initialForm: Record<string, string> = {};
      data.forEach((item: any) => {
        initialForm[item.key] = item.value || '';
      });
      setFormData(initialForm);

      // Load integration settings
      const intForm: Record<string, string> = {};
      integrationSettings.forEach((item: any) => {
        intForm[item.key] = item.value || '';
      });
      setIntegrationData(intForm);
      if (intForm['email:test_email']) setTestEmailAddr(intForm['email:test_email']);

      setSecurityData(Object.fromEntries(securitySettings.map((item: any) => [item.key, item.value || ''])));
      setUserSwitcherData(Object.fromEntries(switcherSettings.map((item: any) => [item.key, item.value || ''])));
      setAuditLogs(logs || []);

      // Cache logo URL to localStorage if it exists
      const logoSetting = data.find((item: any) => item.key === 'school_info:logo_url');
      if (logoSetting && logoSetting.value) {
        setLogoPreview(logoSetting.value as string);
        localStorage.setItem('school_logo_url', logoSetting.value as string);
        window.dispatchEvent(new CustomEvent('school_logo_changed', { detail: logoSetting.value as string }));
      } else {
        setLogoPreview('');
        localStorage.removeItem('school_logo_url');
        window.dispatchEvent(new CustomEvent('school_logo_changed', { detail: '' }));
      }
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Validators helper
  const validateGroup = (keys: string[]): boolean => {
    // School Name validation
    if (keys.includes('school_info:name') && !formData['school_info:name']?.trim()) {
      toast({ variant: 'error', title: 'Lỗi nhập liệu', message: 'Tên trường học không được để trống.' });
      return false;
    }

    // Timezone validation
    if (keys.includes('school_info:timezone') && !formData['school_info:timezone']?.trim()) {
      toast({ variant: 'error', title: 'Lỗi nhập liệu', message: 'Vui lòng chọn múi giờ.' });
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (keys.includes('school_info:email') && formData['school_info:email'] && !emailRegex.test(formData['school_info:email'])) {
      toast({ variant: 'error', title: 'Lỗi nhập liệu', message: 'Email trường học không đúng định dạng.' });
      return false;
    }

    // Website format validation
    if (keys.includes('school_info:website') && formData['school_info:website']) {
      try {
        new URL(formData['school_info:website'].startsWith('http') ? formData['school_info:website'] : `https://${formData['school_info:website']}`);
      } catch {
        toast({ variant: 'error', title: 'Lỗi nhập liệu', message: 'Website không đúng định dạng URL.' });
        return false;
      }
    }

    // Academic year dates validation
    if (keys.includes('academics:academic_year_start') && keys.includes('academics:academic_year_end')) {
      if (formData['academics:academic_year_start'] && formData['academics:academic_year_end']) {
        const start = new Date(formData['academics:academic_year_start']);
        const end = new Date(formData['academics:academic_year_end']);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
          toast({ variant: 'error', title: 'Lỗi ngày học vụ', message: 'Ngày kết thúc năm học phải sau ngày bắt đầu.' });
          return false;
        }
      }
    }

    // Academics semester dates validation
    if (keys.includes('academics:semester_start') && keys.includes('academics:semester_end')) {
      if (formData['academics:semester_start'] && formData['academics:semester_end']) {
        const start = new Date(formData['academics:semester_start']);
        const end = new Date(formData['academics:semester_end']);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
          toast({ variant: 'error', title: 'Lỗi ngày học vụ', message: 'Ngày kết thúc học kỳ phải sau ngày bắt đầu.' });
          return false;
        }
      }
    }

    // Summer break dates validation
    if (keys.includes('academics:summer_break_start') && keys.includes('academics:summer_break_end')) {
      if (formData['academics:summer_break_start'] && formData['academics:summer_break_end']) {
        const start = new Date(formData['academics:summer_break_start']);
        const end = new Date(formData['academics:summer_break_end']);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
          toast({ variant: 'error', title: 'Lỗi ngày học vụ', message: 'Ngày kết thúc nghỉ hè phải sau ngày bắt đầu.' });
          return false;
        }
      }
    }

    // Max students validation
    if (keys.includes('academics:default_max_students')) {
      const maxStudents = parseInt(formData['academics:default_max_students'], 10);
      if (isNaN(maxStudents) || maxStudents <= 0) {
        toast({ variant: 'error', title: 'Lỗi nhập liệu', message: 'Sĩ số tối đa mặc định phải là số nguyên dương lớn hơn 0.' });
        return false;
      }
    }

    return true;
  };

  const handleSaveGroup = async (groupKeys: string[], groupId: string) => {
    if (!validateGroup(groupKeys)) return;

    try {
      setSaving(prev => ({ ...prev, [groupId]: true }));
      const updates = groupKeys.map(k => ({ key: k, value: formData[k] || '' }));
      await saveSettings(updates);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã lưu cấu hình nhóm thành công.' });
      await loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi lưu trữ', message: error.message });
    } finally {
      setSaving(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed image formats
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({ 
        variant: 'error', 
        title: 'Định dạng file không hỗ trợ', 
        message: 'Chỉ chấp nhận file ảnh PNG, JPG, JPEG, WEBP hoặc SVG.' 
      });
      return;
    }

    // Max size 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast({ 
        variant: 'error', 
        title: 'File quá lớn', 
        message: 'Dung lượng file ảnh phải nhỏ hơn 2MB.' 
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        setSaving(prev => ({ ...prev, 'logo': true }));
        await uploadSchoolLogo(base64Data);
        setLogoPreview(base64Data);
        localStorage.setItem('school_logo_url', base64Data);
        window.dispatchEvent(new CustomEvent('school_logo_changed', { detail: base64Data }));
        toast({ variant: 'success', title: 'Thành công', message: 'Cập nhật logo trường thành công.' });
      } catch (error: any) {
        toast({ variant: 'error', title: 'Lỗi', message: error.message });
      } finally {
        setSaving(prev => ({ ...prev, 'logo': false }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    try {
      setSaving(prev => ({ ...prev, 'logo': true }));
      await saveSettings([{ key: 'school_info:logo_url', value: '' }]);
      setLogoPreview('');
      localStorage.removeItem('school_logo_url');
      window.dispatchEvent(new CustomEvent('school_logo_changed', { detail: '' }));
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa logo trường.' });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setSaving(prev => ({ ...prev, 'logo': false }));
    }
  };

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      const res = await testSmtpConnection();
      toast({ variant: 'info', title: 'Kiểm thử kết nối', message: (res as any).message });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Thất bại', message: error.message });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Integration helpers
  const handleIntegrationChange = (key: string, value: string) => {
    setIntegrationData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveIntegrationGroup = async (groupKeys: string[], groupId: string) => {
    try {
      setSavingIntegration(prev => ({ ...prev, [groupId]: true }));
      const updates = groupKeys
        .filter(k => integrationData[k] !== undefined)
        .map(k => ({ key: k, value: integrationData[k] || '' }));
      await updateIntegrationSettings(updates);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã lưu cấu hình thành công.' });
      await loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi lưu trữ', message: error.message });
    } finally {
      setSavingIntegration(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleSendTestEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailAddr)) {
      toast({ variant: 'error', title: 'Email không hợp lệ', message: 'Vui lòng nhập đúng định dạng email nhận test.' });
      return;
    }
    try {
      setSendingTestEmail(true);
      const res = await sendTestEmail(testEmailAddr);
      toast({ variant: 'success', title: 'Đã gửi!', message: (res as any).message });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Gửi thất bại', message: error.message });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleGenerateTestQr = async () => {
    try {
      setGeneratingQr(true);
      setQrResult(null);
      const res = await generateTestPaymentQr({
        leadCode: qrTestParams.leadCode,
        studentName: qrTestParams.studentName,
        amount: parseInt(qrTestParams.amount, 10) || 0,
        paymentType: qrTestParams.paymentType,
      });
      setQrResult(res);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Không thể tạo QR', message: error.message });
    } finally {
      setGeneratingQr(false);
    }
  };

  const handleSecurityChange = (key: string, value: string) => setSecurityData(prev => ({ ...prev, [key]: value }));
  const handleSwitcherChange = (key: string, value: string) => setUserSwitcherData(prev => ({ ...prev, [key]: value }));

  const handleSaveSecurity = async () => {
    if (!window.confirm('Bạn đang thay đổi cấu hình bảo mật hệ thống. Thao tác này có thể ảnh hưởng đến toàn bộ người dùng. Bạn có chắc chắn muốn tiếp tục?')) return;
    try {
      setSavingSecurity(prev => ({ ...prev, security: true }));
      await updateSecuritySettings(Object.entries(securityData).map(([key, value]) => ({ key, value })));
      toast({ variant: 'success', title: 'Đã lưu', message: 'Cấu hình bảo mật đã được cập nhật.' });
      await loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi bảo mật', message: error.message });
    } finally {
      setSavingSecurity(prev => ({ ...prev, security: false }));
    }
  };

  const handleSaveSwitcher = async () => {
    if (!window.confirm('Chức năng Đổi user chỉ nên dùng cho demo hoặc quản trị. Không nên bật công khai trong môi trường vận hành thật. Tiếp tục?')) return;
    try {
      setSavingSecurity(prev => ({ ...prev, switcher: true }));
      await updateUserSwitcherSettings(Object.entries(userSwitcherData).map(([key, value]) => ({ key, value })));
      toast({ variant: 'success', title: 'Đã lưu', message: 'Cấu hình Demo mode đã được cập nhật.' });
      await loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi Demo mode', message: error.message });
    } finally {
      setSavingSecurity(prev => ({ ...prev, switcher: false }));
    }
  };

  const handleFilterAudit = async () => {
    try {
      const logs = await getAuditLogs(auditFilters);
      setAuditLogs(logs || []);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Không tải được audit log', message: error.message });
    }
  };

  if (loading && settings.length === 0) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  // Group keys mappings
  const identifyKeys = ['school_info:name', 'school_info:short_name', 'school_info:code'];
  const contactKeys = ['school_info:address', 'school_info:hotline_general', 'school_info:hotline', 'school_info:email', 'school_info:website'];
  const representativeKeys = ['school_info:representative_name', 'school_info:representative_title', 'school_info:report_signature_name'];
  const basicSystemKeys = ['school_info:timezone', 'school_info:default_language'];

  const academicYearKeys = ['academics:default_year', 'academics:academic_year_start', 'academics:academic_year_end'];
  const academicSemesterKeys = ['academics:default_semester', 'academics:semester_start', 'academics:semester_end'];
  const gradeMaxStudentsKeys = ['academics:grade_levels', 'academics:default_max_students'];
  const calendarKeys = ['academics:working_days', 'academics:summer_break_start', 'academics:summer_break_end', 'academics:summer_break_note'];
  const codeGenKeys = ['academics:student_code_rule', 'academics:lead_code_rule'];

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-indigo-600 animate-pulse" />
            Cấu hình Hệ thống
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Quản trị thông tin trường học, học vụ, tích hợp truyền thông và quy tắc vận hành.
          </p>
        </div>
        {!isAdmin && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-3xs max-w-md">
            <Shield className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Chế độ chỉ đọc: Tài khoản của bạn không có quyền cập nhật cấu hình hệ thống.</span>
          </div>
        )}
      </div>

      <Tabs className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl flex flex-wrap max-w-fit shadow-3xs">
          <TabsTrigger 
            active={activeTab === "general"} 
            onClick={() => setActiveTab("general")}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all"
          >
            <Building2 className="w-4 h-4"/> 
            Thông tin chung
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === "academics"} 
            onClick={() => setActiveTab("academics")}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all"
          >
            <Settings2 className="w-4 h-4"/> 
            Học vụ & Quy tắc
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === "integrations"} 
            onClick={() => setActiveTab("integrations")}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all"
          >
            <Mail className="w-4 h-4"/> 
            Tích hợp & Kết nối
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === "security"} 
            onClick={() => setActiveTab("security")}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all"
          >
            <Lock className="w-4 h-4"/> 
            Bảo mật
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general" activeValue={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Identifiers */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Identifiers Card */}
              <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-650" />
                    Thông tin nhận diện
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-450">Tên thương hiệu, mã định danh cơ quan.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1">
                      <label htmlFor="school_info:name" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Tên trường học *</label>
                      <Input 
                        id="school_info:name" 
                        value={formData['school_info:name'] || ''} 
                        onChange={(e) => handleChange('school_info:name', e.target.value)}
                        disabled={!isAdmin}
                        className="font-bold text-slate-900"
                        placeholder="Nhập tên chính thức"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="school_info:short_name" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Tên viết tắt</label>
                      <Input 
                        id="school_info:short_name" 
                        value={formData['school_info:short_name'] || ''} 
                        onChange={(e) => handleChange('school_info:short_name', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="MIS"
                      />
                    </div>
                    <div className="grid gap-1 md:col-span-2">
                      <label htmlFor="school_info:code" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Mã trường định danh</label>
                      <Input 
                        id="school_info:code" 
                        value={formData['school_info:code'] || ''} 
                        onChange={(e) => handleChange('school_info:code', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="Mã số trường học"
                      />
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={() => handleSaveGroup(identifyKeys, 'identity')} 
                        disabled={saving['identity']}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                      >
                        {saving['identity'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                        Lưu nhận diện
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contacts Card */}
              <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-650" />
                    Thông tin liên hệ
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-450">Các kênh liên lạc chung, hotline tuyển sinh, địa chỉ hiển thị.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1 md:col-span-2">
                      <label htmlFor="school_info:address" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Địa chỉ chính</label>
                      <Input 
                        id="school_info:address" 
                        value={formData['school_info:address'] || ''} 
                        onChange={(e) => handleChange('school_info:address', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="Lô đất TH2, KĐT mới Dịch Vọng..."
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="school_info:hotline_general" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Hotline chung</label>
                      <Input 
                        id="school_info:hotline_general" 
                        value={formData['school_info:hotline_general'] || ''} 
                        onChange={(e) => handleChange('school_info:hotline_general', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="024 1234 5678"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="school_info:hotline" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Hotline tuyển sinh</label>
                      <Input 
                        id="school_info:hotline" 
                        value={formData['school_info:hotline'] || ''} 
                        onChange={(e) => handleChange('school_info:hotline', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="024 1234 5678"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="school_info:email" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Email trường</label>
                      <Input 
                        id="school_info:email" 
                        type="email"
                        value={formData['school_info:email'] || ''} 
                        onChange={(e) => handleChange('school_info:email', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="info@school.edu.vn"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="school_info:website" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Website</label>
                      <Input 
                        id="school_info:website" 
                        value={formData['school_info:website'] || ''} 
                        onChange={(e) => handleChange('school_info:website', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="https://school.edu.vn"
                      />
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={() => handleSaveGroup(contactKeys, 'contact')} 
                        disabled={saving['contact']}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                      >
                        {saving['contact'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                        Lưu thông tin liên hệ
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Representative & Signature Card */}
              <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-650" />
                    Người đại diện & Chữ ký báo cáo
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-450">Tên người đại diện ký các văn bản pháp lý và tiêu đề chữ ký cuối báo cáo.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1">
                      <label htmlFor="school_info:representative_name" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Người đại diện pháp luật</label>
                      <Input 
                        id="school_info:representative_name" 
                        value={formData['school_info:representative_name'] || ''} 
                        onChange={(e) => handleChange('school_info:representative_name', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="Thầy/Cô..."
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="school_info:representative_title" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Chức danh người đại diện</label>
                      <Input 
                        id="school_info:representative_title" 
                        value={formData['school_info:representative_title'] || ''} 
                        onChange={(e) => handleChange('school_info:representative_title', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="Chủ tịch hội đồng trường"
                      />
                    </div>
                    <div className="grid gap-1 md:col-span-2">
                      <label htmlFor="school_info:report_signature_name" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Tên chữ ký mặc định trên báo cáo</label>
                      <Input 
                        id="school_info:report_signature_name" 
                        value={formData['school_info:report_signature_name'] || ''} 
                        onChange={(e) => handleChange('school_info:report_signature_name', e.target.value)}
                        disabled={!isAdmin}
                        placeholder="Tên người ký hiển thị cuối báo cáo"
                      />
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={() => handleSaveGroup(representativeKeys, 'representative')} 
                        disabled={saving['representative']}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                      >
                        {saving['representative'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                        Lưu chữ ký & đại diện
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Logo & System Basics */}
            <div className="space-y-6">
              
              {/* Logo Upload Card */}
              <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-650" />
                    Logo trường học
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-450">Tải lên Logo định dạng Base64 Data URL, tự động đồng bộ Header & SSO Portal.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className="relative w-40 h-40 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-3 shadow-3xs overflow-hidden group">
                    {logoPreview ? (
                      <>
                        <img 
                          src={logoPreview} 
                          alt="School Logo Preview" 
                          className="w-full h-full object-contain"
                        />
                        {isAdmin && (
                          <button
                            onClick={handleRemoveLogo}
                            disabled={saving['logo']}
                            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-all cursor-pointer"
                            title="Xóa logo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <ImageIcon className="w-12 h-12 stroke-[1.5]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-center">Chưa có logo</span>
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="w-full space-y-2">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving['logo']}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-3xs"
                      >
                        {saving['logo'] ? <Loader2 className="w-4 h-4 animate-spin text-slate-650" /> : <Upload className="w-4 h-4 text-slate-600" />}
                        Tải logo mới (.png, .jpg, dưới 2MB)
                      </Button>
                      <p className="text-[10px] font-semibold text-slate-400 text-center leading-normal">
                        Logo lưu trực tiếp vào CSDL giúp ổn định cấu hình khi khởi động lại.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic System Settings Card */}
              <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-650" />
                    Thiết lập cơ bản
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-450">Ngôn ngữ mặc định và múi giờ quốc gia.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-3">
                    <div className="grid gap-1">
                      <label htmlFor="school_info:timezone" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Múi giờ hệ thống *</label>
                      <Select 
                        id="school_info:timezone"
                        value={formData['school_info:timezone'] || 'Asia/Ho_Chi_Minh'}
                        onChange={(e) => handleChange('school_info:timezone', e.target.value)}
                        disabled={!isAdmin}
                      >
                        <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7) - Asia/Ho_Chi_Minh</option>
                        <option value="Asia/Singapore">Singapore (GMT+8) - Asia/Singapore</option>
                        <option value="Europe/London">Anh Quốc (GMT) - Europe/London</option>
                        <option value="America/New_York">Mỹ (GMT-5) - America/New_York</option>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="school_info:default_language" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngôn ngữ mặc định *</label>
                      <Select 
                        id="school_info:default_language"
                        value={formData['school_info:default_language'] || 'vi'}
                        onChange={(e) => handleChange('school_info:default_language', e.target.value)}
                        disabled={!isAdmin}
                      >
                        <option value="vi">Tiếng Việt (vi)</option>
                        <option value="en">Tiếng Anh (en)</option>
                      </Select>
                    </div>
                    
                    <div className="mt-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-850 font-bold text-[10.5px]">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        Đồng bộ năm học
                      </div>
                      <p className="text-[9.5px] leading-relaxed text-indigo-750 font-semibold">
                        Năm học mặc định: <span className="underline font-bold">{formData['academics:default_year'] || 'Chưa định nghĩa'}</span>
                      </p>
                      <p className="text-[9px] text-indigo-500 leading-normal">
                        Giá trị này được đồng bộ động từ tab cấu hình Học vụ của trường.
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={() => handleSaveGroup(basicSystemKeys, 'basic_system')} 
                        disabled={saving['basic_system']}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                      >
                        {saving['basic_system'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                        Lưu thiết lập
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>
        </TabsContent>

        {/* Tab 2: Academic Settings */}
        <TabsContent value="academics" activeValue={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Year Current Info */}
            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-650" />
                  Năm học hiện tại
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-450">Tên năm học hoạt động và khoảng thời gian diễn ra năm học.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1 md:col-span-2">
                    <label htmlFor="academics:default_year" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Năm học mặc định *</label>
                    <Input 
                      id="academics:default_year" 
                      value={formData['academics:default_year'] || ''} 
                      onChange={(e) => handleChange('academics:default_year', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="Ví dụ: 2026-2027"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:academic_year_start" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngày bắt đầu năm học</label>
                    <Input 
                      id="academics:academic_year_start" 
                      type="date"
                      value={formData['academics:academic_year_start'] || ''} 
                      onChange={(e) => handleChange('academics:academic_year_start', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:academic_year_end" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngày kết thúc năm học</label>
                    <Input 
                      id="academics:academic_year_end" 
                      type="date"
                      value={formData['academics:academic_year_end'] || ''} 
                      onChange={(e) => handleChange('academics:academic_year_end', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => handleSaveGroup(academicYearKeys, 'academic_year')} 
                      disabled={saving['academic_year']}
                      className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                    >
                      {saving['academic_year'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Lưu cấu hình năm học
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Semester Current Info */}
            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-indigo-650" />
                  Học kỳ hiện tại
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-450">Tên học kỳ hoạt động và thời gian bắt đầu/kết thúc.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1 md:col-span-2">
                    <label htmlFor="academics:default_semester" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Học kỳ mặc định *</label>
                    <Select 
                      id="academics:default_semester"
                      value={formData['academics:default_semester'] || 'SEM1'}
                      onChange={(e) => handleChange('academics:default_semester', e.target.value)}
                      disabled={!isAdmin}
                    >
                      <option value="SEM1">Học kỳ I (SEM1)</option>
                      <option value="SEM2">Học kỳ II (SEM2)</option>
                      <option value="SUMMER">Học kỳ Hè (SUMMER)</option>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:semester_start" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngày bắt đầu học kỳ</label>
                    <Input 
                      id="academics:semester_start" 
                      type="date"
                      value={formData['academics:semester_start'] || ''} 
                      onChange={(e) => handleChange('academics:semester_start', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:semester_end" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngày kết thúc học kỳ</label>
                    <Input 
                      id="academics:semester_end" 
                      type="date"
                      value={formData['academics:semester_end'] || ''} 
                      onChange={(e) => handleChange('academics:semester_end', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => handleSaveGroup(academicSemesterKeys, 'academic_semester')} 
                      disabled={saving['academic_semester']}
                      className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                    >
                      {saving['academic_semester'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Lưu học kỳ
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grades & Students Size limit */}
            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-650" />
                  Khối lớp & Sĩ số giới hạn
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-450">Danh sách các khối đang mở đào tạo và sĩ số chuẩn trong lớp.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <label htmlFor="academics:grade_levels" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Danh sách các khối học (Ngăn cách bằng dấu phẩy)</label>
                    <Textarea 
                      id="academics:grade_levels" 
                      value={formData['academics:grade_levels'] || ''} 
                      onChange={(e) => handleChange('academics:grade_levels', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="Lớp 1, Lớp 2..."
                      rows={3}
                      className="font-medium text-xs text-slate-800 leading-normal"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:default_max_students" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Sĩ số học sinh tối đa mặc định mỗi lớp</label>
                    <Input 
                      id="academics:default_max_students" 
                      type="number"
                      value={formData['academics:default_max_students'] || ''} 
                      onChange={(e) => handleChange('academics:default_max_students', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="35"
                    />
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => handleSaveGroup(gradeMaxStudentsKeys, 'grade_students')} 
                      disabled={saving['grade_students']}
                      className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                    >
                      {saving['grade_students'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Lưu khối & sĩ số
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Code Generation Rules */}
            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-650" />
                  Quy tắc sinh mã tự động
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-450">Định nghĩa định dạng mã số tự động cho học sinh và lead tuyển sinh.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <label htmlFor="academics:student_code_rule" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Quy tắc sinh mã học sinh</label>
                    <Input 
                      id="academics:student_code_rule" 
                      value={formData['academics:student_code_rule'] || ''} 
                      onChange={(e) => handleChange('academics:student_code_rule', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="HS[YYYY][XXXX]"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:lead_code_rule" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Quy tắc sinh mã hồ sơ tuyển sinh</label>
                    <Input 
                      id="academics:lead_code_rule" 
                      value={formData['academics:lead_code_rule'] || ''} 
                      onChange={(e) => handleChange('academics:lead_code_rule', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="LD-[YYYY]-[XXXX]"
                    />
                  </div>
                  <div className="md:col-span-2 p-3 bg-slate-50 border rounded-xl space-y-1 text-slate-500">
                    <div className="flex items-center gap-1 font-bold text-[10px] text-slate-700">
                      <Info className="w-3.5 h-3.5" />
                      Quy ước ký tự thay thế
                    </div>
                    <p className="text-[9px] leading-relaxed">
                      - <span className="font-bold font-mono text-slate-800">[YYYY]</span>: Thay thế bằng năm hiện tại 4 chữ số (ví dụ: 2026).
                    </p>
                    <p className="text-[9px] leading-relaxed">
                      - <span className="font-bold font-mono text-slate-800">[XXXX]</span>: Thay thế bằng số thứ tự tăng dần tự động (được độn thêm chữ số 0, ví dụ: 0001).
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => handleSaveGroup(codeGenKeys, 'code_gen')} 
                      disabled={saving['code_gen']}
                      className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                    >
                      {saving['code_gen'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Lưu quy tắc
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar working days & Summer Break */}
            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden lg:col-span-2">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-650" />
                  Lịch làm việc & Lịch nghỉ hè
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-450">Ngày học tập trong tuần và kế hoạch thời gian nghỉ hè của học sinh.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1 md:col-span-2">
                    <label htmlFor="academics:working_days" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngày làm việc & giảng dạy trong tuần</label>
                    <Input 
                      id="academics:working_days" 
                      value={formData['academics:working_days'] || ''} 
                      onChange={(e) => handleChange('academics:working_days', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:summer_break_start" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngày bắt đầu nghỉ hè</label>
                    <Input 
                      id="academics:summer_break_start" 
                      type="date"
                      value={formData['academics:summer_break_start'] || ''} 
                      onChange={(e) => handleChange('academics:summer_break_start', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="academics:summer_break_end" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngày kết thúc nghỉ hè</label>
                    <Input 
                      id="academics:summer_break_end" 
                      type="date"
                      value={formData['academics:summer_break_end'] || ''} 
                      onChange={(e) => handleChange('academics:summer_break_end', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="grid gap-1 md:col-span-2">
                    <label htmlFor="academics:summer_break_note" className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ghi chú lịch nghỉ hè</label>
                    <Textarea 
                      id="academics:summer_break_note" 
                      value={formData['academics:summer_break_note'] || ''} 
                      onChange={(e) => handleChange('academics:summer_break_note', e.target.value)}
                      disabled={!isAdmin}
                      placeholder="Thông tin chi tiết phát tới phụ huynh học sinh..."
                      rows={2}
                    />
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => handleSaveGroup(calendarKeys, 'calendar')} 
                      disabled={saving['calendar']}
                      className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl"
                    >
                      {saving['calendar'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Lưu lịch hoạt động
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Tab 3: Integrations */}
        <TabsContent value="integrations" activeValue={activeTab} className="space-y-6">

          {/* Card 1 – Email SMTP */}
          <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Cấu hình Mail Server (SMTP)
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">Tài khoản SMTP gửi thư tuyển sinh và thông báo tự động.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Toggle bật/tắt email */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Bật hệ thống email</p>
                  <p className="text-xs text-slate-500">Khi tắt, hệ thống sẽ không gửi bất kỳ email tự động nào</p>
                </div>
                <button
                  type="button"
                  onClick={() => isAdmin && handleIntegrationChange('email:enabled', integrationData['email:enabled'] === 'true' ? 'false' : 'true')}
                  disabled={!isAdmin}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${integrationData['email:enabled'] === 'true' ? 'bg-indigo-600' : 'bg-slate-300'} ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${integrationData['email:enabled'] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">SMTP Host</label>
                  <Input value={integrationData['email:smtp_host'] || ''} onChange={e => handleIntegrationChange('email:smtp_host', e.target.value)} disabled={!isAdmin} placeholder="smtp.gmail.com" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">SMTP Port</label>
                  <Input value={integrationData['email:smtp_port'] || '587'} onChange={e => handleIntegrationChange('email:smtp_port', e.target.value)} disabled={!isAdmin} placeholder="587" className="font-mono text-sm" type="number" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">SMTP Secure (TLS/SSL)</label>
                  <select
                    value={integrationData['email:smtp_secure'] || 'false'}
                    onChange={e => handleIntegrationChange('email:smtp_secure', e.target.value)}
                    disabled={!isAdmin}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="false">Không (STARTTLS - Port 587)</option>
                    <option value="true">Có (SSL - Port 465)</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">SMTP Username</label>
                  <Input value={integrationData['email:smtp_user'] || ''} onChange={e => handleIntegrationChange('email:smtp_user', e.target.value)} disabled={!isAdmin} placeholder="user@gmail.com" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">SMTP Password</label>
                  <div className="relative">
                    <Input
                      type={integrationData['email:smtp_password'] === '••••••••' ? 'text' : 'password'}
                      value={integrationData['email:smtp_password'] || ''}
                      onChange={e => handleIntegrationChange('email:smtp_password', e.target.value)}
                      disabled={!isAdmin}
                      placeholder={integrationData['email:smtp_password'] === '••••••••' ? 'Nhập mật khẩu mới để thay đổi' : 'Mật khẩu SMTP'}
                      className="font-mono text-sm pr-10"
                    />
                  </div>
                  <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Mật khẩu được mã hoá và không hiển thị sau khi lưu
                  </p>
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Email gửi đi mặc định</label>
                  <Input value={integrationData['email:from_email'] || ''} onChange={e => handleIntegrationChange('email:from_email', e.target.value)} disabled={!isAdmin} placeholder="noreply@misvn.edu.vn" className="font-mono text-sm" type="email" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Tên người gửi</label>
                  <Input value={integrationData['email:from_name'] || ''} onChange={e => handleIntegrationChange('email:from_name', e.target.value)} disabled={!isAdmin} placeholder="MIS Smart Portal" className="font-mono text-sm" />
                </div>
              </div>

              {isAdmin && (
                <div className="border-t pt-4 flex justify-end">
                  <Button
                    onClick={() => handleSaveIntegrationGroup(['email:enabled','email:smtp_host','email:smtp_port','email:smtp_secure','email:smtp_user','email:smtp_password','email:from_email','email:from_name','email:test_email'], 'smtp')}
                    disabled={savingIntegration['smtp']}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5"
                  >
                    {savingIntegration['smtp'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                    Lưu cấu hình Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2 – Test Email */}
          <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Kiểm tra kết nối Email
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">Gửi email kiểm tra để xác nhận cấu hình SMTP hoạt động.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Email nhận test</label>
                <Input
                  value={testEmailAddr}
                  onChange={e => setTestEmailAddr(e.target.value)}
                  disabled={!isAdmin}
                  placeholder="your@email.com"
                  type="email"
                  className="font-mono text-sm max-w-sm"
                />
              </div>
              {isAdmin && (
                <Button
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl px-5"
                >
                  {sendingTestEmail ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Mail className="h-4 w-4 mr-1.5" />}
                  Gửi email kiểm tra
                </Button>
              )}
              <p className="text-[10px] text-slate-400 font-semibold">Hệ thống email phải được bật và cấu hình đầy đủ trước khi test.</p>
            </CardContent>
          </Card>

          {/* Card 3 – Email Nghiệp vụ */}
          <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Email Nghiệp vụ Tuyển sinh
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">Cấu hình bật/tắt gửi email tự động theo từng nghiệp vụ tuyển sinh.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {([
                { key: 'email_notifications:on_lead_created', label: 'Gửi email khi tiếp nhận hồ sơ tuyển sinh mới', desc: 'Gửi xác nhận đến phụ huynh khi lead được tạo' },
                { key: 'email_notifications:on_appointment_booked', label: 'Gửi email khi hẹn lịch tư vấn', desc: 'Nhắc lịch hẹn tư vấn cho phụ huynh' },
                { key: 'email_notifications:on_seat_reserved', label: 'Gửi email đặt chỗ thành công', desc: 'Xác nhận đặt chỗ giữ vị trí học' },
                { key: 'email_notifications:on_enrolled', label: 'Gửi email xác nhận nhập học', desc: 'Chúc mừng và hướng dẫn nhập học' },
                { key: 'email_notifications:on_internal_alert', label: 'Gửi thông báo nội bộ quan trọng', desc: 'Alert nội bộ cho nhân sự liên quan' },
              ] as { key: string; label: string; desc: string }[]).map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => isAdmin && handleIntegrationChange(item.key, integrationData[item.key] === 'true' ? 'false' : 'true')}
                    disabled={!isAdmin}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrationData[item.key] === 'true' ? 'bg-indigo-600' : 'bg-slate-300'} ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${integrationData[item.key] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
              {isAdmin && (
                <div className="border-t pt-4 flex justify-end">
                  <Button
                    onClick={() => handleSaveIntegrationGroup(['email_notifications:on_lead_created','email_notifications:on_appointment_booked','email_notifications:on_seat_reserved','email_notifications:on_enrolled','email_notifications:on_internal_alert'], 'email_notif')}
                    disabled={savingIntegration['email_notif']}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5"
                  >
                    {savingIntegration['email_notif'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                    Lưu cấu hình
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4 – QR Thanh toán Tuyển sinh */}
          <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                QR Thanh toán Tuyển sinh
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">Cấu hình tài khoản ngân hàng và template nội dung chuyển khoản theo từng hồ sơ.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Toggle */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Bật QR thanh toán tuyển sinh</p>
                  <p className="text-xs text-slate-500">Cho phép tạo QR riêng cho từng hồ sơ đặt chỗ / nhập học</p>
                </div>
                <button
                  type="button"
                  onClick={() => isAdmin && handleIntegrationChange('payment_qr:enabled', integrationData['payment_qr:enabled'] === 'true' ? 'false' : 'true')}
                  disabled={!isAdmin}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrationData['payment_qr:enabled'] === 'true' ? 'bg-indigo-600' : 'bg-slate-300'} ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${integrationData['payment_qr:enabled'] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ngân hàng nhận tiền</label>
                  <Input value={integrationData['payment_qr:bank_name'] || ''} onChange={e => handleIntegrationChange('payment_qr:bank_name', e.target.value)} disabled={!isAdmin} placeholder="Vietcombank" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Mã ngân hàng</label>
                  <Input value={integrationData['payment_qr:bank_code'] || ''} onChange={e => handleIntegrationChange('payment_qr:bank_code', e.target.value)} disabled={!isAdmin} placeholder="VCB" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">BIN ngân hàng (VietQR)</label>
                  <Input value={integrationData['payment_qr:bank_bin'] || ''} onChange={e => handleIntegrationChange('payment_qr:bank_bin', e.target.value)} disabled={!isAdmin} placeholder="970436" className="font-mono text-sm" />
                  <p className="text-[10px] text-slate-400">Vietcombank=970436, VietinBank=970415, BIDV=970418, Techcombank=970407, MB=970422</p>
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Số tài khoản *</label>
                  <Input value={integrationData['payment_qr:account_number'] || ''} onChange={e => handleIntegrationChange('payment_qr:account_number', e.target.value)} disabled={!isAdmin} placeholder="0123456789" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Tên chủ tài khoản</label>
                  <Input value={integrationData['payment_qr:account_name'] || ''} onChange={e => handleIntegrationChange('payment_qr:account_name', e.target.value.toUpperCase())} disabled={!isAdmin} placeholder="TRUONG MIS" className="font-mono text-sm uppercase" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Prefix mã giao dịch</label>
                  <Input value={integrationData['payment_qr:transaction_prefix'] || ''} onChange={e => handleIntegrationChange('payment_qr:transaction_prefix', e.target.value)} disabled={!isAdmin} placeholder="MIS" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Số tiền đặt chỗ mặc định (VNĐ)</label>
                  <Input value={integrationData['payment_qr:default_reservation_amount'] || ''} onChange={e => handleIntegrationChange('payment_qr:default_reservation_amount', e.target.value)} disabled={!isAdmin} placeholder="5000000" type="number" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Số tiền nhập học mặc định (VNĐ)</label>
                  <Input value={integrationData['payment_qr:default_enrollment_amount'] || ''} onChange={e => handleIntegrationChange('payment_qr:default_enrollment_amount', e.target.value)} disabled={!isAdmin} placeholder="0" type="number" className="font-mono text-sm" />
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Mẫu nội dung chuyển khoản</label>
                <Input value={integrationData['payment_qr:transfer_template'] || ''} onChange={e => handleIntegrationChange('payment_qr:transfer_template', e.target.value)} disabled={!isAdmin} placeholder="MIS-{LEAD_CODE}-{STUDENT_NAME}" className="font-mono text-sm" />
                <p className="text-[10px] text-slate-400 font-semibold">Biến hỗ trợ: <code className="bg-slate-100 px-1 rounded">{'{LEAD_CODE} {STUDENT_NAME} {PARENT_NAME} {PHONE} {PAYMENT_TYPE}'}</code> · Tối đa 50 ký tự</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Chế độ xác nhận thanh toán</label>
                  <select
                    value={integrationData['payment_qr:confirmation_mode'] || 'manual'}
                    onChange={e => handleIntegrationChange('payment_qr:confirmation_mode', e.target.value)}
                    disabled={!isAdmin}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="manual">Thủ công (nhân viên xác nhận)</option>
                    <option value="auto">Tự động (đổi trạng thái sau xác nhận)</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Ghi chú thanh toán</label>
                  <Input value={integrationData['payment_qr:note'] || ''} onChange={e => handleIntegrationChange('payment_qr:note', e.target.value)} disabled={!isAdmin} placeholder="Ghi chú hiển thị trên phiếu thanh toán" className="text-sm" />
                </div>
              </div>

              {isAdmin && (
                <div className="border-t pt-4 flex justify-end">
                  <Button
                    onClick={() => handleSaveIntegrationGroup(['payment_qr:enabled','payment_qr:bank_name','payment_qr:bank_code','payment_qr:bank_bin','payment_qr:account_number','payment_qr:account_name','payment_qr:transfer_template','payment_qr:transaction_prefix','payment_qr:default_reservation_amount','payment_qr:default_enrollment_amount','payment_qr:confirmation_mode','payment_qr:note'], 'payment_qr')}
                    disabled={savingIntegration['payment_qr']}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5"
                  >
                    {savingIntegration['payment_qr'] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                    Lưu cấu hình QR
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 5 – Test QR */}
          <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-green-600" />
                Kiểm tra tạo QR
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">Nhập thông tin hồ sơ mẫu để xem nội dung chuyển khoản và preview QR.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Mã hồ sơ test</label>
                  <Input value={qrTestParams.leadCode} onChange={e => setQrTestParams(p => ({...p, leadCode: e.target.value}))} placeholder="LD-2026-TEST01" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Tên học sinh test</label>
                  <Input value={qrTestParams.studentName} onChange={e => setQrTestParams(p => ({...p, studentName: e.target.value}))} placeholder="Nguyễn Văn An" className="text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Số tiền (VNĐ)</label>
                  <Input value={qrTestParams.amount} onChange={e => setQrTestParams(p => ({...p, amount: e.target.value}))} placeholder="5000000" type="number" className="font-mono text-sm" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Loại thanh toán</label>
                  <select
                    value={qrTestParams.paymentType}
                    onChange={e => setQrTestParams(p => ({...p, paymentType: e.target.value as 'reservation' | 'enrollment'}))}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="reservation">Đặt chỗ giữ vị trí</option>
                    <option value="enrollment">Nhập học</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerateTestQr}
                disabled={generatingQr}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl px-5"
              >
                {generatingQr ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <QrCode className="h-4 w-4 mr-1.5" />}
                Tạo QR kiểm tra
              </Button>

              {qrResult && (
                <div className="border border-indigo-100 rounded-2xl bg-indigo-50/30 p-5 space-y-4">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <img src={qrResult.qrUrl} alt="QR thanh toán" className="w-48 h-48 rounded-xl border border-slate-200 bg-white p-2 shadow" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Ngân hàng</span>
                        <p className="font-bold text-slate-800">{qrResult.bankName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Số tài khoản</span>
                        <p className="font-mono font-bold text-slate-800">{qrResult.accountNumber}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Chủ tài khoản</span>
                        <p className="font-bold text-slate-800">{qrResult.accountName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Số tiền</span>
                        <p className="font-bold text-indigo-700">{Number(qrResult.amount).toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Nội dung chuyển khoản</span>
                        <p className="font-mono font-black text-indigo-800 text-base bg-white border border-indigo-200 rounded-lg px-3 py-1.5 mt-1">{qrResult.transferContent}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="security" activeValue={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="bg-rose-50/60 border-b pb-4 dark:bg-rose-950/20 dark:border-slate-800"><CardTitle className="text-lg font-black flex items-center gap-2"><KeyRound className="w-5 h-5 text-rose-600" />Chính sách mật khẩu</CardTitle><CardDescription className="text-xs font-semibold text-slate-500">Policy lưu trong system_settings.</CardDescription></CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[['security:min_password_length','Độ dài tối thiểu'],['security:max_login_attempts','Số lần sai tối đa'],['security:lockout_minutes','Khóa tài khoản (phút)'],['security:password_rotation_days','Chu kỳ đổi MK (ngày)']].map(([key,label]) => <div key={key} className="grid gap-1"><label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">{label}</label><Input type="number" value={securityData[key] || ''} onChange={e => handleSecurityChange(key, e.target.value)} disabled={!isAdmin} className="font-mono text-sm" /></div>)}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[['security:require_uppercase','Yêu cầu chữ hoa'],['security:require_lowercase','Yêu cầu chữ thường'],['security:require_number','Yêu cầu số'],['security:require_special_char','Yêu cầu ký tự đặc biệt']].map(([key,label]) => <label key={key} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold dark:border-slate-800"><input type="checkbox" checked={securityData[key] === 'true'} onChange={e => handleSecurityChange(key, e.target.checked ? 'true' : 'false')} disabled={!isAdmin} />{label}</label>)}</div>
                {isAdmin && <Button onClick={handleSaveSecurity} disabled={savingSecurity.security} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl">{savingSecurity.security ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}Lưu bảo mật</Button>}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="bg-indigo-50/60 border-b pb-4 dark:bg-indigo-950/20 dark:border-slate-800"><CardTitle className="text-lg font-black flex items-center gap-2"><MonitorCog className="w-5 h-5 text-indigo-600" />Phiên đăng nhập</CardTitle><CardDescription className="text-xs font-semibold text-slate-500">TODO tích hợp auth middleware thật.</CardDescription></CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[['security:session_timeout_minutes','Hết hạn session (phút)'],['security:idle_timeout_minutes','Idle timeout (phút)']].map(([key,label]) => <div key={key} className="grid gap-1"><label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">{label}</label><Input type="number" value={securityData[key] || ''} onChange={e => handleSecurityChange(key, e.target.value)} disabled={!isAdmin} className="font-mono text-sm" /></div>)}</div>
                {[['security:auto_logout_idle','Tự động logout khi idle'],['security:allow_multiple_sessions','Cho phép nhiều thiết bị'],['security:require_reauth_sensitive','Re-auth khi sửa cấu hình nhạy cảm']].map(([key,label]) => <label key={key} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold dark:border-slate-800"><input type="checkbox" checked={securityData[key] === 'true'} onChange={e => handleSecurityChange(key, e.target.checked ? 'true' : 'false')} disabled={!isAdmin} />{label}</label>)}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="bg-amber-50/60 border-b pb-4 dark:bg-amber-950/20 dark:border-slate-800"><CardTitle className="text-lg font-black flex items-center gap-2"><Shield className="w-5 h-5 text-amber-600" />Chế độ đổi user/demo mode</CardTitle><CardDescription className="text-xs font-semibold text-slate-500">Kiểm soát nút Đổi user trên header.</CardDescription></CardHeader>
              <CardContent className="p-6 space-y-3">
                {[['user_switcher:enabled','Bật chế độ đổi user'],['user_switcher:allow_in_production','Cho phép trong production'],['user_switcher:admin_only','Chỉ Admin được dùng'],['user_switcher:log_switching','Ghi audit khi đổi user']].map(([key,label]) => <label key={key} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold dark:border-slate-800"><input type="checkbox" checked={userSwitcherData[key] === 'true'} onChange={e => handleSwitcherChange(key, e.target.checked ? 'true' : 'false')} disabled={!isAdmin} />{label}</label>)}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><AlertTriangle className="inline w-4 h-4 mr-1" />Không nên bật công khai trong vận hành thật.</div>
                {isAdmin && <Button onClick={handleSaveSwitcher} disabled={savingSecurity.switcher} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl">{savingSecurity.switcher ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}Lưu Demo mode</Button>}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="bg-slate-50/60 border-b pb-4 dark:bg-slate-900 dark:border-slate-800"><CardTitle className="text-lg font-black flex items-center gap-2"><Shield className="w-5 h-5" />Quyền quản trị hệ thống</CardTitle><CardDescription className="text-xs font-semibold text-slate-500">Mapping quyền tập trung theo role.</CardDescription></CardHeader>
              <CardContent className="p-6 overflow-x-auto">
                <table className="w-full text-xs border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Role</th><th>Xem</th><th>Sửa</th><th>Bảo mật</th><th>Audit</th><th>Đổi user</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold">
                    {[
                      ['ADMIN','Có','Có','Có','Có','Có'],
                      ['MANAGER','Có','Hạn chế','Không','Có','Không'],
                      ['STAFF','Không','Không','Không','Không','Không']
                    ].map(row => (
                      <tr key={row[0]} className={row[0] === 'ADMIN' ? 'bg-emerald-50/80 dark:bg-emerald-950/20' : row[0] === 'MANAGER' ? 'bg-amber-50/80 dark:bg-amber-950/20' : 'bg-rose-50/70 dark:bg-rose-950/20'}>
                        {row.map((cell, cellIndex) => {
                          const badgeClass = cell === 'Có'
                            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800'
                            : cell === 'Không'
                              ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-800'
                              : cell === 'Hạn chế'
                                ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800'
                                : row[0] === 'ADMIN'
                                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                  : row[0] === 'MANAGER'
                                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                                    : 'bg-slate-700 text-white shadow-sm shadow-slate-500/20';
                          return (
                            <td key={`${row[0]}-${cellIndex}`} className={cellIndex === 0 ? 'py-3 pl-3 rounded-l-2xl' : cellIndex === row.length - 1 ? 'py-3 pr-3 rounded-r-2xl' : 'py-3 pr-3'}>
                              <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-[11px] font-black ${badgeClass}`}>{cell}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-3xs overflow-hidden dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="bg-slate-50/60 border-b pb-4 dark:bg-slate-900 dark:border-slate-800"><CardTitle className="text-lg font-black flex items-center gap-2"><History className="w-5 h-5 text-indigo-600" />Nhật ký hoạt động cấu hình</CardTitle><CardDescription className="text-xs font-semibold text-slate-500">Audit log; secret được mask tự động.</CardDescription></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3"><Input placeholder="Actor ID" value={auditFilters.actor} onChange={e => setAuditFilters(p => ({...p, actor: e.target.value}))} /><Input placeholder="Module" value={auditFilters.module} onChange={e => setAuditFilters(p => ({...p, module: e.target.value}))} /><Input placeholder="Action" value={auditFilters.action} onChange={e => setAuditFilters(p => ({...p, action: e.target.value}))} /><select value={auditFilters.success} onChange={e => setAuditFilters(p => ({...p, success: e.target.value}))} className="h-10 rounded-xl border border-slate-200 px-3 text-sm dark:bg-slate-950 dark:border-slate-800"><option value="">Kết quả</option><option value="true">Thành công</option><option value="false">Thất bại</option></select><Input type="date" value={auditFilters.from} onChange={e => setAuditFilters(p => ({...p, from: e.target.value}))} /><Button onClick={handleFilterAudit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">Lọc</Button></div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-900 text-slate-500"><tr><th className="p-3 text-left">Thời gian</th><th className="p-3 text-left">Người thực hiện</th><th className="p-3 text-left">Vai trò</th><th className="p-3 text-left">Hành động</th><th className="p-3 text-left">Module</th><th className="p-3 text-left">Kết quả</th><th className="p-3 text-left">Chi tiết</th></tr></thead><tbody>{auditLogs.map(log => { const meta = log.metadata || {}; return <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3 font-mono">{new Date(log.createdAt).toLocaleString('vi-VN')}</td><td className="p-3 font-bold">{meta.actor?.name || log.actorId || 'System'}</td><td className="p-3">{meta.actor?.role || '-'}</td><td className="p-3 font-mono font-bold">{log.action}</td><td className="p-3">{meta.module || log.entityType}</td><td className="p-3"><span className={meta.success === false ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>{meta.success === false ? 'Thất bại' : 'OK'}</span></td><td className="p-3 max-w-xs truncate" title={JSON.stringify(meta)}>{meta.errorMessage || log.entityId}</td></tr>; })}{auditLogs.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400 font-bold">Chưa có audit log phù hợp.</td></tr>}</tbody></table></div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
