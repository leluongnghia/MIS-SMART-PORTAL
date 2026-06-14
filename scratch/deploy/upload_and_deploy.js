import { Client } from 'ssh2';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const conn = new Client();

const localTarPath = path.join(__dirname, 'project.tar.gz');
const remoteDestPath = '/home/duong/duong-node-app/project.tar.gz';
const projectDir = '/home/duong/duong-node-app';

conn.on('ready', () => {
  console.log('SSH connection established!');
  
  // 1. Start SFTP
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }
    
    console.log(`Uploading ${localTarPath} to ${remoteDestPath}...`);
    sftp.fastPut(localTarPath, remoteDestPath, {}, (uploadErr) => {
      if (uploadErr) {
        console.error('Upload failed:', uploadErr);
        conn.end();
        return;
      }
      
      console.log('Upload completed successfully!');
      
      // 2. Run remote extraction and build commands
      const commands = [
        `cd ${projectDir}`,
        `rm -rf .next dist`,
        `tar -xzf project.tar.gz`,
        `rm project.tar.gz`,
        `npm install --legacy-peer-deps`,
        `npm run build`,
        `pm2 restart duong-node-app || pm2 restart all`
      ].join(' && ');
      
      console.log('Executing build and deployment commands on remote server...');
      console.log(commands);
      
      conn.exec(commands, (execErr, stream) => {
        if (execErr) {
          console.error('Execution error:', execErr);
          conn.end();
          return;
        }
        
        stream.on('close', (code, signal) => {
          console.log(`\nDeployment finished. Remote commands exited with code ${code}`);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH connection error:', err);
}).connect({
  host: '100.81.164.75',
  port: 22,
  username: 'duong',
  password: 'd123456'
});
