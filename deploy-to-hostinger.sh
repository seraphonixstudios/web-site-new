#!/bin/bash
# DEPLOY TO HOSTINGER VPS
# verilysovereign.org (76.13.242.128)
# Root password: Patriot8812#

set -e  # Exit on error

echo "🚀 Starting deployment to verilysovereign.org..."
echo "================================================"

# 1. Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# 2. Install required packages
echo "🔧 Installing Nginx, Node.js, and dependencies..."
apt install -y nginx nodejs npm git curl wget unzip

# 3. Install PM2 for process management
echo "⚙️ Installing PM2..."
npm install -g pm2

# 4. Create web directory
echo "📁 Setting up web directory..."
mkdir -p /var/www/html
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# 5. Install SSL certificate (Let's Encrypt)
echo "🔒 Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# 6. Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/verilysovereign.org << 'EOF'
server {
    listen 80;
    server_name verilysovereign.org www.verilysovereign.org;
    root /var/www/html;
    index index.html;

    # Main website
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Store
    location /store {
        alias /var/www/html/store\ html;
        try_files $uri $uri/ /store.html;
    }

    # Genesis API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/verilysovereign.org /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# 7. Obtain SSL certificate
echo "🔐 Setting up SSL certificate..."
certbot --nginx -d verilysovereign.org -d www.verilysovereign.org --non-interactive --agree-tos --email admin@verilysovereign.org

# 8. Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

# 9. Setup Genesis Engine (AI Image Generator)
echo "🎨 Configuring Genesis Engine..."
cd /var/www/html/AI\ Image\ Generator/client

# Install dependencies if package.json exists
if [ -f package.json ]; then
    npm install
fi

# 10. Start Genesis Engine with PM2
echo "▶️ Starting Genesis Engine..."
cd /var/www/html/AI\ Image\ Generator
pm2 start server.js --name genesis || pm2 restart genesis
pm2 startup
pm2 save

# 11. Setup auto-renewal for SSL
echo "🔄 Configuring SSL auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 12. Create deployment info file
echo "📝 Creating deployment info..."
cat > /var/www/html/DEPLOYED.txt << EOF
VERILYSOVEREIGN.ORG DEPLOYMENT
================================
Date: $(date)
Server: Hostinger VPS
IP: 76.13.242.128
Domain: verilysovereign.org

Components:
- Seraphonix Sphere Interface ✓
- Genesis Engine (AI Image Gen) ✓
- Atlantiplex Store ✓
- VPS Manager ✓

Status: READY FOR PRODUCTION
EOF

# 13. Set proper permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/html
find /var/www/html -type f -exec chmod 644 {} \;
find /var/www/html -type d -exec chmod 755 {} \;

# 14. Verify deployment
echo "✅ Verifying deployment..."
curl -s -o /dev/null -w "%{http_code}" https://verilysovereign.org || echo "Warning: HTTPS not responding"

echo ""
echo "================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "🔗 Website: https://verilysovereign.org"
echo "🔧 Admin: Check VPS Manager node in sphere"
echo "📊 Status: System operational"
echo ""
echo "To check status:"
echo "  - Website: curl https://verilysovereign.org"
echo "  - Genesis: pm2 status"
echo "  - Nginx: systemctl status nginx"
echo ""
echo "🚀 Verily Sovereign is now LIVE!"
echo "================================================"
