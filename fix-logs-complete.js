// Replace lines from GENESIS LOGS to end with clean code
const fs = require('fs');
let lines = fs.readFileSync('/opt/neural-os/server.js', 'utf8').split('\n');

// Find where GENESIS LOGS starts
const startLine = lines.findIndex(l => l.includes('// ===== GENESIS LOGS ====='));

// Keep everything up to but not including line with GENESIS LOGS
const prefix = lines.slice(0, startLine);

const newCode = `
// ===== LOGS API =====
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

app.get('/api/logs/system', requireAuth, (req, res) => {
    const files = [
        '/var/www/ai-image-generator/logs/genesis.log',
        '/var/log/nginx/access.log',
        '/var/log/nginx/error.log'
    ];
    const results = [];
    for (const f of files) {
        try {
            if (fs.existsSync(f)) {
                const fileLines = fs.readFileSync(f, 'utf8').trim().split('\\n').slice(-15);
                results.push({ file: f, lines: fileLines.reverse() });
            }
        } catch (e) { results.push({ file: f, error: e.message }); }
    }
    res.json({ success: true, logs: results });
});

module.exports = app;`;

const final = prefix.concat(newCode.split('\n'));
fs.writeFileSync('/opt/neural-os/server.js', final.join('\n'));
console.log('Replaced from line', startLine);