/**
 * Simple 3D Studio Background - Minimal working version
 */

class Simple3DStudio {
    constructor() {
        console.log('Simple3DStudio: Starting initialization...');
        this.container = document.getElementById('studio-background');
        
        if (!this.container) {
            console.error('Simple3DStudio: Container not found!');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(-10, 5, 15);
        this.camera.lookAt(0, 2, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Clear container and add canvas
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        
        // Lights
        this.setupLights();
        
        // Studio objects
        this.createStudio();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
        
        console.log('Simple3DStudio: Initialization complete!');
    }
    
    setupLights() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambient);
        
        // Main light
        const mainLight = new THREE.DirectionalLight(0xffffff, 2);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -20;
        mainLight.shadow.camera.right = 20;
        mainLight.shadow.camera.top = 20;
        mainLight.shadow.camera.bottom = -20;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Red accent
        const redLight = new THREE.PointLight(0xff0000, 2, 10);
        redLight.position.set(0, 3, 0);
        this.scene.add(redLight);
    }
    
    createStudio() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(30, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // News desk
        const deskGeometry = new THREE.BoxGeometry(10, 1, 3);
        const deskMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.y = 0.5;
        desk.castShadow = true;
        desk.receiveShadow = true;
        this.scene.add(desk);
        
        // Desk top glass
        const glassGeometry = new THREE.BoxGeometry(10.2, 0.1, 3.2);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0,
            transmission: 0.5,
            transparent: true,
            opacity: 0.3
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.y = 1.05;
        this.scene.add(glass);
        
        // LED panels in background
        for (let i = -3; i <= 3; i++) {
            const panelGeometry = new THREE.PlaneGeometry(2, 4);
            const panelMaterial = new THREE.MeshStandardMaterial({
                color: 0x000033,
                emissive: 0x001122,
                emissiveIntensity: 0.5,
                roughness: 0.1
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.set(i * 3, 2, -8);
            this.scene.add(panel);
        }
        
        // STATIC logo on desk
        const textGeometry = new THREE.BoxGeometry(4, 0.5, 0.2);
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            metalness: 0.9,
            roughness: 0.1
        });
        const logo = new THREE.Mesh(textGeometry, textMaterial);
        logo.position.set(0, 1.2, 1);
        this.scene.add(logo);
        
        // Side monitors
        [-5, 5].forEach(x => {
            const monitorGroup = new THREE.Group();
            
            // Monitor frame
            const frameGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
            const frameMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.3
            });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            monitorGroup.add(frame);
            
            // Screen
            const screenGeometry = new THREE.PlaneGeometry(1.8, 1.3);
            const screenMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                emissive: 0x003366
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.z = 0.06;
            monitorGroup.add(screen);
            
            monitorGroup.position.set(x, 3, 2);
            monitorGroup.rotation.y = x > 0 ? -0.3 : 0.3;
            this.scene.add(monitorGroup);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Subtle camera movement
        const time = Date.now() * 0.0005;
        this.camera.position.x = -10 + Math.sin(time) * 0.5;
        this.camera.position.y = 5 + Math.sin(time * 0.7) * 0.2;
        this.camera.lookAt(0, 2, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize when THREE.js is ready
function initSimple3DStudio() {
    if (typeof THREE === 'undefined') {
        console.log('Simple3DStudio: Waiting for THREE.js...');
        setTimeout(initSimple3DStudio, 100);
        return;
    }
    
    console.log('Simple3DStudio: THREE.js loaded, initializing...');
    window.simple3DStudio = new Simple3DStudio();
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimple3DStudio);
} else {
    initSimple3DStudio();
}