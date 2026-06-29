import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  await ssh.putFile('tsconfig.json', `${remoteDir}/tsconfig.json`);
  
  console.log("Files uploaded. Starting build...");
  const res = await ssh.execCommand(`npm run build && pm2 restart mis-portal`, { cwd: remoteDir });
  console.log("OUT\n", res.stdout);
  console.log("ERR\n", res.stderr);
  ssh.dispose();
}
run();
