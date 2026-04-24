const http = require('http');
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': 17
    }
};
const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
});
req.on('error', console.error);
req.write('{"prompt":"bird"}');
req.end();