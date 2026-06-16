'use client';
import * as React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

import { useToast } from '@/src/components/ui/Toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { getSettings, saveSettings, testSmtpConnection, testVietQrConnection } from './actions';
import { Loader2, Save, Mail, QrCode, Building2, Shield, Settings2 } from 'lucide-react';
import { Textarea } from '@/src/components/ui/textarea';

export default function SettingsClient({ isAdmin }: { isAdmin: boolean }) {
  const [activeTab, setActiveTab] = React.useState('general');
  const { toast } = useToast();
  const [settings, setSettings] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingQr, setTestingQr] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      const initialForm: Record<string, string> = {};
      data.forEach((item: any) => {
        initialForm[item.key] = item.value;
      });
      setFormData(initialForm);
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

  const handleSaveGroup = async (groupKeys: string[]) => {
    try {
      setSaving(true);
      const updates = groupKeys.map(k => ({ key: k, value: formData[k] }));
      await saveSettings(updates);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã lưu cấu hình' });
      await loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      const res = await testSmtpConnection();
      toast({ variant: 'info', title: 'Kết quả', message: (res as any).message });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestQr = async () => {
    try {
      setTestingQr(true);
      const res = await testVietQrConnection();
      toast({ variant: 'info', title: 'Kết quả', message: (res as any).message });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setTestingQr(false);
    }
  };

  // Helper to render a group of settings
  const renderGroup = (groupId: string, title: string, description: string, keys: string[], onExtraAction?: () => React.ReactNode) => {
    const groupSettings = settings.filter(s => keys.includes(s.key));
    if (groupSettings.length === 0 && !loading) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupSettings.map(setting => (
            <div key={setting.key} className="grid gap-2">
              <label htmlFor={setting.key} className="font-semibold">{setting.label || setting.key}</label>
              {setting.description && <p className="text-xs text-muted-foreground">{setting.description}</p>}
              {setting.isSecret ? (
                <div className="relative">
                  <Input 
                    id={setting.key}
                    type="password"
                    value={formData[setting.key] || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    disabled={!setting.isEditable || !isAdmin}
                    className="font-mono"
                    placeholder="••••••••"
                  />
                </div>
              ) : (
                <Input 
                  id={setting.key}
                  value={formData[setting.key] || ''}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  disabled={!setting.isEditable || !isAdmin}
                />
              )}
            </div>
          ))}
          {onExtraAction && onExtraAction()}
        </CardContent>
        {isAdmin && groupSettings.some(s => s.isEditable) && (
          <div className="border-t pt-6">
            <Button onClick={() => handleSaveGroup(keys)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Lưu thay đổi
            </Button>
          </div>
        )}
      </Card>
    );
  };

  if (loading && settings.length === 0) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cấu hình Hệ thống</h1>
        <p className="text-muted-foreground mt-1">Quản lý các thiết lập chung, kết nối API, email, và cổng thanh toán.</p>
      </div>

      <Tabs className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger active={activeTab === "general"} onClick={() => setActiveTab("general")}><Building2 className="w-4 h-4 mr-2"/> Thông tin chung</TabsTrigger>
          <TabsTrigger active={activeTab === "academics"} onClick={() => setActiveTab("academics")}><Settings2 className="w-4 h-4 mr-2"/> Học vụ</TabsTrigger>
          <TabsTrigger active={activeTab === "integrations"} onClick={() => setActiveTab("integrations")}><Mail className="w-4 h-4 mr-2"/> Kết nối</TabsTrigger>
          <TabsTrigger active={activeTab === "security"} onClick={() => setActiveTab("security")}><Shield className="w-4 h-4 mr-2"/> Bảo mật</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" activeValue={activeTab}>
          {renderGroup(
            'school_info',
            'Thông tin Trường học',
            'Thông tin cơ bản hiển thị trên các báo cáo và hóa đơn.',
            ['school_info:name', 'school_info:hotline']
          )}
        </TabsContent>

        <TabsContent value="academics" activeValue={activeTab}>
          {renderGroup(
            'academics',
            'Học vụ & Đào tạo',
            'Thiết lập mặc định cho năm học, học kỳ hiện hành.',
            ['academics:default_year', 'academics:default_semester']
          )}
        </TabsContent>

        <TabsContent value="integrations" activeValue={activeTab}>
          {/* SMTP Mock Setup */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><Mail className="h-5 w-5"/> Cấu hình Email (SMTP)</CardTitle>
              <CardDescription>Kết nối Mail server để gửi thông báo tự động (chưa khởi tạo db schema mock).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 opacity-50 pointer-events-none">
               <div className="grid gap-2">
                 <label>SMTP Host</label>
                 <Input value="smtp.gmail.com" readOnly />
               </div>
               <div className="grid gap-2">
                 <label>SMTP Username</label>
                 <Input value="admin@mis.edu.vn" readOnly />
               </div>
               <div className="grid gap-2">
                 <label>SMTP Password</label>
                 <Input type="password" value="••••••••" readOnly />
               </div>
            </CardContent>
            {isAdmin && (
              <div className="border-t pt-6 gap-2">
                <Button disabled><Save className="h-4 w-4 mr-2" /> Lưu thay đổi</Button>
                <Button variant="outline" onClick={handleTestSmtp} disabled={testingSmtp}>
                  {testingSmtp ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Kiểm tra kết nối
                </Button>
              </div>
            )}
          </Card>

          {/* VietQR Mock Setup */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><QrCode className="h-5 w-5"/> Cổng thanh toán VietQR</CardTitle>
              <CardDescription>Kết nối API VietQR tạo mã thanh toán tự động.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 opacity-50 pointer-events-none">
               <div className="grid gap-2">
                 <label>Client ID</label>
                 <Input value="VQR-TEST-12345" readOnly />
               </div>
               <div className="grid gap-2">
                 <label>API Key</label>
                 <Input type="password" value="••••••••" readOnly />
               </div>
            </CardContent>
            {isAdmin && (
              <div className="border-t pt-6 gap-2">
                <Button disabled><Save className="h-4 w-4 mr-2" /> Lưu thay đổi</Button>
                <Button variant="outline" onClick={handleTestQr} disabled={testingQr}>
                  {testingQr ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Kiểm tra kết nối
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" activeValue={activeTab}>
          {renderGroup(
            'chat',
            'Quyền riêng tư - Trò chuyện',
            'Thiết lập quyền trò chuyện nội bộ cho giáo viên và nhân viên.',
            ['chat:allow_dm', 'chat:allow_tag_department', 'chat:allow_tag_all', 'chat:mention_limit']
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}
