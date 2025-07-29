/**
 * Static.news 3D Background Engine
 * Advanced Babylon.js effects for premium news experience
 */

class StaticNews3D {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.particles = [];
        this.newsLogos = [];
        this.enabled = this.checkWebGLSupport();
        
        if (this.enabled) {
            this.init();
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) {
            return false;
        }
    }

    init() {
        // Create canvas for 3D background
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'babylon3d-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            opacity: 0.1;
        `;
        document.body.appendChild(this.canvas);

        // Initialize Babylon.js
        if (typeof BABYLON !== 'undefined') {
            this.engine = new BABYLON.Engine(this.canvas, true);
            this.scene = new BABYLON.Scene(this.engine);
            this.setupCamera();
            this.setupLighting();
            this.setupParticleSystem();
            this.setupNewsElements();
            this.startRenderLoop();
            this.setupEventHandlers();
        } else {
            // Fallback to CSS-based 3D effects
            this.setupCSSFallback();
        }
    }

    setupCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            "camera", 
            0, 
            Math.PI / 3, 
            150, 
            BABYLON.Vector3.Zero(), 
            this.scene
        );
        this.camera.attachControls(this.canvas);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        
        // Automatic camera rotation
        this.scene.registerBeforeRender(() => {
            this.camera.alpha += 0.001;
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight", 
            new BABYLON.Vector3(0, 1, 0), 
            this.scene
        );
        ambientLight.intensity = 0.3;

        // Directional light for dramatic effect
        const directionalLight = new BABYLON.DirectionalLight(
            "directionalLight", 
            new BABYLON.Vector3(-1, -1, -1), 
            this.scene
        );
        directionalLight.diffuse = new BABYLON.Color3(1, 0, 0); // Red light
        directionalLight.intensity = 0.8;

        // Point light for highlights
        const pointLight = new BABYLON.PointLight(
            "pointLight", 
            new BABYLON.Vector3(50, 50, 0), 
            this.scene
        );
        pointLight.diffuse = new BABYLON.Color3(0, 1, 1); // Cyan light
        pointLight.intensity = 0.5;
    }

    setupParticleSystem() {
        // Create particle system for floating news elements
        const particleSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
        
        // Texture for particles
        particleSystem.particleTexture = new BABYLON.Texture("data:image/svg+xml;base64," + 
            btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                    <circle cx="5" cy="5" r="3" fill="rgba(204,0,0,0.8)"/>
                  </svg>`), this.scene);

        // Emitter
        const fountain = BABYLON.MeshBuilder.CreateBox("fountain", {}, this.scene);
        fountain.position.y = -50;
        fountain.visibility = 0;
        particleSystem.emitter = fountain;

        // Particle properties
        particleSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50);
        particleSystem.maxEmitBox = new BABYLON.Vector3(50, 0, 50);
        
        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0, 1, 1, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

        particleSystem.minSize = 0.5;
        particleSystem.maxSize = 2.0;
        particleSystem.minLifeTime = 10;
        particleSystem.maxLifeTime = 20;
        particleSystem.emitRate = 100;

        // Blend mode
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        // Gravity and forces
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-1, 8, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 8, 1);

        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minInitialRotation = 0;
        particleSystem.maxInitialRotation = Math.PI;

        particleSystem.start();
    }

    setupNewsElements() {
        // Create floating news network logos
        const logoGeometry = BABYLON.MeshBuilder.CreatePlane("logo", {size: 10}, this.scene);
        
        // Create material with transparency
        const logoMaterial = new BABYLON.StandardMaterial("logoMaterial", this.scene);
        logoMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        logoMaterial.alpha = 0.3;
        logoMaterial.emissiveColor = new BABYLON.Color3(0.2, 0, 0);

        // Create multiple floating logos
        for (let i = 0; i < 20; i++) {
            const logo = logoGeometry.clone(`logo${i}`);
            logo.material = logoMaterial;
            logo.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 200
            );
            logo.rotation = new BABYLON.Vector3(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Add floating animation
            this.scene.registerBeforeRender(() => {
                logo.rotation.y += 0.01;
                logo.position.y += Math.sin(Date.now() * 0.001 + i) * 0.1;
            });

            this.newsLogos.push(logo);
        }

        // Create wireframe sphere for news network globe
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 100}, this.scene);
        const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", this.scene);
        sphereMaterial.wireframe = true;
        sphereMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1);
        sphereMaterial.alpha = 0.2;
        sphere.material = sphereMaterial;

        // Rotate sphere
        this.scene.registerBeforeRender(() => {
            sphere.rotation.y += 0.005;
            sphere.rotation.x += 0.002;
        });
    }

    setupCSSFallback() {
        // CSS-based 3D effect when Babylon.js is not available
        this.canvas.style.cssText += `
            background: 
                radial-gradient(circle at 20% 20%, rgba(204, 0, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                linear-gradient(45deg, transparent 0%, rgba(204, 0, 0, 0.05) 50%, transparent 100%);
            animation: cssBackgroundShift 10s ease-in-out infinite alternate;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cssBackgroundShift {
                0% { filter: hue-rotate(0deg) brightness(1); }
                50% { filter: hue-rotate(30deg) brightness(1.2); }
                100% { filter: hue-rotate(0deg) brightness(1); }
            }
        `;
        document.head.appendChild(style);
    }

    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    setupEventHandlers() {
        // Respond to page events
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.engine.stopRenderLoop();
            } else {
                this.startRenderLoop();
            }
        });

        // Interactive effects
        window.addEventListener('scroll', () => {
            const scrollPercent = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
            this.camera.radius = 150 + (scrollPercent * 50);
        });
    }

    // Public methods
    triggerBreakdownEffect() {
        if (!this.enabled) return;

        // Intensify particle emission
        this.scene.particleSystems.forEach(system => {
            system.emitRate = 500;
            setTimeout(() => {
                system.emitRate = 100;
            }, 2000);
        });

        // Shake camera
        const originalRadius = this.camera.radius;
        const shakeAnimation = () => {
            this.camera.radius = originalRadius + (Math.random() - 0.5) * 10;
            setTimeout(() => {
                this.camera.radius = originalRadius;
            }, 50);
        };

        for (let i = 0; i < 20; i++) {
            setTimeout(shakeAnimation, i * 100);
        }

        // Flash colors
        this.newsLogos.forEach((logo, index) => {
            setTimeout(() => {
                logo.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                setTimeout(() => {
                    logo.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
                }, 500);
            }, index * 100);
        });
    }

    updateIntensity(intensity) {
        if (!this.enabled) return;
        
        this.canvas.style.opacity = Math.min(intensity * 0.2, 0.3);
        
        if (this.scene && this.scene.particleSystems.length > 0) {
            this.scene.particleSystems[0].emitRate = 100 + (intensity * 200);
        }
    }

    dispose() {
        if (this.engine) {
            this.engine.stopRenderLoop();
            this.engine.dispose();
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize 3D background
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Babylon.js to load
    if (typeof BABYLON !== 'undefined') {
        window.staticNews3D = new StaticNews3D();
    } else {
        // Load Babylon.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.babylonjs.com/babylon.js';
        script.onload = () => {
            window.staticNews3D = new StaticNews3D();
        };
        script.onerror = () => {
            // Fallback without Babylon.js
            window.staticNews3D = new StaticNews3D();
        };
        document.head.appendChild(script);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.staticNews3D) {
        window.staticNews3D.dispose();
    }
});

// Expose methods globally
window.trigger3DBreakdown = () => {
    if (window.staticNews3D) {
        window.staticNews3D.triggerBreakdownEffect();
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StaticNews3D;
}