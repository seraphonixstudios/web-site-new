const fs = require('fs');
let s = fs.readFileSync('/var/www/ai-image-generator/server.js', 'utf8');
s = s.replace(
  "JSON.stringify(entry) + '\n'",
  "JSON.stringify(entry) + '\\n'"
);
fs.writeFileSync('/var/www/ai-image-generator/server.js', s);
console.log('Fixed');