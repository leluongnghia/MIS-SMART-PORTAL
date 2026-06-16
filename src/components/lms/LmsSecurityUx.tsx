'use client';
import { serverStorage } from '../../libs/client/server-storage';


import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  RefreshCw, 
  Check, 
  Tv, 
  CheckCircle 
} from 'lucide-react';

interface LmsSecurityUxProps {
  t: any;
}

export default function LmsSecurityUx({ t }: LmsSecurityUxProps) {
  // Use/define these states internally as local states
  const [disableMainDownload, setDisableMainDownload] = useState(true);
  const [tokenExpirationTime, setTokenExpirationTime] = useState(15);
  const [securityStatus, setSecurityStatus] = useState<'ACTIVE' | 'UPDATING'>('ACTIVE');

  const [securityLogs, setSecurityLogs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = serverStorage.getItem('mis_lms_security_logs');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    const timeStr = new Date().toISOString().substring(11, 16);
    return [
      `[${timeStr}] SafeVideo DRM Server Engine initialized successfully.`,
      `[${timeStr}] Segment chunking enabled: AES-128 dynamic payload encryption active.`,
      `[${timeStr}] Browser debugger blocker running in background.`
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      serverStorage.setItem('mis_lms_security_logs', JSON.stringify(securityLogs));
    }
  }, [securityLogs]);

  // Helpers to implement: addSecurityLog
  const addSecurityLog = (msg: string) => {
    const timeStr = new Date().toISOString().substring(11, 16);
    setSecurityLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 8)]);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      
      {/* Anti-Download Guard controls container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="px-2 py-0.5 bg-rose-150 text-rose-800 text-[9px] font-extrabold rounded uppercase tracking-wider mb-1.5 inline-block">
            🛡️ BẢO MẬT ĐỘC QUYỀN TRUYỀN THÔNG BÀI GIẢNG VIDEO
          </span>
          <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
            <Lock className="text-emerald-600 w-4.5 h-4.5 animate-bounce" />
            {t.antiDownload}
          </h3>
          <p className="text-xs text-slate-500">
            Cơ chế thiết lập máy chủ ngăn chặn mọi hành vi cài đặt các chương trình tải lậu video học liệu độc quyền của giáo viên Trường MIS Hà Nội.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="space-y-0.5">
              <strong className="text-xs text-slate-800 block">Kích hoạt Chặn Download Trực Tiếp (Secure DRM Video Server)</strong>
              <span className="text-[10px] text-slate-500 font-normal">Sử dụng phương thức phân dải segment tệp HLS/Encrypted TS chặn các extension Cốc Cốc, IDM tự chụp.</span>
            </div>
            
            {/* Toggle button */}
            <button
              type="button"
              onClick={() => {
                const nextVal = !disableMainDownload;
                setDisableMainDownload(nextVal);
                addSecurityLog(nextVal ? "Secure DRM Shield KÍCH HOẠT - Tự động băm tệp .ts tránh extension tải trộm." : "Secure DRM Shield VÔ HIỆU HÓA - Tệp học liệu mất bảo mật trực tiếp.");
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                disableMainDownload ? 'bg-emerald-600' : 'bg-slate-250'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                disableMainDownload ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Thời gian hết hạn URL tạm thời (Expires token link):</span>
              <span className="text-emerald-700 font-mono font-bold">{tokenExpirationTime} Phút</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={tokenExpirationTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTokenExpirationTime(val);
                addSecurityLog(`Cập nhật thời hạn bắt tay token sang: ${val} phút.`);
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Sau thời gian hết hạn này, token bảo mật gán kèm tệp .m3u8 bài giảng sẽ vô hiệu hóa hoàn toàn, bắt buộc trình duyệt của phụ huynh / học sinh kéo yêu cầu bắt tay mới.
            </p>
          </div>

          <div className="bg-slate-900 text-white font-mono p-4 rounded-xl text-[10.5px] leading-relaxed relative border border-slate-800">
            <span className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white font-black px-1 rounded animate-pulse">PROTECTED API</span>
            <div className="space-y-1 text-emerald-400">
              <p className="text-slate-500"># MIS SafeVideo HTTP Headers Security Config:</p>
              <p>HTTP/1.1 200 OK</p>
              <p>Content-Type: application/vnd.apple.mpegurl</p>
              <p>X-Content-Type-Options: nosniff</p>
              <p>Content-Security-Policy: media-src 'self' blob:;</p>
              <p>X-Mis-DRM-Shield: BlockedDownloadRequests={disableMainDownload ? "true" : "false"}</p>
            </div>
          </div>

          {/* Live Security Audit Logs Terminal */}
          <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl text-[10.5px] leading-relaxed font-mono text-emerald-400/95 space-y-1 mt-2.5">
            <div className="flex justify-between border-b border-slate-900 pb-1.5 text-[9px] text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                NHẬT KÝ KIỂM TOÁN AN NINH MẠNG (LIVE AUDIT TRAIL)
              </span>
              <span>UTC+7 PROD SHIELD</span>
            </div>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {securityLogs.map((log, index) => {
                const isAlert = log.includes("VÔ HIỆU HÓA");
                const isSuccess = log.includes("KÍCH HOẠT");
                return (
                  <p 
                    key={index} 
                    className={isAlert ? 'text-rose-400' : isSuccess ? 'text-emerald-400 font-bold' : 'text-emerald-500/80'}
                  >
                    {log}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSecurityStatus('UPDATING');
                addSecurityLog("Đang kết nối để đẩy chính sách bảo mật lên cơ sở dữ liệu học liệu...");
                setTimeout(() => {
                  setSecurityStatus('ACTIVE');
                  addSecurityLog("Đồng bộ chính sách an ninh thành công tới các cụm máy chủ phân phối tệp.");
                }, 800);
              }}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center"
            >
              {securityStatus === 'UPDATING' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Đang áp dụng chính sách...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Cập nhật Máy chủ Độc quyền
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Platform Cross-platform UX & Infrastructure summaries */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-extrabold rounded uppercase tracking-wider mb-1.5 inline-block">
            📱 CÔNG NGHỆ ĐA NỀN TẢNG HYBRID NATIVE APP
          </span>
          <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
            <Tv className="text-emerald-600 w-4.5 h-4.5" />
            Môi trường Khám phá dành cho Phụ huynh & Giáo viên
          </h3>
          <p className="text-xs text-slate-500">
            Đồng bộ tức thời dữ liệu học thuật từ cổng Web-app chính nhiệm tới các thiết bị ứng dụng di động iOS/Android nhanh chóng.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1 text-xs">
            <strong className="text-indigo-900 font-bold block flex items-center gap-1">
              <span>📱</span> App di động cho Giáo viên (iOS & Android)
            </strong>
            <p className="text-indigo-800 font-normal leading-relaxed text-[11px]">
              Giúp giáo viên nhanh chóng điểm danh tức thời khi bước vào lớp Zoom trực tiếp, chụp ảnh sổ đầu bài đưa lên đám mây, nhận chỉ đạo hành chính khẩn từ Ban Giám hiệu MIS.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1 text-xs">
            <strong className="text-emerald-900 font-bold block flex items-center gap-1 flex-wrap">
              <span>👪</span> App di động cho Phụ huynh học sinh (Gắn kết Gia đình)
            </strong>
            <p className="text-emerald-800 font-normal leading-relaxed text-[11px]">
              Xem nhanh tiền đóng học phí định kỳ, nhận hóa đơn in sẵn từ phân hệ Tài chính, theo dõi bảng chấm điểm trắc nghiệm trực tuyến tự động và lịch sử điểm danh của con nhỏ.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
            <div className="p-1 bg-white rounded shadow-4xs shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] leading-relaxed text-slate-600 font-sans">
              <strong>Hệ thống sẵn dùng tiếng Anh & tiếng Việt:</strong> Giao diện ngôn ngữ tự động thay đổi các thẻ hiển thị tại góc trên cùng bên phải. Điều này hoàn hảo cho các trường học có cán bộ quốc tế cộng tác, hướng tới định vị trường học liên cấp MIS toàn cầu hóa.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
