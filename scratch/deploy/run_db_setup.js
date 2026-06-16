import { Client } from 'ssh2';

const conn = new Client();
const projectDir = '/home/duong/duong-node-app';

conn.on('ready', () => {
  console.log('SSH connection established to run DB setup...');
  
  // Run migration and seed, then restart the application to clean reload.
  const commands = [
    `cd ${projectDir}`,
    `npm run db:migrate`,
    `npm run db:seed`,
    `pm2 restart duong-node-app || pm2 restart all`
  ].join(' && ');
  
  console.log('Running database migration and seed commands on remote server...');
  
  conn.exec(commands, (execErr, stream) => {
    if (execErr) {
      console.error('Execution error:', execErr);
      conn.end();
      return;
    }
    
    stream.on('close', (code) => {
      console.log(`\nDB setup finished with exit code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH connection error:', err);
}).connect({
  host: '192.168.49.206',
  username: 'duong',
  password: 'd123456'
});
