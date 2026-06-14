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
    plink -ssh duong@192.168.49.206 -pw "d123456" -batch "cd $(find /home /var/www -name 'MIS-SMART-PORTAL' -o -name 'mis-smart-portal' -o -name 'portal' 2>/dev/null | head -1) && git pull origin main && npm install --legacy-peer-deps && npm run build && pm2 restart all || pm2 start npm --name mis-portal -- start"
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
