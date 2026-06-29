import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  
  const res = await ssh.execCommand('echo d123456 | sudo -S -u postgres psql -d mis_portal -c "SELECT key, value FROM system_settings"');
  console.log(res.stdout);
  
  ssh.dispose();
}
run();
