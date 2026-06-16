import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const conn = new Client();
const localEnvPath = path.resolve(__dirname, '../../.env');
const localEnvContent = fs.readFileSync(localEnvPath, 'utf8');

// Modify the database url in the content to be absolute
const updatedEnvContent = localEnvContent.replace(/DATABASE_URL=".*"/g, 'DATABASE_URL="/home/duong/duong-node-app/local.db"');

conn.on('ready', () => {
  console.log('SSH connection established...');
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    const remoteEnvPath = '/home/duong/duong-node-app/.env';
    console.log(`Writing .env directly to ${remoteEnvPath}...`);
    
    const stream = sftp.createWriteStream(remoteEnvPath);
    stream.write(updatedEnvContent);
    stream.end(() => {
      console.log('.env file written. Restoring and reloading PM2...');
      
      const commands = [
        'cd /home/duong/duong-node-app',
        'ls -la .env',
        'pm2 restart duong-node-app || pm2 restart all',
        'sleep 2',
        'ls -la .env'
      ].join(' && ');
      
      conn.exec(commands, (runErr, execStream) => {
        if (runErr) throw runErr;
        
        execStream.on('close', () => conn.end())
                  .on('data', (data) => process.stdout.write(data.toString()))
                  .stderr.on('data', (data) => process.stderr.write(data.toString()));
      });
    });
  });
}).connect({
  host: '192.168.49.206',
  username: 'duong',
  password: 'd123456'
});
