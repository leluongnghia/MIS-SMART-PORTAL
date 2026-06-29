import { NodeSSH } from 'node-ssh';
import fs from 'fs';

const ssh = new NodeSSH();
const host = '192.168.49.206';
const user = 'duong';
const pass = 'd123456';
const remoteDir = `/home/${user}/seed-workspace`;

async function run() {
  await ssh.connect({ host, username: user, password: pass, port: 22 });
  const script = `
import { db, schema } from "./src/libs/server/db";
import { eq } from "drizzle-orm";
async function check() {
  const users = await db.select().from(schema.users).where(eq(schema.users.role, 'ADMIN'));
  console.log("Admins:");
  for (const u of users) {
    console.log(u.id, u.email);
    const denies = await db.select().from(schema.userPermissions).where(eq(schema.userPermissions.userId, u.id));
    console.log("  Denies:", denies.length);
  }
  process.exit(0);
}
check();
`;
  fs.writeFileSync('check-script.ts', script);
  await ssh.putFile('check-script.ts', `${remoteDir}/check.ts`);
  const dbUrl = 'postgres://mis_user:mis_password123@localhost:5432/mis_portal';
  const res = await ssh.execCommand(`DATABASE_URL=${dbUrl} npx tsx check.ts`, { cwd: remoteDir });
  console.log("OUT\n", res.stdout);
  console.log("ERR\n", res.stderr);
  ssh.dispose();
}
run();
