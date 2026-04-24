const fs = require('fs');
let s = fs.readFileSync('/var/www/ai-image-generator/server.js', 'utf8');

// Add API logging to /api/generate endpoint
const generateEndpoint = `app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, provider = 'pollinations', width = 1024, height = 1024, model } = req.body;
        
        if (!prompt) {
            log('WARN', 'API', 'Generate request missing prompt', {ip: req.ip});
            return res.status(400).json({ error: 'Prompt required' });
        }
        
        log('INFO', 'API', 'Generate request', {provider, promptLength: prompt.length, ip: req.ip});
        
        let result;`;

s = s.replace(
  `app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, provider = 'pollinations', width = 1024, height = 1024, model } = req.body;
        
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        
        let result;`,
  generateEndpoint
);

// Add result logging
s = s.replace(
  `res.json({ success: true, id: uuidv4(), url, prompt, type: 'text-to-image', provider: 'pollinations' });`,
  `const result = { success: true, id: uuidv4(), url, prompt, type: 'text-to-image', provider: 'pollinations' };
        log('INFO', 'API', 'Generate success', {provider: 'pollinations', prompt: prompt.substring(0, 50)});
        res.json(result);`
);

fs.writeFileSync('/var/www/ai-image-generator/server.js', s);
console.log('API logging added');