const fs = require('fs');
let html = fs.readFileSync('/var/www/html/index.html', 'utf8');

// 1. Fix viewport - allow scaling for accessibility
html = html.replace(
  'maximum-scale=1.0, user-scalable=no',
  'viewport-fit=cover'
);

// 2. Fix broken mobile-fix.js script tag
html = html.replace(
  '</body>\n    <script src="mobile-fix.js"></script>',
  '<script src="mobile-fix.js"></script>\n</body>'
);

// 3. Add mobile detection meta and iOS support
const mobileMetas = `
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#0a0a0f">
    <meta name="mobile-web-app-capable" content="yes">`;
html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">' + mobileMetas);

// 4. Add preconnect for CDN to speed up mobile
html = html.replace('<head>', `<head>
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>`);

// 5. Add inline mobile init to body
const mobileInit = `
<script>
// Immediate mobile detection
(function(){
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth < 768);
    if(isMobile) {
        document.documentElement.classList.add('mobile');
        document.documentElement.classList.add('touch-device');
        document.cookie = 'device=mobile;path=/;max-age=86400';
    } else {
        document.cookie = 'device=desktop;path=/;max-age=86400';
    }
})();
</script>`;
html = html.replace('<body>', '<body>' + mobileInit);

fs.writeFileSync('/var/www/html/index.html', html);
console.log('Mobile HTML fixed');