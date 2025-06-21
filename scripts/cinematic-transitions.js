// Cinematic Page Transitions - Hollywood-level scene transitions
// Uses Theatre.js, GSAP, and custom WebGL effects

class CinematicTransitions {
    constructor() {
        this.currentTransition = null;
        this.transitionLibrary = new Map();
        this.activeEffects = [];
        
        this.initializeTheatre();
        this.createTransitionLibrary();
        this.setupBarba();
    }

    initializeTheatre() {
        // Initialize Theatre.js for timeline-based animations
        this.project = Theatre.getProject('Static News Transitions', {
            state: {
                definitionVersion: '0.4.0',
                sheets: [],
                address: { projectId: 'Static News Transitions' }
            }
        });
        
        this.sheet = this.project.sheet('Main');
    }

    createTransitionLibrary() {
        // Quantum Dissolve - Particles disintegrate and reform
        this.transitionLibrary.set('quantum-dissolve', {
            duration: 2000,
            effect: (oldContainer, newContainer) => {
                return this.quantumDissolve(oldContainer, newContainer);
            }
        });
        
        // Neural Network - Synaptic connections form between pages
        this.transitionLibrary.set('neural-network', {
            duration: 2500,
            effect: (oldContainer, newContainer) => {
                return this.neuralNetworkTransition(oldContainer, newContainer);
            }
        });
        
        // Holographic Wipe - 3D hologram transition
        this.transitionLibrary.set('holographic-wipe', {
            duration: 1800,
            effect: (oldContainer, newContainer) => {
                return this.holographicWipe(oldContainer, newContainer);
            }
        });
        
        // Time Dilation - Temporal distortion effect
        this.transitionLibrary.set('time-dilation', {
            duration: 3000,
            effect: (oldContainer, newContainer) => {
                return this.timeDilationTransition(oldContainer, newContainer);
            }
        });
        
        // Reality Glitch - Matrix-style reality tear
        this.transitionLibrary.set('reality-glitch', {
            duration: 2200,
            effect: (oldContainer, newContainer) => {
                return this.realityGlitchTransition(oldContainer, newContainer);
            }
        });
    }

    quantumDissolve(oldContainer, newContainer) {
        return new Promise((resolve) => {
            // Create particle system for dissolve effect
            const canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '10000';
            canvas.style.pointerEvents = 'none';
            document.body.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Capture old page as image data
            html2canvas(oldContainer).then(oldCanvas => {
                const imageData = oldCanvas.getContext('2d').getImageData(0, 0, oldCanvas.width, oldCanvas.height);
                const particles = [];
                
                // Create particles from pixels
                for (let y = 0; y < imageData.height; y += 4) {
                    for (let x = 0; x < imageData.width; x += 4) {
                        const index = (y * imageData.width + x) * 4;
                        const r = imageData.data[index];
                        const g = imageData.data[index + 1];
                        const b = imageData.data[index + 2];
                        const a = imageData.data[index + 3];
                        
                        if (a > 0) {
                            particles.push({
                                x: x,
                                y: y,
                                vx: (Math.random() - 0.5) * 10,
                                vy: (Math.random() - 0.5) * 10,
                                vz: Math.random() * 5,
                                color: `rgba(${r},${g},${b},${a/255})`,
                                size: 2,
                                life: 1
                            });
                        }
                    }
                }
                
                // Animate particles
                const timeline = gsap.timeline({
                    onComplete: () => {
                        canvas.remove();
                        resolve();
                    }
                });
                
                // Hide old container
                timeline.to(oldContainer, {
                    opacity: 0,
                    duration: 0.3
                });
                
                // Particle animation
                let animationId;
                const animate = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Apply quantum field effect
                    ctx.globalCompositeOperation = 'lighter';
                    
                    particles.forEach(particle => {
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.size *= 0.98;
                        particle.life *= 0.97;
                        
                        // Quantum tunneling effect
                        if (Math.random() < 0.01) {
                            particle.x += (Math.random() - 0.5) * 50;
                            particle.y += (Math.random() - 0.5) * 50;
                        }
                        
                        ctx.save();
                        ctx.globalAlpha = particle.life;
                        ctx.fillStyle = particle.color;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = particle.color;
                        
                        // Draw particle with quantum uncertainty
                        const uncertainty = Math.sin(Date.now() * 0.01 + particle.x) * 2;
                        ctx.beginPath();
                        ctx.arc(
                            particle.x + uncertainty,
                            particle.y,
                            particle.size,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                        ctx.restore();
                    });
                    
                    // Remove dead particles
                    particles.filter(p => p.life > 0.01);
                    
                    if (particles.length > 0) {
                        animationId = requestAnimationFrame(animate);
                    } else {
                        cancelAnimationFrame(animationId);
                    }
                };
                
                animate();
                
                // Show new container with materialization effect
                timeline.fromTo(newContainer, {
                    opacity: 0,
                    scale: 0.8,
                    filter: 'blur(20px)'
                }, {
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power3.out'
                }, '-=0.5');
            });
        });
    }

    neuralNetworkTransition(oldContainer, newContainer) {
        return new Promise((resolve) => {
            // Create neural network visualization
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.position = 'fixed';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.zIndex = '10000';
            svg.style.pointerEvents = 'none';
            document.body.appendChild(svg);
            
            const neurons = [];
            const connections = [];
            
            // Create neural network structure
            for (let layer = 0; layer < 5; layer++) {
                const neuronsInLayer = 10 - layer * 2;
                for (let i = 0; i < neuronsInLayer; i++) {
                    const x = (layer / 4) * window.innerWidth;
                    const y = ((i + 1) / (neuronsInLayer + 1)) * window.innerHeight;
                    
                    neurons.push({
                        x,
                        y,
                        layer,
                        activation: 0,
                        element: null
                    });
                }
            }
            
            // Create connections
            neurons.forEach((neuron, i) => {
                neurons.forEach((target, j) => {
                    if (target.layer === neuron.layer + 1 && Math.random() > 0.3) {
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', `M${neuron.x},${neuron.y} L${target.x},${target.y}`);
                        path.setAttribute('stroke', '#ff0000');
                        path.setAttribute('stroke-width', '0.5');
                        path.setAttribute('opacity', '0');
                        svg.appendChild(path);
                        
                        connections.push({
                            path,
                            source: neuron,
                            target,
                            strength: Math.random()
                        });
                    }
                });
            });
            
            // Create neuron circles
            neurons.forEach(neuron => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', neuron.x);
                circle.setAttribute('cy', neuron.y);
                circle.setAttribute('r', '5');
                circle.setAttribute('fill', '#ffffff');
                circle.setAttribute('opacity', '0');
                svg.appendChild(circle);
                neuron.element = circle;
            });
            
            // Animate neural activation
            const timeline = gsap.timeline({
                onComplete: () => {
                    svg.remove();
                    resolve();
                }
            });
            
            // Hide old content
            timeline.to(oldContainer, {
                opacity: 0,
                scale: 0.95,
                duration: 0.5
            });
            
            // Activate neurons in waves
            neurons.forEach((neuron, i) => {
                timeline.to(neuron.element, {
                    opacity: 1,
                    attr: { r: 8 },
                    duration: 0.2,
                    ease: 'power2.out'
                }, i * 0.02);
            });
            
            // Activate connections
            connections.forEach((connection, i) => {
                timeline.to(connection.path, {
                    opacity: connection.strength,
                    duration: 0.3,
                    ease: 'power2.inOut'
                }, i * 0.01);
            });
            
            // Pulse through network
            timeline.to(connections.map(c => c.path), {
                stroke: '#00ffff',
                stagger: {
                    each: 0.01,
                    from: 'start'
                },
                duration: 0.5
            });
            
            // Show new content
            timeline.fromTo(newContainer, {
                opacity: 0,
                scale: 1.1,
                filter: 'saturate(0) blur(10px)'
            }, {
                opacity: 1,
                scale: 1,
                filter: 'saturate(1) blur(0px)',
                duration: 1,
                ease: 'power3.out'
            }, '-=0.5');
            
            // Fade out network
            timeline.to(svg, {
                opacity: 0,
                duration: 0.5
            });
        });
    }

    holographicWipe(oldContainer, newContainer) {
        return new Promise((resolve) => {
            // Create WebGL canvas for holographic effect
            const canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '10000';
            document.body.appendChild(canvas);
            
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(
                -1, 1, 1, -1, 0.1, 10
            );
            camera.position.z = 1;
            
            // Create holographic shader
            const hologramMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    progress: { value: 0 },
                    oldTexture: { value: null },
                    newTexture: { value: null }
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
                    uniform float progress;
                    uniform sampler2D oldTexture;
                    uniform sampler2D newTexture;
                    varying vec2 vUv;
                    
                    vec3 hologram(vec2 uv, float t) {
                        vec3 color = vec3(0.0);
                        
                        // Scanlines
                        float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.04;
                        uv.x += scanline * (1.0 - t);
                        
                        // Chromatic aberration
                        vec3 tex;
                        tex.r = texture2D(t < 0.5 ? oldTexture : newTexture, uv + vec2(0.002, 0.0)).r;
                        tex.g = texture2D(t < 0.5 ? oldTexture : newTexture, uv).g;
                        tex.b = texture2D(t < 0.5 ? oldTexture : newTexture, uv - vec2(0.002, 0.0)).b;
                        
                        // Holographic interference
                        float interference = sin(uv.x * 100.0 + time * 5.0) * sin(uv.y * 100.0 - time * 3.0);
                        color = tex + vec3(0.0, 0.5, 1.0) * interference * 0.1;
                        
                        // Glitch effect at transition point
                        if (abs(uv.x - t) < 0.1) {
                            color = mix(color, vec3(0.0, 1.0, 1.0), sin(time * 50.0) * 0.5 + 0.5);
                        }
                        
                        return color;
                    }
                    
                    void main() {
                        vec3 color = hologram(vUv, progress);
                        float alpha = 1.0;
                        
                        // Wipe effect
                        if (vUv.x < progress) {
                            color = texture2D(newTexture, vUv).rgb;
                        } else {
                            color = texture2D(oldTexture, vUv).rgb;
                        }
                        
                        // Holographic edge
                        float edge = abs(vUv.x - progress);
                        if (edge < 0.02) {
                            color += vec3(0.0, 1.0, 1.0) * (1.0 - edge / 0.02);
                        }
                        
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
                transparent: true
            });
            
            const geometry = new THREE.PlaneGeometry(2, 2);
            const mesh = new THREE.Mesh(geometry, hologramMaterial);
            scene.add(mesh);
            
            // Capture textures
            Promise.all([
                html2canvas(oldContainer),
                html2canvas(newContainer)
            ]).then(([oldCanvas, newCanvas]) => {
                const oldTexture = new THREE.CanvasTexture(oldCanvas);
                const newTexture = new THREE.CanvasTexture(newCanvas);
                
                hologramMaterial.uniforms.oldTexture.value = oldTexture;
                hologramMaterial.uniforms.newTexture.value = newTexture;
                
                // Hide containers
                oldContainer.style.opacity = '0';
                newContainer.style.opacity = '0';
                
                // Animate
                const timeline = gsap.timeline({
                    onUpdate: () => {
                        hologramMaterial.uniforms.time.value = performance.now() * 0.001;
                        renderer.render(scene, camera);
                    },
                    onComplete: () => {
                        newContainer.style.opacity = '1';
                        canvas.remove();
                        resolve();
                    }
                });
                
                timeline.to(hologramMaterial.uniforms.progress, {
                    value: 1,
                    duration: 1.8,
                    ease: 'power2.inOut'
                });
            });
        });
    }

    timeDilationTransition(oldContainer, newContainer) {
        return new Promise((resolve) => {
            const timeline = gsap.timeline({
                onComplete: resolve
            });
            
            // Create time dilation effect layers
            const layers = [];
            for (let i = 0; i < 10; i++) {
                const layer = oldContainer.cloneNode(true);
                layer.style.position = 'fixed';
                layer.style.top = '0';
                layer.style.left = '0';
                layer.style.width = '100%';
                layer.style.height = '100%';
                layer.style.zIndex = 9000 + i;
                layer.style.opacity = 1 - i * 0.1;
                document.body.appendChild(layer);
                layers.push(layer);
            }
            
            // Hide original
            timeline.set(oldContainer, { opacity: 0 });
            
            // Time dilation animation
            layers.forEach((layer, i) => {
                timeline.to(layer, {
                    scale: 1 + i * 0.1,
                    rotation: i * 5,
                    opacity: 0,
                    duration: 1.5,
                    ease: 'power3.in',
                    stagger: 0.1
                }, i * 0.05);
                
                // Temporal distortion
                timeline.to(layer, {
                    filter: `blur(${i * 2}px) hue-rotate(${i * 30}deg)`,
                    duration: 0.5
                }, '<');
            });
            
            // Reality stabilization
            timeline.fromTo(newContainer, {
                scale: 0.5,
                rotation: 180,
                opacity: 0,
                filter: 'blur(50px) saturate(0)'
            }, {
                scale: 1,
                rotation: 0,
                opacity: 1,
                filter: 'blur(0px) saturate(1)',
                duration: 1.5,
                ease: 'back.out(1.2)'
            }, '-=1');
            
            // Cleanup
            timeline.add(() => {
                layers.forEach(layer => layer.remove());
            });
        });
    }

    realityGlitchTransition(oldContainer, newContainer) {
        return new Promise((resolve) => {
            // Create glitch canvas
            const canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '10000';
            document.body.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Capture current state
            html2canvas(oldContainer).then(screenshot => {
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                const glitchData = ctx.createImageData(canvas.width, canvas.height);
                
                // Create glitch effect
                const glitchAnimation = () => {
                    ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
                    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // RGB channel shifting
                    for (let i = 0; i < data.data.length; i += 4) {
                        const glitchAmount = Math.random();
                        if (glitchAmount > 0.95) {
                            // Major glitch
                            data.data[i] = data.data[i + 4] || 255;     // R
                            data.data[i + 1] = data.data[i - 4] || 0;   // G
                            data.data[i + 2] = data.data[i + 8] || 0;   // B
                        } else if (glitchAmount > 0.9) {
                            // Color inversion
                            data.data[i] = 255 - data.data[i];
                            data.data[i + 1] = 255 - data.data[i + 1];
                            data.data[i + 2] = 255 - data.data[i + 2];
                        }
                    }
                    
                    // Datamoshing effect
                    const moshAmount = Math.sin(Date.now() * 0.01) * 50;
                    ctx.putImageData(data, moshAmount, 0);
                    
                    // Scanline interference
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
                    for (let y = 0; y < canvas.height; y += 4) {
                        if (Math.random() > 0.8) {
                            ctx.fillRect(0, y, canvas.width, 2);
                        }
                    }
                };
                
                // Hide containers
                oldContainer.style.display = 'none';
                newContainer.style.opacity = '0';
                
                // Run glitch animation
                let glitchInterval = setInterval(glitchAnimation, 50);
                
                // Timeline
                const timeline = gsap.timeline({
                    onComplete: () => {
                        clearInterval(glitchInterval);
                        canvas.remove();
                        oldContainer.style.display = '';
                        resolve();
                    }
                });
                
                // Intensify glitch
                timeline.to({}, {
                    duration: 1,
                    onUpdate: function() {
                        canvas.style.transform = `scale(${1 + Math.random() * 0.1}) rotate(${Math.random() * 4 - 2}deg)`;
                    }
                });
                
                // Reality tear
                timeline.to(canvas, {
                    clipPath: 'polygon(0 0, 100% 0, 100% 50%, 50% 50%, 50% 100%, 0 100%)',
                    duration: 0.5,
                    ease: 'steps(5)'
                });
                
                // New reality emerges
                timeline.set(newContainer, {
                    opacity: 1,
                    clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)'
                });
                
                timeline.to(newContainer, {
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                    duration: 0.8,
                    ease: 'power4.inOut'
                });
                
                // Final glitch burst
                timeline.to(canvas, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in'
                });
            });
        });
    }

    setupBarba() {
        barba.init({
            transitions: [{
                name: 'default-transition',
                leave: (data) => {
                    // Select random transition
                    const transitions = Array.from(this.transitionLibrary.keys());
                    const selectedTransition = transitions[Math.floor(Math.random() * transitions.length)];
                    const transition = this.transitionLibrary.get(selectedTransition);
                    
                    return transition.effect(data.current.container, data.next.container);
                },
                enter: (data) => {
                    // Handled in leave transition
                    return Promise.resolve();
                }
            }],
            views: [{
                namespace: 'home',
                beforeEnter() {
                    // Initialize home page specific effects
                    if (window.quantumRenderer) {
                        window.quantumRenderer.activeScene = window.quantumRenderer.createNewsStudio();
                    }
                }
            }]
        });
    }
}

// Initialize cinematic transitions
window.cinematicTransitions = new CinematicTransitions();