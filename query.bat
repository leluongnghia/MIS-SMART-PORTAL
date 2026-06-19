@echo off
.\plink.exe -hostkey "SHA256:bYJyCtOaLSbt8pGdgX7jt27x/l4MeuqXmYl6dJtVJAc" -ssh -batch -pw "d123456" duong@192.168.49.206 "cd /home/duong/duong-node-app && npx tsx -e \"import { db, schema } from './src/libs/server/db'; db.select().from(schema.systemSettings).then(console.log);\""
