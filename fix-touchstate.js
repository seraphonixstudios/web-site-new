const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Find and fix the broken section
const brokenSection = `// Touch events for mobile support
        this.touchState = {
        
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
        
            isTouching: false,`;

const goodSection = `// Touch events for mobile support
        this.touchState = {
            isTouching: false,`;

content = content.replace(brokenSection, goodSection);

fs.writeFileSync('/var/www/html/script.js', content);
console.log('Fixed touchState syntax');

// Verify the fix
const newContent = fs.readFileSync('/var/www/html/script.js', 'utf8');
const testContent = newContent.substring(0, 5000);
try {
    // Just check if it looks right now
    if (newContent.includes('isTouching: false,') && newContent.includes('MOBILE_OPTIMIZATION')) {
        console.log('Still has MOBILE_OPTIMIZATION - need to remove it');
    }
} catch(e) {
    console.log('Error:', e.message);
}

console.log('Done');