'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Plus, Search, ClipboardCheck } from 'lucide-react';
import { createInventoryCheck } from '../actions';
import { Badge } from '@/src/components/ui/badge';

type InventoryCheck = {
  id: string;
  code: string | null;
  title: string;
  status: string;
  startedAt: Date | string | null;
  createdByName: string | null;
};

export function InventoryTab({ initialChecks = [] }: { initialChecks?: InventoryCheck[] }) {
  const [checks, setChecks] = useState<InventoryCheck[]>(initialChecks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('ALL');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isProcessing) return;

    setIsProcessing(true);
    const res = await createInventoryCheck({
      title: title.trim(),
      scope,
    }, []);

    if (res.success) {
      setChecks([res.data, ...checks]);
      setTitle('');
      setIsAdding(false);
      alert('Tạo đợt kiểm kê thành công!');
    } else {
      alert('Lỗi: ' + res.error);
    }
    setIsProcessing(false);
  };

  const filteredChecks = checks.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d: any) => {
    if (!d) return '—';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Kiểm kê tài sản</CardTitle>
            <CardDescription>Tạo đợt kiểm kê, đối chiếu vị trí/tình trạng, ghi nhận thiếu-hỏng-thừa</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'default'} disabled={isProcessing}>
            {isAdding ? 'Hủy' : <><Plus className="mr-2 h-4 w-4" /> Tạo đợt kiểm kê</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 md:grid-cols-3 items-end">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên đợt kiểm kê</label>
              <Input placeholder="Kiểm kê tài sản cuối năm 2026..." value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isProcessing}>{isProcessing ? 'Đang tạo...' : 'Xác nhận tạo'}</Button>
          </form>
        )}

        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã hoặc tên đợt kiểm kê..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Mã đợt</th>
                <th className="p-3 text-left">Tên đợt kiểm kê</th>
                <th className="p-3 text-left">Người tạo</th>
                <th className="p-3 text-left">Ngày bắt đầu</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.length > 0 ? (
                filteredChecks.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs text-muted-foreground">{item.code}</td>
                    <td className="p-3 font-medium text-foreground">{item.title}</td>
                    <td className="p-3">{item.createdByName}</td>
                    <td className="p-3">{formatDate(item.startedAt)}</td>
                    <td className="p-3">
                      {item.status === 'IN_PROGRESS' ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đang thực hiện</span>
                      ) : item.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn thành</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">Bản nháp</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="outline" size="sm" title="Tiến hành kiểm kê">
                        <ClipboardCheck className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Chưa có đợt kiểm kê nào
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
