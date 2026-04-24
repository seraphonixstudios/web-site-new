// ============================================
// TESTING FUNCTIONS
// ============================================
function logTest(msg, type = 'info') {
    const log = document.getElementById('testLog');
    const time = new Date().toLocaleTimeString();
    const cls = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
    log.innerHTML = `<div class="${cls}">[${time}] ${msg}</div>` + log.innerHTML;
}

function testGenesisHealth() {
    document.getElementById('genesisStatus').textContent = 'TESTING...';
    fetch('http://localhost:3000/api/health')
        .then(r => r.json())
        .then(d => {
            document.getElementById('genesisStatus').textContent = 'ONLINE';
            document.getElementById('genesisResult').innerHTML = `<div class="success">Status: ${d.status}<br>Version: ${d.version}</div>`;
            logTest(`Genesis Health: OK (${d.version})`, 'success');
        })
        .catch(e => {
            document.getElementById('genesisStatus').textContent = 'OFFLINE';
            document.getElementById('genesisResult').innerHTML = `<div class="error">Error: ${e.message}</div>`;
            logTest(`Genesis Health: FAILED - ${e.message}`, 'error');
        });
}

function testGenesisGenerate() {
    const prompt = document.getElementById('testPrompt').value || 'a beautiful sunset';
    document.getElementById('genesisStatus').textContent = 'GENERATING...';
    fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    })
        .then(r => r.json())
        .then(d => {
            document.getElementById('genesisStatus').textContent = 'READY';
            document.getElementById('genesisResult').innerHTML = `<div class="success">Generated: ${d.id}<br><a href="${d.url}" target="_blank">View Image</a></div>`;
            logTest(`Genesis Generate: SUCCESS - ${d.id}`, 'success');
        })
        .catch(e => {
            document.getElementById('genesisStatus').textContent = 'ERROR';
            document.getElementById('genesisResult').innerHTML = `<div class="error">${e.message}</div>`;
            logTest(`Genesis Generate: FAILED`, 'error');
        });
}

function testWebsite() {
    document.getElementById('websiteStatus').textContent = 'TESTING...';
    fetch('/')
        .then(r => { document.getElementById('websiteStatus').textContent = 'ONLINE'; return r.text(); })
        .then(d => {
            document.getElementById('websiteResult').innerHTML = `<div class="success">Main site loaded (${d.length} bytes)</div>`;
            logTest('Main Website: OK', 'success');
        })
        .catch(e => {
            document.getElementById('websiteStatus').textContent = 'OFFLINE';
            document.getElementById('websiteResult').innerHTML = `<div class="error">${e.message}</div>`;
            logTest(`Main Website: FAILED`, 'error');
        });
}

function testGenesisProxy() {
    document.getElementById('websiteStatus').textContent = 'TESTING /GENESIS...';
    fetch('/genesis/api/health')
        .then(r => r.json())
        .then(d => {
            document.getElementById('websiteStatus').textContent = 'ONLINE';
            document.getElementById('websiteResult').innerHTML += `<div class="success">/genesis proxy: OK</div>`;
            logTest('/genesis Proxy: OK', 'success');
        })
        .catch(e => {
            document.getElementById('websiteStatus').textContent = 'ERROR';
            document.getElementById('websiteResult').innerHTML += `<div class="error">/genesis: ${e.message}</div>`;
            logTest('/genesis Proxy: FAILED', 'error');
        });
}

function testStore() {
    document.getElementById('websiteStatus').textContent = 'TESTING STORE...';
    fetch('/store_html/store.html')
        .then(r => { document.getElementById('websiteStatus').textContent = 'READY'; return r.text(); })
        .then(d => {
            document.getElementById('websiteResult').innerHTML += `<div class="success">Store: OK</div>`;
            logTest('Store: OK', 'success');
        })
        .catch(e => {
            document.getElementById('websiteResult').innerHTML += `<div class="error">Store: ${e.message}</div>`;
            logTest(`Store: FAILED`, 'error');
        });
}

function testNeuralEndpoint() {
    const endpoint = document.getElementById('neuralEndpoint').value;
    document.getElementById('neuralTestStatus').textContent = 'TESTING...';
    fetch(endpoint)
        .then(r => r.json())
        .then(d => {
            document.getElementById('neuralTestStatus').textContent = 'OK';
            document.getElementById('neuralResult').innerHTML = `<div class="success">${endpoint}: OK</div>`;
            logTest(`Neural-OS ${endpoint}: OK`, 'success');
        })
        .catch(e => {
            document.getElementById('neuralTestStatus').textContent = 'ERROR';
            document.getElementById('neuralResult').innerHTML = `<div class="error">${e.message}</div>`;
            logTest(`Neural-OS ${endpoint}: FAILED`, 'error');
        });
}

function testNeuralFull() {
    logTest('Starting full diagnostic...', 'info');
    testNeuralEndpoint();
    testGenesisHealth();
    testWebsite();
    testGenesisProxy();
    logTest('Full diagnostic complete', 'success');
}

function clearTestLog() {
    document.getElementById('testLog').innerHTML = '<div style="color:var(--neon-cyan)">Log cleared</div>';
}

setTimeout(() => {
    if (document.getElementById('genesisStatus')) testGenesisHealth();
}, 2000);