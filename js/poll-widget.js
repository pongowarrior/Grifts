// DOM Elements
const questionInput = document.getElementById('poll-question');
const optionAInput = document.getElementById('option-a-text');
const optionBInput = document.getElementById('option-b-text');
const resetButton = document.getElementById('reset-poll-btn');
const shareButton = document.getElementById('share-link-btn');

const displayQuestion = document.getElementById('display-question');
const voteAButton = document.getElementById('vote-a-btn');
const voteBButton = document.getElementById('vote-b-btn');
const votingArea = document.getElementById('voting-area');
const resultsArea = document.getElementById('results-area');
const resultsContainer = document.getElementById('results-container');
const totalVotesSpan = document.getElementById('total-votes');

const VOTE_KEY = 'grifts-poll-vote'; // Key for memoryStore to check if user has voted

let currentPoll = {
    q: 'Which is the bigger grift?',
    a: 'Selling Courses',
    b: 'Crypto Trading',
    votes: {
        a: 0,
        b: 0
    }
};

// --- 1. Core Algorithm & UI Update ---

/**
 * Calculates percentages and updates the display.
 */
function updateResultsUI() {
    const { a, b } = currentPoll.votes;
    const total = a + b;
    
    if (total === 0) {
        totalVotesSpan.textContent = '0';
        resultsContainer.innerHTML = '';
        return;
    }

    const percentA = Math.round((a / total) * 100);
    const percentB = 100 - percentA;
    
    totalVotesSpan.textContent = total.toLocaleString();

    // Dynamically build the result bar content
    resultsContainer.innerHTML = `
        <div id="result-fill-a" style="width: ${percentA}%; background-color: var(--accent-blue);">
            ${percentA > 10 ? `${percentA}%` : ''}
        </div>
        <div id="result-fill-b" style="width: ${percentB}%; background-color: var(--accent-green); color: var(--bg-dark);">
            ${percentB > 10 ? `${percentB}%` : ''}
        </div>
    `;

    // Show the results area and hide voting buttons
    votingArea.style.display = 'none';
    resultsArea.style.display = 'block';

    showAlert(`Total votes: ${total}. Option A: ${percentA}%, Option B: ${percentB}%`, 'info');
}

/**
 * Updates the display elements with the currentPoll data.
 */
function updatePollUI() {
    displayQuestion.textContent = currentPoll.q;
    voteAButton.textContent = currentPoll.a;
    voteBButton.textContent = currentPoll.b;
    
    // Reset inputs
    questionInput.value = currentPoll.q;
    optionAInput.value = currentPoll.a;
    optionBInput.value = currentPoll.b;
}

/**
 * Handles a user voting for a specific option.
 * @param {string} option 'a' or 'b'
 */
function handleVote(option) {
    if (loadFromMemory(VOTE_KEY)) {
        showAlert('You have already voted on this poll (per session)!', 'error');
        updateResultsUI();
        return;
    }

    // Increment the vote
    currentPoll.votes[option]++;
    
    // Save vote to in-memory store to prevent double-voting
    saveToMemory(VOTE_KEY, option);
    
    showAlert(`Voted for ${currentPoll[option]}!`, 'success');

    // Update the UI to show results immediately
    updateResultsUI();
}

// --- 2. URL and Data Handling ---

/**
 * Encodes the poll data into a URL string.
 */
function getPollURL() {
    // Only encode the question and options, not the volatile vote count
    const params = new URLSearchParams({
        q: currentPoll.q,
        a: currentPoll.a,
        b: currentPoll.b
    });
    // Create a clean link without vote parameters
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/**
 * Checks URL parameters and loads a poll if present.
 */
function loadPollFromURL() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const a = params.get('a');
    const b = params.get('b');

    if (q && a && b) {
        currentPoll.q = decodeURIComponent(q);
        currentPoll.a = decodeURIComponent(a);
        currentPoll.b = decodeURIComponent(b);
    }
}

/**
 * Resets/Creates a new poll based on input fields.
 */
function resetPoll() {
    const newQ = questionInput.value.trim() || '❓ Untitled Poll';
    const newA = optionAInput.value.trim() || 'Option A';
    const newB = optionBInput.value.trim() || 'Option B';

    if (newQ.length < 5 || newA.length < 1 || newB.length < 1) {
        showAlert('Please enter a question (min 5 chars) and both options (min 1 char).', 'error');
        return;
    }

    currentPoll = {
        q: newQ,
        a: newA,
        b: newB,
        votes: { a: 0, b: 0 } // Reset votes
    };
    
    // Clear the vote flag in common.js memoryStore
    clearMemory(VOTE_KEY);

    // Update UI and change the URL immediately to be shareable
    updatePollUI();
    window.history.pushState(null, '', getPollURL());

    // Reset results view
    votingArea.style.display = 'flex';
    resultsArea.style.display = 'none';
    
    showAlert('New poll created and URL updated for sharing!', 'success');
}

// --- 3. Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Attempt to load poll from URL params (if shared)
    loadPollFromURL();
    
    // 2. Set UI based on loaded/default poll
    updatePollUI();

    // 3. Check if user has already voted
    if (loadFromMemory(VOTE_KEY)) {
        // If voted, show the results immediately
        updateResultsUI();
    } else {
        // If not voted, ensure voting buttons are visible
        votingArea.style.display = 'flex';
        resultsArea.style.display = 'none';
    }

    // 4. Event Listeners
    voteAButton.addEventListener('click', () => handleVote('a'));
    voteBButton.addEventListener('click', () => handleVote('b'));
    
    resetButton.addEventListener('click', resetPoll);

    shareButton.addEventListener('click', () => {
        const url = getPollURL();
        // NOTE: Uses copyToClipboard function from common.js
        copyToClipboard(url, shareButton);
    });
    
    // Initial UI check (in case it loaded a fresh poll with no votes)
    updateResultsUI();
});
