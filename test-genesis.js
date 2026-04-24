const http = require('http');
const data = JSON.stringify({prompt: 'a beautiful sunset', provider: 'pollinations'});
const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/generate',
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'Content-Length': data.length}
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(body.substring(0, 500)));
});
req.write(data);
req.end();