import { NodeSSH } from 'node-ssh';
import { execSync } from 'child_process';
import path from 'path';

const ssh = new NodeSSH();

async function deploy() {
  try {
    console.log('1. Taring local files...');
    // Create deploy.tar.gz containing .next, src, public, package.json, next.config.ts
    // Exclude node_modules
    execSync('tar -czf deploy.tar.gz .next src package.json next.config.ts package-lock.json', { stdio: 'inherit' });
    console.log('Tar created.');

    console.log('2. Connecting to server...');
    await ssh.connect({
      host: '192.168.49.206',
      username: 'duong',
      password: 'd123456',
      port: 22
    });
    console.log('Connected to server!');

    const remoteDir = '/home/duong/mis-portal';
    
    console.log('3. Preparing remote directory...');
    await ssh.execCommand(`mkdir -p ${remoteDir}`);

    console.log('4. Uploading deploy.tar.gz...');
    await ssh.putFile('deploy.tar.gz', `${remoteDir}/deploy.tar.gz`);
    console.log('Upload complete.');

    console.log('5. Extracting on server & Installing dependencies...');
    const setupCmd = `
      cd ${remoteDir}
      tar -xzf deploy.tar.gz
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
      
      if ! command -v node &> /dev/null; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        \\. "$NVM_DIR/nvm.sh"
        nvm install 20
        nvm use 20
      fi

      npm install --production

      if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
      fi

      pm2 restart mis-portal || pm2 start npm --name "mis-portal" -- run start
    `;

    const res = await ssh.execCommand(setupCmd);
    console.log('Server setup stdout:', res.stdout);
    if (res.stderr) console.error('Server setup stderr:', res.stderr);

    console.log('Deployment successful!');
    ssh.dispose();
  } catch (err) {
    console.error('Deployment error:', err);
    ssh.dispose();
  }
}

deploy();
