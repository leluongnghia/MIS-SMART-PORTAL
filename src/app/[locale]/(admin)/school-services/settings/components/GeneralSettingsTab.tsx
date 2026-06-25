'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { mockSettingsService, GeneralSetting } from '@/src/lib/mockSettingsService';

export default function GeneralSettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<GeneralSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<GeneralSetting>>({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await mockSettingsService.getItems('service_general_settings');
      setSettings(data);
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể tải dữ liệu cấu hình' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (item: GeneralSetting) => {
    setFormData(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) return;
    try {
      await mockSettingsService.deleteItem('service_general_settings', id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa cấu hình' });
      fetchSettings();
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể xóa cấu hình' });
    }
  };

  const handleSave = async () => {
    try {
      if (formData.id) {
        await mockSettingsService.updateItem('service_general_settings', formData.id, formData);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã cập nhật cấu hình' });
      } else {
        await mockSettingsService.createItem('service_general_settings', {
          ...formData,
          status: 'active',
          campusId: 'camp-01',
          campusName: 'Cơ sở Chính',
          schoolYear: '2026-2027',
          name: formData.name || 'Cấu hình mới',
          term: formData.term || 'Học kỳ 1',
          services: formData.services || { meals: true, transport: true, health: true, facilities: true, boarding: false },
          requestCutoffTime: formData.requestCutoffTime || '15:00',
          slaNormal: formData.slaNormal || 24,
          slaHigh: formData.slaHigh || 8,
          slaUrgent: formData.slaUrgent || 2,
          autoAssignHealthTickets: formData.autoAssignHealthTickets || false,
          autoSendReports: formData.autoSendReports || false,
        } as Omit<GeneralSetting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã thêm cấu hình mới' });
      }
      setIsEditing(false);
      setFormData({});
      fetchSettings();
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Đã có lỗi xảy ra khi lưu' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{formData.id ? 'Sửa cấu hình chung' : 'Thêm cấu hình mới'}</CardTitle>
          <CardDescription>Cập nhật các tham số áp dụng cho toàn bộ khối Dịch vụ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tên cấu hình</Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="VD: Cấu hình chung NH 2026-2027" 
              />
            </div>
            <div className="space-y-2">
              <Label>Học kỳ</Label>
              <Input 
                value={formData.term || ''} 
                onChange={(e) => setFormData({...formData, term: e.target.value})} 
                placeholder="VD: Học kỳ 1" 
              />
            </div>
            <div className="space-y-2">
              <Label>Giờ chốt yêu cầu trong ngày</Label>
              <Input 
                type="time"
                value={formData.requestCutoffTime || '15:00'} 
                onChange={(e) => setFormData({...formData, requestCutoffTime: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>SLA Bình thường (Giờ)</Label>
              <Input 
                type="number"
                value={formData.slaNormal || 24} 
                onChange={(e) => setFormData({...formData, slaNormal: parseInt(e.target.value)})} 
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
            <Button className="bg-blue-600 text-white" onClick={handleSave}>Lưu lại</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Cấu hình chung</h3>
          <p className="text-sm text-slate-500">Quản lý tham số và cài đặt hệ thống dùng chung.</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm cấu hình
        </Button>
      </div>

      {settings.length === 0 ? (
        <div className="text-center p-12 border border-slate-200 dark:border-slate-800 rounded-lg">
          <h4 className="text-slate-900 dark:text-white font-medium mb-2">Chưa có dữ liệu</h4>
          <p className="text-slate-500 mb-4">Bạn chưa tạo cấu hình chung nào cho hệ thống.</p>
          <Button onClick={() => setIsEditing(true)} variant="outline">Tạo cấu hình đầu tiên</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead>Tên cấu hình</TableHead>
                  <TableHead>Năm học/Kỳ</TableHead>
                  <TableHead>Cơ sở</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.schoolYear} - {item.term}</TableCell>
                    <TableCell>{item.campusName}</TableCell>
                    <TableCell>
                      <Badge className={item.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' : 'bg-slate-100 text-slate-700'}>
                        {item.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
