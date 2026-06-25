import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();
async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });
  const result = await ssh.execCommand('echo d123456 | sudo -S nginx -t && echo d123456 | sudo -S journalctl -u nginx --no-pager | tail -n 20');
  console.log(result.stdout);
  console.log(result.stderr);
  ssh.dispose();
}
run();
