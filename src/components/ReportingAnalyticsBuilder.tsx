import React, { useState } from 'react';
import { Target, Sparkles, FileText, Download, Printer, Settings, Plus, Check } from 'lucide-react';

interface Widget {
  id: string;
  name: string;
  category: string;
  visible: boolean;
  content: string;
}

export default function ReportingAnalyticsBuilder() {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'wd_1', name: 'Biểu đồ Tuyển sinh & CRM', category: 'Tuyển sinh', visible: true, content: 'Báo cáo chỉ tiêu: 1,280 / 1,500 học sinh (85.3% hoàn thành)' },
    { id: 'wd_2', name: 'Tiến độ OKRs Ban giám hiệu', category: 'Chiến lược', visible: true, content: 'Objective 1: Đạt 78% | KR 1: 92% | KR 2: 97%' },
    { id: 'wd_3', name: 'Thống kê Chuyên cần học sinh', category: 'Học sinh', visible: true, content: 'Tỷ lệ chuyên cần trung bình toàn trường: 96%' },
    { id: 'wd_4', name: 'Danh sách Cảnh báo Rủi ro', category: 'Rủi ro', visible: false, content: '1 Dự án quá hạn | 2 Hồ sơ học vụ chờ duyệt tồn đọng trên 7 ngày' },
    { id: 'wd_5', name: 'Overload Cán bộ giáo viên', category: 'Nhân sự', visible: false, content: 'Cô Phạm Hồng Nhung: 24 tiết/tuần (Overload)' }
  ]);

  const [exportSuccess, setExportSuccess] = useState('');

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const triggerExport = (format: 'PDF' | 'EXCEL') => {
    if (format === 'PDF') {
      window.print();
    } else {
      setExportSuccess('🎉 Đang khởi tạo xuất Excel học vụ... Tệp tin "MIS_Smart_Report_2.0.xlsx" đã được chuẩn bị tải về trình duyệt.');
      setTimeout(() => setExportSuccess(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            Report Builder
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Thiết Lập Báo Cáo Điều Hành Tự Chọn</h2>
          <p className="text-xs text-slate-350 max-w-3xl font-light leading-relaxed">
            Tùy biến bảng thông tin (Dashboard Builder), kích hoạt các widget dữ liệu theo yêu cầu cá nhân và trích xuất báo cáo học vụ bản cứng.
          </p>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Widgets configuration toggler */}
        <div className="lg:col-span-4 bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
            Tùy chọn Widgets hiển thị
          </h3>

          <div className="space-y-3">
            {widgets.map(w => (
              <div
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  w.visible ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{w.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Chủ đề: {w.category}</span>
                </div>
                {w.visible ? (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">✓</span>
                ) : (
                  <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Interactive mock layout report */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
              Khung Báo Cáo Điều Hành Bản Xem Trước (Preview Canvas)
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerExport('EXCEL')}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>
              <button
                onClick={() => triggerExport('PDF')}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In ấn / PDF</span>
              </button>
            </div>
          </div>

          {exportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl font-semibold">
              {exportSuccess}
            </div>
          )}

          {/* Preview Canvas */}
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs space-y-5 print-full-width">
            <div className="text-center border-b border-slate-100 pb-4">
              <h2 className="text-base font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                Báo Cáo Điều Hành Tổng Hợp Học Đường
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">MIS Smart Portal 2.0 • Trường Liên cấp Đa Trí Tuệ</span>
            </div>

            {/* Render visible widgets */}
            <div className="space-y-4">
              {widgets.filter(w => w.visible).length === 0 ? (
                <p className="text-center text-xs text-slate-450 italic py-8">Vui lòng bật ít nhất một widget bên trái để hiển thị báo cáo.</p>
              ) : (
                widgets.filter(w => w.visible).map(w => (
                  <div key={w.id} className="p-4 bg-slate-50/50 border border-slate-150 rounded-xl text-xs space-y-2">
                    <span className="text-[9px] font-black uppercase text-indigo-650 font-mono tracking-wider">{w.name}</span>
                    <p className="font-semibold text-slate-800 leading-relaxed">
                      {w.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
