/*
File: js/meme-captioner.js
Description: In-browser meme generation using Canvas API.
Version: 3.1 - Fully modularized, using AppCore for debouncing and downloading.
*/

const MemeCaptioner = (() => {
    // Check for AppCore availability
    if (typeof AppCore === 'undefined' || typeof Tracker === 'undefined') {
        console.error('GRIFTS ERROR: AppCore or Tracker module not loaded. Cannot initialize Meme Captioner.');
        return {}; // Return empty module if core dependencies are missing
    }

    // --- 0. DOM Elements & State ---
    const elements = {
        canvas: document.getElementById('meme-canvas'),
        placeholder: document.getElementById('upload-placeholder'),
        fileInput: document.getElementById('image-upload-input'),
        topText: document.getElementById('top-text-input'),
        bottomText: document.getElementById('bottom-text-input'),
        fontSizeRange: document.getElementById('font-size-range'),
        fontSizeValue: document.getElementById('font-size-value'),
        textColor: document.getElementById('text-color-input'),
        downloadBtn: document.getElementById('download-png-btn'),
        resetBtn: document.getElementById('reset-btn'),
        uploadLabelText: document.getElementById('upload-label-text')
    };

    // State Variables
    let ctx;
    let image = null;
    let initialImageSrc = null; // Store the original image source for the reset function

    // --- 1. Canvas & Drawing Logic ---

    /**
     * Draws text with a black outline for the classic meme look.
     * @param {string} text - The caption text.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} width - Max width for text wrapping.
     * @param {number} fontSize - Size of the font.
     * @param {string} color - Text color.
     */
    function drawCaption(text, x, y, width, fontSize, color) {
        if (!ctx) return;
        
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        // Set font to Impact or a bold sans-serif fallback for standard meme look
        ctx.font = `${fontSize}px Impact, sans-serif`;
        ctx.lineWidth = Math.max(2, fontSize / 20); // Scale line width with font size

        // Simple line wrapping (only for the single line of text in this basic tool)
        const lines = text.toUpperCase().split('\n');
        
        let currentY = y;

        for (const line of lines) {
            ctx.strokeText(line, x, currentY);
            ctx.fillText(line, x, currentY);
            currentY += fontSize + 10; // Line spacing
        }
    }

    /**
     * Main function to draw the image and all text onto the canvas.
     */
    function renderMeme() {
        if (!ctx || !image) {
            // Only update font size value if no image is loaded
            elements.fontSizeValue.textContent = elements.fontSizeRange.value;
            return;
        }
        
        // 1. Clear Canvas and Fit Image
        const canvas = elements.canvas;
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // 2. Get Settings
        const fontSize = parseInt(elements.fontSizeRange.value);
        const textColor = elements.textColor.value;
        const topText = elements.topText.value;
        const bottomText = elements.bottomText.value;

        // Update font size display
        elements.fontSizeValue.textContent = fontSize;

        // 3. Draw Top Caption
        if (topText) {
            drawCaption(
                topText,
                canvas.width / 2, // Centered X
                fontSize + 15,    // Y offset from top
                canvas.width * 0.9,
                fontSize,
                textColor
            );
        }

        // 4. Draw Bottom Caption
        if (bottomText) {
            // Calculate Y position for the bottom text's baseline
            let bottomY = canvas.height - 15;
            
            // Adjust for multiline text (simple check for single line)
            if (bottomText.includes('\n')) {
                const lineCount = bottomText.split('\n').length;
                bottomY -= (lineCount - 1) * (fontSize + 10);
            }

            drawCaption(
                bottomText,
                canvas.width / 2, // Centered X
                bottomY,
                canvas.width * 0.9,
                fontSize,
                textColor
            );
        }

        // Enable download button once rendered
        elements.downloadBtn.disabled = !image;
        elements.resetBtn.disabled = !image;
    }

    // CORRECTED: Using AppCore.debounce for performance
    const debouncedRender = AppCore.debounce(renderMeme, 100);


    // --- 2. Image Loading & Reset ---

    /**
     * Loads a file from input or drag/drop.
     * @param {File} file - The image file object.
     */
    function loadImageFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            AppCore.showAlert('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
            return;
        }

        const reader = new FileReader();
        AppCore.showLoading('Loading image...');

        reader.onload = (e) => {
            initialImageSrc = e.target.result;
            image = new Image();
            image.onload = () => {
                AppCore.hideLoading();
                elements.placeholder.style.display = 'none';
                elements.uploadLabelText.textContent = 'Change Image';
                
                // Track successful image load
                Tracker.trackEvent('meme_image_loaded');
                renderMeme();
            };
            image.onerror = () => {
                AppCore.hideLoading();
                AppCore.showAlert('Error loading image. Is the file corrupt?', 'error');
                image = null;
            };
            image.src = initialImageSrc;
        };

        reader.readAsDataURL(file);
    }

    /**
     * Resets the tool to its initial state.
     */
    function resetTool() {
        if (image && ctx) {
            ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
        }
        image = null;
        initialImageSrc = null;
        elements.topText.value = '';
        elements.bottomText.value = '';
        elements.fontSizeRange.value = 40;
        elements.textColor.value = '#ffffff';
        elements.downloadBtn.disabled = true;
        elements.resetBtn.disabled = true;
        elements.placeholder.style.display = 'flex';
        elements.uploadLabelText.textContent = 'Select New Image';

        AppCore.showAlert('Meme Captioner reset.', 'info');
        Tracker.trackEvent('meme_reset');
    }

    // --- 3. Download Logic ---

    /**
     * Downloads the canvas content as a PNG file.
     */
    function downloadMeme() {
        if (!image) {
            AppCore.showAlert('Please upload an image before downloading.', 'warning');
            return;
        }

        try {
            // Ensure the meme is rendered with the latest settings before exporting
            renderMeme();
            
            const dataURL = elements.canvas.toDataURL('image/png');
            // CORRECTED: Using AppCore.generateId and AppCore.downloadFile
            const filename = `grifts-meme-${AppCore.generateId('m')}.png`;
            AppCore.downloadFile(dataURL, filename, 'image/png');
            
            Tracker.trackEvent('meme_download', { filename: filename });

        } catch (error) {
            console.error('Download error:', error);
            AppCore.showAlert('Download failed. Try a smaller image.', 'error');
        }
    }


    // --- 4. Event Handlers & Initialization ---

    /**
     * Initializes the tool, setting up context and listeners.
     */
    function init() {
        if (!elements.canvas) {
            console.error('Canvas element not found.');
            return;
        }
        ctx = elements.canvas.getContext('2d');
        if (!ctx) {
            AppCore.showAlert('Your browser does not support the Canvas API needed for this tool.', 'error', 0);
            return;
        }

        // Set initial state
        elements.downloadBtn.disabled = true;
        elements.resetBtn.disabled = true;

        // Input Listeners (use debouncedRender for performance on text/range changes)
        elements.topText.addEventListener('input', debouncedRender);
        elements.bottomText.addEventListener('input', debouncedRender);
        elements.fontSizeRange.addEventListener('input', debouncedRender);
        elements.textColor.addEventListener('input', debouncedRender);

        // File Upload Listener
        elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                loadImageFile(e.target.files[0]);
            }
        });

        // Placeholder/Click Listener
        elements.placeholder.addEventListener('click', () => {
            elements.fileInput.click();
        });

        // Drag and Drop Listeners
        const dropArea = elements.placeholder.parentElement;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false); // Prevent global drops
        });
        dropArea.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            if (file) {
                loadImageFile(file);
            }
        }

        // Button Listeners
        elements.downloadBtn.addEventListener('click', downloadMeme);
        elements.resetBtn.addEventListener('click', resetTool);
        
        // Final event tracking
        Tracker.trackEvent('meme_captioner_initialized');
    }

    // Public interface
    return {
        init: init
    };

})();

// Initialize the tool when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MemeCaptioner.init();
});
