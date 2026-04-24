const fs = require('fs');
let content = fs.readFileSync('/var/www/html/script.js', 'utf8');

// Find the double click handler and add touch events after it
const insertPoint = `        // Double click to reset
        canvas.addEventListener('dblclick', () => {
            this.resetView();
        });`;

const touchEvents = `        // Double click to reset
        canvas.addEventListener('dblclick', () => {
            this.resetView();
        });
        
        // TOUCH EVENTS FOR MOBILE
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouchDragging = false;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isTouchDragging = false;
                this.isDragging = true;
                
                // Update mouse for raycasting
                this.mouse.x = (touchStartX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(touchStartY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });
        
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isDragging) {
                e.preventDefault();
                
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                const deltaX = touchX - touchStartX;
                const deltaY = touchY - touchStartY;
                
                // Mark as dragging if moved enough
                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    isTouchDragging = true;
                }
                
                // Rotate sphere with touch
                const sensitivity = window.innerWidth < 768 ? 0.01 : 0.008;
                this.sphereGroup.rotation.y += deltaX * sensitivity;
                this.sphereGroup.rotation.x += deltaY * sensitivity;
                
                touchStartX = touchX;
                touchStartY = touchY;
                
                this.checkNodeIntersection();
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            this.isDragging = false;
            
            if (!isTouchDragging) {
                // It was a tap, handle node click
                this.checkNodeIntersection();
                this.handleNodeClick();
            }
            
            isTouchDragging = false;
        }, { passive: true });`;

content = content.replace(insertPoint, touchEvents);

fs.writeFileSync('/var/www/html/script.js', content);
console.log('Added touch event handlers for mobile');