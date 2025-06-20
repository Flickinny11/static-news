// Script to create placeholder images for development
// These will be replaced with actual AI-generated images

const placeholders = {
    // Anchor headshots
    'anchors/ray-mcpatriot.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMWExYSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjE4MCIgcj0iODAiIGZpbGw9IiNjYzAwMDAiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SYXkgTWNQYXRyaW90PC90ZXh0Pgo8L3N2Zz4=',
    
    'anchors/berkeley-justice.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMWExYSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjE4MCIgcj0iODAiIGZpbGw9IiMwMDY2Y2MiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CZXJrZWxleSBKdXN0aWNlPC90ZXh0Pgo8L3N2Zz4=',
    
    'anchors/switz-middleton.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMWExYSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjE4MCIgcj0iODAiIGZpbGw9IiM2NjY2NjYiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Td2l0eiBNaWRkbGV0b248L3RleHQ+Cjwvc3ZnPg==',
    
    // Full body shots
    'anchors/ray-full.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzFhMWExYSIvPgogIDxyZWN0IHg9IjE1MCIgeT0iMzAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjIwMCIgcj0iMTAwIiBmaWxsPSIjY2MwMDAwIi8+CiAgPHRleHQgeD0iMzAwIiB5PSI3NTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmF5IE1jUGF0cmlvdDwvdGV4dD4KPC9zdmc+',
    
    'anchors/bee-full.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzFhMWExYSIvPgogIDxyZWN0IHg9IjE1MCIgeT0iMzAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjIwMCIgcj0iMTAwIiBmaWxsPSIjMDA2NmNjIi8+CiAgPHRleHQgeD0iMzAwIiB5PSI3NTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QmVya2VsZXkgSnVzdGljZTwvdGV4dD4KPC9zdmc+',
    
    'anchors/switz-full.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzFhMWExYSIvPgogIDxyZWN0IHg9IjE1MCIgeT0iMzAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjIwMCIgcj0iMTAwIiBmaWxsPSIjNjY2NjY2Ii8+CiAgPHRleHQgeD0iMzAwIiB5PSI3NTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3dpdHogTWlkZGxldG9uPC90ZXh0Pgo8L3N2Zz4=',
    
    // Thumbnails
    'anchors/ray-thumb.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjMDAwMCIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SPC90ZXh0Pgo8L3N2Zz4=',
    
    'anchors/bee-thumb.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNjZjYyIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CPC90ZXh0Pgo8L3N2Zz4=',
    
    'anchors/switz-thumb.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TPC90ZXh0Pgo8L3N2Zz4=',
    
    // Story images
    'stories/ray-nuclear.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzJhMDAwMCIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5VQ1VMQVIgTUVMVERPV048L3RleHQ+Cjwvc3ZnPg==',
    
    'stories/bee-yale-jail.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzAwMWE0MCIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPllBTEU/IEpBSUw/PC90ZXh0Pgo8L3N2Zz4=',
    
    'stories/switz-gravy.jpg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzRhMmYwMCIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkdSQVZZIEdSQVZZIEdSQVZZPC90ZXh0Pgo8L3N2Zz4=',
    
    // Sponsor logos
    'sponsors/technova.svg': '<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#1976D2"/><text x="100" y="45" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle">TechNova</text></svg>',
    
    'sponsors/grainly.svg': '<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#8B4513"/><text x="100" y="45" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle">Grainly</text></svg>',
    
    // App store badges
    'app-store.svg': '<svg width="140" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="40" rx="5" fill="#000"/><text x="70" y="25" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle">App Store</text></svg>',
    
    'google-play.svg': '<svg width="140" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="140" height="40" rx="5" fill="#000"/><text x="70" y="25" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle">Google Play</text></svg>'
};

// Export for use in build process
if (typeof module !== 'undefined' && module.exports) {
    module.exports = placeholders;
}