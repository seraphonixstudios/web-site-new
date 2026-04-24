#!/bin/bash
# Add Security tab to Neural OS dashboard

DASHBOARD="/var/www/neural-os/public/dashboard.html"

# Find the navigation tabs section and add Security tab
python3 << 'PYEOF'
import re

with open('$DASHBOARD', 'r') as f:
    content = f.read()

# Find the nav-tabs section and add Security tab
old_nav = '<button class="nav-tab" data-tab="terminal">Terminal</button>'
new_nav = '''<button class="nav-tab" data-tab="terminal">Terminal</button>
            <button class="nav-tab" data-tab="security">Security</button>'''

content = content.replace(old_nav, new_nav)

# Find the tab-content sections and add Security tab content before the closing div
security_tab = '''
        <!-- Security Tab -->
        <div class="tab-content" id="securityTab">
            <div class="dashboard-grid">
                <!-- Security Status Panel -->
                <div class="panel security-panel">
                    <div class="panel-header">
                        <div class="panel-title">🔒 SECURITY STATUS</div>
                        <div class="panel-status" id="securityStatus">SCANNING...</div>
                    </div>
                    <div class="panel-content">
                        <div class="security-overview">
                            <div class="security-metric" id="firewallStatus">
                                <span class="metric-icon">🛡️</span>
                                <div class="metric-info">
                                    <span class="metric-label">Firewall</span>
                                    <span class="metric-value" id="fwStatus">Checking...</span>
                                </div>
                            </div>
                            <div class="security-metric" id="intrusionStatus">
                                <span class="metric-icon">🚨</span>
                                <div class="metric-info">
                                    <span class="metric-label">Banned IPs</span>
                                    <span class="metric-value" id="bannedCount">0</span>
                                </div>
                            </div>
                            <div class="security-metric" id="authStatus">
                                <span class="metric-icon">🔐</span>
                                <div class="metric-info">
                                    <span class="metric-label">Failed Logins (24h)</span>
                                    <span class="metric-value" id="failedLogins">0</span>
                                </div>
                            </div>
                            <div class="security-metric" id="threatStatus">
                                <span class="metric-icon">⚠️</span>
                                <div class="metric-info">
                                    <span class="metric-label">Active Threats</span>
                                    <span class="metric-value" id="activeThreats">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Security Events Log -->
                <div class="panel" style="grid-column: span 2;">
                    <div class="panel-header">
                        <div class="panel-title">📋 SECURITY EVENTS</div>
                        <div class="security-filters">
                            <button class="log-filter active" data-filter="all">ALL</button>
                            <button class="log-filter" data-filter="auth_failure">FAILED</button>
                            <button class="log-filter" data-filter="firewall_block">BLOCKED</button>
                            <button class="log-filter" data-filter="auth_success">SUCCESS</button>
                        </div>
                    </div>
                    <div class="panel-content">
                        <div class="security-log-container" id="securityLog">
                            <div class="loading-text">Loading security events...</div>
                        </div>
                    </div>
                </div>

                <!-- Top Attackers -->
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">🎯 TOP ATTACKERS</div>
                    </div>
                    <div class="panel-content">
                        <div class="attackers-list" id="attackersList">
                            <div class="loading-text">Analyzing attack patterns...</div>
                        </div>
                    </div>
                </div>

                <!-- Countermeasures -->
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">⚡ COUNTERMEASURES</div>
                    </div>
                    <div class="panel-content">
                        <div class="countermeasures">
                            <div class="cm-section">
                                <h4>IP Blocking</h4>
                                <div class="cm-input-group">
                                    <input type="text" id="blockIPInput" placeholder="Enter IP to block...">
                                    <button class="cm-btn danger" onclick="blockIP()">BLOCK IP</button>
                                </div>
                            </div>
                            
                            <div class="cm-section">
                                <h4>Service Control</h4>
                                <div class="cm-buttons">
                                    <button class="cm-btn" onclick="restartService('nginx')">🌐 Restart Nginx</button>
                                    <button class="cm-btn" onclick="restartService('sshd')">🔐 Restart SSH</button>
                                    <button class="cm-btn" onclick="restartService('fail2ban')">🛡️ Restart Fail2ban</button>
                                    <button class="cm-btn" onclick="restartService('ufw')">🔥 Restart UFW</button>
                                </div>
                            </div>
                            
                            <div class="cm-section">
                                <h4>Quick Actions</h4>
                                <div class="cm-buttons">
                                    <button class="cm-btn warning" onclick="refreshSecurityData()">🔄 Refresh Data</button>
                                    <button class="cm-btn info" onclick="exportSecurityLog()">📥 Export Logs</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Banned IPs Management -->
                <div class="panel" style="grid-column: span 2;">
                    <div class="panel-header">
                        <div class="panel-title">🚫 BANNED IPs</div>
                    </div>
                    <div class="panel-content">
                        <div class="banned-ips-table" id="bannedIPsTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Banned At</th>
                                        <th>Jail</th>
                                        <th>Reason</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="bannedIPsBody">
                                    <tr><td colspan="5" class="loading-text">Loading banned IPs...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
'''

# Insert before the closing of the last tab-content (terminal tab)
content = content.replace(
    '<!-- Terminal Tab -->',
    security_tab + '\n        <!-- Terminal Tab -->'
)

# Add CSS styles for security panel
security_css = '''
        /* Security Panel Styles */
        .security-panel {
            border-color: var(--neon-red) !important;
        }
        
        .security-panel::before {
            background: linear-gradient(90deg, var(--neon-red), var(--neon-orange), var(--neon-red)) !important;
        }
        
        .security-overview {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .security-metric {
            background: rgba(255, 0, 64, 0.1);
            border: 1px solid rgba(255, 0, 64, 0.3);
            border-radius: 8px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .security-metric .metric-icon {
            font-size: 1.5rem;
        }
        
        .security-metric .metric-info {
            display: flex;
            flex-direction: column;
        }
        
        .security-metric .metric-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .security-metric .metric-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--neon-cyan);
        }
        
        .security-metric.status-secure {
            border-color: var(--neon-green);
            background: rgba(0, 255, 65, 0.1);
        }
        
        .security-metric.status-warning {
            border-color: var(--neon-orange);
            background: rgba(255, 102, 0, 0.1);
        }
        
        .security-metric.status-critical {
            border-color: var(--neon-red);
            background: rgba(255, 0, 64, 0.15);
            animation: pulse-red 2s infinite;
        }
        
        @keyframes pulse-red {
            0%, 100% { box-shadow: 0 0 5px rgba(255, 0, 64, 0.3); }
            50% { box-shadow: 0 0 20px rgba(255, 0, 64, 0.6); }
        }
        
        .security-log-container {
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Share Tech Mono', monospace;
            font-size: 0.85rem;
        }
        
        .security-event {
            display: grid;
            grid-template-columns: 140px 100px 1fr 80px;
            gap: 10px;
            padding: 8px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            align-items: center;
        }
        
        .security-event:hover {
            background: rgba(255, 255, 255, 0.03);
        }
        
        .security-event .event-time {
            color: var(--text-secondary);
            font-size: 0.8rem;
        }
        
        .security-event .event-type {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
            text-align: center;
        }
        
        .security-event .event-type.auth_failure {
            background: rgba(255, 0, 64, 0.2);
            color: var(--neon-red);
        }
        
        .security-event .event-type.firewall_block {
            background: rgba(255, 102, 0, 0.2);
            color: var(--neon-orange);
        }
        
        .security-event .event-type.auth_success {
            background: rgba(0, 255, 65, 0.2);
            color: var(--neon-green);
        }
        
        .security-event .event-message {
            color: var(--text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .security-event .event-ip {
            color: var(--neon-cyan);
            font-family: 'Share Tech Mono', monospace;
            cursor: pointer;
        }
        
        .security-event .event-ip:hover {
            text-decoration: underline;
        }
        
        .attackers-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .attacker-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .attacker-item:hover {
            background: rgba(255, 0, 64, 0.05);
        }
        
        .attacker-ip {
            color: var(--neon-red);
            font-family: 'Share Tech Mono', monospace;
        }
        
        .attacker-count {
            background: rgba(255, 0, 64, 0.2);
            color: var(--neon-red);
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 700;
        }
        
        .attacker-actions {
            display: flex;
            gap: 5px;
        }
        
        .attacker-btn {
            background: transparent;
            border: 1px solid var(--neon-red);
            color: var(--neon-red);
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.75rem;
            transition: all 0.3s;
        }
        
        .attacker-btn:hover {
            background: var(--neon-red);
            color: #000;
        }
        
        .countermeasures {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .cm-section h4 {
            color: var(--neon-cyan);
            font-size: 0.9rem;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .cm-input-group {
            display: flex;
            gap: 10px;
        }
        
        .cm-input-group input {
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            padding: 10px 15px;
            color: var(--neon-cyan);
            font-family: 'Share Tech Mono', monospace;
            border-radius: 4px;
        }
        
        .cm-input-group input:focus {
            outline: none;
            border-color: var(--neon-cyan);
            box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
        }
        
        .cm-btn {
            background: rgba(0, 243, 255, 0.1);
            border: 1px solid var(--neon-cyan);
            color: var(--neon-cyan);
            padding: 10px 20px;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.8rem;
            border-radius: 4px;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .cm-btn:hover {
            background: var(--neon-cyan);
            color: #000;
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
        }
        
        .cm-btn.danger {
            border-color: var(--neon-red);
            color: var(--neon-red);
            background: rgba(255, 0, 64, 0.1);
        }
        
        .cm-btn.danger:hover {
            background: var(--neon-red);
            color: #fff;
            box-shadow: 0 0 15px rgba(255, 0, 64, 0.5);
        }
        
        .cm-btn.warning {
            border-color: var(--neon-orange);
            color: var(--neon-orange);
            background: rgba(255, 102, 0, 0.1);
        }
        
        .cm-btn.warning:hover {
            background: var(--neon-orange);
            color: #000;
        }
        
        .cm-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .banned-ips-table {
            max-height: 250px;
            overflow-y: auto;
        }
        
        .banned-ips-table table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .banned-ips-table th {
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid var(--border-color);
            color: var(--neon-cyan);
            font-family: 'Orbitron', sans-serif;
            font-size: 0.8rem;
            text-transform: uppercase;
        }
        
        .banned-ips-table td {
            padding: 10px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 0.9rem;
        }
        
        .banned-ips-table tr:hover td {
            background: rgba(255, 0, 64, 0.05);
        }
        
        .security-filters {
            display: flex;
            gap: 10px;
        }
        
        .security-filters .log-filter {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            padding: 5px 12px;
            cursor: pointer;
            font-size: 0.75rem;
            border-radius: 4px;
            transition: all 0.3s;
        }
        
        .security-filters .log-filter:hover,
        .security-filters .log-filter.active {
            background: rgba(255, 0, 64, 0.2);
            border-color: var(--neon-red);
            color: var(--neon-red);
        }
'''

# Add CSS before </style>
content = content.replace('</style>', security_css + '\n</style>')

# Add JavaScript functions for security
security_js = '''
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
            // Update status
            const statusEl = document.getElementById('securityStatus');
            if (statusEl) {
                statusEl.textContent = data.status.toUpperCase();
                statusEl.className = 'panel-status status-' + data.status;
            }
            
            // Update firewall
            const fwEl = document.getElementById('fwStatus');
            if (fwEl) {
                fwEl.textContent = data.firewall.status.toUpperCase();
                fwEl.style.color = data.firewall.active ? 'var(--neon-green)' : 'var(--neon-red)';
            }
            
            // Update banned count
            const bannedEl = document.getElementById('bannedCount');
            if (bannedEl) {
                bannedEl.textContent = data.intrusionDetection.bannedIPs;
            }
            
            // Update failed logins
            const failedEl = document.getElementById('failedLogins');
            if (failedEl) {
                failedEl.textContent = data.authentication.failedLogins;
            }
            
            // Update active threats
            const threatsEl = document.getElementById('activeThreats');
            if (threatsEl) {
                threatsEl.textContent = data.threats.suspiciousProcesses;
            }
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
            
            const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);
            
            if (filtered.length === 0) {
                container.innerHTML = '<div class="loading-text">No security events found</div>';
                return;
            }
            
            filtered.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = 'security-event';
                eventEl.innerHTML = `
                    <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                    <span class="event-type ${event.type}">${event.type.replace('_', ' ')}</span>
                    <span class="event-message">${event.message}</span>
                    <span class="event-ip" onclick="blockIP('${event.ip}')">${event.ip || '-'}</span>
                `;
                container.appendChild(eventEl);
            });
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
            
            if (attackers.length === 0) {
                container.innerHTML = '<div class="loading-text">No attackers detected</div>';
                return;
            }
            
            attackers.forEach(attacker => {
                const item = document.createElement('div');
                item.className = 'attacker-item';
                item.innerHTML = `
                    <span class="attacker-ip">${attacker.ip}</span>
                    <span class="attacker-count">${attacker.attempts} attempts</span>
                    <div class="attacker-actions">
                        <button class="attacker-btn" onclick="blockIP('${attacker.ip}')">BLOCK</button>
                    </div>
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
            
            if (banned.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="loading-text">No banned IPs</td></tr>';
                return;
            }
            
            banned.forEach(ip => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="color: var(--neon-red); font-family: monospace;">${ip.ip}</td>
                    <td>${new Date(ip.bannedAt).toLocaleString()}</td>
                    <td>${ip.jail}</td>
                    <td>${ip.reason}</td>
                    <td><button class="cm-btn" onclick="unblockIP('${ip.ip}')">UNBLOCK</button></td>
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
        
        function refreshSecurityData() {
            loadSecurityOverview();
            loadSecurityEvents();
            loadTopAttackers();
            loadBannedIPs();
            addLog('Security data refreshed', 'info');
        }
        
        function exportSecurityLog() {
            const container = document.getElementById('securityLog');
            if (!container) return;
            
            const events = container.innerText;
            const blob = new Blob([events], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `security-log-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            addLog('Security log exported', 'info');
        }
        
        // Security filter buttons
        document.querySelectorAll('.security-filters .log-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.security-filters .log-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadSecurityEvents(btn.dataset.filter);
            });
        });
'''

# Add JS before initTabs function
content = content.replace(
    'function initTabs() {',
    security_js + '\nfunction initTabs() {'
)

# Add security tab init to DOMContentLoaded
old_init = 'initTabs();\n            initServices();\n            initProcesses();\n            initLogs();'
new_init = '''initTabs();
            initServices();
            initProcesses();
            initLogs();
            
            // Initialize Security Operations Center
            if (document.getElementById('securityTab')) {
                loadSecurityOverview();
                loadSecurityEvents();
                loadTopAttackers();
                loadBannedIPs();
                
                // Refresh security data every 30 seconds
                setInterval(() => {
                    if (document.getElementById('securityTab').classList.contains('active')) {
                        loadSecurityOverview();
                        loadSecurityEvents();
                    }
                }, 30000);
            }'''

content = content.replace(old_init, new_init)

with open('$DASHBOARD', 'w') as f:
    f.write(content)

print('Security Operations Center added to dashboard')
PYEOF

echo 'Security tab added successfully'
