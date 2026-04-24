const fs = require('fs');
let content = fs.readFileSync('/opt/neural-os/neural-os-dashboard.html', 'utf8');
content = content.replace(
    'data-tab="terminal">Terminal</button>',
    'data-tab="terminal">Terminal</button>\n        <button class="nav-tab" data-tab="testing">Testing</button>'
);
fs.writeFileSync('/opt/neural-os/neural-os-dashboard.html', content);
console.log('Added Testing tab button');