import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  
  // Install dotenv for server.js
  await ssh.execCommand('npm install dotenv', { cwd: remoteDir });

  // Stop current
  await ssh.execCommand('pm2 stop mis-portal || true');
  await ssh.execCommand('pm2 delete mis-portal || true');

  // Start with dotenv/config
  console.log('Starting PM2 with dotenv...');
  const res = await ssh.execCommand('pm2 start server.js --name mis-portal --node-args="-r dotenv/config" --env PORT=3000', { cwd: remoteDir });
  console.log(res.stdout);
  
  await ssh.execCommand('pm2 save');
  ssh.dispose();
  console.log('Done!');
}
run();
