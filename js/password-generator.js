const lengthInput = document.getElementById('password-length');
const outputField = document.getElementById('password-output');
const generateButton = document.getElementById('generate-btn');
const copyButton = document.getElementById('copy-btn');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');

// Character sets
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// --- Password Generation Logic ---

function generatePassword() {
    const length = parseInt(lengthInput.value);
    
    // 1. Determine active character set based on user options
    const options = {
        uppercase: document.getElementById('include-uppercase').checked,
        lowercase: document.getElementById('include-lowercase').checked,
        numbers: document.getElementById('include-numbers').checked,
        symbols: document.getElementById('include-symbols').checked
    };

    let availableChars = '';
    if (options.uppercase) availableChars += charSets.uppercase;
    if (options.lowercase) availableChars += charSets.lowercase;
    if (options.numbers) availableChars += charSets.numbers;
    if (options.symbols) availableChars += charSets.symbols;

    // Check for a valid character set
    if (availableChars.length === 0) {
        outputField.value = 'Select at least one character type.';
        updateStrength(0, 0);
        return;
    }

    // 2. Build the password using cryptographically secure random values
    let password = '';
    const availableLength = availableChars.length;
    
    // Use window.crypto.getRandomValues for true randomness
    const randomBytes = new Uint32Array(length);
    window.crypto.getRandomValues(randomBytes);

    for (let i = 0; i < length; i++) {
        // Use the random number to pick a character index
        const index = randomBytes[i] % availableLength;
        password += availableChars[index];
    }
    
    outputField.value = password;
    calculateAndDisplayStrength(password, availableLength);
}

// --- Strength Calculation (Shannon Entropy) ---

function calculateAndDisplayStrength(password, alphabetSize) {
    const length = password.length;
    
    // Shannon Entropy formula: E = L * log2(N)
    // L = password length
    // N = size of the character set (alphabetSize)
    const entropy = length * Math.log2(alphabetSize);

    // Score is clamped at 128 bits (considered the max for modern security)
    const maxEntropy = 128;
    const strengthPercentage = Math.min(100, (entropy / maxEntropy) * 100);

    updateStrength(strengthPercentage, entropy);
}

function updateStrength(percentage, entropy) {
    let color, text;

    if (percentage === 0) {
        color = 'rgba(255, 255, 255, 0.1)';
        text = 'N/A';
    } else if (percentage < 30) {
        color = '#ff4d4d'; // Red
        text = `Weak (${entropy.toFixed(1)} bits)`;
    } else if (percentage < 60) {
        color = '#ffcc00'; // Yellow
        text = `Moderate (${entropy.toFixed(1)} bits)`;
    } else if (percentage < 85) {
        color = '#79d70f'; // Light Green
        text = `Good (${entropy.toFixed(1)} bits)`;
    } else {
        color = 'var(--accent-green)'; // Neon Green
        text = `Excellent (${entropy.toFixed(1)} bits)`;
    }

    strengthFill.style.width = `${percentage}%`;
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = text;
}


// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial generation
    generatePassword();

    // 2. Generate button listener
    generateButton.addEventListener('click', generatePassword);

    // 3. Option change listener (regenerates on change)
    const optionsElements = document.querySelectorAll('#generator-card input');
    optionsElements.forEach(el => el.addEventListener('change', debounce(generatePassword, 200))); // Debounce prevents rapid fire

    // 4. Copy to Clipboard listener
    copyButton.addEventListener('click', () => {
        // Use the common.js function for alerts and feedback
        copyToClipboard(outputField.value, copyButton);
    });
});
