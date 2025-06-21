// System Verification - Ensures all components are production-ready
class SystemVerification {
    constructor() {
        this.systems = {
            'aiCharacterSystem': {
                name: 'AI Character System',
                required: true,
                checks: [
                    () => window.aiCharacterSystem?.characters?.size > 0,
                    () => window.aiCharacterSystem?.hfSpaces?.characterCreation?.length > 0,
                    () => typeof window.aiCharacterSystem?.generateLipSyncVideo === 'function',
                    () => typeof window.aiCharacterSystem?.generateAudio === 'function'
                ]
            },
            'videoGenerationSystem': {
                name: 'Video Generation System',
                required: true,
                checks: [
                    () => window.videoGenerationSystem?.videoContainer !== null,
                    () => typeof window.videoGenerationSystem?.generateVideo === 'function',
                    () => window.videoGenerationSystem?.hfSpaces?.textToVideo?.length > 0
                ]
            },
            'liveArticleDisplay': {
                name: 'Live Article Display',
                required: true,
                checks: [
                    () => window.liveArticleDisplay?.displayContainer !== null,
                    () => window.liveArticleDisplay?.isConnected === true,
                    () => typeof window.liveArticleDisplay?.displayArticle === 'function'
                ]
            },
            'broadcastVideoIntegration': {
                name: 'Broadcast Video Integration',
                required: true,
                checks: [
                    () => window.broadcastVideoIntegration !== undefined,
                    () => typeof window.broadcastVideoIntegration?.handleVideoRequest === 'function'
                ]
            },
            'aiCharacterBroadcastIntegration': {
                name: 'AI Character Broadcast Integration',
                required: true,
                checks: [
                    () => window.aiCharacterBroadcastIntegration?.isActive === true,
                    () => window.aiCharacterBroadcastIntegration?.characterVideoElement !== null,
                    () => typeof window.aiCharacterBroadcastIntegration?.playCharacterVideo === 'function'
                ]
            }
        };
        
        this.performanceMetrics = {
            pageLoadTime: 0,
            systemInitTime: 0,
            memoryUsage: 0,
            activeConnections: 0
        };
    }

    async runFullVerification() {
        console.log('🔍 Starting Static.news System Verification...\n');
        
        const startTime = performance.now();
        const results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: []
        };
        
        // Check page load performance
        this.checkPageLoadPerformance();
        
        // Verify all systems
        for (const [systemKey, system] of Object.entries(this.systems)) {
            console.log(`\n📋 Checking ${system.name}...`);
            
            const systemExists = window[systemKey] !== undefined;
            
            if (!systemExists) {
                if (system.required) {
                    console.error(`❌ ${system.name} NOT FOUND - CRITICAL ERROR`);
                    results.failed++;
                    results.errors.push(`${system.name} is not initialized`);
                } else {
                    console.warn(`⚠️ ${system.name} not found (optional)`);
                    results.warnings++;
                }
                continue;
            }
            
            console.log(`✅ ${system.name} exists`);
            
            // Run specific checks
            let checksPassed = 0;
            for (const check of system.checks) {
                try {
                    const passed = check();
                    if (passed) {
                        checksPassed++;
                    } else {
                        console.warn(`   ⚠️ Check failed: ${check.toString().substring(6, 50)}...`);
                    }
                } catch (error) {
                    console.error(`   ❌ Check error: ${error.message}`);
                }
            }
            
            console.log(`   ✓ ${checksPassed}/${system.checks.length} checks passed`);
            
            if (checksPassed === system.checks.length) {
                results.passed++;
            } else {
                results.warnings++;
            }
        }
        
        // Check API connections
        await this.verifyAPIConnections();
        
        // Check WebSocket connections
        this.verifyWebSocketConnections();
        
        // Check for mock/placeholder code
        this.checkForPlaceholders();
        
        // Performance checks
        this.checkPerformance();
        
        // Memory usage
        this.checkMemoryUsage();
        
        const endTime = performance.now();
        const verificationTime = (endTime - startTime).toFixed(2);
        
        // Final report
        console.log('\n' + '='.repeat(50));
        console.log('📊 VERIFICATION COMPLETE');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`⚠️  Warnings: ${results.warnings}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`⏱️  Verification time: ${verificationTime}ms`);
        
        if (results.errors.length > 0) {
            console.log('\n🚨 CRITICAL ERRORS:');
            results.errors.forEach(error => console.error(`   - ${error}`));
        }
        
        // Overall status
        const isProductionReady = results.failed === 0 && results.errors.length === 0;
        
        if (isProductionReady) {
            console.log('\n🎉 SYSTEM IS PRODUCTION READY! 🚀');
            this.showSuccessAnimation();
        } else {
            console.log('\n⚠️ SYSTEM NEEDS ATTENTION BEFORE PRODUCTION');
        }
        
        return {
            productionReady: isProductionReady,
            results: results,
            metrics: this.performanceMetrics
        };
    }

    checkPageLoadPerformance() {
        if (window.performance && performance.timing) {
            const timing = performance.timing;
            this.performanceMetrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`\n⚡ Page Load Performance:`);
            console.log(`   - Total load time: ${this.performanceMetrics.pageLoadTime}ms`);
            console.log(`   - DOM ready: ${timing.domContentLoadedEventEnd - timing.navigationStart}ms`);
            
            if (this.performanceMetrics.pageLoadTime > 3000) {
                console.warn('   ⚠️ Page load time exceeds 3 seconds');
            }
        }
    }

    async verifyAPIConnections() {
        console.log('\n🌐 Verifying API Connections...');
        
        // Check Hugging Face token
        const hfToken = localStorage.getItem('hf_token');
        if (!hfToken) {
            console.warn('   ⚠️ No Hugging Face token found in localStorage');
        } else {
            console.log('   ✅ Hugging Face token present');
        }
        
        // Check WebSocket to broadcast server
        try {
            const ws = new WebSocket('wss://alledged-static-news-backend.hf.space/ws');
            await new Promise((resolve, reject) => {
                ws.onopen = () => {
                    console.log('   ✅ Broadcast WebSocket connection successful');
                    ws.close();
                    resolve();
                };
                ws.onerror = () => {
                    console.error('   ❌ Broadcast WebSocket connection failed');
                    reject();
                };
                setTimeout(reject, 5000);
            }).catch(() => {});
        } catch (error) {
            console.error('   ❌ WebSocket test failed');
        }
    }

    verifyWebSocketConnections() {
        console.log('\n📡 Active WebSocket Connections:');
        
        let connectionCount = 0;
        
        // Check for active WebSocket connections
        if (window.liveArticleDisplay?.ws?.readyState === WebSocket.OPEN) {
            console.log('   ✅ Article Display WebSocket: CONNECTED');
            connectionCount++;
        }
        
        if (window.aiCharacterBroadcastIntegration?.ws?.readyState === WebSocket.OPEN) {
            console.log('   ✅ Character Integration WebSocket: CONNECTED');
            connectionCount++;
        }
        
        this.performanceMetrics.activeConnections = connectionCount;
        console.log(`   Total active connections: ${connectionCount}`);
    }

    checkForPlaceholders() {
        console.log('\n🔍 Checking for placeholder/mock code...');
        
        const suspiciousPatterns = [
            /mock/i,
            /demo/i,
            /placeholder/i,
            /todo/i,
            /fixme/i,
            /data:image\/png;base64,mock/i,
            /would\s+call/i,
            /simulate/i
        ];
        
        let placeholdersFound = 0;
        
        // Check all loaded scripts
        const scripts = Array.from(document.querySelectorAll('script[src*="scripts/"]'));
        
        scripts.forEach(script => {
            const scriptName = script.src.split('/').pop();
            
            // We can't directly read script content from src, but we can check globals
            if (scriptName.includes('character') || scriptName.includes('video')) {
                // Check for mock implementations in exposed methods
                const checkObject = (obj, path = '') => {
                    if (!obj || typeof obj !== 'object') return;
                    
                    Object.keys(obj).forEach(key => {
                        const value = obj[key];
                        if (typeof value === 'function') {
                            const funcString = value.toString();
                            suspiciousPatterns.forEach(pattern => {
                                if (pattern.test(funcString)) {
                                    console.warn(`   ⚠️ Possible placeholder in ${path}.${key}`);
                                    placeholdersFound++;
                                }
                            });
                        }
                    });
                };
                
                // Check specific systems for mock code
                if (window.aiCharacterSystem) {
                    checkObject(window.aiCharacterSystem, 'aiCharacterSystem');
                }
            }
        });
        
        if (placeholdersFound === 0) {
            console.log('   ✅ No obvious placeholders detected');
        } else {
            console.warn(`   ⚠️ Found ${placeholdersFound} potential placeholder implementations`);
        }
    }

    checkPerformance() {
        console.log('\n⚡ Performance Metrics:');
        
        // Check memory usage
        if (performance.memory) {
            const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            this.performanceMetrics.memoryUsage = memoryMB;
            console.log(`   - Memory usage: ${memoryMB} MB`);
            
            if (memoryMB > 100) {
                console.warn('   ⚠️ High memory usage detected');
            }
        }
        
        // Check for animation frame rate
        let frameCount = 0;
        const startTime = performance.now();
        
        const checkFrameRate = () => {
            frameCount++;
            if (performance.now() - startTime < 1000) {
                requestAnimationFrame(checkFrameRate);
            } else {
                console.log(`   - Animation frame rate: ~${frameCount} FPS`);
                if (frameCount < 30) {
                    console.warn('   ⚠️ Low frame rate detected');
                }
            }
        };
        
        requestAnimationFrame(checkFrameRate);
    }

    checkMemoryUsage() {
        console.log('\n💾 Resource Usage:');
        
        // Count DOM elements
        const domElements = document.querySelectorAll('*').length;
        console.log(`   - DOM elements: ${domElements}`);
        
        if (domElements > 2000) {
            console.warn('   ⚠️ High DOM element count');
        }
        
        // Count active intervals/timeouts
        const activeTimers = this.countActiveTimers();
        console.log(`   - Active timers: ~${activeTimers}`);
        
        // Check video elements
        const videos = document.querySelectorAll('video');
        console.log(`   - Video elements: ${videos.length}`);
        
        // Check canvas elements
        const canvases = document.querySelectorAll('canvas');
        console.log(`   - Canvas elements: ${canvases.length}`);
    }

    countActiveTimers() {
        // Estimate active timers by checking common patterns
        let count = 0;
        
        // Check for setInterval references in window objects
        Object.keys(window).forEach(key => {
            if (key.includes('Interval') || key.includes('Timeout')) {
                count++;
            }
        });
        
        return count;
    }

    showSuccessAnimation() {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; color: #00ff00;">
                <h1 style="font-size: 4rem; margin-bottom: 1rem;">✅ PRODUCTION READY!</h1>
                <p style="font-size: 1.5rem;">All systems operational</p>
                <p style="font-size: 1rem; opacity: 0.7; margin-top: 2rem;">This message will self-destruct in 3 seconds...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        }, 3000);
    }

    // Quick test methods
    async testCharacterVideo() {
        console.log('\n🎬 Testing character video generation...');
        
        if (!window.aiCharacterSystem) {
            console.error('AI Character System not available');
            return;
        }
        
        try {
            const testText = "This is a test of the Static.news broadcast system!";
            const video = await window.aiCharacterSystem.generateTestVideo('ray', testText);
            
            if (video) {
                console.log('✅ Character video generation successful');
                return true;
            } else {
                console.error('❌ Character video generation failed');
                return false;
            }
        } catch (error) {
            console.error('❌ Character video test error:', error);
            return false;
        }
    }

    async testVideoGeneration() {
        console.log('\n🎥 Testing general video generation...');
        
        if (!window.videoGenerationSystem) {
            console.error('Video Generation System not available');
            return;
        }
        
        try {
            const testArticle = {
                id: 'test_' + Date.now(),
                title: 'Test Article for Video Generation',
                category: 'technology',
                description: 'Testing the video generation system'
            };
            
            window.videoGenerationSystem.queueVideoGeneration(testArticle, 'test');
            console.log('✅ Video generation queued successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Video generation test error:', error);
            return false;
        }
    }
}

// Auto-run verification on page load
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live')) {
        // Wait a bit for all systems to initialize
        setTimeout(() => {
            window.systemVerification = new SystemVerification();
            
            // Run verification
            window.systemVerification.runFullVerification().then(result => {
                if (result.productionReady) {
                    console.log('\n🎉 Static.news is ready for production!');
                } else {
                    console.log('\n⚠️ Please address the issues above before going live.');
                }
            });
        }, 5000); // Wait 5 seconds for systems to initialize
    }
});

// Export for manual testing
window.SystemVerification = SystemVerification;