export type SettingStatus = 'active' | 'inactive' | 'draft';

export interface BaseSetting {
  id: string;
  name: string;
  status: SettingStatus;
  campusId: string;
  campusName: string;
  schoolYear: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface GeneralSetting extends BaseSetting {
  term: string;
  services: {
    meals: boolean;
    transport: boolean;
    health: boolean;
    facilities: boolean;
    boarding: boolean;
  };
  requestCutoffTime: string;
  slaNormal: number;
  slaHigh: number;
  slaUrgent: number;
  autoAssignHealthTickets: boolean;
  autoSendReports: boolean;
}

export interface ServiceStaffAssignment extends Omit<BaseSetting, 'status'> {
  status: 'active' | 'locked' | 'expired';
  staffId: string;
  staffName: string;
  staffCode: string;
  department: string;
  serviceId: string; // meals, transport, health, facilities, boarding
  role: 'manager' | 'handler' | 'approver' | 'follower';
  scope: 'all' | 'campus' | 'route' | 'meal_group' | 'area';
  inheritedPermissions: string[]; // VD: ['view', 'create', 'edit', 'delete', 'approve', 'export']
  startDate: string;
  endDate: string;
  notes: string;
}

export interface ApprovalWorkflow extends BaseSetting {
  requestType: string;
  levels: Array<{
    levelId: string;
    roleType: 'creator' | 'handler' | 'manager' | 'board';
    slaHours: number;
    autoEscalate: boolean;
  }>;
}

export interface MealParameter extends BaseSetting {
  mealType: string; // 'breakfast', 'lunch', 'snack'
  unitPrice: number;
  supplier: string;
  allergiesList: string[];
  cutoffHours: number;
}

export interface TransportParameter extends BaseSetting {
  routeCode: string;
  direction: 'twoway' | 'pickup' | 'dropoff';
  stops: Array<{
    id: string;
    address: string;
    estimatedTime: string;
    orderIndex: number;
  }>;
  vehicle: {
    plateNumber: string;
    capacity: number;
  };
  staff: {
    driverName: string;
    driverPhone: string;
    assistantName: string;
    assistantPhone: string;
  };
  fees: {
    monthly: number;
    term: number;
    yearly: number;
  };
  schedule: {
    pickupStartTime: string;
    dropoffStartTime: string;
  };
}

export type SettingTypeMap = {
  service_general_settings: GeneralSetting;
  service_staff_assignments: ServiceStaffAssignment;
  service_approval_workflows: ApprovalWorkflow;
  service_meal_parameters: MealParameter;
  service_transport_parameters: TransportParameter;
};

const DEFAULT_DATA: { [K in keyof SettingTypeMap]: SettingTypeMap[K][] } = {
  service_general_settings: [
    {
      id: 'gen-001',
      name: 'Cấu hình chung NH 2026-2027',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở Chính',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      term: 'Học kỳ 1',
      services: {
        meals: true,
        transport: true,
        health: true,
        facilities: true,
        boarding: false,
      },
      requestCutoffTime: '15:00',
      slaNormal: 24,
      slaHigh: 8,
      slaUrgent: 2,
      autoAssignHealthTickets: true,
      autoSendReports: true,
    }
  ],
  service_staff_assignments: [
    {
      id: 'assign-001',
      name: 'Nguyễn Văn A - Xe đưa đón',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở 1',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      staffId: 'staff-001',
      staffName: 'Nguyễn Văn A',
      staffCode: 'NV001',
      department: 'Phòng Hành chính',
      serviceId: 'transport',
      role: 'manager',
      scope: 'campus',
      inheritedPermissions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      notes: ''
    },
    {
      id: 'assign-002',
      name: 'Trần Thị B - Bếp ăn',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở Chính',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      staffId: 'staff-002',
      staffName: 'Trần Thị B',
      staffCode: 'NV002',
      department: 'Phòng Kế toán',
      serviceId: 'meals',
      role: 'handler',
      scope: 'all',
      inheritedPermissions: ['view', 'create', 'edit'],
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      notes: ''
    },
    {
      id: 'assign-003',
      name: 'Lê Văn C - Y tế học đường',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở Chính',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      staffId: 'staff-003',
      staffName: 'Lê Văn C',
      staffCode: 'NV003',
      department: 'Phòng Y tế',
      serviceId: 'health',
      role: 'approver',
      scope: 'all',
      inheritedPermissions: ['view', 'approve'],
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      notes: ''
    },
    {
      id: 'assign-004',
      name: 'Phạm Thị D - Cơ sở vật chất',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở Chính',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      staffId: 'staff-004',
      staffName: 'Phạm Thị D',
      staffCode: 'NV004',
      department: 'Phòng Hành chính',
      serviceId: 'facilities',
      role: 'handler',
      scope: 'area',
      inheritedPermissions: ['view', 'edit'],
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      notes: 'Khu nhà A'
    },
    {
      id: 'assign-005',
      name: 'Hoàng Văn E - Bán trú/Nội trú',
      status: 'locked',
      campusId: 'camp-02',
      campusName: 'Cơ sở 2',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      staffId: 'staff-005',
      staffName: 'Hoàng Văn E',
      staffCode: 'NV005',
      department: 'Ban Giám thị',
      serviceId: 'boarding',
      role: 'follower',
      scope: 'campus',
      inheritedPermissions: ['view'],
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      notes: ''
    }
  ],
  service_approval_workflows: [
    {
      id: 'wf-001',
      name: 'Quy trình Duyệt Nghỉ phép',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở Chính',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      requestType: 'leave_request',
      levels: [
        { levelId: 'l1', roleType: 'handler', slaHours: 24, autoEscalate: false },
        { levelId: 'l2', roleType: 'manager', slaHours: 48, autoEscalate: true }
      ]
    }
  ],
  service_meal_parameters: [
    {
      id: 'meal-001',
      name: 'Suất ăn Trưa Cơ sở Chính',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở Chính',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      mealType: 'lunch',
      unitPrice: 45000,
      supplier: 'Công ty Cổ phần Suất ăn Công nghiệp ABC',
      allergiesList: ['Đậu phộng', 'Hải sản'],
      cutoffHours: 12
    }
  ],
  service_transport_parameters: [
    {
      id: 'trans-001',
      name: 'Tuyến KĐT Ecopark',
      status: 'active',
      campusId: 'camp-01',
      campusName: 'Cơ sở Chính',
      schoolYear: '2026-2027',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      routeCode: 'BUS-01',
      direction: 'twoway',
      stops: [
        { id: 's1', address: 'Ecopark Rừng Cọ', estimatedTime: '06:30', orderIndex: 1 },
        { id: 's2', address: 'Ecopark West Bay', estimatedTime: '06:45', orderIndex: 2 }
      ],
      vehicle: { plateNumber: '29B-123.45', capacity: 29 },
      staff: { driverName: 'Nguyễn Văn A', driverPhone: '0901234567', assistantName: 'Trần Thị B', assistantPhone: '0987654321' },
      fees: { monthly: 1500000, term: 7000000, yearly: 13500000 },
      schedule: { pickupStartTime: '06:15', dropoffStartTime: '16:30' }
    }
  ]
};

class MockSettingsService {
  private async delay(ms = 0) {
    // delay removed for fast API
  }

  async getItems<K extends keyof SettingTypeMap>(key: K): Promise<SettingTypeMap[K][]> {
    const res = await fetch(`/api/settings/service?type=${key}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      campusId: d.campusId,
      campusName: d.campusName,
      schoolYear: d.schoolYear,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      createdBy: 'System', // from payload ideally
      updatedBy: 'System',
      ...d.payload
    })) as SettingTypeMap[K][];
  }

  async getItem<K extends keyof SettingTypeMap>(key: K, id: string): Promise<SettingTypeMap[K] | null> {
    const items = await this.getItems(key);
    return items.find((item) => item.id === id) || null;
  }

  async createItem<K extends keyof SettingTypeMap>(key: K, item: Omit<SettingTypeMap[K], 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<SettingTypeMap[K]> {
    const res = await fetch(`/api/settings/service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: key, ...item })
    });
    if (!res.ok) throw new Error('Failed to create setting');
    const d = await res.json();
    return {
      id: d.id,
      name: d.name,
      status: d.status,
      campusId: d.campusId,
      campusName: d.campusName,
      schoolYear: d.schoolYear,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      createdBy: 'System',
      updatedBy: 'System',
      ...d.payload
    } as SettingTypeMap[K];
  }

  async updateItem<K extends keyof SettingTypeMap>(key: K, id: string, updates: Partial<Omit<SettingTypeMap[K], 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>>): Promise<SettingTypeMap[K]> {
    const res = await fetch(`/api/settings/service/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: key, ...updates })
    });
    if (!res.ok) throw new Error('Failed to update setting');
    const d = await res.json();
    return {
      id: d.id,
      name: d.name,
      status: d.status,
      campusId: d.campusId,
      campusName: d.campusName,
      schoolYear: d.schoolYear,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      createdBy: 'System',
      updatedBy: 'System',
      ...d.payload
    } as SettingTypeMap[K];
  }

  async deleteItem<K extends keyof SettingTypeMap>(key: K, id: string): Promise<boolean> {
    const res = await fetch(`/api/settings/service/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Delete failed:', text);
      throw new Error('Failed to delete setting');
    }
    return true;
  }
}

export const mockSettingsService = new MockSettingsService();

