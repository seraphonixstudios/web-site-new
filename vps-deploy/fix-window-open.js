const fs = require('fs');
let s = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Remove ALL existing Neural-OS iframe/window.open code first
s = s.replace(/\/\/ Load Neural-OS in iframe[\s\S]*?window\.open\('\/neural-os\/', '_blank'\);\s*}/g, '');

// Add ONE clean handler for VPS button in quick links
const vpsHandler = `
// VPS / Neural-OS button handler - open in new tab ONCE
document.querySelectorAll('.quick-link[data-target="vps"], .nav-link-node[data-target="vps"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open('/neural-os/', '_blank');
    });
});
`;

// Add after isAdmin setup
s = s.replace(
    'this.isAdmin = false;',
    'this.isAdmin = false;\n' + vpsHandler
);

// Clean up any remaining neural-frame references
s = s.replace(/const neuralFrame = document\.getElementById\('neural-os-frame'\);[\s\S]*?}/g, '');

fs.writeFileSync('/var/www/html/script.js', s);
console.log('Fixed Neural-OS - now opens only ONCE on click');