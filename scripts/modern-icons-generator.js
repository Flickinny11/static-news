// Hollywood-level SVG Icon Generation System
class ModernIconsGenerator {
    constructor() {
        this.iconDefinitions = {
            money: {
                viewBox: '0 0 100 100',
                paths: [
                    'M50 5 C75 5 95 25 95 50 C95 75 75 95 50 95 C25 95 5 75 5 50 C5 25 25 5 50 5',
                    'M35 35 L35 65 M65 35 L65 65',
                    'M35 40 C35 40 50 30 65 40 M35 60 C35 60 50 70 65 60',
                    'M50 25 L50 75'
                ],
                gradient: {
                    colors: ['#FFD700', '#FFA500', '#FF8C00'],
                    angle: 135
                },
                animation: 'pulse-glow'
            },
            target: {
                viewBox: '0 0 100 100',
                paths: [
                    'M50 10 A40 40 0 0 1 90 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10',
                    'M50 25 A25 25 0 0 1 75 50 A25 25 0 0 1 50 75 A25 25 0 0 1 25 50 A25 25 0 0 1 50 25',
                    'M50 40 A10 10 0 0 1 60 50 A10 10 0 0 1 50 60 A10 10 0 0 1 40 50 A10 10 0 0 1 50 40',
                    'M50 0 L50 100 M0 50 L100 50'
                ],
                gradient: {
                    colors: ['#FF0000', '#FF6B6B', '#FFE66D'],
                    angle: 45
                },
                animation: 'rotate-scan'
            },
            chart: {
                viewBox: '0 0 100 100',
                paths: [
                    'M10 90 L90 90 L90 10',
                    'M20 80 L20 60 L30 60 L30 80 Z',
                    'M40 80 L40 40 L50 40 L50 80 Z',
                    'M60 80 L60 20 L70 20 L70 80 Z',
                    'M15 70 Q35 50 55 30 T90 15'
                ],
                gradient: {
                    colors: ['#00FF00', '#00CC00', '#009900'],
                    angle: 90
                },
                animation: 'grow-bars'
            },
            fire: {
                viewBox: '0 0 100 100',
                paths: [
                    'M50 90 C30 90 20 75 20 60 C20 50 25 40 30 30 C30 30 35 35 40 35 C40 30 45 20 50 10 C55 20 60 30 60 35 C65 35 70 30 70 30 C75 40 80 50 80 60 C80 75 70 90 50 90',
                    'M50 80 C40 80 35 70 35 60 C35 50 40 40 45 35 C45 35 50 25 50 25 C50 25 55 35 55 35 C60 40 65 50 65 60 C65 70 60 80 50 80'
                ],
                gradient: {
                    colors: ['#FF0000', '#FF6600', '#FFCC00'],
                    angle: 0
                },
                animation: 'flicker-flame'
            },
            rocket: {
                viewBox: '0 0 100 100',
                paths: [
                    'M50 10 C50 10 60 20 60 40 L60 70 C60 75 55 80 50 80 C45 80 40 75 40 70 L40 40 C40 20 50 10 50 10',
                    'M40 60 L30 70 L35 65 L40 60 M60 60 L70 70 L65 65 L60 60',
                    'M45 75 L45 85 L50 90 L55 85 L55 75',
                    'M50 20 A5 5 0 0 1 55 25 A5 5 0 0 1 50 30 A5 5 0 0 1 45 25 A5 5 0 0 1 50 20'
                ],
                gradient: {
                    colors: ['#4A90E2', '#7B68EE', '#FF1493'],
                    angle: 180
                },
                animation: 'thrust-shake'
            },
            handshake: {
                viewBox: '0 0 100 100',
                paths: [
                    'M20 50 C20 50 25 45 30 45 C35 45 35 50 40 50 L60 50 C65 50 65 45 70 45 C75 45 80 50 80 50',
                    'M30 50 L30 60 C30 65 35 65 35 60 L35 55 M40 50 L40 60 C40 65 45 65 45 60 L45 55',
                    'M70 50 L70 60 C70 65 65 65 65 60 L65 55 M60 50 L60 60 C60 65 55 65 55 60 L55 55',
                    'M35 45 C35 45 45 40 50 40 C55 40 65 45 65 45'
                ],
                gradient: {
                    colors: ['#FFD700', '#FF69B4', '#FF1493'],
                    angle: 90
                },
                animation: 'shake-hands'
            },
            lightning: {
                viewBox: '0 0 100 100',
                paths: [
                    'M60 10 L30 55 L45 55 L40 90 L70 45 L55 45 L60 10'
                ],
                gradient: {
                    colors: ['#FFFF00', '#FFA500', '#FF0000'],
                    angle: 45
                },
                animation: 'electric-pulse'
            },
            trophy: {
                viewBox: '0 0 100 100',
                paths: [
                    'M30 20 L30 40 C30 50 40 55 50 55 C60 55 70 50 70 40 L70 20 Z',
                    'M30 25 C20 25 15 30 15 35 C15 40 20 45 30 45 M70 25 C80 25 85 30 85 35 C85 40 80 45 70 45',
                    'M45 55 L45 70 L55 70 L55 55 M40 70 L60 70 L60 75 L40 75 Z',
                    'M50 30 L52 35 L58 35 L53 39 L55 44 L50 40 L45 44 L47 39 L42 35 L48 35 Z'
                ],
                gradient: {
                    colors: ['#FFD700', '#FFC107', '#FF9800'],
                    angle: 135
                },
                animation: 'trophy-shine'
            },
            idea: {
                viewBox: '0 0 100 100',
                paths: [
                    'M50 20 C60 20 70 30 70 40 C70 50 65 55 65 60 L65 65 C65 70 60 70 50 70 C40 70 35 70 35 65 L35 60 C35 55 30 50 30 40 C30 30 40 20 50 20',
                    'M40 70 L40 75 L60 75 L60 70 M42 78 L58 78 M44 81 L56 81',
                    'M50 10 L50 15 M35 15 L40 20 M65 15 L60 20 M25 30 L30 30 M75 30 L70 30'
                ],
                gradient: {
                    colors: ['#FFEB3B', '#FFC107', '#FF9800'],
                    angle: 0
                },
                animation: 'bulb-flicker'
            }
        };
        
        this.init();
    }
    
    init() {
        // Create style sheet for animations
        const style = document.createElement('style');
        style.textContent = this.generateAnimationStyles();
        document.head.appendChild(style);
    }
    
    generateAnimationStyles() {
        return `
            @keyframes pulse-glow {
                0%, 100% { filter: drop-shadow(0 0 10px currentColor); transform: scale(1); }
                50% { filter: drop-shadow(0 0 20px currentColor); transform: scale(1.05); }
            }
            
            @keyframes rotate-scan {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes grow-bars {
                0% { transform: scaleY(0); transform-origin: bottom; }
                100% { transform: scaleY(1); transform-origin: bottom; }
            }
            
            @keyframes flicker-flame {
                0%, 100% { transform: scaleY(1) translateY(0); }
                25% { transform: scaleY(1.1) translateY(-2px); }
                50% { transform: scaleY(0.9) translateY(2px); }
                75% { transform: scaleY(1.05) translateY(-1px); }
            }
            
            @keyframes thrust-shake {
                0%, 100% { transform: translateY(0) translateX(0); }
                25% { transform: translateY(-2px) translateX(1px); }
                50% { transform: translateY(1px) translateX(-1px); }
                75% { transform: translateY(-1px) translateX(0); }
            }
            
            @keyframes shake-hands {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-2px); }
                75% { transform: translateX(2px); }
            }
            
            @keyframes electric-pulse {
                0%, 100% { opacity: 1; filter: brightness(1); }
                50% { opacity: 0.8; filter: brightness(1.5) drop-shadow(0 0 20px currentColor); }
            }
            
            @keyframes trophy-shine {
                0% { filter: brightness(1); }
                50% { filter: brightness(1.3) drop-shadow(0 0 15px #FFD700); }
                100% { filter: brightness(1); }
            }
            
            @keyframes bulb-flicker {
                0%, 90%, 100% { opacity: 1; filter: brightness(1); }
                92% { opacity: 0.8; filter: brightness(0.8); }
                94% { opacity: 1; filter: brightness(1.2); }
                96% { opacity: 0.9; filter: brightness(0.9); }
            }
            
            .modern-icon {
                display: inline-block;
                width: 48px;
                height: 48px;
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
                transition: all 0.3s ease;
            }
            
            .modern-icon:hover {
                transform: scale(1.1);
                filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
            }
            
            .modern-icon svg {
                width: 100%;
                height: 100%;
            }
            
            .icon-particle {
                position: absolute;
                pointer-events: none;
                animation: float-particle 4s infinite ease-in-out;
            }
            
            @keyframes float-particle {
                0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
                25% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 1; }
                50% { transform: translateY(-10px) translateX(-10px) scale(0.9); opacity: 0.6; }
                75% { transform: translateY(-30px) translateX(5px) scale(1.05); opacity: 0.9; }
            }
        `;
    }
    
    createIcon(type, customSize = 48) {
        const iconDef = this.iconDefinitions[type];
        if (!iconDef) return null;
        
        const container = document.createElement('div');
        container.className = 'modern-icon';
        container.style.width = `${customSize}px`;
        container.style.height = `${customSize}px`;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', iconDef.viewBox);
        svg.setAttribute('width', customSize);
        svg.setAttribute('height', customSize);
        
        // Create gradient
        const gradientId = `gradient-${type}-${Date.now()}`;
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        gradient.setAttribute('gradientTransform', `rotate(${iconDef.gradient.angle})`);
        
        iconDef.gradient.colors.forEach((color, index) => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop.setAttribute('offset', `${(index / (iconDef.gradient.colors.length - 1)) * 100}%`);
            stop.setAttribute('stop-color', color);
            gradient.appendChild(stop);
        });
        
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        // Create paths with animations
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.animation = `${iconDef.animation} 2s infinite ease-in-out`;
        
        iconDef.paths.forEach((pathData, index) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', index === 0 ? `url(#${gradientId})` : 'none');
            path.setAttribute('stroke', `url(#${gradientId})`);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            
            if (index > 0) {
                path.style.animationDelay = `${index * 0.1}s`;
            }
            
            g.appendChild(path);
        });
        
        // Add glow filter
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `glow-${type}-${Date.now()}`);
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'coloredBlur');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feMerge);
        defs.appendChild(filter);
        
        g.setAttribute('filter', `url(#glow-${type}-${Date.now()})`);
        
        svg.appendChild(g);
        container.appendChild(svg);
        
        // Add particle effects on hover
        container.addEventListener('mouseenter', () => this.createParticleEffect(container, type));
        
        return container;
    }
    
    createParticleEffect(container, type) {
        const colors = this.iconDefinitions[type].gradient.colors;
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'icon-particle';
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${i * 0.1}s`;
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 4000);
        }
    }
    
    replaceEmojis() {
        // Money emoji replacements
        document.querySelectorAll('.money-particle').forEach(element => {
            if (element.textContent.includes('💰')) {
                element.textContent = '';
                element.appendChild(this.createIcon('money', 64));
            }
        });
        
        // Stat icon replacements
        const emojiMap = {
            '🎯': 'target',
            '💰': 'money',
            '📈': 'chart',
            '🔥': 'fire',
            '🚀': 'rocket',
            '🤝': 'handshake',
            '⚡': 'lightning',
            '🏆': 'trophy',
            '💡': 'idea'
        };
        
        document.querySelectorAll('.stat-icon').forEach(element => {
            const emoji = element.textContent.trim();
            if (emojiMap[emoji]) {
                element.textContent = '';
                element.appendChild(this.createIcon(emojiMap[emoji], 48));
            }
        });
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    const iconGenerator = new ModernIconsGenerator();
    
    // Replace emojis after a short delay to ensure DOM is ready
    setTimeout(() => {
        iconGenerator.replaceEmojis();
    }, 100);
    
    // Expose for manual use
    window.modernIcons = iconGenerator;
});