#!/bin/bash
# Mobile & iOS Optimization for Neural OS Dashboard

cd /var/www/neural-os/public || exit 1

# Backup
cp dashboard.html dashboard.html.pre-mobile

# Add mobile-responsive CSS and meta tags
python3 << 'PYEOF'
import re

with open('dashboard.html', 'r') as f:
    content = f.read()

# Add viewport meta tag if not present
if '<meta name="viewport"' not in content:
    content = content.replace(
        '<meta charset="UTF-8">',
        '<meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">\n    <meta name="apple-mobile-web-app-capable" content="yes">\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n    <meta name="mobile-web-app-capable" content="yes">'
    )

# Add mobile-responsive CSS before </style>
mobile_css = '''
        /* ===== MOBILE & TABLET RESPONSIVE DESIGN ===== */
        
        /* iOS Safe Areas */
        @supports (padding-top: env(safe-area-inset-top)) {
            .container {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
            }
        }
        
        /* Touch Device Optimizations */
        @media (hover: none) and (pointer: coarse) {
            /* Larger touch targets */
            .nav-tab {
                min-height: 44px;
                padding: 12px 20px;
            }
            
            .log-entry {
                min-height: 44px;
            }
            
            button, .cm-btn, .server-btn, .action-btn {
                min-height: 44px;
                min-width: 44px;
            }
            
            /* Remove hover effects on touch devices */
            .nav-tab:hover::before {
                display: none;
            }
            
            /* Add active states for touch */
            .nav-tab:active {
                background: rgba(0, 243, 255, 0.2);
            }
        }
        
        /* Tablet (768px - 1024px) */
        @media (max-width: 1024px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
                letter-spacing: 4px;
            }
            
            .dashboard-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .nav-tabs {
                gap: 5px;
            }
            
            .nav-tab {
                padding: 12px 16px;
                font-size: 0.75rem;
            }
        }
        
        /* Mobile Large (481px - 767px) */
        @media (max-width: 767px) {
            .container {
                padding: 8px;
            }
            
            .header {
                padding: 20px 0;
            }
            
            .header h1 {
                font-size: 1.5rem;
                letter-spacing: 2px;
            }
            
            .header .subtitle {
                font-size: 0.9rem;
                letter-spacing: 2px;
            }
            
            .nav-tabs {
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 20px;
            }
            
            .nav-tab {
                flex: 1 1 calc(33.333% - 8px);
                min-width: 100px;
                padding: 10px 8px;
                font-size: 0.7rem;
                letter-spacing: 1px;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .panel {
                margin-bottom: 0;
            }
            
            .panel-header {
                padding: 12px 15px;
            }
            
            .panel-title {
                font-size: 0.8rem;
            }
            
            .panel-content {
                padding: 15px;
            }
            
            .metric-row {
                flex-direction: column;
                gap: 5px;
            }
            
            .security-overview {
                grid-template-columns: 1fr;
            }
            
            .security-metric {
                padding: 12px;
            }
            
            .cm-buttons {
                grid-template-columns: 1fr;
            }
            
            .banned-ips-table {
                font-size: 0.8rem;
            }
            
            .banned-ips-table th,
            .banned-ips-table td {
                padding: 8px;
            }
            
            .process-controls {
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .process-controls input {
                flex: 1 1 100%;
            }
            
            .services-list {
                grid-template-columns: 1fr;
            }
            
            .log-entry {
                grid-template-columns: 1fr;
                gap: 5px;
            }
            
            .log-timestamp {
                font-size: 0.75rem;
            }
            
            .log-message {
                white-space: normal;
                word-break: break-word;
            }
        }
        
        /* Mobile Small (up to 480px) */
        @media (max-width: 480px) {
            .header h1 {
                font-size: 1.2rem;
                letter-spacing: 1px;
            }
            
            .header .system-time,
            .header .uptime-display {
                font-size: 0.7rem;
                position: relative;
                top: auto;
                right: auto;
                left: auto;
                text-align: center;
                margin: 5px 0;
            }
            
            .nav-tab {
                flex: 1 1 calc(50% - 8px);
                font-size: 0.65rem;
                padding: 10px 5px;
            }
            
            .security-event {
                grid-template-columns: 1fr;
                gap: 5px;
            }
            
            .attacker-item {
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .cm-input-group {
                flex-direction: column;
            }
            
            .terminal-input-wrapper {
                flex-wrap: wrap;
            }
            
            .terminal-input {
                flex: 1 1 100%;
                margin-bottom: 10px;
            }
        }
        
        /* iOS Specific Fixes */
        @supports (-webkit-touch-callout: none) {
            /* iOS only */
            body {
                -webkit-overflow-scrolling: touch;
            }
            
            .panel {
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
            
            /* Fix iOS button tap highlight */
            button, .nav-tab, .cm-btn {
                -webkit-tap-highlight-color: transparent;
            }
            
            /* Fix iOS input zoom */
            input, select, textarea {
                font-size: 16px; /* Prevents zoom on focus */
            }
        }
        
        /* Landscape orientation on mobile */
        @media (max-height: 500px) and (orientation: landscape) {
            .header {
                padding: 10px 0;
            }
            
            .header h1 {
                font-size: 1.3rem;
            }
            
            .nav-tabs {
                margin-bottom: 15px;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body {
                background: var(--bg-dark);
            }
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
'''

content = content.replace('</style>', mobile_css + '\n</style>')

# Add touch event handling for iOS
ios_js = '''
        // Mobile & iOS Touch Optimizations
        
        // Detect touch device
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
        }
        
        if (isIOS) {
            document.body.classList.add('ios-device');
            
            // Fix iOS viewport height issue
            function setIOSViewportHeight() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }
            
            setIOSViewportHeight();
            window.addEventListener('resize', setIOSViewportHeight);
            
            // Fix iOS double-tap zoom
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
        
        // Optimize for mobile - reduce animations
        if (window.innerWidth < 768 || isTouchDevice) {
            // Reduce matrix rain intensity on mobile
            if (typeof matrixRain !== 'undefined') {
                matrixRain.drops = matrixRain.drops.slice(0, 50);
            }
        }
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
                if (typeof updateUI === 'function') {
                    updateUI();
                }
            }, 100);
        });
'''

# Add mobile JS before other scripts
content = content.replace(
    '<script>',
    '<script>' + ios_js
)

with open('dashboard.html', 'w') as f:
    f.write(content)

print('Mobile & iOS optimizations applied to Neural OS')
print('- Added responsive CSS for mobile/tablet')
print('- Added iOS safe area support')
print('- Added touch device detection')
print('- Added orientation change handling')
print('- Optimized touch targets (44px min)')
print('- Fixed iOS input zoom')
PYEOF

echo 'Neural OS Dashboard optimized for mobile/iOS'
