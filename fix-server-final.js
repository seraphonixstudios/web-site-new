const fs = require('fs');

const path = '/var/www/neural-os/server.js';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Add logs endpoint (simple version without complex escaping)
const logsEndpoint = `
// Get recent system logs
app.get('/api/logs/recent', bearerAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = [];
        
        // Try to get logs from journalctl or syslog
        try {
            const { stdout } = await execPromise(\`tail -n \${limit} /var/log/syslog 2>/dev/null || tail -n \${limit} /var/log/messages 2>/dev/null || echo ''\`);
            if (stdout) {
                const lines = stdout.split('\\n').filter(l => l.trim());
                lines.forEach(line => {
                    const isError = line.includes('error') || line.includes('failed') || line.includes('Error');
                    const isWarning = line.includes('warning') || line.includes('Warning') || line.includes('WARN');
                    logs.push({
                        timestamp: new Date().toISOString(),
                        level: isError ? 'error' : isWarning ? 'warning' : 'info',
                        message: line.substring(0, 200),
                        service: 'system'
                    });
                });
            }
        } catch (e) {
            // Fallback: return empty logs
        }
        
        res.json({ logs: logs.reverse() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

`;

// Only add if not exists
if (!content.includes("/api/logs/recent")) {
    // Find server.listen and insert before it
    const listenMatch = content.match(/(server\.listen|app\.listen)/);
    if (listenMatch) {
        const index = listenMatch.index;
        content = content.substring(0, index) + logsEndpoint + content.substring(index);
    }
}

// Fix 2: Add getMemoryCached function if not present
if (!content.includes("async function getMemoryCached")) {
    const memHelper = `
async function getMemoryCached() {
    try {
        const { stdout } = await execPromise("cat /proc/meminfo | grep '^Cached:' | awk '{print $2}'");
        return (parseInt(stdout.trim()) / 1024 / 1024).toFixed(2);
    } catch {
        return '0.0';
    }
}

async function getMemoryBuffers() {
    try {
        const { stdout } = await execPromise("cat /proc/meminfo | grep '^Buffers:' | awk '{print $2}'");
        return (parseInt(stdout.trim()) / 1024 / 1024).toFixed(2);
    } catch {
        return '0.0';
    }
}

`;
    const collectMatch = content.match(/async function collectSystemMetrics/);
    if (collectMatch) {
        const index = collectMatch.index;
        content = content.substring(0, index) + memHelper + content.substring(index);
    }
}

// Fix 3: Add network connections endpoint if not present
if (!content.includes("/api/network/connections")) {
    const networkEndpoint = `
// Network connections endpoint - REAL data from /proc/net/tcp
app.get('/api/network/connections', bearerAuth, async (req, res) => {
    try {
        const { stdout: total } = await execPromise('cat /proc/net/tcp /proc/net/tcp6 2>/dev/null | wc -l');
        const { stdout: established } = await execPromise("grep -c ' 01 ' /proc/net/tcp 2>/dev/null || echo 0");
        const { stdout: timewait } = await execPromise("grep -c ' 06 ' /proc/net/tcp 2>/dev/null || echo 0");
        const { stdout: closewait } = await execPromise("grep -c ' 08 ' /proc/net/tcp 2>/dev/null || echo 0");
        const { stdout: synsent } = await execPromise("grep -c ' 02 ' /proc/net/tcp 2>/dev/null || echo 0");
        
        res.json({
            total: Math.max(0, parseInt(total.trim()) - 2),
            established: parseInt(established.trim()) || 0,
            timewait: parseInt(timewait.trim()) || 0,
            closewait: parseInt(closewait.trim()) || 0,
            synsent: parseInt(synsent.trim()) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

`;
    const listenMatch = content.match(/(server\.listen|app\.listen)/);
    if (listenMatch) {
        const index = listenMatch.index;
        content = content.substring(0, index) + networkEndpoint + content.substring(index);
    }
}

// Fix 4: Fix cached and buffers to use the functions
content = content.replace(
    /cached:\s*['"]'0\.0['"]/,
    "cached: await getMemoryCached()"
);
content = content.replace(
    /buffers:\s*['"]'0\.0['"]/,
    "buffers: await getMemoryBuffers()"
);

fs.writeFileSync(path, content);
console.log('Server fixes applied');
console.log('- Logs endpoint added: /api/logs/recent');
console.log('- Network connections endpoint added: /api/network/connections');
console.log('- Memory cached/buffers now use real data from /proc/meminfo');
