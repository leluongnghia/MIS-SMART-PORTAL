'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, UserPlus } from 'lucide-react';
import { getUserPermissionsMatrix, saveUserPermissionsMatrix } from '../actions';

export default function UserPermissionsClient({ users }: { users: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string>('');

  useEffect(() => {
    if (selectedUserId) {
      loadMatrix(selectedUserId);
    } else {
      setMatrix([]);
    }
  }, [selectedUserId]);

  const loadMatrix = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getUserPermissionsMatrix(userId);
      setMatrix(data);
      
      // Auto fill expiresAt from first granted permission if exists
      let foundExpires = false;
      for (const m of data) {
        for (const f of m.features) {
          for (const p of f.permissions) {
            if (p.granted && p.expiresAt) {
              // format to yyyy-MM-ddThh:mm
              setExpiresAt(p.expiresAt.substring(0, 16));
              foundExpires = true;
              break;
            }
          }
          if (foundExpires) break;
        }
        if (foundExpires) break;
      }
      if (!foundExpires) setExpiresAt('');
      
    } catch (error) {
      alert('Lỗi khi tải ma trận quyền');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (moduleId: string, featureId: string, permissionId: string) => {
    setMatrix(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        features: m.features.map((f: any) => {
          if (f.id !== featureId) return f;
          return {
            ...f,
            permissions: f.permissions.map((p: any) => {
              if (p.id !== permissionId) return p;
              return { ...p, granted: !p.granted };
            })
          };
        })
      };
    }));
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    
    const grantedIds: string[] = [];
    matrix.forEach(m => {
      m.features.forEach((f: any) => {
        f.permissions.forEach((p: any) => {
          if (p.granted) grantedIds.push(p.id);
        });
      });
    });

    setSaving(true);
    try {
      // Need ISO string
      let expires = null;
      if (expiresAt) {
        expires = new Date(expiresAt).toISOString();
      }
      await saveUserPermissionsMatrix(selectedUserId, grantedIds, expires);
      alert('Đã lưu quyền cá nhân thành công');
      loadMatrix(selectedUserId); // Reload to get fresh data
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Phân quyền cá nhân tạm thời</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cấp quyền đặc biệt cho cá nhân với thời hạn cụ thể</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedUserId && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu quyền'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Chọn nhân sự
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">-- Chọn nhân sự --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Thời gian hết hạn
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1">Bỏ trống nếu muốn quyền vĩnh viễn</p>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Đang tải ma trận quyền...</div>
          ) : selectedUserId ? (
            <div className="space-y-6">
              {matrix.map((mod) => (
                <div key={mod.id} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-500" />
                      {mod.name}
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {mod.features.map((feat: any) => (
                      <div key={feat.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-48 shrink-0 font-medium text-sm text-slate-700 dark:text-slate-300">
                          {feat.name}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {feat.permissions.map((perm: any) => (
                            <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded pr-3">
                              <input
                                type="checkbox"
                                checked={perm.granted}
                                onChange={() => handleToggle(mod.id, feat.id, perm.id)}
                                className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              />
                              <span className={perm.granted ? 'text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                                {perm.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-800">
              <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Vui lòng chọn nhân sự để xem và cấp quyền</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
