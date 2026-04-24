// Add to store_html/script.js - Email + Mobile Verification for Checkout

// Check verification before adding to cart
const originalAddToCart = addToCart;
function addToCart(productName, price) {
    const isVerified = localStorage.getItem('atlantiplex_verified') === 'true';
    const userEmail = localStorage.getItem('atlantiplex_email');
    
    if (!isVerified || !userEmail) {
        showVerificationModal();
        return;
    }
    
    originalAddToCart(productName, price);
}

function showVerificationModal() {
    const existing = document.getElementById('verification-modal');
    if (existing) return;
    
    const modal = document.createElement('div');
    modal.id = 'verification-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:#001a33;border:2px solid #00bfff;padding:40px;max-width:400px;width:90%;text-align:center;border-radius:10px;">
            <h2 style="color:#00bfff;font-family:'Montserrat',sans-serif;margin-bottom:15px;font-size:1.5rem;">VERIFICATION REQUIRED</h2>
            <p style="color:#aaa;margin-bottom:20px;font-size:0.9rem;">Enter your email and mobile to purchase</p>
            <input type="email" id="verify-email" placeholder="Email address" style="width:100%;padding:14px;margin-bottom:12px;background:#000;border:1px solid #00bfff;color:#fff;border-radius:5px;font-size:1rem;">
            <input type="tel" id="verify-mobile" placeholder="Mobile number (+1...)" style="width:100%;padding:14px;margin-bottom:20px;background:#000;border:1px solid #00bfff;color:#fff;border-radius:5px;font-size:1rem;">
            <button onclick="submitVerification()" style="width:100%;padding:14px;background:#00bfff;color:#001a33;border:none;font-weight:bold;cursor:pointer;border-radius:5px;font-size:1rem;">VERIFY & CONTINUE</button>
            <p id="verify-error" style="color:#ff4444;margin-top:15px;font-size:0.85rem;"></p>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
}

function submitVerification() {
    const email = document.getElementById('verify-email').value.trim();
    const mobile = document.getElementById('verify-mobile').value.trim();
    const errorEl = document.getElementById('verify-error');
    
    if (!email || !email.includes('@') || !email.includes('.')) {
        errorEl.textContent = 'Please enter a valid email address';
        return;
    }
    if (!mobile || mobile.replace(/\D/g,'').length < 10) {
        errorEl.textContent = 'Please enter a valid mobile number';
        return;
    }
    
    localStorage.setItem('atlantiplex_verified', 'true');
    localStorage.setItem('atlantiplex_email', email);
    localStorage.setItem('atlantiplex_mobile', mobile);
    
    const modal = document.getElementById('verification-modal');
    if (modal) modal.remove();
    
    alert('Verified! You can now purchase.');
}