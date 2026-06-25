'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { mockSettingsService, ApprovalWorkflow } from '@/src/lib/mockSettingsService';

export default function ApprovalWorkflowsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ApprovalWorkflow>>({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await mockSettingsService.getItems('service_approval_workflows');
      setSettings(data);
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể tải dữ liệu quy trình phê duyệt' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (item: ApprovalWorkflow) => {
    setFormData(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quy trình này?')) return;
    try {
      await mockSettingsService.deleteItem('service_approval_workflows', id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa quy trình' });
      fetchSettings();
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể xóa quy trình' });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.requestType) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Vui lòng điền tên quy trình và loại yêu cầu' });
        return;
      }

      if (formData.id) {
        await mockSettingsService.updateItem('service_approval_workflows', formData.id, formData);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã cập nhật quy trình' });
      } else {
        await mockSettingsService.createItem('service_approval_workflows', {
          ...formData,
          status: 'active',
          campusId: 'camp-01',
          campusName: 'Cơ sở Chính',
          schoolYear: '2026-2027',
          name: formData.name,
          requestType: formData.requestType,
          levels: formData.levels || [
            { levelId: 'l1', roleType: 'handler', slaHours: 24, autoEscalate: false },
          ],
        } as Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã thêm quy trình mới' });
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
          <CardTitle>{formData.id ? 'Sửa quy trình' : 'Thêm quy trình mới'}</CardTitle>
          <CardDescription>Thiết lập luồng duyệt và SLA cho từng loại yêu cầu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tên quy trình <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="VD: Quy trình Duyệt Nghỉ phép" 
              />
            </div>
            <div className="space-y-2">
              <Label>Loại yêu cầu <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.requestType || ''}
                onChange={(e) => setFormData({...formData, requestType: e.target.value})}
              >
                <option value="">Chọn loại yêu cầu...</option>
                <option value="leave_request">Xin nghỉ phép</option>
                <option value="meal_cancel">Hủy suất ăn</option>
                <option value="transport_change">Đổi tuyến xe</option>
                <option value="facility_repair">Sửa chữa CSVC</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Label>Các cấp duyệt</Label>
            <div className="space-y-3">
              {(formData.levels || []).map((level, index) => (
                <div key={index} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-slate-200 dark:border-slate-800">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Cấp {index + 1}: Vai trò</Label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                      value={level.roleType}
                      onChange={(e) => {
                        const newLevels = [...(formData.levels || [])];
                        newLevels[index].roleType = e.target.value as any;
                        setFormData({...formData, levels: newLevels});
                      }}
                    >
                      <option value="creator">Người tạo</option>
                      <option value="handler">Nhân viên xử lý</option>
                      <option value="manager">Trưởng bộ phận</option>
                      <option value="board">BGH/Hội đồng trường</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">SLA (Giờ)</Label>
                    <Input 
                      type="number"
                      value={level.slaHours}
                      onChange={(e) => {
                        const newLevels = [...(formData.levels || [])];
                        newLevels[index].slaHours = parseInt(e.target.value);
                        setFormData({...formData, levels: newLevels});
                      }}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mt-6 text-red-500"
                    onClick={() => {
                      const newLevels = [...(formData.levels || [])];
                      newLevels.splice(index, 1);
                      setFormData({...formData, levels: newLevels});
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newLevels = [...(formData.levels || [])];
                  newLevels.push({ levelId: `l${Date.now()}`, roleType: 'handler', slaHours: 24, autoEscalate: false });
                  setFormData({...formData, levels: newLevels});
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm cấp duyệt
              </Button>
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
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Quy trình Phê duyệt</h3>
          <p className="text-sm text-slate-500">Cấu hình luồng duyệt và SLA cho các yêu cầu phát sinh.</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm quy trình
        </Button>
      </div>

      {settings.length === 0 ? (
        <div className="text-center p-12 border border-slate-200 dark:border-slate-800 rounded-lg">
          <h4 className="text-slate-900 dark:text-white font-medium mb-2">Chưa có dữ liệu</h4>
          <p className="text-slate-500 mb-4">Chưa có quy trình phê duyệt nào được cấu hình.</p>
          <Button onClick={() => setIsEditing(true)} variant="outline">Thêm quy trình đầu tiên</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {settings.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription className="mt-1">Loại yêu cầu: <span className="font-medium text-slate-700 dark:text-slate-300">{item.requestType}</span></CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={item.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' : 'bg-slate-100 text-slate-700'}>
                      {item.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-3 h-3 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {item.levels.map((level, index) => (
                    <React.Fragment key={level.levelId}>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-w-[120px]">
                        <span className="text-xs font-medium text-slate-500 mb-1">Cấp {index + 1}</span>
                        <span className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                          {level.roleType === 'creator' ? 'Người tạo' :
                           level.roleType === 'handler' ? 'NV Xử lý' :
                           level.roleType === 'manager' ? 'Trưởng bộ phận' : 'Ban giám hiệu'}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">SLA: {level.slaHours}h</span>
                      </div>
                      {index < item.levels.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
