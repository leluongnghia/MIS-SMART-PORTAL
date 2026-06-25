import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const domain = 'duong.nghiadev.net';
const remoteDir = `/home/${user}/${domain}`;

async function run() {
  try {
    console.log('Connecting to VPS...');
    await ssh.connect({ host, username: user, password: pass, port: 22 });
    console.log('Connected!');

    console.log('Installing dependencies (nginx, unzip)...');
    await execCommand(`echo ${pass} | sudo -S apt-get update`);
    await execCommand(`echo ${pass} | sudo -S apt-get install -y nginx unzip`);

    console.log(`Creating remote directory ${remoteDir}...`);
    await execCommand(`mkdir -p ${remoteDir}`);

    console.log('Uploading app.zip and .env...');
    await ssh.putFile('app.zip', `${remoteDir}/app.zip`);
    if (fs.existsSync('.env')) {
      await ssh.putFile('.env', `${remoteDir}/.env`);
    }

    console.log('Extracting app...');
    await execCommand(`cd ${remoteDir} && echo ${pass} | sudo -S rm -rf node_modules .next public server.js`);
    await execCommand(`cd ${remoteDir} && unzip -o app.zip && rm app.zip`);
    
    console.log('Fixing directory permissions recursively on VPS...');
    await execCommand(`echo ${pass} | sudo -S find ${remoteDir} -type d -exec chmod 755 {} +`);

    console.log('Configuring PM2...');
    await execCommand(`pm2 stop duong-node-app || true`);
    await execCommand(`pm2 delete duong-node-app || true`);
    await execCommand(`cd ${remoteDir} && pm2 stop mis-portal || true`);
    await execCommand(`cd ${remoteDir} && pm2 delete mis-portal || true`);
    await execCommand(`cd ${remoteDir} && pm2 start server.js --name mis-portal --env PORT=3000`);
    await execCommand(`pm2 save`);

    console.log('Configuring Nginx...');
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
    
    await execCommand(`cat << 'EOF' > /tmp/nginx.conf
${nginxConfig}
EOF`);

    await execCommand(`echo ${pass} | sudo -S cp /tmp/nginx.conf /etc/nginx/sites-available/${domain}`);
    await execCommand(`echo ${pass} | sudo -S ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/`);
    await execCommand(`echo ${pass} | sudo -S rm -f /etc/nginx/sites-enabled/default`);
    await execCommand(`echo ${pass} | sudo -S systemctl restart nginx`);

    console.log('Deployment complete!');
    ssh.dispose();
  } catch (error) {
    console.error('Deployment failed:', error);
    ssh.dispose();
  }
}

async function execCommand(cmd) {
  const result = await ssh.execCommand(cmd);
  if (result.stderr && !result.stderr.includes('Warning') && !result.stderr.includes('[PM2]')) {
    console.error(`Error in ${cmd}:`, result.stderr);
  }
  return result;
}

run();
