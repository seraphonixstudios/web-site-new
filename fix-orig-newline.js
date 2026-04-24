const fs = require('fs');
let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

// Fix the original newline at line 65
s = s.replace(/\+ '\n';/g, "+ '\\n';");
fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Fixed');