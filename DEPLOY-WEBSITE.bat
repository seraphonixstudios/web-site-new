@echo off
echo ================================================
echo   Seraphonix Website Deployment
echo ================================================
echo.

REM Deploy website files
echo Deploying to VPS: 76.13.242.128...
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL index.html root@76.13.242.128:/var/www/html/
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL styles.css root@76.13.242.128:/var/www/html/
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL script.js root@76.13.242.128:/var/www/html/

echo.
echo ================================================
echo   Website Updated!
echo   http://76.13.242.128
echo ================================================
pause
