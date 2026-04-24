const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Add mobile performance optimization to init()
const performanceCode = `        // MOBILE PERFORMANCE OPTIMIZATION
        if (this.isMobile) {
            this.zoom = 18;
            console.log('Seraphonix: Mobile mode enabled - reducing rendering');
            
            // Reduce animation complexity on mobile
            this.maxStars = 200;
            this.animationFPS = 30;
            
            // Lower rendering quality
            if (this.renderer) {
                this.renderer.setPixelRatio(1); // Force 1x pixel ratio on mobile
            }
        }`;

content = content.replace(
    'if (this.isMobile) {\n            this.zoom = 18;\n            console.log',
    performanceCode
);

// Add star count limit in createStarfield
const starReduction = `// Reduce stars on mobile for performance
        const starsCount = this.isMobile ? 200 : 2000;`;

content = content.replace(
    'const starsCount = 2000;',
    starReduction
);

// Add frame limiting to animation loop
const animLoop = `startAnimationLoop() {
        let lastTime = 0;
        const targetFPS = this.isMobile ? 30 : 60;
        const frameInterval = 1000 / targetFPS;
        
        const animate = (time) => {
            requestAnimationFrame(animate);
            
            const delta = time - lastTime;
            if (delta < frameInterval) return;
            
            lastTime = time - (delta % frameInterval);`;

content = content.replace(
    'startAnimationLoop() {\n        const animate = (time) => {\n            requestAnimationFrame(animate);',
    animLoop
);

fs.writeFileSync('/var/www/html/script.js', content);
console.log('Added mobile performance optimizations');