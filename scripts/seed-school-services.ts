import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../src/models/Schema';

const dbPath = process.env.DATABASE_URL || './local.db';
const client = new PGlite(dbPath);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding school services users and tickets...');

  // Tạo 3 users: Xe đưa đón, Cơ sở vật chất, Vệ sinh
  const usersToInsert = [
    {
      id: 'manager_operations',
      clerkUserId: 'manager_operations',
      name: 'Trưởng phòng Vận hành',
      role: 'SCHOOL_SERVICE_OPERATIONS_MANAGER',
      roleName: 'Trưởng phòng Khai thác Dịch vụ phụ trợ & Vận hành',
      email: 'manager_operations@mis.edu.vn',
      status: 'ACTIVE',
      workspaceId: 'DICH_VU_HOC_DUONG'
    },
    {
      id: 'staff_transport_01',
      clerkUserId: 'staff_transport_01',
      name: 'Nhân viên Xe đưa đón',
      role: 'SCHOOL_SERVICE_STAFF',
      roleName: 'Nhân viên Dịch vụ học đường',
      email: 'transport@mis.edu.vn',
      status: 'ACTIVE',
      departmentScope: 'transport',
      workspaceId: 'DICH_VU_HOC_DUONG'
    },
    {
      id: 'staff_facility_01',
      clerkUserId: 'staff_facility_01',
      name: 'Nhân viên Cơ sở vật chất',
      role: 'SCHOOL_SERVICE_STAFF',
      roleName: 'Nhân viên Dịch vụ học đường',
      email: 'facility@mis.edu.vn',
      status: 'ACTIVE',
      departmentScope: 'facility',
      workspaceId: 'DICH_VU_HOC_DUONG'
    },
    {
      id: 'staff_cleaning_01',
      clerkUserId: 'staff_cleaning_01',
      name: 'Nhân viên Vệ sinh',
      role: 'SCHOOL_SERVICE_STAFF',
      roleName: 'Nhân viên Dịch vụ học đường',
      email: 'cleaning@mis.edu.vn',
      status: 'ACTIVE',
      departmentScope: 'cleaning',
      workspaceId: 'DICH_VU_HOC_DUONG'
    }
  ];

  for (const user of usersToInsert) {
    await db.insert(schema.users).values(user).onConflictDoNothing();
  }
  console.log('✅ Created school service staff users.');

  const tickets = [
    {
      id: 'TKT-SRV-1001',
      code: 'SRV-1001',
      title: 'Xe bus tuyến số 05 đến muộn 20 phút',
      serviceGroup: 'transport',
      priority: 'high',
      location: 'Điểm đón Nguyễn Trãi',
      reportedBy: 'Phụ huynh em Nguyễn Văn A',
      description: 'Xe bus hôm nay đến muộn, học sinh phải chờ lâu ngoài đường.',
      status: 'NEW',
    },
    {
      id: 'TKT-SRV-1002',
      code: 'SRV-1002',
      title: 'Máy lạnh phòng học 301 không hoạt động',
      serviceGroup: 'facility',
      priority: 'urgent',
      location: 'Phòng 301, Tòa nhà A',
      reportedBy: 'Giáo viên Trần Thị B',
      description: 'Máy lạnh bật không lên, học sinh rất nóng.',
      status: 'ASSIGNED',
      assignedToId: 'staff_facility_01'
    },
    {
      id: 'TKT-SRV-1003',
      code: 'SRV-1003',
      title: 'Nhà vệ sinh khu C hết giấy và nước rửa tay',
      serviceGroup: 'cleaning',
      priority: 'normal',
      location: 'Khu vệ sinh tầng 2 nhà C',
      reportedBy: 'Học sinh phản ánh',
      description: 'Đề nghị bổ sung ngay.',
      status: 'IN_PROGRESS',
      assignedToId: 'staff_cleaning_01'
    },
    {
      id: 'TKT-SRV-1004',
      code: 'SRV-1004',
      title: 'Đề nghị duyệt chi mua thêm bóng đèn',
      serviceGroup: 'facility',
      priority: 'high',
      location: 'Hành lang nhà B',
      reportedBy: 'Nhân viên Cơ sở vật chất',
      description: 'Cần thay mới 5 bóng đèn cháy.',
      status: 'RESOLVED',
      assignedToId: 'staff_facility_01'
    },
    {
      id: 'TKT-SRV-1005',
      code: 'SRV-1005',
      title: 'Học sinh lớp 10A1 có biểu hiện ngộ độc thực phẩm',
      serviceGroup: 'health',
      priority: 'urgent',
      location: 'Phòng Y tế',
      reportedBy: 'Giáo viên Chủ nhiệm',
      description: 'Học sinh nôn trớ sau bữa ăn trưa.',
      status: 'NEW',
    }
  ];

  for (const ticket of tickets) {
    await db.insert(schema.serviceTickets).values(ticket).onConflictDoNothing();
  }
  console.log('✅ Created sample service tickets.');

  await client.close();
  console.log('🎉 Seeding completed!');
}

seed().catch(console.error);
