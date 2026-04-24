import re

with open('/var/www/html/index.html', 'r') as f:
    content = f.read()

with open('/var/www/html/content-windows.html', 'r') as f:
    windows = f.read()

# Find and replace the content-windows div
old_div = 'id="content-windows"></div>'
new_div = windows

if old_div in content:
    content = content.replace(old_div, new_div)
    print('Windows inserted successfully')
else:
    # Try with escaped quotes
    old_div2 = "id=\"content-windows\"></div>"
    if old_div2 in content:
        content = content.replace(old_div2, new_div)
        print('Windows inserted (alt format)')
    else:
        print('Could not find content-windows div')

with open('/var/www/html/index.html', 'w') as f:
    f.write(content)
    print('Saved')
