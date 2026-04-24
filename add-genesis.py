import re

with open('/var/www/html/index.html', 'r') as f:
    content = f.read()

# Add Genesis window after store window or in content-windows div
genesis_window = '''<!-- GENESIS WINDOW -->
<div class="content-window" id="window-genesis" data-node="genesis">
    <div class="window-header">
        <div class="window-title">
            <span class="window-icon">✨</span>
            <span>GENESIS ENGINE</span>
        </div>
        <div class="window-controls">
            <button class="minimize-btn">−</button>
            <button class="maximize-btn">□</button>
            <button class="close-btn">×</button>
        </div>
    </div>
    <div class="window-content" style="padding:20px;">
        <h2 style="color:#00f3ff;">✨ AI Image Generation</h2>
        <p style="color:#8899a6;">20 free generations per day</p>
        <iframe src="AI_Image_Generator/client/index.html" style="width:100%;height:500px;border:none;"></iframe>
    </div>
</div>

</div>
</body>
</html>'''

# Replace the closing div/body/html at the end
content = re.sub(r'</div>\s*</body>\s*</html>', genesis_window, content)

with open('/var/www/html/index.html', 'w') as f:
    f.write(content)

print('Genesis window added')
