import re

with open('/var/www/html/script.js', 'r') as f:
    lines = f.readlines()

# Fix line 117 (index 116)
if len(lines) > 116:
    lines[116] = '            const ls = document.getElementById("loading-screen");\n'

# Fix line 119 (index 118) if it also has the issue
if len(lines) > 118 and 'mobile-loader' in lines[118] and '" mobile-loader' in lines[118]:
    lines[118] = lines[118].replace('" mobile-loader', '"mobile-loader"')

with open('/var/www/html/script.js', 'w') as f:
    f.writelines(lines)

print('Fixed broken quotes')
