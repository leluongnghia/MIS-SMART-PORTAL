'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { Dialog } from '@/src/components/ui/dialog';
import { ArrowDownToLine, ArrowUpFromLine, Search, Plus } from 'lucide-react';
import { CLEANING_MATERIALS, Material } from '@/src/mockData/cleaning';

export default function MaterialsTab() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'import' | 'export'>('import');

  const handleOpenTransaction = (type: 'import' | 'export') => {
    setTransactionType(type);
    setIsAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thành công", description: `Đã lưu giao dịch ${transactionType === 'import' ? 'nhập' : 'xuất'} vật tư.` });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input placeholder="Tìm kiếm vật tư..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={() => handleOpenTransaction('export')}>
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Xuất kho
          </Button>
          <Button onClick={() => handleOpenTransaction('import')}>
            <Plus className="mr-2 h-4 w-4" /> Nhập kho
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Tồn kho vật tư vệ sinh</CardTitle>
          <CardDescription>Theo dõi số lượng vật tư và cảnh báo sắp hết</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Tên vật tư</th>
                  <th className="px-4 py-3 font-medium">Đơn vị</th>
                  <th className="px-4 py-3 font-medium">Tồn kho</th>
                  <th className="px-4 py-3 font-medium">Định mức tối thiểu</th>
                  <th className="px-4 py-3 font-medium">Khu vực sử dụng</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {CLEANING_MATERIALS.map((material) => {
                  const isLowStock = material.stock <= material.minStock;
                  return (
                    <tr key={material.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium">{material.name}</td>
                      <td className="px-4 py-3 text-slate-500">{material.unit}</td>
                      <td className={`px-4 py-3 font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-700'}`}>{material.stock}</td>
                      <td className="px-4 py-3 text-slate-500">{material.minStock}</td>
                      <td className="px-4 py-3 text-slate-500">{material.areaUsed}</td>
                      <td className="px-4 py-3">
                        {isLowStock ? (
                          <Badge className="bg-rose-100 text-rose-700 border-rose-200">Sắp hết</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Đầy đủ</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast({ title: "Lịch sử", description: "Xem lịch sử nhập xuất..." })}>Lịch sử</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen} title={transactionType === 'import' ? "Nhập vật tư" : "Xuất vật tư"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn vật tư *</label>
            <Select required defaultValue="">
              <option value="">-- Chọn vật tư --</option>
              {CLEANING_MATERIALS.map((m) => (
                <option key={m.id} value={m.name}>{m.name} (Tồn: {m.stock} {m.unit})</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Số lượng *</label>
              <Input type="number" required min="1" placeholder="Nhập số lượng..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đơn vị</label>
              <Input readOnly className="bg-slate-50 dark:bg-slate-900" placeholder="Được tự động điền" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Người thực hiện</label>
            <Input defaultValue="Người dùng hiện tại" readOnly className="bg-slate-50 dark:bg-slate-900" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <Input placeholder={transactionType === 'import' ? "Nhà cung cấp, hóa đơn..." : "Mục đích sử dụng, khu vực..."} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Hủy bỏ</Button>
            <Button type="submit" className={transactionType === 'import' ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-amber-600 text-white hover:bg-amber-700"}>
              {transactionType === 'import' ? "Xác nhận nhập kho" : "Xác nhận xuất kho"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
