import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Finding all local.db directories...');
  conn.exec('find /home/duong -name "local.db" -type d 2>/dev/null; find /var/www -name "local.db" -type d 2>/dev/null || true', (err, stream) => {
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
