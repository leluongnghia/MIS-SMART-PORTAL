'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Plus, Search } from 'lucide-react';

export function WarrantiesTab() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bảo hành</CardTitle>
            <CardDescription>Quản lý thông tin bảo hành của thiết bị, theo dõi hạn bảo hành</CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Thêm thông tin bảo hành
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thông tin..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-md border text-center py-8 text-muted-foreground">
          Chưa có dữ liệu bảo hành
        </div>
      </CardContent>
    </Card>
  );
}
