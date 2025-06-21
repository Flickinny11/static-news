// Photorealistic 3D Newsroom with AI Anchors
class PhotorealisticNewsroom {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = null;
        this.scene = null;
        this.anchors = [];
        this.animationGroups = [];
    }

    async init() {
        // Initialize Babylon.js with optimizations
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            adaptToDeviceRatio: true,
            powerPreference: "high-performance"
        });

        this.scene = await this.createPhotorealisticScene();
        
        // Optimize for performance
        this.scene.freezeActiveMeshes();
        this.scene.skipPointerMovePicking = true;
        this.scene.constantlyUpdateMeshUnderPointer = false;
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    async createPhotorealisticScene() {
        const scene = new BABYLON.Scene(this.engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent for overlay
        
        // Enable PBR
        scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
            "https://playground.babylonjs.com/textures/environment.dds", scene
        );
        
        // Professional TV studio camera setup
        const camera = new BABYLON.UniversalCamera("StudioCamera", new BABYLON.Vector3(0, 2.5, -8), scene);
        camera.setTarget(new BABYLON.Vector3(0, 1.8, 0));
        camera.fov = 0.8; // Wider angle for TV look
        
        // Cinematic depth of field
        const lensEffect = new BABYLON.LensRenderingPipeline('lens', {
            edge_blur: 1.0,
            chromatic_aberration: 0.5,
            distortion: 0.2,
            blur_noise: true
        }, scene, 1.0, [camera]);
        
        // Professional TV studio lighting
        await this.setupPhotorealisticLighting(scene);
        
        // Create the newsroom environment
        await this.createNewsroomSet(scene);
        
        // Create photorealistic AI anchors
        await this.createPhotorealisticAnchors(scene);
        
        // Add atmospheric effects
        this.addAtmosphericEffects(scene);
        
        // Professional post-processing
        this.setupCinematicPostProcessing(scene, camera);
        
        return scene;
    }

    async setupPhotorealisticLighting(scene) {
        // Key Light - Main studio light
        const keyLight = new BABYLON.SpotLight("keyLight", 
            new BABYLON.Vector3(5, 8, -5), 
            new BABYLON.Vector3(-0.5, -0.7, 0.5), 
            Math.PI/3, 20, scene);
        keyLight.intensity = 1500;
        keyLight.diffuse = new BABYLON.Color3(1, 0.98, 0.95);
        
        // Create soft shadows
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, keyLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.3);
        
        // Fill Light - Soften shadows
        const fillLight = new BABYLON.HemisphericLight("fillLight", new BABYLON.Vector3(0, 1, 0), scene);
        fillLight.intensity = 0.3;
        fillLight.diffuse = new BABYLON.Color3(0.8, 0.85, 1);
        fillLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        
        // Rim Lights - Studio backlighting
        const rimLight1 = new BABYLON.SpotLight("rimLight1", 
            new BABYLON.Vector3(-6, 5, 3), 
            new BABYLON.Vector3(0.7, -0.5, -0.5), 
            Math.PI/4, 10, scene);
        rimLight1.intensity = 800;
        rimLight1.diffuse = new BABYLON.Color3(0.8, 0.9, 1);
        
        const rimLight2 = new BABYLON.SpotLight("rimLight2", 
            new BABYLON.Vector3(6, 5, 3), 
            new BABYLON.Vector3(-0.7, -0.5, -0.5), 
            Math.PI/4, 10, scene);
        rimLight2.intensity = 800;
        rimLight2.diffuse = new BABYLON.Color3(1, 0.8, 0.8);
        
        // Studio ambient lighting
        scene.ambientColor = new BABYLON.Color3(0.15, 0.15, 0.2);
        
        return shadowGenerator;
    }

    async createNewsroomSet(scene) {
        // Professional news desk with high-quality materials
        const deskGeometry = BABYLON.MeshBuilder.CreateBox("newsDesk", {
            width: 12,
            height: 1.2,
            depth: 4
        }, scene);
        deskGeometry.position.y = 0.6;
        
        // Ultra-realistic desk material
        const deskMaterial = new BABYLON.PBRMaterial("deskMaterial", scene);
        deskMaterial.baseColor = new BABYLON.Color3(0.05, 0.05, 0.08);
        deskMaterial.metallicFactor = 0.2;
        deskMaterial.roughness = 0.3;
        deskMaterial.clearCoat.isEnabled = true;
        deskMaterial.clearCoat.intensity = 0.6;
        deskMaterial.clearCoat.roughness = 0.1;
        
        // Add subtle red accent lighting
        deskMaterial.emissiveColor = new BABYLON.Color3(0.1, 0, 0);
        deskMaterial.emissiveIntensity = 0.3;
        
        deskGeometry.material = deskMaterial;
        
        // LED panels backdrop
        const ledWall = BABYLON.MeshBuilder.CreatePlane("ledWall", {
            width: 20,
            height: 10
        }, scene);
        ledWall.position.set(0, 5, 8);
        
        // Dynamic LED display material
        const ledMaterial = new BABYLON.StandardMaterial("ledMaterial", scene);
        const dynamicTexture = new BABYLON.DynamicTexture("newsTexture", {
            width: 1920,
            height: 1080
        }, scene);
        
        // Animated news graphics
        let frame = 0;
        scene.registerBeforeRender(() => {
            const ctx = dynamicTexture.getContext();
            
            // Dark studio background
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, 1920, 1080);
            
            // Animated grid pattern
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
                const offset = (frame * 0.5 + i * 100) % 1920;
                ctx.beginPath();
                ctx.moveTo(offset, 0);
                ctx.lineTo(offset, 1080);
                ctx.stroke();
            }
            
            // Static.news branding
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillText('STATIC.NEWS', 960, 200);
            
            // Live indicator
            if (frame % 60 < 30) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(300, 900, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.font = '48px Arial';
                ctx.fillText('LIVE', 380, 920);
            }
            
            frame++;
            dynamicTexture.update();
        });
        
        ledMaterial.diffuseTexture = dynamicTexture;
        ledMaterial.emissiveTexture = dynamicTexture;
        ledMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        ledMaterial.backFaceCulling = false;
        ledWall.material = ledMaterial;
        
        // Studio floor with reflections
        const floor = BABYLON.MeshBuilder.CreateGround("floor", {
            width: 30,
            height: 20
        }, scene);
        
        const floorMaterial = new BABYLON.PBRMaterial("floorMaterial", scene);
        floorMaterial.baseColor = new BABYLON.Color3(0.02, 0.02, 0.03);
        floorMaterial.metallicFactor = 0.1;
        floorMaterial.roughness = 0.2;
        floorMaterial.clearCoat.isEnabled = true;
        floorMaterial.clearCoat.intensity = 0.8;
        floor.material = floorMaterial;
        
        // Professional studio monitors
        [-4, 0, 4].forEach((x, index) => {
            const monitor = BABYLON.MeshBuilder.CreateBox(`monitor${index}`, {
                width: 0.8,
                height: 0.5,
                depth: 0.05
            }, scene);
            monitor.position.set(x, 1.4, -1.5);
            monitor.rotation.x = -0.3;
            
            const monitorMat = new BABYLON.StandardMaterial(`monitorMat${index}`, scene);
            monitorMat.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
            monitorMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
            monitor.material = monitorMat;
        });
    }

    async createPhotorealisticAnchors(scene) {
        const anchorData = [
            { name: "Ray McPatriot", position: new BABYLON.Vector3(-3, 1.5, 0), color: new BABYLON.Color3(1, 0.2, 0.2) },
            { name: "Berkeley Justice", position: new BABYLON.Vector3(0, 1.5, 0), color: new BABYLON.Color3(0.2, 0.2, 1) },
            { name: "Switz Middleton", position: new BABYLON.Vector3(3, 1.5, 0), color: new BABYLON.Color3(0.5, 0.5, 0.5) }
        ];

        for (const data of anchorData) {
            // Create sophisticated holographic anchor representation
            const anchorGroup = new BABYLON.TransformNode(data.name, scene);
            anchorGroup.position = data.position;
            
            // Holographic body form
            const body = BABYLON.MeshBuilder.CreateCapsule(`${data.name}_body`, {
                height: 2,
                radius: 0.4,
                tessellation: 32
            }, scene);
            body.parent = anchorGroup;
            
            // Holographic head
            const head = BABYLON.MeshBuilder.CreateSphere(`${data.name}_head`, {
                diameter: 0.8,
                segments: 32
            }, scene);
            head.position.y = 1.5;
            head.parent = anchorGroup;
            
            // Advanced holographic material
            const holoMaterial = new BABYLON.StandardMaterial(`${data.name}_material`, scene);
            holoMaterial.diffuseColor = data.color;
            holoMaterial.emissiveColor = data.color.scale(0.5);
            holoMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
            holoMaterial.alpha = 0.7;
            holoMaterial.wireframe = Math.random() > 0.7; // Occasional wireframe glitch
            
            body.material = holoMaterial;
            head.material = holoMaterial;
            
            // Holographic scan lines effect
            const scanLines = BABYLON.MeshBuilder.CreatePlane(`${data.name}_scan`, {
                width: 2,
                height: 3
            }, scene);
            scanLines.parent = anchorGroup;
            scanLines.position.z = -0.5;
            scanLines.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
            
            const scanMaterial = new BABYLON.StandardMaterial(`${data.name}_scan_mat`, scene);
            const scanTexture = new BABYLON.DynamicTexture(`${data.name}_scan_tex`, {
                width: 256,
                height: 512
            }, scene);
            
            // Animate scan lines
            let scanY = 0;
            scene.registerBeforeRender(() => {
                const ctx = scanTexture.getContext();
                ctx.clearRect(0, 0, 256, 512);
                ctx.strokeStyle = `rgba(${data.color.r * 255}, ${data.color.g * 255}, ${data.color.b * 255}, 0.3)`;
                ctx.lineWidth = 2;
                
                for (let i = 0; i < 5; i++) {
                    const y = ((scanY + i * 100) % 512);
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(256, y);
                    ctx.stroke();
                }
                
                scanY += 2;
                scanTexture.update();
            });
            
            scanMaterial.diffuseTexture = scanTexture;
            scanMaterial.opacityTexture = scanTexture;
            scanMaterial.emissiveColor = data.color;
            scanMaterial.backFaceCulling = false;
            scanLines.material = scanMaterial;
            
            // Floating animation
            const floatAnim = new BABYLON.Animation(
                `${data.name}_float`,
                "position.y",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            floatAnim.setKeys([
                { frame: 0, value: data.position.y },
                { frame: 30, value: data.position.y + 0.1 },
                { frame: 60, value: data.position.y }
            ]);
            
            anchorGroup.animations.push(floatAnim);
            scene.beginAnimation(anchorGroup, 0, 60, true);
            
            // Glitch effect
            setInterval(() => {
                if (Math.random() < 0.1) {
                    holoMaterial.alpha = 0.3;
                    setTimeout(() => {
                        holoMaterial.alpha = 0.7;
                    }, 100);
                }
            }, 1000);
            
            this.anchors.push(anchorGroup);
        }
    }

    addAtmosphericEffects(scene) {
        // Volumetric fog for studio atmosphere
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        scene.fogDensity = 0.02;
        scene.fogColor = new BABYLON.Color3(0.05, 0.05, 0.1);
        
        // Dust particles in light beams
        const dustSystem = new BABYLON.ParticleSystem("dust", 500, scene);
        dustSystem.particleTexture = new BABYLON.Texture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVQIHWP4//8/AzYwirkTm38Uk4jWAQC0FgYH6XOjAgAAAABJRU5ErkJggg==", scene);
        
        dustSystem.emitter = new BABYLON.Vector3(0, 5, 0);
        dustSystem.minEmitBox = new BABYLON.Vector3(-10, -5, -10);
        dustSystem.maxEmitBox = new BABYLON.Vector3(10, 5, 10);
        
        dustSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.1);
        dustSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.05);
        dustSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0);
        
        dustSystem.minSize = 0.01;
        dustSystem.maxSize = 0.05;
        dustSystem.minLifeTime = 10;
        dustSystem.maxLifeTime = 20;
        
        dustSystem.emitRate = 20;
        dustSystem.gravity = new BABYLON.Vector3(0, -0.01, 0);
        dustSystem.direction1 = new BABYLON.Vector3(-0.1, 0, -0.1);
        dustSystem.direction2 = new BABYLON.Vector3(0.1, 0.1, 0.1);
        
        dustSystem.start();
    }

    setupCinematicPostProcessing(scene, camera) {
        // Professional color grading pipeline
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            "cinematic",
            true,
            scene,
            [camera]
        );
        
        // Bloom for broadcast quality
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.9;
        pipeline.bloomWeight = 0.3;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;
        
        // Professional depth of field
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfField.focalLength = 50;
        pipeline.depthOfField.fStop = 1.4;
        pipeline.depthOfField.focusDistance = 8;
        pipeline.depthOfField.maxBlur = 0.5;
        
        // Color grading
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.contrast = 1.4;
        pipeline.imageProcessing.exposure = 1.2;
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        
        // Vignette for cinematic look
        pipeline.imageProcessing.vignetteEnabled = true;
        pipeline.imageProcessing.vignetteWeight = 0.4;
        pipeline.imageProcessing.vignetteFOV = 0.5;
        
        // Subtle chromatic aberration
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 3;
        
        // Film grain
        pipeline.grainEnabled = true;
        pipeline.grain.intensity = 5;
        pipeline.grain.animated = true;
    }

    // Optimize rendering performance
    enableOptimizations() {
        // LOD for complex meshes
        this.scene.meshes.forEach(mesh => {
            if (mesh.getTotalVertices() > 1000) {
                mesh.simplify([
                    { quality: 0.9, distance: 10 },
                    { quality: 0.7, distance: 20 },
                    { quality: 0.5, distance: 40 }
                ], false);
            }
        });
        
        // Occlusion queries
        this.scene.meshes.forEach(mesh => {
            mesh.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
            mesh.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;
        });
    }
}

// Export for use
window.PhotorealisticNewsroom = PhotorealisticNewsroom;