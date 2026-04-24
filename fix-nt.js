const fs = require('fs');
let content = fs.readFileSync('/var/www/html/index.html', 'utf8');

// Fix the quick links to open Genesis and Store in new tab
content = content.replace(
    '<button class="quick-link" data-target="genesis">',
    '<button class="quick-link" data-target="genesis" onclick="window.open(\'/genesis-page\', \'_blank\')">'
);

content = content.replace(
    '<button class="quick-link" data-target="store">',
    '<button class="quick-link" data-target="store" onclick="window.open(\'/store_html/store.html\', \'_blank\')">'
);

// Update iframe click to also open in new tab
content = content.replace(
    'src="genesis-page"',
    'src="genesis-page" onclick="window.open(\'/genesis-page\', \'_blank\')"'
);

// Remove the onclick we added earlier (clean up)
content = content.replace(
    /onclick="window\.open\('\/genesis-page', '_blank'\)" onclick="window\.open\('/genesis-page', '_blank'\)"/g,
    'onclick="window.open(\'/genesis-page\', \'_blank\')"'
);

fs.writeFileSync('/var/www/html/index.html', content);
console.log('Fixed quick links to open in new tab');