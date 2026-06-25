import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();

const testUsers = [
  { id: 'user_chutich', name: 'Thầy PGS.TS. Nguyễn Văn Minh', role: 'ADMIN', desc: 'Chủ tịch Hội đồng Trường' },
  { id: 'user_nhan', name: 'Cô Lê Thị Thanh Nhàn', role: 'MANAGER', desc: 'Tổ trưởng Tổ Toán - Tin học' },
  { id: 'user_nhung', name: 'Cô Phạm Hồng Nhung', role: 'STAFF', desc: 'Giáo viên Tổ Ngữ văn' },
  { id: 'parent_gen_1', name: 'Nguyễn Văn Hải', role: 'PARENT', desc: 'Phụ huynh học sinh' },
  { id: 'student_gen_1', name: 'Nguyễn Minh Quân', role: 'STUDENT', desc: 'Học sinh lớp 10A1' }
];

async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });

  for (const user of testUsers) {
    console.log(`\n========================================`);
    console.log(`Testing User: ${user.name} (${user.role} - ${user.desc})`);
    console.log(`========================================`);

    // Update active test user in database
    const setActorSql = `
import { PGlite } from '@electric-sql/pglite';
async function run() {
  const db = new PGlite('/home/duong/duong.nghiadev.net/local.db');
  await db.waitReady;
  await db.query("INSERT INTO system_settings (key, value, \\"group\\", label, is_editable, is_secret, created_at, updated_at) VALUES ('client:mis_edutask_logged_in_user_id', '${user.id}', 'client', 'Demo user', true, false, NOW(), NOW()) ON CONFLICT (key) DO UPDATE SET value = '${user.id}', updated_at = NOW();");
  console.log('Switched server-side actor to ${user.id}');
  await db.close();
}
run().catch(console.error);
`;
    await ssh.execCommand(`cat << 'EOF' > /home/duong/duong.nghiadev.net/set-temp-actor.js
${setActorSql}
EOF`);
    await ssh.execCommand('cd /home/duong/duong.nghiadev.net && node set-temp-actor.js && rm set-temp-actor.js');

    // Curl summary API
    console.log('--- Curling /api/notifications/summary ---');
    const curlSummary = await ssh.execCommand('curl -s http://localhost:3000/api/notifications/summary');
    console.log(`Response: ${curlSummary.stdout}`);

    // Curl dashboard
    console.log('--- Curling /vi/dashboard ---');
    const curlDash = await ssh.execCommand('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/dashboard');
    console.log(`HTTP Status: ${curlDash.stdout}`);
  }

  // Restore back to default admin user
  console.log(`\nRestoring default user to user_chutich...`);
  const restoreSql = `
import { PGlite } from '@electric-sql/pglite';
async function run() {
  const db = new PGlite('/home/duong/duong.nghiadev.net/local.db');
  await db.waitReady;
  await db.query("INSERT INTO system_settings (key, value, \\"group\\", label, is_editable, is_secret, created_at, updated_at) VALUES ('client:mis_edutask_logged_in_user_id', 'user_chutich', 'client', 'Demo user', true, false, NOW(), NOW()) ON CONFLICT (key) DO UPDATE SET value = 'user_chutich', updated_at = NOW();");
  await db.close();
}
run().catch(console.error);
`;
  await ssh.execCommand(`cat << 'EOF' > /home/duong/duong.nghiadev.net/restore-actor.js
${restoreSql}
EOF`);
  await ssh.execCommand('cd /home/duong/duong.nghiadev.net && node restore-actor.js && rm restore-actor.js');

  ssh.dispose();
}
run().catch(console.error);
