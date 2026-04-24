const fs = require('fs');
let s = fs.readFileSync('/var/www/html/script.js', 'utf8');

// 1. Add mobile detection at start of init()
s = s.replace(
    'init() {',
    `init() {
        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (this.isMobile) {
            this.zoom = 18;
            console.log('Seraphonix: Mobile mode enabled');
        }
        
        // Auto-hide loading screen after 5 seconds
        setTimeout(() => {
            const ls = document.getElementById('loading-screen');
            if (ls) {
                ls.classList.add('hidden');
                setTimeout(() => { if (ls.parentNode) ls.remove(); }, 600);
            }
        }, 5000);
`
);

// 2. Reduce stars on mobile
s = s.replace(
    'const starsCount = 2000;',
    'const starsCount = this.isMobile ? 100 : 2000;'
);

// 3. Lower pixel ratio on mobile
s = s.replace(
    'this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));',
    'this.renderer.setPixelRatio(this.isMobile ? 1 : Math.min(window.devicePixelRatio, 2));'
);

// 4. Add touch event handlers in setupEvents()
const setupEventsInsert = `    setupEvents() {
        const canvas = document.getElementById('sphere-canvas');
        
        // MOBILE: Add touch event handlers
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.setupTouchEvents(canvas);
        }
`;

s = s.replace('    setupEvents() {\n        const canvas = document.getElementById(\'sphere-canvas\');', setupEventsInsert);

// 5. Add setupTouchEvents method before the last closing brace
const lastBrace = s.lastIndexOf('}');
const touchMethod = `
// Touch event handlers for mobile
setupTouchEvents(canvas) {
    let touchStartX = 0, touchStartY = 0, hasMoved = false;
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const t = e.touches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            hasMoved = false;
            this.isDragging = true;
            this.mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && this.isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) hasMoved = true;
            const sensitivity = this.isMobile ? 0.012 : 0.008;
            this.sphereGroup.rotation.y += dx * sensitivity;
            this.sphereGroup.rotation.x += dy * sensitivity;
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            this.checkNodeIntersection();
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        this.isDragging = false;
        this.checkNodeIntersection();
        if (!hasMoved) this.handleNodeClick();
        hasMoved = false;
    }, { passive: true });
}
`;

s = s.slice(0, lastBrace) + touchMethod + s.slice(lastBrace);

fs.writeFileSync('/var/www/html/script.js', s);
console.log('Applied mobile optimizations');

// Verify syntax
const { execSync } = require('child_process');
try {
    execSync('node -c /var/www/html/script.js', { stdio: 'pipe' });
    console.log('Syntax: OK');
} catch(e) {
    console.log('Syntax error:', e.message);
}