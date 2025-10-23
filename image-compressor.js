// Image Compressor
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

    // Sample image URL (a free stock photo)
    const sampleImageUrl = 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80';

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
        loadSampleImage();
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
            const extension = getFileExtension(outputFormat.value);
            const filename = 'compressed-' + originalFile.name.replace(/\.[^/.]+$/, "") + '.' + extension;
            downloadBlob(compressedBlob, filename);
        }
    });

    // Copy compressed image
    copyCompressed.addEventListener('click', async function() {
        if (compressedBlob) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [compressedBlob.type]: compressedBlob
                    })
                ]);
                showNotification('Compressed image copied to clipboard!');
            } catch (err) {
                showNotification('Failed to copy image to clipboard');
            }
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
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Show file info and enable compress button
        fileInfo.style.display = 'flex';
        compressBtn.disabled = false;

        showNotification('Image loaded successfully!');
    }

    function loadSampleImage() {
        showNotification('Loading sample image...');
        
        // Create a fake file object for the sample image
        fetch(sampleImageUrl)
            .then(response => response.blob())
            .then(blob => {
                const file = new File([blob], 'sample-image.jpg', { type: 'image/jpeg' });
                handleImageFile(file);
                showNotification('Sample image loaded!');
            })
            .catch(error => {
                showNotification('Failed to load sample image');
                console.error('Error loading sample image:', error);
            });
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

        // Simulate compression process
        setTimeout(() => {
            try {
                performCompression(quality, maxWidthValue, format);
                
                compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
                compressBtn.disabled = false;
                
                showNotification('Image compressed successfully!');
            } catch (error) {
                showNotification('Error compressing image. Please try again.');
                compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
                compressBtn.disabled = false;
            }
        }, 1000);
    }

    function performCompression(quality, maxWidth, format) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
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

            // Draw image on canvas with compression
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Get compressed image data
            let mimeType = 'image/jpeg';
            let qualityValue = quality;

            switch (format) {
                case 'png':
                    mimeType = 'image/png';
                    qualityValue = undefined; // PNG doesn't use quality parameter
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    break;
                case 'jpeg':
                default:
                    mimeType = 'image/jpeg';
                    break;
            }

            // Convert canvas to blob
            canvas.toBlob(function(blob) {
                if (!blob) {
                    showNotification('Compression failed. Please try again.');
                    return;
                }

                compressedBlob = blob;

                // Create object URL for compressed image
                const compressedUrl = URL.createObjectURL(blob);

                // Update compressed image display
                compressedImage.src = compressedUrl;
                compressedDimensions.textContent = `${newWidth} × ${newHeight}`;
                compressedSize.textContent = formatFileSize(blob.size);

                // Calculate and display savings
                const originalSizeBytes = originalFile.size;
                const compressedSizeBytes = blob.size;
                const reduction = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100;
                
                sizeReduction.textContent = `${reduction.toFixed(1)}% smaller`;
                savingsPercent.textContent = `${reduction.toFixed(1)}%`;
                fileSizeReduction.textContent = `${reduction.toFixed(1)}%`;
                
                // Update stats
                qualityScore.textContent = `${Math.max(10, 100 - reduction / 2).toFixed(0)}%`;
                compressionRatio.textContent = `1:${(originalSizeBytes / compressedSizeBytes).toFixed(1)}`;
                estimatedSavings.textContent = formatFileSize(originalSizeBytes - compressedSizeBytes);

                // Show comparison section
                comparisonSection.style.display = 'block';

                // Scroll to comparison section
                comparisonSection.scrollIntoView({ behavior: 'smooth' });

            }, mimeType, qualityValue);

        };

        img.src = originalImageData.src;
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
    }

    function getFileExtension(format) {
        switch (format) {
            case 'jpeg': return 'jpg';
            case 'png': return 'png';
            case 'webp': return 'webp';
            default: return 'jpg';
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
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
