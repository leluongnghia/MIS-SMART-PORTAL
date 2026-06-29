import { NodeSSH } from 'node-ssh';
import fs from 'fs';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/duong.nghiadev.net`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  console.log('Connected');

  // Upload script
  await ssh.putFile('./scripts/migrate-postgres.ts', `${remoteDir}/migrate-postgres.ts`);
  await ssh.putFile('./drizzle.config.ts', `${remoteDir}/drizzle.config.ts`);
  
  // Create package.json for migration
  const pkg = {
    type: "module",
    dependencies: {
      "pg": "^8.13.1",
      "dotenv": "^16.4.7",
      "drizzle-orm": "^0.38.4",
      "tsx": "^4.19.2"
    }
  };
  fs.writeFileSync('temp-pkg.json', JSON.stringify(pkg, null, 2));
  await ssh.putFile('temp-pkg.json', `${remoteDir}/migration-pkg.json`);

  const runCmd = `
    cd ${remoteDir}
    npm install --no-save pg dotenv drizzle-orm tsx
    npx tsx migrate-postgres.ts
  `;
  const res = await ssh.execCommand(runCmd);
  console.log(res.stdout);
  if (res.stderr) console.error(res.stderr);

  // Restart
  await ssh.execCommand('pm2 restart mis-portal');
  
  ssh.dispose();
  console.log('Done!');
}
run();
