import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();

async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });
  
  console.log('--- Database files on VPS ---');
  const files = await ssh.execCommand('ls -la /home/duong/duong.nghiadev.net/local.db');
  console.log(files.stdout);

  ssh.dispose();
}
run().catch(console.error);
