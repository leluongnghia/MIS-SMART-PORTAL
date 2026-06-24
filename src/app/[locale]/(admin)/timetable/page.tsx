import AcademicOperations from '@/src/components/AcademicOperations';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { db, schema } from '@/src/libs/server/db';
import { redirect } from 'next/navigation';

export default async function TimetablePage() {
  const actor = await getCurrentActor();
  if (!actor) redirect('/login');

  const users = await db.select().from(schema.users);
  
  // Transform users to match UserProfile type expected by AcademicOperations
  const mappedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as any,
    roleName: '',
    title: '',
    avatar: u.avatarUrl || '',
    departmentId: u.departmentId || '',
    workspaceId: u.workspaceId || ''
  }));

  const currentUser = mappedUsers.find(u => u.id === actor.id) || {
    id: actor.id,
    name: actor.name,
    email: '',
    role: actor.role as any,
    roleName: '',
    title: '',
    avatar: '',
    departmentId: actor.departmentId || '',
    workspaceId: actor.workspaceId || ''
  };

  return <AcademicOperations currentUser={currentUser} users={mappedUsers} />;
}
