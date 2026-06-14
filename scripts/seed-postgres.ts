import { db, pgliteClient, schema } from '../src/libs/server/db';
import { INITIAL_TASKS, MOCK_USERS, WORKSPACES } from '../src/mockData';

const now = new Date();

async function seed() {
  await db.insert(schema.workspaces).values(
    WORKSPACES.map((workspace: any) => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || '',
      color: workspace.color || '',
      iconName: workspace.iconName || '',
      payload: workspace,
      createdAt: now,
      updatedAt: now,
    })),
  ).onConflictDoNothing();

  await db.insert(schema.users).values(
    MOCK_USERS.map((user: any) => ({
      id: user.id,
      clerkUserId: null,
      name: user.name,
      role: user.role,
      roleName: user.roleName || '',
      title: user.title || '',
      email: user.email || user.personalEmail || null,
      workspaceId: user.workspaceId || '',
      payload: user,
      createdAt: now,
      updatedAt: now,
    })),
  ).onConflictDoNothing();

  await db.insert(schema.tasks).values(
    INITIAL_TASKS.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      workspaceId: task.workspaceId,
      assignedId: task.assignedId,
      assignedName: task.assignedName || '',
      status: task.status,
      priority: task.priority,
      deadline: task.deadline || '',
      tag: task.tag || '',
      payload: task,
      createdAt: now,
      updatedAt: now,
    })),
  ).onConflictDoNothing();

  await db.insert(schema.rbacConfig).values({
    id: 'default',
    config: {},
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  await db.insert(schema.userOverrides).values({
    id: 'default',
    overrides: {},
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  console.log(`Seeded ${WORKSPACES.length} workspaces, ${MOCK_USERS.length} users, ${INITIAL_TASKS.length} tasks.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pgliteClient.close();
});
