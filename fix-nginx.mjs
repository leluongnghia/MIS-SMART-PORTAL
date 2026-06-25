import { NodeSSH } from 'node-ssh';
const ssh = new NodeSSH();
const domain = 'duong.nghiadev.net';
const pass = 'd123456';
const nginxConfig = `server {
    listen 8888;
    server_name ${domain};
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

async function run() {
  await ssh.connect({ host: '192.168.49.206', username: 'duong', password: pass, port: 22 });
  await ssh.execCommand(`cat << 'EOF' > /tmp/nginx.conf
${nginxConfig}
EOF`);
  await ssh.execCommand(`echo ${pass} | sudo -S cp /tmp/nginx.conf /etc/nginx/sites-available/${domain}`);
  await ssh.execCommand(`echo ${pass} | sudo -S systemctl restart nginx`);
  const result = await ssh.execCommand('echo d123456 | sudo -S systemctl status nginx --no-pager');
  console.log(result.stdout);
  console.log(result.stderr);
  ssh.dispose();
}
run();
