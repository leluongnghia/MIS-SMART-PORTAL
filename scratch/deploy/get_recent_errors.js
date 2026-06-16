import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Retrieving last 10 lines of error logs...');
  conn.exec('tail -n 150 /home/duong/.pm2/logs/duong-node-app-error-0.log', (err, stream) => {
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
