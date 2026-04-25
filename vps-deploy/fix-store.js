const fs = require('fs');
let s = fs.readFileSync('/var/www/html/store_html/store.html', 'utf8');
s = s.replace(/<script src=" checkout-fix.js><\/script>/g, '<script src="checkout-fix.js"></script>');
fs.writeFileSync('/var/www/html/store_html/store.html', s);
console.log('Fixed script tags');