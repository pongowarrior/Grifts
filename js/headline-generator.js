/*
File: js/headline-generator.js
Description: A/B Headline Generator with enhanced features
*/

// DOM Elements
const topicInput = document.getElementById('topic-input');
const outcomeInput = document.getElementById('outcome-input');
const generateButton = document.getElementById('generate-btn');
const clearButton = document.getElementById('clear-btn');
const resultsContainer = document.getElementById('headline-results');
const copyAllButton = document.getElementById('copy-all-btn');
const topicCounter = document.getElementById('topic-counter');
const outcomeCounter = document.getElementById('outcome-counter');

// --- Headline Templates ---
const headlineTemplates = [
    "Can You *Really* {OUTCOME} with This {TOPIC}?",
    "Top 5 {TOPIC} Secrets That Guarantee {OUTCOME}",
    "Why Your {TOPIC} Strategy is WRONG (And How to {OUTCOME} Instead)",
    "How I Used {TOPIC} to Instantly {OUTCOME}",
    "Stop Failing At {TOPIC}: The Easiest Way to {OUTCOME}",
    "The ULTIMATE {TOPIC} Guide: Go From Zero to {OUTCOME}!",
    "Get {OUTCOME} In Under 10 Minutes with This {TOPIC}",
    "You Won't Believe What Happens When You Combine {TOPIC} and {OUTCOME}",
    "The 1 Simple Trick for {TOPIC} That Leads to {OUTCOME}",
    "This is the ONLY {TOPIC} Method You Need to {OUTCOME}",
];

// --- Character Counter Updates ---
function updateCharacterCounters() {
    const topicRemaining = 50 - topicInput.value.length;
    const outcomeRemaining = 50 - outcomeInput.value.length;
    
    topicCounter.textContent = `${topicRemaining} characters remaining`;
    outcomeCounter.textContent = `${outcomeRemaining} characters remaining`;
    
    // Visual feedback for low character count
    topicCounter.style.color = topicRemaining < 10 ? 'var(--accent-green)' : '';
    outcomeCounter.style.color = outcomeRemaining < 10 ? 'var(--accent-green)' : '';
}

// --- Core Generation Function ---
function generateHeadlines() {
    // Use sanitizeHTML from common.js instead of duplicating
    const topic = sanitizeHTML(topicInput.value.trim());
    const outcome = sanitizeHTML(outcomeInput.value.trim());
    
    // Validation with user feedback
    if (topic.length === 0 || outcome.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--accent-blue);">⚠️ Please enter both a Topic and a Desired Outcome.</p>';
        copyAllButton.style.display = 'none';
        
        // Add visual feedback to empty fields
        if (topic.length === 0) topicInput.style.borderColor = 'var(--accent-blue)';
        if (outcome.length === 0) outcomeInput.style.borderColor = 'var(--accent-blue)';
        
        showAlert('Please fill in both fields', 'info');
        return;
    }
    
    // Reset border colors
    topicInput.style.borderColor = '';
    outcomeInput.style.borderColor = '';
    
    // Save inputs to memory for persistence
    saveToMemory('headline_topic', topicInput.value);
    saveToMemory('headline_outcome', outcomeInput.value);
    
    // Show loading state (even if instant, good UX practice)
    resultsContainer.innerHTML = '<div class="spinner"></div>';
    copyAllButton.style.display = 'none';
    
    // Use setTimeout to allow spinner to render
    setTimeout(() => {
        let html = '';
        let generatedText = [];
        
        headlineTemplates.forEach((template, index) => {
            const headline = template
                .replaceAll('{TOPIC}', topic)
                .replaceAll('{OUTCOME}', outcome);
            
            generatedText.push(`${index + 1}. ${headline}`);
            
            html += `
                <div class="headline-item">
                    <span>${index + 1}. ${headline}</span>
                    <button class="btn btn-sm copy-single-btn" data-headline="${headline.replace(/"/g, '&quot;')}" aria-label="Copy headline ${index + 1}">Copy</button>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
        copyAllButton.style.display = 'block';
        copyAllButton.dataset.allHeadlines = generatedText.join('\n');
        
        attachCopyListeners();
        showAlert('Headlines generated successfully!', 'success');
    }, 100);
}

// --- Clear Function ---
function clearInputs() {
    topicInput.value = '';
    outcomeInput.value = '';
    resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Enter a topic and outcome to generate headlines.</p>';
    copyAllButton.style.display = 'none';
    
    // Clear from memory
    clearMemory('headline_topic');
    clearMemory('headline_outcome');
    
    // Reset character counters
    updateCharacterCounters();
    
    // Reset border colors
    topicInput.style.borderColor = '';
    outcomeInput.style.borderColor = '';
    
    topicInput.focus();
}

// --- Listener Attachment ---
function attachCopyListeners() {
    document.querySelectorAll('.copy-single-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const headlineToCopy = e.currentTarget.dataset.headline;
            copyToClipboard(headlineToCopy, e.currentTarget);
        });
    });
}

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load saved inputs from memory
    const savedTopic = loadFromMemory('headline_topic');
    const savedOutcome = loadFromMemory('headline_outcome');
    
    if (savedTopic) topicInput.value = savedTopic;
    if (savedOutcome) outcomeInput.value = savedOutcome;
    
    // Initialize character counters
    updateCharacterCounters();
    
    // Generate button listener
    generateButton.addEventListener('click', generateHeadlines);
    
    // Clear button listener
    clearButton.addEventListener('click', clearInputs);
    
    // Copy All button listener
    copyAllButton.addEventListener('click', () => {
        const allHeadlines = copyAllButton.dataset.allHeadlines;
        if (allHeadlines) {
            copyToClipboard(allHeadlines, copyAllButton);
        } else {
            showAlert('Nothing to copy!', 'info');
        }
    });
    
    // Character counter updates
    topicInput.addEventListener('input', updateCharacterCounters);
    outcomeInput.addEventListener('input', updateCharacterCounters);
    
    // Enter key support
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            outcomeInput.focus();
        }
    });
    
    outcomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateHeadlines();
        }
    });
    
    // Auto-generate if saved data exists
    if (savedTopic && savedOutcome) {
        generateHeadlines();
    }
});