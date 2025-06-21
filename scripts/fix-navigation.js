// Fix navigation links for GitHub Pages deployment
function fixNavigationLinks() {
    // Get the base URL for GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/static-news' : '';
    
    // Fix all navigation links
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
            // Convert absolute paths to relative
            const relativePath = href.substring(1);
            link.setAttribute('href', relativePath);
        }
    });
    
    // Fix logo link specifically
    const logoLink = document.querySelector('.nav-logo');
    if (logoLink) {
        logoLink.setAttribute('href', 'index.html');
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', fixNavigationLinks);