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

// --- 2. Copy to Clipboard Utility (with fallback) ---
function copyToClipboard(text, buttonElement = null) {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showAlert('Copied to clipboard!', 'success');
            updateButtonFeedback(buttonElement);
        }).catch(() => {
            fallbackCopy(text, buttonElement);
        });
    } else {
        // Fallback for older browsers
        fallbackCopy(text, buttonElement);
    }
}

// Fallback copy method for older browsers
function fallbackCopy(text, buttonElement = null) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showAlert('Copied to clipboard!', 'success');
            updateButtonFeedback(buttonElement);
        } else {
            showAlert('Failed to copy', 'error');
        }
    } catch (err) {
        showAlert('Failed to copy', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Helper function for button visual feedback
function updateButtonFeedback(buttonElement) {
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

// --- 5. ID Generator Utility (with timestamp for collision prevention) ---
function generateId(length = 8) {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    const combined = (timestamp + randomPart).substring(0, length);
    return combined.toUpperCase();
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
// --- 8. Loading State Utility ---
function showLoading(message = 'Loading...') {
    // Remove existing loader if present
    hideLoading();
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 10, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        ">
            <div style="text-align: center;">
                <div style="
                    border: 4px solid var(--border-color);
                    border-top: 4px solid var(--accent-green);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                <p style="color: var(--text-primary); font-size: 1rem;">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
    }
}
// --- 9. Form Validation Utilities ---

/**
 * Validates email format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL format
 */
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates phone number (basic international format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid phone format
 */
function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phone.length >= 10 && phoneRegex.test(phone);
}

/**
 * Checks if string is empty or only whitespace
 * @param {string} str - The string to check
 * @returns {boolean} - True if empty/whitespace only
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Sanitizes string for safe HTML insertion
 * @param {string} str - The string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
// --- 7. Initialization (Smooth Scrolling & Mobile Menu) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- 7a. Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // --- 7b. Mobile Menu Toggle ---
    const nav = document.querySelector('nav .container');
    if (!nav) return;
    
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    // Create hamburger button with animated bars
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
    `;
    
    // Insert hamburger before nav links
    nav.insertBefore(hamburger, navLinks);
    
    // Toggle menu function
    function toggleMenu() {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
        
        // Prevent body scroll when menu is open on mobile
        if (window.innerWidth <= 767) {
            document.body.style.overflow = isActive ? 'hidden' : '';
        }
    }
    
    // Hamburger click handler
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') &&
            !nav.contains(e.target)) {
            toggleMenu();
        }
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu();
            hamburger.focus();
        }
    });
    
    // Close menu when clicking a nav link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Close menu and reset body overflow if resizing to desktop
            if (window.innerWidth > 767 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }, 250);
    });
});