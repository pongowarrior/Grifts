/*
File: js/common.js
Location in SPCK: Create in 'js' folder
Description: All shared utility functions (Memory Store, Alerts, Copy, Download, etc.)
*/

// --- 1. Memory Storage System (In-Memory replacement for localStorage) ---
// Note: This data will NOT persist after a page refresh, as required by the specs.
const memoryStore = {};

/**
 * Saves a key-value pair to the in-memory store.
 * @param {string} key The unique key for the data.
 * @param {*} value The data to store.
 */
function saveToMemory(key, value) {
    // Converts the value to a string before saving
    memoryStore[key] = JSON.stringify(value);
}

/**
 * Loads data from the in-memory store.
 * @param {string} key The unique key for the data.
 * @param {*} defaultValue The value to return if the key is not found.
 * @returns {*} The stored data or the default value.
 */
function loadFromMemory(key, defaultValue = null) {
    const data = memoryStore[key];
    // Parses the string back to a JS object, or returns the default value
    return data ? JSON.parse(data) : defaultValue;
}

/**
 * Clears a specific key or the entire memory store.
 * @param {string|null} key The key to clear (null clears all).
 */
function clearMemory(key = null) {
    if (key) {
        delete memoryStore[key];
    } else {
        // Clears all stored data
        Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
    }
}

// --- 2. Copy to Clipboard Function ---
/**
 * Copies text to the clipboard and shows an alert.
 * @param {string} text The text content to copy.
 * @param {HTMLElement} [buttonElement=null] Optional button element for visual feedback.
 */
function copyToClipboard(text, buttonElement = null) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');

        if (buttonElement) {
            // Provide visual feedback on the button
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✅ Copied!';
            buttonElement.style.background = 'var(--accent-green)';
            buttonElement.style.color = 'var(--bg-dark)';

            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.background = ''; // Revert to CSS style
                buttonElement.style.color = '';
            }, 2000);
        }
    }).catch(() => {
        showAlert('Failed to copy', 'error');
    });
}

// --- 3. Alert System Function ---
/**
 * Displays a floating, temporary alert notification.
 * @param {string} message The message to display.
 * @param {string} [type='info'] The type of alert: 'success', 'error', or 'info'.
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Apply basic CSS for mobile-friendly, fixed alert
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

    // Auto-remove after 3 seconds with a slide-out animation
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// --- 4. Download File Function ---
/**
 * Creates and triggers a download for a text-based file (e.g., JSON, CSV, TXT).
 * @param {string} content The string content of the file.
 * @param {string} filename The name of the file to be downloaded.
 * @param {string} [mimeType='text/plain'] The MIME type of the file.
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object
    showAlert(`Downloaded ${filename}`, 'success');
}

// --- 5. Generate Random ID ---
/**
 * Generates a random alphanumeric ID.
 * @param {number} [length=8] The desired length of the ID.
 * @returns {string} The generated ID.
 */
function generateId(length = 8) {
    // Generate a long random string, then slice and convert to uppercase
    return Math.random().toString(36).substring(2, length + 2).toUpperCase();
}

// --- 6. Debounce Utility ---
/**
 * Returns a function that delays invoking func until after wait milliseconds.
 * Useful for limiting the rate at which a function fires (e.g., on input or scroll).
 * @param {function} func The function to debounce.
 * @param {number} wait The number of milliseconds to wait.
 * @returns {function} The debounced function.
 */
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
    // Looks for internal links (e.g., <a href="#section-id">) and applies smooth scroll
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
