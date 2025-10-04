/*
File: js/emoji-generator.js
Description: Text-to-Emoji Generator with intensity control, history, and favorites
*/

// DOM Elements
const textInput = document.getElementById('text-input');
const styleSelect = document.getElementById('style-select');
const intensitySlider = document.getElementById('intensity-slider');
const intensityValue = document.getElementById('intensity-value');
const generateButton = document.getElementById('generate-btn');
const surpriseButton = document.getElementById('surprise-btn');
const copyButton = document.getElementById('copy-btn');
const favoriteButton = document.getElementById('favorite-btn');
const emojiOutput = document.getElementById('emoji-output');
const charCounter = document.getElementById('char-counter');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history-btn');

// State
let currentGeneration = null;

// --- Emoji Database (Expanded) ---
const emojiDatabase = {
    fire: {
        emojis: ['🔥', '💯', '✨', '⚡️', '🌶️', '💥'],
        templates: {
            low: ["{TEXT} 🔥", "🔥 {TEXT}", "{TEXT} is fire 🔥"],
            medium: ["{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI} ABSOLUTE FIRE", "🚨 {TEXT} 🚨 THIS IS IT! {EMOJI}{EMOJI}"],
            high: ["{EMOJI}{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI}{EMOJI} I'M NOT READY FOR THIS LEVEL OF FIRE", "GOAT STATUS 🐐 {EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI} KEEP GOING! 💯{EMOJI}"]
        }
    },
    mindblown: {
        emojis: ['🤯', '😵', '🧠', '👀', '🔬', '💭'],
        templates: {
            low: ["🤯 {TEXT}", "{TEXT} 🧠", "Mind = blown {TEXT}"],
            medium: ["WAIT 🤯 {TEXT} 🤯 THIS IS CRAZY", "I'M BLOWN AWAY {EMOJI} {TEXT} {EMOJI} MY MIND IS GONE"],
            high: ["WAIT 🤯 WHAT 🤯 DID 🤯 YOU 🤯 JUST 🤯 SAY 🤯 {TEXT} {EMOJI}{EMOJI}", "This is 5D Chess {EMOJI}{EMOJI} I'm still processing {TEXT} {EMOJI}{EMOJI}"]
        }
    },
    money: {
        emojis: ['💰', '🤑', '💵', '📈', '🚀', '💸'],
        templates: {
            low: ["💰 {TEXT}", "{TEXT} 📈", "Money moves {TEXT} 🤑"],
            medium: ["SECURE THE BAG 💰 {EMOJI} {TEXT} {EMOJI} MONEY MOVES 📈", "I'M RICH {TEXT} {EMOJI} PAYDAY 💵"],
            high: ["SECURE THE BAG 💰{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI} TO THE MOON 🚀 NO CAP", "Financial freedom looks like this: {TEXT} 🤑🤑{EMOJI}{EMOJI} WE EATING GOOD"]
        }
    },
    laugh: {
        emojis: ['😂', '🤣', '😭', '💀', '🤡'],
        templates: {
            low: ["😂 {TEXT}", "{TEXT} 💀", "I'm crying {TEXT} 😭"],
            medium: ["I'M DEAD 💀💀 {TEXT} {EMOJI} I can't breathe 😂", "Me every time {TEXT}: 🤣😭🤣"],
            high: ["I'M LITERALLY DEAD 💀💀💀 {TEXT} {EMOJI}{EMOJI} SOMEONE CALL 911 I CAN'T BREATHE 😂😂", "STOP IT {EMOJI}{EMOJI} That's too funny {TEXT} {EMOJI}{EMOJI} THE CLOWNS HAVE ENTERED 🤡"]
        }
    },
    gaming: {
        emojis: ['🎮', '🏆', '👾', '🎯', '⚔️', '🕹️'],
        templates: {
            low: ["🎮 {TEXT}", "{TEXT} 🏆", "GG {TEXT}"],
            medium: ["VICTORY ROYALE 🏆 {EMOJI} {TEXT} {EMOJI} LET'S GO", "CLUTCH {TEXT} {EMOJI}{EMOJI} ABSOLUTELY INSANE"],
            high: ["POGGERS 🎮{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI} THAT'S THE PLAY OF THE CENTURY 🏆", "ONE TAP {TEXT} {EMOJI}{EMOJI} NOBODY IS ON MY LEVEL ⚔️{EMOJI}"]
        }
    },
    hype: {
        emojis: ['🎉', '🎊', '🙌', '🔊', '📣', '💫'],
        templates: {
            low: ["🎉 {TEXT}", "{TEXT} 🙌", "Hype! {TEXT}"],
            medium: ["LET'S GOOO {EMOJI} {TEXT} {EMOJI} THE ENERGY IS UNMATCHED", "HYPE TRAIN 🚂 {TEXT} {EMOJI}{EMOJI}"],
            high: ["LET'S GOOOOO {EMOJI}{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI}{EMOJI} I'M SO HYPED RIGHT NOW 🔊", "THE ENERGY IS UNREAL {EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI} WE'RE GOING CRAZY 🎊"]
        }
    },
    mixed: {
        emojis: ['✨', '💯', '🔥', '🚀', '🐐', '✅', '👑', '🎉'],
        templates: {
            low: ["{EMOJI} {TEXT}", "{TEXT} {EMOJI}", "{TEXT} of the day {EMOJI}"],
            medium: ["{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI}", "Viral! 🎉 {TEXT} 👑", "This is the move ✅ {TEXT} 💯"],
            high: ["{EMOJI}{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI}{EMOJI} ABSOLUTELY LEGENDARY", "{TEXT} NO CAP {EMOJI}{EMOJI} THIS IS IT {EMOJI}{EMOJI}"]
        }
    }
};

// Surprise phrases for random generation
const surprisePhrases = [
    "MIND BLOWN", "ABSOLUTE FIRE", "LET'S GO", "NO WAY", "VIRAL", 
    "BUSSIN", "SHEESH", "GOAT", "W TAKE", "GRIND MODE"
];

// --- Helper Functions ---
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function updateCharCounter() {
    const remaining = 50 - textInput.value.length;
    charCounter.textContent = `${remaining} characters remaining`;
    charCounter.style.color = remaining < 10 ? 'var(--accent-green)' : '';
}

function updateIntensityLabel() {
    const value = parseInt(intensitySlider.value);
    const labels = ['Low', 'Medium', 'High'];
    intensityValue.textContent = labels[value - 1];
    intensitySlider.setAttribute('aria-valuenow', value);
}

function processTemplate(template, userText, emojiSet) {
    const textReplacement = userText.toUpperCase();
    let result = template.replace(/{TEXT}/g, textReplacement);
    
    // Replace {EMOJI} placeholders
    while (result.includes('{EMOJI}')) {
        result = result.replace('{EMOJI}', getRandomElement(emojiSet));
    }
    
    return result;
}

// --- Core Generation Logic ---
function generateEmojiString(silent = false) {
    const text = textInput.value.trim();
    const styleKey = styleSelect.value;
    const intensity = parseInt(intensitySlider.value);
    
    if (text.length < 2) {
        if (!silent) {
            showAlert('Please enter at least 2 characters of text.', 'info');
        }
        copyButton.disabled = true;
        favoriteButton.disabled = true;
        emojiOutput.textContent = 'Enter text and choose a style to generate a viral reaction!';
        return;
    }
    
    const styleData = emojiDatabase[styleKey];
    if (!styleData) return;
    
    // Get templates based on intensity
    const intensityKey = intensity === 1 ? 'low' : intensity === 2 ? 'medium' : 'high';
    const templates = styleData.templates[intensityKey];
    
    const template = getRandomElement(templates);
    const finalString = processTemplate(template, text, styleData.emojis);
    
    // Display result
    emojiOutput.textContent = finalString;
    
    // Store current generation
    currentGeneration = {
        text: text,
        style: styleKey,
        intensity: intensity,
        result: finalString,
        timestamp: Date.now()
    };
    
    // Enable buttons
    copyButton.disabled = false;
    favoriteButton.disabled = false;
    
    // Add to history
    addToHistory(currentGeneration);
    
    if (!silent) {
        showAlert('Generated successfully!', 'success');
    }
}

// --- Surprise Me Function ---
function surpriseMe() {
    // Random text
    textInput.value = getRandomElement(surprisePhrases);
    
    // Random style
    const styles = Object.keys(emojiDatabase);
    styleSelect.value = getRandomElement(styles);
    
    // Random intensity
    intensitySlider.value = Math.floor(Math.random() * 3) + 1;
    updateIntensityLabel();
    
    // Generate
    generateEmojiString();
}

// --- History Management ---
function addToHistory(generation) {
    let history = loadFromMemory('emoji_history', []);
    
    // Avoid exact duplicates
    history = history.filter(h => h.result !== generation.result);
    
    history.unshift(generation);
    
    // Keep last 10
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    saveToMemory('emoji_history', history);
    renderHistory();
}

function renderHistory() {
    const history = loadFromMemory('emoji_history', []);
    
    if (history.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" data-index="${index}" title="Click to copy">
            ${item.result}
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const text = e.currentTarget.textContent.trim();
            copyToClipboard(text);
        });
    });
}

// --- Favorites Management ---
function addToFavorites() {
    if (!currentGeneration) return;
    
    let favorites = loadFromMemory('emoji_favorites', []);
    
    // Check if already favorited
    if (favorites.some(f => f.result === currentGeneration.result)) {
        showAlert('Already in favorites!', 'info');
        return;
    }
    
    favorites.push(currentGeneration);
    saveToMemory('emoji_favorites', favorites);
    showAlert('Added to favorites!', 'success');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Update counters
    updateCharCounter();
    updateIntensityLabel();
    
    // Render history
    renderHistory();
    
    // Initial generation with default value
    textInput.value = 'HUSTLE';
    generateEmojiString(true);
    
    // Character counter
    textInput.addEventListener('input', updateCharCounter);
    
    // Intensity slider
    intensitySlider.addEventListener('input', () => {
        updateIntensityLabel();
        if (textInput.value.trim().length >= 2) {
            generateEmojiString(true);
        }
    });
    
    // Style select change
    styleSelect.addEventListener('change', () => {
        if (textInput.value.trim().length >= 2) {
            generateEmojiString(true);
        }
    });
    
    // Generate button
    generateButton.addEventListener('click', () => generateEmojiString(false));
    
    // Surprise button
    surpriseButton.addEventListener('click', surpriseMe);
    
    // Copy button
    copyButton.addEventListener('click', () => {
        const text = emojiOutput.textContent;
        if (text) {
            copyToClipboard(text, copyButton);
        }
    });
    
    // Favorite button
    favoriteButton.addEventListener('click', addToFavorites);
    
    // Click output to copy
    emojiOutput.addEventListener('click', () => {
        const text = emojiOutput.textContent;
        if (text && !copyButton.disabled) {
            copyToClipboard(text);
        }
    });
    
    // Clear history
    clearHistoryButton.addEventListener('click', () => {
        clearMemory('emoji_history');
        renderHistory();
        showAlert('History cleared!', 'success');
    });
    
    // Enter key support
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateEmojiString(false);
        }
    });
});