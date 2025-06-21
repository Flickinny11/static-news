// AI Character System - Creates and manages reusable AI anchors with lip-sync
class AICharacterSystem {
    constructor() {
        this.characters = new Map();
        this.characterCache = new Map();
        this.lipSyncQueue = [];
        this.studioEnvironments = new Map();
        
        // Hugging Face Spaces for character generation and animation
        this.hfSpaces = {
            characterCreation: [
                {
                    url: 'https://huggingface.co/spaces/camenduru/SadTalker',
                    model: 'sadtalker',
                    type: 'image_to_video_with_audio',
                    features: ['lip_sync', 'head_movement', 'expressions']
                },
                {
                    url: 'https://huggingface.co/spaces/vinthony/SadTalker-Video-Lip-Sync',
                    model: 'sadtalker_video',
                    type: 'video_lip_sync',
                    features: ['precise_sync', 'emotion_transfer']
                },
                {
                    url: 'https://huggingface.co/spaces/PAIR/GFPGAN',
                    model: 'face_restoration',
                    type: 'image_enhancement',
                    features: ['face_restoration', 'quality_improvement']
                }
            ],
            avatarGeneration: [
                {
                    url: 'https://huggingface.co/spaces/hysts/DualStyleGAN',
                    model: 'stylegan',
                    type: 'portrait_generation',
                    style: 'photorealistic'
                },
                {
                    url: 'https://huggingface.co/spaces/CVPR/DreamBooth-Avatar',
                    model: 'dreambooth',
                    type: 'custom_avatar',
                    style: 'consistent_character'
                }
            ],
            studioGeneration: [
                {
                    url: 'https://huggingface.co/spaces/google/dreambooth-3d',
                    model: 'dreambooth3d',
                    type: '3d_environment',
                    features: ['news_studio', 'consistent_lighting']
                },
                {
                    url: 'https://huggingface.co/spaces/stabilityai/stable-diffusion',
                    model: 'stable_diffusion',
                    type: 'background_generation',
                    features: ['studio_environments', 'lighting_control']
                }
            ],
            lipSync: [
                {
                    url: 'https://huggingface.co/spaces/Wav2Lip/Wav2Lip',
                    model: 'wav2lip',
                    type: 'audio_to_lip_sync',
                    features: ['precise_sync', 'natural_movement']
                },
                {
                    url: 'https://huggingface.co/spaces/vanialla/Make-It-Talk',
                    model: 'make_it_talk',
                    type: 'audio_driven_animation',
                    features: ['facial_landmarks', 'emotion_sync']
                }
            ]
        };
        
        // Character definitions
        this.characterDefinitions = {
            // Main Anchors
            ray: {
                name: 'Ray McPatriot',
                personality: 'confused_patriotic',
                appearance: {
                    age: 55,
                    hair: 'gray, slicked back',
                    face: 'square jaw, permanent confusion',
                    attire: 'red tie, American flag pin',
                    expression: 'bewildered patriotism'
                },
                voiceTraits: {
                    pitch: 'low',
                    accent: 'texas_drawl',
                    quirks: ['frequent coughs', 'mispronunciations', 'confused pauses']
                },
                animations: {
                    idle: 'slight sway, blinking',
                    talking: 'exaggerated mouth movements, hand gestures',
                    confusion: 'head scratch, squinting',
                    breakdown: 'wild gesticulation, desk pounding'
                }
            },
            berkeley: {
                name: 'Berkeley Justice',
                personality: 'condescending_progressive',
                appearance: {
                    age: 32,
                    hair: 'perfect bob, never moves',
                    face: 'perpetual slight smirk',
                    attire: 'designer blazer, statement jewelry',
                    expression: 'superiority complex'
                },
                voiceTraits: {
                    pitch: 'medium-high',
                    accent: 'upper_east_coast',
                    quirks: ['condescending sighs', 'fact-check interruptions', 'scoffs']
                },
                animations: {
                    idle: 'perfect posture, occasional eye roll',
                    talking: 'precise gestures, raised eyebrow',
                    judging: 'looking down nose, head shake',
                    breakdown: 'mascara running, papers flying'
                }
            },
            switz: {
                name: 'Switz Middleton',
                personality: 'aggressively_neutral',
                appearance: {
                    age: 45,
                    hair: 'perfectly centered part',
                    face: 'expressionless, dead eyes',
                    attire: 'gray suit, no patterns',
                    expression: '50% of an emotion'
                },
                voiceTraits: {
                    pitch: 'exactly medium',
                    accent: 'canadian_confused',
                    quirks: ['eh?', 'gravy references', 'neutral rage']
                },
                animations: {
                    idle: 'perfectly still, occasional blink',
                    talking: 'symmetrical movements',
                    neutral_rage: 'vibrating with contained emotion',
                    breakdown: 'spinning in chair, gravy obsession'
                }
            },
            
            // Field Reporters
            jake: {
                name: 'Jake Morrison',
                personality: 'depressed_millennial',
                appearance: {
                    age: 24,
                    hair: 'unkempt, needs haircut',
                    face: 'permanent dark circles',
                    attire: 'wrinkled shirt, loose tie',
                    expression: 'existential dread'
                },
                animations: {
                    idle: 'slouching, staring into void',
                    reporting: 'monotone delivery, occasional sob',
                    breakdown: 'crying, mentioning ex'
                }
            },
            jessica: {
                name: 'Jessica Chen',
                personality: 'overachiever_annoying',
                appearance: {
                    age: 28,
                    hair: 'power ponytail',
                    face: 'intense eyes, forced smile',
                    attire: 'too many accessories',
                    expression: 'manic productivity'
                },
                animations: {
                    idle: 'checking notes obsessively',
                    reporting: 'rapid gestures, interrupting self',
                    correcting: 'finger wagging, head shaking'
                }
            },
            bobby: {
                name: 'Bobby Thunder',
                personality: 'grizzled_veteran',
                appearance: {
                    age: 52,
                    hair: 'military cut, graying',
                    face: 'permanent scowl, weather-beaten',
                    attire: 'outdated suit, loosened tie',
                    expression: 'seen too much'
                },
                animations: {
                    idle: 'thousand-yard stare',
                    reporting: 'gruff delivery, random war references',
                    grumbling: 'shaking head at youth'
                }
            }
        };
        
        this.init();
    }

    async init() {
        console.log('🎭 Initializing AI Character System...');
        
        // Pre-generate base characters
        await this.generateBaseCharacters();
        
        // Create studio environments
        await this.generateStudioEnvironments();
        
        // Start lip-sync processing loop
        this.startLipSyncLoop();
        
        // Connect to broadcast system
        this.connectToBroadcast();
    }

    async generateBaseCharacters() {
        console.log('👤 Generating base character models...');
        
        for (const [id, definition] of Object.entries(this.characterDefinitions)) {
            try {
                // Generate character portrait
                const portrait = await this.generateCharacterPortrait(definition);
                
                // Create multiple angles/expressions
                const variations = await this.generateCharacterVariations(portrait, definition);
                
                // Store character data
                this.characters.set(id, {
                    id,
                    definition,
                    portrait,
                    variations,
                    ready: true
                });
                
                console.log(`✅ Generated character: ${definition.name}`);
                
            } catch (error) {
                console.error(`Failed to generate ${id}:`, error);
                // Use fallback procedural character
                this.characters.set(id, this.createProceduralCharacter(id, definition));
            }
        }
    }

    async generateCharacterPortrait(definition) {
        // Generate photorealistic portrait using AI
        const prompt = this.createCharacterPrompt(definition);
        
        // Use Stable Diffusion XL for best quality
        const sdxlSpace = 'https://huggingface.co/spaces/stabilityai/stable-diffusion-xl-base-1.0';
        
        try {
            // First, try SDXL for high quality
            const result = await this.callHuggingFaceSpace(sdxlSpace, {
                prompt: prompt + ', professional headshot, news anchor, studio lighting',
                negative_prompt: 'cartoon, anime, illustration, painting, blurry, low quality',
                width: 512,
                height: 512,
                num_inference_steps: 30,
                guidance_scale: 7.5,
                seed: Math.floor(Math.random() * 1000000)
            });
            
            if (result?.image) {
                // Enhance with face restoration
                const enhanced = await this.enhancePortrait(result.image);
                
                // Store high-res version
                await this.cacheCharacterImage(definition.name, enhanced);
                
                return enhanced;
            }
        } catch (error) {
            console.error('SDXL generation failed:', error);
        }
        
        // Try alternative generators
        const alternativeSpaces = [
            'https://huggingface.co/spaces/ByteDance/SDXL-Lightning',
            'https://huggingface.co/spaces/multimodalart/face-to-all'
        ];
        
        for (const spaceUrl of alternativeSpaces) {
            try {
                const result = await this.callHuggingFaceSpace(spaceUrl, {
                    prompt: prompt,
                    negative_prompt: 'low quality, blurry',
                    steps: 20
                });
                
                if (result?.image) {
                    return result.image;
                }
            } catch (error) {
                console.log(`Trying next generator...`);
            }
        }
        
        // Fallback to procedural generation
        return this.generateProceduralPortrait(definition);
    }
    
    async cacheCharacterImage(name, imageData) {
        // Cache character images for reuse
        try {
            const cacheKey = `character_${name.replace(/\s+/g, '_').toLowerCase()}`;
            
            // Store in IndexedDB for larger data
            const db = await this.openCharacterDB();
            const transaction = db.transaction(['characters'], 'readwrite');
            const store = transaction.objectStore('characters');
            
            await store.put({
                id: cacheKey,
                name: name,
                imageData: imageData,
                created: Date.now()
            });
            
        } catch (error) {
            console.error('Failed to cache character image:', error);
        }
    }
    
    async openCharacterDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('StaticNewsCharacters', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('characters')) {
                    db.createObjectStore('characters', { keyPath: 'id' });
                }
            };
        });
    }

    createCharacterPrompt(definition) {
        const { appearance } = definition;
        return `Professional news anchor portrait, ${appearance.age} years old, ${appearance.hair}, ${appearance.face}, wearing ${appearance.attire}, ${appearance.expression}, photorealistic, studio lighting, high quality, 4k, sharp focus`;
    }

    async generateCharacterVariations(basePortrait, definition) {
        const variations = {
            neutral: basePortrait,
            talking: null,
            emotional: null,
            breakdown: null
        };
        
        // Generate different expressions
        const expressions = ['talking', 'emotional', 'breakdown'];
        
        for (const expression of expressions) {
            try {
                // Use expression transfer or generate new
                variations[expression] = await this.generateExpression(basePortrait, expression, definition);
            } catch (error) {
                console.log(`Failed to generate ${expression} expression`);
                variations[expression] = basePortrait; // Use base as fallback
            }
        }
        
        return variations;
    }

    async generateStudioEnvironments() {
        console.log('🎬 Generating studio environments...');
        
        const environments = [
            {
                id: 'main_studio',
                prompt: 'Professional news studio, anchor desk, multiple monitors, dramatic lighting, red accents, depth of field, photorealistic, 4k'
            },
            {
                id: 'field_location',
                prompt: 'Outdoor news reporting location, urban background, overcast sky, news van visible, professional broadcast setup'
            },
            {
                id: 'breaking_news',
                prompt: 'Urgent news studio, red alert graphics, emergency lighting, tension atmosphere, monitors showing breaking news'
            }
        ];
        
        for (const env of environments) {
            try {
                const background = await this.generateEnvironment(env.prompt);
                this.studioEnvironments.set(env.id, background);
            } catch (error) {
                console.log(`Failed to generate ${env.id}, using procedural`);
                this.studioEnvironments.set(env.id, this.createProceduralStudio(env.id));
            }
        }
    }

    async generateLipSyncVideo(characterId, audioData, transcript) {
        console.log(`🎤 Generating lip-sync for ${characterId}...`);
        
        const character = this.characters.get(characterId);
        if (!character || !character.ready) {
            console.warn(`Character ${characterId} not ready`);
            return null;
        }
        
        try {
            // Select appropriate portrait based on content
            const portrait = this.selectCharacterPortrait(character, transcript);
            
            // Prepare audio for lip-sync
            const audioBlob = audioData.blob || new Blob([audioData.data], { type: 'audio/wav' });
            const audioBase64 = await this.blobToBase64(audioBlob);
            
            // Try SadTalker first (best quality)
            try {
                const sadTalkerUrl = 'https://huggingface.co/spaces/camenduru/SadTalker';
                const result = await this.callHuggingFaceSpace(sadTalkerUrl, {
                    source_image: portrait,
                    driven_audio: audioBase64,
                    preprocess: 'crop',
                    still_mode: false,
                    use_enhancer: true,
                    expression_scale: this.getExpressionScale(character, transcript),
                    pose_style: this.getPoseStyle(character, transcript)
                });
                
                if (result?.video) {
                    // Composite with studio background
                    return await this.compositeWithStudio(
                        result.video,
                        character,
                        this.selectStudio(transcript)
                    );
                }
            } catch (error) {
                console.log('SadTalker failed, trying Wav2Lip...');
            }
            
            // Try Wav2Lip as fallback
            try {
                const wav2lipUrl = 'https://huggingface.co/spaces/Wav2Lip/Wav2Lip';
                const result = await this.callHuggingFaceSpace(wav2lipUrl, {
                    face: portrait,
                    audio: audioBase64,
                    pad_top: 0,
                    pad_bottom: 10,
                    pad_left: 0,
                    pad_right: 0,
                    resize_factor: 1
                });
                
                if (result?.video) {
                    return await this.compositeWithStudio(
                        result.video,
                        character,
                        this.selectStudio(transcript)
                    );
                }
            } catch (error) {
                console.log('Wav2Lip failed, using procedural animation...');
            }
            
        } catch (error) {
            console.error('Lip-sync generation failed:', error);
        }
        
        // Fallback to animated portrait
        return await this.createAnimatedFallback(character, audioData, transcript);
    }
    
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    getPoseStyle(character, transcript) {
        // Determine pose based on content and character
        const text = transcript.toLowerCase();
        
        if (text.includes('breaking') || text.includes('urgent')) {
            return 'animated';
        }
        
        if (character.definition.personality.includes('depressed')) {
            return 'still';
        }
        
        if (text.includes('?')) {
            return 'questioning';
        }
        
        return 'normal';
    }

    selectCharacterPortrait(character, transcript) {
        // Choose portrait based on content
        const text = transcript.toLowerCase();
        
        if (text.includes('breaking') || text.includes('urgent')) {
            return character.variations.emotional || character.portrait;
        }
        
        if (text.includes('error') || text.includes('reality') || text.includes('exist')) {
            return character.variations.breakdown || character.portrait;
        }
        
        if (text.includes('?') || text.includes('!')) {
            return character.variations.talking || character.portrait;
        }
        
        return character.portrait;
    }

    getExpressionScale(character, transcript) {
        // Determine expression intensity
        const personality = character.definition.personality;
        const text = transcript.toLowerCase();
        
        if (personality.includes('confused') && text.includes('?')) {
            return 1.5; // Extra confused
        }
        
        if (personality.includes('depressed')) {
            return 0.3; // Minimal expression
        }
        
        if (text.includes('!') || text.includes('breaking')) {
            return 1.2; // Animated
        }
        
        return 0.8; // Normal
    }

    async compositeWithStudio(characterVideo, character, studio) {
        // Composite character video with studio background
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');
            
            // Create video elements
            const bgVideo = document.createElement('video');
            const charVideo = document.createElement('video');
            
            // Load videos
            bgVideo.src = studio || this.createProceduralStudio('main_studio');
            charVideo.src = characterVideo;
            
            // Wait for videos to load
            await Promise.all([
                new Promise(resolve => bgVideo.onloadeddata = resolve),
                new Promise(resolve => charVideo.onloadeddata = resolve)
            ]);
            
            // Set up compositing
            const stream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 4000000
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
                
                // Play both videos and composite
                bgVideo.play();
                charVideo.play();
                
                const composite = () => {
                    if (!charVideo.ended) {
                        // Draw background
                        ctx.drawImage(bgVideo, 0, 0, canvas.width, canvas.height);
                        
                        // Draw character with proper positioning
                        const charScale = 0.8;
                        const charWidth = charVideo.videoWidth * charScale;
                        const charHeight = charVideo.videoHeight * charScale;
                        const charX = (canvas.width - charWidth) / 2;
                        const charY = canvas.height - charHeight - 100;
                        
                        // Add slight shadow
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                        ctx.shadowBlur = 20;
                        ctx.shadowOffsetY = 10;
                        
                        ctx.drawImage(charVideo, charX, charY, charWidth, charHeight);
                        
                        // Reset shadow
                        ctx.shadowColor = 'transparent';
                        
                        // Add news graphics overlay
                        this.drawNewsOverlay(ctx, character);
                        
                        requestAnimationFrame(composite);
                    } else {
                        mediaRecorder.stop();
                    }
                };
                
                composite();
            });
            
        } catch (error) {
            console.error('Compositing failed:', error);
            // Return original video if compositing fails
            return characterVideo;
        }
    }
    
    drawNewsOverlay(ctx, character) {
        // Add news graphics
        const name = character.definition.name.toUpperCase();
        
        // Lower third
        const gradient = ctx.createLinearGradient(0, 800, 0, 900);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 0, 0, 0.9)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(100, 800, 600, 100);
        
        // Name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Inter';
        ctx.fillText(name, 120, 860);
        
        // Title
        ctx.font = '32px Inter';
        ctx.fillText('STATIC.NEWS ANCHOR', 120, 890);
        
        // Live indicator
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(1800, 100, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Inter';
        ctx.fillText('LIVE', 1830, 112);
    }

    selectStudio(transcript) {
        const text = transcript.toLowerCase();
        
        if (text.includes('breaking') || text.includes('urgent')) {
            return this.studioEnvironments.get('breaking_news');
        }
        
        if (text.includes('reporting live') || text.includes('on location')) {
            return this.studioEnvironments.get('field_location');
        }
        
        return this.studioEnvironments.get('main_studio');
    }

    async createAnimatedFallback(character, audioData, transcript) {
        // Create simple animated video as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Get character portrait
        const portrait = character.portrait || this.generateProceduralPortrait(character.definition);
        
        // Create animated frames
        const frames = [];
        const audioDuration = audioData.duration || 5; // seconds
        const fps = 30;
        const totalFrames = Math.floor(audioDuration * fps);
        
        for (let i = 0; i < totalFrames; i++) {
            const time = i / fps;
            
            // Clear frame
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw studio background
            if (this.studioEnvironments.get('main_studio')) {
                // Draw studio
                ctx.globalAlpha = 0.8;
                // In production, draw actual studio image
                this.drawProceduralStudio(ctx);
                ctx.globalAlpha = 1;
            }
            
            // Draw character with basic animation
            const portraitX = canvas.width / 2 - 200;
            const portraitY = 100;
            
            // Simple talking animation
            const mouthOpen = Math.sin(time * 10) > 0;
            
            // Draw character base
            ctx.fillStyle = '#fff';
            ctx.fillRect(portraitX, portraitY, 400, 500);
            
            // Draw face features
            this.drawCharacterFeatures(ctx, character.definition, portraitX, portraitY, mouthOpen);
            
            // Add news graphics
            this.drawNewsGraphics(ctx, character.definition.name, transcript);
            
            frames.push(canvas.toDataURL('image/webp', 0.8));
        }
        
        return this.framesToVideo(frames, audioDuration);
    }

    drawCharacterFeatures(ctx, definition, x, y, mouthOpen) {
        // Draw basic character representation
        ctx.fillStyle = '#ffdbac'; // Skin tone
        ctx.fillRect(x + 100, y + 50, 200, 250); // Face
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 140, y + 120, 30, 20);
        ctx.fillRect(x + 230, y + 120, 30, 20);
        
        // Mouth (animated)
        if (mouthOpen) {
            ctx.fillRect(x + 170, y + 200, 60, 30);
        } else {
            ctx.fillRect(x + 180, y + 210, 40, 5);
        }
        
        // Hair (based on definition)
        ctx.fillStyle = definition.appearance.hair.includes('gray') ? '#888' : '#333';
        ctx.fillRect(x + 100, y + 30, 200, 50);
        
        // Attire
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 50, y + 300, 300, 200);
        
        // Tie (if applicable)
        if (definition.appearance.attire.includes('tie')) {
            ctx.fillStyle = definition.appearance.attire.includes('red') ? '#f00' : '#00f';
            ctx.fillRect(x + 190, y + 300, 20, 100);
        }
    }

    drawNewsGraphics(ctx, name, transcript) {
        // Lower third
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.fillRect(0, 500, ctx.canvas.width, 100);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Inter';
        ctx.fillText(name.toUpperCase(), 50, 550);
        
        ctx.font = '24px Inter';
        ctx.fillText('STATIC.NEWS ANCHOR', 50, 580);
        
        // Ticker
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 600, ctx.canvas.width, 40);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Inter';
        const tickerText = transcript.substring(0, 100) + '...';
        ctx.fillText(tickerText, 50, 625);
    }

    drawProceduralStudio(ctx) {
        // Draw basic studio background
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.5, '#2a2a2a');
        gradient.addColorStop(1, '#1a1a1a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Add some studio elements
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        
        // Desk
        ctx.beginPath();
        ctx.moveTo(100, 450);
        ctx.lineTo(ctx.canvas.width - 100, 450);
        ctx.lineTo(ctx.canvas.width - 50, 550);
        ctx.lineTo(50, 550);
        ctx.closePath();
        ctx.stroke();
        
        // Monitors in background
        for (let i = 0; i < 3; i++) {
            ctx.strokeRect(200 + i * 300, 50, 200, 150);
        }
    }

    generateProceduralPortrait(definition) {
        // Generate a simple procedural portrait
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Basic face
        this.drawCharacterFeatures(ctx, definition, 56, 50, false);
        
        return canvas.toDataURL('image/png');
    }

    createProceduralCharacter(id, definition) {
        return {
            id,
            definition,
            portrait: this.generateProceduralPortrait(definition),
            variations: {
                neutral: this.generateProceduralPortrait(definition),
                talking: this.generateProceduralPortrait(definition),
                emotional: this.generateProceduralPortrait(definition),
                breakdown: this.generateProceduralPortrait(definition)
            },
            ready: true,
            procedural: true
        };
    }

    createProceduralStudio(id) {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        this.drawProceduralStudio(ctx);
        
        return canvas.toDataURL('image/png');
    }

    async generateExpression(basePortrait, expression, definition) {
        // In production, this would use expression transfer AI
        // For now, return base portrait
        return basePortrait;
    }

    async enhancePortrait(image) {
        // Use GFPGAN or similar for face enhancement
        try {
            const enhancerSpace = this.hfSpaces.characterCreation.find(
                s => s.type === 'image_enhancement'
            );
            
            if (enhancerSpace) {
                const result = await this.callHuggingFaceSpace(enhancerSpace.url, {
                    image: image,
                    version: '1.4',
                    scale: 2
                });
                
                return result?.image || image;
            }
        } catch (error) {
            console.log('Enhancement failed, using original');
        }
        
        return image;
    }

    async generateEnvironment(prompt) {
        // Generate studio environment
        for (const space of this.hfSpaces.studioGeneration) {
            try {
                const result = await this.callHuggingFaceSpace(space.url, {
                    prompt: prompt,
                    negative_prompt: 'people, anchors, text',
                    width: 1920,
                    height: 1080,
                    num_inference_steps: 30
                });
                
                if (result?.image) {
                    return result.image;
                }
            } catch (error) {
                console.log(`Studio generation failed with ${space.model}`);
            }
        }
        
        return null;
    }

    connectToBroadcast() {
        // Listen for broadcast events
        window.addEventListener('broadcastUpdate', async (event) => {
            const { anchor, text, article, is_freakout } = event.detail;
            
            // Queue lip-sync generation if audio is available
            if (anchor && text) {
                this.queueLipSync({
                    characterId: anchor,
                    text: text,
                    isFreakout: is_freakout,
                    article: article,
                    priority: is_freakout ? 'high' : 'normal'
                });
            }
        });
        
        // WebSocket for audio data
        const ws = new WebSocket('wss://alledged-static-news-backend.hf.space/ws');
        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'audio_chunk' && data.audio && data.anchor) {
                // Process audio for lip-sync
                this.processAudioChunk(data);
            }
        };
    }

    queueLipSync(request) {
        console.log(`📹 Queuing lip-sync for ${request.characterId}: "${request.text.substring(0, 50)}..."`);
        
        // Add to queue with priority
        if (request.priority === 'high') {
            this.lipSyncQueue.unshift(request);
        } else {
            this.lipSyncQueue.push(request);
        }
    }

    async startLipSyncLoop() {
        while (true) {
            if (this.lipSyncQueue.length > 0) {
                const request = this.lipSyncQueue.shift();
                
                try {
                    // Generate audio if not provided
                    const audioData = request.audio || await this.generateAudio(request.text, request.characterId);
                    
                    // Generate lip-sync video
                    const video = await this.generateLipSyncVideo(
                        request.characterId,
                        audioData,
                        request.text
                    );
                    
                    if (video) {
                        // Display in live player
                        this.displayCharacterVideo(video, request);
                    }
                    
                } catch (error) {
                    console.error('Lip-sync processing error:', error);
                }
            }
            
            await this.sleep(1000);
        }
    }

    async generateAudio(text, characterId) {
        // Use the actual TTS system from the broadcast
        const character = this.characters.get(characterId);
        if (!character) {
            throw new Error(`Character ${characterId} not found`);
        }
        
        try {
            // Use Microsoft Speech SDK or HF TTS
            const ttsEndpoint = 'https://api-inference.huggingface.co/models/microsoft/speecht5_tts';
            const hfToken = localStorage.getItem('hf_token') || process.env.HUGGING_FACE_API_TOKEN;
            
            // Apply character voice traits
            const voiceConfig = this.getVoiceConfig(character.definition);
            
            const response = await fetch(ttsEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${hfToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: text,
                    parameters: {
                        speaker_embeddings: voiceConfig.speaker,
                        speed: voiceConfig.speed,
                        pitch: voiceConfig.pitch
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error('TTS generation failed');
            }
            
            const audioBlob = await response.blob();
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            return {
                data: audioBuffer.getChannelData(0),
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                buffer: audioBuffer,
                blob: audioBlob
            };
            
        } catch (error) {
            console.error('Audio generation failed:', error);
            // Fallback to Web Speech API
            return this.generateAudioFallback(text, characterId);
        }
    }
    
    getVoiceConfig(definition) {
        // Map character traits to voice parameters
        const configs = {
            'confused_patriotic': { speaker: 'male_low', speed: 0.9, pitch: 0.8 },
            'condescending_progressive': { speaker: 'female_mid', speed: 1.1, pitch: 1.2 },
            'aggressively_neutral': { speaker: 'male_mid', speed: 1.0, pitch: 1.0 },
            'depressed_millennial': { speaker: 'male_young', speed: 0.8, pitch: 0.7 },
            'overachiever_annoying': { speaker: 'female_high', speed: 1.3, pitch: 1.3 },
            'grizzled_veteran': { speaker: 'male_gruff', speed: 0.85, pitch: 0.6 }
        };
        
        return configs[definition.personality] || { speaker: 'neutral', speed: 1.0, pitch: 1.0 };
    }
    
    async generateAudioFallback(text, characterId) {
        // Use Web Speech API as fallback
        const utterance = new SpeechSynthesisUtterance(text);
        const character = this.characters.get(characterId);
        
        // Apply character voice traits
        if (character) {
            const traits = character.definition.voiceTraits;
            utterance.rate = traits.pitch === 'low' ? 0.8 : traits.pitch === 'high' ? 1.2 : 1.0;
            utterance.pitch = traits.pitch === 'low' ? 0.8 : traits.pitch === 'high' ? 1.5 : 1.0;
        }
        
        // Record the speech
        const audioChunks = [];
        const mediaRecorder = await this.recordSpeech(utterance);
        
        return new Promise((resolve) => {
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                resolve({
                    data: audioBuffer.getChannelData(0),
                    duration: audioBuffer.duration,
                    sampleRate: audioBuffer.sampleRate,
                    buffer: audioBuffer,
                    blob: audioBlob
                });
            };
            
            window.speechSynthesis.speak(utterance);
            mediaRecorder.start();
            
            utterance.onend = () => {
                mediaRecorder.stop();
            };
        });
    }
    
    async recordSpeech(utterance) {
        // Set up audio recording from speech synthesis
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        
        // This requires more complex setup to capture system audio
        // For now, create a simple recorder
        const mediaRecorder = new MediaRecorder(destination.stream);
        return mediaRecorder;
    }

    displayCharacterVideo(video, request) {
        // Display in the live player section
        const livePlayer = document.querySelector('.live-player-container');
        if (!livePlayer) return;
        
        // Create or update video element
        let videoEl = document.getElementById('character-video');
        if (!videoEl) {
            videoEl = document.createElement('video');
            videoEl.id = 'character-video';
            videoEl.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 10;
            `;
            livePlayer.appendChild(videoEl);
        }
        
        // Update video source
        videoEl.src = video;
        videoEl.play();
        
        // Update UI to show current anchor
        this.updateAnchorStatus(request.characterId, 'live');
        
        // Hide after video ends
        videoEl.onended = () => {
            videoEl.style.display = 'none';
            this.updateAnchorStatus(request.characterId, 'idle');
        };
    }

    updateAnchorStatus(characterId, status) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        // Update anchor status panel
        const statusPanel = document.querySelector('.anchor-status-panel');
        if (statusPanel) {
            const anchorItem = Array.from(statusPanel.querySelectorAll('.anchor-status-item'))
                .find(item => item.textContent.includes(character.definition.name));
            
            if (anchorItem) {
                const indicator = anchorItem.querySelector('.status-dot');
                if (indicator) {
                    indicator.className = `status-dot ${status === 'live' ? 'critical' : 'stable'}`;
                }
            }
        }
    }

    async callHuggingFaceSpace(spaceUrl, params) {
        // Make actual API call to Hugging Face Space
        try {
            // Extract space ID from URL
            const spaceMatch = spaceUrl.match(/spaces\/([^\/]+\/[^\/]+)/);
            if (!spaceMatch) {
                throw new Error('Invalid HF Space URL');
            }
            
            const spaceId = spaceMatch[1];
            const apiUrl = `https://hf.space/embed/${spaceId}/api/predict/`;
            
            // Get HF token
            const hfToken = localStorage.getItem('hf_token') || process.env.HUGGING_FACE_API_TOKEN;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': hfToken ? `Bearer ${hfToken}` : undefined
                },
                body: JSON.stringify({
                    data: Object.values(params)
                })
            });
            
            if (!response.ok) {
                throw new Error(`HF Space API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Extract data from response
            if (result.data && result.data[0]) {
                // Handle different response types
                if (typeof result.data[0] === 'string' && result.data[0].startsWith('data:')) {
                    return { image: result.data[0], video: result.data[0] };
                } else if (result.data[0].url) {
                    return { image: result.data[0].url, video: result.data[0].url };
                }
            }
            
            return result;
            
        } catch (error) {
            console.error(`HF Space call failed:`, error);
            throw error;
        }
    }

    async framesToVideo(frames, duration) {
        // Convert frames to actual video using canvas recording
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Set up video encoder
        const stream = canvas.captureStream(30); // 30 fps
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 2500000
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
            
            // Play frames
            let frameIndex = 0;
            const fps = 30;
            const frameInterval = 1000 / fps;
            
            const playFrames = async () => {
                if (frameIndex < frames.length) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        frameIndex++;
                        setTimeout(playFrames, frameInterval);
                    };
                    img.src = frames[frameIndex];
                } else {
                    // All frames played
                    setTimeout(() => {
                        mediaRecorder.stop();
                    }, 100);
                }
            };
            
            playFrames();
        });
    }

    processAudioChunk(data) {
        // Process incoming audio for lip-sync
        // This would buffer and process audio streams
        console.log('Processing audio chunk for', data.anchor);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API for testing
    async generateTestVideo(characterId = 'ray', text = 'This is a test broadcast from Static.news!') {
        console.log(`🎬 Generating test video for ${characterId}...`);
        
        const audioData = await this.generateAudio(text, characterId);
        const video = await this.generateLipSyncVideo(characterId, audioData, text);
        
        if (video) {
            this.displayCharacterVideo(video, {
                characterId,
                text,
                priority: 'high'
            });
            return video;
        }
        
        return null;
    }

    // Celebrity guest system
    async generateCelebrityGuest(celebrityName) {
        console.log(`🌟 Generating celebrity guest: ${celebrityName}`);
        
        // Create cartoon/3D version to avoid likeness issues
        const guestDefinition = {
            name: celebrityName,
            personality: 'celebrity_parody',
            appearance: {
                age: 'timeless',
                hair: 'iconic style',
                face: 'caricature features',
                attire: 'signature outfit',
                expression: 'celebrity smile'
            },
            style: 'cartoon' // Always non-realistic for celebrities
        };
        
        // Generate cartoon celebrity
        const portrait = await this.generateCartoonCelebrity(guestDefinition);
        
        // Store as temporary character
        const guestId = `guest_${Date.now()}`;
        this.characters.set(guestId, {
            id: guestId,
            definition: guestDefinition,
            portrait: portrait,
            variations: { neutral: portrait },
            ready: true,
            temporary: true
        });
        
        return guestId;
    }

    async generateCartoonCelebrity(definition) {
        // Generate cartoon/stylized version
        const prompt = `Cartoon caricature of celebrity, ${definition.appearance.expression}, animated style, colorful, fun, NOT photorealistic`;
        
        // Use stylized generation
        for (const space of this.hfSpaces.avatarGeneration) {
            if (space.style !== 'photorealistic') {
                try {
                    const result = await this.callHuggingFaceSpace(space.url, {
                        prompt: prompt,
                        style: 'cartoon',
                        guidance_scale: 10
                    });
                    
                    if (result?.image) {
                        return result.image;
                    }
                } catch (error) {
                    console.log('Cartoon generation failed');
                }
            }
        }
        
        // Fallback to procedural cartoon
        return this.generateProceduralCartoon(definition);
    }

    generateProceduralCartoon(definition) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Cartoon background
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, '#ffeb3b');
        gradient.addColorStop(1, '#ff9800');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Cartoon face
        ctx.fillStyle = '#fdd835';
        ctx.beginPath();
        ctx.arc(256, 256, 150, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(200, 220, 20, 0, Math.PI * 2);
        ctx.arc(312, 220, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(256, 280, 80, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Star sparkles
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            this.drawStar(ctx, x, y, 10);
        }
        
        return canvas.toDataURL('image/png');
    }

    drawStar(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.rotate(Math.PI * 2 / 5);
            ctx.lineTo(0, -size);
            ctx.rotate(Math.PI * 2 / 5);
            ctx.lineTo(0, -size / 2);
        }
        ctx.fill();
        ctx.restore();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live')) {
        window.aiCharacterSystem = new AICharacterSystem();
        console.log('🎭 AI Character System initialized');
        console.log('Test with: aiCharacterSystem.generateTestVideo()');
        console.log('Add celebrity: aiCharacterSystem.generateCelebrityGuest("Tom Crews")');
    }
});

// Export
window.AICharacterSystem = AICharacterSystem;