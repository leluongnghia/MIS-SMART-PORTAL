@echo off
REM ============================================================
REM  MIS Smart Portal - Deploy Script
REM  Server: 192.168.49.206 | User: duong | Pass: d123456
REM  Chay file nay de deploy len server
REM ============================================================

echo [1/3] Kiem tra plink (PuTTY)...
where plink >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Chua co plink. Tai PuTTY tu: https://www.putty.org/
    echo     Sau do copy plink.exe vao thu muc nay va chay lai.
    echo.
    echo [OPTION 2] Dung PowerShell + OpenSSH (tiep tuc...)
)

echo.
echo [2/3] Tim thu muc project tren server va deploy...
echo Nhap password khi SSH hoi: d123456
echo.

REM Thu dung plink neu co
where plink >nul 2>&1
if %errorlevel% equ 0 (
    plink -ssh duong@192.168.49.206 -pw "d123456" -hostkey "ssh-ed25519 255 SHA256:bYJyCtOaLSbt8pGdgX7jt27x/l4MeuqXmYl6dJtVJAc" -batch "export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\" && rm -rf /home/duong/MIS-SMART-PORTAL && cd /home/duong && git clone https://github.com/leluongnghia/MIS-SMART-PORTAL.git && cd MIS-SMART-PORTAL && npm install --no-package-lock && npm run build && pm2 restart mis-portal || pm2 start npm --name mis-portal -- start"
    goto done
)

REM Fallback: dung ssh binh thuong (se hoi password)
echo Hay copy va chay lenh sau trong terminal moi:
echo.
echo ssh duong@192.168.49.206
echo.
echo Sau khi vao server, chay:
echo   find /home /var/www -maxdepth 3 -name "package.json" 2>/dev/null
echo   cd [thu_muc_project]
echo   git pull origin main
echo   npm install --legacy-peer-deps
echo   npm run build
echo   pm2 restart all
echo.

:done
echo [3/3] Xong!
pause
