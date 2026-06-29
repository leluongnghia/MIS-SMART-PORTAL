import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  
  await ssh.execCommand('npm install dotenv', { cwd: remoteDir });
  await ssh.execCommand('pm2 delete mis-portal', { cwd: remoteDir });
  const res = await ssh.execCommand('pm2 start server.js --name mis-portal --node-args="-r dotenv/config" --env PORT=3000', { cwd: remoteDir });
  console.log(res.stdout);
  await ssh.execCommand('pm2 save', { cwd: remoteDir });
  
  ssh.dispose();
}
run();
