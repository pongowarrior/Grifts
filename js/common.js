/*
File: js/common.js
Description: Enhanced shared utility functions for GRIFTS
Version: 3.1 - FINAL Modular Core with Full Utility Logic
Features: Modular AppCore, Alerts, Copy, Download, Validation, Analytics, Performance
*/

// ============================================================================
// 1. CORE UTILITIES MODULE (AppCore) - Encapsulated IIFE
// ============================================================================
const AppCore = (() => {
    // ----------------------------------------------------------------------
    // 1.1. MEMORY STORAGE SYSTEM (In-Memory replacement for localStorage)
    // ----------------------------------------------------------------------
    const memoryStore = {};

    function saveToMemory(key, value, ttl = null) {
        const item = {
            value: value,
            timestamp: Date.now(),
            expires: ttl ? Date.now() + ttl : null
        };
        memoryStore[key] = JSON.stringify(item);
        console.log(`AppCore.saveToMemory: Set key "${key}"`);
    }

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
            console.error('AppCore.loadFromMemory: Error parsing item:', e);
            delete memoryStore[key];
            return defaultValue;
        }
    }
    
    // ----------------------------------------------------------------------
    // 1.2. ALERT SYSTEM
    // ----------------------------------------------------------------------
    let alertQueue = [];
    let alertDisplaying = false;

    // Helper: Display the next alert in queue
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
        
        // Icon map
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const iconSpan = document.createElement('span');
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = icons[type] || icons.info;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;

        alertDiv.append(iconSpan, messageSpan);

        // Styling based on CSS variables (must match style.css)
        const style = {
            success: { bg: 'rgba(0, 245, 160, 0.2)', border: '#00f5a0', text: '#00f5a0' },
            error: { bg: 'rgba(255, 0, 0, 0.2)', border: '#ff0000', text: '#ff6b6b' },
            warning: { bg: 'rgba(255, 165, 0, 0.2)', border: '#ffa500', text: '#ffc266' },
            info: { bg: 'rgba(0, 217, 245, 0.2)', border: '#00d9f5', text: '#00d9f5' }
        }[type] || { bg: 'rgba(0, 217, 245, 0.2)', border: '#00d9f5', text: '#00d9f5' };
        
        // Inline styles for rapid alert creation
        alertDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 250px;
            max-width: 400px;
            padding: 1rem 1.5rem;
            border-radius: 8px; /* var(--radius-sm) */
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); /* var(--shadow-lg) */
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
        
        const dismissAlert = (div) => {
            if (!div || !div.parentElement) return;
            div.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (div.parentElement) div.remove();
                displayNextAlert();
            }, 300);
        };
        
        alertDiv.addEventListener('click', () => dismissAlert(alertDiv));
        
        if (duration > 0) {
            setTimeout(() => dismissAlert(alertDiv), duration);
        }
    }
    
    // Public: Show alert
    function showAlert(message, type = 'info', duration = 3000) {
        const alert = { message, type, duration };
        alertQueue.push(alert);
        
        if (!alertDisplaying) {
            displayNextAlert();
        }
    }

    // ----------------------------------------------------------------------
    // 1.3. CLIPBOARD UTILITIES
    // ----------------------------------------------------------------------

    /** Updates button visual feedback (from V2.0 logic) */
    function updateButtonFeedback(buttonElement, message = '✅ Done!', duration = 2000) {
        if (!buttonElement) return;
        
        const originalText = buttonElement.textContent;
        const originalBg = buttonElement.style.background;
        const originalColor = buttonElement.style.color;
        const originalCursor = buttonElement.style.cursor;
        
        buttonElement.textContent = message;
        // Use hardcoded theme colors since it's an inline style application
        buttonElement.style.background = '#00f5a0'; 
        buttonElement.style.color = '#0a0a0a';
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
    
    /** Fallback copy method (from V2.0 logic) */
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

    // Public: Copy to clipboard (from V2.0 logic)
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


    // ----------------------------------------------------------------------
    // 1.4. DOWNLOAD FILE (Text/Blob)
    // ----------------------------------------------------------------------
    
    // Public: Download file (from V2.0 logic)
    function downloadFile(content, filename, mimeType = 'text/plain') {
        if (!content || !filename) {
            showAlert('Invalid download parameters', 'error');
            return;
        }
        
        let url;
        let revokeUrl = false;
        
        try {
            if (content.startsWith('data:')) {
                url = content;
            } else {
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
            Tracker.trackEvent('file_download', { filename, mimeType }); // Uses global Tracker
        } catch (err) {
            console.error('Download error:', err);
            showAlert('Download failed. Please try again.', 'error');
        }
    }

    // ----------------------------------------------------------------------
    // 1.5. INPUT VALIDATION
    // ----------------------------------------------------------------------

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function validateURL(url) {
        try { return new URL(url) && true; } catch (e) { return false; }
    }
    
    // ----------------------------------------------------------------------
    // 1.6. PERFORMANCE UTILITIES
    // ----------------------------------------------------------------------

    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            const context = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    
    // ----------------------------------------------------------------------
    // 1.7. MISC UTILITIES & LOADING
    // ----------------------------------------------------------------------

    function generateId(prefix = 'grifts-') {
        return prefix + Math.random().toString(36).substring(2, 9);
    }
    
    function showLoading(message = 'Loading...') {
        // Implementation uses the global 'global-loader' pattern from V2.0
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.setAttribute('role', 'alert');
        loader.setAttribute('aria-live', 'polite');
        loader.setAttribute('aria-busy', 'true');
        
        loader.innerHTML = `
            <div class="loader">
                <div style="text-align: center;">
                    <div class="spinner" style="
                        border: 4px solid rgba(255, 255, 255, 0.1);
                        border-top: 4px solid #00f5a0;
                        border-radius: 50%;
                        width: 60px;
                        height: 60px;
                        animation: spin 0.8s linear infinite;
                        margin: 0 auto 1.5rem;
                    "></div>
                    <p id="loader-message-content" style="color: #ffffff; font-size: 1.1rem; font-weight: 600;"></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(loader);
        
        const messageElement = document.getElementById('loader-message-content');
        if (messageElement) {
            messageElement.textContent = message;
        }
        document.body.style.overflow = 'hidden';
    }

    function hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.remove();
            document.body.style.overflow = '';
        }
    }


    // Make only the necessary functions available publicly
    return {
        saveToMemory,
        loadFromMemory,
        showAlert,
        copyToClipboard,
        downloadFile,
        validateEmail,
        validateURL,
        generateId,
        debounce,
        throttle,
        showLoading,
        hideLoading
    };
})();
// ============================================================================


// ============================================================================
// 10. MONETIZATION MODULES
// ============================================================================

// 10.1. ANALYTICS/EVENT TRACKER (Simple Console Tracker)
const Tracker = (() => {
    function trackEvent(eventName, details = {}) {
        // This is the frontend-only implementation.
        console.log(`[GRIFTS TRACKER] EVENT: ${eventName}`, details);
    }
    return { trackEvent };
})();


// 10.5. MONETIZATION UTILITIES (Affiliate Spot)
const AffiliateSpot = (() => {
    const SPOT_SELECTOR = '.ad-affiliate';

    // Weighted list of high-value affiliate spots (Please replace link placeholders!)
    const ads = [
        {
            weight: 50,
            title: '🔥 Secure Your Grind with a Pro VPN!',
            description: 'Creators and gamers need privacy. Get 3 months free on the best VPN for speed and security.',
            cta: 'Claim Your Deal Now',
            link: 'https://affiliate.link/vpn-promo',
            bg_class: 'ad-spot-vpn' // Optional class for custom styling
        },
        {
            weight: 30,
            title: '⚡ Boost Your Uploads! Get an NVMe Drive.',
            description: 'Slow storage kills momentum. Upgrade your rig with the fastest gear recommended by pros.',
            cta: 'See Top SSDs',
            link: 'https://affiliate.link/ssd-hardware',
            bg_class: 'ad-spot-hardware'
        },
        {
            weight: 20,
            title: '💡 The Headline Tool That Pays For Itself',
            description: 'Generate 10x better hooks for your videos/blogs. Try the #1 AI Content Generator free!',
            cta: 'Start Free Trial',
            link: 'https://affiliate.link/ai-writer-tool',
            bg_class: 'ad-spot-saas'
        }
    ];

    function getRandomWeightedAd() {
        const totalWeight = ads.reduce((sum, ad) => sum + ad.weight, 0);
        let randomNum = Math.random() * totalWeight;

        for (const ad of ads) {
            if (randomNum < ad.weight) {
                return ad;
            }
            randomNum -= ad.weight;
        }
        return ads[0]; // Fallback
    }

    function renderAd(container, ad) {
        const adHtml = `
            <h3 class="card-title">${ad.title}</h3>
            <p class="card-description">${ad.description}</p>
            <a href="${ad.link}" 
               class="btn affiliate-cta" 
               target="_blank" 
               rel="noopener noreferrer" 
               onclick="Tracker.trackEvent('affiliate_click', { ad_name: '${ad.title.slice(0, 15)}' })">
                ${ad.cta}
            </a>
        `;
        container.innerHTML = adHtml;
        if (ad.bg_class) {
            container.classList.add(ad.bg_class);
        }
        Tracker.trackEvent('affiliate_impression', { ad_name: ad.title.slice(0, 15) });
    }

    function init() {
        const adContainer = document.querySelector(SPOT_SELECTOR);
        if (adContainer) {
            const selectedAd = getRandomWeightedAd();
            renderAd(adContainer, selectedAd);
        }
    }

    return {
       init: init
    };
})();
// ============================================================================


// ============================================================================
// 11. INITIALIZATION & NAVIGATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 11.1. Core component setup (Mobile menu, etc.)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // --- Mobile Menu Logic (from V2.0)
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // Handle window resize for mobile menu cleanup
        const resizeHandler = AppCore.debounce(() => {
            if (window.innerWidth > 767 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }, 250);
        
        window.addEventListener('resize', resizeHandler);
    }
    // --- End Mobile Menu Logic

    // 11.2. Monetization Setup
    AffiliateSpot.init();

    // 11.3. Accessibility Enhancement: Make cards keyboard focusable (from V2.0)
    document.querySelectorAll('.tool-grid .card').forEach(card => {
        // Ensure only non-link/non-button cards get tabindex
        if (card.tagName === 'A' || card.tagName === 'BUTTON') {
            // Already focusable
        } else {
            card.setAttribute('tabindex', '0');
        }
        
        // Allow activation with Enter/Space for non-links/buttons
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // If the card contains a link, navigate to it, otherwise fire a click event
                const firstLink = card.querySelector('a');
                if (firstLink) {
                    firstLink.click();
                } else {
                    card.click();
                }
            }
        });
    });
    
    // Announce page changes to screen readers (from V2.0)
    const pageTitle = document.querySelector('h1');
    if (pageTitle) {
        pageTitle.setAttribute('tabindex', '-1');
        pageTitle.focus();
    }
});
// ============================================================================


// ****************************************************************************
// IMPORTANT: Only expose AppCore and Tracker globally for use in tool scripts.
// ****************************************************************************
window.AppCore = AppCore;
window.Tracker = Tracker;
