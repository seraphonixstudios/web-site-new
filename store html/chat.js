// Atlantiplex Store - Chat Widget

(function() {
    // Create chat button
    const chatButton = document.createElement('button');
    chatButton.id = 'chat-toggle';
    chatButton.innerHTML = '💬';
    chatButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--atlantean-blue);
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 999;
        box-shadow: 0 0 20px rgba(0, 191, 255, 0.5);
        transition: all 0.3s ease;
    `;
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 20px;
        width: 300px;
        height: 400px;
        background: linear-gradient(135deg, #001a33, #000033);
        border: 2px solid var(--atlantean-blue);
        border-radius: 12px;
        z-index: 998;
        display: none;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(0, 191, 255, 0.3);
    `;
    
    chatWindow.innerHTML = `
        <div style="background: var(--atlantean-blue); padding: 15px; color: #000; font-family: 'Orbitron', sans-serif; font-weight: 700;">
            🌊 Atlantiplex Support
        </div>
        <div id="chat-messages" style="flex: 1; padding: 15px; overflow-y: auto; font-family: 'Rajdhani', sans-serif; font-size: 14px;">
            <div style="margin-bottom: 10px; color: var(--neon-green);">
                <strong>Bot:</strong> Welcome to Atlantiplex! How can I help you today?
            </div>
        </div>
        <div style="padding: 15px; border-top: 1px solid rgba(0, 191, 255, 0.3); display: flex; gap: 10px;">
            <input type="text" id="chat-input" placeholder="Type your message..." style="
                flex: 1;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid var(--atlantean-blue);
                padding: 10px;
                color: var(--neon-green);
                font-family: 'Rajdhani', sans-serif;
                border-radius: 6px;
            ">
            <button id="chat-send" style="
                background: var(--atlantean-blue);
                border: none;
                padding: 10px 15px;
                color: #000;
                font-weight: 700;
                border-radius: 6px;
                cursor: pointer;
            ">Send</button>
        </div>
    `;
    
    document.body.appendChild(chatButton);
    document.body.appendChild(chatWindow);
    
    // Toggle chat window
    let isOpen = false;
    chatButton.addEventListener('click', () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        chatButton.style.transform = isOpen ? 'rotate(360deg)' : 'rotate(0deg)';
    });
    
    // Handle messages
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.style.cssText = 'margin-bottom: 10px; text-align: right; color: #fff;';
        userMsg.innerHTML = `<strong>You:</strong> ${message}`;
        chatMessages.appendChild(userMsg);
        
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Bot response
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.style.cssText = 'margin-bottom: 10px; color: var(--neon-green);';
            
            // Simple response logic
            let response = "Thanks for your message! Our team will get back to you soon. For immediate assistance, email support@atlantiplex.com";
            
            if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
                response = "Our AI tools range from $79 to $399. Check out our product cards for current pricing and discounts!";
            } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('support')) {
                response = "I can help with product questions, pricing, and technical support. What do you need assistance with?";
            } else if (message.toLowerCase().includes('buy') || message.toLowerCase().includes('purchase')) {
                response = "Click 'Add to Cart' on any product to start your purchase. We accept all major payment methods!";
            }
            
            botMsg.innerHTML = `<strong>Bot:</strong> ${response}`;
            chatMessages.appendChild(botMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
    
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    console.log('💬 Chat widget initialized');
})();
