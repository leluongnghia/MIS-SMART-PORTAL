'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Plus, Search, Trash2, AlertCircle } from 'lucide-react';

type SupplyItem = {
  id: string;
  name: string;
  unit: string;
  current: number;
  min: number;
};

const INITIAL_SUPPLIES: SupplyItem[] = [
  { id: 'S001', name: 'Mực in Canon', unit: 'hộp', current: 1, min: 3 },
  { id: 'S002', name: 'Bóng đèn LED', unit: 'chiếc', current: 4, min: 10 },
  { id: 'S003', name: 'Pin điều khiển', unit: 'viên', current: 2, min: 8 },
  { id: 'S004', name: 'Dây mạng Cat6', unit: 'mét', current: 5, min: 20 },
  { id: 'S005', name: 'Ổ cắm điện 3 chấu', unit: 'cái', current: 3, min: 12 },
  { id: 'S006', name: 'Giấy in A4', unit: 'ream', current: 8, min: 20 },
];

export function SuppliesTab() {
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('cái');
  const [current, setCurrent] = useState('');
  const [min, setMin] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: SupplyItem = {
      id: `S${Date.now().toString().slice(-3)}`,
      name: name.trim(),
      unit,
      current: Number(current) || 0,
      min: Number(min) || 0,
    };

    setSupplies([newItem, ...supplies]);
    setName('');
    setCurrent('');
    setMin('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setSupplies(supplies.filter((item) => item.id !== id));
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
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'default'}>
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
            <Button type="submit" className="w-full">Xác nhận thêm</Button>
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
                  const isLow = item.current < item.min;
                  return (
                    <tr key={item.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{item.id}</td>
                      <td className="p-3 font-medium text-foreground">{item.name}</td>
                      <td className="p-3 font-semibold">{item.current} {item.unit}</td>
                      <td className="p-3 text-muted-foreground">{item.min} {item.unit}</td>
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
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
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
