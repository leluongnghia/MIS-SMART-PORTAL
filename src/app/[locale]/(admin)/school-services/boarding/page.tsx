'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { FACILITIES, SERVICE_STUDENTS } from '@/src/mockData/schoolServices';
import { Button } from '@/src/components/ui/button';
import { Moon, Bed, Users, ShieldAlert, CheckSquare } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

export default function BoardingPage() {
  const { toast } = useToast();
  const boardingRooms = FACILITIES.filter(f => f.type === 'Phòng bán trú');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bán Trú & Nội Trú</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý phòng nghỉ trưa, phòng nội trú, phân công giáo viên giám sát và điểm danh.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="shadow-sm">Sắp xếp phòng</Button>
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <CheckSquare className="mr-2 h-4 w-4" />
            Điểm danh đồng loạt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boardingRooms.map((room, index) => (
          <Card key={room.id} className="relative overflow-hidden group border-indigo-100 dark:border-indigo-900/30">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                    <Bed className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription className="text-xs">Quản lý: {room.manager}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-900/50">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Trạng thái điểm danh (Hôm nay):</span>
                    <span className="font-medium text-emerald-600">{index === 0 ? '42/45' : '45/45'}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700">
                    <div className={`bg-indigo-600 h-1.5 rounded-full ${index === 0 ? 'w-[93%]' : 'w-full'}`}></div>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                    <span className="text-slate-500">HS Khối:</span>
                    <span className="font-medium">10, 11</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                    <span className="text-slate-500">Giới tính:</span>
                    <span className="font-medium">{room.name.includes('Nam') ? 'Nam' : 'Nữ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ghi chú:</span>
                    {index === 0 ? (
                      <span className="text-rose-600 text-xs font-medium flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Vắng 3 không phép
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Không có</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="flex-1 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                    Xem danh sách
                  </Button>
                  <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                    Điểm danh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed border-2 bg-transparent hover:bg-slate-50/50 transition-colors cursor-pointer dark:hover:bg-slate-900/20">
          <CardContent className="h-full flex flex-col items-center justify-center p-6 text-slate-500 hover:text-indigo-600">
            <div className="p-4 rounded-full bg-slate-100 mb-4 dark:bg-slate-800">
              <Bed className="h-8 w-8" />
            </div>
            <p className="font-medium">Thêm phòng mới</p>
            <p className="text-xs text-center mt-2 opacity-70">Cấu hình thêm phòng nội trú hoặc bán trú</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
