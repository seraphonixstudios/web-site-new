import re
content = open('/var/www/neural-os/public/dashboard.html').read()
content = content.replace('typeof log.timestamp ===  string', "typeof log.timestamp === 'string'")
open('/var/www/neural-os/public/dashboard.html', 'w').write(content)
print('Fixed missing quotes')
