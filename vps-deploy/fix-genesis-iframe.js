const fs = require('fs');
let s = fs.readFileSync('/var/www/html/index.html', 'utf8');

// Fix the broken Genesis iframe to point to working page
s = s.replace(
  'src="AI%20Image%20Generator/client/dist/index.html"',
  'src="/genesis-page"'
);

fs.writeFileSync('/var/www/html/index.html', s);
console.log('Fixed Genesis iframe');