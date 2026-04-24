import re

with open('/var/www/html/index.html', 'r') as f:
    content = f.read()

# Add local THREE.js fallback
old_script = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
new_script = '''<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Fallback if THREE.js fails to load from CDN
        if (typeof THREE === 'undefined') {
            document.write('<script src="/js/three.min.js"><\\/script>');
        }
    </script>'''

content = content.replace(old_script, new_script)

# Add error handling for script loading
old_body = '<body>'
new_body = '''<body>
    <!-- Mobile Loading Indicator -->
    <div id="mobile-loader" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #050508; z-index: 10001; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 4rem; animation: pulse 1.5s infinite; margin-bottom: 20px;">◉</div>
        <div style="color: #00f3ff; font-family: Orbitron, sans-serif; font-size: 1.2rem; margin-bottom: 10px;">INITIALIZING</div>
        <div id="mobile-status" style="color: #8899a6; font-size: 0.9rem;">Loading core systems...</div>
    </div>
    <script>
        // Mobile loading status
        const mobileStatus = document.getElementById('mobile-status');
        const updateStatus = (msg) => { if(mobileStatus) mobileStatus.textContent = msg; };
        
        // Hide mobile loader when page ready
        window.addEventListener('load', () => {
            updateStatus('Starting Neural Sphere...');
            setTimeout(() => {
                const loader = document.getElementById('mobile-loader');
                if (loader) loader.style.display = 'none';
            }, 1000);
        });
        
        // Error fallback
        window.addEventListener('error', (e) => {
            console.error('Loading error:', e);
            updateStatus('Error loading. Using fallback...');
        });
    </script>'''

content = content.replace(old_body, new_body)

# Also add CSS for the mobile loader animation
if '@keyframes pulse' not in content:
    content = content.replace(
        '</style>',
        '''@keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
        }
        </style>'''
    )

with open('/var/www/html/index.html', 'w') as f:
    f.write(content)

print('Mobile loading improvements added')
print('- Local THREE.js fallback')
print('- Mobile loading indicator')
print('- Error handling for script failures')
