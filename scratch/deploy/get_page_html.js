import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Fetching page HTML content...');
  conn.exec('curl -s http://localhost:3000/vi/dashboard | head -n 30', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', (data) => process.stdout.write(data.toString()))
          .stderr.on('data', (data) => process.stderr.write(data.toString()));
  });
}).connect({
  host: '192.168.49.206',
  username: 'duong',
  password: 'd123456'
});
