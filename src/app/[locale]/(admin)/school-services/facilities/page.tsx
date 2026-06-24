'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { FACILITIES, SERVICE_TICKETS } from '@/src/mockData/schoolServices';
import { Button } from '@/src/components/ui/button';
import { Building, Wrench, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

export default function FacilitiesPage() {
  const { toast } = useToast();
  const facilityTickets = SERVICE_TICKETS.filter(t => t.category === 'Cơ sở vật chất');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cơ Sở Vật Chất & Báo Hỏng</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý phòng ốc, tiện ích dịch vụ và xử lý các báo cáo hỏng hóc.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="shadow-sm">Kiểm tra định kỳ</Button>
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
            <Wrench className="mr-2 h-4 w-4" />
            Tạo phiếu bảo trì
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Khu vực tiện ích & Chức năng</CardTitle>
            <CardDescription>Trạng thái các khu vực cung cấp dịch vụ cho học sinh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {FACILITIES.filter(f => ['Khu tiện ích', 'Khu chức năng'].includes(f.type)).map(facility => (
                <div key={facility.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded dark:bg-slate-800 dark:text-slate-400">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{facility.name}</h4>
                      <p className="text-xs text-slate-500">Người quản lý: {facility.manager}</p>
                    </div>
                  </div>
                  <div>
                    {facility.status === 'Normal' ? (
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">Hoạt động tốt</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/20 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Đang bảo trì
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 dark:text-amber-500 text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Tiến độ xử lý sự cố (Tháng này)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-700 dark:text-slate-300">
                    <span>Đã xử lý (12/15)</span>
                    <span className="font-bold">80%</span>
                  </div>
                  <div className="w-full bg-amber-200/50 rounded-full h-2 dark:bg-amber-900/30">
                    <div className="bg-amber-500 h-2 rounded-full w-[80%]"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Báo hỏng mới nhất</CardTitle>
              <CardDescription>Các ticket CSVC cần nhân viên kỹ thuật kiểm tra</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facilityTickets.map(ticket => (
                  <div key={ticket.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{ticket.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Báo bởi: {ticket.createdBy}</p>
                    </div>
                    <Badge className={ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>
                      {ticket.status === 'open' ? 'Chờ kiểm tra' : 'Đã sửa'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
