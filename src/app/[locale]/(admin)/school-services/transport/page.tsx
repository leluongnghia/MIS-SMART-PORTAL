'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { TRANSPORT_ROUTES, SERVICE_STUDENTS } from '@/src/mockData/schoolServices';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Bus, Users, ShieldAlert, Plus, Edit2 } from 'lucide-react';

export default function TransportPage() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Xe Đưa Đón Học Sinh</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tuyến xe, phân công tài xế, điểm danh và giám sát lộ trình.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="shadow-sm">Thống kê điểm danh</Button>
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tuyến xe
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {TRANSPORT_ROUTES.map(route => (
          <Card key={route.id} className="relative overflow-hidden group">
            {route.status === 'maintenance' && (
              <div className="absolute top-0 right-0 p-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${route.status === 'active' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                  <Bus className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  <CardDescription className="mt-1 font-mono text-xs">{route.licensePlate}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-slate-500">Tài xế:</div>
                  <div className="font-medium">{route.driverName}</div>
                  
                  <div className="text-slate-500">Phụ trách (Bảo mẫu):</div>
                  <div className="font-medium">{route.assistantName}</div>
                  
                  <div className="text-slate-500">Số lượng HS:</div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="h-4 w-4 text-slate-400" />
                    {route.studentsCount} / {route.seats}
                  </div>
                  
                  <div className="text-slate-500">Trạng thái:</div>
                  <div>
                    {route.status === 'active' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đang hoạt động</Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        Bảo trì
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex -space-x-2 overflow-hidden">
                    {SERVICE_STUDENTS.slice(0, 5).map((hs, i) => (
                      <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900" src={hs.avatar} alt="" />
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white dark:bg-slate-800 dark:ring-slate-900">
                      <span className="text-xs font-medium text-slate-500">+{route.studentsCount - 5}</span>
                    </div>
                  </div>
                  
                  <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Chi tiết
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
