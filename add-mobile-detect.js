const fs = require('fs');
const content = fs.readFileSync('/var/www/html/index.html', 'utf8');

// Check if mobile detection script already exists
if (content.includes('mobile-detect')) {
    console.log('Mobile detection already exists');
    process.exit(0);
}

// Add mobile detection and lightweight fallback
const mobileScript = `
// Mobile Detection & Lightweight Fallback
(function() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    if (isMobile) {
        console.log('Mobile device detected - enabling lightweight mode');
        
        // Override Three.js to use simpler rendering or skip it
        const originalThree = window.THREE;
        if (originalThree) {
            window.THREE = {
                ...originalThree,
                Scene: function() { return { add: function(){}, background: null, fog: null }; },
                PerspectiveCamera: function() { return {}; },
                WebGLRenderer: function() { return { setSize: function(){}, setPixelRatio: function(){} }; },
                Color: function() { return {}; },
                FogExp2: function() { return {}; },
                BufferGeometry: function() { return { setAttribute: function(){} }; },
                BufferAttribute: function() {},
                Float32Array: Float32Array,
                PointsMaterial: function() { return {}; },
                Points: function() { return {}; },
                IcosahedronGeometry: function() { return {}; },
                WireframeGeometry: function() { return {}; },
                LineBasicMaterial: function() { return {}; },
                LineSegments: function() { return {}; },
                MeshBasicMaterial: function() { return {}; },
                Mesh: function() { return {}; },
                CylinderGeometry: function() { return {}; },
                SphereGeometry: function() { return {}; },
                Group: function() { return { add: function(){}, rotation: { x: 0, y: 0 }, userData: {} }; },
                Vector2: function() { return {}; },
                Raycaster: function() { return { setFromCamera: function(){}, intersectObjects: function(){ return []; } }; },
                MeshStandardMaterial: function() { return {}; },
                MeshPhongMaterial: function() { return {}; },
                AmbientLight: function() { return {}; },
                PointLight: function() { return {}; },
                DirectionalLight: function() { return {}; },
                Color: originalThree.Color
            };
        }
        
        // Add mobile CSS overrides
        const style = document.createElement('style');
        style.textContent = \`
            @media (max-width: 768px) {
                #loading-screen {
                    opacity: 0.95 !important;
                }
                #sphere-canvas {
                    opacity: 0.3 !important;
                }
                .content-window {
                    width: 95vw !important;
                    left: 2.5vw !important;
                    top: 10vh !important;
                    max-height: 80vh !important;
                }
                .hud-overlay {
                    display: none !important;
                }
                #gesture-hints {
                    display: block !important;
                    bottom: 5px !important;
                }
                .node-label {
                    font-size: 0.65rem !important;
                    padding: 4px 8px !important;
                }
            }
        \`;
        document.head.appendChild(style);
    }
})();
`;

// Insert before the main script
const insertPoint = content.indexOf('<script src="auth-bridge.js">');
if (insertPoint > 0) {
    const newContent = content.slice(0, insertPoint) + '<script>' + mobileScript + '</script>\n    ' + content.slice(insertPoint);
    fs.writeFileSync('/var/www/html/index.html', newContent);
    console.log('Mobile detection added');
} else {
    console.log('Could not find insertion point');
}