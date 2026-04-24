const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Add debug logging for mobile touch events
const touchStartHandler = `canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isTouchDragging = false;
                this.isDragging = true;
                
                // Update mouse for raycasting
                this.mouse.x = (touchStartX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(touchStartY / window.innerHeight) * 2 + 1;
                console.log('Seraphonix: Touch start at', touchStartX, touchStartY);
            }
        }, { passive: true });`;

content = content.replace(
    /canvas\.addEventListener\('touchstart', \(e\) => \{\s*if \(e\.touches\.length === 1\) \{\s*touchStartX = e\.touches\[0\]\.clientX;/g,
    touchStartHandler
);

// Also ensure the canvas has proper touch-action CSS applied
const cssFix = `

/* Emergency touch fix - ensure canvas is interactive */
#sphere-canvas {
    touch-action: none !important;
    -webkit-touch-callout: default;
    -webkit-user-select: none;
    user-select: none;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 1 !important;
}

/* Ensure content windows are above canvas */
.content-window {
    z-index: 200 !important;
}

/* Loading screen must be above everything */
#loading-screen {
    z-index: 10000 !important;
}
`;

let currentCSS = fs.readFileSync('/var/www/html/mobile-responsive.css', 'utf8');
if (!currentCSS.includes('Emergency touch fix')) {
    currentCSS = currentCSS + cssFix;
    fs.writeFileSync('/var/www/html/mobile-responsive.css', currentCSS);
    console.log('Added emergency touch CSS fixes');
}

fs.writeFileSync('/var/www/html/script.js', content);
console.log('Enhanced touch debugging');