@echo off
REM Neural-OS VPS Deployment - Windows
REM This will deploy the updated server.js to your VPS

echo ==========================================
echo   Neural-OS VPS Deployment
echo ==========================================
echo.

set VPS_IP=76.13.242.128
set VPS_USER=root
set REMOTE_DIR=/var/www/neural-os

echo Target: %VPS_USER%@%VPS_IP%
echo.

REM Check for Git Bash or WSL
where bash >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Found bash - using rsync method...
    goto :USE_GITBASH
) else (
    echo No bash found - using SCP method...
    goto :USE_SCP
)

:USE_GITBASH
echo.
echo Step 1: Creating remote directory...
bash -c "ssh %VPS_USER%@%VPS_IP% 'mkdir -p %REMOTE_DIR% && rm -rf %REMOTE_DIR%/*'"

echo.
echo Step 2: Copying files...
bash -c "rsync -avz --exclude='node_modules' --exclude='logs' --exclude='.git' 'chief vps mantinence officer/' '%VPS_USER%@%VPS_IP%:%REMOTE_DIR%/'"

echo.
echo Step 3: Installing dependencies...
bash -c "ssh %VPS_USER%@%VPS_IP% 'cd %REMOTE_DIR% && npm install'"

echo.
echo Step 4: Starting server...
bash -c "ssh %VPS_USER%@%VPS_IP% 'cd %REMOTE_DIR% && pkill -f \"node server.js\" 2>/dev/null; nohup node server.js > /dev/null 2>&1 &'"

goto :DONE

:USE_SCP
echo Using SCP (slower but works without Git Bash)...
echo.

REM Create temp zip
echo Step 1: Creating archive...
powershell -Command "Compress-Archive -Path 'chief vps mantinence officer\*' -DestinationPath 'neural-os-deploy.zip' -Force"

echo.
echo Step 2: Copying to VPS...
echo You will be prompted for your password...
scp neural-os-deploy.zip %VPS_USER%@%VPS_IP%:/tmp/

echo.
echo Step 3: Extracting and setting up on VPS...
ssh %VPS_USER%@%VPS_IP% "mkdir -p %REMOTE_DIR% && rm -rf %REMOTE_DIR%/* && unzip -o /tmp/neural-os-deploy.zip -d %REMOTE_DIR% && rm /tmp/neural-os-deploy.zip && cd %REMOTE_DIR% && npm install && pkill -f 'node server.js' 2>/dev/null; nohup node server.js > /dev/null 2>&1 &"

echo.
del neural-os-deploy.zip 2>nul

:DONE
echo.
echo ==========================================
echo   Deployment Complete!
echo ==========================================
echo.
echo Neural-OS should now be running at:
echo   http://%VPS_IP%:3077
echo.
echo To check if it's running:
echo   ssh %VPS_USER%@%VPS_IP% "ps aux ^| grep node"
echo.
pause
