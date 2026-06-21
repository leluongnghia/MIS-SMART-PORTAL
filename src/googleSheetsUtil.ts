import { serverStorage } from './libs/client/server-storage';
import { Task, TaskPriority, TaskStatus } from './types';

// Caching structure in server storage
const KEYS = {
  CLIENT_ID: 'google_sheets_client_id',
  SPREADSHEET_ID: 'google_sheets_spreadsheet_id',
  APPS_SCRIPT_URL: 'google_sheets_apps_script_url',
  ACCESS_TOKEN: 'google_sheets_access_token',
};

export interface SheetsConfig {
  clientId: string;
  spreadsheetId: string;
  appsScriptUrl: string;
  accessToken: string;
}

export const loadSheetsConfig = (): SheetsConfig => {
  return {
    clientId: serverStorage.getItem(KEYS.CLIENT_ID) || '',
    spreadsheetId: serverStorage.getItem(KEYS.SPREADSHEET_ID) || '',
    appsScriptUrl: serverStorage.getItem(KEYS.APPS_SCRIPT_URL) || '',
    accessToken: serverStorage.getItem(KEYS.ACCESS_TOKEN) || '',
  };
};

export const saveSheetsConfig = (config: Partial<SheetsConfig>) => {
  if (config.clientId !== undefined) serverStorage.setItem(KEYS.CLIENT_ID, config.clientId);
  if (config.spreadsheetId !== undefined) serverStorage.setItem(KEYS.SPREADSHEET_ID, config.spreadsheetId);
  if (config.appsScriptUrl !== undefined) serverStorage.setItem(KEYS.APPS_SCRIPT_URL, config.appsScriptUrl);
  if (config.accessToken !== undefined) serverStorage.setItem(KEYS.ACCESS_TOKEN, config.accessToken);
};

export const clearSheetsToken = () => {
  serverStorage.removeItem(KEYS.ACCESS_TOKEN);
};

/**
 * Creates an implicit OAuth authorization URL and handles redirects / popups
 */
export const getOAuthUrl = (clientId: string, redirectUri: string): string => {
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ];
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('scope', scopes.join(' '));
  url.searchParams.set('prompt', 'consent');
  return url.toString();
};

/**
 * Creates a pre-formatted target Spreadsheet for Hệ thống Giáo dục Đa Trí Tuệ MIS
 */
export const createMISSpreadsheet = async (accessToken: string, title = 'Giáo dục Đa Trí Tuệ MIS - Bảng điều hành công việc'): Promise<string> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: 'Danh sách công việc',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Không thể khởi tạo bảng tính Google Sheets mới.');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;

  // Initialize sheet headers and styles
  const headers = [
    'Mã công việc (ID)',
    'Tiêu đề công việc',
    'Mô tả chi tiết',
    'Phòng ban/Tổ chuyên môn',
    'ID người thực hiện',
    'Họ tên người nhận',
    'Vị trí/Chức vụ',
    'Mức độ ưu tiên',
    'Trạng thái hiện tại',
    'Hạn chót hoàn thành',
    'Nhãn phân loại (Tag)',
    'Người chỉ đạo (CreatedBy)',
    'Minh chứng hoàn thành',
    'Bình luận thảo luận (JSON)',
    'Lịch sử thay đổi (JSON)'
  ];

  await writeSheetValues(spreadsheetId, 'Danh sách công việc!A1:O1', [headers], accessToken);

  return spreadsheetId;
};

/**
 * Helper to write ranges of cell values to Sheets
 */
const writeSheetValues = async (spreadsheetId: string, range: string, values: any[][], accessToken: string) => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Không thể lưu dữ liệu vào Google Sheets.');
  }
};

/**
 * Push local tasks array into Google Sheets
 */
export const pushTasksToGoogleSheets = async (spreadsheetId: string, tasks: Task[], accessToken: string) => {
  // Clear existing values by overwriting or writing rows.
  // To avoid leaving stale rows, let's fetch any existing row count first or write a clean matrix.
  const rows = tasks.map(t => [
    t.id,
    t.title,
    t.description,
    t.workspaceId,
    t.assignedId,
    t.assignedName,
    t.assignedRole,
    t.priority,
    t.status,
    t.deadline,
    t.tag,
    t.createdBy,
    t.reportEvidence || '',
    JSON.stringify(t.comments || []),
    JSON.stringify(t.history || []),
  ]);

  // Read metadata to count existing rows, or append cleanly.
  // We can write to 'Danh sách công việc!A2:O2000' directly to support up to 2000 tasks.
  // Before pushing new data, we clear old data to avoid leftovers if row count decreased.
  await clearSheetRange(spreadsheetId, 'Danh sách công việc!A2:O2000', accessToken);
  if (rows.length > 0) {
    await writeSheetValues(spreadsheetId, 'Danh sách công việc!A2:O' + (rows.length + 1), rows, accessToken);
  }
};

/**
 * Clear range of cells helper
 */
const clearSheetRange = async (spreadsheetId: string, range: string, accessToken: string) => {
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

/**
 * Pull tasks from Google Sheets
 */
export const pullTasksFromGoogleSheets = async (spreadsheetId: string, accessToken: string): Promise<Task[]> => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Danh_sách_công_việc!A2:O2000`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Attempt standard Vietnamese fallback file mapping name if tab title varies
  let resData;
  if (!response.ok) {
    // Try Sheet1 fallback
    const fbRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:O2000`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!fbRes.ok) {
      // Fetch metadata first sheet if both failed
      const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!metaResponse.ok) {
        throw new Error('Không thể đọc dữ liệu hoặc cấu trúc của File Google Sheets này. Vui lòng kiểm tra quyền chia sẻ.');
      }
      const metadata = await metaResponse.json();
      const firstSheetTitle = metadata.sheets?.[0]?.properties?.title || 'Sheet1';
      const lastRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A2:O2000`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!lastRes.ok) {
        throw new Error('Không thể tìm thấy hoặc đọc bảng tính hợp lệ trong tệp Google Sheets.');
      }
      resData = await lastRes.json();
    } else {
      resData = await fbRes.json();
    }
  } else {
    resData = await response.json();
  }

  const values = resData.values as any[][];
  if (!values || values.length === 0) {
    return [];
  }

  const tasksStr: Task[] = values.map((row, index) => {
    let comments = [];
    let history = [];
    try {
      comments = row[13] ? JSON.parse(row[13]) : [];
    } catch (e) {
      comments = [];
    }
    try {
      history = row[14] ? JSON.parse(row[14]) : [];
    } catch (e) {
      history = [];
    }

    return {
      id: row[0] || `task_imported_${index}_${Date.now()}`,
      title: row[1] || 'Công việc không tên',
      description: row[2] || '',
      workspaceId: row[3] || 'BGH',
      assignedId: row[4] || '',
      assignedName: row[5] || 'Chưa giao',
      assignedRole: row[6] || '',
      priority: (row[7] || 'TRUNG_BINH') as TaskPriority,
      status: (row[8] || 'CHUA_BAT_DA') as TaskStatus,
      deadline: row[9] || '2026-06-15',
      tag: row[10] || 'Chuyên môn',
      createdBy: row[11] || 'Hệ thống',
      reportEvidence: row[12] || undefined,
      comments,
      history,
    };
  });

  return tasksStr;
};

/**
 * Option B: Synchronization using a Google Apps Script Web App
 * This enables 1-click sync without registering custom client IDs!
 * We provide the template script here so the user can easily paste it.
 */
export const GET_APPS_SCRIPT_CODE = (sheetUrl: string) => `/**
 * Google Apps Script Proxy for MIS EduTask
 * Hướng dẫn:
 * 1. Mở Google Sheet của bạn.
 * 2. Chọn Tiện ích mở rộng > Trình duyệt dự án Apps Script.
 * 3. Xóa tất cả mã hiện tại và dán đoạn mã này vào.
 * 4. Nhấp vào "Triển khai" > "Triển khai mới".
 * 5. Chọn loại triển khai: "Ứng dụng web".
 * 6. "Cấu hình ứng dụng":
 *      - Thực thi dưới danh nghĩa: "Tôi" (quyền truy cập của bạn)
 *      - Ai có quyền truy cập: "Bất kỳ ai" (Anyone - để Web App phản hồi an toàn)
 * 7. Nhấp vào "Triển khai" và Sao chép URL ứng dụng Web nhận được dán vào phần cài đặt.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", tasks: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var tasks = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var comments = [];
    var history = [];
    try { comments = row[13] ? JSON.parse(row[13]) : []; } catch (err) {}
    try { history = row[14] ? JSON.parse(row[14]) : []; } catch (err) {}
    
    tasks.push({
      id: String(row[0] || ""),
      title: String(row[1] || ""),
      description: String(row[2] || ""),
      workspaceId: String(row[3] || "BGH"),
      assignedId: String(row[4] || ""),
      assignedName: String(row[5] || ""),
      assignedRole: String(row[6] || ""),
      priority: String(row[7] || "TRUNG_BINH"),
      status: String(row[8] || "CHUA_BAT_DA"),
      deadline: String(row[9] || ""),
      tag: String(row[10] || ""),
      createdBy: String(row[11] || ""),
      reportEvidence: String(row[12] || ""),
      comments: comments,
      history: history
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", tasks: tasks }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    
    // Xử lý gửi Báo cáo học vụ trực tiếp tới Email Lãnh đạo
    if (payload.action === "SEND_EMAIL") {
      var recipientList = payload.emails;
      var subject = payload.subject;
      var htmlBody = payload.htmlBody;
      
      MailApp.sendEmail({
        to: recipientList,
        subject: subject,
        htmlBody: htmlBody
      });
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Đã gửi Email báo cáo thành công tới: " + recipientList 
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    // Xử lý đồng bộ dữ liệu Kanban mặc định
    var tasks = payload.tasks;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    sheet.clear();
    
    // Write headers
    var headers = [
      'Mã công việc (ID)', 'Tiêu đề công việc', 'Mô tả chi tiết', 'Phòng ban/Tổ chuyên môn',
      'ID người thực hiện', 'Họ tên người nhận', 'Vị trí/Chức vụ', 'Mức độ ưu tiên',
      'Trạng thái hiện tại', 'Hạn chót hoàn thành', 'Nhãn phân loại (Tag)', 'Người chỉ đạo (CreatedBy)',
      'Minh chứng hoàn thành', 'Bình luận thảo luận (JSON)', 'Lịch sử thay đổi (JSON)'
    ];
    sheet.appendRow(headers);
    
    if (tasks && tasks.length > 0) {
      var rows = [];
      for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        rows.push([
          t.id || "",
          t.title || "",
          t.description || "",
          t.workspaceId || "BGH",
          t.assignedId || "",
          t.assignedName || "",
          t.assignedRole || "",
          t.priority || "TRUNG_BINH",
          t.status || "CHUA_BAT_DA",
          t.deadline || "",
          t.tag || "",
          t.createdBy || "",
          t.reportEvidence || "",
          JSON.stringify(t.comments || []),
          JSON.stringify(t.history || [])
        ]);
      }
      
      // Bulk write
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: tasks.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * THIẾT LẬP TRIGGER TỰ ĐỘNG GỬI BÁO CÁO HÀNG NGÀY LÚC 17:00 (5 Giờ Chiều)
 * Hướng dẫn: Bạn có thể chạy hàm này một lần duy nhất trong Apps Script editor để kích hoạt.
 */
function setupDailyReportTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "autoSendDailyReportEmail") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("autoSendDailyReportEmail")
    .timeBased()
    .everyDay()
    .atHour(17)
    .nearMinute(0)
    .create();
}

/**
 * Hàm tự động được kích hoạt lúc 17:00 hàng ngày để gửi báo cáo từ Google Sheets đám mây
 */
function autoSendDailyReportEmail() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  var totalTasks = data.length - 1;
  var completedTasks = 0;
  var pendingTasks = 0;
  var inProgressTasks = 0;
  var highPriorityTasks = 0;
  var taskHighlights = "";
  
  for (var i = 1; i < data.length; i++) {
    var status = String(data[i][8] || "");
    var priority = String(data[i][7] || "");
    var title = String(data[i][1] || "");
    var assignedName = String(data[i][5] || "Chưa giao");
    var workspace = String(data[i][3] || "");
    
    if (status === "HOAN_THANH") completedTasks++;
    else if (status === "CHO_DUYET") pendingTasks++;
    else if (status === "DANG_TIEN_HANH") inProgressTasks++;
    
    if (priority === "CAO") highPriorityTasks++;
    
    // Ghi nhận các việc trọng tâm/hoàn tất trong ngày
    if (status === "HOAN_THANH" || status === "CHO_DUYET") {
      taskHighlights += "<li><b>[" + workspace + "]</b> " + title + " (Người nhận: " + assignedName + ") - <i>Trạng thái: " + status + "</i></li>";
    }
  }
  
  var percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Danh sách email nhận báo cáo của ban lãnh đạo (Thay thế bằng các email thật)
  var emailRecipients = "principal@misvn.edu.vn, board@misvn.edu.vn, duonghinhi22@gmail.com";
  
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
  
  var htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>" +
    "<div style='background-color: #4f46e5; padding: 25px; text-align: center; color: white;'>" +
      "<h2 style='margin: 0; text-transform: uppercase; font-size: 18px; tracking: 1.5px;'>Trường Phổ Thông Liên Cấp Đa Trí Tuệ (MIS)</h2>" +
      "<p style='margin: 5px 0 0; font-size: 12px; opacity: 0.9;'>Báo cáo tiến độ giáo dục và học vụ hằng ngày (Tự động 17:00)</p>" +
    "</div>" +
    "<div style='padding: 24px; bg: #ffffff;'>" +
      "<p style='margin-top: 0;'>Kính gửi <b>Ban lãnh đạo Trường Đa Trí Tuệ (MIS)</b>,</p>" +
      "<p>Hệ thống tự động đồng bộ kết quả nhà trường và tổng hợp tiến trình thực hiện chỉ đạo chuyên môn tính đến <b>17 giờ, ngày " + dateStr + "</b>:</p>" +
      
      "<div style='display: flex; gap: 10px; margin: 20px 0; text-align: center; justify-content: space-around; background-color: #f8fafc; padding: 15px; border-radius: 8px;'>" +
        "<div><span style='display: block; font-size: 20px; font-weight: bold; color: #4f46e5;'>" + totalTasks + "</span><span style='font-size: 10px; color: #64748b;'>Tổng đầu việc</span></div>" +
        "<div><span style='display: block; font-size: 20px; font-weight: bold; color: #16a34a;'>" + completedTasks + "</span><span style='font-size: 10px; color: #64748b;'>Hoàn thành</span></div>" +
        "<div><span style='display: block; font-size: 20px; font-weight: bold; color: #2563eb;'>" + pendingTasks + "</span><span style='font-size: 10px; color: #64748b;'>Chờ phê duyệt</span></div>" +
        "<div><span style='display: block; font-size: 20px; font-weight: bold; color: #ca8a04;'>" + inProgressTasks + "</span><span style='font-size: 10px; color: #64748b;'>Đang làm</span></div>" +
      "</div>" +
      
      "<ul>" +
        "<li><b>Tỉ lệ hoàn tất nhà trường đạt:</b> <span style='color: #16a34a; font-weight: bold;'>" + percent + "%</span></li>" +
        "<li><b>Số lượng công việc khẩn, mức độ ưu tiên cao:</b> <span style='color: #dc2626; font-weight: bold;'>" + highPriorityTasks + " việc</span></li>" +
      "</ul>" +
      
      "<h3 style='border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 14px; text-transform: uppercase;'>Nhiệm vụ trọng điểm thực hiện trong ngày:</h3>" +
      (taskHighlights ? "<ul style='padding-left: 20px;'>" + taskHighlights + "</ul>" : "<p style='font-style: italic; color: #64748b;'>Không có đầu việc mới hoàn thành hay chờ duyệt phát sinh trong ngày.</p>") +
      
      "<div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;'>" +
        "Báo cáo được khởi tạo tự động từ <a href='" + ss.getUrl() + "' target='_blank' style='color: #4f46e5; text-decoration: none; font-weight: bold;'>Bảng điều hành Google Sheets MIS</a>.<br/>" +
        "Tôn trọng sự khác biệt - Mọi học sinh đều có tài năng." +
      "</div>" +
    "</div>" +
  "</div>";
  
  MailApp.sendEmail({
    to: emailRecipients,
    subject: "Giáo dục Đa Trí Tuệ MIS - Báo cáo Kết quả Học vụ ngày " + dateStr + " (Hàng ngày 17:00)",
    htmlBody: htmlBody
  });
}
`;

/**
 * Synchronize using Option B (Google Apps Script Web App)
 */
export const syncWithAppsScript = async (url: string, tasksToPush: Task[], action: 'PUSH' | 'PULL'): Promise<{ success: boolean; tasks?: Task[]; count?: number; message?: string }> => {
  if (action === 'PUSH') {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain', // Use text/plain to avoid preflight CORS request which Apps Script block
      },
      body: JSON.stringify({ tasks: tasksToPush }),
    });

    if (!response.ok) {
      throw new Error(`Apps Script trả về mã lỗi: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true, count: data.count };
    } else {
      return { success: false, message: data.message };
    }
  } else {
    // PULL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Apps Script trả về mã lỗi: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true, tasks: data.tasks };
    } else {
      return { success: false, message: data.message };
    }
  }
};

/**
 * Gửi báo cáo chi tiết về email lãnh đạo qua proxy Apps Script
 */
export const sendReportEmailViaAppsScript = async (
  url: string,
  emails: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      action: 'SEND_EMAIL',
      emails,
      subject,
      htmlBody,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apps Script trả về mã lỗi: ${response.status}`);
  }

  const data = await response.json();
  if (data.status === 'success') {
    return { success: true, message: data.message };
  } else {
    return { success: false, message: data.message || 'Gửi báo cáo thất bại qua Apps Script.' };
  }
};
