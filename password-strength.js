// Password Strength Checker
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    const checkBtn = document.getElementById('checkBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // Strength elements
    const strengthText = document.getElementById('strengthText');
    const meterFill = document.getElementById('meterFill');
    
    // Requirement elements
    const reqLength = document.getElementById('reqLength');
    const reqUppercase = document.getElementById('reqUppercase');
    const reqLowercase = document.getElementById('reqLowercase');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');
    
    // Analysis elements
    const crackTime = document.getElementById('crackTime');
    const passwordScore = document.getElementById('passwordScore');
    const charCount = document.getElementById('charCount');
    const uniqueChars = document.getElementById('uniqueChars');
    const recommendationsList = document.getElementById('recommendationsList');

    let isPasswordVisible = false;

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        isPasswordVisible = !isPasswordVisible;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        togglePassword.innerHTML = isPasswordVisible ? 
            '<i class="fas fa-eye-slash"></i>' : 
            '<i class="fas fa-eye"></i>';
    });

    // Real-time password checking
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength();
    });

    // Check button
    checkBtn.addEventListener('click', function() {
        checkPasswordStrength();
        if (passwordInput.value) {
            showNotification('Password strength checked!');
        }
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
        passwordInput.value = '';
        resetAllDisplays();
        showNotification('Cleared!');
    });

    // Password strength checking function
    function checkPasswordStrength() {
        const password = passwordInput.value;
        
        if (!password) {
            resetAllDisplays();
            return;
        }

        // Calculate requirements
        const requirements = checkRequirements(password);
        const score = calculatePasswordScore(password, requirements);
        const strength = getStrengthLevel(score);
        
        // Update displays
        updateRequirementsDisplay(requirements);
        updateStrengthDisplay(strength, score);
        updateSecurityAnalysis(password, requirements, score);
        updateRecommendations(password, requirements, score);
    }

    function checkRequirements(password) {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
    }

    function calculatePasswordScore(password, requirements) {
        let score = 0;
        
        // Length score (max 40 points)
        score += Math.min(password.length * 4, 40);
        
        // Character variety (max 40 points)
        let varietyScore = 0;
        if (requirements.uppercase) varietyScore += 10;
        if (requirements.lowercase) varietyScore += 10;
        if (requirements.number) varietyScore += 10;
        if (requirements.special) varietyScore += 10;
        score += varietyScore;
        
        // Bonus for length over 12 (max 20 points)
        if (password.length > 12) {
            score += Math.min((password.length - 12) * 2, 20);
        }
        
        return Math.min(score, 100);
    }

    function getStrengthLevel(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'very-strong';
        if (score >= 60) return 'strong';
        if (score >= 40) return 'medium';
        return 'weak';
    }

    function updateRequirementsDisplay(requirements) {
        updateRequirement(reqLength, requirements.length);
        updateRequirement(reqUppercase, requirements.uppercase);
        updateRequirement(reqLowercase, requirements.lowercase);
        updateRequirement(reqNumber, requirements.number);
        updateRequirement(reqSpecial, requirements.special);
    }

    function updateRequirement(element, met) {
        const icon = element.querySelector('i');
        icon.className = met ? 'fas fa-check-circle' : 'fas fa-times-circle';
        icon.style.color = met ? '#28a745' : '#dc3545';
    }

    function updateStrengthDisplay(strength, score) {
        const strengthConfig = {
            'weak': { text: 'Very Weak', color: '#dc3545', width: '20%' },
            'medium': { text: 'Weak', color: '#fd7e14', width: '40%' },
            'strong': { text: 'Good', color: '#ffc107', width: '60%' },
            'very-strong': { text: 'Strong', color: '#28a745', width: '80%' },
            'excellent': { text: 'Very Strong', color: '#20c997', width: '100%' }
        };

        const config = strengthConfig[strength];
        strengthText.textContent = config.text;
        strengthText.style.color = config.color;
        meterFill.style.width = config.width;
        meterFill.style.backgroundColor = config.color;
        passwordScore.textContent = `${score}/100`;
        passwordScore.style.color = config.color;
    }

    function updateSecurityAnalysis(password, requirements, score) {
        // Character count
        charCount.textContent = password.length;
        
        // Unique characters
        const unique = new Set(password).size;
        uniqueChars.textContent = unique;
        
        // Crack time estimation
        crackTime.textContent = estimateCrackTime(password, score);
    }

    function estimateCrackTime(password, score) {
        if (score < 30) return 'Instantly';
        if (score < 50) return 'Seconds';
        if (score < 70) return 'Hours';
        if (score < 85) return 'Days';
        if (score < 95) return 'Months';
        return 'Years';
    }

    function updateRecommendations(password, requirements, score) {
        const recommendations = [];
        
        if (password.length < 8) {
            recommendations.push('Use at least 8 characters');
        }
        
        if (!requirements.uppercase) {
            recommendations.push('Add uppercase letters (A-Z)');
        }
        
        if (!requirements.lowercase) {
            recommendations.push('Add lowercase letters (a-z)');
        }
        
        if (!requirements.number) {
            recommendations.push('Include numbers (0-9)');
        }
        
        if (!requirements.special) {
            recommendations.push('Add special characters (!@#$%^&*)');
        }
        
        if (password.length < 12 && score < 80) {
            recommendations.push('Make password longer (12+ characters recommended)');
        }
        
        // Check for common patterns
        if (/12345|qwerty|password|admin/i.test(password)) {
            recommendations.push('Avoid common patterns and dictionary words');
        }
        
        if (new Set(password).size < password.length * 0.6) {
            recommendations.push('Use more unique characters');
        }

        // Display recommendations
        if (recommendations.length === 0 && password) {
            recommendationsList.innerHTML = '<p class="success-message">🎉 Excellent! Your password meets all security standards.</p>';
        } else if (password) {
            recommendationsList.innerHTML = recommendations
                .map(rec => `<div class="recommendation-item"><i class="fas fa-exclamation-circle"></i> ${rec}</div>`)
                .join('');
        } else {
            recommendationsList.innerHTML = '<p class="no-recommendations">Enter a password to get security recommendations</p>';
        }
    }

    function resetAllDisplays() {
        // Reset requirements
        [reqLength, reqUppercase, reqLowercase, reqNumber, reqSpecial].forEach(req => {
            const icon = req.querySelector('i');
            icon.className = 'fas fa-circle';
            icon.style.color = '#666';
        });
        
        // Reset strength meter
        strengthText.textContent = 'Very Weak';
        strengthText.style.color = '#dc3545';
        meterFill.style.width = '0%';
        passwordScore.textContent = '0/100';
        passwordScore.style.color = '#dc3545';
        
        // Reset analysis
        crackTime.textContent = 'Instantly';
        charCount.textContent = '0';
        uniqueChars.textContent = '0';
        
        // Reset recommendations
        recommendationsList.innerHTML = '<p class="no-recommendations">Enter a password to get security recommendations</p>';
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
    resetAllDisplays();
});
