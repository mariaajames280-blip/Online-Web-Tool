// ===============================
// Main JS for ONLINE WEBTOOL
// Handles mobile menu, animations, utility functions, and tool interactions
// ===============================

document.addEventListener('DOMContentLoaded', function () {

    // ----- Mobile Menu Toggle -----
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            this.classList.toggle('active'); // animate hamburger
        });
    }

    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ----- Animate Tool Cards on Scroll -----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'bounceIn 0.6s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.tool-card').forEach(card => {
        observer.observe(card);
    });

    // ----- Initialize Google AdSense -----
    if (typeof adsbygoogle !== 'undefined') {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }

});

// ===============================
// Utility Functions (Used by tools)
// ===============================

// Show temporary messages
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    const container = document.querySelector('.tool-container') || document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => messageDiv.remove(), 500);
        }, 3000);
    }
}

// Download text file
function downloadText(filename, text) {
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    element.download = filename;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Download JSON file
function downloadJSON(filename, data) {
    const json = JSON.stringify(data, null, 2);
    const element = document.createElement('a');
    element.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    element.download = filename;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Download CSV file
function downloadCSV(filename, csv) {
    const element = document.createElement('a');
    element.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    element.download = filename;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('Copied to clipboard!', 'success');
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

// Fallback copy for older browsers
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        showMessage('Copied to clipboard!', 'success');
    } catch (err) {
        showMessage('Failed to copy to clipboard', 'error');
    }

    document.body.removeChild(textArea);
}

// ===============================
// Dynamic CSS for fade out message
// ===============================
const style = document.createElement('style');
style.textContent = `
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}`;
document.head.appendChild(style);
