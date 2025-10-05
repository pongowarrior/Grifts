/*
File: js/meme-captioner.js
Description: Enhanced meme captioner with advanced controls, templates, and sharing
*/

// --- DOM Elements ---
const imageUpload = document.getElementById('image-upload');
const topTextInput = document.getElementById('top-text');
const bottomTextInput = document.getElementById('bottom-text');
const downloadButton = document.getElementById('download-btn');
const copyButton = document.getElementById('copy-btn');
const shareTwitterBtn = document.getElementById('share-twitter-btn');
const canvas = document.getElementById('meme-canvas');
const ctx = canvas.getContext('2d');
const canvasArea = document.querySelector('.canvas-area');

// Control elements
const fontSelect = document.getElementById('font-select');
const fontSizeSlider = document.getElementById('font-size');
const outlineWidthSlider = document.getElementById('outline-width');
const textColorPicker = document.getElementById('text-color');
const outlineColorPicker = document.getElementById('outline-color');
const topPositionSlider = document.getElementById('top-position');
const bottomPositionSlider = document.getElementById('bottom-position');
const watermarkToggle = document.getElementById('watermark-toggle');
const qualitySlider = document.getElementById('quality-slider');

// Button controls
const clearImageBtn = document.getElementById('clear-image-btn');
const clearTextBtn = document.getElementById('clear-text-btn');
const swapTextBtn = document.getElementById('swap-text-btn');
const resetPositionBtn = document.getElementById('reset-position-btn');
const useTemplateBtn = document.getElementById('use-template-btn');

// Value displays
const sizeValue = document.getElementById('size-value');
const outlineValue = document.getElementById('outline-value');
const topPosValue = document.getElementById('top-pos-value');
const bottomPosValue = document.getElementById('bottom-pos-value');
const qualityValue = document.getElementById('quality-value');

// State
let currentImage = null;
let recentMemes = []; // Store last 3 memes for quick access
const MAX_RECENT = 3;

// --- Meme Templates (Popular formats) ---
// Note: External URLs may have CORS restrictions
const templates = [
    { name: 'Drake', url: 'https://i.imgflip.com/30b1gx.jpg' },
    { name: 'Distracted', url: 'https://i.imgflip.com/1ur9b0.jpg' },
    { name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
    { name: 'Change Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
    { name: 'Expanding', url: 'https://i.imgflip.com/1jwhww.jpg' },
    { name: 'Surprised', url: 'https://i.imgflip.com/2fm6x.jpg' }
];

// --- 1. Initialization ---
function init() {
    // Set default text
    topTextInput.value = '';
    bottomTextInput.value = '';
    
    // Setup event listeners
    setupEventListeners();
    
    // Load templates
    loadTemplates();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initial canvas setup
    setupCanvas();
}

// --- 2. Event Listeners ---
function setupEventListeners() {
    // Image upload
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Text inputs with debounce for performance
    const debouncedDraw = typeof debounce === 'function' ? debounce(drawMeme, 150) : drawMeme;
    topTextInput.addEventListener('input', debouncedDraw);
    bottomTextInput.addEventListener('input', debouncedDraw);
    
    // Style controls
    fontSelect.addEventListener('change', drawMeme);
    fontSizeSlider.addEventListener('input', updateSliderValue);
    outlineWidthSlider.addEventListener('input', updateSliderValue);
    textColorPicker.addEventListener('input', drawMeme);
    outlineColorPicker.addEventListener('input', drawMeme);
    topPositionSlider.addEventListener('input', updateSliderValue);
    bottomPositionSlider.addEventListener('input', updateSliderValue);
    qualitySlider.addEventListener('input', updateQualityValue);
    
    // Button controls
    clearImageBtn.addEventListener('click', clearImage);
    clearTextBtn.addEventListener('click', clearText);
    swapTextBtn.addEventListener('click', swapText);
    resetPositionBtn.addEventListener('click', resetPositions);
    useTemplateBtn.addEventListener('click', toggleTemplateSelector);
    
    // Download and share
    downloadButton.addEventListener('click', downloadMeme);
    copyButton.addEventListener('click', copyToClipboardImage);
    shareTwitterBtn.addEventListener('click', shareToTwitter);
    watermarkToggle.addEventListener('change', drawMeme);
}

// --- 3. Slider Value Updates ---
function updateSliderValue(e) {
    const slider = e.target;
    
    if (slider.id === 'font-size') {
        sizeValue.textContent = slider.value + '%';
    } else if (slider.id === 'outline-width') {
        outlineValue.textContent = slider.value + '%';
    } else if (slider.id === 'top-position') {
        topPosValue.textContent = slider.value + '%';
    } else if (slider.id === 'bottom-position') {
        bottomPosValue.textContent = slider.value + '%';
    }
    
    drawMeme();
}

function updateQualityValue(e) {
    qualityValue.textContent = e.target.value + '%';
}

// --- 4. Image Loading ---
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file', 'error');
        return;
    }

    if (typeof showLoading === 'function') {
        showLoading('Loading image...');
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            drawMeme();
            if (typeof hideLoading === 'function') {
                hideLoading();
            }
            showAlert('Image loaded successfully!', 'success');
        };
        img.onerror = () => {
            if (typeof hideLoading === 'function') {
                hideLoading();
            }
            showAlert('Failed to load image. Try a different file.', 'error');
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        showAlert('Failed to read file', 'error');
    };
    reader.readAsDataURL(file);
}

// --- 5. Template System ---
function loadTemplates() {
    const templateGrid = document.getElementById('template-selector');
    templateGrid.innerHTML = '';
    
    templates.forEach((template, index) => {
        const btn = document.createElement('div');
        btn.className = 'template-btn';
        btn.style.backgroundImage = `url(${template.url})`;
        btn.setAttribute('data-template-index', index);
        btn.innerHTML = `<div class="template-label">${template.name}</div>`;
        
        btn.addEventListener('click', () => loadTemplate(template.url));
        templateGrid.appendChild(btn);
    });
}

function toggleTemplateSelector() {
    const selector = document.getElementById('template-selector');
    const isVisible = selector.style.display !== 'none';
    selector.style.display = isVisible ? 'none' : 'grid';
    useTemplateBtn.textContent = isVisible ? 'Use Template' : 'Hide Templates';
}

function loadTemplate(url) {
    if (typeof showLoading === 'function') {
        showLoading('Loading template...');
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Attempt CORS for external images
    img.onload = () => {
        currentImage = img;
        drawMeme();
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        toggleTemplateSelector();
        showAlert('Template loaded!', 'success');
    };
    img.onerror = () => {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        showAlert('Template failed to load due to CORS restrictions. Upload your own image instead.', 'error');
        toggleTemplateSelector();
    };
    img.src = url;
}

// --- 6. Canvas Setup ---
function setupCanvas() {
    // Set default canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Draw placeholder
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#999';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Upload an image or select a template', canvas.width / 2, canvas.height / 2);
}

// --- 7. Core Drawing Function ---
function drawMeme() {
    if (!currentImage) {
        setupCanvas();
        downloadButton.disabled = true;
        copyButton.disabled = true;
        shareTwitterBtn.disabled = true;
        return;
    }

    // Set canvas dimensions to match image
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    canvasArea.style.maxWidth = `${currentImage.width}px`;
    
    // Make canvas responsive
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';

    // Draw image
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // Get text values
    const topText = topTextInput.value.toUpperCase();
    const bottomText = bottomTextInput.value.toUpperCase();

    // Get style values
    const fontSize = parseFloat(fontSizeSlider.value);
    const outlineWidth = parseFloat(outlineWidthSlider.value);
    const fontFamily = fontSelect.value;
    const textColor = textColorPicker.value;
    const outlineColor = outlineColorPicker.value;
    const topPos = parseFloat(topPositionSlider.value);
    const bottomPos = parseFloat(bottomPositionSlider.value);

    // Setup text style
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = canvas.height * (outlineWidth / 100);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = `bold ${canvas.height * (fontSize / 100)}px ${fontFamily}, sans-serif`;

    const textX = canvas.width / 2;

    // Draw top text
    if (topText) {
        const topY = canvas.height * (topPos / 100);
        ctx.strokeText(topText, textX, topY);
        ctx.fillText(topText, textX, topY);
    }

    // Draw bottom text
    if (bottomText) {
        const bottomY = canvas.height * (bottomPos / 100);
        ctx.strokeText(bottomText, textX, bottomY);
        ctx.fillText(bottomText, textX, bottomY);
    }

    // Draw watermark if enabled
    if (watermarkToggle.checked) {
        drawWatermark();
    }

    // Enable action buttons
    downloadButton.disabled = false;
    copyButton.disabled = false;
    shareTwitterBtn.disabled = false;
}

// --- 8. Watermark ---
function drawWatermark() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.font = `normal ${canvas.height * 0.02}px sans-serif`;
    
    const wmText = 'GRIFTS.CO.UK';
    const wmX = canvas.width - (canvas.width * 0.015);
    const wmY = canvas.height - (canvas.height * 0.015);
    
    ctx.fillText(wmText, wmX, wmY);
    ctx.restore();
}

// --- 9. Download Function ---
function downloadMeme() {
    if (!currentImage) {
        showAlert('Upload an image first', 'error');
        return;
    }

    // Get quality setting
    const quality = parseInt(qualitySlider.value) / 100;
    
    // Convert canvas to blob with quality
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const filename = `grifts-meme-${typeof generateId === 'function' ? generateId(6) : Date.now()}.png`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('Meme downloaded!', 'success');
        
        // Add to recent memes
        addToRecent(canvas.toDataURL('image/png', quality));
    }, 'image/png', quality);
}

// --- 10. Copy to Clipboard ---
function copyToClipboardImage() {
    if (!currentImage) {
        showAlert('Nothing to copy', 'error');
        return;
    }

    // Check for full Clipboard API support
    if (!navigator.clipboard || !navigator.clipboard.write || !window.ClipboardItem) {
        showAlert('Image copying not supported in your browser. Use download instead.', 'error');
        return;
    }

    canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
            showAlert('Meme copied to clipboard!', 'success');
        }).catch((err) => {
            console.error('Copy failed:', err);
            showAlert('Failed to copy. Try downloading instead.', 'error');
        });
    });
}

// --- 11. Share to Twitter (continued) ---
function shareToTwitter() {
    if (!currentImage) {
        showAlert('Create a meme first', 'error');
        return;
    }

    const text = encodeURIComponent('Check out this meme I made with GRIFTS! 🔥');
    const url = encodeURIComponent('https://grifts.co.uk/viral/meme-captioner.html');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    showAlert('Opening Twitter share dialog...', 'info');
}

// --- 12. Control Functions ---
function clearImage() {
    currentImage = null;
    imageUpload.value = '';
    setupCanvas();
    showAlert('Image cleared', 'info');
}

function clearText() {
    topTextInput.value = '';
    bottomTextInput.value = '';
    drawMeme();
    showAlert('Text cleared', 'info');
}

function swapText() {
    const temp = topTextInput.value;
    topTextInput.value = bottomTextInput.value;
    bottomTextInput.value = temp;
    drawMeme();
    showAlert('Text swapped', 'info');
}

function resetPositions() {
    topPositionSlider.value = 10;
    bottomPositionSlider.value = 95;
    topPosValue.textContent = '10%';
    bottomPosValue.textContent = '95%';
    drawMeme();
    showAlert('Positions reset', 'info');
}

// --- 13. Recent Memes Storage ---
function addToRecent(dataUrl) {
    recentMemes.unshift(dataUrl);
    if (recentMemes.length > MAX_RECENT) {
        recentMemes.pop();
    }
    if (typeof saveToMemory === 'function') {
        saveToMemory('recent-memes', recentMemes);
    }
}

function loadRecent() {
    if (typeof loadFromMemory === 'function') {
        const stored = loadFromMemory('recent-memes', []);
        if (Array.isArray(stored)) {
            recentMemes = stored;
        }
    }
}

// --- 14. Keyboard Shortcuts ---
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S or Cmd+S - Download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!downloadButton.disabled) {
                downloadMeme();
            }
        }
        
        // Ctrl+C or Cmd+C - Copy (only if not focused on text input)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            const activeElement = document.activeElement;
            const isTextInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
            
            if (!isTextInput && !copyButton.disabled) {
                e.preventDefault();
                copyToClipboardImage();
            }
        }
        
        // Enter - Update preview (when focused on text inputs)
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement === topTextInput || activeElement === bottomTextInput) {
                drawMeme();
            }
        }
        
        // Escape - Clear focus from inputs
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }
    });
}

// --- 15. Auto-save Settings ---
function saveSettings() {
    if (typeof saveToMemory === 'function') {
        const settings = {
            fontSize: fontSizeSlider.value,
            outlineWidth: outlineWidthSlider.value,
            font: fontSelect.value,
            textColor: textColorPicker.value,
            outlineColor: outlineColorPicker.value,
            watermark: watermarkToggle.checked,
            quality: qualitySlider.value
        };
        saveToMemory('meme-settings', settings);
    }
}

function loadSettings() {
    if (typeof loadFromMemory === 'function') {
        const settings = loadFromMemory('meme-settings', null);
        if (settings) {
            fontSizeSlider.value = settings.fontSize || 8;
            outlineWidthSlider.value = settings.outlineWidth || 0.8;
            fontSelect.value = settings.font || 'Impact';
            textColorPicker.value = settings.textColor || '#ffffff';
            outlineColorPicker.value = settings.outlineColor || '#000000';
            watermarkToggle.checked = settings.watermark !== false;
            qualitySlider.value = settings.quality || 90;
            
            // Update displays
            sizeValue.textContent = fontSizeSlider.value + '%';
            outlineValue.textContent = outlineWidthSlider.value + '%';
            qualityValue.textContent = qualitySlider.value + '%';
        }
    }
}

// --- 16. Save Settings on Change ---
function setupAutoSave() {
    const controls = [
        fontSizeSlider,
        outlineWidthSlider,
        fontSelect,
        textColorPicker,
        outlineColorPicker,
        watermarkToggle,
        qualitySlider
    ];
    
    controls.forEach(control => {
        control.addEventListener('change', saveSettings);
    });
}

// --- 17. Responsive Canvas ---
function handleResize() {
    if (currentImage) {
        drawMeme();
    }
}

// Debounced resize handler
const debouncedResize = typeof debounce === 'function' ? debounce(handleResize, 250) : handleResize;
window.addEventListener('resize', debouncedResize);

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
    init();
    loadSettings();
    loadRecent();
    setupAutoSave();
    
    // Show helpful hint on first load
    if (typeof loadFromMemory === 'function' && typeof saveToMemory === 'function') {
        if (!loadFromMemory('meme-visited', false)) {
            setTimeout(() => {
                showAlert('Tip: Try our meme templates or upload your own image!', 'info');
                saveToMemory('meme-visited', true);
            }, 1000);
        }
    }
});