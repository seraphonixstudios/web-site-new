with open('/var/www/html/index.html', 'r') as f:
    content = f.read()

# Simplify mobile loader script to just one setTimeout
old_script_start = content.find('// Mobile loading status')
old_script_end = content.find('// Error fallback')

if old_script_start > 0 and old_script_end > 0:
    # Find the end of the script tag
    script_end = content.find('</script>', old_script_end)
    if script_end > 0:
        old_block = content[old_script_start:script_end+9]
        new_block = "// Mobile loader hide\\n        setTimeout(function(){var m=document.getElementById('mobile-loader');if(m)m.style.display='none';},3000);"
        content = content.replace(old_block, new_block)
        print('Simplified mobile loader script')

# Ensure loading screen hides properly
if 'loading-screen' in content:
    print('Loading screen div exists')

with open('/var/www/html/index.html', 'w') as f:
    f.write(content)

print('index.html cleaned up')
