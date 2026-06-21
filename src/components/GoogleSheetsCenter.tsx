import { serverStorage } from '../libs/client/server-storage';
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  FileCode, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle,
  Key,
  KeyRound,
  Trash2,
  Plus,
  Mail,
  Clock,
  Terminal,
  Eye,
  Activity,
  Laptop,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Task } from '../types';
import { detectDevice } from '../deviceDetector';
import { 
  loadSheetsConfig, 
  saveSheetsConfig, 
  clearSheetsToken, 
  getOAuthUrl,
  createMISSpreadsheet, 
  pushTasksToGoogleSheets, 
  pullTasksFromGoogleSheets,
  GET_APPS_SCRIPT_CODE,
  syncWithAppsScript,
  sendReportEmailViaAppsScript
} from '../googleSheetsUtil';

interface GoogleSheetsCenterProps {
  tasks: Task[];
  onSyncComplete: (syncedTasks: Task[]) => void;
}

export default function GoogleSheetsCenter({ tasks, onSyncComplete }: GoogleSheetsCenterProps) {
  // Load initial configs
  const [activeTab, setActiveTab ] = useState<'APPS_SCRIPT' | 'CSV' | 'AUTO_REPORT'>('AUTO_REPORT');
  const [config, setConfig] = useState(loadSheetsConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Conflict Resolution States
  const [showMergeOptions, setShowMergeOptions] = useState(false);
  const [pulledTasks, setPulledTasks] = useState<Task[]>([]);

  // Task Conflict Checker
  const handleIncomingTasksReceived = (importedTasks: Task[]) => {
    // Check which imported tasks conflict (differ from existing)
    const conflicting = importedTasks.filter(imported => {
      const dbTask = tasks.find(t => t.id === imported.id);
      if (!dbTask) return false;
      // Consider it a conflict if status or comments diff
      return dbTask.status !== imported.status || 
             (dbTask.comments || []).length !== (imported.comments || []).length ||
             (dbTask.history || []).length !== (imported.history || []).length ||
             dbTask.title !== imported.title ||
             dbTask.description !== imported.description;
    });

    if (conflicting.length > 0) {
      setPulledTasks(importedTasks);
      setShowMergeOptions(true);
      showMsg('info', 'Phát hiện xung đột dữ liệu giữa hệ thống và Google Sheets. Vui lòng lựa chọn cách gộp ở bảng phía dưới.');
    } else {
      onSyncComplete(importedTasks);
      showMsg('success', `Đã đồng bộ tải về ${importedTasks.length} công việc từ Google Sheets thành công!`);
    }
  };

  const resolveConflictsAndApply = (strategy: 'SMART' | 'OVERWRITE' | 'KEEP_LOCAL') => {
    let result: Task[] = [];

    if (strategy === 'OVERWRITE') {
      result = pulledTasks;
    } else if (strategy === 'KEEP_LOCAL') {
      result = [...tasks];
      pulledTasks.forEach(pulled => {
        const localExists = tasks.some(t => t.id === pulled.id);
        if (!localExists) {
          result.push(pulled);
        }
      });
    } else {
      // SMART MERGE (Gộp thông minh)
      result = [...tasks];
      pulledTasks.forEach(pulled => {
        const localIdx = result.findIndex(t => t.id === pulled.id);
        if (localIdx === -1) {
          result.push(pulled); // Net-new
        } else {
          const localTask = result[localIdx];
          
          // Advanced progress status picks most progressive
          const statusOrder: Record<string, number> = {
            'CHUA_BAT_DA': 0,
            'DANG_TIEN_HANH': 1,
            'CHO_DUYET': 2,
            'HOAN_THANH': 3
          };
          const resolvedStatus = (statusOrder[localTask.status] || 0) >= (statusOrder[pulled.status] || 0)
            ? localTask.status
            : pulled.status;

          // Merge safety for comments list (unique items)
          const mergedComments = [...(localTask.comments || [])];
          (pulled.comments || []).forEach(pc => {
            const exists = mergedComments.some(c => c.id === pc.id || (c.userName === pc.userName && c.content === pc.content));
            if (!exists) {
              mergedComments.push(pc);
            }
          });

          // Merge safety for history tracker
          const mergedHistory = [...(localTask.history || [])];
          (pulled.history || []).forEach(ph => {
            const exists = mergedHistory.some(h => h.id === ph.id || (h.userName === ph.userName && h.action === ph.action));
            if (!exists) {
              mergedHistory.push(ph);
            }
          });

          result[localIdx] = {
            ...localTask,
            status: resolvedStatus,
            reportEvidence: localTask.reportEvidence || pulled.reportEvidence || '',
            rejectionReason: localTask.rejectionReason || pulled.rejectionReason || '',
            comments: mergedComments,
            history: mergedHistory,
            title: localTask.title || pulled.title,
            description: localTask.description || pulled.description,
            deadline: localTask.deadline || pulled.deadline,
            priority: localTask.priority || pulled.priority,
            assignedId: localTask.assignedId || pulled.assignedId,
            assignedName: localTask.assignedName || pulled.assignedName,
            assignedRole: localTask.assignedRole || pulled.assignedRole
          };
        }
      });
    }

    onSyncComplete(result);
    setShowMergeOptions(false);
    setPulledTasks([]);
    showMsg('success', `Đồng bộ hòa giải dữ liệu thành công theo phương thức: ${
      strategy === 'SMART' ? 'Gộp thông minh (Smart Merge)' : strategy === 'OVERWRITE' ? 'Khôi phục đè hoàn toàn' : 'Giữ cấu hình hệ thống'
    }!`);
  };

  // Email report configuration state
  const [recipientEmails, setRecipientEmails] = useState(() => {
    return serverStorage.getItem('mis_recipient_emails') || 'duonghinhi225@gmail.com, principal@misvn.edu.vn, board@misvn.edu.vn';
  });
  const [isAutoReportActive, setIsAutoReportActive] = useState(() => {
    return serverStorage.getItem('mis_auto_report_active') === 'true';
  });

  // Toggles for individual reports
  const [isDailyActive, setIsDailyActive] = useState(() => {
    const val = serverStorage.getItem('mis_daily_active');
    return val === null ? true : val === 'true';
  });
  const [isWeeklyActive, setIsWeeklyActive] = useState(() => {
    const val = serverStorage.getItem('mis_weekly_active');
    return val === null ? true : val === 'true';
  });
  const [isMonthlyActive, setIsMonthlyActive] = useState(() => {
    const val = serverStorage.getItem('mis_monthly_active');
    return val === null ? true : val === 'true';
  });

  const [reportLog, setReportLog] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Times
  const [dailySendTime, setDailySendTime] = useState(() => serverStorage.getItem('mis_daily_send_time') || '17:00');
  const [weeklySendTime, setWeeklySendTime] = useState(() => serverStorage.getItem('mis_weekly_send_time') || '17:00');
  const [monthlySendTime, setMonthlySendTime] = useState(() => serverStorage.getItem('mis_monthly_send_time') || '07:00');

  // Trackers
  const [lastSentDailyDate, setLastSentDailyDate] = useState(() => serverStorage.getItem('mis_last_sent_daily_date') || '');
  const [lastSentWeeklyDate, setLastSentWeeklyDate] = useState(() => serverStorage.getItem('mis_last_sent_weekly_date') || '');
  const [lastSentMonthlyDate, setLastSentMonthlyDate] = useState(() => serverStorage.getItem('mis_last_sent_monthly_date') || '');

  const [previewType, setPreviewType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(() => detectDevice());

  // Listen to dimension changes to update device info
  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state modifications to local storage
  useEffect(() => {
    serverStorage.setItem('mis_recipient_emails', recipientEmails);
  }, [recipientEmails]);

  useEffect(() => {
    serverStorage.setItem('mis_auto_report_active', String(isAutoReportActive));
  }, [isAutoReportActive]);

  useEffect(() => {
    serverStorage.setItem('mis_daily_active', String(isDailyActive));
  }, [isDailyActive]);

  useEffect(() => {
    serverStorage.setItem('mis_weekly_active', String(isWeeklyActive));
  }, [isWeeklyActive]);

  useEffect(() => {
    serverStorage.setItem('mis_monthly_active', String(isMonthlyActive));
  }, [isMonthlyActive]);

  useEffect(() => {
    serverStorage.setItem('mis_daily_send_time', dailySendTime);
  }, [dailySendTime]);

  useEffect(() => {
    serverStorage.setItem('mis_weekly_send_time', weeklySendTime);
  }, [weeklySendTime]);

  useEffect(() => {
    serverStorage.setItem('mis_monthly_send_time', monthlySendTime);
  }, [monthlySendTime]);

  const addLog = (msg: string) => {
    setReportLog(prev => [...prev, `[${new Date().toLocaleTimeString('vi-VN')}] ${msg}`]);
  };

  const getDayAndStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'HOAN_THANH').length;
    const pending = tasks.filter(t => t.status === 'CHO_DUYET').length;
    const inProgress = tasks.filter(t => t.status === 'DANG_TIEN_HANH').length;
    const highPriority = tasks.filter(t => t.priority === 'CAO').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, inProgress, highPriority, percent };
  };

  const generateHtmlDailyReportBody = (currentDay: string) => {
    const { total, completed, pending, inProgress, highPriority, percent } = getDayAndStats();
    const completedTasksListHtml = tasks
      .filter(t => t.status === 'HOAN_THANH' || t.status === 'CHO_DUYET')
      .map(t => `<li style="margin-bottom: 8px;"><b>[${t.workspaceId}]</b> ${t.title} (Người nhận: ${t.assignedName}) - <i>Trạng thái: ${t.status === 'HOAN_THANH' ? '<span style="color: #16a34a; font-weight: bold;">Đã hoàn tất</span>' : '<span style="color: #2563eb; font-weight: bold;">Chờ phê duyệt</span>'}</i></li>`)
      .join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="background-color: #107c41; padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0; text-transform: uppercase; font-size: 18px; letter-spacing: 1px;">Trường Phổ Thông Liên Cấp Đa Trí Tuệ (MIS)</h2>
          <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Báo cáo giáo dục và học vụ hằng ngày (Gửi tự động định kỳ 17:00)</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0;">Kính gửi <b>Ban giám hiệu & Lãnh đạo Trường Đa Trí Tuệ (MIS)</b>,</p>
          <p>Hệ thống tự động xin tóm tắt chi tiết các công việc trong ngày <b>hôm nay ${currentDay}</b> tính đến 5 giờ chiều (17:00):</p>
          
          <div style="display: flex; justify-content: space-around; background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #f1f5f9;">
            <div style="flex: 1;"><span style="display: block; font-size: 22px; font-weight: bold; color: #107c41;">${total}</span><span style="font-size: 11px; color: #64748b; font-weight: bold;">Chỉ đạo</span></div>
            <div style="flex: 1;"><span style="display: block; font-size: 22px; font-weight: bold; color: #16a34a;">${completed}</span><span style="font-size: 11px; color: #64748b; font-weight: bold;">Hoàn thành</span></div>
            <div style="flex: 1;"><span style="display: block; font-size: 22px; font-weight: bold; color: #2563eb;">${pending}</span><span style="font-size: 11px; color: #64748b; font-weight: bold;">Chờ duyệt</span></div>
            <div style="flex: 1;"><span style="display: block; font-size: 22px; font-weight: bold; color: #ca8a04;">${inProgress}</span><span style="font-size: 11px; color: #64748b; font-weight: bold;">Đang hoạt động</span></div>
          </div>
          
          <ul style="padding-left: 20px; margin: 20px 0;">
            <li style="margin-bottom: 8px;"><b>Hiệu suất đạt chuẩn chỉ đạo hôm nay:</b> <span style="color: #107c41; font-weight: bold;">${percent}%</span></li>
            <li style="margin-bottom: 8px;"><b>Nhiệm vụ trực tiếp diện Ưu tiên cao (Khẩn):</b> <span style="color: #dc2626; font-weight: bold;">${highPriority} việc</span></li>
            <li style="margin-bottom: 8px;"><b>Thiết bị túc trực kích hoạt:</b> <span style="color: #107c41; font-weight: bold;">💻 ${deviceInfo.type === 'DESKTOP' ? 'Máy tính' : 'Thiết bị di động'} (${deviceInfo.os} - ${deviceInfo.browser})</span></li>
          </ul>
          
          <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 14px; text-transform: uppercase; margin-top: 25px;">Chi tiết việc bàn giao & đổi mới hôm nay:</h3>
          ${completedTasksListHtml ? `<ul style="padding-left: 20px; margin-top: 10px;">${completedTasksListHtml}</ul>` : `<p style="font-style: italic; color: #64748b;">Không có cập nhật tiến độ hay phê duyệt mới nào trong ngày hôm nay.</p>`}
          
          <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 14px; text-transform: uppercase; margin-top: 25px;">Thống kê đa trí thông minh (Howard Gardner Indicator):</h3>
          <p style="margin-top: 5px; font-size: 12.5px; color: #64748b;">Hồ sơ chỉ việc được cấu hình chặt chẽ theo phân loại năng lực độc lập của các cán bộ phòng ban giúp kích hoạt hiệu suất tối đa.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
            Báo cáo gửi tự động từ hệ thống <a href="${window.location.origin}" style="color: #107c41; text-decoration: none; font-weight: bold;">Bảng chỉ đạo Đa Trí Tuệ MIS</a>.<br/>
            Tôn trọng tính khác biệt - Đồng hành cùng tài năng sư phạm.
          </div>
        </div>
      </div>
    `;
  };

  const generateHtmlWeeklyReportBody = (currentDate: string) => {
    const { total, completed, pending, inProgress, highPriority, percent } = getDayAndStats();
    
    // Group active tasks by departments to present weekly progress
    const departmentsReportHtml = [
      { id: 'BGH', name: 'Ban Giám hiệu' },
      { id: 'TUYEN_SINH_PR', name: 'Tuyển sinh & PR' },
      { id: 'QUOC_TE', name: 'Ban Quốc tế' },
      { id: 'KHAO_THI', name: 'Khảo thí & ĐBCL' },
      { id: 'CTHS_TAM_LY', name: 'CTHS & Tâm lý' },
      { id: 'DICH_VU_HOC_DUONG', name: 'Dịch vụ & Vận hành' },
      { id: 'TOAN_TIN', name: 'Tổ Toán - Tin' },
      { id: 'VAN', name: 'Tổ Ngữ Văn' },
      { id: 'HANH_CHINH', name: 'Hành chính & Kế toán' },
    ].map(dept => {
      const deptTasks = tasks.filter(t => t.workspaceId === dept.id);
      const deptTotal = deptTasks.length;
      const deptDone = deptTasks.filter(t => t.status === 'HOAN_THANH').length;
      const deptPercent = deptTotal > 0 ? Math.round((deptDone / deptTotal) * 100) : 0;
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-size: 12px; font-weight: bold; color: #1e293b;">${dept.name}</td>
          <td style="padding: 10px; font-size: 12px; text-align: center; color: #475569;">${deptTotal} việc</td>
          <td style="padding: 10px; font-size: 12px; text-align: center; color: #16a34a; font-weight: bold;">${deptDone} đạt</td>
          <td style="padding: 10px; font-size: 12px; text-align: right; font-weight: bold; color: ${deptPercent >= 80 ? '#107c41' : deptPercent >= 50 ? '#ca8a04' : '#dc2626'}">${deptPercent}%</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="background-color: #4f46e5; padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0; text-transform: uppercase; font-size: 18px; letter-spacing: 1px;">Trường Phổ Thông Liên Cấp Đa Trí Tuệ (MIS)</h2>
          <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Báo cáo tổng hợp tuần của nhà trường (Tự động 17:00 thứ Sáu)</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0;">Kính gửi <b>Hội đồng sư phạm & Ban Giám hiệu Trường Đa Trí Tuệ (MIS)</b>,</p>
          <p>Hệ thống tự động đồng bộ xin tổng hợp kết quả hoạt động giáo dục toàn diện của cả tuần vừa qua (Tính đến lúc 5h chiều Thứ Sáu, ngày <b>${currentDate}</b>):</p>
          
          <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #4f46e5; text-transform: uppercase; font-size: 13px; font-weight: bold;">Tiến Trình Thực Hiện của Các Bộ Phận & Tổ Chuyên Môn:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e9d5ff; text-align: left;">
                  <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6b21a8; font-weight: bold;">Cơ cấu phòng ban</th>
                  <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6b21a8; font-weight: bold; text-align: center;">Tổng đầu việc</th>
                  <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6b21a8; font-weight: bold; text-align: center;">Đã hoàn tất</th>
                  <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6b21a8; font-weight: bold; text-align: right;">Đạt chỉ tiêu</th>
                </tr>
              </thead>
              <tbody>
                ${departmentsReportHtml}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: space-around; background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #f1f5f9;">
            <div style="flex: 1;"><span style="display: block; font-size: 20px; font-weight: bold; color: #4f46e5;">${total}</span><span style="font-size: 10px; color: #64748b; font-weight: bold;">Tổng chiến dịch</span></div>
            <div style="flex: 1;"><span style="display: block; font-size: 20px; font-weight: bold; color: #16a34a;">${completed}</span><span style="font-size: 10px; color: #64748b; font-weight: bold;">Đạt chuẩn</span></div>
            <div style="flex: 1;"><span style="display: block; font-size: 20px; font-weight: bold; color: #ca8a04;">${percent}%</span><span style="font-size: 10px; color: #64748b; font-weight: bold;">Tỉ lệ hoàn tất</span></div>
            <div style="flex: 1;"><span style="display: block; font-size: 20px; font-weight: bold; color: #dc2626;">${highPriority}</span><span style="font-size: 10px; color: #64748b; font-weight: bold;">Việc khẩn</span></div>
          </div>
          
          <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 14px; text-transform: uppercase; margin-top: 25px;">Nhận định & Chỉ đạo từ Hội đồng Trường:</h3>
          <p style="margin-top: 5px; font-size: 12.5px; color: #475569;">Báo cáo tổng kết tuần cung cấp cái nhìn định lượng giúp ban lãnh đạo dễ dàng phát hiện các nút thắt hoạt động, phân bổ tài lực, kịp thời bổ khuyết nâng cao học vụ trước kỳ mới.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
            Báo cáo được khởi tạo tự động hàng tuần vào lúc 17:00 chiều thứ Sáu từ hòm thư <a href="${window.location.origin}" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Hành chính Giáo dục Đa Trí Tuệ MIS</a>.<br/>
            Đồng hành sáng tạo - Vì một tương lai giáo dục khai phóng.
          </div>
        </div>
      </div>
    `;
  };

  const generateHtmlMonthlyReportBody = (currentMonth: string) => {
    const { total, completed, pending, inProgress, highPriority, percent } = getDayAndStats();
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="background-color: #0369a1; padding: 25px; text-align: center; color: white;">
          <h2 style="margin: 0; text-transform: uppercase; font-size: 18px; letter-spacing: 1px;">Trường Phổ Thông Liên Cấp Đa Trí Tuệ (MIS)</h2>
          <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Báo cáo tổng hợp tháng - Quản trị học vụ đa trí tuệ (07:00 sáng ngày cuối tháng)</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0;">Kính gửi <b>Chủ tịch Hội đồng Trường & Ban Giám đốc Điều hành Trường Đa Trí Tuệ (MIS)</b>,</p>
          <p>Hệ thống tự động đồng bộ xin hân hạnh báo cáo toàn bộ hiệu suất nhà trường, chỉ số chất lượng hoạt động của <b>tháng ${currentMonth}</b> nhằm phục vụ hoạch định sư phạm liên cấp:</p>
          
          <div style="display: flex; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px; margin: 20px 0; align-items: center; gap: 15px;">
            <div style="font-size: 32px; line-height: 1;">📊</div>
            <div>
              <h4 style="margin: 0; color: #0369a1; text-transform: uppercase; font-size: 13px; font-weight: bold;">Chỉ số hiệu chỉnh Đa Trí Tuệ tháng: <b>${percent >= 80 ? 'XUẤT SẮC ✓' : percent >= 60 ? 'LOẠI KHÁ (Cải tiến tốt)' : 'CẦN CHẤN CHỈNH TỔ CHỨC'}</b></h4>
              <p style="margin: 4px 0 0; font-size: 12px; color: #0369a1;">Hệ thống đã phê chuẩn và hoàn thành xuất sắc <b>${completed} chiến dịch</b> trọng điểm.</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569;">Bản đánh giá định lượng quan trọng</th>
                <th style="padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569; text-align: right;">Bàn giao / Hiệu suất</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-size: 12px; font-weight: bold; color: #1e293b;">Nhiệm vụ/Quyết sách ban hành trong tháng</td>
                <td style="padding: 10px; font-size: 12px; text-align: right; font-weight: bold; color: #0369a1;">${total} mục</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-size: 12px; font-weight: bold; color: #1e293b;">Quyết định đạt chuẩn sư phạm, nghiệm thu kết quả</td>
                <td style="padding: 10px; font-size: 12px; text-align: right; font-weight: bold; color: #16a34a;">${completed} việc</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-size: 12px; font-weight: bold; color: #1e293b;">Công tác tồn đọng cần lãnh đạo kiểm tra cải tổ</td>
                <td style="padding: 10px; font-size: 12px; text-align: right; font-weight: bold; color: #ca8a04;">${pending} việc</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-size: 12px; font-weight: bold; color: #1e293b;">Luồng văn bản khẩn, tối mật cần giải quyết ngay</td>
                <td style="padding: 10px; font-size: 12px; text-align: right; font-weight: bold; color: #dc2626;">${highPriority} văn bản</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-size: 12px; font-weight: bold; color: #1e293b; background-color: #f8fafc;">Hiệu quả phối hợp phòng ban toàn nhà trường</td>
                <td style="padding: 10px; font-size: 12.5px; text-align: right; font-weight: bold; color: #16a34a; background-color: #f8fafc;">${percent}%</td>
              </tr>
            </tbody>
          </table>

          <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 14px; text-transform: uppercase; margin-top: 25px;">Kế hoạch nâng cao quản trị giáo dục vĩ mô:</h3>
          <p style="margin-top: 5px; font-size: 12.5px; color: #475569;">Báo cáo cả tháng được túc trực phục vụ trực tiếp vào 7h sáng ngày cuối cùng hàng tháng. Kính mời ban quản lý theo dõi để làm cơ sở cho kế hoạch ngân sách và chiến lược sư phạm tháng mới.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
            Hệ thống báo cáo tự động túc trực ngày cuối mỗi tháng từ hòm thư <a href="${window.location.origin}" style="color: #0369a1; text-decoration: none; font-weight: bold;">Học Hiệu Kanban MIS</a>.<br/>
            Kiến tạo tài năng - Khơi dậy tiềm năng toàn diện đứa trẻ.
          </div>
        </div>
      </div>
    `;
  };

  const getHtmlBodyByType = (type: 'DAILY' | 'WEEKLY' | 'MONTHLY', currentDayStr: string) => {
    if (type === 'DAILY') return generateHtmlDailyReportBody(currentDayStr);
    if (type === 'WEEKLY') return generateHtmlWeeklyReportBody(currentDayStr);
    return generateHtmlMonthlyReportBody(currentDayStr);
  };

  const triggerEmailReport = async (type: 'DAILY' | 'WEEKLY' | 'MONTHLY', dateStr?: string) => {
    setReportLog([]);
    const typeLabel = type === 'DAILY' ? 'Thường Nhật' : type === 'WEEKLY' ? 'Tuần Thứ 6' : 'Tổng kết Tháng';
    addLog(`Khởi tạo quy trình xuất bản báo cáo học vụ tự động [Báo cáo ${typeLabel}]...`);
    
    if (!config.appsScriptUrl) {
      addLog('❌ THẤT BẠI: Bạn chưa cài đặt URL Apps Script Web App trong tab "Apps Script"! Hãy thiết lập URL để gửi email.');
      showMsg('error', 'Chưa có cấu hình URL Apps Script Web App để túc trực gửi báo cáo.');
      return;
    }

    const { total } = getDayAndStats();
    const curDay = dateStr || new Date().toLocaleDateString('vi-VN');
    const mailSubject = type === 'DAILY' 
      ? `Giáo dục Đa Trí Tuệ MIS - Báo cáo Kết quả Học vụ ngày ${curDay} (Định kỳ 17:00)` 
      : type === 'WEEKLY'
      ? `Giáo dục Đa Trí Tuệ MIS - Báo cáo Tổng hợp TUẦN Học Hiệu ngày ${curDay} (Thứ Sáu 17:00)`
      : `Giáo dục Đa Trí Tuệ MIS - Báo cáo Tổng kết THÁNG & Quản trị Sư phạm ngày ${curDay} (7:00 AM)`;

    addLog(`Đang biên dịch mẫu HTML báo cáo ${type}...`);
    const htmlContent = getHtmlBodyByType(type, curDay);

    addLog(`Đang gửi dữ liệu báo cáo qua Apps Script tới danh: [${recipientEmails}]...`);
    
    try {
      setIsSyncing(true);
      const res = await sendReportEmailViaAppsScript(
        config.appsScriptUrl,
        recipientEmails,
        mailSubject,
        htmlContent
      );

      if (res.success) {
        addLog(`✅ THÀNH CÔNG: Email báo cáo ${typeLabel} đã được chuyển phát đi thành công lúc ${new Date().toLocaleTimeString('vi-VN')}!`);
        showMsg('success', `Đã chuyển phát báo cáo ${typeLabel} thành công cho lãnh đạo qua email! (${recipientEmails})`);
        
        const nowStr = new Date().toLocaleDateString('vi-VN');
        if (type === 'DAILY') {
          serverStorage.setItem('mis_last_sent_daily_date', nowStr);
          setLastSentDailyDate(nowStr);
        } else if (type === 'WEEKLY') {
          serverStorage.setItem('mis_last_sent_weekly_date', nowStr);
          setLastSentWeeklyDate(nowStr);
        } else {
          serverStorage.setItem('mis_last_sent_monthly_date', nowStr);
          setLastSentMonthlyDate(nowStr);
        }
      } else {
        addLog(`❌ THẤT BẠI: ${res.message}`);
        showMsg('error', `Gửi báo cáo qua Apps Script gặp lỗi: ${res.message}`);
      }
    } catch (err: any) {
      addLog(`❌ LỖI HỆ THỐNG TRUYỀN TẢI: ${err.message}`);
      showMsg('error', `Kết nối Apps Script thất bại: ${err.message}. Hãy chắc chắn URL chính xác và chọn quyền Anyone.`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper inside client timer to compute if a Date is the last day of its month
  const isLastDayOfMonth = (date: Date): boolean => {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getDate() === 1;
  };

  // Timer interval to run client-side background scheduled trigger
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (isAutoReportActive) {
        const hhmm = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const currentDateStr = now.toLocaleDateString('vi-VN');

        // 1. Daily Report (Every day at dailySendTime - default 17:00)
        if (isDailyActive && hhmm === dailySendTime && lastSentDailyDate !== currentDateStr) {
          triggerEmailReport('DAILY', currentDateStr);
        }

        // 2. Weekly Report (Friday at weeklySendTime - default 17:00, dayOfWeek is 5)
        if (isWeeklyActive && now.getDay() === 5 && hhmm === weeklySendTime && lastSentWeeklyDate !== currentDateStr) {
          triggerEmailReport('WEEKLY', currentDateStr);
        }

        // 3. Monthly Report (Last day of month at monthlySendTime - default 07:00)
        if (isMonthlyActive && isLastDayOfMonth(now) && hhmm === monthlySendTime && lastSentMonthlyDate !== currentDateStr) {
          triggerEmailReport('MONTHLY', currentDateStr);
        }
      }
    }, 20000); // Check every 20 seconds to keep it precise yet conservative
    return () => clearInterval(timer);
  }, [
    isAutoReportActive, 
    isDailyActive, 
    isWeeklyActive, 
    isMonthlyActive, 
    dailySendTime, 
    weeklySendTime, 
    monthlySendTime, 
    lastSentDailyDate, 
    lastSentWeeklyDate, 
    lastSentMonthlyDate, 
    tasks, 
    recipientEmails, 
    config.appsScriptUrl
  ]);

  // Simulated Google Sheets columns
  const [simulatedTasks, setSimulatedTasks] = useState<Task[]>([]);

  // Sync simulator with prop tasks on load
  useEffect(() => {
    setSimulatedTasks(JSON.parse(JSON.stringify(tasks)));
  }, [tasks]);

  // Handle Hash Redirect for OAuth Implicit Flow
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        saveSheetsConfig({ accessToken: token });
        setConfig(prev => ({ ...prev, accessToken: token }));
        setSyncMessage({ type: 'success', text: 'Kết nối Google OAuth thành công! Hãy chọn tiếp hành động phía dưới.' });
        // Clean hash in browser URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const handleSaveConfigField = (field: 'clientId' | 'spreadsheetId' | 'appsScriptUrl', value: string) => {
    const newVal = value.trim();
    saveSheetsConfig({ [field]: newVal });
    setConfig(prev => ({ ...prev, [field]: newVal }));
  };

  const handleUpdateSimulatedCell = (index: number, field: keyof Task, value: any) => {
    const updated = [...simulatedTasks];
    updated[index] = { ...updated[index], [field]: value };
    setSimulatedTasks(updated);
  };

  const handleAddSimulatedRow = () => {
    const newRow: Task = {
      id: `task_sim_0${Date.now() % 1000000}`,
      title: 'Dòng công việc mới phát sinh',
      description: 'Nhập nội dung/đề xuất cần chỉ đạo tại đây',
      workspaceId: 'BGH',
      assignedId: '',
      assignedName: 'Chưa giao',
      assignedRole: '',
      priority: 'TRUNG_BINH',
      status: 'CHUA_BAT_DA',
      deadline: new Date().toISOString().split('T')[0],
      tag: 'Chuyên môn',
      createdBy: 'Hệ thống',
      comments: [],
      history: []
    };
    setSimulatedTasks([...simulatedTasks, newRow]);
    showMsg('success', 'Đã chèn 1 dòng trống mới vào Google Sheets giả lập!');
  };

  const handleDeleteSimulatedRow = (index: number) => {
    const updated = simulatedTasks.filter((_, i) => i !== index);
    setSimulatedTasks(updated);
    showMsg('success', 'Đã loại bỏ 1 dòng khỏi Google Sheets giả lập.');
  };

  const handleSimulatorPush = () => {
    setIsSyncing(true);
    showMsg('info', 'Đang nạp tiến độ hiện tại từ Kanban... Đang đẩy ghi đè lên Google Sheets ảo...');
    setTimeout(() => {
      setSimulatedTasks(JSON.parse(JSON.stringify(tasks)));
      setIsSyncing(false);
      showMsg('success', `Đẩy dữ liệu THÀNH CÔNG! Đã cập nhật 15 cột cho ${tasks.length} dòng công việc tương ứng lên Google Sheets giả lập.`);
    }, 750);
  };

  const handleSimulatorPull = () => {
    if (simulatedTasks.length === 0) {
      showMsg('error', 'Google Sheets ảo đang rỗng.');
      return;
    }
    setIsSyncing(true);
    showMsg('info', 'Đang kéo các ô dữ liệu Google Sheets về, phân tích cú pháp kiểu dữ liệu và tái cấu trúc trạng thái... Chuyển sang Kanban...');
    setTimeout(() => {
      onSyncComplete(JSON.parse(JSON.stringify(simulatedTasks)));
      setIsSyncing(false);
      showMsg('success', `Kéo dữ liệu THÀNH CÔNG! Đã nạp thành công ${simulatedTasks.length} nhiệm vụ từ Google Sheets giả lập vào Bảng làm việc Kanban.`);
    }, 750);
  };

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setSyncMessage({ type, text });
  };

  // Option A (OAuth): Create MIS Sheet
  const handleCreateNewSheet = async () => {
    if (!config.accessToken) {
      showMsg('error', 'Chưa có quyền truy cập. Hãy click "Kết nối Google Account" trước.');
      return;
    }
    setIsSyncing(true);
    showMsg('info', 'Đang khởi tạo tệp bảng tính mới trên tài khoản Google Drive...');
    try {
      const sheetId = await createMISSpreadsheet(config.accessToken, `Giáo dục Đa Trí Tuệ MIS - ${new Date().toLocaleDateString('vi-VN')}`);
      handleSaveConfigField('spreadsheetId', sheetId);
      showMsg('success', `Đã tạo tệp Google Sheets thành công! ID Bảng tính: ${sheetId}`);
    } catch (err: any) {
      showMsg('error', err.message || 'Lỗi xảy ra khi khởi tạo bảng tính.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Option A (OAuth): PUSH
  const handlePushOAuth = async () => {
    if (!config.accessToken) {
      showMsg('error', 'Vui lòng "Kết nối Google Account" để có quyền đẩy dữ liệu.');
      return;
    }
    if (!config.spreadsheetId) {
      showMsg('error', 'Hãy nhập Spreadsheet ID hoặc bấm "Khởi tạo file mới" để tiếp tục.');
      return;
    }
    if (tasks.length === 0) {
      showMsg('info', 'Danh sách công việc đang rỗng, không có dữ liệu để đồng bộ.');
      return;
    }

    const confirmPush = window.confirm(`Bạn có chắc chắn muốn đẩy ${tasks.length} công việc hiện tại lên Google Sheets không? Dữ liệu cũ trong file sẽ bị ghi đè.`);
    if (!confirmPush) return;

    setIsSyncing(true);
    showMsg('info', 'Đang đồng bộ dữ liệu lên Google Sheets...');
    try {
      await pushTasksToGoogleSheets(config.spreadsheetId, tasks, config.accessToken);
      showMsg('success', `Đã xuất ${tasks.length} công việc lên Google Sheets đồng bộ thành công!`);
    } catch (err: any) {
      // Check if token expired
      if (err.message && (err.message.includes('401') || err.message.includes('expired'))) {
        clearSheetsToken();
        setConfig(prev => ({ ...prev, accessToken: '' }));
        showMsg('error', 'Phiên đăng nhập Google đã hết hạn. Hãy nhấp lại "Kết nối Google Account" để lấy mã mới.');
      } else {
        showMsg('error', err.message || 'Lỗi truyền tải Google API.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Option A (OAuth): PULL
  const handlePullOAuth = async () => {
    if (!config.accessToken) {
      showMsg('error', 'Vui lòng "Kết nối Google Account" để kéo dữ liệu.');
      return;
    }
    if (!config.spreadsheetId) {
      showMsg('error', 'Hãy nhập hoặc chỉ định ID bảng tính cần kéo.');
      return;
    }

    const confirmPull = window.confirm('Bạn có chắc chắn muốn kéo toàn bộ công việc từ Google Sheets về không? Dữ liệu hiện tại trong bộ nhớ của bạn sẽ bị thay thế hoàn toàn.');
    if (!confirmPull) return;

    setIsSyncing(true);
    showMsg('info', 'Đang đọc dữ liệu từ Google Sheets...');
    try {
      const importedTasks = await pullTasksFromGoogleSheets(config.spreadsheetId, config.accessToken);
      handleIncomingTasksReceived(importedTasks);
    } catch (err: any) {
      if (err.message && (err.message.includes('401') || err.message.includes('expired'))) {
        clearSheetsToken();
        setConfig(prev => ({ ...prev, accessToken: '' }));
        showMsg('error', 'Phiên đăng nhập đã hết hạn. Vui lòng kết nối tài khoản lại.');
      } else {
        showMsg('error', err.message || 'Kết nối không thành công. Hãy chắc chắn ID bảng tính chính xác và chế độ chia sẻ là công khai.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Initiate OAuth login redirection
  const handleOAuthLogin = () => {
    if (!config.clientId) {
      showMsg('error', 'Vui lòng điền OAuth 2.0 Client ID trước. Xem hướng dẫn phía dưới.');
      return;
    }
    const redirectUrl = window.location.origin + window.location.pathname;
    const authUrl = getOAuthUrl(config.clientId, redirectUrl);
    window.location.href = authUrl;
  };

  // Option B: Google Apps Script Web App sync
  const handleAppsScriptSync = async (action: 'PUSH' | 'PULL') => {
    if (!config.appsScriptUrl) {
      showMsg('error', 'Vui lòng dán "URL Ứng dụng Web" đã triển khai từ dự án Google Apps Script của bạn.');
      return;
    }

    if (action === 'PUSH') {
      if (tasks.length === 0) {
        showMsg('info', 'Không có công việc nào để hoàn tất đẩy.');
        return;
      }
      const confirmPush = window.confirm(`Bạn muốn cập nhật ${tasks.length} đầu việc lên Google Sheets thông qua Ứng dụng Web Apps Script?`);
      if (!confirmPush) return;
      
      setIsSyncing(true);
      showMsg('info', 'Đang thực hiện gửi gói dữ liệu học vụ qua Apps Script...');
      try {
        const res = await syncWithAppsScript(config.appsScriptUrl, tasks, 'PUSH');
        if (res.success) {
          showMsg('success', `Đã đồng bộ thành công ${res.count} công việc lên Google Sheets thông qua Web App!`);
        } else {
          showMsg('error', res.message || 'Lỗi từ Apps Script.');
        }
      } catch (err: any) {
        showMsg('error', `Lỗi kết nối Web App: ${err.message}. Hãy thiết đặt quyền truy cập "Anyone" lúc Deploy.`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      // PULL
      const confirmPull = window.confirm('Bạn muốn kéo và thay thế bảng công việc cục bộ bằng dữ liệu lưu trữ trên Google Sheets?');
      if (!confirmPull) return;

      setIsSyncing(true);
      showMsg('info', 'Đang tải dữ liệu từ Google Sheets về máy...');
      try {
        const res = await syncWithAppsScript(config.appsScriptUrl, [], 'PULL');
        if (res.success && res.tasks) {
          handleIncomingTasksReceived(res.tasks);
        } else {
          showMsg('error', res.message || 'Kéo dữ liệu bất thành.');
        }
      } catch (err: any) {
        showMsg('error', `Không thể lấy dữ liệu: ${err.message}. Kiểm tra lại URL.`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const copyAppsScriptToClipboard = () => {
    const dummySheetId = config.spreadsheetId || 'SPREADSHEET_ID_HERE';
    const code = GET_APPS_SCRIPT_CODE(dummySheetId);
    navigator.clipboard.writeText(code);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 3000);
  };

  // Option C: Manual Backup import/export CSV
  const handleGenerateCSV = () => {
    if (tasks.length === 0) {
      showMsg('info', 'Chưa có công việc để kết xuất.');
      return;
    }
    const headers = ['id', 'title', 'description', 'workspaceId', 'assignedName', 'priority', 'status', 'deadline', 'tag'];
    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.workspaceId,
      `"${t.assignedName}"`,
      t.priority,
      t.status,
      t.deadline,
      `"${t.tag}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    setCsvContent(csv);
    showMsg('success', 'Đã chuyển đổi cấu trúc CSV thành công! Bạn có thể sao chép văn bản bên dưới và dán vào Excel/Sheets.');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col md:flex-row">
      
      {/* Control Navigation on the left */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Chọn phương thức kết nối</h4>
        </div>

        <button
          onClick={() => { setActiveTab('APPS_SCRIPT'); setSyncMessage(null); }}
          className={`w-full p-3 rounded-xl text-left text-xs transition-all flex flex-col gap-1 cursor-pointer border ${
            activeTab === 'APPS_SCRIPT'
              ? 'bg-white border-green-500 text-green-700 shadow-sm'
              : 'border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          <span className="font-bold flex items-center gap-1">
            ⚡ Apps Script Web App
            <span className="px-1.5 py-0.2 bg-orange-100 text-orange-850 text-[8px] rounded font-mono font-bold uppercase shrink-0">Dễ nhất</span>
          </span>
          <span className="text-[10px] text-slate-450 leading-relaxed font-sans">
            Không cần tài khoản đám mây Google Cloud. Đẩy/Kéo trực tiếp qua Script kết nối tệp dán.
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('CSV'); setSyncMessage(null); }}
          className={`w-full p-3 rounded-xl text-left text-xs transition-all flex flex-col gap-1 cursor-pointer border ${
            activeTab === 'CSV'
              ? 'bg-white border-green-500 text-green-700 shadow-sm'
              : 'border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          <span className="font-bold text-slate-800">📋 Trích xuất CSV cục bộ</span>
          <span className="text-[10px] text-slate-450 leading-relaxed font-sans">
            Sao chép & Nhập bảng thủ công cực kỳ an toàn, tiện lợi để sử dụng tức thì ngoại tuyến.
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('AUTO_REPORT'); setSyncMessage(null); }}
          className={`w-full p-3 rounded-xl text-left text-xs transition-all flex flex-col gap-1 cursor-pointer border ${
            activeTab === 'AUTO_REPORT'
              ? 'bg-white border-green-500 text-green-700 shadow-sm'
              : 'border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          <span className="font-bold flex items-center gap-1 text-indigo-700">
            📬 Báo cáo tự động (5:00 PM)
            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-850 text-[8px] rounded font-mono font-bold uppercase shrink-0">Hẹn Giờ</span>
          </span>
          <span className="text-[10px] text-slate-450 leading-relaxed font-sans">
            Tự động gửi báo cáo học vụ chi tiết đến email ban lãnh đạo hàng ngày lúc 5h chiều (17:00).
          </span>
        </button>

        <div className="mt-auto hidden md:block pt-4 border-t border-slate-200">
          <div className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-800 leading-normal">
              <strong>Mẹo học vụ Đa Trí Tuệ:</strong> Khi đồng bộ, cấu trúc bảng tích hợp 15 trường định lượng tự động bao gồm cả lịch sử cập nhật.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form/Guide panel on the right */}
      <div className="flex-1 p-6 flex flex-col gap-5 min-w-0">
        
        {/* Status Notification */}
        {syncMessage && (
          <div className={`p-3.5 rounded-xl text-xs flex gap-3 border ${
            syncMessage.type === 'success' 
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' 
              : syncMessage.type === 'error'
              ? 'bg-rose-50/60 border-rose-200 text-rose-800'
              : 'bg-indigo-50/60 border-indigo-200 text-indigo-800'
          }`}>
            <div className="shrink-0 mt-0.5">
              {syncMessage.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />}
              {syncMessage.type === 'error' && <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />}
              {syncMessage.type === 'info' && <RefreshCw className="w-4.5 h-4.5 text-indigo-600 animate-spin" />}
            </div>
            <div>
              <p className="font-bold font-sans">Hệ thống phản hồi:</p>
              <p className="mt-0.5 leading-relaxed">{syncMessage.text}</p>
            </div>
          </div>
        )}

        {/* Conflict Resolution Card */}
        {showMergeOptions && (
          <div id="conflict-resolution-card" className="bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-300 rounded-2xl p-5 shadow-sm animate-fade-in flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider">
                  ⚠️ Phát hiện xung đột đồng bộ giữa máy và Google Sheets
                </h4>
                <p className="text-slate-600 text-xs mt-1 leading-normal">
                  Hệ thống phát hiện có các đầu công việc hoặc báo cáo học thuật thay đổi trùng mã số trên file Google Sheets so với dữ liệu trên hệ thống. Vui lòng chọn một phương án hòa giải xung đột để tiếp tục an toàn:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-1 font-sans">
              <button
                type="button"
                onClick={() => resolveConflictsAndApply('SMART')}
                className="bg-white hover:bg-indigo-50/20 border-2 border-indigo-500 hover:border-indigo-600 rounded-xl p-3.5 text-left transition-all flex flex-col gap-1.5 cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <span className="font-bold text-xs text-indigo-700 flex items-center gap-1.5">
                  🧠 Gộp thông minh (Smart Merge)
                </span>
                <span className="text-[10px] text-slate-500 leading-normal font-normal">
                  Chỉ đồng bộ các cập nhật/nhãn tiến bộ từ Sheets, tự động hòa trộn các mục thảo luận (comments) & nhật ký mà không ghi đè mất mát dữ liệu. <strong>(Khuyên dùng)</strong>
                </span>
              </button>

              <button
                type="button"
                onClick={() => resolveConflictsAndApply('OVERWRITE')}
                className="bg-white hover:bg-rose-50/20 border border-slate-200 hover:border-rose-400 rounded-xl p-3.5 text-left transition-all flex flex-col gap-1.5 cursor-pointer group hover:shadow-3xs"
              >
                <span className="font-bold text-xs text-rose-700 flex items-center gap-1.5">
                  📋 Ưu tiên Google Sheets
                </span>
                <span className="text-[10px] text-slate-500 leading-normal font-normal">
                  Đè toàn bộ dữ liệu từ Google Sheets xuống, hủy các ghi chép cục bộ đang có trên hệ thống đối với các việc trùng mã.
                </span>
              </button>

              <button
                type="button"
                onClick={() => resolveConflictsAndApply('KEEP_LOCAL')}
                className="bg-white hover:bg-emerald-50/20 border border-slate-200 hover:border-emerald-400 rounded-xl p-3.5 text-left transition-all flex flex-col gap-1.5 cursor-pointer group hover:shadow-3xs"
              >
                <span className="font-bold text-xs text-emerald-700 flex items-center gap-1.5">
                  🛡️ Giữ nguyên Hệ thống
                </span>
                <span className="text-[10px] text-slate-500 leading-normal font-normal">
                  Không ghi đè các việc đang chạy cục bộ, chỉ tải về và đồng bộ thêm các đầu việc mới hoàn toàn từ file Sheets.
                </span>
              </button>
            </div>

            <div className="flex justify-end gap-2 border-t border-amber-200 pt-3">
              <button
                type="button"
                onClick={() => { setShowMergeOptions(false); setPulledTasks([]); }}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                Hủy kéo dữ liệu
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: APPS SCRIPT WEB APP METHOD */}
        {activeTab === 'APPS_SCRIPT' && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                ⚡ ĐỒNG BỘ QUA GOOGLE APPS SCRIPT WEB APP
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Phương thức đơn giản, vận hành trơn tru nhất. Chỉ cần dán đoạn mã tự động được tối ưu sẵn dưới đây vào trang riêng, khởi tạo Web App là bạn hoàn toàn có thể đẩy / kéo bảng học vụ tức thì sau 30 giây!
              </p>
            </div>

            <div className="grid grid-cols-1 select-none md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">BƯỚC 1: Cấu hình bảng tính của bạn</span>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700">Dán URL Ứng dụng Web (Apps Script Web App URL)</label>
                  <input
                    type="text"
                    value={config.appsScriptUrl}
                    onChange={(e) => handleSaveConfigField('appsScriptUrl', e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="bg-white border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 w-full placeholder-slate-400 font-mono"
                  />
                  <p className="text-[9px] text-slate-450 mt-1">
                    ⚠️ Quan trọng: Khi triển khai "Trình xuất bản", lập tùy chọn ở mục "Ai có quyền" là <strong>"Bất kỳ ai" (Anyone)</strong> để hệ thống có thể kết nối từ xa.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/20 border border-green-150/50 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-green-800 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-green-600" />
                    BƯỚC 2: Đồng bộ hóa hai chiều
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-normal mt-1.5">
                    Hợp thức hóa cơ sở dữ liệu trên Google Sheets của bạn. Chọn hành động đẩy từ cục bộ (đồng nhất dữ liệu) hoặc kéo từ Cloud về thay thế.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAppsScriptSync('PUSH')}
                    disabled={isSyncing}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Đẩy lên Sheet (Push)
                  </button>
                  <button
                    onClick={() => handleAppsScriptSync('PULL')}
                    disabled={isSyncing}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Kéo về máy (Pull)
                  </button>
                </div>
              </div>
            </div>

            {/* Instruction for getting code */}
            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-350 transition-colors">
              <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                  <FileCode className="w-4 h-4 text-slate-600" />
                  MÃ NGUỒN CÀI ĐẶT APPS SCRIPT CHO GOOGLE SHEETS
                </span>
                <button
                  onClick={copyAppsScriptToClipboard}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {hasCopiedCode ? 'Đã sao chép!' : 'Chép mã nguồn'}
                </button>
              </div>
              <div className="p-4 bg-slate-950 font-mono text-[9px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed whitespace-pre font-semibold">
                {GET_APPS_SCRIPT_CODE(config.spreadsheetId || 'SPREADSHEET_ID_HERE')}
              </div>
            </div>

            <div className="text-[10px] text-slate-450 leading-relaxed bg-amber-50/50 border border-amber-100 p-3 rounded-lg flex gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-850">Lợi thế đặc biệt:</p>
                <p className="mt-0.5">Không dính hộp thoại đỏ cảnh cáo ứng dụng không xác minh (Unverified app window) của Google, dữ liệu của bạn chạy khép kín an toàn tuyệt đối ngay trên server phụ trợ cá nhân.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: CSV TRÍCH XUẤT THỦ CÔNG */}
        {activeTab === 'CSV' && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                📋 XUẤT/NHẬP DỮ LIỆU DẠNG CSV QUY CHUẨN
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Phương án dự phòng hoàn hảo. Xuất tức thì bảng cấu trúc chứa tất cả thông tin nhiệm vụ của trường sang file văn bản CSV. Bạn có thể sao chép trực tiếp rồi dán vào Microsoft Excel hoặc Google Sheets một cách nhanh dứt điểm.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateCSV}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Tạo dữ liệu CSV (Export)
                </button>
              </div>

              <div className={`border p-4 rounded-xl flex items-center gap-3.5 shadow-5xs transition-all ${
                isAutoReportActive 
                  ? 'bg-emerald-50/50 border-emerald-150 text-emerald-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-650'
              }`}>
                <div className={`p-2.5 rounded-lg ${
                  isAutoReportActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Activity className={`w-5 h-5 ${isAutoReportActive ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Trạng thái túc trực</span>
                  <span className="font-bold text-xs block">
                    {isAutoReportActive ? '⏰ ĐANG CHẠY BÁO CÁO' : '🔕 CHƯA KÍCH HOẠT'}
                  </span>
                  <span className="text-[9px] text-slate-450 block font-sans">
                    Hỗ trợ: Ngày ({dailySendTime}) | Tuần ({weeklySendTime}) | Tháng ({monthlySendTime})
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3.5 shadow-5xs">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Ghi nhận gửi gần đây</span>
                  <span className="text-[10.5px] font-bold text-slate-600 block leading-tight">
                    Ngày: {lastSentDailyDate ? lastSentDailyDate : 'Chưa'}
                  </span>
                  <span className="text-[10.5px] font-bold text-slate-600 block leading-tight">
                    Tuần: {lastSentWeeklyDate ? lastSentWeeklyDate : 'Chưa'} | Tháng: {lastSentMonthlyDate ? lastSentMonthlyDate : 'Chưa'}
                  </span>
                </div>
              </div>

              {/* AUTOMATIC DEVICE DETECTION MONITOR CARD */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3.5 shadow-5xs">
                <div className={`p-2.5 rounded-lg ${
                  deviceInfo.type === 'DESKTOP' ? 'bg-purple-50 text-purple-600' : deviceInfo.type === 'TABLET' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {deviceInfo.type === 'DESKTOP' && <Laptop className="w-5 h-5" />}
                  {deviceInfo.type === 'TABLET' && <Tablet className="w-5 h-5" />}
                  {deviceInfo.type === 'MOBILE' && <Smartphone className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Cơ chế phát duyệt</span>
                  <span className="text-xs font-black text-slate-800 uppercase block">
                    {deviceInfo.type === 'DESKTOP' ? '💻 Máy tính sư phạm' : '📱 Trình duyệt di động'}
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate max-w-[160px]" title={deviceInfo.details}>
                    {deviceInfo.os} • {deviceInfo.browser}
                  </span>
                </div>
              </div>
            </div>

            {/* Config Form Cards */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
              <span className="text-xs font-black text-slate-800 tracking-wider uppercase block">
                ⚙️ THIẾT LẬP PHÂN LỊCH BÁO CÁO CHO BAN LÃNH ĐẠO (3 CẤP HỌC HIỆU)
              </span>

              <div className="flex flex-col gap-3">
                <label htmlFor="recipient-emails-full-input" className="text-[11px] font-bold text-slate-500 block">
                  Danh sách Email nhận báo cáo (Ngăn cách bằng dấu phẩy)
                </label>
                <input
                  id="recipient-emails-full-input"
                  type="text"
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  placeholder="duonghinhi225@gmail.com, principal@misvn.edu.vn"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500 text-slate-750"
                />
              </div>

              {/* THREE INDIVIDUAL REPORT TIERS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                {/* 1. Daily Report Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">1. Báo cáo Thường Nhật</span>
                      <input
                        type="checkbox"
                        checked={isDailyActive}
                        onChange={(e) => setIsDailyActive(e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                        title="Kích hoạt báo cáo ngày"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Tổng hợp chi tiết tiến trình công việc trong ngày gửi cán bộ tổ học vụ.
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Giờ gửi:</span>
                    <input
                      type="text"
                      value={dailySendTime}
                      onChange={(e) => setDailySendTime(e.target.value)}
                      placeholder="17:00"
                      className="w-16 text-center text-xs font-mono font-bold bg-slate-50 border rounded p-1"
                      title="Thời gian gửi báo cáo thường nhật"
                    />
                  </div>
                </div>

                {/* 2. Weekly Report Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">2. Tổng kết cả tuần</span>
                      <input
                        type="checkbox"
                        checked={isWeeklyActive}
                        onChange={(e) => setIsWeeklyActive(e.target.checked)}
                        className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
                        title="Kích hoạt báo cáo tuần"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Bản đối soát dữ liệu toàn diện 9 phòng ban tự động vào 5h chiều thứ Sáu.
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Giờ gửi (Fridays):</span>
                    <input
                      type="text"
                      value={weeklySendTime}
                      onChange={(e) => setWeeklySendTime(e.target.value)}
                      placeholder="17:00"
                      className="w-16 text-center text-xs font-mono font-bold bg-slate-50 border rounded p-1"
                      title="Thời gian gửi báo cáo tuần"
                    />
                  </div>
                </div>

                {/* 3. Monthly Report Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">3. Báo cáo vĩ mô tháng</span>
                      <input
                        type="checkbox"
                        checked={isMonthlyActive}
                        onChange={(e) => setIsMonthlyActive(e.target.checked)}
                        className="w-3.5 h-3.5 text-sky-600 focus:ring-sky-500"
                        title="Kích hoạt báo cáo tháng"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Phát biểu chỉ số chiến lược vĩ mô gửi Chủ tịch lúc 7h sáng ngày cuối tháng.
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Giờ gửi (Cuối tháng):</span>
                    <input
                      type="text"
                      value={monthlySendTime}
                      onChange={(e) => setMonthlySendTime(e.target.value)}
                      placeholder="07:00"
                      className="w-16 text-center text-xs font-mono font-bold bg-slate-50 border rounded p-1"
                      title="Thời gian gửi báo cáo tháng"
                    />
                  </div>
                </div>
              </div>

              {/* OVERALL AUTO DISPATCHER TOGGLE */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-slate-200 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    Bật cơ chế túc trực học đường (Dispatcher Service)
                  </span>
                  <span className="text-[10px] text-slate-450 leading-relaxed font-sans block max-w-[450px]">
                    Hệ thống sẽ liên tục tự động phân luồng, nhận diện thời khắc để xuất bản hỏa tốc 3 cấp báo cáo này khi bạn mở tab ứng dụng này trên trình duyệt.
                  </span>
                </div>
                <button
                  id="toggle-browser-schedule"
                  onClick={() => setIsAutoReportActive(!isAutoReportActive)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-all ${
                    isAutoReportActive 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {isAutoReportActive ? '📡 TRẠM ĐANG TÚC TRỰC' : '🔌 BẬT TỰ ĐỘNG GỬI'}
                </button>
              </div>
            </div>

            {/* Quick Actions & Sandboxed Preview Buttons */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-slate-850 tracking-wider uppercase block">
                🚀 CHUYỂN PHÁT HỎA TỐC & KIỂM THỬ THỜI GIAN THỰC (FORCED TEST SENDS)
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  id="test-send-daily"
                  onClick={() => triggerEmailReport('DAILY')}
                  disabled={isSyncing}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  Gửi thử Báo cáo Ngày (17:00)
                </button>

                <button
                  id="test-send-weekly"
                  onClick={() => triggerEmailReport('WEEKLY')}
                  disabled={isSyncing}
                  className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  Gửi thử Báo cáo Tuần (Thứ 6)
                </button>

                <button
                  id="test-send-monthly"
                  onClick={() => triggerEmailReport('MONTHLY')}
                  disabled={isSyncing}
                  className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  Gửi thử Báo cáo Tháng (7:00 Sáng)
                </button>

                <button
                  id="preview-report-html"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-3.5 py-2.5 border border-slate-350 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ml-auto"
                >
                  <Eye className="w-4 h-4" />
                  XEM BẢN VẼ PHÁT THẢO (LIVE PREVIEW)
                </button>
              </div>
            </div>

            {/* Terminal logger for developers */}
            {reportLog.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-[9px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    BẢNG TIẾN TRÌNH KẾT XUẤT THỜI GIAN THỰC (AUTO-REPORT LOGGER)
                  </span>
                  <span className="px-1.5 py-0.2 bg-indigo-900/40 text-indigo-400 border border-indigo-900/50 text-[7.5px] font-mono rounded font-bold uppercase">
                    Live
                  </span>
                </div>
                <div className="font-mono text-[9.5px] text-indigo-100 leading-6 space-y-1 overflow-y-auto max-h-44">
                  {reportLog.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Time-Based Trigger Apps Script Instruction Panel - Absolute Cloud Offline support */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
              <div>
                <span className="text-xs font-black text-slate-900 tracking-wider uppercase block">
                  🛡️ GIẢI PHÁP TỰ ĐỘNG TRÊN ĐÁM MÂY GOOGLE (SERVER-SIDE BACKGROUND RUNNER)
                </span>
                <p className="text-slate-550 text-xs mt-1 leading-normal font-sans">
                  Để báo cáo giáo dục được tự động biên dịch và chuyển phát trực tiếp từ máy chủ Google đến lãnh đạo lúc 17:00 chiều <strong>hàng ngày ngay cả khi bạn đã tắt máy tính</strong>, hãy cài đặt trình lên lịch đám mây (Time-Driven Trigger) theo 3 bước siêu tốc sau:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center rounded-md shrink-0">1</div>
                  <p className="text-slate-650 text-xs leading-normal">
                    Truy cập vào <strong>Google Apps Script Editor</strong> của bạn (trong tệp Google Sheet đã dán đoạn mã Apps Script tại danh mục "Apps Script Web App" ở tab cạnh bên).
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center rounded-md shrink-0">2</div>
                  <p className="text-slate-650 text-xs leading-normal">
                    Tìm kiếm hàm có nhãn <code>setupDailyReportTrigger</code> ở cuối danh sách mã nguồn. Chọn nút <strong>Chạy (Run)</strong> tại thanh menu phía trên để khởi tạo cài đặt kích hoạt. Lúc này, máy chủ Google độc lập sẽ túc trực làm việc hàng ngày.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center rounded-md shrink-0">3</div>
                  <p className="text-slate-650 text-xs leading-normal font-sans">
                    Để kiểm thử cấu hình hoặc thay đổi hòm thư của lãnh đạo ngay trên đám mây, hãy sửa biến <code>emailRecipients</code> trong dòng thứ <code>452</code> tại Apps Script và lưu lại.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg leading-relaxed text-[10.5px] text-indigo-900 flex gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Lợi ích vượt trội:</strong> Trình kích hoạt này chạy trực tiếp bằng tài khoản Google Drive cá nhân của bạn, hoàn toàn miễn phí, không tiêu tốn băng thông và giữ cho báo cáo đúng thời hạn tuyệt đối.
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Visual Email Design Preview dialog box */}
      {isPreviewOpen && (
        <div id="email-preview-modal-overlay" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in-50 zoom-in-95 duration-155">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <Mail className="w-4.5 h-4.5 text-indigo-600" />
                <span className="font-display font-black text-slate-850 text-xs uppercase tracking-wider">
                  Mẫu thư điện tử doanh nghiệp
                </span>
                
                {/* PREVIEW SELECTION TABS */}
                <div className="flex items-center bg-slate-200 p-0.5 rounded-lg gap-0.5 text-[10px]">
                  <button
                    id="preview-tab-daily"
                    onClick={() => setPreviewType('DAILY')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                      previewType === 'DAILY' ? 'bg-white text-emerald-700 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Báo cáo ngày
                  </button>
                  <button
                    id="preview-tab-weekly"
                    onClick={() => setPreviewType('WEEKLY')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                      previewType === 'WEEKLY' ? 'bg-white text-indigo-700 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Tuần (Thứ 6)
                  </button>
                  <button
                    id="preview-tab-monthly"
                    onClick={() => setPreviewType('MONTHLY')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                      previewType === 'MONTHLY' ? 'bg-white text-sky-700 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Tháng (Cuối tháng)
                  </button>
                </div>
              </div>
              <button
                id="close-email-preview-btn"
                onClick={() => setIsPreviewOpen(false)}
                className="w-7 h-7 bg-slate-200/75 hover:bg-slate-300 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
              <div 
                className="w-full max-w-[650px] bg-white rounded-xl shadow-xs overflow-hidden text-left"
                dangerouslySetInnerHTML={{ __html: getHtmlBodyByType(previewType, new Date().toLocaleDateString('vi-VN')) }} 
              />
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 px-6 font-mono">
              <span>Định dạng: HTML5 / Inline CSS Responsive</span>
              <span>Dự phòng: UTF-8 MailApp Standard</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
