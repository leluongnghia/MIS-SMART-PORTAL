$ErrorActionPreference = "Stop"
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes(".env.local"))

$remoteCmd = @"
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
cd /home/duong/duong.nghiadev.net
git clean -fd -e node_modules -e .env.local -e local.db
git reset --hard
git fetch --all
git reset --hard origin/main
echo $b64 | base64 -d > .env.local
mkdir -p .next/types
npm install --legacy-peer-deps --no-package-lock < /dev/null
npm run build < /dev/null
cp -rf .next/standalone/* ./
cp -rf .next/standalone/.next ./
cp -r public .next/standalone/ || true
cp -r .next/static .next/standalone/.next/ || true
pm2 stop duong-node-app || true
pm2 delete duong-node-app || true
pm2 stop mis-portal || true
pm2 delete mis-portal || true
pm2 start server.js --name mis-portal --node-args="-r dotenv/config"
pm2 save
exit
"@

$remoteCmd | .\plink.exe -ssh duong@192.168.49.206 -pw "d123456" -hostkey "ssh-ed25519 255 SHA256:bYJyCtOaLSbt8pGdgX7jt27x/l4MeuqXmYl6dJtVJAc" -batch
