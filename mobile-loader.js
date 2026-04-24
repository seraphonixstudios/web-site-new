// Mobile-First Simple Loader
// This runs BEFORE the main script to ensure loading screen always hides

(function() {
    'use strict';
    
    console.log('[MOBILE LOADER] Starting...');
    
    // Force hide ALL loading elements after max 6 seconds
    var forceHide = function() {
        console.log('[MOBILE LOADER] Force hiding loading screens');
        
        var loadingScreen = document.getElementById('loading-screen');
        var mobileLoader = document.getElementById('mobile-loader');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.classList.add('hidden');
        }
        
        if (mobileLoader) {
            mobileLoader.style.display = 'none';
            mobileLoader.style.visibility = 'hidden';
        }
        
        // Show main content
        document.body.style.overflow = 'auto';
    };
    
    // Try to hide after page loads
    if (document.readyState === 'complete') {
        console.log('[MOBILE LOADER] Page already loaded, scheduling hide');
        setTimeout(forceHide, 2000);
    } else {
        window.addEventListener('load', function() {
            console.log('[MOBILE LOADER] Page loaded, scheduling hide');
            setTimeout(forceHide, 2000);
        });
    }
    
    // ABSOLUTE FALLBACK: Force hide after 6 seconds no matter what
    setTimeout(forceHide, 6000);
    
    // SUPER FALLBACK: If nothing works, hide after user interaction
    var userInteraction = function() {
        console.log('[MOBILE LOADER] User interaction detected, forcing hide');
        forceHide();
        document.removeEventListener('touchstart', userInteraction);
        document.removeEventListener('click', userInteraction);
    };
    
    document.addEventListener('touchstart', userInteraction, {once: true});
    document.addEventListener('click', userInteraction, {once: true});
    
})();
