$remoteCmd = @"
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
pm2 stop duong-node-app || true
pm2 delete duong-node-app || true
cd /home/duong/duong.nghiadev.net
pm2 stop mis-portal || true
pm2 delete mis-portal || true
pm2 start server.js --name mis-portal --node-args="-r dotenv/config"
pm2 save
"@

$remoteCmd | .\plink.exe -ssh duong@192.168.49.206 -pw "d123456" -hostkey "ssh-ed25519 255 SHA256:bYJyCtOaLSbt8pGdgX7jt27x/l4MeuqXmYl6dJtVJAc" -batch
