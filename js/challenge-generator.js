/*
File: js/challenge-generator.js
Description: Random Challenge Generator with categories, history, and favorites
Version: 2.0 - Enhanced security, error handling, and analytics
*/

// DOM Elements
const generateButton = document.getElementById('generate-btn');
const shareButton = document.getElementById('share-btn');
const copyButton = document.getElementById('copy-btn');
const favoriteButton = document.getElementById('favorite-btn');
const challengeOutput = document.getElementById('challenge-output');
const filterButtons = document.querySelectorAll('.filter-btn');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history-btn');

// State
let currentChallenge = null;
let currentCategory = 'all';

// --- Challenge Database with Categories ---
const challengeDatabase = [
    // Dance
    { text: "The 10-Second Dance: Create a quick dance routine to a trending sound.", category: "dance", platform: "TikTok" },
    { text: "Freeze Frame Challenge: Dance until the music stops, then freeze in place.", category: "dance", platform: "Instagram" },
    { text: "Mirror Dance: Film yourself dancing, then try to mirror it perfectly.", category: "dance", platform: "TikTok" },
    
    // Comedy
    { text: "The 'Wrong Answer Only' Trend: Ask a common question and give the most absurd answer.", category: "comedy", platform: "TikTok" },
    { text: "POV: You're doing the most mundane task, but use the most epic movie score.", category: "comedy", platform: "YouTube" },
    { text: "Expectation vs Reality: Show what you thought would happen vs what actually happened.", category: "comedy", platform: "Instagram" },
    { text: "Impersonate Your Pet: Act out what your pet does when you're not home.", category: "comedy", platform: "TikTok" },
    
    // Educational
    { text: "Behind-the-Scenes Reveal: Show the messiest part of your creative process in 3 seconds.", category: "educational", platform: "Instagram" },
    { text: "The Daily 'Grift': Show one small, clever way you saved time or money today.", category: "educational", platform: "YouTube" },
    { text: "Rate Your Setup: Show your workspace/gear and give it a brutally honest rating out of 10.", category: "educational", platform: "TikTok" },
    { text: "Quick Tip Tuesday: Share your best 5-second life hack.", category: "educational", platform: "Instagram" },
    
    // Transformation
    { text: "The 10-Second Transformation: Show your before-and-after look using a quick cut.", category: "transformation", platform: "TikTok" },
    { text: "Glow Up Challenge: Show your transformation over the past year.", category: "transformation", platform: "Instagram" },
    { text: "Desk Setup Transformation: Show your workspace from messy to organized.", category: "transformation", platform: "YouTube" },
    
    // General/All
    { text: "Emoji Story Challenge: Tell a full story using only 5 emojis in the caption.", category: "all", platform: "All" },
    { text: "Challenge a Rival: Tag a friend and challenge them to replicate your last 3 videos.", category: "all", platform: "All" },
    { text: "The Reverse Tutorial: Film a task backwards and challenge viewers to figure it out.", category: "all", platform: "TikTok" },
    { text: "Sound Sync Challenge: Find a trending sound and perfectly sync your actions to the beat.", category: "all", platform: "TikTok" },
    { text: "Duet Chain: Start a duet and challenge 3 friends to continue it.", category: "all", platform: "TikTok" },
    { text: "This or That: Show two options and let your audience vote in comments.", category: "all", platform: "Instagram" },
];

// --- Helper Functions ---

/**
 * Validates required DOM elements exist
 */
function validateElements() {
    const required = [
        generateButton, shareButton, copyButton, 
        favoriteButton, challengeOutput
    ];
    
    const missing = required.filter(el => !el);
    if (missing.length > 0) {
        console.error('Missing required DOM elements');
        return false;
    }
    return true;
}

/**
 * Validates challenge database
 */
function validateDatabase() {
    if (!Array.isArray(challengeDatabase) || challengeDatabase.length === 0) {
        console.error('Challenge database is invalid or empty');
        return false;
    }
    return true;
}

/**
 * Sanitizes text to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    // Remove any HTML tags and limit length
    const cleaned = text.replace(/<[^>]*>/g, '').substring(0, 500);
    return cleaned.trim();
}

/**
 * Validates challenge object
 * @param {Object} challenge - Challenge to validate
 * @returns {boolean}
 */
function isValidChallenge(challenge) {
    return challenge 
        && typeof challenge.text === 'string' 
        && challenge.text.length > 0
        && typeof challenge.category === 'string'
        && typeof challenge.platform === 'string';
}

/**
 * Gets challenges filtered by category
 */
function getChallengesByCategory(category) {
    if (category === 'all') {
        return challengeDatabase;
    }
    return challengeDatabase.filter(c => c.category === category || c.category === 'all');
}

/**
 * Gets a random challenge from filtered list
 */
function getRandomChallenge(category) {
    try {
        const filteredChallenges = getChallengesByCategory(category);
        
        if (filteredChallenges.length === 0) {
            throw new Error('No challenges found for this category');
        }
        
        const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
        return filteredChallenges[randomIndex];
    } catch (error) {
        console.error('Random challenge error:', error);
        return null;
    }
}

/**
 * Displays a challenge with metadata - SECURE VERSION
 */
function displayChallenge(challenge) {
    if (!isValidChallenge(challenge)) {
        showAlert('Invalid challenge data', 'error');
        return;
    }
    
    currentChallenge = challenge;
    
    // SECURE: Use DOM creation instead of innerHTML
    challengeOutput.innerHTML = ''; // Clear first
    
    const textDiv = document.createElement('div');
    textDiv.textContent = challenge.text; // SAFE - uses textContent
    textDiv.style.marginBottom = '1rem';
    textDiv.style.fontSize = '1.1rem';
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'challenge-meta';
    
    const categoryTag = document.createElement('span');
    categoryTag.className = 'challenge-tag';
    categoryTag.textContent = challenge.category.toUpperCase();
    
    const platformTag = document.createElement('span');
    platformTag.className = 'challenge-tag';
    platformTag.textContent = `Best for: ${challenge.platform}`;
    
    metaDiv.appendChild(categoryTag);
    metaDiv.appendChild(platformTag);
    
    challengeOutput.appendChild(textDiv);
    challengeOutput.appendChild(metaDiv);
    
    // Enable action buttons
    shareButton.disabled = false;
    copyButton.disabled = false;
    favoriteButton.disabled = false;
    
    // Update URL safely
    updateURL(challenge);
    
    // Add to history
    addToHistory(challenge);
}

/**
 * Generates a new challenge
 */
function generateChallenge(preloadedChallenge = null) {
    try {
        let challenge;
        
        if (preloadedChallenge && isValidChallenge(preloadedChallenge)) {
            challenge = preloadedChallenge;
        } else {
            challenge = getRandomChallenge(currentCategory);
        }
        
        if (!challenge) {
            showAlert('Failed to generate challenge', 'error');
            return;
        }
        
        displayChallenge(challenge);
        showAlert('New challenge generated!', 'success');
        trackEvent('challenge_generated', { category: currentCategory });
    } catch (error) {
        console.error('Generate challenge error:', error);
        showAlert('Failed to generate challenge', 'error');
    }
}

/**
 * Updates URL with current challenge - SAFE VERSION
 */
function updateURL(challenge) {
    try {
        // Only store challenge ID or index, not full text
        const challengeIndex = challengeDatabase.findIndex(c => c.text === challenge.text);
        
        if (challengeIndex !== -1) {
            const newURL = `${window.location.pathname}?id=${challengeIndex}`;
            window.history.pushState({ challenge }, '', newURL);
        }
    } catch (error) {
        console.error('URL update error:', error);
    }
}

/**
 * Adds challenge to history
 */
function addToHistory(challenge) {
    try {
        let history = loadFromMemory('challenge_history', []);
        
        // Validate and sanitize before saving
        if (!isValidChallenge(challenge)) return;
        
        // Avoid duplicates at the front
        history = history.filter(h => h.text !== challenge.text);
        
        // Add to front
        history.unshift(challenge);
        
        // Keep only last 10
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        saveToMemory('challenge_history', history);
        renderHistory();
    } catch (error) {
        console.error('History add error:', error);
    }
}

/**
 * Renders history list - SECURE VERSION
 */
function renderHistory() {
    try {
        const history = loadFromMemory('challenge_history', []);
        
        if (!historySection || !historyList) return;
        
        if (history.length === 0) {
            historySection.style.display = 'none';
            return;
        }
        
        historySection.style.display = 'block';
        
        // SECURE: Create DOM elements instead of innerHTML
        historyList.innerHTML = ''; // Clear first
        
        history.forEach((challenge, index) => {
            if (!isValidChallenge(challenge)) return;
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.dataset.index = index;
            item.style.cursor = 'pointer';
            
            const textStrong = document.createElement('strong');
            textStrong.textContent = challenge.text; // SAFE
            
            const metaDiv = document.createElement('div');
            metaDiv.style.marginTop = '0.5rem';
            metaDiv.style.fontSize = '0.8rem';
            metaDiv.style.color = 'var(--text-secondary)';
            metaDiv.textContent = `${challenge.category.toUpperCase()} • ${challenge.platform}`;
            
            item.appendChild(textStrong);
            item.appendChild(metaDiv);
            
            historyList.appendChild(item);
        });
        
        // Add click listeners
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const challenge = history[index];
                if (isValidChallenge(challenge)) {
                    displayChallenge(challenge);
                    showAlert('Challenge loaded from history!', 'info');
                    trackEvent('challenge_history_loaded');
                }
            });
        });
    } catch (error) {
        console.error('History render error:', error);
    }
}

/**
 * Adds challenge to favorites
 */
function addToFavorites() {
    if (!currentChallenge || !isValidChallenge(currentChallenge)) return;
    
    try {
        let favorites = loadFromMemory('challenge_favorites', []);
        
        // Check if already favorited
        if (favorites.some(f => f.text === currentChallenge.text)) {
            showAlert('Already in favorites!', 'info');
            return;
        }
        
        favorites.push(currentChallenge);
        saveToMemory('challenge_favorites', favorites);
        showAlert('Added to favorites!', 'success');
        trackEvent('challenge_favorited', { category: currentChallenge.category });
    } catch (error) {
        console.error('Favorite error:', error);
        showAlert('Failed to add to favorites', 'error');
    }
}

/**
 * Shares challenge using Web Share API or clipboard fallback
 */
async function shareChallenge() {
    if (!currentChallenge) return;
    
    try {
        const shareURL = window.location.href;
        const shareText = `Check out this viral challenge: "${currentChallenge.text}" - Try it yourself: ${shareURL}`;
        
        // Try Web Share API first (mobile friendly)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Viral Challenge',
                    text: shareText,
                    url: shareURL
                });
                showAlert('Challenge shared!', 'success');
                trackEvent('challenge_shared', { method: 'native' });
            } catch (err) {
                // User cancelled or error occurred
                if (err.name !== 'AbortError') {
                    await copyToClipboard(shareText, shareButton);
                    trackEvent('challenge_shared', { method: 'clipboard' });
                }
            }
        } else {
            // Fallback to clipboard
            await copyToClipboard(shareText, shareButton);
            trackEvent('challenge_shared', { method: 'clipboard' });
        }
    } catch (error) {
        console.error('Share error:', error);
        showAlert('Failed to share challenge', 'error');
    }
}

/**
 * Loads challenge from URL parameter - SECURE VERSION
 */
function loadChallengeFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        const challengeId = params.get('id');
        
        if (challengeId) {
            const id = parseInt(challengeId, 10);
            
            // Validate ID is within bounds
            if (!isNaN(id) && id >= 0 && id < challengeDatabase.length) {
                const challenge = challengeDatabase[id];
                generateChallenge(challenge);
                showAlert('Loaded challenge from shared link!', 'info');
                trackEvent('challenge_loaded_from_url');
                return;
            }
        }
        
        // If no valid URL param, generate random
        generateChallenge();
    } catch (error) {
        console.error('URL load error:', error);
        generateChallenge();
    }
}

/**
 * Handles category filter changes
 */
function handleCategoryChange(category) {
    try {
        currentCategory = category;
        
        // Update active state
        if (filterButtons && filterButtons.length > 0) {
            filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === category);
            });
        }
        
        // Generate new challenge with filter
        generateChallenge();
        trackEvent('category_filter_changed', { category });
    } catch (error) {
        console.error('Category change error:', error);
    }
}

/**
 * Check if user is typing
 */
function isUserTyping() {
    const activeTag = document.activeElement?.tagName;
    return activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'BUTTON';
}

// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Validate setup
    if (!validateElements() || !validateDatabase()) {
        showAlert('Page initialization failed', 'error');
        return;
    }
    
    // Load from URL or generate new
    loadChallengeFromURL();
    
    // Render history
    renderHistory();
    
    // Generate button
    generateButton.addEventListener('click', () => generateChallenge());
    
    // Share button
    shareButton.addEventListener('click', shareChallenge);
    
    // Copy button
    copyButton.addEventListener('click', () => {
        if (currentChallenge) {
            copyToClipboard(currentChallenge.text, copyButton);
            trackEvent('challenge_copied');
        }
    });
    
    // Favorite button
    favoriteButton.addEventListener('click', addToFavorites);
    
    // Category filters
    if (filterButtons && filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                if (category) {
                    handleCategoryChange(category);
                }
            });
        });
    }
    
    // Clear history button
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            clearMemory('challenge_history');
            renderHistory();
            showAlert('History cleared!', 'success');
            trackEvent('challenge_history_cleared');
        });
    }
    
    // Keyboard shortcut: Space to generate new
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isUserTyping()) {
            e.preventDefault();
            generateChallenge();
        }
    });
    
    // Track initial load
    trackEvent('challenge_generator_loaded');
});