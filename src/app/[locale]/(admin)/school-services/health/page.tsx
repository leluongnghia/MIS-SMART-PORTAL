'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { HEALTH_INCIDENTS } from '@/src/mockData/schoolServices';
import { Button } from '@/src/components/ui/button';
import { HeartPulse, Stethoscope, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

export default function HealthPage() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Y Tế Học Đường</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi hồ sơ sức khỏe, ghi nhận sự cố y tế và cấp phát thuốc.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="shadow-sm">Hồ sơ sức khỏe</Button>
          <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
            <Stethoscope className="mr-2 h-4 w-4" />
            Ghi nhận sự cố
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sự cố Y tế gần đây</CardTitle>
            <CardDescription>Nhật ký xử lý các vấn đề sức khỏe của học sinh tại trường</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {HEALTH_INCIDENTS.map((incident, index) => (
                <div key={incident.id} className="relative pl-6 sm:pl-8 py-2">
                  <div className="absolute left-0 top-3 bottom-0 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className={`absolute left-[-4px] top-3 h-2 w-2 rounded-full ring-4 ring-white dark:ring-slate-950 ${incident.severity === 'Khẩn cấp' ? 'bg-rose-500' : incident.severity === 'Trung bình' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{incident.student}</span>
                      <Badge variant="outline" className="text-[10px] uppercase bg-slate-50">{incident.class}</Badge>
                      {incident.severity === 'Khẩn cấp' && (
                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 ml-2">Khẩn cấp</Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.date).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Triệu chứng:</span> {incident.type}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Xử lý:</span> {incident.action}
                  </div>
                  
                  <div className="mt-3">
                    {incident.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Đã xử lý xong
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        <AlertTriangle className="h-4 w-4" /> Đang theo dõi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-rose-800 dark:text-rose-400 text-base flex items-center gap-2">
                <HeartPulse className="h-5 w-5" />
                Tổng quan Y tế
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Sự cố trong ngày:</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Đang theo dõi:</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">1</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">HS có lưu ý y tế:</span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">18</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tủ thuốc & Vật tư</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="text-slate-600">Băng cá nhân</span>
                  <span className="font-medium text-emerald-600">Còn nhiều</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="text-slate-600">Thuốc hạ sốt</span>
                  <span className="font-medium text-amber-600">Sắp hết (5 vỉ)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Bông y tế</span>
                  <span className="font-medium text-rose-600">Cần nhập thêm</span>
                </div>
                <Button onClick={(e) => {
    const btnText = e.currentTarget.innerText || 'Thao tác';
    toast({ variant: 'success', title: 'Thành công', message: `Đã thực hiện: ${btnText}` });
  }}  variant="outline" className="w-full mt-4 text-xs">Kiểm kê vật tư</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
