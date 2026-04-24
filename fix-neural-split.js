const fs = require('fs');
let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

// Fix all the broken newlines
s = s.replace(/split\('
'\)/g, "split('\\n')");
fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Fixed');