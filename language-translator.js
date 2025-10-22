// Language Translator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get all elements
    const sourceText = document.getElementById('sourceText');
    const translatedText = document.getElementById('translatedText');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const translateBtn = document.getElementById('translateBtn');
    const swapBtn = document.getElementById('swapLanguages');
    const clearBtn = document.getElementById('clearText');
    const copyBtn = document.getElementById('copyTranslation');
    const speakBtn = document.getElementById('speakTranslation');
    const charCount = document.getElementById('charCount');
    const historyList = document.getElementById('translationHistory');

    // Sample translations database
    const translations = {
        'en-es': {
            'hello': 'hola',
            'good morning': 'buenos días',
            'how are you': 'cómo estás',
            'thank you': 'gracias',
            'goodbye': 'adiós',
            'please': 'por favor',
            'yes': 'sí',
            'no': 'no',
            'water': 'agua',
            'food': 'comida'
        },
        'en-fr': {
            'hello': 'bonjour',
            'good morning': 'bonjour',
            'how are you': 'comment allez-vous',
            'thank you': 'merci',
            'goodbye': 'au revoir',
            'please': 's\'il vous plaît',
            'yes': 'oui',
            'no': 'non',
            'water': 'eau',
            'food': 'nourriture'
        },
        'en-de': {
            'hello': 'hallo',
            'good morning': 'guten morgen',
            'how are you': 'wie geht es dir',
            'thank you': 'danke',
            'goodbye': 'auf wiedersehen',
            'please': 'bitte',
            'yes': 'ja',
            'no': 'nein',
            'water': 'wasser',
            'food': 'essen'
        },
        'es-en': {
            'hola': 'hello',
            'buenos días': 'good morning',
            'cómo estás': 'how are you',
            'gracias': 'thank you',
            'adiós': 'goodbye'
        },
        'fr-en': {
            'bonjour': 'hello',
            'merci': 'thank you',
            'au revoir': 'goodbye',
            'oui': 'yes',
            'non': 'no'
        }
    };

    // Character counter
    sourceText.addEventListener('input', function() {
        const count = sourceText.value.length;
        charCount.textContent = count + ' character' + (count !== 1 ? 's' : '');
    });

    // Clear button - FIXED
    clearBtn.addEventListener('click', function() {
        sourceText.value = '';
        translatedText.value = '';
        charCount.textContent = '0 characters';
        showNotification('Text cleared!');
    });

    // Swap languages - FIXED
    swapBtn.addEventListener('click', function() {
        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;
        
        // Swap text content
        const tempText = sourceText.value;
        sourceText.value = translatedText.value;
        translatedText.value = tempText;
        
        showNotification('Languages swapped!');
    });

    // Copy translation - FIXED
    copyBtn.addEventListener('click', function() {
        if (translatedText.value && translatedText.value !== '') {
            translatedText.select();
            navigator.clipboard.writeText(translatedText.value)
                .then(() => {
                    showNotification('Translation copied to clipboard!');
                })
                .catch(() => {
                    // Fallback for older browsers
                    document.execCommand('copy');
                    showNotification('Translation copied!');
                });
        } else {
            showNotification('Nothing to copy!');
        }
    });

    // Text-to-speech - FIXED
    speakBtn.addEventListener('click', function() {
        if (translatedText.value && translatedText.value !== '') {
            const speech = new SpeechSynthesisUtterance(translatedText.value);
            speech.lang = targetLang.value;
            speech.rate = 0.8;
            window.speechSynthesis.speak(speech);
            showNotification('Speaking translation...');
        } else {
            showNotification('Nothing to speak!');
        }
    });

    // Translate button - FIXED
    translateBtn.addEventListener('click', function() {
        const text = sourceText.value.trim();
        
        if (!text) {
            showNotification('Please enter some text to translate!');
            return;
        }

        if (text.length > 1000) {
            showNotification('Text too long! Please enter less than 1000 characters.');
            return;
        }

        // Show loading state
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        translateBtn.disabled = true;

        // Simulate translation process
        setTimeout(() => {
            const fromLang = sourceLang.value === 'auto' ? 'en' : sourceLang.value;
            const toLang = targetLang.value;
            const translation = getTranslation(text, fromLang, toLang);
            
            translatedText.value = translation;
            
            // Add to history
            addToHistory(text, translation, fromLang, toLang);
            
            // Reset button
            translateBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Translate';
            translateBtn.disabled = false;
            
            showNotification('Translation completed!');
        }, 800);
    });

    // Translation function - IMPROVED
    function getTranslation(text, fromLang, toLang) {
        const key = fromLang + '-' + toLang;
        const lowerText = text.toLowerCase().trim();
        
        // Check if we have exact match
        if (translations[key] && translations[key][lowerText]) {
            return translations[key][lowerText];
        }
        
        // Check for partial matches
        for (const [phrase, translation] of Object.entries(translations[key] || {})) {
            if (lowerText.includes(phrase)) {
                return text.toLowerCase().replace(phrase, translation);
            }
        }
        
        // Fallback translation
        const languageNames = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
            'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi'
        };
        
        return `[${languageNames[fromLang] || fromLang} → ${languageNames[toLang] || toLang}]: "${text}"`;
    }

    // Add to history - FIXED
    function addToHistory(original, translated, fromLang, toLang) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const languageNames = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
            'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi'
        };
        
        historyItem.innerHTML = `
            <div class="history-text">
                <strong>"${original}"</strong> 
                <span class="lang-pair">${languageNames[fromLang] || fromLang} → ${languageNames[toLang] || toLang}</span>
                <div class="translated-text">${translated}</div>
            </div>
            <button class="history-action">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add remove functionality
        const removeBtn = historyItem.querySelector('.history-action');
        removeBtn.addEventListener('click', function() {
            historyItem.remove();
            showNotification('Translation removed from history');
        });
        
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Limit history to 5 items
        if (historyList.children.length > 5) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    // Notification system - FIXED
    function showNotification(message) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
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
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Keyboard shortcut - FIXED
    sourceText.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            translateBtn.click();
        }
    });

    // Enter key to translate
    sourceText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            translateBtn.click();
        }
    });

    // Initialize with sample text
    sourceText.value = 'hello';
    charCount.textContent = '5 characters';
});
