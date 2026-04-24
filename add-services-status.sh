#!/bin/bash
# Fix remaining API endpoint issues

cd /var/www/neural-os || exit 1

# Add /api/services/status endpoint that the dashboard expects
python3 << 'PYEOF'
import re

with open('server.js', 'r') as f:
    content = f.read()

# Add services/status endpoint after /api/services
services_status_endpoint = '''
// Get services with detailed status (for dashboard compatibility)
app.get('/api/services/status', bearerAuth, async (req, res) => {
    try {
        const services = [
            { name: 'nginx', icon: '🌐' },
            { name: 'ai-image-generator', icon: '🎨' },
            { name: 'neural-os', icon: '🧠' },
            { name: 'sshd', icon: '🔐' },
            { name: 'docker', icon: '🐳' }
        ];
        
        const results = [];
        for (const svc of services) {
            try {
                const { stdout } = await execPromise(`systemctl is-active ${svc.name} 2>/dev/null || echo 'inactive'`);
                const status = stdout.trim() === 'active' ? 'online' : 'offline';
                results.push({
                    name: svc.name,
                    icon: svc.icon,
                    status: status,
                    description: svc.name === 'nginx' ? 'Web Server' : 
                                svc.name === 'sshd' ? 'SSH Daemon' :
                                svc.name === 'docker' ? 'Container Runtime' :
                                svc.name === 'ai-image-generator' ? 'AI Image Generator' :
                                svc.name === 'neural-os' ? 'Neural OS Dashboard' : 'System Service'
                });
            } catch {
                results.push({ ...svc, status: 'unknown', description: 'Service status unknown' });
            }
        }
        
        res.json({ services: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

'''

# Check if endpoint exists
if '/api/services/status' not in content:
    # Insert after /api/services endpoint
    content = re.sub(
        r"(app\.get\('/api/services', bearerAuth, async \(req, res\) => \{)",
        services_status_endpoint + r"\1",
        content
    )
    print('Added /api/services/status endpoint')

with open('server.js', 'w') as f:
    f.write(content)
PYEOF

pm2 restart neural-os

echo 'Services status endpoint added'
