// DOM Elements
const imageUpload = document.getElementById('image-upload');
const topTextInput = document.getElementById('top-text');
const bottomTextInput = document.getElementById('bottom-text');
const drawButton = document.getElementById('draw-btn');
const downloadButton = document.getElementById('download-btn');
const canvas = document.getElementById('meme-canvas');
const ctx = canvas.getContext('2d');
const canvasArea = document.querySelector('.canvas-area');

let currentImage = null; // Stores the loaded Image object

// --- 1. Image Loading Handler ---
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            drawMeme(); // Draw image and text immediately
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- 2. Core Draw Function ---
function drawMeme() {
    if (!currentImage) {
        // Clear canvas if no image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // Set canvas dimensions to match the image
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    // Set container max-width for responsiveness
    canvasArea.style.maxWidth = `${currentImage.width}px`;
    
    // Draw the image first
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // Get text inputs
    const topText = topTextInput.value.toUpperCase();
    const bottomText = bottomTextInput.value.toUpperCase();

    // --- Text Styling (Standard Meme Style) ---
    ctx.strokeStyle = 'black'; // Outline color
    ctx.lineWidth = 4;
    ctx.fillStyle = 'white'; // Fill color
    ctx.textAlign = 'center';
    ctx.font = 'bold ' + (canvas.height * 0.08) + 'px Impact, sans-serif'; // Font size relative to image height

    const textX = canvas.width / 2;

    // --- Draw Top Text ---
    if (topText) {
        // Draw the black outline
        ctx.strokeText(topText, textX, canvas.height * 0.1); 
        // Draw the white fill
        ctx.fillText(topText, textX, canvas.height * 0.1);
    }

    // --- Draw Bottom Text ---
    if (bottomText) {
        // Draw the black outline
        ctx.strokeText(bottomText, textX, canvas.height * 0.95);
        // Draw the white fill
        ctx.fillText(bottomText, textX, canvas.height * 0.95);
    }
    
    // Enable download button once we have something to show
    downloadButton.disabled = false;
}

// --- Initialization & Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Placeholder Text
    topTextInput.value = 'YOUR TOP TEXT HERE';
    bottomTextInput.value = 'YOUR BOTTOM TEXT HERE';
    
    // 2. Event Listeners
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Redraw text immediately when inputs change
    topTextInput.addEventListener('input', drawMeme);
    bottomTextInput.addEventListener('input', drawMeme);

    // Redraw on button click (fallback/manual)
    drawButton.addEventListener('click', drawMeme);
    
    // Download logic will be added in the next step!
});

// A quick helper to handle wrapping long text (optional but recommended)
// We can add the text wrapping logic in a later step if needed.
