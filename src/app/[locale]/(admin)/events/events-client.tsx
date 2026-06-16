'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Dialog } from '@/src/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Users, Plus, Trash2, HelpCircle, Clock, Info } from 'lucide-react';
import { createEvent, deleteEvent } from './actions';

type EventItem = {
  id: string;
  title: string;
  date: Date;
  department: string | null;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
};

export default function EventsPage({ initialData }: { initialData?: { data?: EventItem[] } }) {
  const events = initialData?.data || [];
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [department, setDepartment] = useState('Ban Giám hiệu');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');

  const handleCreate = () => {
    if (!title.trim() || !date) return;
    startTransition(async () => {
      const res = await createEvent({ title, date, department, desc, location });
      if (res.success) {
        setIsOpen(false);
        setTitle('');
        setDate('');
        setDesc('');
        setLocation('');
      } else {
        alert("Lỗi: " + res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xác nhận xóa sự kiện này?")) return;
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (!res.success) {
        alert("Lỗi: " + res.error);
      }
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lịch & Sự kiện</h2>
          <p className="text-sm text-slate-500">Quản lý các sự kiện lớn, lịch họp BGH và thời gian biểu công tác toàn trường</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2 self-start sm:self-center">
          <Plus className="h-4 w-4" /> Tạo sự kiện mới
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Help / Explanations (4 cols) */}
        <Card className="xl:col-span-4 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" /> Hoạt động như thế nào?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100">1. Đồng bộ lịch làm việc tập trung</p>
              <p>Mô-đun lịch hoạt động như một trung tâm điều hành kế hoạch, tích hợp trực tiếp từ lịch hội họp của BGH tới các tổ chuyên môn.</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">2. Phân tách theo bộ phận quản lý</p>
              <p>Các sự kiện có thể phân quyền lọc theo phòng ban (Ví dụ: Tổ Toán - Tin học, Tổ Ngữ văn, Phòng Khảo thí). Giúp nhân viên chỉ theo dõi các sự kiện liên quan trực tiếp tới họ.</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">3. Tích hợp trực tiếp database</p>
              <p>Mỗi khi tạo mới sự kiện, dữ liệu được ghi nhận vào bảng <code className="font-mono bg-slate-100 dark:bg-slate-900 px-1 rounded">events</code> phục vụ hiển thị lịch biểu trên dashboard cá nhân của từng giáo viên.</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Events List (8 cols) */}
        <Card className="xl:col-span-8 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[500px]">
          <CardHeader className="p-5 border-b border-slate-150 dark:border-slate-800">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" /> Danh sách sự kiện sắp tới ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((event) => (
              <div key={event.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 text-[10px] font-bold">
                      {event.department || 'Toàn trường'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">#{event.id}</span>
                  </div>
                  
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {event.title}
                  </h4>

                  <p className="text-xs text-slate-500 max-w-xl">
                    {event.payload?.desc || 'Không có mô tả chi tiết.'}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatDate(event.date)}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatTime(event.date)}</span>
                    {event.payload?.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.payload.location}</span>}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(event.id)}
                  disabled={isPending}
                  className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {events.length === 0 && (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Info className="h-8 w-8 text-slate-300 mb-2" />
                Không có sự kiện nào sắp tới.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CREATE EVENT DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen} title="Tạo sự kiện mới">
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề sự kiện <span className="text-red-500">*</span></label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên buổi họp, cuộc thi, lễ kỷ niệm..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thời gian diễn ra <span className="text-red-500">*</span></label>
              <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phòng ban phụ trách</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm dark:bg-slate-900 dark:border-slate-800"
              >
                <option value="Ban Giám hiệu">Ban Giám hiệu</option>
                <option value="Tổ Toán - Tin học">Tổ Toán - Tin học</option>
                <option value="Tổ Ngữ văn">Tổ Ngữ văn</option>
                <option value="Tổ Văn phòng - CNTT">Tổ Văn phòng - CNTT</option>
                <option value="Toàn trường">Toàn trường (Chung)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Địa điểm tổ chức</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Phòng hội trường, Sân bóng, Lớp học..." />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nội dung chi tiết</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Mô tả nội dung, chuẩn bị tài liệu..." rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
              {isPending ? 'Đang tạo...' : 'Xác nhận tạo'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

