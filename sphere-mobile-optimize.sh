#!/bin/bash
# Mobile & iOS Optimization for Seraphonix Sphere

cd /var/www/html || exit 1

# Backup
cp script.js script.js.pre-mobile

python3 << 'PYEOF'
import re

with open('script.js', 'r') as f:
    content = f.read()

# Add mobile detection and optimizations at the beginning of the class
mobile_detection = '''
        // Mobile & iOS Detection
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.isMobile = window.innerWidth < 768 || this.isTouchDevice;
        
        // Performance settings based on device
        this.particleCount = this.isMobile ? 6 : 12;
        this.orbitalRingCount = this.isMobile ? 2 : 3;
        this.targetFPS = this.isMobile ? 30 : 60;
        this.enableDataParticles = !this.isMobile;
        
        // iOS specific
        if (this.isIOS) {
            // Reduce effects on iOS for battery life
            this.particleCount = 4;
            this.enableGlow = false;
        }
'''

# Insert after constructor or init
content = content.replace(
    'init() {',
    'init() {' + mobile_detection
)

# Optimize createNodeFire for mobile
old_fire = 'const particleCount = isCentral ? 20 : 8;'
new_fire = 'const particleCount = isCentral ? (this.isMobile ? 8 : 12) : (this.isMobile ? 4 : 6);'
content = content.replace(old_fire, new_fire)

# Optimize orbital rings
old_rings = 'this.orbitalRings.push(ring);'
new_rings = '''this.orbitalRings.push(ring);
            // Limit rings on mobile
            if (this.isMobile && this.orbitalRings.length >= this.orbitalRingCount) break;'''
content = content.replace(old_rings, new_rings)

# Optimize data particles
old_data = 'this.createDataParticles();'
new_data = '''// Only create data particles on desktop
        if (!this.isMobile) {
            this.createDataParticles();
        }'''
content = content.replace(old_data, new_data)

# Optimize touch events for mobile
old_mouse = '''this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });'''

new_input = '''// Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            const touch = e.touches[0];
            this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
            // Prevent default to stop scrolling
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const touch = e.touches[0];
            const deltaMove = {
                x: touch.clientX - this.previousMousePosition.x,
                y: touch.clientY - this.previousMousePosition.y
            };
            
            // Increased sensitivity for touch
            const sensitivity = this.isMobile ? 0.008 : 0.005;
            this.sphereRotation.y += deltaMove.x * sensitivity;
            this.sphereRotation.x += deltaMove.y * sensitivity;
            
            this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });'''

content = content.replace(old_mouse, new_input)

# Optimize animation loop for mobile
old_animate = '''const animate = () => {
            requestAnimationFrame(animate);'''

new_animate = '''let lastFrameTime = 0;
        const frameInterval = 1000 / this.targetFPS;
        
        const animate = (currentTime) => {
            requestAnimationFrame(animate);
            
            // Frame limiting for mobile performance
            const delta = currentTime - lastFrameTime;
            if (delta < frameInterval) return;
            lastFrameTime = currentTime - (delta % frameInterval);
            
            // Skip rendering if tab is hidden
            if (document.hidden) return;'''

content = content.replace(old_animate, new_animate)

# Optimize resize handler
old_resize = '''window.addEventListener('resize', () => {
            if (this.camera && this.renderer) {'''

new_resize = '''window.addEventListener('resize', () => {
            // Update mobile detection on resize
            this.isMobile = window.innerWidth < 768 || this.isTouchDevice;
            
            if (this.camera && this.renderer) {'''

content = content.replace(old_resize, new_resize)

with open('script.js', 'w') as f:
    f.write(content)

print('Seraphonix Sphere optimized for mobile/iOS')
print('- Touch event support added')
print('- Reduced particles on mobile (4-8 instead of 8-12)')
print('- Frame rate limiting (30fps on mobile)')
print('- Data particles disabled on mobile')
print('- Increased touch sensitivity')
print('- Resize detection for orientation changes')
PYEOF

echo 'Sphere optimized for mobile/iOS'
