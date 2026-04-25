const fs = require('fs');
let s = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Add mobile detection at start of constructor
const mobileInit = `
        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth < 768);
        this.starCount = this.isMobile ? 100 : 800;
        this.pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);`;

s = s.replace(
    'this.cart = [];',
    'this.cart = [];' + mobileInit
);

// Mobile optimize WebGL renderer
s = s.replace(
    "this.renderer = new THREE.WebGLRenderer({",
    "this.renderer = new THREE.WebGLRenderer({ powerPreference: this.isMobile ? 'low-power' : 'high-performance',"
);

// Mobile optimize antialias
s = s.replace(
    'antialias: true',
    'antialias: !this.isMobile'
);

// Mobile optimize pixel ratio
s = s.replace(
    'this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));',
    'this.renderer.setPixelRatio(this.pixelRatio);'
);

// Register renderer globally for mobile-fix
s = s.replace(
    'this.renderer = new THREE.WebGLRenderer',
    'this.renderer = window.__sphereRenderer = new THREE.WebGLRenderer'
);

// Reduce star count for mobile
s = s.replace(
    'for (let i = 0; i < 2000; i++)',
    'for (let i = 0; i < this.starCount; i++)'
);
s = s.replace(
    'for (let i = 0; i < 1000; i++)',
    'for (let i = 0; i < (this.isMobile ? 100 : 1000); i++)'
);
s = s.replace(
    'for (let i = 0; i < 500; i++)',
    'for (let i = 0; i < (this.isMobile ? 80 : 500); i++)'
);

// Mobile-friendly node sizes
s = s.replace(
    'size: 1.2,',
    'size: this.isMobile ? 1.5 : 1.2,'
);
s = s.replace(
    'size: 0.7,',
    'size: this.isMobile ? 0.9 : 0.7,'
);
s = s.replace(
    'size: 0.5,',
    'size: this.isMobile ? 0.7 : 0.5,'
);

// Mobile-friendly zoom
s = s.replace(
    'this.zoom = 12;',
    'this.zoom = this.isMobile ? 16 : 12;'
);
s = s.replace(
    'this.targetZoom = 12;',
    'this.targetZoom = this.isMobile ? 16 : 12;'
);

fs.writeFileSync('/var/www/html/script.js', s);
console.log('Mobile optimizations baked into script.js');