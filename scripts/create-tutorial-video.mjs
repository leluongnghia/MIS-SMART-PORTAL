import { mkdirSync, writeFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const outDir = join(process.cwd(), 'docs', 'tutorial-video');
const tmpDir = join(outDir, 'tmp');
mkdirSync(tmpDir, { recursive: true });

const slides = [
  {
    title: 'MIS Smart Portal',
    body: [
      'Video hướng dẫn tổng quan cách sử dụng phần mềm quản trị trường học.',
      'Áp dụng cho Ban Giám hiệu, quản lý bộ phận, giáo viên, nhân viên, phụ huynh và học sinh.',
      'Nội dung đi theo luồng thao tác thực tế từ đăng nhập, tìm kiếm, xử lý việc đến theo dõi học sinh.',
    ],
    note: 'Mục tiêu: nắm nhanh toàn bộ các phân hệ chính và biết vào đúng nơi cần thao tác.',
    duration: 7,
  },
  {
    title: '1. Đăng nhập và chọn đúng vai trò',
    body: [
      'Mở phần mềm, chọn chế độ Cán bộ nhà trường hoặc Cổng học sinh & phụ huynh.',
      'Tài khoản cán bộ vào được dashboard quản trị, công việc, quy trình, học vụ và vận hành.',
      'Tài khoản phụ huynh/học sinh vào portal riêng để xem điểm, chuyên cần, học phí, lịch học và thư viện.',
    ],
    note: 'Nếu đang kiểm thử từ tài khoản quản trị, mở menu Nghiệp vụ Trường học > Cổng PHHS / Học sinh.',
    duration: 8,
  },
  {
    title: '2. Header, tìm kiếm nhanh và menu trái',
    body: [
      'Ô tìm kiếm nhanh trên header dùng để tìm chức năng, hồ sơ, người dùng hoặc công việc.',
      'Menu trái chia theo nhóm: Chiến lược, Nền tảng, Vận hành, Nghiệp vụ Trường học và Vận hành Học đường.',
      'Khi không thấy chức năng, hãy mở đúng nhóm menu hoặc gõ tên chức năng vào ô tìm kiếm.',
    ],
    note: 'Các mục quan trọng đã được đặt tên rõ: Cổng PHHS, Thời khóa biểu tổng, Thư viện & Thiết bị.',
    duration: 8,
  },
  {
    title: '3. Tổng quan điều hành',
    body: [
      'Dashboard hiển thị công việc quá hạn, chờ duyệt, đang thực hiện và tỷ lệ hoàn thành toàn trường.',
      'Bấm vào từng thẻ thống kê để mở danh sách công việc tương ứng.',
      'Ban Giám hiệu dùng màn này để xem điểm nghẽn, chỉ đạo liên quan và tình trạng triển khai theo phòng ban.',
    ],
    note: 'Nên kiểm tra dashboard đầu ngày và cuối ngày để nắm các việc cần can thiệp.',
    duration: 8,
  },
  {
    title: '4. Quản lý công việc và dự án',
    body: [
      'Vào Vận hành > Nhiệm vụ & Dự án để xem Kanban, lịch, Gantt hoặc danh sách.',
      'Tạo việc mới, chọn người phụ trách, phòng ban, deadline, KPI, tài liệu tham khảo và thẻ phân loại.',
      'Người thực hiện cập nhật trạng thái, bình luận, đính kèm báo cáo và gửi duyệt khi hoàn thành.',
    ],
    note: 'Việc sát hạn hoặc quá hạn có cơ chế nhắc qua email cho người phụ trách.',
    duration: 9,
  },
  {
    title: '5. Quy trình và phê duyệt',
    body: [
      'Vào Vận hành > Quy trình & Phê duyệt để tạo đơn từ, phiếu đề xuất, nghỉ phép hoặc mua sắm.',
      'Quy trình hỗ trợ nhiều bước duyệt, rẽ nhánh, nhật ký xử lý và trạng thái từng bước.',
      'Người duyệt chỉ cần mở hồ sơ, xem nội dung, chọn phê duyệt hoặc từ chối kèm lý do.',
    ],
    note: 'Dùng phân hệ này để giảm ký giấy, tránh thiếu bước hoặc trùng lặp công việc.',
    duration: 8,
  },
  {
    title: '6. Quản lý văn bản và lưu trữ',
    body: [
      'Vào Nền tảng > Quản lý Văn bản để tải lên, xem, tải xuống, luân chuyển và lưu trữ hồ sơ.',
      'Tệp upload được giữ nguyên định dạng gốc như PDF, DOCX, XLSX, PPTX hoặc ảnh.',
      'Dùng bộ lọc và kho lưu trữ để tìm lại công văn, giáo án, biên bản hoặc minh chứng.',
    ],
    note: 'Luôn đặt tên văn bản rõ ràng theo năm học, bộ phận và loại hồ sơ.',
    duration: 8,
  },
  {
    title: '7. CRM tuyển sinh',
    body: [
      'Vào Nghiệp vụ Trường học > Tuyển sinh & CRM để quản lý lead phụ huynh và học sinh.',
      'Nhập thông tin phụ huynh, số điện thoại, khối dự tuyển, nguồn tiếp cận và ghi chú tư vấn.',
      'Theo dõi trạng thái mới nhận, đã tư vấn, nhập học hoặc tạm hủy; xuất báo cáo khi cần.',
    ],
    note: 'Dữ liệu CRM giúp đo hiệu quả kênh tuyển sinh và chăm sóc phụ huynh.',
    duration: 8,
  },
  {
    title: '8. Hồ sơ Học sinh 360 và SIS',
    body: [
      'Vào Hồ sơ Học sinh 360 để quản lý thông tin cá nhân, phụ huynh, liên hệ khẩn cấp và lớp học.',
      'Các tab gồm hồ sơ, quá trình học tập, điểm danh, sổ điểm, liên lạc phụ huynh và bảo mật.',
      'Sổ điểm đã có danh mục môn học từ lớp 1 đến lớp 12 theo chương trình giáo dục Việt Nam.',
    ],
    note: 'Đây là lõi dữ liệu học sinh, cần phân quyền chặt và ghi nhận nhật ký truy cập.',
    duration: 9,
  },
  {
    title: '9. Cổng PHHS / Học sinh',
    body: [
      'Cổng PHHS cho phép phụ huynh xem bảng điều khiển riêng của con em mình.',
      'Các mục chính: thời khóa biểu, kết quả học tập, chuyên cần, học phí, xin nghỉ phép, y tế, thư viện và khảo sát.',
      'Học sinh có thêm khu luyện tập LMS để làm bài ôn tập và xem kết quả.',
    ],
    note: 'Tài khoản quản trị có thể mở mục này trong menu để kiểm tra trải nghiệm phụ huynh.',
    duration: 9,
  },
  {
    title: '10. Thời khóa biểu tổng và giáo án',
    body: [
      'Vào Vận hành Học đường > Thời khóa biểu tổng & Giáo án.',
      'Màn hình hiển thị lịch dạy theo thứ, tiết học, giáo viên, phòng học và lớp.',
      'Giáo viên có thể nộp giáo án theo khối 1-12, chọn môn đúng chương trình và giữ nguyên file đính kèm.',
    ],
    note: 'Phân hệ này cần dùng để kiểm tra trùng lịch giáo viên, phòng học và kế hoạch dạy thay.',
    duration: 9,
  },
  {
    title: '11. LMS và ôn tập trực tuyến',
    body: [
      'Vào Hệ thống LMS để quản lý lớp online, bài ôn tập, ngân hàng câu hỏi và chứng nhận.',
      'Tạo bài ôn tập bằng cách chọn lớp, môn học, deadline, thời gian làm bài và câu hỏi.',
      'Theo dõi tỷ lệ nộp bài, điểm trung bình, học sinh chưa nộp và xuất báo cáo gửi phụ huynh.',
    ],
    note: 'Nên gắn bài ôn tập với môn và lớp để dữ liệu phân tích học tập chính xác.',
    duration: 9,
  },
  {
    title: '12. Thư viện và thiết bị',
    body: [
      'Vào Vận hành Học đường > Thư viện & Thiết bị.',
      'Tab thư viện/kho thiết bị quản lý danh mục sách, thiết bị, vị trí, số lượng, tình trạng và kiểm kê.',
      'Tạo phiếu mượn trả, ghi nhận hỏng/mất, thanh lý và liên kết nhu cầu mua sắm khi cần.',
    ],
    note: 'Phụ huynh/học sinh cũng xem được lịch sử mượn sách và thiết bị trong cổng riêng.',
    duration: 9,
  },
  {
    title: '13. Tài chính, học phí và hóa đơn',
    body: [
      'Trong LMS hoặc cổng PHHS có khu học phí và hóa đơn.',
      'Nhà trường theo dõi hóa đơn đã đóng, chờ đóng, quá hạn và ngày thanh toán.',
      'Phụ huynh xem khoản phải thu, hạn đóng, trạng thái và có thể in biên lai.',
    ],
    note: 'Nên dùng mã hóa đơn thống nhất để thuận tiện đối soát kế toán.',
    duration: 8,
  },
  {
    title: '14. Nhân sự, HRM và nghỉ phép',
    body: [
      'Vào Nhân sự giáo viên hoặc Quản trị HRM để quản lý hồ sơ nhân sự, KPI, khối lượng dạy và nghỉ phép.',
      'Giáo viên gửi đơn nghỉ, hệ thống có thể gợi ý bố trí dạy thay dựa trên thời khóa biểu.',
      'Quản lý theo dõi chấm công, lương, giờ dạy, tăng ca và chứng chỉ chuyên môn.',
    ],
    note: 'Dữ liệu nhân sự cần được cập nhật định kỳ để KPI và phân công chính xác.',
    duration: 8,
  },
  {
    title: '15. Sự kiện, cuộc họp và kho tri thức',
    body: [
      'Vào Quản lý Sự kiện để lập kế hoạch Open Day, họp phụ huynh hoặc hoạt động toàn trường.',
      'Vào Quản lý Cuộc họp để tạo lịch, biên bản, người tham dự và xác nhận tham gia.',
      'Vào Kho Tri Thức để tra cứu quy định, hướng dẫn nghiệp vụ, chính sách và tài liệu nội bộ.',
    ],
    note: 'Ba phân hệ này giúp chuẩn hóa truyền thông và vận hành nội bộ.',
    duration: 8,
  },
  {
    title: '16. Báo cáo, rủi ro và bảo mật',
    body: [
      'Báo cáo phân tích giúp lọc dữ liệu theo phòng ban, trạng thái, tiến độ và hiệu quả.',
      'Quản trị rủi ro theo dõi cảnh báo, sự cố, vấn đề quá hạn và các điểm cần xử lý.',
      'Cấu hình RBAC, nhật ký truy cập, sao lưu/khôi phục dữ liệu giúp bảo vệ dữ liệu học sinh.',
    ],
    note: 'Dữ liệu học sinh là nhóm nhạy cảm, chỉ cấp quyền theo đúng vai trò cần dùng.',
    duration: 9,
  },
  {
    title: '17. Quy trình sử dụng hằng ngày',
    body: [
      'Buổi sáng: mở dashboard, xem việc quá hạn, chờ duyệt và lịch họp.',
      'Trong ngày: xử lý công việc, cập nhật tiến độ, duyệt quy trình, điểm danh và trả lời phụ huynh.',
      'Cuối ngày: xuất báo cáo, kiểm tra nhắc hạn, sao lưu dữ liệu quan trọng và ghi nhận vấn đề tồn đọng.',
    ],
    note: 'Làm đều quy trình này sẽ giúp dữ liệu phần mềm luôn đúng và có giá trị quản trị.',
    duration: 9,
  },
  {
    title: 'Hoàn tất',
    body: [
      'Video hướng dẫn đã bao quát các chức năng chính của MIS Smart Portal.',
      'Khi đào tạo người dùng mới, nên đi theo thứ tự: đăng nhập, menu, công việc, học sinh, PHHS, vận hành và báo cáo.',
      'Có thể dùng file kịch bản đi kèm để thu âm thuyết minh hoặc chỉnh lại theo quy trình riêng của trường.',
    ],
    note: 'Kết thúc hướng dẫn.',
    duration: 7,
  },
];

function wrapLine(text, max = 68) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function formatTime(seconds) {
  const ms = Math.round((seconds % 1) * 1000);
  const total = Math.floor(seconds);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: process.cwd() });
  if (result.status !== 0) {
    throw new Error(`${command} failed with status ${result.status}`);
  }
}

function textPath(name) {
  return join(tmpDir, name).replace(/\\/g, '/');
}

function filterTextPath(name) {
  return `docs/tutorial-video/tmp/${name}`;
}

if (existsSync(tmpDir)) {
  rmSync(tmpDir, { recursive: true, force: true });
}
mkdirSync(tmpDir, { recursive: true });

const ffmpegPath = ffmpegInstaller.path;
const font = 'C\\:/Windows/Fonts/arial.ttf';
const concatLines = [];
const srt = [];
const md = [
  '# Kịch bản video hướng dẫn MIS Smart Portal',
  '',
  `Tổng thời lượng dự kiến: ${slides.reduce((sum, slide) => sum + slide.duration, 0)} giây.`,
  '',
];

let cursor = 0;
slides.forEach((slide, index) => {
  const number = String(index + 1).padStart(2, '0');
  const titleName = `slide_${number}_title.txt`;
  const bodyName = `slide_${number}_body.txt`;
  const noteName = `slide_${number}_note.txt`;
  const titleFile = textPath(titleName);
  const bodyFile = textPath(bodyName);
  const noteFile = textPath(noteName);
  const titleFilterFile = filterTextPath(titleName);
  const bodyFilterFile = filterTextPath(bodyName);
  const noteFilterFile = filterTextPath(noteName);
  const segmentName = `segment_${number}.mp4`;
  const segment = join(tmpDir, segmentName).replace(/\\/g, '/');

  const bodyText = slide.body
    .flatMap(line => wrapLine(`• ${line}`, 72))
    .join('\n');

  writeFileSync(titleFile, slide.title, 'utf8');
  writeFileSync(bodyFile, bodyText, 'utf8');
  writeFileSync(noteFile, wrapLine(slide.note, 86).join('\n'), 'utf8');

  const accent = index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#059669' : '#0ea5e9';
  const filter = [
    `drawbox=x=0:y=0:w=1920:h=1080:color=${accent}@0.16:t=fill`,
    `drawbox=x=82:y=72:w=1756:h=936:color=white@0.08:t=fill`,
    `drawbox=x=82:y=72:w=12:h=936:color=${accent}@1:t=fill`,
    `drawtext=fontfile='${font}':text='MIS SMART PORTAL':fontcolor=#a5b4fc:fontsize=30:x=122:y=92`,
    `drawtext=fontfile='${font}':textfile='${titleFilterFile}':fontcolor=white:fontsize=66:x=122:y=150:line_spacing=12`,
    `drawtext=fontfile='${font}':textfile='${bodyFilterFile}':fontcolor=#e5e7eb:fontsize=38:x=122:y=300:line_spacing=18`,
    `drawbox=x=122:y=840:w=1676:h=106:color=black@0.25:t=fill`,
    `drawtext=fontfile='${font}':textfile='${noteFilterFile}':fontcolor=#fef3c7:fontsize=31:x=152:y=866:line_spacing=12`,
    `drawtext=fontfile='${font}':text='${index + 1}/${slides.length}':fontcolor=#cbd5e1:fontsize=26:x=1710:y=970`,
  ].join(',');

  run(ffmpegPath, [
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=#0f172a:s=1920x1080:d=${slide.duration}`,
    '-vf', filter,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-t', String(slide.duration),
    segment,
  ]);

  concatLines.push(`file '${segmentName}'`);

  srt.push(
    String(index + 1),
    `${formatTime(cursor)} --> ${formatTime(cursor + slide.duration)}`,
    `${slide.title}. ${slide.body.join(' ')} ${slide.note}`,
    '',
  );

  md.push(`## ${index + 1}. ${slide.title}`, '', ...slide.body.map(line => `- ${line}`), '', `Ghi chú: ${slide.note}`, '');
  cursor += slide.duration;
});

const concatFile = textPath('concat.txt');
writeFileSync(concatFile, concatLines.join('\n'), 'utf8');

const mp4Path = join(outDir, 'MIS-Smart-Portal-Huong-Dan-Su-Dung.mp4');
run(ffmpegPath, [
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', concatFile,
  '-c', 'copy',
  mp4Path,
]);

writeFileSync(join(outDir, 'MIS-Smart-Portal-Huong-Dan-Su-Dung.srt'), srt.join('\n'), 'utf8');
writeFileSync(join(outDir, 'MIS-Smart-Portal-Huong-Dan-Su-Dung.md'), md.join('\n'), 'utf8');

const sizeMb = (statSync(mp4Path).size / (1024 * 1024)).toFixed(2);
console.log(`Created ${mp4Path} (${sizeMb} MB)`);
