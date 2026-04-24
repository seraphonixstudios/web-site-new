const fs = require('fs');
let content = fs.readFileSync('/var/www/html/index.html', 'utf8');

// Add onclick to open in new tab for quick-links
content = content.replace(
    /<button class="quick-link" data-target="genesis">/g,
    '<button class="quick-link" data-target="genesis" onclick="window.open(\'/genesis-page\', \'_blank\')">'
);

content = content.replace(
    /<button class="quick-link" data-target="store">/g,
    '<button class="quick-link" data-target="store" onclick="window.open(\'/store_html/store.html\', \'_blank\')">'
);

// Also update Genesis window in content windows to open in new tab
content = content.replace(
    'src="genesis-page"',
    'onclick="window.open(\'/genesis-page\', \'_blank\')" style="cursor:pointer"'
);

fs.writeFileSync('/var/www/html/index.html', content);
console.log('Updated to open in new tab');