/**
 * Mobile-Fix.js - Comprehensive Mobile Optimization
 * Handles: Canvas, Touch, Performance, iOS Safari, Android Chrome
 */
(function() {
    'use strict';
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth < 768);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (!isMobile) return;
    
    document.documentElement.classList.add('mobile-optimized');
    
    // ===== 1. CANVAS/SPHERE OPTIMIZATION =====
    function optimizeCanvas() {
        const canvas = document.getElementById('sphere-canvas');
        if (!canvas) return;
        
        // Reduce pixel ratio for performance
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        // Override WebGL renderer if exists
        if (window.__sphereRenderer) {
            window.__sphereRenderer.setPixelRatio(1);
            window.__sphereRenderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        // Force canvas resize on orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.__sphereRenderer) {
                    window.__sphereRenderer.setSize(window.innerWidth, window.innerHeight);
                }
            }, 300);
        });
    }
    
    // Run after sphere initializes
    setTimeout(optimizeCanvas, 500);
    setTimeout(optimizeCanvas, 2000);
    window.addEventListener('load', optimizeCanvas);
    
    // ===== 2. iOS SAFARI FIXES =====
    if (isIOS) {
        // Prevent rubber-band scrolling on sphere
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('#sphere-canvas')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Fix 100vh issue on iOS Safari
        function setVH() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
        }
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => setTimeout(setVH, 100));
    }
    
    // ===== 3. TOUCH OPTIMIZATION =====
    // Add touch-friendly tap targets
    document.querySelectorAll('button, .quick-link, .nav-item, .brand-tab').forEach(el => {
        el.style.minHeight = '44px';
        el.style.minWidth = '44px';
        el.style.cursor = 'pointer';
        el.style.webkitTapHighlightColor = 'transparent';
    });
    
    // Double-tap zoom prevention on interactive elements
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('button, a, input, .quick-link, .nav-item')) {
            e.target.style.touchAction = 'manipulation';
        }
    }, { passive: true });
    
    // ===== 4. PERFORMANCE OPTIMIZATION =====
    // Reduce animation complexity on mobile
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .content-window { max-width: 95vw !important; max-height: 85vh !important; }
            .content-window .window-header { padding: 8px 12px !important; }
            .content-window.active { left: 2.5vw !important; top: 5vh !important; }
            .quick-links .link-grid { grid-template-columns: 1fr !important; }
            .nav-bar { flex-wrap: wrap; gap: 4px; }
            .nav-item, .quick-link { padding: 10px 14px; font-size: 0.85rem; }
            .hud { bottom: 10px; left: 10px; font-size: 0.7rem; }
            .admin-window .auth-panel { padding: 20px; width: 90vw; }
            .content-body { padding: 10px; max-height: 60vh; overflow-y: auto; }
            h1, h2 { font-size: 1.4rem; }
            h3 { font-size: 1.1rem; }
            .close-btn { padding: 8px; font-size: 1.2rem; }
            iframe { height: 50vh !important; }
        }
        @media (max-width: 480px) {
            .content-window { max-width: 98vw !important; }
            .nav-item { font-size: 0.75rem; padding: 6px 10px; }
            .auth-panel h3 { font-size: 1.2rem; }
        }
    `;
    document.head.appendChild(style);
    
    // ===== 5. LOADING SCREEN AUTO-HIDE =====
    const loadingEl = document.querySelector('.loading-screen, .loading-overlay, [id*="loading"]');
    if (loadingEl) {
        // Force hide after 8s max
        setTimeout(() => {
            loadingEl.style.display = 'none';
            loadingEl.classList.add('hidden');
        }, 8000);
    }
    
    // ===== 6. NOTIFICATION POSITION =====
    // Move notifications to bottom for thumb reach
    const notifContainer = document.createElement('div');
    notifContainer.id = 'mobile-notifications';
    notifContainer.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;';
    document.body.appendChild(notifContainer);
    
    // Intercept showNotification for mobile positioning
    const origShowNotification = window.SeraphonixSphere?.prototype?.showNotification;
    if (origShowNotification) {
        SeraphonixSphere.prototype.showNotification = function(msg, type) {
            const notif = document.createElement('div');
            notif.textContent = msg;
            notif.style.cssText = 'padding:10px 20px;background:rgba(0,0,0,0.9);color:#00D4FF;border-radius:8px;font-size:0.85rem;animation:fadeInUp 0.3s;pointer-events:none;';
            notifContainer.appendChild(notif);
            setTimeout(() => {
                notif.style.animation = 'fadeOut 0.3s';
                setTimeout(() => notif.remove(), 300);
            }, 3000);
        };
    }
    
    // ===== 7. GENESIS PAGE MOBILE FIX =====
    if (window.location.pathname === '/genesis-page') {
        const styleG = document.createElement('style');
        styleG.textContent = `
            body { padding: 10px !important; }
            h1 { font-size: 1.6rem !important; }
            .prompt-box { max-width: 100% !important; }
            input { padding: 12px; font-size: 1rem; }
            button { width: 100%; padding: 14px; }
            #result img { max-width: 100%; height: auto; }
        `;
        document.head.appendChild(styleG);
    }
    
    // ===== 8. STORE PAGE MOBILE FIX =====
    if (window.location.href.includes('store_html')) {
        const styleS = document.createElement('style');
        styleS.textContent = `
            .product-grid { grid-template-columns: 1fr !important; padding: 1rem; }
            .product { margin: 0 auto; max-width: 400px; }
            .product-image { height: 180px; }
            .page-header h1 { font-size: 1.8rem; }
            .partner-logo { height: 80px !important; }
            .ai-chat-widget { bottom: 10px; right: 10px; }
            .ai-chat-container { width: 280px; }
        `;
        document.head.appendChild(styleS);
    }
    
    console.log('[Mobile-Fix] Optimized for ' + (isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile'));
})();