const fs = require('fs');
let content = fs.readFileSync('/var/www/html/index.html', 'utf8');
content = content.replace('src="genesis.html"', 'src="genesis-page"');
fs.writeFileSync('/var/www/html/index.html', content);
console.log('Updated iframe src');