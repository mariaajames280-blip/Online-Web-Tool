// Keyword Density Checker
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const clearInput = document.getElementById('clearInput');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    
    // Options
    const ignoreCommon = document.getElementById('ignoreCommon');
    const caseSensitive = document.getElementById('caseSensitive');
    const showPhrases = document.getElementById('showPhrases');
    
    // Filters
    const minFrequency = document.getElementById('minFrequency');
    const sortBy = document.getElementById('sortBy');
    
    // Results elements
    const totalWords = document.getElementById('totalWords');
    const uniqueWords = document.getElementById('uniqueWords');
    const keywordCount = document.getElementById('keywordCount');
    const avgDensity = document.getElementById('avgDensity');
    const keywordsTableBody = document.getElementById('keywordsTableBody');
    const recommendationsList = document.getElementById('recommendationsList');

    // Common words to ignore (stop words)
    const commonWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
        'with', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 
        'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 
        'must', 'can', 'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these', 
        'those', 'i', 'you', 'he', 'she', 'we', 'me', 'him', 'her', 'us', 'my', 'your', 
        'his', 'our', 'mine', 'yours', 'hers', 'ours'
    ]);

    // Sample text for demo
    const sampleText = `Search engine optimization is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. Unpaid traffic may originate from different kinds of searches, including image search, video search, academic search, news search, and industry-specific vertical search engines.

SEO is a fundamental part of digital marketing because people conduct trillions of searches every year, often with commercial intent to find information about products and services. Search engines often change their algorithms, and SEO keeps up with those changes. A successful SEO strategy requires understanding what people are searching for, the words they use, and the type of content they wish to consume.`;

    // Initialize
    updateCounters();

    // Update counters in real-time
    textInput.addEventListener('input', function() {
        updateCounters();
    });

    // Analyze button
    analyzeBtn.addEventListener('click', function() {
        analyzeKeywords();
        showNotification('Keyword analysis completed!');
    });

    // Load sample text
    sampleBtn.addEventListener('click', function() {
        textInput.value = sampleText;
        updateCounters();
        analyzeKeywords();
        showNotification('Sample text loaded and analyzed!');
    });

    // Clear input
    clearInput.addEventListener('click', function() {
        textInput.value = '';
        updateCounters();
        clearResults();
        showNotification('Cleared!');
    });

    // Re-analyze when filters change
    [minFrequency, sortBy, ignoreCommon, caseSensitive, showPhrases].forEach(element => {
        element.addEventListener('change', function() {
            if (textInput.value.trim()) {
                analyzeKeywords();
            }
        });
    });

    function updateCounters() {
        const text = textInput.value;
        const words = text.trim() ? text.trim().split(/\s+/) : [];
        const characters = text.length;
        
        wordCount.textContent = words.length + ' word' + (words.length !== 1 ? 's' : '');
        charCount.textContent = characters + ' character' + (characters !== 1 ? 's' : '');
    }

    function analyzeKeywords() {
        const text = textInput.value.trim();
        
        if (!text) {
            showNotification('Please enter some text to analyze!');
            return;
        }

        // Show loading state
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;

        // Process in small delay to show loading
        setTimeout(() => {
            const analysis = performKeywordAnalysis(text);
            displayResults(analysis);
            
            // Reset button
            analyzeBtn.innerHTML = '<i class="fas fa-chart-pie"></i> Analyze Keywords';
            analyzeBtn.disabled = false;
        }, 500);
    }

    function performKeywordAnalysis(text) {
        // Clean and prepare text
        let processedText = text.toLowerCase();
        if (caseSensitive.checked) {
            processedText = text; // Keep original case
        }
        
        // Remove punctuation and split into words
        const words = processedText
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);

        const totalWordCount = words.length;
        
        // Count word frequencies
        const wordFreq = {};
        words.forEach(word => {
            const key = caseSensitive.checked ? word : word.toLowerCase();
            wordFreq[key] = (wordFreq[key] || 0) + 1;
        });

        // Filter out common words if enabled
        let keywords = { ...wordFreq };
        if (ignoreCommon.checked) {
            Object.keys(keywords).forEach(word => {
                const lowerWord = word.toLowerCase();
                if (commonWords.has(lowerWord)) {
                    delete keywords[word];
                }
            });
        }

        // Add 2-word phrases if enabled
        if (showPhrases.checked && words.length > 1) {
            for (let i = 0; i < words.length - 1; i++) {
                const phrase = words[i] + ' ' + words[i + 1];
                // Only add meaningful phrases (both words not common)
                const word1 = words[i].toLowerCase();
                const word2 = words[i + 1].toLowerCase();
                if (!commonWords.has(word1) && !commonWords.has(word2)) {
                    keywords[phrase] = (keywords[phrase] || 0) + 1;
                }
            }
        }

        // Calculate density and prepare results
        const results = Object.entries(keywords).map(([keyword, frequency]) => {
            const density = (frequency / totalWordCount) * 100;
            const seoScore = calculateSEOScore(frequency, density, keyword);
            return { keyword, frequency, density, seoScore };
        });

        // Filter by minimum frequency
        const minFreq = parseInt(minFrequency.value) || 1;
        const filteredResults = results.filter(item => item.frequency >= minFreq);

        // Sort results
        const sortMethod = sortBy.value;
        filteredResults.sort((a, b) => {
            switch (sortMethod) {
                case 'frequency':
                    return b.frequency - a.frequency;
                case 'density':
                    return b.density - a.density;
                case 'alphabetical':
                    return a.keyword.localeCompare(b.keyword);
                default:
                    return b.frequency - a.frequency;
            }
        });

        return {
            totalWords: totalWordCount,
            uniqueWords: Object.keys(wordFreq).length,
            keywords: filteredResults,
            allKeywords: results
        };
    }

    function calculateSEOScore(frequency, density, keyword) {
        let score = 0;
        
        // Frequency score (max 50 points)
        score += Math.min(frequency * 5, 50);
        
        // Density score (max 30 points)
        if (density >= 0.5 && density <= 2.5) {
            score += 30; // Ideal density range
        } else if (density > 2.5 && density <= 5) {
            score += 20; // Acceptable but high
        } else if (density > 0.1 && density < 0.5) {
            score += 15; // Acceptable but low
        } else {
            score += 5; // Poor density
        }
        
        // Keyword length score (max 20 points)
        const wordCount = keyword.split(' ').length;
        if (wordCount === 1) {
            score += 10; // Single word
        } else if (wordCount === 2) {
            score += 20; // Ideal long-tail keyword
        } else {
            score += 15; // Long phrase
        }
        
        return Math.min(score, 100);
    }

    function displayResults(analysis) {
        // Update statistics
        totalWords.textContent = analysis.totalWords.toLocaleString();
        uniqueWords.textContent = analysis.uniqueWords.toLocaleString();
        keywordCount.textContent = analysis.keywords.length.toLocaleString();
        
        // Calculate average density
        const avgDensityValue = analysis.keywords.length > 0 
            ? analysis.keywords.reduce((sum, item) => sum + item.density, 0) / analysis.keywords.length 
            : 0;
        avgDensity.textContent = avgDensityValue.toFixed(2) + '%';

        // Update keywords table
        if (analysis.keywords.length === 0) {
            keywordsTableBody.innerHTML = '<tr><td colspan="4" class="no-data">No keywords found matching your criteria</td></tr>';
        } else {
            keywordsTableBody.innerHTML = analysis.keywords
                .map(item => `
                    <tr>
                        <td class="keyword-cell">${escapeHtml(item.keyword)}</td>
                        <td class="frequency-cell">${item.frequency}</td>
                        <td class="density-cell">${item.density.toFixed(2)}%</td>
                        <td class="score-cell">
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${item.seoScore}%"></div>
                                <span class="score-text">${Math.round(item.seoScore)}</span>
                            </div>
                        </td>
                    </tr>
                `)
                .join('');
        }

        // Update recommendations
        updateRecommendations(analysis);
    }

    function updateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.totalWords < 300) {
            recommendations.push('Consider writing longer content (300+ words for better SEO)');
        }
        
        if (analysis.totalWords > 2000) {
            recommendations.push('Your content is quite long. Consider breaking it into multiple pages or adding subheadings.');
        }
        
        // Check for keyword stuffing
        const highDensityKeywords = analysis.allKeywords.filter(k => k.density > 5);
        if (highDensityKeywords.length > 0) {
            recommendations.push('Some keywords have high density (>5%). Consider reducing repetition to avoid keyword stuffing.');
        }
        
        // Check for optimal keywords
        const optimalKeywords = analysis.allKeywords.filter(k => k.density >= 0.5 && k.density <= 2.5);
        if (optimalKeywords.length === 0) {
            recommendations.push('No keywords found in the optimal density range (0.5%-2.5%). Consider optimizing your keyword usage.');
        }
        
        // Check for long-tail keywords
        const longTailKeywords = analysis.allKeywords.filter(k => k.keyword.split(' ').length >= 2);
        if (longTailKeywords.length < 3) {
            recommendations.push('Add more long-tail keywords (2+ word phrases) for better targeting.');
        }

        if (recommendations.length === 0) {
            recommendationsList.innerHTML = '<p class="success-message">🎉 Great! Your content appears well-optimized for SEO.</p>';
        } else {
            recommendationsList.innerHTML = recommendations
                .map(rec => `<div class="recommendation-item"><i class="fas fa-exclamation-circle"></i> ${rec}</div>`)
                .join('');
        }
    }

    function clearResults() {
        totalWords.textContent = '0';
        uniqueWords.textContent = '0';
        keywordCount.textContent = '0';
        avgDensity.textContent = '0%';
        keywordsTableBody.innerHTML = '<tr><td colspan="4" class="no-data">Enter text and click "Analyze Keywords" to see results</td></tr>';
        recommendationsList.innerHTML = '<p class="no-recommendations">Analysis results will appear here</p>';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffd700;
            color: #000000;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            border: 2px solid #000000;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
});
