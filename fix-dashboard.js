const fs = require('fs');
const path = '/var/www/neural-os/public/dashboard.html';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Make mainLoop async and await data fetching
content = content.replace(
  /\/\/ Main Update Loop\s*\n\s*function mainLoop\(\) \{/,
  `// Main Update Loop - Fetches REAL data from VPS\n        async function mainLoop() {\n            await generateSystemData();\n            await fetchServiceStatus();`
);

// Fix 2: Replace random network stats with real data from systemState
content = content.replace(
  /\/\/ Update Network Stats\s*\n\s*function updateNetworkStats\(\) \{[\s\S]*?connSynSent.*?\}/,
  `// Update Network Stats - REAL data from /proc/net/tcp\n        async function updateNetworkStats() {\n            try {\n                const response = await fetch('/api/network/connections', {\n                    headers: { 'Authorization': 'Bearer seraphadmin' }\n                });\n                if (response.ok) {\n                    const data = await response.json();\n                    document.getElementById('connEstablished').textContent = data.established || 0;\n                    document.getElementById('connTimeWait').textContent = data.timewait || 0;\n                    document.getElementById('connCloseWait').textContent = data.closewait || 0;\n                    document.getElementById('connSynSent').textContent = data.synsent || 0;\n                }\n            } catch (e) {\n                // Fallback: read from systemState.network if available\n                document.getElementById('connEstablished').textContent = systemState.network.connections || 0;\n            }\n        }`
);

// Fix 3: Remove the random fluctuation of process data
content = content.replace(
  /\/\/ Randomly fluctuate process CPU\/Mem[\s\S]*?renderProcesses\(\);/,
  `// Process data is fetched from API - no randomization\n            // Real process data comes from /api/processes endpoint\n            // renderProcesses() is called after fetchProcesses() updates the data`
);

fs.writeFileSync(path, content);
console.log('Dashboard fixes applied - now using REAL data');
