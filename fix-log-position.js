// Fix: add log endpoints before 404 handler
const fs = require('fs');
let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

const logEndpoint = `
// ===== GENESIS LOGS =====
app.get('/api/logs/genesis', (req, res) => {
    const logFile = '/var/www/ai-image-generator/logs/genesis.log';
    try {
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf8');
            const logs = content.trim().split('\\n').slice(-50).map(l => {
                try { return JSON.parse(l); } catch { return { raw: l }; }
            }).reverse();
            res.json({ success: true, logs });
        } else {
            res.json({ success: false, error: 'No logs yet' });
        }
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.get('/api/logs/system', (req, res) => {
    const files = [
        '/var/www/ai-image-generator/logs/genesis.log',
        '/var/log/nginx/access.log',
        '/var/log/nginx/error.log'
    ];
    const results = [];
    for (const f of files) {
        try {
            if (fs.existsSync(f)) {
                const lines = fs.readFileSync(f, 'utf8').trim().split('\\n').slice(-15);
                results.push({ file: f, lines: lines.reverse() });
            }
        } catch (e) { results.push({ file: f, error: e.message }); }
    }
    res.json({ success: true, logs: results });
});
`;

// Add before the error handler at line 626
s = s.replace(
  '// ===== ERROR HANDLER =====',
  logEndpoint + '\n// ===== ERROR HANDLER ====='
);

// Also remove any duplicate at end
s = s.replace(logEndpoint + '\nmodule.exports = app;', 'module.exports = app;');

fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Fixed');