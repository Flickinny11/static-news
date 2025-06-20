// Highlights page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const tabButtons = document.querySelectorAll('.tab-btn');
    const highlightCards = document.querySelectorAll('.highlight-card');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter highlights
            const category = this.getAttribute('data-category');
            
            highlightCards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease-out';
                } else {
                    if (card.getAttribute('data-category') === category) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.6s ease-out';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Video placeholders - simulate play
    const videoPlaceholders = document.querySelectorAll('.video-placeholder, .highlight-card');
    
    videoPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function(e) {
            if (e.target.closest('.highlight-card')) {
                // For highlight cards, show a modal or navigate
                showVideoModal(this);
            } else {
                // For featured video
                playFeaturedVideo(this);
            }
        });
    });
    
    function playFeaturedVideo(element) {
        const playButton = element.querySelector('.play-button');
        if (playButton) {
            playButton.style.display = 'none';
            
            // Simulate loading
            const loader = document.createElement('div');
            loader.className = 'video-loader';
            loader.innerHTML = 'Loading breakdown...';
            loader.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 1.5rem;
                font-weight: 600;
            `;
            element.appendChild(loader);
            
            // In production, this would actually play the video
            setTimeout(() => {
                loader.innerHTML = 'Playing...';
            }, 1000);
        }
    }
    
    function showVideoModal(card) {
        const title = card.querySelector('h3').textContent;
        const category = card.querySelector('.category-tag').textContent;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-category">${category}</span>
                    <button class="modal-close">&times;</button>
                </div>
                <h2>${title}</h2>
                <div class="modal-video">
                    <div class="video-placeholder-modal">
                        <div class="play-button">▶</div>
                        <div class="video-message">Click to play breakdown</div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="action-btn">Share Breakdown</button>
                    <button class="action-btn">Download Therapy Receipt</button>
                </div>
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: #1a1a1a;
            padding: 40px;
            border-radius: 20px;
            max-width: 800px;
            width: 90%;
            animation: slideInUp 0.3s ease-out;
        `;
        
        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => modal.remove(), 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        document.body.appendChild(modal);
    }
    
    // Add necessary animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-category {
            background: #cc0000;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 700;
            text-transform: uppercase;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .modal-content h2 {
            color: white;
            font-size: 2rem;
            margin-bottom: 30px;
        }
        
        .modal-video {
            margin-bottom: 30px;
        }
        
        .video-placeholder-modal {
            aspect-ratio: 16/9;
            background: #333;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .video-placeholder-modal:hover {
            background: #404040;
        }
        
        .video-placeholder-modal .play-button {
            width: 80px;
            height: 80px;
            background: #cc0000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            margin-bottom: 20px;
        }
        
        .video-message {
            color: #999;
            font-size: 1.125rem;
        }
        
        .modal-actions {
            display: flex;
            gap: 20px;
        }
        
        .action-btn {
            flex: 1;
            padding: 15px 30px;
            background: #cc0000;
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .action-btn:hover {
            background: #b30000;
        }
    `;
    document.head.appendChild(style);
    
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5
    };
    
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-number');
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
});