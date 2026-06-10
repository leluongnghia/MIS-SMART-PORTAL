import React, { useState } from 'react';
import { Task, Workspace } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TaskCalendarProps {
  tasks: Task[];
  onViewDetails: (task: Task) => void;
}

export default function TaskCalendar({ tasks, onViewDetails }: TaskCalendarProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  // Use June 2026 as the default showing month since mock tasks are in May/June 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 30)); // Month index 5 is June in JS

  // Mobiles date selector state initialised to today (30 May 2026)
  const [selectedDay, setSelectedDay] = useState<{ dayNum: number; monthIndex: number; yearVal: number } | null>({
    dayNum: 30,
    monthIndex: 4, // Month index 4 is May
    yearVal: 2026
  });

  const daysOfWeek = isEn
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Previous month padding days
  const prevMonthIndex = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonthIndex);

  const prevMonthDaysToShow = firstDayIndex;
  
  const handlePrevMonth = () => {
    if (month === 0) {
      setCurrentDate(new Date(year - 1, 11, 1));
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setCurrentDate(new Date(year + 1, 0, 1));
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  // Get tasks that match a specific date: YYYY-MM-DD
  const getTasksForDate = (dayNum: number, currentMonth: number, currentYear: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return tasks.filter(t => t.deadline === dateStr);
  };

  // Build Calendar grid cells
  const renderCells = () => {
    const cells = [];

    // Prior Month Cells (padded)
    for (let i = prevMonthDaysToShow - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      cells.push({
        dayNum: day,
        isCurrentMonth: false,
        monthIndex: prevMonthIndex,
        yearVal: prevYear,
        key: `prev-${day}`
      });
    }

    // Current Month Cells
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: true,
        monthIndex: month,
        yearVal: year,
        key: `curr-${i}`
      });
    }

    // Post Month Cells (grid to complete 42 cells)
    const remaining = 42 - cells.length;
    const nextMonthIndex = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        monthIndex: nextMonthIndex,
        yearVal: nextYear,
        key: `next-${i}`
      });
    }

    return cells;
  };

  const monthNames = isEn
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const selectedDayTasks = selectedDay 
    ? getTasksForDate(selectedDay.dayNum, selectedDay.monthIndex, selectedDay.yearVal)
    : [];

  return (
    <div id="calendar-scheduler" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 gap-3">
        <div id="calendar-title-sect" className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600 shrink-0" />
          <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base">
            {isEn ? 'Academic Work Calendar' : 'Lịch Công tác Giáo dục'} <span className="font-mono text-slate-500 font-normal">({monthNames[month]} - {year})</span>
          </h3>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-1.5">
          <button 
            id="btn-prev-month"
            onClick={handlePrevMonth}
            className="p-1 px-2.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200 text-xs font-semibold cursor-pointer"
          >
            {isEn ? 'Prev' : 'Trước'}
          </button>
          
          <button 
            id="btn-current-month"
            onClick={() => {
              setCurrentDate(new Date(2026, 5, 30));
              setSelectedDay({ dayNum: 30, monthIndex: 4, yearVal: 2026 });
            }}
            className="px-3 py-1.5 font-semibold text-[11px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all cursor-pointer"
          >
            {isEn ? 'Today (06/2026)' : 'Về hiện tại (06/2026)'}
          </button>

          <button 
            id="btn-next-month"
            onClick={handleNextMonth}
            className="p-1 px-2.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200 text-xs font-semibold cursor-pointer"
          >
            {isEn ? 'Next' : 'Sau'}
          </button>
        </div>
      </div>

      {/* Week days row */}
      <div className="grid grid-cols-7 border-b border-slate-100 text-center text-slate-500 font-bold text-[10px] sm:text-xs py-2 bg-slate-50/30">
        {daysOfWeek.map((day, ix) => (
          <div key={day} className={ix === 0 ? 'text-rose-500' : 'text-slate-650'}>
            {day}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div id="calendar-grid-cells" className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/10">
        {renderCells().map((cell) => {
          const dateTasks = getTasksForDate(cell.dayNum, cell.monthIndex, cell.yearVal);
          const isToday = cell.dayNum === 30 && cell.monthIndex === 4 && cell.yearVal === 2026; 
          const isChosen = selectedDay && selectedDay.dayNum === cell.dayNum && selectedDay.monthIndex === cell.monthIndex && selectedDay.yearVal === cell.yearVal;

          return (
            <div 
              key={cell.key}
              onClick={() => setSelectedDay({ dayNum: cell.dayNum, monthIndex: cell.monthIndex, yearVal: cell.yearVal })}
              className={`min-h-[50px] sm:min-h-[105px] p-1 sm:p-2 flex flex-col justify-between transition-all cursor-pointer relative ${
                cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-350'
              } ${isToday ? 'bg-indigo-50/15 ring-2 ring-indigo-500 ring-inset' : ''} ${
                isChosen ? 'bg-indigo-100/30' : 'hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center justify-between gap-1 overflow-hidden">
                <span className={`text-[10px] sm:text-xs font-mono font-bold px-1 py-0.2 rounded ${
                  isToday 
                    ? 'bg-indigo-600 text-white' 
                    : cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-350'
                }`}>
                  {cell.dayNum}
                </span>

                {isToday && (
                  <span className="hidden sm:inline-block text-[8px] font-extrabold text-indigo-700 bg-indigo-100 px-1 py-0.2 rounded uppercase">
                    {isEn ? 'Today' : 'Hôm nay'}
                  </span>
                )}
              </div>

              {/* Day's tasks on Desktop */}
              <div className="hidden md:flex flex-col gap-1 overflow-y-auto max-h-[70px] mt-1.5 scrollbar-thin">
                {dateTasks.map(t => {
                  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
                  if (t.priority === 'CAO') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  if (t.status === 'HOAN_THANH') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  if (t.status === 'CHO_DUYET') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

                  return (
                    <button
                      key={t.id}
                      id={`calendar-task-badge-${t.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(t);
                      }}
                      className={`text-[9.5px] text-left p-1 border rounded font-sans truncate transition-all font-semibold leading-tight cursor-pointer hover:shadow-2xs ${badgeColor}`}
                      title={`${t.title} (${t.assignedName})`}
                    >
                      <div className="truncate flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full shrink-0 ${
                          t.priority === 'CAO' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} />
                        {t.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Day's task indicators on Mobile */}
              {dateTasks.length > 0 && (
                <div className="flex md:hidden flex-wrap gap-0.5 justify-center mt-1">
                  {dateTasks.slice(0, 3).map(t => (
                    <span 
                      key={t.id} 
                      className={`w-1 h-1 rounded-full shrink-0 ${
                        t.status === 'HOAN_THANH' 
                          ? 'bg-emerald-500' 
                          : t.priority === 'CAO' 
                            ? 'bg-rose-500' 
                            : 'bg-indigo-500'
                      }`} 
                    />
                  ))}
                  {dateTasks.length > 3 && (
                    <span className="text-[7px] font-bold text-slate-400 font-mono leading-none leading-0">+</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day's Tasks detail panel for Mobile (md:hidden) */}
      {selectedDay && (
        <div className="md:hidden p-4 border-t border-slate-100 bg-slate-50 relative">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold font-display text-slate-800 uppercase tracking-wide">
              📅 {isEn ? 'Tasks for' : 'Nhiệm vụ ngày'} {selectedDay.dayNum}/{selectedDay.monthIndex + 1}/{selectedDay.yearVal}
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold">
              {selectedDayTasks.length} {isEn ? 'tasks' : 'nhiệm vụ'}
            </span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <p className="text-slate-400 italic text-xs text-center py-5">
              {isEn ? 'No tasks or deadlines for this day.' : 'Hôm nay không có hạn giao việc hay báo cáo kiểm duyệt nào.'}
            </p>
          ) : (
            <div className="space-y-2.5">
              {selectedDayTasks.map(t => {
                let badgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
                if (t.priority === 'CAO') badgeColor = 'bg-rose-50 text-rose-700 border-rose-250';
                if (t.status === 'HOAN_THANH') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                if (t.status === 'CHO_DUYET') badgeColor = 'bg-amber-50 text-amber-700 border-amber-250';

                return (
                  <div 
                    key={t.id}
                    onClick={() => onViewDetails(t)}
                    className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex flex-col gap-2 transition-all cursor-pointer shadow-3xs"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 border rounded-md uppercase tracking-wider ${badgeColor}`}>
                        {t.tag}
                      </span>
                      <span className="text-[9.5px] font-medium text-slate-400 font-sans">
                        {isEn ? 'Due:' : 'Hạn:'} {t.deadline}
                      </span>
                    </div>

                    <h5 className="font-semibold text-slate-900 text-xs font-sans line-clamp-1">
                      {t.title}
                    </h5>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-50 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700 truncate max-w-[120px]">
                        👤 {t.assignedName} ({t.assignedRole})
                      </span>
                      <span className="text-[10.5px] text-indigo-600 font-bold hover:underline cursor-pointer">
                        {isEn ? 'View details →' : 'Xem chi tiết →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
