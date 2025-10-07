/*
File: js/meme-captioner.js
Description: Minimized Core logic for the Meme Captioner tool (Enhanced version).
Dependencies: common.js (for memoryStore, copyToClipboard, downloadFile, showAlert, debounce)
*/

// --- 1. DOM Elements & State ---
const DOM = {
    imageUpload: document.getElementById('image-upload'),
    topTextInput: document.getElementById('top-text'),
    bottomTextInput: document.getElementById('bottom-text'),
    downloadButton: document.getElementById('download-btn'),
    copyButton: document.getElementById('copy-btn'),
    shareTwitterBtn: document.getElementById('share-twitter-btn'),
    canvas: document.getElementById('meme-canvas'),
    ctx: document.getElementById('meme-canvas').getContext('2d'),
    canvasArea: document.querySelector('.canvas-area'),
    
    // Control elements
    fontSelect: document.getElementById('font-select'),
    fontSizeSlider: document.getElementById('font-size'),
    outlineWidthSlider: document.getElementById('outline-width'),
    textColorPicker: document.getElementById('text-color'),
    outlineColorPicker: document.getElementById('outline-color'),
    topPositionSlider: document.getElementById('top-position'),
    bottomPositionSlider: document.getElementById('bottom-position'),
    watermarkToggle: document.getElementById('watermark-toggle'),
    qualitySlider: document.getElementById('quality-slider'),
    
    // Buttons
    clearImageBtn: document.getElementById('clear-image-btn'),
    clearTextBtn: document.getElementById('clear-text-btn'),
    swapTextBtn: document.getElementById('swap-text-btn'),
    templateButtons: document.getElementById('template-buttons'),

    // Slider values
    sizeValue: document.getElementById('size-value'),
    outlineValue: document.getElementById('outline-value'),
    qualityValue: document.getElementById('quality-value')
};

const STATE_KEY = 'meme-settings';
let currentImage = null; // The loaded image object
let currentSettings = {}; // All customizable settings

const MEME_TEMPLATES = {
    drake: '../assets/memes/drake.jpg',
    distracted: '../assets/memes/distracted.jpg',
    success: '../assets/memes/success.jpg',
    rollsafe: '../assets/memes/rollsafe.jpg',
};

// --- 2. CORE DRAWING LOGIC (Simplified & Minimized) ---

function drawText(text, x, y, isTop) {
    const { ctx, canvas } = DOM;
    
    // Calculate font size relative to image height (canvas.height)
    const fontSize = canvas.height * (currentSettings.fontSize / 100) * 0.1;
    const outlineWidth = fontSize * (currentSettings.outlineWidth / 100);
    
    ctx.font = `${currentSettings.fontStyle} ${fontSize}px ${currentSettings.fontStyle}`;
    ctx.textAlign = 'center';
    
    // Text Position calculation
    const verticalPosition = isTop 
        ? canvas.height * (currentSettings.topPosition / 100)
        : canvas.height * (1 - (currentSettings.bottomPosition / 100));
        
    // Draw Outline
    ctx.strokeStyle = currentSettings.outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.strokeText(text.toUpperCase(), x, verticalPosition);
    
    // Draw Fill Text
    ctx.fillStyle = currentSettings.textColor;
    ctx.fillText(text.toUpperCase(), x, verticalPosition);
}

function drawMeme() {
    const { ctx, canvas } = DOM;
    if (!currentImage) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Placeholder text/background here if needed, but usually just clear.
        DOM.downloadButton.disabled = true;
        DOM.copyButton.disabled = true;
        DOM.shareTwitterBtn.disabled = true;
        return;
    }

    // Set canvas dimensions to match image aspect ratio, max 600px width (handled by CSS)
    const ratio = currentImage.width / currentImage.height;
    const canvasWidth = 600; // Use a fixed reference size for drawing
    const canvasHeight = 600 / ratio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Draw Image
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    // Draw Text
    drawText(DOM.topTextInput.value, canvas.width / 2, 0, true);
    drawText(DOM.bottomTextInput.value, canvas.width / 2, 0, false);
    
    // Draw Watermark
    if (currentSettings.watermark) {
        ctx.fillStyle = 'rgba(0, 245, 160, 0.6)'; // GRIFTS accent green
        ctx.font = 'bold 20px Roboto'; // Fixed size watermark
        ctx.textAlign = 'right';
        ctx.fillText('GRIFTS.CO.UK', canvas.width - 10, canvas.height - 10);
    }
    
    // Enable buttons
    DOM.downloadButton.disabled = false;
    DOM.copyButton.disabled = false;
    DOM.shareTwitterBtn.disabled = false;
}

// --- 3. Image & Template Handlers ---

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Necessary for template images
    img.onload = () => {
        currentImage = img;
        DOM.topTextInput.value = ''; // Clear text on new image load
        DOM.bottomTextInput.value = '';
        saveSettings();
        drawMeme();
    };
    img.onerror = () => showAlert('Error loading image. Please try another one.', 'error');
    img.src = src;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => loadImage(e.target.result);
        reader.readAsDataURL(file);
    }
}

const applyTemplate = (templateName) => {
    if (MEME_TEMPLATES[templateName]) {
        loadImage(MEME_TEMPLATES[templateName]);
        showAlert(`Template loaded: ${templateName}!`, 'success');
    }
};

// --- 4. Settings & Storage ---

function loadSettings() {
    // Load from memoryStore or use defaults
    const stored = memoryStore.getItem(STATE_KEY);
    currentSettings = stored ? stored.value : {
        topText: '', bottomText: '', fontStyle: 'Impact', 
        fontSize: 90, outlineWidth: 10, textColor: '#ffffff', 
        outlineColor: '#000000', topPosition: 10, bottomPosition: 10,
        watermark: true, quality: 90
    };
    
    // Apply settings to DOM elements (simplified)
    DOM.topTextInput.value = currentSettings.topText || '';
    DOM.bottomTextInput.value = currentSettings.bottomText || '';
    DOM.fontSelect.value = currentSettings.fontStyle;
    DOM.fontSizeSlider.value = currentSettings.fontSize;
    DOM.outlineWidthSlider.value = currentSettings.outlineWidth;
    DOM.textColorPicker.value = currentSettings.textColor;
    DOM.outlineColorPicker.value = currentSettings.outlineColor;
    DOM.topPositionSlider.value = currentSettings.topPosition;
    DOM.bottomPositionSlider.value = currentSettings.bottomPosition;
    DOM.watermarkToggle.checked = currentSettings.watermark;
    DOM.qualitySlider.value = currentSettings.quality;

    updateSliderDisplays();
    drawMeme();
}

function saveSettings() {
    currentSettings = {
        topText: DOM.topTextInput.value,
        bottomText: DOM.bottomTextInput.value,
        fontStyle: DOM.fontSelect.value,
        fontSize: parseInt(DOM.fontSizeSlider.value),
        outlineWidth: parseInt(DOM.outlineWidthSlider.value),
        textColor: DOM.textColorPicker.value,
        outlineColor: DOM.outlineColorPicker.value,
        topPosition: parseInt(DOM.topPositionSlider.value),
        bottomPosition: parseInt(DOM.bottomPositionSlider.value),
        watermark: DOM.watermarkToggle.checked,
        quality: parseInt(DOM.qualitySlider.value)
    };
    memoryStore.setItem(STATE_KEY, currentSettings);
    drawMeme();
}

const updateSliderDisplays = () => {
    DOM.sizeValue.textContent = DOM.fontSizeSlider.value + '%';
    DOM.outlineValue.textContent = DOM.outlineWidthSlider.value + '%';
    DOM.qualityValue.textContent = DOM.qualitySlider.value + '%';
};

// --- 5. Action Functions ---

const downloadMeme = () => {
    if (!currentImage) return showAlert('Please load an image first.', 'info');
    
    // Use JPEG for better sharing compatibility if quality is adjusted, otherwise PNG.
    const mimeType = DOM.qualitySlider.value < 100 ? 'image/jpeg' : 'image/png';
    const quality = DOM.qualitySlider.value / 100;
    
    const dataURL = DOM.canvas.toDataURL(mimeType, quality);
    if (typeof downloadFile === 'function') {
        downloadFile(dataURL, `grifts-meme-${Date.now()}.${mimeType.split('/')[1]}`);
    }
};

const copyMeme = () => {
    if (!currentImage) return showAlert('Please load an image first.', 'info');
    
    DOM.canvas.toBlob((blob) => {
        if (typeof copyToClipboard === 'function') {
            copyToClipboard(blob);
            showAlert('Meme image copied to clipboard!', 'success');
        }
    }, 'image/png');
};

const shareOnX = () => {
    const text = `Check out this viral meme I made with the GRIFTS Meme Captioner! #GRIFTS #MemeMaker ${window.location.href}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
};

// --- 6. Initialization & Event Listeners (Minimized) ---

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // A. Image & Text Input Listeners (Drawing and Saving)
    const drawAndSave = typeof debounce === 'function' ? debounce(saveSettings, 50) : saveSettings;
    
    [DOM.topTextInput, DOM.bottomTextInput].forEach(input => {
        input.addEventListener('input', drawAndSave);
    });
    
    DOM.imageUpload.addEventListener('change', handleImageUpload);

    // B. Control Input Listeners (Drawing, Saving, and Updating Sliders)
    const controlElements = [
        DOM.fontSelect, DOM.textColorPicker, DOM.outlineColorPicker, DOM.watermarkToggle,
        DOM.fontSizeSlider, DOM.outlineWidthSlider, DOM.topPositionSlider, 
        DOM.bottomPositionSlider, DOM.qualitySlider
    ];
    
    controlElements.forEach(element => {
        element.addEventListener('change', saveSettings);
        element.addEventListener('input', () => {
            if (element.type === 'range') updateSliderDisplays();
            drawAndSave();
        });
    });

    // C. Action Button Listeners
    DOM.downloadButton.addEventListener('click', downloadMeme);
    DOM.copyButton.addEventListener('click', copyMeme);
    DOM.shareTwitterBtn.addEventListener('click', shareOnX);
    
    DOM.clearTextBtn.addEventListener('click', () => {
        DOM.topTextInput.value = '';
        DOM.bottomTextInput.value = '';
        saveSettings();
    });
    
    DOM.clearImageBtn.addEventListener('click', () => {
        currentImage = null;
        drawMeme();
        showAlert('Image cleared!', 'info');
    });
    
    DOM.swapTextBtn.addEventListener('click', () => {
        [DOM.topTextInput.value, DOM.bottomTextInput.value] = [DOM.bottomTextInput.value, DOM.topTextInput.value];
        saveSettings();
    });

    // D. Template Buttons Listener (Event Delegation)
    DOM.templateButtons.addEventListener('click', (e) => {
        if (e.target.dataset.template) {
            applyTemplate(e.target.dataset.template);
        }
    });

    // E. Global Keyboard Shortcut for Randomization
    document.addEventListener('keydown', (e) => {
        if (e.key.toUpperCase() === 'R' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            // Future feature: Randomize position/font
        }
    });

    // F. Handle Resize (Debounced)
    const debouncedResize = typeof debounce === 'function' ? debounce(drawMeme, 250) : drawMeme;
    window.addEventListener('resize', debouncedResize);
});
