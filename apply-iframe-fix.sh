#!/bin/bash
# Apply iframe fix to Neural OS server.js

cd /var/www/neural-os || exit 1

# Backup current server.js
cp server.js server.js.pre-iframe-fix 2>/dev/null || true

# Use Python for reliable text manipulation
python3 << 'PYEOF'
import re

with open('server.js', 'r') as f:
    content = f.read()

# Add cors require if not present
if "require('cors')" not in content:
    content = content.replace(
        "const crypto = require('crypto');",
        "const crypto = require('crypto');\nconst cors = require('cors');"
    )

# Add cors middleware and iframe headers if not present
if 'X-Frame-Options' not in content:
    content = content.replace(
        "app.use(express.json());",
        """app.use(express.json());
app.use(cors());

// Enable iframe embedding for Seraphonix Sphere
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *;');
  next();
});"""
    )

with open('server.js', 'w') as f:
    f.write(content)

print('server.js updated successfully')
PYEOF

# Install cors if needed
if ! npm list cors 2>/dev/null | grep -q cors; then
    npm install cors --save
fi

# Restart the service
pm2 restart neural-os

echo 'Neural OS iframe fix applied and service restarted'
