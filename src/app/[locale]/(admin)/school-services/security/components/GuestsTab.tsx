'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { GUESTS, type Guest, type GuestStatus } from '@/src/mockData/security';
import { UserPlus, LogOut, Search, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';

const statusConfig: Record<GuestStatus, { label: string; className: string }> = {
  'Đang trong trường': { label: 'Đang trong trường', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  'Đã rời trường': { label: 'Đã rời trường', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  'Từ chối vào': { label: 'Từ chối vào', className: 'bg-red-100 text-red-700 border-red-200' },
};

const emptyGuest: Omit<Guest, 'id'> = {
  name: '',
  phone: '',
  organization: '',
  reason: '',
  meetWith: '',
  checkIn: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  confirmedBy: '',
  status: 'Đang trong trường',
  notes: '',
};

export default function GuestsTab() {
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>(GUESTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyGuest);
  const [submitting, setSubmitting] = useState(false);

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.organization.toLowerCase().includes(search.toLowerCase()) ||
      g.reason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleCheckOut(id: string) {
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'Đã rời trường', checkOut: now } : g))
    );
    toast({ title: 'Check-out thành công', description: `Đã ghi nhận giờ ra: ${now}` });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập họ tên và số điện thoại', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newGuest: Guest = { ...form, id: `g${Date.now()}` };
      setGuests((prev) => [newGuest, ...prev]);
      setForm(emptyGuest);
      setShowForm(false);
      setSubmitting(false);
      toast({ title: 'Check-in thành công', description: `Đã đăng ký khách: ${form.name}` });
    }, 400);
  }

  const insideCount = guests.filter((g) => g.status === 'Đang trong trường').length;

  return (
    <div className="space-y-4 mt-6">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['Đang trong trường', 'Đã rời trường', 'Từ chối vào'] as GuestStatus[]).map((s) => {
          const count = guests.filter((g) => g.status === s).length;
          return (
            <div
              key={s}
              className={`rounded-xl p-3 border cursor-pointer transition-all ${
                filterStatus === s
                  ? 'ring-2 ring-offset-1 ring-blue-500'
                  : 'hover:border-slate-300'
              } ${statusConfig[s].className}`}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs mt-0.5 opacity-80">{s}</div>
            </div>
          );
        })}
      </div>

      {/* Actions & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm khách..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="Đang trong trường">Đang trong trường</option>
          <option value="Đã rời trường">Đã rời trường</option>
          <option value="Từ chối vào">Từ chối vào</option>
        </Select>
        <Button onClick={() => setShowForm((v) => !v)} className="shrink-0">
          <UserPlus className="h-4 w-4 mr-2" />
          Đăng ký khách
        </Button>
      </div>

      {/* Check-in form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              Đăng ký khách mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Họ tên khách *</Label>
                <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Văn A" />
              </div>
              <div className="space-y-1">
                <Label>Số điện thoại *</Label>
                <Input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0912345678" />
              </div>
              <div className="space-y-1">
                <Label>Đơn vị / Cơ quan</Label>
                <Input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} placeholder="Công ty ABC" />
              </div>
              <div className="space-y-1">
                <Label>Lý do đến trường *</Label>
                <Input required value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Đóng học phí" />
              </div>
              <div className="space-y-1">
                <Label>Người / Bộ phận cần gặp</Label>
                <Input value={form.meetWith} onChange={(e) => setForm((f) => ({ ...f, meetWith: e.target.value }))} placeholder="Phòng Kế toán" />
              </div>
              <div className="space-y-1">
                <Label>Người xác nhận</Label>
                <Input value={form.confirmedBy} onChange={(e) => setForm((f) => ({ ...f, confirmedBy: e.target.value }))} placeholder="BV. Hùng" />
              </div>
              <div className="space-y-1">
                <Label>Trạng thái</Label>
                <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as GuestStatus }))}>
                  <option value="Đang trong trường">Đang trong trường</option>
                  <option value="Từ chối vào">Từ chối vào</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Ghi chú</Label>
                <Input value={form.notes ?? ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Thông tin thêm..." />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Check-in'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Guests table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Khách</th>
                  <th className="px-4 py-3 font-medium">Đơn vị / Lý do</th>
                  <th className="px-4 py-3 font-medium">Người gặp</th>
                  <th className="px-4 py-3 font-medium">Vào</th>
                  <th className="px-4 py-3 font-medium">Ra</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">Không có dữ liệu</td>
                  </tr>
                )}
                {filtered.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{guest.name}</div>
                      <div className="text-xs text-slate-500">{guest.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 dark:text-slate-300">{guest.organization || '—'}</div>
                      <div className="text-xs text-slate-500">{guest.reason}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{guest.meetWith || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guest.checkIn}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {guest.checkOut ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {guest.checkOut}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${statusConfig[guest.status].className}`}>
                        {guest.status}
                      </Badge>
                      {guest.notes && (
                        <div className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate" title={guest.notes}>
                          {guest.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {guest.status === 'Đang trong trường' && (
                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(guest.id)} className="text-xs h-7">
                          <LogOut className="h-3 w-3 mr-1" />
                          Check-out
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
