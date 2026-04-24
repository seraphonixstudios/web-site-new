// Fix 1: Add mobile detection at the start of init() method
// Find init() and add mobile detection right after 'this.nodes = [];'

// Before setup, add mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Reduce particles on mobile
if (isMobile) {
    this.particleCount = 100; // Reduced from 500
    this.maxNodes = 7;
    console.log('Seraphonix: Mobile mode activated - reduced rendering');
}

// Fix 2: Update viewport in index.html
// Change:
// <meta name="viewport" content="width=device-width, initial-scale=1.0">
// To:
// <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

// Fix 3: Add to mobile-responsive.css for faster loading
@media (max-width: 768px) {
    #sphere-canvas {
        opacity: 0.9;
    }
    .loader-sphere .ring {
        animation-duration: 2s;
    }
}