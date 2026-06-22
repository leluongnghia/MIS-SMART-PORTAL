'use client';

import { useState, useEffect } from 'react';
import { serverStorage } from '../../../../libs/client/server-storage';
import { MOCK_USERS } from '@/src/mockData';
import type { UserProfile } from '@/src/types';
import HrmCenter from '@/src/components/HrmCenter';

export default function HrmClient({ initialData }: { initialData?: any }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Get logged-in user profile
    const savedUserId = serverStorage.getItem('mis_edutask_logged_in_user_id');
    if (savedUserId) {
      const matched = users.find(u => u.id === savedUserId) || MOCK_USERS.find(u => u.id === savedUserId);
      if (matched) {
        setCurrentUser(matched as UserProfile);
      }
    }
    
    // Check if initialData has employees, update users
    if (initialData?.employees && initialData.employees.length > 0) {
      // Just mock mapping logic here if needed
    }

    setIsLoaded(true);
  }, []);

  // Simple RBAC check mock
  const hasCapability = (capability: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN' || currentUser.workspaceId === 'BGH') return true;
    return false;
  };

  if (!isLoaded || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <HrmCenter 
        currentUser={currentUser}
        users={users}
        onUpdateUsers={setUsers}
        hasCapability={hasCapability}
      />
    </div>
  );
}
