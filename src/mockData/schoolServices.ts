// src/mockData/schoolServices.ts

export const SERVICE_CLASSES = [
  { id: "C10A1", name: "10A1", grade: 10, teacher: "Lê Văn Tám" },
  { id: "C10A2", name: "10A2", grade: 10, teacher: "Nguyễn Thị Hương" },
  { id: "C11A1", name: "11A1", grade: 11, teacher: "Trần Bình Trọng" },
  { id: "C11A2", name: "11A2", grade: 11, teacher: "Hoàng Văn Thái" },
  { id: "C12A1", name: "12A1", grade: 12, teacher: "Đinh Nữ Huyền" }
];

export const SERVICE_STUDENTS = [
  { id: "HS001", name: "Trần Bảo Nam", classId: "C10A1", className: "10A1", avatar: "https://i.pravatar.cc/150?u=1", dob: "2010-05-15", phone: "0901234567" },
  { id: "HS002", name: "Lê Ngọc Hân", classId: "C10A1", className: "10A1", avatar: "https://i.pravatar.cc/150?u=2", dob: "2010-08-22", phone: "0902345678" },
  { id: "HS003", name: "Nguyễn Minh Đức", classId: "C10A2", className: "10A2", avatar: "https://i.pravatar.cc/150?u=3", dob: "2010-02-10", phone: "0903456789" },
  { id: "HS004", name: "Phạm Hải Yến", classId: "C10A2", className: "10A2", avatar: "https://i.pravatar.cc/150?u=4", dob: "2010-11-30", phone: "0904567890" },
  { id: "HS005", name: "Vũ Tuấn Anh", classId: "C11A1", className: "11A1", avatar: "https://i.pravatar.cc/150?u=5", dob: "2009-04-18", phone: "0905678901" },
  { id: "HS006", name: "Đặng Mai Chi", classId: "C11A1", className: "11A1", avatar: "https://i.pravatar.cc/150?u=6", dob: "2009-09-05", phone: "0906789012" },
  { id: "HS007", name: "Bùi Gia Bảo", classId: "C11A2", className: "11A2", avatar: "https://i.pravatar.cc/150?u=7", dob: "2009-12-12", phone: "0907890123" },
  { id: "HS008", name: "Hoàng Thanh Mai", classId: "C11A2", className: "11A2", avatar: "https://i.pravatar.cc/150?u=8", dob: "2009-01-25", phone: "0908901234" },
  { id: "HS009", name: "Lý Tiến Đạt", classId: "C12A1", className: "12A1", avatar: "https://i.pravatar.cc/150?u=9", dob: "2008-07-08", phone: "0909012345" },
  { id: "HS010", name: "Phan Ánh Nguyệt", classId: "C12A1", className: "12A1", avatar: "https://i.pravatar.cc/150?u=10", dob: "2008-03-14", phone: "0900123456" },
  { id: "HS011", name: "Đỗ Hải Đăng", classId: "C10A1", className: "10A1", avatar: "https://i.pravatar.cc/150?u=11", dob: "2010-06-20", phone: "0911234567" },
  { id: "HS012", name: "Dương Kiều Trinh", classId: "C10A2", className: "10A2", avatar: "https://i.pravatar.cc/150?u=12", dob: "2010-10-10", phone: "0912345678" },
  { id: "HS013", name: "Trương Khánh Linh", classId: "C11A1", className: "11A1", avatar: "https://i.pravatar.cc/150?u=13", dob: "2009-05-25", phone: "0913456789" },
  { id: "HS014", name: "Ngô Nhật Minh", classId: "C11A2", className: "11A2", avatar: "https://i.pravatar.cc/150?u=14", dob: "2009-08-08", phone: "0914567890" },
  { id: "HS015", name: "Tô Minh Tâm", classId: "C12A1", className: "12A1", avatar: "https://i.pravatar.cc/150?u=15", dob: "2008-11-11", phone: "0915678901" },
  { id: "HS016", name: "Vương Nhã Khanh", classId: "C10A1", className: "10A1", avatar: "https://i.pravatar.cc/150?u=16", dob: "2010-01-01", phone: "0916789012" },
  { id: "HS017", name: "Mai Đức Cường", classId: "C10A2", className: "10A2", avatar: "https://i.pravatar.cc/150?u=17", dob: "2010-04-30", phone: "0917890123" },
  { id: "HS018", name: "Đoàn Phương Ly", classId: "C11A1", className: "11A1", avatar: "https://i.pravatar.cc/150?u=18", dob: "2009-02-14", phone: "0918901234" },
  { id: "HS019", name: "Đinh Công Thành", classId: "C11A2", className: "11A2", avatar: "https://i.pravatar.cc/150?u=19", dob: "2009-10-20", phone: "0919012345" },
  { id: "HS020", name: "Lưu Bảo Ngọc", classId: "C12A1", className: "12A1", avatar: "https://i.pravatar.cc/150?u=20", dob: "2008-09-02", phone: "0920123456" }
];

export const TRANSPORT_ROUTES = [
  { id: "T01", name: "Tuyến 01: Quận 7 - Trường", licensePlate: "51B-123.45", driverName: "Bác Tư", assistantName: "Cô Mai", seats: 30, studentsCount: 25, status: "active" },
  { id: "T02", name: "Tuyến 02: Tân Bình - Trường", licensePlate: "51B-234.56", driverName: "Chú Hoàng", assistantName: "Chị Thủy", seats: 25, studentsCount: 22, status: "active" },
  { id: "T03", name: "Tuyến 03: Gò Vấp - Trường", licensePlate: "51B-345.67", driverName: "Anh Dũng", assistantName: "Cô Lan", seats: 16, studentsCount: 15, status: "maintenance" }
];

export type Ticket = {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  createdBy: string;
  createdAt: string;
};

export const SERVICE_TICKETS: Ticket[] = [
  { id: "TICKET-101", title: "Cơm trưa hôm nay hơi nguội", category: "Ăn uống", status: "open", priority: "normal", createdBy: "Trần Bảo Nam (PH)", createdAt: "2026-06-24T08:15:00Z" },
  { id: "TICKET-102", title: "Xin đổi tuyến xe tạm 1 tuần", category: "Xe đưa đón", status: "in_progress", priority: "high", createdBy: "Lê Ngọc Hân (PH)", createdAt: "2026-06-23T14:30:00Z" },
  { id: "TICKET-103", title: "Cháu bị dị ứng đậu phộng, nhà bếp lưu ý", category: "Ăn uống", status: "resolved", priority: "urgent", createdBy: "Phạm Hải Yến (PH)", createdAt: "2026-06-20T09:00:00Z" },
  { id: "TICKET-104", title: "Điều hòa phòng bán trú B2.01 không mát", category: "Cơ sở vật chất", status: "open", priority: "high", createdBy: "Hoàng Văn Thái (GV)", createdAt: "2026-06-24T10:00:00Z" },
  { id: "TICKET-105", title: "Xin đăng ký mua thêm 1 áo đồng phục size L", category: "Đồng phục", status: "closed", priority: "normal", createdBy: "Lý Tiến Đạt (HS)", createdAt: "2026-06-18T15:20:00Z" },
  { id: "TICKET-106", title: "Quét thẻ xe đưa đón chưa cập nhật app", category: "Xe đưa đón", status: "in_progress", priority: "normal", createdBy: "Đỗ Hải Đăng (PH)", createdAt: "2026-06-22T07:45:00Z" },
  { id: "TICKET-107", title: "Yêu cầu thay rèm cửa sổ lớp 12A1", category: "Cơ sở vật chất", status: "resolved", priority: "low", createdBy: "Đinh Nữ Huyền (GV)", createdAt: "2026-06-15T11:10:00Z" },
  { id: "TICKET-108", title: "Báo cắt suất ăn trưa mai", category: "Ăn uống", status: "closed", priority: "high", createdBy: "Tô Minh Tâm (PH)", createdAt: "2026-06-23T16:00:00Z" },
  { id: "TICKET-109", title: "HS cần hỗ trợ tư vấn tâm lý", category: "Hỗ trợ học sinh", status: "in_progress", priority: "urgent", createdBy: "Nguyễn Thị Hương (GV)", createdAt: "2026-06-21T08:30:00Z" },
  { id: "TICKET-110", title: "Xin rút danh sách nội trú cuối tuần", category: "Bán trú/Nội trú", status: "open", priority: "normal", createdBy: "Đoàn Phương Ly (PH)", createdAt: "2026-06-24T06:00:00Z" },
];

export const MEALS_MENU = [
  { date: "2026-06-22", dish: "Cơm trắng, Sườn xào chua ngọt, Canh chua cá lóc, Rau xào, Sữa chua" },
  { date: "2026-06-23", dish: "Phở bò (sáng), Cơm chiên dương châu, Đùi gà quay, Canh bí đỏ, Dưa hấu" },
  { date: "2026-06-24", dish: "Bánh mì ốp la (sáng), Cơm trắng, Cá kho tộ, Canh mồng tơi, Chuối" },
  { date: "2026-06-25", dish: "Bún chả giò (sáng), Cơm trắng, Thịt kho tiêu, Canh khổ qua, Chè đậu xanh" },
  { date: "2026-06-26", dish: "Xôi xéo (sáng), Nui xào bò, Trứng cuộn, Canh cải ngọt, Sữa tươi" },
  { date: "2026-06-27", dish: "Bánh cuốn (sáng), Cơm tấm sườn bì, Canh chua, Trái cây" },
  { date: "2026-06-28", dish: "Nghỉ cuối tuần" }
];

export const HEALTH_INCIDENTS = [
  { id: "HI-001", student: "Nguyễn Minh Đức", class: "10A2", date: "2026-06-24T08:30:00Z", type: "Chấn thương nhẹ", severity: "Nhẹ", action: "Sát trùng, băng cá nhân", status: "resolved" },
  { id: "HI-002", student: "Đặng Mai Chi", class: "11A1", date: "2026-06-23T14:15:00Z", type: "Sốt cao", severity: "Khẩn cấp", action: "Cho nằm nghỉ, gọi phụ huynh đón về", status: "resolved" },
  { id: "HI-003", student: "Hoàng Thanh Mai", class: "11A2", date: "2026-06-21T09:45:00Z", type: "Đau dạ dày", severity: "Trung bình", action: "Cho uống thuốc dạ dày theo toa lưu", status: "resolved" },
  { id: "HI-004", student: "Trương Khánh Linh", class: "11A1", date: "2026-06-24T13:00:00Z", type: "Chóng mặt", severity: "Nhẹ", action: "Nằm nghỉ tại phòng Y tế 30p", status: "monitoring" },
  { id: "HI-005", student: "Lưu Bảo Ngọc", class: "12A1", date: "2026-06-20T10:30:00Z", type: "Dị ứng thời tiết", severity: "Trung bình", action: "Bôi thuốc mỡ, dặn dò", status: "resolved" },
];

export const FACILITIES = [
  { id: "F-001", name: "Phòng học 10A1", type: "Phòng học", manager: "Nguyễn Văn A", status: "Normal" },
  { id: "F-002", name: "Phòng học 10A2", type: "Phòng học", manager: "Nguyễn Văn A", status: "Maintenance" },
  { id: "F-003", name: "Phòng Bán trú Nam 1", type: "Phòng bán trú", manager: "Trần Thị B", status: "Normal" },
  { id: "F-004", name: "Phòng Bán trú Nữ 1", type: "Phòng bán trú", manager: "Trần Thị B", status: "Normal" },
  { id: "F-005", name: "Bếp ăn số 1", type: "Khu tiện ích", manager: "Lê Văn C", status: "Normal" },
  { id: "F-006", name: "Nhà ăn chung", type: "Khu tiện ích", manager: "Lê Văn C", status: "Normal" },
  { id: "F-007", name: "Phòng Y tế", type: "Khu chức năng", manager: "Dr. Lan", status: "Normal" },
  { id: "F-008", name: "Phòng thực hành Hóa", type: "Phòng chức năng", manager: "Ngô Văn D", status: "Normal" },
  { id: "F-009", name: "Thư viện", type: "Khu tiện ích", manager: "Đào Thị E", status: "Normal" },
  { id: "F-010", name: "Sân vận động", type: "Khu tiện ích", manager: "Phạm Văn F", status: "Normal" },
];
