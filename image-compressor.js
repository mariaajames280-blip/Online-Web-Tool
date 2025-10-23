// Image Compressor - Simple Working Version
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
    
    // Comparison elements
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const originalDimensions = document.getElementById('originalDimensions');
    const compressedSize = document.getElementById('compressedSize');
    const compressedDimensions = document.getElementById('compressedDimensions');
    const sizeReduction = document.getElementById('sizeReduction');
    const savingsPercent = document.getElementById('savingsPercent');
    
    // Stats elements
    const fileSizeReduction = document.getElementById('fileSizeReduction');
    const qualityScore = document.getElementById('qualityScore');
    const compressionRatio = document.getElementById('compressionRatio');
    const estimatedSavings = document.getElementById('estimatedSavings');
    
    // Download buttons
    const downloadOriginal = document.getElementById('downloadOriginal');
    const downloadCompressed = document.getElementById('downloadCompressed');

    let originalFile = null;
    let compressedBlob = null;
    let originalImageUrl = null;

    // Initialize
    updateQualityValue();

    // Quality slider update
    qualitySlider.addEventListener('input', updateQualityValue);

    function updateQualityValue() {
        qualityValue.textContent = qualitySlider.value + '%';
    }

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
    removeFile.addEventListener('click', resetCompressor);

    // Compress button
    compressBtn.addEventListener('click', compressImage);

    // Sample image
    sampleBtn.addEventListener('click', createSampleImage);

    // Download buttons
    downloadOriginal.addEventListener('click', downloadOriginalImage);
    downloadCompressed.addEventListener('click', downloadCompressedImage);

    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select a valid image file!');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large! Please select an image under 10MB.');
            return;
        }

        originalFile = file;

        // Create object URL for the original image
        if (originalImageUrl) {
            URL.revokeObjectURL(originalImageUrl);
        }
        originalImageUrl = URL.createObjectURL(file);

        // Display original image
        originalImage.src = originalImageUrl;
        
        // Get image dimensions
        const img = new Image();
        img.onload = function() {
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileDimensions.textContent = `${img.width} × ${img.height}`;
            originalDimensions.textContent = `${img.width} × ${img.height}`;
            originalSize.textContent = formatFileSize(file.size);
            
            fileInfo.style.display = 'flex';
            compressBtn.disabled = false;
            downloadOriginal.disabled = false;
            
            showNotification('Image loaded successfully!');
        };
        img.src = originalImageUrl;
    }

    function createSampleImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // Create background
        const gradient = ctx.createLinearGradient(0, 0, 600, 400);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 400);
        
        // Add text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SAMPLE IMAGE', 300, 180);
        ctx.font = '18px Arial';
        ctx.fillText('Drag & Drop Your Image Here', 300, 220);
        ctx.fillText('Or Click to Browse', 300, 250);
        
        // Convert to blob
        canvas.toBlob(function(blob) {
            const file = new File([blob], 'sample-image.jpg', { type: 'image/jpeg' });
            handleImageFile(file);
        }, 'image/jpeg', 0.9);
    }

    function compressImage() {
        if (!originalFile) return;

        compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';
        compressBtn.disabled = true;

        const quality = parseInt(qualitySlider.value) / 100;
        const maxWidthValue = parseInt(maxWidth.value) || 0;

        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions
            let newWidth = img.width;
            let newHeight = img.height;
            if (maxWidthValue > 0 && img.width > maxWidthValue) {
                newWidth = maxWidthValue;
                newHeight = (img.height * maxWidthValue) / img.width;
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw image
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Compress to JPEG
            canvas.toBlob(function(blob) {
                compressedBlob = blob;
                const compressedUrl = URL.createObjectURL(blob);
                
                // Display compressed image
                compressedImage.src = compressedUrl;
                compressedDimensions.textContent = `${newWidth} × ${newHeight}`;
                compressedSize.textContent = formatFileSize(blob.size);

                // Calculate savings
                const originalSizeBytes = originalFile.size;
                const compressedSizeBytes = blob.size;
                const reduction = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100;
                
                // Update UI
                sizeReduction.textContent = `${reduction.toFixed(1)}% smaller`;
                savingsPercent.textContent = `${reduction.toFixed(1)}%`;
                fileSizeReduction.textContent = `${reduction.toFixed(1)}%`;
                qualityScore.textContent = `${Math.max(50, 100 - reduction / 2).toFixed(0)}%`;
                compressionRatio.textContent = `1:${(originalSizeBytes / compressedSizeBytes).toFixed(1)}`;
                estimatedSavings.textContent = formatFileSize(originalSizeBytes - compressedSizeBytes);

                // Show results
                comparisonSection.style.display = 'block';
                compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
                compressBtn.disabled = false;
                
                showNotification('Image compressed successfully!');

            }, 'image/jpeg', quality);
        };
        img.src = originalImageUrl;
    }

    function downloadOriginalImage() {
        if (originalFile) {
            const url = URL.createObjectURL(originalFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'original-' + originalFile.name;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('Original image downloaded!');
        }
    }

    function downloadCompressedImage() {
        if (compressedBlob) {
            const url = URL.createObjectURL(compressedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed-image.jpg';
            a.click();
            URL.revokeObjectURL(url);
            showNotification('Compressed image downloaded!');
        }
    }

    function resetCompressor() {
        imageInput.value = '';
        originalFile = null;
        compressedBlob = null;
        
        if (originalImageUrl) {
            URL.revokeObjectURL(originalImageUrl);
            originalImageUrl = null;
        }
        
        fileInfo.style.display = 'none';
        comparisonSection.style.display = 'none';
        compressBtn.disabled = true;
        downloadOriginal.disabled = true;
        
        qualitySlider.value = 80;
        maxWidth.value = 1920;
        updateQualityValue();
        
        originalImage.src = '';
        compressedImage.src = '';
        
        showNotification('Reset complete!');
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
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());
        
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
            notification.remove();
        }, 3000);
    }
});
