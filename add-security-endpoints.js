const fs = require('fs');
const path = '/var/www/neural-os/server.js';
let content = fs.readFileSync(path, 'utf8');

// Check if security endpoints already exist
if (content.includes('/api/security/overview')) {
    console.log('Security endpoints already exist');
    process.exit(0);
}

// Find server.listen and insert before it
const securityCode = `
// ============================================
// SECURITY OPERATIONS CENTER
// ============================================

// Get security overview with real metrics
app.get('/api/security/overview', bearerAuth, async (req, res) => {
    try {
        let bannedIPs = 0;
        let failedAttempts = 0;
        try {
            const { stdout: fail2banStatus } = await execPromise('fail2ban-client status sshd 2>/dev/null || echo "0"');
            const bannedMatch = fail2banStatus.match(/Banned IP list:\\s*([\\d\\.]+(?:,\\s*[\\d\\.]+)*)/);
            if (bannedMatch) {
                bannedIPs = bannedMatch[1].split(',').filter(ip => ip.trim()).length;
            }
            const { stdout: fail2banLog } = await execPromise('grep -c "Fail2ban" /var/log/fail2ban.log 2>/dev/null || echo "0"');
            failedAttempts = parseInt(fail2banLog.trim()) || 0;
        } catch (e) {}
        
        let ufwStatus = 'inactive';
        let ufwRules = 0;
        try {
            const { stdout: ufwOut } = await execPromise('ufw status numbered 2>/dev/null || echo "inactive"');
            ufwStatus = ufwOut.includes('Status: active') ? 'active' : 'inactive';
            ufwRules = ufwOut.split('\\n').filter(line => line.includes('ALLOW') || line.includes('DENY')).length;
        } catch (e) {}
        
        let authFailures = 0;
        try {
            const { stdout: authLog } = await execPromise("grep -c 'Failed password' /var/log/auth.log 2>/dev/null || echo '0'");
            authFailures = parseInt(authLog.trim()) || 0;
        } catch (e) {}
        
        let activeSSH = 0;
        try {
            const { stdout: sshOut } = await execPromise('who | wc -l');
            activeSSH = parseInt(sshOut.trim()) || 0;
        } catch (e) {}
        
        let suspiciousProcs = [];
        try {
            const { stdout: psOut } = await execPromise("ps aux | grep -E 'nc|netcat|nmap|masscan' | grep -v grep || true");
            if (psOut.trim()) {
                suspiciousProcs = psOut.trim().split('\\n').filter(Boolean);
            }
        } catch (e) {}
        
        res.json({
            status: ufwStatus === 'active' && bannedIPs < 10 ? 'secure' : bannedIPs > 50 ? 'critical' : 'warning',
            firewall: { status: ufwStatus, rules: ufwRules, active: ufwStatus === 'active' },
            intrusionDetection: { bannedIPs: bannedIPs, failedAttempts: failedAttempts, activeSSH: activeSSH },
            authentication: { failedLogins: authFailures },
            threats: { suspiciousProcesses: suspiciousProcs.length },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent security events
app.get('/api/security/events', bearerAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const events = [];
        
        try {
            const { stdout: authLog } = await execPromise('tail -n 200 /var/log/auth.log 2>/dev/null || echo ""');
            const lines = authLog.split('\\n').filter(l => l.includes('Failed') || l.includes('Accepted'));
            
            lines.forEach(line => {
                if (line.includes('Failed password')) {
                    const match = line.match(/Failed password for (invalid user )?(\\S+) from ([\\d\\.]+)/);
                    if (match) {
                        events.push({
                            timestamp: new Date().toISOString(),
                            type: 'auth_failure',
                            severity: 'warning',
                            user: match[2],
                            ip: match[3],
                            message: 'Failed login attempt',
                            source: 'sshd'
                        });
                    }
                } else if (line.includes('Accepted')) {
                    const match = line.match(/Accepted.*for (\\S+) from ([\\d\\.]+)/);
                    if (match) {
                        events.push({
                            timestamp: new Date().toISOString(),
                            type: 'auth_success',
                            severity: 'info',
                            user: match[1],
                            ip: match[2],
                            message: 'Successful login',
                            source: 'sshd'
                        });
                    }
                }
            });
        } catch (e) {}
        
        events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json({ events: events.slice(0, limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get banned IPs
app.get('/api/security/banned', bearerAuth, async (req, res) => {
    try {
        const banned = [];
        try {
            const { stdout } = await execPromise('fail2ban-client status sshd 2>/dev/null | grep "Banned IP list" || echo ""');
            const match = stdout.match(/Banned IP list:\\s*(.+)/);
            if (match && match[1]) {
                const ips = match[1].split(',').map(ip => ip.trim()).filter(Boolean);
                ips.forEach(ip => {
                    banned.push({ ip: ip, bannedAt: new Date().toISOString(), jail: 'sshd', reason: 'Multiple failed login attempts' });
                });
            }
        } catch (e) {}
        res.json({ banned: banned });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top attackers
app.get('/api/security/top-attackers', bearerAuth, async (req, res) => {
    try {
        const attackers = [];
        try {
            const { stdout } = await execPromise("grep 'Failed password' /var/log/auth.log 2>/dev/null | awk '{print $11}' | sort | uniq -c | sort -rn | head -10 || echo ''");
            const lines = stdout.trim().split('\\n').filter(Boolean);
            lines.forEach(line => {
                const parts = line.trim().split(/\\s+/);
                if (parts.length >= 2) {
                    attackers.push({ ip: parts[1], attempts: parseInt(parts[0]) || 0 });
                }
            });
        } catch (e) {}
        res.json({ attackers: attackers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Block IP
app.post('/api/security/block-ip', bearerAuth, async (req, res) => {
    const { ip } = req.body;
    if (!ip || !ip.match(/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/)) {
        return res.status(400).json({ error: 'Valid IP address required' });
    }
    try {
        await execPromise('ufw deny from ' + ip + ' comment "Neural-OS Security Block"');
        try { await execPromise('fail2ban-client set sshd banip ' + ip); } catch (e) {}
        console.log('[SECURITY] IP ' + ip + ' blocked by admin');
        res.json({ success: true, message: 'IP ' + ip + ' has been blocked', ip: ip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unblock IP
app.post('/api/security/unblock-ip', bearerAuth, async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP address required' });
    try {
        await execPromise('ufw delete deny from ' + ip);
        try { await execPromise('fail2ban-client set sshd unbanip ' + ip); } catch (e) {}
        console.log('[SECURITY] IP ' + ip + ' unblocked by admin');
        res.json({ success: true, message: 'IP ' + ip + ' has been unblocked', ip: ip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Restart service
app.post('/api/security/restart-service', bearerAuth, async (req, res) => {
    const { service } = req.body;
    if (!service) return res.status(400).json({ error: 'Service name required' });
    const allowed = ['nginx', 'sshd', 'docker', 'fail2ban', 'ufw'];
    if (!allowed.includes(service)) return res.status(403).json({ error: 'Service not allowed' });
    try {
        await execPromise('systemctl restart ' + service);
        console.log('[SECURITY] Service ' + service + ' restarted by admin');
        res.json({ success: true, message: 'Service ' + service + ' restarted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

`;

// Insert before server.listen
content = content.replace(
    'server.listen(PORT',
    securityCode + 'server.listen(PORT'
);

fs.writeFileSync(path, content);
console.log('Security Operations Center endpoints added successfully');
console.log('- GET /api/security/overview');
console.log('- GET /api/security/events');
console.log('- GET /api/security/banned');
console.log('- GET /api/security/top-attackers');
console.log('- POST /api/security/block-ip');
console.log('- POST /api/security/unblock-ip');
console.log('- POST /api/security/restart-service');
