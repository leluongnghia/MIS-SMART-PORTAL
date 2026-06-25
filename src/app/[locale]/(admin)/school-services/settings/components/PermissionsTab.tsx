'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { mockSettingsService, ServiceStaffAssignment } from '@/src/lib/mockSettingsService';

export default function PermissionsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ServiceStaffAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceStaffAssignment>>({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await mockSettingsService.getItems('service_staff_assignments');
      setSettings(data);
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể tải dữ liệu phân công' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (item: ServiceStaffAssignment) => {
    setFormData(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;
    try {
      await mockSettingsService.deleteItem('service_staff_assignments', id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa phân công' });
      fetchSettings();
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể xóa phân công' });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.staffId || !formData.serviceId || !formData.role || !formData.scope || !formData.startDate || !formData.endDate) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Vui lòng điền đầy đủ các trường bắt buộc' });
        return;
      }
      
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu' });
        return;
      }

      // Check duplicates
      const isDuplicate = settings.some(s => 
        s.staffId === formData.staffId && 
        s.serviceId === formData.serviceId && 
        s.scope === formData.scope &&
        s.id !== formData.id &&
        s.status === 'active'
      );

      if (isDuplicate) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Nhân sự này đã được phân công cho dịch vụ và phạm vi này (đang hoạt động).' });
        return;
      }

      if (formData.id) {
        await mockSettingsService.updateItem('service_staff_assignments', formData.id, formData);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã cập nhật phân công' });
      } else {
        // Mock fetching staff details based on ID (In real app, we get this from User select component)
        const staffName = formData.staffId === 'staff-001' ? 'Nguyễn Văn A' : 
                          formData.staffId === 'staff-002' ? 'Trần Thị B' : 
                          formData.staffId === 'staff-003' ? 'Lê Văn C' : 'Nhân viên Mới';
        const staffCode = 'NV' + formData.staffId.replace('staff-', '');
        const department = 'Phòng Hành chính';

        await mockSettingsService.createItem('service_staff_assignments', {
          ...formData,
          status: formData.status || 'active',
          campusId: 'camp-01',
          campusName: 'Cơ sở Chính',
          schoolYear: '2026-2027',
          name: `${staffName} - ${formData.serviceId}`,
          staffId: formData.staffId,
          staffName,
          staffCode,
          department,
          serviceId: formData.serviceId,
          role: formData.role,
          scope: formData.scope,
          inheritedPermissions: ['view'], // Mock
          startDate: formData.startDate,
          endDate: formData.endDate,
          notes: formData.notes || '',
        } as Omit<ServiceStaffAssignment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã thêm phân công mới' });
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
          <CardTitle>{formData.id ? 'Sửa phân công' : 'Thêm phân công mới'}</CardTitle>
          <CardDescription>Gán nhân sự vào các dịch vụ với vai trò và phạm vi cụ thể.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nhân sự <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.staffId || ''}
                onChange={(e) => setFormData({...formData, staffId: e.target.value})}
              >
                <option value="">Chọn nhân sự...</option>
                <option value="staff-001">Nguyễn Văn A (NV001) - Hành chính</option>
                <option value="staff-002">Trần Thị B (NV002) - Kế toán</option>
                <option value="staff-003">Lê Văn C (NV003) - Y tế</option>
                <option value="staff-004">Phạm Thị D (NV004) - Hành chính</option>
                <option value="staff-005">Hoàng Văn E (NV005) - Giám thị</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Chỉ hiển thị nhân sự có quyền truy cập module Dịch vụ.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Dịch vụ phụ trách <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.serviceId || ''}
                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              >
                <option value="">Chọn dịch vụ...</option>
                <option value="transport">Xe đưa đón</option>
                <option value="meals">Bếp ăn/Ăn uống</option>
                <option value="health">Y tế học đường</option>
                <option value="facilities">Cơ sở vật chất</option>
                <option value="boarding">Bán trú/Nội trú</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Vai trò trong dịch vụ <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.role || ''}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="">Chọn vai trò...</option>
                <option value="manager">Phụ trách chính</option>
                <option value="handler">Nhân viên xử lý</option>
                <option value="approver">Người phê duyệt</option>
                <option value="follower">Người theo dõi</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Phạm vi phụ trách <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.scope || ''}
                onChange={(e) => setFormData({...formData, scope: e.target.value as any})}
              >
                <option value="">Chọn phạm vi...</option>
                <option value="all">Toàn trường</option>
                <option value="campus">Theo cơ sở</option>
                <option value="route">Theo tuyến xe</option>
                <option value="meal_group">Theo nhóm suất ăn</option>
                <option value="area">Theo khu vực/phòng ban</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Từ ngày <span className="text-red-500">*</span></Label>
              <Input 
                type="date"
                value={formData.startDate || ''} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Đến ngày <span className="text-red-500">*</span></Label>
              <Input 
                type="date"
                value={formData.endDate || ''} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.status || 'active'}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="active">Hoạt động</option>
                <option value="locked">Tạm khóa</option>
                <option value="expired">Hết hiệu lực</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Input 
                value={formData.notes || ''} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                placeholder="Lý do phân công hoặc chi tiết khu vực..." 
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
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Phân công Nhân sự Dịch vụ</h3>
          <p className="text-sm text-slate-500">Gán nhân sự đã được cấp quyền hệ thống vào phụ trách từng dịch vụ học đường.</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm phân công
        </Button>
      </div>

      {settings.length === 0 ? (
        <div className="text-center p-12 border border-slate-200 dark:border-slate-800 rounded-lg">
          <h4 className="text-slate-900 dark:text-white font-medium mb-2">Chưa có dữ liệu</h4>
          <p className="text-slate-500 mb-4">Chưa có nhân sự nào được phân công phụ trách dịch vụ.</p>
          <Button onClick={() => setIsEditing(true)} variant="outline">Thêm phân công đầu tiên</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="w-[200px]">Nhân sự</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Vai trò / Phạm vi</TableHead>
                    <TableHead>Quyền kế thừa</TableHead>
                    <TableHead>Hiệu lực</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-white">{item.staffName}</div>
                        <div className="text-xs text-slate-500">{item.staffCode} • {item.department}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {item.serviceId === 'meals' ? 'Bếp ăn' : 
                           item.serviceId === 'transport' ? 'Xe đưa đón' : 
                           item.serviceId === 'health' ? 'Y tế' : 
                           item.serviceId === 'facilities' ? 'Cơ sở vật chất' : 'Bán trú/Nội trú'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">
                            {item.role === 'manager' ? 'Phụ trách chính' : 
                             item.role === 'handler' ? 'NV Xử lý' : 
                             item.role === 'approver' ? 'Phê duyệt' : 'Theo dõi'}
                          </Badge>
                          <span className="text-xs text-slate-500 mt-0.5">
                            {item.scope === 'all' ? 'Toàn trường' : 
                             item.scope === 'campus' ? 'Theo cơ sở' : 
                             item.scope === 'route' ? 'Theo tuyến xe' : 
                             item.scope === 'meal_group' ? 'Nhóm suất ăn' : 'Theo khu vực'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {item.inheritedPermissions?.map(p => (
                            <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {item.startDate} -<br/>{item.endDate}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          item.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' : 
                          item.status === 'locked' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {item.status === 'active' ? 'Hoạt động' : 
                           item.status === 'locked' ? 'Tạm khóa' : 'Hết hiệu lực'}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
