// DOM Elements
const name1Input = document.getElementById('name1-input');
const name2Input = document.getElementById('name2-input');
const calculateButton = document.getElementById('calculate-btn');
const scoreDisplay = document.getElementById('score-display');
const resultMessage = document.getElementById('result-message');
const shareButton = document.getElementById('share-btn');
const heartEmoji = document.getElementById('heart-emoji');
const downloadPdfButton = document.getElementById('download-pdf-btn');

// --- Compatibility Algorithm (The Viral JS Trick) ---
// Classic "Love Calculator" score reduction logic for fun, deterministic results.
function calculateCompatibility(name1, name2) {
    // 1. Clean and standardize names
    const cleanName1 = name1.toLowerCase().replace(/[^a-z]/g, '');
    const cleanName2 = name2.toLowerCase().replace(/[^a-z]/g, '');

    if (cleanName1.length === 0 || cleanName2.length === 0) {
        return 0;
    }
    
    // 2. Combine and count letter frequencies
    const combinedName = cleanName1 + cleanName2;
    const frequency = {};
    for (const char of combinedName) {
        frequency[char] = (frequency[char] || 0) + 1;
    }

    // 3. Create the initial sequence string (e.g., "4112" from "adamnana")
    let sequence = Object.values(frequency).join('');

    // 4. Reduction Loop: Sum adjacent digits until the result is 2 digits or less.
    while (sequence.length > 2) {
        let newSequence = '';
        for (let i = 0; i < sequence.length - 1; i++) {
            // Sum adjacent digits
            const digitSum = (parseInt(sequence[i]) + parseInt(sequence[i+1])).toString();
            newSequence += digitSum;
        }
        sequence = newSequence;
        
        // Final forced reduction if it's still too long due to small sums (e.g., "121212")
        if (sequence.length > 2 && sequence.length < combinedName.length) { 
             const firstDigit = parseInt(sequence[0]);
             const secondDigit = parseInt(sequence[1]);
             sequence = (firstDigit + secondDigit).toString();
        }
    }
    
    // 5. Final Score is the resulting two-digit number.
    let score = parseInt(sequence);
    
    // If the sequence is still one digit (e.g., '1'), convert to 10%
    if (sequence.length === 1) {
        score = score * 10;
    }
    
    // If score is 100 or more, clamp it.
    return Math.min(score, 99);
}


// --- Result Display and Visualization ---
const scoreRanges = [
    { min: 0, max: 20, emoji: '💔', color: '#ff4d4d', message: "Warning: Low Signal! The algorithms don't like this match. Time for a re-brand? Score: {S}%" }, // Red
    { min: 21, max: 40, emoji: '🤔', color: '#ffcc00', message: "Potential Detected. There's a spark, but you'll need to work on your synergy. Score: {S}%" }, // Yellow
    { min: 41, max: 70, emoji: '🤝', color: 'var(--accent-blue)', message: "Strong Connection! This partnership has excellent viral potential. Score: {S}%" }, // Blue
    { min: 71, max: 99, emoji: '🔥', color: 'var(--accent-green)', message: "MAX VIRALITY! You are a perfect, algorithm-optimized match. Go dominate the feed! Score: {S}%" } // Green
];

function displayResult(score, name1, name2) {
    const range = scoreRanges.find(r => score >= r.min && score <= r.max);
    
    // 1. Apply Visual Effects (Color, Glow, Pulse)
    scoreDisplay.textContent = `${score}%`;
    scoreDisplay.style.color = range.color;
    scoreDisplay.classList.add('score-glow');
    
    heartEmoji.textContent = range.emoji;
    heartEmoji.classList.add('heart-pulse');
    
    // 2. Update Message
    resultMessage.textContent = range.message.replace(/{S}/g, score);
    
    // 3. Prepare Share/PDF Data
    shareButton.dataset.name1 = name1;
    shareButton.dataset.name2 = name2;
    shareButton.dataset.score = score;
    shareButton.style.display = 'block';
    
    downloadPdfButton.dataset.name1 = name1;
    downloadPdfButton.dataset.name2 = name2;
    downloadPdfButton.dataset.score = score;
    downloadPdfButton.style.display = 'block';

    showAlert(`Score calculated: ${score}%`, 'success');

    // 4. Remove glow after a short period 
    setTimeout(() => {
        scoreDisplay.classList.remove('score-glow');
    }, 1500);
}


// --- Monetization Hook: PDF Report Generation ---
// This simulates a paid report download using the shared downloadFile function.
function generatePDFReport(name1, name2, score) {
    // The "micro-payment" is simulated: user clicks, and the content is generated.
    
    // Using .txt to avoid complex external PDF library (jsPDF) dependencies.
    const filename = `Grifts-Report-${name1}-and-${name2}.txt`; 

    const reportContent = `
    
        *** GRIFTS VIRAL COMPATIBILITY REPORT ***
        
        📈 Partnership Optimization Index: ${score}%
        
        -------------------------------------------
        
        Names Analyzed: ${name1} & ${name2}
        
        Algorithm Used: Love Sequence Reduction (LSR) V4.2 - *Highly Viral*
        
        -------------------------------------------
        
        --- DETAILED ANALYSIS ---
        
        **1. Viral Synergy:**
        - Your combined digital footprint suggests high potential for collaborative content. 
        - The algorithm predicts a ${score}% chance of hitting the "For You" page.
        
        **2. Content Clash Index:**
        - ${score < 50 ? 'RED FLAG: Significant difference in online posting schedules. Requires synchronization.' : 'GREEN FLAG: Highly aligned posting habits. Minimal content overlap.'}
        
        **3. Suggested Action:**
        - ${score >= 71 ? '✅ STATUS: GO-VIRAL - Immediately launch a joint content series titled "The Optimized Duo."' : 
          score >= 41 ? '🟠 STATUS: OPTIMIZE - Find a common viral niche and run A/B tests on joint posts.' :
          '❌ STATUS: RE-EVALUATE - Try analyzing your stage names or online aliases instead.'}
          
        *Disclaimer: This report is for entertainment and viral purposes only. Grifts.co.uk is not responsible for relationship outcomes or TikTok trends.*
        
    `;
    
    // Assumes downloadFile is available via common.js
    downloadFile(reportContent, filename, 'text/plain');
    showAlert('Paid Report (Text File) Generated! Check your downloads.', 'info');
}

// --- Initialization / Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial hide
    shareButton.style.display = 'none';
    downloadPdfButton.style.display = 'none';
    
    calculateButton.addEventListener('click', () => {
        const name1 = name1Input.value.trim();
        const name2 = name2Input.value.trim();

        if (name1.length === 0 || name2.length === 0) {
            showAlert('Please enter both names!', 'error');
            scoreDisplay.textContent = '0%';
            scoreDisplay.style.color = 'var(--accent-green)'; 
            scoreDisplay.classList.remove('score-glow');
            heartEmoji.classList.remove('heart-pulse');
            heartEmoji.textContent = '❤️';
            resultMessage.textContent = 'Enter two names and press calculate!';
            shareButton.style.display = 'none';
            downloadPdfButton.style.display = 'none';
            return;
        }

        const score = calculateCompatibility(name1, name2);
        displayResult(score, name1, name2);
    });

    // Share button logic
    shareButton.addEventListener('click', () => {
        const name1 = shareButton.dataset.name1;
        const name2 = shareButton.dataset.name2;
        const score = shareButton.dataset.score;
        
        const shareText = `My viral compatibility score with ${name2} is ${score}%! We are an optimized match! Check your score at ${window.location.href} #CompatibilityCalculator #Grifts`;
        
        // Use Web Share API if available (best for mobile)
        if (navigator.share) {
            navigator.share({
                title: 'Viral Compatibility Score',
                text: shareText,
                url: window.location.href,
            }).catch(() => {
                // Fallback to copying to clipboard
                copyToClipboard(shareText, shareButton);
            });
        } else {
            // Fallback to copying to clipboard (from common.js)
            copyToClipboard(shareText, shareButton);
        }
    });

    // PDF Download Button Logic (Monetization Hook)
    downloadPdfButton.addEventListener('click', () => {
        const name1 = downloadPdfButton.dataset.name1;
        const name2 = downloadPdfButton.dataset.name2;
        const score = downloadPdfButton.dataset.score;
        
        if (name1 && name2 && score && typeof downloadFile === 'function') {
            generatePDFReport(name1, name2, score);
        } else {
            showAlert('Calculate a score first to generate a report!', 'info');
        }
    });
});
