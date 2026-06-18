'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Plus, Search, CalendarClock } from 'lucide-react';

export function BookingsTab() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bàn giao / Mượn / Đặt lịch</CardTitle>
            <CardDescription>Quản lý yêu cầu đặt lịch phòng, mượn trả thiết bị và tài sản</CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tạo yêu cầu mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm yêu cầu..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <CalendarClock className="mr-2 h-4 w-4" /> Xem theo lịch
          </Button>
        </div>
        <div className="rounded-md border text-center py-8 text-muted-foreground">
          Chưa có yêu cầu đặt lịch / mượn thiết bị
        </div>
      </CardContent>
    </Card>
  );
}
