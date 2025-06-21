// Performance Optimization Module for Static.news
class PerformanceOptimizer {
    constructor() {
        this.resourceHints = [];
        this.lazyLoadQueue = [];
        this.criticalCSS = '';
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap', as: 'style' },
            { href: 'https://cdn.babylonjs.com/babylon.js', as: 'script' },
            { href: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'font') link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // Lazy load non-critical scripts
    lazyLoadScript(src, callback) {
        if (this.lazyLoadQueue.includes(src)) return;
        
        this.lazyLoadQueue.push(src);
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = callback;
        document.body.appendChild(script);
    }

    // Optimize images with lazy loading
    setupLazyImages() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
    }

    // Use requestIdleCallback for non-critical tasks
    deferNonCritical(callback) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
        } else {
            setTimeout(callback, 1);
        }
    }

    // Optimize Babylon.js performance
    optimizeBabylon(scene) {
        // Enable scene optimizer
        const optimizer = new BABYLON.SceneOptimizer(scene, {
            targetFrameRate: 60,
            trackerDuration: 2000
        });

        // Add optimization levels
        optimizer.addOptimization(new BABYLON.TextureOptimization(1, 512));
        optimizer.addOptimization(new BABYLON.HardwareScalingOptimization(0, 2));
        optimizer.addOptimization(new BABYLON.ShadowsOptimization(0));
        optimizer.addOptimization(new BABYLON.PostProcessesOptimization(1));

        // Enable frustum culling
        scene.autoClear = false;
        scene.autoClearDepthAndStencil = false;
        
        // Use instances for repeated meshes
        scene.useInstances = true;
        scene.useClonedMeshMap = true;

        // Reduce draw calls
        scene.blockMaterialDirtyMechanism = true;

        return optimizer;
    }

    // Web Worker for heavy computations
    createWorker(workerFunction) {
        const blob = new Blob([`(${workerFunction.toString()})()`], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    }

    // Cache management
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
        }
    }

    // GPU acceleration hints
    enableGPUAcceleration(element) {
        element.style.transform = 'translateZ(0)';
        element.style.willChange = 'transform';
    }

    // Debounce expensive operations
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize all optimizations
    init() {
        this.preloadCriticalResources();
        this.setupLazyImages();
        this.setupServiceWorker();
        
        // Defer non-critical initializations
        this.deferNonCritical(() => {
            this.lazyLoadScript('https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js');
            this.lazyLoadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        });
    }
}

// Export for use
window.PerformanceOptimizer = PerformanceOptimizer;