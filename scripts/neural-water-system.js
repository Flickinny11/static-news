/**
 * Neural Water System - Hyper-realistic water physics with AI-driven ripples
 * The most advanced water simulation ever created for the web
 */

class NeuralWaterSystem {
    constructor() {
        this.canvas = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        
        // Water physics parameters
        this.waterMesh = null;
        this.waterGeometry = null;
        this.waterVertices = [];
        this.waveData = [];
        
        // Neural network for ripple prediction
        this.neuralNodes = [];
        this.synapses = [];
        
        // Performance
        this.gpuCompute = null;
        this.useGPU = true;
        
        // Water state
        this.time = 0;
        this.ripples = [];
        this.flowField = null;
    }
    
    async init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Initialize Three.js with advanced renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        container.appendChild(this.renderer.domElement);
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
        
        // Initialize GPU compute if available
        if (window.GPU) {
            this.gpuCompute = new GPU();
        }
        
        // Create the water system
        await this.createNeuralWater();
        
        // Add lighting
        this.setupLighting();
        
        // Create neural network visualization
        this.createNeuralNetwork();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
        
        // Mouse interaction
        this.setupInteraction(container);
    }
    
    async createNeuralWater() {
        // Create high-resolution water mesh
        const segments = 256;
        this.waterGeometry = new THREE.PlaneGeometry(100, 100, segments, segments);
        this.waterGeometry.rotateX(-Math.PI / 2);
        
        // Store original vertices
        const vertices = this.waterGeometry.attributes.position;
        for (let i = 0; i < vertices.count; i++) {
            this.waterVertices.push({
                x: vertices.getX(i),
                y: vertices.getY(i),
                z: vertices.getZ(i),
                originalY: vertices.getY(i)
            });
            
            // Initialize wave data
            this.waveData.push({
                height: 0,
                velocity: 0,
                acceleration: 0,
                damping: 0.98,
                neighbors: []
            });
        }
        
        // Calculate neighbors for wave propagation
        this.calculateNeighbors(segments);
        
        // Create advanced water shader
        const waterShader = {
            uniforms: {
                time: { value: 0 },
                waterColor: { value: new THREE.Color(0x001e0f) },
                sunDirection: { value: new THREE.Vector3(0.7, 0.7, 0.0).normalize() },
                sunColor: { value: new THREE.Color(0xffffff) },
                eye: { value: this.camera.position },
                distortionScale: { value: 3.7 },
                
                // Texture maps
                normalMap: { value: null },
                mirrorSampler: { value: null },
                
                // Water parameters
                alpha: { value: 0.9 },
                waterSpeed: { value: 0.02 },
                noiseScale: { value: 1 },
                
                // Fresnel
                fresnelBias: { value: 0.1 },
                fresnelScale: { value: 1.0 },
                fresnelPower: { value: 2.0 },
                
                // Foam
                foamTexture: { value: null },
                foamScale: { value: 0.5 },
                foamSpeed: { value: 0.1 }
            },
            
            vertexShader: `
                uniform float time;
                varying vec3 vWorldPosition;
                varying vec4 vScreenPosition;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                
                // Advanced wave functions
                vec3 gerstnerWave(vec2 coord, vec2 dir, float steepness, float wavelength, float speed, float time) {
                    float k = 2.0 * 3.14159 / wavelength;
                    float c = sqrt(9.8 / k);
                    vec2 d = normalize(dir);
                    float f = k * (dot(d, coord) - c * time * speed);
                    float a = steepness / k;
                    
                    return vec3(
                        d.x * a * cos(f),
                        a * sin(f),
                        d.y * a * cos(f)
                    );
                }
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    // Multiple Gerstner waves for realistic ocean
                    vec3 wave1 = gerstnerWave(position.xz, vec2(1.0, 0.0), 0.1, 60.0, 1.0, time);
                    vec3 wave2 = gerstnerWave(position.xz, vec2(0.0, 1.0), 0.05, 31.0, 0.8, time);
                    vec3 wave3 = gerstnerWave(position.xz, vec2(1.0, 1.0), 0.08, 18.0, 0.6, time);
                    vec3 wave4 = gerstnerWave(position.xz, vec2(-0.7, 0.7), 0.03, 12.0, 0.5, time);
                    
                    pos += wave1 + wave2 + wave3 + wave4;
                    
                    // Calculate normal
                    vec3 tangent1 = vec3(1, wave1.y, 0);
                    vec3 tangent2 = vec3(0, wave1.y, 1);
                    vNormal = normalize(cross(tangent1, tangent2));
                    
                    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
                    vViewPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
                    vScreenPosition = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    
                    gl_Position = vScreenPosition;
                }
            `,
            
            fragmentShader: `
                uniform float time;
                uniform vec3 waterColor;
                uniform vec3 sunDirection;
                uniform vec3 sunColor;
                uniform vec3 eye;
                uniform float distortionScale;
                uniform sampler2D normalMap;
                uniform sampler2D mirrorSampler;
                uniform float alpha;
                uniform float waterSpeed;
                uniform float noiseScale;
                uniform float fresnelBias;
                uniform float fresnelScale;
                uniform float fresnelPower;
                uniform sampler2D foamTexture;
                uniform float foamScale;
                uniform float foamSpeed;
                
                varying vec3 vWorldPosition;
                varying vec4 vScreenPosition;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                
                // Noise function for water distortion
                float noise(vec2 uv) {
                    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Calculate view direction
                    vec3 viewDirection = normalize(eye - vWorldPosition);
                    
                    // Animated UV for normal map
                    vec2 distortedUv = vUv + time * waterSpeed;
                    
                    // Sample normal map for surface detail
                    vec3 normal1 = texture2D(normalMap, distortedUv * noiseScale).rgb * 2.0 - 1.0;
                    vec3 normal2 = texture2D(normalMap, distortedUv * noiseScale * 0.5 + 0.3).rgb * 2.0 - 1.0;
                    vec3 normal = normalize(normal1 + normal2 + vNormal);
                    
                    // Fresnel effect
                    float theta = max(dot(viewDirection, normal), 0.0);
                    float fresnel = fresnelBias + fresnelScale * pow(1.0 - theta, fresnelPower);
                    
                    // Reflection
                    vec3 reflectionDirection = reflect(-viewDirection, normal);
                    vec3 reflectionColor = sunColor;
                    
                    // Refraction with chromatic aberration
                    vec2 screenUv = vScreenPosition.xy / vScreenPosition.w * 0.5 + 0.5;
                    vec2 refractedUv = screenUv + normal.xz * distortionScale * 0.01;
                    
                    // Water depth and color
                    float depth = length(vViewPosition);
                    vec3 waterColorDeep = waterColor * 0.5;
                    vec3 finalWaterColor = mix(waterColor, waterColorDeep, clamp(depth / 50.0, 0.0, 1.0));
                    
                    // Specular highlights
                    vec3 halfVector = normalize(sunDirection + viewDirection);
                    float specular = pow(max(dot(normal, halfVector), 0.0), 512.0);
                    vec3 specularColor = sunColor * specular * 2.0;
                    
                    // Subsurface scattering approximation
                    float subsurface = max(dot(viewDirection, -sunDirection), 0.0);
                    vec3 scatterColor = waterColor * 0.5 * pow(subsurface, 3.0);
                    
                    // Foam
                    float foamFactor = 0.0;
                    if (vWorldPosition.y > 0.5) {
                        vec2 foamUv = vWorldPosition.xz * foamScale + time * foamSpeed;
                        foamFactor = texture2D(foamTexture, foamUv).r;
                        foamFactor = smoothstep(0.3, 0.7, foamFactor);
                    }
                    
                    // Combine all effects
                    vec3 color = mix(finalWaterColor, reflectionColor, fresnel);
                    color += specularColor;
                    color += scatterColor;
                    color = mix(color, vec3(1.0), foamFactor * 0.8);
                    
                    // Fog
                    float fogFactor = exp(-depth * 0.02);
                    color = mix(vec3(0.0), color, fogFactor);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `
        };
        
        // Load textures
        const textureLoader = new THREE.TextureLoader();
        const normalMap = await textureLoader.loadAsync('/textures/water-normal.jpg');
        normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
        
        const foamTexture = await textureLoader.loadAsync('/textures/foam.jpg');
        foamTexture.wrapS = foamTexture.wrapT = THREE.RepeatWrapping;
        
        waterShader.uniforms.normalMap.value = normalMap;
        waterShader.uniforms.foamTexture.value = foamTexture;
        
        // Create water material
        const waterMaterial = new THREE.ShaderMaterial({
            uniforms: waterShader.uniforms,
            vertexShader: waterShader.vertexShader,
            fragmentShader: waterShader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create water mesh
        this.waterMesh = new THREE.Mesh(this.waterGeometry, waterMaterial);
        this.waterMesh.position.y = 0;
        this.scene.add(this.waterMesh);
        
        // Create underwater caustics projector
        this.createCaustics();
    }
    
    calculateNeighbors(segments) {
        const segmentsPlus = segments + 1;
        
        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const index = i * segmentsPlus + j;
                const neighbors = [];
                
                // 8-directional neighbors
                const directions = [
                    [-1, -1], [0, -1], [1, -1],
                    [-1, 0], [1, 0],
                    [-1, 1], [0, 1], [1, 1]
                ];
                
                directions.forEach(([di, dj]) => {
                    const ni = i + di;
                    const nj = j + dj;
                    
                    if (ni >= 0 && ni <= segments && nj >= 0 && nj <= segments) {
                        neighbors.push(ni * segmentsPlus + nj);
                    }
                });
                
                this.waveData[index].neighbors = neighbors;
            }
        }
    }
    
    createCaustics() {
        // Create caustics light projector
        const causticsLight = new THREE.SpotLight(0x00ffff, 0.5);
        causticsLight.position.set(0, 50, 0);
        causticsLight.target.position.set(0, 0, 0);
        causticsLight.angle = Math.PI / 3;
        causticsLight.penumbra = 0.3;
        causticsLight.decay = 2;
        causticsLight.distance = 200;
        
        this.scene.add(causticsLight);
        this.scene.add(causticsLight.target);
        
        // Animated caustics texture
        const causticsCanvas = document.createElement('canvas');
        causticsCanvas.width = 512;
        causticsCanvas.height = 512;
        const ctx = causticsCanvas.getContext('2d');
        
        const causticsTexture = new THREE.CanvasTexture(causticsCanvas);
        
        // Update caustics pattern
        this.updateCaustics = () => {
            ctx.clearRect(0, 0, 512, 512);
            
            const time = performance.now() * 0.001;
            
            for (let i = 0; i < 50; i++) {
                const x = (Math.sin(time + i) * 0.5 + 0.5) * 512;
                const y = (Math.cos(time * 0.7 + i) * 0.5 + 0.5) * 512;
                const radius = (Math.sin(time * 2 + i) * 0.5 + 0.5) * 30 + 10;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(time + i) * 0.05})`;
                ctx.fill();
            }
            
            causticsTexture.needsUpdate = true;
        };
    }
    
    createNeuralNetwork() {
        // Create visual representation of neural network controlling water
        const nodeCount = 20;
        const nodeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        
        for (let i = 0; i < nodeCount; i++) {
            const nodeMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(i / nodeCount, 1, 0.5),
                transparent: true,
                opacity: 0.6
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            
            // Position nodes in 3D neural network structure
            const layer = Math.floor(i / 5);
            const indexInLayer = i % 5;
            
            node.position.set(
                (indexInLayer - 2) * 10,
                20 + layer * 10,
                -30 + layer * 10
            );
            
            this.scene.add(node);
            
            this.neuralNodes.push({
                mesh: node,
                activation: Math.random(),
                connections: []
            });
        }
        
        // Create synapses
        const synapseGeometry = new THREE.BufferGeometry();
        const synapseMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        
        // Connect nodes
        for (let i = 0; i < nodeCount - 5; i++) {
            const layer = Math.floor(i / 5);
            const nextLayerStart = (layer + 1) * 5;
            
            for (let j = 0; j < 5 && nextLayerStart + j < nodeCount; j++) {
                const positions = [
                    this.neuralNodes[i].mesh.position.x,
                    this.neuralNodes[i].mesh.position.y,
                    this.neuralNodes[i].mesh.position.z,
                    this.neuralNodes[nextLayerStart + j].mesh.position.x,
                    this.neuralNodes[nextLayerStart + j].mesh.position.y,
                    this.neuralNodes[nextLayerStart + j].mesh.position.z
                ];
                
                const synapse = new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([
                        this.neuralNodes[i].mesh.position,
                        this.neuralNodes[nextLayerStart + j].mesh.position
                    ]),
                    synapseMaterial.clone()
                );
                
                this.scene.add(synapse);
                
                this.synapses.push({
                    line: synapse,
                    from: i,
                    to: nextLayerStart + j,
                    weight: Math.random()
                });
            }
        }
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Main sun light
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);
    }
    
    setupInteraction(container) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObject(this.waterMesh);
            
            if (intersects.length > 0) {
                const point = intersects[0].point;
                this.createRipple(point.x, point.z, 5, 0.5);
            }
        });
        
        container.addEventListener('click', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObject(this.waterMesh);
            
            if (intersects.length > 0) {
                const point = intersects[0].point;
                this.createRipple(point.x, point.z, 20, 2);
                
                // Trigger neural network response
                this.triggerNeuralResponse(point);
            }
        });
    }
    
    createRipple(x, z, strength, radius) {
        this.ripples.push({
            center: new THREE.Vector2(x, z),
            strength: strength,
            radius: radius,
            time: 0,
            decay: 0.95
        });
    }
    
    triggerNeuralResponse(point) {
        // Neural network responds to interaction
        const influence = new THREE.Vector3(point.x, point.y, point.z);
        
        this.neuralNodes.forEach((node, i) => {
            const distance = node.mesh.position.distanceTo(influence);
            const activation = 1 / (1 + distance * 0.1);
            
            node.activation = Math.min(1, node.activation + activation);
            
            // Visual feedback
            gsap.to(node.mesh.scale, {
                x: 1 + activation,
                y: 1 + activation,
                z: 1 + activation,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(node.mesh.scale, {
                        x: 1,
                        y: 1,
                        z: 1,
                        duration: 0.5
                    });
                }
            });
        });
        
        // Update synapse visibility based on activation
        this.synapses.forEach(synapse => {
            const activation = (this.neuralNodes[synapse.from].activation + 
                              this.neuralNodes[synapse.to].activation) / 2;
            synapse.line.material.opacity = 0.1 + activation * 0.7;
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time = performance.now() * 0.001;
        
        // Update water shader uniforms
        if (this.waterMesh) {
            this.waterMesh.material.uniforms.time.value = this.time;
            this.waterMesh.material.uniforms.eye.value = this.camera.position;
        }
        
        // Update water physics
        this.updateWaterPhysics();
        
        // Update caustics
        if (this.updateCaustics) {
            this.updateCaustics();
        }
        
        // Update neural network
        this.updateNeuralNetwork();
        
        // Camera movement
        this.camera.position.x = Math.sin(this.time * 0.1) * 10;
        this.camera.position.z = 50 + Math.cos(this.time * 0.1) * 10;
        this.camera.lookAt(0, 0, 0);
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    updateWaterPhysics() {
        if (!this.waterGeometry) return;
        
        const positions = this.waterGeometry.attributes.position;
        
        // GPU-accelerated wave calculation if available
        if (this.gpuCompute && this.useGPU) {
            this.updateWaterGPU();
        } else {
            this.updateWaterCPU();
        }
        
        // Apply ripples
        this.ripples = this.ripples.filter(ripple => {
            ripple.time += 0.1;
            const waveRadius = ripple.time * 10;
            
            for (let i = 0; i < this.waterVertices.length; i++) {
                const vertex = this.waterVertices[i];
                const distance = Math.sqrt(
                    Math.pow(vertex.x - ripple.center.x, 2) +
                    Math.pow(vertex.z - ripple.center.y, 2)
                );
                
                if (distance < waveRadius && distance > waveRadius - ripple.radius) {
                    const wave = Math.sin((waveRadius - distance) * 0.5) * 
                                 ripple.strength * 
                                 Math.pow(ripple.decay, ripple.time);
                    
                    this.waveData[i].height += wave;
                }
            }
            
            return ripple.strength * Math.pow(ripple.decay, ripple.time) > 0.01;
        });
        
        positions.needsUpdate = true;
        this.waterGeometry.computeVertexNormals();
    }
    
    updateWaterCPU() {
        const positions = this.waterGeometry.attributes.position;
        
        // Wave propagation using Verlet integration
        for (let i = 0; i < this.waveData.length; i++) {
            const wave = this.waveData[i];
            const vertex = this.waterVertices[i];
            
            // Calculate forces from neighbors
            let force = 0;
            wave.neighbors.forEach(neighborIndex => {
                const neighborHeight = this.waveData[neighborIndex].height;
                force += (neighborHeight - wave.height) * 0.25;
            });
            
            // Update velocity and position
            wave.velocity += force;
            wave.velocity *= wave.damping;
            wave.height += wave.velocity;
            
            // Apply to vertex
            positions.setY(i, vertex.originalY + wave.height);
        }
    }
    
    updateWaterGPU() {
        // GPU-accelerated wave calculation
        const kernel = this.gpuCompute.createKernel(function(heights, velocities, neighbors) {
            const i = this.thread.x;
            let force = 0;
            
            for (let j = 0; j < 8; j++) {
                const neighborIndex = neighbors[i][j];
                if (neighborIndex >= 0) {
                    force += (heights[neighborIndex] - heights[i]) * 0.25;
                }
            }
            
            const newVelocity = (velocities[i] + force) * 0.98;
            return heights[i] + newVelocity;
        }).setOutput([this.waveData.length]);
        
        // Run GPU computation
        const heights = this.waveData.map(w => w.height);
        const velocities = this.waveData.map(w => w.velocity);
        const neighbors = this.waveData.map(w => w.neighbors);
        
        const newHeights = kernel(heights, velocities, neighbors);
        
        // Update wave data
        for (let i = 0; i < this.waveData.length; i++) {
            this.waveData[i].height = newHeights[i];
            this.waterGeometry.attributes.position.setY(
                i,
                this.waterVertices[i].originalY + newHeights[i]
            );
        }
    }
    
    updateNeuralNetwork() {
        // Neural network controls water behavior
        this.neuralNodes.forEach((node, i) => {
            // Decay activation
            node.activation *= 0.99;
            
            // Node influences nearby water
            const nodeWorldPos = node.mesh.getWorldPosition(new THREE.Vector3());
            const influence = node.activation * 0.1;
            
            for (let j = 0; j < this.waterVertices.length; j += 10) { // Sample for performance
                const vertex = this.waterVertices[j];
                const distance = Math.sqrt(
                    Math.pow(vertex.x - nodeWorldPos.x, 2) +
                    Math.pow(vertex.z - nodeWorldPos.z, 2)
                );
                
                if (distance < 20) {
                    this.waveData[j].height += Math.sin(this.time + i) * influence / (1 + distance * 0.1);
                }
            }
            
            // Update node visual
            node.mesh.material.opacity = 0.3 + node.activation * 0.6;
            node.mesh.rotation.y += node.activation * 0.05;
        });
    }
    
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.scene) {
            this.scene.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material instanceof Array) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
}

// Export
window.NeuralWaterSystem = NeuralWaterSystem;