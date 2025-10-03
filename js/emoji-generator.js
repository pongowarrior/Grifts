// DOM Elements
const textInput = document.getElementById('text-input');
const styleSelect = document.getElementById('style-select');
const generateButton = document.getElementById('generate-btn');
const copyButton = document.getElementById('copy-btn');
const emojiOutput = document.getElementById('emoji-output');

// --- Emoji Template Database (The core "viral" content) ---
// Each template uses placeholders: {TEXT} for user input, {EMOJI} for a random emoji from the set.
const emojiDatabase = {
    fire: {
        emojis: ['🔥', '💯', '✨', '⚡️', '🌶️'],
        templates: [
            "{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI} ABSOLUTE FIRE {EMOJI}{EMOJI}",
            "🚨 {TEXT} 🚨 THIS IS IT! {EMOJI}{EMOJI} GRIND {EMOJI}",
            "GOAT 🐐 {EMOJI} {TEXT} {EMOJI} KEEP GOING! 💯",
            "I'M NOT READY {EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI}{EMOJI}"
        ]
    },
    mindblown: {
        emojis: ['🤯', '😵', '🧠', '👀', '🔬'],
        templates: [
            "WAIT 🤯 WHAT 🤯 DID 🤯 YOU 🤯 JUST 🤯 SAY 🤯 {TEXT}",
            "I'M BLOWN AWAY {EMOJI}{EMOJI} {TEXT} {EMOJI} MY MIND IS GONE 😵",
            "The secret formula 🧪 {EMOJI} {TEXT} {EMOJI} Unlocked! 🔓",
            "This is 5D Chess {EMOJI} I'm still processing {TEXT}"
        ]
    },
    money: {
        emojis: ['💰', '🤑', '💵', '📈', '🚀'],
        templates: [
            "SECURE THE BAG 💰 {EMOJI} {TEXT} {EMOJI} MONEY MOVES 📈",
            "I'M RICH {EMOJI}{EMOJI} {TEXT} {EMOJI} PAYDAY 💵",
            "Just took profits {EMOJI} {TEXT} {EMOJI} To the moon 🚀",
            "Financial freedom looks like this: {TEXT} 🤑🤑"
        ]
    },
    laugh: {
        emojis: ['😂', '🤣', '😭', '💀', '🤡'],
        templates: [
            "I'M DEAD 💀💀 {TEXT} {EMOJI} I can't breathe 😂",
            "Me every time {TEXT}: 🤣😭🤣😭",
            "STOP IT {EMOJI} That's too funny {TEXT} {EMOJI}",
            "The Clowns have entered the chat 🤡🤡 {TEXT}"
        ]
    },
    mixed: {
        emojis: ['✨', '💯', '🔥', '🚀', '🐐', '✅', '👑', '🎉'],
        templates: [
            "{EMOJI}{EMOJI}{EMOJI} {TEXT} {EMOJI}{EMOJI}{EMOJI}",
            "Viral! 🎉 {TEXT} 👑",
            "This is the move ✅ {TEXT} 💯",
            "{TEXT} of the day. No cap. {EMOJI}"
        ]
    }
};

// --- Helper Functions ---

/**
 * Gets a random element from an array.
 */
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Replaces placeholders in the template with user text and random emojis.
 */
function processTemplate(template, userText, emojiSet) {
    const textReplacement = userText.toUpperCase();
    
    let result = template.replace(/{TEXT}/g, textReplacement);

    // Replace all {EMOJI} placeholders with a random emoji from the set
    while (result.includes('{EMOJI}')) {
        result = result.replace('{EMOJI}', getRandomElement(emojiSet));
    }
    
    return result;
}

// --- Core Generation Logic ---

function generateEmojiString() {
    const text = textInput.value.trim();
    const styleKey = styleSelect.value;
    
    if (text.length < 3) {
        showAlert('Please enter at least 3 characters of text.', 'error');
        copyButton.disabled = true;
        emojiOutput.textContent = 'Enter text and choose a style to generate a viral reaction!';
        return;
    }

    const styleData = emojiDatabase[styleKey];
    
    if (!styleData) {
        showAlert('Invalid style selected.', 'error');
        return;
    }

    const template = getRandomElement(styleData.templates);
    const finalString = processTemplate(template, text, styleData.emojis);

    // Display the result
    emojiOutput.textContent = finalString;
    
    // Enable copy button
    copyButton.disabled = false;
    showAlert('Generated successfully!', 'success');
}


// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State
    emojiOutput.textContent = 'Enter text and choose a style to generate a viral reaction!';
    copyButton.disabled = true;

    // 2. Generate button listener
    generateButton.addEventListener('click', generateEmojiString);

    // 3. Debounce input changes for real-time updates
    textInput.addEventListener('input', debounce(generateEmojiString, 400));
    styleSelect.addEventListener('change', generateEmojiString);

    // 4. Copy to Clipboard listener
    copyButton.addEventListener('click', () => {
        const textToCopy = emojiOutput.textContent;
        if (textToCopy) {
            // NOTE: Uses copyToClipboard from common.js
            copyToClipboard(textToCopy, copyButton);
        } else {
            showAlert('Nothing to copy!', 'info');
        }
    });

    // Optional: Run an initial generation with a default value
    textInput.value = 'HUSTLE';
    generateEmojiString();
});
