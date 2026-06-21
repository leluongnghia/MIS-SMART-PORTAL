'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Plus, Search, Trash2, AlertCircle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { createSupply, updateSupplyQuantity } from '../actions';

type SupplyItem = {
  id: string;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
};

export function SuppliesTab({ initialSupplies = [] }: { initialSupplies?: SupplyItem[] }) {
  const [supplies, setSupplies] = useState<SupplyItem[]>(initialSupplies);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('cái');
  const [current, setCurrent] = useState('');
  const [min, setMin] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isProcessing) return;

    setIsProcessing(true);
    const res = await createSupply({
      code: `VT-${Date.now()}`,
      name: name.trim(),
      category: 'CHUNG',
      unit,
      currentQuantity: Number(current) || 0,
      minimumQuantity: Number(min) || 0,
    });

    if (res.success) {
      setSupplies([res.data, ...supplies]);
      setName('');
      setCurrent('');
      setMin('');
      setIsAdding(false);
      alert('Thêm vật tư thành công!');
    } else {
      alert('Lỗi: ' + res.error);
    }
    setIsProcessing(false);
  };

  const handleStockAction = async (id: string, type: 'IMPORT' | 'EXPORT') => {
    const qtyStr = prompt(`Nhập số lượng muốn ${type === 'IMPORT' ? 'nhập' : 'xuất'} kho:`);
    const qty = Number(qtyStr);
    if (!qty || qty <= 0) return;

    setIsProcessing(true);
    const res = await updateSupplyQuantity(id, qty, type, `Thao tác ${type} từ UI`);
    if (res.success) {
      setSupplies(supplies.map(s => s.id === id ? { ...s, currentQuantity: res.data.currentQuantity } : s));
      alert(`Đã ${type === 'IMPORT' ? 'nhập' : 'xuất'} ${qty} đơn vị thành công!`);
    } else {
      if (res.error === 'Supply not found' && id.startsWith('S00')) {
        setSupplies(supplies.map(s => s.id === id ? { ...s, currentQuantity: type === 'IMPORT' ? s.currentQuantity + qty : s.currentQuantity - qty } : s));
        alert(`Đã ${type === 'IMPORT' ? 'nhập' : 'xuất'} ${qty} đơn vị thành công (Dữ liệu tĩnh)!`);
      } else {
        alert('Lỗi: ' + res.error);
      }
    }
    setIsProcessing(false);
  };

  const filteredSupplies = supplies.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vật tư tiêu hao</CardTitle>
          <CardDescription>Quản lý danh mục và tồn kho vật tư tiêu hao trong trường</CardDescription>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'default'} disabled={isProcessing}>
          {isAdding ? 'Hủy' : <><Plus className="mr-2 h-4 w-4" /> Thêm vật tư</>}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form thêm mới */}
        {isAdding && (
          <form onSubmit={handleAdd} className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 md:grid-cols-5 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên vật tư</label>
              <Input placeholder="Ví dụ: Bút viết bảng" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Đơn vị</label>
              <Input placeholder="cái, hộp, ream..." value={unit} onChange={(e) => setUnit(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tồn hiện tại</label>
              <Input type="number" min="0" placeholder="0" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tối thiểu</label>
              <Input type="number" min="0" placeholder="5" value={min} onChange={(e) => setMin(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isProcessing}>{isProcessing ? 'Đang lưu...' : 'Xác nhận thêm'}</Button>
          </form>
        )}

        {/* Thanh tìm kiếm */}
        <div className="flex items-center space-x-2">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm vật tư..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Danh sách vật tư */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Mã</th>
                <th className="p-3 text-left">Tên vật tư</th>
                <th className="p-3 text-left">Tồn hiện tại</th>
                <th className="p-3 text-left">Mức tối thiểu</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupplies.length > 0 ? (
                filteredSupplies.map((item) => {
                  const isLow = item.currentQuantity < item.minimumQuantity;
                  return (
                    <tr key={item.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{item.id}</td>
                      <td className="p-3 font-medium text-foreground">{item.name}</td>
                      <td className="p-3 font-semibold">{item.currentQuantity} {item.unit}</td>
                      <td className="p-3 text-muted-foreground">{item.minimumQuantity} {item.unit}</td>
                      <td className="p-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300">
                            <AlertCircle className="h-3.5 w-3.5" /> Tồn kho thấp
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                            An toàn
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStockAction(item.id, 'IMPORT')}
                          disabled={isProcessing}
                          title="Nhập kho"
                        >
                          <ArrowDownToLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStockAction(item.id, 'EXPORT')}
                          disabled={isProcessing}
                          title="Xuất kho"
                        >
                          <ArrowUpFromLine className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Không tìm thấy vật tư phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
