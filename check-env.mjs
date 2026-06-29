import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  
  const res = await ssh.execCommand('cat .env', { cwd: remoteDir });
  console.log('ENV CONTENT:', res.stdout);

  ssh.dispose();
}
run();
