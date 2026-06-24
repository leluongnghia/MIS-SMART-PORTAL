'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Shirt, Package, CheckSquare, Plus } from 'lucide-react';
import { SERVICE_TICKETS } from '@/src/mockData/schoolServices';
import { Badge } from '@/src/components/ui/badge';

export default function UniformsPage() {
  const uniformTickets = SERVICE_TICKETS.filter(t => t.category === 'Đồng phục');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Đồng Phục & Học Phẩm</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý kho đồng phục, size học sinh và cấp phát học phẩm đầu năm.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert('Tính năng đang được phát triển')}  variant="outline" className="shadow-sm">Nhập kho</Button>
          <Button onClick={() => alert('Tính năng đang được phát triển')}  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Cấp phát mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu cấp phát gần đây</CardTitle>
              <CardDescription>Các ticket liên quan đến mua thêm / đổi size đồng phục</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uniformTickets.map(ticket => (
                  <div key={ticket.id} className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-slate-100 rounded text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Shirt className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{ticket.title}</h4>
                        <div className="text-xs text-slate-500 mt-1">Người yêu cầu: {ticket.createdBy} • {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                    <div>
                      <Badge className={ticket.status === 'closed' ? 'bg-slate-100 text-slate-700 hover:bg-slate-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                        {ticket.status === 'closed' ? 'Đã giao' : 'Chờ xử lý'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {uniformTickets.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    Không có yêu cầu nào.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500" />
                Tồn kho hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="text-slate-600">Áo sơ mi Nam (S, M, L)</span>
                  <span className="font-medium text-slate-900 dark:text-white">250 cái</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="text-slate-600">Váy Nữ (S, M, L)</span>
                  <span className="font-medium text-slate-900 dark:text-white">180 cái</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="text-slate-600">Áo khoác mùa đông</span>
                  <span className="font-medium text-rose-600">15 cái (Sắp hết)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Bộ SGK Khối 10</span>
                  <span className="font-medium text-slate-900 dark:text-white">45 bộ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200 shadow-none dark:bg-slate-900/50 dark:border-slate-800">
            <CardContent className="p-6 text-center">
              <CheckSquare className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Chiến dịch cấp phát đầu năm</h3>
              <p className="text-xs text-slate-500 mb-4">Đã hoàn thành 98% cho toàn khối THPT. Xem báo cáo chi tiết để đối soát.</p>
              <Button onClick={() => alert('Tính năng đang được phát triển')}  variant="outline" size="sm" className="w-full">Xem báo cáo đối soát</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
