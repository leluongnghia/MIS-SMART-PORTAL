'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Plus, Search } from 'lucide-react';

export function RenovationProjectsTab() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dự án cải tạo lớn</CardTitle>
            <CardDescription>Theo dõi và quản lý các dự án sửa chữa, nâng cấp cơ sở vật chất quy mô lớn</CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Thêm dự án
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm dự án..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-md border text-center py-8 text-muted-foreground">
          Chưa có dữ án cải tạo nào
        </div>
      </CardContent>
    </Card>
  );
}
