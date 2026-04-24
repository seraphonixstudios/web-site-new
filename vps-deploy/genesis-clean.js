require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', version: '5.0.0', timestamp: new Date().toISOString() });
});

app.get('/api/providers', (req, res) => {
    res.json({ providers: ['pollinations'], features: ['text-to-image', 'img2img', 'upscale', 'variations'] });
});

app.post('/api/generate', (req, res) => {
    try {
        const { prompt, width = 1024, height = 1024 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        const seed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true`;
        res.json({ success: true, id: uuidv4(), url, prompt, type: 'text-to-image', provider: 'pollinations' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/img2img', (req, res) => {
    try {
        const { prompt, imageUrl, strength = 0.75 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        const seed = Math.floor(Math.random() * 100000);
        const url = imageUrl 
            ? `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&width=1024&height=1024&original=${encodeURIComponent(imageUrl)}`
            : `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}`;
        res.json({ success: true, id: uuidv4(), url, prompt, type: 'img2img', provider: 'pollinations' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/upscale', (req, res) => {
    try {
        const { imageUrl, scale = 2 } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        const newUrl = imageUrl.replace(/width=\d+/, `width=${1024 * scale}`).replace(/height=\d+/, `height=${1024 * scale}`);
        res.json({ success: true, id: uuidv4(), url: newUrl, type: 'upscale', scale });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/variations', (req, res) => {
    try {
        const { prompt, count = 4 } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        const variations = [];
        for (let i = 0; i < Math.min(count, 8); i++) {
            const seed = Math.floor(Math.random() * 100000);
            variations.push({ url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&width=1024&height=1024`, seed });
        }
        res.json({ success: true, variations });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/remove-background', (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        res.json({ success: true, id: uuidv4(), url: imageUrl, note: 'Use external API for actual removal' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Genesis v5.0.0 running on port ${PORT}`);
});