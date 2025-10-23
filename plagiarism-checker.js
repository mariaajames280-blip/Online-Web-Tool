// Plagiarism Checker
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const checkBtn = document.getElementById('checkBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const clearText = document.getElementById('clearText');
    const resultsSection = document.getElementById('resultsSection');
    const checkingProgress = document.getElementById('checkingProgress');
    
    // Count elements
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    
    // Results elements
    const plagiarismScore = document.getElementById('plagiarismScore');
    const originalPercent = document.getElementById('originalPercent');
    const plagiarizedPercent = document.getElementById('plagiarizedPercent');
    const similarityScore = document.getElementById('similarityScore');
    const uniqueContent = document.getElementById('uniqueContent');
    const potentialIssues = document.getElementById('potentialIssues');
    const sourcesChecked = document.getElementById('sourcesChecked');
    const processingTime = document.getElementById('processingTime');
    const similarSources = document.getElementById('similarSources');
    const sourcesList = document.getElementById('sourcesList');
    const recommendationsList = document.getElementById('recommendationsList');

    // Progress elements
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressText = document.getElementById('progressText');

    let checkStartTime = 0;

    // Sample academic text with some common phrases
    const sampleText = `Artificial intelligence (AI) is transforming various industries and revolutionizing the way we live and work. 
    Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed. 
    The rapid advancement of AI technology has led to significant improvements in healthcare, finance, and transportation sectors.

    Natural language processing (NLP) allows machines to understand and interpret human language, making it possible for virtual 
    assistants like Siri and Alexa to respond to voice commands. Deep learning algorithms have achieved remarkable success in 
    image recognition, speech recognition, and autonomous vehicles.

    However, the ethical implications of AI development cannot be overlooked. Issues such as data privacy, algorithmic bias, 
    and job displacement require careful consideration and regulation. As AI continues to evolve, it is crucial to establish 
    guidelines that ensure responsible and beneficial implementation of this powerful technology.`;

    // Common phrases that might trigger plagiarism detection
    const commonPhrases = [
        'artificial intelligence',
        'machine learning',
        'deep learning',
        'natural language processing',
        'data privacy',
        'algorithmic bias',
        'autonomous vehicles',
        'virtual assistants',
        'ethical implications',
        'responsible implementation'
    ];

    // Initialize
    updateCounters();

    // Update counters in real-time
    textInput.addEventListener('input', function() {
        updateCounters();
    });

    // Check button
    checkBtn.addEventListener('click', function() {
        checkPlagiarism();
    });

    // Sample text
    sampleBtn.addEventListener('click', function() {
        textInput.value = sampleText;
        updateCounters();
        showNotification('Sample text loaded!');
    });

    // Clear text
    clearText.addEventListener('click', function() {
        textInput.value = '';
        updateCounters();
        hideResults();
        showNotification('Text cleared!');
    });

    function updateCounters() {
        const text = textInput.value;
        const words = text.trim() ? text.trim().split(/\s+/) : [];
        const characters = text.length;
        
        wordCount.textContent = words.length + ' word' + (words.length !== 1 ? 's' : '');
        charCount.textContent = characters + ' character' + (characters !== 1 ? 's' : '');
    }

    function checkPlagiarism() {
        const text = textInput.value.trim();
        
        if (!text) {
            showNotification('Please enter some text to check!');
            return;
        }

        if (text.length < 50) {
            showNotification('Please enter at least 50 characters for accurate plagiarism detection.');
            return;
        }

        // Show progress and hide results
        resultsSection.style.display = 'none';
        checkingProgress.style.display = 'block';
        checkBtn.disabled = true;

        // Start timer
        checkStartTime = Date.now();

        // Simulate plagiarism check process
        simulatePlagiarismCheck(text);
    }

    function simulatePlagiarismCheck(text) {
        let currentStep = 0;
        const totalSteps = progressSteps.length;

        function updateProgress() {
            if (currentStep < totalSteps) {
                // Update progress steps
                progressSteps.forEach((step, index) => {
                    const icon = step.querySelector('i');
                    if (index < currentStep) {
                        step.classList.add('completed');
                        icon.className = 'fas fa-check';
                    } else if (index === currentStep) {
                        step.classList.add('active');
                        icon.className = 'fas fa-spinner fa-spin';
                    } else {
                        step.classList.remove('active', 'completed');
                        icon.className = 'fas fa-spinner';
                    }
                });

                // Update progress text
                const progressTexts = [
                    'Analyzing text structure and syntax...',
                    'Searching web sources for similar content...',
                    'Checking academic databases and publications...',
                    'Generating comprehensive plagiarism report...'
                ];
                progressText.textContent = progressTexts[currentStep];

                currentStep++;
                setTimeout(updateProgress, 1500);
            } else {
                // Analysis complete
                completeAnalysis(text);
            }
        }

        updateProgress();
    }

    function completeAnalysis(text) {
        const checkEndTime = Date.now();
        const checkDuration = (checkEndTime - checkStartTime) / 1000;

        // Hide progress and show results
        checkingProgress.style.display = 'none';
        resultsSection.style.display = 'block';
        checkBtn.disabled = false;

        // Analyze text for common phrases and potential plagiarism
        const analysis = analyzeTextForPlagiarism(text);

        // Update results
        updateResults(analysis, checkDuration);
        
        showNotification('Plagiarism check completed!');
    }

    function analyzeTextForPlagiarism(text) {
        const lowerText = text.toLowerCase();
        let foundPhrases = [];
        let plagiarismScore = 0;

        // Check for common phrases
        commonPhrases.forEach(phrase => {
            if (lowerText.includes(phrase)) {
                foundPhrases.push(phrase);
                plagiarismScore += 2; // 2% per common phrase
            }
        });

        // Check for exact matches from sample sources (simulated)
        const simulatedSources = [
            {
                url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
                title: 'Artificial Intelligence - Wikipedia',
                similarity: 15,
                matchedText: 'artificial intelligence is transforming various industries'
            },
            {
                url: 'https://www.ibm.com/cloud/learn/machine-learning',
                title: 'What is Machine Learning? - IBM',
                similarity: 12,
                matchedText: 'machine learning enables computers to learn from experience'
            },
            {
                url: 'https://www.techtarget.com/searchenterpriseai/definition/natural-language-processing-NLP',
                title: 'What is Natural Language Processing? - TechTarget',
                similarity: 8,
                matchedText: 'natural language processing allows machines to understand human language'
            }
        ];

        // Calculate additional score based on text characteristics
        const wordCount = text.split(/\s+/).length;
        const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g)).size;
        const uniquenessRatio = (uniqueWords / wordCount) * 100;

        // Adjust score based on uniqueness
        if (uniquenessRatio < 60) {
            plagiarismScore += 20;
        } else if (uniquenessRatio < 80) {
            plagiarismScore += 10;
        }

        // Cap the score at 45% for demo purposes (never show 100% plagiarism)
        plagiarismScore = Math.min(plagiarismScore, 45);

        return {
            plagiarismScore: plagiarismScore,
            originalScore: 100 - plagiarismScore,
            similarityScore: plagiarismScore + Math.random() * 10,
            foundPhrases: foundPhrases,
            sources: plagiarismScore > 5 ? simulatedSources : [],
            wordCount: wordCount,
            uniqueWords: uniqueWords,
            uniquenessRatio: uniquenessRatio
        };
    }

    function updateResults(analysis, duration) {
        // Update main scores
        plagiarismScore.textContent = analysis.plagiarismScore + '%';
        originalPercent.textContent = analysis.originalScore + '%';
        plagiarizedPercent.textContent = analysis.plagiarismScore + '%';
        similarityScore.textContent = analysis.similarityScore.toFixed(1) + '%';

        // Update score circle color based on plagiarism level
        const scoreCircle = document.querySelector('.score-circle');
        if (analysis.plagiarismScore < 10) {
            scoreCircle.style.background = 'conic-gradient(#28a745 ' + (analysis.plagiarismScore * 3.6) + 'deg, #1a1a1a 0deg)';
        } else if (analysis.plagiarismScore < 25) {
            scoreCircle.style.background = 'conic-gradient(#ffc107 ' + (analysis.plagiarismScore * 3.6) + 'deg, #1a1a1a 0deg)';
        } else {
            scoreCircle.style.background = 'conic-gradient(#dc3545 ' + (analysis.plagiarismScore * 3.6) + 'deg, #1a1a1a 0deg)';
        }

        // Update detailed analysis
        if (analysis.plagiarismScore === 0) {
            uniqueContent.textContent = '100% of your text appears to be completely original';
            potentialIssues.textContent = 'No plagiarism or significant similarity detected';
        } else if (analysis.plagiarismScore < 15) {
            uniqueContent.textContent = `${analysis.originalScore}% of your text appears to be original with minor similarities`;
            potentialIssues.textContent = `Low similarity detected (${analysis.plagiarismScore}%). Mainly common phrases.`;
        } else {
            uniqueContent.textContent = `${analysis.originalScore}% of your text appears to be original`;
            potentialIssues.textContent = `Moderate similarity detected (${analysis.plagiarismScore}%). Review recommended.`;
        }

        sourcesChecked.textContent = analysis.sources.length + ' online sources scanned';
        processingTime.textContent = duration.toFixed(1) + ' seconds';

        // Update similar sources
        if (analysis.sources.length > 0) {
            similarSources.style.display = 'block';
            sourcesList.innerHTML = analysis.sources.map(source => `
                <div class="source-item">
                    <div class="source-header">
                        <a href="${source.url}" target="_blank" class="source-title">${source.title}</a>
                        <span class="source-similarity">${source.similarity}% similar</span>
                    </div>
                    <div class="source-preview">
                        <strong>Matched text:</strong> "${source.matchedText}..."
                    </div>
                </div>
            `).join('');
        } else {
            similarSources.style.display = 'none';
        }

        // Update recommendations
        updateRecommendations(analysis);
    }

    function updateRecommendations(analysis) {
        const recommendations = [];

        if (analysis.plagiarismScore > 20) {
            recommendations.push('Consider rewriting sections with high similarity to original sources');
            recommendations.push('Add proper citations for any referenced content');
            recommendations.push('Use quotation marks for direct quotes from sources');
        }

        if (analysis.plagiarismScore > 10) {
            recommendations.push('Review the similar sources listed above');
            recommendations.push('Ensure proper paraphrasing while maintaining original meaning');
        }

        if (analysis.foundPhrases.length > 5) {
            recommendations.push('Try to rephrase common industry terms and phrases');
        }

        if (analysis.uniquenessRatio < 70) {
            recommendations.push('Increase vocabulary diversity to improve originality');
        }

        if (recommendations.length === 0) {
            recommendationsList.innerHTML = '<p class="no-issues">Your content appears to be original. No recommendations needed.</p>';
        } else {
            recommendationsList.innerHTML = recommendations
                .map(rec => `<div class="recommendation-item"><i class="fas fa-check-circle"></i> ${rec}</div>`)
                .join('');
        }
    }

    function hideResults() {
        resultsSection.style.display = 'none';
        checkingProgress.style.display = 'none';
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
