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
import { mockSettingsService, TransportParameter } from '@/src/lib/mockSettingsService';

export default function TransportTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TransportParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<TransportParameter>>({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await mockSettingsService.getItems('service_transport_parameters');
      setSettings(data);
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể tải dữ liệu xe đưa đón' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (item: TransportParameter) => {
    setFormData(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tuyến xe này?')) return;
    try {
      await mockSettingsService.deleteItem('service_transport_parameters', id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa tuyến xe' });
      fetchSettings();
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể xóa tuyến xe' });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.routeCode) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Vui lòng điền tên tuyến và mã tuyến' });
        return;
      }
      if (formData.vehicle?.capacity !== undefined && formData.vehicle.capacity < 0) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Số ghế không được âm' });
        return;
      }

      if (formData.id) {
        await mockSettingsService.updateItem('service_transport_parameters', formData.id, formData);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã cập nhật tuyến xe' });
      } else {
        await mockSettingsService.createItem('service_transport_parameters', {
          ...formData,
          status: 'active',
          campusId: 'camp-01',
          campusName: 'Cơ sở Chính',
          schoolYear: '2026-2027',
          name: formData.name,
          routeCode: formData.routeCode,
          direction: formData.direction || 'twoway',
          stops: formData.stops || [],
          vehicle: formData.vehicle || { plateNumber: '', capacity: 0 },
          staff: formData.staff || { driverName: '', driverPhone: '', assistantName: '', assistantPhone: '' },
          fees: formData.fees || { monthly: 0, term: 0, yearly: 0 },
          schedule: formData.schedule || { pickupStartTime: '06:00', dropoffStartTime: '16:00' },
        } as Omit<TransportParameter, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã thêm tuyến xe mới' });
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
          <CardTitle>{formData.id ? 'Sửa tuyến xe' : 'Thêm tuyến xe mới'}</CardTitle>
          <CardDescription>Thiết lập thông tin tuyến, xe, nhân sự và biểu phí.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tên tuyến <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="VD: Tuyến KĐT Ecopark" 
              />
            </div>
            <div className="space-y-2">
              <Label>Mã tuyến <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.routeCode || ''} 
                onChange={(e) => setFormData({...formData, routeCode: e.target.value})} 
                placeholder="VD: BUS-01" 
              />
            </div>
            <div className="space-y-2">
              <Label>Chiều đi/về <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.direction || ''}
                onChange={(e) => setFormData({...formData, direction: e.target.value as any})}
              >
                <option value="twoway">2 chiều</option>
                <option value="pickup">Chỉ đón</option>
                <option value="dropoff">Chỉ trả</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Biển số xe</Label>
              <Input 
                value={formData.vehicle?.plateNumber || ''} 
                onChange={(e) => setFormData({
                  ...formData, 
                  vehicle: { ...formData.vehicle, capacity: formData.vehicle?.capacity || 0, plateNumber: e.target.value }
                })} 
                placeholder="VD: 29B-123.45" 
              />
            </div>
            <div className="space-y-2">
              <Label>Số ghế</Label>
              <Input 
                type="number"
                min="0"
                value={formData.vehicle?.capacity || 0} 
                onChange={(e) => setFormData({
                  ...formData, 
                  vehicle: { ...formData.vehicle, plateNumber: formData.vehicle?.plateNumber || '', capacity: parseInt(e.target.value) || 0 }
                })} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <Label>Tên Tài xế</Label>
              <Input 
                value={formData.staff?.driverName || ''} 
                onChange={(e) => setFormData({
                  ...formData, 
                  staff: { ...formData.staff, assistantName: formData.staff?.assistantName || '', assistantPhone: formData.staff?.assistantPhone || '', driverPhone: formData.staff?.driverPhone || '', driverName: e.target.value } as any
                })} 
              />
            </div>
            <div className="space-y-2">
              <Label>SĐT Tài xế</Label>
              <Input 
                value={formData.staff?.driverPhone || ''} 
                onChange={(e) => setFormData({
                  ...formData, 
                  staff: { ...formData.staff, assistantName: formData.staff?.assistantName || '', assistantPhone: formData.staff?.assistantPhone || '', driverName: formData.staff?.driverName || '', driverPhone: e.target.value } as any
                })} 
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
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Tham số Xe đưa đón</h3>
          <p className="text-sm text-slate-500">Quản lý tuyến xe, xe và nhân sự phụ trách.</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm tuyến xe
        </Button>
      </div>

      {settings.length === 0 ? (
        <div className="text-center p-12 border border-slate-200 dark:border-slate-800 rounded-lg">
          <h4 className="text-slate-900 dark:text-white font-medium mb-2">Chưa có dữ liệu</h4>
          <p className="text-slate-500 mb-4">Chưa có tuyến xe nào được thiết lập.</p>
          <Button onClick={() => setIsEditing(true)} variant="outline">Thêm tuyến xe đầu tiên</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead>Mã tuyến</TableHead>
                  <TableHead>Tên tuyến</TableHead>
                  <TableHead>Biển số xe</TableHead>
                  <TableHead>Tài xế</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{item.routeCode}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.vehicle.plateNumber ? (
                         <Badge variant="outline" className="font-mono">{item.vehicle.plateNumber}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {item.staff.driverName ? (
                        <div>
                          <div className="text-sm font-medium">{item.staff.driverName}</div>
                          <div className="text-xs text-slate-500">{item.staff.driverPhone}</div>
                        </div>
                      ) : '-'}
                    </TableCell>
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
