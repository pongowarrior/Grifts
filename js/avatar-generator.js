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
const downloadButton = document.getElementById('download-btn');
const outputContainer = document.getElementById('avatar-output-container');

// --- 1. SVG Component Definitions (The "Art") ---
// Note: SVG paths are simplified to fit the 100x100 viewBox
const svgComponents = {
    // All features are drawn on a 100x100 grid.
    
    // Base head shape
    head: (color) => `<circle cx="50" cy="55" r="40" fill="${color}" />`,

    // Hair Styles (Drawn over the head)
    hair: {
        1: (color) => `<rect x="15" y="15" width="70" height="30" rx="10" fill="${color}" />`, // Simple Cap
        2: (color) => `<path d="M 50 10 C 20 15, 20 45, 50 45 C 80 45, 80 15, 50 10 Z" fill="${color}" />`, // Classic Pompadour
        3: (color) => `<circle cx="50" cy="30" r="30" fill="${color}" />`, // Bald/Shaved look (fills top half)
        4: (color) => `<path d="M 10 30 L 90 30 L 90 55 Q 50 70, 10 55 Z" fill="${color}" />`, // Long and swept
        5: (color) => `<path d="M 50 5 L 20 30 V 50 H 80 V 30 Z" fill="${color}" />`, // Spiky/messy
    },

    // Eye Styles
    eyes: {
        1: `<circle cx="35" cy="50" r="5" fill="#333" /><circle cx="65" cy="50" r="5" fill="#333" />`, // Simple dots
        2: `<rect x="30" y="47" width="10" height="6" fill="#FFF" stroke="#333" stroke-width="1" rx="2" /><rect x="60" y="47" width="10" height="6" fill="#FFF" stroke="#333" stroke-width="1" rx="2" />`, // Wide open
        3: `<line x1="30" y1="50" x2="45" y2="50" stroke="#333" stroke-width="3" /><line x1="55" y1="50" x2="70" y2="50" stroke="#333" stroke-width="3" />`, // Squinting
        4: `<path d="M 35 50 C 35 45, 45 45, 45 50" stroke="#333" stroke-width="3" fill="none" /><path d="M 65 50 C 65 45, 75 45, 75 50" stroke="#333" stroke-width="3" fill="none" />`, // Worried look
        5: `<rect x="30" y="45" width="10" height="10" fill="#55b0b0" /><rect x="60" y="45" width="10" height="10" fill="#55b0b0" />`, // Big, bright eyes
    },
    
    // Mouth Styles
    mouth: {
        1: `<rect x="45" y="65" width="10" height="3" rx="1.5" fill="#333" />`, // Simple line
        2: `<path d="M 40 65 Q 50 75, 60 65" stroke="#333" stroke-width="2" fill="none" />`, // Slight smile
        3: `<circle cx="50" cy="65" r="4" fill="#ff4d4d" />`, // O-Mouth / Surprise
        4: `<path d="M 40 70 C 40 60, 60 60, 60 70" stroke="#333" stroke-width="2" fill="none" />`, // Frown
        5: `<rect x="40" y="65" width="20" height="1" fill="#333" />`, // Neutral
    }
};

// --- 2. Core Rendering Function ---

/**
 * Renders the full SVG avatar based on current settings.
 */
function renderAvatar() {
    const skinColor = skinColorInput.value;
    const hairColor = hairColorInput.value;
    const hairStyle = hairRange.value;
    const eyesStyle = eyesRange.value;
    const mouthStyle = mouthRange.value;

    // Build the full SVG string
    const svgContent = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background-color: var(--bg-dark);">
            ${svgComponents.head(skinColor)}
            
            ${svgComponents.hair[hairStyle](hairColor)}

            ${svgComponents.eyes[eyesStyle]}

            ${svgComponents.mouth[mouthStyle]}
        </svg>
    `;

    // Inject into the DOM
    outputContainer.innerHTML = svgContent;
    
    // Update hints
    hairHint.textContent = `Style ${hairStyle}`;
    eyesHint.textContent = `Style ${eyesStyle}`;
    mouthHint.textContent = `Style ${mouthStyle}`;
    
    showAlert('Avatar updated!', 'info');
}

// --- 3. Utility Functions ---

/**
 * Randomizes all features and colors.
 */
function randomizeAvatar() {
    // Generate random values for each range input
    hairRange.value = Math.floor(Math.random() * 5) + 1;
    eyesRange.value = Math.floor(Math.random() * 5) + 1;
    mouthRange.value = Math.floor(Math.random() * 5) + 1;

    // Generate random colors (simplified, better to pick from a palette in a real app)
    const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    skinColorInput.value = randomHex();
    hairColorInput.value = randomHex();

    renderAvatar(); // Re-render with new random values
}

/**
 * Downloads the current SVG as a PNG file.
 */
function downloadAvatar() {
    const svgElement = outputContainer.querySelector('svg');
    
    if (!svgElement) {
        showAlert('Error: No avatar to download.', 'error');
        return;
    }
    
    // The svg-to-image library is used here (loaded via CDN in HTML)
    // It handles the complex conversion from SVG DOM element to PNG data URL.
    svgToImage.convert(svgElement, function(err, pngDataUrl) {
        if (err) {
            console.error(err);
            showAlert('Download failed: Could not convert SVG to PNG.', 'error');
            return;
        }

        // Use the shared downloadFile function from common.js
        const filename = `grifts-avatar-${generateId(6)}.png`; 
        downloadFile(pngDataUrl, filename, 'image/png');
    });
}


// --- 4. Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial render
    renderAvatar();

    // 2. Event Listeners for controls (re-render on change)
    hairRange.addEventListener('input', renderAvatar);
    eyesRange.addEventListener('input', renderAvatar);
    mouthRange.addEventListener('input', renderAvatar);
    skinColorInput.addEventListener('input', renderAvatar);
    hairColorInput.addEventListener('input', renderAvatar);
    
    // 3. Button listeners
    randomizeButton.addEventListener('click', randomizeAvatar);
    downloadButton.addEventListener('click', downloadAvatar);
});
