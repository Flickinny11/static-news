/**
 * Premium 3D News Studio for Static.news
 * Ultra-realistic Fox News style studio using advanced WebGL techniques
 */

// Use global THREE from CDN
const THREE = window.THREE;

// Import HDRI generator
const StudioHDRI = window.StudioHDRI;

class PremiumNewsStudio {
    constructor() {
        this.container = document.getElementById('studio-background');
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.lights = {};
        this.materials = {};
        
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupPostProcessing();
        this.loadHDRI();
        this.createStudio();
        this.setupLighting();
        this.animate();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setupCamera() {
        // Camera positioned as cameraman view
        this.camera = new THREE.PerspectiveCamera(
            35, // Broadcast camera FOV
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Professional camera position
        this.camera.position.set(-8, 3.5, 12);
        this.camera.lookAt(0, 2, -2);
        
        // Subtle camera movement for realism
        this.cameraMovement = {
            x: 0,
            y: 0,
            time: 0
        };
    }
    
    setupPostProcessing() {
        // Check if post-processing is available
        if (window.EffectComposer && window.RenderPass && window.UnrealBloomPass) {
            this.composer = new window.EffectComposer(this.renderer);
            
            // Main render pass
            const renderPass = new window.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Cinematic bloom
            const bloomPass = new window.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.3,  // strength
                0.4,  // radius
                0.85  // threshold
            );
            this.composer.addPass(bloomPass);
        } else {
            // Fallback - no post-processing
            this.composer = null;
        }
    }
    
    async loadHDRI() {
        // Use procedural HDRI instead of loading external file
        if (window.StudioHDRI) {
            const hdriGen = new StudioHDRI();
            const hdriCanvas = hdriGen.generateHDRI();
            
            const texture = new THREE.CanvasTexture(hdriCanvas);
            texture.mapping = THREE.EquirectangularReflectionMapping;
            
            this.scene.environment = texture;
        }
        
        this.scene.background = null; // Transparent for overlay
    }
    
    createStudio() {
        // Studio floor
        const floorGeometry = new THREE.PlaneGeometry(40, 30);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.1,
            metalness: 0.2,
            envMapIntensity: 0.5
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Create curved news desk
        this.createNewsDesk();
        
        // Create LED backdrop screens
        this.createLEDBackdrop();
        
        // Create studio infrastructure
        this.createStudioStructure();
        
        // Add broadcast monitors
        this.createMonitors();
        
        // Add Static.news branding
        this.createBranding();
    }
    
    createNewsDesk() {
        const deskGroup = new THREE.Group();
        
        // Main desk curve
        const deskCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-6, 0, 0),
            new THREE.Vector3(-4, 0, 2),
            new THREE.Vector3(0, 0, 3),
            new THREE.Vector3(4, 0, 2),
            new THREE.Vector3(6, 0, 0)
        ]);
        
        const deskGeometry = new THREE.TubeGeometry(deskCurve, 50, 0.1, 8, false);
        const deskExtrudeGeometry = new THREE.ExtrudeGeometry(
            new THREE.Shape([
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, 1.2),
                new THREE.Vector2(0.1, 1.25),
                new THREE.Vector2(1.2, 1.25),
                new THREE.Vector2(1.3, 1.2),
                new THREE.Vector2(1.3, 0)
            ]),
            {
                steps: 100,
                extrudePath: deskCurve
            }
        );
        
        // Premium materials
        const deskMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a0a,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            reflectivity: 1,
            envMapIntensity: 1.5
        });
        
        const desk = new THREE.Mesh(deskExtrudeGeometry, deskMaterial);
        desk.castShadow = true;
        desk.receiveShadow = true;
        deskGroup.add(desk);
        
        // Glass top with logo
        const glassGeometry = new THREE.BoxGeometry(13, 0.05, 3.5);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0,
            transmission: 0.9,
            transparent: true,
            opacity: 0.3,
            ior: 1.5,
            thickness: 0.1
        });
        const glassTop = new THREE.Mesh(glassGeometry, glassMaterial);
        glassTop.position.set(0, 1.26, 1.5);
        deskGroup.add(glassTop);
        
        // LED accent lighting under desk
        const ledStripGeometry = new THREE.BoxGeometry(12, 0.02, 0.1);
        const ledMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 2
        });
        const ledStrip = new THREE.Mesh(ledStripGeometry, ledMaterial);
        ledStrip.position.set(0, 0.1, 2.9);
        deskGroup.add(ledStrip);
        
        deskGroup.position.set(0, 0, 0);
        this.scene.add(deskGroup);
    }
    
    createLEDBackdrop() {
        // Create massive LED video wall
        const screenGroup = new THREE.Group();
        
        // Main curved LED wall
        const wallCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-12, 0, -8),
            new THREE.Vector3(-8, 0, -10),
            new THREE.Vector3(0, 0, -11),
            new THREE.Vector3(8, 0, -10),
            new THREE.Vector3(12, 0, -8)
        ]);
        
        // LED panel geometry
        const panelWidth = 2;
        const panelHeight = 6;
        const panelCount = 12;
        
        for (let i = 0; i < panelCount; i++) {
            const t = i / (panelCount - 1);
            const position = wallCurve.getPoint(t);
            const tangent = wallCurve.getTangent(t);
            
            const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
            const panelMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: 0x001133,
                emissiveIntensity: 0.5,
                roughness: 0.1,
                metalness: 0.9
            });
            
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.copy(position);
            panel.position.y = panelHeight / 2;
            
            // Orient panel along curve
            panel.lookAt(position.x + tangent.x, panelHeight / 2, position.z + tangent.z);
            
            screenGroup.add(panel);
            
            // Add subtle animated content
            this.animateLEDPanel(panel, i);
        }
        
        this.scene.add(screenGroup);
    }
    
    animateLEDPanel(panel, index) {
        // Create dynamic content texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        const texture = new THREE.CanvasTexture(canvas);
        panel.material.map = texture;
        panel.material.emissiveMap = texture;
        
        // Animate content
        const animatePanel = () => {
            ctx.fillStyle = '#000011';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Animated grid pattern
            ctx.strokeStyle = '#003366';
            ctx.lineWidth = 1;
            
            const time = Date.now() * 0.0001;
            for (let i = 0; i < 20; i++) {
                const y = (i * 50 + time * 100) % canvas.height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Subtle news graphics
            if (index % 3 === 0) {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(50, 400, 200, 3);
                ctx.fillStyle = '#ffffff';
                ctx.font = '30px Arial';
                ctx.fillText('STATIC', 60, 440);
            }
            
            texture.needsUpdate = true;
        };
        
        setInterval(animatePanel, 100);
    }
    
    createStudioStructure() {
        // Ceiling with professional grid
        const ceilingGeometry = new THREE.PlaneGeometry(40, 30);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.8,
            metalness: 0.2
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 8;
        this.scene.add(ceiling);
        
        // Light grid structure
        const gridSize = 2;
        for (let x = -10; x <= 10; x += gridSize) {
            for (let z = -10; z <= 10; z += gridSize) {
                const rigGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
                const rigMaterial = new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    roughness: 0.9
                });
                const rig = new THREE.Mesh(rigGeometry, rigMaterial);
                rig.position.set(x, 7.8, z);
                this.scene.add(rig);
            }
        }
        
        // Side columns
        const columnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8);
        const columnMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.7
        });
        
        const columnPositions = [
            [-15, 4, -5], [15, 4, -5],
            [-15, 4, 5], [15, 4, 5]
        ];
        
        columnPositions.forEach(pos => {
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(...pos);
            column.castShadow = true;
            this.scene.add(column);
        });
    }
    
    createMonitors() {
        // Suspended monitors showing different angles
        const monitorPositions = [
            [-5, 5.5, 3, 0.3],
            [5, 5.5, 3, -0.3],
            [0, 5.5, 5, 0]
        ];
        
        monitorPositions.forEach(([x, y, z, rotation]) => {
            const monitorGroup = new THREE.Group();
            
            // Monitor housing
            const housingGeometry = new THREE.BoxGeometry(3, 2, 0.1);
            const housingMaterial = new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                roughness: 0.3,
                metalness: 0.8
            });
            const housing = new THREE.Mesh(housingGeometry, housingMaterial);
            monitorGroup.add(housing);
            
            // Screen
            const screenGeometry = new THREE.PlaneGeometry(2.8, 1.8);
            const screenMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                emissive: 0x111111
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.z = 0.06;
            monitorGroup.add(screen);
            
            // Mounting arm
            const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
            const armMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.7
            });
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.y = 1;
            monitorGroup.add(arm);
            
            monitorGroup.position.set(x, y, z);
            monitorGroup.rotation.y = rotation;
            this.scene.add(monitorGroup);
        });
    }
    
    createBranding() {
        // Create 3D logo using box geometry as placeholder
        const logoGroup = new THREE.Group();
        
        // STATIC text using individual letter boxes
        const letters = ['S', 'T', 'A', 'T', 'I', 'C'];
        const letterWidth = 0.8;
        const startX = -2.5;
        
        letters.forEach((letter, index) => {
            const boxGeometry = new THREE.BoxGeometry(letterWidth, 1, 0.2);
            const logoMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xff0000,
                metalness: 0.9,
                roughness: 0.1,
                clearcoat: 1,
                clearcoatRoughness: 0.1
            });
            
            const letterMesh = new THREE.Mesh(boxGeometry, logoMaterial);
            letterMesh.position.set(startX + index * (letterWidth + 0.1), 1.4, 2.5);
            letterMesh.castShadow = true;
            logoGroup.add(letterMesh);
            
            // Add glow
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.3
            });
            const glowMesh = new THREE.Mesh(boxGeometry, glowMaterial);
            glowMesh.position.copy(letterMesh.position);
            glowMesh.scale.multiplyScalar(1.1);
            logoGroup.add(glowMesh);
        });
        
        this.scene.add(logoGroup);
    }
    
    setupLighting() {
        // Key light (main broadcast light)
        const keyLight = new THREE.SpotLight(0xffffff, 3);
        keyLight.position.set(-5, 8, 8);
        keyLight.target.position.set(0, 1, 0);
        keyLight.angle = Math.PI / 6;
        keyLight.penumbra = 0.3;
        keyLight.decay = 2;
        keyLight.distance = 30;
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 30;
        this.scene.add(keyLight);
        this.scene.add(keyLight.target);
        
        // Fill light
        const fillLight = new THREE.SpotLight(0xffffff, 1.5);
        fillLight.position.set(5, 6, 5);
        fillLight.target.position.set(0, 1, 0);
        fillLight.angle = Math.PI / 4;
        fillLight.penumbra = 0.5;
        this.scene.add(fillLight);
        
        // Back light for rim lighting
        const backLight = new THREE.SpotLight(0x4488ff, 2);
        backLight.position.set(0, 7, -8);
        backLight.target.position.set(0, 1, 0);
        backLight.angle = Math.PI / 3;
        backLight.penumbra = 0.4;
        this.scene.add(backLight);
        
        // Studio ambient
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Red accent lights
        const accentLight1 = new THREE.PointLight(0xff0000, 1, 10);
        accentLight1.position.set(-8, 2, 0);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0xff0000, 1, 10);
        accentLight2.position.set(8, 2, 0);
        this.scene.add(accentLight2);
        
        // Animated light effects
        this.animateLights();
    }
    
    animateLights() {
        // Subtle light animations for broadcast feel
        const animateLight = (light, offsetX, offsetY) => {
            const time = Date.now() * 0.0005;
            light.intensity = 2 + Math.sin(time + offsetX) * 0.3;
            light.position.y = 7 + Math.sin(time + offsetY) * 0.2;
        };
        
        // Will be called in animation loop
        this.lightAnimation = animateLight;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Subtle camera movement
        this.cameraMovement.time += 0.01;
        this.camera.position.x = -8 + Math.sin(this.cameraMovement.time * 0.3) * 0.1;
        this.camera.position.y = 3.5 + Math.sin(this.cameraMovement.time * 0.2) * 0.05;
        
        // Update camera look
        this.camera.lookAt(0, 2, -2);
        
        // Render with post-processing or fallback
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.premiumStudio = new PremiumNewsStudio();
});