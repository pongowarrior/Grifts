/*
File: js/common.js
Description: Enhanced shared utility functions for GRIFTS
Version: 2.0
Features: Memory Store, Alerts, Copy, Download, Validation, Analytics, Performance
*/

// ============================================================================
// 1. MEMORY STORAGE SYSTEM (In-Memory replacement for localStorage)
// ============================================================================

const memoryStore = {};

/**
 * Save data to memory store with optional expiration
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
function saveToMemory(key, value, ttl = null) {
    const item = {
        value: value,
        timestamp: Date.now(),
        expires: ttl ? Date.now() + ttl : null
    };
    memoryStore[key] = JSON.stringify(item);
}

/**
 * Load data from memory store with expiration check
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
function loadFromMemory(key, defaultValue = null) {
    const data = memoryStore[key];
    if (!data) return defaultValue;
    
    try {
        const item = JSON.parse(data);
        
        // Check expiration
        if (item.expires && Date.now() > item.expires) {
            delete memoryStore[key];
            return defaultValue;
        }
        
        return item.value;
    } catch (e) {
        console.error('Error parsing memory store:', e);
        return defaultValue;
    }
}

/**
 * Clear memory store (specific key or all)
 * @param {string} key - Specific key to clear (optional)
 */
function clearMemory(key = null) {
    if (key) {
        delete memoryStore[key];
    } else {
        Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
    }
}

/**
 * Check if key exists in memory store
 * @param {string} key - Storage key
 * @returns {boolean}
 */
function hasInMemory(key) {
    return key in memoryStore;
}

/**
 * Get all keys in memory store
 * @returns {string[]}
 */
function getMemoryKeys() {
    return Object.keys(memoryStore);
}

// ============================================================================
// 2. CLIPBOARD UTILITIES
// ============================================================================

/**
 * Copy text to clipboard with fallback and feedback
 * @param {string} text - Text to copy
 * @param {HTMLElement} buttonElement - Optional button for visual feedback
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text, buttonElement = null) {
    if (!text) {
        showAlert('Nothing to copy', 'error');
        return false;
    }
    
    try {
        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showAlert('Copied to clipboard!', 'success');
            updateButtonFeedback(buttonElement, '✅ Copied!');
            return true;
        } else {
            // Fallback for older browsers
            return fallbackCopy(text, buttonElement);
        }
    } catch (err) {
        console.error('Clipboard error:', err);
        return fallbackCopy(text, buttonElement);
    }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 * @param {HTMLElement} buttonElement - Optional button for visual feedback
 * @returns {boolean}
 */
function fallbackCopy(text, buttonElement = null) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position:fixed;left:-999999px;top:0;';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    let success = false;
    try {
        success = document.execCommand('copy');
        if (success) {
            showAlert('Copied to clipboard!', 'success');
            updateButtonFeedback(buttonElement, '✅ Copied!');
        } else {
            showAlert('Failed to copy. Please copy manually.', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showAlert('Failed to copy. Please copy manually.', 'error');
    }
    
    document.body.removeChild(textArea);
    return success;
}

/**
 * Update button visual feedback after action
 * @param {HTMLElement} buttonElement - Button to update
 * @param {string} message - Temporary message to display
 * @param {number} duration - Duration in ms
 */
function updateButtonFeedback(buttonElement, message = '✅ Done!', duration = 2000) {
    if (!buttonElement) return;
    
    const originalText = buttonElement.textContent;
    const originalBg = buttonElement.style.background;
    const originalColor = buttonElement.style.color;
    const originalCursor = buttonElement.style.cursor;
    
    buttonElement.textContent = message;
    buttonElement.style.background = 'var(--accent-green)';
    buttonElement.style.color = 'var(--bg-dark)';
    buttonElement.style.cursor = 'default';
    buttonElement.disabled = true;
    
    setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.style.background = originalBg;
        buttonElement.style.color = originalColor;
        buttonElement.style.cursor = originalCursor;
        buttonElement.disabled = false;
    }, duration);
}

// ============================================================================
// 3. ALERT/NOTIFICATION SYSTEM
// ============================================================================

let alertQueue = [];
let alertDisplaying = false;

/**
 * Show alert notification with auto-dismiss
 * @param {string} message - Alert message
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms (0 = no auto-dismiss)
 */
function showAlert(message, type = 'info', duration = 3000) {
    const alert = { message, type, duration };
    alertQueue.push(alert);
    
    if (!alertDisplaying) {
        displayNextAlert();
    }
}

/**
 * Display next alert in queue
 */
function displayNextAlert() {
    if (alertQueue.length === 0) {
        alertDisplaying = false;
        return;
    }
    
    alertDisplaying = true;
    const { message, type, duration } = alertQueue.shift();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.setAttribute('aria-live', 'polite');
    
    // Add icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // Create Icon Span
    const iconSpan = document.createElement('span');
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = icons[type] || icons.info;

    // Create Message Span and set message via textContent (SECURE)
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    // Assemble the alertDiv
    alertDiv.append(iconSpan, messageSpan);

    const colors = {
        success: { bg: 'rgba(0, 245, 160, 0.2)', border: 'var(--accent-green)', text: 'var(--accent-green)' },
        error: { bg: 'rgba(255, 0, 0, 0.2)', border: '#ff0000', text: '#ff6b6b' },
        warning: { bg: 'rgba(255, 165, 0, 0.2)', border: '#ffa500', text: '#ffc266' },
        info: { bg: 'rgba(0, 217, 245, 0.2)', border: 'var(--accent-blue)', text: 'var(--accent-blue)' }
    };

    
    const style = colors[type] || colors.info;
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 250px;
        max-width: 400px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-sm);
        animation: slideIn 0.3s ease-out;
        box-shadow: var(--shadow-lg);
        font-weight: 600;
        background: ${style.bg};
        border: 2px solid ${style.border};
        color: ${style.text};
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
    `;
    
    document.body.appendChild(alertDiv);
    
    // Close on click
    alertDiv.addEventListener('click', () => {
        dismissAlert(alertDiv);
    });
    
    // Auto-dismiss
    if (duration > 0) {
        setTimeout(() => {
            dismissAlert(alertDiv);
        }, duration);
    }
}

/**
 * Dismiss alert with animation
 * @param {HTMLElement} alertDiv - Alert element to dismiss
 */
function dismissAlert(alertDiv) {
    if (!alertDiv || !alertDiv.parentElement) return;
    
    alertDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
        displayNextAlert();
    }, 300);
}

// ============================================================================
// 4. FILE DOWNLOAD UTILITIES
// ============================================================================

/**
 * Download file (handles both text and Data URLs)
 * @param {string} content - File content or Data URL
 * @param {string} filename - Filename for download
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    if (!content || !filename) {
        showAlert('Invalid download parameters', 'error');
        return;
    }
    
    let url;
    let revokeUrl = false;
    
    try {
        if (content.startsWith('data:')) {
            // Data URL (images, etc.)
            url = content;
        } else {
            // Text/data content
            const blob = new Blob([content], { type: mimeType });
            url = URL.createObjectURL(blob);
            revokeUrl = true;
        }
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        if (revokeUrl) {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
        
        showAlert(`Downloaded ${filename}`, 'success');
        trackEvent('file_download', { filename, mimeType });
    } catch (err) {
        console.error('Download error:', err);
        showAlert('Download failed. Please try again.', 'error');
    }
}

/**
 * Download JSON as file
 * @param {Object} data - JSON data
 * @param {string} filename - Filename
 */
function downloadJSON(data, filename = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename, 'application/json');
}

/**
 * Download CSV from array of objects
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename
 */
function downloadCSV(data, filename = 'data.csv') {
    if (!Array.isArray(data) || data.length === 0) {
        showAlert('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ];
    
    downloadFile(csvRows.join('\n'), filename, 'text/csv');
}

// ============================================================================
// 5. VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function validateEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

/**
 * Validate form with visual feedback
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - Is form valid?
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        const errorId = `${input.id}-error`;
        let existingError = document.getElementById(errorId);
        
        // Remove old error
        if (existingError) existingError.remove();
        input.classList.remove('input-error');
        
        // Check validity
        if (!input.checkValidity() || isEmpty(input.value)) {
            isValid = false;
            input.classList.add('input-error');
            
            const error = document.createElement('span');
            error.id = errorId;
            error.className = 'error-message';
            error.textContent = input.validationMessage || 'This field is required';
            error.setAttribute('role', 'alert');
            input.parentNode.appendChild(error);
        }
    });
    
    return isValid;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function validateURL(url) {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate phone number (international format)
 * @param {string} phone - Phone to validate
 * @returns {boolean}
 */
function validatePhone(phone) {
    if (!phone) return false;
    const regex = /^[\d\s\-\+\(\)]+$/;
    return phone.length >= 10 && regex.test(phone);
}

/**
 * Check if string is empty or whitespace
 * @param {string} str - String to check
 * @returns {boolean}
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Validate number in range
 * @param {number} num - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean}
 */

function validateRange(num, min, max) {
    if (num === null || num === undefined) return false;

    const n = Number(num);
    return !isNaN(n) && n >= min && n <= max;
}


// ============================================================================
// 6. ID AND STRING UTILITIES
// ============================================================================

/**
 * Generate unique ID with timestamp
 * @param {number} length - ID length
 * @returns {string}
 */
function generateId(length = 8) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return (timestamp + random).substring(0, length).toUpperCase();
}

/**
 * Generate UUID v4
 * @returns {string}
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string}
 */
function truncate(str, length = 50) {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
}

/**
 * Slugify string for URLs
 * @param {string} str - String to slugify
 * @returns {string}
 */
function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ============================================================================
// 7. DEBOUNCE AND THROTTLE
// ============================================================================

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function}
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================================================
// 8. LOADING STATE UTILITIES
// ============================================================================

/**
 * Show loading overlay
 * @param {string} message - Loading message
 */
function showLoading(message = 'Loading...') {
    hideLoading();
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.setAttribute('role', 'alert');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-busy', 'true');
    
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 10, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        ">
            <div style="text-align: center;">
                <div class="spinner" style="
                    border: 4px solid var(--border-color);
                    border-top: 4px solid var(--accent-green);
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 1.5rem;
                "></div>
                <p id="loader-message-content" style="color: var(--text-primary); font-size: 1.1rem; font-weight: 600;"></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    // SECURELY insert message using textContent after appending the loader
    const messageElement = document.getElementById('loader-message-content');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    document.body.style.overflow = 'hidden';
}

/**
 * Sanitize HTML to prevent XSS (basic version)
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Safe text
 */
function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Create safe DOM element with text content
 * @param {string} tag - Element tag name
 * @param {string} text - Text content
 * @param {string} className - Optional class names
 * @returns {HTMLElement}
 */
function createSafeElement(tag, text, className = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
}


/**
 * Hide loading overlay
 */
function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
        document.body.style.overflow = '';
    }
}

// ============================================================================
// 9. DATE AND TIME UTILITIES
// ============================================================================

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string}
 */
function formatDate(date, format = 'short') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const formats = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    return d.toLocaleDateString('en-US', formats[format] || formats.short);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to compare
 * @returns {string}
 */
function getRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) return formatDate(d);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// ============================================================================
// 10. ANALYTICS TRACKING
// ============================================================================

/**
 * Track custom event (Google Analytics)
 * @param {string} eventName - Event name
 * @param {Object} params - Event parameters
 */
function trackEvent(eventName, params = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, params);
    }
}

/**
 * Track page view
 * @param {string} pagePath - Page path
 */
function trackPageView(pagePath) {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'G-SE21EBPHDE', {
            page_path: pagePath
        });
    }
}

/**
 * Track tool usage
 * @param {string} toolName - Name of tool used
 */
function trackToolUsage(toolName) {
    trackEvent('tool_usage', {
        tool_name: toolName,
        timestamp: Date.now()
    });
}

// ============================================================================
// 11. NAVIGATION AND MOBILE MENU
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScrolling();
    initMobileMenu();
    initAccessibility();
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                target.focus({ preventScroll: true });
            }
        });
    });
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const nav = document.querySelector('nav .container');
    const navLinks = document.querySelector('.nav-links');
    
    if (!nav || !navLinks) return;
    
    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-expanded', 'false');

    const createLine = () => {
        const span = document.createElement('span');
        span.className = 'hamburger-line';
        return span;
    };

    // Append the three lines using the helper function
    hamburger.append(createLine(), createLine(), createLine());
    
    nav.insertBefore(hamburger, navLinks);

    
    // Toggle menu function
    const toggleMenu = () => {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
        
        if (window.innerWidth <= 767) {
            document.body.style.overflow = isActive ? 'hidden' : '';
        }
    };
    
    // Event listeners
    hamburger.addEventListener('click', e => {
        e.stopPropagation();
        toggleMenu();
    });
    
    document.addEventListener('click', e => {
        if (navLinks.classList.contains('active') && !nav.contains(e.target)) {
            toggleMenu();
        }
    });
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu();
            hamburger.focus();
        }
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Handle window resize
    const resizeHandler = debounce(() => {
        if (window.innerWidth > 767 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }, 250);
    
    window.addEventListener('resize', resizeHandler);
}

/**
 * Initialize accessibility improvements
 */
function initAccessibility() {
    // Add keyboard navigation to cards
    document.querySelectorAll('.card').forEach(card => {
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
        
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
    
    // Announce page changes to screen readers
    const pageTitle = document.querySelector('h1');
    if (pageTitle) {
        pageTitle.setAttribute('tabindex', '-1');
        pageTitle.focus();
    }
}

// ============================================================================
// 12. ERROR HANDLING
// ============================================================================

/**
 * Global error handler
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showAlert('An error occurred. Please refresh the page.', 'error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showAlert('An error occurred. Please try again.', 'error');
});

// ============================================================================
// EXPORT FOR MODULE USAGE (Optional)
// ============================================================================

// If using ES6 modules, uncomment below:
// export { saveToMemory, loadFromMemory, copyToClipboard, downloadFile, showAlert, validateEmail, validateURL, generateId, debounce, throttle, showLoading, hideLoading };