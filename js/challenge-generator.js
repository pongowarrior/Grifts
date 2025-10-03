// DOM Elements
const generateButton = document.getElementById('generate-btn');
const shareButton = document.getElementById('share-btn');
const challengeOutput = document.getElementById('challenge-output');

// --- Challenge Database (The core "viral" content) ---
// Note: Keep these short, punchy, and TikTok/Reels ready.
const challengeDatabase = [
    "The 10-Second Transformation: Show your before-and-after look using a quick cut.",
    "Emoji Story Challenge: Tell a full story using only 5 emojis in the caption.",
    "Behind-the-Scenes Reveal: Show the messiest part of your creative process in 3 seconds.",
    "The 'Wrong Answer Only' Trend: Ask a common question and give the most absurd answer.",
    "Challenge a Rival: Tag a friend and challenge them to replicate your last 3 videos.",
    "The Reverse Tutorial: Film a task backwards and challenge viewers to figure it out.",
    "Sound Sync Challenge: Find a trending sound and perfectly sync your actions to the beat.",
    "Rate Your Setup: Show your workspace/gear and give it a brutally honest rating out of 10.",
    "The Daily 'Grift': Show one small, clever way you saved time or money today.",
    "POV: You're doing the most mundane task, but use the most epic movie score.",
];

let currentChallenge = '';

// --- Core Generation Logic ---

/**
 * Gets a random challenge from the database.
 */
function getRandomChallenge() {
    const randomIndex = Math.floor(Math.random() * challengeDatabase.length);
    return challengeDatabase[randomIndex];
}

/**
 * Generates and displays a challenge, updating the UI and URL.
 * @param {string} preloadedChallenge - An optional challenge to use (from URL).
 */
function generateChallenge(preloadedChallenge = null) {
    if (preloadedChallenge) {
        currentChallenge = preloadedChallenge;
    } else {
        currentChallenge = getRandomChallenge();
    }
    
    // 1. Display the challenge
    challengeOutput.textContent = currentChallenge;
    
    // 2. Encode the challenge text for the URL
    const encodedChallenge = encodeURIComponent(currentChallenge);
    const newURL = `${window.location.pathname}?c=${encodedChallenge}`;
    
    // 3. Update URL without refreshing the page
    window.history.pushState({ challenge: currentChallenge }, '', newURL);

    // 4. Enable the share button
    shareButton.disabled = false;
    showAlert('New challenge generated! Ready to share.', 'success');
}


// --- URL and Initialization ---

/**
 * Checks URL parameters and loads a poll if present.
 */
function loadChallengeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const challengeParam = params.get('c');

    if (challengeParam) {
        // Decode the challenge and use it
        const loadedChallenge = decodeURIComponent(challengeParam);
        generateChallenge(loadedChallenge);
        showAlert('Loaded challenge from shared link!', 'info');
        // Clear the challenge parameter after loading to avoid confusion on refreshes
        // window.history.pushState(null, '', window.location.pathname);
    } else {
        // Generate a new challenge on a fresh load
        generateChallenge();
    }
}


// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial state check (load from URL or generate new)
    loadChallengeFromURL();

    // 2. Generate button listener
    generateButton.addEventListener('click', generateChallenge);

    // 3. Share button listener
    shareButton.addEventListener('click', () => {
        // The URL is already set by generateChallenge(), so we just copy the current URL
        const shareURL = window.location.href;
        
        // Optional: Customize share text for better platform sharing
        const shareText = `⚡ Viral Challenge Alert! Check out the challenge I got: "${currentChallenge}" — Try it yourself: ${shareURL} #ViralChallenge #Grifts`;
        
        // Use the shared copyToClipboard function from common.js
        copyToClipboard(shareText, shareButton);
    });
});
