"use server";

import { db, schema } from "@/src/libs/server/db";
import { revalidatePath } from "next/cache";
import { getCurrentActor, isAdminTruong, isTruongPhong, writeAuditLog } from "@/src/libs/server/auth-helper";
import { getJsonSetting, setJsonSetting } from "@/src/libs/server/module-settings";

const OKR_SETTINGS_KEY = 'okr:customize_settings';
const defaultOkrSettings = {
  defaultWorkspace: 'ALL',
  defaultPillar: 'ALL',
  showAlerts: true,
  showFollowUps: true,
  confidenceThreshold: 6,
};

function canManageOkr(actor: Awaited<ReturnType<typeof getCurrentActor>>) {
  return !!actor && (isAdminTruong(actor) || isTruongPhong(actor) || actor.workspaceId === 'BGH');
}

const pillarMap: Record<string, { name: string; desc: string; color: string }> = {
  TUYEN_SINH_PR: { name: 'Tuyển sinh', desc: 'Mở rộng quy mô - Nâng cao chất lượng đầu vào', color: 'bg-blue-600' },
  TOAN_TIN: { name: 'Đào tạo', desc: 'Nâng cao chất lượng dạy & học', color: 'bg-purple-600' },
  VAN: { name: 'Đào tạo', desc: 'Nâng cao chất lượng dạy & học', color: 'bg-purple-600' },
  NGOAI_NGU: { name: 'Đào tạo', desc: 'Nâng cao chất lượng dạy & học', color: 'bg-purple-600' },
  KHTN: { name: 'Đào tạo', desc: 'Nâng cao chất lượng dạy & học', color: 'bg-purple-600' },
  LS_DL: { name: 'Đào tạo', desc: 'Nâng cao chất lượng dạy & học', color: 'bg-purple-600' },
  HANH_CHINH: { name: 'Vận hành', desc: 'Hiệu quả - Chuẩn hóa - Chuyển đổi số', color: 'bg-orange-500' },
  BGH: { name: 'Nhân sự', desc: 'Phát triển đội ngũ - Trao quyền - Gắn kết', color: 'bg-sky-500' },
};

export async function getInitialData() {
  try {
    const [tasks, users, workspaces] = await Promise.all([
      db.select().from(schema.tasks),
      db.select().from(schema.users),
      db.select().from(schema.workspaces),
    ]);

    const pillars = new Map<string, any>();
    for (const task of tasks) {
      const meta = pillarMap[task.workspaceId] || { name: 'Vận hành', desc: 'Hiệu quả - Chuẩn hóa - Chuyển đổi số', color: 'bg-slate-600' };
      const key = meta.name;
      const current = pillars.get(key) || {
        key,
        name: meta.name,
        desc: meta.desc,
        color: meta.color,
        total: 0,
        done: 0,
        risk: 0,
        objectives: new Set<string>(),
        owners: new Map<string, number>(),
        workspaces: new Set<string>(),
      };
      current.total += 1;
      if (task.status === 'HOAN_THANH') current.done += 1;
      if (task.priority === 'CAO' && task.status !== 'HOAN_THANH') current.risk += 1;
      current.objectives.add(task.tag || task.workspaceId);
      current.owners.set(task.assignedId, (current.owners.get(task.assignedId) || 0) + 1);
      current.workspaces.add(task.workspaceId);
      pillars.set(key, current);
    }

    const userNameById = new Map(users.map(user => [user.id, { name: user.name, title: user.title || user.roleName || user.role }]));
    const pillarRows = Array.from(pillars.values()).map(pillar => {
      const ownerId = Array.from(pillar.owners.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
      const owner = ownerId ? userNameById.get(ownerId) : null;
      const progress = pillar.total ? Math.round((pillar.done / pillar.total) * 100) : 0;
      return {
        ...pillar,
        objectives: pillar.objectives.size,
        keyResults: pillar.total,
        doneKeyResults: pillar.done,
        progress,
        confidence: Math.max(4.5, Math.min(9.2, Math.round((progress / 10 + (pillar.risk ? -0.8 : 0.7)) * 10) / 10)),
        status: pillar.risk > 0 ? 'Có rủi ro' : progress >= 70 ? 'Đúng tiến độ' : 'Cần theo dõi',
        ownerName: owner?.name || 'Chưa phân công',
        ownerRole: owner?.title || '',
        workspaceCount: pillar.workspaces.size,
        workspaces: Array.from(pillar.workspaces),
      };
    });

    const total = tasks.length;
    const done = tasks.filter(task => task.status === 'HOAN_THANH').length;
    const inProgress = tasks.filter(task => task.status === 'DANG_TIEN_HANH').length;
    const notStarted = tasks.filter(task => task.status === 'CHUA_BAT_DA').length;
    const risk = tasks.filter(task => task.priority === 'CAO' && task.status !== 'HOAN_THANH').length;
    const progress = total ? Math.round((done / total) * 100) : 0;
    const alerts = tasks
      .filter(task => task.priority === 'CAO' && task.status !== 'HOAN_THANH')
      .map(task => ({ id: task.id, title: task.title, workspaceId: task.workspaceId, deadline: task.deadline, type: 'risk' }));
    const followUps = tasks
      .filter(task => task.status !== 'HOAN_THANH')
      .map(task => ({ id: task.id, title: task.title, assignedName: task.assignedName, deadline: task.deadline, urgent: task.priority === 'CAO', workspaceId: task.workspaceId }));

    return {
      okrSettings: await getJsonSetting(OKR_SETTINGS_KEY, defaultOkrSettings),
      stats: {
        total,
        done,
        inProgress,
        notStarted,
        risk,
        progress,
        onTrack: total ? Math.round(((total - risk) / total) * 100) : 0,
        linkedKpis: total + workspaces.length,
      },
      pillars: pillarRows,
      alerts,
      followUps,
      workspaces,
    };
  } catch (e) {
    console.error('OKR getInitialData failed', e);
    return { okrSettings: defaultOkrSettings, stats: { total: 0, done: 0, inProgress: 0, notStarted: 0, risk: 0, progress: 0, onTrack: 0, linkedKpis: 0 }, pillars: [], alerts: [], followUps: [], workspaces: [] };
  }
}

export async function saveOkrSettings(settings: typeof defaultOkrSettings) {
  try {
    const actor = await getCurrentActor();
    if (!canManageOkr(actor)) return { success: false, error: 'Unauthorized' };
    const next = { ...defaultOkrSettings, ...settings };
    await setJsonSetting(OKR_SETTINGS_KEY, next, {
      group: 'okr',
      label: 'OKR customize settings',
      description: 'Default OKR filters and widgets',
      updatedBy: actor?.id,
    });
    await writeAuditLog(actor?.id || null, 'save_okr_settings', 'okr', OKR_SETTINGS_KEY, { after: next, module: 'okr' });
    revalidatePath('/[locale]/okr', 'layout');
    return { success: true, data: next };
  } catch (e: any) {
    console.error('Save OKR settings failed', e);
    return { success: false, error: e.message };
  }
}
