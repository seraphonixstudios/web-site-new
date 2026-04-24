import re

with open('/var/www/neural-os/public/dashboard.html', 'r') as f:
    content = f.read()

# Add Security nav tab after Terminal
old_nav = '<button class="nav-tab" data-tab="terminal">Terminal</button>'
new_nav = '<button class="nav-tab" data-tab="terminal">Terminal</button>\n            <button class="nav-tab" data-tab="security">Security</button>'

if new_nav not in content:
    content = content.replace(old_nav, new_nav)
    print('Security navigation tab added')
else:
    print('Security tab already exists')

with open('/var/www/neural-os/public/dashboard.html', 'w') as f:
    f.write(content)
