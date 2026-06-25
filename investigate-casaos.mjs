import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const pass = 'd123456';

async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: pass, port: 22 });
  
  const cmd1 = await ssh.execCommand('echo d123456 | sudo -S netstat -tlnp | grep -E ":80|:90|:8888|:3000"');
  console.log('Target ports processes:', cmd1.stdout);

  const cmd2 = await ssh.execCommand('echo d123456 | sudo -S find /etc/casaos -name "*.ini" -o -name "*.conf"');
  console.log('CasaOS config files:', cmd2.stdout);

  if (cmd2.stdout.includes('gateway.ini')) {
    const cmd3 = await ssh.execCommand('cat /etc/casaos/gateway.ini');
    console.log('gateway.ini content:', cmd3.stdout);
  }

  ssh.dispose();
}

run().catch(console.error);
