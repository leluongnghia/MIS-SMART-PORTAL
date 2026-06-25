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
import { mockSettingsService, MealParameter } from '@/src/lib/mockSettingsService';

export default function MealsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MealParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<MealParameter>>({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await mockSettingsService.getItems('service_meal_parameters');
      setSettings(data);
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể tải dữ liệu suất ăn' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (item: MealParameter) => {
    setFormData(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tham số suất ăn này?')) return;
    try {
      await mockSettingsService.deleteItem('service_meal_parameters', id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa suất ăn' });
      fetchSettings();
    } catch (error) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Không thể xóa suất ăn' });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.mealType) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Vui lòng điền tên suất ăn và loại bữa' });
        return;
      }
      if (formData.unitPrice !== undefined && formData.unitPrice < 0) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Đơn giá không được âm' });
        return;
      }

      if (formData.id) {
        await mockSettingsService.updateItem('service_meal_parameters', formData.id, formData);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã cập nhật suất ăn' });
      } else {
        await mockSettingsService.createItem('service_meal_parameters', {
          ...formData,
          status: 'active',
          campusId: 'camp-01',
          campusName: 'Cơ sở Chính',
          schoolYear: '2026-2027',
          name: formData.name,
          mealType: formData.mealType,
          unitPrice: formData.unitPrice || 0,
          supplier: formData.supplier || 'Chưa xác định',
          allergiesList: formData.allergiesList || [],
          cutoffHours: formData.cutoffHours || 12,
        } as Omit<MealParameter, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
        toast({ variant: 'success', title: 'Thành công', message: 'Đã thêm suất ăn mới' });
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
          <CardTitle>{formData.id ? 'Sửa suất ăn' : 'Thêm suất ăn mới'}</CardTitle>
          <CardDescription>Thiết lập định mức, giá tiền và nhà cung cấp cho các bữa ăn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tên suất ăn <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="VD: Suất ăn Trưa Cơ sở Chính" 
              />
            </div>
            <div className="space-y-2">
              <Label>Loại bữa <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={formData.mealType || ''}
                onChange={(e) => setFormData({...formData, mealType: e.target.value})}
              >
                <option value="">Chọn loại bữa...</option>
                <option value="breakfast">Bữa sáng</option>
                <option value="lunch">Bữa trưa</option>
                <option value="snack">Bữa xế</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Đơn giá (VNĐ) <span className="text-red-500">*</span></Label>
              <Input 
                type="number"
                min="0"
                value={formData.unitPrice || 0} 
                onChange={(e) => setFormData({...formData, unitPrice: parseInt(e.target.value) || 0})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Nhà cung cấp</Label>
              <Input 
                value={formData.supplier || ''} 
                onChange={(e) => setFormData({...formData, supplier: e.target.value})} 
                placeholder="VD: Công ty Cổ phần Suất ăn ABC" 
              />
            </div>
            <div className="space-y-2">
              <Label>Thời gian chốt đăng ký/hủy (trước giờ ăn - tiếng)</Label>
              <Input 
                type="number"
                min="1"
                value={formData.cutoffHours || 12} 
                onChange={(e) => setFormData({...formData, cutoffHours: parseInt(e.target.value) || 12})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Danh sách thực phẩm có thể dị ứng (cách nhau bởi dấu phẩy)</Label>
              <Input 
                value={(formData.allergiesList || []).join(', ')} 
                onChange={(e) => setFormData({...formData, allergiesList: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                placeholder="VD: Đậu phộng, Hải sản" 
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
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Tham số Bếp ăn</h3>
          <p className="text-sm text-slate-500">Quản lý định mức suất ăn, đơn giá và nhà cung cấp.</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm suất ăn
        </Button>
      </div>

      {settings.length === 0 ? (
        <div className="text-center p-12 border border-slate-200 dark:border-slate-800 rounded-lg">
          <h4 className="text-slate-900 dark:text-white font-medium mb-2">Chưa có dữ liệu</h4>
          <p className="text-slate-500 mb-4">Chưa có tham số bếp ăn nào được thiết lập.</p>
          <Button onClick={() => setIsEditing(true)} variant="outline">Thêm suất ăn đầu tiên</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead>Tên suất ăn</TableHead>
                  <TableHead>Loại bữa</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.mealType === 'breakfast' ? 'Bữa sáng' : 
                       item.mealType === 'lunch' ? 'Bữa trưa' : 
                       item.mealType === 'snack' ? 'Bữa xế' : 'Khác'}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
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
