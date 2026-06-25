import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();

async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });
  
  console.log('Flushing PM2 logs...');
  await ssh.execCommand('pm2 flush');

  console.log('Restarting PM2 mis-portal...');
  await ssh.execCommand('pm2 restart mis-portal');

  console.log('Waiting 5 seconds...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('--- Current PM2 status ---');
  const pm2 = await ssh.execCommand('pm2 status');
  console.log(pm2.stdout);

  console.log('--- Checking listener on port 3000 ---');
  const portInfo = await ssh.execCommand('echo d123456 | sudo -S lsof -i :3000');
  console.log(portInfo.stdout || 'None');

  console.log('--- PM2 Error Logs (last 30 lines) ---');
  const errLogs = await ssh.execCommand('tail -n 30 /home/duong/.pm2/logs/mis-portal-error.log');
  console.log(errLogs.stdout || 'No errors');

  console.log('--- PM2 Out Logs (last 30 lines) ---');
  const outLogs = await ssh.execCommand('tail -n 30 /home/duong/.pm2/logs/mis-portal-out.log');
  console.log(outLogs.stdout || 'No output logs');

  ssh.dispose();
}
run().catch(console.error);
