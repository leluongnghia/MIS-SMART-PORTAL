import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  console.log('Connected to VPS.');

  console.log('Pulling latest code...');
  let res = await ssh.execCommand('git pull', { cwd: remoteDir });
  console.log("GIT PULL OUT:\n", res.stdout);
  if (res.stderr) console.error("GIT PULL ERR:\n", res.stderr);

  console.log('Building project...');
  res = await ssh.execCommand('npm run build', { cwd: remoteDir });
  console.log("BUILD OUT:\n", res.stdout);
  if (res.stderr) console.error("BUILD ERR:\n", res.stderr);

  console.log('Restarting PM2...');
  res = await ssh.execCommand('pm2 restart mis-portal', { cwd: remoteDir });
  console.log("PM2 OUT:\n", res.stdout);
  if (res.stderr) console.error("PM2 ERR:\n", res.stderr);

  ssh.dispose();
  console.log('Deployment successful!');
}
run();
