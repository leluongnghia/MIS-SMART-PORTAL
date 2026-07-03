import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;
const repo = 'https://github.com/leluongnghia/MIS-SMART-PORTAL.git';

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  console.log('Connected to VPS.');

  // Check if .git exists; if not, init git remote
  console.log('Setting up git...');
  let res = await ssh.execCommand(
    `[ -d .git ] && git pull || (git init && git remote add origin ${repo} && git fetch --depth=1 && git checkout -f main)`,
    { cwd: remoteDir }
  );
  console.log("GIT OUT:\n", res.stdout);
  if (res.stderr) console.log("GIT INFO:\n", res.stderr);

  console.log('Building project...');
  res = await ssh.execCommand('npm run build', { cwd: remoteDir });
  console.log("BUILD OUT:\n", res.stdout);
  if (res.stderr) console.log("BUILD INFO:\n", res.stderr);

  console.log('Restarting PM2...');
  res = await ssh.execCommand('pm2 restart mis-portal', { cwd: remoteDir });
  console.log("PM2 OUT:\n", res.stdout);
  if (res.stderr) console.log("PM2 INFO:\n", res.stderr);

  ssh.dispose();
  console.log('Deployment successful!');
}
run();
