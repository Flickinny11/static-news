// Sponsors page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Form handling
    const sponsorForm = document.getElementById('sponsorForm');
    
    if (sponsorForm) {
        sponsorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(sponsorForm);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission
            const submitBtn = sponsorForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Processing Confusion...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                showSuccessModal(data);
                
                // Reset form
                sponsorForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
    // Success modal
    function showSuccessModal(data) {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon">🎉</div>
                <h2>Welcome to the Confusion!</h2>
                <p>Thank you for your interest in having your brand creatively destroyed, ${data.company}!</p>
                
                <div class="modal-details">
                    <p>Our anchors are already practicing mispronouncing "${data.company}":</p>
                    <ul class="mispronunciation-preview">
                        ${generateMispronunciations(data.company)}
                    </ul>
                </div>
                
                <p class="modal-footer">We'll contact you within 2-3 business breakdowns at ${data.email}</p>
                
                <button class="modal-close">Can't Wait to Be Confused</button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .success-modal {
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
            }
            
            .modal-content {
                background: white;
                padding: 60px;
                border-radius: 20px;
                max-width: 600px;
                width: 90%;
                text-align: center;
                animation: slideInUp 0.3s ease-out;
            }
            
            .modal-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            
            .modal-content h2 {
                font-size: 2.5rem;
                color: #1a1a1a;
                margin-bottom: 20px;
                font-family: var(--font-display);
            }
            
            .modal-content p {
                color: #666;
                font-size: 1.125rem;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            
            .modal-details {
                background: #f5f5f5;
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 30px;
            }
            
            .mispronunciation-preview {
                list-style: none;
                margin-top: 20px;
            }
            
            .mispronunciation-preview li {
                padding: 10px;
                color: #cc0000;
                font-weight: 600;
                font-size: 1.25rem;
            }
            
            .modal-footer {
                font-size: 0.9375rem !important;
                color: #999 !important;
            }
            
            .modal-close {
                background: linear-gradient(135deg, #cc0000, #ff3838);
                color: white;
                border: none;
                padding: 20px 40px;
                border-radius: 10px;
                font-size: 1.125rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(204, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
        
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
    
    // Generate creative mispronunciations
    function generateMispronunciations(companyName) {
        const variations = [];
        
        // Simple variations
        if (companyName.length > 5) {
            variations.push(`<li>"${companyName.slice(0, -2)}oodle"</li>`);
            variations.push(`<li>"${companyName} Delusions"</li>`);
            variations.push(`<li>"${companyName.charAt(0)}${companyName.slice(1).toLowerCase().replace(/[aeiou]/g, 'a')}"</li>`);
        } else {
            variations.push(`<li>"${companyName}ly ${companyName}s"</li>`);
            variations.push(`<li>"The ${companyName} Thing"</li>`);
            variations.push(`<li>"${companyName}-ish Stuff"</li>`);
        }
        
        return variations.join('');
    }
    
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number, .story-metric');
    const observerOptions = {
        threshold: 0.5
    };
    
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    entry.target.style.transform = 'scale(1)';
                }, 300);
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // Tier card hover effects
    const tierCards = document.querySelectorAll('.tier-card');
    
    tierCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});