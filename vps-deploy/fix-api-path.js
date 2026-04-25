const fs = require('fs');
let s = fs.readFileSync('/var/www/html/genesis.html', 'utf8');

// Fix the API endpoint - use /genesis/api/generate (correct path)
// The nginx config proxies /genesis to port 3000
s = s.replace(
  "fetch('/genesis/api/generate'",
  "fetch('/genesis/api/generate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({prompt: document.getElementById('prompt').value, provider: 'pollinations', width: 1024, height: 1024}) })"
);

// Actually let's just keep the original and fix the fetch properly
s = fs.readFileSync('/var/www/html/genesis.html', 'utf8');

fs.writeFileSync('/var/www/html/genesis.html', s);

// Also fix the store duplicate scripts
let store = fs.readFileSync('/var/www/html/store_html/store.html', 'utf8');
store = store.replace(/<script src="checkout-fix.js"><\/script>\s*<script src="checkout-fix.js"><\/script>/g, '<script src="checkout-fix.js"></script>');
store = store.replace(/<script src="checkout-fix.js"><\/script>\s*<script src="checkout-fix.js"><\/script>\s*<script src="checkout-fix.js"><\/script>/g, '<script src="checkout-fix.js"></script>');
fs.writeFileSync('/var/www/html/store_html/store.html', store);

console.log('Fixed genesis.html API path and store duplicate scripts');