#!/bin/bash
# Fix server.js to add iframe headers

# Restore from backup if available
if [ -f /var/www/neural-os/server.js.backup ]; then
    cp /var/www/neural-os/server.js.backup /var/www/neural-os/server.js
elif [ -f /var/www/neural-os/server.js.clean ]; then
    cp /var/www/neural-os/server.js.clean /var/www/neural-os/server.js
fi

# Add iframe headers after cors middleware
sed -i "/app.use(cors());/a\\
// Enable iframe embedding for Seraphonix Sphere\\
app.use((req, res, next) => {\\
  res.setHeader('X-Frame-Options', 'ALLOWALL');\\
  res.setHeader('Content-Security-Policy', 'frame-ancestors *;');\\
  next();\\
});" /var/www/neural-os/server.js

# Restart the service
pm2 restart neural-os

echo "Server.js updated and Neural OS restarted"
