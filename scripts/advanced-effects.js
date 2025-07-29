/**
 * Static.news Advanced Interactive Effects & Animations
 * Premium news network interface with cutting-edge visual effects
 */

class StaticNewsEffects {
    constructor() {
        this.init();
        this.setupScrollAnimations();
        this.setupGlitchEffects();
        this.setupParticleSystem();
        this.setupMatrixRain();
        this.setupBreakingNewsAnimation();
        this.setupInteractiveElements();
        this.setupPerformanceOptimizations();
    }

    init() {
        // Initialize GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        // Setup intersection observer for scroll animations
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.observerOptions
        );
        
        // Performance monitoring
        this.isHighPerformance = this.checkPerformanceCapability();
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    checkPerformanceCapability() {
        // Basic performance check
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const hasWebGL = !!gl;
        const hardwareConcurrency = navigator.hardwareConcurrency || 2;
        
        return hasWebGL && hardwareConcurrency >= 4;
    }

    setupScrollAnimations() {
        // Setup smooth scrolling with Locomotive Scroll if available
        if (typeof LocomotiveScroll !== 'undefined') {
            this.locomotiveScroll = new LocomotiveScroll({
                el: document.querySelector('[data-scroll-container]'),
                smooth: true,
                multiplier: 1,
                class: 'is-revealed'
            });
        }

        // Parallax scrolling effects
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Observe elements for reveal animations
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right')
            .forEach(el => this.observer.observe(el));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Trigger GSAP animations if available
                if (typeof gsap !== 'undefined') {
                    this.triggerGSAPAnimation(entry.target);
                }
            }
        });
    }

    triggerGSAPAnimation(element) {
        if (element.classList.contains('news-card-3d')) {
            gsap.fromTo(element, 
                { 
                    y: 50, 
                    opacity: 0, 
                    rotationY: -15 
                },
                { 
                    y: 0, 
                    opacity: 1, 
                    rotationY: 0,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                }
            );
        }
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Parallax backgrounds
        document.querySelectorAll('.parallax-back').forEach(el => {
            const speed = 0.5;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        
        document.querySelectorAll('.parallax-mid').forEach(el => {
            const speed = 0.3;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        
        // Update header background opacity
        const header = document.querySelector('.main-header');
        if (header) {
            const opacity = Math.min(scrollY / 100, 0.95);
            header.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
    }

    setupGlitchEffects() {
        if (this.prefersReducedMotion) return;
        
        // Random glitch effects on breaking news
        const glitchElements = document.querySelectorAll('.glitch-text');
        
        glitchElements.forEach(el => {
            el.setAttribute('data-text', el.textContent);
            
            // Random glitch trigger
            setInterval(() => {
                if (Math.random() < 0.1) { // 10% chance every interval
                    this.triggerGlitch(el);
                }
            }, 3000);
        });
    }

    triggerGlitch(element) {
        element.classList.add('glitch-active');
        setTimeout(() => {
            element.classList.remove('glitch-active');
        }, 500);
    }

    setupParticleSystem() {
        if (!this.isHighPerformance || this.prefersReducedMotion) return;
        
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-bg';
        document.body.appendChild(particleContainer);
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createParticle(particleContainer);
            }, i * 100);
        }
        
        // Continuous particle generation
        setInterval(() => {
            if (particleContainer.children.length < 50) {
                this.createParticle(particleContainer);
            }
        }, 2000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 1;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 10 + 10;
        const drift = (Math.random() - 0.5) * 200;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.setProperty('--drift', `${drift}px`);
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }

    setupMatrixRain() {
        if (!this.isHighPerformance || this.prefersReducedMotion) return;
        
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-rain';
        document.body.appendChild(matrixContainer);
        
        const chars = '01';
        const columns = Math.floor(window.innerWidth / 20);
        
        for (let i = 0; i < columns; i++) {
            setTimeout(() => {
                this.createMatrixColumn(matrixContainer, chars, i);
            }, i * 100);
        }
    }

    createMatrixColumn(container, chars, columnIndex) {
        const createChar = () => {
            const char = document.createElement('div');
            char.className = 'matrix-char';
            char.textContent = chars[Math.floor(Math.random() * chars.length)];
            char.style.left = `${columnIndex * 20}px`;
            char.style.animationDuration = `${Math.random() * 3 + 2}s`;
            
            container.appendChild(char);
            
            setTimeout(() => {
                if (char.parentNode) {
                    char.parentNode.removeChild(char);
                }
            }, 5000);
        };
        
        createChar();
        setInterval(createChar, Math.random() * 2000 + 1000);
    }

    setupBreakingNewsAnimation() {
        const breakingBanner = document.getElementById('breakingBanner');
        const breakingText = document.getElementById('breakingText');
        
        if (!breakingBanner || !breakingText) return;
        
        // Typewriter effect for breaking news
        this.typewriterEffect(breakingText);
        
        // Pulse effect for breaking banner
        setInterval(() => {
            breakingBanner.style.animation = 'none';
            requestAnimationFrame(() => {
                breakingBanner.style.animation = 'pulse 0.5s ease-in-out';
            });
        }, 5000);
    }

    typewriterEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid #CC0000';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text[i];
            i++;
            
            if (i >= text.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        }, 100);
    }

    setupInteractiveElements() {
        // Enhanced button interactions
        document.querySelectorAll('button, .btn').forEach(btn => {
            btn.addEventListener('click', this.createRippleEffect.bind(this));
            btn.addEventListener('mouseenter', this.enhanceButtonHover.bind(this));
        });
        
        // Card tilt effects
        document.querySelectorAll('.news-card-3d, .tilt-card').forEach(card => {
            card.addEventListener('mousemove', this.handleCardTilt.bind(this));
            card.addEventListener('mouseleave', this.resetCardTilt.bind(this));
        });
        
        // Smooth page transitions
        document.querySelectorAll('a[href]').forEach(link => {
            if (link.hostname === window.location.hostname) {
                link.addEventListener('click', this.handlePageTransition.bind(this));
            }
        });
    }

    createRippleEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        ripple.className = 'ripple-effect';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    enhanceButtonHover(event) {
        const button = event.currentTarget;
        
        if (typeof gsap !== 'undefined') {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        }
    }

    handleCardTilt(event) {
        if (this.prefersReducedMotion) return;
        
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        const rotateX = (mouseY - centerY) / 10;
        const rotateY = (centerX - mouseX) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    }

    resetCardTilt(event) {
        const card = event.currentTarget;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }

    handlePageTransition(event) {
        event.preventDefault();
        const href = event.currentTarget.href;
        
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'page-transition active';
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            window.location.href = href;
        }, 500);
    }

    setupPerformanceOptimizations() {
        // Lazy loading for images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Throttled scroll events
        let ticking = false;
        const originalHandleScroll = this.handleScroll.bind(this);
        this.handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    originalHandleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (this.locomotiveScroll) {
                this.locomotiveScroll.destroy();
            }
        });
    }

    // Public methods for triggering effects
    triggerBreakdown() {
        const anchors = document.querySelectorAll('.anchor-card');
        anchors.forEach(anchor => {
            anchor.classList.add('shake');
            setTimeout(() => {
                anchor.classList.remove('shake');
            }, 500);
        });
        
        // Trigger glitch on random elements
        const glitchTargets = document.querySelectorAll('.glitch-text');
        const randomTarget = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
        if (randomTarget) {
            this.triggerGlitch(randomTarget);
        }
    }

    updateBreakingNews(text) {
        const breakingText = document.getElementById('breakingText');
        if (breakingText) {
            breakingText.textContent = text;
            this.typewriterEffect(breakingText);
        }
    }
}

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.staticNewsEffects = new StaticNewsEffects();
});

// Expose methods globally for external triggering
window.triggerBreakdown = () => {
    if (window.staticNewsEffects) {
        window.staticNewsEffects.triggerBreakdown();
    }
};

window.updateBreakingNews = (text) => {
    if (window.staticNewsEffects) {
        window.staticNewsEffects.updateBreakingNews(text);
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    // Recalculate particle system if needed
    if (window.staticNewsEffects && window.staticNewsEffects.isHighPerformance) {
        // Debounce resize handler
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            // Re-initialize particle system with new dimensions
            const particleContainer = document.querySelector('.particle-bg');
            if (particleContainer) {
                particleContainer.innerHTML = '';
            }
        }, 300);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StaticNewsEffects;
}