const fs = require('fs');
let s = fs.readFileSync('/var/www/ai-image-generator/server.js', 'utf8');
s = s.replace(
  "console.log(`Providers: ${getAvailableProviders().join(', ')}`);",
  "log('INFO', 'SERVER', 'Providers initialized', {providers: getAvailableProviders().join(', ')});"
);
fs.writeFileSync('/var/www/ai-image-generator/server.js', s);
console.log('Done');