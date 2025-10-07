/*
File: js/emoji-generator.js
Description: Minimized Text-to-Emoji Generator.
Dependencies: common.js (for memoryStore, copyToClipboard, showAlert, clearMemory)
*/

// DOM Elements & State
const textInput = document.getElementById('text-input');
const styleSelect = document.getElementById('style-select');
const intensitySlider = document.getElementById('intensity-slider');
const intensityValue = document.getElementById('intensity-value');
const emojiOutput = document.getElementById('emoji-output');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
let currentGeneration = null;

// --- Emoji Database & Config ---
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

const surprisePhrases = ["MIND BLOWN", "ABSOLUTE FIRE", "LET'S GO", "NO WAY", "VIRAL", "BUSSIN", "SHEESH", "GOAT", "W TAKE", "GRIND MODE"];

// --- Helper Functions ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

function updateCharCounter() {
    const remaining = 50 - textInput.value.length;
    document.getElementById('char-counter').textContent = `${remaining} characters remaining`;
    document.getElementById('char-counter').style.color = remaining < 10 ? 'var(--accent-green)' : '';
}

function updateIntensityLabel() {
    const value = parseInt(intensitySlider.value);
    intensityValue.textContent = ['Low', 'Medium', 'High'][value - 1];
    intensitySlider.setAttribute('aria-valuenow', value);
}

function processTemplate(template, userText, emojiSet) {
    let result = template.replace(/{TEXT}/g, userText.toUpperCase());
    while (result.includes('{EMOJI}')) {
        result = result.replace('{EMOJI}', getRandomElement(emojiSet));
    }
    return result;
}

// --- Core Generation Logic ---
function generateEmojiString(silent = false) {
    const text = textInput.value.trim();
    if (text.length < 2) {
        if (!silent) showAlert('Please enter at least 2 characters of text.', 'info');
        document.getElementById('copy-btn').disabled = true;
        document.getElementById('favorite-btn').disabled = true;
        // NEW: Disable share button too
        document.getElementById('share-btn').disabled = true;
        emojiOutput.textContent = 'Enter text and choose a style to generate a viral reaction!';
        return;
    }
    
    const styleData = emojiDatabase[styleSelect.value];
    const intensityKey = ['low', 'medium', 'high'][parseInt(intensitySlider.value) - 1];
    const template = getRandomElement(styleData.templates[intensityKey]);
    const finalString = processTemplate(template, text, styleData.emojis);
    
    emojiOutput.textContent = finalString;
    
    currentGeneration = {
        text, style: styleSelect.value, intensity: parseInt(intensitySlider.value),
        result: finalString, timestamp: Date.now()
    };
    
    document.getElementById('copy-btn').disabled = false;
    document.getElementById('favorite-btn').disabled = false;
    // NEW: Enable share button
    document.getElementById('share-btn').disabled = false; 
    
    saveHistory(currentGeneration);
    
    if (!silent) showAlert('Generated successfully!', 'success');
}

// --- History/Favorites Management (GRIFTS Compliant) ---

/** Saves generation to history/favorites, handles memoryStore compliance. */
function updateMemoryStore(key, newEntry) {
    const storedData = memoryStore.getItem(key);
    let items = storedData ? storedData.value : [];
    
    // History logic: Remove old entry to bring it to the top, limit size
    if (key === 'emoji_history') {
        items = items.filter(item => item.result !== newEntry.result);
        items.unshift(newEntry);
        if (items.length > 10) items.pop();
    } 
    // Favorites logic: Prevent exact duplicates
    else if (key === 'emoji_favorites') {
        if (items.some(f => f.result === newEntry.result)) {
            showAlert('Already in favorites!', 'info');
            return;
        }
        items.push(newEntry);
    }
    
    memoryStore.setItem(key, items);
    return true; // Used only for favorites success check
}

function renderHistory() {
    const storedData = memoryStore.getItem('emoji_history');
    const history = storedData ? storedData.value : [];
    
    historySection.style.display = history.length === 0 ? 'none' : 'block';
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item" title="Click to copy">${item.result}</div>
    `).join('');
    
    // Attach copy listeners using event delegation
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (typeof copyToClipboard === 'function') {
                copyToClipboard(e.currentTarget.textContent.trim());
            }
        });
    });
}

const saveHistory = (entry) => {
    updateMemoryStore('emoji_history', entry);
    renderHistory();
};

// --- Initialization & Event Listeners (Minimized) ---
document.addEventListener('DOMContentLoaded', () => {
    // A. Initial setup
    updateCharCounter();
    updateIntensityLabel();
    renderHistory();
    textInput.value = 'HUSTLE';
    generateEmojiString(true);

    // B. Input listeners for real-time updates and silent generation

    // 1. Text and Slider update char counter/label and give live preview
    [textInput, intensitySlider].forEach(element => {
        element.addEventListener('input', () => {
            if (element !== textInput) updateIntensityLabel(); // Only update label for slider
        
            updateCharCounter();
            // Silent generation for live preview if minimum text length is met
            if (textInput.value.trim().length >= 2) generateEmojiString(true);
        });
    });

    // 2. Separate listener for style select (triggers silent generation on change)
    styleSelect.addEventListener('change', () => generateEmojiString(true));
    
    // C. Group button listeners
    document.getElementById('generate-btn').addEventListener('click', () => generateEmojiString(false));
    document.getElementById('surprise-btn').addEventListener('click', () => {
        textInput.value = getRandomElement(surprisePhrases);
        styleSelect.value = getRandomElement(Object.keys(emojiDatabase));
        intensitySlider.value = Math.floor(Math.random() * 3) + 1;
        generateEmojiString();
    });
    
    document.getElementById('copy-btn').addEventListener('click', () => {
        if (emojiOutput.textContent && typeof copyToClipboard === 'function') {
            copyToClipboard(emojiOutput.textContent, document.getElementById('copy-btn'));
        }
    });
    
    document.getElementById('favorite-btn').addEventListener('click', () => {
        if (currentGeneration) {
            if (updateMemoryStore('emoji_favorites', currentGeneration)) {
                showAlert('Added to favorites!', 'success');
            }
        }
    });

    // NEW: Share button logic for viral mechanics
    document.getElementById('share-btn').addEventListener('click', () => {
        const shareText = emojiOutput.textContent;
        const fallbackUrl = 'https://grifts.co.uk/viral/emoji-generator.html'; // SEO friendly link back to the tool
        
        // 1. Prefer modern Web Share API (Mobile responsive)
        if (navigator.share && shareText) {
            navigator.share({
                title: 'Check out my GRIFTS viral message!',
                text: shareText,
                url: fallbackUrl
            }).then(() => {
                showAlert('Shared successfully!', 'success');
            }).catch((error) => {
                if (error.name !== 'AbortError') { 
                    // Fallback to copy on API failure
                    copyToClipboard(shareText, document.getElementById('share-btn'));
                    showAlert('Could not share. Content copied to clipboard!', 'info');
                }
            });
        } 
        // 2. Fallback for desktop/non-supporting browsers
        else if (shareText && typeof copyToClipboard === 'function') {
            copyToClipboard(shareText, document.getElementById('share-btn'));
            showAlert('Content copied to clipboard for manual sharing!', 'info');
        }
    });

    emojiOutput.addEventListener('click', () => {
        if (emojiOutput.textContent && !document.getElementById('copy-btn').disabled && typeof copyToClipboard === 'function') {
            copyToClipboard(emojiOutput.textContent);
        }
    });
    
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        if (typeof clearMemory === 'function') clearMemory('emoji_history');
        renderHistory();
        showAlert('History cleared!', 'success');
    });

    // D. Keyboard shortcuts
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateEmojiString(false);
        }
    });

    // E. Accessibility
    if (typeof focusAnnouncement === 'function') focusAnnouncement();
});
