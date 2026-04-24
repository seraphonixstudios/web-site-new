// Seraphonix Studios - Complete Neural Sphere Interface
// 360° Positionable 3D Sphere with Functional Node Network
// SECURITY FIXES: Removed hardcoded credentials, added event listener cleanup, z-index reset
// PERFORMANCE FIXES: Added resize debounce, Three.js resource cleanup, DOM removal

class SeraphonixSphere {
    constructor() {
        // MOBILE DETECTION
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphereGroup = null;
        this.nodesContainer = null;
        
        // State
        this.nodes = [];
        this.nodeMeshes = [];
        this.connections = [];
        this.dataParticles = [];
        this.isDragging = false;
        this.isHoveringNode = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotationSpeed = { x: 0.002, y: 0.003 };
        this.targetRotationSpeed = { x: 0.002, y: 0.003 };
        this.zoom = 12;
        this.targetZoom = 12;
        
        // Raycasting
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Windows
        this.activeWindow = null;
        this.windowPositions = {};
        this.windowZIndex = 300;
        this.isAdmin = false;
        
        // Cart for store
        this.cart = [];
        
        // Node definitions
        this.nodeData = [
            { 
                id: 'central', 
                name: 'SERAPHONIX', 
                color: 0x00D4FF, 
                size: 1.2, 
                isCentral: true,
                description: 'Main hub and introduction'
            },
            { 
                id: 'navigation', 
                name: 'NAVIGATION', 
                color: 0x7000FF, 
                size: 0.5,
                description: 'Network map and quick links'
            },
            { 
                id: 'lore', 
                name: 'LORE', 
                color: 0xFF006E, 
                size: 0.5,
                description: 'Origin story and mythology'
            },
            { 
                id: 'brand', 
                name: 'BRAND', 
                color: 0xFFB800, 
                size: 0.5,
                description: 'Identity, colors, typography'
            },
            { 
                id: 'genesis', 
                name: 'GENESIS', 
                color: 0xFF006E, 
                size: 0.5,
                description: 'AI Image Generation Engine'
            },
            { 
                id: 'store', 
                name: 'STORE', 
                color: 0x00FF88, 
                size: 0.5,
                description: 'Atlantiplex Digital Marketplace'
            },
            { 
                id: 'vps', 
                name: 'VPS', 
                color: 0xFF3333, 
                size: 0.5,
                description: 'Server management (Admin)',
                adminOnly: true
            }
        ];
        
        this.init();
    }
    
    init() {
        // Mobile detection (backup)
        if (!this.isMobile) {
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        }
        
        // Reduce rendering on mobile
        if (this.isMobile) {
            this.zoom = 18;
            console.log('Seraphonix: Mobile mode - reduced rendering');
        }
        
        // EMERGENCY: Always hide loading screen after max 5 seconds
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen && loadingScreen.parentNode) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    if (loadingScreen && loadingScreen.parentNode) {
                        loadingScreen.remove();
                    }
                }, 600);
            }
        }, 5000);
        
        try {
            this.setupScene();
            if (!this.renderer) {
                console.error('Seraphonix: WebGL initialization failed.');
                this.showFallback();
                return;
            }
            this.createSphere();
            this.createNodes();
            this.createConnections();
            this.createDataParticles();
            this.setupLighting();
            this.setupEvents();
            this.setupUI();
            this.startAnimationLoop();
            this.startClock();
            this.checkExistingAuth();
            console.log('Seraphonix: Initialization complete.');
            
            // Hide loading screen
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        if (loadingScreen && loadingScreen.parentNode) {
                            loadingScreen.remove();
                        }
                    }, 600);
                }
            }, 2500);
        } catch (error) {
            console.error('Seraphonix: Initialization error:', error);
            this.showFallback();
        }
    }
    
    showFallback() {
        const fallback = document.createElement('div');
        fallback.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #050508;
            color: #fff;
            font-family: 'Rajdhani', sans-serif;
            text-align: center;
            z-index: 10000;
            padding: 20px;
        `;
        fallback.innerHTML = `
            <div>
                <h1 style="font-size: 2rem; margin-bottom: 20px; color: #00D4FF;">SERAPHONIX UNAVAILABLE</h1>
                <p style="font-size: 1rem; color: rgba(255,255,255,0.8); max-width: 500px;">
                    Your browser does not support WebGL 3D graphics, or hardware acceleration is disabled.
                    Please enable hardware acceleration, update your browser, or try a modern browser like Chrome, Firefox, or Safari.
                </p>
            </div>
        `;
        document.body.appendChild(fallback);
    }
    
    setupScene() {
        try {
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x050508);
            this.scene.fog = new THREE.FogExp2(0x050508, 0.02);
            
            // Camera
            this.camera = new THREE.PerspectiveCamera(
                60,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.z = this.zoom;
            
            // Get canvas
            const canvas = document.getElementById('sphere-canvas');
            if (!canvas) {
                console.error('Seraphonix: Canvas element not found!');
                return;
            }
            
            // Renderer with error handling
            try {
                this.renderer = new THREE.WebGLRenderer({
                    canvas: canvas,
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance'
                });
            } catch (e) {
                console.error('Seraphonix: WebGL not supported:', e);
                this.renderer = null;
                return;
            }
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setClearColor(0x050508);
            
            // Starfield background
            this.createStarfield();
        } catch (error) {
            console.error('Seraphonix: Scene setup error:', error);
            this.renderer = null;
        }
    }
    
    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = this.isMobile ? 200 : 2000;
        const posArray = new Float32Array(starsCount * 3);
        const colorArray = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount; i++) {
            const i3 = i * 3;
            // Position
            posArray[i3] = (Math.random() - 0.5) * 200;
            posArray[i3 + 1] = (Math.random() - 0.5) * 200;
            posArray[i3 + 2] = (Math.random() - 0.5) * 200;
            
            // Color (cyan/blue/white)
            const colorType = Math.random();
            if (colorType < 0.3) {
                colorArray[i3] = 0;
                colorArray[i3 + 1] = 0.83;
                colorArray[i3 + 2] = 1;
            } else if (colorType < 0.6) {
                colorArray[i3] = 0.44;
                colorArray[i3 + 1] = 0;
                colorArray[i3 + 2] = 1;
            } else {
                colorArray[i3] = 1;
                colorArray[i3 + 1] = 1;
                colorArray[i3 + 2] = 1;
            }
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starsMesh);
    }
    
    createSphere() {
        // Main sphere group - everything rotates together
        this.sphereGroup = new THREE.Group();
        this.scene.add(this.sphereGroup);
        
        // Create the Seraph visual elements
        this.createSeraphWings();
        this.createSeraphEyes();
        this.createLightRays();
        
        // Outer wireframe sphere - the "aura"
        const outerGeo = new THREE.IcosahedronGeometry(4, 1);
        const outerWireframe = new THREE.WireframeGeometry(outerGeo);
        const outerMaterial = new THREE.LineBasicMaterial({
            color: 0x00D4FF,
            transparent: true,
            opacity: 0.08
        });
        const outerSphere = new THREE.LineSegments(outerWireframe, outerMaterial);
        this.sphereGroup.add(outerSphere);
        
        // Inner sanctum sphere
        const innerGeo = new THREE.IcosahedronGeometry(2.5, 1);
        const innerWireframe = new THREE.WireframeGeometry(innerGeo);
        const innerMaterial = new THREE.LineBasicMaterial({
            color: 0xFFB800,
            transparent: true,
            opacity: 0.1
        });
        const innerSphere = new THREE.LineSegments(innerWireframe, innerMaterial);
        this.sphereGroup.add(innerSphere);
        
        // Ethereal glow shell
        const glowGeo = new THREE.IcosahedronGeometry(4.2, 1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00D4FF,
            transparent: true,
            opacity: 0.015,
            side: THREE.BackSide
        });
        const glowSphere = new THREE.Mesh(glowGeo, glowMaterial);
        this.sphereGroup.add(glowSphere);
        
        // Nodes container - rotates with sphere
        this.nodesContainer = new THREE.Group();
        this.sphereGroup.add(this.nodesContainer);
        
        // Sacred rings (orbital paths)
        this.createSacredRings();
    }
    
    createSeraphWings() {
        const wingConfigs = [
            { color: 0x00D4FF, angle: 0, name: 'Design' },
            { color: 0x7000FF, angle: 60, name: 'Development' }, 
            { color: 0xFF006E, angle: 120, name: 'AI' },
            { color: 0x00FF88, angle: 180, name: 'Infrastructure' },
            { color: 0xFFB800, angle: 240, name: 'Commerce' },
            { color: 0xFF3333, angle: 300, name: 'Story' }
        ];
        
        this.seraphWings = [];
        
        wingConfigs.forEach((config, index) => {
            const wingGroup = new THREE.Group();
            
            const wingGeo = new THREE.CylinderGeometry(0.02, 0.08, 6, 8);
            const wingMat = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.3
            });
            const wing = new THREE.Mesh(wingGeo, wingMat);
            
            const angleRad = (config.angle * Math.PI) / 180;
            wing.position.x = Math.cos(angleRad) * 3;
            wing.position.y = Math.sin(angleRad) * 0.5;
            wing.position.z = Math.sin(angleRad) * 3;
            
            wing.lookAt(0, 0, 0);
            wing.rotateX(Math.PI / 2);
            
            const glowGeo = new THREE.CylinderGeometry(0.05, 0.15, 6, 8);
            const glowMat = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.1
            });
            const wingGlow = new THREE.Mesh(glowGeo, glowMat);
            wingGlow.position.copy(wing.position);
            wingGlow.rotation.copy(wing.rotation);
            
            const tipGeo = new THREE.SphereGeometry(0.15, 16, 16);
            const tipMat = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.6
            });
            const wingTip = new THREE.Mesh(tipGeo, tipMat);
            wingTip.position.x = Math.cos(angleRad) * 6;
            wingTip.position.y = Math.sin(angleRad) * 0.5;
            wingTip.position.z = Math.sin(angleRad) * 6;
            
            wingGroup.add(wing);
            wingGroup.add(wingGlow);
            wingGroup.add(wingTip);
            
            wingGroup.userData = {
                name: config.name,
                angle: config.angle,
                pulsePhase: index * 0.5
            };
            
            this.sphereGroup.add(wingGroup);
            this.seraphWings.push(wingGroup);
        });
    }
    
    createSeraphEyes() {
        const eyeCount = 12;
        this.seraphEyes = [];
        
        for (let i = 0; i < eyeCount; i++) {
            const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
            const eyeMat = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            
            const angle = (i / eyeCount) * Math.PI * 2;
            const radius = 5 + Math.random() * 1.5;
            const height = (Math.random() - 0.5) * 3;
            
            eye.position.x = Math.cos(angle) * radius;
            eye.position.y = height;
            eye.position.z = Math.sin(angle) * radius;
            
            eye.userData = {
                basePosition: eye.position.clone(),
                orbitAngle: angle,
                orbitRadius: radius,
                orbitSpeed: 0.002 + Math.random() * 0.003,
                pulsePhase: Math.random() * Math.PI * 2
            };
            
            const eyeGlowGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const eyeGlowMat = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.2
            });
            const eyeGlow = new THREE.Mesh(eyeGlowGeo, eyeGlowMat);
            eye.add(eyeGlow);
            
            this.sphereGroup.add(eye);
            this.seraphEyes.push(eye);
        }
    }
    
    createLightRays() {
        const rayCount = 24;
        this.lightRays = [];
        
        for (let i = 0; i < rayCount; i++) {
            const rayGeo = new THREE.CylinderGeometry(0.005, 0.02, 8, 4);
            const rayMat = new THREE.MeshBasicMaterial({
                color: 0x00D4FF,
                transparent: true,
                opacity: 0.15
            });
            const ray = new THREE.Mesh(rayGeo, rayMat);
            
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            
            ray.position.x = Math.sin(theta) * Math.cos(phi) * 4;
            ray.position.y = Math.sin(theta) * Math.sin(phi) * 4;
            ray.position.z = Math.cos(theta) * 4;
            
            ray.lookAt(0, 0, 0);
            ray.rotateX(Math.PI / 2);
            
            ray.userData = {
                pulsePhase: Math.random() * Math.PI * 2,
                baseOpacity: 0.15
            };
            
            this.sphereGroup.add(ray);
            this.lightRays.push(ray);
        }
    }
    
    createSacredRings() {
        this.orbitalRings = [];
        const ringConfigs = [
            { radius: 5.5, color: 0x7000FF, speed: 0.002, rotation: { x: 0.5, y: 0.3 } },
            { radius: 6.5, color: 0xFF006E, speed: -0.0015, rotation: { x: 1.2, y: 0.7 } },
            { radius: 7.5, color: 0x00FF88, speed: 0.001, rotation: { x: 0.8, y: 1.2 } }
        ];
        
        ringConfigs.forEach(config => {
            const ringGeo = new THREE.TorusGeometry(config.radius, 0.02, 16, 100);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.2
            });
            const ring = new THREE.Mesh(ringGeo, ringMaterial);
            ring.rotation.x = config.rotation.x;
            ring.rotation.y = config.rotation.y;
            ring.userData = { rotationSpeed: config.speed };
            this.scene.add(ring);
            this.orbitalRings.push(ring);
        });
    }
    
    createNodes() {
        this.nodeData.forEach((node, index) => {
            let position;
            
            if (node.isCentral) {
                position = new THREE.Vector3(0, 0, 0);
            } else {
                const phi = Math.acos(-1 + (2 * index) / this.nodeData.length);
                const theta = Math.sqrt(this.nodeData.length * Math.PI) * phi;
                const radius = 2.8;
                
                position = new THREE.Vector3(
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.sin(theta) * Math.sin(phi),
                    radius * Math.cos(phi)
                );
            }
            
            const nodeGroup = new THREE.Group();
            nodeGroup.position.copy(position);
            
            const geometry = new THREE.SphereGeometry(node.size, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: node.color,
                emissive: node.color,
                emissiveIntensity: 0.4,
                shininess: 100,
                specular: 0xffffff
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            nodeGroup.add(mesh);
            
            const glowGeo = new THREE.SphereGeometry(node.size * 2, 32, 32);
            const glowMat = new THREE.MeshBasicMaterial({
                color: node.color,
                transparent: true,
                opacity: node.isCentral ? 0.2 : 0.1,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            nodeGroup.add(glow);
            
            mesh.userData = {
                id: node.id,
                originalScale: node.size,
                isCentral: node.isCentral || false,
                adminOnly: node.adminOnly || false,
                pulsePhase: Math.random() * Math.PI * 2,
                originalPosition: position.clone(),
                nodeGroup: nodeGroup,
                mainMesh: mesh,
                glowMesh: glow
            };
            
            this.nodesContainer.add(nodeGroup);
            this.nodeMeshes.push(mesh);
            
            this.createNodeFire(nodeGroup, node.color, node.isCentral);
            
            this.createNodeLabel(node);
        });
    }
    
    createNodeFire(nodeGroup, color, isCentral) {
        const particleCount = isCentral ? 20 : 8;
        
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.6 + Math.random() * 0.4;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            
            const fireType = Math.random();
            if (fireType < 0.5) {
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.6;
                colors[i * 3 + 2] = 0.0;
            } else {
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.9;
                colors[i * 3 + 2] = 0.2;
            }
        }
        
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMat = new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const fireSystem = new THREE.Points(particleGeo, particleMat);
        nodeGroup.add(fireSystem);
        
        nodeGroup.userData.fire = {
            system: fireSystem,
            positions: positions,
            velocities: Array(particleCount).fill().map(() => ({
                y: 0.008 + Math.random() * 0.008,
                x: (Math.random() - 0.5) * 0.003,
                z: (Math.random() - 0.5) * 0.003
            })),
            basePositions: [...positions]
        };
    }
    
    createNodeLabel(node) {
        const label = document.createElement('div');
        label.className = 'node-label';
        label.textContent = node.name;
        label.id = `label-${node.id}`;
        if (node.adminOnly) {
            label.classList.add('admin-label');
        }
        document.getElementById('node-labels').appendChild(label);
        
        this.nodes.push({
            id: node.id,
            mesh: this.nodeMeshes[this.nodeMeshes.length - 1],
            label: label,
            data: node
        });
    }
    
    createConnections() {
        const centralNode = this.nodeMeshes[0];
        
        for (let i = 1; i < this.nodeMeshes.length; i++) {
            this.createConnectionLine(centralNode, this.nodeMeshes[i], 0x00D4FF, 0.15);
        }
        
        for (let i = 1; i < this.nodeMeshes.length - 1; i++) {
            for (let j = i + 1; j < this.nodeMeshes.length; j++) {
                if (Math.random() > 0.6) {
                    this.createConnectionLine(
                        this.nodeMeshes[i], 
                        this.nodeMeshes[j], 
                        0x7000FF, 
                        0.06
                    );
                }
            }
        }
    }
    
    createConnectionLine(nodeA, nodeB, color, opacity) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });
        
        const line = new THREE.Line(geometry, material);
        this.nodesContainer.add(line);
        
        this.connections.push({
            line: line,
            startNode: nodeA,
            endNode: nodeB
        });
    }
    
    createDataParticles() {
        const particleGeo = new THREE.SphereGeometry(0.06, 8, 8);
        
        const particleLimit = this.isMobile ? 5 : 20;
        for (let i = 0; i < particleLimit; i++) {
            const particleMat = new THREE.MeshBasicMaterial({
                color: 0x00D4FF,
                transparent: true,
                opacity: 0.9
            });
            
            const particle = new THREE.Mesh(particleGeo, particleMat);
            
            const connectionIndex = Math.floor(Math.random() * this.connections.length);
            const connection = this.connections[connectionIndex];
            
            if (connection) {
                particle.userData = {
                    connection: connection,
                    progress: Math.random(),
                    speed: 0.003 + Math.random() * 0.005
                };
                
                this.nodesContainer.add(particle);
                this.dataParticles.push(particle);
            }
        }
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        this.scene.add(ambientLight);
        
        const pointLight1 = new THREE.PointLight(0x00D4FF, 1.5, 50);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x7000FF, 1.5, 50);
        pointLight2.position.set(-10, -10, 10);
        this.scene.add(pointLight2);
        
        const pointLight3 = new THREE.PointLight(0xFF006E, 1, 50);
        pointLight3.position.set(0, 10, -10);
        this.scene.add(pointLight3);
    }
    
    setupEvents() {
        const canvas = document.getElementById('sphere-canvas');
        
        // FIX 9: Debounce resize to prevent excessive re-renders
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.onResize(), 150);
        }, false);
        
        // Track drag start position to distinguish clicks from drags
        this.dragStartPosition = { x: 0, y: 0 };
        this.hasDragged = false;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isDragging = true;
                this.hasDragged = false;
                this.dragStartPosition = { x: e.clientX, y: e.clientY };
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
                canvas.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            if (this.isDragging) {
                const deltaX = e.clientX - this.previousMousePosition.x;
                const deltaY = e.clientY - this.previousMousePosition.y;
                
                // Mark as dragged if moved more than 5 pixels
                const totalDeltaX = Math.abs(e.clientX - this.dragStartPosition.x);
                const totalDeltaY = Math.abs(e.clientY - this.dragStartPosition.y);
                if (totalDeltaX > 5 || totalDeltaY > 5) {
                    this.hasDragged = true;
                }
                
                this.sphereGroup.rotation.y += deltaX * 0.008;
                this.sphereGroup.rotation.x += deltaY * 0.008;
                
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
            
            this.checkNodeIntersection();
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('click', (e) => {
            // Only handle click if it wasn't a drag
            if (!this.hasDragged) {
                this.handleNodeClick();
            }
            this.hasDragged = false;
        });
        
        canvas.addEventListener('dblclick', () => {
            this.resetView();
        });
        
        // Touch events for mobile support
        this.touchState = {
            isTouching: false,
            touchStartX: 0,
            touchStartY: 0,
            previousTouchX: 0,
            previousTouchY: 0,
            lastTouchDistance: 0,
            touchStartTime: 0
        };
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.touchState.isTouching = true;
                this.touchState.touchStartX = e.touches[0].clientX;
                this.touchState.touchStartY = e.touches[0].clientY;
                this.touchState.previousTouchX = e.touches[0].clientX;
                this.touchState.previousTouchY = e.touches[0].clientY;
                this.touchState.touchStartTime = Date.now();
                this.hasDragged = false;
                canvas.style.cursor = 'grabbing';
            } else if (e.touches.length === 2) {
                // Pinch zoom
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                this.touchState.lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && this.touchState.isTouching) {
                const touch = e.touches[0];
                
                // Update mouse for raycasting
                this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
                
                const deltaX = touch.clientX - this.touchState.previousTouchX;
                const deltaY = touch.clientY - this.touchState.previousTouchY;
                
                // Check if actually dragged (not just a tap)
                const totalDeltaX = Math.abs(touch.clientX - this.touchState.touchStartX);
                const totalDeltaY = Math.abs(touch.clientY - this.touchState.touchStartY);
                if (totalDeltaX > 10 || totalDeltaY > 10) {
                    this.hasDragged = true;
                }
                
                // Rotate sphere
                const sensitivity = window.innerWidth < 768 ? 0.012 : 0.008;
                this.sphereGroup.rotation.y += deltaX * sensitivity;
                this.sphereGroup.rotation.x += deltaY * sensitivity;
                
                this.touchState.previousTouchX = touch.clientX;
                this.touchState.previousTouchY = touch.clientY;
                
                this.checkNodeIntersection();
                
            } else if (e.touches.length === 2) {
                // Pinch zoom
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                
                if (this.touchState.lastTouchDistance > 0) {
                    const scale = currentDistance / this.touchState.lastTouchDistance;
                    this.targetZoom = Math.max(5, Math.min(30, this.targetZoom / scale));
                }
                this.touchState.lastTouchDistance = currentDistance;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                this.touchState.isTouching = false;
                canvas.style.cursor = 'grab';
                
                // Update mouse position for touch end
                if (e.changedTouches.length > 0) {
                    const touch = e.changedTouches[0];
                    this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                    this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
                }
                
                const touchDuration = Date.now() - this.touchState.touchStartTime;
                
                // If short duration and didn't drag much, treat as tap/click
                if (touchDuration < 400 && !this.hasDragged) {
                    this.checkNodeIntersection();
                    this.handleNodeClick();
                }
                this.hasDragged = false;
            }
            this.touchState.lastTouchDistance = 0;
        });
        
        // Also add regular click for mobile
        canvas.addEventListener('click', () => {
            this.checkNodeIntersection();
            this.handleNodeClick();
        });
        
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                this.targetZoom = 50 / (value / 100) + 2;
                console.log('Seraphonix: Zoom level changed to', this.targetZoom);
            });
        }
        
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                this.targetRotationSpeed.x = value / 5000;
                this.targetRotationSpeed.y = value / 5000;
                console.log('Seraphonix: Rotation speed changed to', value);
            });
        }
        
        const resetBtn = document.getElementById('reset-view');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetView();
                console.log('Seraphonix: View reset');
            });
        }
        
        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showVPSAuth();
            });
        }
    }
    
    checkNodeIntersection() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
        const canvas = document.getElementById('sphere-canvas');
        
        this.nodeMeshes.forEach(mesh => {
            if (!mesh.userData.isHovered) {
                const nodeGroup = mesh.userData.nodeGroup;
                if (nodeGroup) {
                    nodeGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                }
            }
        });
        
        document.querySelectorAll('.node-label').forEach(label => {
            label.classList.remove('visible');
        });
        
        this.isHoveringNode = false;
        
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            this.isHoveringNode = true;
            
            const nodeGroup = mesh.userData.nodeGroup;
            if (nodeGroup) {
                nodeGroup.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.2);
            }
            mesh.userData.isHovered = true;
            
            const node = this.nodes.find(n => n.mesh === mesh);
            if (node) {
                node.label.classList.add('visible');
            }
            
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = this.isDragging ? 'grabbing' : 'grab';
            
            this.nodeMeshes.forEach(mesh => {
                mesh.userData.isHovered = false;
            });
        }
    }
    
    handleNodeClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
        
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const nodeId = mesh.userData.id;
            
            if (mesh.userData.adminOnly && !this.isAdmin) {
                this.showVPSAuth();
                return;
            }
            
            this.openWindow(nodeId);
            
            const nodeGroup = mesh.userData.nodeGroup;
            if (nodeGroup) {
                nodeGroup.scale.setScalar(1.3);
                setTimeout(() => {
                    nodeGroup.scale.setScalar(1.0);
                }, 200);
            }
        }
    }
    
    resetView() {
        if (this.sphereGroup) {
            gsap.to(this.sphereGroup.rotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: 'power2.out'
            });
        }
        
        this.targetZoom = 12;
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) zoomSlider.value = 100;
    }
    
    updateConnections() {
        this.connections.forEach(conn => {
            const positions = conn.line.geometry.attributes.position.array;
            positions[0] = conn.startNode.position.x;
            positions[1] = conn.startNode.position.y;
            positions[2] = conn.startNode.position.z;
            positions[3] = conn.endNode.position.x;
            positions[4] = conn.endNode.position.y;
            positions[5] = conn.endNode.position.z;
            conn.line.geometry.attributes.position.needsUpdate = true;
        });
    }
    
    updateNodeLabels() {
        this.nodes.forEach(node => {
            if (node.data.adminOnly && !this.isAdmin) {
                node.label.style.display = 'none';
                return;
            }
            node.label.style.display = 'block';
            
            const vector = new THREE.Vector3();
            node.mesh.getWorldPosition(vector);
            
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            const nodeDirection = vector.clone().sub(this.camera.position).normalize();
            const dot = cameraDirection.dot(nodeDirection);
            const isBehind = dot < -0.2;
            
            vector.project(this.camera);
            
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
            
            node.label.style.left = `${x}px`;
            node.label.style.top = `${y + 35}px`;
            node.label.style.opacity = isBehind ? '0.15' : '1';
            node.label.style.zIndex = isBehind ? '1' : '60';
        });
    }
    
    updateDataParticles() {
        this.dataParticles.forEach(particle => {
            const data = particle.userData;
            data.progress += data.speed;
            
            if (data.progress >= 1) {
                data.progress = 0;
            }
            
            const startPos = data.connection.startNode.position;
            const endPos = data.connection.endNode.position;
            
            particle.position.lerpVectors(startPos, endPos, data.progress);
            
            particle.material.opacity = Math.sin(data.progress * Math.PI) * 0.8;
        });
    }
    
    startAnimationLoop() {
        const animate = () => {
            try {
                requestAnimationFrame(animate);
                
                this.rotationSpeed.x += (this.targetRotationSpeed.x - this.rotationSpeed.x) * 0.05;
                this.rotationSpeed.y += (this.targetRotationSpeed.y - this.rotationSpeed.y) * 0.05;
                
                this.sphereGroup.rotation.y += this.rotationSpeed.y;
                this.sphereGroup.rotation.x += this.rotationSpeed.x * 0.5;
                
                this.orbitalRings.forEach(ring => {
                    ring.rotation.x += ring.userData.rotationSpeed;
                    ring.rotation.y += ring.userData.rotationSpeed * 0.5;
                });
                
                this.nodesContainer.rotation.y -= this.rotationSpeed.y * 0.3;
                
                const time = Date.now() * 0.001;
                
                if (this.seraphWings) {
                    this.seraphWings.forEach((wingGroup, index) => {
                        const pulse = Math.sin(time * 0.5 + wingGroup.userData.pulsePhase) * 0.08 + 1;
                        wingGroup.scale.setScalar(pulse);
                        
                        wingGroup.rotation.z = Math.sin(time + index) * 0.03;
                    });
                }
                
                if (this.seraphEyes) {
                    this.seraphEyes.forEach(eye => {
                        const data = eye.userData;
                        
                        data.orbitAngle += data.orbitSpeed;
                        eye.position.x = Math.cos(data.orbitAngle) * data.orbitRadius;
                        eye.position.z = Math.sin(data.orbitAngle) * data.orbitRadius;
                        
                        eye.position.y = data.basePosition.y + Math.sin(time + data.pulsePhase) * 0.3;
                        
                        const eyePulse = Math.sin(time * 2 + data.pulsePhase) * 0.2 + 0.8;
                        eye.material.opacity = eyePulse;
                        eye.children[0].material.opacity = eyePulse * 0.2;
                    });
                }
                
                if (this.lightRays) {
                    this.lightRays.forEach((ray, index) => {
                        const pulse = Math.sin(time * 0.3 + ray.userData.pulsePhase) * 0.1 + 1;
                        ray.material.opacity = ray.userData.baseOpacity * pulse;
                    });
                }
                
                this.nodeMeshes.forEach((mesh) => {
                    const pulseData = mesh.userData;
                    const glowMesh = pulseData.glowMesh;
                    
                    if (glowMesh) {
                        const pulse = Math.sin(time + pulseData.pulsePhase) * 0.1 + 1;
                        glowMesh.scale.setScalar(pulse);
                    }
                    
                    const nodeGroup = pulseData.nodeGroup;
                    if (nodeGroup && nodeGroup.userData.fire) {
                        const fire = nodeGroup.userData.fire;
                        const positions = fire.system.geometry.attributes.position.array;
                        
                        for (let i = 0; i < fire.velocities.length; i++) {
                            const vel = fire.velocities[i];
                            
                            positions[i * 3 + 1] += vel.y;
                            positions[i * 3] += vel.x + Math.sin(time + i) * 0.002;
                            positions[i * 3 + 2] += vel.z + Math.cos(time + i) * 0.002;
                            
                            if (positions[i * 3 + 1] > 0.8) {
                                positions[i * 3 + 1] = -0.4;
                                positions[i * 3] = fire.basePositions[i * 3];
                                positions[i * 3 + 2] = fire.basePositions[i * 3 + 2];
                            }
                        }
                        
                        fire.system.geometry.attributes.position.needsUpdate = true;
                    }
                });
                
                this.zoom += (this.targetZoom - this.zoom) * 0.1;
                this.camera.position.z = this.zoom;
                
                this.updateConnections();
                
                this.updateDataParticles();
                
                this.updateNodeLabels();
                
                this.updateHUD();
                
                if (this.renderer && this.scene && this.camera) {
                    this.renderer.render(this.scene, this.camera);
                }
            } catch (error) {
                console.error('Seraphonix: Animation loop error:', error);
            }
        };
        
        animate();
    }
    
    updateHUD() {
        const coordX = document.getElementById('coord-x');
        const coordY = document.getElementById('coord-y');
        const coordZ = document.getElementById('coord-z');
        
        if (coordX) coordX.textContent = this.sphereGroup.rotation.x.toFixed(2);
        if (coordY) coordY.textContent = this.sphereGroup.rotation.y.toFixed(2);
        if (coordZ) coordZ.textContent = this.sphereGroup.rotation.z.toFixed(2);
    }
    
    startClock() {
        const updateClock = () => {
            const clockEl = document.getElementById('clock');
            if (clockEl) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                clockEl.textContent = timeString;
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    // FIX 5: Clean up Three.js resources on resize and null checks
    onResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            try {
                const target = this.renderer.getRenderTarget();
                if (target) {
                    target.dispose();
                    console.log('Seraphonix: Disposed render target on resize');
                }
            } catch (e) {
                console.warn('Seraphonix: Render target cleanup warning:', e);
            }
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    setupUI() {
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const windowEl = e.target.closest('.content-window');
                if (windowEl) {
                    const nodeId = windowEl.dataset.node;
                    this.closeWindow(nodeId);
                }
            });
        });
        
        document.querySelectorAll('.minimize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const windowEl = e.target.closest('.content-window');
                if (windowEl) windowEl.classList.toggle('minimized');
            });
        });
        
        document.querySelectorAll('.maximize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const windowEl = e.target.closest('.content-window');
                if (windowEl) windowEl.classList.toggle('maximized');
            });
        });
        
        let draggedWindow = null;
        let dragOffset = { x: 0, y: 0 };
        
        document.querySelectorAll('.window-header').forEach(header => {
            header.addEventListener('mousedown', (e) => {
                if (e.target.closest('.window-controls')) return;
                
                draggedWindow = header.closest('.content-window');
                this.focusWindow(draggedWindow);
                
                const rect = draggedWindow.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
            });
        });
        
        document.addEventListener('mousemove', (e) => {
            if (draggedWindow && !draggedWindow.classList.contains('maximized')) {
                draggedWindow.style.left = `${e.clientX - dragOffset.x}px`;
                draggedWindow.style.top = `${e.clientY - dragOffset.y}px`;
                
                const nodeId = draggedWindow.dataset.node;
                this.windowPositions[nodeId] = {
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                };
            }
        });
        
        document.addEventListener('mouseup', () => {
            draggedWindow = null;
        });
        
        document.querySelectorAll('.quick-link, .nav-item, .nav-link-node').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = link.dataset.target;
                if (target) {
                    if (target === 'vps' && !this.isAdmin) {
                        this.showVPSAuth();
                        return;
                    }
                    this.openWindow(target);
                    console.log('Seraphonix: Opened window:', target);
                }
            });
        });
        
        this.setupLoreNavigation();
        this.setupBrandTabs();
        this.setupStoreCategories();
        this.setupStoreCart();
        this.setupAdminAuth();
        this.setupWaitlistForm();
    }
    
    openWindow(nodeId) {
        const windowEl = document.getElementById(`window-${nodeId}`);
        if (!windowEl) {
            console.warn('Seraphonix: Window not found for node:', nodeId);
            return;
        }
        
        if (windowEl.classList.contains('active')) {
            this.focusWindow(windowEl);
            return;
        }
        
        if (!this.windowPositions[nodeId]) {
            const offset = Object.keys(this.windowPositions).length * 40;
            this.windowPositions[nodeId] = {
                x: 80 + offset,
                y: 60 + offset
            };
        }
        
        windowEl.style.left = `${this.windowPositions[nodeId].x}px`;
        windowEl.style.top = `${this.windowPositions[nodeId].y}px`;
        
        windowEl.classList.add('active');
        this.focusWindow(windowEl);
    }
    
    // FIX 6: Clean up event listeners on window close
    closeWindow(nodeId) {
        const windowEl = document.getElementById(`window-${nodeId}`);
        if (windowEl) {
            // Clean up event listeners to prevent memory leaks
            windowEl.querySelectorAll('button, input, select, textarea').forEach(el => {
                const clone = el.cloneNode(true);
                if (el.parentNode) {
                    el.parentNode.replaceChild(clone, el);
                }
            });
            
            windowEl.classList.remove('active', 'maximized');
            delete this.windowPositions[nodeId];
            console.log('Seraphonix: Closed window:', nodeId);
        }
    }
    
    // FIX 3: Z-index cap and reset mechanism
    focusWindow(windowEl) {
        if (this.windowZIndex > 2147483547) {
            this.resetZIndices();
            return;
        }
        this.windowZIndex++;
        windowEl.style.zIndex = this.windowZIndex;
        this.activeWindow = windowEl;
    }
    
    resetZIndices() {
        let index = 300;
        const windows = document.querySelectorAll('.content-window.active');
        windows.forEach(w => {
            w.style.zIndex = index++;
        });
        this.windowZIndex = index;
        console.log('Seraphonix: Z-indices reset to prevent overflow');
    }
    
    showVPSAuth() {
        const vpsWindow = document.getElementById('window-vps');
        if (!vpsWindow) {
            console.warn('Seraphonix: VPS window not found');
            return;
        }
        
        vpsWindow.classList.add('active');
        this.focusWindow(vpsWindow);
        
        if (!this.isAdmin) {
            const authOverlay = document.getElementById('vps-auth');
            if (authOverlay) authOverlay.classList.remove('hidden');
            
            const passwordInput = document.getElementById('admin-password');
            if (passwordInput) passwordInput.focus();
        }
    }
    
    setupLoreNavigation() {
        let currentChapter = 1;
        const totalChapters = 3;
        
        const updateChapter = (newChapter) => {
            const oldChapter = document.querySelector(`.chapter[data-chapter="${currentChapter}"]`);
            if (oldChapter) oldChapter.classList.remove('active');
            
            currentChapter = newChapter;
            
            const newChapterEl = document.querySelector(`.chapter[data-chapter="${currentChapter}"]`);
            if (newChapterEl) newChapterEl.classList.add('active');
            
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            
            if (prevBtn) prevBtn.disabled = currentChapter === 1;
            if (nextBtn) nextBtn.disabled = currentChapter === totalChapters;
            
            document.querySelectorAll('.chapter-dots .dot').forEach((dot, idx) => {
                dot.classList.toggle('active', idx + 1 === currentChapter);
            });
            console.log('Seraphonix: Lore chapter changed to', currentChapter);
        };
        
        const nextBtn = document.querySelector('.next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentChapter < totalChapters) {
                    updateChapter(currentChapter + 1);
                }
            });
        }
        
        const prevBtn = document.querySelector('.prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentChapter > 1) {
                    updateChapter(currentChapter - 1);
                }
            });
        }
        
        document.querySelectorAll('.chapter-dots .dot').forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                updateChapter(idx + 1);
            });
        });
    }
    
    setupBrandTabs() {
        document.querySelectorAll('.brand-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                document.querySelectorAll('.brand-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.brand-panel').forEach(p => p.classList.remove('active'));
                const panel = document.querySelector(`.brand-panel[data-panel="${tabName}"]`);
                if (panel) panel.classList.add('active');
                
                console.log('Seraphonix: Brand tab changed to', tabName);
            });
        });
    }
    
    setupStoreCategories() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.product-card').forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                console.log('Seraphonix: Store category changed to', category);
            });
        });
    }
    
    // FIX 2: Null checks before DOM access
    setupStoreCart() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                if (!card) return;
                
                const nameEl = card.querySelector('.product-name');
                const name = nameEl ? nameEl.textContent : 'Unknown';
                const price = parseInt(card.dataset.price) || 0;
                
                this.cart.push({ name, price });
                this.updateCartDisplay();
                console.log('Seraphonix: Added to cart:', name, '$' + price);
                
                btn.textContent = 'Added!';
                btn.style.background = 'var(--green)';
                btn.style.color = 'var(--bg-dark)';
                
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--green)';
                }, 1500);
            });
        });
    }
    
    updateCartDisplay() {
        const count = this.cart.length;
        const total = this.cart.reduce((sum, item) => sum + item.price, 0);
        
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.querySelector('.cart-total');
        
        if (cartCount) cartCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        if (cartTotal) cartTotal.textContent = `$${total}.00`;
    }
    
    setupAdminAuth() {
        const authSubmit = document.getElementById('auth-submit');
        const adminPassword = document.getElementById('admin-password');
        
        if (authSubmit) {
            authSubmit.addEventListener('click', () => {
                this.authenticateAdmin();
            });
        }
        
        if (adminPassword) {
            adminPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticateAdmin();
                }
            });
        }
    }
    
    // Backend authentication for Neural-OS with 2FA
    authenticateAdmin() {
        const passwordEl = document.getElementById('admin-password');
        const errorEl = document.getElementById('auth-error');
        
        if (!passwordEl) {
            console.warn('Seraphonix: Admin password input not found');
            return;
        }
        
        const password = passwordEl.value.trim();
        if (!password) {
            if (errorEl) {
                errorEl.textContent = 'Password required';
                errorEl.classList.add('visible');
                setTimeout(() => errorEl.classList.remove('visible'), 3000);
            }
            return;
        }
        
        // Show loading state
        const submitBtn = document.getElementById('auth-submit');
        if (submitBtn) {
            submitBtn.textContent = 'Authenticating...';
            submitBtn.disabled = true;
        }
        
        // Send to Neural-OS backend for verification
        fetch('http://76.13.242.128:3077/api/auth/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ password })
        })
        .then(r => {
            if (!r.ok) {
                return r.json().then(data => {
                    throw new Error(data.message || 'Authentication failed');
                });
            }
            return r.json();
        })
        .then(data => {
            if (data.success && data.require2FA) {
                // 2FA required - show 2FA input
                this.show2FAPrompt(data.tempSessionId, data.maskedPhone);
            } else if (data.success && data.token) {
                // No 2FA - complete login
                this.completeAdminLogin(data.token);
            } else {
                throw new Error(data.message || 'Authentication failed');
            }
        })
        .catch(err => {
            console.error('Seraphonix: Auth request error:', err);
            if (errorEl) {
                errorEl.textContent = err.message || 'Neural link failed. Check connection.';
                errorEl.classList.add('visible');
                setTimeout(() => errorEl.classList.remove('visible'), 3000);
            }
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.textContent = 'Initialize Neural Link';
                submitBtn.disabled = false;
            }
        });
    }
    
    // Show 2FA input modal
    show2FAPrompt(tempSessionId, maskedPhone) {
        this.temp2FASession = tempSessionId;
        
        const authPanel = document.querySelector('.auth-panel');
        if (!authPanel) return;
        
        // Store original content
        this.originalAuthContent = authPanel.innerHTML;
        
        // Show 2FA UI
        authPanel.innerHTML = `
            <div class="auth-visual">
                <div class="neural-logo" style="font-size: 3rem; color: #00f3ff; text-shadow: 0 0 20px #00f3ff;">📱</div>
            </div>
            <h3 style="color: #00f3ff;">Two-Factor Authentication</h3>
            <p class="auth-subtitle">Enter the 6-digit code sent to</p>
            <p style="color: #ff00ff; font-family: 'Orbitron', monospace; font-size: 1.1rem; margin: 10px 0;">+61 ${maskedPhone}</p>
            <div class="auth-form">
                <input type="text" id="two-factor-code" placeholder="000000" maxlength="6" 
                       style="text-align: center; font-size: 1.5rem; letter-spacing: 8px; border-color: #00f3ff;"
                       oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                <button id="verify-2fa-btn" class="auth-btn" style="background: linear-gradient(90deg, #00f3ff, #7000ff);">Verify Code</button>
                <button id="resend-2fa-btn" class="auth-btn" style="background: transparent; border: 1px solid #00f3ff; margin-top: 10px;">Resend Code</button>
                <button id="cancel-2fa-btn" class="auth-btn" style="background: transparent; border: 1px solid #ff006e; color: #ff006e; margin-top: 5px;">Cancel</button>
            </div>
            <p class="auth-error" id="two-factor-error" style="display: none;"></p>
            <p style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 10px;">Code expires in 5 minutes</p>
        `;
        
        // Focus on input
        setTimeout(() => {
            const codeInput = document.getElementById('two-factor-code');
            if (codeInput) codeInput.focus();
        }, 100);
        
        // Add event listeners
        document.getElementById('verify-2fa-btn').addEventListener('click', () => this.verify2FA());
        document.getElementById('resend-2fa-btn').addEventListener('click', () => this.resend2FA());
        document.getElementById('cancel-2fa-btn').addEventListener('click', () => this.cancel2FA());
        
        const codeInput = document.getElementById('two-factor-code');
        if (codeInput) {
            codeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.verify2FA();
            });
        }
    }
    
    // Verify 2FA code
    verify2FA() {
        const codeEl = document.getElementById('two-factor-code');
        const errorEl = document.getElementById('two-factor-error');
        
        if (!codeEl || !this.temp2FASession) return;
        
        const code = codeEl.value.trim();
        
        if (code.length !== 6) {
            errorEl.textContent = 'Please enter the 6-digit code';
            errorEl.style.display = 'block';
            return;
        }
        
        const verifyBtn = document.getElementById('verify-2fa-btn');
        if (verifyBtn) {
            verifyBtn.textContent = 'Verifying...';
            verifyBtn.disabled = true;
        }
        
        fetch('http://76.13.242.128:3077/api/auth/verify-2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
                tempSessionId: this.temp2FASession,
                code: code 
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success && data.token) {
                this.temp2FASession = null;
                this.completeAdminLogin(data.token);
            } else {
                errorEl.textContent = data.message || 'Invalid code';
                errorEl.style.display = 'block';
                
                if (data.attemptsRemaining) {
                    errorEl.textContent += ` (${data.attemptsRemaining} attempts left)`;
                }
            }
        })
        .catch(err => {
            errorEl.textContent = 'Verification failed. Try again.';
            errorEl.style.display = 'block';
        })
        .finally(() => {
            if (verifyBtn) {
                verifyBtn.textContent = 'Verify Code';
                verifyBtn.disabled = false;
            }
        });
    }
    
    // Resend 2FA code
    resend2FA() {
        if (!this.temp2FASession) return;
        
        const resendBtn = document.getElementById('resend-2fa-btn');
        if (resendBtn) {
            resendBtn.textContent = 'Sending...';
            resendBtn.disabled = true;
        }
        
        fetch('http://76.13.242.128:3077/api/auth/resend-2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempSessionId: this.temp2FASession })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                this.showNotification('📱 New code sent!', 'success');
                // Reset input
                const codeInput = document.getElementById('two-factor-code');
                if (codeInput) codeInput.value = '';
            }
        })
        .finally(() => {
            if (resendBtn) {
                resendBtn.textContent = 'Resend Code';
                resendBtn.disabled = false;
            }
        });
    }
    
    // Cancel 2FA and return to password screen
    cancel2FA() {
        this.temp2FASession = null;
        const authPanel = document.querySelector('.auth-panel');
        if (authPanel && this.originalAuthContent) {
            authPanel.innerHTML = this.originalAuthContent;
            // Re-attach event listeners
            this.setupAdminAuth();
        }
    }
    
    // Complete admin login after auth/2FA
    completeAdminLogin(token) {
        this.neuralOSToken = token;
        this.isAdmin = true;
        
        // Store in AuthBridge for cross-origin communication
        if (window.authBridge) {
            window.authBridge.registerToken('neural-os', token);
        }
        
        // Also store in localStorage as backup
        localStorage.setItem('neural_os_token', token);
        localStorage.setItem('neural_os_expires', Date.now() + (24 * 60 * 60 * 1000));
        
        const authOverlay = document.getElementById('vps-auth');
        if (authOverlay) authOverlay.classList.add('hidden');
        
        // Update iframe with auth token via AuthBridge
        this.updateNeuralOSIframe(token);
        
        this.showNotification('🔐 NEURAL LINK ESTABLISHED', 'success');
        console.log('Seraphonix: Neural-OS authentication successful');
        
        this.updateNodeLabels();
    }
    
    // Update Neural-OS iframe with authentication
    updateNeuralOSIframe(token) {
        const iframe = document.getElementById('neural-os-frame');
        if (iframe && token) {
            // Add token to iframe URL
            const baseUrl = 'http://76.13.242.128:3077';
            
            // Show loading state
            iframe.style.background = '#0a0a0f';
            
            // Set the src to load Neural-OS
            iframe.src = `${baseUrl}?token=${encodeURIComponent(token)}`;
            
            // Handle load errors
            iframe.onerror = () => {
                console.warn('Neural-OS iframe failed to load');
                iframe.src = 'about:blank';
                this.showNotification('⚠️ Neural-OS server unavailable', 'error');
            };
            
            // Also try postMessage for cross-origin communication
            iframe.onload = () => {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'AUTH_TOKEN',
                        token: token
                    }, '*');
                } catch (e) {
                    console.warn('PostMessage failed:', e);
                }
            };
        }
    }
    
    // Check for existing auth on page load
    checkExistingAuth() {
        // Try AuthBridge first
        let token = null;
        if (window.authBridge) {
            try {
                token = window.authBridge.getToken('neural-os');
            } catch(e) { /* ignore */ }
        }
        
        // Fallback to localStorage
        if (!token) {
            try {
                token = localStorage.getItem('neural_os_token');
            } catch(e) { /* ignore */ }
        }
        
        if (!token) return;
        
        // Don't block initialization - verify in background
        setTimeout(() => {
            fetch('http://76.13.242.128:3077/api/auth/verify', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    this.neuralOSToken = token;
                    this.isAdmin = true;
                    
                    if (window.authBridge) {
                        try {
                            window.authBridge.registerToken('neural-os', token);
                        } catch(e) { /* ignore */ }
                    }
                    
                    console.log('Seraphonix: Restored Neural-OS session');
                } else {
                    // Token expired, clear it
                    try {
                        localStorage.removeItem('neural_os_token');
                        localStorage.removeItem('neural_os_expires');
                    } catch(e) { /* ignore */ }
                }
            })
            .catch(() => {
                // Server might be down - don't clear token, will retry on next login
                console.log('Seraphonix: Neural-OS server unreachable, keeping token');
            });
        }, 100);
    }
    
    setupWaitlistForm() {
        const waitlistForm = document.querySelector('.waitlist-form');
        if (waitlistForm) {
            waitlistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.querySelector('.email-input');
                if (emailInput) {
                    const email = emailInput.value;
                    
                    if (email) {
                        this.showNotification('✓ Added to waitlist: ' + email, 'success');
                        emailInput.value = '';
                    }
                }
            });
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 212, 255, 0.2)'};
            border: 1px solid ${type === 'success' ? 'var(--green)' : 'var(--cyan)'};
            color: #fff;
            border-radius: 10px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.8125rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            backdrop-filter: blur(10px);
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Seraphonix: DOM content loaded, initializing...');
    try {
        new SeraphonixSphere();
    } catch (error) {
        console.error('Seraphonix: Fatal initialization error:', error);
    }
});

// Inject mobile responsive styles only
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        10%, 90% { opacity: 1; }
    }
    @media (max-width: 768px) {
        .content-window {
            max-width: 90vw;
            max-height: 85vh;
            overflow-y: auto;
        }
        .mobile-view {
            left: 5vw !important;
            top: 10vh !important;
            width: 90vw !important;
            height: 85vh !important;
        }
        .hud-overlay { display: none; }
        #sphere-canvas { touch-action: none; }
        .node-label { font-size: 0.75rem; padding: 4px 8px; }
    }
`;
document.head.appendChild(mobileStyles);
console.log('Seraphonix: Mobile styles loaded');
