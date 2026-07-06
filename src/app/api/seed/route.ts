import { NextResponse } from "next/server";
import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import { ROLE_LABELS, PERMISSION_MODULES, PERMISSION_ACTIONS } from "@/src/app/[locale]/(admin)/users/users.constants";

export async function GET() {
  try {
    const departments = await db.select().from(schema.departments);
    const matrix: any = {};
    const roles = Object.keys(ROLE_LABELS);
    
    const allAccess: any = {};
    for (const mod of PERMISSION_MODULES) {
      allAccess[mod.key] = {};
      for (const act of PERMISSION_ACTIONS) {
        allAccess[mod.key][act.key] = true;
      }
    }

    const limitedAccess: any = {};
    for (const mod of PERMISSION_MODULES) {
      limitedAccess[mod.key] = { view: true };
    }

    roles.forEach(r => {
      matrix[r] = JSON.parse(JSON.stringify(limitedAccess));
      
      // ADMIN: Toàn quyền hệ thống
      if (r === "ADMIN") {
        matrix[r] = JSON.parse(JSON.stringify(allAccess));
      } 
      // HĐT / CHỦ TỊCH / BAN KIỂM SOÁT
      else if (r === "CHAIRMAN" || r === "AUDIT") {
        Object.keys(allAccess).forEach(mod => {
          matrix[r][mod] = { view: true };
        });
        if (r === "CHAIRMAN") {
          if (allAccess["plans"]) matrix[r]["plans"] = { view: true, approve: true };
          if (allAccess["directives"]) matrix[r]["directives"] = { view: true, approve: true };
          if (allAccess["events"]) matrix[r]["events"] = { view: true, approve: true };
        }
      }
      // HIỆU TRƯỞNG & PHÓ HIỆU TRƯỞNG (BGH)
      else if (r === "BGH") {
        const academicModules = ["students", "classes", "timetable", "lesson-plans", "exams", "conduct", "events", "reports"];
        academicModules.forEach(mod => {
          if (allAccess[mod]) matrix[r][mod] = { ...allAccess[mod] };
        });
        // Xem các khối khác
        ["hrm", "crm", "payments", "facilities"].forEach(mod => {
          if (allAccess[mod]) matrix[r][mod] = { view: true };
        });
      }
      // TRƯỞNG PHÒNG CHUYÊN MÔN / TỔ TRƯỞNG (MANAGER)
      else if (r === "MANAGER") {
        ["lesson-plans", "classes", "timetable"].forEach(mod => {
          if (allAccess[mod]) matrix[r][mod] = { ...allAccess[mod] };
        });
        ["students", "reports"].forEach(mod => {
          if (allAccess[mod]) matrix[r][mod] = { view: true };
        });
      }
      // GIÁO VIÊN (TEACHER)
      else if (r === "TEACHER") {
        ["classes", "students", "communication-conduct", "class-timetable", "lesson-plans", "tickets"].forEach(mod => {
          if (allAccess[mod]) matrix[r][mod] = { view: true, edit: true, create: true };
        });
      }
      // CÁC ROLE NGHIỆP VỤ ĐẶC THÙ
      else if (r === "HRM") {
        if (allAccess["hrm"]) matrix[r]["hrm"] = { ...allAccess["hrm"] };
        if (allAccess["users"]) matrix[r]["users"] = { view: true, create: true, edit: true };
      }
      else if (r === "ADMISSIONS") {
        if (allAccess["crm"]) matrix[r]["crm"] = { view: true, create: true, edit: true };
        if (allAccess["admissions"]) matrix[r]["admissions"] = { view: true, create: true, edit: true };
      }
      else if (r === "FACILITIES") {
        if (allAccess["facilities"]) matrix[r]["facilities"] = { ...allAccess["facilities"] };
      }
      else if (r === "SCHOOL_SERVICE_STAFF" || r === "STAFF") {
        if (allAccess["school-services"]) matrix[r]["school-services"] = { view: true, create: true, edit: true };
        if (allAccess["tickets"]) matrix[r]["tickets"] = { view: true, create: true, edit: true };
      }
      else if (r === "SCHOOL_SERVICE_OPERATIONS_MANAGER") {
        if (allAccess["school-services"]) matrix[r]["school-services"] = { ...allAccess["school-services"] };
        if (allAccess["tickets"]) matrix[r]["tickets"] = { ...allAccess["tickets"] };
      }
    });

    departments.forEach(d => {
      matrix[d.id] = JSON.parse(JSON.stringify(limitedAccess));
      const lowerName = d.name.toLowerCase();
      
      if (lowerName.includes("nhân sự")) {
        if (allAccess["hrm"]) matrix[d.id]["hrm"] = { ...allAccess["hrm"] };
        if (allAccess["users"]) matrix[d.id]["users"] = { view: true, create: true, edit: true };
      } else if (lowerName.includes("tuyển sinh")) {
        if (allAccess["crm"]) matrix[d.id]["crm"] = { ...allAccess["crm"] };
        if (allAccess["admissions"]) matrix[d.id]["admissions"] = { ...allAccess["admissions"] };
        if (allAccess["reports"]) matrix[d.id]["reports"] = { view: true };
      } else if (lowerName.includes("kế toán") || lowerName.includes("tài chính")) {
        if (allAccess["payments"]) matrix[d.id]["payments"] = { ...allAccess["payments"] };
      } else if (lowerName.includes("csvc") || lowerName.includes("cơ sở vật chất")) {
        if (allAccess["facilities"]) matrix[d.id]["facilities"] = { ...allAccess["facilities"] };
        if (allAccess["storage"]) matrix[d.id]["storage"] = { view: true, create: true, edit: true };
      } else if (lowerName.includes("y tế")) {
        if (allAccess["health"]) matrix[d.id]["health"] = { ...allAccess["health"] };
      } else if (lowerName.includes("xe") || lowerName.includes("đưa đón")) {
        if (allAccess["transport"]) matrix[d.id]["transport"] = { ...allAccess["transport"] };
      } else if (lowerName.includes("bếp") || lowerName.includes("bán trú")) {
        if (allAccess["meals"]) matrix[d.id]["meals"] = { ...allAccess["meals"] };
      } else if (lowerName.includes("truyền thông")) {
        if (allAccess["media"]) matrix[d.id]["media"] = { ...allAccess["media"] };
        if (allAccess["events"]) matrix[d.id]["events"] = { ...allAccess["events"] };
        if (allAccess["announcements"]) matrix[d.id]["announcements"] = { ...allAccess["announcements"] };
      } else if (lowerName.includes("dịch vụ") || lowerName.includes("cskh")) {
        if (allAccess["tickets"]) matrix[d.id]["tickets"] = { ...allAccess["tickets"] };
        if (allAccess["communication-conduct"]) matrix[d.id]["communication-conduct"] = { view: true, create: true, edit: true };
      } else if (lowerName.includes("kiểm soát") || lowerName.includes("audit")) {
        Object.keys(allAccess).forEach(mod => {
          matrix[d.id][mod] = { view: true };
        });
      }
    });

    const existing = await db.select().from(schema.rbacConfig).where(eq(schema.rbacConfig.id, "system_matrix"));
    
    if (existing.length > 0) {
      await db.update(schema.rbacConfig).set({ config: matrix, updatedAt: new Date() }).where(eq(schema.rbacConfig.id, "system_matrix"));
    } else {
      await db.insert(schema.rbacConfig).values({ id: "system_matrix", config: matrix, createdAt: new Date(), updatedAt: new Date() });
    }

    return NextResponse.json({ success: true, message: `Seeded ${roles.length} roles and ${departments.length} departments` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
