'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Plus, Search, CalendarClock, ArrowLeftRight } from 'lucide-react';
import { createHandover, returnHandover } from '../actions';
import { Badge } from '@/src/components/ui/badge';

type HandoverLog = {
  id: string;
  code: string | null;
  assetName: string | null;
  receiverName: string | null;
  department: string | null;
  handoverDate: Date | string;
  expectedReturnDate: Date | string | null;
  actualReturnDate: Date | string | null;
  status: string;
};

export function BookingsTab({ initialBookings = [] }: { initialBookings?: HandoverLog[] }) {
  const [bookings, setBookings] = useState<HandoverLog[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [assetName, setAssetName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [department, setDepartment] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !receiverName.trim() || isProcessing) return;

    setIsProcessing(true);
    const res = await createHandover({
      assetId: `A-${Date.now()}`,
      assetName,
      receiverId: `U-${Date.now()}`,
      receiverName,
      department,
      handoverDate: new Date(),
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      status: 'ACTIVE'
    });

    if (res.success) {
      setBookings([res.data, ...bookings]);
      setAssetName('');
      setReceiverName('');
      setDepartment('');
      setExpectedReturnDate('');
      setIsAdding(false);
      alert('Tạo phiếu bàn giao/mượn thành công!');
    } else {
      alert('Lỗi: ' + res.error);
    }
    setIsProcessing(false);
  };

  const handleReturn = async (id: string) => {
    const condition = prompt('Tình trạng tài sản khi trả lại:');
    if (condition === null) return; // User cancelled

    setIsProcessing(true);
    const res = await returnHandover(id, condition || 'Bình thường');
    if (res.success) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'RETURNED', actualReturnDate: new Date() } : b));
      alert('Đã xác nhận trả tài sản!');
    } else {
      alert('Lỗi: ' + res.error);
    }
    setIsProcessing(false);
  };

  const filteredBookings = bookings.filter((item) =>
    (item.assetName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.receiverName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <CardTitle>Bàn giao / Mượn / Đặt lịch</CardTitle>
            <CardDescription>Quản lý yêu cầu đặt lịch phòng, mượn trả thiết bị và tài sản</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'default'} disabled={isProcessing}>
            {isAdding ? 'Hủy' : <><Plus className="mr-2 h-4 w-4" /> Tạo phiếu bàn giao</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên thiết bị/tài sản</label>
              <Input placeholder="Laptop Dell..." value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Người mượn/nhận</label>
              <Input placeholder="Nguyễn Văn A" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phòng ban</label>
              <Input placeholder="Phòng IT" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày hẹn trả (tùy chọn)</label>
              <Input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isProcessing}>{isProcessing ? 'Đang lưu...' : 'Xác nhận mượn'}</Button>
          </form>
        )}

        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã, tên tài sản hoặc người nhận..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <CalendarClock className="mr-2 h-4 w-4" /> Xem theo lịch
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Mã phiếu</th>
                <th className="p-3 text-left">Tài sản</th>
                <th className="p-3 text-left">Người mượn</th>
                <th className="p-3 text-left">Ngày mượn</th>
                <th className="p-3 text-left">Ngày hẹn trả</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs text-muted-foreground">{item.code}</td>
                    <td className="p-3 font-medium text-foreground">{item.assetName}</td>
                    <td className="p-3">
                      <div>{item.receiverName}</div>
                      <div className="text-xs text-muted-foreground">{item.department}</div>
                    </td>
                    <td className="p-3">{formatDate(item.handoverDate)}</td>
                    <td className="p-3">{formatDate(item.expectedReturnDate)}</td>
                    <td className="p-3">
                      {item.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đang mượn</span>
                      ) : item.status === 'OVERDUE' ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Quá hạn</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã trả</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {item.status !== 'RETURNED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturn(item.id)}
                          disabled={isProcessing}
                          title="Nhận lại tài sản"
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-1" /> Trả lại
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Chưa có yêu cầu đặt lịch / mượn thiết bị
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
