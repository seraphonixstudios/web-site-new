const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Modify handleNodeClick to open Genesis and Store in new tab
const oldOpen = `this.openWindow(nodeId);`;
const newOpen = `// Open Genesis and Store in new tab
            if (nodeId === 'genesis') {
                window.open('/genesis-page', '_blank');
            } else if (nodeId === 'store') {
                window.open('/store_html/store.html', '_blank');
            } else {
                this.openWindow(nodeId);
            }`;

content = content.replace(oldOpen, newOpen);

// Also update quick links in index.html to open the main genersis/store in new tab when clicked from the sphere
fs.writeFileSync('/var/www/html/script.js', content);
console.log('Updated to open Genesis/Store in new tab');