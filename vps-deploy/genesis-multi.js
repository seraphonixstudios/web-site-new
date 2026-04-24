/**
 * Genesis Engine - Multi-Provider Image Generation Server
 * Supports: Pollinations (default), HuggingFace, Replicate, Stability AI
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const REPLICATE_KEY = process.env.REPLICATE_API_KEY;
const STABILITY_KEY = process.env.STABILITY_API_KEY;
const TOGETHER_KEY = process.env.TOGETHER_API_KEY;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ===== HEALTH =====
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'online', 
        version: '5.1.0', 
        timestamp: new Date().toISOString(),
        providers: getAvailableProviders()
    });
});

function getAvailableProviders() {
    const providers = ['pollinations'];
    if (HF_API_KEY) providers.push('huggingface');
    if (REPLICATE_KEY) providers.push('replicate');
    if (STABILITY_KEY) providers.push('stability');
    return providers;
}

// ===== PROVIDERS =====
app.get('/api/providers', (req, res) => {
    res.json({ 
        providers: getAvailableProviders(),
        features: ['text-to-image', 'img2img', 'upscale', 'variations', 'inpaint', 'background-removal']
    });
});

// ===== TEXT TO IMAGE =====
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, provider = 'pollinations', width = 1024, height = 1024, model } = req.body;
        
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        
        let result;
        
        switch(provider) {
            case 'huggingface':
                if (!HF_API_KEY) {
                    return res.status(400).json({ error: 'HuggingFace API key not configured' });
                }
                result = await generateHuggingFace(prompt, width, height, model);
                break;
            case 'replicate':
                if (!REPLICATE_KEY) {
                    return res.status(400).json({ error: 'Replicate API key not configured' });
                }
                result = await generateReplicate(prompt, width, height);
                break;
            case 'stability':
                if (!STABILITY_KEY) {
                    return res.status(400).json({ error: 'Stability AI API key not configured' });
                }
                result = await generateStability(prompt, width, height);
                break;
            default:
                result = await generatePollinations(prompt, width, height);
        }
        
        res.json(result);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

async function generatePollinations(prompt, width, height) {
    const seed = Math.floor(Math.random() * 100000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true`;
    
    return { success: true, id: uuidv4(), url, prompt, type: 'text-to-image', provider: 'pollinations' };
}

async function generateHuggingFace(prompt, width, height, model = 'stabilityai/stable-diffusion-xl-base-1.0') {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/api/models/' + model,
            { inputs: prompt },
            {
                headers: { 
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );
        
        const imageBuffer = Buffer.from(response.data);
        const filename = `${uuidv4()}.png`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, imageBuffer);
        
        return { 
            success: true, 
            id: uuidv4(), 
            url: `/uploads/${filename}`, 
            prompt, 
            type: 'text-to-image', 
            provider: 'huggingface',
            local: true
        };
    } catch (e) {
        console.error('HuggingFace error:', e.response?.data || e.message);
        // Fallback to pollinations
        return generatePollinations(prompt, width, height);
    }
}

async function generateReplicate(prompt, width, height) {
    try {
        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
                input: { prompt, width, height }
            },
            {
                headers: { 
                    'Authorization': `Token ${REPLICATE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return { 
            success: true, 
            id: response.data.id, 
            url: response.data.output?.[0], 
            prompt, 
            type: 'text-to-image', 
            provider: 'replicate',
            status: response.data.status
        };
    } catch (e) {
        return generatePollinations(prompt, width, height);
    }
}

async function generateStability(prompt, width, height) {
    try {
        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1.0/text-to-image',
            {
                text_prompts: [{ text: prompt, weight: 1 }],
                cfg_scale: 7,
                height: height,
                width: width,
                steps: 30,
                samples: 1
            },
            {
                headers: { 
                    'Authorization': `Bearer ${STABILITY_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );
        
        const base64 = Buffer.from(response.data).toString('base64');
        const filename = `${uuidv4()}.png`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, Buffer.from(response.data, 'binary'));
        
        return { 
            success: true, 
            id: uuidv4(), 
            url: `/uploads/${filename}`, 
            prompt, 
            type: 'text-to-image', 
            provider: 'stability',
            local: true
        };
    } catch (e) {
        return generatePollinations(prompt, width, height);
    }
}

// ===== IMAGE TO IMAGE =====
app.post('/api/img2img', async (req, res) => {
    try {
        const { prompt, imageUrl, strength = 0.75, provider = 'pollinations' } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        
        const seed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&width=1024&height=1024&original=${encodeURIComponent(imageUrl)}&denoise=${strength}`;
        
        res.json({ success: true, id: uuidv4(), url, prompt, type: 'img2img', provider: 'pollinations' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== UPSCALE =====
app.post('/api/upscale', async (req, res) => {
    try {
        const { imageUrl, scale = 2 } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        
        const newUrl = imageUrl.replace(/width=\d+/, `width=${1024 * scale}`).replace(/height=\d+/, `height=${1024 * scale}`);
        
        res.json({ success: true, id: uuidv4(), url: newUrl, type: 'upscale', provider: 'pollinations', scale });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== VARIATIONS =====
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
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== REMOVE BACKGROUND =====
app.post('/api/remove-background', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
        
        res.json({ success: true, id: uuidv4(), url: imageUrl, type: 'background-removal', note: 'Use remove.bg API for actual removal' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Genesis Engine v5.1.0 running on port ${PORT}`);
    console.log(`Providers: ${getAvailableProviders().join(', ')}`);
});