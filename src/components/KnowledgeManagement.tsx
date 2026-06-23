'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Filter, Plus, BookOpen, 
  Settings, CheckCircle2, Clock, AlertTriangle, 
  MoreVertical, BookMarked, Tags, Layers,
  ChevronRight, Building2, UserCircle, Calendar, Link as LinkIcon
} from 'lucide-react';
import { DocumentItem } from '../types';
import CreateDocumentForm from './CreateDocumentForm';

// MOCK DATA for 3 Document Packages
const mockDocuments: DocumentItem[] = [
  // Package 1: HR & Admin
  {
    id: 'doc-1', docCode: 'HR-SOP-01', title: 'Quy trình xin nghỉ phép và phê duyệt',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '2.1', status: 'ACTIVE',
    effectiveDate: '2024-01-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['nghỉ phép', 'HR', 'SOP'],
    relatedModules: ['WORKFLOW_APPROVALS', 'HRM'], createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z', createdBy: 'admin', timeline: [],
    purpose: 'Chuẩn hóa quy trình xin nghỉ phép, đảm bảo quyền lợi và tiến độ công việc.',
  },
  {
    id: 'doc-2', docCode: 'HR-FORM-01', title: 'Mẫu đơn xin nghỉ phép',
    docType: 'FORM', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '2.0', status: 'ACTIVE',
    effectiveDate: '2024-01-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['nghỉ phép', 'biểu mẫu'],
    relatedModules: ['WORKFLOW_APPROVALS'], createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-3', docCode: 'HR-SOP-02', title: 'Quy trình bàn giao và nghỉ việc',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '1.5', status: 'NEEDS_REVIEW',
    effectiveDate: '2023-06-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['nghỉ việc', 'bàn giao'],
    relatedModules: ['HRM', 'LOGISTICS'], createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-4', docCode: 'HR-FORM-02', title: 'Biên bản bàn giao công việc',
    docType: 'FORM', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '1.2', status: 'ACTIVE',
    effectiveDate: '2023-06-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['nghỉ việc', 'biểu mẫu'],
    relatedModules: ['HRM'], createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-5', docCode: 'HR-SOP-03', title: 'Quy trình đào tạo hội nhập',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng Đào tạo',
    ownerId: 'Trần Văn B', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2024-03-15', priority: 'Bình thường',
    targetAudience: ['HCNS', 'Giáo viên', 'Nhân viên'], tags: ['đào tạo', 'hội nhập'],
    relatedModules: ['HRM'], createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z', createdBy: 'admin', timeline: [],
  },

  // Package 2: Internal Control
  {
    id: 'doc-6', docCode: 'IC-SOP-01', title: 'Quy trình kiểm soát nội bộ định kỳ',
    docType: 'SOP', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '3.0', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'HCNS'], tags: ['kiểm soát', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-7', docCode: 'IC-FORM-01', title: 'Phiếu ghi nhận điểm không phù hợp (NC)',
    docType: 'FORM', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '1.1', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['NC', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-8', docCode: 'IC-FORM-02', title: 'Phiếu yêu cầu hành động khắc phục (CAPA)',
    docType: 'FORM', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS'], tags: ['CAPA', 'khắc phục'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-9', docCode: 'IC-CHK-01', title: 'Checklist đánh giá nội bộ',
    docType: 'CHECKLIST', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '2.0', status: 'DRAFT',
    effectiveDate: '', priority: 'Bình thường',
    targetAudience: ['BGH', 'HCNS'], tags: ['checklist', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2024-05-10T00:00:00Z', createdBy: 'admin', timeline: [],
  },

  // Package 3: Operations & Facilities
  {
    id: 'doc-10', docCode: 'FM-SOP-01', title: 'Quy trình quản lý và bảo trì tài sản',
    docType: 'SOP', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Nhân viên'], tags: ['tài sản', 'bảo trì'],
    relatedModules: ['LOGISTICS'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-11', docCode: 'FM-FORM-01', title: 'Phiếu yêu cầu sửa chữa thiết bị',
    docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['sửa chữa', 'thiết bị'],
    relatedModules: ['LOGISTICS', 'WORKFLOW_APPROVALS'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-12', docCode: 'FM-FORM-02', title: 'Biên bản bàn giao tài sản',
    docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.2', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Bình thường',
    targetAudience: ['HCNS', 'Giáo viên', 'Nhân viên'], tags: ['tài sản', 'bàn giao'],
    relatedModules: ['LOGISTICS', 'HRM'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },

  // Event & Parent Services
  {
    id: 'doc-13', docCode: 'EV-SOP-01', title: 'Quy trình tiếp nhận và xử lý phản ánh',
    docType: 'SOP', category: 'CSKH Phụ huynh', departmentOwner: 'Phòng Dịch vụ Học đường',
    ownerId: 'Hoàng Thị E', version: '1.1', status: 'ACTIVE',
    effectiveDate: '2024-01-15', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['phản ánh', 'CSKH', 'ticket'],
    relatedModules: ['EVENTS', 'RISK_CENTER'], createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-14', docCode: 'EV-SOP-02', title: 'Quy trình xử lý khủng hoảng truyền thông',
    docType: 'SOP', category: 'Truyền thông/Sự kiện', departmentOwner: 'Phòng Truyền thông',
    ownerId: 'Đinh Văn F', version: '2.0', status: 'PENDING_APPROVAL',
    effectiveDate: '', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'Truyền thông'], tags: ['khủng hoảng', 'truyền thông'],
    relatedModules: ['EVENTS', 'RISK_CENTER', 'BOARD_DIRECTIVES'], createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-15', docCode: 'EV-FORM-01', title: 'Mẫu Kế hoạch tổ chức sự kiện',
    docType: 'FORM', category: 'Truyền thông/Sự kiện', departmentOwner: 'Phòng Truyền thông',
    ownerId: 'Đinh Văn F', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-10-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['sự kiện', 'kế hoạch'],
    relatedModules: ['EVENTS', 'WORKFLOW_APPROVALS'], createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2023-10-01T00:00:00Z', createdBy: 'admin', timeline: [],
  }
];

export default function KnowledgeManagement() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ALL' | 'SOP' | 'FORM' | 'REVIEW' | 'ARCHIVED'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: documents.length,
      sop: documents.filter(d => d.docType === 'SOP').length,
      form: documents.filter(d => d.docType === 'FORM' || d.docType === 'CHECKLIST').length,
      active: documents.filter(d => d.status === 'ACTIVE').length,
      needsReview: documents.filter(d => d.status === 'NEEDS_REVIEW').length,
      draft: documents.filter(d => d.status === 'DRAFT' || d.status === 'PENDING_APPROVAL').length,
    };
  }, [documents]);

  // Filtered Data
  const filteredDocs = useMemo(() => {
    let result = documents;
    
    // Tab Filter
    if (activeTab === 'SOP') result = result.filter(d => d.docType === 'SOP');
    if (activeTab === 'FORM') result = result.filter(d => d.docType === 'FORM' || d.docType === 'CHECKLIST');
    if (activeTab === 'REVIEW') result = result.filter(d => d.status === 'NEEDS_REVIEW');
    if (activeTab === 'ARCHIVED') result = result.filter(d => d.status === 'ARCHIVED' || d.status === 'EXPIRED');

    // Category Filter
    if (filterCategory !== 'ALL') {
      result = result.filter(d => d.category === filterCategory);
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.docCode.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [documents, activeTab, filterCategory, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-md">HIỆU LỰC</span>;
      case 'DRAFT': return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md">NHÁP</span>;
      case 'PENDING_APPROVAL': return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 rounded-md">CHỜ DUYỆT</span>;
      case 'NEEDS_REVIEW': return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 rounded-md">CẦN RÀ SOÁT</span>;
      case 'EXPIRED': return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500 rounded-md">HẾT HẠN</span>;
      case 'ARCHIVED': return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500 rounded-md">LƯU TRỮ</span>;
      default: return null;
    }
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case 'SOP': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'FORM': return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'CHECKLIST': return <CheckCircle2 className="w-4 h-4 text-sky-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const categories = Array.from(new Set(documents.map(d => d.category)));

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 w-full overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Kho Quy trình & Tri thức
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quản lý tập trung Văn bản, Biểu mẫu, SOP và Tài liệu tham khảo</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu, mã..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo tài liệu</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="shrink-0 px-6 pt-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-6 min-w-max">
          {[
            { id: 'OVERVIEW', label: 'Tổng quan', icon: Layers },
            { id: 'ALL', label: 'Tất cả tài liệu', icon: BookMarked },
            { id: 'SOP', label: 'Quy trình / SOP', icon: BookOpen },
            { id: 'FORM', label: 'Biểu mẫu & Checklist', icon: FileText },
            { id: 'REVIEW', label: 'Cần rà soát', icon: AlertTriangle },
            { id: 'ARCHIVED', label: 'Lưu trữ', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'REVIEW' && stats.needsReview > 0 && (
                <span className="ml-1 bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.needsReview}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-lg">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Tổng tài liệu</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md font-medium">+2 tháng này</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Quy trình (SOP)</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.sop}</span>
                  <span className="text-xs text-slate-500 font-medium">Đang hiệu lực</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Biểu mẫu</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.form}</span>
                  <span className="text-xs text-slate-500 font-medium">Form & Checklist</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Cần rà soát</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.needsReview}</span>
                  <button onClick={() => setActiveTab('REVIEW')} className="text-xs text-rose-600 hover:text-rose-700 font-medium underline">Xem danh sách</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Mới cập nhật gần đây</h3>
                <div className="space-y-3">
                  {documents.slice(0, 5).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getDocTypeIcon(doc.docType)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{doc.docCode}</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doc.title}</span>
                            {getStatusBadge(doc.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {doc.category}</span>
                            <span className="flex items-center gap-1"><UserCircle className="w-3 h-3" /> {doc.ownerId}</span>
                            <span>v{doc.version}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Theo Nhóm nghiệp vụ</h3>
                <div className="space-y-4">
                  {categories.map(cat => {
                    const count = documents.filter(d => d.category === cat).length;
                    const percent = Math.round((count / stats.total) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                          <span className="text-slate-500">{count} tài liệu</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST TABS (ALL, SOP, FORM, REVIEW, ARCHIVED) */}
        {activeTab !== 'OVERVIEW' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-7xl mx-auto flex flex-col min-h-[500px]">
            {/* List Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Nhóm:</span>
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">Tất cả</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="text-sm text-slate-500 ml-auto">
                Hiển thị {filteredDocs.length} tài liệu
              </div>
            </div>

            {/* List Data */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Mã TL</th>
                    <th className="px-4 py-3">Tên tài liệu & Loại</th>
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3">Phiên bản</th>
                    <th className="px-4 py-3">Ngày ban hành</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                        {doc.docCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getDocTypeIcon(doc.docType)}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {doc.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">#{t}</span>
                          ))}
                          {doc.relatedModules.length > 0 && (
                            <span className="text-[10px] text-indigo-500 flex items-center gap-0.5" title={doc.relatedModules.join(', ')}>
                              <LinkIcon className="w-3 h-3" /> {doc.relatedModules.length} module
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700 dark:text-slate-300">{doc.departmentOwner}</div>
                        <div className="text-[10px] text-slate-500">{doc.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold font-mono">v{doc.version}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <p className="font-medium">Không tìm thấy tài liệu nào</p>
                        <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE DOCUMENT DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-200">
            <CreateDocumentForm 
              onClose={() => setIsDrawerOpen(false)}
              onSubmitSuccess={(data) => {
                const newDoc: DocumentItem = {
                  ...data,
                  id: `doc-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: 'current_user',
                  timeline: []
                } as DocumentItem;
                setDocuments([newDoc, ...documents]);
                setIsDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
