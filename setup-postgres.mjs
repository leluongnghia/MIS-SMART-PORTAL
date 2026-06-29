import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const port = 22;
const domain = 'duong.nghiadev.net';
const remoteDir = `/home/${user}/${domain}`;

async function execCommand(cmd, cwd = remoteDir) {
  console.log(`Executing: ${cmd}`);
  const result = await ssh.execCommand(cmd, { cwd });
  if (result.stdout) console.log(result.stdout);
  if (result.stderr && !result.stderr.includes('Warning')) {
    console.error(`Error:`, result.stderr);
  }
  return result;
}

async function run() {
  try {
    await ssh.connect({ host, username: user, password: pass, port });
    console.log('Connected!');

    // Check if postgresql is installed
    const pgCheck = await execCommand('psql --version');
    if (pgCheck.code !== 0) {
      console.log('Installing PostgreSQL...');
      await execCommand(`echo ${pass} | sudo -S apt-get update`);
      await execCommand(`echo ${pass} | sudo -S apt-get install -y postgresql postgresql-contrib`);
    }

    // Create DB and user
    console.log('Configuring database...');
    const dbName = 'mis_portal';
    const dbUser = 'mis_user';
    const dbPass = 'mis_password123';
    
    await execCommand(`echo ${pass} | sudo -S -u postgres psql -c "CREATE DATABASE ${dbName};" || true`);
    await execCommand(`echo ${pass} | sudo -S -u postgres psql -c "CREATE USER ${dbUser} WITH ENCRYPTED PASSWORD '${dbPass}';" || true`);
    await execCommand(`echo ${pass} | sudo -S -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};" || true`);
    await execCommand(`echo ${pass} | sudo -S -u postgres psql -d ${dbName} -c "GRANT ALL ON SCHEMA public TO ${dbUser};" || true`);

    const dbUrl = `postgres://${dbUser}:${dbPass}@localhost:5432/${dbName}`;
    
    // Update .env on VPS
    console.log('Writing DATABASE_URL to .env on VPS...');
    await execCommand(`echo "DATABASE_URL=${dbUrl}" > .env`);
    await execCommand(`echo "DATABASE_URL=${dbUrl}" > .env.local`);

    console.log('Setup complete!');
    ssh.dispose();
  } catch (err) {
    console.error('Failed:', err);
    ssh.dispose();
    process.exit(1);
  }
}

run();
