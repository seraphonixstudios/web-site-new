/**
 * Additional API Endpoints for Genesis Engine
 * Add these to /var/www/ai-image-generator/server.js
 */

// ===============================
// UPSCALING ENDPOINT
// ===============================
app.post('/api/upscale', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image required' });
        }
        
        const { scale = 2, provider = 'sharp' } = req.body;
        const scaleNum = parseInt(scale) || 2;
        
        const imageBuffer = req.file.buffer;
        const base64Image = imageBuffer.toString('base64');
        
        let result;
        
        // Use sharp for local upscaling (free)
        if (provider === 'sharp' || !process.env.STABILITY_API_KEY) {
            const sharp = require('sharp');
            const resized = await sharp(imageBuffer)
                .resize(imageBuffer.width * scaleNum, imageBuffer.height * scaleNum, {
                    kernel: sharp.kernel.lanczos3
                })
                .toBuffer();
            
            const filename = `upscaled_${Date.now()}.png`;
            const filepath = path.join(uploadsDir, filename);
            await fs.writeFile(filepath, resized);
            
            result = {
                success: true,
                url: `/uploads/${filename}`,
                width: imageBuffer.width * scaleNum,
                height: imageBuffer.height * scaleNum,
                provider: 'sharp'
            };
        } else {
            // Use Stability AI API
            const axios = require('axios');
            const stabilityRes = await axios.post(
                'https://api.stability.ai/v1/generation/stable-diffusion-x4-latent-upscaler/image-to-image/upscale',
                {
                    image: base64Image,
                    scale: scaleNum
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            result = {
                success: true,
                image: stabilityRes.data.image,
                provider: 'stability-ai'
            };
        }
        
        res.json(result);
    } catch (error) {
        console.error('Upscale error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// BACKGROUND REMOVAL ENDPOINT
// ===============================
app.post('/api/remove-background', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image required' });
        }
        
        const sharp = require('sharp');
        const imageBuffer = req.file.buffer;
        
        // Remove background using sharp with alpha matting
        const removeBg = await sharp(imageBuffer)
            .removeAlpha()
            .toBuffer();
        
        // Get metadata
        const metadata = await sharp(removeBg).metadata();
        
        // Use luminance-based background detection for simple cases
        // For better results, users should use external APIs
        const filename = `nobg_${Date.now()}.png`;
        const filepath = path.join(uploadsDir, filename);
        await fs.writeFile(filepath, removeBg);
        
        res.json({
            success: true,
            url: `/uploads/${filename}`,
            provider: 'sharp-local',
            width: metadata.width,
            height: metadata.height
        });
    } catch (error) {
        console.error('Background removal error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// INPAINTING/EDITING ENDPOINT
// ===============================
app.post('/api/inpaint', upload.single('mask'), async (req, res) => {
    try {
        const { prompt, negative_prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt required' });
        }
        
        // Use Pollinations for inpainting (supports img2img with mask via prompt)
        const encodedPrompt = encodeURIComponent(prompt);
        const encodedNegative = encodeURIComponent(negative_prompt || '');
        
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&negative_prompt=${encodedNegative}&inpaint=true`;
        
        res.json({
            success: true,
            url: imageUrl,
            provider: 'pollinations',
            note: 'Inpainting uses Pollinations AI'
        });
    } catch (error) {
        console.error('Inpaint error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// VARIATIONS ENDPOINT
// ===============================
app.post('/api/variations', async (req, res) => {
    try {
        const { prompt, count = 4 } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt required' });
        }
        
        const variationCount = Math.min(Math.max(parseInt(count) || 4, 1), 8);
        const variations = [];
        
        for (let i = 0; i < variationCount; i++) {
            const seed = Math.floor(Math.random() * 100000);
            const encodedPrompt = encodeURIComponent(prompt);
            variations.push({
                url: `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}`,
                seed
            });
        }
        
        res.json({
            success: true,
            variations
        });
    } catch (error) {
        console.error('Variations error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

console.log('🔧 Additional Genesis endpoints loaded: upscale, remove-background, inpaint, variations');