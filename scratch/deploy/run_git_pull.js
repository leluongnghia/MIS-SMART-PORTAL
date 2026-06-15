import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection established!');
  
  const cmd = `find /home /var/www -name 'MIS-SMART-PORTAL' -o -name 'mis-smart-portal' -o -name 'portal' 2>/dev/null`;
  console.log(`Executing remote commands:\n${cmd}\n`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code, signal) => {
      console.log(`\nCommands finished. Remote process exited with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '192.168.49.206',
  port: 22,
  username: 'duong',
  password: 'd123456'
});
