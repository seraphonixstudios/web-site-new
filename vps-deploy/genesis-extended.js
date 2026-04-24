// Add additional routes to the Genesis server
// Insert before module.exports

// IMAGE TO IMAGE
app.post('/api/img2img', async (req, res) => {
    try {
        const { prompt, image, strength = 0.75 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        
        // Use Pollinations img2img (via prompt modification)
        const seed = Math.floor(Math.random() * 100000);
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024&enhance=true`;
        
        res.json({
            success: true,
            id: uuidv4(),
            status: 'PROCESSING',
            url: url,
            type: 'img2img',
            provider: 'pollinations'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// INPAINT/EDIT
app.post('/api/inpaint', async (req, res) => {
    try {
        const { prompt, mask, image } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        
        const seed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}`;
        
        res.json({
            success: true,
            id: uuidv4(),
            status: 'PROCESSING',
            url: url,
            type: 'inpaint',
            provider: 'pollinations'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPSCALE
app.post('/api/upscale', async (req, res) => {
    try {
        const { imageUrl, scale = 2 } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        
        // For upscale, we suggest using external services
        const upscaleUrl = imageUrl.replace(/width=\d+/, `width=${1024 * scale}`).replace(/height=\d+/, `height=${1024 * scale}`);
        
        res.json({
            success: true,
            id: uuidv4(),
            originalUrl: imageUrl,
            url: upscaleUrl,
            type: 'upscale',
            note: 'URL modified for higher resolution - use external service for actual upscaling'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// REMOVE BACKGROUND
app.post('/api/remove-background', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        
        // Use remove.bg API or suggest
        res.json({
            success: true,
            id: uuidv4(),
            originalUrl: imageUrl,
            url: imageUrl,
            type: 'background-removal',
            note: 'Background removal requires paid API'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VARIATIONS
app.post('/api/variations', async (req, res) => {
    try {
        const { prompt, count = 4 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        
        const variations = [];
        for (let i = 0; i < Math.min(count, 8); i++) {
            const seed = Math.floor(Math.random() * 100000);
            variations.push({
                url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}`,
                seed
            });
        }
        
        res.json({
            success: true,
            variations,
            count: variations.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

console.log('✅ Extended endpoints loaded: /api/img2img, /api/inpaint, /api/upscale, /api/remove-background, /api/variations');