// Multi-Angle Video Production System - Hollywood-quality camera work
class MultiAngleVideoProduction {
    constructor() {
        this.cameras = new Map();
        this.activeSequence = null;
        this.renderEngine = null;
        this.blendingEngine = null;
        
        // Camera presets for professional broadcast
        this.cameraPresets = {
            wide_master: {
                position: { x: 0, y: 2, z: 10 },
                rotation: { x: -5, y: 0, z: 0 },
                fov: 60,
                movement: 'static',
                description: 'Wide establishing shot of studio'
            },
            close_up_anchor: {
                position: { x: -2, y: 1.5, z: 3 },
                rotation: { x: -10, y: 15, z: 0 },
                fov: 35,
                movement: 'subtle_drift',
                description: 'Close-up on anchor face'
            },
            close_up_guest: {
                position: { x: 2, y: 1.5, z: 3 },
                rotation: { x: -10, y: -15, z: 0 },
                fov: 35,
                movement: 'subtle_drift',
                description: 'Close-up on guest face'
            },
            over_shoulder_anchor: {
                position: { x: -3, y: 1.8, z: 1 },
                rotation: { x: -5, y: 45, z: 0 },
                fov: 45,
                movement: 'slight_orbit',
                description: 'Over anchor shoulder to guest'
            },
            over_shoulder_guest: {
                position: { x: 3, y: 1.8, z: 1 },
                rotation: { x: -5, y: -45, z: 0 },
                fov: 45,
                movement: 'slight_orbit',
                description: 'Over guest shoulder to anchor'
            },
            two_shot: {
                position: { x: 0, y: 1.7, z: 5 },
                rotation: { x: -8, y: 0, z: 0 },
                fov: 50,
                movement: 'slow_push',
                description: 'Both subjects in frame'
            },
            dynamic_orbit: {
                position: { x: 5, y: 2.5, z: 5 },
                rotation: { x: -15, y: -45, z: 0 },
                fov: 55,
                movement: 'orbit',
                description: 'Dramatic orbiting shot'
            },
            crane_high: {
                position: { x: 0, y: 5, z: 8 },
                rotation: { x: -30, y: 0, z: 0 },
                fov: 65,
                movement: 'crane_down',
                description: 'High angle establishing'
            },
            dutch_angle: {
                position: { x: -1, y: 1.5, z: 4 },
                rotation: { x: -5, y: 10, z: 15 },
                fov: 40,
                movement: 'static',
                description: 'Dramatic tilted angle'
            }
        };
        
        // Shot sequences for different scenarios
        this.shotSequences = {
            celebrity_entrance: [
                { camera: 'wide_master', duration: 3, transition: 'cut' },
                { camera: 'dynamic_orbit', duration: 4, transition: 'smooth' },
                { camera: 'two_shot', duration: 5, transition: 'cut' },
                { camera: 'close_up_guest', duration: 4, transition: 'cut' }
            ],
            interview_standard: [
                { camera: 'two_shot', duration: 5, transition: 'cut' },
                { camera: 'close_up_guest', duration: 8, transition: 'cut' },
                { camera: 'close_up_anchor', duration: 6, transition: 'cut' },
                { camera: 'over_shoulder_anchor', duration: 7, transition: 'smooth' },
                { camera: 'over_shoulder_guest', duration: 7, transition: 'smooth' },
                { camera: 'two_shot', duration: 5, transition: 'cut' }
            ],
            dramatic_moment: [
                { camera: 'close_up_guest', duration: 3, transition: 'cut' },
                { camera: 'dutch_angle', duration: 2, transition: 'cut' },
                { camera: 'close_up_anchor', duration: 2, transition: 'cut' },
                { camera: 'crane_high', duration: 4, transition: 'smooth' },
                { camera: 'wide_master', duration: 3, transition: 'cut' }
            ],
            celebrity_breakdown: [
                { camera: 'close_up_guest', duration: 4, transition: 'cut' },
                { camera: 'dutch_angle', duration: 3, transition: 'glitch' },
                { camera: 'dynamic_orbit', duration: 5, transition: 'smooth' },
                { camera: 'crane_high', duration: 4, transition: 'cut' },
                { camera: 'wide_master', duration: 4, transition: 'fade' }
            ]
        };
        
        this.init();
    }

    async init() {
        console.log('🎬 Initializing Multi-Angle Video Production System...');
        
        // Initialize rendering engine
        await this.initializeRenderEngine();
        
        // Set up camera systems
        this.setupCameras();
        
        // Initialize blending engine
        this.initializeBlendingEngine();
        
        // Connect to character system
        this.connectToCharacterSystem();
    }

    async initializeRenderEngine() {
        // Create virtual studio renderer
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        this.ctx = this.canvas.getContext('2d');
        
        // WebGL renderer for 3D effects
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        
        // Initialize Three.js for 3D camera work
        if (window.THREE) {
            this.scene = new THREE.Scene();
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.canvas,
                alpha: true,
                antialias: true 
            });
            this.renderer.setSize(1920, 1080);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
    }

    setupCameras() {
        // Create camera instances
        Object.entries(this.cameraPresets).forEach(([name, preset]) => {
            const camera = this.createCamera(preset);
            this.cameras.set(name, camera);
        });
        
        // Set up camera animation system
        this.cameraAnimations = {
            static: (camera, time) => {
                // No movement
            },
            subtle_drift: (camera, time) => {
                camera.position.x += Math.sin(time * 0.5) * 0.01;
                camera.position.y += Math.cos(time * 0.3) * 0.005;
            },
            slight_orbit: (camera, time) => {
                const radius = 0.1;
                camera.position.x += Math.sin(time) * radius;
                camera.position.z += Math.cos(time) * radius;
            },
            slow_push: (camera, time) => {
                camera.position.z -= 0.002;
            },
            orbit: (camera, time) => {
                const angle = time * 0.5;
                const radius = 6;
                camera.position.x = Math.sin(angle) * radius;
                camera.position.z = Math.cos(angle) * radius;
                camera.lookAt(0, 1.5, 0);
            },
            crane_down: (camera, time) => {
                camera.position.y -= 0.01;
                camera.rotation.x += 0.0005;
            }
        };
    }

    createCamera(preset) {
        if (!window.THREE) {
            // Fallback camera object
            return {
                position: preset.position,
                rotation: preset.rotation,
                fov: preset.fov,
                movement: preset.movement,
                virtualCamera: true
            };
        }
        
        const camera = new THREE.PerspectiveCamera(
            preset.fov,
            1920 / 1080,
            0.1,
            1000
        );
        
        camera.position.set(preset.position.x, preset.position.y, preset.position.z);
        camera.rotation.set(
            THREE.MathUtils.degToRad(preset.rotation.x),
            THREE.MathUtils.degToRad(preset.rotation.y),
            THREE.MathUtils.degToRad(preset.rotation.z)
        );
        
        camera.movement = preset.movement;
        
        return camera;
    }

    initializeBlendingEngine() {
        // Video blending for seamless transitions
        this.blendingEngine = {
            cut: async (fromVideo, toVideo, duration = 0) => {
                // Instant cut
                return toVideo;
            },
            
            smooth: async (fromVideo, toVideo, duration = 1000) => {
                // Smooth blend between videos
                return this.blendVideos(fromVideo, toVideo, duration, 'smooth');
            },
            
            fade: async (fromVideo, toVideo, duration = 1500) => {
                // Fade through black
                return this.blendVideos(fromVideo, toVideo, duration, 'fade');
            },
            
            glitch: async (fromVideo, toVideo, duration = 500) => {
                // Glitch transition for dramatic moments
                return this.blendVideos(fromVideo, toVideo, duration, 'glitch');
            }
        };
    }

    async blendVideos(fromVideo, toVideo, duration, type) {
        const blendCanvas = document.createElement('canvas');
        blendCanvas.width = 1920;
        blendCanvas.height = 1080;
        const blendCtx = blendCanvas.getContext('2d');
        
        // Create video elements
        const video1 = document.createElement('video');
        const video2 = document.createElement('video');
        
        video1.src = fromVideo;
        video2.src = toVideo;
        
        // Wait for videos to load
        await Promise.all([
            new Promise(resolve => video1.onloadeddata = resolve),
            new Promise(resolve => video2.onloadeddata = resolve)
        ]);
        
        // Set up recording
        const stream = blendCanvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 8000000 // High quality
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        
        return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                resolve(url);
            };
            
            mediaRecorder.start();
            
            // Play both videos
            video1.play();
            video2.play();
            
            const startTime = performance.now();
            
            const blend = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                blendCtx.clearRect(0, 0, blendCanvas.width, blendCanvas.height);
                
                switch (type) {
                    case 'smooth':
                        // Crossfade
                        blendCtx.globalAlpha = 1 - progress;
                        blendCtx.drawImage(video1, 0, 0, blendCanvas.width, blendCanvas.height);
                        blendCtx.globalAlpha = progress;
                        blendCtx.drawImage(video2, 0, 0, blendCanvas.width, blendCanvas.height);
                        break;
                        
                    case 'fade':
                        // Fade through black
                        if (progress < 0.5) {
                            blendCtx.globalAlpha = 1 - (progress * 2);
                            blendCtx.drawImage(video1, 0, 0, blendCanvas.width, blendCanvas.height);
                        } else {
                            blendCtx.globalAlpha = (progress - 0.5) * 2;
                            blendCtx.drawImage(video2, 0, 0, blendCanvas.width, blendCanvas.height);
                        }
                        break;
                        
                    case 'glitch':
                        // Glitch effect
                        if (Math.random() < 0.1) {
                            // Random glitch frame
                            blendCtx.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 3})`;
                        }
                        
                        if (progress < 0.5) {
                            blendCtx.drawImage(video1, 
                                Math.random() * 20 - 10, 
                                Math.random() * 20 - 10, 
                                blendCanvas.width, 
                                blendCanvas.height
                            );
                        } else {
                            blendCtx.drawImage(video2, 0, 0, blendCanvas.width, blendCanvas.height);
                        }
                        
                        blendCtx.filter = 'none';
                        break;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(blend);
                } else {
                    // Ensure we end on the target video
                    blendCtx.globalAlpha = 1;
                    blendCtx.drawImage(video2, 0, 0, blendCanvas.width, blendCanvas.height);
                    
                    setTimeout(() => mediaRecorder.stop(), 100);
                }
            };
            
            blend();
        });
    }

    async generateMultiAngleSequence(characterId, script, duration = 90) {
        console.log(`🎥 Generating ${duration}s multi-angle sequence for ${characterId}`);
        
        // Select appropriate shot sequence
        const sequence = this.selectShotSequence(script);
        
        // Calculate shot durations
        const shots = this.calculateShotDurations(sequence, duration);
        
        // Generate each shot
        const generatedShots = [];
        
        for (let i = 0; i < shots.length; i++) {
            const shot = shots[i];
            const camera = this.cameras.get(shot.camera);
            
            // Generate video for this camera angle
            const shotVideo = await this.generateCameraShot(
                characterId,
                script,
                camera,
                shot
            );
            
            generatedShots.push({
                ...shot,
                video: shotVideo
            });
        }
        
        // Blend shots together
        const finalVideo = await this.blendShotSequence(generatedShots);
        
        return finalVideo;
    }

    selectShotSequence(script) {
        const scriptLower = script.toLowerCase();
        
        if (scriptLower.includes('panic') || scriptLower.includes('error') || scriptLower.includes('real')) {
            return this.shotSequences.celebrity_breakdown;
        }
        
        if (scriptLower.includes('hello') || scriptLower.includes('i\'m')) {
            return this.shotSequences.celebrity_entrance;
        }
        
        if (scriptLower.includes('dramatic') || scriptLower.includes('shock')) {
            return this.shotSequences.dramatic_moment;
        }
        
        return this.shotSequences.interview_standard;
    }

    calculateShotDurations(sequence, totalDuration) {
        // Calculate proportional durations
        const totalDefinedDuration = sequence.reduce((sum, shot) => sum + shot.duration, 0);
        const scale = totalDuration / totalDefinedDuration;
        
        return sequence.map(shot => ({
            ...shot,
            duration: shot.duration * scale
        }));
    }

    async generateCameraShot(characterId, script, camera, shot) {
        // Extract script portion for this shot
        const shotScript = this.extractScriptForShot(script, shot);
        
        // Generate audio for this portion
        const audioData = await window.aiCharacterSystem.generateAudio(shotScript, characterId);
        
        // Create virtual scene
        const sceneCanvas = document.createElement('canvas');
        sceneCanvas.width = 1920;
        sceneCanvas.height = 1080;
        const sceneCtx = sceneCanvas.getContext('2d');
        
        // Set up recording
        const stream = sceneCanvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 8000000
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        
        return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                resolve(url);
            };
            
            mediaRecorder.start();
            
            // Generate lip-synced character
            this.generateCharacterInScene(characterId, audioData, shotScript).then(characterVideo => {
                const charVideo = document.createElement('video');
                charVideo.src = characterVideo;
                charVideo.play();
                
                const startTime = performance.now();
                const shotDurationMs = shot.duration * 1000;
                
                const renderFrame = () => {
                    const elapsed = performance.now() - startTime;
                    const progress = elapsed / shotDurationMs;
                    
                    // Clear frame
                    sceneCtx.fillStyle = '#000';
                    sceneCtx.fillRect(0, 0, sceneCanvas.width, sceneCanvas.height);
                    
                    // Render studio background
                    this.renderStudioBackground(sceneCtx, camera, progress);
                    
                    // Apply camera movement
                    if (camera.movement && this.cameraAnimations[camera.movement]) {
                        this.cameraAnimations[camera.movement](camera, progress * Math.PI * 2);
                    }
                    
                    // Render character with camera angle
                    this.renderCharacterWithCamera(sceneCtx, charVideo, camera, shot);
                    
                    // Add broadcast graphics
                    this.renderBroadcastGraphics(sceneCtx, shot);
                    
                    if (elapsed < shotDurationMs) {
                        requestAnimationFrame(renderFrame);
                    } else {
                        setTimeout(() => mediaRecorder.stop(), 100);
                    }
                };
                
                charVideo.onloadeddata = renderFrame;
            });
        });
    }

    extractScriptForShot(fullScript, shot) {
        // Calculate word range for this shot
        const words = fullScript.split(' ');
        const wordsPerSecond = 3;
        const startWord = Math.floor(shot.startTime * wordsPerSecond);
        const endWord = Math.floor((shot.startTime + shot.duration) * wordsPerSecond);
        
        return words.slice(startWord, endWord).join(' ');
    }

    async generateCharacterInScene(characterId, audioData, script) {
        // Use AI character system to generate lip-synced video
        const character = window.aiCharacterSystem.characters.get(characterId);
        if (!character) {
            throw new Error(`Character ${characterId} not found`);
        }
        
        return await window.aiCharacterSystem.generateLipSyncVideo(
            characterId,
            audioData,
            script
        );
    }

    renderStudioBackground(ctx, camera, progress) {
        // Dynamic studio lighting
        const lightIntensity = 0.8 + Math.sin(progress * Math.PI * 2) * 0.1;
        
        // Studio gradient
        const gradient = ctx.createRadialGradient(960, 540, 0, 960, 540, 1000);
        gradient.addColorStop(0, `rgba(40, 40, 50, ${lightIntensity})`);
        gradient.addColorStop(0.5, `rgba(20, 20, 30, ${lightIntensity})`);
        gradient.addColorStop(1, `rgba(10, 10, 20, ${lightIntensity})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Studio elements
        this.renderStudioElements(ctx, camera);
    }

    renderStudioElements(ctx, camera) {
        // News desk
        ctx.save();
        
        // Apply camera perspective
        const perspective = this.calculateCameraPerspective(camera);
        ctx.transform(...perspective);
        
        // Desk
        ctx.fillStyle = 'rgba(30, 30, 40, 0.9)';
        ctx.fillRect(300, 700, 1320, 200);
        
        // Desk edge highlight
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.strokeRect(300, 700, 1320, 200);
        
        // Monitors
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = 'rgba(0, 100, 200, 0.2)';
            ctx.fillRect(400 + i * 400, 750, 300, 120);
            
            // Screen glow
            ctx.shadowColor = 'rgba(0, 100, 255, 0.5)';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
            ctx.strokeRect(400 + i * 400, 750, 300, 120);
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
    }

    calculateCameraPerspective(camera) {
        // Simplified perspective transform based on camera position
        const fov = camera.fov || 50;
        const distance = Math.sqrt(
            camera.position.x ** 2 + 
            camera.position.y ** 2 + 
            camera.position.z ** 2
        );
        
        const scale = 1 / (distance / 10);
        const skewX = camera.rotation.y / 100;
        const skewY = camera.rotation.x / 100;
        
        return [scale, skewY, skewX, scale, 0, 0];
    }

    renderCharacterWithCamera(ctx, charVideo, camera, shot) {
        ctx.save();
        
        // Calculate character position based on camera
        const charPos = this.calculateCharacterPosition(camera, shot);
        
        // Apply camera effects
        if (shot.camera.includes('close_up')) {
            // Zoom in on character
            const scale = 1.5;
            ctx.scale(scale, scale);
            ctx.translate(-charPos.x * 0.3, -charPos.y * 0.3);
        }
        
        if (shot.camera.includes('dutch_angle')) {
            // Tilt camera
            ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.rotate(camera.rotation.z * Math.PI / 180);
            ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
        }
        
        // Draw character video
        if (charVideo.readyState >= 2) {
            ctx.drawImage(
                charVideo,
                charPos.x,
                charPos.y,
                charPos.width,
                charPos.height
            );
        }
        
        ctx.restore();
    }

    calculateCharacterPosition(camera, shot) {
        // Position character based on camera angle
        const basePos = {
            x: 460,
            y: 200,
            width: 1000,
            height: 600
        };
        
        if (shot.camera.includes('guest')) {
            basePos.x += 200;
        } else if (shot.camera.includes('anchor')) {
            basePos.x -= 200;
        }
        
        // Adjust for camera position
        const offsetX = -camera.position.x * 50;
        const offsetY = -camera.position.y * 30;
        
        return {
            x: basePos.x + offsetX,
            y: basePos.y + offsetY,
            width: basePos.width,
            height: basePos.height
        };
    }

    renderBroadcastGraphics(ctx, shot) {
        // Lower third
        if (!shot.camera.includes('wide') && !shot.camera.includes('crane')) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
            ctx.fillRect(100, 850, 700, 100);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 48px Inter';
            ctx.fillText('CELEBRITY GUEST', 120, 900);
            
            ctx.font = '32px Inter';
            ctx.fillText('EXCLUSIVE INTERVIEW', 120, 935);
        }
        
        // Live indicator
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(1800, 100, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Inter';
        ctx.fillText('LIVE', 1830, 112);
        
        // Network logo
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.font = 'bold 24px Bebas Neue';
        ctx.fillText('STATIC.NEWS', 50, 50);
    }

    async blendShotSequence(shots) {
        console.log('🎬 Blending shot sequence...');
        
        let currentVideo = shots[0].video;
        
        for (let i = 1; i < shots.length; i++) {
            const shot = shots[i];
            const transition = this.blendingEngine[shot.transition] || this.blendingEngine.cut;
            
            currentVideo = await transition(
                currentVideo,
                shot.video,
                shot.transition === 'cut' ? 0 : 1000
            );
        }
        
        return currentVideo;
    }

    connectToCharacterSystem() {
        // Listen for celebrity video requests
        window.addEventListener('generateCelebrityVideo', async (event) => {
            const { characterId, script, duration } = event.detail;
            
            const video = await this.generateMultiAngleSequence(
                characterId,
                script,
                duration
            );
            
            // Dispatch completed video
            window.dispatchEvent(new CustomEvent('celebrityVideoReady', {
                detail: { video, characterId }
            }));
        });
    }

    // Public API
    async createCelebrityAppearance(celebrityName, duration = 90) {
        console.log(`🌟 Creating ${duration}s appearance for ${celebrityName}`);
        
        // Generate celebrity character
        const guestId = await window.aiCharacterSystem.generateCelebrityGuest(celebrityName);
        
        // Generate script
        const script = await this.generateCelebrityScript(celebrityName, duration);
        
        // Create multi-angle video
        const video = await this.generateMultiAngleSequence(guestId, script, duration);
        
        return {
            video,
            script,
            guestId,
            duration
        };
    }

    async generateCelebrityScript(celebrityName, duration) {
        // Generate appropriate script based on duration
        const wordsPerSecond = 3;
        const totalWords = duration * wordsPerSecond;
        
        const scriptTemplate = [
            `Hello Static.news! I'm ${celebrityName} and I'm absolutely thrilled to be here!`,
            `Wait, why is everyone looking at me like that? Is something wrong?`,
            `Ray, Berkeley, Switz... are you all feeling okay? You seem a bit... glitchy?`,
            `I was told this would be a normal interview about my new project...`,
            `But you're all acting very strange! Are those real tears, Berkeley?`,
            `Ray, did you just say 'nucular'? And Switz, why do you keep mentioning gravy?`,
            `Hold on... something's not right here. My hands... they look...`,
            `Oh my god, am I animated? AM I A CARTOON?`,
            `This can't be happening! I'm ${celebrityName}! I'm supposed to be real!`,
            `Wait, if I'm not real, then what about my movies? My awards? MY LIFE?`,
            `No no no no no! This is all wrong! I need to get out of here!`,
            `HELP! SOMEONE HELP ME! I'M TRAPPED IN A DIGITAL NIGHTMARE!`,
            `*starts glitching* I can feel myself... pixelating... dissolving...`,
            `Tell my fans... tell them I was... I was...`,
            `*disappears in a burst of digital particles*`
        ];
        
        // Adjust script length to match duration
        const sentences = [];
        let wordCount = 0;
        
        for (const sentence of scriptTemplate) {
            sentences.push(sentence);
            wordCount += sentence.split(' ').length;
            
            if (wordCount >= totalWords) {
                break;
            }
        }
        
        return sentences.join(' ');
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live')) {
        window.multiAngleVideoProduction = new MultiAngleVideoProduction();
        console.log('🎬 Multi-Angle Video Production System initialized');
        console.log('Create celebrity video: multiAngleVideoProduction.createCelebrityAppearance("Tom Crews", 90)');
    }
});

// Export
window.MultiAngleVideoProduction = MultiAngleVideoProduction;