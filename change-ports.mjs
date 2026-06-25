import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
const pass = 'd123456';
const domain = 'duong.nghiadev.net';

const nginxConfig = `server {
    listen 80;
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
  try {
    await ssh.connect({ host: '192.168.49.206', username: 'duong', password: pass, port: 22 });
    
    console.log('Changing CasaOS port to 90...');
    await ssh.execCommand(`echo ${pass} | sudo -S sed -i 's/port=80/port=90/g' /etc/casaos/gateway.ini`);
    await ssh.execCommand(`echo ${pass} | sudo -S systemctl restart casaos-gateway`);
    
    console.log('Updating Nginx to port 80...');
    await ssh.execCommand(`cat << 'EOF' > /tmp/nginx.conf
${nginxConfig}
EOF`);
    await ssh.execCommand(`echo ${pass} | sudo -S cp /tmp/nginx.conf /etc/nginx/sites-available/${domain}`);
    await ssh.execCommand(`echo ${pass} | sudo -S systemctl restart nginx`);
    
    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    ssh.dispose();
  }
}

run();
