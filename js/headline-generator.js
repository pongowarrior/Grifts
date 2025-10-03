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

// --- Core Generation Function ---

// File: influencer/headline-generator.js
// ... (keep all existing DOM Elements and headlineTemplates array)

// --- Core Generation Logic (COMPLETED) ---

function generateHeadlines() {
    const topic = topicInput.value.trim().toUpperCase();
    const outcome = outcomeInput.value.trim().toUpperCase();

    if (!topic || !outcome) {
        resultsContainer.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">Enter a topic and outcome to generate headlines.</p>`;
        copyAllButton.style.display = 'none';
        
        // Only show error on an explicit click if inputs are missing
        if (document.activeElement === generateButton) {
            showAlert('Please fill in both the Topic and the Desired Outcome.', 'error');
        }
        
        return;
    }

    // --- CORE LOGIC: Loop through templates and replace placeholders ---
    const generatedText = headlineTemplates.map(template => {
        // Use global regex replace to catch all instances of the placeholder
        let headline = template.replace(/{TOPIC}/g, topic);
        headline = headline.replace(/{OUTCOME}/g, outcome);
        return headline;
    });

    displayResults(generatedText);
    copyAllButton.style.display = 'block'; // Show the copy all button after results
    showAlert(`Generated ${generatedText.length} headlines for ${topic}!`, 'success');
}

// ... (keep the rest of the file: displayResults, attachCopyListeners, Initialization)

    
    // Ensure copy button is visible
    copyAllButton.style.display = 'block';

    let html = '';
    let generatedText = [];

    headlineTemplates.forEach((template, index) => {
        // Replace placeholders with user input
        const headline = template
            .replace('{TOPIC}', topic)
            .replace('{OUTCOME}', outcome);
        
        generatedText.push(`${index + 1}. ${headline}`);

        // Create HTML structure for each headline
        html += `
            <div class="headline-item">
                <span>${index + 1}. ${headline}</span>
                <button class="btn btn-secondary copy-single-btn" data-headline="${headline}">Copy</button>
            </div>
        `;
    });

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

    // 1. Generate button listener
    generateButton.addEventListener('click', generateHeadlines);

    // 2. "Copy All" button listener
    copyAllButton.addEventListener('click', () => {
        const! allHeadlines = copyAllButton.dataset.allHeadlines;
        if (allHeadlines) {
            // Use the shared function from common.js
            copyToClipboard(allHeadlines, copyAllButton);
        } else {
            showAlert('Nothing to copy!', 'info');
        }
    });
    
    // Initial run to prompt user
    generateHeadlines();
});
