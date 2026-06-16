import { Client } from 'ssh2';

const conn = new Client();
const envPath = '/home/duong/duong-node-app/.env';

conn.on('ready', () => {
  console.log('SSH connection established to update server .env...');
  
  // Replace relative path with absolute path for DATABASE_URL
  const cmd = `sed -i 's|DATABASE_URL="./local.db"|DATABASE_URL="/home/duong/duong-node-app/local.db"|g' ${envPath} && cat ${envPath} | grep DATABASE_URL`;
  
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
