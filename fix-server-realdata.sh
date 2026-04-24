#!/bin/bash
# Fix server.js to add real network connections endpoint and fix memory cached/buffers

cd /var/www/neural-os || exit 1

# Backup
cp server.js server.js.backup.dashboard-fix

# Add network connections endpoint and fix memory metrics
python3 << 'PYEOF'
import re

with open('server.js', 'r') as f:
    content = f.read()

# Fix 1: Add network connections endpoint before the last closing brace or exports
network_endpoint = '''
// Network connections endpoint - REAL data from /proc/net/tcp
app.get('/api/network/connections', bearerAuth, async (req, res) => {
    try {
        const { stdout } = await execPromise('cat /proc/net/tcp /proc/net/tcp6 2>/dev/null | wc -l');
        const totalLines = parseInt(stdout.trim()) || 0;
        
        const { stdout: established } = await execPromise("grep -c '01 ' /proc/net/tcp 2>/dev/null || echo 0");
        const { stdout: timewait } = await execPromise("grep -c '06 ' /proc/net/tcp 2>/dev/null || echo 0");
        const { stdout: closewait } = await execPromise("grep -c '08 ' /proc/net/tcp 2>/dev/null || echo 0");
        const { stdout: synsent } = await execPromise("grep -c '02 ' /proc/net/tcp 2>/dev/null || echo 0");
        
        res.json({
            total: Math.max(0, totalLines - 2),
            established: parseInt(established.trim()) || 0,
            timewait: parseInt(timewait.trim()) || 0,
            closewait: parseInt(closewait.trim()) || 0,
            synsent: parseInt(synsent.trim()) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

'''

# Find a good place to insert (before the last route or before app.listen)
if "// Start server" in content or "server.listen(PORT" in content:
    # Insert before server.listen
    content = re.sub(
        r'(server\.listen\(PORT|app\.listen\(PORT)',
        network_endpoint + r'\1',
        content
    )

# Fix 2: Update collectSystemMetrics to use real cached/buffers from /proc/meminfo
old_memory = """memory: {
            total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
            used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
            available: (freeMem / 1024 / 1024 / 1024).toFixed(2),
            cached: '0.0',
            buffers: '0.0'
        }"""

# Find and replace memory section
if 'cached: \'0.0\'' in content or 'cached:"0.0"' in content or "cached: '0.0'" in content:
    # Replace with dynamic reading from /proc/meminfo
    content = re.sub(
        r"cached:\s*['\"]0\.0['\"]",
        "cached: await getMemoryCached()",
        content
    )
    content = re.sub(
        r"buffers:\s*['\"]0\.0['\"]",
        "buffers: await getMemoryBuffers()",
        content
    )

# Add helper functions if not present
if 'getMemoryCached' not in content:
    helper_functions = '''
async function getMemoryCached() {
    try {
        const { stdout } = await execPromise("grep '^Cached:' /proc/meminfo | awk '{print $2}'");
        return (parseInt(stdout.trim()) / 1024 / 1024).toFixed(2); // Convert KB to GB
    } catch {
        return '0.0';
    }
}

async function getMemoryBuffers() {
    try {
        const { stdout } = await execPromise("grep '^Buffers:' /proc/meminfo | awk '{print $2}'");
        return (parseInt(stdout.trim()) / 1024 / 1024).toFixed(2); // Convert KB to GB
    } catch {
        return '0.0';
    }
}

'''
    # Insert before collectSystemMetrics
    content = re.sub(
        r'(async function collectSystemMetrics)',
        helper_functions + r'\1',
        content
    )

with open('server.js', 'w') as f:
    f.write(content)

print('Server.js updated with REAL network connections and memory cached/buffers')
PYEOF

# Restart Neural OS
pm2 restart neural-os

echo 'Fixes applied - Neural OS now shows REAL diagnostics'
