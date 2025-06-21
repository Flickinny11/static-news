// Enhanced STATIC text animation with Hollywood-level glitch effects
class EnhancedStaticAnimation {
    constructor() {
        this.heroTitle = null;
        this.letters = [];
        this.glitchInterval = null;
        this.powerInterval = null;
        this.staticInterval = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.heroTitle = document.querySelector('.hero-title');
        if (!this.heroTitle) return;
        
        // Split text into individual letters
        this.splitTextIntoLetters();
        
        // Start continuous animations
        this.startContinuousGlitch();
        this.startLetterFlicker();
        this.startPowerSurge();
        this.startStaticNoise();
        
        // Add CSS for effects
        this.injectStyles();
    }
    
    splitTextIntoLetters() {
        const text = this.heroTitle.textContent.trim();
        this.heroTitle.innerHTML = '';
        
        text.split('').forEach((letter, index) => {
            const span = document.createElement('span');
            span.className = 'static-letter';
            span.textContent = letter;
            span.style.setProperty('--letter-index', index);
            this.heroTitle.appendChild(span);
            this.letters.push(span);
        });
    }
    
    startContinuousGlitch() {
        // Main glitch effect
        const glitchMain = () => {
            this.heroTitle.classList.add('glitching');
            
            // Create glitch layers
            this.createGlitchLayers();
            
            setTimeout(() => {
                this.heroTitle.classList.remove('glitching');
                this.removeGlitchLayers();
            }, 300 + Math.random() * 200);
        };
        
        // Run immediately then at intervals
        setTimeout(glitchMain, 2000);
        this.glitchInterval = setInterval(glitchMain, 4000 + Math.random() * 3000);
    }
    
    createGlitchLayers() {
        // Create multiple glitch layers for depth
        for (let i = 0; i < 3; i++) {
            const glitchLayer = document.createElement('div');
            glitchLayer.className = `glitch-layer layer-${i}`;
            glitchLayer.textContent = this.heroTitle.textContent;
            glitchLayer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                color: ${i === 0 ? '#ff0000' : i === 1 ? '#00ff00' : '#0000ff'};
                opacity: ${0.7 - i * 0.2};
                mix-blend-mode: ${i === 0 ? 'screen' : 'multiply'};
                animation: glitch-shift-${i} 0.3s steps(1) infinite;
            `;
            this.heroTitle.appendChild(glitchLayer);
        }
    }
    
    removeGlitchLayers() {
        this.heroTitle.querySelectorAll('.glitch-layer').forEach(layer => layer.remove());
    }
    
    startLetterFlicker() {
        // Random letter flickering
        const flickerLetter = () => {
            if (this.letters.length === 0) return;
            
            // Pick 1-2 random letters
            const count = Math.random() > 0.7 ? 2 : 1;
            const indices = [];
            
            for (let i = 0; i < count; i++) {
                const index = Math.floor(Math.random() * this.letters.length);
                if (!indices.includes(index)) {
                    indices.push(index);
                }
            }
            
            indices.forEach(index => {
                const letter = this.letters[index];
                letter.classList.add('flickering');
                
                // Different flicker patterns
                const pattern = Math.floor(Math.random() * 3);
                switch (pattern) {
                    case 0: // Quick flicker
                        setTimeout(() => letter.classList.remove('flickering'), 50);
                        setTimeout(() => letter.classList.add('flickering'), 100);
                        setTimeout(() => letter.classList.remove('flickering'), 150);
                        break;
                    case 1: // Fade out/in
                        letter.style.animation = 'letter-fade 0.5s ease-in-out';
                        setTimeout(() => {
                            letter.style.animation = '';
                            letter.classList.remove('flickering');
                        }, 500);
                        break;
                    case 2: // Power surge
                        letter.style.animation = 'letter-surge 0.3s ease-out';
                        setTimeout(() => {
                            letter.style.animation = '';
                            letter.classList.remove('flickering');
                        }, 300);
                        break;
                }
            });
        };
        
        // Start flickering
        this.powerInterval = setInterval(flickerLetter, 2000 + Math.random() * 3000);
    }
    
    startPowerSurge() {
        // Occasional power surges affecting all letters
        const surgeLetter = () => {
            const surgeType = Math.floor(Math.random() * 4);
            
            switch (surgeType) {
                case 0: // Wave surge
                    this.letters.forEach((letter, index) => {
                        setTimeout(() => {
                            letter.classList.add('surge');
                            setTimeout(() => letter.classList.remove('surge'), 200);
                        }, index * 50);
                    });
                    break;
                case 1: // Random surge
                    this.letters.forEach(letter => {
                        if (Math.random() > 0.5) {
                            letter.classList.add('surge');
                            setTimeout(() => letter.classList.remove('surge'), 200 + Math.random() * 300);
                        }
                    });
                    break;
                case 2: // Full surge
                    this.heroTitle.classList.add('full-surge');
                    setTimeout(() => this.heroTitle.classList.remove('full-surge'), 500);
                    break;
                case 3: // Reverse surge
                    this.letters.forEach((letter, index) => {
                        setTimeout(() => {
                            letter.classList.add('surge');
                            setTimeout(() => letter.classList.remove('surge'), 200);
                        }, (this.letters.length - index) * 50);
                    });
                    break;
            }
        };
        
        this.surgeInterval = setInterval(surgeLetter, 8000 + Math.random() * 7000);
    }
    
    startStaticNoise() {
        // TV static effect
        const addStatic = () => {
            this.heroTitle.classList.add('static-noise');
            
            // Create static overlay
            const staticOverlay = document.createElement('div');
            staticOverlay.className = 'static-overlay';
            staticOverlay.style.cssText = `
                position: absolute;
                top: -5%;
                left: -5%;
                width: 110%;
                height: 110%;
                pointer-events: none;
                background: url('data:image/svg+xml;base64,${this.generateStaticPattern()}');
                opacity: 0.1;
                mix-blend-mode: screen;
                animation: static-move 0.1s steps(5) infinite;
            `;
            this.heroTitle.appendChild(staticOverlay);
            
            setTimeout(() => {
                this.heroTitle.classList.remove('static-noise');
                staticOverlay.remove();
            }, 100 + Math.random() * 200);
        };
        
        this.staticInterval = setInterval(addStatic, 10000 + Math.random() * 10000);
    }
    
    generateStaticPattern() {
        // Generate SVG static pattern
        const width = 100;
        const height = 100;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
        
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const opacity = Math.random();
            svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="white" opacity="${opacity}"/>`;
        }
        
        svg += '</svg>';
        return btoa(svg);
    }
    
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .hero-title {
                position: relative;
                display: inline-block;
                transition: none !important;
            }
            
            .static-letter {
                display: inline-block;
                position: relative;
                transition: all 0.1s ease;
            }
            
            .static-letter.flickering {
                opacity: 0.3;
                text-shadow: 0 0 10px rgba(255, 0, 0, 1);
            }
            
            .static-letter.surge {
                transform: scale(1.1);
                filter: brightness(1.5);
                text-shadow: 0 0 20px rgba(255, 0, 0, 1);
            }
            
            .hero-title.glitching {
                animation: main-glitch 0.3s ease-in-out;
            }
            
            .hero-title.full-surge {
                animation: full-power-surge 0.5s ease-out;
            }
            
            .hero-title.static-noise {
                filter: contrast(1.5) brightness(1.2);
            }
            
            @keyframes main-glitch {
                0%, 100% { transform: translate(0); filter: hue-rotate(0deg); }
                20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
                40% { transform: translate(-2px, -2px); filter: hue-rotate(180deg); }
                60% { transform: translate(2px, 2px); filter: hue-rotate(270deg); }
                80% { transform: translate(2px, -2px); filter: hue-rotate(360deg); }
            }
            
            @keyframes glitch-shift-0 {
                0%, 100% { transform: translate(0); }
                33% { transform: translate(-2px, 0); }
                66% { transform: translate(2px, 0); }
            }
            
            @keyframes glitch-shift-1 {
                0%, 100% { transform: translate(0); }
                33% { transform: translate(0, -2px); }
                66% { transform: translate(0, 2px); }
            }
            
            @keyframes glitch-shift-2 {
                0%, 100% { transform: translate(0); }
                33% { transform: translate(1px, 1px); }
                66% { transform: translate(-1px, -1px); }
            }
            
            @keyframes letter-fade {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            
            @keyframes letter-surge {
                0% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.2); filter: brightness(2); }
                100% { transform: scale(1); filter: brightness(1); }
            }
            
            @keyframes full-power-surge {
                0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
                25% { transform: scale(1.05) rotate(0.5deg); filter: brightness(1.5); }
                50% { transform: scale(0.95) rotate(-0.5deg); filter: brightness(2); }
                75% { transform: scale(1.02) rotate(0.2deg); filter: brightness(1.3); }
                100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
            }
            
            @keyframes static-move {
                0% { transform: translate(0, 0); }
                25% { transform: translate(-5%, -5%); }
                50% { transform: translate(5%, -5%); }
                75% { transform: translate(-5%, 5%); }
                100% { transform: translate(5%, 5%); }
            }
            
            /* Ensure visibility */
            .hero-title {
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* After initial animation, keep it slightly dimmed */
            .hero-title.initialized {
                opacity: 0.9;
                filter: brightness(0.95);
                text-shadow: 
                    0 0 10px rgba(255, 0, 0, 0.5),
                    0 0 20px rgba(255, 0, 0, 0.3),
                    0 0 30px rgba(255, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    destroy() {
        // Clean up intervals
        clearInterval(this.glitchInterval);
        clearInterval(this.powerInterval);
        clearInterval(this.surgeInterval);
        clearInterval(this.staticInterval);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    window.enhancedStaticAnimation = new EnhancedStaticAnimation();
    
    // Mark as initialized after initial animation
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.classList.add('initialized');
        }
    }, 3000);
});