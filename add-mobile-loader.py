with open('/var/www/html/index.html', 'r') as f:
    content = f.read()

# Add mobile loader script BEFORE three.js
if 'mobile-loader.js' not in content:
    content = content.replace(
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
        '<script src="mobile-loader.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
    )
    print('Mobile loader script added')
else:
    print('Mobile loader already exists')

with open('/var/www/html/index.html', 'w') as f:
    f.write(content)
