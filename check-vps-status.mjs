import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();
async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });
  
  console.log('--- PM2 List ---');
  const list = await ssh.execCommand('pm2 list');
  console.log(list.stdout || list.stderr);

  console.log('--- PM2 Logs (last 50 lines) ---');
  const logs = await ssh.execCommand('pm2 logs mis-portal --lines 50 --err --out --nostream');
  console.log(logs.stdout || logs.stderr);

  console.log('--- Netstat port 3000 ---');
  const netstat = await ssh.execCommand('netstat -tpln | grep 3000 || ss -tpln | grep 3000');
  console.log(netstat.stdout || netstat.stderr);

  ssh.dispose();
}
run().catch(console.error);
