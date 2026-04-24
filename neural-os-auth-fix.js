// Fix Neural OS authentication for iframe access
// Add to server.js - Allow iframe embedding with credentials

// CORS and iframe support
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *;");
  next();
});

// Public access to dashboard without auth for iframe embedding
// (You can still protect API endpoints)
app.get('/dashboard', (req, res) => {
    // Allow access without auth for iframe, but APIs still require auth
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
