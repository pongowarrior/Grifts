/*
File: js/quiz-generator.js
Description: Enhanced viral quiz generator with multiple quizzes, result cards, and sharing
*/

// --- DOM Elements ---
const quizSelectionScreen = document.getElementById('quiz-selection-screen');
const quizSelectionContainer = document.getElementById('quiz-selection');
const quizCard = document.getElementById('quiz-card');
const quizStartScreen = document.getElementById('quiz-start');
const quizContentScreen = document.getElementById('quiz-content');
const quizResultScreen = document.getElementById('quiz-result');

const quizTitleStart = document.getElementById('quiz-title-start');
const quizDescriptionStart = document.getElementById('quiz-description-start');
const startButton = document.getElementById('start-btn');
const backToSelectionBtn = document.getElementById('back-to-selection-btn');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');

const shuffleCheckbox = document.getElementById('shuffle-questions');
const progressBar = document.getElementById('progress-bar');
const questionCounterElement = document.getElementById('question-counter');
const questionTextElement = document.getElementById('question-text');
const answerListElement = document.getElementById('answer-list');

const resultTitleElement = document.getElementById('result-title');
const resultDescriptionElement = document.getElementById('result-description');
const resultCanvas = document.getElementById('result-canvas');
const ctx = resultCanvas.getContext('2d');

const downloadResultBtn = document.getElementById('download-result-btn');
const shareTwitterBtn = document.getElementById('share-twitter-btn');
const copyUrlBtn = document.getElementById('copy-url-btn');
const statsContent = document.getElementById('stats-content');

// --- Quiz Data Library ---
const quizLibrary = {
    creature: {
        id: 'creature',
        title: '🐉 Which Legendary Creature Are You?',
        description: 'Discover your mythical persona based on your personality and habits.',
        questions: [
            {
                q: "What is your main goal on social media?",
                answers: [
                    { text: "Learn a new skill/topic", points: 1 },
                    { text: "Amass a huge following/influence", points: 5 },
                    { text: "Share cool stories and connect with friends", points: 3 },
                    { text: "Post my best work/art", points: 2 }
                ]
            },
            {
                q: "How do you handle a trending topic?",
                answers: [
                    { text: "Analyze it deeply before commenting", points: 1 },
                    { text: "Jump on it immediately with my own take", points: 5 },
                    { text: "Wait to see if it lasts, then participate", points: 3 },
                    { text: "Ignore it; I set my own trends", points: 4 }
                ]
            },
            {
                q: "Which best describes your style/persona?",
                answers: [
                    { text: "Quiet and intellectual", points: 1 },
                    { text: "Loud, bold, and unapologetic", points: 5 },
                    { text: "Clean, consistent, and aesthetic", points: 3 },
                    { text: "Mysterious and often misunderstood", points: 2 }
                ]
            },
            {
                q: "How do you react to criticism?",
                answers: [
                    { text: "Study it and adjust my strategy", points: 2 },
                    { text: "Use it as fuel for my next viral post", points: 5 },
                    { text: "Defend myself passionately but politely", points: 3 },
                    { text: "Ignore the haters entirely", points: 4 }
                ]
            },
            {
                q: "Which 'Grift' do you value most?",
                answers: [
                    { text: "A secure Password Generator", points: 1 },
                    { text: "The A/B Headline Generator", points: 5 },
                    { text: "The Build Calculator for peak efficiency", points: 3 },
                    { text: "The Meme Captioner for instant content", points: 4 }
                ]
            }
        ],
        results: {
            MAGE: { 
                title: "🧙 The Arcane Mage",
                desc: "You are thoughtful, mysterious, and prefer knowledge over brute force. You wield powerful, hidden potential, but your social life is mostly books.",
                color: '#00d9f5',
                emoji: '🧙'
            },
            DRAGON: { 
                title: "🐉 The Mighty Dragon",
                desc: "You are fiercely independent, powerful, and hoard your resources wisely. You command attention and often start trends without even trying.",
                color: '#00f5a0',
                emoji: '🐉'
            },
            GRIFFIN: { 
                title: "🦅 The Noble Griffin",
                desc: "You are a leader—majestic, loyal, and quick to defend your inner circle. You balance sharp intellect with grounded action.",
                color: '#ffcc00',
                emoji: '🦅'
            },
            VAMPIRE: { 
                title: "🧛 The Viral Vampire",
                desc: "You thrive in the dark, digital world. You are charismatic, adaptable, and a master of engagement, sucking the views right out of the algorithm.",
                color: '#ff4d4d',
                emoji: '🧛'
            }
        },
        scoring: [
            { min: 5, max: 10, key: 'MAGE' },
            { min: 11, max: 15, key: 'DRAGON' },
            { min: 16, max: 20, key: 'GRIFFIN' },
            { min: 21, max: 25, key: 'VAMPIRE' }
        ]
    },
    
    hustler: {
        id: 'hustler',
        title: '💼 What Type of Hustler Are You?',
        description: 'Find out your entrepreneurial archetype and side hustle superpower.',
        questions: [
            {
                q: "What motivates you most?",
                answers: [
                    { text: "Financial freedom", points: 5 },
                    { text: "Creative expression", points: 2 },
                    { text: "Helping others", points: 1 },
                    { text: "Building an empire", points: 4 }
                ]
            },
            {
                q: "How do you approach a new business idea?",
                answers: [
                    { text: "Research extensively first", points: 1 },
                    { text: "Jump in and iterate quickly", points: 5 },
                    { text: "Get feedback from trusted people", points: 3 },
                    { text: "Build a detailed business plan", points: 2 }
                ]
            },
            {
                q: "What's your biggest strength?",
                answers: [
                    { text: "Networking and relationships", points: 4 },
                    { text: "Technical skills", points: 2 },
                    { text: "Sales and persuasion", points: 5 },
                    { text: "Organization and systems", points: 1 }
                ]
            },
            {
                q: "How do you handle failure?",
                answers: [
                    { text: "Analyze what went wrong", points: 1 },
                    { text: "Move on to the next opportunity immediately", points: 5 },
                    { text: "Take time to recover emotionally", points: 2 },
                    { text: "Pivot and try a different approach", points: 4 }
                ]
            },
            {
                q: "What's your ideal work schedule?",
                answers: [
                    { text: "Structured 9-5", points: 1 },
                    { text: "Flexible, work when inspired", points: 3 },
                    { text: "Grind mode 24/7", points: 5 },
                    { text: "Early mornings, then free", points: 2 }
                ]
            },
        ]
        results: {
            STRATEGIST: {
                title: "🎯 The Strategist",
                desc: "You're methodical, analytical, and always three steps ahead. You build sustainable businesses through careful planning and execution.",
                color: '#00d9f5',
                emoji: '🎯'
            },
            CREATOR: {
                title: "🎨 The Creator",
                desc: "You monetize your creativity and passion. You build brands through authentic content and artistic vision.",
                color: '#ff4d4d',
                emoji: '🎨'
            },
            NETWORKER: {
                title: "🤝 The Networker",
                desc: "Your superpower is people. You build wealth through relationships, partnerships, and community-driven ventures.",
                color: '#ffcc00',
                emoji: '🤝'
            },
            EXECUTOR: {
                title: "⚡ The Executor",
                desc: "You're a high-energy doer who moves fast and breaks things. You thrive on rapid execution and multiple revenue streams.",
                color: '#00f5a0',
                emoji: '⚡'
            },
        },
        scoring: [
            { min: 5, max: 10, key: 'STRATEGIST' },
            { min: 11, max: 15, key: 'CREATOR' },
            { min: 16, max: 20, key: 'NETWORKER' },
            { min: 21, max: 25, key: 'EXECUTOR' }
        ]
    },
    content: {
        id: 'content',
        title: '📱 What's Your Content Creation Style?',
        description: 'Discover which type of content creator you are and what platforms suit you best.',
        questions: [
            {
                q: "What type of content do you enjoy making most?",
                answers: [
                    { text: "Short-form video (TikTok/Reels)", points: 5 },
                    { text: "Long-form video (YouTube)", points: 3 },
                    { text: "Written content (Blog/Twitter)", points: 1 },
                    { text: "Visual content (Instagram/Pinterest)", points: 2 }
                ]
            },
            {
                q: "How often do you post?",
                answers: [
                    { text: "Multiple times per day", points: 5 },
                    { text: "Once per day", points: 4 },
                    { text: "Few times per week", points: 2 },
                    { text: "When inspiration strikes", points: 1 }
                ]
            },
            {
                q: "What's your editing style?",
                answers: [
                    { text: "Fast cuts and effects", points: 5 },
                    { text: "Clean and minimal", points: 2 },
                    { text: "Raw and authentic", points: 3 },
                    { text: "Cinematic and polished", points: 1 }
                ]
            },
            {
                q: "How do you come up with ideas?",
                answers: [
                    { text: "Follow trends", points: 5 },
                    { text: "Personal experiences", points: 3 },
                    { text: "Deep research", points: 1 },
                    { text: "Audience requests", points: 2 }
                ]
            },
            {
                q: "What's your monetization strategy?",
                answers: [
                    { text: "Brand deals and sponsorships", points: 4 },
                    { text: "Ad revenue", points: 2 },
                    { text: "Digital products/courses", points: 1 },
                    { text: "Multiple streams", points: 5 }
                ]
            }
        ],
        results: {
            VIRAL: {
                title: "🔥 The Viral Chaser",
                desc: "You're all about speed, trends, and maximum reach. You create fast, punchy content that rides every wave.",
                color: '#ff4d4d',
                emoji: '🔥'
            },
            STORYTELLER: {
                title: "📖 The Storyteller",
                desc: "You build deep connections through narrative. Your content is thoughtful, authentic, and emotionally resonant.",
                color: '#00d9f5',
                emoji: '📖'
            },
            EDUCATOR: {
                title: "🎓 The Educator",
                desc: "You provide value through knowledge. Your content teaches, informs, and empowers your audience.",
                color: '#ffcc00',
                emoji: '🎓'
            },
            ENTERTAINER: {
                title: "🎭 The Entertainer",
                desc: "You make people laugh, smile, and escape. Your personality IS the brand.",
                color: '#00f5a0',
                emoji: '🎭'
            }
        },
        scoring: [
            { min: 5, max: 10, key: 'EDUCATOR' },
            { min: 11, max: 15, key: 'STORYTELLER' },
            { min: 16, max: 20, key: 'ENTERTAINER' },
            { min: 21, max: 25, key: 'VIRAL' }
        ]
    }
};

// --- State ---
let currentQuiz = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let totalScore = 0;
let currentSelection = null;
let quizStats = loadFromMemory('quiz-stats', {});

// --- Initialization ---
function init() {
    loadQuizSelection();
    checkSharedResult();
    
    // Event listeners
    startButton.addEventListener('click', startQuiz);
    backToSelectionBtn.addEventListener('click', showQuizSelection);
    nextButton.addEventListener('click', nextQuestion);
    restartButton.addEventListener('click', showQuizSelection);
    downloadResultBtn.addEventListener('click', downloadResultCard);
    shareTwitterBtn.addEventListener('click', shareToTwitter);
    copyUrlBtn.addEventListener('click', copyResultURL);
}

// --- Quiz Selection ---
function loadQuizSelection() {
    quizSelectionContainer.innerHTML = '';
    
    Object.values(quizLibrary).forEach(quiz => {
        const option = document.createElement('div');
        option.className = 'quiz-option';
        option.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>${quiz.description}</p>
            <p style="margin-top: 0.5rem; color: var(--accent-green); font-size: 0.85rem;">
                ${quiz.questions.length} Questions • ${Object.keys(quiz.results).length} Possible Results
            </p>
        `;
        option.addEventListener('click', () => selectQuiz(quiz.id));
        quizSelectionContainer.appendChild(option);
    });
}

function selectQuiz(quizId) {
    currentQuiz = quizLibrary[quizId];
    
    if (!currentQuiz) {
        showAlert('Quiz not found', 'error');
        return;
    }
    
    quizTitleStart.textContent = currentQuiz.title;
    quizDescriptionStart.textContent = currentQuiz.description;
    
    quizSelectionScreen.style.display = 'none';
    quizCard.style.display = 'block';
    quizStartScreen.style.display = 'block';
    quizContentScreen.style.display = 'none';
}

function showQuizSelection() {
    resetQuiz();
    quizSelectionScreen.style.display = 'block';
    quizCard.style.display = 'none';
    quizResultScreen.style.display = 'none';
}

// --- Quiz Flow ---
function resetQuiz() {
    currentQuestionIndex = 0;
    totalScore = 0;
    currentSelection = null;
    nextButton.disabled = true;
    progressBar.style.width = '0%';
}

function startQuiz() {
    resetQuiz();
    
    // Copy questions (don't modify original)
    currentQuestions = [...currentQuiz.questions];
    
    // Shuffle if enabled
    if (shuffleCheckbox.checked) {
        currentQuestions = shuffleArray(currentQuestions);
    }
    
    quizStartScreen.style.display = 'none';
    quizContentScreen.style.display = 'block';
    renderQuestion();
}

function renderQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResult();
        return;
    }
    
    currentSelection = null;
    nextButton.disabled = true;
    
    const questionData = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    
    // Update progress bar
    progressBar.style.width = progress + '%';
    
    // Update question text
    questionCounterElement.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    questionTextElement.textContent = questionData.q;
    
    // Render answers
    answerListElement.innerHTML = '';
    questionData.answers.forEach((answer) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer.text;
        button.dataset.points = answer.points;
        button.addEventListener('click', selectAnswer);
        
        li.appendChild(button);
        answerListElement.appendChild(li);
    });
    
    // Update button text
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextButton.textContent = 'See My Result!';
    } else {
        nextButton.textContent = 'Next Question';
    }
}

function selectAnswer(event) {
    // Deselect all
    answerListElement.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select clicked
    const selectedButton = event.currentTarget;
    selectedButton.classList.add('selected');
    currentSelection = parseInt(selectedButton.dataset.points);
    nextButton.disabled = false;
}

function nextQuestion() {
    if (currentSelection === null) {
        showAlert('Please select an answer', 'error');
        return;
    }
    
    totalScore += currentSelection;
    currentQuestionIndex++;
    renderQuestion();
}

// --- Results ---
function showResult() {
    const resultKey = calculateResult();
    const result = currentQuiz.results[resultKey];
    
    if (!result) {
        showAlert('Error calculating result', 'error');
        return;
    }
    
    // Update result text
    resultTitleElement.textContent = result.title;
    resultTitleElement.style.color = result.color;
    resultDescriptionElement.textContent = result.desc;
    
    // Draw result card
    drawResultCard(result);
    
    // Update stats
    updateQuizStats(currentQuiz.id, resultKey);
    displayStats();
    
    // Show result screen
    quizCard.style.display = 'none';
    quizResultScreen.style.display = 'block';
    
    // Update URL
    const resultURL = `${window.location.pathname}?quiz=${currentQuiz.id}&result=${resultKey}`;
    window.history.pushState({ quiz: currentQuiz.id, result: resultKey }, '', resultURL);
    
    showAlert(`You are ${result.title}!`, 'success');
}

function calculateResult() {
    for (const scoring of currentQuiz.scoring) {
        if (totalScore >= scoring.min && totalScore <= scoring.max) {
            return scoring.key;
        }
    }
    return Object.keys(currentQuiz.results)[0]; // Fallback
}

// --- Result Card Generation ---
function drawResultCard(result) {
    const canvas = resultCanvas;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, result.color + '33');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = result.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Top section - Quiz title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentQuiz.title, canvas.width / 2, 60);
    
    // Large emoji
    ctx.font = '120px sans-serif';
    ctx.fillText(result.emoji, canvas.width / 2, 200);
    
    // Result title
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = result.color;
    
    // Word wrap result title
    const titleWords = result.title.split(' ');
    let line = '';
    let y = 280;
    
    titleWords.forEach((word, i) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > canvas.width - 100 && i > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = word + ' ';
            y += 55;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, canvas.width / 2, y);
    
    // Description (wrapped)
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    wrapText(ctx, result.desc, canvas.width / 2, y + 60, canvas.width - 100, 28);
    
    // Bottom branding
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#00f5a0';
    ctx.fillText('GRIFTS.CO.UK', canvas.width / 2, canvas.height - 40);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    
    words.forEach((word, i) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, y);
            line = word + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, x, y);
}

// --- Statistics ---
function updateQuizStats(quizId, resultKey) {
    if (!quizStats[quizId]) {
        quizStats[quizId] = {};
    }
    
    if (!quizStats[quizId][resultKey]) {
        quizStats[quizId][resultKey] = 0;
    }
    
    quizStats[quizId][resultKey]++;
    saveToMemory('quiz-stats', quizStats);
}

function displayStats() {
    const stats = quizStats[currentQuiz.id] || {};
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
        statsContent.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No data yet. Be the first!</p>';
        return;
    }
    
    statsContent.innerHTML = '';
    
    Object.entries(currentQuiz.results).forEach(([key, result]) => {
        const count = stats[key] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        const statBar = document.createElement('div');
        statBar.className = 'stat-bar';
        statBar.innerHTML = `
            <div class="stat-bar-label">
                <span>${result.emoji} ${result.title.split(' ').slice(1).join(' ')}</span>
                <span>${percentage}%</span>
            </div>
            <div class="stat-bar-fill">
                <div class="stat-bar-progress" style="width: ${percentage}%"></div>
            </div>
        `;
        statsContent.appendChild(statBar);
    });
}

// --- Sharing Functions ---
function downloadResultCard() {
    resultCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const filename = `grifts-quiz-result-${typeof generateId === 'function' ? generateId(6) : Date.now()}.png`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('Result card downloaded!', 'success');
    });
}

function shareToTwitter() {
    const params = new URLSearchParams(window.location.search);
    const resultKey = params.get('result');
    const quizId = params.get('quiz');
    
    if (!resultKey || !quizId) return;
    
    const result = quizLibrary[quizId].results[resultKey];
    const shareURL = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`I took "${currentQuiz.title}" on GRIFTS and I'm ${result.title}! 🔥 Take the quiz:`);
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${shareURL}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    
    showAlert('Opening Twitter...', 'info');
}

function copyResultURL() {
    const url = window.location.href;
    copyToClipboard(url, copyUrlBtn);
}

// --- Utility Functions ---
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function checkSharedResult() {
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('quiz');
    const resultKey = params.get('result');
    
    if (quizId && resultKey && quizLibrary[quizId] && quizLibrary[quizId].results[resultKey]) {
        currentQuiz = quizLibrary[quizId];
        const result = currentQuiz.results[resultKey];
        
        resultTitleElement.textContent = result.title;
        resultTitleElement.style.color = result.color;
        resultDescriptionElement.textContent = result.desc;
        
        drawResultCard(result);
        displayStats();
        
        quizSelectionScreen.style.display = 'none';
        quizCard.style.display = 'none';
        quizResultScreen.style.display = 'block';
        
        showAlert('Viewing shared result!', 'info');
    }
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', init);