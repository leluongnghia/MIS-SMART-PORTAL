"use client";

import React, { useState } from "react";
import { Filter, Calendar as CalendarIcon, ChevronDown, Plus, ClipboardCheck, Users, ShieldAlert, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";

import { useToast } from "./Toast";
import { Dialog } from "./dialog";
import { CreateDirectiveForm } from "../admin/dashboard/quick-actions/CreateDirectiveForm";
import { DeclareRiskForm } from "../admin/dashboard/quick-actions/DeclareRiskForm";
import { ConveneMeetingForm } from "../admin/dashboard/quick-actions/ConveneMeetingForm";

interface DashboardControlsProps {
  onTimeFilterChange?: (filter: string) => void;
  quickActions?: "council" | "academic" | "okr";
}

export function DashboardControls({ onTimeFilterChange, quickActions = "council" }: DashboardControlsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState("Hôm nay");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Modal States
  const [isDirectiveOpen, setIsDirectiveOpen] = useState(false);
  const [isRiskOpen, setIsRiskOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Form states are now managed internally by their respective components


  const timeOptions = ["Hôm nay", "Tuần này", "Tháng này", "Học kỳ 2", "Năm học 2025-2026"];

  const handleTimeSelect = (option: string) => {
    setTimeFilter(option);
    setIsTimeDropdownOpen(false);
    if (onTimeFilterChange) {
      onTimeFilterChange(option);
    }
  };



  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        
        {/* Time Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Thời gian:</span>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {timeFilter}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            {isTimeDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                {timeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleTimeSelect(option)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${timeFilter === option ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quickActions === "council" && (
            <>
              <button onClick={() => setIsDirectiveOpen(true)} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                <ClipboardCheck className="w-3.5 h-3.5" /> Tạo chỉ đạo
              </button>
              <button onClick={() => setIsRiskOpen(true)} className="flex items-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50">
                <ShieldAlert className="w-3.5 h-3.5" /> Khai báo Rủi ro
              </button>
              <button onClick={() => setIsMeetingOpen(true)} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50">
                <Users className="w-3.5 h-3.5" /> Triệu tập Cuộc họp
              </button>
            </>
          )}

          {quickActions === "academic" && (
            <>
              <button onClick={() => toast({ variant: 'info', title: "Thông báo", message: "Chức năng Giao việc BGH đang được phát triển" })} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50">
                <ClipboardCheck className="w-3.5 h-3.5" /> Giao việc BGH
              </button>
              <button onClick={() => toast({ variant: 'info', title: "Thông báo", message: "Chức năng Duyệt Giáo án đang được phát triển" })} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
                <FileText className="w-3.5 h-3.5" /> Duyệt Giáo án
              </button>
              <button onClick={() => toast({ variant: 'info', title: "Thông báo", message: "Chức năng Đổi lịch dạy đang được phát triển" })} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <Plus className="w-3.5 h-3.5" /> Đổi lịch dạy
              </button>
            </>
          )}

          {/* Global Export Action */}
          <button onClick={() => setIsReportOpen(true)} className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ml-auto sm:ml-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
            <Download className="w-3.5 h-3.5" /> Báo cáo nhanh
          </button>
        </div>
      </div>

      <Dialog open={isDirectiveOpen} onOpenChange={setIsDirectiveOpen} title="Tạo chỉ đạo mới">
        <CreateDirectiveForm onSuccess={() => setIsDirectiveOpen(false)} />
      </Dialog>

      <Dialog open={isRiskOpen} onOpenChange={setIsRiskOpen} title="Khai báo Rủi ro">
        <DeclareRiskForm onSuccess={() => setIsRiskOpen(false)} />
      </Dialog>

      <Dialog open={isMeetingOpen} onOpenChange={setIsMeetingOpen} title="Triệu tập Cuộc họp">
        <ConveneMeetingForm onSuccess={() => setIsMeetingOpen(false)} />
      </Dialog>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen} title="Báo cáo nhanh">
        <div className="p-4 flex flex-col items-center justify-center space-y-4 font-sans">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
            <Download className="w-8 h-8 text-slate-500" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-slate-900 dark:text-white">Xuất báo cáo tổng quan</h4>
            <p className="text-sm text-slate-500 mt-1">Dữ liệu sẽ được xuất ra file Excel (.xlsx).</p>
          </div>
          <button
            onClick={() => {
              toast({ variant: 'success', title: 'Thành công', message: 'Đang tải xuống báo cáo...' });
              setIsReportOpen(false);
            }}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 py-2 rounded-lg font-bold transition-colors"
          >
            Tải xuống ngay
          </button>
        </div>
      </Dialog>
    </>
  );
}
