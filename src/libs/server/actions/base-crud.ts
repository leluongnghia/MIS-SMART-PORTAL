import { db } from "@/src/libs/server/db";
import { eq, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

/**
 * Generic Base CRUD Service cho tất cả các modules.
 * Cung cấp sẵn các hàm chuẩn để tái sử dụng mà không cần viết lại.
 */
export class BaseCrudService<T extends PgTable & { id: any }> {
  constructor(protected table: T) {}

  /** Lấy toàn bộ danh sách */
  async findAll() {
    try {
      return await db.select().from(this.table);
    } catch (e: any) {
      console.error(`FindAll error on ${this.table._.name.name}:`, e);
      throw new Error(`Failed to fetch records: ${e.message}`);
    }
  }

  /** Lấy 1 bản ghi theo ID */
  async findById(id: string) {
    try {
      // @ts-ignore
      const result = await db.select().from(this.table).where(eq(this.table.id, id)).limit(1);
      return result[0] || null;
    } catch (e: any) {
      console.error(`FindById error on ${this.table._.name.name}:`, e);
      throw new Error(`Failed to fetch record: ${e.message}`);
    }
  }

  /** Tạo mới */
  async create(data: any) {
    try {
      // @ts-ignore
      const result = await db.insert(this.table).values(data).returning();
      return result[0];
    } catch (e: any) {
      console.error(`Create error on ${this.table._.name.name}:`, e);
      throw new Error(`Failed to create record: ${e.message}`);
    }
  }

  /** Cập nhật */
  async update(id: string, data: any) {
    try {
      // @ts-ignore
      const result = await db.update(this.table).set({ ...data, updatedAt: new Date() }).where(eq(this.table.id, id)).returning();
      return result[0] || null;
    } catch (e: any) {
      console.error(`Update error on ${this.table._.name.name}:`, e);
      throw new Error(`Failed to update record: ${e.message}`);
    }
  }

  /** Xóa mềm (nếu có cột deletedAt) hoặc Xóa cứng */
  async delete(id: string, softDelete = true) {
    try {
      if (softDelete && 'deletedAt' in this.table) {
        // @ts-ignore
        await db.update(this.table).set({ deletedAt: new Date() }).where(eq(this.table.id, id));
        return true;
      }
      // Xóa cứng
      // @ts-ignore
      await db.delete(this.table).where(eq(this.table.id, id));
      return true;
    } catch (e: any) {
      console.error(`Delete error on ${this.table._.name.name}:`, e);
      throw new Error(`Failed to delete record: ${e.message}`);
    }
  }
}
