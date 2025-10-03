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
        img.onerror = () => {
            showAlert('Failed to load image. The file may be corrupted or in an unsupported format.', 'error');
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        showAlert('Failed to read file. Please try a different image.', 'error');
    };
    reader.readAsDataURL(file);
}

// --- 2. Core Draw Function (Draws the Image and Text) ---
function drawMeme() {
    if (!currentImage) {
        // If no image is loaded, clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // Set canvas dimensions to match the image dimensions
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    // Set the container width for responsiveness (optional, but helps layout)
    canvasArea.style.maxWidth = `${currentImage.width}px`;
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
    // Draw the image first (fills the entire canvas)
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // Get text inputs
    const topText = topTextInput.value.toUpperCase();
    const bottomText = bottomTextInput.value.toUpperCase();

    // --- Text Styling (Standard Meme Style) ---
    ctx.strokeStyle = 'black'; // Outline color
    ctx.lineWidth = canvas.height * 0.008; // Outline thickness relative to size
    ctx.fillStyle = 'white'; // Fill color
    ctx.textAlign = 'center';
    // Font size relative to image height (e.g., 8% of the height)
    ctx.font = 'bold ' + (canvas.height * 0.08) + 'px Impact, sans-serif'; 

    const textX = canvas.width / 2; // Center X position

    // --- Draw Top Text ---
    if (topText) {
        // Draw the black outline (stroke)
        ctx.strokeText(topText, textX, canvas.height * 0.1); 
        // Draw the white fill (fill)
        ctx.fillText(topText, textX, canvas.height * 0.1);
    }

    // --- Draw Bottom Text ---
    if (bottomText) {
        // Draw the black outline (stroke)
        ctx.strokeText(bottomText, textX, canvas.height * 0.95);
        // Draw the white fill (fill)
        ctx.fillText(bottomText, textX, canvas.height * 0.95);
    }
    
    // Enable download button now that content is visible
    downloadButton.disabled = false;
}

// --- 3. Watermark Function (MVP Monetization) ---
function drawWatermark(watermarkText) {
    // Save the current canvas state (so we don't mess up text settings)
    ctx.save(); 
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
    ctx.textAlign = 'right';
    
    // Size the watermark relative to the canvas height for responsiveness
    ctx.font = 'normal ' + (canvas.height * 0.025) + 'px sans-serif'; 
    
    const wmText = `GRIFTS.CO.UK | ${watermarkText}`;
    const wmX = canvas.width - (canvas.width * 0.02); // 2% margin from right
    const wmY = canvas.height - (canvas.height * 0.02); // 2% margin from bottom
    
    ctx.fillText(wmText, wmX, wmY);
    
    // Restore the canvas state
    ctx.restore();
}

// --- 4. Download Function ---
function downloadMeme() {
    if (downloadButton.disabled || !currentImage) {
        showAlert('Upload an image and draw your captions first.', 'error');
        return;
    }

    // A. Re-draw the entire canvas one last time to include the watermark
    drawMeme(); // Redraws the clean meme first
    drawWatermark("FREE VERSION"); // Then overlays the watermark

    // B. Get the image data from the canvas as a PNG Data URL
    const dataURL = canvas.toDataURL('image/png');
    
    // C. Use the shared downloadFile function from common.js
    const filename = `grifts-meme-${typeof generateId === 'function' ? generateId(6) : Date.now()}.png`; 
    
    downloadFile(dataURL, filename, 'image/png');

    // D. After download, re-draw *without* the watermark to reset the preview
    // We wait briefly for the browser to start the download process
    setTimeout(() => {
        drawMeme();
    }, 100);

}

// --- Initialization & Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Placeholder Text
    topTextInput.value = 'YOUR TOP TEXT HERE';
    bottomTextInput.value = 'YOUR BOTTOM TEXT HERE';
    
    // 2. Event Listeners
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Redraw on input change (using debounce from common.js is recommended for better performance)
    topTextInput.addEventListener('input', typeof debounce === 'function' ? debounce(drawMeme, 150) : drawMeme);
bottomTextInput.addEventListener('input', typeof debounce === 'function' ? debounce(drawMeme, 150) : drawMeme);
    // Redraw on button click (for explicit control)
    drawButton.addEventListener('click', drawMeme);
    
    // Download listener
    downloadButton.addEventListener('click', downloadMeme);
});
