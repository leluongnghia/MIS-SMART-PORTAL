import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();

async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });

  console.log('--- Setting active user to Thầy Phạm Thế Anh (MANAGER, DICH_VU_HOC_DUONG) ---');
  const setActorSql = `
import { PGlite } from '@electric-sql/pglite';
async function run() {
  const db = new PGlite('/home/duong/duong.nghiadev.net/local.db');
  await db.waitReady;
  await db.query("INSERT INTO system_settings (key, value, \\"group\\", label, is_editable, is_secret, created_at, updated_at) VALUES ('client:mis_edutask_logged_in_user_id', 'user_dv_mgr', 'client', 'Demo user', true, false, NOW(), NOW()) ON CONFLICT (key) DO UPDATE SET value = 'user_dv_mgr', updated_at = NOW();");
  console.log('Switched server-side actor to user_dv_mgr!');
  await db.close();
}
run().catch(console.error);
`;
  await ssh.execCommand(`cat << 'EOF' > /home/duong/duong.nghiadev.net/set-dv-mgr.js
${setActorSql}
EOF`);
  await ssh.execCommand('cd /home/duong/duong.nghiadev.net && node set-dv-mgr.js && rm set-dv-mgr.js');

  console.log('--- Curling /vi/dashboard as Thầy Phạm Thế Anh ---');
  const curlRes = await ssh.execCommand('curl -I http://localhost:3000/vi/dashboard');
  console.log(curlRes.stdout || curlRes.stderr);

  console.log('--- Curling /api/notifications/summary as Thầy Phạm Thế Anh ---');
  const curlSummary = await ssh.execCommand('curl http://localhost:3000/api/notifications/summary');
  console.log(curlSummary.stdout);

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
