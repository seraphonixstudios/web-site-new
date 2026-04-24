const fs = require('fs');
let c = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Add mobile detection to init()
c = c.replace(
    'this.init();',
    `this.init();
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (this.isMobile) {
            this.zoom = 18;
            console.log('Seraphonix: Mobile mode');
        }`
);

// Reduce stars - find where starsCount is set and use isMobile
c = c.replace(
    'const starsCount = 2000;',
    'const starsCount = this.isMobile ? 100 : 2000;'
);

// Lower pixel ratio on mobile
c = c.replace(
    'this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));',
    'this.renderer.setPixelRatio(this.isMobile ? 1 : Math.min(window.devicePixelRatio, 2));'
);

fs.writeFileSync('/var/www/html/script.js', c);
console.log('Mobile optimizations added');
node -c /var/www/html/script.js && console.log('Syntax OK');