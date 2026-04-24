const fs = require('fs');
const config = `server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name verilysovereign.org www.verilysovereign.org;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /genesis-page {
        alias /var/www/html/genesis.html;
    }

    location /genesis {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /store_html {
        alias /var/www/html/store_html;
    }

    location /branding {
        alias /var/www/html/branding;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
`;

fs.writeFileSync('/etc/nginx/sites-available/verilysovereign.org', config);
console.log('Nginx config written');