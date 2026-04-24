# 🚀 VERILYSOVEREIGN.ORG - DEPLOYMENT CHECKLIST
## Hostinger VPS (76.13.242.128) - 24-Hour Deployment Plan

---

## ✅ SYSTEM STATUS ASSESSMENT

### 🌐 SERAPHONIX SPHERE INTERFACE (Main Website)
**Status**: READY ✓
- Sphere with 6 nodes + center ✓
- Fire effects on nodes ✓
- 360° rotation working ✓
- All windows functional ✓

### 🎨 GENESIS ENGINE (AI Image Generator)
**Status**: NEEDS ATTENTION ⚠️
- Window opens correctly ✓
- **ISSUE**: Iframe points to `AI Image Generator/index.html`
- **FIX NEEDED**: Ensure capital folder projects are accessible
- **NOTE**: Current iframe loads from web site/ folder (may not have full capital content)

### 🛒 ATLANTIPLEX STORE  
**Status**: READY ✓
- Cart system working ✓
- Add to cart buttons functional ✓
- Product listings complete ✓
- Chat widget included ✓

### ⚙️ VPS MANAGER (Admin Panel)
**Status**: READY ✓ (Admin-only access)

---

## 🔧 CRITICAL FIXES NEEDED

### 1. **Genesis Engine Path Issue** ⚠️ HIGH PRIORITY
**Problem**: The Genesis window iframe points to local "AI Image Generator/index.html"
**Current Location**: `C:\Users\User\Desktop\web site\AI Image Generator\`
**Full Project**: `C:\Users\User\Desktop\capital\AI Image Generator\` (larger, more complete)

**Solution Options**:
A) Copy capital/AI Image Generator to web site/ folder (RECOMMENDED)
B) Update iframe path to relative reference
C) Deploy both folders and link properly

### 2. **Store Logo References** ⚠️ MEDIUM PRIORITY
**Problem**: Store page references logos that may not be found
**Files Referenced**:
- `../branding/sovereignVerilylogo - Copy - Copy.png`
- `../branding/Copilot_20260215_023027.png`

**Status**: These exist in branding/ folder ✓

### 3. **VPS Deployment Scripts** ⚠️ HIGH PRIORITY
**Location**: `chief vps mantinence officer/`
**Files Available**:
- deploy.sh ✓
- deploy-to-hostinger.sh ✓
- DEPLOY-TO-VPS.bat ✓
- Neural-Manager.bat ✓

---

## 📋 DEPLOYMENT STEPS (IN ORDER)

### Phase 1: Pre-Deployment (1-2 hours)

1. **Copy Capital Projects to Web Folder**
   ```bash
   # Copy AI Image Generator from capital to web site
   cp -r /capital/AI\ Image\ Generator/* /web\ site/AI\ Image\ Generator/
   
   # Verify file count increased
   ls -la /web\ site/AI\ Image\ Generator/
   ```

2. **Verify All File References**
   - Check all images load correctly
   - Test all iframes
   - Confirm no 404 errors in console

3. **Update Domain References**
   - Change any "localhost" to "verilysovereign.org"
   - Update API endpoints if needed
   - Check CORS settings

### Phase 2: VPS Setup (2-3 hours)

1. **SSH to VPS**
   ```bash
   ssh root@76.13.242.128
   # Password: Patriot8812#
   ```

2. **Install Dependencies**
   ```bash
   apt update && apt upgrade -y
   apt install -y nginx nodejs npm git docker.io docker-compose
   ```

3. **Upload Files**
   Options:
   - A) SCP from local: `scp -r web\ site/* root@76.13.242.128:/var/www/html/`
   - B) Git clone from repo (if pushed)
   - C) Use deployment scripts in `chief vps mantinence officer/`

4. **Configure Nginx**
   - Use provided nginx.conf from VPS folder
   - Set up SSL certificate (Let's Encrypt)
   - Configure reverse proxy for Node.js apps

### Phase 3: Application Setup (2-3 hours)

1. **Main Website (Static)**
   - Copy to /var/www/html/
   - Set permissions: `chmod -R 755 /var/www/html`
   - Test nginx configuration

2. **AI Image Generator (Node.js)**
   - Install dependencies: `npm install`
   - Create .env file with API keys
   - Start with PM2: `pm2 start server.js --name genesis`
   - Configure Nginx reverse proxy

3. **Store (Static + JS)**
   - Same as main website
   - Ensure cart persists (localStorage already used)
   - Test Stripe integration (if enabled)

### Phase 4: Testing (1 hour)

**Functional Tests**:
- [ ] Sphere loads and rotates
- [ ] Click all 7 nodes → windows open
- [ ] Genesis AI iframe loads
- [ ] Store iframe loads
- [ ] Add to cart works
- [ ] VPS admin login works
- [ ] Mobile responsive

**Performance Tests**:
- [ ] Page loads under 3 seconds
- [ ] 3D sphere 60fps
- [ ] No console errors

**Security Tests**:
- [ ] HTTPS working
- [ ] Admin panel password protected
- [ ] No exposed API keys in client code

---

## 📦 DEPLOYMENT PACKAGE STRUCTURE

```
/var/www/html/
├── index.html                 # Main sphere interface
├── styles.css                 # Main stylesheet
├── script.js                  # Sphere 3D logic
├── branding/                  # Brand assets
│   ├── *.png
│   └── *.md
├── AI Image Generator/        # Genesis Engine
│   ├── index.html
│   ├── server.js
│   ├── docker-compose.yml
│   └── neural-os/
├── store html/                 # Atlantiplex Store
│   ├── store.html
│   ├── script.js              # Cart functions
│   └── chat.js                # Chat widget
└── chief vps mantinence officer/  # Admin tools
```

---

## ⚠️ KNOWN ISSUES TO FIX

1. **Genesis Engine Incomplete** in web site/ folder
   - Solution: Copy from capital/ folder

2. **No Payment Gateway** currently configured
   - Store uses mock cart only
   - Need Stripe/PayPal integration for real sales

3. **No Backend Database**
   - All data is client-side (localStorage)
   - Need server persistence for production

4. **Missing SSL Certificate**
   - Required for HTTPS
   - Use Let's Encrypt

---

## 🎯 IMMEDIATE ACTION ITEMS

### BEFORE Deployment:
1. ✅ Fix Genesis Engine paths
2. ✅ Verify all images load
3. ✅ Test locally one more time
4. ✅ Push to GitHub (backup)

### DURING Deployment:
1. ⚙️ SSH to VPS
2. ⚙️ Upload files
3. ⚙️ Configure Nginx
4. ⚙️ Install SSL
5. ⚙️ Test live site

### AFTER Deployment:
1. 📊 Monitor logs
2. 🔄 Set up auto-restart (PM2)
3. 💾 Configure backups
4. 📧 Test email/contact form

---

## 📞 DEPLOYMENT COMMANDS (Quick Reference)

```bash
# 1. SSH to VPS
ssh root@76.13.242.128

# 2. Update system
apt update && apt upgrade -y

# 3. Install stack
apt install -y nginx nodejs npm certbot python3-certbot-nginx

# 4. Upload files (from local)
scp -r "web site"/* root@76.13.242.128:/var/www/html/

# 5. Set permissions
chmod -R 755 /var/www/html

# 6. Configure Nginx
cp /var/www/html/chief\ vps\ mantinence\ officer/nginx.conf /etc/nginx/sites-available/verilysovereign.org
ln -s /etc/nginx/sites-available/verilysovereign.org /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 7. SSL Certificate
certbot --nginx -d verilysovereign.org -d www.verilysovereign.org

# 8. Start Genesis Engine
pm2 start /var/www/html/AI\ Image\ Generator/server.js --name genesis
pm2 startup
pm2 save

# 9. Test
curl https://verilysovereign.org
```

---

## ✅ SUCCESS CRITERIA

Website is **READY FOR 24-HOUR DEPLOYMENT** when:
- ✅ All 7 sphere nodes functional
- ✅ Genesis AI loads properly
- ✅ Store cart works
- ✅ No console errors
- ✅ Mobile responsive
- ✅ HTTPS enabled
- ✅ Admin access secured

---

**Status**: WAITING FOR YOUR GO-AHEAD TO EXECUTE FIXES ⏳

Ready to proceed with the deployment preparation?
