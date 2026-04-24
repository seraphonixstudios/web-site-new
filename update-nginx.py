import re

with open('/etc/nginx/sites-available/verilysovereign.org', 'r') as f:
    content = f.read()

# Add CSP header after the existing security headers
csp_line = "add_header Content-Security-Policy \"default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://76.13.242.128:3077; img-src 'self' data: http: https:; frame-src 'self' http://76.13.242.128:3077;\" always;"

# Find the security headers section and add CSP
if 'Content-Security-Policy' not in content:
    content = content.replace(
        'add_header X-Content-Type-Options \"nosniff\" always;',
        'add_header X-Content-Type-Options \"nosniff\" always;\n    ' + csp_line
    )

with open('/etc/nginx/sites-available/verilysovereign.org', 'w') as f:
    f.write(content)

print('CSP header added to site config')
