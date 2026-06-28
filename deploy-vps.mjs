import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';

const ssh = new NodeSSH();

const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const port = 22;
const domain = 'duong.nghiadev.net';
const remoteDir = `/home/${user}/${domain}`;
const remoteGitDir = `/home/${user}/duong-node-app`;

async function execCommand(cmd, cwd = remoteDir) {
  const result = await ssh.execCommand(cmd, { cwd });
  if (result.stdout) console.log(result.stdout);
  if (result.stderr && !result.stderr.includes('Warning') && !result.stderr.includes('[PM2]')) {
    console.error(`Error executing [${cmd}] inside [${cwd}]:`, result.stderr);
  }
  return result;
}

async function run() {
  try {
    console.log('1. Connecting to remote VPS...');
    await ssh.connect({ host, username: user, password: pass, port });
    console.log('Connected successfully!');

    // Check if directories exist
    await ssh.execCommand(`mkdir -p ${remoteDir}`);
    await ssh.execCommand(`mkdir -p ${remoteGitDir}`);

    console.log('2. Syncing migration files to VPS...');
    // Sync migrations folder to both production app and git build folder
    if (fs.existsSync('./migrations')) {
      console.log('Uploading migrations to production directory...');
      await ssh.putDirectory('./migrations', `${remoteDir}/migrations`, {
        recursive: true,
        concurrency: 10,
        validate: (itemPath) => !itemPath.includes('.DS_Store')
      });

      console.log('Uploading migrations to git workspace directory...');
      await ssh.putDirectory('./migrations', `${remoteGitDir}/migrations`, {
        recursive: true,
        concurrency: 10,
        validate: (itemPath) => !itemPath.includes('.DS_Store')
      });
      console.log('Migrations upload complete.');
    } else {
      console.log('No local migrations folder found to upload.');
    }

    console.log('3. Running database migrations & modules seeding on live database...');
    // Run npm run db:migrate and db:seed:modules inside duong-node-app using live postgres DB
    const liveDbUrl = "postgres://mis_user:mis_password123@localhost:5432/mis_portal";
    const migrateCmd = `DATABASE_URL="${liveDbUrl}" npm run db:migrate && DATABASE_URL="${liveDbUrl}" npm run db:seed:modules`;
    console.log(`Running migration & seed command: ${migrateCmd}`);
    const migrateRes = await execCommand(migrateCmd, remoteGitDir);
    if (migrateRes.code !== 0) {
      console.warn('Warning: Migration/Seeding failed. Check if table already exists or database is locked.');
    } else {
      console.log('Database migrations and modules seeding completed successfully!');
    }

    console.log('4. Uploading app.zip bundle...');
    if (!fs.existsSync('./app.zip')) {
      throw new Error('Local app.zip not found! Run npm run build and zip.mjs first.');
    }
    await ssh.putFile('./app.zip', `${remoteDir}/app.zip`);
    console.log('Upload complete.');

    console.log('5. Extracting bundle on VPS...');
    // Delete old files first to avoid conflict and keep it clean
    console.log('Cleaning up old build files on VPS...');
    await execCommand('rm -rf .next server.js node_modules', remoteDir);
    
    console.log('Unzipping app.zip...');
    await execCommand('unzip -o app.zip && rm app.zip', remoteDir);
    
    console.log('Fixing directory permissions recursively...');
    await execCommand(`echo ${pass} | sudo -S find ${remoteDir} -type d -exec chmod 755 {} +`);

    console.log('6. Restarting PM2 process...');
    // Stop and delete old mis-portal or duong-node-app if they conflict
    await execCommand('pm2 stop duong-node-app || true');
    await execCommand('pm2 delete duong-node-app || true');
    await execCommand('pm2 stop mis-portal || true', remoteDir);
    await execCommand('pm2 delete mis-portal || true', remoteDir);
    
    // Start Next.js standalone app using server.js
    console.log('Starting Next.js standalone application via PM2...');
    const pm2StartRes = await execCommand('pm2 start server.js --name mis-portal --env PORT=3000', remoteDir);
    if (pm2StartRes.code === 0) {
      console.log('PM2 process started successfully!');
      await execCommand('pm2 save');
    } else {
      throw new Error('PM2 process failed to start.');
    }

    console.log('7. Verification & Health Check...');
    console.log('Testing local connection on port 3000...');
    const healthCheck = await execCommand('curl -I http://localhost:3000');
    if (healthCheck.stdout && (healthCheck.stdout.includes('200') || healthCheck.stdout.includes('307') || healthCheck.stdout.includes('302'))) {
      console.log('Health check PASSED! Application is running on port 3000.');
    } else {
      console.warn('Warning: Health check failed to get successful HTTP code. Output:', healthCheck.stdout || healthCheck.stderr);
    }

    console.log('Deployment completed successfully!');
    ssh.dispose();
  } catch (error) {
    console.error('Deployment process failed:', error);
    ssh.dispose();
    process.exit(1);
  }
}

run();
