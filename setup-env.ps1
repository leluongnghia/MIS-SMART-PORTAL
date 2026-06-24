$ErrorActionPreference = "Stop"
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes(".env.local"))

$remoteCmd = @"
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
echo $b64 | base64 -d > /home/duong/MIS-SMART-PORTAL/.env.local
pm2 delete mis-portal mis-smart-portal || true
cd /home/duong/MIS-SMART-PORTAL
pm2 start npm --name mis-portal -- start
"@

# Note: The @"" string in PowerShell resolves variables. Since $HOME is a bash variable, I used `$HOME.
# We will pipe it into plink.
$remoteCmd | .\plink.exe -ssh duong@192.168.49.206 -pw "d123456" -hostkey "ssh-ed25519 255 SHA256:bYJyCtOaLSbt8pGdgX7jt27x/l4MeuqXmYl6dJtVJAc" -batch
