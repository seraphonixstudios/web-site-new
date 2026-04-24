const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Add mobile detection at the beginning of init() function
const mobileDetection = `    init() {
        // MOBILE DETECTION
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (this.isMobile) {
            this.zoom = 18;
            console.log('Seraphonix: Mobile mode enabled');
        }
        
        // Auto-hide loading screen after 5 seconds (mobile safety net)
        setTimeout(() => {
            const ls = document.getElementById('loading-screen');
            if (ls) {
                ls.classList.add('hidden');
                setTimeout(() => { if (ls.parentNode) ls.remove(); }, 600);
            }
        }, 5000);
        
`;

// Replace the init function start
content = content.replace('    init() {', mobileDetection);

// Verify the change
if (content.includes('MOBILE DETECTION') && content.includes('this.isMobile = /Android')) {
    fs.writeFileSync('/var/www/html/script.js', content);
    console.log('Added mobile detection to init()');
} else {
    console.log('Failed to add mobile detection');
    process.exit(1);
}