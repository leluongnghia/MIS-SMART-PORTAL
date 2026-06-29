import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  
  const dbUrl = 'postgres://mis_user:mis_password123@localhost:5432/mis_portal';
  
  // Replace DATABASE_URL in .env
  await ssh.execCommand(`sed -i 's|DATABASE_URL=".*"|DATABASE_URL="${dbUrl}"|g' .env`, { cwd: remoteDir });
  await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${dbUrl}"|g' .env`, { cwd: remoteDir });

  console.log('Fixed .env, running migration...');
  const res = await ssh.execCommand('npx tsx migrate-postgres.ts', { cwd: remoteDir });
  console.log(res.stdout);
  if (res.stderr) console.error(res.stderr);

  await ssh.execCommand('pm2 restart mis-portal');
  ssh.dispose();
  console.log('Done!');
}
run();
