import { Client } from 'ssh2';

const conn = new Client();
const projectDir = '/home/duong/duong-node-app';

conn.on('ready', () => {
  console.log('SSH connection established for clean compilation...');
  
  const cmd = `cd ${projectDir} && npm run build`;
  console.log(`Executing: ${cmd}`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code) => {
      console.log(`Compilation process exited with code ${code}`);
      
      if (code === 0) {
        console.log('Build succeeded! Now restarting pm2...');
        conn.exec(`cd ${projectDir} && pm2 restart duong-node-app`, (restartErr, restartStream) => {
          if (restartErr) {
            console.error('Restart error:', restartErr);
            conn.end();
            return;
          }
          restartStream.on('close', () => {
            console.log('PM2 restarted successfully.');
            conn.end();
          })
          .on('data', (d) => process.stdout.write(d.toString()))
          .stderr.on('data', (d) => process.stderr.write(d.toString()));
        });
      } else {
        console.error('Build failed.');
        conn.end();
      }
    })
    .on('data', (data) => {
      process.stdout.write(data.toString());
    })
    .stderr.on('data', (data) => {
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
