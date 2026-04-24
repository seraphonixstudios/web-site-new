// Mobile Fix Script - Adds mobile-specific improvements

(function() {
    console.log('Seraphonix: Applying mobile fixes...');
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyMobileFixes);
    } else {
        applyMobileFixes();
    }
    
    function applyMobileFixes() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                        || window.innerWidth < 768;
        
        if (!isMobile) return;
        
        console.log('Seraphonix: Mobile device detected, applying fixes...');
        
        // 1. Add touch-action to canvas if missing
        const canvas = document.getElementById('sphere-canvas');
        if (canvas) {
            canvas.style.touchAction = 'none';
            canvas.style.webkitTouchCallout = 'none';
            canvas.style.webkitUserSelect = 'none';
            canvas.style.userSelect = 'none';
        }
        
        // 2. Add mobile CSS fixes
        const style = document.createElement('style');
        style.id = 'mobile-fix-styles';
        style.textContent = `
            @media (max-width: 768px) {
                /* Force loading screen to hide on mobile */
                #loading-screen {
                    display: flex !important;
                }
                
                #loading-screen.hidden {
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
                
                /* Canvas touch fixes */
                #sphere-canvas {
                    touch-action: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                }
                
                /* Content window mobile fixes */
                .content-window {
                    width: 94vw !important;
                    max-width: 94vw !important;
                    left: 3vw !important;
                    top: 8vh !important;
                    max-height: 85vh !important;
                    overflow-y: auto !important;
                    -webkit-overflow-scrolling: touch;
                }
                
                .content-window.active {
                    transform: scale(1) !important;
                }
                
                /* Iframe mobile fixes */
                .genesis-content iframe,
                .store-content iframe,
                .vps-content iframe {
                    min-height: 60vh;
                    touch-action: pan-y;
                }
                
                /* Node labels mobile */
                .node-label {
                    font-size: 0.7rem !important;
                    padding: 8px 12px !important;
                }
                
                /* Quick links mobile */
                .quick-link {
                    padding: 14px 16px !important;
                    font-size: 0.9rem !important;
                    min-height: 48px;
                }
                
                /* Stats grid mobile */
                .stats-grid {
                    grid-template-columns: 1fr 1fr !important;
                }
                
                /* HUD mobile - hide for better touch */
                .hud-overlay {
                    display: none !important;
                }
                
                /* Instructions mobile */
                #gesture-hints {
                    bottom: 15px !important;
                    font-size: 0.75rem !important;
                    padding: 8px 12px !important;
                }
                
                /* Log window mobile */
                .window-content {
                    -webkit-overflow-scrolling: touch;
                    overflow-y: auto !important;
                }
            }
            
            @media (max-width: 480px) {
                .content-window {
                    width: 96vw !important;
                    left: 2vw !important;
                    top: 6vh !important;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr !important;
                }
                
                .glitch-title {
                    font-size: 1.5rem !important;
                }
            }
            
            /* Always applied */
            * {
                -webkit-tap-highlight-color: transparent !important;
            }
            
            /* Smooth scrolling for content windows */
            .window-content {
                scroll-behavior: smooth;
            }
        `;
        document.head.appendChild(style);
        
        // 3. Force hide loading screen after 3 seconds on mobile
        setTimeout(() => {
            const loading = document.getElementById('loading-screen');
            if (loading) {
                loading.classList.add('hidden');
                setTimeout(() => {
                    if (loading.parentNode) loading.remove();
                }, 600);
            }
        }, 3000);
        
        // 4. Fix any stuck loading screens
        setInterval(() => {
            const loading = document.getElementById('loading-screen');
            if (loading && loading.style.display !== 'none') {
                // If still showing after 8 seconds, force hide
                const elapsed = Date.now() - (loading._startTime || Date.now());
                if (elapsed > 8000) {
                    loading.classList.add('hidden');
                    setTimeout(() => {
                        if (loading.parentNode) loading.remove();
                    }, 600);
                }
            }
        }, 1000);
        
        // 5. Prevent default touch behaviors on canvas
        document.addEventListener('touchmove', (e) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 6. Improve touch response
        if (canvas) {
            canvas.addEventListener('touchstart', () => {
                canvas.style.opacity = '0.99';
                setTimeout(() => canvas.style.opacity = '1', 50);
            }, { passive: true });
        }
        
        console.log('Seraphonix: Mobile fixes applied');
    }
})();