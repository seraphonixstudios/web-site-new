#!/bin/bash
# Enhanced Logging for Neural OS

cd /var/www/neural-os || exit 1

# Create enhanced logging middleware
cat > /tmp/logging-middleware.js << 'EOF'
// Enhanced Request Logging Middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Log to console
    console.log(`[${timestamp}] ${ip} - ${method} ${url} - ${userAgent.substring(0, 50)}`);
    
    // Log response time
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        console.log(`[${timestamp}] ${ip} - ${method} ${url} - ${status} - ${duration}ms`);
    });
    
    next();
};

// Error logging
const errorLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, err.message);
    console.error(err.stack);
    
    // Log to file
    const fs = require('fs');
    const logEntry = `[${timestamp}] ERROR: ${err.message}\n${err.stack}\n\n`;
    fs.appendFileSync('/var/www/neural-os/logs/error.log', logEntry);
    
    next(err);
};

module.exports = { requestLogger, errorLogger };
EOF

# Add logging to server.js
python3 << 'PYEOF'
import re

with open('server.js', 'r') as f:
    content = f.read()

# Add logging after the express app is created
if 'requestLogger' not in content:
    # Add logging middleware after app.use(cors())
    content = content.replace(
        'app.use(cors());',
        '''app.use(cors());

// Enhanced logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`[NEURAL-OS] ${timestamp} - ${ip} - ${req.method} ${req.url}`);
    next();
});'''
    )

# Add error logging at the end before server.listen
if 'error logging' not in content.lower():
    content = content.replace(
        'server.listen(PORT',
        '''// Global error handler
process.on('uncaughtException', (err) => {
    console.error('[NEURAL-OS CRITICAL] Uncaught Exception:', err);
    const fs = require('fs');
    fs.appendFileSync('/var/www/neural-os/logs/critical.log', 
        `[${new Date().toISOString()}] CRITICAL: ${err.message}\n${err.stack}\n\n`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[NEURAL-OS CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(PORT'''
    )

with open('server.js', 'w') as f:
    f.write(content)

print('Enhanced logging added to Neural OS')
PYEOF

# Create logs directory
mkdir -p logs

# Set up log rotation
cat > /tmp/logrotate-neuralos << 'EOF'
/var/www/neural-os/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

cp /tmp/logrotate-neuralos /etc/logrotate.d/neural-os 2>/dev/null || echo "Logrotate config created"

# Restart Neural OS
pm2 restart neural-os

echo ""
echo "=== ENHANCED LOGGING ACTIVATED ==="
echo "- Request logging: All HTTP requests"
echo "- Error logging: /var/www/neural-os/logs/error.log"
echo "- Critical errors: /var/www/neural-os/logs/critical.log"
echo "- Log rotation: Daily, 7 days retention"
echo ""
echo "View logs: tail -f /var/www/neural-os/logs/error.log"
