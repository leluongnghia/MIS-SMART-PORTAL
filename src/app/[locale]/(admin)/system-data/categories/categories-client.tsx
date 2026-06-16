'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { getCategories, createCategory, updateCategory, deleteCategory } from './actions';
import { useToast } from '@/src/components/ui/Toast';
import { Plus, Edit, Trash2, Search, FileDown, FileUp, Loader2 } from 'lucide-react';
import { Dialog } from '@/src/components/ui/dialog';
import { Textarea } from '@/src/components/ui/textarea';

const GROUPS = [
  { id: 'school_year', label: 'Năm học' },
  { id: 'semester', label: 'Học kỳ' },
  { id: 'campus', label: 'Cơ sở' },
  { id: 'grade_level', label: 'Khối lớp' },
  { id: 'document_type', label: 'Loại văn bản' },
];

export default function CategoriesClient({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [activeGroup, setActiveGroup] = useState('school_year');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    message: '',
    sortOrder: 0,
    status: 'ACTIVE'
  });

  const loadData = async (group: string) => {
    try {
      setLoading(true);
      const data = await getCategories(group);
      setCategories(data);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeGroup);
  }, [activeGroup]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const lower = search.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.code.toLowerCase().includes(lower)
    );
  }, [categories, search]);

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        message: item.description || '',
        sortOrder: item.sortOrder || 0,
        status: item.status || 'ACTIVE'
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: '',
        name: '',
        message: '',
        sortOrder: categories.length + 1,
        status: 'ACTIVE'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name) {
        toast({ variant: 'error', title: 'Lỗi', message: 'Vui lòng nhập mã và tên danh mục' });
        return;
      }

      if (editingItem) {
        await updateCategory(editingItem.id, formData);
        toast({ variant: 'success', title: 'Thành công', message: 'Cập nhật danh mục thành công' });
      } else {
        await createCategory({ ...formData, group: activeGroup });
        toast({ variant: 'success', title: 'Thành công', message: 'Thêm danh mục thành công' });
      }
      setIsDialogOpen(false);
      loadData(activeGroup);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await deleteCategory(id);
      toast({ variant: 'success', title: 'Thành công', message: 'Xóa danh mục thành công' });
      loadData(activeGroup);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Danh mục</h1>
          <p className="text-muted-foreground mt-1">Cấu hình các danh mục dữ liệu dùng chung trong hệ thống.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <Tabs className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
              {GROUPS.map(group => (
                <TabsTrigger key={group.id} active={activeGroup === group.id} onClick={() => setActiveGroup(group.id)}>
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileUp className="h-4 w-4 mr-2" /> Nhập CSV
                </Button>
                <Button variant="outline">
                  <FileDown className="h-4 w-4 mr-2" /> Xuất CSV
                </Button>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" /> Thêm mới
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Mã</TableHead>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                    <TableHead className="w-[100px] text-center">Sắp xếp</TableHead>
                    <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
                    {canManage && <TableHead className="w-[100px] text-right">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 6 : 5} className="h-24 text-center text-muted-foreground">
                        Không có dữ liệu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{item.description}</TableCell>
                        <TableCell className="text-center">{item.sortOrder}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {item.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                          </span>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title={editingItem ? "Sửa danh mục" : "Thêm danh mục mới"}>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold">{editingItem ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
          </div>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="code" className="text-sm font-medium leading-none">Mã danh mục <span className="text-destructive">*</span></label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                disabled={!!editingItem} // Không cho sửa mã khi edit
                placeholder="VD: 2025_2026"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">Tên danh mục <span className="text-destructive">*</span></label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Năm học 2025-2026"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">Mô tả</label>
              <Textarea
                id="description"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Mô tả chi tiết..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="sortOrder" className="text-sm font-medium leading-none">Thứ tự sắp xếp</label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium leading-none">Trạng thái</label>
                <select
                  id="status"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm khóa</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>Lưu</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
