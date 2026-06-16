import { Client } from 'ssh2';

const conn = new Client();
const projectDir = '/home/duong/duong-node-app';

// The .env content to write on the server
const envContent = `GEMINI_API_KEY=""
APP_URL="http://192.168.49.206:3000"
DATABASE_URL="/home/duong/duong-node-app/local.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_ORGANIZATION=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""
ARCJET_KEY=""
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="MIS Smart Portal <noreply@mis.edu.vn>"
TEST_RECEIVER_EMAIL=""
MAX_EMAIL_REMINDERS_PER_RUN="5"
MAX_CAMPAIGN_EMAILS_PER_RUN="20"
ZALO_OA_ID=""
ZALO_APP_ID=""
ZALO_APP_SECRET=""
ZALO_ACCESS_TOKEN=""
ZALO_REFRESH_TOKEN=""
ZALO_DEFAULT_AUDIENCE="Nguoi quan tam OA"
BANK_BIN="970436"
BANK_ACCOUNT_NO="0123456789"
BANK_ACCOUNT_NAME="MIS SMART SCHOOL"
PAYMENT_PREFIX_RESERVATION="GCHO"
PAYMENT_PREFIX_ENROLLMENT="NHAPHOC"
`;

conn.on('ready', () => {
  console.log('SSH connected! Starting fix...');

  // Step 1: Write .env file
  const writeEnvCmd = `cat > ${projectDir}/.env << 'ENVEOF'\n${envContent}ENVEOF`;

  conn.exec(writeEnvCmd, (err, stream) => {
    if (err) {
      console.error('Error writing .env:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log(`Write .env finished with code ${code}`);

      // Step 2: Run migrations and seed
      const setupCmd = [
        `cd ${projectDir}`,
        `cat .env | head -5`,
        `npm run db:migrate`,
        `npm run db:seed`,
        `pm2 restart duong-node-app || pm2 restart all`
      ].join(' && ');

      console.log('\nRunning DB setup...');
      conn.exec(setupCmd, (err2, stream2) => {
        if (err2) {
          console.error('DB setup error:', err2);
          conn.end();
          return;
        }

        stream2.on('close', (code2) => {
          console.log(`\nDB setup finished with code ${code2}`);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
      });
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '192.168.49.206',
  port: 22,
  username: 'duong',
  password: 'd123456'
});
