// Incidents page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const incidentItems = document.querySelectorAll('.incident-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter incidents
            const filter = this.getAttribute('data-filter');
            
            incidentItems.forEach(item => {
                if (filter === 'all') {
                    item.style.display = 'flex';
                    item.style.animation = 'fadeInLeft 0.6s ease-out forwards';
                } else {
                    if (item.getAttribute('data-severity') === filter) {
                        item.style.display = 'flex';
                        item.style.animation = 'fadeInLeft 0.6s ease-out forwards';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more incidents
            this.textContent = 'Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                // In production, this would fetch more incidents from the backend
                console.log('Loading more incidents...');
                this.textContent = 'Load More Incidents';
                this.disabled = false;
                
                // Show a notification
                showNotification('More incidents loaded');
            }, 1000);
        });
    }
    
    // Update live stats
    function updateStats() {
        const todayElement = document.getElementById('todayIncidents');
        const weekElement = document.getElementById('weekIncidents');
        const allTimeElement = document.getElementById('allTimeIncidents');
        
        if (todayElement) {
            // Simulate incrementing incidents
            const currentToday = parseInt(todayElement.textContent);
            if (Math.random() > 0.7) {
                todayElement.textContent = currentToday + 1;
                animateNumber(todayElement);
            }
        }
        
        if (weekElement) {
            const currentWeek = parseInt(weekElement.textContent);
            if (Math.random() > 0.8) {
                weekElement.textContent = currentWeek + 1;
                animateNumber(weekElement);
            }
        }
        
        if (allTimeElement) {
            const currentAllTime = parseInt(allTimeElement.textContent);
            if (Math.random() > 0.9) {
                allTimeElement.textContent = currentAllTime + 1;
                animateNumber(allTimeElement);
            }
        }
    }
    
    // Animate number changes
    function animateNumber(element) {
        element.style.transform = 'scale(1.2)';
        element.style.color = '#ff6b6b';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'incident-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: #cc0000;
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
    
    // Add keyframe animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Update stats periodically
    setInterval(updateStats, 5000);
    
    // WebSocket integration for real-time incidents
    if (window.CONFIG && !window.CONFIG.DEMO_MODE) {
        const ws = new WebSocket(`${CONFIG.WS_URL}/ws`);
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'incident') {
                // Add new incident to the timeline
                console.log('New incident:', data);
                showNotification(`New ${data.severity} incident!`);
            }
        };
        
        ws.onerror = function(error) {
            console.log('WebSocket error:', error);
        };
    }
});