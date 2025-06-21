/**
 * Cinematic Scroll Effects
 * Award-winning scroll animations and parallax effects
 */

class CinematicScroll {
    constructor() {
        this.init();
        this.setupScrollTriggers();
        this.setupParallax();
        this.setupMagneticButtons();
        this.setupTextAnimations();
    }

    init() {
        // Initialize Locomotive Scroll for smooth scrolling
        if (typeof LocomotiveScroll !== 'undefined') {
            this.scroll = new LocomotiveScroll({
                el: document.querySelector('[data-scroll-container]'),
                smooth: true,
                lerp: 0.075,
                multiplier: 0.75,
                reloadOnContextChange: true,
                touchMultiplier: 2,
                smoothMobile: true,
                smartphone: {
                    smooth: true,
                    breakpoint: 767
                },
                tablet: {
                    smooth: true,
                    breakpoint: 1024
                }
            });
        }

        // GSAP ScrollSmoother for additional smoothness
        if (typeof ScrollSmoother !== 'undefined') {
            this.smoother = ScrollSmoother.create({
                content: "#smooth-content",
                wrapper: "#smooth-wrapper",
                smooth: 2,
                smoothTouch: 0.1,
                effects: true,
                normalizeScroll: true
            });
        }
    }

    setupScrollTriggers() {
        // Cinematic section reveals
        gsap.utils.toArray('.content-section').forEach((section, i) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                    scrub: 1
                }
            });

            // Fade and slide animation
            tl.from(section, {
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: 'power4.out'
            });

            // Animate child elements
            const elements = section.querySelectorAll('.scroll-reveal');
            if (elements.length) {
                tl.from(elements, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: 'power3.out'
                }, '-=1');
            }
        });

        // Hero parallax effect
        gsap.to('.hero-title', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: -200,
            scale: 0.7,
            opacity: 0.3,
            ease: 'none'
        });

        // Anchor cards 3D rotation on scroll
        gsap.utils.toArray('.anchor-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                rotationY: 360,
                rotationX: 10,
                z: -50,
                ease: 'none'
            });
        });

        // News ticker speed variation
        const ticker = document.querySelector('.ticker-content');
        if (ticker) {
            ScrollTrigger.create({
                trigger: '#news-studio',
                start: 'top center',
                end: 'bottom center',
                onUpdate: self => {
                    const progress = self.progress;
                    const speed = 1 + (progress * 3); // Speed up as user scrolls
                    gsap.to(ticker, {
                        duration: 0.1,
                        timeScale: speed
                    });
                }
            });
        }
    }

    setupParallax() {
        // Multi-layer parallax backgrounds
        const parallaxElements = [
            { element: '#particles-js', speed: 0.5 },
            { element: '.shader-background', speed: 0.3 },
            { element: '#main-canvas', speed: 0.7 }
        ];

        parallaxElements.forEach(({ element, speed }) => {
            const el = document.querySelector(element);
            if (el) {
                gsap.to(el, {
                    scrollTrigger: {
                        trigger: document.body,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: true
                    },
                    y: () => window.innerHeight * speed,
                    ease: 'none'
                });
            }
        });
    }

    setupMagneticButtons() {
        // Magnetic hover effect for buttons
        const magneticElements = document.querySelectorAll('.cta-button, .nav-menu a');
        
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(el, {
                    duration: 0.3,
                    x: x * 0.3,
                    y: y * 0.3,
                    ease: 'power2.out'
                });
            });
            
            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    duration: 0.3,
                    x: 0,
                    y: 0,
                    ease: 'power2.out'
                });
            });
        });
    }

    setupTextAnimations() {
        // Split text animations
        const splitTexts = document.querySelectorAll('.split-text');
        
        splitTexts.forEach(text => {
            const split = new SplitText(text, { 
                type: 'chars, words, lines',
                linesClass: 'line'
            });
            
            gsap.from(split.chars, {
                scrollTrigger: {
                    trigger: text,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                rotationX: -90,
                stagger: {
                    each: 0.02,
                    from: 'random'
                },
                duration: 1,
                ease: 'power3.out'
            });
        });

        // Typewriter effect for news ticker
        const tickerItems = document.querySelectorAll('.ticker-item');
        tickerItems.forEach((item, i) => {
            const text = item.textContent;
            item.textContent = '';
            item.style.opacity = 1;
            
            const tl = gsap.timeline({
                repeat: -1,
                delay: i * 2
            });
            
            tl.to(item, {
                duration: text.length * 0.05,
                text: {
                    value: text,
                    delimiter: ""
                },
                ease: 'none'
            });
        });
    }

    // Advanced scroll effects
    addQuantumScrollEffect() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateQuantumEffect = () => {
            const scrollY = window.scrollY;
            const delta = scrollY - lastScrollY;
            const speed = Math.abs(delta);
            
            // Apply quantum distortion based on scroll speed
            if (window.quantumRenderer) {
                window.quantumRenderer.setDistortion(speed * 0.001);
            }
            
            // Update shader uniforms
            if (window.shaderMaterial) {
                window.shaderMaterial.uniforms.scrollSpeed.value = speed * 0.01;
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateQuantumEffect);
                ticking = true;
            }
        });
    }

    // Cinematic page transitions
    initPageTransitions() {
        if (typeof barba !== 'undefined') {
            barba.init({
                transitions: [{
                    name: 'quantum-transition',
                    leave(data) {
                        return gsap.timeline()
                            .to(data.current.container, {
                                opacity: 0,
                                scale: 0.8,
                                rotation: 5,
                                filter: 'blur(20px)',
                                duration: 1,
                                ease: 'power4.inOut'
                            });
                    },
                    enter(data) {
                        return gsap.timeline()
                            .from(data.next.container, {
                                opacity: 0,
                                scale: 1.2,
                                rotation: -5,
                                filter: 'blur(20px)',
                                duration: 1,
                                ease: 'power4.inOut'
                            });
                    }
                }]
            });
        }
    }

    // Performance monitoring
    monitorPerformance() {
        const perfData = {
            fps: 0,
            frameTime: 0
        };

        let lastTime = performance.now();
        let frames = 0;

        const checkPerformance = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                perfData.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                perfData.frameTime = (currentTime - lastTime) / frames;
                
                // Adjust quality if FPS drops
                if (perfData.fps < 30) {
                    this.reduceQuality();
                } else if (perfData.fps > 55) {
                    this.increaseQuality();
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkPerformance);
        };
        
        checkPerformance();
    }

    reduceQuality() {
        // Reduce particle count, disable some effects
        if (window.particleSystem) {
            window.particleSystem.reduceParticles();
        }
    }

    increaseQuality() {
        // Increase particle count, enable more effects
        if (window.particleSystem) {
            window.particleSystem.increaseParticles();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cinematicScroll = new CinematicScroll();
    
    // Add quantum scroll effect after initialization
    setTimeout(() => {
        window.cinematicScroll.addQuantumScrollEffect();
        window.cinematicScroll.monitorPerformance();
    }, 1000);
});