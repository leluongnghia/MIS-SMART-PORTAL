$ErrorActionPreference = "Stop"
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes(".env.local"))

$remoteCmd = @"
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
cd /home/duong/duong-node-app
git clean -fd -e node_modules -e .env.local -e local.db
git reset --hard
git fetch --all
git reset --hard origin/main
echo $b64 | base64 -d > .env.local
node update-db-columns.cjs
npm install --legacy-peer-deps --no-package-lock
npm run build
pm2 restart duong-node-app || pm2 start npm --name duong-node-app -- start
pm2 save
"@

$remoteCmd | .\plink.exe -ssh duong@192.168.49.206 -pw "d123456" -hostkey "ssh-ed25519 255 SHA256:bYJyCtOaLSbt8pGdgX7jt27x/l4MeuqXmYl6dJtVJAc" -batch
