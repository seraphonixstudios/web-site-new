/**
 * Cross-Origin Authentication Bridge
 * Handles secure token passing between Seraphonix Sphere and iframes
 */

class AuthBridge {
    constructor() {
        this.tokens = new Map();
        this.listeners = new Map();
        this.init();
    }
    
    init() {
        // Listen for messages from child iframes
        window.addEventListener('message', (e) => {
            this.handleMessage(e);
        });
        
        console.log('[AuthBridge] Initialized');
    }
    
    /**
     * Register a token for a specific service
     */
    registerToken(service, token) {
        this.tokens.set(service, {
            token: token,
            timestamp: Date.now()
        });
        
        // Store in localStorage for persistence
        localStorage.setItem(`auth_token_${service}`, token);
        localStorage.setItem(`auth_time_${service}`, Date.now());
        
        console.log(`[AuthBridge] Token registered for ${service}`);
    }
    
    /**
     * Get token for a service
     */
    getToken(service) {
        // Check memory first
        const cached = this.tokens.get(service);
        if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
            return cached.token;
        }
        
        // Check localStorage
        const stored = localStorage.getItem(`auth_token_${service}`);
        const storedTime = localStorage.getItem(`auth_time_${service}`);
        
        if (stored && storedTime && Date.now() - parseInt(storedTime) < 24 * 60 * 60 * 1000) {
            // Restore to memory
            this.tokens.set(service, {
                token: stored,
                timestamp: parseInt(storedTime)
            });
            return stored;
        }
        
        return null;
    }
    
    /**
     * Handle incoming messages from iframes
     */
    handleMessage(event) {
        const { data, origin, source } = event;
        
        // Security: Only accept messages from allowed origins
        const allowedOrigins = [
            'http://localhost:3077',
            'http://76.13.242.128:3077',
            'http://localhost:5000',
            'http://76.13.242.128:5000',
            'https://verilysovereign.org'
        ];
        
        if (!allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            console.warn('[AuthBridge] Rejected message from unauthorized origin:', origin);
            return;
        }
        
        if (!data || !data.type) return;
        
        switch (data.type) {
            case 'REQUEST_AUTH':
                // Child is requesting auth token
                const service = data.service || 'neural-os';
                const token = this.getToken(service);
                
                if (token && source) {
                    source.postMessage({
                        type: 'AUTH_TOKEN',
                        token: token,
                        service: service
                    }, origin);
                }
                break;
                
            case 'AUTH_SUCCESS':
                // Child confirmed successful auth
                console.log(`[AuthBridge] Auth confirmed for ${data.service}`);
                this.emit('authSuccess', { service: data.service, user: data.user });
                break;
                
            case 'AUTH_FAILED':
                // Child reported auth failure
                console.warn(`[AuthBridge] Auth failed for ${data.service}:`, data.error);
                this.clearToken(data.service);
                this.emit('authFailed', { service: data.service, error: data.error });
                break;
                
            case 'LOGOUT':
                // Child requested logout
                this.clearToken(data.service);
                this.emit('logout', { service: data.service });
                break;
        }
    }
    
    /**
     * Send auth token to an iframe
     */
    sendAuthToIframe(iframe, service) {
        const token = this.getToken(service);
        if (!token || !iframe || !iframe.contentWindow) return false;
        
        try {
            // Try to get origin from iframe src
            const iframeUrl = new URL(iframe.src);
            const origin = iframeUrl.origin;
            
            iframe.contentWindow.postMessage({
                type: 'AUTH_TOKEN',
                token: token,
                service: service
            }, origin);
            
            return true;
        } catch (e) {
            console.error('[AuthBridge] Failed to send auth to iframe:', e);
            return false;
        }
    }
    
    /**
     * Clear a token
     */
    clearToken(service) {
        this.tokens.delete(service);
        localStorage.removeItem(`auth_token_${service}`);
        localStorage.removeItem(`auth_time_${service}`);
    }
    
    /**
     * Event emitter functionality
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error('[AuthBridge] Event handler error:', e);
                }
            });
        }
    }
}

// Create global instance
window.authBridge = new AuthBridge();

// Also make it available as a module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthBridge;
}

console.log('[AuthBridge] Loaded and ready');
