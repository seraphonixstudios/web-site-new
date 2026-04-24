const fs = require('fs');
let s = fs.readFileSync('/var/www/html/script.js', 'utf8');
s = s.replace(/neuralFrame\.src = '\/neural-os\/';/g, "window.open('/neural-os/', '_blank');");
fs.writeFileSync('/var/www/html/script.js', s);
console.log('done');