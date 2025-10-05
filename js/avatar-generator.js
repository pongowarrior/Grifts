/*
File: js/avatar-generator.js
Description: Avatar Generator with presets, memory persistence, and multiple download formats
Version: 2.0 - Improved error handling, better randomization, loading states
*/

// DOM Elements
const hairRange = document.getElementById('hair-style');
const eyesRange = document.getElementById('eyes-style');
const mouthRange = document.getElementById('mouth-style');
const skinColorInput = document.getElementById('skin-color');
const hairColorInput = document.getElementById('hair-color');
const hairHint = document.getElementById('hair-hint');
const eyesHint = document.getElementById('eyes-hint');
const mouthHint = document.getElementById('mouth-hint');
const randomizeButton = document.getElementById('randomize-btn');
const downloadPNGButton = document.getElementById('download-png-btn');
const downloadSVGButton = document.getElementById('download-svg-btn');
const copySVGButton = document.getElementById('copy-svg-btn');
const avatarSVG = document.getElementById('avatar-svg');
const presetButtons = document.querySelectorAll('[data-preset]');

// State
let isDownloading = false;

// --- 1. SVG Component Definitions ---
const svgComponents = {
    head: (color) => `<circle cx="50" cy="55" r="40" fill="${color}" />`,
    
    hair: {
        1: (color) => `<rect x="15" y="15" width="70" height="30" rx="10" fill="${color}" />`,
        2: (color) => `<path d="M 50 10 C 20 15, 20 45, 50 45 C 80 45, 80 15, 50 10 Z" fill="${color}" />`,
        3: (color) => `<path d="M 50 5 C 10 10, 10 50, 50 50 L 50 5 Z" fill="${color}" />`,
        4: (color) => `<path d="M 50 5 C 90 10, 90 50, 50 50 L 50 5 Z" fill="${color}" />`,
        5: (color) => `<path d="M 50 10 A 35 35 0 0 1 50 45 A 35 35 0 0 1 50 10 Z" fill="${color}" />`,
    },
    
    eyes: {
        1: `<circle cx="35" cy="45" r="5" fill="black" /><circle cx="65" cy="45" r="5" fill="black" />`,
        2: `<rect x="30" y="40" width="10" height="10" fill="black" /><rect x="60" y="40" width="10" height="10" fill="black" />`,
        3: `<path d="M 30 45 L 40 45 M 60 45 L 70 45" stroke="black" stroke-width="2" stroke-linecap="round" />`,
        4: `<circle cx="35" cy="45" r="2" fill="white" stroke="black" stroke-width="1" /><circle cx="65" cy="45" r="2" fill="white" stroke="black" stroke-width="1" />`,
    },
    
    mouth: {
        1: `<rect x="40" y="65" width="20" height="5" fill="black" />`,
        2: `<path d="M 40 65 C 45 75, 55 75, 60 65" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" />`,
        3: `<path d="M 40 70 C 45 60, 55 60, 60 70" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" />`,
        4: `<circle cx="50" cy="70" r="5" fill="black" />`,
        5: `<rect x="45" y="68" width="10" height="2" fill="white" stroke="black" stroke-width="1" />`,
        6: `<path d="M 50 65 V 70" stroke="black" stroke-width="2" stroke-linecap="round" />`,
    }
};

// --- 2. Presets ---
const presets = {
    cool: { hair: 2, eyes: 1, mouth: 2, skinColor: '#6eb5ff', hairColor: '#2d3436' },
    warm: { hair: 1, eyes: 2, mouth: 2, skinColor: '#ffeaa7', hairColor: '#d63031' },
    neon: { hair: 5, eyes: 4, mouth: 1, skinColor: '#00f5a0', hairColor: '#00d9f5' },
    classic: { hair: 3, eyes: 1, mouth: 1, skinColor: '#fad390', hairColor: '#4a4a4a' }
};

// --- 3. Helper Functions ---

/**
 * Generate random color with minimum brightness to avoid near-black colors
 * @param {number} minBrightness - Minimum brightness (0-255)
 * @returns {string} Hex color
 */
function randomColor(minBrightness = 50) {
    let color;
    let brightness;
    
    do {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        // Calculate perceived brightness
        brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        if (brightness >= minBrightness) {
            color = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            return color;
        }
    } while (brightness < minBrightness);
    
    return '#6eb5ff'; // Fallback
}

/**
 * Get random integer between 1 and max (inclusive)
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

/**
 * Validate if element exists before accessing
 */
function validateElements() {
    const required = [
        hairRange, eyesRange, mouthRange, 
        skinColorInput, hairColorInput, 
        avatarSVG, randomizeButton
    ];
    
    const missing = required.filter(el => !el);
    if (missing.length > 0) {
        console.error('Missing required DOM elements');
        return false;
    }
    return true;
}

/**
 * Check if user is typing in an input field
 */
function isUserTyping() {
    const activeTag = document.activeElement?.tagName;
    return activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
}

// --- 4. Core Rendering Logic ---

/**
 * Constructs the full SVG string from selected components and colors
 */
function getSVGString() {
    const hairStyle = parseInt(hairRange.value);
    const eyesStyle = parseInt(eyesRange.value);
    const mouthStyle = parseInt(mouthRange.value);
    const skinColor = skinColorInput.value;
    const hairColor = hairColorInput.value;
    
    let svgContent = '';
    svgContent += `<rect width="100" height="100" fill="#0a0a0a"/>`;
    svgContent += svgComponents.head(skinColor);
    
    // Safely get hair component
    const hairFunction = svgComponents.hair[hairStyle];
    if (hairFunction && typeof hairFunction === 'function') {
        svgContent += hairFunction(hairColor);
    }
    
    // Safely get eyes component
    const eyesComponent = svgComponents.eyes[eyesStyle];
    if (eyesComponent) {
        svgContent += eyesComponent;
    }
    
    // Safely get mouth component
    const mouthComponent = svgComponents.mouth[mouthStyle];
    if (mouthComponent) {
        svgContent += mouthComponent;
    }
    
    return svgContent;
}

/**
 * Renders the avatar and saves settings to memory
 */
function renderAvatar() {
    try {
        const svgString = getSVGString();
        avatarSVG.innerHTML = svgString;
        
        // Update hints if they exist
        if (hairHint) hairHint.textContent = hairRange.value;
        if (eyesHint) eyesHint.textContent = eyesRange.value;
        if (mouthHint) mouthHint.textContent = mouthRange.value;
        
        // Update ARIA values
        hairRange.setAttribute('aria-valuenow', hairRange.value);
        eyesRange.setAttribute('aria-valuenow', eyesRange.value);
        mouthRange.setAttribute('aria-valuenow', mouthRange.value);
        
        // Save current state to memory
        saveAvatarSettings();
    } catch (error) {
        console.error('Render error:', error);
        showAlert('Failed to render avatar', 'error');
    }
}

/**
 * Saves current avatar settings to memory
 */
function saveAvatarSettings() {
    try {
        const settings = {
            hair: hairRange.value,
            eyes: eyesRange.value,
            mouth: mouthRange.value,
            skinColor: skinColorInput.value,
            hairColor: hairColorInput.value,
            timestamp: Date.now()
        };
        saveToMemory('avatar_settings', settings);
    } catch (error) {
        console.error('Save error:', error);
    }
}

/**
 * Loads avatar settings from memory
 */
function loadAvatarSettings() {
    try {
        const settings = loadFromMemory('avatar_settings');
        if (settings) {
            hairRange.value = settings.hair || 1;
            eyesRange.value = settings.eyes || 1;
            mouthRange.value = settings.mouth || 1;
            skinColorInput.value = settings.skinColor || '#00d9f5';
            hairColorInput.value = settings.hairColor || '#00f5a0';
            return true;
        }
    } catch (error) {
        console.error('Load error:', error);
    }
    return false;
}

/**
 * Applies a preset
 */
function applyPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) {
        showAlert('Preset not found', 'error');
        return;
    }
    
    try {
        hairRange.value = preset.hair;
        eyesRange.value = preset.eyes;
        mouthRange.value = preset.mouth;
        skinColorInput.value = preset.skinColor;
        hairColorInput.value = preset.hairColor;
        renderAvatar();
        showAlert(`Applied ${presetName} preset!`, 'success');
        trackEvent('avatar_preset_applied', { preset: presetName });
    } catch (error) {
        console.error('Preset error:', error);
        showAlert('Failed to apply preset', 'error');
    }
}

/**
 * Randomizes the controls and triggers a re-render
 */
function randomizeAvatar() {
    try {
        const maxHair = Object.keys(svgComponents.hair).length;
        const maxEyes = Object.keys(svgComponents.eyes).length;
        const maxMouth = Object.keys(svgComponents.mouth).length;
        
        hairRange.value = getRandomInt(maxHair);
        eyesRange.value = getRandomInt(maxEyes);
        mouthRange.value = getRandomInt(maxMouth);
        skinColorInput.value = randomColor(80);  // Minimum brightness 80
        hairColorInput.value = randomColor(50);   // Minimum brightness 50
        
        renderAvatar();
        showAlert('Avatar randomized!', 'success');
        trackEvent('avatar_randomized');
    } catch (error) {
        console.error('Randomize error:', error);
        showAlert('Failed to randomize avatar', 'error');
    }
}

// --- 5. Download Functions ---

/**
 * Downloads the current SVG as a PNG file
 */
async function downloadAvatarPNG() {
    if (isDownloading) {
        showAlert('Download in progress...', 'info');
        return;
    }
    
    isDownloading = true;
    downloadPNGButton.disabled = true;
    downloadPNGButton.textContent = 'Converting...';
    
    try {
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${getSVGString()}</svg>`;
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('Failed to load SVG'));
            img.src = svgUrl;
        });
        
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Canvas context not available');
        }
        
        ctx.drawImage(img, 0, 0, size, size);
        
        const pngDataUrl = canvas.toDataURL('image/png');
        const filename = `grifts-avatar-${generateId(6)}.png`;
        downloadFile(pngDataUrl, filename, 'image/png');
        
        URL.revokeObjectURL(svgUrl);
        trackEvent('avatar_downloaded', { format: 'png' });
        
    } catch (error) {
        console.error('PNG download error:', error);
        showAlert('Download failed. Please try SVG format instead.', 'error');
    } finally {
        isDownloading = false;
        downloadPNGButton.disabled = false;
        downloadPNGButton.textContent = 'Download PNG';
    }
}

/**
 * Downloads the current SVG as an SVG file
 */
function downloadAvatarSVG() {
    try {
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${getSVGString()}</svg>`;
        const filename = `grifts-avatar-${generateId(6)}.svg`;
        downloadFile(svgString, filename, 'image/svg+xml');
        trackEvent('avatar_downloaded', { format: 'svg' });
    } catch (error) {
        console.error('SVG download error:', error);
        showAlert('Download failed', 'error');
    }
}

/**
 * Copies SVG code to clipboard
 */
async function copySVGCode() {
    try {
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${getSVGString()}</svg>`;
        await copyToClipboard(svgString, copySVGButton);
        trackEvent('avatar_copied');
    } catch (error) {
        console.error('Copy error:', error);
        showAlert('Failed to copy SVG', 'error');
    }
}

// --- 6. Keyboard Shortcuts ---
function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts while typing
    if (isUserTyping()) return;
    
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'r':
            e.preventDefault();
            randomizeAvatar();
            break;
        case 'd':
            e.preventDefault();
            downloadAvatarPNG();
            break;
        case 's':
            e.preventDefault();
            downloadAvatarSVG();
            break;
        case 'c':
            if (e.ctrlKey || e.metaKey) {
                // Let default Ctrl+C work
                return;
            }
            e.preventDefault();
            copySVGCode();
            break;
    }
}

// --- 7. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Validate required elements
    if (!validateElements()) {
        showAlert('Page initialization failed', 'error');
        return;
    }
    
    // Load saved settings or randomize
    const hasSettings = loadAvatarSettings();
    if (!hasSettings) {
        randomizeAvatar();
    } else {
        renderAvatar();
    }
    
    // Event listeners for controls
    hairRange.addEventListener('input', renderAvatar);
    eyesRange.addEventListener('input', renderAvatar);
    mouthRange.addEventListener('input', renderAvatar);
    
    // Debounced color inputs for performance
    const debouncedRender = debounce(renderAvatar, 150);
    skinColorInput.addEventListener('input', debouncedRender);
    hairColorInput.addEventListener('input', debouncedRender);
    
    // Button listeners
    randomizeButton.addEventListener('click', randomizeAvatar);
    downloadPNGButton.addEventListener('click', downloadAvatarPNG);
    downloadSVGButton.addEventListener('click', downloadAvatarSVG);
    copySVGButton.addEventListener('click', copySVGCode);
    
    // Preset buttons (with null check)
    if (presetButtons && presetButtons.length > 0) {
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const presetName = e.currentTarget.dataset.preset;
                if (presetName) {
                    applyPreset(presetName);
                }
            });
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Track initial load
    trackEvent('avatar_generator_loaded');
});