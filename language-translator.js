// Language Translator JavaScript
document.addEventListener('DOMContentLoaded', function() {
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

    // Sample translations
    const sampleTranslations = {
        'en-es': {
            'hello': 'hola',
            'good morning': 'buenos días',
            'how are you': 'cómo estás',
            'thank you': 'gracias',
            'goodbye': 'adiós'
        },
        'en-fr': {
            'hello': 'bonjour',
            'good morning': 'bonjour',
            'how are you': 'comment allez-vous',
            'thank you': 'merci',
            'goodbye': 'au revoir'
        }
    };

    // Update character count
    sourceText.addEventListener('input', function() {
        charCount.textContent = `${sourceText.value.length} characters`;
    });

    // Clear text
    clearBtn.addEventListener('click', function() {
        sourceText.value = '';
        translatedText.value = '';
        charCount.textContent = '0 characters';
    });

    // Swap languages
    swapBtn.addEventListener('click', function() {
        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;
        
        const tempText = sourceText.value;
        sourceText.value = translatedText.value;
        translatedText.value = tempText;
    });

    // Copy translation
    copyBtn.addEventListener('click', function() {
        if (translatedText.value) {
            translatedText.select();
            document.execCommand('copy');
            showNotification('Translation copied to clipboard!');
        }
    });

    // Text-to-speech
    speakBtn.addEventListener('click', function() {
        if (translatedText.value) {
            const speech = new SpeechSynthesisUtterance(translatedText.value);
            speech.lang = targetLang.value;
            window.speechSynthesis.speak(speech);
        }
    });

    // Translate function
    translateBtn.addEventListener('click', function() {
        const text = sourceText.value.trim();
        if (!text) {
            showNotification('Please enter text to translate');
            return;
        }

        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        translateBtn.disabled = true;

        setTimeout(() => {
            const translation = simulateTranslation(text, sourceLang.value, targetLang.value);
            translatedText.value = translation;
            
            addToHistory(text, translation, sourceLang.value, targetLang.value);
            
            translateBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Translate';
            translateBtn.disabled = false;
            
            showNotification('Translation completed!');
        }, 1000);
    });

    function simulateTranslation(text, fromLang, toLang) {
        const key = `${fromLang}-${toLang}`;
        const lowerText = text.toLowerCase();
        
        if (sampleTranslations[key] && sampleTranslations[key][lowerText]) {
            return sampleTranslations[key][lowerText];
        }
        
        return `${text} (translated to ${getLanguageName(toLang)})`;
    }

    function getLanguageName(code) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'hi': 'Hindi'
        };
        return languages[code] || code;
    }

    function addToHistory(original, translated, fromLang, toLang) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-text">
                <strong>${original}</strong> 
                <span class="lang-pair">${getLanguageName(fromLang)} → ${getLanguageName(toLang)}</span>
                <div class="translated-text">${translated}</div>
            </div>
            <button class="history-action" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    sourceText.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            translateBtn.click();
        }
    });
});
