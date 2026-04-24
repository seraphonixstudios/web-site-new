// Security Operations Center Functions

async function loadSecurityOverview() {
    try {
        const response = await fetch('/api/security/overview', {
            headers: { 'Authorization': 'Bearer seraphadmin' }
        });
        if (response.ok) {
            const data = await response.json();
            updateSecurityUI(data);
        }
    } catch (e) {
        console.error('Failed to load security overview:', e);
    }
}

function updateSecurityUI(data) {
    const statusEl = document.getElementById('securityStatus');
    if (statusEl) {
        statusEl.textContent = data.status ? data.status.toUpperCase() : 'UNKNOWN';
        statusEl.style.color = data.status === 'secure' ? '#00ff41' : data.status === 'critical' ? '#ff0040' : '#ff6600';
    }
    
    const fwEl = document.getElementById('fwStatus');
    if (fwEl) {
        fwEl.textContent = data.firewall ? data.firewall.status.toUpperCase() : 'UNKNOWN';
        fwEl.style.color = data.firewall && data.firewall.active ? '#00ff41' : '#ff0040';
    }
    
    const bannedEl = document.getElementById('bannedCount');
    if (bannedEl) bannedEl.textContent = data.intrusionDetection ? data.intrusionDetection.bannedIPs : 0;
    
    const failedEl = document.getElementById('failedLogins');
    if (failedEl) failedEl.textContent = data.authentication ? data.authentication.failedLogins : 0;
    
    const threatsEl = document.getElementById('activeThreats');
    if (threatsEl) threatsEl.textContent = data.threats ? data.threats.suspiciousProcesses : 0;
}

async function loadSecurityEvents(filter = 'all') {
    try {
        const response = await fetch('/api/security/events?limit=100', {
            headers: { 'Authorization': 'Bearer seraphadmin' }
        });
        if (response.ok) {
            const data = await response.json();
            renderSecurityEvents(data.events, filter);
        }
    } catch (e) {
        console.error('Failed to load security events:', e);
    }
}

function renderSecurityEvents(events, filter) {
    const container = document.getElementById('securityLog');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!events || events.length === 0) {
        container.innerHTML = '<div style="color: #8899a6; text-align: center; padding: 20px;">No security events found</div>';
        return;
    }
    
    const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);
    
    filtered.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.style.cssText = 'display: grid; grid-template-columns: 100px 100px 1fr 100px; gap: 10px; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center;';
        
        const typeColor = event.type === 'auth_failure' ? '#ff0040' : event.type === 'firewall_block' ? '#ff6600' : '#00ff41';
        
        eventEl.innerHTML = `
            <span style="color: #8899a6; font-size: 0.8rem;">${new Date(event.timestamp).toLocaleTimeString()}</span>
            <span style="background: ${typeColor}20; color: ${typeColor}; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; text-align: center;">${event.type.replace('_', ' ')}</span>
            <span style="color: #e0e0e0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${event.message}</span>
            <span style="color: #00f3ff; font-family: monospace; cursor: pointer;" onclick="document.getElementById('blockIPInput').value='${event.ip}'">${event.ip || '-'}</span>
        `;
        container.appendChild(eventEl);
    });
}

function filterSecurityEvents(filter) {
    document.querySelectorAll('#securityLog').forEach(el => el.innerHTML = '<div style="color: #8899a6; text-align: center; padding: 20px;">Loading...</div>');
    loadSecurityEvents(filter);
}

async function loadTopAttackers() {
    try {
        const response = await fetch('/api/security/top-attackers', {
            headers: { 'Authorization': 'Bearer seraphadmin' }
        });
        if (response.ok) {
            const data = await response.json();
            renderAttackers(data.attackers);
        }
    } catch (e) {
        console.error('Failed to load attackers:', e);
    }
}

function renderAttackers(attackers) {
    const container = document.getElementById('attackersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!attackers || attackers.length === 0) {
        container.innerHTML = '<div style="color: #8899a6; text-align: center; padding: 20px;">No attackers detected</div>';
        return;
    }
    
    attackers.forEach(attacker => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);';
        item.innerHTML = `
            <span style="color: #ff0040; font-family: monospace;">${attacker.ip}</span>
            <span style="background: rgba(255,0,64,0.2); color: #ff0040; padding: 2px 10px; border-radius: 12px; font-size: 0.85rem;">${attacker.attempts} attempts</span>
            <button onclick="document.getElementById('blockIPInput').value='${attacker.ip}'; blockIP();" style="background: transparent; border: 1px solid #ff0040; color: #ff0040; padding: 4px 10px; cursor: pointer; font-size: 0.75rem;">BLOCK</button>
        `;
        container.appendChild(item);
    });
}

async function loadBannedIPs() {
    try {
        const response = await fetch('/api/security/banned', {
            headers: { 'Authorization': 'Bearer seraphadmin' }
        });
        if (response.ok) {
            const data = await response.json();
            renderBannedIPs(data.banned);
        }
    } catch (e) {
        console.error('Failed to load banned IPs:', e);
    }
}

function renderBannedIPs(banned) {
    const tbody = document.getElementById('bannedIPsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!banned || banned.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #8899a6;">No banned IPs</td></tr>';
        return;
    }
    
    banned.forEach(ip => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 10px; color: #ff0040; font-family: monospace;">${ip.ip}</td>
            <td style="padding: 10px; color: #8899a6;">${new Date(ip.bannedAt).toLocaleString()}</td>
            <td style="padding: 10px;"><button onclick="unblockIP('${ip.ip}')" style="background: rgba(0,243,255,0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 5px 15px; cursor: pointer;">UNBLOCK</button></td>
        `;
        tbody.appendChild(row);
    });
}

async function blockIP(ip) {
    if (!ip) {
        const input = document.getElementById('blockIPInput');
        ip = input ? input.value : null;
    }
    
    if (!ip) {
        addLog('No IP address provided', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/security/block-ip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer seraphadmin'
            },
            body: JSON.stringify({ ip: ip })
        });
        
        const data = await response.json();
        if (response.ok) {
            addLog(`IP ${ip} has been blocked`, 'info');
            loadBannedIPs();
            loadSecurityOverview();
            document.getElementById('blockIPInput').value = '';
        } else {
            addLog(`Failed to block IP: ${data.error}`, 'error');
        }
    } catch (e) {
        addLog('Error blocking IP', 'error');
    }
}

async function unblockIP(ip) {
    try {
        const response = await fetch('/api/security/unblock-ip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer seraphadmin'
            },
            body: JSON.stringify({ ip: ip })
        });
        
        const data = await response.json();
        if (response.ok) {
            addLog(`IP ${ip} has been unblocked`, 'info');
            loadBannedIPs();
            loadSecurityOverview();
        } else {
            addLog(`Failed to unblock IP: ${data.error}`, 'error');
        }
    } catch (e) {
        addLog('Error unblocking IP', 'error');
    }
}

async function restartService(service) {
    try {
        const response = await fetch('/api/security/restart-service', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer seraphadmin'
            },
            body: JSON.stringify({ service: service })
        });
        
        const data = await response.json();
        if (response.ok) {
            addLog(`Service ${service} restarted successfully`, 'info');
        } else {
            addLog(`Failed to restart ${service}: ${data.error}`, 'error');
        }
    } catch (e) {
        addLog('Error restarting service', 'error');
    }
}

// Initialize security data when security tab is active
function initSecurity() {
    loadSecurityOverview();
    loadSecurityEvents();
    loadTopAttackers();
    loadBannedIPs();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        const secTab = document.getElementById('securityTab');
        if (secTab && secTab.classList.contains('active')) {
            loadSecurityOverview();
            loadSecurityEvents();
        }
    }, 30000);
}
