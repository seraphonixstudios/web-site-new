// Add Genesis log routes to Neural-OS properly
const fs = require('fs');
let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

const logRoutes = `
// Genesis logs API - reads Genesis server logs
app.get('/api/logs/genesis', (req, res) => {
    const logFile = '/var/www/ai-image-generator/logs/genesis.log';
    const f = require('fs');
    try {
        if (f.existsSync(logFile)) {
            const content = f.readFileSync(logFile, 'utf8');
            const logs = content.trim().split('\\n').slice(-50).map(l => {
                try { return JSON.parse(l); } catch { return { raw: l }; }
            }).reverse();
            res.json({ success: true, logs });
        } else {
            res.json({ success: false, error: 'No logs yet' });
        }
    } catch (e) { res.json({ success: false, error: e.message }); }
});

// System logs API - reads all system logs
app.get('/api/logs/system', (req, res) => {
    const files = ['/var/www/ai-image-generator/logs/genesis.log', '/var/log/nginx/access.log', '/var/log/nginx/error.log'];
    const f = require('fs');
    const results = [];
    for (const file of files) {
        try {
            if (f.existsSync(file)) {
                const lines = f.readFileSync(file, 'utf8').trim().split('\\n').slice(-15);
                results.push({ file: file, lines: lines.reverse() });
            }
        } catch (e) { results.push({ file: file, error: e.message }); }
    }
    res.json({ success: true, logs: results });
});
`;

// Insert before ERROR HANDLING
s = s.replace(
  '// ============================================\n// ERROR HANDLING',
  logRoutes + '\n// ============================================\n// ERROR HANDLING'
);

fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Added log routes');