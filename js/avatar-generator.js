/*
File: js/avatar-generator.js
Description: Core logic for the Avatar Generator tool.
Dependencies: common.js (for memoryStore, copyToClipboard, downloadFile, showAlert)
*/

// --- 1. CONFIGURATION & STATE ---
const SVG_CONTAINER = document.getElementById('avatar-svg');
const OUTPUT_CONTAINER = document.getElementById('avatar-output-container');
const CONTROL_CARDS = document.querySelectorAll('.controls-card input, .controls-card button');
const STATE_KEY = 'avatar-generator-state';

// Default state for the avatar features
let avatarState = {
    hair: 1,
    eyes: 1,
    mouth: 1,
    skinColor: '#00d9f5', // Initial color from HTML
    hairColor: '#00f5a0'  // Initial color from HTML
};

// SVG asset maps (GRIFTS Minimalist Style)
const ASSETS = {
    // Base shape for the head/skin
    skin: (color) => `<circle cx="50" cy="50" r="40" fill="${color}" />`,
    
    // Hair Styles (5 variations)
    hair: {
        1: (color) => `<path d="M50 10 C 10 10, 10 50, 50 50 Z M50 10 C 90 10, 90 50, 50 50 Z" fill="${color}" />`, // Classic Cap
        2: (color) => `<rect x="20" y="10" width="60" height="20" rx="5" fill="${color}" />`, // Flat Top
        3: (color) => `<path d="M50 20 C 15 20, 15 80, 50 80 V20 Z M50 20 C 85 20, 85 80, 50 80 V20 Z" fill="${color}" opacity="0.9" />`, // Long/Flowing
        4: (color) => `<path d="M30 15 L 70 15 L 75 40 L 50 25 L 25 40 Z" fill="${color}" />`, // Mohawk Outline
        5: (color) => `<circle cx="50" cy="25" r="30" fill="${color}" />`, // Afro/Round
    },
    
    // Eye Styles (4 variations)
    eyes: {
        1: `<circle cx="38" cy="45" r="4" fill="#ffffff" stroke="#0a0a0a" stroke-width="1" /><circle cx="62" cy="45" r="4" fill="#ffffff" stroke="#0a0a0a" stroke-width="1" />`, // Standard White
        2: `<rect x="35" y="42" width="6" height="6" fill="#0a0a0a" /><rect x="59" y="42" width="6" height="6" fill="#0a0a0a" />`, // Square Black
        3: `<path d="M30 45 L 45 45 M55 45 L 70 45" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />`, // Slit/Line
        4: `<circle cx="38" cy="48" r="5" fill="#00f5a0" /><circle cx="62" cy="48" r="5" fill="#00f5a0" />`, // Neon Dots (GRIFTS Green)
    },
    
    // Mouth Styles (6 variations)
    mouth: {
        1: `<rect x="40" y="68" width="20" height="3" rx="1.5" fill="#0a0a0a" />`, // Neutral Line
        2: `<path d="M40 68 Q 50 78, 60 68" stroke="#0a0a0a" stroke-width="2" fill="none" />`, // Smile
        3: `<path d="M40 73 Q 50 63, 60 73" stroke="#0a0a0a" stroke-width="2" fill="none" />`, // Frown
        4: `<circle cx="50" cy="72" r="4" fill="#D24646" />`, // O Face (Reddish)
        5: `<path d="M40 68 C 45 75, 55 75, 60 68 Z" fill="#D24646" />`, // Open Mouth Triangle
        6: `<path d="M40 68 L 60 68 M40 73 L 60 73" stroke="#0a0a0a" stroke-width="1" fill="none" />`, // Teeth/Two Lines
    }
};

// Preset data
const PRESETS = {
    cool: { hair: 3, eyes: 2, mouth: 1, skinColor: '#00d9f5', hairColor: '#8be9fd' }, // Blue tones
    warm: { hair: 4, eyes: 1, mouth: 2, skinColor: '#ffbb99', hairColor: '#ff4d4d' }, // Earth/Red tones
    neon: { hair: 5, eyes: 4, mouth: 5, skinColor: '#00f5a0', hairColor: '#d900f5' }, // Accent tones
    classic: { hair: 1, eyes: 3, mouth: 6, skinColor: '#cccccc', hairColor: '#333333' } // Greyscale/Standard
};


// --- 2. CORE LOGIC ---

/**
 * Generates the SVG content based on the current avatarState.
 */
function generateAvatar() {
    // Z-order: Skin (background) -> Eyes/Mouth (features) -> Hair (foreground)
    const skinSVG = ASSETS.skin(avatarState.skinColor);
    const eyesSVG = ASSETS.eyes[avatarState.eyes];
    const mouthSVG = ASSETS.mouth[avatarState.mouth];
    const hairSVG = ASSETS.hair[avatarState.hair](avatarState.hairColor);


    const fullSVG = `
        ${skinSVG}
        ${eyesSVG}
        ${mouthSVG}
        ${hairSVG}
    `;

    SVG_CONTAINER.innerHTML = fullSVG;
    
    // Save the current state to memory
    memoryStore.setItem(STATE_KEY, avatarState);
    
    // Update ARIA and hints
    updateAriaAndHints();
}

/**
 * Loads state from memoryStore on page load.
 */
function loadState() {
    // Note: The memoryStore utility handles JSON.parse/stringify
    const savedState = memoryStore.getItem(STATE_KEY);
    if (savedState) {
        // Use Object.assign to merge saved properties while keeping defaults if keys are missing
        Object.assign(avatarState, savedState.value); 
    }
    
    // Apply loaded state to the UI controls
    document.getElementById('hair-style').value = avatarState.hair;
    document.getElementById('eyes-style').value = avatarState.eyes;
    document.getElementById('mouth-style').value = avatarState.mouth;
    document.getElementById('skin-color').value = avatarState.skinColor;
    document.getElementById('hair-color').value = avatarState.hairColor;

    generateAvatar(); // Re-render avatar
}

/**
 * Updates range input hints and ARIA attributes for accessibility.
 */
function updateAriaAndHints() {
    // Update style hints
    document.getElementById('hair-hint').textContent = avatarState.hair;
    document.getElementById('eyes-hint').textContent = avatarState.eyes;
    document.getElementById('mouth-hint').textContent = avatarState.mouth;

    // Update ARIA values
    document.getElementById('hair-style').setAttribute('aria-valuenow', avatarState.hair);
    document.getElementById('eyes-style').setAttribute('aria-valuenow', avatarState.eyes);
    document.getElementById('mouth-style').setAttribute('aria-valuenow', avatarState.mouth);
}

/**
 * Applies a feature change from a range or color input.
 * @param {Event} e - The input event.
 */
function handleControlChange(e) {
    const { id, value } = e.target;

    switch (id) {
        case 'hair-style':
            avatarState.hair = parseInt(value, 10);
            break;
        case 'eyes-style':
            avatarState.eyes = parseInt(value, 10);
            break;
        case 'mouth-style':
            avatarState.mouth = parseInt(value, 10);
            break;
        case 'skin-color':
            avatarState.skinColor = value;
            break;
        case 'hair-color':
            avatarState.hairColor = value;
            break;
        default:
            return; // Ignore other inputs
    }

    generateAvatar();
}

/**
 * Applies one of the quick presets.
 * @param {string} presetName - The name of the preset.
 */
function applyPreset(presetName) {
    if (!PRESETS[presetName]) return;

    // Direct update of the state object
    Object.assign(avatarState, PRESETS[presetName]);
    
    // Rerender the UI controls and avatar
    loadState(); 
    showAlert(`Applied '${presetName}' preset!`, 'info');
}

/**
 * Randomizes all avatar features and colors.
 */
function randomizeAvatar() {
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    avatarState = {
        hair: randomInt(1, Object.keys(ASSETS.hair).length),
        eyes: randomInt(1, Object.keys(ASSETS.eyes).length),
        mouth: randomInt(1, Object.keys(ASSETS.mouth).length),
        skinColor: randomColor(),
        hairColor: randomColor()
    };
    
    loadState(); // Update UI and generate
    showAlert('Random avatar generated!', 'success');
}

// --- 3. DOWNLOAD & UTILITY FUNCTIONS ---

/**
 * Downloads the current SVG as a PNG file. Requires Canvas API.
 */
function downloadPNG() {
    const svgData = new XMLSerializer().serializeToString(SVG_CONTAINER);
    const canvas = document.createElement('canvas');
    // Set a good resolution for profile pictures
    const size = 512; 
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Create an image from the SVG
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        
        // Use downloadFile utility from common.js
        canvas.toBlob((blob) => {
            downloadFile(blob, 'grifts-avatar.png', 'image/png');
            showAlert('PNG Download Started!', 'success');
        }, 'image/png');
    };
    img.onerror = (err) => {
        console.error('Error drawing SVG to canvas:', err);
        showAlert('Error generating PNG. Try SVG download.', 'error');
    }
    
    // Base64 encode the SVG for the Image source
    // NOTE: We need to ensure the SVG is properly XML/URL encoded before base64
    const svgEncoded = encodeURIComponent(svgData).replace(/'/g, '%27').replace(/"/g, '%22');
    img.src = 'data:image/svg+xml,' + svgEncoded;
}

/**
 * Downloads the current SVG as an SVG file.
 */
function downloadSVG() {
    const svgData = new XMLSerializer().serializeToString(SVG_CONTAINER);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    
    // Use downloadFile utility from common.js
    downloadFile(blob, 'grifts-avatar.svg', 'image/svg+xml');
    showAlert('SVG Download Started!', 'success');
}

/**
 * Copies the raw SVG code to the clipboard.
 */
function copySVGCode() {
    const svgData = new XMLSerializer().serializeToString(SVG_CONTAINER);
    // Use copyToClipboard utility from common.js
    copyToClipboard(svgData)
        .then(() => showAlert('SVG Code copied to clipboard!', 'success'))
        .catch(() => showAlert('Failed to copy code. Try manually selecting.', 'error'));
}


// --- 4. INITIALIZATION & EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // A. Load previous state and generate initial avatar
    loadState(); 

    // B. Setup main control listeners (uses event delegation for efficiency)
    CONTROL_CARDS.forEach(card => {
        if (card.tagName === 'INPUT') {
            card.addEventListener('input', handleControlChange);
        }
    });

    // C. Setup button listeners
    document.getElementById('randomize-btn').addEventListener('click', randomizeAvatar);
    document.getElementById('download-png-btn').addEventListener('click', downloadPNG);
    document.getElementById('download-svg-btn').addEventListener('click', downloadSVG);
    document.getElementById('copy-svg-btn').addEventListener('click', copySVGCode);

    // D. Setup preset button listeners
    document.querySelectorAll('.preset-buttons button[data-preset]').forEach(button => {
        button.addEventListener('click', (e) => applyPreset(e.target.dataset.preset));
    });
    
    // E. Setup global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only run shortcuts if not typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return; 
        
        switch (e.key.toUpperCase()) {
            case 'R':
                randomizeAvatar();
                break;
            case 'D':
                e.preventDefault(); // Prevent browser download dialogue
                downloadPNG();
                break;
            case 'S':
                e.preventDefault(); // Prevent browser save dialogue
                downloadSVG();
                break;
            case 'C':
                copySVGCode();
                break;
        }
    });

    // F. Accessibility: Announce tool focus
    if (typeof focusAnnouncement === 'function') {
        focusAnnouncement(); 
    }
});
