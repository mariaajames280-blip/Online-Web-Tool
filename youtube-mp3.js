// YouTube to MP3 Converter
document.addEventListener('DOMContentLoaded', function() {
    const youtubeUrl = document.getElementById('youtubeUrl');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearUrl = document.getElementById('clearUrl');
    const convertBtn = document.getElementById('convertBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const convertAnother = document.getElementById('convertAnother');
    const urlStatus = document.getElementById('urlStatus');
    const videoPreview = document.getElementById('videoPreview');
    const conversionProgress = document.getElementById('conversionProgress');
    const resultSection = document.getElementById('resultSection');
    
    // Video preview elements
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoDuration = document.getElementById('videoDuration');
    const videoDate = document.getElementById('videoDate');
    const videoViews = document.getElementById('videoViews');
    const videoQuality = document.getElementById('videoQuality');
    
    // Progress elements
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const estimatedTime = document.getElementById('estimatedTime');
    const estimatedSize = document.getElementById('estimatedSize');
    
    // Result elements
    const resultFileName = document.getElementById('resultFileName');
    const resultFileSize = document.getElementById('resultFileSize');
    const resultQuality = document.getElementById('resultQuality');
    const conversionTime = document.getElementById('conversionTime');

    // YouTube URL patterns
    const youtubePatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/
    ];

    let conversionStartTime = 0;
    let currentVideoId = null;

    // Initialize
    updateUrlStatus();

    // URL validation in real-time
    youtubeUrl.addEventListener('input', function() {
        updateUrlStatus();
        if (youtubeUrl.value.trim()) {
            fetchVideoInfo();
        } else {
            hideVideoPreview();
        }
    });

    // Paste from clipboard
    pasteBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            youtubeUrl.value = text;
            updateUrlStatus();
            if (text.trim()) {
                fetchVideoInfo();
            }
            showNotification('URL pasted from clipboard!');
        } catch (err) {
            showNotification('Failed to paste from clipboard. Please paste manually.');
        }
    });

    // Clear URL
    clearUrl.addEventListener('click', function() {
        youtubeUrl.value = '';
        updateUrlStatus();
        hideVideoPreview();
        hideAllSections();
        showNotification('Cleared!');
    });

    // Convert button
    convertBtn.addEventListener('click', function() {
        convertToMp3();
    });

    // Sample video
    sampleBtn.addEventListener('click', function() {
        // Use a popular music video as sample
        const sampleUrl = 'https://www.youtube.com/watch?v=JGwWNGJdvx8';
        youtubeUrl.value = sampleUrl;
        updateUrlStatus();
        fetchVideoInfo();
        showNotification('Sample video loaded!');
    });

    // Download button
    downloadBtn.addEventListener('click', function() {
        downloadMp3();
    });

    // Convert another
    convertAnother.addEventListener('click', function() {
        resetConverter();
        showNotification('Ready for new conversion!');
    });

    // Enter key to convert
    youtubeUrl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && convertBtn.disabled === false) {
            convertToMp3();
        }
    });

    function updateUrlStatus() {
        const url = youtubeUrl.value.trim();
        const videoId = extractVideoId(url);
        
        if (!url) {
            urlStatus.textContent = 'Enter a valid YouTube URL';
            urlStatus.style.color = '#666';
            convertBtn.disabled = true;
            return;
        }

        if (videoId) {
            urlStatus.textContent = '✓ Valid YouTube URL detected';
            urlStatus.style.color = '#28a745';
            convertBtn.disabled = false;
            currentVideoId = videoId;
        } else {
            urlStatus.textContent = '✗ Invalid YouTube URL format';
            urlStatus.style.color = '#dc3545';
            convertBtn.disabled = true;
            currentVideoId = null;
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

    function fetchVideoInfo() {
        const videoId = extractVideoId(youtubeUrl.value.trim());
        if (!videoId) return;

        // In a real implementation, you would fetch video info from YouTube API
        // For demo purposes, we'll simulate the response
        simulateVideoInfoFetch(videoId);
    }

    function simulateVideoInfoFetch(videoId) {
        // Show loading state
        urlStatus.textContent = '⏳ Fetching video info...';
        urlStatus.style.color = '#ffd700';

        setTimeout(() => {
            // Simulated video data
            const videoData = {
                title: 'Sample Music Video - Popular Song',
                duration: '3:45',
                uploadDate: '2023-01-15',
                views: '15,247,893',
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            };

            // Update video preview
            videoThumbnail.src = videoData.thumbnail;
            videoThumbnail.onerror = function() {
                // Fallback to default thumbnail if maxres doesn't exist
                this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            };
            videoTitle.textContent = videoData.title;
            videoDuration.textContent = videoData.duration;
            videoDate.textContent = videoData.uploadDate;
            videoViews.textContent = videoData.views;
            
            // Get selected quality
            const quality = document.getElementById('audioQuality').value;
            videoQuality.textContent = `${quality}kbps MP3`;

            // Show video preview
            videoPreview.style.display = 'block';

            urlStatus.textContent = '✓ Video info loaded';
            urlStatus.style.color = '#28a745';

            showNotification('Video information loaded!');
        }, 1000);
    }

    function hideVideoPreview() {
        videoPreview.style.display = 'none';
    }

    function convertToMp3() {
        const url = youtubeUrl.value.trim();
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            showNotification('Please enter a valid YouTube URL');
            return;
        }

        // Get conversion settings
        const quality = document.getElementById('audioQuality').value;
        const format = document.getElementById('outputFormat').value;
        const addMetadata = document.getElementById('addMetadata').checked;
        const normalizeAudio = document.getElementById('normalizeAudio').checked;

        // Hide result section and show progress
        resultSection.style.display = 'none';
        conversionProgress.style.display = 'block';
        convertBtn.disabled = true;

        // Start conversion timer
        conversionStartTime = Date.now();

        // Simulate conversion process
        simulateConversion(videoId, quality, format, addMetadata, normalizeAudio);
    }

    function simulateConversion(videoId, quality, format, addMetadata, normalizeAudio) {
        let progress = 0;
        const totalSteps = 6;
        const stepTime = 800;

        const conversionSteps = [
            'Downloading video...',
            'Extracting audio stream...',
            'Converting to MP3 format...',
            addMetadata ? 'Adding ID3 tags...' : 'Processing audio...',
            normalizeAudio ? 'Normalizing audio levels...' : 'Encoding audio...',
            'Finalizing MP3 file...'
        ];

        function updateProgress() {
            if (progress < totalSteps) {
                const percent = (progress / totalSteps) * 100;
                progressFill.style.width = percent + '%';
                progressPercent.textContent = Math.round(percent) + '%';
                progressText.textContent = conversionSteps[progress];
                
                // Update estimated time (decreases as progress increases)
                const remainingTime = Math.max(5, 30 - (progress * 5));
                estimatedTime.textContent = `${remainingTime} seconds`;
                
                // Update estimated file size based on quality
                const baseSize = 2.5; // MB for 128kbps
                const qualityMultiplier = parseInt(quality) / 128;
                const fileSize = (baseSize * qualityMultiplier).toFixed(1);
                estimatedSize.textContent = `~${fileSize} MB`;
                
                progress++;
                setTimeout(updateProgress, stepTime);
            } else {
                // Conversion complete
                completeConversion(videoId, quality, format);
            }
        }

        updateProgress();
    }

    function completeConversion(videoId, quality, format) {
        const conversionEndTime = Date.now();
        const conversionDuration = (conversionEndTime - conversionStartTime) / 1000;

        // Hide progress and show result
        conversionProgress.style.display = 'none';
        resultSection.style.display = 'block';

        // Update result information
        const fileName = `youtube-audio-${videoId}.${format}`;
        const fileSize = (2.5 * (parseInt(quality) / 128)).toFixed(1);
        
        resultFileName.textContent = fileName;
        resultFileSize.textContent = `${fileSize} MB`;
        resultQuality.textContent = `${quality} kbps ${format.toUpperCase()}`;
        conversionTime.textContent = conversionDuration.toFixed(1) + ' seconds';

        showNotification('Conversion completed successfully!');
    }

    function downloadMp3() {
        const videoId = extractVideoId(youtubeUrl.value.trim());
        if (!videoId) return;

        const quality = document.getElementById('audioQuality').value;
        const format = document.getElementById('outputFormat').value;
        const fileName = `youtube-audio-${videoId}.${format}`;

        // Create a sample MP3 file (in real implementation, this would be the actual converted file)
        const sampleContent = `This is a simulated MP3 file converted from YouTube video: ${videoId}
        
Conversion Details:
- Quality: ${quality} kbps
- Format: ${format.toUpperCase()}
- Video ID: ${videoId}

Note: This is a demo version. In a real implementation, this would be the actual audio file.`;

        // Create and download the file
        const blob = new Blob([sampleContent], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('MP3 file downloaded!');
    }

    function resetConverter() {
        youtubeUrl.value = '';
        updateUrlStatus();
        hideVideoPreview();
        hideAllSections();
        
        // Reset options to default
        document.getElementById('audioQuality').value = '192';
        document.getElementById('outputFormat').value = 'mp3';
        document.getElementById('addMetadata').checked = true;
        document.getElementById('normalizeAudio').checked = false;
        
        // Reset progress
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
    }

    function hideAllSections() {
        conversionProgress.style.display = 'none';
        resultSection.style.display = 'none';
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
