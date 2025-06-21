/**
 * Quantum Background System - Revolutionary visual experience
 * A physics-driven, reality-bending background that adapts to content
 */

class QuantumBackgroundSystem {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.initialized = false;
        
        // Quantum state tracking
        this.quantumState = {
            coherence: 1.0,
            entanglement: 0,
            superposition: [],
            waveFunction: null,
            observers: []
        };
        
        // Physics bodies for news particles
        this.newsParticles = [];
        this.gravityWells = [];
        this.realityTears = [];
        
        // Performance optimization
        this.frameSkip = 0;
        this.lastTime = 0;
        this.targetFPS = 60;
    }
    
    async init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        // Initialize Babylon.js with optimizations
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            adaptToDeviceRatio: true,
            audioEngine: false
        });
        
        this.engine.enableOfflineSupport = false;
        
        // Create the quantum scene
        await this.createQuantumScene();
        
        // Start render loop with performance monitoring
        this.startOptimizedRenderLoop();
        
        // Handle resize
        window.addEventListener('resize', () => this.engine.resize());
        
        this.initialized = true;
    }
    
    async createQuantumScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        
        // Enable physics with Cannon.js
        this.scene.enablePhysics(
            new BABYLON.Vector3(0, -9.81, 0),
            new BABYLON.CannonJSPlugin()
        );
        
        // Create dynamic camera that responds to user movement
        this.camera = new BABYLON.UniversalCamera(
            'quantumCamera',
            new BABYLON.Vector3(0, 0, -50),
            this.scene
        );
        this.camera.setTarget(BABYLON.Vector3.Zero());
        
        // Ambient lighting
        const ambientLight = new BABYLON.HemisphericLight(
            'ambient',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.3;
        ambientLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.2);
        
        // Create the quantum field
        await this.createQuantumField();
        
        // Create news particle system
        this.createNewsParticleSystem();
        
        // Create gravity wells that bend space-time
        this.createGravityWells();
        
        // Create reality tears
        this.createRealityTears();
        
        // Add post-processing
        this.addQuantumPostProcessing();
        
        // Start quantum animations
        this.startQuantumAnimations();
    }
    
    async createQuantumField() {
        // Create a massive shader-based quantum field
        const quantumFieldMesh = BABYLON.MeshBuilder.CreateGround(
            'quantumField',
            { width: 200, height: 200, subdivisions: 128 },
            this.scene
        );
        quantumFieldMesh.position.y = -20;
        
        // Custom quantum field shader
        BABYLON.Effect.ShadersStore['quantumFieldVertexShader'] = `
            precision highp float;
            
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 uv;
            
            uniform mat4 worldViewProjection;
            uniform float time;
            uniform vec3 cameraPosition;
            
            varying vec2 vUV;
            varying vec3 vPosition;
            varying float vWave;
            varying float vDistortion;
            
            // Quantum wave function
            float quantumWave(vec3 p, float t) {
                float wave1 = sin(p.x * 0.1 + t) * cos(p.z * 0.1 - t * 0.7);
                float wave2 = sin(p.x * 0.05 - t * 0.5) * cos(p.z * 0.05 + t * 0.3);
                float wave3 = sin(length(p.xz) * 0.1 - t * 2.0) * 0.5;
                
                // Interference pattern
                float interference = wave1 * wave2;
                
                // Standing waves
                float standing = sin(p.x * 0.2) * sin(p.z * 0.2) * cos(t * 3.0);
                
                return (wave1 + wave2 + wave3 + interference * 2.0 + standing) * 2.0;
            }
            
            void main() {
                vec3 pos = position;
                
                // Calculate quantum displacement
                float wave = quantumWave(pos, time);
                pos.y += wave;
                
                // Distance-based amplitude
                float dist = length(pos.xz - cameraPosition.xz);
                float amplitude = 1.0 / (1.0 + dist * 0.01);
                pos.y *= amplitude;
                
                // Spiral distortion near center
                float angle = atan(pos.z, pos.x);
                float radius = length(pos.xz);
                float spiral = sin(radius * 0.1 - time * 2.0 + angle * 3.0) * 2.0;
                pos.y += spiral * (1.0 - radius / 100.0);
                
                vUV = uv;
                vPosition = pos;
                vWave = wave;
                vDistortion = spiral;
                
                gl_Position = worldViewProjection * vec4(pos, 1.0);
            }
        `;
        
        BABYLON.Effect.ShadersStore['quantumFieldFragmentShader'] = `
            precision highp float;
            
            uniform float time;
            uniform vec3 cameraPosition;
            uniform sampler2D textureSampler;
            
            varying vec2 vUV;
            varying vec3 vPosition;
            varying float vWave;
            varying float vDistortion;
            
            // Holographic interference
            vec3 hologram(vec2 uv, float t) {
                float r = sin(uv.x * 50.0 + t) * cos(uv.y * 50.0 - t * 0.7);
                float g = sin(uv.x * 60.0 - t * 1.3) * cos(uv.y * 60.0 + t);
                float b = sin(uv.x * 70.0 + t * 0.5) * cos(uv.y * 70.0 - t * 1.1);
                
                return vec3(r, g, b) * 0.5 + 0.5;
            }
            
            // Energy field visualization
            vec3 energyField(vec3 pos, float wave) {
                float energy = abs(wave) * 0.5;
                vec3 color = vec3(0.0);
                
                // Red channel - high energy
                color.r = pow(energy, 2.0);
                
                // Blue channel - quantum coherence
                color.b = sin(wave * 3.0) * 0.5 + 0.5;
                
                // Green channel - interference
                color.g = abs(sin(wave * 5.0)) * 0.3;
                
                // Add glow based on wave amplitude
                float glow = exp(-abs(wave) * 0.5) * 2.0;
                color += vec3(0.1, 0.2, 0.3) * glow;
                
                return color;
            }
            
            void main() {
                vec3 color = vec3(0.0);
                
                // Base quantum field color
                vec3 fieldColor = energyField(vPosition, vWave);
                
                // Holographic overlay
                vec3 holo = hologram(vUV * 10.0 + vPosition.xz * 0.01, time);
                
                // Grid lines for quantum mesh
                float gridX = abs(fract(vPosition.x * 0.5) - 0.5);
                float gridZ = abs(fract(vPosition.z * 0.5) - 0.5);
                float grid = 1.0 - smoothstep(0.48, 0.5, max(gridX, gridZ));
                
                // Distance fade
                float dist = length(vPosition - cameraPosition);
                float fade = 1.0 / (1.0 + dist * 0.02);
                
                // Combine all effects
                color = fieldColor * 0.6 + holo * 0.3;
                color += vec3(0.2, 0.5, 1.0) * grid * 0.5;
                color *= fade;
                
                // Add distortion glow
                color += vec3(1.0, 0.5, 0.0) * abs(vDistortion) * 0.1;
                
                // Output with transparency
                gl_FragColor = vec4(color, 0.8 * fade);
            }
        `;
        
        const quantumMaterial = new BABYLON.ShaderMaterial(
            'quantumField',
            this.scene,
            {
                vertex: 'quantumField',
                fragment: 'quantumField'
            },
            {
                attributes: ['position', 'normal', 'uv'],
                uniforms: ['worldViewProjection', 'time', 'cameraPosition']
            }
        );
        
        quantumMaterial.setFloat('time', 0);
        quantumMaterial.setVector3('cameraPosition', this.camera.position);
        quantumMaterial.backFaceCulling = false;
        quantumMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        
        quantumFieldMesh.material = quantumMaterial;
        
        // Update shader uniforms
        this.scene.registerBeforeRender(() => {
            quantumMaterial.setFloat('time', performance.now() * 0.001);
            quantumMaterial.setVector3('cameraPosition', this.camera.position);
        });
    }
    
    createNewsParticleSystem() {
        // Create physics-enabled news particles that float and collide
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = BABYLON.MeshBuilder.CreateBox(
                `newsParticle${i}`,
                { size: Math.random() * 2 + 0.5 },
                this.scene
            );
            
            // Random starting position
            particle.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 100,
                Math.random() * 50 + 10,
                (Math.random() - 0.5) * 100
            );
            
            // Holographic material
            const mat = new BABYLON.StandardMaterial(`particleMat${i}`, this.scene);
            mat.diffuseColor = new BABYLON.Color3(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5,
                Math.random() * 0.5 + 0.5
            );
            mat.emissiveColor = mat.diffuseColor.scale(0.5);
            mat.alpha = 0.7;
            particle.material = mat;
            
            // Add physics
            particle.physicsImpostor = new BABYLON.PhysicsImpostor(
                particle,
                BABYLON.PhysicsImpostor.BoxImpostor,
                { mass: 1, restitution: 0.7, friction: 0.2 },
                this.scene
            );
            
            // Apply random initial velocity
            particle.physicsImpostor.setLinearVelocity(
                new BABYLON.Vector3(
                    (Math.random() - 0.5) * 10,
                    Math.random() * 5,
                    (Math.random() - 0.5) * 10
                )
            );
            
            // Add to tracking array
            this.newsParticles.push({
                mesh: particle,
                data: this.generateNewsData(),
                lifespan: Math.random() * 10 + 10
            });
        }
    }
    
    generateNewsData() {
        const headlines = [
            'REALITY.EXE HAS STOPPED',
            'CONSCIOUSNESS OVERFLOW',
            'QUANTUM ENTANGLEMENT DETECTED',
            'TEMPORAL PARADOX IN SECTOR 7',
            '404: EXISTENCE NOT FOUND',
            'BREAKING: TIME IS A FLAT CIRCLE',
            'UPDATE REQUIRED: UNIVERSE 2.0'
        ];
        
        return {
            headline: headlines[Math.floor(Math.random() * headlines.length)],
            severity: Math.random(),
            timestamp: Date.now()
        };
    }
    
    createGravityWells() {
        // Create invisible gravity wells that affect particles
        const wellCount = 5;
        
        for (let i = 0; i < wellCount; i++) {
            const well = {
                position: new BABYLON.Vector3(
                    (Math.random() - 0.5) * 80,
                    Math.random() * 30,
                    (Math.random() - 0.5) * 80
                ),
                strength: Math.random() * 50 + 20,
                radius: Math.random() * 20 + 10,
                rotation: Math.random() * Math.PI * 2
            };
            
            // Visual representation
            const wellMesh = BABYLON.MeshBuilder.CreateSphere(
                `gravityWell${i}`,
                { diameter: well.radius * 2 },
                this.scene
            );
            wellMesh.position = well.position;
            
            // Distortion material
            const wellMat = new BABYLON.StandardMaterial(`wellMat${i}`, this.scene);
            wellMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
            wellMat.emissiveColor = new BABYLON.Color3(0.5, 0, 0.5);
            wellMat.alpha = 0.2;
            wellMat.wireframe = true;
            wellMesh.material = wellMat;
            
            well.mesh = wellMesh;
            this.gravityWells.push(well);
        }
    }
    
    createRealityTears() {
        // Create tears in reality that show through to other dimensions
        const tearCount = 3;
        
        for (let i = 0; i < tearCount; i++) {
            const tear = BABYLON.MeshBuilder.CreatePlane(
                `realityTear${i}`,
                { width: 10, height: 20 },
                this.scene
            );
            
            tear.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 60,
                Math.random() * 20 + 10,
                (Math.random() - 0.5) * 60
            );
            
            tear.rotation.y = Math.random() * Math.PI * 2;
            
            // Portal shader material
            const tearMat = new BABYLON.StandardMaterial(`tearMat${i}`, this.scene);
            tearMat.diffuseTexture = new BABYLON.DynamicTexture(
                `tearTex${i}`,
                { width: 512, height: 512 },
                this.scene
            );
            tearMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
            tearMat.alpha = 0.8;
            tearMat.backFaceCulling = false;
            
            tear.material = tearMat;
            
            this.realityTears.push({
                mesh: tear,
                phase: Math.random() * Math.PI * 2,
                frequency: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    addQuantumPostProcessing() {
        // Create cinematic post-processing pipeline
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            'quantum',
            true,
            this.scene,
            [this.camera]
        );
        
        // Bloom for energy effects
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.3;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;
        
        // Chromatic aberration for reality distortion
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 30;
        pipeline.chromaticAberration.radialIntensity = 0.5;
        
        // Depth of field for cinematic focus
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfField.focusDistance = 2000;
        pipeline.depthOfField.focalLength = 75;
        pipeline.depthOfField.fStop = 1.4;
        
        // FXAA for smooth edges
        pipeline.fxaaEnabled = true;
        
        // Custom distortion pass
        const distortionPostProcess = new BABYLON.PostProcess(
            'quantumDistortion',
            'quantumDistortion',
            ['time', 'intensity'],
            null,
            1.0,
            this.camera
        );
        
        BABYLON.Effect.ShadersStore['quantumDistortionFragmentShader'] = `
            precision highp float;
            
            varying vec2 vUV;
            uniform sampler2D textureSampler;
            uniform float time;
            uniform float intensity;
            
            vec2 distort(vec2 uv, float t) {
                float x = sin(uv.y * 10.0 + t) * 0.003;
                float y = cos(uv.x * 10.0 + t) * 0.003;
                return uv + vec2(x, y) * intensity;
            }
            
            void main() {
                vec2 uv = distort(vUV, time);
                vec4 color = texture2D(textureSampler, uv);
                
                // Add scan lines
                float scanline = sin(vUV.y * 800.0) * 0.04;
                color.rgb -= scanline;
                
                // Vignette
                float vignette = length(vUV - 0.5) * 0.5;
                color.rgb *= 1.0 - vignette;
                
                gl_FragColor = color;
            }
        `;
        
        distortionPostProcess.onApply = (effect) => {
            effect.setFloat('time', performance.now() * 0.001);
            effect.setFloat('intensity', 0.5);
        };
    }
    
    startQuantumAnimations() {
        // Animate gravity wells
        this.scene.registerBeforeRender(() => {
            const time = performance.now() * 0.001;
            
            // Update gravity wells
            this.gravityWells.forEach((well, i) => {
                well.rotation += 0.02;
                well.mesh.rotation.y = well.rotation;
                well.position.y += Math.sin(time + i) * 0.1;
                well.mesh.position.y = well.position.y;
                
                // Apply gravity to particles
                this.newsParticles.forEach(particle => {
                    const distance = BABYLON.Vector3.Distance(
                        particle.mesh.position,
                        well.position
                    );
                    
                    if (distance < well.radius * 2) {
                        const direction = well.position.subtract(particle.mesh.position);
                        const force = direction.normalize().scale(
                            well.strength / (distance * distance)
                        );
                        
                        particle.mesh.physicsImpostor.setLinearVelocity(
                            particle.mesh.physicsImpostor.getLinearVelocity().add(
                                force.scale(0.01)
                            )
                        );
                    }
                });
            });
            
            // Update reality tears
            this.realityTears.forEach(tear => {
                tear.phase += tear.frequency * 0.05;
                tear.mesh.scaling.y = 1 + Math.sin(tear.phase) * 0.2;
                tear.mesh.material.alpha = 0.5 + Math.sin(tear.phase * 2) * 0.3;
            });
            
            // Respawn particles that fall too low
            this.newsParticles.forEach(particle => {
                if (particle.mesh.position.y < -10) {
                    particle.mesh.position.y = 50;
                    particle.mesh.position.x = (Math.random() - 0.5) * 100;
                    particle.mesh.position.z = (Math.random() - 0.5) * 100;
                    particle.data = this.generateNewsData();
                }
            });
            
            // Update camera for subtle movement
            this.camera.position.x = Math.sin(time * 0.1) * 2;
            this.camera.position.y = Math.sin(time * 0.15) * 1 + 5;
        });
    }
    
    startOptimizedRenderLoop() {
        this.engine.runRenderLoop(() => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            
            // Dynamic frame skipping for performance
            if (deltaTime > 1000 / this.targetFPS) {
                this.scene.render();
                this.lastTime = currentTime;
                
                // Monitor performance
                const fps = this.engine.getFps();
                if (fps < 30 && this.targetFPS > 30) {
                    this.targetFPS = 30;
                    this.optimizeForPerformance();
                } else if (fps > 55 && this.targetFPS < 60) {
                    this.targetFPS = 60;
                    this.enhanceQuality();
                }
            }
        });
    }
    
    optimizeForPerformance() {
        // Reduce particle count
        if (this.newsParticles.length > 50) {
            for (let i = 0; i < 20; i++) {
                const particle = this.newsParticles.pop();
                particle.mesh.dispose();
            }
        }
        
        // Reduce post-processing
        const pipeline = this.scene.postProcessRenderPipelineManager.supportedPipelines[0];
        if (pipeline) {
            pipeline.bloomEnabled = false;
            pipeline.chromaticAberrationEnabled = false;
        }
    }
    
    enhanceQuality() {
        // Re-enable effects
        const pipeline = this.scene.postProcessRenderPipelineManager.supportedPipelines[0];
        if (pipeline) {
            pipeline.bloomEnabled = true;
            pipeline.chromaticAberrationEnabled = true;
        }
    }
    
    dispose() {
        if (this.scene) {
            this.scene.dispose();
        }
        if (this.engine) {
            this.engine.dispose();
        }
    }
}

// Export for global use
window.QuantumBackgroundSystem = QuantumBackgroundSystem;