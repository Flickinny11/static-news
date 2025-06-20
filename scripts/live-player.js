// Static.news Live Player JavaScript

class LivePlayer {
    constructor() {
        this.audio = document.getElementById('liveAudio');
        this.playBtn = document.getElementById('playPauseBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.canvas = document.getElementById('waveform');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.isPlaying = false;
        this.analyser = null;
        this.dataArray = null;
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.setupControls();
        this.setupVisualizer();
        this.updateViewerCount();
    }
    
    setupAudio() {
        // Set initial volume
        if (this.audio) {
            this.audio.volume = 0.8;
            
            // Auto-play handling
            this.audio.addEventListener('canplay', () => {
                this.attemptAutoplay();
            });
            
            this.audio.addEventListener('play', () => {
                this.isPlaying = true;
                this.updatePlayButton();
            });
            
            this.audio.addEventListener('pause', () => {
                this.isPlaying = false;
                this.updatePlayButton();
            });
            
            this.audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                // Fallback to demo audio
                this.loadDemoAudio();
            });
        }
    }
    
    setupControls() {
        // Play/Pause button
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => {
                this.togglePlayback();
            });
        }
        
        // Volume slider
        if (this.volumeSlider && this.audio) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.audio.volume = e.target.value / 100;
            });
        }
        
        // Fullscreen button
        const fullscreenBtn = document.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }
    
    setupVisualizer() {
        if (!this.canvas || !this.audio) return;
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Create audio context
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            // Create analyser
            this.analyser = audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            // Connect audio source
            const source = audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(audioContext.destination);
            
            // Start visualization
            this.animate();
        } catch (e) {
            console.log('Web Audio API not supported, using fallback visualization');
            this.animateFallback();
        }
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    animate() {
        if (!this.analyser || !this.ctx) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;
            
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height - barHeight, 0, this.canvas.height);
            gradient.addColorStop(0, '#CC0000');
            gradient.addColorStop(1, '#FF3333');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    animateFallback() {
        if (!this.ctx) return;
        
        requestAnimationFrame(() => this.animateFallback());
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const bars = 50;
        const barWidth = this.canvas.width / bars;
        
        for (let i = 0; i < bars; i++) {
            const barHeight = Math.random() * this.canvas.height * 0.7;
            
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height - barHeight, 0, this.canvas.height);
            gradient.addColorStop(0, '#CC0000');
            gradient.addColorStop(1, '#FF3333');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(i * barWidth + 1, this.canvas.height - barHeight, barWidth - 2, barHeight);
        }
    }
    
    togglePlayback() {
        if (this.audio) {
            if (this.isPlaying) {
                this.audio.pause();
            } else {
                this.audio.play().catch(e => {
                    console.log('Playback failed:', e);
                    // Show user interaction required message
                    this.showPlayPrompt();
                });
            }
        }
    }
    
    attemptAutoplay() {
        if (this.audio && !this.isPlaying) {
            this.audio.play().catch(e => {
                console.log('Autoplay prevented:', e);
                // Autoplay was prevented, wait for user interaction
            });
        }
    }
    
    updatePlayButton() {
        if (this.playBtn) {
            if (this.isPlaying) {
                this.playBtn.classList.add('playing');
            } else {
                this.playBtn.classList.remove('playing');
            }
        }
    }
    
    loadDemoAudio() {
        // In demo mode, create synthetic audio
        if (CONFIG.DEMO_MODE && this.audio) {
            // Use a data URL for demo audio
            this.audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCuBzvLZiTYIG2m98OScTgwOUart9bdmFwU7k9n1yHksBSl+zPLaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuBzvLZiTYIG2m98OScTgwOUart9bdmFwU7k9n1yHksBSl+zPLaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuBzvLZiTYIG2m98OScTgwOUart9bdmFwU7k9n1yHksBSl+zPLaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuBzvLZiTYIG2m98OScTgwOUart9bdmFwU7k9n1yHksBSl+zPLaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuBzvLZiTYIG2m98OScTgwOUart9bdmFwU7k9n1yHksBSl+zPLaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuBzvLZiTYIG2m98OScTgwOUart9bdmFwU7k9n1yHksBSl+zPLaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuBzvLZiTYIG2m98OScTgwOUart9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bdmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOUqrt9bZmFwU7k9n1yHksBSh+zPDaizsIHGq+8u2TQAoTXbLo66hVFQlFnt/yvmwhBCuAzvLZiTYIG2m98OScTgwOU';
        }
    }
    
    showPlayPrompt() {
        // Show a prompt to the user to click play
        const prompt = document.createElement('div');
        prompt.className = 'play-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <p>Click to start audio stream</p>
                <button class="start-audio-btn">Start Audio</button>
            </div>
        `;
        
        document.querySelector('.video-player').appendChild(prompt);
        
        prompt.querySelector('.start-audio-btn').addEventListener('click', () => {
            this.audio.play();
            prompt.remove();
        });
    }
    
    toggleFullscreen() {
        const player = document.querySelector('.video-player');
        
        if (!document.fullscreenElement) {
            player.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    updateViewerCount() {
        const viewerElement = document.querySelector('.viewer-count');
        if (!viewerElement) return;
        
        let baseCount = 247000;
        
        setInterval(() => {
            // Simulate viewer count fluctuation
            const variation = Math.floor(Math.random() * 10000) - 5000;
            const currentCount = baseCount + variation;
            
            viewerElement.textContent = `${(currentCount / 1000).toFixed(0)}K watching`;
        }, 10000);
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.livePlayer = new LivePlayer();
});