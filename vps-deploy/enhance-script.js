// Enhanced error handling and diagnostics for main site
const fs = require('fs');
let s = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Add diagnostic logging to track issues
const diagnosticCode = `
// ===== DIAGNOSTIC LOGGING =====
window.SERAPHONIX_DEBUG = {
    log: function(type, msg, data) {
        console.log('[SERAPHONIX ' + type + ']', msg, data || '');
        // Store in sessionStorage for debugging
        const logs = JSON.parse(sessionStorage.getItem('seraphonix_logs') || '[]');
        logs.push({ time: new Date().toISOString(), type, msg, data });
        if (logs.length > 50) logs.shift();
        sessionStorage.setItem('seraphonix_logs', JSON.stringify(logs));
    },
    getLogs: function() {
        return JSON.parse(sessionStorage.getItem('seraphonix_logs') || '[]');
    }
};

// Wrap key functions with diagnostics
const originalInit = this.init.bind(this);
this.init = function() {
    window.SERAPHONIX_DEBUG.log('INFO', 'Initializing sphere...');
    try {
        originalInit();
        window.SERAPHONIX_DEBUG.log('INFO', 'Sphere initialized successfully');
    } catch (e) {
        window.SERAPHONIX_DEBUG.log('ERROR', 'Init failed: ' + e.message, e.stack);
        throw e;
    }
};

const originalOpenWindow = this.openWindow.bind(this);
this.openWindow = function(nodeId) {
    window.SERAPHONIX_DEBUG.log('INFO', 'Opening window: ' + nodeId);
    try {
        originalOpenWindow(nodeId);
    } catch (e) {
        window.SERAPHONIX_DEBUG.log('ERROR', 'Open window failed: ' + e.message);
    }
};
`;

// Add after class constructor
s = s.replace(
  '// Cart for store\n        this.cart = [];',
  '// Cart for store\n        this.cart = [];\n' + diagnosticCode
);

fs.writeFileSync('/var/www/html/script.js', s);
console.log('Added diagnostic logging');