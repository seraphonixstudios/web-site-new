import re

with open('/var/www/html/script.js', 'r') as f:
    content = f.read()

# Add WebGL check and fallback functions if not present
if 'checkWebGLSupport' not in content:
    webgl_check = '''
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    showFallbackUI() {
        // Hide loading screens
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        const mobileLoader = document.getElementById('mobile-loader');
        if (mobileLoader) mobileLoader.style.display = 'none';
        
        // Show fallback menu
        const fallback = document.createElement('div');
        fallback.id = 'fallback-ui';
        fallback.innerHTML = '<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #0a0a15 0%, #050508 100%); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 40px 20px; box-sizing: border-box; z-index: 9999; overflow-y: auto;"><div style="font-size: 4rem; margin-bottom: 10px; animation: pulse 2s infinite;">◉</div><h1 style="font-family: Orbitron, sans-serif; font-size: 1.8rem; color: #00D4FF; text-align: center; margin-bottom: 5px; text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);">SERAPHONIX</h1><p style="font-family: Rajdhani, sans-serif; color: #8899a6; text-align: center; margin-bottom: 30px;">Neural Sphere Interface</p><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; max-width: 400px; width: 100%;"><button onclick="window.location.href=\'#window-central\'" style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 20px; font-family: Orbitron, sans-serif; cursor: pointer; border-radius: 8px; min-height: 80px;">◉<br>Central</button><button onclick="window.location.href=\'#window-lore\'" style="background: rgba(255, 0, 110, 0.1); border: 1px solid #ff006e; color: #ff006e; padding: 20px; font-family: Orbitron, sans-serif; cursor: pointer; border-radius: 8px; min-height: 80px;">📜<br>Lore</button><button onclick="window.location.href=\'#window-brand\'" style="background: rgba(255, 184, 0, 0.1); border: 1px solid #ffb800; color: #ffb800; padding: 20px; font-family: Orbitron, sans-serif; cursor: pointer; border-radius: 8px; min-height: 80px;">📖<br>Brand</button><button onclick="window.location.href=\'#window-store\'" style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 20px; font-family: Orbitron, sans-serif; cursor: pointer; border-radius: 8px; min-height: 80px;">🛒<br>Store</button><button onclick="window.location.href=\'#window-vps\'" style="background: rgba(255, 0, 64, 0.1); border: 1px solid #ff0040; color: #ff0040; padding: 20px; font-family: Orbitron, sans-serif; cursor: pointer; border-radius: 8px; min-height: 80px;">🔐<br>Neural-OS</button></div><p style="color: #8899a6; font-size: 0.8rem; margin-top: 30px; text-align: center;">3D Sphere requires WebGL support.<br>Using simplified 2D interface.</p></div>';
        document.body.appendChild(fallback);
    }
'''
    
    # Find a good place to insert - before init function
    content = content.replace(
        'init() {',
        webgl_check + '\n    init() {'
    )
    print('Added WebGL check and fallback functions')

# Add WebGL check to init function
if 'if (!this.checkWebGLSupport())' not in content:
    content = content.replace(
        'init() {',
        '''init() {
        // Check for WebGL support
        if (!this.checkWebGLSupport()) {
            console.warn('WebGL not supported, showing fallback UI');
            this.showFallbackUI();
            return;
        }'''
    )
    print('Added WebGL check to init')

# Expose sphereApp globally
if 'window.sphereApp' not in content:
    content = content.replace(
        'const sphere = new SeraphonixSphere();',
        'const sphere = new SeraphonixSphere();\nwindow.sphereApp = sphere;'
    )
    print('Exposed sphereApp globally')

with open('/var/www/html/script.js', 'w') as f:
    f.write(content)

print('Mobile loading fixes applied')
