import { MOCK_USERS } from '../../mockData';
import { UserProfile } from '../../types';

// Helper to get authenticated user on the server side
async function getApiUser(req: Request): Promise<UserProfile | null> {
  // 1. Try Clerk if configured
  if (process.env.CLERK_SECRET_KEY) {
    try {
      const { auth } = require('@clerk/nextjs/server');
      const authObj = await auth();
      if (authObj?.userId) {
        // Find matching mock user by clerkUserId or email
        const matched = MOCK_USERS.find(
          u => u.id === authObj.userId || u.email === authObj.sessionClaims?.email
        );
        if (matched) return matched;

        // Fallback for new authenticated user
        return {
          id: authObj.userId,
          name: authObj.sessionClaims?.name || 'Cán bộ Clerk',
          role: 'ADMIN', // default to admin for setup
          roleName: 'Cán bộ Ban Giám hiệu',
          title: 'Cán bộ liên kết Clerk',
          avatar: '',
          workspaceId: 'BGH'
        };
      }
    } catch (e) {
      console.error('Clerk server-side authentication failed:', e);
    }
  }

  // 2. Try simulated auth via x-user-id header
  const headers = req.headers;
  const userId = headers.get('x-user-id') || headers.get('X-User-Id');
  if (userId) {
    const matched = MOCK_USERS.find(u => u.id === userId);
    if (matched) return matched;
  }

  return null;
}

// Guard function to verify role and optional permission/workspace
export async function verifyApiAuth(
  req: Request,
  options: {
    requiredRole?: 'ADMIN' | 'MANAGER' | 'STAFF' | 'PARENT' | 'STUDENT';
    requiredWorkspace?: string;
  } = {}
): Promise<{ user: UserProfile | null; errorResponse: Response | null }> {
  const user = await getApiUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ status: 'error', error: 'Unauthorized. Please login.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  // ADMIN and BGH workspace bypass all restrictions
  if (user.role === 'ADMIN' || user.workspaceId === 'BGH') {
    return { user, errorResponse: null };
  }

  // Check requiredRole
  if (options.requiredRole && user.role !== options.requiredRole) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ status: 'error', error: 'Forbidden. Insufficient permissions.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  // Check requiredWorkspace
  if (options.requiredWorkspace && user.workspaceId !== options.requiredWorkspace) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ status: 'error', error: 'Forbidden. Cross-department access denied.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  return { user, errorResponse: null };
}
