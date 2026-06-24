'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { MEALS_MENU, SERVICE_STUDENTS } from '@/src/mockData/schoolServices';
import { Button } from '@/src/components/ui/button';
import { Utensils, CalendarDays, ChefHat, AlertCircle } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

export default function MealsPage() {
  const { toast } = useToast();
  const todayMenu = MEALS_MENU.find(m => m.date === '2026-06-24') || MEALS_MENU[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Ăn Uống & Suất Ăn</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý thực đơn, đăng ký suất ăn, điểm danh ăn và ghi nhận dị ứng.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="shadow-sm">Thống kê khẩu phần</Button>
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <Utensils className="mr-2 h-4 w-4" />
            Lên thực đơn tuần
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thực đơn tuần này</CardTitle>
                <CardDescription>Tuần 22/06 - 28/06/2026</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
                Đã chốt danh sách
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {MEALS_MENU.map((menu, index) => {
                const isToday = menu.date === '2026-06-24';
                return (
                  <div key={index} className={`flex flex-col sm:flex-row gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10 rounded-lg' : ''}`}>
                    <div className="w-32 shrink-0">
                      <div className="flex items-center gap-2">
                        <CalendarDays className={`h-4 w-4 ${isToday ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {new Date(menu.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      {isToday && <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Hôm nay</span>}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${isToday ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {menu.dish}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <ChefHat className="h-5 w-5" />
                Thông tin Bếp ăn (Hôm nay)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white/60 dark:bg-slate-950/50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tổng suất đăng ký:</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">450</span>
                </div>
                <div className="bg-white/60 dark:bg-slate-950/50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Báo cắt/vắng mặt:</span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">12</span>
                </div>
                <div className="bg-white/60 dark:bg-slate-950/50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Chế độ đặc biệt:</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">5</span>
                </div>
                
                <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Bắt đầu Điểm danh ăn
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Lưu ý dị ứng
              </CardTitle>
              <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="link" className="text-xs h-auto p-0 text-blue-600">Xem tất cả</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Phạm Hải Yến', class: '10A2', note: 'Dị ứng đậu phộng' },
                  { name: 'Lê Ngọc Hân', class: '10A1', note: 'Không ăn tôm' },
                  { name: 'Đặng Mai Chi', class: '11A1', note: 'Ăn chay t5, t6' },
                ].map((hs, i) => (
                  <div key={i} className="flex justify-between items-start text-sm border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{hs.name}</div>
                      <div className="text-xs text-slate-500">Lớp {hs.class}</div>
                    </div>
                    <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-900/20">{hs.note}</Badge>
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
