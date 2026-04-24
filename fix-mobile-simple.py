import re

# Fix index.html - simplify mobile loader
with open('/var/www/html/index.html', 'r') as f:
    content = f.read()

# Find and simplify the mobile loader script
old_loader = '''// Hide mobile loader when page ready
        window.addEventListener('load', () => {
            updateStatus('Starting Neural Sphere...');
            setTimeout(() => {
                const loader = document.getElementById('mobile-loader');
                if (loader) loader.style.display = 'none';
            }, 1000);
        });'''

new_loader = '''// Hide mobile loader when page ready
        window.addEventListener('load', () => {
            updateStatus('Starting Neural Sphere...');
            setTimeout(() => {
                const loader = document.getElementById('mobile-loader');
                if (loader) loader.style.display = 'none';
            }, 1500);
        });
        
        // FORCE HIDE mobile loader after 4 seconds (mobile fallback)
        setTimeout(() => {
            const ml = document.getElementById('mobile-loader');
            if (ml) ml.style.display = 'none';
        }, 4000);'''

content = content.replace(old_loader, new_loader)

# Remove the corrupted force hide that may have been added before
content = re.sub(r'// Force hide mobile loader after 8 seconds.*?}\n\s*}\n\s*}\);', '', content, flags=re.DOTALL)

with open('/var/www/html/index.html', 'w') as f:
    f.write(content)

print('index.html mobile loader fixed')

# Fix script.js - simplify loading screen timeout  
with open('/var/www/html/script.js', 'r') as f:
    content = f.read()

# Remove any corrupted showFallbackUI or checkWebGLSupport functions
content = re.sub(r'checkWebGLSupport\(\).*?return false;\s*}\s*}', '', content, flags=re.DOTALL)
content = re.sub(r'showFallbackUI\(\).*?document\.body\.appendChild\(fallback\);\s*}', '', content, flags=re.DOTALL)

# Simplify init to not check WebGL
content = re.sub(r'// Check for WebGL support.*?if \(!this\.checkWebGLSupport\(\)\) \{.*?return;\s*}', '', content, flags=re.DOTALL)

# Fix the loading timeout to be shorter
content = content.replace(
    'setTimeout(() => {\n            const loadingScreen = document.getElementById(\'loading-screen\');\n            if (loadingScreen) {\n                loadingScreen.classList.add(\'hidden\');\n            }\n            setTimeout(() => this.openWindow(\'central\'), 500);\n        }, 3000);',
    '''setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
            setTimeout(() => this.openWindow('central'), 500);
        }, 1500);
        
        // FORCE HIDE loading screen after 5 seconds (mobile fallback)
        setTimeout(() => {
            const ls = document.getElementById('loading-screen');
            if (ls && !ls.classList.contains('hidden')) {
                ls.classList.add('hidden');
                console.log('Loading screen force-hidden');
            }
        }, 5000);'''
)

with open('/var/www/html/script.js', 'w') as f:
    f.write(content)

print('script.js loading timeout fixed')
print('Mobile loading should work now!')
