/**
 * Babylon.js Premium News Studio
 * Photorealistic broadcast studio with advanced rendering
 */

class BabylonNewsStudio {
    constructor() {
        this.canvas = document.getElementById('studio-canvas');
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.lights = [];
        this.materials = {};
        
        this.init();
    }
    
    async init() {
        // Create Babylon engine with maximum quality
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            powerPreference: "high-performance",
            audioEngine: false
        });
        
        // Enable all advanced features
        this.engine.enableOfflineSupport = false;
        
        await this.createScene();
        this.setupPostProcessing();
        
        // Render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent
        
        // Enable physics for realistic materials
        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0));
        
        // Setup camera
        this.setupCamera();
        
        // Load environment
        await this.loadEnvironment();
        
        // Create studio elements
        await this.createStudioGeometry();
        
        // Setup lighting
        this.setupBroadcastLighting();
        
        // Add atmospheric effects
        this.addAtmosphericEffects();
    }
    
    setupCamera() {
        // Professional broadcast camera setup
        this.camera = new BABYLON.UniversalCamera(
            "BroadcastCamera",
            new BABYLON.Vector3(-12, 4.5, 18),
            this.scene
        );
        
        this.camera.setTarget(new BABYLON.Vector3(0, 2.5, -3));
        this.camera.fov = 0.6; // 35mm equivalent
        this.camera.minZ = 0.1;
        this.camera.maxZ = 1000;
        
        // Cinematic depth of field
        this.camera.fStop = 2.8;
        this.camera.focusDistance = 15;
        this.camera.focalLength = 50;
        
        // Attach to canvas
        this.camera.attachControl(this.canvas, false);
        
        // Disable user controls for automatic camera
        this.camera.inputs.clear();
        
        // Add subtle camera shake
        this.addCameraAnimation();
    }
    
    addCameraAnimation() {
        // Subtle handheld camera movement
        const cameraShake = new BABYLON.Animation(
            "cameraShake",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        const basePos = this.camera.position.clone();
        
        for (let i = 0; i <= 100; i++) {
            keys.push({
                frame: i,
                value: new BABYLON.Vector3(
                    basePos.x + Math.sin(i * 0.1) * 0.05,
                    basePos.y + Math.sin(i * 0.15) * 0.03,
                    basePos.z + Math.sin(i * 0.08) * 0.02
                )
            });
        }
        
        cameraShake.setKeys(keys);
        this.camera.animations.push(cameraShake);
        this.scene.beginAnimation(this.camera, 0, 100, true);
    }
    
    async loadEnvironment() {
        // Load HDR environment for realistic reflections
        const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
            "/assets/studio_environment.env",
            this.scene
        );
        
        this.scene.environmentTexture = hdrTexture;
        this.scene.createDefaultSkybox(hdrTexture, true, 1000, 0.0);
        
        // Setup IBL
        this.scene.environmentIntensity = 0.6;
        this.scene.environmentTexture.lodGenerationScale = 0.8;
    }
    
    async createStudioGeometry() {
        // Create premium materials first
        this.createMaterials();
        
        // Studio floor with reflections
        const floor = BABYLON.MeshBuilder.CreateGround("floor", {
            width: 50,
            height: 40,
            subdivisions: 32
        }, this.scene);
        
        floor.material = this.materials.studioFloor;
        floor.receiveShadows = true;
        
        // Create the iconic curved desk
        await this.createBroadcastDesk();
        
        // Create LED video wall
        await this.createVideoWall();
        
        // Add studio infrastructure
        this.createStudioRig();
        
        // Add branded elements
        this.createStaticBranding();
    }
    
    createMaterials() {
        // Premium floor material
        this.materials.studioFloor = new BABYLON.PBRMaterial("floorMat", this.scene);
        this.materials.studioFloor.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        this.materials.studioFloor.metallic = 0.0;
        this.materials.studioFloor.roughness = 0.1;
        this.materials.studioFloor.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, this.scene, true);
        this.materials.studioFloor.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
        this.materials.studioFloor.reflectionTexture.level = 0.4;
        
        // Glass desk material
        this.materials.deskGlass = new BABYLON.PBRMaterial("deskGlass", this.scene);
        this.materials.deskGlass.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        this.materials.deskGlass.metallic = 0.1;
        this.materials.deskGlass.roughness = 0.0;
        this.materials.deskGlass.indexOfRefraction = 1.52;
        this.materials.deskGlass.alpha = 0.3;
        this.materials.deskGlass.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        this.materials.deskGlass.subSurface.isRefractionEnabled = true;
        
        // Brushed metal material
        this.materials.brushedMetal = new BABYLON.PBRMaterial("brushedMetal", this.scene);
        this.materials.brushedMetal.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.materials.brushedMetal.metallic = 1.0;
        this.materials.brushedMetal.roughness = 0.2;
        this.materials.brushedMetal.clearCoat.isEnabled = true;
        this.materials.brushedMetal.clearCoat.intensity = 0.5;
        
        // LED emissive material
        this.materials.ledRed = new BABYLON.PBRMaterial("ledRed", this.scene);
        this.materials.ledRed.emissiveColor = new BABYLON.Color3(1, 0, 0);
        this.materials.ledRed.emissiveIntensity = 3;
        this.materials.ledRed.albedoColor = new BABYLON.Color3(1, 0, 0);
    }
    
    async createBroadcastDesk() {
        // Create curved desk path
        const deskPath = [];
        const segments = 50;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments - 0.5) * Math.PI * 0.6;
            const radius = 8;
            deskPath.push(new BABYLON.Vector3(
                Math.sin(angle) * radius,
                0,
                Math.cos(angle) * radius - 5
            ));
        }
        
        // Desk profile
        const deskProfile = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 1.2, 0),
            new BABYLON.Vector3(0.05, 1.25, 0),
            new BABYLON.Vector3(1.5, 1.25, 0),
            new BABYLON.Vector3(1.6, 1.2, 0),
            new BABYLON.Vector3(1.6, 0, 0)
        ];
        
        // Extrude desk
        const desk = BABYLON.MeshBuilder.ExtrudeShape("desk", {
            shape: deskProfile,
            path: deskPath,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            cap: BABYLON.Mesh.CAP_ALL
        }, this.scene);
        
        desk.material = this.materials.brushedMetal;
        desk.position.y = 0;
        
        // Glass top
        const glassTop = BABYLON.MeshBuilder.CreateBox("glassTop", {
            width: 16,
            height: 0.05,
            depth: 3
        }, this.scene);
        
        glassTop.material = this.materials.deskGlass;
        glassTop.position = new BABYLON.Vector3(0, 1.27, -3);
        
        // LED accent strip
        const ledStrip = BABYLON.MeshBuilder.CreateBox("ledStrip", {
            width: 15,
            height: 0.02,
            depth: 0.1
        }, this.scene);
        
        ledStrip.material = this.materials.ledRed;
        ledStrip.position = new BABYLON.Vector3(0, 0.1, -1.5);
        
        // Add glow layer for LED
        const gl = new BABYLON.GlowLayer("glow", this.scene);
        gl.intensity = 0.5;
        gl.addIncludedOnlyMesh(ledStrip);
    }
    
    async createVideoWall() {
        // Create curved video wall with individual panels
        const wallRadius = 15;
        const panelCount = 15;
        const panelWidth = 2.5;
        const panelHeight = 7;
        
        for (let i = 0; i < panelCount; i++) {
            const angle = (i / (panelCount - 1) - 0.5) * Math.PI * 0.8;
            
            const panel = BABYLON.MeshBuilder.CreatePlane(`panel${i}`, {
                width: panelWidth,
                height: panelHeight
            }, this.scene);
            
            panel.position = new BABYLON.Vector3(
                Math.sin(angle) * wallRadius,
                panelHeight / 2,
                Math.cos(angle) * wallRadius - 12
            );
            
            panel.rotation.y = -angle;
            
            // Create dynamic video texture
            const videoMat = new BABYLON.PBRMaterial(`videoMat${i}`, this.scene);
            videoMat.emissiveColor = new BABYLON.Color3(0, 0.1, 0.3);
            videoMat.emissiveIntensity = 1.5;
            videoMat.albedoColor = new BABYLON.Color3(0, 0, 0);
            
            // Add animated texture
            this.createAnimatedPanelTexture(videoMat, i);
            
            panel.material = videoMat;
        }
    }
    
    createAnimatedPanelTexture(material, index) {
        const textureSize = 512;
        const dynamicTexture = new BABYLON.DynamicTexture(`panelTex${index}`, {
            width: textureSize,
            height: textureSize * 2
        }, this.scene, false);
        
        material.emissiveTexture = dynamicTexture;
        material.albedoTexture = dynamicTexture;
        
        const context = dynamicTexture.getContext();
        
        // Animate the texture
        this.scene.registerBeforeRender(() => {
            context.fillStyle = '#000022';
            context.fillRect(0, 0, textureSize, textureSize * 2);
            
            // Grid animation
            const time = Date.now() * 0.0001;
            context.strokeStyle = '#003366';
            context.lineWidth = 2;
            
            for (let y = 0; y < 20; y++) {
                const yPos = (y * 50 + time * 200) % (textureSize * 2);
                context.beginPath();
                context.moveTo(0, yPos);
                context.lineTo(textureSize, yPos);
                context.stroke();
            }
            
            // Add news graphics
            if (index % 3 === 1) {
                context.fillStyle = '#ff0000';
                context.fillRect(50, 600, 300, 5);
                
                context.fillStyle = '#ffffff';
                context.font = '60px Arial';
                context.fillText('STATIC', 60, 680);
                
                context.font = '30px Arial';
                context.fillText('NEWS', 60, 720);
            }
            
            dynamicTexture.update();
        });
    }
    
    createStudioRig() {
        // Ceiling grid
        const gridSize = 2.5;
        const rigMaterial = new BABYLON.PBRMaterial("rigMat", this.scene);
        rigMaterial.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        rigMaterial.metallic = 0.8;
        rigMaterial.roughness = 0.6;
        
        for (let x = -15; x <= 15; x += gridSize) {
            for (let z = -15; z <= 10; z += gridSize) {
                const rig = BABYLON.MeshBuilder.CreateBox("rig", {
                    width: 0.1,
                    height: 0.4,
                    depth: 0.1
                }, this.scene);
                
                rig.position = new BABYLON.Vector3(x, 9, z);
                rig.material = rigMaterial;
            }
        }
        
        // Support columns
        const columnMaterial = new BABYLON.PBRMaterial("columnMat", this.scene);
        columnMaterial.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        columnMaterial.metallic = 0.9;
        columnMaterial.roughness = 0.2;
        
        const columnPositions = [
            [-18, 0, -8], [18, 0, -8],
            [-18, 0, 8], [18, 0, 8]
        ];
        
        columnPositions.forEach(pos => {
            const column = BABYLON.MeshBuilder.CreateCylinder("column", {
                diameter: 1,
                height: 10
            }, this.scene);
            
            column.position = new BABYLON.Vector3(pos[0], 5, pos[2]);
            column.material = columnMaterial;
        });
    }
    
    createStaticBranding() {
        // 3D logo with advanced materials
        const logoMaterial = new BABYLON.PBRMaterial("logoMat", this.scene);
        logoMaterial.albedoColor = new BABYLON.Color3(1, 0, 0);
        logoMaterial.metallic = 0.9;
        logoMaterial.roughness = 0.1;
        logoMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        
        // Would load 3D logo mesh here
        // For now, create placeholder
        const logo = BABYLON.MeshBuilder.CreateBox("logo", {
            width: 3,
            height: 0.5,
            depth: 0.2
        }, this.scene);
        
        logo.position = new BABYLON.Vector3(0, 1.5, -1);
        logo.material = logoMaterial;
        
        // Add to glow layer
        const gl = this.scene.getGlowLayerByName("glow");
        if (gl) {
            gl.addIncludedOnlyMesh(logo);
        }
    }
    
    setupBroadcastLighting() {
        // Key light - main broadcast light
        const keyLight = new BABYLON.SpotLight(
            "keyLight",
            new BABYLON.Vector3(-8, 12, 12),
            new BABYLON.Vector3(0.3, -0.8, -0.5),
            Math.PI / 3,
            20,
            this.scene
        );
        keyLight.intensity = 300;
        keyLight.diffuse = new BABYLON.Color3(1, 0.98, 0.95);
        
        // Shadow generator for key light
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, keyLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.3);
        
        // Fill light
        const fillLight = new BABYLON.SpotLight(
            "fillLight",
            new BABYLON.Vector3(8, 10, 8),
            new BABYLON.Vector3(-0.3, -0.8, -0.5),
            Math.PI / 2,
            30,
            this.scene
        );
        fillLight.intensity = 150;
        fillLight.diffuse = new BABYLON.Color3(0.9, 0.95, 1);
        
        // Back light for rim lighting
        const backLight = new BABYLON.SpotLight(
            "backLight",
            new BABYLON.Vector3(0, 10, -15),
            new BABYLON.Vector3(0, -0.5, 0.8),
            Math.PI / 2,
            40,
            this.scene
        );
        backLight.intensity = 200;
        backLight.diffuse = new BABYLON.Color3(0.3, 0.5, 1);
        
        // Studio ambient
        const hemi = new BABYLON.HemisphericLight(
            "hemi",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        hemi.intensity = 0.3;
        hemi.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        
        // Red accent lights
        const accent1 = new BABYLON.PointLight(
            "accent1",
            new BABYLON.Vector3(-10, 3, 0),
            this.scene
        );
        accent1.intensity = 50;
        accent1.diffuse = new BABYLON.Color3(1, 0, 0);
        
        const accent2 = new BABYLON.PointLight(
            "accent2",
            new BABYLON.Vector3(10, 3, 0),
            this.scene
        );
        accent2.intensity = 50;
        accent2.diffuse = new BABYLON.Color3(1, 0, 0);
        
        // Animate accent lights
        this.animateAccentLights([accent1, accent2]);
    }
    
    animateAccentLights(lights) {
        let time = 0;
        this.scene.registerBeforeRender(() => {
            time += 0.01;
            lights.forEach((light, i) => {
                light.intensity = 50 + Math.sin(time + i * Math.PI) * 10;
            });
        });
    }
    
    addAtmosphericEffects() {
        // Volumetric light scattering
        const volumetricLight = new BABYLON.VolumetricLightScatteringPostProcess(
            'volumetric',
            1.0,
            this.camera,
            null,
            100,
            BABYLON.Texture.BILINEAR_SAMPLINGMODE,
            this.engine,
            false
        );
        
        volumetricLight.exposure = 0.15;
        volumetricLight.decay = 0.95;
        volumetricLight.weight = 0.5;
        volumetricLight.density = 0.5;
        
        // Add subtle fog
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = new BABYLON.Color3(0.02, 0.02, 0.03);
    }
    
    setupPostProcessing() {
        // Create rendering pipeline
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            "default",
            true,
            this.scene,
            [this.camera]
        );
        
        // Enable and configure effects
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.3;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;
        
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;
        pipeline.depthOfField.focusDistance = 15000;
        pipeline.depthOfField.focalLength = 150;
        pipeline.depthOfField.fStop = 2.8;
        
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 0.3;
        
        pipeline.grainEnabled = true;
        pipeline.grain.intensity = 3;
        pipeline.grain.animated = true;
        
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        pipeline.imageProcessing.exposure = 1.2;
        pipeline.imageProcessing.contrast = 1.2;
        pipeline.imageProcessing.vignetteEnabled = true;
        pipeline.imageProcessing.vignetteWeight = 0.3;
        pipeline.imageProcessing.vignetteFOV = 0.5;
        
        pipeline.sharpenEnabled = true;
        pipeline.sharpen.edgeAmount = 0.3;
        pipeline.sharpen.colorAmount = 0.5;
        
        pipeline.fxaaEnabled = true;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.babylonStudio = new BabylonNewsStudio();
});