/*
File: js/compatibility-calculator.js
Description: Compatibility Calculator with modes, history, and safe algorithm
*/

// DOM Elements
const name1Input = document.getElementById('name1-input');
const name2Input = document.getElementById('name2-input');
const calculateButton = document.getElementById('calculate-btn');
const scoreDisplay = document.getElementById('score-display');
const resultMessage = document.getElementById('result-message');
const shareButton = document.getElementById('share-btn');
const downloadReportButton = document.getElementById('download-report-btn');
const heartEmoji = document.getElementById('heart-emoji');
const modeButtons = document.querySelectorAll('.mode-btn');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history-btn');

// State
let currentMode = 'romance';
let currentResult = null;

// --- Compatibility Algorithm (Safe Version) ---
function calculateCompatibility(name1, name2) {
    // Clean and standardize names
    const cleanName1 = name1.toLowerCase().replace(/[^a-z]/g, '');
    const cleanName2 = name2.toLowerCase().replace(/[^a-z]/g, '');
    
    if (cleanName1.length === 0 || cleanName2.length === 0) {
        return 0;
    }
    
    // Combine and count letter frequencies
    const combinedName = cleanName1 + cleanName2;
    const frequency = {};
    for (const char of combinedName) {
        frequency[char] = (frequency[char] || 0) + 1;
    }
    
    // Create initial sequence
    let sequence = Object.values(frequency).join('');
    
    // Reduction loop with safety limit
    let iterations = 0;
    const maxIterations = 100; // Prevent infinite loops
    
    while (sequence.length > 2 && iterations < maxIterations) {
        let newSequence = '';
        for (let i = 0; i < sequence.length - 1; i++) {
            const digitSum = (parseInt(sequence[i]) + parseInt(sequence[i + 1])).toString();
            newSequence += digitSum;
        }
        
        // Break if no reduction happened
        if (newSequence.length >= sequence.length) {
            // Force reduction by summing first two digits
            if (sequence.length >= 2) {
                sequence = (parseInt(sequence[0]) + parseInt(sequence[1])).toString() + sequence.slice(2);
            }
            break;
        }
        
        sequence = newSequence;
        iterations++;
    }
    
    // Final score
    let score = parseInt(sequence.slice(0, 2)) || parseInt(sequence[0]) * 10 || 50;
    
    // Clamp between 1-99
    return Math.max(1, Math.min(score, 99));
}

// --- Result Display Data ---
const scoreRanges = {
    romance: [
        { min: 0, max: 20, emoji: '💔', color: '#ff4d4d', message: "Warning: Low Signal! The algorithms don't like this match. Time for a re-brand? Score: {S}%" },
        { min: 21, max: 40, emoji: '🤔', color: '#ffcc00', message: "Potential Detected. There's a spark, but you'll need to work on your synergy. Score: {S}%" },
        { min: 41, max: 70, emoji: '🤝', color: 'var(--accent-blue)', message: "Strong Connection! This partnership has excellent viral potential. Score: {S}%" },
        { min: 71, max: 99, emoji: '🔥', color: 'var(--accent-green)', message: "MAX VIRALITY! You are a perfect, algorithm-optimized match. Go dominate the feed! Score: {S}%" }
    ],
    friendship: [
        { min: 0, max: 20, emoji: '😐', color: '#ff4d4d', message: "Different Wavelengths. You might need more common ground. Score: {S}%" },
        { min: 21, max: 40, emoji: '👋', color: '#ffcc00', message: "Casual Vibes. Great for occasional collabs but not best friends material. Score: {S}%" },
        { min: 41, max: 70, emoji: '😊', color: 'var(--accent-blue)', message: "Solid Friendship! You've got strong friend chemistry. Score: {S}%" },
        { min: 71, max: 99, emoji: '🎉', color: 'var(--accent-green)', message: "BFF ENERGY! You two are destined to be ride-or-die friends! Score: {S}%" }
    ]
};

// --- Display Result ---
function displayResult(score, name1, name2) {
    const ranges = scoreRanges[currentMode];
    const range = ranges.find(r => score >= r.min && score <= r.max);
    
    // Sanitize names for display
    const safeName1 = sanitizeHTML(name1);
    const safeName2 = sanitizeHTML(name2);
    
    // Visual effects
    scoreDisplay.textContent = `${score}%`;
    scoreDisplay.style.color = range.color;
    scoreDisplay.classList.add('score-glow');
    
    heartEmoji.textContent = range.emoji;
    heartEmoji.classList.add('heart-pulse');
    
    // Update message
    resultMessage.innerHTML = range.message.replace(/{S}/g, score);
    
    // Store current result
    currentResult = { name1: safeName1, name2: safeName2, score, mode: currentMode };
    
    // Show action buttons
    shareButton.style.display = 'block';
    downloadReportButton.style.display = 'block';
    
    // Update URL
    const shareURL = `${window.location.pathname}?n1=${encodeURIComponent(safeName1)}&n2=${encodeURIComponent(safeName2)}&m=${currentMode}`;
    window.history.pushState(currentResult, '', shareURL);
    
    // Add to history
    addToHistory(currentResult);
    
    showAlert(`Score calculated: ${score}%`, 'success');
    
    // Remove glow after animation
    setTimeout(() => {
        scoreDisplay.classList.remove('score-glow');
    }, 1500);
}

// --- History Management ---
function addToHistory(result) {
    let history = loadFromMemory('compatibility_history', []);
    
    // Avoid duplicates
    history = history.filter(h => 
        !(h.name1 === result.name1 && h.name2 === result.name2 && h.mode === result.mode)
    );
    
    history.unshift(result);
    
    // Keep last 10
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    saveToMemory('compatibility_history', history);
    renderHistory();
}

function renderHistory() {
    const history = loadFromMemory('compatibility_history', []);
    
    if (history.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <div>
                <strong>${item.name1} & ${item.name2}</strong>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${item.mode.charAt(0).toUpperCase() + item.mode.slice(1)} Mode
                </div>
            </div>
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-green);">
                ${item.score}%
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const result = history[index];
            
            // Update inputs and mode
            name1Input.value = result.name1;
            name2Input.value = result.name2;
            currentMode = result.mode;
            
            // Update mode buttons
            modeButtons.forEach(btn => {
                const isActive = btn.dataset.mode === currentMode;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive);
            });
            
            // Display result
            displayResult(result.score, result.name1, result.name2);
            showAlert('Loaded from history!', 'info');
        });
    });
}

// --- Generate Report ---
function generateReport() {
    if (!currentResult) return;
    
    const { name1, name2, score, mode } = currentResult;
    const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
    
    const reportContent = `
╔═══════════════════════════════════════════════════╗
║   GRIFTS VIRAL COMPATIBILITY REPORT               ║
╚═══════════════════════════════════════════════════╝

📊 ${modeTitle} Compatibility Index: ${score}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Names Analyzed: ${name1} & ${name2}
Mode: ${modeTitle}
Algorithm: Love Sequence Reduction (LSR) V4.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILED ANALYSIS

1. Viral Synergy:
   ${score >= 71 ? '✅ EXCELLENT - High potential for collaborative content' :
     score >= 41 ? '🟡 GOOD - Solid foundation for partnership' :
     '⚠️ NEEDS WORK - Requires alignment and optimization'}

2. Content Chemistry:
   ${score >= 71 ? '✅ Perfect alignment in digital presence' :
     score >= 41 ? '🟡 Complementary strengths detected' :
     '⚠️ Significant differences in online behavior patterns'}

3. Recommended Action:
   ${score >= 71 ? '✅ GO VIRAL - Launch collaborative content immediately!' :
     score >= 41 ? '🟡 OPTIMIZE - Test joint content in small batches' :
     '⚠️ RE-EVALUATE - Consider different partnerships or timing'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*Disclaimer: This report is for entertainment purposes only.
Grifts.co.uk is not responsible for relationship outcomes or viral trends.*

Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    `.trim();
    
    const filename = `Grifts-${modeTitle}-Report-${name1}-${name2}.txt`;
    downloadFile(reportContent, filename, 'text/plain');
}

// --- Share Function ---
async function shareResult() {
    if (!currentResult) return;
    
    const { name1, name2, score } = currentResult;
    const shareURL = window.location.href;
    const modeText = currentMode === 'romance' ? 'romantic' : 'friendship';
    const shareText = `My ${modeText} compatibility score with ${name2} is ${score}%! Check yours at ${shareURL} #CompatibilityCalculator #Grifts`;
    
    // Try Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Viral Compatibility Score',
                text: shareText,
                url: shareURL
            });
            showAlert('Shared successfully!', 'success');
        } catch (err) {
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText, shareButton);
            }
        }
    } else {
        copyToClipboard(shareText, shareButton);
    }
}

// --- Load from URL ---
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const name1 = params.get('n1');
    const name2 = params.get('n2');
    const mode = params.get('m');
    
    if (name1 && name2) {
        name1Input.value = decodeURIComponent(name1);
        name2Input.value = decodeURIComponent(name2);
        
        if (mode && (mode === 'romance' || mode === 'friendship')) {
            currentMode = mode;
            modeButtons.forEach(btn => {
                const isActive = btn.dataset.mode === mode;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive);
            });
        }
        
        const score = calculateCompatibility(name1, name2);
        displayResult(score, name1, name2);
        showAlert('Viewing shared compatibility score!', 'info');
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load from URL
    loadFromURL();
    
    // Render history
    renderHistory();
    
    // Calculate button
    calculateButton.addEventListener('click', () => {
        const name1 = name1Input.value.trim();
        const name2 = name2Input.value.trim();
        
        if (!name1 || !name2) {
            showAlert('Please enter both names!', 'error');
            return;
        }
        
        const score = calculateCompatibility(name1, name2);
        displayResult(score, name1, name2);
    });
    
    // Enter key support
    name1Input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            name2Input.focus();
        }
    });
    
    name2Input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateButton.click();
        }
    });
    
    // Share button
    shareButton.addEventListener('click', shareResult);
    
    // Download report button
    downloadReportButton.addEventListener('click', generateReport);
    
    // Mode toggle
    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentMode = e.currentTarget.dataset.mode;
            modeButtons.forEach(b => {
                const isActive = b === e.currentTarget;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-pressed', isActive);
            });
            
            // Recalculate if we have names
            if (currentResult) {
                const score = calculateCompatibility(currentResult.name1, currentResult.name2);
                displayResult(score, currentResult.name1, currentResult.name2);
            }
        });
    });
    
    // Clear history
    clearHistoryButton.addEventListener('click', () => {
        clearMemory('compatibility_history');
        renderHistory();
        showAlert('History cleared!', 'success');
    });
});