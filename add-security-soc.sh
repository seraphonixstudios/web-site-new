#!/bin/bash
# Add Security Operations Center to Neural OS

cd /var/www/neural-os || exit 1

# Backup
cp server.js server.js.pre-security

# Add security endpoints
python3 << 'PYEOF'
import re

with open('server.js', 'r') as f:
    content = f.read()

# Security endpoints to add
security_endpoints = '''
// ============================================
// SECURITY OPERATIONS CENTER
// ============================================

// Get security overview with real metrics
app.get('/api/security/overview', bearerAuth, async (req, res) => {
    try {
        // Get fail2ban stats
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
        } catch (e) {
            // fail2ban not installed or no data
        }
        
        // Get UFW status
        let ufwStatus = 'inactive';
        let ufwRules = 0;
        try {
            const { stdout: ufwOut } = await execPromise('ufw status numbered 2>/dev/null || echo "inactive"');
            ufwStatus = ufwOut.includes('Status: active') ? 'active' : 'inactive';
            ufwRules = ufwOut.split('\\n').filter(line => line.includes('ALLOW') || line.includes('DENY')).length;
        } catch (e) {}
        
        // Check for recent auth failures from syslog
        let authFailures = 0;
        try {
            const { stdout: authLog } = await execPromise("grep -c 'authentication failure' /var/log/auth.log 2>/dev/null || grep -c 'Failed password' /var/log/auth.log 2>/dev/null || echo '0'");
            authFailures = parseInt(authLog.trim()) || 0;
        } catch (e) {}
        
        // Get active SSH connections
        let activeSSH = 0;
        try {
            const { stdout: sshOut } = await execPromise('who | wc -l');
            activeSSH = parseInt(sshOut.trim()) || 0;
        } catch (e) {}
        
        // Check if any suspicious processes running
        let suspiciousProcs = [];
        try {
            const { stdout: psOut } = await execPromise("ps aux | grep -E 'nc|netcat|nmap|masscan|hydra|john|hashcat' | grep -v grep || true");
            if (psOut.trim()) {
                suspiciousProcs = psOut.trim().split('\\n').map(line => line.split(/\\s+/)[10]).filter(Boolean);
            }
        } catch (e) {}
        
        res.json({
            status: ufwStatus === 'active' && bannedIPs < 10 ? 'secure' : bannedIPs > 50 ? 'critical' : 'warning',
            firewall: {
                status: ufwStatus,
                rules: ufwRules,
                active: ufwStatus === 'active'
            },
            intrusionDetection: {
                bannedIPs: bannedIPs,
                failedAttempts: failedAttempts,
                activeSSH: activeSSH
            },
            authentication: {
                failedLogins: authFailures,
                last24Hours: await getAuthFailures24h()
            },
            threats: {
                suspiciousProcesses: suspiciousProcs.length,
                processList: suspiciousProcs.slice(0, 5)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get auth failures in last 24h
async function getAuthFailures24h() {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        
        const { stdout } = await execPromise(`grep '${dateStr}' /var/log/auth.log 2>/dev/null | grep -c 'Failed' || echo '0'`);
        return parseInt(stdout.trim()) || 0;
    } catch {
        return 0;
    }
}

// Get recent security events
app.get('/api/security/events', bearerAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const events = [];
        
        // Parse auth.log for security events
        try {
            const { stdout: authLog } = await execPromise(`tail -n ${limit} /var/log/auth.log 2>/dev/null || echo ''`);
            const lines = authLog.split('\\n').filter(l => l.includes('Failed') || l.includes('Accepted') || l.includes('Invalid'));
            
            lines.forEach(line => {
                if (line.includes('Failed password')) {
                    const match = line.match(/Failed password for (invalid user )?(\\S+) from ([\\d\.]+)/);
                    if (match) {
                        events.push({
                            timestamp: new Date().toISOString(),
                            type: 'auth_failure',
                            severity: 'warning',
                            user: match[2],
                            ip: match[3],
                            message: `Failed login attempt for ${match[2]}`,
                            source: 'sshd'
                        });
                    }
                } else if (line.includes('Accepted')) {
                    const match = line.match(/Accepted.*for (\\S+) from ([\\d\.]+)/);
                    if (match) {
                        events.push({
                            timestamp: new Date().toISOString(),
                            type: 'auth_success',
                            severity: 'info',
                            user: match[1],
                            ip: match[2],
                            message: `Successful login for ${match[1]}`,
                            source: 'sshd'
                        });
                    }
                }
            });
        } catch (e) {}
        
        // Get UFW blocks
        try {
            const { stdout: ufwLog } = await execPromise(`grep 'UFW BLOCK' /var/log/syslog 2>/dev/null | tail -n 50 || echo ''`);
            const lines = ufwLog.split('\\n').filter(Boolean);
            lines.forEach(line => {
                const ipMatch = line.match(/SRC=([\\d\.]+)/);
                if (ipMatch) {
                    events.push({
                        timestamp: new Date().toISOString(),
                        type: 'firewall_block',
                        severity: 'info',
                        ip: ipMatch[1],
                        message: `UFW blocked connection from ${ipMatch[1]}`,
                        source: 'ufw'
                    });
                }
            });
        } catch (e) {}
        
        // Sort by timestamp desc
        events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json({ events: events.slice(0, limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get banned IPs from fail2ban
app.get('/api/security/banned', bearerAuth, async (req, res) => {
    try {
        const banned = [];
        
        try {
            const { stdout } = await execPromise('fail2ban-client status sshd 2>/dev/null | grep "Banned IP list" || echo ""');
            const match = stdout.match(/Banned IP list:\\s*(.+)/);
            if (match && match[1]) {
                const ips = match[1].split(',').map(ip => ip.trim()).filter(Boolean);
                for (const ip of ips.slice(0, 50)) {
                    banned.push({
                        ip: ip,
                        bannedAt: new Date().toISOString(),
                        jail: 'sshd',
                        reason: 'Multiple failed login attempts'
                    });
                }
            }
        } catch (e) {}
        
        res.json({ banned: banned });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// COUNTERMEASURES

// Block an IP address
app.post('/api/security/block-ip', bearerAuth, async (req, res) => {
    const { ip } = req.body;
    if (!ip || !ip.match(/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/)) {
        return res.status(400).json({ error: 'Valid IP address required' });
    }
    
    try {
        // Add to UFW
        await execPromise(`ufw deny from ${ip} comment 'Neural-OS Security Block'`);
        
        // Also add to fail2ban if available
        try {
            await execPromise(`fail2ban-client set sshd banip ${ip}`);
        } catch (e) {}
        
        // Log the action
        console.log(`[SECURITY] IP ${ip} blocked by admin`);
        
        res.json({ success: true, message: `IP ${ip} has been blocked`, ip: ip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unblock an IP address
app.post('/api/security/unblock-ip', bearerAuth, async (req, res) => {
    const { ip } = req.body;
    if (!ip) {
        return res.status(400).json({ error: 'IP address required' });
    }
    
    try {
        // Remove from UFW
        await execPromise(`ufw delete deny from ${ip}`);
        
        // Remove from fail2ban
        try {
            await execPromise(`fail2ban-client set sshd unbanip ${ip}`);
        } catch (e) {}
        
        console.log(`[SECURITY] IP ${ip} unblocked by admin`);
        
        res.json({ success: true, message: `IP ${ip} has been unblocked`, ip: ip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Restart a service (countermeasure)
app.post('/api/security/restart-service', bearerAuth, async (req, res) => {
    const { service } = req.body;
    if (!service) {
        return res.status(400).json({ error: 'Service name required' });
    }
    
    // Whitelist allowed services for security
    const allowedServices = ['nginx', 'sshd', 'docker', 'neural-os', 'fail2ban', 'ufw'];
    if (!allowedServices.includes(service)) {
        return res.status(403).json({ error: 'Service not in whitelist' });
    }
    
    try {
        await execPromise(`systemctl restart ${service}`);
        console.log(`[SECURITY] Service ${service} restarted by admin`);
        res.json({ success: true, message: `Service ${service} restarted` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top attacking IPs
app.get('/api/security/top-attackers', bearerAuth, async (req, res) => {
    try {
        const attackers = [];
        
        // Parse auth.log for top failed IPs
        try {
            const { stdout } = await execPromise("grep 'Failed password' /var/log/auth.log 2>/dev/null | awk '{print $11}' | sort | uniq -c | sort -rn | head -10 || echo ''");
            const lines = stdout.trim().split('\\n').filter(Boolean);
            lines.forEach(line => {
                const match = line.trim().match(/^\\s*(\\d+)\\s+([\\d\.]+)/);
                if (match) {
                    attackers.push({
                        ip: match[2],
                        attempts: parseInt(match[1]),
                        lastSeen: new Date().toISOString()
                    });
                }
            });
        } catch (e) {}
        
        res.json({ attackers: attackers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

'''

# Find a good place to insert - before server.listen
if '/api/security/overview' not in content:
    content = re.sub(
        r'(server\.listen\(PORT|app\.listen\(PORT)',
        security_endpoints + r'\1',
        content
    )
    print('Security Operations Center endpoints added')

with open('server.js', 'w') as f:
    f.write(content)

print('Server updated with full security monitoring')
print('- /api/security/overview - Real-time security metrics')
print('- /api/security/events - Security event log')
print('- /api/security/banned - Banned IP list')
print('- /api/security/top-attackers - Top attacking IPs')
print('- POST /api/security/block-ip - Block IP countermeasure')
print('- POST /api/security/unblock-ip - Unblock IP countermeasure')
print('- POST /api/security/restart-service - Service restart')
PYEOF

pm2 restart neural-os

echo 'Security Operations Center is now active'
