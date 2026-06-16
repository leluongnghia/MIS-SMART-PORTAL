import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Testing server endpoints...');
  conn.exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/dashboard; echo " - /vi/dashboard"; curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vi/tasks; echo " - /vi/tasks"', (err, stream) => {
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
