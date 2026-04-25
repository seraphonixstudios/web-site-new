#!/usr/bin/env python3
with open('/var/www/html/index.html', 'r') as f:
    c = f.read()
c = c.replace('</body>\\n    <script src="mobile-fix.js"></script>', '<script src="mobile-fix.js"></script>\n</body>')
with open('/var/www/html/index.html', 'w') as f:
    f.write(c)
print('Fixed')