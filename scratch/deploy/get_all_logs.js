import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('Hitting dashboard and printing latest logs...');
  const cmd = 'curl -s http://localhost:3000/vi/dashboard > /dev/null && sleep 1 && echo "=== ERROR LOGS ===" && tail -n 20 /home/duong/.pm2/logs/duong-node-app-error-0.log && echo "=== OUT LOGS ===" && tail -n 20 /home/duong/.pm2/logs/duong-node-app-out-0.log';
  conn.exec(cmd, (err, stream) => {
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
