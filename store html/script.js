// Atlantiplex Store - Shopping Cart Functions

let cart = [];
let cartTotal = 0;

function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    cartTotal += price;
    
    updateCartDisplay();
    showNotification(`${productName} added to cart!`, 'success');
    
    // Visual feedback on button
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(productName)) {
            btn.textContent = 'Added ✓';
            btn.style.background = 'var(--matrix-green)';
            btn.style.color = '#000';
            
            setTimeout(() => {
                btn.textContent = 'Add to Cart';
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }
    });
}

function updateCartDisplay() {
    // Create or update cart counter
    let cartCounter = document.getElementById('cart-counter');
    if (!cartCounter) {
        cartCounter = document.createElement('div');
        cartCounter.id = 'cart-counter';
        cartCounter.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--atlantean-blue);
            color: #000;
            padding: 10px 20px;
            border-radius: 8px;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(0, 191, 255, 0.5);
        `;
        document.body.appendChild(cartCounter);
    }
    
    cartCounter.innerHTML = `
        🛒 ${cart.length} item${cart.length !== 1 ? 's' : ''} - $${cartTotal.toFixed(2)}
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff00' : '#00bfff'};
        color: #000;
        padding: 15px 25px;
        border-radius: 8px;
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        z-index: 1001;
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize cart display on load
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    console.log('🛒 Atlantiplex Store initialized');
});
