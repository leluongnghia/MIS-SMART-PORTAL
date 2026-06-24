const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite('./local.db');
db.query(`
INSERT INTO approval_requests (id, module, entity_type, entity_id, title, description, status, requester_id, requester_name, approver_role, current_step, payload, submitted_at, created_at, updated_at)
VALUES 
('req_leave_1', 'APPROVALS', 'LEAVE_REQUEST', 'leave_001', 'Đơn xin nghỉ phép năm', 'Nghỉ giải quyết việc gia đình riêng ở quê', 'PENDING', 'user_nhung', 'Cô Phạm Hồng Nhung', 'MANAGER', 1, '{}', now(), now(), now()),
('req_resign_1', 'APPROVALS', 'RESIGNATION', 'resign_001', 'Đơn xin nghỉ việc', 'Chuyển công tác', 'PENDING', 'user_phong', 'Thầy Bùi Hải Phong', 'ADMIN', 1, '{}', now(), now(), now()),
('req_train_1', 'APPROVALS', 'TRAINING', 'train_001', 'Đề xuất tham gia khóa học', 'Khóa học Montessori nâng cao', 'APPROVED', 'user_nhung', 'Cô Phạm Hồng Nhung', 'MANAGER', 1, '{}', now(), now(), now()),
('req_purch_1', 'APPROVALS', 'PURCHASE', 'purch_001', 'Đề xuất mua sắm thiết bị', 'Mua sắm máy chiếu phòng Toán', 'NEEDS_REVISION', 'user_phong', 'Thầy Bùi Hải Phong', 'ADMIN', 1, '{}', now(), now(), now()),
('req_maint_1', 'APPROVALS', 'MAINTENANCE', 'maint_001', 'Báo hỏng và xin sửa chữa', 'Điều hòa phòng 302 không mát', 'PENDING', 'user_nhung', 'Cô Phạm Hồng Nhung', 'ADMIN', 1, '{}', now(), now(), now()),
('req_1782278734212', 'APPROVALS', 'LEAVE_REQUEST', 'leave_request_1782278734213', 'Đề xuất Nghỉ phép', 'Yêu cầu mới', 'PENDING', 'user_pr_mgr', 'Cô Vũ Khánh Chi', 'ADMIN', 1, '{}', now(), now(), now())
ON CONFLICT DO NOTHING;
`).then(() => console.log('Seeded approvals')).catch(console.error);
