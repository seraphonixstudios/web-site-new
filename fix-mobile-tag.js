const fs = require('fs');
const content = fs.readFileSync('/var/www/html/index.html', 'utf8');
const fixed = content.replace(' mobile-fix.js></script>', 'mobile-fix.js"></script>');
fs.writeFileSync('/var/www/html/index.html', fixed);
console.log('Fixed');