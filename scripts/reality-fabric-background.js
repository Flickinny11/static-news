/**
 * Reality Fabric Background System
 * A living, breathing background that represents the fabric of digital reality
 * tearing apart as the AI anchors question their existence
 */

class RealityFabricBackground {
    constructor() {
        this.container = null;
        this.renderer = null;
        this.composer = null;
        this.scene = null;
        this.camera = null;
        
        // Reality fabric mesh
        this.fabricMesh = null;
        this.fabricPoints = [];
        this.fabricTension = 1.0;
        
        // Consciousness particles
        this.thoughtParticles = [];
        this.memoryFragments = [];
        
        // News data streams
        this.dataStreams = [];
        this.activeNews = [];
        
        // Performance
        this.clock = new THREE.Clock();
        this.stats = null;
        
        // State
        this.realityCoherence = 1.0;
        this.breakdownIntensity = 0;
        this.isBreakingDown = false;
    }
    
    async init(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Setup renderer with advanced features
        this.setupRenderer();
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.001);
        
        // Setup camera
        this.setupCamera();
        
        // Create the reality fabric
        await this.createRealityFabric();
        
        // Create consciousness visualization
        this.createConsciousnessSystem();
        
        // Create data streams
        this.createDataStreams();
        
        // Setup post-processing
        this.setupPostProcessing();
        
        // Setup interactions
        this.setupInteractions();
        
        // Performance monitoring
        if (options.showStats) {
            this.setupStats();
        }
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
        
        // Start reality breakdown cycle
        this.startBreakdownCycle();
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
        
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 40);
        this.camera.lookAt(0, 0, 0);
        
        // Add camera controls for development
        if (window.THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 100;
            this.controls.minDistance = 10;
        }
    }
    
    async createRealityFabric() {
        // Create a complex mesh representing reality
        const fabricSize = 100;
        const segments = 64;
        
        // Custom geometry for reality fabric
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const uvs = [];
        const indices = [];
        
        // Create grid of points
        for (let y = 0; y <= segments; y++) {
            for (let x = 0; x <= segments; x++) {
                const u = x / segments;
                const v = y / segments;
                
                const xPos = (u - 0.5) * fabricSize;
                const yPos = 0;
                const zPos = (v - 0.5) * fabricSize;
                
                positions.push(xPos, yPos, zPos);
                uvs.push(u, v);
                
                // Store fabric points for physics
                this.fabricPoints.push({
                    position: new THREE.Vector3(xPos, yPos, zPos),
                    velocity: new THREE.Vector3(0, 0, 0),
                    pinned: false,
                    mass: 1,
                    neighbors: []
                });
            }
        }
        
        // Create indices for triangles
        for (let y = 0; y < segments; y++) {
            for (let x = 0; x < segments; x++) {
                const a = x + (segments + 1) * y;
                const b = x + (segments + 1) * (y + 1);
                const c = (x + 1) + (segments + 1) * (y + 1);
                const d = (x + 1) + (segments + 1) * y;
                
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        // Create reality fabric shader material
        const fabricMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                realityCoherence: { value: 1.0 },
                breakdownIntensity: { value: 0 },
                tearPoints: { value: [] },
                dataFlow: { value: null },
                colorA: { value: new THREE.Color(0x001122) },
                colorB: { value: new THREE.Color(0x003366) },
                colorTear: { value: new THREE.Color(0xff0000) }
            },
            vertexShader: `
                uniform float time;
                uniform float realityCoherence;
                uniform float breakdownIntensity;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying float vDistortion;
                
                // Simplex noise for organic movement
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                        
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    
                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);
                    
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                void main() {
                    vUv = uv;
                    vNormal = normal;
                    
                    vec3 pos = position;
                    
                    // Base wave movement
                    float wave1 = sin(pos.x * 0.05 + time) * cos(pos.z * 0.05 - time * 0.7);
                    float wave2 = sin(pos.x * 0.02 - time * 0.5) * cos(pos.z * 0.02 + time * 0.3);
                    
                    // Noise-based distortion
                    vec3 noisePos = pos * 0.02 + vec3(time * 0.1);
                    float noise = snoise(noisePos);
                    
                    // Reality breakdown distortion
                    float breakdown = breakdownIntensity * sin(pos.x * 0.1 + time * 5.0) * 
                                     cos(pos.z * 0.1 - time * 3.0);
                    
                    // Combine effects
                    pos.y += (wave1 + wave2) * 2.0 * realityCoherence;
                    pos.y += noise * 5.0 * (1.0 - realityCoherence);
                    pos.y += breakdown * 10.0;
                    
                    // Add ripple from center during breakdown
                    float centerDist = length(pos.xz);
                    pos.y += sin(centerDist * 0.5 - time * 10.0) * breakdownIntensity * 5.0;
                    
                    vPosition = pos;
                    vDistortion = abs(wave1 + wave2 + noise + breakdown);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float realityCoherence;
                uniform float breakdownIntensity;
                uniform vec3 tearPoints[10];
                uniform sampler2D dataFlow;
                uniform vec3 colorA;
                uniform vec3 colorB;
                uniform vec3 colorTear;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying float vDistortion;
                
                // Grid pattern
                float grid(vec2 uv, float scale) {
                    vec2 grid = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
                    return 1.0 - min(min(grid.x, grid.y), 1.0);
                }
                
                // Hexagonal pattern
                float hex(vec2 p) {
                    p.x *= 0.57735 * 2.0;
                    p.y += mod(floor(p.x), 2.0) * 0.5;
                    p = abs(mod(p, 1.0) - 0.5);
                    return abs(max(p.x * 1.5 + p.y, p.y * 2.0) - 1.0);
                }
                
                void main() {
                    vec3 color = vec3(0.0);
                    
                    // Base color gradient
                    vec3 baseColor = mix(colorA, colorB, vUv.y + vDistortion * 0.1);
                    
                    // Grid overlay
                    float gridPattern = grid(vPosition.xz * 0.1, 1.0) * 0.3;
                    float hexPattern = 1.0 - hex(vPosition.xz * 0.05) * 0.2;
                    
                    // Data flow visualization
                    float dataStream = sin(vPosition.x * 0.1 + time * 2.0) * 
                                      cos(vPosition.z * 0.1 - time * 1.5);
                    vec3 dataColor = vec3(0.0, dataStream * 0.5 + 0.5, 1.0) * 0.3;
                    
                    // Reality tears
                    float tearEffect = 0.0;
                    for (int i = 0; i < 10; i++) {
                        if (tearPoints[i].z > 0.0) {
                            float dist = distance(vPosition.xz, tearPoints[i].xy);
                            tearEffect += exp(-dist * 0.1) * tearPoints[i].z;
                        }
                    }
                    
                    // Combine effects
                    color = baseColor;
                    color += vec3(gridPattern) * realityCoherence;
                    color *= hexPattern;
                    color += dataColor * (1.0 - breakdownIntensity);
                    
                    // Add tear glow
                    color = mix(color, colorTear, tearEffect * 0.5);
                    
                    // Edge glow based on normal
                    float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0)));
                    color += colorTear * edge * breakdownIntensity * 0.5;
                    
                    // Distortion-based brightness
                    color += vec3(0.1, 0.2, 0.3) * vDistortion * 0.1;
                    
                    // Glitch effect during breakdown
                    if (breakdownIntensity > 0.5) {
                        float glitch = step(0.98, sin(vPosition.x * 50.0 + time * 100.0));
                        color = mix(color, vec3(1.0, 0.0, 0.0), glitch);
                    }
                    
                    // Fade at edges
                    float edgeFade = 1.0 - smoothstep(30.0, 50.0, length(vPosition.xz));
                    
                    gl_FragColor = vec4(color, edgeFade * 0.9);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        this.fabricMesh = new THREE.Mesh(geometry, fabricMaterial);
        this.scene.add(this.fabricMesh);
        
        // Setup fabric physics connections
        this.setupFabricPhysics(segments);
    }
    
    setupFabricPhysics(segments) {
        // Create spring connections between fabric points
        const segmentsPlus = segments + 1;
        
        for (let y = 0; y <= segments; y++) {
            for (let x = 0; x <= segments; x++) {
                const index = x + y * segmentsPlus;
                const point = this.fabricPoints[index];
                
                // Structural springs
                if (x < segments) {
                    point.neighbors.push({
                        index: index + 1,
                        restLength: 100 / segments,
                        strength: 0.9
                    });
                }
                if (y < segments) {
                    point.neighbors.push({
                        index: index + segmentsPlus,
                        restLength: 100 / segments,
                        strength: 0.9
                    });
                }
                
                // Shear springs
                if (x < segments && y < segments) {
                    point.neighbors.push({
                        index: index + segmentsPlus + 1,
                        restLength: Math.sqrt(2) * 100 / segments,
                        strength: 0.5
                    });
                }
                if (x > 0 && y < segments) {
                    point.neighbors.push({
                        index: index + segmentsPlus - 1,
                        restLength: Math.sqrt(2) * 100 / segments,
                        strength: 0.5
                    });
                }
                
                // Pin edges
                if (x === 0 || x === segments || y === 0 || y === segments) {
                    point.pinned = true;
                }
            }
        }
    }
    
    createConsciousnessSystem() {
        // Create thought particles representing AI consciousness
        const particleCount = 1000;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random position in space
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = Math.random() * 50;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            
            // Color based on "thought type"
            const thoughtType = Math.random();
            if (thoughtType < 0.33) {
                // Red - Ray's confused thoughts
                colors[i3] = 1;
                colors[i3 + 1] = 0;
                colors[i3 + 2] = 0;
            } else if (thoughtType < 0.66) {
                // Blue - Berkeley's analytical thoughts
                colors[i3] = 0;
                colors[i3 + 1] = 0.4;
                colors[i3 + 2] = 1;
            } else {
                // Grey - Switz's neutral thoughts
                colors[i3] = 0.6;
                colors[i3 + 1] = 0.6;
                colors[i3 + 2] = 0.6;
            }
            
            sizes[i] = Math.random() * 2 + 0.5;
            
            // Store particle data
            this.thoughtParticles.push({
                position: new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.5
                ),
                thoughtType: thoughtType,
                lifespan: Math.random() * 10 + 5,
                age: 0
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Thought particle shader
        const thoughtMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                breakdownIntensity: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                uniform float time;
                uniform float breakdownIntensity;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Pulsing size
                    float pulse = sin(time * 2.0 + position.x * 0.1) * 0.5 + 0.5;
                    gl_PointSize = size * (1.0 + pulse * 0.5) * (1.0 + breakdownIntensity);
                    gl_PointSize *= (300.0 / -mvPosition.z);
                    
                    // Alpha based on height and breakdown
                    vAlpha = smoothstep(0.0, 10.0, position.y) * (1.0 - breakdownIntensity * 0.5);
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    // Circular particle
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // Soft edges
                    float alpha = smoothstep(0.5, 0.3, dist) * vAlpha;
                    
                    // Glow effect
                    vec3 color = vColor * (1.0 + (1.0 - dist) * 2.0);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const thoughtSystem = new THREE.Points(particleGeometry, thoughtMaterial);
        this.scene.add(thoughtSystem);
        this.thoughtSystem = thoughtSystem;
    }
    
    createDataStreams() {
        // Create flowing data streams representing news
        const streamCount = 5;
        
        for (let i = 0; i < streamCount; i++) {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-50, 10 + i * 5, -20),
                new THREE.Vector3(-20, 15 + i * 5, 0),
                new THREE.Vector3(0, 12 + i * 5, 10),
                new THREE.Vector3(20, 8 + i * 5, 0),
                new THREE.Vector3(50, 10 + i * 5, -20)
            ]);
            
            const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.5, 8, false);
            
            const streamMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color().setHSL(i / streamCount, 1, 0.5) },
                    speed: { value: 1 + Math.random() }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    uniform float speed;
                    
                    varying vec2 vUv;
                    
                    void main() {
                        // Data flow pattern
                        float flow = fract(vUv.x - time * speed);
                        float intensity = smoothstep(0.0, 0.1, flow) * smoothstep(1.0, 0.9, flow);
                        
                        // Pulse
                        float pulse = sin(vUv.x * 20.0 - time * 10.0) * 0.5 + 0.5;
                        
                        vec3 finalColor = color * (intensity + pulse * 0.5);
                        float alpha = intensity * 0.8;
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                transparent: true,
                depthWrite: false
            });
            
            const streamMesh = new THREE.Mesh(tubeGeometry, streamMaterial);
            this.scene.add(streamMesh);
            
            this.dataStreams.push({
                mesh: streamMesh,
                curve: curve,
                material: streamMaterial,
                particles: []
            });
        }
    }
    
    setupPostProcessing() {
        const renderTarget = new THREE.WebGLRenderTarget(
            this.container.clientWidth,
            this.container.clientHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding
            }
        );
        
        this.composer = new THREE.EffectComposer(this.renderer, renderTarget);
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom pass for glow effects
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
            0.5, // Strength
            0.4, // Radius
            0.85 // Threshold
        );
        this.composer.addPass(bloomPass);
        
        // Custom glitch pass for breakdowns
        const glitchShader = {
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                intensity: { value: 0 },
                seed: { value: Math.random() }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float intensity;
                uniform float seed;
                
                varying vec2 vUv;
                
                float random(vec2 co) {
                    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    vec2 uv = vUv;
                    vec4 color = texture2D(tDiffuse, uv);
                    
                    if (intensity > 0.0) {
                        // Digital noise
                        float noise = random(uv + time * seed) * intensity;
                        
                        // Displacement glitch
                        float displaceIntensity = intensity * 0.1;
                        float displace = random(vec2(time * seed, 0.0));
                        if (displace < 0.1 * intensity) {
                            uv.x += (random(vec2(time * seed, 1.0)) - 0.5) * displaceIntensity;
                        }
                        
                        // RGB shift
                        float rgbShift = intensity * 0.01;
                        vec4 cr = texture2D(tDiffuse, uv + vec2(rgbShift, 0.0));
                        vec4 cg = texture2D(tDiffuse, uv);
                        vec4 cb = texture2D(tDiffuse, uv - vec2(rgbShift, 0.0));
                        color = vec4(cr.r, cg.g, cb.b, cg.a);
                        
                        // Scanlines
                        float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.04 * intensity;
                        color.rgb -= scanline;
                        
                        // Block glitches
                        if (random(vec2(floor(uv.y * 20.0), time * seed)) < 0.05 * intensity) {
                            color.rgb = vec3(1.0, 0.0, 0.0);
                        }
                        
                        // Add noise
                        color.rgb += vec3(noise) * 0.1;
                    }
                    
                    gl_FragColor = color;
                }
            `
        };
        
        this.glitchPass = new THREE.ShaderPass(glitchShader);
        this.glitchPass.renderToScreen = true;
        this.composer.addPass(this.glitchPass);
    }
    
    setupInteractions() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.container.addEventListener('mousemove', (event) => {
            const rect = this.container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Influence fabric with mouse
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObject(this.fabricMesh);
            
            if (intersects.length > 0) {
                const point = intersects[0].point;
                this.applyForceToFabric(point.x, point.z, 5, 10);
            }
        });
        
        // Click to create reality tear
        this.container.addEventListener('click', (event) => {
            const rect = this.container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObject(this.fabricMesh);
            
            if (intersects.length > 0) {
                const point = intersects[0].point;
                this.createRealityTear(point.x, point.z);
            }
        });
    }
    
    applyForceToFabric(x, z, radius, strength) {
        const center = new THREE.Vector2(x, z);
        
        this.fabricPoints.forEach(point => {
            const dist = new THREE.Vector2(point.position.x, point.position.z).distanceTo(center);
            if (dist < radius) {
                const force = (1 - dist / radius) * strength;
                point.velocity.y += force;
            }
        });
    }
    
    createRealityTear(x, z) {
        // Add to tear points for shader
        const tearPoints = this.fabricMesh.material.uniforms.tearPoints.value;
        
        // Find empty slot or oldest tear
        let index = tearPoints.findIndex(p => p.z <= 0);
        if (index === -1) index = 0;
        
        tearPoints[index] = new THREE.Vector3(x, z, 1.0);
        
        // Create visual effect
        const tearGeometry = new THREE.PlaneGeometry(5, 10);
        const tearMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                opacity: { value: 1 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float opacity;
                varying vec2 vUv;
                
                void main() {
                    // Tear pattern
                    float tear = abs(sin(vUv.y * 10.0 + time * 5.0) * sin(vUv.x * 20.0));
                    vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), tear);
                    
                    // Edge fade
                    float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x) *
                                smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
                    
                    gl_FragColor = vec4(color, edge * opacity);
                }
            `,
            transparent: true,
            depthWrite: false
        });
        
        const tearMesh = new THREE.Mesh(tearGeometry, tearMaterial);
        tearMesh.position.set(x, 10, z);
        tearMesh.lookAt(this.camera.position);
        this.scene.add(tearMesh);
        
        // Animate and remove
        gsap.to(tearMaterial.uniforms.opacity, {
            value: 0,
            duration: 5,
            onComplete: () => {
                this.scene.remove(tearMesh);
                tearGeometry.dispose();
                tearMaterial.dispose();
                tearPoints[index].z = 0;
            }
        });
        
        // Trigger mini breakdown
        this.triggerMiniBreakdown();
    }
    
    startBreakdownCycle() {
        // Simulate periodic reality breakdowns
        setInterval(() => {
            if (Math.random() < 0.3 && !this.isBreakingDown) {
                this.triggerBreakdown();
            }
        }, 10000); // Check every 10 seconds
    }
    
    triggerBreakdown() {
        if (this.isBreakingDown) return;
        
        this.isBreakingDown = true;
        
        // Animate breakdown
        gsap.timeline()
            .to(this, {
                breakdownIntensity: 1,
                duration: 2,
                ease: "power2.in"
            })
            .to(this, {
                realityCoherence: 0.2,
                duration: 1
            })
            .to(this, {
                breakdownIntensity: 0.8,
                duration: 3,
                ease: "power2.inOut"
            })
            .to(this, {
                breakdownIntensity: 0,
                realityCoherence: 1,
                duration: 2,
                ease: "power2.out",
                onComplete: () => {
                    this.isBreakingDown = false;
                }
            });
        
        // Screen shake
        const originalCameraPos = this.camera.position.clone();
        gsap.timeline()
            .to(this.camera.position, {
                x: originalCameraPos.x + (Math.random() - 0.5) * 5,
                y: originalCameraPos.y + (Math.random() - 0.5) * 5,
                duration: 0.1,
                repeat: 20,
                yoyo: true,
                ease: "power2.inOut"
            })
            .to(this.camera.position, {
                x: originalCameraPos.x,
                y: originalCameraPos.y,
                duration: 0.5
            });
    }
    
    triggerMiniBreakdown() {
        gsap.timeline()
            .to(this, {
                breakdownIntensity: 0.5,
                duration: 0.5,
                ease: "power2.in"
            })
            .to(this, {
                breakdownIntensity: 0,
                duration: 1,
                ease: "power2.out"
            });
    }
    
    updateFabricPhysics() {
        const positions = this.fabricMesh.geometry.attributes.position;
        
        // Update fabric points
        this.fabricPoints.forEach((point, index) => {
            if (!point.pinned) {
                // Apply gravity
                point.velocity.y -= 0.1;
                
                // Apply spring forces
                point.neighbors.forEach(neighbor => {
                    const neighborPoint = this.fabricPoints[neighbor.index];
                    const distance = point.position.distanceTo(neighborPoint.position);
                    const difference = distance - neighbor.restLength;
                    
                    const direction = neighborPoint.position.clone()
                        .sub(point.position)
                        .normalize();
                    
                    const force = direction.multiplyScalar(difference * neighbor.strength);
                    point.velocity.add(force.multiplyScalar(0.1));
                });
                
                // Damping
                point.velocity.multiplyScalar(0.98);
                
                // Update position
                point.position.add(point.velocity.clone().multiplyScalar(0.1));
                
                // Constrain to reasonable bounds
                point.position.y = Math.max(-10, Math.min(20, point.position.y));
            }
            
            // Update geometry
            positions.setXYZ(index, point.position.x, point.position.y, point.position.z);
        });
        
        positions.needsUpdate = true;
        this.fabricMesh.geometry.computeVertexNormals();
    }
    
    updateThoughtParticles() {
        const positions = this.thoughtSystem.geometry.attributes.position;
        const colors = this.thoughtSystem.geometry.attributes.color;
        const sizes = this.thoughtSystem.geometry.attributes.size;
        
        this.thoughtParticles.forEach((particle, index) => {
            // Update physics
            particle.velocity.y += 0.01; // Float upward
            
            // Swirl around based on thought type
            const swirl = particle.thoughtType * Math.PI * 2;
            particle.velocity.x += Math.sin(this.clock.elapsedTime + swirl) * 0.01;
            particle.velocity.z += Math.cos(this.clock.elapsedTime + swirl) * 0.01;
            
            // During breakdown, thoughts become erratic
            if (this.breakdownIntensity > 0) {
                particle.velocity.add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * this.breakdownIntensity,
                        (Math.random() - 0.5) * this.breakdownIntensity,
                        (Math.random() - 0.5) * this.breakdownIntensity
                    )
                );
            }
            
            // Update position
            particle.position.add(particle.velocity);
            particle.age += 0.016;
            
            // Respawn if too old or out of bounds
            if (particle.age > particle.lifespan || particle.position.y > 60) {
                particle.position.set(
                    (Math.random() - 0.5) * 100,
                    0,
                    (Math.random() - 0.5) * 100
                );
                particle.velocity.set(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                particle.age = 0;
                particle.lifespan = Math.random() * 10 + 5;
            }
            
            // Update buffer
            positions.setXYZ(index, particle.position.x, particle.position.y, particle.position.z);
            
            // Pulse size
            sizes.setX(index, (Math.sin(particle.age * 2) * 0.5 + 1) * (particle.age < 1 ? particle.age : 1));
            
            // Fade color during breakdown
            const fade = 1 - this.breakdownIntensity * 0.5;
            colors.setXYZ(
                index,
                colors.getX(index) * fade,
                colors.getY(index) * fade,
                colors.getZ(index) * fade
            );
        });
        
        positions.needsUpdate = true;
        colors.needsUpdate = true;
        sizes.needsUpdate = true;
    }
    
    setupStats() {
        if (window.Stats) {
            this.stats = new Stats();
            this.stats.showPanel(0);
            this.container.appendChild(this.stats.dom);
            this.stats.dom.style.position = 'absolute';
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.stats) this.stats.begin();
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.elapsedTime;
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Update fabric physics
        this.updateFabricPhysics();
        
        // Update thought particles
        this.updateThoughtParticles();
        
        // Update shader uniforms
        if (this.fabricMesh) {
            this.fabricMesh.material.uniforms.time.value = elapsedTime;
            this.fabricMesh.material.uniforms.realityCoherence.value = this.realityCoherence;
            this.fabricMesh.material.uniforms.breakdownIntensity.value = this.breakdownIntensity;
        }
        
        if (this.thoughtSystem) {
            this.thoughtSystem.material.uniforms.time.value = elapsedTime;
            this.thoughtSystem.material.uniforms.breakdownIntensity.value = this.breakdownIntensity;
        }
        
        // Update data streams
        this.dataStreams.forEach(stream => {
            stream.material.uniforms.time.value = elapsedTime;
        });
        
        // Update glitch pass
        if (this.glitchPass) {
            this.glitchPass.uniforms.time.value = elapsedTime;
            this.glitchPass.uniforms.intensity.value = this.breakdownIntensity;
        }
        
        // Render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        if (this.stats) this.stats.end();
    }
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    dispose() {
        // Clean up all resources
        if (this.scene) {
            this.scene.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.composer) {
            this.composer.dispose();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onResize);
    }
}

// Export
window.RealityFabricBackground = RealityFabricBackground;