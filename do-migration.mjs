import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  console.log('Connected');
  
  // Install tsx, pg, dotenv to run the migration script
  const installCmd = 'npm install tsx pg dotenv drizzle-orm';
  console.log('Running:', installCmd);
  const installRes = await ssh.execCommand(installCmd, { cwd: remoteDir });
  console.log(installRes.stdout || installRes.stderr);

  // Run migration
  const migrateCmd = 'npm run db:migrate';
  console.log('Running:', migrateCmd);
  const migrateRes = await ssh.execCommand(migrateCmd, { cwd: remoteDir });
  console.log(migrateRes.stdout || migrateRes.stderr);

  // Restart PM2
  console.log('Restarting PM2...');
  await ssh.execCommand('pm2 restart mis-portal');
  
  ssh.dispose();
  console.log('Done!');
}
run();
