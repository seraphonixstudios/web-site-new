#!/bin/bash
# Neural-OS VPS Deployment Script
# Run this on your local machine after changing the root password

VPS_IP="76.13.242.128"
VPS_USER="root"  # Change to 'deploy' user after creating one
LOCAL_DIR="chief vps mantinence officer"
REMOTE_DIR="/var/www/neural-os"

echo "=== Neural-OS VPS Deployment ==="
echo "Target: $VPS_USER@$VPS_IP"
echo ""

# Check if directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "ERROR: Directory '$LOCAL_DIR' not found!"
    echo "Make sure you're running this from the correct directory."
    exit 1
fi

echo "Step 1: Creating remote directory..."
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR && rm -rf $REMOTE_DIR/*"

echo ""
echo "Step 2: Copying files to VPS..."
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    --exclude='*.log' \
    "$LOCAL_DIR/" \
    "$VPS_USER@$VPS_IP:$REMOTE_DIR/"

echo ""
echo "Step 3: Installing dependencies on VPS..."
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR && npm install"

echo ""
echo "Step 4: Setting up log directory..."
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR/logs && chmod 755 $REMOTE_DIR/logs"

echo ""
echo "Step 5: Creating systemd service..."
ssh $VPS_USER@$VPS_IP "cat > /etc/systemd/system/neural-os.service << 'EOF'
[Unit]
Description=Neural-OS CMO Terminal
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/neural-os
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3077
Environment=PROJECTS_DIR=/var/www
Environment=JWT_SECRET=seraphonix-neural-os-secret-key-change-this
Environment=LOG_DIR=/var/www/neural-os/logs

[Install]
WantedBy=multi-user.target
EOF"

echo ""
echo "Step 6: Starting Neural-OS service..."
ssh $VPS_USER@$VPS_IP "systemctl daemon-reload && systemctl enable neural-os && systemctl restart neural-os"

echo ""
echo "Step 7: Checking service status..."
sleep 3
ssh $VPS_USER@$VPS_IP "systemctl status neural-os --no-pager -l"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Neural-OS should now be running at:"
echo "  http://$VPS_IP:3077"
echo ""
echo "Check logs with:"
echo "  ssh $VPS_USER@$VPS_IP 'journalctl -u neural-os -f'"
echo ""
echo "View security logs:"
echo "  ssh $VPS_USER@$VPS_IP 'tail -f /var/www/neural-os/logs/security-$(date +%Y-%m-%d).log'"
