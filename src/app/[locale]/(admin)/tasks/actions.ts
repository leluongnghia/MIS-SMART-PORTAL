"use server";

import { db, schema } from "@/src/libs/server/db";
import { getCurrentActor, writeAuditLog } from "@/src/libs/server/auth-helper";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const COMPLETED_STATUSES = new Set(["HOAN_THANH", "completed", "done", "closed"]);
const STAFF_ALLOWED_STATUS_UPDATES = new Set(["DANG_TIEN_HANH", "in_progress", "CHO_DUYET", "pending_approval"]);

function sameScope(actor: any, row: { workspaceId?: string | null; assignedId?: string | null }) {
  if (actor.role === "ADMIN" || actor.workspaceId === "BGH") return true;
  if (actor.role === "MANAGER") return Boolean(row.workspaceId && row.workspaceId === actor.workspaceId);
  return row.assignedId === actor.id;
}

export async function getInitialData() {
  const actor = await getCurrentActor();
  if (!actor) return { data: [], workspaces: [], users: [], actor: null };

  try {
    const [data, workspaces, users] = await Promise.all([
      db.select().from(schema.tasks).where(isNull(schema.tasks.deletedAt)),
      db.select().from(schema.workspaces),
      db.select().from(schema.users),
    ]);

    const scopedData = data.filter((task) => sameScope(actor, task));
    const scopedUsers = actor.role === "ADMIN" || actor.workspaceId === "BGH"
      ? users
      : users.filter((user) => user.workspaceId === actor.workspaceId || user.id === actor.id);
    const scopedWorkspaces = actor.role === "ADMIN" || actor.workspaceId === "BGH"
      ? workspaces
      : workspaces.filter((workspace) => workspace.id === actor.workspaceId);

    return { data: scopedData, workspaces: scopedWorkspaces, users: scopedUsers, actor };
  } catch (e) {
    return { data: [], workspaces: [], users: [], actor };
  }
}

export async function createTask(formData: {
  title: string;
  description?: string;
  workspaceId: string;
  assignedId: string;
  priority: string;
  deadline?: string;
  tag?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  if (actor.role === "STAFF") {
    await writeAuditLog(actor.id, "CREATE_TASK_DENIED", "TASK", "new", { success: false, reason: "STAFF cannot create tasks" });
    return { success: false, error: "Bạn không có quyền tạo công việc." };
  }

  if (actor.role !== "ADMIN" && actor.workspaceId !== "BGH" && formData.workspaceId !== actor.workspaceId) {
    await writeAuditLog(actor.id, "CREATE_TASK_DENIED", "TASK", "new", { success: false, workspaceId: formData.workspaceId });
    return { success: false, error: "Bạn không có quyền tạo công việc ngoài đơn vị của mình." };
  }

  try {
    const id = `task_${Math.random().toString(36).substring(2, 9)}`;
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, formData.assignedId))
      .limit(1);
    const assignedUser = userResult[0];

    if (!assignedUser) return { success: false, error: "Người phụ trách không tồn tại." };
    if (actor.role !== "ADMIN" && actor.workspaceId !== "BGH" && assignedUser.workspaceId !== actor.workspaceId) {
      return { success: false, error: "Không thể giao việc cho người ngoài đơn vị." };
    }

    await db.insert(schema.tasks).values({
      id,
      title: formData.title,
      description: formData.description || "",
      workspaceId: formData.workspaceId,
      assignedId: formData.assignedId,
      assignedName: assignedUser.name || "Chưa phân công",
      status: "todo",
      priority: formData.priority,
      deadline: formData.deadline || null,
      tag: formData.tag || null,
      payload: {
        createdBy: actor.id,
        comments: [],
        attachments: [],
        history: [
          {
            actorName: actor.name,
            action: "Khởi tạo công việc",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });

    await writeAuditLog(actor.id, "CREATE_TASK", "TASK", id, { title: formData.title, assignedId: formData.assignedId });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Task không tồn tại." };
    if (!sameScope(actor, task)) {
      await writeAuditLog(actor.id, "UPDATE_TASK_STATUS_DENIED", "TASK", taskId, { success: false, status });
      return { success: false, error: "Bạn không có quyền cập nhật công việc này." };
    }
    if (actor.role === "STAFF" && !STAFF_ALLOWED_STATUS_UPDATES.has(status)) {
      return { success: false, error: "Bạn không có quyền chuyển sang trạng thái này." };
    }

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Chuyển trạng thái sang "${status}"`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({ status, payload: { ...payload, history }, updatedAt: new Date() })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "UPDATE_TASK_STATUS", "TASK", taskId, { before: { status: task.status }, after: { status } });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function seedTasks(seedData: any[]) {
  const actor = await getCurrentActor();
  if (!actor || actor.role !== "ADMIN" || process.env.NODE_ENV === "production") {
    return { success: false, error: "Seed chỉ dành cho Admin trong môi trường dev." };
  }

  try {
    const existing = await db.select({ id: schema.tasks.id }).from(schema.tasks).limit(6);
    if (existing.length > 5) return { success: true, message: "Already seeded" };

    const workspaces = await db.select({ id: schema.workspaces.id }).from(schema.workspaces).limit(1);
    const users = await db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users).limit(1);

    const defaultWorkspaceId = workspaces[0]?.id || "workspace_1";
    const defaultUserId = users[0]?.id || actor.id;
    const defaultUserName = users[0]?.name || actor.name;

    for (const task of seedData) {
      await db.insert(schema.tasks).values({
        id: `task_${Math.random().toString(36).substring(2, 9)}`,
        title: task.title,
        description: `Seed data task for ${task.dept}`,
        workspaceId: defaultWorkspaceId,
        assignedId: defaultUserId,
        assignedName: defaultUserName,
        status: task.status,
        priority: task.priority,
        deadline: task.overdueDays !== undefined 
          ? new Date(Date.now() - (task.overdueDays * 24 * 60 * 60 * 1000)).toISOString()
          : new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        tag: task.tag,
        payload: {
          seededBy: actor.id,
          overdueReason: (task as any).overdueReason,
          isBlocked: (task as any).isBlocked,
          deadlineExtensionStatus: (task as any).deadlineExtensionStatus,
          proposedNewDueDate: (task as any).proposedNewDueDate 
            ? new Date(Date.now() + ((task as any).proposedNewDueDate * 24 * 60 * 60 * 1000)).toISOString() 
            : undefined,
          comments: [],
          attachments: [],
          history: [
            { actorName: actor.name, action: "Khởi tạo công việc qua seed", timestamp: new Date().toISOString() }
          ]
        },
      });
    }

    await writeAuditLog(actor.id, "SEED_TASKS", "TASK", "bulk", { count: seedData.length });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskDetail(taskId: string, formData: {
  title: string;
  description?: string;
  workspaceId: string;
  assignedId: string;
  priority: string;
  deadline?: string;
  tag?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (!sameScope(actor, task)) {
      return { success: false, error: "Bạn không có quyền chỉnh sửa công việc này." };
    }

    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, formData.assignedId))
      .limit(1);
    const assignedUser = userResult[0];
    if (!assignedUser) return { success: false, error: "Người phụ trách không tồn tại." };

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Cập nhật thông tin công việc: Giao cho ${assignedUser.name}, hạn chót ${formData.deadline || "không có"}`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        title: formData.title,
        description: formData.description || "",
        workspaceId: formData.workspaceId,
        assignedId: formData.assignedId,
        assignedName: assignedUser.name || "Chưa phân công",
        priority: formData.priority,
        deadline: formData.deadline || null,
        tag: formData.tag || null,
        payload: {
          ...payload,
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "UPDATE_TASK", "TASK", taskId, { title: formData.title, assignedId: formData.assignedId });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitTaskForApproval(taskId: string, comment?: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (task.assignedId !== actor.id && actor.role !== "ADMIN" && actor.workspaceId !== "BGH") {
      return { success: false, error: "Chỉ người phụ trách mới được gửi duyệt hoàn thành." };
    }

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: "Gửi duyệt hoàn thành công việc" + (comment ? `: "${comment}"` : ""),
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        status: "CHO_DUYET",
        payload: {
          ...payload,
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    const taskJson = { ...task, status: "CHO_DUYET", description: task.description || "Công việc đang chờ phê duyệt" };
    const { notifyApprovalRequested } = await import("@/src/libs/server/notification-center");
    const { createApprovalRequest } = await import("@/src/libs/server/approval-engine");

    await notifyApprovalRequested(taskJson, actor).catch(err => console.error(err));
    await createApprovalRequest({
      module: "TASKS",
      entityType: "TASK",
      entityId: taskId,
      title: task.title,
      description: task.description || "Gửi duyệt hoàn thành công việc",
      requesterId: actor.id,
      requesterName: actor.name,
      approverRole: "MANAGER",
      approverWorkspaceId: task.workspaceId,
      targetUrl: `/tasks`,
      payload: { task: taskJson },
    }, actor).catch(err => console.error(err));

    await writeAuditLog(actor.id, "SUBMIT_TASK_APPROVAL", "TASK", taskId, { success: true });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveTaskCompletion(taskId: string, comment?: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    
    if (actor.role !== "ADMIN" && actor.workspaceId !== "BGH" && (actor.role !== "MANAGER" || actor.workspaceId !== task.workspaceId)) {
      return { success: false, error: "Bạn không có quyền duyệt hoàn thành công việc này." };
    }

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: "Phê duyệt hoàn thành công việc" + (comment ? `: "${comment}"` : ""),
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        status: "HOAN_THANH",
        payload: {
          ...payload,
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    const { approveApprovalRequest, getApprovalRequests } = await import("@/src/libs/server/approval-engine");
    const reqs = await getApprovalRequests({ module: "TASKS", status: "PENDING" });
    const targetReq = reqs.items.find(r => r.entityId === taskId);
    if (targetReq) {
      await approveApprovalRequest(targetReq.id, comment || "Duyệt thông qua");
    }

    await writeAuditLog(actor.id, "APPROVE_TASK_COMPLETION", "TASK", taskId, { comment });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectTaskCompletion(taskId: string, comment: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };
  if (!comment?.trim()) return { success: false, error: "Ý kiến nhận xét/yêu cầu chỉnh sửa là bắt buộc." };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    
    if (actor.role !== "ADMIN" && actor.workspaceId !== "BGH" && (actor.role !== "MANAGER" || actor.workspaceId !== task.workspaceId)) {
      return { success: false, error: "Bạn không có quyền từ chối phê duyệt công việc này." };
    }

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Từ chối hoàn thành (yêu cầu sửa đổi): "${comment}"`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        status: "DANG_TIEN_HANH",
        payload: {
          ...payload,
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    const { rejectApprovalRequest, getApprovalRequests } = await import("@/src/libs/server/approval-engine");
    const reqs = await getApprovalRequests({ module: "TASKS", status: "PENDING" });
    const targetReq = reqs.items.find(r => r.entityId === taskId);
    if (targetReq) {
      await rejectApprovalRequest(targetReq.id, comment);
    }

    await writeAuditLog(actor.id, "REJECT_TASK_COMPLETION", "TASK", taskId, { comment });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTaskComment(taskId: string, commentText: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };
  if (!commentText?.trim()) return { success: false, error: "Bình luận không được để trống." };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (!sameScope(actor, task)) return { success: false, error: "Không có quyền bình luận trên công việc này." };

    const payload = (task.payload || {}) as Record<string, any>;
    const comments = payload.comments || [];
    const newComment = {
      authorId: actor.id,
      authorName: actor.name,
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);

    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: "Thêm bình luận",
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        payload: {
          ...payload,
          comments,
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "ADD_TASK_COMMENT", "TASK", taskId, { success: true });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTaskAttachment(taskId: string, file: { name: string; url: string }) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (!sameScope(actor, task)) return { success: false, error: "Không có quyền đính kèm file trên công việc này." };

    const payload = (task.payload || {}) as Record<string, any>;
    const attachments = payload.attachments || [];
    attachments.push({
      name: file.name,
      url: file.url,
      uploadedAt: new Date().toISOString(),
    });

    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Đính kèm tệp: ${file.name}`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        payload: {
          ...payload,
          attachments,
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "ADD_TASK_ATTACHMENT", "TASK", taskId, { fileName: file.name });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// OVERDUE WORKFLOW ACTIONS

export async function updateOverdueReason(taskId: string, reason: string, isBlocked: boolean) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (!sameScope(actor, task)) return { success: false, error: "Không có quyền cập nhật công việc này." };

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Cập nhật lý do quá hạn: ${reason}${isBlocked ? " (Đánh dấu bị chặn)" : ""}`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        payload: {
          ...payload,
          overdueReason: reason,
          isBlocked,
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "UPDATE_OVERDUE_REASON", "TASK", taskId, { reason, isBlocked });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestDeadlineExtension(taskId: string, newDueDate: string, reason: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (!sameScope(actor, task)) return { success: false, error: "Không có quyền xin gia hạn." };

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Xin gia hạn đến ${newDueDate}. Lý do: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        payload: {
          ...payload,
          proposedNewDueDate: newDueDate,
          deadlineExtensionStatus: "PENDING",
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    // Todo: Integrate with Notification Center / Approval Engine properly if full flow requires it.
    await writeAuditLog(actor.id, "REQUEST_DEADLINE_EXTENSION", "TASK", taskId, { newDueDate, reason });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveDeadlineExtension(taskId: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (!sameScope(actor, task)) return { success: false, error: "Không có quyền phê duyệt gia hạn." }; // In real app, check if user is manager

    const payload = (task.payload || {}) as Record<string, any>;
    const proposedNewDueDate = payload.proposedNewDueDate;
    
    if (!proposedNewDueDate || payload.deadlineExtensionStatus !== "PENDING") {
      return { success: false, error: "Không có yêu cầu gia hạn nào đang chờ xử lý." };
    }

    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Duyệt gia hạn đến ${proposedNewDueDate}`,
      timestamp: new Date().toISOString(),
    });

    // We clear proposed new date and status, and set new deadline
    await db
      .update(schema.tasks)
      .set({
        deadline: proposedNewDueDate,
        payload: {
          ...payload,
          proposedNewDueDate: null,
          deadlineExtensionStatus: "APPROVED",
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "APPROVE_DEADLINE_EXTENSION", "TASK", taskId, { newDueDate: proposedNewDueDate });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectDeadlineExtension(taskId: string, reason: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };
    if (!sameScope(actor, task)) return { success: false, error: "Không có quyền từ chối gia hạn." }; // In real app, check if user is manager

    const payload = (task.payload || {}) as Record<string, any>;
    
    if (payload.deadlineExtensionStatus !== "PENDING") {
      return { success: false, error: "Không có yêu cầu gia hạn nào đang chờ xử lý." };
    }

    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Từ chối gia hạn. Lý do: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        payload: {
          ...payload,
          proposedNewDueDate: null,
          deadlineExtensionStatus: "REJECTED",
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "REJECT_DEADLINE_EXTENSION", "TASK", taskId, { reason });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function escalateTask(taskId: string, level: string, message: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Leo thang cấp ${level}. Ghi chú: ${message}`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        payload: {
          ...payload,
          escalatedAt: new Date().toISOString(),
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "ESCALATE_TASK", "TASK", taskId, { level, message });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function remindTask(taskId: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Công việc không tồn tại." };

    const payload = (task.payload || {}) as Record<string, any>;
    const history = payload.history || [];
    history.push({
      actorName: actor.name,
      action: `Nhắc việc người phụ trách`,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(schema.tasks)
      .set({
        payload: {
          ...payload,
          lastReminderAt: new Date().toISOString(),
          history,
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "REMIND_TASK", "TASK", taskId, {});
    revalidatePath("/[locale]/tasks", "page");
    return { success: true, message: "Đã gửi nhắc việc thành công." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
