/*
File: js/avatar-generator.js
Description: Avatar Generator with presets, memory persistence, and multiple download formats
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

// --- 3. Core Rendering Logic ---

/**
 * Constructs the full SVG string from selected components and colors
 */
function getSVGString() {
    const hairStyle = hairRange.value;
    const eyesStyle = eyesRange.value;
    const mouthStyle = mouthRange.value;
    const skinColor = skinColorInput.value;
    const hairColor = hairColorInput.value;
    
    let svgContent = '';
    svgContent += `<rect width="100" height="100" fill="#0a0a0a"/>`;
    svgContent += svgComponents.head(skinColor);
    
    const hairFunction = svgComponents.hair[hairStyle];
    if (hairFunction) {
        svgContent += hairFunction(hairColor);
    }
    
    svgContent += svgComponents.eyes[eyesStyle];
    svgContent += svgComponents.mouth[mouthStyle];
    
    return svgContent;
}

/**
 * Renders the avatar and saves settings to memory
 */
function renderAvatar() {
    const svgString = getSVGString();
    avatarSVG.innerHTML = svgString;
    
    // Update hints
    hairHint.textContent = hairRange.value;
    eyesHint.textContent = eyesRange.value;
    mouthHint.textContent = mouthRange.value;
    
    // Update ARIA values
    hairRange.setAttribute('aria-valuenow', hairRange.value);
    eyesRange.setAttribute('aria-valuenow', eyesRange.value);
    mouthRange.setAttribute('aria-valuenow', mouthRange.value);
    
    // Save current state to memory
    saveAvatarSettings();
}

/**
 * Saves current avatar settings to memory
 */
function saveAvatarSettings() {
    const settings = {
        hair: hairRange.value,
        eyes: eyesRange.value,
        mouth: mouthRange.value,
        skinColor: skinColorInput.value,
        hairColor: hairColorInput.value
    };
    saveToMemory('avatar_settings', settings);
}

/**
 * Loads avatar settings from memory
 */
function loadAvatarSettings() {
    const settings = loadFromMemory('avatar_settings');
    if (settings) {
        hairRange.value = settings.hair || 1;
        eyesRange.value = settings.eyes || 1;
        mouthRange.value = settings.mouth || 1;
        skinColorInput.value = settings.skinColor || '#00d9f5';
        hairColorInput.value = settings.hairColor || '#00f5a0';
        return true;
    }
    return false;
}

/**
 * Applies a preset
 */
function applyPreset(presetName) {
    const preset = presets[presetName];
    if (preset) {
        hairRange.value = preset.hair;
        eyesRange.value = preset.eyes;
        mouthRange.value = preset.mouth;
        skinColorInput.value = preset.skinColor;
        hairColorInput.value = preset.hairColor;
        renderAvatar();
        showAlert(`Applied ${presetName} preset!`, 'success');
    }
}

/**
 * Randomizes the controls and triggers a re-render
 */
function randomizeAvatar() {
    const maxHair = Object.keys(svgComponents.hair).length;
    const maxEyes = Object.keys(svgComponents.eyes).length;
    const maxMouth = Object.keys(svgComponents.mouth).length;
    
    const getRandom = (max) => Math.floor(Math.random() * max) + 1;
    const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    
    hairRange.value = getRandom(maxHair);
    eyesRange.value = getRandom(maxEyes);
    mouthRange.value = getRandom(maxMouth);
    skinColorInput.value = randomColor();
    hairColorInput.value = randomColor();
    
    renderAvatar();
    showAlert('Avatar randomized!', 'success');
}

// --- 4. Download Functions ---

/**
 * Downloads the current SVG as a PNG file
 */
function downloadAvatarPNG() {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${getSVGString()}</svg>`;
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        
        const pngDataUrl = canvas.toDataURL('image/png');
        const filename = `grifts-avatar-${generateId(6)}.png`;
        downloadFile(pngDataUrl, filename, 'image/png');
        
        URL.revokeObjectURL(svgUrl);
    };
    img.onerror = (err) => {
        console.error("Failed to load SVG:", err);
        showAlert('Download failed: SVG to PNG conversion error.', 'error');
        URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
}

/**
 * Downloads the current SVG as an SVG file
 */
function downloadAvatarSVG() {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${getSVGString()}</svg>`;
    const filename = `grifts-avatar-${generateId(6)}.svg`;
    downloadFile(svgString, filename, 'image/svg+xml');
}

/**
 * Copies SVG code to clipboard
 */
function copySVGCode() {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${getSVGString()}</svg>`;
    copyToClipboard(svgString, copySVGButton);
}

// --- 5. Keyboard Shortcuts ---
function handleKeyboardShortcuts(e) {
    // R for randomize, D for download PNG
    if (e.key === 'r' || e.key === 'R') {
        if (document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            randomizeAvatar();
        }
    } else if (e.key === 'd' || e.key === 'D') {
        if (document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            downloadAvatarPNG();
        }
    }
}

// --- 6. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Debounced color inputs
    const debouncedRender = debounce(renderAvatar, 150);
    skinColorInput.addEventListener('input', debouncedRender);
    hairColorInput.addEventListener('input', debouncedRender);
    
    // Button listeners
    randomizeButton.addEventListener('click', randomizeAvatar);
    downloadPNGButton.addEventListener('click', downloadAvatarPNG);
    downloadSVGButton.addEventListener('click', downloadAvatarSVG);
    copySVGButton.addEventListener('click', copySVGCode);
    
    // Preset buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const presetName = e.currentTarget.dataset.preset;
            applyPreset(presetName);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
});