// Image Compressor - Simplified Working Version
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const compressBtn = document.getElementById('compressBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const removeFile = document.getElementById('removeFile');
    const comparisonSection = document.getElementById('comparisonSection');
    
    // File info elements
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDimensions = document.getElementById('fileDimensions');
    
    // Compression options
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const maxWidth = document.getElementById('maxWidth');
    const outputFormat = document.getElementById('outputFormat');
    
    // Comparison elements
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const originalDimensions = document.getElementById('originalDimensions');
    const compressedSize = document.getElementById('compressedSize');
    const compressedDimensions = document.getElementById('compressedDimensions');
    const sizeReduction = document.getElementById('sizeReduction');
    const savingsBadge = document.getElementById('savingsBadge');
    const savingsPercent = document.getElementById('savingsPercent');
    
    // Stats elements
    const fileSizeReduction = document.getElementById('fileSizeReduction');
    const qualityScore = document.getElementById('qualityScore');
    const compressionRatio = document.getElementById('compressionRatio');
    const estimatedSavings = document.getElementById('estimatedSavings');
    
    // Download buttons
    const downloadOriginal = document.getElementById('downloadOriginal');
    const downloadCompressed = document.getElementById('downloadCompressed');
    const copyCompressed = document.getElementById('copyCompressed');

    let originalFile = null;
    let compressedBlob = null;
    let originalImageData = null;

    // Initialize
    updateQualityValue();

    // Quality slider update
    qualitySlider.addEventListener('input', function() {
        updateQualityValue();
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#ffd700';
        uploadArea.style.backgroundColor = '#1a1a1a';
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = '#ffd700';
        uploadArea.style.backgroundColor = '#000000';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#ffd700';
        uploadArea.style.backgroundColor = '#000000';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    // File input change
    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });

    // Click on upload area
    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });

    // Remove file
    removeFile.addEventListener('click', function() {
        resetCompressor();
        showNotification('File removed');
    });

    // Compress button
    compressBtn.addEventListener('click', function() {
        compressImage();
    });

    // Sample image
    sampleBtn.addEventListener('click', function() {
        createSampleImage();
    });

    // Download original
    downloadOriginal.addEventListener('click', function() {
        if (originalFile) {
            downloadFile(originalFile, 'original-' + originalFile.name);
        }
    });

    // Download compressed
    downloadCompressed.addEventListener('click', function() {
        if (compressedBlob) {
            const extension = getFileExtension();
            const filename = 'compressed-image.' + extension;
            downloadBlob(compressedBlob, filename);
        }
    });

    // Copy compressed image
    copyCompressed.addEventListener('click', function() {
        if (compressedBlob) {
            showNotification('In a real implementation, image would be copied to clipboard');
        }
    });

    function updateQualityValue() {
        qualityValue.textContent = qualitySlider.value + '%';
    }

    function handleImageFile(file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
            showNotification('Please select a valid image file!');
            return;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('File size too large! Please select an image under 10MB.');
            return;
        }

        originalFile = file;

        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        // Load image to get dimensions
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                fileDimensions.textContent = `${img.width} × ${img.height}`;
                originalImageData = {
                    width: img.width,
                    height: img.height,
                    src: e.target.result
                };
                
                // Show original image in comparison
                originalImage.src = e.target.result;
                originalDimensions.textContent = `${img.width} × ${img.height}`;
                originalSize.textContent = formatFileSize(file.size);
                
                // Enable download original button
                downloadOriginal.disabled = false;
                
                // Show file info and enable compress button
                fileInfo.style.display = 'flex';
                compressBtn.disabled = false;

                showNotification('Image loaded successfully!');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function createSampleImage() {
        // Create a simple sample image using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Create a colorful gradient background
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Add some shapes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(200, 200, 80, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(600, 400, 100, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SAMPLE IMAGE', 400, 250);
        
        ctx.font = '24px Arial';
        ctx.fillText('For Compression Testing', 400, 300);
        ctx.fillText('800 × 600 pixels', 400, 350);
        
        // Convert to blob and create file
        canvas.toBlob(function(blob) {
            const file = new File([blob], 'sample-image.jpg', { type: 'image/jpeg' });
            handleImageFile(file);
            showNotification('Sample image loaded!');
        }, 'image/jpeg', 0.95);
    }

    function compressImage() {
        if (!originalFile || !originalImageData) {
            showNotification('Please select an image first!');
            return;
        }

        // Show loading state
        compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';
        compressBtn.disabled = true;

        // Get compression settings
        const quality = parseInt(qualitySlider.value) / 100;
        const maxWidthValue = parseInt(maxWidth.value) || 0;
        const format = outputFormat.value;

        // Perform compression
        performCompression(quality, maxWidthValue, format);
    }

    function performCompression(quality, maxWidth, format) {
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions
            let newWidth = img.width;
            let newHeight = img.height;

            if (maxWidth > 0 && img.width > maxWidth) {
                newWidth = maxWidth;
                newHeight = (img.height * maxWidth) / img.width;
            }

            // Set canvas dimensions
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Fill with white background (for JPEG transparency)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, newWidth, newHeight);
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Determine output format
            let mimeType = 'image/jpeg';
            switch (format) {
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    break;
                case 'same':
                    mimeType = originalFile.type || 'image/jpeg';
                    break;
                default:
                    mimeType = 'image/jpeg';
            }

            // Convert to blob with quality
            canvas.toBlob(function(blob) {
                if (!blob) {
                    showNotification('Compression failed. Please try again.');
                    resetCompressButton();
                    return;
                }

                compressedBlob = blob;

                // Create URL for compressed image
                const compressedUrl = URL.createObjectURL(blob);
                
                // Display compressed image
                compressedImage.src = compressedUrl;
                compressedDimensions.textContent = `${newWidth} × ${newHeight}`;
                compressedSize.textContent = formatFileSize(blob.size);

                // Calculate savings
                const originalSizeBytes = originalFile.size;
                const compressedSizeBytes = blob.size;
                const reduction = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100;
                
                // Update UI with results
                sizeReduction.textContent = `${reduction.toFixed(1)}% smaller`;
                savingsPercent.textContent = `${reduction.toFixed(1)}%`;
                fileSizeReduction.textContent = `${reduction.toFixed(1)}%`;
                qualityScore.textContent = `${Math.max(30, 100 - reduction / 3).toFixed(0)}%`;
                compressionRatio.textContent = `1:${(originalSizeBytes / compressedSizeBytes).toFixed(1)}`;
                estimatedSavings.textContent = formatFileSize(originalSizeBytes - compressedSizeBytes);

                // Show comparison section
                comparisonSection.style.display = 'block';
                resetCompressButton();
                
                showNotification('Image compressed successfully!');
                
                // Scroll to results
                setTimeout(() => {
                    comparisonSection.scrollIntoView({ behavior: 'smooth' });
                }, 500);

            }, mimeType, quality);

        };

        img.src = originalImageData.src;
    }

    function resetCompressButton() {
        compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
        compressBtn.disabled = false;
    }

    function downloadFile(file, filename) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Download started!');
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Compressed image downloaded!');
    }

    function getFileExtension() {
        const format = outputFormat.value;
        switch (format) {
            case 'png': return 'png';
            case 'webp': return 'webp';
            case 'jpeg': return 'jpg';
            case 'same': 
            default: 
                return originalFile ? originalFile.name.split('.').pop() : 'jpg';
        }
    }

    function resetCompressor() {
        imageInput.value = '';
        originalFile = null;
        compressedBlob = null;
        originalImageData = null;
        
        // Hide sections
        fileInfo.style.display = 'none';
        comparisonSection.style.display = 'none';
        
        // Disable buttons
        compressBtn.disabled = true;
        downloadOriginal.disabled = true;
        
        // Reset options to default
        qualitySlider.value = 80;
        maxWidth.value = 1920;
        outputFormat.value = 'same';
        updateQualityValue();
        
        // Clear images
        originalImage.src = '';
        compressedImage.src = '';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

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
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
});
