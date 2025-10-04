// DOM Elements
const topicInput = document.getElementById('topic-input');
const outcomeInput = document.getElementById('outcome-input');
const generateButton = document.getElementById('generate-btn');
const resultsContainer = document.getElementById('headline-results');
const copyAllButton = document.getElementById('copy-all-btn');

// --- Headline Templates (The core "grift" logic) ---
// Use {TOPIC} and {OUTCOME} placeholders
const headlineTemplates = [
    // 1. The Urgent Question
    "Can You *Really* {OUTCOME} with This {TOPIC}?",
    
    // 2. The Numbered List (always powerful)
    "Top 5 {TOPIC} Secrets That Guarantee {OUTCOME}",
    
    // 3. The Contrarian/Controversial
    "Why Your {TOPIC} Strategy is WRONG (And How to {OUTCOME} Instead)",
    
    // 4. The Direct Command/How-To
    "How I Used {TOPIC} to Instantly {OUTCOME}",
    
    // 5. The Fear/Problem Solver
    "Stop Failing At {TOPIC}: The Easiest Way to {OUTCOME}",
    
    // 6. The Aspirational/Ultimate
    "The ULTIMATE {TOPIC} Guide: Go From Zero to {OUTCOME}!",
    
    // 7. The Time-Bound/Efficiency
    "Get {OUTCOME} In Under 10 Minutes with This {TOPIC}",
    
    // 8. The Curiosity Gap
    "You Won't Believe What Happens When You Combine {TOPIC} and {OUTCOME}",
    
    // 9. The Simple Reveal
    "The 1 Simple Trick for {TOPIC} That Leads to {OUTCOME}",
    
    // 10. The Direct Claim
    "This is the ONLY {TOPIC} Method You Need to {OUTCOME}",
];

// --- XSS Protection Helper (Enhancement #32) ---

/**
 * Sanitizes user input by escaping HTML special characters
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Core Generation Function ---

function generateHeadlines() {
    // Sanitize inputs to prevent XSS (Enhancement #32)
    const topic = sanitizeInput(topicInput.value.trim());
    const outcome = sanitizeInput(outcomeInput.value.trim());
    
    if (topic.length === 0 || outcome.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #ffcc00;">Please enter both a Topic and a Desired Outcome.</p>';
        copyAllButton.style.display = 'none';
        return;
    }
    
    // Ensure copy button is visible
    copyAllButton.style.display = 'block';
    
    let html = '';
    let generatedText = [];
    
    headlineTemplates.forEach((template, index) => {
        // Replace placeholders with sanitized user input
        const headline = template
            .replaceAll('{TOPIC}', topic)
            .replaceAll('{OUTCOME}', outcome);
        
        generatedText.push(`${index + 1}. ${headline}`);
        
        // Create HTML structure for each headline
        // Note: headline is already safe because topic and outcome were sanitized
        html += `
            <div class="headline-item">
                <span>${index + 1}. ${headline}</span>
                <button class="btn btn-secondary copy-single-btn" data-headline="${headline}">Copy</button>
            </div>
        `;
    });
    
    // Safe to use innerHTML here because all content has been sanitized
    resultsContainer.innerHTML = html;
    
    // Store all headlines in the copy button data attribute for "Copy All"
    copyAllButton.dataset.allHeadlines = generatedText.join('\n');
    
    attachCopyListeners();
}

// --- Listener Attachment ---

function attachCopyListeners() {
    // Attach event listeners to the new 'Copy' buttons for single headlines
    document.querySelectorAll('.copy-single-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const headlineToCopy = e.currentTarget.dataset.headline;
            // Use the shared function from common.js
            copyToClipboard(headlineToCopy, e.currentTarget);
        });
    });
}


// --- Main Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial content state
    copyAllButton.style.display = 'none';
    resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Enter a topic and outcome above, then click "Generate Headlines" to get started.</p>';
    
    // 1. Generate button listener
    generateButton.addEventListener('click', generateHeadlines);
    
    // 2. "Copy All" button listener
    copyAllButton.addEventListener('click', () => {
        const allHeadlines = copyAllButton.dataset.allHeadlines;
        if (allHeadlines) {
            // Use the shared function from common.js
            copyToClipboard(allHeadlines, copyAllButton);
        } else {
            showAlert('Nothing to copy!', 'info');
        }
    });
});