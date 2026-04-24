#!/bin/bash
# Mobile CSS Optimization for Seraphonix Sphere

cd /var/www/html || exit 1

python3 << 'PYEOF'
import re

with open('index.html', 'r') as f:
    content = f.read()

# Add viewport meta tag if not present
if '<meta name="viewport"' not in content:
    content = content.replace(
        '<meta charset="UTF-8">',
        '<meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">\n    <meta name="apple-mobile-web-app-capable" content="yes">\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n    <meta name="mobile-web-app-capable" content="yes">\n    <meta name="theme-color" content="#050508">'
    )
    print('Viewport meta tags added')

with open('index.html', 'w') as f:
    f.write(content)

# Now optimize styles.css
with open('styles.css', 'r') as f:
    css = f.read()

mobile_css = '''
/* ===== MOBILE & iOS RESPONSIVE DESIGN ===== */

/* iOS Safe Areas */
@supports (padding-top: env(safe-area-inset-top)) {
    .sphere-container {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
    }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
    .node-label {
        font-size: 0.9rem;
        padding: 10px 18px;
    }
    
    .controls {
        padding: 15px;
    }
    
    .control-btn {
        min-height: 44px;
        min-width: 44px;
        padding: 12px;
    }
}

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
    .header h1 {
        font-size: 2.5rem;
    }
    
    .content-window {
        width: 85vw;
        height: 80vh;
    }
    
    .intro-hero h1 {
        font-size: 3rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .nav-list {
        grid-template-columns: 1fr;
    }
}

/* Mobile Large (481px - 767px) */
@media (max-width: 767px) {
    .sphere-container {
        overflow: hidden;
    }
    
    #sphere-canvas {
        touch-action: none; /* Prevent default touch actions */
    }
    
    .header {
        top: 10px;
        left: 10px;
        right: 10px;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }
    
    .header h1 {
        font-size: 1.5rem;
        letter-spacing: 2px;
    }
    
    .subtitle {
        font-size: 0.7rem;
        text-align: center;
    }
    
    .controls {
        bottom: 15px;
        left: 15px;
        right: 15px;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }
    
    .control-group {
        flex: 1 1 auto;
        min-width: 120px;
    }
    
    .content-window {
        width: 95vw;
        height: 85vh;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    
    .content-window.maximized {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
    }
    
    .window-header {
        padding: 12px 15px;
    }
    
    .window-title {
        font-size: 0.8rem;
    }
    
    .node-label {
        font-size: 0.8rem;
        padding: 8px 14px;
    }
    
    .intro-hero h1 {
        font-size: 2rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }
    
    .stat-number {
        font-size: 2rem;
    }
    
    .coord-panel {
        top: auto;
        bottom: 150px;
        left: 15px;
        flex-direction: row;
        gap: 15px;
    }
    
    .instructions {
        bottom: 100px;
        font-size: 0.65rem;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }
    
    .lore-chapters {
        padding: 20px;
    }
    
    .chapter-content {
        font-size: 0.95rem;
    }
    
    .brand-tabs {
        flex-wrap: wrap;
    }
    
    .values-list {
        grid-template-columns: 1fr;
    }
}

/* Mobile Small (up to 480px) */
@media (max-width: 480px) {
    .header h1 {
        font-size: 1.2rem;
    }
    
    .logo-mark {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
    }
    
    .control-group {
        min-width: 100px;
    }
    
    .control-btn {
        padding: 10px;
        font-size: 0.8rem;
    }
    
    .content-window {
        width: 100vw;
        height: 90vh;
    }
    
    .window-content {
        padding: 15px;
    }
    
    .node-label {
        font-size: 0.75rem;
        padding: 6px 12px;
    }
    
    .intro-hero h1 {
        font-size: 1.5rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
    
    .stat-number {
        font-size: 1.5rem;
    }
    
    .pillars-grid {
        grid-template-columns: 1fr 1fr;
    }
    
    .colors-row {
        flex-direction: column;
    }
    
    .font-showcase {
        grid-template-columns: 1fr;
    }
    
    .server-row {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .action-bar {
        flex-direction: column;
    }
    
    .cm-input-group {
        flex-direction: column;
    }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
    .header {
        flex-direction: row;
        padding: 8px 15px;
    }
    
    .header h1 {
        font-size: 1rem;
    }
    
    .controls {
        bottom: 10px;
        flex-direction: row;
    }
    
    .content-window {
        height: 95vh;
    }
}

/* iOS Specific Fixes */
@supports (-webkit-touch-callout: none) {
    /* iOS only */
    html, body {
        -webkit-overflow-scrolling: touch;
    }
    
    .content-window {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
    }
    
    /* Fix iOS tap highlight */
    button, .control-btn, .window-controls button {
        -webkit-tap-highlight-color: transparent;
    }
    
    /* Fix iOS input zoom */
    input, select, textarea {
        font-size: 16px !important;
    }
    
    /* Fix iOS momentum scrolling */
    .window-content {
        -webkit-overflow-scrolling: touch;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-dark: #050508;
        --bg-panel: rgba(10, 10, 15, 0.98);
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

/* High contrast mode */
@media (prefers-contrast: high) {
    .node-label {
        border: 2px solid var(--cyan);
    }
    
    .content-window {
        border: 2px solid var(--cyan);
    }
}
'''

# Add mobile CSS before the end of file
if '/* ===== MOBILE & iOS' not in css:
    css = css + '\n' + mobile_css
    print('Mobile responsive CSS added to styles.css')

with open('styles.css', 'w') as f:
    f.write(css)

PYEOF

echo 'All CSS optimized for mobile/iOS'
