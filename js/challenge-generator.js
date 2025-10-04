/*
File: js/challenge-generator.js
Description: Random Challenge Generator with categories, history, and favorites
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
    const filteredChallenges = getChallengesByCategory(category);
    const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
    return filteredChallenges[randomIndex];
}

/**
 * Displays a challenge with metadata
 */
function displayChallenge(challenge) {
    currentChallenge = challenge;
    
    challengeOutput.innerHTML = `
        <div>${challenge.text}</div>
        <div class="challenge-meta">
            <span class="challenge-tag">${challenge.category.toUpperCase()}</span>
            <span class="challenge-tag">Best for: ${challenge.platform}</span>
        </div>
    `;
    
    // Enable action buttons
    shareButton.disabled = false;
    copyButton.disabled = false;
    favoriteButton.disabled = false;
    
    // Update URL
    updateURL(challenge);
    
    // Add to history
    addToHistory(challenge);
}

/**
 * Generates a new challenge
 */
function generateChallenge(preloadedChallenge = null) {
    let challenge;
    
    if (preloadedChallenge) {
        challenge = preloadedChallenge;
    } else {
        challenge = getRandomChallenge(currentCategory);
    }
    
    displayChallenge(challenge);
    showAlert('New challenge generated!', 'success');
}

/**
 * Updates URL with current challenge
 */
function updateURL(challenge) {
    const encoded = encodeURIComponent(challenge.text);
    const newURL = `${window.location.pathname}?c=${encoded}`;
    window.history.pushState({ challenge }, '', newURL);
}

/**
 * Adds challenge to history
 */
function addToHistory(challenge) {
    let history = loadFromMemory('challenge_history', []);
    
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
}

/**
 * Renders history list
 */
function renderHistory() {
    const history = loadFromMemory('challenge_history', []);
    
    if (history.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    
    historyList.innerHTML = history.map((challenge, index) => `
        <div class="history-item" data-index="${index}">
            <strong>${challenge.text}</strong>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                ${challenge.category.toUpperCase()} • ${challenge.platform}
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const challenge = history[index];
            displayChallenge(challenge);
            showAlert('Challenge loaded from history!', 'info');
        });
    });
}

/**
 * Adds challenge to favorites
 */
function addToFavorites() {
    if (!currentChallenge) return;
    
    let favorites = loadFromMemory('challenge_favorites', []);
    
    // Check if already favorited
    if (favorites.some(f => f.text === currentChallenge.text)) {
        showAlert('Already in favorites!', 'info');
        return;
    }
    
    favorites.push(currentChallenge);
    saveToMemory('challenge_favorites', favorites);
    showAlert('Added to favorites!', 'success');
}

/**
 * Shares challenge using Web Share API or clipboard fallback
 */
async function shareChallenge() {
    if (!currentChallenge) return;
    
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
        } catch (err) {
            // User cancelled or error occurred
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText, shareButton);
            }
        }
    } else {
        // Fallback to clipboard
        copyToClipboard(shareText, shareButton);
    }
}

/**
 * Loads challenge from URL parameter
 */
function loadChallengeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const challengeParam = params.get('c');

    if (challengeParam) {
        const loadedText = decodeURIComponent(challengeParam);
        // Find the challenge in database or create a simple one
        const challenge = challengeDatabase.find(c => c.text === loadedText) || {
            text: loadedText,
            category: 'all',
            platform: 'All'
        };
        generateChallenge(challenge);
        showAlert('Loaded challenge from shared link!', 'info');
    } else {
        generateChallenge();
    }
}

/**
 * Handles category filter changes
 */
function handleCategoryChange(category) {
    currentCategory = category;
    
    // Update active state
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Generate new challenge with filter
    generateChallenge();
}

// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
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
        }
    });
    
    // Favorite button
    favoriteButton.addEventListener('click', addToFavorites);
    
    // Category filters
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            handleCategoryChange(category);
        });
    });
    
    // Clear history button
    clearHistoryButton.addEventListener('click', () => {
        clearMemory('challenge_history');
        renderHistory();
        showAlert('History cleared!', 'success');
    });
    
    // Keyboard shortcut: Space to generate new
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'BUTTON') {
            e.preventDefault();
            generateChallenge();
        }
    });
});