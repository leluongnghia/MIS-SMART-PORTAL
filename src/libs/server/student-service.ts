import { DataService } from './data-service';
import { db, schema } from './db';
import { eq } from 'drizzle-orm';

class StudentService extends DataService<'studentDirectory'> {
  constructor() {
    super('studentDirectory');
  }

  // Add specific business logic for students if needed
  public async getByClass(className: string) {
    return this.findMany({
      where: eq(schema.studentDirectory.className, className),
    });
  }

  public async changeStatus(id: string, newStatus: string, reason: string) {
    const { createApprovalRequest } = await import('./approval-engine');
    const { getCurrentActor, writeAuditLog } = await import('./auth-helper');
    
    const actor = await getCurrentActor();
    if (!actor) throw new Error('UNAUTHORIZED');

    const student = await this.findById(id);
    if (!student) throw new Error('NOT_FOUND');

    const oldStatus = student.payload?.status || 'Đang học';
    
    if (actor.role === 'ADMIN' || actor.workspaceId === 'BGH') {
      // Direct update for admin/BGH
      const newPayload = { ...student.payload, status: newStatus };
      const updated = await this.update(id, { payload: newPayload });
      
      await writeAuditLog(
        actor.id, 
        'STUDENT_STATUS_CHANGED', 
        'STUDENT', 
        id, 
        { oldStatus, newStatus, reason }
      );
      
      return { success: true, student: updated, message: 'Đã cập nhật trạng thái học sinh.' };
    } else {
      // Create approval request
      const approval = await createApprovalRequest({
        module: 'STUDENTS',
        entityType: 'STUDENT',
        entityId: id,
        title: `Yêu cầu cập nhật trạng thái học sinh: ${student.name}`,
        description: `Lý do: ${reason}. Trạng thái cũ: ${oldStatus}. Trạng thái mới: ${newStatus}.`,
        approverWorkspaceId: 'BGH', // Requires BGH approval
        payload: { oldStatus, newStatus, reason }
      }, actor);

      return { success: true, approval, message: 'Đã gửi yêu cầu phê duyệt lên BGH.' };
    }
  }
}

export const studentService = new StudentService();
