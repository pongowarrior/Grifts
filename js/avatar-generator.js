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
const avatarSVG = document.getElementById('avatar-svg'); // New static SVG element ID

// --- 1. SVG Component Definitions (The "Art") ---
// Note: SVG paths are simplified to fit the 100x100 viewBox
const svgComponents = {
    // All features are drawn on a 100x100 grid.
    
    // Base head shape
    head: (color) => `<circle cx="50" cy="55" r="40" fill="${color}" />`,

    // Hair Styles (Drawn over the head)
    hair: {
        1: (color) => `<rect x="15" y="15" width="70" height="30" rx="10" fill="${color}" />`, // Simple Cap
        2: (color) => `<path d="M 50 10 C 20 15, 20 45, 50 45 C 80 45, 80 15, 50 10 Z" fill="${color}" />`, // Classic
        3: (color) => `<path d="M 50 5 C 10 10, 10 50, 50 50 L 50 5 Z" fill="${color}" />`, // Comb-over left
        4: (color) => `<path d="M 50 5 C 90 10, 90 50, 50 50 L 50 5 Z" fill="${color}" />`, // Comb-over right
        5: (color) => `<path d="M 50 10 A 35 35 0 0 1 50 45 A 35 35 0 0 1 50 10 Z" fill="${color}" />`, // Buzz cut
    },

    // Eye Styles (Drawn on the face)
    eyes: {
        1: `<circle cx="35" cy="45" r="5" fill="black" /><circle cx="65" cy="45" r="5" fill="black" />`, // Standard
        2: `<rect x="30" y="40" width="10" height="10" fill="black" /><rect x="60" y="40" width="10" height="10" fill="black" />`, // Square
        3: `<path d="M 30 45 L 40 45 M 60 45 L 70 45" stroke="black" stroke-width="2" stroke-linecap="round" />`, // Line
        4: `<circle cx="35" cy="45" r="2" fill="white" stroke="black" stroke-width="1" /><circle cx="65" cy="45" r="2" fill="white" stroke="black" stroke-width="1" />`, // Dot
    },

    // Mouth Styles
    mouth: {
        1: `<rect x="40" y="65" width="20" height="5" fill="black" />`, // Line
        2: `<path d="M 40 65 C 45 75, 55 75, 60 65" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" />`, // Smile
        3: `<path d="M 40 70 C 45 60, 55 60, 60 70" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" />`, // Frown
        4: `<circle cx="50" cy="70" r="5" fill="black" />`, // O
        5: `<rect x="45" y="68" width="10" height="2" fill="white" stroke="black" stroke-width="1" />`, // Teeth
        6: `<path d="M 50 65 V 70" stroke="black" stroke-width="2" stroke-linecap="round" />`, // Straight Line
    }
};

// --- 2. Core Rendering Logic ---

/**
 * Constructs the full SVG string from selected components and colors.
 * @returns {string} The inner HTML content for the <svg> element.
 */
function getSVGString() {
    // 1. Get current values from controls
    const hairStyle = hairRange.value;
    const eyesStyle = eyesRange.value;
    const mouthStyle = mouthRange.value;
    const skinColor = skinColorInput.value;
    const hairColor = hairColorInput.value;

    // 2. Build the SVG content
    let svgContent = '';
    
    // Background (optional, typically handled by the container/host page)
    svgContent += `<rect width="100" height="100" fill="var(--bg-dark)"/>`;

    // Head (always skin color)
    svgContent += svgComponents.head(skinColor);

    // Hair (if selected)
    const hairFunction = svgComponents.hair[hairStyle];
    if (hairFunction) {
        svgContent += hairFunction(hairColor);
    }
    
    // Eyes
    svgContent += svgComponents.eyes[eyesStyle];

    // Mouth
    svgContent += svgComponents.mouth[mouthStyle];

    return svgContent;
}

/**
 * Renders the avatar by updating the existing SVG element's content.
 * FIX for Issue 3: Updates inner content instead of replacing the entire outer container.
 */
function renderAvatar() {
    const svgString = getSVGString();
    avatarSVG.innerHTML = svgString;

    // Update hints
    hairHint.textContent = hairRange.value;
    eyesHint.textContent = eyesRange.value;
    mouthHint.textContent = mouthRange.value;
}

/**
 * Randomizes the controls and triggers a re-render.
 */
function randomizeAvatar() {
    // Determine max ranges from the component data
    const maxHair = Object.keys(svgComponents.hair).length;
    const maxEyes = Object.keys(svgComponents.eyes).length;
    const maxMouth = Object.keys(svgComponents.mouth).length;

    // Helper function to get a random integer within range [min, max]
    const getRandom = (max) => Math.floor(Math.random() * max) + 1;

    // Update input values
    hairRange.value = getRandom(maxHair);
    eyesRange.value = getRandom(maxEyes);
    mouthRange.value = getRandom(maxMouth);
    
    // Random Colors (simplified example)
    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    skinColorInput.value = randomColor();
    hairColorInput.value = randomColor();

    renderAvatar(); // Re-render with new random values
}


// --- 3. Dependency-Free Download Logic ---

/**
 * Downloads the current SVG as a PNG file using only native browser APIs.
 * FIX for Issue 1: Replaces the proprietary svgToImage library.
 */
function downloadAvatar() {
    // Get the current SVG string
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${getSVGString()}</svg>`;

    // 1. Convert SVG string to a Blob URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // 2. Create an Image object to hold the SVG
    const img = new Image();
    img.onload = () => {
        // 3. Create a Canvas element
        const canvas = document.createElement('canvas');
        const size = 512; // Desired PNG output size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw the SVG image onto the canvas
        // Note: Drawing the SVG URL onto the canvas sometimes requires the image to be "clean" 
        // (i.e., not cross-origin, which is guaranteed here since it's local Blob)
        ctx.drawImage(img, 0, 0, size, size);

        // 4. Convert the canvas content to a PNG data URL
        const pngDataUrl = canvas.toDataURL('image/png');
        
        // 5. Use the shared downloadFile function from common.js
        const filename = `grifts-avatar-${generateId(6)}.png`; 
        downloadFile(pngDataUrl, filename, 'image/png');

        // 6. Cleanup the temporary Blob URL
        URL.revokeObjectURL(svgUrl);
    };
    img.onerror = (err) => {
        console.error("Failed to load SVG into Image for Canvas conversion:", err);
        showAlert('Download failed: SVG to PNG conversion error.', 'error');
        URL.revokeObjectURL(svgUrl); // Ensure cleanup on error
    };
    // Set the source to the Blob URL to trigger the load
    img.src = svgUrl;
}


// --- 4. Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set max values based on data (FIX for Issue 2)
    const maxHair = Object.keys(svgComponents.hair).length;
    const maxEyes = Object.keys(svgComponents.eyes).length;
    const maxMouth = Object.keys(svgComponents.mouth).length;

    hairRange.max = maxHair;
    eyesRange.max = maxEyes;
    mouthRange.max = maxMouth;
    
    // 2. Initial render (Randomize provides initial values)
    randomizeAvatar();

    // 3. Event Listeners for controls (re-render on change)
    // NOTE: Using a simple listener here because the renderAvatar update is now much faster.
    hairRange.addEventListener('input', renderAvatar);
    eyesRange.addEventListener('input', renderAvatar);
    mouthRange.addEventListener('input', renderAvatar);
    
    // NOTE: For color inputs, we can use the debounce utility from common.js 
    // to prevent excessive re-renders while the user is actively dragging the color picker.
    const debouncedRender = typeof debounce === 'function' ? debounce(renderAvatar, 150) : renderAvatar;
    
    skinColorInput.addEventListener('input', debouncedRender);
    hairColorInput.addEventListener('input', debouncedRender);
    
    // 4. Button listeners
    randomizeButton.addEventListener('click', randomizeAvatar);
    downloadButton.addEventListener('click', downloadAvatar);
});
