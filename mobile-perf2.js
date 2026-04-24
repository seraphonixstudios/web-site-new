const fs = require('fs');
let c = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Even more aggressive mobile optimizations
c = c.replace(
    'const starsCount = this.isMobile ? 200 : 2000;',
    'const starsCount = this.isMobile ? 100 : 2000;'
);

// Remove or simplify complex effects on mobile
const complexEffects = `
        // Reduce effects on mobile
        if (!this.isMobile) {
            this.createLightRays();
            this.createDataParticles();
        }
`;
c = c.replace(
    'this.createDataParticles();',
    complexEffects
);

// Simplify starfield on mobile
c = c.replace(
    'size: 0.15,',
    'size: this.isMobile ? 0.1 : 0.15,'
);

fs.writeFileSync('/var/www/html/script.js', c);
console.log('Optimized for mobile');