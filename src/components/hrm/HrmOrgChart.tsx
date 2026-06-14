'use client';

import React from 'react';

interface HrmOrgChartProps {
  lang: string;
}

export default function HrmOrgChart({ lang }: HrmOrgChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 dark:text-white text-sm">
          {lang === 'vi' ? 'Cơ cấu Phân cấp Tổ chức (Organizational Hierarchy)' : 'Organizational Hierarchy'}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5 font-sans">
          {lang === 'vi' 
            ? 'Sơ đồ tổ chức phân cấp từ Ban Giám hiệu (BGH), Hội đồng Trường đến các Phòng ban chức năng và Tổ chuyên môn học thuật.'
            : 'School structural diagram displaying Ban Giám hiệu, School Council, functional offices and academic departments.'}
        </p>
      </div>

      <div className="p-6 bg-slate-50/40 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex flex-col items-center space-y-6 min-h-[500px] w-full overflow-x-auto select-none">
        
        {/* Level 1: Board of Founders & Council */}
        <div className="flex gap-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/35 rounded-xl text-center shadow-3xs w-60">
            <strong className="text-[11px] text-amber-600 dark:text-amber-400 block font-black uppercase tracking-wider">Hội đồng Trường</strong>
            <span className="text-xs text-slate-800 dark:text-white block font-bold mt-1">PGS.TS. Nguyễn Văn Minh</span>
            <span className="text-[9px] text-slate-400 block font-mono">Chủ tịch Hội đồng</span>
          </div>
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/35 rounded-xl text-center shadow-3xs w-60">
            <strong className="text-[11px] text-amber-600 dark:text-amber-400 block font-black uppercase tracking-wider">Ban Điều hành</strong>
            <span className="text-xs text-slate-800 dark:text-white block font-bold mt-1">CEO HVL</span>
            <span className="text-[9px] text-slate-400 block font-mono">Giám đốc Điều hành</span>
          </div>
        </div>

        <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-800" />

        {/* Level 2: Ban Giám hiệu (BGH) */}
        <div className="w-full max-w-4xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-150 dark:border-indigo-900/40 p-4.5 rounded-2xl shadow-3xs">
          <div className="text-center mb-3.5">
            <strong className="text-[11px] text-indigo-650 dark:text-indigo-400 block font-black uppercase tracking-wider font-mono">Ban Giám hiệu (BGH)</strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-center shadow-4xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp THPT</span>
              <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Nguyễn Minh Triết</strong>
              <span className="text-[9.5px] text-indigo-650 dark:text-indigo-400 block mt-1.5 font-mono font-bold">Hiệu trưởng điều hành</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-4xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500"></div>
              <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp THCS</span>
              <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Dương Nam Anh</strong>
              <span className="text-[9.5px] text-slate-450 block mt-1.5 font-mono">Phó Hiệu trưởng</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-4xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>
              <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/30 text-sky-650 dark:text-sky-400 text-[9px] font-black uppercase tracking-wide rounded font-mono">Cấp Tiểu học</span>
              <strong className="text-xs text-slate-800 dark:text-white block font-bold mt-2.5">Thầy Ngô Anh Tuấn</strong>
              <span className="text-[9.5px] text-slate-450 block mt-1.5 font-mono">Phó Hiệu trưởng</span>
            </div>
          </div>
        </div>

        {/* Connecting lines */}
        <div className="flex w-full max-w-5xl justify-between px-16 relative">
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2"></div>
          <div className="w-1/2 border-t-2 border-slate-200 dark:border-slate-800 h-6"></div>
          <div className="w-1/2 border-t-2 border-slate-200 dark:border-slate-800 h-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
          {/* Left Branch: Functional Departments */}
          <div className="bg-slate-100/40 dark:bg-slate-900/30 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Các Phòng ban &amp; Khối Vận hành
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Phòng Tuyển sinh &amp; PR</strong>
                <span className="text-[9.5px] text-slate-450 block mt-0.5">Trưởng phòng: Cô Vũ Khánh Chi</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Phòng Khảo thí &amp; ĐBCL</strong>
                <span className="text-[9.5px] text-slate-450 block mt-0.5">Trưởng phòng: Cô Đỗ Thùy Trang</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-4xs">
                <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Hành chính - Kế toán - Nhân sự</strong>
                <span className="text-[9.5px] text-slate-450 block mt-0.5">Văn phòng trường</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs">
                <strong className="text-[11px] text-slate-800 dark:text-white block font-bold">Dịch vụ Học đường &amp; Bếp ăn</strong>
                <span className="text-[9.5px] text-slate-450 block mt-0.5">Trưởng phòng: Thầy Phạm Thế Anh</span>
              </div>
            </div>
          </div>

          {/* Right Branch: Subject Departments */}
          <div className="bg-slate-100/40 dark:bg-slate-900/30 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Tổ chuyên môn Học thuật
            </h4>
            <div className="grid grid-cols-1 gap-4 max-h-[380px] overflow-y-auto pr-1">
              {/* Cấp THPT */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-600 rounded-full"></span>
                  <span className="text-[9px] font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-mono">Cấp THPT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Toán - Tin học (THPT)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Lê Thị Thanh Nhàn</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Ngữ văn (THPT)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Thầy Vũ Tiến Đạt</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Vật lí - Hóa học (THPT)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Cô Trần Thị Kim Anh</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Sinh - Địa - GDQP (THPT)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Thầy Hoàng Văn Sơn</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Ngoại ngữ (THPT)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Cô Minh Tuyết</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ GDKT-PL &amp; Nghệ thuật (THPT)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Cô Hoàng Thị Hương</span>
                  </div>
                </div>
              </div>

              {/* Cấp THCS */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-violet-500 rounded-full"></span>
                  <span className="text-[9px] font-black uppercase tracking-wide text-violet-600 dark:text-violet-400 font-mono">Cấp THCS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Toán - Tin học (THCS)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ phó: Thầy Trần Hoàng Nam</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Khoa học Tự nhiên (THCS)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Thầy Vũ Minh Khang</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Ngữ văn &amp; Lịch sử - Địa lí (THCS)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Nguyễn Thanh Lan</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Ngoại ngữ &amp; GDCD (THCS)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Cô Đỗ Thục Quyên</span>
                  </div>
                </div>
              </div>

              {/* Cấp Tiểu học */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-sky-500 rounded-full"></span>
                  <span className="text-[9px] font-black uppercase tracking-wide text-sky-600 dark:text-sky-400 font-mono">Cấp Tiểu học</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Toán - Tiếng Việt (Tiểu học)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Tổ trưởng: Cô Nguyễn Mai Chi</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Tự nhiên &amp; Xã hội (Tiểu học)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Trưởng nhóm: Cô Lê Thu Hà</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Ngoại ngữ &amp; Tin học (Tiểu học)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Thầy David Miller</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-4xs text-left">
                    <strong className="text-[10px] text-slate-800 dark:text-white block font-bold">Tổ Nghệ thuật &amp; Thể chất (Tiểu học)</strong>
                    <span className="text-[8.5px] text-slate-450 block mt-0.5">Liên hệ: Thầy Trịnh Công Sơn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
