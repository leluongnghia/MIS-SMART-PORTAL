import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection established successfully!');
  
  // Run local curl tests on the remote server
  const cmd = `echo "=== CURL LOCALHOST ===" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
echo ""
echo "=== CURL DOMAIN VIA LOCALHOST ===" && curl -s -o /dev/null -w "%{http_code}" -H "Host: duong.nghiadev.net" http://localhost:3000/api/health
echo ""
echo "=== CURL REMOTE DOMAIN FROM SERVER ===" && curl -s -o /dev/null -w "%{http_code}" -k https://duong.nghiadev.net/api/health
echo ""`;
  console.log(`Executing: ${cmd}`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code, signal) => {
      console.log(`\nCommand exited with code ${code}`);
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
