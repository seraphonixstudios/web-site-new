// Replace lines 1610-1650 with working log endpoints
const fs = require('fs');
let lines = fs.readFileSync('/opt/neural-os/server.js', 'utf8').split('\n');

// Find the broken section (around line 1610)
const startLine = lines.findIndex((l, i) => l.includes('// ===== GENESIS LOGS =====') && i > 1600);
const endLine = lines.findIndex((l, i) => l.includes('// HEALTH CHECK') && i > startLine);

if (startLine >= 0 && endLine >= 0) {
    const newCode = `
// ===== LOGS API =====
app.get('/api/logs/genesis', (req, res) => {
    const logFile = '/var/www/ai-image-generator/logs/genesis.log';
    try {
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf8');
            const logs = content.trim().split('\n').slice(-50).map(l => {
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
                const lines = fs.readFileSync(f, 'utf8').trim().split('\n').slice(-15);
                results.push({ file: f, lines: lines.reverse() });
            }
        } catch (e) { results.push({ file: f, error: e.message }); }
    }
    res.json({ success: true, logs: results });
});

// HEALTH CHECK`;

    lines.splice(startLine, endLine - startLine, newCode.split('\n'));
    fs.writeFileSync('/opt/neural-os/server.js', lines.join('\n'));
    console.log('Fixed lines', startLine, 'to', endLine);
} else {
    console.log('Could not find broken section');
}