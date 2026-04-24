const http = require('http');

console.log('=== TESTING GENESIS API ===');
const postData = JSON.stringify({ prompt: 'blue bird' });
const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
}, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Genesis API:', data.substring(0, 200));
    });
});
req.on('error', e => console.error('Error:', e.message));
req.write(postData);
req.end();

setTimeout(() => {
    console.log('\n=== ALL TESTS COMPLETE ===');
}, 1000);