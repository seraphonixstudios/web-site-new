const fs = require('fs');
let content = fs.readFileSync('/var/www/html/index.html', 'utf8');
content = content.replace(
    'src="AI%20Image_Generator/client/dist/index.html"',
    'src="genesis.html"'
);
fs.writeFileSync('/var/www/html/index.html', content);
console.log('Updated Genesis iframe');