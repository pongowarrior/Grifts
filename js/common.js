/*
File: js/common.js
Description: All shared utility functions (Memory Store, Alerts, Copy, Download, etc.)
*/

// --- 1. Memory Storage System (In-Memory replacement for localStorage) ---
const memoryStore = {};

function saveToMemory(key, value) {
    memoryStore[key] = JSON.stringify(value);
}

function loadFromMemory(key, defaultValue = null) {
    const data = memoryStore[key];
    return data ? JSON.parse(data) : defaultValue;
}

function clearMemory(key = null) {
    if (key) {
        delete memoryStore[key];
    } else {
        Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
    }
}

// --- 2. Copy to Clipboard Utility ---
function copyToClipboard(text, buttonElement = null) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');

        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✅ Copied!';
            buttonElement.style.background = 'var(--accent-green)';
            buttonElement.style.color = 'var(--bg-dark)';

            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.background = '';
                buttonElement.style.color = '';
            }, 2000);
        }
    }).catch(() => {
        showAlert('Failed to copy', 'error');
    });
}

// --- 3. Alert/Notification System ---
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    let alertStyle = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 250px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-sm);
        animation: slideIn 0.3s ease-out;
        box-shadow: var(--shadow-lg);
        font-weight: bold;
    `;

    if (type === 'success') {
        alertStyle += `
            background: rgba(0, 245, 160, 0.2);
            border: 1px solid var(--accent-green);
            color: var(--accent-green);
        `;
    } else if (type === 'error') {
        alertStyle += `
            background: rgba(255, 0, 0, 0.2);
            border: 1px solid #ff0000;
            color: #ff6b6b;
        `;
    } else {
        alertStyle += `
            background: rgba(0, 217, 245, 0.2);
            border: 1px solid var(--accent-blue);
            color: var(--accent-blue);
        `;
    }

    alertDiv.style.cssText = alertStyle;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// --- 4. File Download Utility (FIXED FOR DATA URLs) ---
/**
 * Handles file downloads for both raw text/data and Data URLs (like images).
 * @param {string} content The file content (raw text OR a data: URL).
 * @param {string} filename The name of the file to download.
 * @param {string} mimeType The MIME type of the file.
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    // 1. Determine the source (Data URL for images, Blob for text/data)
    let url;
    let removeUrl = false; // Flag to revoke URL if we create one

    if (content.startsWith('data:')) {
        // If it's a Data URL (like an image from Canvas/QR Code), use it directly
        url = content;
    } else {
        // If it's raw text/data, create a Blob
        const blob = new Blob([content], { type: mimeType });
        url = URL.createObjectURL(blob);
        removeUrl = true; // Mark for cleanup
    }
    
    // 2. Trigger the download using a hidden link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 3. Cleanup
    if (removeUrl) {
        URL.revokeObjectURL(url);
    }
    
    showAlert(`Downloaded ${filename}`, 'success');
}

// --- 5. ID Generator Utility ---
function generateId(length = 8) {
    return Math.random().toString(36).substring(2, length + 2).toUpperCase();
}

// --- 6. Debounce Utility ---
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- 7. Smooth Scrolling Initialization (runs on page load) ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
// --- 8. Mobile Menu Toggle ---
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav .container');
    if (!nav) return;
    
    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.innerHTML = '☰';
    hamburger.style.cssText = `
        display: none;
        background: none;
        border: none;
        color: var(--accent-green);
        font-size: 1.8rem;
        cursor: pointer;
        padding: 0.5rem;
    `;
    
    nav.appendChild(hamburger);
    
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    // Show/hide hamburger based on screen size
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    function handleMobile(e) {
        if (e.matches) {
            hamburger.style.display = 'block';
        } else {
            hamburger.style.display = 'none';
            navLinks.classList.remove('active');
        }
    }
    mediaQuery.addListener(handleMobile);
    handleMobile(mediaQuery);
});