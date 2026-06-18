'use client';

import { useMemo, useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import {
  AlertTriangle, ArrowRight, BarChart3, Boxes, Building2, CalendarCheck, CheckCircle2,
  ClipboardList, Download, FileBarChart, Handshake, Megaphone, Monitor, PackagePlus,
  Plus, Search, Settings, ShieldAlert, ShoppingCart, TrendingDown, TrendingUp, Wrench
} from 'lucide-react';
import {
  FACILITY_ASSET_STATUS,
  FACILITY_LOCATION_STATUS,
  MAINTENANCE_STATUS,
  REPAIR_PRIORITY,
  REPAIR_STATUS,
  MOCK_ASSETS,
  MOCK_LOCATIONS,
  MOCK_MAINTENANCE_LOGS,
  MOCK_REPAIR_REQUESTS,
  type FacilityAsset,
  type FacilityLocation,
  type FacilityMaintenanceLog,
  type FacilityRepairRequest,
} from './facilities.constants';
import { SuppliesTab } from './components/supplies-tab';
import { BookingsTab } from './components/bookings-tab';

type Props = {
  initialLocations?: any[];
  initialAssets?: any[];
  initialRepairRequests?: any[];
  initialSupplies?: any[];
  initialSuppliers?: any[];
  initialSafetyChecks?: any[];
  initialBookings?: any[];
  initialRenovationProjects?: any[];
};

type PurchaseRequest = {
  id: string;
  title: string;
  requestedByName: string;
  department: string;
  itemCount: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SUBMITTED' | 'INFO_REQUIRED' | 'APPROVED';
  neededByDate: string;
};

type Supply = { id: string; name: string; current: number; min: number; unit: string; status: 'LOW' | 'NEED_MORE' };

const purchaseRequests: PurchaseRequest[] = [
  { id: 'P001', title: 'Thay máy chiếu phòng 1A', requestedByName: 'Nguyễn Văn A', department: 'Khối 1', itemCount: 1, priority: 'HIGH', status: 'SUBMITTED', neededByDate: '20/06' },
  { id: 'P002', title: 'Mua bổ sung 10 bộ bàn ghế lớp 1', requestedByName: 'Trần Thị B', department: 'Khối 1', itemCount: 2, priority: 'MEDIUM', status: 'SUBMITTED', neededByDate: '25/06' },
  { id: 'P003', title: 'Mua mực in cho phòng hành chính', requestedByName: 'Lê Văn C', department: 'Hành chính', itemCount: 1, priority: 'LOW', status: 'INFO_REQUIRED', neededByDate: '22/06' },
  { id: 'P004', title: 'Mua laptop cho phòng STEM', requestedByName: 'Phạm Thị D', department: 'STEM', itemCount: 4, priority: 'HIGH', status: 'SUBMITTED', neededByDate: '28/06' },
  { id: 'P005', title: 'Mua thiết bị thể thao ngoài trời', requestedByName: 'Hoàng Văn E', department: 'Thể chất', itemCount: 6, priority: 'MEDIUM', status: 'APPROVED', neededByDate: '30/06' },
];

const lowStockSupplies: Supply[] = [
  { id: 'S001', name: 'Mực in Canon', current: 1, min: 3, unit: 'hộp', status: 'LOW' },
  { id: 'S002', name: 'Bóng đèn LED', current: 4, min: 10, unit: 'chiếc', status: 'LOW' },
  { id: 'S003', name: 'Pin điều khiển', current: 2, min: 8, unit: 'viên', status: 'LOW' },
  { id: 'S004', name: 'Dây mạng Cat6', current: 5, min: 20, unit: 'mét', status: 'NEED_MORE' },
  { id: 'S005', name: 'Ổ cắm điện 3 chấu', current: 3, min: 12, unit: 'cái', status: 'NEED_MORE' },
  { id: 'S006', name: 'Giấy in A4', current: 8, min: 20, unit: 'ream', status: 'LOW' },
];

const maintenanceSeed: FacilityMaintenanceLog[] = [
  ...MOCK_MAINTENANCE_LOGS,
  { id: 'M002', assetId: 'A001', assetName: 'Máy chiếu Epson P01', maintenanceType: 'INSPECTION', scheduledDate: '2026-06-19T00:00:00Z', completedDate: null, responsibleUserId: 'U002', responsibleUserName: 'Trần Thị B', status: 'SCHEDULED', checklist: {}, result: null, note: 'Vệ sinh thiết bị', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'M003', assetId: 'A007', assetName: 'Router phòng máy', maintenanceType: 'SAFETY', scheduledDate: '2026-06-20T00:00:00Z', completedDate: null, responsibleUserId: 'U003', responsibleUserName: 'Lê Văn C', status: 'DUE_SOON', checklist: {}, result: null, note: 'Kiểm tra mạng', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'M004', assetId: 'A005', assetName: 'Camera cổng trường', maintenanceType: 'SAFETY', scheduledDate: '2026-06-22T00:00:00Z', completedDate: null, responsibleUserId: 'U001', responsibleUserName: 'Nguyễn Văn A', status: 'SCHEDULED', checklist: {}, result: null, note: 'Kiểm tra an ninh', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'M005', assetId: 'A009', assetName: 'Loa hội trường', maintenanceType: 'ROUTINE', scheduledDate: '2026-06-15T00:00:00Z', completedDate: null, responsibleUserId: 'U002', responsibleUserName: 'Trần Thị B', status: 'OVERDUE', checklist: {}, result: null, note: 'Bảo trì loa hội trường', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const extraRepairs: FacilityRepairRequest[] = [
  { id: 'R004', title: 'Camera tầng 2 mất tín hiệu', assetId: 'A005', assetName: 'Camera hành lang tầng 2', locationId: null, locationName: 'Hành lang tầng 2', description: 'Không ghi hình từ 7h sáng.', priority: 'HIGH', status: 'PROCESSING', requestedById: 'U001', requestedByName: 'Nguyễn Văn A', assignedToId: 'U001', assignedToName: 'Nguyễn Văn A', dueDate: '2026-06-17T00:00:00Z', completedAt: null, resolutionNote: null, createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'R005', title: 'Router phòng máy chập chờn', assetId: 'A007', assetName: 'Router phòng máy', locationId: 'L003', locationName: 'Phòng máy tính', description: 'Mất mạng khi cả lớp thực hành.', priority: 'MEDIUM', status: 'PROCESSING', requestedById: 'U002', requestedByName: 'Trần Thị B', assignedToId: 'U003', assignedToName: 'Lê Văn C', dueDate: '2026-06-20T00:00:00Z', completedAt: null, resolutionNote: null, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'R006', title: 'Bàn học lớp 1A bị hỏng chân', assetId: 'A006', assetName: 'Bộ bàn ghế lớp 1A', locationId: 'L001', locationName: 'Phòng 1A', description: 'Một bàn học sinh lung lay, cần thay chân.', priority: 'LOW', status: 'DONE', requestedById: 'U004', requestedByName: 'Lê Văn C', assignedToId: 'U002', assignedToName: 'Trần Thị B', dueDate: '2026-06-21T00:00:00Z', completedAt: '2026-06-18T00:00:00Z', resolutionNote: 'Đã thay chân bàn.', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
];

const statusTone: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  READY: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300',
  DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  NEW: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  URGENT: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  HIGH: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  BROKEN: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  LOST: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  DUE_SOON: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  MAINTENANCE: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300',
  NEED_MORE: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300',
  INFO_REQUIRED: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300',
  WAITING_PART: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300',
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300',
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
};

const statToneColors: Record<string, { border: string; text: string; iconBg: string }> = {
  SCHEDULED: { border: 'border-l-blue-500', text: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  ACTIVE: { border: 'border-l-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  MAINTENANCE: { border: 'border-l-orange-500', text: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
  PROCESSING: { border: 'border-l-amber-500', text: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  BROKEN: { border: 'border-l-rose-500', text: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
  NEW: { border: 'border-l-red-500', text: 'text-red-600 dark:text-red-400', iconBg: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  SUBMITTED: { border: 'border-l-violet-500', text: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
  NEED_MORE: { border: 'border-l-pink-500', text: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' },
};

const alertToneStyles: Record<string, { border: string; bg: string; text: string; iconColor: string }> = {
  OVERDUE: { border: 'border-red-200 dark:border-red-950', bg: 'bg-red-50/45 dark:bg-red-950/10', text: 'text-red-900 dark:text-red-300', iconColor: 'text-red-600' },
  NEED_MORE: { border: 'border-orange-200 dark:border-orange-950', bg: 'bg-orange-50/45 dark:bg-orange-950/10', text: 'text-orange-900 dark:text-orange-300', iconColor: 'text-orange-600' },
  DUE_SOON: { border: 'border-amber-200 dark:border-amber-950', bg: 'bg-amber-50/45 dark:bg-amber-950/10', text: 'text-amber-900 dark:text-amber-300', iconColor: 'text-amber-600' },
};

function FacilityBadge({ value, label }: { value: string; label?: string }) {
  const toneClass = statusTone[value] || statusTone.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${toneClass} whitespace-nowrap`}>
      {label || value}
    </span>
  );
}

function getSlaStatus(req: FacilityRepairRequest) {
  if (req.completedAt) return req.dueDate && new Date(req.completedAt) <= new Date(req.dueDate) ? 'Hoàn thành đúng hạn' : 'Hoàn thành quá hạn';
  if (req.dueDate && new Date(req.dueDate) < new Date()) return 'Quá hạn xử lý';
  const ageHours = (Date.now() - new Date(req.createdAt).getTime()) / 36e5;
  const receiveLimit = req.priority === 'URGENT' ? 2 : req.priority === 'HIGH' ? 4 : req.priority === 'MEDIUM' ? 24 : 48;
  if (!req.assignedToName && ageHours > receiveLimit) return 'Quá hạn tiếp nhận';
  if (req.dueDate && new Date(req.dueDate).getTime() - Date.now() < 24 * 36e5) return 'Sắp quá hạn';
  return 'Trong hạn';
}

function slaTone(s: string) { return s.includes('Quá hạn') || s.includes('quá hạn') ? 'OVERDUE' : s.includes('Sắp') ? 'DUE_SOON' : 'DONE'; }
function fmtDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function StatCard({ title, value, desc, tone, icon: Icon, trend }: any) {
  const styles = statToneColors[tone] || statToneColors.SCHEDULED;
  return (
    <Card className={`overflow-hidden border border-border/60 border-l-4 ${styles.border} shadow-sm bg-card/95 transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
            <div className={`text-3xl font-extrabold tracking-tight ${styles.text}`}>{value}</div>
            <p className="text-xs text-muted-foreground">{desc}</p>
            {trend && (
              <p className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {trend}
              </p>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${styles.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FacilitiesClient({ initialLocations = [], initialAssets = [], initialRepairRequests = [], initialSupplies = [] }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  // React local states for full CRUD mock interaction
  const [locations, setLocations] = useState<FacilityLocation[]>(initialLocations.length ? initialLocations : MOCK_LOCATIONS);
  const [assets, setAssets] = useState<FacilityAsset[]>(initialAssets.length ? initialAssets : MOCK_ASSETS);
  const [repairRequests, setRepairRequests] = useState<FacilityRepairRequest[]>(initialRepairRequests.length ? initialRepairRequests : [...MOCK_REPAIR_REQUESTS, ...extraRepairs]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<FacilityMaintenanceLog[]>(maintenanceSeed);
  const [purchaseRequestsList, setPurchaseRequestsList] = useState<any[]>(purchaseRequests);
  const supplies = initialSupplies.length ? initialSupplies : lowStockSupplies;

  const stats = useMemo(() => {
    const activeAssets = assets.filter(a => ['ACTIVE', 'READY'].includes(a.status)).length;
    const needMaintenance = assets.filter(a => a.status === 'MAINTENANCE' || a.maintenancePriority === 'HIGH').length;
    const repairing = repairRequests.filter(r => ['PROCESSING', 'WAITING_PART'].includes(r.status)).length;
    const brokenLost = assets.filter(a => ['BROKEN', 'LOST'].includes(a.status)).length;
    const newRepairs = repairRequests.filter(r => r.status === 'NEW').length;
    const pendingPurchases = purchaseRequestsList.filter(p => ['SUBMITTED', 'INFO_REQUIRED'].includes(p.status)).length;
    return { activeAssets, needMaintenance, repairing, brokenLost, newRepairs, pendingPurchases };
  }, [assets, repairRequests, purchaseRequestsList]);

  const tabs = [
    ['overview', 'Tổng quan', BarChart3, stats.newRepairs + stats.pendingPurchases], ['locations', 'Phòng & Khu vực', Building2], ['assets', 'Thiết bị & Tài sản', Monitor], ['repairs', 'Yêu cầu sửa chữa', Wrench, stats.newRepairs], ['maintenance', 'Bảo trì', Settings], ['purchases', 'Đề xuất mua sắm', ShoppingCart, stats.pendingPurchases], ['supplies', 'Vật tư tiêu hao', Boxes, lowStockSupplies.length], ['handover', 'Bàn giao / Mượn', Handshake], ['inventory', 'Kiểm kê', ClipboardList], ['reports', 'Báo cáo', FileBarChart],
  ] as const;

  const handleExportCSV = () => {
    const headers = ['Mã/ID', 'Tên thiết bị/Phòng học', 'Danh mục/Loại', 'Vị trí', 'Trạng thái'];
    const csvRows = [headers.join(',')];

    // Add locations
    locations.forEach(loc => {
      csvRows.push([loc.code, loc.name, loc.type, `${loc.building || ''} Tầng ${loc.floor || ''}`, loc.status].map(val => `"${val}"`).join(','));
    });

    // Add assets
    assets.forEach(ast => {
      csvRows.push([ast.code, ast.name, ast.category, ast.locationName || '', ast.status].map(val => `"${val}"`).join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for Vietnamese Excel representation
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_cao_CSVC_Thiet_bi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setActiveTab('repairs')}><Plus className="mr-2 h-4 w-4" />Tạo yêu cầu sửa chữa</Button>
        <Button onClick={() => setActiveTab('assets')} variant="secondary"><Plus className="mr-2 h-4 w-4" />Thêm thiết bị</Button>
        <Button onClick={() => setActiveTab('purchases')} variant="outline"><PackagePlus className="mr-2 h-4 w-4" />Đề xuất mua sắm</Button>
        <Button onClick={handleExportCSV} variant="outline"><Download className="mr-2 h-4 w-4" />Xuất báo cáo</Button>
      </div>
      <div className="relative w-full md:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Tìm thiết bị, phòng, sự cố..." /></div>
    </div>

    <Tabs className="space-y-4">
      <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border bg-muted/35 p-1 shadow-sm">
        {tabs.map(([key, label, Icon, count]) => <TabsTrigger key={key} active={activeTab === key} onClick={() => setActiveTab(key)} className="relative shrink-0 gap-2 rounded-xl px-3 py-2 data-[state=active]:shadow-sm">
          <Icon className="h-4 w-4" />{label}{count ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">{count}</span> : null}
        </TabsTrigger>)}
      </TabsList>

      <TabsContent value="overview" activeValue={activeTab} className="m-0 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng thiết bị" value={assets.length} desc="Đang quản lý trên hệ thống" tone="SCHEDULED" icon={Monitor} trend="+3 tuần này" />
          <StatCard title="Đang sử dụng" value={stats.activeAssets} desc="Hoạt động bình thường" tone="ACTIVE" icon={CheckCircle2} trend="+2 so với tháng trước" />
          <StatCard title="Cần bảo trì" value={stats.needMaintenance} desc="Ưu tiên kiểm tra định kỳ" tone="MAINTENANCE" icon={Settings} trend="+1 tuần này" />
          <StatCard title="Đang sửa chữa" value={stats.repairing} desc="Đang xử lý/chờ linh kiện" tone="PROCESSING" icon={Wrench} trend="+3 so với tuần trước" />
          <StatCard title="Hỏng / Mất" value={stats.brokenLost} desc="Cần xử lý khẩn" tone="BROKEN" icon={ShieldAlert} trend="-1 so với tháng trước" />
          <StatCard title="Yêu cầu sửa chữa mới" value={stats.newRepairs} desc="Chưa phân công xử lý" tone="NEW" icon={Megaphone} trend="+2 hôm nay" />
          <StatCard title="Đề xuất mua sắm chờ duyệt" value={stats.pendingPurchases} desc="Đang chờ duyệt/bổ sung" tone="SUBMITTED" icon={ShoppingCart} trend="+2 tuần này" />
          <StatCard title="Vật tư tồn kho thấp" value={lowStockSupplies.length} desc="Cần bổ sung" tone="NEED_MORE" icon={TrendingDown} trend="+4 cần đặt mua" />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-1 shadow-sm"><CardHeader><CardTitle>Cảnh báo cần xử lý</CardTitle><CardDescription>Ưu tiên vận hành trong tuần</CardDescription></CardHeader><CardContent className="space-y-3">
            {[
              ['3 yêu cầu sửa chữa quá hạn', 'Khẩn cấp', 'OVERDUE'], ['2 thiết bị sắp hết bảo hành trong 30 ngày', 'Trung bình', 'DUE_SOON'], ['5 vật tư dưới mức tồn tối thiểu', 'Cao', 'NEED_MORE'], ['1 lịch bảo trì quá hạn', 'Cao', 'OVERDUE'], ['2 thiết bị/phòng đang mượn quá hạn trả', 'Trung bình', 'DUE_SOON'],
            ].map(([text, level, tone]) => {
              const style = alertToneStyles[tone] || alertToneStyles.DUE_SOON;
              return (
                <div key={text} className={`flex items-center justify-between gap-3 rounded-xl border ${style.border} ${style.bg} p-3`}>
                  <div className="flex gap-3">
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconColor}`} />
                    <div>
                      <p className={`text-sm font-semibold ${style.text}`}>{text}</p>
                      <p className="text-xs text-muted-foreground">Mức độ: {level}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-background/80">Chi tiết</Button>
                </div>
              );
            })}
          </CardContent></Card>

          <Card className="xl:col-span-2 shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Yêu cầu sửa chữa gần đây</CardTitle><CardDescription>SLA, phân công, hạn xử lý</CardDescription></div><Button variant="outline" size="sm" onClick={() => setActiveTab('repairs')}>Xem tất cả</Button></CardHeader><CardContent><div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[760px] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-3 text-left">Sự cố</th><th className="p-3 text-left">Vị trí</th><th className="p-3 text-left">Ưu tiên</th><th className="p-3 text-left">Trạng thái</th><th className="p-3 text-left">Người xử lý</th><th className="p-3 text-left">Hạn xử lý</th><th className="p-3 text-left">SLA</th></tr></thead><tbody>{repairRequests.slice(0, 6).map(r => { const sla = getSlaStatus(r); return <tr key={r.id} className="border-t hover:bg-muted/30"><td className="p-3 font-semibold text-foreground">{r.title}</td><td className="p-3">{r.locationName || r.assetName}</td><td className="p-3"><FacilityBadge value={r.priority} label={REPAIR_PRIORITY[r.priority as keyof typeof REPAIR_PRIORITY]} /></td><td className="p-3"><FacilityBadge value={r.status} label={REPAIR_STATUS[r.status as keyof typeof REPAIR_STATUS]} /></td><td className="p-3">{r.assignedToName || 'Chưa gán'}</td><td className="p-3">{r.dueDate ? fmtDate(r.dueDate) : 'Hôm nay'}</td><td className="p-3"><FacilityBadge value={slaTone(sla)} label={sla} /></td></tr>; })}</tbody></table></div></CardContent></Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Lịch bảo trì sắp tới</CardTitle><CardDescription>Thiết bị, vị trí, phụ trách</CardDescription></div><Button variant="outline" size="sm" onClick={() => setActiveTab('maintenance')}>Xem lịch bảo trì</Button></CardHeader><CardContent className="space-y-3">
            {maintenanceLogs.slice(0, 5).map(m => {
              const borderAccent = m.status === 'OVERDUE' ? 'border-l-4 border-l-red-500' : m.status === 'DUE_SOON' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-400';
              return (
                <div key={m.id} className={`grid gap-2 rounded-xl border p-3 md:grid-cols-[1.3fr_1fr_auto] bg-card/50 ${borderAccent}`}>
                  <div>
                    <p className="font-semibold text-foreground">{m.assetName}</p>
                    <p className="text-xs text-muted-foreground">{m.note || m.maintenanceType} • {fmtDate(m.scheduledDate)}</p>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">Phụ trách: {m.responsibleUserName || 'Chưa gán'}</div>
                  <div className="flex items-center"><FacilityBadge value={m.status} label={MAINTENANCE_STATUS[m.status as keyof typeof MAINTENANCE_STATUS] || (m.status === 'DUE_SOON' ? 'Sắp đến hạn' : m.status)} /></div>
                </div>
              );
            })}
          </CardContent></Card>

          <Card className="shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Đề xuất mua sắm chờ duyệt</CardTitle><CardDescription>Nhu cầu mua sắm/vật tư chưa xử lý</CardDescription></div><Button variant="outline" size="sm" onClick={() => setActiveTab('purchases')}>Xem chi tiết</Button></CardHeader><CardContent className="space-y-3">
            {purchaseRequestsList.slice(0, 4).map(p => {
              const priorityAccent = p.priority === 'URGENT' || p.priority === 'HIGH' ? 'border-l-4 border-l-rose-500' : p.priority === 'MEDIUM' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-slate-300';
              return (
                <div key={p.id} className={`rounded-xl border p-3 bg-card/50 ${priorityAccent}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.requestedByName} • {p.department} • {p.itemCount} mặt hàng • Cần trước {p.neededByDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <FacilityBadge value={p.priority} label={REPAIR_PRIORITY[p.priority]} />
                      <FacilityBadge value={p.status} label={p.status === 'INFO_REQUIRED' ? 'Cần bổ bổ sung thông tin' : p.status === 'SUBMITTED' ? 'Chờ duyệt' : p.status === 'REJECTED' ? 'Đã từ chối' : 'Đã duyệt'} />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">Xem chi tiết</Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                      setPurchaseRequestsList(prev => prev.map(item => item.id === p.id ? { ...item, status: 'APPROVED' } : item));
                      alert('Đã duyệt đề xuất mua sắm thành công!');
                    }}>Duyệt</Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      setPurchaseRequestsList(prev => prev.map(item => item.id === p.id ? { ...item, status: 'REJECTED' } : item));
                      alert('Đã từ chối đề xuất mua sắm.');
                    }}>Từ chối</Button>
                  </div>
                </div>
              );
            })}
          </CardContent></Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Vật tư tồn kho thấp</CardTitle><CardDescription>So sánh tồn hiện tại với mức tối thiểu</CardDescription></div><Button size="sm" onClick={() => setActiveTab('purchases')}><PackagePlus className="mr-2 h-4 w-4" />Tạo đề xuất mua bổ sung</Button></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2">
            {lowStockSupplies.map(s => {
              const ratio = s.current / s.min;
              const barColor = ratio <= 0.34 ? 'bg-red-500' : ratio <= 0.67 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div key={s.id} className="rounded-xl border p-3 bg-card/50">
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold">{s.name}</p>
                    <FacilityBadge value={s.status} label={s.status === 'LOW' ? 'Sắp hết' : 'Cần bổ sung'} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Tồn: <b className="text-foreground">{s.current}</b> / tối thiểu {s.min} {s.unit}</p>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div></CardContent></Card>
          <Card className="shadow-sm"><CardHeader><CardTitle>Biểu đồ vận hành</CardTitle><CardDescription>Không cài thêm thư viện — dùng progress trực quan nhẹ</CardDescription></CardHeader><CardContent className="space-y-4">{[['Đang sử dụng', 80, 'bg-emerald-500'], ['Cần bảo trì', 12, 'bg-orange-500'], ['Đang sửa chữa', 8, 'bg-amber-500'], ['Hỏng/mất', 3, 'bg-red-500'], ['Sẵn sàng', 25, 'bg-blue-500']].map(([label, value, color]: any) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><b>{value}</b></div><div className="h-2 rounded-full bg-muted"><div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} /></div></div>)}</CardContent></Card>
        </div>
      </TabsContent>

      <TabsContent value="locations" activeValue={activeTab} className="m-0"><DataTable title="Phòng & Khu vực" desc="Quản lý phòng học, phòng chức năng và khu vực chung" rows={locations} columns={['code','name','type','building','floor','status']} labels={['Mã','Tên phòng','Loại','Tòa','Tầng','Trạng thái']} statusMap={FACILITY_LOCATION_STATUS} onAdd={(item: any) => setLocations([item, ...locations])} /></TabsContent>
      <TabsContent value="assets" activeValue={activeTab} className="m-0"><DataTable title="Thiết bị & Tài sản" desc="Danh mục tài sản, trạng thái và vị trí sử dụng" rows={assets} columns={['code','name','category','locationName','responsibleUserName','status']} labels={['Mã TB','Tên thiết bị','Danh mục','Vị trí','Phụ trách','Trạng thái']} statusMap={FACILITY_ASSET_STATUS} onAdd={(item: any) => setAssets([item, ...assets])} /></TabsContent>
      <TabsContent value="repairs" activeValue={activeTab} className="m-0"><DataTable title="Yêu cầu sửa chữa" desc="Theo dõi SLA và xử lý báo hỏng" rows={repairRequests.map(r => ({...r, sla: getSlaStatus(r)}))} columns={['title','locationName','priority','status','assignedToName','dueDate','sla']} labels={['Sự cố','Vị trí','Ưu tiên','Trạng thái','Người xử lý','Hạn xử lý','SLA']} statusMap={{...REPAIR_STATUS, ...REPAIR_PRIORITY}} onAdd={(item: any) => setRepairRequests([item, ...repairRequests])} /></TabsContent>
      <TabsContent value="maintenance" activeValue={activeTab} className="m-0"><DataTable title="Bảo trì" desc="Lịch bảo trì định kỳ và kiểm tra thiết bị" rows={maintenanceLogs} columns={['assetName','note','scheduledDate','responsibleUserName','status']} labels={['Thiết bị','Loại bảo trì','Ngày dự kiến','Phụ trách','Trạng thái']} statusMap={MAINTENANCE_STATUS} onAdd={(item: any) => setMaintenanceLogs([item, ...maintenanceLogs])} /></TabsContent>
      <TabsContent value="purchases" activeValue={activeTab} className="m-0"><DataTable title="Đề xuất mua sắm" desc="Quản lý đề xuất mua mới, thay thế, bổ sung vật tư" rows={purchaseRequestsList} columns={['title','requestedByName','department','itemCount','priority','status','neededByDate']} labels={['Đề xuất','Người đề xuất','Khu vực','SL mặt hàng','Ưu tiên','Trạng thái','Hạn cần có']} statusMap={REPAIR_PRIORITY} onAdd={(item: any) => setPurchaseRequestsList([item, ...purchaseRequestsList])} /></TabsContent>
      <TabsContent value="supplies" activeValue={activeTab} className="m-0"><SuppliesTab /></TabsContent>
      <TabsContent value="handover" activeValue={activeTab} className="m-0"><BookingsTab /></TabsContent>
      <TabsContent value="inventory" activeValue={activeTab} className="m-0"><Placeholder title="Kiểm kê" desc="Tạo đợt kiểm kê, đối chiếu vị trí/tình trạng, ghi nhận thiếu-hỏng-thừa." /></TabsContent>
      <TabsContent value="reports" activeValue={activeTab} className="m-0"><Placeholder title="Báo cáo" desc="Tổng hợp tài sản, sửa chữa, bảo trì, vật tư và đề xuất mua sắm." /></TabsContent>
    </Tabs>
  </div>;
}

function DataTable({ title, desc, rows, columns, labels, statusMap, onAdd }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const inputColumns = columns.filter((col: string) => !['status', 'sla', 'itemCount'].includes(col));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newItem: Record<string, any> = {
      id: `ID-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString()
    };

    columns.forEach((col: string) => {
      if (col === 'status') {
        newItem[col] = 'ACTIVE';
      } else if (col === 'sla') {
        newItem[col] = 'Trong hạn';
      } else if (col === 'itemCount') {
        newItem[col] = 1;
      } else {
        newItem[col] = formData[col] || '—';
      }
    });

    if (onAdd) {
      onAdd(newItem);
    }
    setFormData({});
    setIsAdding(false);
    alert(`Đã thêm mới bản ghi vào "${title}" thành công!`);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </div>
        {onAdd && (
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'default'}>
            {isAdding ? 'Hủy' : <><Plus className="mr-2 h-4 w-4" />Thêm mới</>}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
            {inputColumns.map((col: string) => {
              const labelIdx = columns.indexOf(col);
              const label = labels[labelIdx] || col;
              return (
                <div key={col} className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
                  <Input
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    value={formData[col] || ''}
                    onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                    required
                  />
                </div>
              );
            })}
            <Button type="submit" className="w-full">Xác nhận thêm</Button>
          </form>
        )}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                {labels.map((l: string) => <th key={l} className="p-3 text-left font-medium">{l}</th>)}
                <th className="p-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, idx: number) => (
                <tr key={row.id || idx} className="border-t hover:bg-muted/30">
                  {columns.map((c: string) => {
                    const v = row[c];
                    const isBadge = ['status','priority','sla'].includes(c);
                    return (
                      <td key={c} className="p-3">
                        {isBadge ? (
                          <FacilityBadge value={slaTone(String(v)) === 'OVERDUE' || slaTone(String(v)) === 'DUE_SOON' ? slaTone(String(v)) : String(v)} label={statusMap?.[v] || String(v || '—')} />
                        ) : c.toLowerCase().includes('date') ? (
                          fmtDate(v)
                        ) : (
                          v || '—'
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => alert(`Đang tải chi tiết cho: ${row.name || row.title || row.assetName || row.code}`)}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return <Card className="shadow-sm"><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader><CardContent><div className="rounded-xl border bg-muted/20 p-6 text-sm text-muted-foreground">Đã tạo khung nghiệp vụ, sẵn sàng nối dữ liệu/chi tiết theo kiến trúc hiện có.</div></CardContent></Card>;
}
