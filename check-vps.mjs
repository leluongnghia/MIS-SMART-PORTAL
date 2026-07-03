import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
async function run() {
  await ssh.connect({host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22});
  const res = await ssh.execCommand('pm2 describe mis-portal');
  console.log(res.stdout);
  ssh.dispose();
}
run();
