// Standalone seed script for knowledge documents
// Run: node seed-knowledge.mjs
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { pgTable, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { eq, and, isNull } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load env
try { dotenv.config({ path: '.env.local' }); } catch(e) {}
try { dotenv.config({ path: '.env' }); } catch(e) {}

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!DATABASE_URL) {
  // Try reading .env.local directly
  try {
    const env = readFileSync('.env.local', 'utf8');
    const match = env.match(/DATABASE_URL=(.+)/);
    if (match) process.env.DATABASE_URL = match[1].trim();
  } catch(e) {}
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Inline schema for data_files
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

const dataFiles = pgTable('data_files', {
  id: text('id').primaryKey(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  displayName: text('display_name'),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  mimeType: text('mime_type'),
  extension: text('extension'),
  fileSize: integer('file_size').notNull(),
  storageProvider: text('storage_provider').default('LOCAL').notNull(),
  storageKey: text('storage_key'),
  module: text('module').default('SYSTEM').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  entityLabel: text('entity_label'),
  documentType: text('document_type'),
  category: text('category'),
  relatedModule: text('related_module'),
  tags: jsonb('tags'),
  visibility: text('visibility').default('SCHOOL').notNull(),
  departmentId: text('department_id'),
  version: integer('version').default(1).notNull(),
  parentFileId: text('parent_file_id'),
  uploadedBy: text('uploaded_by'),
  uploadedByName: text('uploaded_by_name'),
  status: text('status').default('ACTIVE').notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
  metadata: jsonb('metadata').notNull().default({}),
  ...timestamps,
});

const SEED_DOCUMENTS = [
  { id: 'doc-1', docCode: 'HR-SOP-01', title: 'Quy trình xin nghỉ phép và phê duyệt', docType: 'SOP', category: 'Hành chính - Nhân sự', ownerId: 'Nguyễn Thị A', version: '2.1', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'doc-2', docCode: 'HR-FORM-01', title: 'Mẫu đơn xin nghỉ phép', docType: 'FORM', category: 'Hành chính - Nhân sự', ownerId: 'Nguyễn Thị A', version: '2.0', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'doc-3', docCode: 'HR-SOP-02', title: 'Quy trình bàn giao và nghỉ việc', docType: 'SOP', category: 'Hành chính - Nhân sự', ownerId: 'Nguyễn Thị A', version: '1.5', status: 'NEEDS_REVIEW', createdAt: '2023-06-01T00:00:00Z', updatedAt: '2023-06-01T00:00:00Z' },
  { id: 'doc-4', docCode: 'HR-FORM-02', title: 'Biên bản bàn giao công việc', docType: 'FORM', category: 'Hành chính - Nhân sự', ownerId: 'Nguyễn Thị A', version: '1.2', status: 'ACTIVE', createdAt: '2023-06-01T00:00:00Z', updatedAt: '2023-06-01T00:00:00Z' },
  { id: 'doc-5', docCode: 'HR-SOP-03', title: 'Quy trình đào tạo hội nhập', docType: 'SOP', category: 'Hành chính - Nhân sự', ownerId: 'Trần Văn B', version: '1.0', status: 'ACTIVE', createdAt: '2024-03-15T00:00:00Z', updatedAt: '2024-03-15T00:00:00Z' },
  { id: 'doc-6', docCode: 'IC-SOP-01', title: 'Quy trình kiểm soát nội bộ định kỳ', docType: 'SOP', category: 'Kiểm soát nội bộ', ownerId: 'Lê Thị C', version: '3.0', status: 'ACTIVE', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'doc-7', docCode: 'IC-FORM-01', title: 'Phiếu ghi nhận điểm không phù hợp (NC)', docType: 'FORM', category: 'Kiểm soát nội bộ', ownerId: 'Lê Thị C', version: '1.1', status: 'ACTIVE', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'doc-8', docCode: 'IC-FORM-02', title: 'Phiếu yêu cầu hành động khắc phục (CAPA)', docType: 'FORM', category: 'Kiểm soát nội bộ', ownerId: 'Lê Thị C', version: '1.0', status: 'ACTIVE', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'doc-9', docCode: 'IC-CHK-01', title: 'Checklist đánh giá nội bộ', docType: 'CHECKLIST', category: 'Kiểm soát nội bộ', ownerId: 'Lê Thị C', version: '2.0', status: 'DRAFT', createdAt: '2024-05-10T00:00:00Z', updatedAt: '2024-05-10T00:00:00Z' },
  { id: 'doc-10', docCode: 'FM-SOP-01', title: 'Quy trình quản lý và bảo trì tài sản', docType: 'SOP', category: 'Tài sản/Cơ sở vật chất', ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE', createdAt: '2023-09-01T00:00:00Z', updatedAt: '2023-09-01T00:00:00Z' },
  { id: 'doc-11', docCode: 'FM-FORM-01', title: 'Phiếu yêu cầu sửa chữa thiết bị', docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE', createdAt: '2023-09-01T00:00:00Z', updatedAt: '2023-09-01T00:00:00Z' },
  { id: 'doc-12', docCode: 'FM-FORM-02', title: 'Biên bản bàn giao tài sản', docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', ownerId: 'Phạm Văn D', version: '1.2', status: 'ACTIVE', createdAt: '2023-09-01T00:00:00Z', updatedAt: '2023-09-01T00:00:00Z' },
  { id: 'doc-13', docCode: 'EV-SOP-01', title: 'Quy trình tiếp nhận và xử lý phản ánh', docType: 'SOP', category: 'CSKH Phụ huynh', ownerId: 'Hoàng Thị E', version: '1.1', status: 'ACTIVE', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: 'doc-14', docCode: 'EV-SOP-02', title: 'Quy trình xử lý khủng hoảng truyền thông', docType: 'SOP', category: 'Truyền thông/Sự kiện', ownerId: 'Đinh Văn F', version: '2.0', status: 'PENDING_APPROVAL', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'doc-15', docCode: 'EV-FORM-01', title: 'Mẫu Kế hoạch tổ chức sự kiện', docType: 'FORM', category: 'Truyền thông/Sự kiện', ownerId: 'Đinh Văn F', version: '1.0', status: 'ACTIVE', createdAt: '2023-10-01T00:00:00Z', updatedAt: '2023-10-01T00:00:00Z' },
];

async function seed() {
  console.log('Connecting to DB:', process.env.DATABASE_URL?.slice(0, 30) + '...');
  
  // Get existing ids
  const existing = await db.select({ id: dataFiles.id }).from(dataFiles)
    .where(and(eq(dataFiles.module, 'KNOWLEDGE'), isNull(dataFiles.deletedAt)));
  const existingIds = new Set(existing.map(r => r.id));
  console.log('Existing KNOWLEDGE docs:', existingIds.size, [...existingIds]);

  const missing = SEED_DOCUMENTS.filter(d => !existingIds.has(d.id));
  console.log('Missing docs to insert:', missing.length, missing.map(d => d.id));

  if (missing.length > 0) {
    const rows = missing.map(doc => ({
      id: doc.id,
      fileName: `${doc.docCode}.pdf`,
      originalName: doc.title,
      displayName: doc.title,
      description: doc.title,
      fileUrl: `/uploads/${doc.docCode}.pdf`,
      fileType: 'application/pdf',
      extension: 'pdf',
      fileSize: 1024,
      storageProvider: 'LOCAL',
      module: 'KNOWLEDGE',
      category: doc.category,
      documentType: doc.docType,
      status: doc.status,
      uploadedBy: 'admin',
      uploadedByName: doc.ownerId,
      version: Math.round(parseFloat(doc.version)) || 1,
      metadata: { docCode: doc.docCode, version: doc.version, ownerId: doc.ownerId },
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));

    await db.insert(dataFiles).values(rows);
    console.log('Inserted', rows.length, 'documents successfully!');
  } else {
    console.log('All docs already seeded!');
  }

  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
