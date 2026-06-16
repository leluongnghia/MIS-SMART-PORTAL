import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Flushing PM2 logs...');
  conn.exec('pm2 flush && sleep 2 && pm2 logs duong-node-app --lines 20 --no-daemon', (err, stream) => {
    if (err) throw err;
    setTimeout(() => conn.end(), 6000);
    stream.on('close', () => conn.end())
          .on('data', (data) => process.stdout.write(data.toString()))
          .stderr.on('data', (data) => process.stderr.write(data.toString()));
  });
}).connect({
  host: '192.168.49.206',
  username: 'duong',
  password: 'd123456'
});
