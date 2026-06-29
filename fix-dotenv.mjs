import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  
  const res = await ssh.execCommand('ls -la node_modules/dotenv', { cwd: remoteDir });
  console.log('dotenv:', res.stdout || res.stderr);
  
  const res2 = await ssh.execCommand('npm install dotenv', { cwd: remoteDir });
  console.log('npm install:', res2.stdout || res2.stderr);
  
  const res3 = await ssh.execCommand('pm2 restart mis-portal', { cwd: remoteDir });
  console.log('pm2 restart:', res3.stdout || res3.stderr);
  
  ssh.dispose();
}
run();
