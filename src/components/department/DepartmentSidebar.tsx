'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  CalendarDays, 
  Users, 
  ClipboardCheck, 
  Bell, 
  MessageSquare, 
  Settings 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/badge';

interface DepartmentSidebarProps {
  locale: string;
  departmentId: string;
  departmentName: string;
  collapsed?: boolean;
}

export function DepartmentSidebar({ locale, departmentId, departmentName, collapsed = false }: DepartmentSidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan bộ phận', href: '', icon: LayoutDashboard }
      ]
    },
    {
      title: 'NGHIỆP VỤ BỘ PHẬN',
      items: [
        { label: 'Công việc nội bộ', href: '/tasks', icon: CheckSquare, badge: 2 },
        { label: 'Duyệt giáo án', href: '/lesson-plans', icon: BookOpen, badge: 0 },
        { label: 'Đề xuất nghỉ phép', href: '/leave-requests', icon: CalendarDays, badge: 1 },
        { label: 'Thành viên tổ', href: '/members', icon: Users, badge: 0 },
        { label: 'Chỉ đạo BGH', href: '/directives', icon: ClipboardCheck, badge: 1 },
        { label: 'Thông báo nội bộ', href: '/announcements', icon: Bell, badge: 0 },
        { label: 'Chat nội bộ', href: '/chat', icon: MessageSquare, badge: 0 },
        { label: 'Người dùng & phân quyền', href: '/settings', icon: Settings, badge: 0 }
      ]
    }
  ];

  const basePath = `/${locale}/departments/${departmentId}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        {!collapsed && (
          <div className="text-sm font-black text-slate-800 dark:text-slate-200">
            {departmentName}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {!collapsed && (
              <div className="mb-2 px-3">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500">
                  {group.title}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {group.items.map(item => {
                const fullHref = `${basePath}${item.href}`;
                // Explicit matching logic to avoid empty string overlapping all routes
                const isActive = item.href === '' 
                  ? pathname === basePath 
                  : pathname.startsWith(fullHref);

                return (
                  <Link
                    key={item.href}
                    href={fullHref}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                    )}
                  >
                    <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500')} />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && item.badge > 0 ? (
                      <Badge 
                        variant={isActive ? "secondary" : "destructive"} 
                        className={cn(
                          "ml-auto h-5 px-1.5 text-[10px]",
                          isActive ? "bg-white/20 hover:bg-white/30 text-white" : ""
                        )}
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
