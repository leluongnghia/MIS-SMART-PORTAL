import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Reading remote .env file...');
  conn.exec('cat /home/duong/duong-node-app/.env', (err, stream) => {
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
