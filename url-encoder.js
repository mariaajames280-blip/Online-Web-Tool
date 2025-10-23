// URL Encoder/Decoder
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const urlOutput = document.getElementById('urlOutput');
    const processBtn = document.getElementById('processBtn');
    const swapBtn = document.getElementById('swapBtn');
    const clearInput = document.getElementById('clearInput');
    const copyOutput = document.getElementById('copyOutput');
    const testUrl = document.getElementById('testUrl');
    const charCount = document.getElementById('charCount');
    const modeBtns = document.querySelectorAll('.mode-btn');

    let currentMode = 'encode';

    // Initialize mode buttons
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            modeBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current mode
            currentMode = this.dataset.mode;
            updateButtonText();
            processUrl(); // Auto-process when mode changes
        });
    });

    // Update process button text based on mode
    function updateButtonText() {
        const text = currentMode === 'encode' ? 'Encode URL' : 'Decode URL';
        const icon = currentMode === 'encode' ? 'fa-lock' : 'fa-unlock';
        processBtn.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
    }

    // Character counter
    urlInput.addEventListener('input', function() {
        const count = urlInput.value.length;
        charCount.textContent = count + ' character' + (count !== 1 ? 's' : '');
        
        // Auto-process if there's input
        if (urlInput.value.trim()) {
            processUrl();
        } else {
            clearOutput();
        }
    });

    // Process URL
    processBtn.addEventListener('click', function() {
        processUrl();
        if (urlInput.value.trim()) {
            showNotification(`${currentMode === 'encode' ? 'Encoded' : 'Decoded'} URL successfully!`);
        }
    });

    // Swap mode
    swapBtn.addEventListener('click', function() {
        // Toggle mode
        currentMode = currentMode === 'encode' ? 'decode' : 'encode';
        
        // Update active button
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === currentMode) {
                btn.classList.add('active');
            }
        });
        
        updateButtonText();
        
        // Swap input and output if both have content
        if (urlInput.value && urlOutput.value) {
            const temp = urlInput.value;
            urlInput.value = urlOutput.value;
            urlOutput.value = temp;
            processUrl(); // Process the swapped content
        } else if (urlInput.value) {
            processUrl(); // Process current input with new mode
        }
        
        showNotification(`Switched to ${currentMode === 'encode' ? 'Encode' : 'Decode'} mode`);
    });

    // Clear input
    clearInput.addEventListener('click', function() {
        urlInput.value = '';
        clearOutput();
        charCount.textContent = '0 characters';
        showNotification('Cleared!');
    });

    // Copy output
    copyOutput.addEventListener('click', function() {
        if (urlOutput.value) {
            urlOutput.select();
            navigator.clipboard.writeText(urlOutput.value)
                .then(() => {
                    showNotification('URL copied to clipboard!');
                })
                .catch(() => {
                    // Fallback
                    document.execCommand('copy');
                    showNotification('URL copied!');
                });
        }
    });

    // Test URL
    testUrl.addEventListener('click', function() {
        if (urlOutput.value) {
            // Basic URL validation
            try {
                const testUrl = new URL(urlOutput.value);
                window.open(urlOutput.value, '_blank');
                showNotification('Opening URL in new tab...');
            } catch (e) {
                showNotification('Invalid URL format for testing!');
            }
        }
    });

    // Main processing function
    function processUrl() {
        const input = urlInput.value.trim();
        
        if (!input) {
            clearOutput();
            return;
        }

        let result;
        
        try {
            if (currentMode === 'encode') {
                result = encodeURL(input);
            } else {
                result = decodeURL(input);
            }
            
            urlOutput.value = result;
            
            // Enable output buttons
            copyOutput.disabled = false;
            testUrl.disabled = false;
            
        } catch (error) {
            urlOutput.value = `Error: ${error.message}`;
            copyOutput.disabled = true;
            testUrl.disabled = true;
        }
    }

    function encodeURL(url) {
        // Use built-in encodeURIComponent for proper encoding
        // But preserve the protocol and domain parts
        try {
            // Try to parse as full URL first
            const urlObj = new URL(url);
            const encodedPath = encodeURIComponent(urlObj.pathname + urlObj.search + urlObj.hash)
                .replace(/%2F/g, '/') // Keep slashes in path
                .replace(/%3A/g, ':') // Keep colons
                .replace(/%3F/g, '?') // Keep question marks
                .replace(/%23/g, '#'); // Keep hash symbols
            
            return urlObj.origin + encodedPath;
        } catch (e) {
            // If it's not a full URL, just encode the whole string
            // but preserve common URL characters
            return encodeURIComponent(url)
                .replace(/%2F/g, '/')
                .replace(/%3A/g, ':')
                .replace(/%3F/g, '?')
                .replace(/%23/g, '#')
                .replace(/%26/g, '&')
                .replace(/%3D/g, '=');
        }
    }

    function decodeURL(url) {
        try {
            return decodeURIComponent(url.replace(/\+/g, ' '));
        } catch (e) {
            // If decoding fails, try a more careful approach
            try {
                return decodeURI(url);
            } catch (e2) {
                throw new Error('Invalid encoded URL format');
            }
        }
    }

    function clearOutput() {
        urlOutput.value = '';
        copyOutput.disabled = true;
        testUrl.disabled = true;
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

    // Initialize
    updateButtonText();
    
    // Auto-process on page load if there's input in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const presetUrl = urlParams.get('url');
    if (presetUrl) {
        urlInput.value = presetUrl;
        processUrl();
    }
});
