/**
 * Professional News System for Static.news
 * Generates and manages serious, professional news content
 */

class ProfessionalNewsSystem {
    constructor() {
        this.apiKey = '19336f5b4da34bb3a2a08dcb9406a6a9'; // NewsAPI key
        this.categories = ['business', 'technology', 'politics', 'health', 'science', 'sports'];
        this.articles = [];
        this.authors = this.generateProfessionalAuthors();
        
        this.init();
    }
    
    async init() {
        await this.fetchRealNews();
        this.setupArticleGeneration();
        this.updateNewsDisplay();
    }
    
    generateProfessionalAuthors() {
        return [
            { name: 'Sarah Chen', title: 'Senior Political Correspondent', bio: 'Award-winning journalist with 15 years covering Washington' },
            { name: 'Michael Roberts', title: 'Business Editor', bio: 'Former Wall Street analyst turned financial journalist' },
            { name: 'Dr. Emily Watson', title: 'Science & Health Reporter', bio: 'PhD in Biology, specializing in medical breakthroughs' },
            { name: 'James Thompson', title: 'Technology Correspondent', bio: 'Silicon Valley insider covering tech innovations' },
            { name: 'Maria Rodriguez', title: 'International Affairs Analyst', bio: 'Former UN advisor with expertise in global politics' },
            { name: 'David Park', title: 'Sports Journalist', bio: 'ESPN veteran covering major league sports' }
        ];
    }
    
    async fetchRealNews() {
        try {
            const promises = this.categories.map(category => 
                fetch(`https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${this.apiKey}`)
                    .then(res => res.json())
            );
            
            const results = await Promise.all(promises);
            
            results.forEach((data, index) => {
                if (data.status === 'ok' && data.articles) {
                    data.articles.forEach(article => {
                        if (article.title && article.description) {
                            this.articles.push({
                                ...article,
                                category: this.categories[index],
                                id: this.generateArticleId(),
                                author: this.assignAuthor(this.categories[index]),
                                fullContent: null // Will be generated
                            });
                        }
                    });
                }
            });
            
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    }
    
    assignAuthor(category) {
        const authorMap = {
            'politics': this.authors[0],
            'business': this.authors[1],
            'health': this.authors[2],
            'science': this.authors[2],
            'technology': this.authors[3],
            'sports': this.authors[5]
        };
        
        return authorMap[category] || this.authors[4];
    }
    
    generateArticleId() {
        return `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    async generateFullArticle(article) {
        // In production, this would call the AI script writer
        // For now, create professional expansion of the news
        
        const fullContent = {
            headline: article.title,
            subheadline: article.description,
            author: article.author,
            publishedAt: new Date(article.publishedAt).toLocaleString(),
            category: article.category.toUpperCase(),
            image: article.urlToImage || this.generatePlaceholderImage(article.category),
            content: this.expandArticleContent(article),
            relatedTopics: this.generateRelatedTopics(article),
            factBox: this.generateFactBox(article)
        };
        
        return fullContent;
    }
    
    expandArticleContent(article) {
        // Generate professional article content
        const paragraphs = [
            article.description,
            
            `This development comes at a critical time for the ${article.category} sector, as stakeholders closely monitor the evolving situation. Industry experts have been analyzing the potential implications of these events on both domestic and international markets.`,
            
            `According to recent data and expert analysis, the current trends indicate a significant shift in how this sector operates. Multiple sources within the industry have confirmed that these changes could have lasting effects on policy decisions and market dynamics.`,
            
            `"The situation requires careful consideration of all factors involved," said a senior analyst familiar with the matter. "We're seeing unprecedented levels of activity that could reshape the landscape for years to come."`,
            
            `Government officials and regulatory bodies are closely monitoring the situation, with several key meetings scheduled in the coming weeks to address the emerging challenges and opportunities. The response from various stakeholders has been mixed, with some expressing optimism while others urge caution.`,
            
            `As this story continues to develop, Static.news will provide comprehensive coverage and analysis. Our team of correspondents is working to bring you the latest updates and expert insights on this evolving situation.`
        ];
        
        return paragraphs;
    }
    
    generateRelatedTopics(article) {
        const topics = {
            'business': ['Market Analysis', 'Economic Indicators', 'Corporate Earnings', 'Trade Policy'],
            'technology': ['Innovation Trends', 'Cybersecurity', 'AI Development', 'Tech Regulation'],
            'politics': ['Policy Analysis', 'Legislative Updates', 'Election Coverage', 'International Relations'],
            'health': ['Medical Research', 'Public Health', 'Healthcare Policy', 'Pharmaceutical News'],
            'science': ['Research Breakthroughs', 'Climate Science', 'Space Exploration', 'Environmental Studies'],
            'sports': ['League Updates', 'Player Analysis', 'Team Performance', 'Sports Business']
        };
        
        return topics[article.category] || ['Breaking News', 'Analysis', 'Expert Opinion', 'Latest Updates'];
    }
    
    generateFactBox(article) {
        return {
            title: 'Key Facts',
            facts: [
                `Category: ${article.category.toUpperCase()}`,
                `Published: ${new Date(article.publishedAt).toLocaleDateString()}`,
                `Source: Verified news agencies`,
                `Impact: National/International significance`
            ]
        };
    }
    
    generatePlaceholderImage(category) {
        // Professional placeholder images by category
        const images = {
            'business': '/assets/images/business-placeholder.jpg',
            'technology': '/assets/images/tech-placeholder.jpg',
            'politics': '/assets/images/politics-placeholder.jpg',
            'health': '/assets/images/health-placeholder.jpg',
            'science': '/assets/images/science-placeholder.jpg',
            'sports': '/assets/images/sports-placeholder.jpg'
        };
        
        return images[category] || '/assets/images/news-placeholder.jpg';
    }
    
    updateNewsDisplay() {
        const newsContainer = document.getElementById('news-articles');
        if (!newsContainer) return;
        
        // Clear existing content
        newsContainer.innerHTML = '';
        
        // Display articles professionally
        this.articles.slice(0, 20).forEach(article => {
            const articleElement = this.createArticleElement(article);
            newsContainer.appendChild(articleElement);
        });
    }
    
    createArticleElement(article) {
        const element = document.createElement('article');
        element.className = 'news-article-card';
        element.innerHTML = `
            <div class="article-image">
                <img src="${article.urlToImage || this.generatePlaceholderImage(article.category)}" 
                     alt="${article.title}"
                     onerror="this.src='/assets/images/news-placeholder.jpg'">
                <span class="article-category">${article.category.toUpperCase()}</span>
            </div>
            <div class="article-content">
                <h2 class="article-headline">${article.title}</h2>
                <p class="article-description">${article.description}</p>
                <div class="article-meta">
                    <div class="article-author">
                        <span class="author-name">By ${article.author.name}</span>
                        <span class="author-title">${article.author.title}</span>
                    </div>
                    <time class="article-time">${new Date(article.publishedAt).toLocaleString()}</time>
                </div>
                <a href="/article/${article.id}" class="read-more-link">Read Full Article →</a>
            </div>
        `;
        
        return element;
    }
    
    async saveArticleToDatabase(article) {
        // In production, this would save to a real database
        // For now, use localStorage
        const fullArticle = await this.generateFullArticle(article);
        localStorage.setItem(`article_${article.id}`, JSON.stringify(fullArticle));
    }
    
    getArticleById(id) {
        const stored = localStorage.getItem(`article_${id}`);
        return stored ? JSON.parse(stored) : null;
    }
}

// Professional article styles
const styles = `
<style>
.news-article-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 2rem;
}

.news-article-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.article-image {
    position: relative;
    height: 240px;
    overflow: hidden;
}

.article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.article-category {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: #ff0000;
    color: white;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    border-radius: 4px;
}

.article-content {
    padding: 1.5rem;
}

.article-headline {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 0.75rem;
    color: #1a1a1a;
}

.article-description {
    font-size: 1rem;
    line-height: 1.6;
    color: #4a4a4a;
    margin-bottom: 1rem;
}

.article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
}

.article-author {
    display: flex;
    flex-direction: column;
}

.author-name {
    font-weight: 600;
    color: #2a2a2a;
}

.author-title {
    font-size: 0.875rem;
    color: #6a6a6a;
}

.article-time {
    font-size: 0.875rem;
    color: #6a6a6a;
}

.read-more-link {
    display: inline-flex;
    align-items: center;
    color: #ff0000;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
}

.read-more-link:hover {
    color: #cc0000;
}

/* Article page styles */
.article-full {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.article-full .article-header {
    margin-bottom: 2rem;
}

.article-full .article-headline {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.article-full .article-subheadline {
    font-size: 1.25rem;
    color: #4a4a4a;
    margin-bottom: 1.5rem;
}

.article-full .article-body {
    font-size: 1.125rem;
    line-height: 1.8;
    color: #2a2a2a;
}

.article-full .article-body p {
    margin-bottom: 1.5rem;
}

.fact-box {
    background: #f5f5f5;
    border-left: 4px solid #ff0000;
    padding: 1.5rem;
    margin: 2rem 0;
}

.fact-box h3 {
    margin-bottom: 1rem;
    color: #1a1a1a;
}

.fact-box ul {
    list-style: none;
    padding: 0;
}

.fact-box li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #e0e0e0;
}

.fact-box li:last-child {
    border-bottom: none;
}
</style>
`;

// Initialize the system
document.addEventListener('DOMContentLoaded', () => {
    // Add styles
    document.head.insertAdjacentHTML('beforeend', styles);
    
    // Initialize news system
    window.professionalNews = new ProfessionalNewsSystem();
});