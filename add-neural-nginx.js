const fs = require('fs');
let config = fs.readFileSync('/etc/nginx/sites-available/verilysovereign.org', 'utf8');

// Add Neural-OS proxy
config = config.replace(
    'location /branding {',
    `location /neural-os {
        proxy_pass http://127.0.0.1:3077;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /branding {`
);

fs.writeFileSync('/etc/nginx/sites-available/verilysovereign.org', config);
console.log('Added Neural-OS proxy');