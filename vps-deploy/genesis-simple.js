// Simple endpoints for Genesis
app.post('/api/variations', async (req, res) => {
    try {
        const { prompt, count = 4 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        const variations = [];
        for (let i = 0; i < Math.min(count, 8); i++) {
            const seed = Math.floor(Math.random() * 100000);
            variations.push({ 
                url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&width=1024&height=1024`, 
                seed 
            });
        }
        res.json({ success: true, variations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/upscale-url', async (req, res) => {
    try {
        const { imageUrl, scale = 2 } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        res.json({ success: true, url: imageUrl, note: 'Upscale uses external API' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});