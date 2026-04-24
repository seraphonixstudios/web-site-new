const fs = require('fs');
const content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Check if already modified
if (content.includes('MOBILE_OPTIMIZATION')) {
    console.log('Already optimized');
    process.exit(0);
}

// Find where to add mobile optimization - after touchState initialization
const insertAfter = "this.touchState = {";
const mobileOptimize = `
// MOBILE_OPTIMIZATION: Enhanced touch for mobile
if (this.isMobile) {
    console.log('Seraphonix: Mobile mode active');
    
    // Increase touch sensitivity for mobile
    this.touchSensitivity = 0.015; // Higher = more sensitive
    
    // Reduce animation complexity
    this.targetRotationSpeed = { x: 0.001, y: 0.001 };
    
    // Auto-hide loading after 4 seconds max
    setTimeout(() => {
        const ls = document.getElementById('loading-screen');
        if (ls) {
            ls.classList.add('hidden');
            setTimeout(() => ls.remove(), 600);
        }
    }, 4000);
}
`;

const newContent = content.replace(
    insertAfter,
    insertAfter + '\n        ' + mobileOptimize.split('\n').join('\n        ')
);

fs.writeFileSync('/var/www/html/script.js', newContent);
console.log('Added mobile optimization to script.js');

// Also update mobile-responsive.css with better mobile styles
const cssContent = fs.readFileSync('/var/www/html/mobile-responsive.css', 'utf8');

const additionalMobileCSS = `

/* Mobile Performance & UX Fixes */
@media (max-width: 768px) {
    /* Force loading screen to hide */
    #loading-screen {
        display: flex !important;
        z-index: 10000 !important;
    }
    
    #loading-screen.hidden {
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
    }
    
    /* Canvas should be touchable */
    #sphere-canvas {
        touch-action: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
    }
    
    /* Content windows - smaller and centered */
    .content-window {
        position: fixed !important;
        width: 94vw !important;
        max-width: 94vw !important;
        min-height: auto !important;
        max-height: 80vh !important;
        left: 3vw !important;
        top: 8vh !important;
        margin: 0 !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
        border-radius: 12px !important;
    }
    
    .content-window.active {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        transform: none !important;
    }
    
    /* If no 3D, show simplified content */
    body.no-webgl .content-window {
        display: block !important;
    }
    
    /* HUD hidden on mobile for full experience */
    .hud-overlay {
        display: none !important;
    }
    
    /* Gesture hints at bottom */
    #gesture-hints {
        position: fixed !important;
        bottom: 8px !important;
        left: 5vw !important;
        right: 5vw !important;
        width: 90vw !important;
        font-size: 0.7rem !important;
        padding: 8px 12px !important;
        background: rgba(0,0,0,0.8) !important;
        border-radius: 8px !important;
        z-index: 100 !important;
    }
    
    /* Node labels smaller on mobile */
    .node-label {
        font-size: 0.65rem !important;
        padding: 6px 10px !important;
        transform: translate(-50%, -50%) scale(0.9) !important;
    }
    
    /* Quick links better touch targets */
    .quick-link {
        min-height: 48px !important;
        padding: 12px 16px !important;
        font-size: 0.9rem !important;
        margin: 4px 0 !important;
    }
    
    /* Stats grid 2 columns on mobile */
    .stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
    }
    
    /* Iframes in windows scrollable */
    .genesis-content iframe,
    .store-content iframe,
    .vps-content iframe {
        min-height: 50vh !important;
        -webkit-overflow-scrolling: touch;
    }
    
    /* Window header fixed on mobile */
    .window-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 10 !important;
    }
    
    /* Window controls larger for touch */
    .close-btn, .minimize-btn, .maximize-btn {
        min-width: 36px !important;
        min-height: 36px !important;
    }
}

@media (max-width: 480px) {
    .content-window {
        width: 96vw !important;
        left: 2vw !important;
        top: 6vh !important;
        max-height: 85vh !important;
    }
    
    .stats-grid {
        grid-template-columns: 1fr !important;
    }
    
    .glitch-title {
        font-size: 1.3rem !important;
    }
    
    .window-content {
        padding: 12px !important;
    }
    
    .link-grid {
        grid-template-columns: 1fr !important;
    }
}

/* Emergency: always ensure loading screen can be dismissed */
@keyframes forceHideLoader {
    0%, 80% { opacity: 1; }
    100% { opacity: 0; pointer-events: none; }
}

body.loaded #loading-screen {
    animation: forceHideLoader 0.5s ease forwards;
}
`;

fs.writeFileSync('/var/www/html/mobile-responsive.css', cssContent + additionalMobileCSS);
console.log('Updated mobile-responsive.css');