import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();
async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: 'd123456', port: 22 });
  
  console.log('--- Remote layout.tsx content ---');
  const layout = await ssh.execCommand('cat "/home/duong/duong.nghiadev.net/src/app/[locale]/(admin)/system-settings/permissions/layout.tsx"');
  console.log(layout.stdout || '(File not found)');

  console.log('--- Checking if layout.tsx exists in duong-node-app ---');
  const layoutGit = await ssh.execCommand('cat "/home/duong/duong-node-app/src/app/[locale]/(admin)/system-settings/permissions/layout.tsx"');
  console.log(layoutGit.stdout || '(File not found)');

  ssh.dispose();
}
run().catch(console.error);
