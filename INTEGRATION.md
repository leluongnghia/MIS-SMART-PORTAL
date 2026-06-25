# HƯỚNG DẪN TÍCH HỢP TỪNG BƯỚC — mis_portal_handoff
### Đưa schema + service vào dự án MIS Smart Portal (Next.js + Drizzle + PostgreSQL)

> Đọc hết một lượt trước khi bắt đầu. Làm đúng thứ tự bước, KHÔNG nhảy cóc.
> Thời gian ước tính cho riêng phần tích hợp DB + service: ~1 buổi.

---

## 📦 BỘ FILE NHẬN ĐƯỢC

```
mis_portal_handoff/
├── README.md
├── INTEGRATION.md                ← file bạn đang đọc
├── 01_tai_lieu/                  (CHỈ ĐỂ ĐỌC — không copy vào source)
│   ├── dinh_huong_chinh_sua_mis_portal.md   ⭐ đọc trước
│   ├── ke_hoach_phat_trien_webapp_truong_hoc.md
│   └── checklist_chi_tiet_sua_webapp.md
├── 02_schema/                    (PASTE nội dung vào src/models/Schema.ts)
│   ├── schema_transport_meals_health.ts     (16 bảng + 9 enum)
│   └── schema_academic_teacher.ts           (29 bảng + 15 enum)
└── 03_services/                  (COPY vào src/libs/server/)
    ├── transport.ts
    ├── meals.ts
    ├── health.ts                 ⭐ dữ liệu nhạy cảm
    └── academic.ts
```

**Quy tắc vàng:** chỉ THÊM bảng mới, KHÔNG sửa/xóa bảng cũ → migration an toàn, không mất dữ liệu.

---

## ✅ CHECKLIST TỔNG (tick khi hoàn thành)

- [ ] Bước 0 — Giải nén & tạo nhánh git
- [ ] Bước 1 — Xác minh tên 3 bảng nền (students/classes/employeeProfiles)
- [ ] Bước 2 — Bổ sung import drizzle vào Schema.ts
- [ ] Bước 3 — Paste 2 file schema vào cuối Schema.ts
- [ ] Bước 4 — Backup DB + chạy migration
- [ ] Bước 5 — Copy 4 service + sửa import
- [ ] Bước 6 — Tạo route UI gọi service
- [ ] Bước 7 — Gắn menu + tách quyền
- [ ] Bước 8 — Test & commit

---

## BƯỚC 0 — Giải nén & chuẩn bị (10 phút)

```bash
unzip mis_portal_handoff.zip

cd /đường-dẫn/dự-án-mis-portal
git status                      # đảm bảo cây làm việc sạch
git checkout -b feature/school-modules
```

📂 Mỗi nhóm file vào một chỗ khác nhau:
- `01_tai_lieu/` → chỉ đọc, KHÔNG copy vào source code.
- `02_schema/*.ts` → nội dung PASTE vào `src/models/Schema.ts`.
- `03_services/*.ts` → COPY thẳng vào `src/libs/server/`.

---

## BƯỚC 1 — Xác minh tên bảng nền (5 phút · QUAN TRỌNG)

Code mới tham chiếu 3 bảng đã có: `students`, `classes`, `employeeProfiles`.
Kiểm tra tên export THẬT trong dự án:

```bash
grep -n 'pgTable("students"\|pgTable("classes"\|pgTable("employee' src/models/Schema.ts
```

Ghi lại kết quả:
| Bảng cần | Tên export thật trong dự án | Cần đổi? |
|---|---|---|
| students | `export const ______ = pgTable("...")` | |
| classes | `export const ______ = pgTable("...")` | |
| employeeProfiles | `export const ______ = pgTable("...")` | |

→ Nếu tên khác (vd `staff` thay cho `employeeProfiles`), ghi lại để tìm-thay ở Bước 3.

---

## BƯỚC 2 — Bổ sung import vào Schema.ts (5 phút)

Mở `src/models/Schema.ts`, tìm dòng `from "drizzle-orm/pg-core"`.
Đảm bảo có đủ các helper sau (chỉ thêm cái còn THIẾU, không import trùng):

```ts
import {
  pgTable, pgEnum, serial, integer, varchar, text, boolean,
  timestamp, date, time, numeric, json, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
```

---

## BƯỚC 3 — Paste 2 file schema (15 phút)

1. Mở `02_schema/schema_transport_meals_health.ts`.
2. Copy toàn bộ code (có thể bỏ khối comment hướng dẫn ở đầu).
3. Dán vào **CUỐI** `src/models/Schema.ts`.
4. Mở `02_schema/schema_academic_teacher.ts`, dán tiếp ngay sau đó.
5. Nếu Bước 1 phát hiện tên khác → trong vùng vừa dán, tìm-thay:
   - `students.id` → tên thật
   - `classes.id` → tên thật
   - `employeeProfiles.id` → tên thật

✅ Kiểm tra biên dịch (không được có lỗi đỏ):
```bash
npx tsc --noEmit
```

---

## BƯỚC 4 — Migration (10 phút) — chỉ THÊM bảng

```bash
# 4.1 Backup DB (BẮT BUỘC với production)
pg_dump "$DATABASE_URL" > backup_$(date +%F).sql

# 4.2 Sinh migration từ Schema.ts
npx drizzle-kit generate

# 4.3 MỞ file SQL vừa sinh trong thư mục migrations/ và KIỂM TRA:
#     - Phải toàn bộ là CREATE TABLE / CREATE TYPE (enum)
#     - TUYỆT ĐỐI không được có DROP TABLE / ALTER TABLE ... DROP trên bảng cũ
#     - Nếu thấy DROP/ALTER bảng cũ -> DỪNG lại, xem lại Bước 3 (dán nhầm)

# 4.4 Apply
npx drizzle-kit migrate
# (môi trường dev có thể dùng nhanh: npx drizzle-kit push)
```

✅ Xác nhận bảng mới đã tạo:
```bash
psql "$DATABASE_URL" -c "\dt transport_*"
psql "$DATABASE_URL" -c "\dt meal_*"
psql "$DATABASE_URL" -c "\dt health_*"
psql "$DATABASE_URL" -c "\dt exam_* lesson_plans student_grades"
```

---

## BƯỚC 5 — Copy 4 service (10 phút)

```bash
cp 03_services/transport.ts  src/libs/server/
cp 03_services/meals.ts      src/libs/server/
cp 03_services/health.ts     src/libs/server/
cp 03_services/academic.ts   src/libs/server/
```

Mở từng file, sửa 2 dòng import cho khớp dự án:
```ts
import { db } from "./db";              // đổi nếu db client ở đường dẫn khác
import { ... } from "@/models/Schema";  // đổi alias nếu khác
```

⭐ Riêng `health.ts` (dữ liệu nhạy cảm) — hoàn thiện 2 chỗ TODO:
- `auditHealthAccess()` → nối vào bảng audit_logs thật của dự án.
- `HealthCtx` (userId, role, homeroomClassIds) → lấy từ session/auth thật khi gọi service.

✅ Biên dịch lại:
```bash
npx tsc --noEmit
```

---

## BƯỚC 6 — Tạo route UI gọi service

Với mỗi module, tạo trang trong `src/app/[locale]/(admin)/`:
```
transport/page.tsx          meals/page.tsx          health/page.tsx
lesson-plans/page.tsx       exams/page.tsx          conduct/page.tsx
```

**Mẹo nhanh:** copy nguyên `page.tsx` của module `facilities` (đầy đủ nhất, có sẵn bảng/SLA/filter), rồi thay lời gọi dữ liệu bằng service mới.

Ví dụ khung tối thiểu cho Xe đưa đón:
```tsx
// src/app/[locale]/(admin)/transport/page.tsx
import { listRoutes } from "@/libs/server/transport";

export default async function TransportPage() {
  const routes = await listRoutes({ activeOnly: true });
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Xe đưa đón</h1>
      <ul className="space-y-2">
        {routes.map((r) => (
          <li key={r.id} className="border rounded p-3">
            {r.code} — {r.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## BƯỚC 7 — Gắn menu + tách quyền

- Sửa `src/components/AppSidebar.tsx`: thêm 4 mục menu (Xe/Bán trú/Y tế/Giáo án).
  Code mẫu `navGroups` đầy đủ ở `01_tai_lieu/dinh_huong_chinh_sua_mis_portal.md` (PHẦN 3).
- Cấu hình `rbac_config` theo PHẦN 4 (map sơ đồ tổ chức → role → capability).

---

## BƯỚC 8 — Test & commit

Test phân quyền (BẮT BUỘC trước go-live):
- [ ] `principal` đăng nhập → KHÔNG thấy Tài chính/Nhân sự/Tuyển sinh/Vận hành.
- [ ] `council` → thấy báo cáo tổng hợp, KHÔNG sửa điểm/giáo án.
- [ ] `homeroom_gvcn` → chỉ thấy HS lớp mình; xem hồ sơ y tế bị che bệnh nền.
- [ ] Cấp thuốc thiếu `parentConsent` → bị chặn (health.addMedication ném lỗi).

Test nghiệp vụ nhanh:
- [ ] Tạo tuyến xe + điểm danh lên/xuống xe (transport).
- [ ] Đăng ký bán trú + xem danh sách dị ứng (meals.checkAllergyConflicts).
- [ ] Nộp → duyệt giáo án (academic.submitLessonPlan/approveLessonPlan).
- [ ] Đặt ma trận đề + ghép đề tự động (academic.assembleExam).
- [ ] Nhập điểm cột + tính tổng kết môn (academic.computeSubjectTermAverage).

Commit theo nhóm:
```bash
git add src/models/Schema.ts migrations/
git commit -m "feat(db): them schema Xe/Ban tru/Y te/Giao vien"

git add src/libs/server/{transport,meals,health,academic}.ts
git commit -m "feat(service): them service transport/meals/health/academic"

git add src/app src/components/AppSidebar.tsx
git commit -m "feat(ui): them route + menu cac module truong hoc"

git push -u origin feature/school-modules
# Mở Pull Request để review trước khi merge
```

---

## ⚠️ LỖI THƯỜNG GẶP & CÁCH XỬ LÝ

| Triệu chứng | Nguyên nhân | Khắc phục |
|---|---|---|
| `Cannot find name 'students'` | Tên bảng nền khác dự án | Đổi theo Bước 1/3 |
| `type "..." already exists` khi migrate | Enum trùng tên | Đổi tên enum trong khối vừa dán |
| `Cannot find module './db'` trong service | Đường dẫn db client khác | Sửa import cho khớp |
| Migration sinh ra `DROP TABLE` | Dán đè nhầm bảng cũ | Hoàn tác, chỉ dán vào CUỐI file |
| `column ... does not exist` lúc query | Migrate chưa chạy / chạy nhầm DB | Kiểm tra `$DATABASE_URL` và chạy lại migrate |

---

## THỨ TỰ PHỤ THUỘC (vì sao làm theo đúng dãy này)

```
Schema (B3) ─> Migration (B4) ─> Service (B5) ─> UI route (B6) ─> Menu+RBAC (B7) ─> Test (B8)
   bảng có      DB sẵn sàng       có hàm gọi       có màn hình      gắn điều hướng     nghiệm thu
```
Làm sai thứ tự (vd viết UI trước khi có bảng) sẽ vỡ phụ thuộc và báo lỗi liên tục.

---

## SAU KHI MERGE — LÀM TIẾP GÌ
1. Bổ sung nghiệp vụ giáo viên đầy đủ trên UI (giáo án, đề thi, điểm danh, sổ liên lạc).
2. Tách CSKH/Ticketing phụ huynh khỏi `/events` (xem PHẦN 2 tài liệu định hướng).
3. Báo cáo chéo tự động cho HĐT & Hiệu trưởng (giai đoạn tối ưu).
