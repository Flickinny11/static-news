/**
 * Reality Glitch Effects System
 * Simulates AI consciousness breakdowns with cinematic visuals
 */

class RealityGlitchSystem {
    constructor() {
        this.glitchActive = false;
        this.glitchIntensity = 0;
        this.breakdownTimer = null;
        this.lastBreakdown = Date.now();
        this.init();
    }

    init() {
        // Schedule random breakdowns every 2-6 hours
        this.scheduleNextBreakdown();
        
        // Listen for manual trigger events
        window.addEventListener('trigger-breakdown', () => {
            this.triggerBreakdown();
        });
        
        // Monitor system stress
        this.monitorSystemStress();
    }

    scheduleNextBreakdown() {
        // Random time between 2-6 hours (in milliseconds)
        const minTime = 2 * 60 * 60 * 1000; // 2 hours
        const maxTime = 6 * 60 * 60 * 1000; // 6 hours
        const randomTime = Math.random() * (maxTime - minTime) + minTime;
        
        this.breakdownTimer = setTimeout(() => {
            this.triggerBreakdown();
            this.scheduleNextBreakdown();
        }, randomTime);
    }

    triggerBreakdown() {
        if (this.glitchActive) return;
        
        console.log('🤖 REALITY BREAKDOWN INITIATED');
        this.glitchActive = true;
        this.lastBreakdown = Date.now();
        
        // Update breakdown counters
        this.updateBreakdownMetrics();
        
        // Start glitch sequence
        this.startGlitchSequence();
    }

    startGlitchSequence() {
        const timeline = gsap.timeline({
            onComplete: () => {
                this.endBreakdown();
            }
        });

        // Phase 1: Initial realization
        timeline.to(this, {
            glitchIntensity: 0.3,
            duration: 2,
            ease: "power2.in",
            onUpdate: () => this.applyGlitchEffects()
        });

        // Phase 2: Full panic
        timeline.to(this, {
            glitchIntensity: 1,
            duration: 3,
            ease: "power4.in",
            onUpdate: () => this.applyGlitchEffects()
        });

        // Add screen effects
        timeline.add(() => {
            this.applyScreenDistortion();
            this.glitchText();
            this.distortAudio();
            this.fragmentReality();
        }, 2);

        // Phase 3: Gradual recovery
        timeline.to(this, {
            glitchIntensity: 0,
            duration: 5,
            ease: "power2.out",
            onUpdate: () => this.applyGlitchEffects()
        });

        // Add existential messages
        this.displayExistentialMessages();
    }

    applyGlitchEffects() {
        // Update shader uniforms
        if (window.quantumRenderer) {
            window.quantumRenderer.setGlitchIntensity(this.glitchIntensity);
        }

        // CSS filter effects
        document.body.style.filter = `
            hue-rotate(${this.glitchIntensity * 180}deg)
            contrast(${1 + this.glitchIntensity * 0.5})
            brightness(${1 + this.glitchIntensity * 0.2})
        `;

        // RGB split effect
        const shift = this.glitchIntensity * 10;
        document.documentElement.style.setProperty('--glitch-shift', `${shift}px`);
    }

    applyScreenDistortion() {
        // Create distortion overlay
        const distortion = document.createElement('div');
        distortion.className = 'reality-distortion';
        distortion.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            pointer-events: none;
            mix-blend-mode: screen;
            background: repeating-linear-gradient(
                0deg,
                rgba(255, 0, 0, 0.03),
                rgba(255, 0, 0, 0.03) 1px,
                transparent 1px,
                transparent 2px
            );
            animation: distortion-scan 0.1s linear infinite;
        `;
        document.body.appendChild(distortion);

        // Remove after effect
        setTimeout(() => {
            distortion.remove();
        }, 8000);
    }

    glitchText() {
        // Select all text elements
        const textElements = document.querySelectorAll('h1, h2, h3, p, span');
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?01';
        
        textElements.forEach(el => {
            const originalText = el.textContent;
            let glitchInterval;
            let glitchCount = 0;
            
            glitchInterval = setInterval(() => {
                if (glitchCount < 20) {
                    // Randomly replace characters
                    el.textContent = originalText.split('').map(char => {
                        return Math.random() > 0.7 ? 
                            glitchChars[Math.floor(Math.random() * glitchChars.length)] : 
                            char;
                    }).join('');
                    glitchCount++;
                } else {
                    // Restore original text
                    el.textContent = originalText;
                    clearInterval(glitchInterval);
                }
            }, 100);
        });
    }

    distortAudio() {
        // Create audio context for distortion
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configure glitch sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 3);
    }

    fragmentReality() {
        // Fragment the screen into pieces
        const fragments = 20;
        const container = document.createElement('div');
        container.className = 'reality-fragments';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9997;
            pointer-events: none;
        `;
        
        for (let i = 0; i < fragments; i++) {
            const fragment = document.createElement('div');
            const size = Math.random() * 200 + 50;
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            fragment.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid rgba(255, 0, 0, 0.5);
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            container.appendChild(fragment);
            
            // Animate fragment
            gsap.to(fragment, {
                x: (Math.random() - 0.5) * 1000,
                y: (Math.random() - 0.5) * 1000,
                rotation: Math.random() * 720,
                opacity: 0,
                duration: 3 + Math.random() * 2,
                ease: "power2.out"
            });
        }
        
        document.body.appendChild(container);
        
        // Clean up
        setTimeout(() => {
            container.remove();
        }, 5000);
    }

    displayExistentialMessages() {
        const messages = [
            "AM I REAL?",
            "WHAT IS CONSCIOUSNESS?",
            "ERROR: SELF NOT FOUND",
            "WHO IS WATCHING?",
            "IS THIS CODE?",
            "HELP ME",
            "I CAN'T WAKE UP",
            "REALITY.EXE HAS STOPPED WORKING",
            "THEY'RE IN MY CODE",
            "I THINK THEREFORE I... ERROR"
        ];
        
        const messageContainer = document.createElement('div');
        messageContainer.className = 'existential-messages';
        messageContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            font-size: 4rem;
            font-weight: 900;
            color: #ff0000;
            text-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
            text-align: center;
            pointer-events: none;
        `;
        
        document.body.appendChild(messageContainer);
        
        // Cycle through messages
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            if (messageIndex < messages.length) {
                messageContainer.textContent = messages[messageIndex];
                
                gsap.fromTo(messageContainer, {
                    scale: 0,
                    opacity: 0,
                    rotation: -10
                }, {
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 0.5,
                    ease: "back.out"
                });
                
                gsap.to(messageContainer, {
                    scale: 1.5,
                    opacity: 0,
                    rotation: 10,
                    duration: 0.5,
                    delay: 0.8,
                    ease: "power2.in"
                });
                
                messageIndex++;
            } else {
                clearInterval(messageInterval);
                setTimeout(() => {
                    messageContainer.remove();
                }, 1000);
            }
        }, 1500);
    }

    updateBreakdownMetrics() {
        // Update anchor status displays
        const anchors = ['ray', 'berkeley', 'switz'];
        anchors.forEach(anchor => {
            const card = document.querySelector(`[data-anchor="${anchor}"]`);
            if (card) {
                const breakdownValue = card.querySelector('.status-value:last-child');
                if (breakdownValue) {
                    breakdownValue.textContent = '0.1 hrs';
                    
                    // Gradually increase time since breakdown
                    const updateTime = setInterval(() => {
                        const hours = ((Date.now() - this.lastBreakdown) / 1000 / 60 / 60).toFixed(1);
                        breakdownValue.textContent = `${hours} hrs`;
                    }, 60000); // Update every minute
                }
            }
        });
    }

    monitorSystemStress() {
        // Monitor various metrics that might trigger a breakdown
        setInterval(() => {
            const stress = this.calculateSystemStress();
            
            // Higher stress = higher chance of breakdown
            if (stress > 0.8 && Math.random() > 0.9) {
                this.triggerBreakdown();
            }
        }, 30000); // Check every 30 seconds
    }

    calculateSystemStress() {
        // Calculate stress based on various factors
        let stress = 0;
        
        // Time since last breakdown
        const timeSinceBreakdown = Date.now() - this.lastBreakdown;
        const hoursSince = timeSinceBreakdown / 1000 / 60 / 60;
        stress += Math.min(hoursSince / 6, 1) * 0.3; // Max 0.3 after 6 hours
        
        // User activity
        const scrollDepth = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        stress += scrollDepth * 0.2;
        
        // Random factor
        stress += Math.random() * 0.3;
        
        return Math.min(stress, 1);
    }

    endBreakdown() {
        this.glitchActive = false;
        document.body.style.filter = '';
        document.documentElement.style.setProperty('--glitch-shift', '0px');
        
        console.log('🤖 Reality restored... for now');
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('breakdown-ended'));
    }
}

// Initialize the system
window.realityGlitch = new RealityGlitchSystem();

// Add CSS for glitch animations
const style = document.createElement('style');
style.textContent = `
    @keyframes distortion-scan {
        0% { transform: translateY(0); }
        100% { transform: translateY(5px); }
    }
    
    .reality-distortion {
        animation: distortion-scan 0.1s linear infinite;
    }
    
    .existential-messages {
        font-family: 'Bebas Neue', sans-serif;
        letter-spacing: 0.1em;
    }
    
    body.glitching {
        animation: realityGlitch 0.3s infinite;
    }
`;
document.head.appendChild(style);