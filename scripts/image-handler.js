// Handle missing images with professional placeholders

document.addEventListener('DOMContentLoaded', function() {
    // Define placeholder images
    const placeholders = {
        'ray-mcpatriot': 'data:image/svg+xml,%3Csvg width="400" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="400" fill="%231a1a1a"/%3E%3Ccircle cx="200" cy="180" r="80" fill="%23cc0000"/%3E%3Ctext x="200" y="300" font-family="Arial Black" font-size="24" fill="%23fff" text-anchor="middle"%3ERay McPatriot%3C/text%3E%3C/svg%3E',
        
        'berkeley-justice': 'data:image/svg+xml,%3Csvg width="400" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="400" fill="%231a1a1a"/%3E%3Ccircle cx="200" cy="180" r="80" fill="%230066cc"/%3E%3Ctext x="200" y="300" font-family="Arial Black" font-size="24" fill="%23fff" text-anchor="middle"%3EBerkeley Justice%3C/text%3E%3C/svg%3E',
        
        'switz-middleton': 'data:image/svg+xml,%3Csvg width="400" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="400" fill="%231a1a1a"/%3E%3Ccircle cx="200" cy="180" r="80" fill="%23666666"/%3E%3Ctext x="200" y="300" font-family="Arial Black" font-size="24" fill="%23fff" text-anchor="middle"%3ESwitz Middleton%3C/text%3E%3C/svg%3E',
        
        'ray-full': 'data:image/svg+xml,%3Csvg width="600" height="800" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="800" fill="%231a1a1a"/%3E%3Crect x="150" y="300" width="300" height="400" fill="%23333"/%3E%3Ccircle cx="300" cy="200" r="100" fill="%23cc0000"/%3E%3Ctext x="300" y="750" font-family="Arial Black" font-size="32" fill="%23fff" text-anchor="middle"%3ERay McPatriot%3C/text%3E%3C/svg%3E',
        
        'bee-full': 'data:image/svg+xml,%3Csvg width="600" height="800" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="800" fill="%231a1a1a"/%3E%3Crect x="150" y="300" width="300" height="400" fill="%23333"/%3E%3Ccircle cx="300" cy="200" r="100" fill="%230066cc"/%3E%3Ctext x="300" y="750" font-family="Arial Black" font-size="32" fill="%23fff" text-anchor="middle"%3EBerkeley Justice%3C/text%3E%3C/svg%3E',
        
        'switz-full': 'data:image/svg+xml,%3Csvg width="600" height="800" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="800" fill="%231a1a1a"/%3E%3Crect x="150" y="300" width="300" height="400" fill="%23333"/%3E%3Ccircle cx="300" cy="200" r="100" fill="%23666666"/%3E%3Ctext x="300" y="750" font-family="Arial Black" font-size="32" fill="%23fff" text-anchor="middle"%3ESwitz Middleton%3C/text%3E%3C/svg%3E',
        
        'ray-thumb': 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100" height="100" fill="%23cc0000"/%3E%3Ctext x="50" y="55" font-family="Arial Black" font-size="48" fill="%23fff" text-anchor="middle"%3ER%3C/text%3E%3C/svg%3E',
        
        'bee-thumb': 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100" height="100" fill="%230066cc"/%3E%3Ctext x="50" y="55" font-family="Arial Black" font-size="48" fill="%23fff" text-anchor="middle"%3EB%3C/text%3E%3C/svg%3E',
        
        'switz-thumb': 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100" height="100" fill="%23666666"/%3E%3Ctext x="50" y="55" font-family="Arial Black" font-size="48" fill="%23fff" text-anchor="middle"%3ES%3C/text%3E%3C/svg%3E',
        
        'ray-nuclear': 'data:image/svg+xml,%3Csvg width="800" height="450" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="800" height="450" fill="%232a0000"/%3E%3Ctext x="400" y="225" font-family="Arial Black" font-size="48" fill="%23fff" text-anchor="middle"%3ENUCULAR MELTDOWN%3C/text%3E%3C/svg%3E',
        
        'bee-yale-jail': 'data:image/svg+xml,%3Csvg width="800" height="450" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="800" height="450" fill="%23001a40"/%3E%3Ctext x="400" y="225" font-family="Arial Black" font-size="48" fill="%23fff" text-anchor="middle"%3EYALE? JAIL?%3C/text%3E%3C/svg%3E',
        
        'switz-gravy': 'data:image/svg+xml,%3Csvg width="800" height="450" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="800" height="450" fill="%234a2f00"/%3E%3Ctext x="400" y="225" font-family="Arial Black" font-size="48" fill="%23fff" text-anchor="middle"%3EGRAVY GRAVY GRAVY%3C/text%3E%3C/svg%3E',
        
        'default': 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23333"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle"%3EStatic.news%3C/text%3E%3C/svg%3E'
    };
    
    // Handle all images
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Get the image filename
            const src = img.src;
            const filename = src.split('/').pop().split('.')[0];
            
            // Find matching placeholder
            let placeholder = placeholders.default;
            for (const key in placeholders) {
                if (filename.includes(key)) {
                    placeholder = placeholders[key];
                    break;
                }
            }
            
            // Set placeholder
            img.src = placeholder;
            img.style.backgroundColor = '#1a1a1a';
        });
        
        // Also add loading animation
        img.addEventListener('load', function() {
            img.classList.add('loaded');
        });
    });
    
    // Add smooth image loading
    const style = document.createElement('style');
    style.textContent = `
        img {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        img.loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});