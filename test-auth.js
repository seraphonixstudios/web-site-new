const http = require('http');
const data = JSON.stringify({password:'seraphadmin'});
const req = http.request({
    hostname:'localhost',
    port:3077,
    path:'/api/auth/admin',
    method:'POST',
    headers:{
        'Content-Type':'application/json',
        'Content-Length':data.length
    }
}, res => {
    let body='';
    res.on('data', d => body+=d);
    res.on('end', () => console.log(body));
});
req.write(data);
req.end();
