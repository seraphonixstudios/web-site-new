// Enhanced Touch and Mouse Event Handler
// Add this to the setupEvents function in script.js

enhanceTouchNavigation() {
    const canvas = document.getElementById('sphere-canvas');
    if (!canvas) return;
    
    // Touch support variables
    this.touchStartPos = { x: 0, y: 0 };
    this.touchCurrentPos = { x: 0, y: 0 };
    this.touchStartTime = 0;
    this.isTouchDragging = false;
    
    // Touch start
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        this.touchCurrentPos = { x: touch.clientX, y: touch.clientY };
        this.touchStartTime = Date.now();
        this.isTouchDragging = true;
        this.isDragging = true;
        canvas.style.cursor = 'grabbing';
    }, { passive: false });
    
    // Touch move
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!this.isTouchDragging) return;
        
        const touch = e.touches[0];
        
        // Update mouse for raycasting
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        // Calculate delta for rotation
        const deltaX = touch.clientX - this.touchCurrentPos.x;
        const deltaY = touch.clientY - this.touchCurrentPos.y;
        
        // Enhanced rotation sensitivity for touch
        const sensitivity = window.innerWidth < 768 ? 0.012 : 0.008;
        this.sphereGroup.rotation.y += deltaX * sensitivity;
        this.sphereGroup.rotation.x += deltaY * sensitivity;
        
        this.touchCurrentPos = { x: touch.clientX, y: touch.clientY };
        
        // Update coordinates display
        this.updateCoordDisplay();
        
        // Check node intersection during touch
        this.checkNodeIntersection();
    }, { passive: false });
    
    // Touch end
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        const touchDuration = Date.now() - this.touchStartTime;
        const touchDistance = Math.sqrt(
            Math.pow(this.touchCurrentPos.x - this.touchStartPos.x, 2) +
            Math.pow(this.touchCurrentPos.y - this.touchStartPos.y, 2)
        );
        
        // If it was a tap (short duration, minimal movement), treat as click
        if (touchDuration < 300 && touchDistance < 10) {
            this.handleNodeClick();
        }
        
        this.isTouchDragging = false;
        this.isDragging = false;
        canvas.style.cursor = 'grab';
    });
    
    // Touch cancel
    canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.isTouchDragging = false;
        this.isDragging = false;
        canvas.style.cursor = 'grab';
    });
    
    console.log('Touch navigation enhanced');
}

// Double-tap to reset view
setupDoubleTapReset() {
    const canvas = document.getElementById('sphere-canvas');
    let lastTap = 0;
    
    canvas.addEventListener('touchend', (e) => {
        const currentTime = Date.now();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            this.resetView();
            console.log('Double-tap reset view');
        }
        
        lastTap = currentTime;
    });
}

// Pinch to zoom
setupPinchZoom() {
    const canvas = document.getElementById('sphere-canvas');
    let initialPinchDistance = 0;
    let initialZoom = this.zoom;
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialPinchDistance = Math.sqrt(
                Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
            );
            initialZoom = this.zoom;
        }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            
            const currentPinchDistance = Math.sqrt(
                Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
            );
            
            const pinchRatio = currentPinchDistance / initialPinchDistance;
            this.targetZoom = Math.max(5, Math.min(20, initialZoom / pinchRatio));
        }
    }, { passive: false });
}

// Ensure nodes open on mobile
enhanceNodeOpening() {
    // Make node labels clickable on mobile
    const labels = document.querySelectorAll('.node-label');
    labels.forEach(label => {
        label.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            const nodeId = label.getAttribute('data-node');
            if (nodeId) {
                this.openWindow(nodeId);
            }
        });
    });
    
    console.log('Node opening enhanced for mobile');
}

// Update coordinate display
updateCoordDisplay() {
    const xEl = document.getElementById('coord-x');
    const yEl = document.getElementById('coord-y');
    const zEl = document.getElementById('coord-z');
    
    if (xEl && this.sphereGroup) {
        xEl.textContent = this.sphereGroup.rotation.x.toFixed(2);
    }
    if (yEl && this.sphereGroup) {
        yEl.textContent = this.sphereGroup.rotation.y.toFixed(2);
    }
    if (zEl && this.sphereGroup) {
        zEl.textContent = this.sphereGroup.rotation.z.toFixed(2);
    }
}
