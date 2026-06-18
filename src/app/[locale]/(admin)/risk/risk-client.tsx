'use client';

import { Dialog } from '@/src/components/ui/dialog';

import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Eye,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  SettingsIcon,
  Users,
  Scale,
  Megaphone,
  Lock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  X,
  Sliders,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

// Matrix colors lookup
const cellClasses: Record<string, string> = {
  '5,1': 'bg-emerald-200/50 text-emerald-600',
  '5,2': 'bg-emerald-200/50 text-emerald-600',
  '5,3': 'bg-yellow-300 text-yellow-600',
  '5,4': 'bg-orange-400 text-orange-600',
  '5,5': 'bg-red-500 text-red-600',
  '4,1': 'bg-emerald-300 text-emerald-600',
  '4,2': 'bg-emerald-300 text-emerald-600',
  '4,3': 'bg-yellow-300 text-yellow-600',
  '4,4': 'bg-orange-400 text-orange-600',
  '4,5': 'bg-orange-400 text-orange-600',
  '3,1': 'bg-emerald-400 text-emerald-600',
  '3,2': 'bg-emerald-300 text-emerald-600',
  '3,3': 'bg-yellow-300 text-yellow-600',
  '3,4': 'bg-yellow-300 text-yellow-600',
  '3,5': 'bg-orange-400 text-orange-600',
  '2,1': 'bg-emerald-400 text-emerald-600',
  '2,2': 'bg-emerald-400 text-emerald-600',
  '2,3': 'bg-emerald-300 text-emerald-600',
  '2,4': 'bg-yellow-300 text-yellow-600',
  '2,5': 'bg-yellow-300 text-yellow-600',
  '1,1': 'bg-emerald-500 text-emerald-600',
  '1,2': 'bg-emerald-400 text-emerald-600',
  '1,3': 'bg-emerald-400 text-emerald-600',
  '1,4': 'bg-emerald-300 text-emerald-600',
  '1,5': 'bg-emerald-300 text-emerald-600'
};

const categoryIcons: Record<string, any> = {
  'Tài chính': DollarSign,
  'Hoạt động': SettingsIcon,
  'Nhân sự': Users,
  'Tuân thủ': Scale,
  'Danh tiếng': Megaphone,
  'An toàn dữ liệu': Lock,
  'Cơ sở vật chất': SettingsIcon,
  'An toàn học đường': ShieldAlert
};

export default function RiskDashboard({ initialData }: { initialData?: any }) {
  const risks = initialData?.risks || [];
  const stats = initialData?.stats || {
    criticalCount: 7,
    monitoringCount: 18,
    resolvedCount: 12,
    complianceRate: '86%'
  };
  const matrixCounts = initialData?.matrixCounts || {};
  const distributions = initialData?.distributions || {
    veryHigh: 4,
    high: 5,
    medium: 7,
    low: 5,
    veryLow: 2,
    total: 23
  };
  const highlights = initialData?.highlights || [];
  const mitigations = initialData?.mitigations || [];
  const incidents = initialData?.incidents || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Risk details state (Drawer)
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  // Customize & Popup States
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [targetCompliance, setTargetCompliance] = useState(86);
  const [maxRiskTolerance, setMaxRiskTolerance] = useState(15);
  const [isAllOutstandingOpen, setIsAllOutstandingOpen] = useState(false);
  const [isAllMitigationsOpen, setIsAllMitigationsOpen] = useState(false);

  // Extract unique categories dynamically
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    risks.forEach((r: any) => {
      if (r.cat) cats.add(r.cat);
    });
    return Array.from(cats);
  }, [risks]);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r: any) => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || r.cat === selectedCategory;
      const matchesLevel = selectedLevel === 'ALL' || r.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [risks, searchQuery, selectedCategory, selectedLevel]);

  // Pagination
  const totalPages = Math.ceil(filteredRisks.length / itemsPerPage) || 1;
  const paginatedRisks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRisks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRisks, currentPage]);

  const selectedRisk = useMemo(() => {
    if (!selectedRiskId) return null;
    return risks.find((r: any) => r.id === selectedRiskId) || null;
  }, [risks, selectedRiskId]);

  const computedCriticalCount = useMemo(() => {
    return risks.filter((r: any) => r.score >= maxRiskTolerance).length;
  }, [risks, maxRiskTolerance]);

  const computedHighlights = useMemo(() => {
    return risks.filter((r: any) => r.score >= maxRiskTolerance);
  }, [risks, maxRiskTolerance]);

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản trị rủi ro
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nhận diện, đánh giá và kiểm soát rủi ro để đảm bảo mục tiêu chiến lược và tuân thủ quy định.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Năm học 2025-2026</option>
          </select>
          <Button onClick={() => setIsCustomizeOpen(true)} variant="outline" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-100 shadow-sm dark:border-red-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rủi ro nghiêm trọng</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{computedCriticalCount}</h3>
                  <span className="text-[10px] font-medium text-red-500">Cần xử lý gấp</span>
                </div>
              </div>
            </div>
            <Badge className="bg-red-50 text-red-600 border-red-200">High Score</Badge>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm dark:border-orange-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Đang theo dõi</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.monitoringCount}</h3>
                  <span className="text-[10px] font-medium text-orange-500">Chưa đóng</span>
                </div>
              </div>
            </div>
            <Badge className="bg-orange-50 text-orange-600 border-orange-200">Active</Badge>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Đã xử lý</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.resolvedCount}</h3>
                  <span className="text-[10px] font-medium text-emerald-500">Đã khắc phục</span>
                </div>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Resolved</Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm dark:border-blue-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Mức độ tuân thủ</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{targetCompliance}%</h3>
                  <span className="text-[10px] font-medium text-emerald-500">Đạt chỉ tiêu</span>
                </div>
              </div>
            </div>
            <Badge className="bg-blue-50 text-blue-600 border-blue-200">Compliance</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Heatmap */}
          <Card>
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">Ma trận rủi ro <AlertCircle className="h-4 w-4 text-slate-400" /></CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 relative flex">
                  {/* Y Axis Label */}
                  <div className="w-8 flex flex-col justify-center items-center">
                    <span className="transform -rotate-90 text-xs font-bold text-slate-500 whitespace-nowrap -translate-x-4">Mức độ ảnh hưởng</span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="grid grid-cols-6 gap-1 h-[250px]">
                      {/* Grid Labels Left */}
                      <div className="col-span-1 flex flex-col justify-between py-2 text-right pr-2 text-xs font-medium text-slate-500">
                        <div>Rất cao <span className="text-[10px] ml-1">5</span></div>
                        <div>Cao <span className="text-[10px] ml-1">4</span></div>
                        <div>Trung bình <span className="text-[10px] ml-1">3</span></div>
                        <div>Thấp <span className="text-[10px] ml-1">2</span></div>
                        <div>Rất thấp <span className="text-[10px] ml-1">1</span></div>
                      </div>
                      
                      {/* Grid Matrix (5x5) */}
                      <div className="col-span-5 grid grid-cols-5 grid-rows-5 gap-1">
                        {/* imp from 5 down to 1 */}
                        {[5, 4, 3, 2, 1].map((imp) => {
                          // lik from 1 to 5
                          return [1, 2, 3, 4, 5].map((lik) => {
                            const count = matrixCounts[`${imp},${lik}`] || 0;
                            const cls = cellClasses[`${imp},${lik}`] || 'bg-slate-100';
                            const bgClass = cls.split(' ')[0];
                            const textClass = cls.split(' ')[1] || 'text-slate-600';
                            return (
                              <div 
                                key={`${imp}-${lik}`} 
                                className={cn(bgClass, "rounded-sm flex items-center justify-center border border-white/20 hover:scale-105 transition-transform duration-100")}
                                title={`Ảnh hưởng: ${imp}, Khả năng: ${lik}. Số rủi ro: ${count}`}
                              >
                                {count > 0 && (
                                  <div className={cn("w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-sm", textClass)}>
                                    {count}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })}
                      </div>
                    </div>
                    
                    {/* X Axis Label */}
                    <div className="grid grid-cols-6 gap-1 mt-2 text-center text-xs font-medium text-slate-500">
                      <div className="col-span-1"></div>
                      <div className="col-span-1">Rất thấp<br/><span className="text-[10px]">1</span></div>
                      <div className="col-span-1">Thấp<br/><span className="text-[10px]">2</span></div>
                      <div className="col-span-1">Trung bình<br/><span className="text-[10px]">3</span></div>
                      <div className="col-span-1">Cao<br/><span className="text-[10px]">4</span></div>
                      <div className="col-span-1">Rất cao<br/><span className="text-[10px]">5</span></div>
                    </div>
                    <div className="text-center text-xs font-bold text-slate-500 mt-2 pl-[16.66%]">
                      Khả năng xảy ra
                    </div>
                  </div>
                </div>

                {/* Risk Distribution Summary */}
                <div className="w-full md:w-64 shrink-0 flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> <span className="font-medium text-slate-700 dark:text-slate-350">Rủi ro rất cao</span></div>
                    <span className="font-bold">{distributions.veryHigh}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400" /> <span className="font-medium text-slate-700 dark:text-slate-350">Rủi ro cao</span></div>
                    <span className="font-bold">{distributions.high}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400" /> <span className="font-medium text-slate-700 dark:text-slate-350">Rủi ro trung bình</span></div>
                    <span className="font-bold">{distributions.medium}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-300" /> <span className="font-medium text-slate-700 dark:text-slate-350">Rủi ro thấp</span></div>
                    <span className="font-bold">{distributions.low}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="font-medium text-slate-700 dark:text-slate-350">Rủi ro rất thấp</span></div>
                    <span className="font-bold">{distributions.veryLow}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Tổng số rủi ro</span>
                    <span className="font-black text-lg">{distributions.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Priority List */}
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">Danh mục rủi ro ưu tiên <AlertCircle className="h-4 w-4 text-slate-400" /></CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-8 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900 px-2 text-xs bg-transparent"
                  >
                    <option value="ALL">Tất cả danh mục</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="h-8 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900 px-2 text-xs bg-transparent"
                  >
                    <option value="ALL">Tất cả mức độ</option>
                    <option value="Rất cao">Rất cao</option>
                    <option value="Cao">Cao</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Thấp">Thấp</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm rủi ro..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-48 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900 pl-8 pr-3 text-xs bg-transparent" 
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-4 py-3 font-bold">Rủi ro</th>
                    <th className="px-4 py-3 font-bold">Danh mục</th>
                    <th className="px-4 py-3 font-bold text-center">Mức độ</th>
                    <th className="px-4 py-3 font-bold text-center">Khả năng xảy ra</th>
                    <th className="px-4 py-3 font-bold">Chủ sở hữu</th>
                    <th className="px-4 py-3 font-bold">Kế hoạch giảm thiểu</th>
                    <th className="px-4 py-3 font-bold">Hạn xử lý</th>
                    <th className="px-4 py-3 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedRisks.map((row: any, i: number) => {
                    const CatIcon = categoryIcons[row.cat] || FileText;
                    return (
                      <tr 
                        key={row.id} 
                        onClick={() => setSelectedRiskId(row.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                      >
                        <td className="px-4 py-3 text-[11px] text-slate-500 font-medium">{row.id}</td>
                        <td className="px-4 py-3 text-[13px] font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title={row.title}>{row.title}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", row.catCol)}>
                              <CatIcon className="h-3 w-3" />
                            </div>
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{row.cat}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center"><Badge className={cn("text-[10px] py-0 border-0", row.levelCol)}>{row.level}</Badge></td>
                        <td className="px-4 py-3 text-center"><Badge className={cn("text-[10px] py-0 border-0", row.probCol)}>{row.prob}</Badge></td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{row.owner}</p>
                          <p className="text-[10px] text-slate-500">{row.ownerRole}</p>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={row.plan}>{row.plan}</td>
                        <td className="px-4 py-3 text-[11px] text-slate-900 dark:text-slate-100">{row.date}</td>
                        <td className="px-4 py-3"><Badge className={cn("text-[10px] py-0 border-0", row.statCol)}>{row.status}</Badge></td>
                      </tr>
                    );
                  })}
                  {filteredRisks.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        Không tìm thấy rủi ro nào khớp với bộ lọc
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 pl-1">
                  Hiển thị {filteredRisks.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredRisks.length)} / {filteredRisks.length} rủi ro
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <Button 
                        key={page}
                        variant={currentPage === page ? "outline" : "ghost"}
                        onClick={() => setCurrentPage(page)}
                        className={cn("h-7 w-7 p-0", currentPage === page ? "bg-blue-600 text-white border-blue-600" : "text-slate-600")}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Rủi ro nổi bật</CardTitle>
              <Button onClick={() => setIsAllOutstandingOpen(true)} variant="ghost" className="text-xs font-medium text-blue-600 hover:text-blue-700 p-0 h-auto">Xem tất cả</Button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {computedHighlights.slice(0, 3).map((row: any) => {
                const CatIcon = categoryIcons[row.cat] || FileText;
                return (
                  <div 
                    key={row.id} 
                    onClick={() => setSelectedRiskId(row.id)}
                    className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5", row.catCol)}>
                      <CatIcon className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{row.title}</h4>
                      <p className="text-[10px] text-slate-500 mb-2">{row.cat}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="text-[10px] py-0 border-0 bg-red-50 text-red-600">{row.level}</Badge>
                        <span className="text-[10px] text-slate-400">Hạn xử lý: {row.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {computedHighlights.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Không có rủi ro nổi bật nào
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Biện pháp giảm thiểu</CardTitle>
              <Button onClick={() => setIsAllMitigationsOpen(true)} variant="ghost" className="text-xs font-medium text-blue-600 hover:text-blue-700 p-0 h-auto">Xem tất cả</Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {mitigations.map((item: any, i: number) => {
                const Icon = categoryIcons[item.cat] || FileText;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate mb-1">{item.title}</p>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.prog}%` }} />
                      </div>
                    </div>
                    <div className="text-[10px] font-bold w-6 text-right">{item.prog}%</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold">Sự cố gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                {incidents.map((act: any, i: number) => (
                  <div key={i} className="relative pl-6">
                    <div className={cn("absolute left-0 top-1 h-2.5 w-2.5 rounded-full border-[2px] border-white dark:border-slate-950 z-10", act.dot)} />
                    {i !== incidents.length - 1 && <div className="absolute left-1 top-3 h-full w-[1px] bg-slate-200 dark:bg-slate-800" />}
                    
                    <div className="text-[10px] text-slate-400 mb-1 font-medium">{act.time}</div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1">{act.text}</div>
                        <div className="text-[11px] text-slate-500">{act.desc}</div>
                      </div>
                      <Badge className={cn("border-0 shrink-0 text-[10px] px-1.5 py-0.5", act.statusColor)}>{act.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Slide-over Risk Detail Modal/Drawer */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Chi tiết rủi ro {selectedRisk.id}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedRiskId(null)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">{selectedRisk.title}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("text-[10px] py-0 border-0", selectedRisk.catCol)}>{selectedRisk.cat}</Badge>
                    <Badge className={cn("text-[10px] py-0 border-0", selectedRisk.levelCol)}>Ảnh hưởng: {selectedRisk.impact}</Badge>
                    <Badge className={cn("text-[10px] py-0 border-0", selectedRisk.probCol)}>Khả năng: {selectedRisk.likelihood}</Badge>
                    <Badge className="bg-slate-100 text-slate-800 border-0 text-[10px] py-0">Score: {selectedRisk.score}</Badge>
                  </div>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">Chủ sở hữu</span>
                    <span className="col-span-2 font-bold text-slate-900 dark:text-slate-100 text-right">
                      {selectedRisk.owner} <span className="text-xs text-slate-400 font-normal">({selectedRisk.ownerRole})</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">Hạn xử lý</span>
                    <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100 text-right">{selectedRisk.date}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">Trạng thái</span>
                    <span className="col-span-2 text-right">
                      <Badge className={cn("text-[10px] py-0 border-0", selectedRisk.statCol)}>{selectedRisk.status}</Badge>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kế hoạch giảm thiểu tác động</h5>
                  <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 font-medium">
                    {selectedRisk.plan}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch sử sự cố liên quan</h5>
                  <div className="space-y-2">
                    <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-xs flex justify-between items-center bg-slate-50/20">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Rà soát định kỳ hàng tuần</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Cập nhật 1 tuần trước bởi {selectedRisk.owner}</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[9px] py-0">Đã rà soát</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedRiskId(null)}
                className="flex-1"
              >
                Đóng
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  alert(`Đã gửi yêu cầu cập nhật tiến độ rủi ro ${selectedRisk.id} đến ${selectedRisk.owner}`);
                  setSelectedRiskId(null);
                }}
              >
                Cập nhật tiến độ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Dialog */}
      <Dialog 
        open={isCustomizeOpen} 
        onOpenChange={setIsCustomizeOpen} 
        title="Tùy chỉnh thông số rủi ro"
        description="Điều chỉnh ngưỡng cảnh báo rủi ro nghiêm trọng và chỉ tiêu tỷ lệ tuân thủ hệ thống."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-700 dark:text-slate-300">Chỉ tiêu mức độ tuân thủ (%)</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{targetCompliance}%</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="100" 
              value={targetCompliance} 
              onChange={(e) => setTargetCompliance(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[11px] text-slate-400">Tỷ lệ tuân thủ tối thiểu được chấp nhận cho toàn trường.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-700 dark:text-slate-300">Ngưỡng rủi ro nghiêm trọng (Score)</span>
              <span className="text-red-600 dark:text-red-400 font-bold">&gt;= {maxRiskTolerance}</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="25" 
              value={maxRiskTolerance} 
              onChange={(e) => setMaxRiskTolerance(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <p className="text-[11px] text-slate-400">Các rủi ro có điểm (Khả năng x Ảnh hưởng) lớn hơn hoặc bằng ngưỡng này sẽ được coi là nghiêm trọng.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300">Tổng quan sau thay đổi:</p>
              <p className="text-slate-500 mt-0.5">Số rủi ro nghiêm trọng: <span className="font-bold text-red-600">{computedCriticalCount} rủi ro</span></p>
            </div>
            <Badge className={computedCriticalCount > 5 ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}>
              {computedCriticalCount > 5 ? "Rủi ro cao" : "An toàn"}
            </Badge>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsCustomizeOpen(false)}>Hủy</Button>
            <Button onClick={() => setIsCustomizeOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cấu hình</Button>
          </div>
        </div>
      </Dialog>

      {/* Outstanding Risks Dialog */}
      <Dialog
        open={isAllOutstandingOpen}
        onOpenChange={setIsAllOutstandingOpen}
        title="Danh sách rủi ro nghiêm trọng"
        description={`Hiển thị tất cả các rủi ro có điểm đánh giá vượt ngưỡng chịu đựng tối đa (Score >= ${maxRiskTolerance}).`}
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 uppercase border-b border-slate-100 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-bold">Mã</th>
                  <th className="px-4 py-3 font-bold">Tên rủi ro</th>
                  <th className="px-4 py-3 font-bold">Danh mục</th>
                  <th className="px-4 py-3 font-bold text-center">Score</th>
                  <th className="px-4 py-3 font-bold">Hạn xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {computedHighlights.map((row: any) => {
                  return (
                    <tr 
                      key={row.id} 
                      onClick={() => {
                        setSelectedRiskId(row.id);
                        setIsAllOutstandingOpen(false);
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <td className="px-4 py-3 text-[11px] font-medium text-slate-500">{row.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white truncate max-w-[250px]">{row.title}</td>
                      <td className="px-4 py-3 text-xs">{row.cat}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-red-50 text-red-600 border-0 font-bold">{row.score}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{row.date}</td>
                    </tr>
                  );
                })}
                {computedHighlights.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      Không có rủi ro nào vượt ngưỡng chịu đựng hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
            <Button onClick={() => setIsAllOutstandingOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Dialog>

      {/* Mitigations Dialog */}
      <Dialog
        open={isAllMitigationsOpen}
        onOpenChange={setIsAllMitigationsOpen}
        title="Biện pháp giảm thiểu rủi ro"
        description="Tổng quan tiến độ thực hiện các biện pháp kiểm soát và giảm thiểu tác động của rủi ro."
      >
        <div className="space-y-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {mitigations.map((item: any, i: number) => {
              const Icon = categoryIcons[item.cat] || FileText;
              return (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{item.cat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.prog}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right text-slate-700 dark:text-slate-350">{item.prog}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
            <Button onClick={() => setIsAllMitigationsOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
