import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();
async function deploy() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456' });
  console.log("Uploading...");
  await ssh.putFile('/Users/nghialeluong/Desktop/mis cms/app.zip', '/home/duong/duong.nghiadev.net/app.zip');
  const res = await ssh.execCommand('cd /home/duong/duong.nghiadev.net && unzip -qo app.zip && rm -f app.zip && pm2 restart mis-portal');
  console.log(res.stdout || res.stderr);
  ssh.dispose();
}
deploy().catch(console.error);
