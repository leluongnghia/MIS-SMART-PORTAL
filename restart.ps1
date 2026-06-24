$remoteCmd = @"
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
pm2 restart duong-node-app || pm2 start npm --name duong-node-app -- start
pm2 save
"@

$remoteCmd | .\plink.exe -ssh duong@192.168.49.206 -pw "d123456" -hostkey "ssh-ed25519 255 SHA256:bYJyCtOaLSbt8pGdgX7jt27x/l4MeuqXmYl6dJtVJAc" -batch
