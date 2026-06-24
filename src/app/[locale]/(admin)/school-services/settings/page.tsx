'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Save, Sliders, Users, Bus, Utensils, ShieldCheck } from 'lucide-react';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cấu Hình Dịch Vụ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tham số, phân quyền và quy trình phê duyệt của khối Dịch vụ Học đường.
          </p>
        </div>
        <Button onClick={() => alert('Tính năng đang được phát triển')}  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Save className="mr-2 h-4 w-4" />
          Lưu cấu hình
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="p-3 bg-slate-100 text-slate-900 font-medium rounded-lg flex items-center gap-2 dark:bg-slate-800 dark:text-white cursor-pointer">
            <Sliders className="h-4 w-4" /> Cấu hình chung
          </div>
          <div className="p-3 text-slate-600 font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 cursor-pointer">
            <Users className="h-4 w-4" /> Phân quyền Nhân sự
          </div>
          <div className="p-3 text-slate-600 font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 cursor-pointer">
            <ShieldCheck className="h-4 w-4" /> Quy trình Phê duyệt
          </div>
          <div className="p-3 text-slate-600 font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 cursor-pointer">
            <Utensils className="h-4 w-4" /> Tham số Bếp ăn
          </div>
          <div className="p-3 text-slate-600 font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 cursor-pointer">
            <Bus className="h-4 w-4" /> Tham số Xe đưa đón
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thời gian chốt dịch vụ hằng ngày</CardTitle>
              <CardDescription>Quy định mốc thời gian hệ thống tự động khóa đăng ký/hủy dịch vụ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="meal-cutoff">Giờ chốt Suất ăn (Báo hủy/Đăng ký thêm)</Label>
                  <Input id="meal-cutoff" type="time" defaultValue="08:00" />
                  <p className="text-xs text-slate-500">Sau thời gian này, bếp sẽ bắt đầu chuẩn bị thực phẩm.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transport-cutoff">Giờ chốt Xe đưa đón (Chiều về)</Label>
                  <Input id="transport-cutoff" type="time" defaultValue="14:30" />
                  <p className="text-xs text-slate-500">Phụ huynh báo đón sớm phải trước giờ này.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quy định Ticket Phản ánh</CardTitle>
              <CardDescription>SLA (Thời gian cam kết xử lý) cho các ticket hỗ trợ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sla-urgent">Mức độ: Khẩn cấp (Giờ)</Label>
                  <Input id="sla-urgent" type="number" defaultValue="2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sla-high">Mức độ: Cao (Giờ)</Label>
                  <Input id="sla-high" type="number" defaultValue="8" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sla-normal">Mức độ: Bình thường (Giờ)</Label>
                  <Input id="sla-normal" type="number" defaultValue="24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cảnh báo & Tự động</CardTitle>
              <CardDescription>Thiết lập tự động hóa trong quản lý dịch vụ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-assign Ticket Y tế</Label>
                  <p className="text-sm text-slate-500">Tự động phân công ticket loại Y tế cho Trưởng phòng Y tế trực ca.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <Label className="text-base font-medium">Cảnh báo tồn kho Đồng phục</Label>
                  <p className="text-sm text-slate-500">Gửi thông báo khi số lượng size bất kỳ dưới 20 chiếc.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <Label className="text-base font-medium">Báo cáo Dịch vụ tự động</Label>
                  <p className="text-sm text-slate-500">Gửi báo cáo tổng hợp chi phí và CSAT cho Giám đốc Điều hành vào Thứ 6 hàng tuần.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
