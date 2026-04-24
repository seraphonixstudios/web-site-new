app.post('/api/img2img', async (req, res) => {
    try {
        const { prompt, imageUrl, strength = 0.75 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        const seed = Math.floor(Math.random() * 100000);
        res.json({
            success: true,
            id: uuidv4(),
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&width=1024&height=1024`,
            type: 'img2img',
            provider: 'pollinations'
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/upscale', async (req, res) => {
    try {
        const { imageUrl, scale = 2 } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        res.json({ success: true, url: imageUrl, type: 'upscale', note: 'Use external API for actual upscale' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/remove-background', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        res.json({ success: true, url: imageUrl, type: 'background-removal', note: 'Use remove.bg or similar' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/variations', async (req, res) => {
    try {
        const { prompt, count = 4 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        const variations = [];
        for (let i = 0; i < Math.min(count, 8); i++) {
            variations.push({ url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${Math.floor(Math.random() * 100000)}`, seed: i });
        }
        res.json({ success: true, variations });
    } catch (error) { res.status(500).json({ error: error.message }); }
});