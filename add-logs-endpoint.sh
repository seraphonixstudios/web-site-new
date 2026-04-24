#!/bin/bash
# Add logs endpoint to server.js

cd /var/www/neural-os || exit 1

python3 << 'PYEOF'
import re

with open('server.js', 'r') as f:
    content = f.read()

# Add logs endpoint if not present
logs_endpoint = '''
// Get recent system logs
app.get('/api/logs/recent', bearerAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const { stdout } = await execPromise(`journalctl -n ${limit} --no-pager -o json 2>/dev/null || cat /var/log/syslog | tail -${limit} || echo '[]'`);
        
        const logs = [];
        if (stdout && stdout.trim()) {
            const lines = stdout.trim().split('\\n');
            lines.forEach((line, idx) => {
                try {
                    const entry = JSON.parse(line);
                    logs.push({
                        timestamp: entry.__REALTIME_TIMESTAMP ? new Date(parseInt(entry.__REALTIME_TIMESTAMP) / 1000).toISOString() : new Date().toISOString(),
                        level: entry.PRIORITY <= 3 ? 'error' : entry.PRIORITY <= 5 ? 'warning' : 'info',
                        message: entry.MESSAGE || entry.message || line,
                        service: entry.SYSLOG_IDENTIFIER || 'system'
                    });
                } catch {
                    // Fallback for non-JSON lines
                    logs.push({
                        timestamp: new Date().toISOString(),
                        level: line.includes('error') ? 'error' : line.includes('warning') ? 'warning' : 'info',
                        message: line.substring(0, 200),
                        service: 'system'
                    });
                }
            });
        }
        
        // Reverse to show newest first
        res.json({ logs: logs.reverse() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

'''

# Only add if not already present
if '/api/logs/recent' not in content:
    # Find a good place - before server.listen
    content = re.sub(
        r'(server\.listen\(PORT|app\.listen\(PORT)',
        logs_endpoint + r'\1',
        content
    )
    print('Logs endpoint added')
else:
    print('Logs endpoint already exists')

with open('server.js', 'w') as f:
    f.write(content)

print('Server.js updated')
PYEOF

pm2 restart neural-os

echo 'Logs endpoint added and Neural OS restarted'
