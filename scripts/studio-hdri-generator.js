/**
 * HDRI Environment Generator for Studio
 * Creates procedural HDR environment for realistic reflections
 */

class StudioHDRI {
    constructor() {
        this.size = 512;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size * 6; // Cubemap faces
        this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');
    }
    
    generateHDRI() {
        // Generate each cubemap face
        const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
        
        faces.forEach((face, index) => {
            this.generateFace(face, index);
        });
        
        return this.canvas;
    }
    
    generateFace(face, index) {
        const x = index * this.size;
        
        // Studio lighting gradient
        const gradient = this.ctx.createLinearGradient(
            x, 0, x + this.size, this.size
        );
        
        switch(face) {
            case 'px': // Right - Key light
                gradient.addColorStop(0, '#1a1a2e');
                gradient.addColorStop(0.5, '#16213e');
                gradient.addColorStop(1, '#0f3460');
                this.addStudioLights(x, 0, 3, 0.8);
                break;
                
            case 'nx': // Left - Fill light
                gradient.addColorStop(0, '#0f3460');
                gradient.addColorStop(0.5, '#16213e');
                gradient.addColorStop(1, '#1a1a2e');
                this.addStudioLights(x, 0, 2, 0.5);
                break;
                
            case 'py': // Top - Ceiling lights
                gradient.addColorStop(0, '#222831');
                gradient.addColorStop(0.5, '#393e46');
                gradient.addColorStop(1, '#222831');
                this.addCeilingLights(x, 0);
                break;
                
            case 'ny': // Bottom - Floor
                gradient.addColorStop(0, '#000000');
                gradient.addColorStop(0.5, '#0a0a0a');
                gradient.addColorStop(1, '#000000');
                break;
                
            case 'pz': // Front - LED screens
                gradient.addColorStop(0, '#000511');
                gradient.addColorStop(0.5, '#001122');
                gradient.addColorStop(1, '#000511');
                this.addLEDScreens(x, 0);
                break;
                
            case 'nz': // Back
                gradient.addColorStop(0, '#0a0a0a');
                gradient.addColorStop(0.5, '#1a1a1a');
                gradient.addColorStop(1, '#0a0a0a');
                break;
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, 0, this.size, this.size);
    }
    
    addStudioLights(x, y, count, intensity) {
        for (let i = 0; i < count; i++) {
            const lightX = x + Math.random() * this.size;
            const lightY = y + this.size * 0.3 + Math.random() * this.size * 0.4;
            const radius = 20 + Math.random() * 30;
            
            // Light glow
            const glow = this.ctx.createRadialGradient(
                lightX, lightY, 0,
                lightX, lightY, radius
            );
            
            glow.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
            glow.addColorStop(0.5, `rgba(255, 255, 220, ${intensity * 0.5})`);
            glow.addColorStop(1, 'rgba(255, 255, 200, 0)');
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(lightX - radius, lightY - radius, radius * 2, radius * 2);
        }
    }
    
    addCeilingLights(x, y) {
        const rows = 3;
        const cols = 5;
        const spacing = this.size / (cols + 1);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const lightX = x + spacing * (col + 1);
                const lightY = y + spacing * (row + 1);
                
                // Panel light
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.fillRect(lightX - 15, lightY - 15, 30, 30);
                
                // Glow
                const glow = this.ctx.createRadialGradient(
                    lightX, lightY, 0,
                    lightX, lightY, 40
                );
                glow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = glow;
                this.ctx.fillRect(lightX - 40, lightY - 40, 80, 80);
            }
        }
    }
    
    addLEDScreens(x, y) {
        // Simulate LED panel reflections
        const panelCount = 5;
        const panelWidth = this.size / panelCount;
        
        for (let i = 0; i < panelCount; i++) {
            const panelX = x + i * panelWidth;
            
            // Base color
            this.ctx.fillStyle = '#001133';
            this.ctx.fillRect(panelX, y, panelWidth - 2, this.size);
            
            // Scan lines
            this.ctx.strokeStyle = 'rgba(0, 50, 100, 0.3)';
            this.ctx.lineWidth = 1;
            
            for (let line = 0; line < this.size; line += 4) {
                this.ctx.beginPath();
                this.ctx.moveTo(panelX, y + line);
                this.ctx.lineTo(panelX + panelWidth - 2, y + line);
                this.ctx.stroke();
            }
            
            // Red accent
            if (i === 2) {
                const accent = this.ctx.createLinearGradient(
                    panelX, y + this.size * 0.8,
                    panelX, y + this.size
                );
                accent.addColorStop(0, 'rgba(255, 0, 0, 0)');
                accent.addColorStop(1, 'rgba(255, 0, 0, 0.3)');
                
                this.ctx.fillStyle = accent;
                this.ctx.fillRect(panelX, y, panelWidth - 2, this.size);
            }
        }
    }
    
    toDataURL() {
        return this.canvas.toDataURL('image/png');
    }
    
    toCubeTexture(scene) {
        // For Babylon.js
        if (window.BABYLON) {
            const texture = new BABYLON.HDRCubeTexture(
                this.toDataURL(),
                scene,
                this.size,
                false,
                true,
                false,
                true
            );
            return texture;
        }
        
        // For Three.js
        if (window.THREE) {
            const loader = new THREE.CubeTextureLoader();
            const faces = [];
            
            for (let i = 0; i < 6; i++) {
                const faceCanvas = document.createElement('canvas');
                faceCanvas.width = this.size;
                faceCanvas.height = this.size;
                const ctx = faceCanvas.getContext('2d');
                
                ctx.drawImage(
                    this.canvas,
                    i * this.size, 0, this.size, this.size,
                    0, 0, this.size, this.size
                );
                
                faces.push(faceCanvas.toDataURL());
            }
            
            return loader.load(faces);
        }
    }
}

// Export for use
window.StudioHDRI = StudioHDRI;