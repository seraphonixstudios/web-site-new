#!/bin/bash
sed -i "s/cached: '0.0'/cached: await getMemoryCached()/g" /var/www/neural-os/server.js
sed -i "s/buffers: '0.0'/buffers: await getMemoryBuffers()/g" /var/www/neural-os/server.js
pm2 restart neural-os
echo 'Fixed cached/buffers function calls'
