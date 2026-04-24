#!/bin/bash
# Complete Debug and Test Suite for Seraphonix & Neural OS

echo "=== SERAPHONIX & NEURAL OS DEBUG SUITE ==="
echo ""

# Test 1: Check if services are running
echo "1. CHECKING SERVICES..."
echo "   Nginx:"
ssh root@76.13.242.128 "systemctl is-active nginx 2>&1 || echo 'NOT RUNNING'"
echo "   Neural-OS:"
ssh root@76.13.242.128 "pm2 status neural-os 2>&1 | grep -E 'online|error|stopped'"
echo ""

# Test 2: Check file syntax
echo "2. CHECKING JAVASCRIPT SYNTAX..."
ssh root@76.13.242.128 "node --check /var/www/html/script.js 2>&1 && echo '   ✓ script.js OK' || echo '   ✗ script.js ERRORS'"
ssh root@76.13.242.128 "node --check /var/www/neural-os/public/dashboard.html 2>&1 && echo '   ✓ dashboard.html OK' || echo '   Note: HTML checks may fail'"
echo ""

# Test 3: Check file sizes
echo "3. CHECKING FILE SIZES..."
ssh root@76.13.242.128 "ls -lh /var/www/html/script.js /var/www/html/index.html /var/www/neural-os/public/dashboard.html 2>&1 | awk '{print \"   \" \$5 \" \" \$9}'"
echo ""

# Test 4: Check if files are being served
echo "4. TESTING HTTP ENDPOINTS..."
echo "   Main site:"
curl -s -o /dev/null -w "%{http_code}" http://76.13.242.128/ 2>&1 | xargs -I {} echo "     Status: {}"
echo "   Neural OS:"
curl -s -o /dev/null -w "%{http_code}" http://76.13.242.128:3077/ 2>&1 | xargs -I {} echo "     Status: {}"
echo ""

# Test 5: Check Neural OS API endpoints
echo "5. TESTING NEURAL OS APIs..."
echo "   /api/metrics:"
curl -s -H "Authorization: Bearer seraphadmin" http://76.13.242.128:3077/api/metrics 2>&1 | head -1
echo "   /api/security/overview:"
curl -s -H "Authorization: Bearer seraphadmin" http://76.13.242.128:3077/api/security/overview 2>&1 | head -1
echo ""

# Test 6: Check for errors in logs
echo "6. CHECKING RECENT ERRORS..."
echo "   Neural OS Errors:"
ssh root@76.13.242.128 "tail -10 /root/.pm2/logs/neural-os-error.log 2>&1 | grep -v '^$' | head -5"
echo ""
echo "   Nginx Errors:"
ssh root@76.13.242.128 "tail -5 /var/log/nginx/error.log 2>&1 | grep -v '^$'"
echo ""

echo "=== END OF DEBUG REPORT ==="
