// PDF to Word Converter
document.addEventListener('DOMContentLoaded', function() {
    const pdfInput = document.getElementById('pdfInput');
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const convertBtn = document.getElementById('convertBtn');
    const clearAll = document.getElementById('clearAll');
    const resultSection = document.getElementById('resultSection');
    const conversionProgress = document.getElementById('conversionProgress');
    
    // File info elements
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileStatus = document.getElementById('fileStatus');
    const removeFile = document.getElementById('removeFile');
    
    // Result elements
    const resultFileName = document.getElementById('resultFileName');
    const resultFileSize = document.getElementById('resultFileSize');
    const conversionTime = document.getElementById('conversionTime');
    const downloadBtn = document.getElementById('downloadBtn');
    const convertAnother = document.getElementById('convertAnother');
    
    // Progress elements
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');

    let currentFile = null;
    let conversionStartTime = 0;

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
            handlePdfFile(files[0]);
        }
    });

    // File input change
    pdfInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handlePdfFile(e.target.files[0]);
        }
    });

    // Click on upload area
    uploadArea.addEventListener('click', function() {
        pdfInput.click();
    });

    // Remove file
    removeFile.addEventListener('click', function() {
        resetConverter();
        showNotification('File removed');
    });

    // Convert button
    convertBtn.addEventListener('click', function() {
        convertPdfToWord();
    });

    // Clear all
    clearAll.addEventListener('click', function() {
        resetConverter();
        showNotification('All cleared!');
    });

    // Download result
    downloadBtn.addEventListener('click', function() {
        downloadWordFile();
    });

    // Convert another file
    convertAnother.addEventListener('click', function() {
        resetConverter();
        showNotification('Ready for new conversion!');
    });

    function handlePdfFile(file) {
        // Check if file is PDF
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
            showNotification('Please select a valid PDF file!');
            return;
        }

        // Check file size (25MB limit)
        if (file.size > 25 * 1024 * 1024) {
            showNotification('File size too large! Please select a PDF under 25MB.');
            return;
        }

        currentFile = file;

        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileStatus.textContent = 'Ready for conversion';
        fileStatus.style.color = '#28a745';

        // Show file preview and enable convert button
        filePreview.style.display = 'block';
        convertBtn.disabled = false;

        showNotification('PDF file loaded successfully!');
    }

    function convertPdfToWord() {
        if (!currentFile) {
            showNotification('Please select a PDF file first!');
            return;
        }

        // Get conversion options
        const outputFormat = document.getElementById('outputFormat').value;
        const quality = document.getElementById('quality').value;
        const preserveLayout = document.getElementById('preserveLayout').checked;
        const extractImages = document.getElementById('extractImages').checked;

        // Hide result section and show progress
        resultSection.style.display = 'none';
        conversionProgress.style.display = 'block';
        convertBtn.disabled = true;

        // Start conversion timer
        conversionStartTime = Date.now();

        // Simulate conversion process with progress updates
        simulateConversion(currentFile, outputFormat, quality, preserveLayout, extractImages);
    }

    function simulateConversion(file, format, quality, preserveLayout, extractImages) {
        let progress = 0;
        const totalSteps = 5;
        const stepTime = quality === 'fast' ? 300 : quality === 'medium' ? 500 : 800;

        const conversionSteps = [
            'Reading PDF document...',
            'Extracting text content...',
            preserveLayout ? 'Preserving layout...' : 'Processing content...',
            extractImages ? 'Extracting images...' : 'Formatting document...',
            'Creating Word file...',
            'Finalizing conversion...'
        ];

        function updateProgress() {
            if (progress < totalSteps) {
                const percent = (progress / totalSteps) * 100;
                progressFill.style.width = percent + '%';
                progressPercent.textContent = Math.round(percent) + '%';
                progressText.textContent = conversionSteps[progress];
                
                progress++;
                setTimeout(updateProgress, stepTime);
            } else {
                // Conversion complete
                completeConversion(file, format);
            }
        }

        updateProgress();
    }

    function completeConversion(file, format) {
        const conversionEndTime = Date.now();
        const conversionDuration = (conversionEndTime - conversionStartTime) / 1000;

        // Hide progress and show result
        conversionProgress.style.display = 'none';
        resultSection.style.display = 'block';

        // Update result information
        const outputExtension = format === 'docx' ? '.docx' : format === 'doc' ? '.doc' : '.rtf';
        const outputFileName = file.name.replace('.pdf', outputExtension);
        
        resultFileName.textContent = outputFileName;
        resultFileSize.textContent = formatFileSize(file.size * 0.8); // Simulate different file size
        conversionTime.textContent = conversionDuration.toFixed(1) + ' seconds';

        showNotification('PDF converted to Word successfully!');
    }

    function downloadWordFile() {
        if (!currentFile) return;

        const outputFormat = document.getElementById('outputFormat').value;
        const outputExtension = outputFormat === 'docx' ? '.docx' : outputFormat === 'doc' ? '.doc' : '.rtf';
        const outputFileName = currentFile.name.replace('.pdf', outputExtension);

        // Create a sample Word file content (in real implementation, this would be the actual converted content)
        const sampleContent = `This is a simulated Word document converted from: ${currentFile.name}
        
Conversion completed successfully!
Original PDF: ${currentFile.name}
File size: ${formatFileSize(currentFile.size)}
Conversion format: ${outputFormat.toUpperCase()}

Note: This is a demo version. In a real implementation, this would be the actual converted Word document content.`;

        // Create and download the file
        const blob = new Blob([sampleContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Word document downloaded!');
    }

    function resetConverter() {
        pdfInput.value = '';
        currentFile = null;
        
        // Hide sections
        filePreview.style.display = 'none';
        resultSection.style.display = 'none';
        conversionProgress.style.display = 'none';
        
        // Disable convert button
        convertBtn.disabled = true;
        
        // Reset options to default
        document.getElementById('outputFormat').value = 'docx';
        document.getElementById('quality').value = 'medium';
        document.getElementById('preserveLayout').checked = true;
        document.getElementById('extractImages').checked = false;
        
        // Reset progress
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
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

    // Initialize
    resetConverter();
});
