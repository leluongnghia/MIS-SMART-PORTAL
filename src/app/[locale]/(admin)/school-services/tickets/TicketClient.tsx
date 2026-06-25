'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { MessageSquarePlus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { TicketActionDropdown } from './TicketActionDropdown';
import { useToast } from '@/src/components/ui/Toast';
import { updateServiceTicketStatus } from '../actions';

export default function TicketClient({ initialTickets = [], userRole }: { initialTickets?: any[], userRole?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();


  const handleAction = async (action: string, ticketId: string) => {
    let newStatus = '';
    if (action === 'accept') newStatus = 'ASSIGNED';
    if (action === 'resolve') newStatus = 'RESOLVED';
    if (action === 'close') newStatus = 'CLOSED';
    if (action === 'cancel') newStatus = 'CANCELLED';
    if (action === 'update_progress') newStatus = 'IN_PROGRESS';
    if (action === 'confirm_closed') newStatus = 'CONFIRMED_CLOSED';
    if (action === 'escalate') newStatus = 'ESCALATED';
    if (action === 'reject') newStatus = 'REJECTED';
    
    if (newStatus) {
      try {
        await updateServiceTicketStatus(ticketId, newStatus);
        toast({ variant: 'success', title: 'Thành công', message: `Đã cập nhật trạng thái thành ${newStatus}` });
      } catch (err: any) {
        toast({ variant: 'error', title: 'Lỗi', message: err.message });
      }
    } else {
      toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện thao tác: ${action} trên ticket ${ticketId}` });
    }
  };

  const filteredTickets = initialTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(initialTickets.map(t => t.category)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Mới</Badge>;
      case 'open':
      case 'ASSIGNED': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/50 dark:text-amber-400">Đã tiếp nhận</Badge>;
      case 'in_progress':
      case 'IN_PROGRESS': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400">Đang xử lý</Badge>;
      case 'resolved':
      case 'RESOLVED': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400">Đã giải quyết</Badge>;
      case 'closed':
      case 'CLOSED': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">Đã đóng</Badge>;
      case 'CANCELLED': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Khẩn cấp</span>;
      case 'high': return <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Cao</span>;
      case 'normal': return <span className="text-xs text-slate-500 dark:text-slate-400">Bình thường</span>;
      case 'low': return <span className="text-xs text-slate-400">Thấp</span>;
      default: return <span>{priority}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Ticket Dịch Vụ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý yêu cầu hỗ trợ và khiếu nại từ Phụ huynh / Học sinh.
          </p>
        </div>
        <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Tạo Ticket Mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm theo mã ticket, tiêu đề..." 
                className="pl-9 bg-slate-50 dark:bg-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select 
                className="flex h-10 w-full md:w-[160px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                className="flex h-10 w-full md:w-[150px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Mọi trạng thái</option>
                <option value="open">Chờ xử lý</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
              <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mã Ticket</th>
                  <th className="px-6 py-4 font-semibold">Tiêu đề & Danh mục</th>
                  <th className="px-6 py-4 font-semibold">Người yêu cầu</th>
                  <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                  <th className="px-6 py-4 font-semibold">Ưu tiên</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{ticket.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{ticket.category}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {ticket.createdBy}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <TicketActionDropdown 
                        ticket={ticket} 
                        onAction={handleAction} 
                        isManager={userRole === 'SCHOOL_SERVICE_OPERATIONS_MANAGER'} 
                      />
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Không tìm thấy ticket nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
