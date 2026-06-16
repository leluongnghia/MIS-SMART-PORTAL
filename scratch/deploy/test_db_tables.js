import { Client } from 'ssh2';
import fs from 'fs';

const conn = new Client();
const scriptContent = `
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite('/home/duong/duong-node-app/local.db');
try {
  const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('Tables:', res.rows.map(r => r.table_name));
} catch (err) {
  console.error('Error querying DB:', err);
} finally {
  await db.close();
}
`;

conn.on('ready', () => {
  console.log('SSH connection established...');
  
  // Write the script to the server and execute it
  const remoteScriptPath = '/home/duong/duong-node-app/test_db_tables.js';
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    const stream = sftp.createWriteStream(remoteScriptPath);
    stream.write(scriptContent);
    stream.end(() => {
      console.log('Script uploaded to server. Running it...');
      
      conn.exec('cd /home/duong/duong-node-app && npx tsx test_db_tables.js && rm test_db_tables.js', (runErr, execStream) => {
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
