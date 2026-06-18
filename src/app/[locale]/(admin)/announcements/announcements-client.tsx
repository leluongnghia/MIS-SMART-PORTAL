'use client';

import { useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Dialog } from '@/src/components/ui/dialog';
import { 
  Bell, Calendar, MapPin, Plus, Trash2, Megaphone, Users, 
  User, ArrowRight, Star, Clock, AlertTriangle, FileText, ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { serverStorage } from '@/src/libs/client/server-storage';
import { MOCK_USERS } from '@/src/mockData';
import { createAnnouncement, deleteAnnouncement } from './actions';

type AnnouncementRow = {
  id: string;
  title: string;
  senderName: string | null;
  isMeeting: boolean;
  payload: {
    id: string;
    title: string;
    content: string;
    senderName: string;
    senderTitle: string;
    senderAvatar: string;
    createdAt: string;
    targetRoles: string[];
    isMeeting: boolean;
    meetingTime?: string;
    meetingLocation?: string;
  } | any;
  createdAt?: string | Date;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'BGH',
  MANAGER: 'Trưởng phòng',
  STAFF: 'Giáo viên/Nhân viên',
  PARENT: 'Phụ huynh',
  STUDENT: 'Học sinh'
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200',
  MANAGER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200',
  STAFF: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200',
  PARENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200',
  STUDENT: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200'
};

export default function AnnouncementsDashboard({ initialData }: { initialData?: { data?: AnnouncementRow[] } }) {
  const announcementsList = initialData?.data || [];
  
  const [activeTab, setActiveTab] = useState<'all' | 'announcement' | 'meeting'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isMeeting, setIsMeeting] = useState(false);
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['STAFF']);
  const [errorMsg, setErrorMsg] = useState('');

  const currentUser = useMemo(() => {
    const userId = serverStorage.getItem('mis_edutask_logged_in_user_id');
    return MOCK_USERS.find(user => user.id === userId) || MOCK_USERS[0];
  }, []);

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const filteredAnnouncements = useMemo(() => {
    return announcementsList
      .map(row => {
        const payload = row.payload || {};
        return {
          id: row.id,
          title: payload.title || row.title || 'Thông báo không có tiêu đề',
          content: payload.content || '',
          senderName: payload.senderName || row.senderName || 'Ban Giám Hiệu',
          senderTitle: payload.senderTitle || 'Ban Giám Hiệu',
          senderAvatar: payload.senderAvatar || 'https://i.pravatar.cc/150?u=bgh',
          createdAt: payload.createdAt || row.createdAt || new Date().toISOString(),
          targetRoles: payload.targetRoles || ['ADMIN', 'MANAGER', 'STAFF'],
          isMeeting: payload.isMeeting !== undefined ? payload.isMeeting : row.isMeeting,
          meetingTime: payload.meetingTime,
          meetingLocation: payload.meetingLocation
        };
      })
      .filter(ann => {
        // Tab type filter
        if (activeTab === 'announcement' && ann.isMeeting) return false;
        if (activeTab === 'meeting' && !ann.isMeeting) return false;
        
        // Target role filter
        if (roleFilter !== 'all' && !ann.targetRoles.includes(roleFilter)) return false;
        
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [announcementsList, activeTab, roleFilter]);

  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề thông báo.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Vui lòng nhập nội dung thông báo.');
      return;
    }
    if (selectedRoles.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một đối tượng nhận thông báo.');
      return;
    }
    if (isMeeting && (!meetingTime.trim() || !meetingLocation.trim())) {
      setErrorMsg('Vui lòng nhập đầy đủ thời gian và địa điểm họp.');
      return;
    }

    startTransition(async () => {
      const res = await createAnnouncement({
        title,
        content,
        senderName: currentUser.name,
        senderTitle: currentUser.title || currentUser.roleName,
        senderAvatar: currentUser.avatar,
        targetRoles: selectedRoles,
        isMeeting,
        meetingTime: isMeeting ? meetingTime : undefined,
        meetingLocation: isMeeting ? meetingLocation : undefined,
      });

      if (res.success) {
        setIsCreateOpen(false);
        setTitle('');
        setContent('');
        setIsMeeting(false);
        setMeetingTime('');
        setMeetingLocation('');
        setSelectedRoles(['STAFF']);
      } else {
        setErrorMsg('Lỗi: ' + res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    startTransition(async () => {
      const res = await deleteAnnouncement(id);
      if (!res.success) {
        alert('Lỗi khi xóa: ' + res.error);
      }
    });
  };

  const formatDisplayTime = (isoString: string) => {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header card with gradient background */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200 text-xs px-2.5 py-0.5 mb-1 flex items-center gap-1.5 w-fit">
            <Megaphone className="h-3 w-3" /> Thông báo từ Ban Giám Hiệu
          </Badge>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Thông báo & Lịch họp nội bộ
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cập nhật các chỉ đạo chính thức, thông tri hoạt động, và cuộc họp hội đồng sư phạm nhà trường
          </p>
        </div>
        
        {canManage && (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-sm shadow-lg shadow-indigo-600/15 h-10 px-5 rounded-2xl border-0 shrink-0"
          >
            <Plus className="h-4.5 w-4.5" /> Tạo thông báo mới
          </Button>
        )}
      </div>

      {/* Toolbar filter area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-250/60 dark:border-slate-800 pb-4">
        {/* Type tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold gap-1 shadow-inner">
          <button 
            onClick={() => setActiveTab('all')}
            className={cn("px-4 py-2 rounded-lg transition-colors", activeTab === 'all' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
          >
            Tất cả ({announcementsList.length})
          </button>
          <button 
            onClick={() => setActiveTab('announcement')}
            className={cn("px-4 py-2 rounded-lg transition-colors", activeTab === 'announcement' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
          >
            Thông báo ({announcementsList.filter(a => !a.isMeeting).length})
          </button>
          <button 
            onClick={() => setActiveTab('meeting')}
            className={cn("px-4 py-2 rounded-lg transition-colors", activeTab === 'meeting' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
          >
            Lịch họp ({announcementsList.filter(a => a.isMeeting).length})
          </button>
        </div>

        {/* Target role filter select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Đối tượng nhận:</span>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 py-1.5 pl-3 pr-8 text-xs font-semibold ring-1 ring-inset ring-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
          >
            <option value="all">Tất cả đối tượng</option>
            <option value="ADMIN">Ban Giám hiệu (BGH)</option>
            <option value="MANAGER">Trưởng bộ phận</option>
            <option value="STAFF">Giáo viên/Nhân viên</option>
          </select>
        </div>
      </div>

      {/* Main timeline listing */}
      <div className="space-y-6">
        {filteredAnnouncements.length === 0 ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-800 shadow-none">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Megaphone className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Không tìm thấy thông báo nào phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ cập nhật thông tin mới nhất từ BGH khi có thông tri mới.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((ann, idx) => (
            <Card 
              key={ann.id || idx} 
              className={cn(
                "border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group",
                ann.isMeeting && "border-l-4 border-l-blue-500"
              )}
            >
              {/* Creator details top bar */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={ann.senderAvatar} 
                    alt={ann.senderName} 
                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-slate-950 shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {ann.senderName} 
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{ann.senderTitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDisplayTime(ann.createdAt)}
                  </span>
                  {canManage && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(ann.id)}
                      className="h-7 w-7 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>

                {/* Meeting detail card */}
                {ann.isMeeting && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Thời gian họp</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{ann.meetingTime || 'Chưa xếp lịch'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Địa điểm họp</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{ann.meetingLocation || 'Phòng họp trực tuyến'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target roles list footer */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Gửi tới:</span>
                  {ann.targetRoles.map(role => (
                    <Badge 
                      key={role} 
                      className={cn("px-2.5 py-0.5 rounded-full border text-[10px] font-bold shadow-none", ROLE_COLORS[role] || "bg-slate-50 text-slate-600")}
                    >
                      {ROLE_LABELS[role] || role}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Tạo thông báo mới từ BGH">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-150 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Tiêu đề thông báo:</label>
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề cuộc họp hoặc thông báo..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Nội dung chi tiết:</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo đầy đủ chỉ thị hoặc yêu cầu của BGH..."
              rows={4}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Target roles select checklist */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Đối tượng nhận thông báo:</label>
            <div className="flex flex-wrap gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              {['ADMIN', 'MANAGER', 'STAFF', 'PARENT', 'STUDENT'].map(role => (
                <label key={role} className="flex items-center gap-1.5 text-xs cursor-pointer select-none font-medium text-slate-700 dark:text-slate-300">
                  <input 
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  {ROLE_LABELS[role]}
                </label>
              ))}
            </div>
          </div>

          {/* Meeting configuration toggle */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none font-bold text-slate-700 dark:text-slate-300">
              <input 
                type="checkbox"
                checked={isMeeting}
                onChange={e => setIsMeeting(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Đây là lịch họp nội bộ BGH / Hội đồng
            </label>

            {isMeeting && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 block uppercase">Thời gian họp:</label>
                  <input 
                    type="text"
                    value={meetingTime}
                    onChange={e => setMeetingTime(e.target.value)}
                    placeholder="Ví dụ: 14:00 ngày 22/06"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 block uppercase">Địa điểm:</label>
                  <input 
                    type="text"
                    value={meetingLocation}
                    onChange={e => setMeetingLocation(e.target.value)}
                    placeholder="Ví dụ: Phòng họp tầng 2"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button 
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-0 text-xs h-9 rounded-xl shadow-md"
            >
              {isPending ? 'Đang xử lý...' : 'Đăng thông báo'}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 text-slate-600 hover:bg-slate-50 text-xs h-9 rounded-xl"
            >
              Hủy bỏ
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
