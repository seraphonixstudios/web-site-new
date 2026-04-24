// Fix fs usage - use fsSync
const fs = require('fs');
let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

// Fix the fs.existsSync calls - they're using 'fs' but should use 'fsSync' or regular 'fs'
s = s.replace(/if \(fs\.existsSync/g, 'if (require("fs").existsSync(g');
s = s.replace(/fs\.readFileSync/g, 'require("fs").readFileSync');

fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Fixed fs references');