"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, and, or, desc, sql, asc, inArray } from "drizzle-orm";
import { getCurrentActor, canSendMessage, canViewConversation, canDeleteMessage, canMentionAll, canMentionDepartment, writeAuditLog } from "@/src/libs/server/auth-helper";

// Verify chat access and retrieve current user
async function checkChatAccess() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("Unauthorized");
  return actor;
}

export async function getChatInitialData() {
  const actor = await checkChatAccess();

  // Fetch all active users for mention search
  const allUsers = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      role: schema.users.role,
      roleName: schema.users.roleName,
      title: schema.users.title,
      email: schema.users.email,
      departmentId: schema.users.departmentId,
    })
    .from(schema.users)
    .where(sql`status != 'DELETED'`);

  // Fetch departments for department mentions
  const allDepts = await db.select().from(schema.departments);

  // Fetch conversations the actor belongs to
  const myMemberships = await db
    .select({ conversationId: schema.chatMembers.conversationId })
    .from(schema.chatMembers)
    .where(eq(schema.chatMembers.userId, actor.id));

  const myConversationIds = myMemberships.map((m) => m.conversationId);

  let conversations: any[] = [];
  if (myConversationIds.length > 0) {
    conversations = await db
      .select()
      .from(schema.chatConversations)
      .where(inArray(schema.chatConversations.id, myConversationIds))
      .orderBy(desc(schema.chatConversations.updatedAt));
  }

  // Fetch unread messages count helper
  const conversationsWithDetails = await Promise.all(
    conversations.map(async (conv) => {
      // Fetch members of conversation
      const convMembers = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          role: schema.users.role,
        })
        .from(schema.chatMembers)
        .innerJoin(schema.users, eq(schema.chatMembers.userId, schema.users.id))
        .where(eq(schema.chatMembers.conversationId, conv.id));

      // Retrieve last message
      const [lastMessage] = await db
        .select()
        .from(schema.chatMessages)
        .where(eq(schema.chatMessages.conversationId, conv.id))
        .orderBy(desc(schema.chatMessages.createdAt))
        .limit(1);

      return {
        ...conv,
        members: convMembers,
        lastMessage: lastMessage || null,
      };
    })
  );

  return {
    actor,
    users: allUsers,
    departments: allDepts,
    conversations: conversationsWithDetails,
  };
}

export async function getConversationMessages(conversationId: string) {
  const actor = await checkChatAccess();

  // Retrieve memberships to confirm access
  const memberships = await db
    .select({ userId: schema.chatMembers.userId })
    .from(schema.chatMembers)
    .where(eq(schema.chatMembers.conversationId, conversationId));

  const memberIds = memberships.map((m) => m.userId);

  const [conversation] = await db
    .select()
    .from(schema.chatConversations)
    .where(eq(schema.chatConversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    throw new Error("Hội thoại không tồn tại");
  }

  if (!canViewConversation(actor, conversation, memberIds)) {
    throw new Error("Bạn không có quyền truy cập hội thoại này");
  }

  const messages = await db
    .select({
      id: schema.chatMessages.id,
      conversationId: schema.chatMessages.conversationId,
      senderId: schema.chatMessages.senderId,
      senderName: schema.users.name,
      senderAvatar: schema.users.avatarUrl,
      senderRole: schema.users.role,
      content: schema.chatMessages.content,
      type: schema.chatMessages.type,
      replyToMessageId: schema.chatMessages.replyToMessageId,
      isPinned: schema.chatMessages.isPinned,
      isEdited: schema.chatMessages.isEdited,
      deletedAt: schema.chatMessages.deletedAt,
      createdAt: schema.chatMessages.createdAt,
    })
    .from(schema.chatMessages)
    .innerJoin(schema.users, eq(schema.chatMessages.senderId, schema.users.id))
    .where(eq(schema.chatMessages.conversationId, conversationId))
    .orderBy(asc(schema.chatMessages.createdAt))
    .limit(100);

  return messages;
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
  replyToMessageId?: string
) {
  const actor = await checkChatAccess();

  if (!content || content.trim().length === 0) {
    return { success: false, error: "Nội dung tin nhắn không được rỗng." };
  }

  if (content.length > 5000) {
    return { success: false, error: "Tin nhắn quá dài (giới hạn 5000 ký tự)." };
  }

  const [conversation] = await db
    .select()
    .from(schema.chatConversations)
    .where(eq(schema.chatConversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    return { success: false, error: "Cuộc trò chuyện không tồn tại." };
  }

  const memberships = await db
    .select({ userId: schema.chatMembers.userId })
    .from(schema.chatMembers)
    .where(eq(schema.chatMembers.conversationId, conversationId));

  const memberIds = memberships.map((m) => m.userId);

  if (!canSendMessage(actor, conversation, memberIds)) {
    return { success: false, error: "Bạn không có quyền nhắn tin trong cuộc hội thoại này." };
  }

  // Anti-XSS Sanitization (simple strip tags)
  const cleanContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const messageId = `msg_${Math.random().toString(36).substring(2, 9)}`;

  try {
    await db.insert(schema.chatMessages).values({
      id: messageId,
      conversationId,
      senderId: actor.id,
      content: cleanContent,
      type: 'TEXT',
      replyToMessageId: replyToMessageId || null,
      isPinned: false,
      isEdited: false,
    });

    // Update conversation updatedAt timestamp to float it up in list
    await db
      .update(schema.chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(schema.chatConversations.id, conversationId));

    // Parse Mentions
    // Format: @[Name](user:id) or @[DeptName](dept:id) or @all
    const userMentionRegex = /@\[([^\]]+)\]\(user:([^\)]+)\)/g;
    const deptMentionRegex = /@\[([^\]]+)\]\(dept:([^\)]+)\)/g;
    const allMentionRegex = /@all|@toàn trường/gi;

    let match;

    // 1. User mentions
    while ((match = userMentionRegex.exec(cleanContent)) !== null) {
      const targetUserId = match[2];
      const mentionId = `mention_${Math.random().toString(36).substring(2, 9)}`;

      await db.insert(schema.chatMentions).values({
        id: mentionId,
        messageId,
        conversationId,
        mentionType: 'USER',
        mentionedUserId: targetUserId,
        createdBy: actor.id,
        createdAt: new Date(),
      });

      await db.insert(schema.chatMentionRecipients).values({
        id: `recip_${Math.random().toString(36).substring(2, 9)}`,
        mentionId,
        userId: targetUserId,
        notificationStatus: 'UNREAD',
      });
    }

    // 2. Department mentions
    while ((match = deptMentionRegex.exec(cleanContent)) !== null) {
      const deptId = match[2];
      
      if (!canMentionDepartment(actor, deptId)) {
        continue; // check authority to mention department
      }

      const mentionId = `mention_${Math.random().toString(36).substring(2, 9)}`;
      await db.insert(schema.chatMentions).values({
        id: mentionId,
        messageId,
        conversationId,
        mentionType: 'DEPARTMENT',
        mentionedDepartmentId: deptId,
        createdBy: actor.id,
        createdAt: new Date(),
      });

      // Expand to users in this department
      const deptUsers = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(and(
          eq(schema.users.departmentId, deptId),
          sql`status != 'DELETED'`
        ));

      if (deptUsers.length > 0) {
        const recipientsToInsert = deptUsers
          .filter((u) => u.id !== actor.id) // exclude sender
          .map((u) => ({
            id: `recip_${Math.random().toString(36).substring(2, 9)}`,
            mentionId,
            userId: u.id,
            notificationStatus: 'UNREAD',
            createdAt: new Date(),
          }));

        if (recipientsToInsert.length > 0) {
          await db.insert(schema.chatMentionRecipients).values(recipientsToInsert);
        }
      }
      
      await writeAuditLog(actor.id, "USE_DEPARTMENT_MENTION", "chat_conversations", conversationId, { departmentId: deptId });
    }

    // 3. School mention @all
    if (allMentionRegex.test(cleanContent) && canMentionAll(actor)) {
      const mentionId = `mention_${Math.random().toString(36).substring(2, 9)}`;
      await db.insert(schema.chatMentions).values({
        id: mentionId,
        messageId,
        conversationId,
        mentionType: 'SCHOOL',
        createdBy: actor.id,
        createdAt: new Date(),
      });

      // Expand to all active users
      const allActiveUsers = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(sql`status != 'DELETED'`);

      const recipientsToInsert = allActiveUsers
        .filter((u) => u.id !== actor.id) // exclude sender
        .map((u) => ({
          id: `recip_${Math.random().toString(36).substring(2, 9)}`,
          mentionId,
          userId: u.id,
          notificationStatus: 'UNREAD',
          createdAt: new Date(),
        }));

      if (recipientsToInsert.length > 0) {
        await db.insert(schema.chatMentionRecipients).values(recipientsToInsert);
      }
      
      await writeAuditLog(actor.id, "USE_ALL_MENTION", "chat_conversations", conversationId);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createGroupChat(name: string, memberIds: string[]) {
  const actor = await checkChatAccess();

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Tên nhóm không được rỗng." };
  }

  if (memberIds.length === 0) {
    return { success: false, error: "Vui lòng chọn ít nhất một thành viên." };
  }

  const conversationId = `conv_${Math.random().toString(36).substring(2, 9)}`;

  try {
    await db.insert(schema.chatConversations).values({
      id: conversationId,
      type: 'GROUP_CHAT',
      name,
      createdBy: actor.id,
      status: 'ACTIVE',
    });

    // Add actor as member
    const membersToInsert = [actor.id, ...memberIds].map((userId) => ({
      id: `member_${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      userId,
      role: userId === actor.id ? 'OWNER' : 'MEMBER',
      joinedAt: new Date(),
    }));

    await db.insert(schema.chatMembers).values(membersToInsert);

    await writeAuditLog(actor.id, "CREATE_CONVERSATION", "chat_conversations", conversationId, { name, memberIds });
    return { success: true, conversationId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createDirectMessageChat(targetUserId: string) {
  const actor = await checkChatAccess();

  // Check if DM already exists between actor and target
  const actorMemberships = await db
    .select({ conversationId: schema.chatMembers.conversationId })
    .from(schema.chatMembers)
    .where(eq(schema.chatMembers.userId, actor.id));

  const actorConvIds = actorMemberships.map((m) => m.conversationId);

  if (actorConvIds.length > 0) {
    const existingDm = await db
      .select({ conversationId: schema.chatMembers.conversationId })
      .from(schema.chatMembers)
      .innerJoin(schema.chatConversations, eq(schema.chatMembers.conversationId, schema.chatConversations.id))
      .where(and(
        eq(schema.chatConversations.type, 'DIRECT_MESSAGE'),
        eq(schema.chatMembers.userId, targetUserId),
        inArray(schema.chatMembers.conversationId, actorConvIds)
      ))
      .limit(1);

    if (existingDm.length > 0) {
      return { success: true, conversationId: existingDm[0].conversationId };
    }
  }

  const conversationId = `conv_${Math.random().toString(36).substring(2, 9)}`;

  try {
    await db.insert(schema.chatConversations).values({
      id: conversationId,
      type: 'DIRECT_MESSAGE',
      name: null,
      createdBy: actor.id,
      status: 'ACTIVE',
    });

    await db.insert(schema.chatMembers).values([
      {
        id: `member_${Math.random().toString(36).substring(2, 9)}`,
        conversationId,
        userId: actor.id,
        role: 'MEMBER',
        joinedAt: new Date(),
      },
      {
        id: `member_${Math.random().toString(36).substring(2, 9)}`,
        conversationId,
        userId: targetUserId,
        role: 'MEMBER',
        joinedAt: new Date(),
      }
    ]);

    return { success: true, conversationId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function softDeleteMessageAction(messageId: string) {
  const actor = await checkChatAccess();

  const [message] = await db
    .select()
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.id, messageId))
    .limit(1);

  if (!message) {
    return { success: false, error: "Tin nhắn không tồn tại." };
  }

  const [conversation] = await db
    .select()
    .from(schema.chatConversations)
    .where(eq(schema.chatConversations.id, message.conversationId))
    .limit(1);

  if (!canDeleteMessage(actor, message, conversation)) {
    return { success: false, error: "Bạn không có quyền xóa tin nhắn này." };
  }

  try {
    await db
      .update(schema.chatMessages)
      .set({
        deletedAt: new Date(),
        deletedBy: actor.id,
        content: "Tin nhắn đã bị xóa",
      })
      .where(eq(schema.chatMessages.id, messageId));

    await writeAuditLog(actor.id, "DELETE_MESSAGE", "chat_messages", messageId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
