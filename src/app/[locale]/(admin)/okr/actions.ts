"use server";

import { db, schema } from "@/src/libs/server/db";

const pillars = [
  { id: 'admissions', name: 'Tuyển sinh', desc: 'Mở rộng quy mô - Nâng cao chất lượng đầu vào', progress: 71, objectives: 10, doneObjectives: 8, keyResults: 28, doneKeyResults: 18, owner: 'Phạm Thị Lan', ownerRole: 'P. Tuyển sinh', confidence: 7.8, status: 'Đúng tiến độ', color: 'bg-blue-600' },
  { id: 'training', name: 'Đào tạo', desc: 'Nâng cao chất lượng dạy & học', progress: 68, objectives: 12, doneObjectives: 9, keyResults: 36, doneKeyResults: 21, owner: 'Trần Văn Hùng', ownerRole: 'P. Đào tạo', confidence: 7.2, status: 'Đúng tiến độ', color: 'bg-purple-600' },
  { id: 'hr', name: 'Nhân sự', desc: 'Phát triển đội ngũ - Trao quyền - Gắn kết', progress: 75, objectives: 9, doneObjectives: 7, keyResults: 23, doneKeyResults: 16, owner: 'Lê Thị Mai', ownerRole: 'P. Nhân sự', confidence: 7.6, status: 'Đúng tiến độ', color: 'bg-sky-500' },
  { id: 'operations', name: 'Vận hành', desc: 'Hiệu quả - Chuẩn hóa - Chuyển đổi số', progress: 63, objectives: 7, doneObjectives: 6, keyResults: 18, doneKeyResults: 12, owner: 'Nguyễn Văn Nam', ownerRole: 'Hiệu trưởng', confidence: 6.5, status: 'Có rủi ro', color: 'bg-orange-500' },
];

const alerts = [
  { id: 'a1', severity: 'critical', pillarId: 'admissions', title: '2 mục tiêu nguy cơ trễ hạn', detail: 'Tỷ lệ học sinh đạt học bổng và xử lý sự cố đúng SLA cần cập nhật.', time: '30 phút trước' },
  { id: 'a2', severity: 'warning', pillarId: 'training', title: '5 mục tiêu có tiến độ thấp', detail: 'Đào tạo: 2 mục tiêu; Nhân sự: 2 mục tiêu; Vận hành: 1 mục tiêu.', time: '1 giờ trước' },
  { id: 'a3', severity: 'info', pillarId: 'hr', title: '3 mục tiêu chưa cập nhật', detail: 'Nhân sự: 2 mục tiêu; Vận hành: 1 mục tiêu.', time: '3 giờ trước' },
];

const alignmentNodes = pillars.flatMap((p, idx) => [
  { id: `${p.id}-obj`, pillarId: p.id, type: 'objective', title: `${p.name}: mục tiêu chiến lược`, x: 8, y: 18 + idx * 18 },
  { id: `${p.id}-kr`, pillarId: p.id, type: 'kr', title: `${p.doneKeyResults}/${p.keyResults} kết quả chính`, x: 42, y: 18 + idx * 18 },
  { id: `${p.id}-init`, pillarId: p.id, type: 'initiative', title: `Sáng kiến ${p.name.toLowerCase()}`, x: 74, y: 18 + idx * 18 },
]);

const fallbackFollowUps = [
  { id: 'f1', text: 'Rà soát kế hoạch tuyển sinh Hè 2025', user: 'Phạm Thị Lan', date: '18/05/2025', pillarId: 'admissions', done: false },
  { id: 'f2', text: 'Cập nhật tiến độ chương trình GDPT 2018', user: 'Trần Văn Hùng', date: '18/05/2025', pillarId: 'training', done: false },
  { id: 'f3', text: 'Hoàn thiện bộ khung năng lực giáo viên', user: 'Lê Thị Mai', date: '20/05/2025', pillarId: 'hr', done: false },
  { id: 'f4', text: 'Báo cáo chi phí vận hành Quý 2', user: 'Nguyễn Văn Nam', date: '20/05/2025', pillarId: 'operations', done: false },
  { id: 'f5', text: 'Đánh giá hiệu quả phần mềm quản lý', user: 'Phạm Minh Tuấn', date: '21/05/2025', pillarId: 'operations', done: false },
];

export async function getInitialData() {
  let tasks: any[] = [];
  try { tasks = await db.select().from(schema.tasks).limit(8); } catch {}
  const followUps = tasks.length ? tasks.map((t: any, i: number) => ({
    id: String(t.id ?? `task-${i}`),
    text: t.title || t.name || t.task || fallbackFollowUps[i % fallbackFollowUps.length].text,
    user: t.assignee || t.createdBy || fallbackFollowUps[i % fallbackFollowUps.length].user,
    date: t.dueDate || t.date || fallbackFollowUps[i % fallbackFollowUps.length].date,
    pillarId: pillars[i % pillars.length].id,
    done: t.status === 'done' || t.completed === true,
  })) : fallbackFollowUps;

  return {
    quarters: ['Quý 2/2025 (01/04 - 30/06/2025)', 'Quý 1/2025', 'Quý 4/2024'],
    campuses: ['Cơ sở: Tất cả', 'Cơ sở 1', 'Cơ sở 2'],
    scopes: ['Khối phụ trách: Tất cả', 'Tuyển sinh', 'Đào tạo', 'Nhân sự', 'Vận hành'],
    summary: { progress: 72, onTrack: 68, risk: 18, linkedKpis: 86, completed: 72, doing: 22, notStarted: 6 },
    pillars,
    alerts,
    alignmentNodes,
    followUps,
  };
}
