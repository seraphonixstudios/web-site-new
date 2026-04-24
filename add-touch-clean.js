const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Add mobile detection to init()
const oldInit = '    init() {';
const newInit = `    init() {
        // MOBILE DETECTION
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (this.isMobile) {
            this.zoom = 18;
            console.log('Seraphonix: Mobile mode enabled');
        }
        
        // Auto-hide loading after 5 seconds
        setTimeout(() => {
            const ls = document.getElementById('loading-screen');
            if (ls) {
                ls.classList.add('hidden');
                setTimeout(() => { if (ls.parentNode) ls.remove(); }, 600);
            }
        }, 5000);
`;

content = content.replace(oldInit, newInit);

// Find setupEvents and add touch handlers
const setupEventsStart = '    setupEvents() {';
const setupEventsNew = `    setupEvents() {
        // MOBILE: Check for touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Touch event handlers
        if (isTouchDevice) {
            this.setupTouchEvents();
        }
`;

content = content.replace(setupEventsStart, setupEventsNew);

// Add setupTouchEvents method before the last closing brace
const lastBrace = content.lastIndexOf('}');
const touchMethod = `
// Touch events for mobile/tablet
setupTouchEvents() {
    const canvas = document.getElementById('sphere-canvas');
    let touchStartX = 0;
    let touchStartY = 0;
    let hasMoved = false;
    
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
            const sens = this.isMobile ? 0.012 : 0.008;
            this.sphereGroup.rotation.y += dx * sens;
            this.sphereGroup.rotation.x += dy * sens;
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

content = content.slice(0, lastBrace) + touchMethod + content.slice(lastBrace);

fs.writeFileSync('/var/www/html/script.js', content);
console.log('Added mobile/touch support properly');