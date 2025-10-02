alert('QR Generator Script Loaded!');

// DOM Elements
const dataInput = document.getElementById('qr-data-input');
const sizeInput = document.getElementById('qr-size-input');
const generateButton = document.getElementById('generate-btn');
const downloadButton = document.getElementById('download-btn');
const qrcodeContainer = document.getElementById('qrcode'); // This is the parent div

let qrCodeInstance = null;
const defaultContent = 'https://grifts.co.uk';

// --- Core Generation Function ---

function generateQRCode() {
    // 1. Validation and Data
    const data = dataInput.value.trim() || defaultContent;
    const size = parseInt(sizeInput.value);

    if (!data || size < 100 || size > 512) {
        showAlert('Please enter valid data and size (100-512px).', 'error');
        downloadButton.disabled = true;
        return;
    }

    // 2. Setup New Container (The Fix)
    downloadButton.disabled = true;
    
    // Create a NEW temporary div to hold the QR code output (canvas)
    const tempDiv = document.createElement('div');
    
    // 3. Create new QR Code instance
    // We pass the new temporary element (tempDiv), NOT the ID string, to the library
    qrCodeInstance = new QRCode(tempDiv, { 
        text: data,
        width: size,
        height: size,
        colorDark: "#000000", 
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // 4. Swap the Elements (Crucial Step)
    // Wait for the canvas/image to be rendered
    setTimeout(() => {
        const outputElement = tempDiv.querySelector('canvas, table');
        
        if (outputElement) {
            // Success! Clear the OLD content from the target div and append the NEW content
            qrcodeContainer.innerHTML = '';
            qrcodeContainer.appendChild(tempDiv);
            
            // Re-apply center styles (since the new tempDiv is now the immediate child)
            tempDiv.style.display = 'flex';
            tempDiv.style.justifyContent = 'center';
            tempDiv.style.alignItems = 'center';

            downloadButton.disabled = false;
            showAlert('QR Code generated!', 'success');
        } else {
             // If this alert appears, the external library failed to execute.
             showAlert('QR Code generation failed. Check browser console.', 'error');
        }
    }, 100); 
}

// --- Download Logic ---

function downloadQRCode() {
    if (downloadButton.disabled) {
        showAlert('No QR Code available to download.', 'error');
        return;
    }

    // Find the canvas element inside the main container
    const canvas = qrcodeContainer.querySelector('canvas');
    
    if (!canvas) {
        showAlert('QR Code not ready for download (Canvas not found).', 'error');
        return;
    }

    const dataURL = canvas.toDataURL('image/png');
    
    // Use the shared downloadFile function from common.js
    const filename = `grifts-qrcode-${dataInput.value.slice(0, 15).replace(/[^a-z0-9]/gi, '')}.png`;
    downloadFile(dataURL, filename, 'image/png');
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Set initial placeholder text
    dataInput.value = defaultContent; 
    
    // Initial generation on load
    generateQRCode();

    // Event listeners
    generateButton.addEventListener('click', generateQRCode);
    
    // Simple input listeners (NO DEBOUNCE) to avoid any potential crash points
    dataInput.addEventListener('input', generateQRCode);
    sizeInput.addEventListener('input', generateQRCode);

    // Download listener
    downloadButton.addEventListener('click', downloadQRCode);
});
