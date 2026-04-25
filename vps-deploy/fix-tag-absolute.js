const fs = require('fs');
let s = fs.readFileSync('/var/www/html/index.html', 'utf8');
s = s.replace('</body>\\n    <script src="mobile-fix.js"></script>', '<script src="mobile-fix.js"></script>\n</body>');
s = s.replace('</body>\n    <script src="mobile-fix.js"></script>', '<script src="mobile-fix.js"></script>\n</body>');
fs.writeFileSync('/var/www/html/index.html', s);
console.log('Fixed script tag');
// Verify
const after = fs.readFileSync('/var/www/html/index.html', 'utf8');
const matches = after.match(/mobile-fix.js/g);
console.log('Occurrences:', matches ? matches.length : 0);