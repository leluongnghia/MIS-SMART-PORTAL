import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '192.168.49.206',
      username: 'duong',
      password: 'd123456',
      port: 22
    });
    
    const os = await ssh.execCommand('cat /etc/os-release');
    console.log('OS:', os.stdout);
    
    const node = await ssh.execCommand('node -v');
    console.log('Node:', node.stdout || 'Not installed');
    
    const pm2 = await ssh.execCommand('pm2 -v');
    console.log('PM2:', pm2.stdout || 'Not installed');
    
    const nginx = await ssh.execCommand('nginx -v');
    console.log('Nginx:', nginx.stderr || nginx.stdout || 'Not installed');

    ssh.dispose();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

run();
