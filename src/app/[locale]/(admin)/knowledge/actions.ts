'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { DocumentItem } from '@/src/types';

// The 15 mock documents from KnowledgeManagement
const SEED_DOCUMENTS = [
  {
    id: 'doc-1', docCode: 'HR-SOP-01', title: 'Quy trình xin nghỉ phép và phê duyệt',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '2.1', status: 'ACTIVE',
    effectiveDate: '2024-01-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['nghỉ phép', 'HR', 'SOP'],
    relatedModules: ['WORKFLOW_APPROVALS', 'HRM'], createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z', createdBy: 'admin', timeline: [],
    purpose: 'Chuẩn hóa quy trình xin nghỉ phép, đảm bảo quyền lợi và tiến độ công việc.',
  },
  {
    id: 'doc-2', docCode: 'HR-FORM-01', title: 'Mẫu đơn xin nghỉ phép',
    docType: 'FORM', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '2.0', status: 'ACTIVE',
    effectiveDate: '2024-01-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['nghỉ phép', 'biểu mẫu'],
    relatedModules: ['WORKFLOW_APPROVALS'], createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-3', docCode: 'HR-SOP-02', title: 'Quy trình bàn giao và nghỉ việc',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '1.5', status: 'NEEDS_REVIEW',
    effectiveDate: '2023-06-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['nghỉ việc', 'bàn giao'],
    relatedModules: ['HRM', 'LOGISTICS'], createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-4', docCode: 'HR-FORM-02', title: 'Biên bản bàn giao công việc',
    docType: 'FORM', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '1.2', status: 'ACTIVE',
    effectiveDate: '2023-06-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['nghỉ việc', 'biểu mẫu'],
    relatedModules: ['HRM'], createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-5', docCode: 'HR-SOP-03', title: 'Quy trình đào tạo hội nhập',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng Đào tạo',
    ownerId: 'Trần Văn B', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2024-03-15', priority: 'Bình thường',
    targetAudience: ['HCNS', 'Giáo viên', 'Nhân viên'], tags: ['đào tạo', 'hội nhập'],
    relatedModules: ['HRM'], createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-6', docCode: 'IC-SOP-01', title: 'Quy trình kiểm soát nội bộ định kỳ',
    docType: 'SOP', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '3.0', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'HCNS'], tags: ['kiểm soát', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-7', docCode: 'IC-FORM-01', title: 'Phiếu ghi nhận điểm không phù hợp (NC)',
    docType: 'FORM', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '1.1', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['NC', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-8', docCode: 'IC-FORM-02', title: 'Phiếu yêu cầu hành động khắc phục (CAPA)',
    docType: 'FORM', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS'], tags: ['CAPA', 'khắc phục'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-9', docCode: 'IC-CHK-01', title: 'Checklist đánh giá nội bộ',
    docType: 'CHECKLIST', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '2.0', status: 'DRAFT',
    effectiveDate: '', priority: 'Bình thường',
    targetAudience: ['BGH', 'HCNS'], tags: ['checklist', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2024-05-10T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-10', docCode: 'FM-SOP-01', title: 'Quy trình quản lý và bảo trì tài sản',
    docType: 'SOP', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Nhân viên'], tags: ['tài sản', 'bảo trì'],
    relatedModules: ['LOGISTICS'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-11', docCode: 'FM-FORM-01', title: 'Phiếu yêu cầu sửa chữa thiết bị',
    docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['sửa chữa', 'thiết bị'],
    relatedModules: ['LOGISTICS', 'WORKFLOW_APPROVALS'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-12', docCode: 'FM-FORM-02', title: 'Biên bản bàn giao tài sản',
    docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.2', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Bình thường',
    targetAudience: ['HCNS', 'Giáo viên', 'Nhân viên'], tags: ['tài sản', 'bàn giao'],
    relatedModules: ['LOGISTICS', 'HRM'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-13', docCode: 'EV-SOP-01', title: 'Quy trình tiếp nhận và xử lý phản ánh',
    docType: 'SOP', category: 'CSKH Phụ huynh', departmentOwner: 'Phòng Dịch vụ Học đường',
    ownerId: 'Hoàng Thị E', version: '1.1', status: 'ACTIVE',
    effectiveDate: '2024-01-15', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['phản ánh', 'CSKH', 'ticket'],
    relatedModules: ['EVENTS', 'RISK_CENTER'], createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z', createdBy: 'admin', timeline: [],
    purpose: 'Chuẩn hóa việc tiếp nhận, xác minh và xử lý khiếu nại của phụ huynh học sinh.',
  },
  {
    id: 'doc-14', docCode: 'EV-SOP-02', title: 'Quy trình xử lý khủng hoảng truyền thông',
    docType: 'SOP', category: 'Truyền thông/Sự kiện', departmentOwner: 'Phòng Truyền thông',
    ownerId: 'Đinh Văn F', version: '2.0', status: 'PENDING_APPROVAL',
    effectiveDate: '', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'Truyền thông'], tags: ['khủng hoảng', 'truyền thông'],
    relatedModules: ['EVENTS', 'RISK_CENTER', 'BOARD_DIRECTIVES'], createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
    purpose: 'Xác định các bước phản ứng nhanh khi có tin tức tiêu cực hoặc khủng hoảng ảnh hưởng uy tín nhà trường.',
  },
  {
    id: 'doc-15', docCode: 'EV-FORM-01', title: 'Mẫu Kế hoạch tổ chức sự kiện',
    docType: 'FORM', category: 'Truyền thông/Sự kiện', departmentOwner: 'Phòng Truyền thông',
    ownerId: 'Đinh Văn F', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-10-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['sự kiện', 'kế hoạch'],
    relatedModules: ['EVENTS', 'WORKFLOW_APPROVALS'], createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2023-10-01T00:00:00Z', createdBy: 'admin', timeline: [],
  }
];

export async function getKnowledgeDocuments(): Promise<DocumentItem[]> {
  try {
    // Upsert each seed document by id (ensures all docs exist even if DB was partially seeded)
    const existingIds = await db
      .select({ id: schema.dataFiles.id })
      .from(schema.dataFiles)
      .where(and(eq(schema.dataFiles.module, 'KNOWLEDGE'), isNull(schema.dataFiles.deletedAt)));

    const existingIdSet = new Set(existingIds.map(r => r.id));
    const missing = SEED_DOCUMENTS.filter(doc => !existingIdSet.has(doc.id));

    if (missing.length > 0) {
      const seedData = missing.map(doc => {
        const ext = 'pdf';
        return {
          id: doc.id,
          fileName: `${doc.docCode}.${ext}`,
          originalName: doc.title,
          displayName: doc.title,
          description: doc.purpose || doc.title,
          fileUrl: `/uploads/${doc.docCode}.${ext}`,
          fileType: 'application/pdf',
          extension: ext,
          fileSize: 1024,
          storageProvider: 'LOCAL',
          module: 'KNOWLEDGE',
          category: doc.category,
          documentType: doc.docType,
          status: doc.status,
          uploadedBy: doc.createdBy || 'admin',
          uploadedByName: doc.ownerId || 'Ban KSNB',
          version: parseFloat(doc.version) || 1,
          metadata: {
            docCode: doc.docCode,
            purpose: doc.purpose || '',
            scope: (doc as any).scope || '',
            steps: (doc as any).steps || [],
            targetAudience: doc.targetAudience,
            departmentOwner: doc.departmentOwner,
            ownerId: doc.ownerId,
            priority: doc.priority,
            version: doc.version,
            tags: doc.tags,
            relatedModules: doc.relatedModules,
          },
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        };
      });

      await db.insert(schema.dataFiles).values(seedData as any);
    }


    const files = await db
      .select()
      .from(schema.dataFiles)
      .where(and(eq(schema.dataFiles.module, 'KNOWLEDGE'), isNull(schema.dataFiles.deletedAt)))
      .orderBy(desc(schema.dataFiles.createdAt));

    return files.map(r => {
      const meta = r.metadata as any || {};
      return {
        id: r.id,
        docCode: meta.docCode || r.id,
        title: r.displayName || r.originalName,
        docType: r.documentType as any || 'SOP',
        category: r.category as any || 'Khác',
        departmentOwner: meta.departmentOwner || r.departmentId || 'Chung',
        ownerId: meta.ownerId || r.uploadedByName || 'Hệ thống',
        version: meta.version || String(r.version),
        status: r.status as any || 'ACTIVE',
        relatedModules: meta.relatedModules || [],
        tags: meta.tags || [],
        description: r.description || undefined,
        priority: meta.priority || 'Bình thường',
        targetAudience: meta.targetAudience || [],
        content: meta.content || undefined,
        purpose: meta.purpose || undefined,
        scope: meta.scope || undefined,
        steps: meta.steps || [],
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        createdBy: r.uploadedBy || 'system',
        timeline: []
      } as DocumentItem;
    });
  } catch (error) {
    console.error('Error fetching knowledge documents:', error);
    return [];
  }
}

export async function saveKnowledgeDocument(doc: Partial<DocumentItem>): Promise<{ success: boolean; id: string }> {
  try {
    const id = doc.id || `doc_${Date.now()}`;
    const code = doc.docCode || `DOC-${Date.now().toString().slice(-4)}`;
    const ext = 'pdf';

    const dbValues = {
      id,
      fileName: `${code}.${ext}`,
      originalName: doc.title || 'Không có tiêu đề',
      displayName: doc.title || 'Không có tiêu đề',
      description: doc.purpose || doc.description || doc.title || '',
      fileUrl: `/uploads/${code}.${ext}`,
      fileType: 'application/pdf',
      extension: ext,
      fileSize: 1024,
      storageProvider: 'LOCAL',
      module: 'KNOWLEDGE',
      category: doc.category || 'Khác',
      documentType: doc.docType || 'SOP',
      status: doc.status || 'ACTIVE',
      uploadedBy: doc.createdBy || 'admin',
      uploadedByName: doc.ownerId || 'Ban KSNB',
      version: parseFloat(doc.version || '1') || 1,
      metadata: {
        docCode: code,
        purpose: doc.purpose || '',
        scope: doc.scope || '',
        steps: doc.steps || [],
        targetAudience: doc.targetAudience || [],
        departmentOwner: doc.departmentOwner || 'Chung',
        ownerId: doc.ownerId || 'Ban KSNB',
        priority: doc.priority || 'Bình thường',
        version: doc.version || '1.0',
        tags: doc.tags || [],
        relatedModules: doc.relatedModules || [],
        content: doc.content || '',
      },
      updatedAt: new Date(),
    };

    if (doc.id) {
      // Update
      await db
        .update(schema.dataFiles)
        .set(dbValues as any)
        .where(eq(schema.dataFiles.id, doc.id));
    } else {
      // Insert
      await db.insert(schema.dataFiles).values({
        ...dbValues,
        createdAt: new Date(),
      } as any);
    }

    revalidatePath('/[locale]/(admin)/knowledge', 'page');
    revalidatePath('/[locale]/(admin)/reports', 'page');
    return { success: true, id };
  } catch (error) {
    console.error('Error saving knowledge document:', error);
    throw error;
  }
}

export async function archiveKnowledgeDocument(id: string): Promise<{ success: boolean }> {
  try {
    await db
      .update(schema.dataFiles)
      .set({ 
        status: 'ARCHIVED',
        archivedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.dataFiles.id, id));

    revalidatePath('/[locale]/(admin)/knowledge', 'page');
    revalidatePath('/[locale]/(admin)/reports', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error archiving document:', error);
    throw error;
  }
}

export async function deleteKnowledgeDocument(id: string): Promise<{ success: boolean }> {
  try {
    await db
      .update(schema.dataFiles)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.dataFiles.id, id));

    revalidatePath('/[locale]/(admin)/knowledge', 'page');
    revalidatePath('/[locale]/(admin)/reports', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}
