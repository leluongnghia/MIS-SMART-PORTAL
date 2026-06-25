import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();

async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });
  
  console.log('--- Nginx sites-enabled files ---');
  const files = await ssh.execCommand('ls -la /etc/nginx/sites-enabled/');
  console.log(files.stdout);

  console.log('--- Nginx site config: duong.nghiadev.net ---');
  const config = await ssh.execCommand('cat /etc/nginx/sites-enabled/duong.nghiadev.net');
  console.log(config.stdout || config.stderr);

  ssh.dispose();
}
run().catch(console.error);
