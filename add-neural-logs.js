// Add Genesis log viewer to Neural-OS
const fs = require('fs');
const path = require('path');

let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

// Find where to add the log endpoint - after other api routes
const logEndpoint = `
// ===== GENESIS LOGS =====
app.get('/api/logs/genesis', requireAuth, (req, res) => {
    const logFile = '/var/www/ai-image-generator/logs/genesis.log';
    if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8').trim().split('\n').slice(-100).map(l => {
            try { return JSON.parse(l); } catch { return { raw: l }; }
        }).reverse();
        res.json({ success: true, logs });
    } else {
        res.json({ success: false, error: 'Log file not found' });
    }
});

// ===== ACCESS LOGS =====
app.get('/api/logs/access', requireAuth, (req, res) => {
    const logFile = '/var/www/ai-image-generator/logs/access.log';
    if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8').trim().split('\n').slice(-100).map(l => {
            try { return JSON.parse(l); } catch { return { raw: l }; }
        }).reverse();
        res.json({ success: true, logs });
    } else {
        res.json({ success: false, error: 'Log file not found' });
    }
});

// ===== SYSTEM LOGS =====
app.get('/api/logs/system', requireAuth, (req, res) => {
    const logs = [];
    const logFiles = [
        { path: '/var/www/ai-image-generator/logs/genesis.log', name: 'Genesis' },
        { path: '/opt/neural-os/logs/pm2.out-0.log', name: 'Neural-OS' },
        { path: '/var/log/nginx/access.log', name: 'Nginx Access' },
        { path: '/var/log/nginx/error.log', name: 'Nginx Error' }
    ];
    for (const f of logFiles) {
        if (fs.existsSync(f.path)) {
            const lines = fs.readFileSync(f.path, 'utf8').trim().split('\n').slice(-20);
            logs.push({ source: f.name, lines });
        }
    }
    res.json({ success: true, logs });
});
`;

s = s.replace(
  "app.get('/health', (req, res) => {",
  logEndpoint + "\napp.get('/health', (req, res) => {"
);

fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Log endpoints added to Neural-OS');