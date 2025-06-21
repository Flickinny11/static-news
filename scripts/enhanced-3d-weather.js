// Hollywood-level Enhanced 3D Weather System
class Enhanced3DWeatherSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.weatherData = null;
        this.currentLocation = { lat: 40.7128, lon: -74.0060, city: 'New York' };
        this.animationGroups = [];
        this.particles = [];
        this.radarLayers = new Map();
        this.forecastMode = '24hr'; // 12hr, 24hr, 48hr, 3day, 5day, 7day, 10day
        
        // Weather layers
        this.weatherLayers = {
            radar: { active: true, opacity: 1 },
            storm: { active: false, opacity: 0.8 },
            rain: { active: false, opacity: 0.7 },
            clouds: { active: true, opacity: 0.6 },
            temperature: { active: true, opacity: 0.5 },
            wind: { active: false, opacity: 0.4 },
            pollen: { active: false, opacity: 0.3 },
            humidity: { active: false, opacity: 0.4 },
            pressure: { active: false, opacity: 0.3 },
            uv: { active: false, opacity: 0.4 }
        };
        
        // Controls state
        this.isInteracting = false;
        this.autoRotate = true;
        this.animationSpeed = 1;
        
        this.init();
    }
    
    async init() {
        // Create enhanced container structure
        this.setupContainerStructure();
        
        // Create canvas with proper sizing
        const canvas = document.createElement('canvas');
        canvas.id = 'weather-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        this.container.querySelector('.weather-viewport').appendChild(canvas);
        
        // Initialize Babylon.js with enhanced settings
        this.engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            adaptToDeviceRatio: true,
            powerPreference: "high-performance"
        });
        
        this.scene = await this.createEnhancedWeatherScene();
        
        // Setup controls
        this.setupInteractiveControls();
        
        // Start render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        
        // Try to get user location
        this.attemptGeolocation();
    }
    
    setupContainerStructure() {
        this.container.innerHTML = `
            <div class="weather-system-container">
                <div class="weather-viewport"></div>
                
                <div class="weather-controls">
                    <div class="location-controls">
                        <input type="text" id="weather-location-input" placeholder="Enter ZIP code or city..." class="location-input">
                        <button id="weather-location-btn" class="control-btn primary">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 0C6.13 0 3 3.13 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </button>
                        <button id="weather-mylocation-btn" class="control-btn" title="Use my location">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 0l-2 9h4l-2 11 7-12h-5l3-8z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="view-controls">
                        <label>View Mode:</label>
                        <div class="view-toggle-group">
                            <button class="view-btn active" data-view="radar">Radar</button>
                            <button class="view-btn" data-view="storm">Storm</button>
                            <button class="view-btn" data-view="rain">Rain</button>
                            <button class="view-btn" data-view="clouds">Clouds</button>
                            <button class="view-btn" data-view="temperature">Temp</button>
                            <button class="view-btn" data-view="wind">Wind</button>
                            <button class="view-btn" data-view="pollen">Pollen</button>
                            <button class="view-btn" data-view="humidity">Humidity</button>
                            <button class="view-btn" data-view="pressure">Pressure</button>
                            <button class="view-btn" data-view="uv">UV Index</button>
                        </div>
                    </div>
                    
                    <div class="time-controls">
                        <label>Forecast:</label>
                        <div class="time-toggle-group">
                            <button class="time-btn" data-time="12hr">12 HR</button>
                            <button class="time-btn active" data-time="24hr">24 HR</button>
                            <button class="time-btn" data-time="48hr">48 HR</button>
                            <button class="time-btn" data-time="3day">3 DAY</button>
                            <button class="time-btn" data-time="5day">5 DAY</button>
                            <button class="time-btn" data-time="7day">7 DAY</button>
                            <button class="time-btn" data-time="10day">10 DAY</button>
                        </div>
                    </div>
                    
                    <div class="animation-controls">
                        <button id="weather-play-pause" class="control-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 4l12 6-12 6z"/>
                            </svg>
                        </button>
                        <input type="range" id="weather-speed" min="0.1" max="5" step="0.1" value="1" class="speed-slider">
                        <span class="speed-label">1x</span>
                    </div>
                </div>
                
                <div class="weather-info-overlay">
                    <div class="location-display">
                        <h3 id="weather-location-name">New York, NY</h3>
                        <p id="weather-current-temp">72°F</p>
                    </div>
                    <div class="weather-stats">
                        <div class="stat-item">
                            <span class="stat-label">Humidity</span>
                            <span class="stat-value" id="weather-humidity">65%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Wind</span>
                            <span class="stat-value" id="weather-wind">12 mph</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Pressure</span>
                            <span class="stat-value" id="weather-pressure">30.12"</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        this.addWeatherStyles();
    }
    
    addWeatherStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .weather-system-container {
                position: relative;
                width: 100%;
                height: 800px; /* 2x taller */
                background: linear-gradient(to bottom, #0a0a0a, #1a1a2e);
                border: 2px solid rgba(255, 0, 0, 0.3);
                overflow: hidden;
            }
            
            .weather-viewport {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 200px;
                background: radial-gradient(ellipse at center, rgba(0, 50, 100, 0.2), transparent);
            }
            
            .weather-controls {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 200px;
                background: rgba(0, 0, 0, 0.9);
                border-top: 1px solid rgba(255, 0, 0, 0.3);
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .location-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .location-input {
                flex: 1;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 8px 15px;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .location-input:focus {
                outline: none;
                border-color: rgba(255, 0, 0, 0.5);
                background: rgba(255, 255, 255, 0.15);
            }
            
            .control-btn {
                background: rgba(255, 0, 0, 0.2);
                border: 1px solid rgba(255, 0, 0, 0.4);
                color: white;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .control-btn:hover {
                background: rgba(255, 0, 0, 0.4);
                transform: scale(1.05);
            }
            
            .control-btn.primary {
                background: rgba(255, 0, 0, 0.4);
            }
            
            .view-controls, .time-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .view-controls label, .time-controls label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .view-toggle-group, .time-toggle-group {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
            }
            
            .view-btn, .time-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.7);
                padding: 5px 12px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
            }
            
            .view-btn:hover, .time-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            .view-btn.active, .time-btn.active {
                background: rgba(255, 0, 0, 0.4);
                border-color: rgba(255, 0, 0, 0.6);
                color: white;
            }
            
            .animation-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .speed-slider {
                flex: 1;
                max-width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                outline: none;
                -webkit-appearance: none;
            }
            
            .speed-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                background: rgba(255, 0, 0, 0.8);
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .speed-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                background: rgba(255, 0, 0, 1);
            }
            
            .speed-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                min-width: 30px;
            }
            
            .weather-info-overlay {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(255, 0, 0, 0.3);
                padding: 20px;
                pointer-events: none;
                backdrop-filter: blur(10px);
            }
            
            .location-display h3 {
                margin: 0;
                font-size: 24px;
                color: white;
                font-weight: 300;
            }
            
            .location-display p {
                margin: 5px 0 0 0;
                font-size: 48px;
                color: rgba(255, 0, 0, 0.8);
                font-weight: 700;
            }
            
            .weather-stats {
                display: flex;
                gap: 20px;
                margin-top: 15px;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
            }
            
            .stat-label {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
            }
            
            .stat-value {
                font-size: 16px;
                color: white;
                font-weight: 500;
            }
            
            @keyframes radar-sweep {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes cloud-drift {
                0% { transform: translateX(-100px); }
                100% { transform: translateX(100px); }
            }
            
            @keyframes storm-pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    async createEnhancedWeatherScene() {
        const scene = new BABYLON.Scene(this.engine);
        scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);
        
        // Enhanced camera with smooth controls
        this.camera = new BABYLON.ArcRotateCamera(
            'weatherCamera',
            -Math.PI / 2,
            Math.PI / 3,
            100,
            new BABYLON.Vector3(0, 0, 0),
            scene
        );
        
        this.camera.lowerRadiusLimit = 30;
        this.camera.upperRadiusLimit = 200;
        this.camera.lowerBetaLimit = 0.1;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        
        this.camera.attachControl(this.container.querySelector('canvas'), true);
        this.camera.wheelPrecision = 50;
        this.camera.pinchPrecision = 50;
        
        // Advanced lighting
        const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
        light1.intensity = 0.7;
        light1.diffuse = new BABYLON.Color3(0.8, 0.9, 1);
        
        const light2 = new BABYLON.DirectionalLight('light2', new BABYLON.Vector3(-1, -2, -1), scene);
        light2.position = new BABYLON.Vector3(20, 40, 20);
        light2.intensity = 0.5;
        
        // Create Earth globe
        this.createEarthGlobe(scene);
        
        // Create weather layers
        await this.createWeatherLayers(scene);
        
        // Create atmosphere
        this.createAtmosphere(scene);
        
        // Create dynamic weather effects
        this.createWeatherEffects(scene);
        
        // Post-processing
        this.setupPostProcessing(scene);
        
        return scene;
    }
    
    createEarthGlobe(scene) {
        // Create sphere
        const earth = BABYLON.MeshBuilder.CreateSphere('earth', {
            diameter: 50,
            segments: 64
        }, scene);
        
        // Earth material with PBR
        const earthMat = new BABYLON.PBRMaterial('earthMat', scene);
        
        // Create procedural earth texture
        const earthTexture = new BABYLON.DynamicTexture('earthTex', {
            width: 2048,
            height: 1024
        }, scene);
        
        const ctx = earthTexture.getContext();
        
        // Draw continents
        const gradient = ctx.createLinearGradient(0, 0, 2048, 0);
        gradient.addColorStop(0, '#1a4d2e');
        gradient.addColorStop(0.5, '#2d6a4f');
        gradient.addColorStop(1, '#1a4d2e');
        
        ctx.fillStyle = '#0077be';
        ctx.fillRect(0, 0, 2048, 1024);
        
        // Simple continent shapes
        ctx.fillStyle = gradient;
        // Americas
        ctx.fillRect(400, 300, 300, 400);
        // Europe/Africa
        ctx.fillRect(1000, 200, 200, 600);
        // Asia
        ctx.fillRect(1300, 200, 400, 400);
        
        earthTexture.update();
        
        earthMat.albedoTexture = earthTexture;
        earthMat.metallic = 0.1;
        earthMat.roughness = 0.8;
        earthMat.emissiveColor = new BABYLON.Color3(0, 0.1, 0.2);
        earthMat.emissiveIntensity = 0.3;
        
        earth.material = earthMat;
        
        // Rotate earth slowly
        scene.registerBeforeRender(() => {
            if (this.autoRotate && !this.isInteracting) {
                earth.rotation.y += 0.001 * this.animationSpeed;
            }
        });
        
        this.earthMesh = earth;
    }
    
    async createWeatherLayers(scene) {
        // Radar layer
        const radarLayer = this.createRadarLayer(scene);
        this.radarLayers.set('radar', radarLayer);
        
        // Storm tracking layer
        const stormLayer = this.createStormLayer(scene);
        this.radarLayers.set('storm', stormLayer);
        
        // Rain/precipitation layer
        const rainLayer = this.createRainLayer(scene);
        this.radarLayers.set('rain', rainLayer);
        
        // Cloud cover layer
        const cloudLayer = this.createCloudLayer(scene);
        this.radarLayers.set('clouds', cloudLayer);
        
        // Temperature heatmap
        const tempLayer = this.createTemperatureLayer(scene);
        this.radarLayers.set('temperature', tempLayer);
        
        // Wind patterns
        const windLayer = this.createWindLayer(scene);
        this.radarLayers.set('wind', windLayer);
        
        // Pollen count
        const pollenLayer = this.createPollenLayer(scene);
        this.radarLayers.set('pollen', pollenLayer);
        
        // Update layer visibility
        this.updateLayerVisibility();
    }
    
    createRadarLayer(scene) {
        const radar = BABYLON.MeshBuilder.CreateSphere('radar', {
            diameter: 52,
            segments: 32
        }, scene);
        
        const radarMat = new BABYLON.StandardMaterial('radarMat', scene);
        radarMat.diffuseTexture = this.createRadarTexture(scene);
        radarMat.opacityTexture = radarMat.diffuseTexture;
        radarMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
        radarMat.emissiveIntensity = 0.5;
        radarMat.backFaceCulling = false;
        
        radar.material = radarMat;
        
        // Animate radar sweep
        scene.registerBeforeRender(() => {
            if (radarMat.diffuseTexture) {
                radarMat.diffuseTexture.uOffset += 0.002 * this.animationSpeed;
            }
        });
        
        return radar;
    }
    
    createRadarTexture(scene) {
        const radarTex = new BABYLON.DynamicTexture('radarTex', {
            width: 1024,
            height: 512
        }, scene);
        
        const ctx = radarTex.getContext();
        
        // Create radar sweep gradient
        const gradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 512);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);
        
        // Add radar rings
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(512, 256, i * 80, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        radarTex.update();
        return radarTex;
    }
    
    createStormLayer(scene) {
        const storm = BABYLON.MeshBuilder.CreateSphere('storm', {
            diameter: 54,
            segments: 32
        }, scene);
        
        const stormMat = new BABYLON.StandardMaterial('stormMat', scene);
        stormMat.diffuseTexture = this.createStormTexture(scene);
        stormMat.opacityTexture = stormMat.diffuseTexture;
        stormMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
        stormMat.emissiveIntensity = 0.8;
        stormMat.backFaceCulling = false;
        
        storm.material = stormMat;
        storm.visibility = 0;
        
        // Animate storm cells
        scene.registerBeforeRender(() => {
            if (this.weatherLayers.storm.active) {
                storm.rotation.y += 0.001 * this.animationSpeed;
                storm.scaling.x = 1 + Math.sin(Date.now() * 0.001) * 0.02;
                storm.scaling.y = 1 + Math.sin(Date.now() * 0.001) * 0.02;
                storm.scaling.z = 1 + Math.sin(Date.now() * 0.001) * 0.02;
            }
        });
        
        return storm;
    }
    
    createStormTexture(scene) {
        const stormTex = new BABYLON.DynamicTexture('stormTex', {
            width: 1024,
            height: 512
        }, scene);
        
        const ctx = stormTex.getContext();
        
        // Create storm cells
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = 50 + Math.random() * 100;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.9)');
            gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.6)');
            gradient.addColorStop(0.6, 'rgba(255, 200, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        
        stormTex.update();
        return stormTex;
    }
    
    createRainLayer(scene) {
        const rain = BABYLON.MeshBuilder.CreateSphere('rain', {
            diameter: 53,
            segments: 32
        }, scene);
        
        const rainMat = new BABYLON.StandardMaterial('rainMat', scene);
        rainMat.diffuseTexture = this.createRainTexture(scene);
        rainMat.opacityTexture = rainMat.diffuseTexture;
        rainMat.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
        rainMat.emissiveIntensity = 0.4;
        rainMat.backFaceCulling = false;
        
        rain.material = rainMat;
        rain.visibility = 0;
        
        return rain;
    }
    
    createRainTexture(scene) {
        const rainTex = new BABYLON.DynamicTexture('rainTex', {
            width: 1024,
            height: 512
        }, scene);
        
        const ctx = rainTex.getContext();
        
        // Create rain pattern
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, 'rgba(0, 100, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 200, 255, 0.8)');
        
        ctx.fillStyle = gradient;
        
        // Rain streaks
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const length = 20 + Math.random() * 40;
            
            ctx.fillRect(x, y, 2, length);
        }
        
        rainTex.update();
        return rainTex;
    }
    
    createCloudLayer(scene) {
        const clouds = BABYLON.MeshBuilder.CreateSphere('clouds', {
            diameter: 55,
            segments: 32
        }, scene);
        
        const cloudMat = new BABYLON.StandardMaterial('cloudMat', scene);
        cloudMat.diffuseTexture = this.createCloudTexture(scene);
        cloudMat.opacityTexture = cloudMat.diffuseTexture;
        cloudMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        cloudMat.emissiveIntensity = 0.2;
        cloudMat.backFaceCulling = false;
        
        clouds.material = cloudMat;
        
        // Animate clouds
        scene.registerBeforeRender(() => {
            clouds.rotation.y -= 0.0002 * this.animationSpeed;
        });
        
        return clouds;
    }
    
    createCloudTexture(scene) {
        const cloudTex = new BABYLON.DynamicTexture('cloudTex', {
            width: 2048,
            height: 1024
        }, scene);
        
        const ctx = cloudTex.getContext();
        
        // Create cloud patterns using Perlin noise simulation
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const radiusX = 100 + Math.random() * 200;
            const radiusY = 50 + Math.random() * 100;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.save();
            ctx.scale(1, radiusY / radiusX);
            ctx.fillRect(x - radiusX, y - radiusY, radiusX * 2, radiusY * 2);
            ctx.restore();
        }
        
        cloudTex.update();
        return cloudTex;
    }
    
    createTemperatureLayer(scene) {
        const temp = BABYLON.MeshBuilder.CreateSphere('temperature', {
            diameter: 52.5,
            segments: 32
        }, scene);
        
        const tempMat = new BABYLON.StandardMaterial('tempMat', scene);
        tempMat.diffuseTexture = this.createTemperatureTexture(scene);
        tempMat.opacityTexture = tempMat.diffuseTexture;
        tempMat.backFaceCulling = false;
        
        temp.material = tempMat;
        temp.visibility = 0;
        
        return temp;
    }
    
    createTemperatureTexture(scene) {
        const tempTex = new BABYLON.DynamicTexture('tempTex', {
            width: 1024,
            height: 512
        }, scene);
        
        const ctx = tempTex.getContext();
        
        // Create temperature gradient map
        for (let y = 0; y < 512; y++) {
            const latitude = (y / 512) * 180 - 90;
            const temp = 30 - Math.abs(latitude) / 3;
            
            let color;
            if (temp > 25) {
                color = `rgba(255, ${255 - (temp - 25) * 10}, 0, 0.6)`;
            } else if (temp > 15) {
                color = `rgba(${255 - (25 - temp) * 10}, 255, 0, 0.6)`;
            } else if (temp > 5) {
                color = `rgba(0, ${255 - (15 - temp) * 10}, 255, 0.6)`;
            } else {
                color = `rgba(0, 0, ${255 - (5 - temp) * 10}, 0.6)`;
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(0, y, 1024, 1);
        }
        
        tempTex.update();
        return tempTex;
    }
    
    createWindLayer(scene) {
        const wind = BABYLON.MeshBuilder.CreateSphere('wind', {
            diameter: 56,
            segments: 32
        }, scene);
        
        const windMat = new BABYLON.StandardMaterial('windMat', scene);
        windMat.diffuseTexture = this.createWindTexture(scene);
        windMat.opacityTexture = windMat.diffuseTexture;
        windMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 1);
        windMat.emissiveIntensity = 0.3;
        windMat.backFaceCulling = false;
        
        wind.material = windMat;
        wind.visibility = 0;
        
        // Animate wind patterns
        scene.registerBeforeRender(() => {
            if (windMat.diffuseTexture) {
                windMat.diffuseTexture.vOffset += 0.001 * this.animationSpeed;
            }
        });
        
        return wind;
    }
    
    createWindTexture(scene) {
        const windTex = new BABYLON.DynamicTexture('windTex', {
            width: 1024,
            height: 512
        }, scene);
        
        const ctx = windTex.getContext();
        
        // Create wind flow lines
        ctx.strokeStyle = 'rgba(150, 150, 255, 0.4)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            let x = 0;
            let y = Math.random() * 512;
            ctx.moveTo(x, y);
            
            for (let j = 0; j < 20; j++) {
                x += 50;
                y += (Math.random() - 0.5) * 30;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        }
        
        windTex.update();
        return windTex;
    }
    
    createPollenLayer(scene) {
        const pollen = BABYLON.MeshBuilder.CreateSphere('pollen', {
            diameter: 54.5,
            segments: 32
        }, scene);
        
        const pollenMat = new BABYLON.StandardMaterial('pollenMat', scene);
        pollenMat.diffuseTexture = this.createPollenTexture(scene);
        pollenMat.opacityTexture = pollenMat.diffuseTexture;
        pollenMat.emissiveColor = new BABYLON.Color3(1, 1, 0);
        pollenMat.emissiveIntensity = 0.4;
        pollenMat.backFaceCulling = false;
        
        pollen.material = pollenMat;
        pollen.visibility = 0;
        
        return pollen;
    }
    
    createPollenTexture(scene) {
        const pollenTex = new BABYLON.DynamicTexture('pollenTex', {
            width: 1024,
            height: 512
        }, scene);
        
        const ctx = pollenTex.getContext();
        
        // Create pollen particles
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = 1 + Math.random() * 3;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        pollenTex.update();
        return pollenTex;
    }
    
    createAtmosphere(scene) {
        const atmosphere = BABYLON.MeshBuilder.CreateSphere('atmosphere', {
            diameter: 60,
            segments: 32
        }, scene);
        
        const atmosphereMat = new BABYLON.StandardMaterial('atmosphereMat', scene);
        atmosphereMat.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1);
        atmosphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
        atmosphereMat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.5);
        atmosphereMat.alpha = 0.2;
        atmosphereMat.backFaceCulling = false;
        
        atmosphere.material = atmosphereMat;
        
        // Fresnel effect for atmospheric glow
        atmosphereMat.emissiveFresnelParameters = new BABYLON.FresnelParameters();
        atmosphereMat.emissiveFresnelParameters.leftColor = new BABYLON.Color3(0.2, 0.4, 1);
        atmosphereMat.emissiveFresnelParameters.rightColor = new BABYLON.Color3(0, 0, 0);
        atmosphereMat.emissiveFresnelParameters.power = 2;
    }
    
    createWeatherEffects(scene) {
        // Lightning system
        this.createLightningSystem(scene);
        
        // Particle rain
        this.createParticleRain(scene);
        
        // Snow particles
        this.createSnowSystem(scene);
    }
    
    createLightningSystem(scene) {
        const lightning = new BABYLON.ParticleSystem('lightning', 50, scene);
        lightning.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', scene);
        
        lightning.emitter = new BABYLON.Vector3(0, 30, 0);
        lightning.minEmitBox = new BABYLON.Vector3(-30, 0, -30);
        lightning.maxEmitBox = new BABYLON.Vector3(30, 0, 30);
        
        lightning.color1 = new BABYLON.Color4(1, 1, 1, 1);
        lightning.color2 = new BABYLON.Color4(0.8, 0.8, 1, 1);
        
        lightning.minSize = 0.5;
        lightning.maxSize = 2;
        
        lightning.minLifeTime = 0.1;
        lightning.maxLifeTime = 0.3;
        
        lightning.emitRate = 0.5;
        
        lightning.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        lightning.direction1 = new BABYLON.Vector3(0, -1, 0);
        lightning.direction2 = new BABYLON.Vector3(0.1, -1, 0.1);
        
        lightning.minEmitPower = 50;
        lightning.maxEmitPower = 100;
        
        this.lightningSystem = lightning;
    }
    
    createParticleRain(scene) {
        const rain = new BABYLON.ParticleSystem('particleRain', 2000, scene);
        rain.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAAQCAYAAAA8qK60AAAALklEQVQYV2P8//8/AzYwilUaGxuLodDU1JQBm0IQG6YQBkAKYQpBAKQQphAGADUJEAGm8cC0AAAAAElFTkSuQmCC', scene);
        
        rain.emitter = new BABYLON.Vector3(0, 40, 0);
        rain.minEmitBox = new BABYLON.Vector3(-40, 0, -40);
        rain.maxEmitBox = new BABYLON.Vector3(40, 0, 40);
        
        rain.color1 = new BABYLON.Color4(0.7, 0.7, 1, 0.8);
        rain.color2 = new BABYLON.Color4(0.5, 0.5, 1, 0.6);
        
        rain.minSize = 0.1;
        rain.maxSize = 0.3;
        
        rain.minLifeTime = 2;
        rain.maxLifeTime = 4;
        
        rain.emitRate = 100;
        
        rain.direction1 = new BABYLON.Vector3(0, -1, 0);
        rain.direction2 = new BABYLON.Vector3(0.1, -1, 0.1);
        
        rain.minEmitPower = 10;
        rain.maxEmitPower = 20;
        
        rain.updateSpeed = 0.01;
        
        this.rainSystem = rain;
    }
    
    createSnowSystem(scene) {
        const snow = new BABYLON.ParticleSystem('snow', 1000, scene);
        snow.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAUklEQVQYV2P8////fwYGBgZGBgaG/1AMBkAFIAVgBSAFYAVwBSAFcAVgBQgFIAUIBSAFKAqQFSApQFGApABFAZICJAUoClAUIClAUYCkAEUBAHI6E0EKb2y1AAAAAElFTkSuQmCC', scene);
        
        snow.emitter = new BABYLON.Vector3(0, 40, 0);
        snow.minEmitBox = new BABYLON.Vector3(-40, 0, -40);
        snow.maxEmitBox = new BABYLON.Vector3(40, 0, 40);
        
        snow.color1 = new BABYLON.Color4(1, 1, 1, 1);
        snow.color2 = new BABYLON.Color4(0.9, 0.9, 1, 0.8);
        
        snow.minSize = 0.3;
        snow.maxSize = 0.8;
        
        snow.minLifeTime = 4;
        snow.maxLifeTime = 8;
        
        snow.emitRate = 50;
        
        snow.direction1 = new BABYLON.Vector3(-0.1, -1, -0.1);
        snow.direction2 = new BABYLON.Vector3(0.1, -1, 0.1);
        
        snow.minEmitPower = 2;
        snow.maxEmitPower = 5;
        
        snow.updateSpeed = 0.01;
        
        this.snowSystem = snow;
    }
    
    setupPostProcessing(scene) {
        // Bloom effect
        const bloomPipeline = new BABYLON.DefaultRenderingPipeline(
            'bloom',
            true,
            scene,
            [this.camera]
        );
        
        bloomPipeline.bloomEnabled = true;
        bloomPipeline.bloomThreshold = 0.8;
        bloomPipeline.bloomWeight = 0.3;
        bloomPipeline.bloomKernel = 64;
        bloomPipeline.bloomScale = 0.5;
        
        // Depth of field
        bloomPipeline.depthOfFieldEnabled = true;
        bloomPipeline.depthOfField.focalLength = 150;
        bloomPipeline.depthOfField.fStop = 1.4;
        bloomPipeline.depthOfField.focusDistance = 2000;
        
        // Chromatic aberration
        bloomPipeline.chromaticAberrationEnabled = true;
        bloomPipeline.chromaticAberration.aberrationAmount = 30;
        
        // Grain
        bloomPipeline.grainEnabled = true;
        bloomPipeline.grain.intensity = 10;
        bloomPipeline.grain.animated = true;
    }
    
    setupInteractiveControls() {
        const container = this.container;
        
        // Location input
        const locationInput = container.querySelector('#weather-location-input');
        const locationBtn = container.querySelector('#weather-location-btn');
        const myLocationBtn = container.querySelector('#weather-mylocation-btn');
        
        locationBtn.addEventListener('click', () => {
            const location = locationInput.value.trim();
            if (location) {
                this.geocodeLocation(location);
            }
        });
        
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                locationBtn.click();
            }
        });
        
        myLocationBtn.addEventListener('click', () => {
            this.attemptGeolocation();
        });
        
        // View controls
        container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                
                // Update active state
                container.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Toggle layer
                this.toggleWeatherLayer(view);
            });
        });
        
        // Time controls
        container.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const time = btn.dataset.time;
                
                // Update active state
                container.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update forecast mode
                this.forecastMode = time;
                this.updateForecast();
            });
        });
        
        // Animation controls
        const playPauseBtn = container.querySelector('#weather-play-pause');
        const speedSlider = container.querySelector('#weather-speed');
        const speedLabel = container.querySelector('.speed-label');
        
        playPauseBtn.addEventListener('click', () => {
            this.autoRotate = !this.autoRotate;
            playPauseBtn.innerHTML = this.autoRotate ? 
                '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4h3v12H6zM11 4h3v12h-3z"/></svg>' :
                '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l12 6-12 6z"/></svg>';
        });
        
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedLabel.textContent = `${this.animationSpeed}x`;
        });
        
        // Camera interaction detection
        this.camera.onViewMatrixChangedObservable.add(() => {
            this.isInteracting = true;
            clearTimeout(this.interactionTimeout);
            this.interactionTimeout = setTimeout(() => {
                this.isInteracting = false;
            }, 2000);
        });
    }
    
    toggleWeatherLayer(layerName) {
        // Toggle layer visibility
        this.weatherLayers[layerName].active = !this.weatherLayers[layerName].active;
        
        // Update visibility
        this.updateLayerVisibility();
    }
    
    updateLayerVisibility() {
        this.radarLayers.forEach((mesh, name) => {
            const layer = this.weatherLayers[name];
            if (layer) {
                mesh.visibility = layer.active ? layer.opacity : 0;
            }
        });
        
        // Update particle systems
        if (this.weatherLayers.storm.active && this.lightningSystem) {
            this.lightningSystem.start();
        } else if (this.lightningSystem) {
            this.lightningSystem.stop();
        }
        
        if (this.weatherLayers.rain.active && this.rainSystem) {
            this.rainSystem.start();
        } else if (this.rainSystem) {
            this.rainSystem.stop();
        }
    }
    
    async attemptGeolocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    this.currentLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
                    await this.loadWeatherForLocation(this.currentLocation);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.showNotification('Unable to get your location. Using default.');
                }
            );
        } else {
            this.showNotification('Geolocation is not supported by your browser.');
        }
    }
    
    async geocodeLocation(location) {
        // In a real implementation, this would call a geocoding API
        // For now, we'll simulate with some major cities
        const cities = {
            'new york': { lat: 40.7128, lon: -74.0060, city: 'New York, NY' },
            'los angeles': { lat: 34.0522, lon: -118.2437, city: 'Los Angeles, CA' },
            'chicago': { lat: 41.8781, lon: -87.6298, city: 'Chicago, IL' },
            'houston': { lat: 29.7604, lon: -95.3698, city: 'Houston, TX' },
            'miami': { lat: 25.7617, lon: -80.1918, city: 'Miami, FL' },
            'seattle': { lat: 47.6062, lon: -122.3321, city: 'Seattle, WA' },
            'boston': { lat: 42.3601, lon: -71.0589, city: 'Boston, MA' },
            'san francisco': { lat: 37.7749, lon: -122.4194, city: 'San Francisco, CA' },
            'denver': { lat: 39.7392, lon: -104.9903, city: 'Denver, CO' },
            'atlanta': { lat: 33.7490, lon: -84.3880, city: 'Atlanta, GA' }
        };
        
        const normalized = location.toLowerCase();
        const cityData = cities[normalized];
        
        if (cityData) {
            this.currentLocation = cityData;
            await this.loadWeatherForLocation(this.currentLocation);
            this.updateLocationDisplay();
        } else {
            // Try ZIP code
            if (/^\d{5}$/.test(location)) {
                // Simulate ZIP code lookup
                this.currentLocation = {
                    lat: 40.7128 + (Math.random() - 0.5) * 10,
                    lon: -74.0060 + (Math.random() - 0.5) * 10,
                    city: `ZIP ${location}`
                };
                await this.loadWeatherForLocation(this.currentLocation);
                this.updateLocationDisplay();
            } else {
                this.showNotification('Location not found. Try a major city or ZIP code.');
            }
        }
    }
    
    async reverseGeocode(lat, lon) {
        // Simulate reverse geocoding
        this.currentLocation.city = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        this.updateLocationDisplay();
    }
    
    async loadWeatherForLocation(location) {
        // Simulate weather data loading
        const temp = 50 + Math.random() * 40;
        const humidity = 30 + Math.random() * 60;
        const wind = 5 + Math.random() * 25;
        const pressure = 29.5 + Math.random() * 1.5;
        
        this.weatherData = {
            temperature: Math.round(temp),
            humidity: Math.round(humidity),
            windSpeed: Math.round(wind),
            pressure: pressure.toFixed(2)
        };
        
        this.updateWeatherDisplay();
        
        // Animate camera to location
        this.animateCameraToLocation(location);
    }
    
    updateLocationDisplay() {
        const nameEl = this.container.querySelector('#weather-location-name');
        if (nameEl && this.currentLocation.city) {
            nameEl.textContent = this.currentLocation.city;
        }
    }
    
    updateWeatherDisplay() {
        if (!this.weatherData) return;
        
        const tempEl = this.container.querySelector('#weather-current-temp');
        const humidityEl = this.container.querySelector('#weather-humidity');
        const windEl = this.container.querySelector('#weather-wind');
        const pressureEl = this.container.querySelector('#weather-pressure');
        
        if (tempEl) tempEl.textContent = `${this.weatherData.temperature}°F`;
        if (humidityEl) humidityEl.textContent = `${this.weatherData.humidity}%`;
        if (windEl) windEl.textContent = `${this.weatherData.windSpeed} mph`;
        if (pressureEl) pressureEl.textContent = `${this.weatherData.pressure}"`;
    }
    
    animateCameraToLocation(location) {
        // Convert lat/lon to sphere position
        const phi = (90 - location.lat) * Math.PI / 180;
        const theta = (location.lon + 180) * Math.PI / 180;
        
        const targetAlpha = -theta;
        const targetBeta = phi;
        
        // Animate camera
        BABYLON.Animation.CreateAndStartAnimation(
            'cameraAlpha',
            this.camera,
            'alpha',
            30,
            30,
            this.camera.alpha,
            targetAlpha,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        BABYLON.Animation.CreateAndStartAnimation(
            'cameraBeta',
            this.camera,
            'beta',
            30,
            30,
            this.camera.beta,
            targetBeta,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }
    
    updateForecast() {
        // Update weather data based on forecast mode
        console.log(`Updating forecast for ${this.forecastMode}`);
        
        // In a real implementation, this would fetch forecast data
        // For now, we'll simulate some changes
        const days = {
            '12hr': 0.5,
            '24hr': 1,
            '48hr': 2,
            '3day': 3,
            '5day': 5,
            '7day': 7,
            '10day': 10
        };
        
        const dayOffset = days[this.forecastMode] || 1;
        
        // Simulate weather changes over time
        if (this.weatherData) {
            this.weatherData.temperature += Math.round((Math.random() - 0.5) * 10 * dayOffset);
            this.weatherData.humidity += Math.round((Math.random() - 0.5) * 20 * dayOffset);
            this.updateWeatherDisplay();
        }
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'weather-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            animation: slideIn 0.3s ease;
            z-index: 1000;
        `;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Replace the existing weather system
    const weatherContainer = document.getElementById('weather-canvas-container');
    if (weatherContainer) {
        // Clear existing content
        weatherContainer.innerHTML = '';
        
        // Initialize enhanced weather system
        const enhancedWeather = new Enhanced3DWeatherSystem('weather-canvas-container');
        window.enhancedWeatherSystem = enhancedWeather;
        
        console.log('🌦️ Enhanced 3D Weather System initialized with Hollywood-level effects!');
    }
});