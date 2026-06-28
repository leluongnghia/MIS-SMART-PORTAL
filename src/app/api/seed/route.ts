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
      if (r === "ADMIN" || r === "CHAIRMAN" || r === "BGH") {
        matrix[r] = JSON.parse(JSON.stringify(allAccess));
      } else {
        matrix[r] = JSON.parse(JSON.stringify(limitedAccess));
        if (r === "HRM") {
          matrix[r]["hrm"] = { ...allAccess["hrm"] };
          matrix[r]["users"] = { view: true, create: true, edit: true };
        }
        if (r === "ADMISSIONS") {
          matrix[r]["crm"] = { ...allAccess["crm"] };
          matrix[r]["admissions"] = { ...allAccess["admissions"] };
        }
        if (r === "FACILITIES") {
          matrix[r]["facilities"] = { ...allAccess["facilities"] };
        }
        if (r === "TEACHER") {
          matrix[r]["classes"] = { view: true, edit: true };
          matrix[r]["students"] = { view: true, edit: true };
          matrix[r]["timetable"] = { view: true };
          matrix[r]["lesson-plans"] = { view: true, create: true, edit: true, delete: true };
        }
      }
    });

    departments.forEach(d => {
      matrix[d.id] = JSON.parse(JSON.stringify(limitedAccess));
      const lowerName = d.name.toLowerCase();
      if (lowerName.includes("nhân sự")) {
        matrix[d.id]["hrm"] = { ...allAccess["hrm"] };
      } else if (lowerName.includes("tuyển sinh")) {
        matrix[d.id]["crm"] = { ...allAccess["crm"] };
        matrix[d.id]["admissions"] = { ...allAccess["admissions"] };
      } else if (lowerName.includes("kế toán") || lowerName.includes("tài chính")) {
        matrix[d.id]["payments"] = { ...allAccess["payments"] };
      } else if (lowerName.includes("csvc") || lowerName.includes("cơ sở vật chất")) {
        matrix[d.id]["facilities"] = { ...allAccess["facilities"] };
      } else if (lowerName.includes("y tế")) {
        matrix[d.id]["health"] = { ...allAccess["health"] };
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
