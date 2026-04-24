const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Remove the broken mobile optimization that broke the syntax
const brokenCode = `
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
}`;

content = content.replace(brokenCode, '');

// Also fix the broken touchState initialization - remove the extra content that was inserted
// Find and fix the touchState section
const badTouchState = `this.touchState = {
        
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

const goodTouchState = `this.touchState = {
            isTouching: false,`;

content = content.replace(badTouchState, goodTouchState);

// Verify it parses correctly
try {
    new Function(content);
    console.log('Script syntax is valid');
} catch (e) {
    console.log('Syntax error:', e.message);
    // Try to fix common issues
    content = content.replace(/\}\s*\{/g, '},\n{');
}

fs.writeFileSync('/var/www/html/script.js', content);
console.log('Fixed script.js');