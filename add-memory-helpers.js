const fs = require('fs');
const path = '/var/www/neural-os/server.js';
let content = fs.readFileSync(path, 'utf8');

const helperFuncs = `
async function getMemoryCached() {
    try {
        const { stdout } = await execPromise("grep '^Cached:' /proc/meminfo | awk '{print $2}'");
        return (parseInt(stdout.trim()) / 1024 / 1024).toFixed(2);
    } catch {
        return '0.0';
    }
}

async function getMemoryBuffers() {
    try {
        const { stdout } = await execPromise("grep '^Buffers:' /proc/meminfo | awk '{print $2}'");
        return (parseInt(stdout.trim()) / 1024 / 1024).toFixed(2);
    } catch {
        return '0.0';
    }
}
`;

// Insert before collectSystemMetrics
content = content.replace(
  'async function collectSystemMetrics()',
  helperFuncs + '\nasync function collectSystemMetrics()'
);

fs.writeFileSync(path, content);
console.log('Helper functions added');
