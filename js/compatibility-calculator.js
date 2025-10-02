// DOM Elements
const name1Input = document.getElementById('name1-input');
const name2Input = document.getElementById('name2-input');
const calculateButton = document.getElementById('calculate-btn');
const scoreDisplay = document.getElementById('score-display');
const resultMessage = document.getElementById('result-message');
const shareButton = document.getElementById('share-btn');

// --- Compatibility Algorithm ---
// This is a simple, deterministic algorithm designed to be fun and viral.
function calculateCompatibility(name1, name2) {
    // 1. Clean and standardize names
    const cleanName1 = name1.toLowerCase().replace(/[^a-z]/g, '');
    const cleanName2 = name2.toLowerCase().replace(/[^a-z]/g, '');

    if (cleanName1.length === 0 || cleanName2.length === 0) {
        return 0;
    }

    // 2. Base Score: Sum of unique characters in both names
    const combinedName = cleanName1 + cleanName2;
    const uniqueChars = new Set(combinedName.split(''));
    let baseScore = uniqueChars.size * 2.5; // Scale up the score

    // 3. Bonus 1: Matching Letters (How many times a letter from one name is in the other)
    let matchBonus = 0;
    for (const char of cleanName1) {
        if (cleanName2.includes(char)) {
            matchBonus += 1.5;
        }
    }
    
    // 4. Bonus 2: Length Closeness (Closer lengths = higher score)
    const lengthDiff = Math.abs(cleanName1.length - cleanName2.length);
    let lengthBonus = Math.max(0, 15 - lengthDiff * 2); // Max 15 points

    // 5. Final Raw Score Calculation
    let finalScore = baseScore + matchBonus + lengthBonus;

    // 6. Normalize and cap the score (0 to 100)
    // The divisor is set to make scores often fall in the middle (30-80) for shareability
    finalScore = Math.min(100, finalScore * 1.5); // Multiplier makes higher scores more common
    finalScore = Math.max(0, finalScore);
    
    // Use the "LOVE" factor for a dramatic (and viral) twist!
    const loveFactor = (combinedName.match(/[love]/g) || []).length * 5;
    finalScore = Math.min(100, finalScore + loveFactor);

    // Return the final score rounded to the nearest integer
    return Math.round(finalScore);
}

// --- Display Logic ---

function displayResult(score, name1, name2) {
    scoreDisplay.textContent = `${score}%`;
    let message;

    // Set score display color based on result
    if (score < 30) {
        scoreDisplay.style.color = '#ff4d4d'; // Red
        message = "Low compatibility. It might be a wild ride, but worth the clicks!";
    } else if (score < 60) {
        scoreDisplay.style.color = '#ffcc00'; // Yellow
        message = "Moderate connection. You've got potential, go share it!";
    } else if (score < 90) {
        scoreDisplay.style.color = 'var(--accent-green)'; // Green
        message = "High compatibility! A match made in viral heaven. Share this!";
    } else {
        scoreDisplay.style.color = 'var(--accent-blue)'; // Blue (Max Score)
        message = "🔥 Perfect Match! This is a legendary score. Must share immediately.";
    }

    resultMessage.textContent = message;
    
    // Enable share button and set data
    shareButton.style.display = 'block';
    shareButton.dataset.name1 = name1;
    shareButton.dataset.name2 = name2;
    shareButton.dataset.score = score;
}

// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Hide share button initially
    shareButton.style.display = 'none';
    
    calculateButton.addEventListener('click', () => {
        const name1 = name1Input.value.trim();
        const name2 = name2Input.value.trim();

        if (name1.length === 0 || name2.length === 0) {
            showAlert('Please enter both names!', 'error');
            scoreDisplay.textContent = '0%';
            resultMessage.textContent = 'Enter two names and press calculate!';
            shareButton.style.display = 'none';
            return;
        }

        const score = calculateCompatibility(name1, name2);
        displayResult(score, name1, name2);
    });

    // Share button logic (using Web Share API or manual clipboard copy)
    shareButton.addEventListener('click', () => {
        const name1 = shareButton.dataset.name1;
        const name2 = shareButton.dataset.name2;
        const score = shareButton.dataset.score;
        
        const shareText = `My compatibility score with ${name2} is ${score}%! Check your score at ${window.location.href} #CompatibilityCalculator #Grifts`;
        
        // Use Web Share API if available (best for mobile)
        if (navigator.share) {
            navigator.share({
                title: 'Compatibility Score',
                text: shareText,
                url: window.location.href,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            // Fallback to copying to clipboard
            copyToClipboard(shareText, shareButton);
        }
    });
});
