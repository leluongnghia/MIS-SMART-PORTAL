'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import { Dialog } from '@/src/components/ui/dialog';
import { CheckCircle2, XCircle, FileText, Camera } from 'lucide-react';
import { CLEANING_CHECKLISTS } from '@/src/mockData/cleaning';

export default function ChecklistsTab() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thành công", description: "Đã tạo phiếu kiểm tra đột xuất." });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddOpen(true)}>
          <FileText className="mr-2 h-4 w-4" /> Kiểm tra đột xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CLEANING_CHECKLISTS.map((checklist) => (
          <Card key={checklist.id}>
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{checklist.areaName}</CardTitle>
                <CardDescription>Kiểm tra lúc: {checklist.date}</CardDescription>
                <CardDescription>Người kiểm tra: {checklist.inspector}</CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${checklist.score === checklist.maxScore ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {checklist.score}/{checklist.maxScore}
                </div>
                <div className="text-sm text-slate-500">Điểm số</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Chi tiết tiêu chí:</h4>
                <div className="space-y-2">
                  {checklist.items.map(item => (
                    <div key={item.id} className="flex items-start justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <span className={item.passed ? "text-slate-700 dark:text-slate-300" : "text-rose-700 dark:text-rose-400 font-medium"}>
                          {item.name}
                        </span>
                      </div>
                      {!item.passed && item.notes && (
                        <span className="text-xs text-rose-500 italic text-right max-w-[150px]">{item.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast({ title: "Thông báo", description: "Tính năng xem ảnh minh chứng đang được phát triển." })}>
                    <Camera className="mr-2 h-4 w-4" /> Xem ảnh minh chứng (3)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tạo phiếu kiểm tra đột xuất">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Khu vực kiểm tra *</label>
            <Select defaultValue="">
              <option value="">-- Chọn khu vực --</option>
              <option value="Nhà vệ sinh nam tầng 1">Nhà vệ sinh nam tầng 1</option>
              <option value="Nhà ăn học sinh">Nhà ăn học sinh</option>
              <option value="Hành lang khu B">Hành lang khu B</option>
              <option value="Sân bóng rổ">Sân bóng rổ</option>
              <option value="Phòng Lab Hóa">Phòng Lab Hóa</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Người kiểm tra *</label>
            <Input required placeholder="Tên người kiểm tra..." />
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium">Đánh giá tiêu chí</label>
            <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg p-3 max-h-[200px] overflow-y-auto">
              {['Sàn sạch, không trơn trượt', 'Thùng rác đã đổ', 'Có giấy vệ sinh', 'Có xà phòng', 'Không có mùi hôi', 'Cửa kính sạch sẽ', 'Thiết bị hoạt động tốt'].map((criteria, idx) => (
                <label key={idx} className="flex items-center gap-2 text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" defaultChecked />
                  {criteria}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú thêm</label>
            <Input placeholder="Các lưu ý khác (nếu có)..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Hủy bỏ</Button>
            <Button type="submit">Tạo phiếu</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
