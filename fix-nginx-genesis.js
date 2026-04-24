const fs = require('fs');
let config = fs.readFileSync('/etc/nginx/sites-available/verilysovereign.org', 'utf8');

// Add location for genesis.html
if (!config.includes('location /genesis-page')) {
    config = config.replace(
        'location /genesis {',
        `location /genesis-page {
        alias /var/www/html/genesis.html;
        try_files $uri =404;
    }

    location /genesis {`
    );
    
    fs.writeFileSync('/etc/nginx/sites-available/verilysovereign.org', config);
    console.log('Added genesis-page location');
}