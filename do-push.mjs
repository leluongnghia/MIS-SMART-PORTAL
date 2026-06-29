import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  console.log('Connected');
  
  // Run drizzle-kit push
  const pushCmd = 'npx drizzle-kit push --force';
  console.log('Running:', pushCmd);
  const pushRes = await ssh.execCommand(pushCmd, { cwd: `/home/${user}/duong-node-app` });
  console.log(pushRes.stdout);
  if (pushRes.stderr) console.error('stderr:', pushRes.stderr);

  // Restart PM2
  console.log('Restarting PM2...');
  await ssh.execCommand('pm2 restart mis-portal');
  
  ssh.dispose();
  console.log('Done!');
}
run();
