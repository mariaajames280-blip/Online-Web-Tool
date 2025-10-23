// Grammar Checker
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const checkBtn = document.getElementById('checkBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const autoFixBtn = document.getElementById('autoFixBtn');
    const clearText = document.getElementById('clearText');
    const copyCorrected = document.getElementById('copyCorrected');
    const replaceOriginal = document.getElementById('replaceOriginal');
    const resultsSection = document.getElementById('resultsSection');
    const checkingProgress = document.getElementById('checkingProgress');
    
    // Count elements
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    const sentenceCount = document.getElementById('sentenceCount');
    
    // Stats elements
    const readabilityScore = document.getElementById('readabilityScore');
    const gradeLevel = document.getElementById('gradeLevel');
    const avgSentenceLength = document.getElementById('avgSentenceLength');
    const passiveVoice = document.getElementById('passiveVoice');
    
    // Results elements
    const errorCount = document.getElementById('errorCount');
    const qualityScore = document.getElementById('qualityScore');
    const readingTime = document.getElementById('readingTime');
    const spellingErrors = document.getElementById('spellingErrors');
    const grammarErrors = document.getElementById('grammarErrors');
    const punctuationErrors = document.getElementById('punctuationErrors');
    const styleErrors = document.getElementById('styleErrors');
    const errorsList = document.getElementById('errorsList');
    const suggestionsList = document.getElementById('suggestionsList');
    const correctedTextSection = document.getElementById('correctedTextSection');
    const correctedText = document.getElementById('correctedText');
    
    // Progress elements
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressText = document.getElementById('progressText');

    // Sample text with common errors
    const sampleText = `Their going to the park tomorrow, but they dont know what time. 
    She said she would of gone if she had knew about it earlier. 
    Me and my friend we was planning to go their. 
    Its a beautiful day outside, the sun is shining bright. 
    He don't like coffee, but he drinks it anyways. 
    The team are playing good today. 
    Between you and I, this is a secret. 
    I seen that movie last week, it was amazing. 
    She is more smarter than her brother. 
    The data shows that their is a problem.`;

    // Common spelling mistakes and corrections
    const commonSpellingMistakes = {
        'their': 'they\'re',
        'dont': 'don\'t',
        'would of': 'would have',
        'knew': 'known',
        'me and': 'my friend and I',
        'we was': 'we were',
        'their': 'there',
        'its': 'it\'s',
        'anyways': 'anyway',
        'dont': 'don\'t',
        'are': 'is',
        'good': 'well',
        'between you and i': 'between you and me',
        'seen': 'saw',
        'more smarter': 'smarter',
        'their is': 'there is'
    };

    // Grammar rules and common errors
    const grammarRules = [
        {
            pattern: /\b(their|there|they're)\b/gi,
            description: 'Confused word: "their" (possessive) vs "there" (location) vs "they\'re" (they are)',
            category: 'grammar'
        },
        {
            pattern: /\b(would of|could of|should of)\b/gi,
            description: 'Incorrect: "would of" should be "would have"',
            category: 'grammar'
        },
        {
            pattern: /\b(me and|i and)\b/gi,
            description: 'Incorrect pronoun order: should be "[other person] and I"',
            category: 'grammar'
        },
        {
            pattern: /\b(he don't|she don't|it don't)\b/gi,
            description: 'Subject-verb agreement: "he/she/it doesn\'t"',
            category: 'grammar'
        },
        {
            pattern: /\b(more better|more worse|more smarter)\b/gi,
            description: 'Double comparative: use "better", "worse", or "smarter" alone',
            category: 'grammar'
        }
    ];

    let originalText = '';
    let currentErrors = [];
    let correctedTextContent = '';

    // Initialize
    updateCounters();

    // Update counters in real-time
    textInput.addEventListener('input', function() {
        updateCounters();
        updateWritingStats();
    });

    // Check button
    checkBtn.addEventListener('click', function() {
        checkGrammar();
    });

    // Sample text
    sampleBtn.addEventListener('click', function() {
        textInput.value = sampleText;
        updateCounters();
        updateWritingStats();
        showNotification('Sample text loaded!');
    });

    // Clear text
    clearText.addEventListener('click', function() {
        textInput.value = '';
        updateCounters();
        updateWritingStats();
        hideResults();
        showNotification('Text cleared!');
    });

    // Auto fix
    autoFixBtn.addEventListener('click', function() {
        autoFixErrors();
    });

    // Copy corrected text
    copyCorrected.addEventListener('click', function() {
        copyToClipboard(correctedTextContent);
        showNotification('Corrected text copied to clipboard!');
    });

    // Replace original
    replaceOriginal.addEventListener('click', function() {
        textInput.value = correctedTextContent;
        updateCounters();
        updateWritingStats();
        showNotification('Original text replaced with corrected version!');
    });

    function updateCounters() {
        const text = textInput.value;
        const words = text.trim() ? text.trim().split(/\s+/) : [];
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        
        wordCount.textContent = words.length + ' word' + (words.length !== 1 ? 's' : '');
        charCount.textContent = characters + ' character' + (characters !== 1 ? 's' : '');
        sentenceCount.textContent = sentences + ' sentence' + (sentences !== 1 ? 's' : '');
    }

    function updateWritingStats() {
        const text = textInput.value;
        const words = text.trim() ? text.trim().split(/\s+/) : [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        if (words.length === 0) {
            readabilityScore.textContent = '100';
            gradeLevel.textContent = '-';
            avgSentenceLength.textContent = '0';
            passiveVoice.textContent = '0%';
            return;
        }

        // Calculate average sentence length
        const avgSentence = sentences.length > 0 ? 
            words.length / sentences.length : words.length;
        avgSentenceLength.textContent = avgSentence.toFixed(1);

        // Calculate readability score (simplified)
        const readability = Math.max(30, 100 - (avgSentence * 2));
        readabilityScore.textContent = Math.round(readability);

        // Estimate grade level
        const grade = avgSentence < 10 ? '5th' : 
                     avgSentence < 15 ? '8th' : 
                     avgSentence < 20 ? '12th' : 'College';
        gradeLevel.textContent = grade;

        // Estimate passive voice percentage
        const passiveMatches = text.match(/\b(am|is|are|was|were|be|being|been)\s+\w+ed\b/gi) || [];
        const passivePercent = (passiveMatches.length / sentences.length) * 100 || 0;
        passiveVoice.textContent = passivePercent.toFixed(0) + '%';
    }

    function checkGrammar() {
        const text = textInput.value.trim();
        
        if (!text) {
            showNotification('Please enter some text to check!');
            return;
        }

        originalText = text;

        // Show progress and hide results
        resultsSection.style.display = 'none';
        checkingProgress.style.display = 'block';
        checkBtn.disabled = true;

        // Simulate grammar check process
        simulateGrammarCheck(text);
    }

    function simulateGrammarCheck(text) {
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
                    'Analyzing text structure and complexity...',
                    'Checking spelling and word usage...',
                    'Analyzing grammar and syntax...',
                    'Reviewing writing style and clarity...'
                ];
                progressText.textContent = progressTexts[currentStep];

                currentStep++;
                setTimeout(updateProgress, 1200);
            } else {
                // Analysis complete
                completeAnalysis(text);
            }
        }

        updateProgress();
    }

    function completeAnalysis(text) {
        // Hide progress and show results
        checkingProgress.style.display = 'none';
        resultsSection.style.display = 'block';
        checkBtn.disabled = false;

        // Analyze text for errors
        const analysis = analyzeTextForErrors(text);

        // Update results
        updateResults(analysis);
        
        showNotification('Grammar check completed!');
    }

    function analyzeTextForErrors(text) {
        let errors = [];
        let spellingErrorCount = 0;
        let grammarErrorCount = 0;
        let punctuationErrorCount = 0;
        let styleErrorCount = 0;

        // Check for common spelling mistakes
        Object.keys(commonSpellingMistakes).forEach(mistake => {
            const regex = new RegExp('\\b' + mistake + '\\b', 'gi');
            const matches = text.match(regex);
            if (matches) {
                matches.forEach(() => {
                    errors.push({
                        type: 'spelling',
                        description: `Misspelled word: "${mistake}" should be "${commonSpellingMistakes[mistake]}"`,
                        suggestion: commonSpellingMistakes[mistake],
                        severity: 'medium'
                    });
                    spellingErrorCount++;
                });
            }
        });

        // Check grammar rules
        grammarRules.forEach(rule => {
            const matches = text.match(rule.pattern);
            if (matches) {
                matches.forEach(() => {
                    errors.push({
                        type: rule.category,
                        description: rule.description,
                        suggestion: 'Review and correct',
                        severity: 'high'
                    });
                    grammarErrorCount++;
                });
            }
        });

        // Check for missing punctuation
        const missingPeriods = text.split('\n').filter(line => {
            return line.trim() && !/[.!?]$/.test(line.trim());
        }).length;

        if (missingPeriods > 0) {
            errors.push({
                type: 'punctuation',
                description: `Missing ending punctuation in ${missingPeriods} sentence${missingPeriods > 1 ? 's' : ''}`,
                suggestion: 'Add appropriate ending punctuation (.!?)',
                severity: 'low'
            });
            punctuationErrorCount += missingPeriods;
        }

        // Check for long sentences (style issue)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).length;

        if (longSentences > 0) {
            errors.push({
                type: 'style',
                description: `${longSentences} long sentence${longSentences > 1 ? 's' : ''} detected (25+ words)`,
                suggestion: 'Consider breaking long sentences into shorter ones',
                severity: 'low'
            });
            styleErrorCount += longSentences;
        }

        // Calculate quality score
        const totalWords = text.split(/\s+/).length;
        const errorDensity = errors.length / totalWords;
        const quality = Math.max(30, 100 - (errorDensity * 1000));

        // Calculate reading time (words per minute)
        const readingTimeMinutes = Math.ceil(totalWords / 200);

        return {
            errors: errors,
            counts: {
                spelling: spellingErrorCount,
                grammar: grammarErrorCount,
                punctuation: punctuationErrorCount,
                style: styleErrorCount,
                total: errors.length
            },
            quality: quality,
            readingTime: readingTimeMinutes
        };
    }

    function updateResults(analysis) {
        // Update overview
        errorCount.textContent = analysis.counts.total;
        qualityScore.textContent = analysis.quality.toFixed(0) + '%';
        readingTime.textContent = analysis.readingTime + 'm';

        // Update error breakdown
        spellingErrors.textContent = analysis.counts.spelling;
        grammarErrors.textContent = analysis.counts.grammar;
        punctuationErrors.textContent = analysis.counts.punctuation;
        styleErrors.textContent = analysis.counts.style;

        // Update detailed errors list
        if (analysis.errors.length === 0) {
            errorsList.innerHTML = '<div class="no-errors">🎉 No grammar or spelling issues found! Your text looks great.</div>';
        } else {
            errorsList.innerHTML = analysis.errors.map((error, index) => `
                <div class="error-item ${error.type} ${error.severity}">
                    <div class="error-header">
                        <span class="error-type-badge">${error.type}</span>
                        <span class="error-severity ${error.severity}">${error.severity}</span>
                    </div>
                    <div class="error-description">${error.description}</div>
                    <div class="error-suggestion">
                        <strong>Suggestion:</strong> ${error.suggestion}
                    </div>
                </div>
            `).join('');
        }

        // Update suggestions
        updateSuggestions(analysis);

        // Generate corrected text
        generateCorrectedText(analysis);

        // Enable auto-fix if there are errors
        autoFixBtn.disabled = analysis.errors.length === 0;
    }

    function updateSuggestions(analysis) {
        const suggestions = [];

        if (analysis.counts.total === 0) {
            suggestionsList.innerHTML = '<p class="no-suggestions">🎉 Excellent! No writing suggestions needed.</p>';
            return;
        }

        if (analysis.counts.spelling > 0) {
            suggestions.push('Review spelling and consider using a spell checker for common mistakes');
        }

        if (analysis.counts.grammar > 0) {
            suggestions.push('Focus on grammar rules like subject-verb agreement and proper word usage');
        }

        if (analysis.counts.punctuation > 0) {
            suggestions.push('Pay attention to punctuation placement, especially ending punctuation');
        }

        if (analysis.counts.style > 0) {
            suggestions.push('Vary sentence length and structure for better readability');
        }

        if (analysis.quality < 80) {
            suggestions.push('Consider revising your text to improve overall writing quality');
        }

        suggestionsList.innerHTML = suggestions
            .map(suggestion => `<div class="suggestion-item"><i class="fas fa-check-circle"></i> ${suggestion}</div>`)
            .join('');
    }

    function generateCorrectedText(analysis) {
        let corrected = originalText;

        // Apply spelling corrections
        Object.keys(commonSpellingMistakes).forEach(mistake => {
            const regex = new RegExp('\\b' + mistake + '\\b', 'gi');
            corrected = corrected.replace(regex, commonSpellingMistakes[mistake]);
        });

        correctedTextContent = corrected;
        correctedText.textContent = corrected;
        correctedTextSection.style.display = 'block';
    }

    function autoFixErrors() {
        textInput.value = correctedTextContent;
        updateCounters();
        updateWritingStats();
        showNotification('All errors auto-fixed!');
        hideResults();
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
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
