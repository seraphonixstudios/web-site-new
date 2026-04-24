#!/bin/bash
# Performance optimizations for Seraphonix Sphere

cd /var/www/html || exit 1

# Backup script.js
cp script.js script.js.backup.performance

# Apply performance optimizations using Node.js
node << 'NODEEOF'
const fs = require('fs');
const path = '/var/www/html/script.js';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Reduce fire particle counts (20 -> 12 for central, 8 -> 4 for others)
content = content.replace(
    'const particleCount = isCentral ? 20 : 8;',
    'const particleCount = isCentral ? 12 : 4;'
);

// Fix 2: Add FPS monitoring and performance scaling
const fpsMonitorCode = `
        // Performance monitoring
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.performanceMode = false;
        this.targetFPS = 30; // Cap at 30fps for smooth experience
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        
        // Visibility handling - pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
        });
        this.isVisible = true;`;

// Insert after renderer setup
content = content.replace(
    'this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));',
    'this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduced from 2\n        ' + fpsMonitorCode
);

// Fix 3: Optimize animation loop with frame limiting
const oldAnimate = `const animate = () => {
            requestAnimationFrame(animate);`;

const newAnimate = `const animate = (currentTime) => {
            requestAnimationFrame(animate);
            
            // Skip frames to maintain target FPS
            const delta = currentTime - this.lastFrameTime;
            if (delta < this.frameInterval) return;
            this.lastFrameTime = currentTime - (delta % this.frameInterval);
            
            // Skip rendering when tab is hidden
            if (!this.isVisible) return;
            
            // FPS calculation
            this.frameCount++;
            const now = performance.now();
            if (now - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = now;
                
                // Auto-enable performance mode if FPS drops below 25
                if (this.fps < 25 && !this.performanceMode) {
                    this.enablePerformanceMode();
                }
            }`;

content = content.replace(oldAnimate, newAnimate);

// Fix 4: Reduce data particle count
content = content.replace(
    /this\.createDataParticles\(\);/,
    '// Data particles disabled for performance\n        // this.createDataParticles();'
);

// Fix 5: Reduce orbital rings complexity
content = content.replace(
    'this.orbitalRings.push(ring);',
    'this.orbitalRings.push(ring);\n            // Limit rings for performance\n            if (this.orbitalRings.length >= 3) break;'
);

// Fix 6: Add performance mode method
const performanceModeMethod = `
    enablePerformanceMode() {
        console.log('Seraphonix: Enabling performance mode');
        this.performanceMode = true;
        
        // Reduce renderer quality
        this.renderer.setPixelRatio(1);
        
        // Disable expensive effects
        if (this.scene) {
            this.scene.traverse(obj => {
                if (obj.material) {
                    obj.material.vertexColors = false;
                }
            });
        }
        
        // Show notification
        this.showNotification('⚡ Performance Mode Enabled', 'info');
    }
    
`;

// Insert before createScene method
content = content.replace(
    'createScene() {',
    performanceModeMethod + 'createScene() {'
);

// Fix 7: Optimize node fire updates - skip every other frame
content = content.replace(
    '// Update fire particles',
    '// Update fire particles (throttled)\n                if (this.frameCount % 2 === 0) {'
);

// Close the throttling if needed
content = content.replace(
    '// Update Seraph eyes',
    '}\n                \n                // Update Seraph eyes'
);

fs.writeFileSync(path, content);
console.log('Performance optimizations applied:');
console.log('- Reduced particle counts (central: 12, others: 4)');
console.log('- Frame rate capped at 30 FPS');
console.log('- Tab visibility detection (pauses when hidden)');
console.log('- Auto performance mode when FPS < 25');
console.log('- Reduced pixel ratio (1.5 instead of 2)');
console.log('- Data particles disabled');
console.log('- Orbital rings limited to 3');
console.log('- Fire particles updated every 2nd frame');
NODEEOF

echo 'Performance optimizations complete'
echo 'Backup saved: script.js.backup.performance'
