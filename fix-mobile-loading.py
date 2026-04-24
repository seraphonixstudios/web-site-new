import re

with open('/var/www/html/script.js', 'r') as f:
    content = f.read()

# Find the init function and add mobile error handling
old_init = '''init() {
        this.initRenderer();
        this.createScene();
        this.createStars();
        this.createSphere();
        this.createNodes();
        this.createSeraphEyes();
        this.createDataParticles();
        this.setupLighting();
        this.setupEvents();
        this.setupUI();
        this.startAnimationLoop();
        this.startClock();
        
        // Auto-open central node after loading
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            setTimeout(() => this.openWindow('central'), 500);
        }, 3000);
    }'''

new_init = '''init() {
        try {
            // Check for WebGL support
            if (!this.checkWebGLSupport()) {
                this.showFallbackUI();
                return;
            }
            
            // Mobile detection
            this.isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
            
            this.initRenderer();
            this.createScene();
            this.createStars();
            this.createSphere();
            this.createNodes();
            this.createSeraphEyes();
            
            // Only create data particles on desktop
            if (!this.isMobile) {
                this.createDataParticles();
            }
            
            this.setupLighting();
            this.setupEvents();
            this.setupUI();
            this.startAnimationLoop();
            this.startClock();
            
            // Auto-open central node after loading
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                setTimeout(() => this.openWindow('central'), 500);
            }, this.isMobile ? 2000 : 3000);
            
        } catch (error) {
            console.error('Seraphonix initialization error:', error);
            this.showFallbackUI();
        }
    }
    
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
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        // Show fallback 2D menu
        const fallback = document.createElement('div');
        fallback.id = 'fallback-ui';
        fallback.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #0a0a15 0%, #050508 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; z-index: 9999;">
                <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 2s infinite;">◉</div>
                <h1 style="font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #00D4FF; text-align: center; margin-bottom: 10px; text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);">SERAPHONIX</h1>
                <p style="font-family: 'Rajdhani', sans-serif; color: #8899a6; text-align: center; margin-bottom: 30px;">Neural Sphere Interface</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; max-width: 400px; width: 100%;">
                    <button onclick="window.sphereApp.openWindow('central')" style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 20px; font-family: 'Orbitron', sans-serif; cursor: pointer; border-radius: 8px;">◉<br>Central</button>
                    <button onclick="window.sphereApp.openWindow('lore')" style="background: rgba(255, 0, 110, 0.1); border: 1px solid #ff006e; color: #ff006e; padding: 20px; font-family: 'Orbitron', sans-serif; cursor: pointer; border-radius: 8px;">📜<br>Lore</button>
                    <button onclick="window.sphereApp.openWindow('brand')" style="background: rgba(255, 184, 0, 0.1); border: 1px solid #ffb800; color: #ffb800; padding: 20px; font-family: 'Orbitron', sans-serif; cursor: pointer; border-radius: 8px;">📖<br>Brand</button>
                    <button onclick="window.sphereApp.openWindow('genesis')" style="background: rgba(0, 255, 136, 0.1); border: 1px solid #00ff88; color: #00ff88; padding: 20px; font-family: 'Orbitron', sans-serif; cursor: pointer; border-radius: 8px;">✨<br>Genesis</button>
                    <button onclick="window.sphereApp.openWindow('store')" style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 20px; font-family: 'Orbitron', sans-serif; cursor: pointer; border-radius: 8px;">🛒<br>Store</button>
                    <button onclick="window.sphereApp.openWindow('vps')" style="background: rgba(255, 0, 64, 0.1); border: 1px solid #ff0040; color: #ff0040; padding: 20px; font-family: 'Orbitron', sans-serif; cursor: pointer; border-radius: 8px;">🔐<br>Neural-OS</button>
                </div>
                
                <p style="color: #8899a6; font-size: 0.8rem; margin-top: 30px; text-align: center;">3D Sphere requires WebGL support.<br>Using simplified 2D interface.</p>
            </div>
        `;
        document.body.appendChild(fallback);
    }'''

if 'checkWebGLSupport' not in content:
    content = content.replace(old_init, new_init)
    print('Added WebGL check and fallback UI')

# Make sure window.sphereApp is exposed for the fallback
if 'window.sphereApp' not in content:
    content = content.replace(
        'const sphere = new SeraphonixSphere();',
        'const sphere = new SeraphonixSphere();\n        window.sphereApp = sphere; // Expose for fallback UI'
    )
    print('Exposed sphereApp globally')

# Fix loading screen hide timing
content = content.replace(
    'setTimeout(() => {\n            document.getElementById(\'loading-screen\').classList.add(\'hidden\');',
    '''const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }'''
)

with open('/var/www/html/script.js', 'w') as f:
    f.write(content)

print('Mobile loading fix applied')
