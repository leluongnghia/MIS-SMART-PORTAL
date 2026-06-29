import { NodeSSH } from 'node-ssh';
import { execSync } from 'child_process';
import fs from 'fs';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/seed-workspace`;

async function run() {
  console.log('Zipping source code...');
  try { fs.unlinkSync('seed-bundle.zip'); } catch(e){}
  
  // Create a zip using PowerShell
  execSync('powershell -Command "Compress-Archive -Path src, scripts, package.json, tsconfig.json, drizzle.config.ts -DestinationPath seed-bundle.zip -Force"');

  console.log('Connecting to VPS...');
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  
  console.log('Uploading bundle...');
  await ssh.execCommand(`mkdir -p ${remoteDir}`);
  await ssh.putFile('seed-bundle.zip', `${remoteDir}/seed-bundle.zip`);
  
  console.log('Extracting on VPS...');
  await ssh.execCommand('unzip -o seed-bundle.zip', { cwd: remoteDir });
  
  // Fix .env to point to correct postgres
  const dbUrl = 'postgres://mis_user:mis_password123@localhost:5432/mis_portal';
  await ssh.execCommand(`echo "DATABASE_URL=${dbUrl}" > .env`, { cwd: remoteDir });
  
  console.log('Installing dependencies...');
  const resInstall = await ssh.execCommand('npm install --no-audit', { cwd: remoteDir });
  if (resInstall.stderr && !resInstall.stderr.includes('npm WARN')) console.error(resInstall.stderr);

  console.log('Running seed...');
  const resSeed = await ssh.execCommand(`DATABASE_URL=${dbUrl} npm run db:seed`, { cwd: remoteDir });
  console.log(resSeed.stdout);
  if (resSeed.stderr) console.error(resSeed.stderr);
  
  ssh.dispose();
  console.log('Done!');
}
run().catch(console.error);
