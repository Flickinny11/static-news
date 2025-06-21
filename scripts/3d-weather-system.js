// Hollywood-level 3D Interactive Weather System
class WeatherSystem3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.weatherData = null;
        this.currentLocation = { lat: 40.7128, lon: -74.0060 }; // Default NYC
        this.animationGroups = [];
        this.particles = [];
    }

    async initialize() {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        this.container.appendChild(canvas);
        
        // Initialize Babylon.js
        this.engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true
        });
        
        this.scene = await this.createWeatherScene();
        
        // Start render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        
        // Load initial weather
        await this.loadWeatherForLocation(this.currentLocation);
    }

    async createWeatherScene() {
        const scene = new BABYLON.Scene(this.engine);
        scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1);
        
        // Camera setup - interactive orbital camera
        this.camera = new BABYLON.ArcRotateCamera(
            'weatherCamera',
            -Math.PI / 2,
            Math.PI / 3,
            50,
            BABYLON.Vector3.Zero(),
            scene
        );
        this.camera.attachControl(this.container, true);
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperRadiusLimit = 100;
        
        // Cinematic lighting
        const light1 = new BABYLON.DirectionalLight(
            'sunLight',
            new BABYLON.Vector3(-1, -2, -1),
            scene
        );
        light1.intensity = 1.2;
        light1.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
        
        const light2 = new BABYLON.HemisphericLight(
            'skyLight',
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        light2.intensity = 0.5;
        light2.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        
        // Create 3D terrain map
        await this.createTerrainMap(scene);
        
        // Create weather visualization layers
        this.createWeatherLayers(scene);
        
        // Add post-processing
        this.setupPostProcessing(scene);
        
        return scene;
    }

    async createTerrainMap(scene) {
        // Create ground with height map
        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            'terrain',
            'https://playground.babylonjs.com/textures/heightMap.png',
            {
                width: 100,
                height: 100,
                subdivisions: 64,
                maxHeight: 10,
                minHeight: 0
            },
            scene
        );
        
        // Professional terrain material
        const terrainMaterial = new BABYLON.PBRMaterial('terrainMat', scene);
        terrainMaterial.baseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
        terrainMaterial.roughness = 0.8;
        terrainMaterial.metallic = 0.1;
        
        // Add texture layers
        const grassTexture = new BABYLON.Texture(
            'https://playground.babylonjs.com/textures/grass.jpg',
            scene
        );
        grassTexture.uScale = grassTexture.vScale = 30;
        terrainMaterial.baseTexture = grassTexture;
        
        ground.material = terrainMaterial;
        
        // Water plane for coasts
        const water = BABYLON.MeshBuilder.CreateGround('water', {
            width: 120,
            height: 120
        }, scene);
        water.position.y = -0.5;
        
        const waterMaterial = new BABYLON.PBRMaterial('waterMat', scene);
        waterMaterial.baseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
        waterMaterial.metallic = 0.3;
        waterMaterial.roughness = 0.1;
        waterMaterial.alpha = 0.8;
        waterMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        
        water.material = waterMaterial;
        
        // Animate water
        scene.registerBeforeRender(() => {
            water.position.y = -0.5 + Math.sin(Date.now() * 0.001) * 0.1;
        });
    }

    createWeatherLayers(scene) {
        // Cloud layer
        this.cloudLayer = BABYLON.MeshBuilder.CreatePlane('cloudLayer', {
            width: 100,
            height: 100
        }, scene);
        this.cloudLayer.position.y = 15;
        this.cloudLayer.rotation.x = Math.PI / 2;
        
        const cloudMaterial = new BABYLON.StandardMaterial('cloudMat', scene);
        const cloudTexture = new BABYLON.DynamicTexture('cloudTex', {
            width: 512,
            height: 512
        }, scene);
        
        // Generate procedural clouds
        this.generateCloudTexture(cloudTexture);
        cloudMaterial.diffuseTexture = cloudTexture;
        cloudMaterial.opacityTexture = cloudTexture;
        cloudMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        cloudMaterial.alpha = 0.7;
        this.cloudLayer.material = cloudMaterial;
        
        // Temperature visualization layer
        this.tempLayer = BABYLON.MeshBuilder.CreatePlane('tempLayer', {
            width: 100,
            height: 100
        }, scene);
        this.tempLayer.position.y = 5;
        this.tempLayer.rotation.x = Math.PI / 2;
        
        const tempMaterial = new BABYLON.StandardMaterial('tempMat', scene);
        const tempTexture = new BABYLON.DynamicTexture('tempTex', {
            width: 512,
            height: 512
        }, scene);
        
        tempMaterial.diffuseTexture = tempTexture;
        tempMaterial.opacityTexture = tempTexture;
        tempMaterial.alpha = 0.5;
        this.tempLayer.material = tempMaterial;
        
        // Wind visualization
        this.createWindParticles(scene);
        
        // Precipitation system
        this.createPrecipitationSystem(scene);
    }

    generateCloudTexture(texture) {
        const ctx = texture.getContext();
        const width = texture.getSize().width;
        const height = texture.getSize().height;
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, width, height);
        
        // Generate cloud-like noise
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 50 + 20;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        
        texture.update();
    }

    createWindParticles(scene) {
        // Wind stream visualization
        const windSystem = new BABYLON.ParticleSystem('wind', 1000, scene);
        windSystem.particleTexture = new BABYLON.Texture(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGElEQVQYV2NkYGD4z4AEMJFUZ2MDAwMDAF3vAXmRmn07AAAAAElFTkSuQmCC',
            scene
        );
        
        windSystem.emitter = new BABYLON.Vector3(0, 10, 0);
        windSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50);
        windSystem.maxEmitBox = new BABYLON.Vector3(50, 0, 50);
        
        windSystem.color1 = new BABYLON.Color4(0.8, 0.8, 1, 0.3);
        windSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.1);
        windSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0);
        
        windSystem.minSize = 0.5;
        windSystem.maxSize = 2;
        windSystem.minLifeTime = 2;
        windSystem.maxLifeTime = 4;
        windSystem.emitRate = 50;
        
        windSystem.direction1 = new BABYLON.Vector3(5, 0, 0);
        windSystem.direction2 = new BABYLON.Vector3(7, 0.5, 0.5);
        
        windSystem.gravity = new BABYLON.Vector3(0, 0, 0);
        windSystem.minAngularSpeed = 0;
        windSystem.maxAngularSpeed = Math.PI;
        
        this.windSystem = windSystem;
    }

    createPrecipitationSystem(scene) {
        // Rain system
        const rainSystem = new BABYLON.ParticleSystem('rain', 5000, scene);
        rainSystem.particleTexture = new BABYLON.Texture(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAAQCAYAAAA8qK60AAAAGklEQVQYV2P4//8/AzYwirkTm38Uk4jWAQA0FgYHJo1g7AAAAABJRU5ErkJggg==',
            scene
        );
        
        rainSystem.emitter = new BABYLON.Vector3(0, 30, 0);
        rainSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50);
        rainSystem.maxEmitBox = new BABYLON.Vector3(50, 0, 50);
        
        rainSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1, 0.8);
        rainSystem.color2 = new BABYLON.Color4(0.5, 0.6, 0.8, 0.6);
        
        rainSystem.minSize = 0.1;
        rainSystem.maxSize = 0.3;
        rainSystem.minLifeTime = 1;
        rainSystem.maxLifeTime = 2;
        
        rainSystem.direction1 = new BABYLON.Vector3(0, -10, 0);
        rainSystem.direction2 = new BABYLON.Vector3(0.2, -10, 0.2);
        
        rainSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        this.rainSystem = rainSystem;
        
        // Snow system
        const snowSystem = new BABYLON.ParticleSystem('snow', 3000, scene);
        snowSystem.particleTexture = new BABYLON.Texture(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAXElEQVQYV2P4//8/AzYwirkTQ2Fi8yfcijFUgtQzMTFiKEZRj00hXDGKHQxQO0AGw0wkKJnBFWMYQawCuKtgkvgU41WATzE+BTjjkSgF6CYT7QqiXUG0K4h2BQAOoh4I0vFtOgAAAABJRU5ErkJggg==',
            scene
        );
        
        snowSystem.emitter = new BABYLON.Vector3(0, 30, 0);
        snowSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50);
        snowSystem.maxEmitBox = new BABYLON.Vector3(50, 0, 50);
        
        snowSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
        snowSystem.color2 = new BABYLON.Color4(0.9, 0.9, 1, 0.8);
        
        snowSystem.minSize = 0.5;
        snowSystem.maxSize = 1.5;
        snowSystem.minLifeTime = 3;
        snowSystem.maxLifeTime = 5;
        
        snowSystem.direction1 = new BABYLON.Vector3(-0.5, -2, -0.5);
        snowSystem.direction2 = new BABYLON.Vector3(0.5, -2, 0.5);
        
        snowSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
        
        this.snowSystem = snowSystem;
    }

    setupPostProcessing(scene) {
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            'weatherPipeline',
            true,
            scene,
            [this.camera]
        );
        
        // Atmospheric effects
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.3;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;
        
        // Depth of field for focus effects
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfField.focalLength = 50;
        pipeline.depthOfField.fStop = 1.4;
        pipeline.depthOfField.focusDistance = 50;
        
        // Color grading for different weather moods
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.contrast = 1.2;
        pipeline.imageProcessing.exposure = 1.0;
        
        this.pipeline = pipeline;
    }

    async loadWeatherForLocation(location) {
        // In production, this would call a real weather API
        // For now, simulate weather data
        this.weatherData = await this.fetchWeatherData(location);
        
        // Update visualization
        this.updateWeatherVisualization();
        
        // Update UI
        this.updateWeatherUI();
    }

    async fetchWeatherData(location) {
        // Simulated weather data (replace with real API call)
        return {
            location: location,
            temperature: Math.floor(Math.random() * 30) + 50, // 50-80°F
            condition: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'][Math.floor(Math.random() * 5)],
            windSpeed: Math.floor(Math.random() * 30) + 5,
            windDirection: Math.floor(Math.random() * 360),
            humidity: Math.floor(Math.random() * 50) + 30,
            pressure: Math.floor(Math.random() * 50) + 980,
            forecast: this.generateForecast()
        };
    }

    generateForecast() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            day: day,
            high: Math.floor(Math.random() * 20) + 60,
            low: Math.floor(Math.random() * 20) + 40,
            condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
        }));
    }

    updateWeatherVisualization() {
        if (!this.weatherData) return;
        
        // Update sky color based on condition
        const skyColors = {
            sunny: new BABYLON.Color4(0.5, 0.7, 1, 1),
            cloudy: new BABYLON.Color4(0.4, 0.4, 0.5, 1),
            rainy: new BABYLON.Color4(0.2, 0.2, 0.3, 1),
            stormy: new BABYLON.Color4(0.1, 0.1, 0.2, 1),
            snowy: new BABYLON.Color4(0.8, 0.8, 0.9, 1)
        };
        
        gsap.to(this.scene.clearColor, {
            r: skyColors[this.weatherData.condition].r,
            g: skyColors[this.weatherData.condition].g,
            b: skyColors[this.weatherData.condition].b,
            duration: 2,
            ease: 'power2.inOut'
        });
        
        // Update precipitation
        this.rainSystem.stop();
        this.snowSystem.stop();
        
        if (this.weatherData.condition === 'rainy' || this.weatherData.condition === 'stormy') {
            this.rainSystem.start();
            if (this.weatherData.condition === 'stormy') {
                this.rainSystem.emitRate = 200;
                // Add lightning effect
                this.createLightningEffect();
            }
        } else if (this.weatherData.condition === 'snowy') {
            this.snowSystem.start();
        }
        
        // Update wind
        if (this.windSystem) {
            const windAngle = this.weatherData.windDirection * Math.PI / 180;
            this.windSystem.direction1 = new BABYLON.Vector3(
                Math.cos(windAngle) * this.weatherData.windSpeed / 5,
                0,
                Math.sin(windAngle) * this.weatherData.windSpeed / 5
            );
            this.windSystem.start();
        }
        
        // Update cloud density
        this.updateCloudDensity();
        
        // Update temperature visualization
        this.updateTemperatureMap();
    }

    createLightningEffect() {
        const lightning = () => {
            const flash = new BABYLON.SpotLight(
                'lightning',
                new BABYLON.Vector3(
                    (Math.random() - 0.5) * 100,
                    50,
                    (Math.random() - 0.5) * 100
                ),
                new BABYLON.Vector3(0, -1, 0),
                Math.PI / 2,
                1,
                this.scene
            );
            flash.intensity = 10;
            flash.diffuse = new BABYLON.Color3(0.8, 0.8, 1);
            
            setTimeout(() => {
                flash.dispose();
            }, 100);
            
            // Schedule next lightning
            if (this.weatherData.condition === 'stormy') {
                setTimeout(lightning, Math.random() * 5000 + 2000);
            }
        };
        
        lightning();
    }

    updateCloudDensity() {
        const densities = {
            sunny: 0.2,
            cloudy: 0.8,
            rainy: 0.9,
            stormy: 1.0,
            snowy: 0.7
        };
        
        gsap.to(this.cloudLayer.material, {
            alpha: densities[this.weatherData.condition],
            duration: 2
        });
    }

    updateTemperatureMap() {
        const texture = this.tempLayer.material.diffuseTexture;
        const ctx = texture.getContext();
        const width = texture.getSize().width;
        const height = texture.getSize().height;
        
        // Create temperature gradient
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, width / 2
        );
        
        const temp = this.weatherData.temperature;
        if (temp > 70) {
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0.2)');
        } else if (temp > 50) {
            gradient.addColorStop(0, 'rgba(255, 200, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(100, 200, 0, 0.2)');
        } else {
            gradient.addColorStop(0, 'rgba(0, 100, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 200, 255, 0.2)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        texture.update();
    }

    updateWeatherUI() {
        // Update any UI elements with weather data
        const event = new CustomEvent('weatherUpdated', {
            detail: this.weatherData
        });
        window.dispatchEvent(event);
    }

    async changeLocation(zipCode) {
        // Convert zip to coordinates (in production, use geocoding API)
        const coords = await this.geocodeZip(zipCode);
        if (coords) {
            this.currentLocation = coords;
            await this.loadWeatherForLocation(coords);
        }
    }

    async geocodeZip(zipCode) {
        // Simulated geocoding (replace with real API)
        const zipCoords = {
            '10001': { lat: 40.7505, lon: -73.9965 }, // NYC
            '90210': { lat: 34.0901, lon: -118.4065 }, // Beverly Hills
            '60601': { lat: 41.8853, lon: -87.6181 }, // Chicago
            '33139': { lat: 25.7907, lon: -80.1300 }, // Miami Beach
            '98101': { lat: 47.6089, lon: -122.3354 } // Seattle
        };
        
        return zipCoords[zipCode] || { lat: 40.7128, lon: -74.0060 };
    }

    destroy() {
        if (this.engine) {
            this.engine.dispose();
        }
    }
}

// Export for use
window.WeatherSystem3D = WeatherSystem3D;