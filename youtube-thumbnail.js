// YouTube Thumbnail Downloader
document.addEventListener('DOMContentLoaded', function() {
    const youtubeUrl = document.getElementById('youtubeUrl');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearUrl = document.getElementById('clearUrl');
    const fetchBtn = document.getElementById('fetchBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const urlStatus = document.getElementById('urlStatus');
    const videoInfo = document.getElementById('videoInfo');
    const thumbnailsSection = document.getElementById('thumbnailsSection');
    const thumbnailsGrid = document.getElementById('thumbnailsGrid');
    
    // Video info elements
    const videoId = document.getElementById('videoId');
    const videoTitle = document.getElementById('videoTitle');
    const videoChannel = document.getElementById('videoChannel');

    // Sample YouTube video (a popular coding tutorial)
    const sampleVideoUrl = 'https://www.youtube.com/watch?v=Qqx_wzMmFeA';

    // YouTube URL patterns
    const youtubePatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/
    ];

    // Initialize
    updateUrlStatus();

    // URL validation in real-time
    youtubeUrl.addEventListener('input', function() {
        updateUrlStatus();
    });

    // Paste from clipboard
    pasteBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            youtubeUrl.value = text;
            updateUrlStatus();
            showNotification('URL pasted from clipboard!');
        } catch (err) {
            showNotification('Failed to paste from clipboard. Please paste manually.');
        }
    });

    // Clear URL
    clearUrl.addEventListener('click', function() {
        youtubeUrl.value = '';
        updateUrlStatus();
        hideAllSections();
        showNotification('Cleared!');
    });

    // Fetch thumbnails
    fetchBtn.addEventListener('click', function() {
        fetchThumbnails();
    });

    // Load sample video
    sampleBtn.addEventListener('click', function() {
        youtubeUrl.value = sampleVideoUrl;
        updateUrlStatus();
        fetchThumbnails();
        showNotification('Sample video loaded!');
    });

    // Enter key to fetch
    youtubeUrl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && fetchBtn.disabled === false) {
            fetchThumbnails();
        }
    });

    function updateUrlStatus() {
        const url = youtubeUrl.value.trim();
        const extractedId = extractVideoId(url);
        
        if (!url) {
            urlStatus.textContent = 'Enter a valid YouTube URL';
            urlStatus.style.color = '#666';
            fetchBtn.disabled = true;
            return;
        }

        if (extractedId) {
            urlStatus.textContent = '✓ Valid YouTube URL detected';
            urlStatus.style.color = '#28a745';
            fetchBtn.disabled = false;
        } else {
            urlStatus.textContent = '✗ Invalid YouTube URL format';
            urlStatus.style.color = '#dc3545';
            fetchBtn.disabled = true;
        }
    }

    function extractVideoId(url) {
        for (const pattern of youtubePatterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    function fetchThumbnails() {
        const url = youtubeUrl.value.trim();
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            showNotification('Please enter a valid YouTube URL');
            return;
        }

        // Show loading state
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
        fetchBtn.disabled = true;

        // Simulate API call (in real implementation, you might use YouTube API)
        setTimeout(() => {
            try {
                generateThumbnails(videoId);
                showVideoInfo(videoId);
                
                fetchBtn.innerHTML = '<i class="fas fa-download"></i> Fetch Thumbnails';
                fetchBtn.disabled = false;
                
                showNotification('Thumbnails generated successfully!');
            } catch (error) {
                showNotification('Error generating thumbnails. Please try again.');
                fetchBtn.innerHTML = '<i class="fas fa-download"></i> Fetch Thumbnails';
                fetchBtn.disabled = false;
            }
        }, 1000);
    }

    function generateThumbnails(videoId) {
        // YouTube thumbnail URL patterns
        const thumbnailQualities = [
            {
                name: 'Max Resolution',
                code: 'maxresdefault',
                resolution: '1280×720',
                quality: 'max',
                description: 'Highest quality available'
            },
            {
                name: 'High Definition',
                code: 'sddefault',
                resolution: '640×480',
                quality: 'high',
                description: 'HD quality thumbnail'
            },
            {
                name: 'Standard Quality',
                code: 'hqdefault',
                resolution: '480×360',
                quality: 'medium',
                description: 'Good quality for most uses'
            },
            {
                name: 'Medium Quality',
                code: 'mqdefault',
                resolution: '320×180',
                quality: 'low',
                description: 'Small file size'
            },
            {
                name: 'Default Quality',
                code: 'default',
                resolution: '120×90',
                quality: 'default',
                description: 'Lowest quality'
            }
        ];

        // Clear previous thumbnails
        thumbnailsGrid.innerHTML = '';

        // Generate thumbnail cards
        thumbnailQualities.forEach(quality => {
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${quality.code}.jpg`;
            
            const thumbnailCard = document.createElement('div');
            thumbnailCard.className = 'thumbnail-card';
            thumbnailCard.innerHTML = `
                <div class="thumbnail-image">
                    <img src="${thumbnailUrl}" alt="${quality.name}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="thumbnail-error" style="display: none;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Thumbnail not available</span>
                    </div>
                    <div class="thumbnail-overlay">
                        <div class="quality-badge ${quality.quality}">${quality.quality.toUpperCase()}</div>
                        <button class="download-btn" data-url="${thumbnailUrl}" data-quality="${quality.name}">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="thumbnail-info">
                    <h4>${quality.name}</h4>
                    <p>${quality.resolution} • ${quality.description}</p>
                    <span class="thumbnail-url">${quality.code}.jpg</span>
                </div>
            `;
            
            thumbnailsGrid.appendChild(thumbnailCard);
        });

        // Add download event listeners
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                const quality = this.getAttribute('data-quality');
                downloadThumbnail(url, videoId, quality);
            });
        });

        // Show thumbnails section
        thumbnailsSection.style.display = 'block';
    }

    function showVideoInfo(videoId) {
        // In a real implementation, you would fetch this from YouTube API
        // For demo purposes, we'll use placeholder data
        videoId.textContent = videoId;
        videoTitle.textContent = 'YouTube Video Thumbnail';
        videoChannel.textContent = 'YouTube Channel';
        
        videoInfo.style.display = 'block';
    }

    function downloadThumbnail(url, videoId, quality) {
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube-thumbnail-${videoId}-${quality.toLowerCase().replace(' ', '-')}.jpg`;
        a.target = '_blank';
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showNotification(`Downloading ${quality} thumbnail...`);
    }

    function hideAllSections() {
        videoInfo.style.display = 'none';
        thumbnailsSection.style.display = 'none';
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
