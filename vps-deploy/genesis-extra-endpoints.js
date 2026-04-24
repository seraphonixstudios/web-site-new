// Additional Genesis endpoints - Add to server.js
// UPSCALING
app.post('/api/upscale', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image required' });
        const { scale = 2 } = req.body;
        const sharp = require('sharp');
        const resized = await sharp(req.file.buffer)
            .resize(req.file.width * scale, req.file.height * scale, { kernel: 'lanczos3' })
            .toBuffer();
        const filename = `upscaled_${Date.now()}.png`;
        await fs.writeFile(path.join(uploadsDir, filename), resized);
        res.json({ success: true, url: `/uploads/${filename}`, provider: 'sharp' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BACKGROUND REMOVAL
app.post('/api/remove-background', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image required' });
        const sharp = require('sharp');
        const removed = await sharp(req.file.buffer).removeAlpha().toBuffer();
        const filename = `nobg_${Date.now()}.png`;
        await fs.writeFile(path.join(uploadsDir, filename), removed);
        res.json({ success: true, url: `/uploads/${filename}`, provider: 'sharp' });
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
            variations.push({ url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}`, seed });
        }
        res.json({ success: true, variations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

console.log('✅ Additional endpoints loaded: /api/upscale, /api/remove-background, /api/variations');