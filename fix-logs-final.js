// Replace broken log endpoints with clean versions
const fs = require('fs');
let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

// Find and remove the broken log endpoints
const brokenStart = "// ===== GENESIS LOGS =====";
const brokenEnd = "// HEALTH CHECK";

const brokenSection = s.indexOf(brokenStart);
const healthSection = s.indexOf(brokenEnd);

if (brokenSection > 0 && healthSection > brokenSection) {
    // Remove the broken section
    s = s.substring(0, brokenSection) + s.substring(healthSection);
}

const cleanLogEndpoints = `
// ===== SYSTEM LOGS API =====
// Genesis logs - publicly accessible (no auth needed for now)
app.get('/api/logs/genesis', (req, res) => {
    const logFile = '/var/www/ai-image-generator/logs/genesis.log';
    try {
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf8');
            const lines = content.trim().split(/\\n/).slice(-50);
            const logs = lines.map(l => {
                try { return JSON.parse(l); } catch { return { raw: l }; }
            }).reverse();
            res.json({ success: true, logs });
        } else {
            res.json({ success: false, error: 'Log file not found' });
        }
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// System logs - requires auth
app.get('/api/logs/system', requireAuth, (req, res) => {
    const logFiles = [
        '/var/www/ai-image-generator/logs/genesis.log',
        '/var/log/nginx/access.log',
        '/var/log/nginx/error.log'
    ];
    const results = [];
    for (const f of logFiles) {
        try {
            if (fs.existsSync(f)) {
                const lines = fs.readFileSync(f, 'utf8').trim().split(/\\n/).slice(-20);
                results.push({ file: f, lines: lines.reverse() });
            }
        } catch (e) {
            results.push({ file: f, error: e.message });
        }
    }
    res.json({ success: true, logs: results });
});

// HEALTH CHECK
`;

s = s.replace("// HEALTH CHECK", cleanLogEndpoints);
fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Log endpoints fixed');