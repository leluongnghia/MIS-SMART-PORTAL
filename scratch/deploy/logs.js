import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  conn.exec('pm2 logs duong-node-app --lines 50 --no-daemon', (err, stream) => {
    if (err) throw err;
    // End connection after 5 seconds to stop tailing
    setTimeout(() => {
      conn.end();
    }, 5000);
    stream.on('close', () => conn.end())
          .on('data', (data) => process.stdout.write(data.toString()))
          .stderr.on('data', (data) => process.stderr.write(data.toString()));
  });
}).connect({
  host: '192.168.49.206',
  username: 'duong',
  password: 'd123456'
});
