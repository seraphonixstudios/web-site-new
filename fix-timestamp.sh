#!/bin/bash
# Fix the timestamp issue in dashboard

DASHBOARD="/var/www/neural-os/public/dashboard.html"

# Fix the toISOString issue - replace with proper handling
sed -i "s/\${log\.timestamp\.toISOString()\.slice(0, 19)}/\${typeof log.timestamp === 'string' ? log.timestamp.slice(0, 19) : log.timestamp.toISOString().slice(0, 19)}/g" $DASHBOARD

echo 'Fixed timestamp handling in renderLogs'
