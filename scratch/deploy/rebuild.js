import { Client } from 'ssh2';

const conn = new Client();
const projectDir = '/home/duong/duong-node-app';

conn.on('ready', () => {
  console.log('SSH connection established for rebuild!');
  
  // Clean up any stale next build processes and run the build
  const commands = [
    `cd ${projectDir}`,
    `pkill -f "next-build" || true`,
    `pkill -f "next build" || true`,
    `sleep 2`,
    `npm run build`,
    `pm2 restart duong-node-app || pm2 restart all`
  ].join(' && ');
  
  console.log('Running rebuild and restart on server...');
  
  conn.exec(commands, (execErr, stream) => {
    if (execErr) {
      console.error('Execution error:', execErr);
      conn.end();
      return;
    }
    
    stream.on('close', (code, signal) => {
      console.log(`\nRebuild finished with code ${code}`);
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
  port: 22,
  username: 'duong',
  password: 'd123456'
});
