// --- DOM Elements ---
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const shareButton = document.getElementById('share-btn');

const quizStartScreen = document.getElementById('quiz-start');
const quizContentScreen = document.getElementById('quiz-content');
const quizResultScreen = document.getElementById('quiz-result');
const quizCard = document.getElementById('quiz-card');

const questionCounterElement = document.getElementById('question-counter');
const questionTextElement = document.getElementById('question-text');
const answerListElement = document.getElementById('answer-list');

const resultTitleElement = document.getElementById('result-title');
const resultDescriptionElement = document.getElementById('result-description');


// --- Quiz Data (The Core Grift Content) ---

// Define the final possible results with point ranges
// Total possible points: Min 5 (1 point per question) to Max 25 (5 points per question)
const quizResults = {
    // Range 5 - 10
    MAGE: { 
        title: "🧙 The Arcane Mage",
        desc: "You are thoughtful, mysterious, and prefer knowledge over brute force. You wield powerful, hidden potential, but your social life is mostly books. (Score: 5-10)",
        color: 'var(--accent-blue)'
    },
    // Range 11 - 15
    DRAGON: { 
        title: "🐉 The Mighty Dragon",
        desc: "You are fiercely independent, powerful, and hoard your resources wisely. You command attention and often start trends without even trying. (Score: 11-15)",
        color: 'var(--accent-green)'
    },
    // Range 16 - 20
    GRIFFIN: { 
        title: "🦅 The Noble Griffin",
        desc: "You are a leader—majestic, loyal, and quick to defend your inner circle. You balance sharp intellect with grounded action. (Score: 16-20)",
        color: '#ffcc00' // Yellow
    },
    // Range 21 - 25
    VAMPIRE: { 
        title: "🧛 The Viral Vampire",
        desc: "You thrive in the dark, digital world. You are charismatic, adaptable, and a master of engagement, sucking the views right out of the algorithm. (Score: 21-25)",
        color: '#ff4d4d' // Red
    }
};

// Define the quiz questions and point values for answers
const quizQuestions = [
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
];


// --- State Management ---
let currentQuestionIndex = 0;
let totalScore = 0;
let currentSelection = null; // Stores the point value of the currently selected answer


// --- Core Functions ---

/**
 * Starts or resets the quiz state.
 */
function resetQuiz() {
    currentQuestionIndex = 0;
    totalScore = 0;
    currentSelection = null;
    quizStartScreen.style.display = 'block';
    quizContentScreen.style.display = 'none';
    quizResultScreen.style.display = 'none';
    quizCard.style.display = 'block';
    nextButton.textContent = 'Next Question';
    nextButton.disabled = true;
    showAlert('Quiz ready!', 'info');
}

/**
 * Displays the current question and answers.
 */
function renderQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        // All questions answered, move to result screen
        showResult();
        return;
    }
    
    // Reset state for new question
    currentSelection = null;
    nextButton.disabled = true;
    const questionData = quizQuestions[currentQuestionIndex];

    // Update text
    questionCounterElement.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    questionTextElement.textContent = questionData.q;
    
    // Render answers
    answerListElement.innerHTML = '';
    questionData.answers.forEach((answer, index) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer.text;
        
        // Use a data attribute to store the points for easy retrieval
        button.dataset.points = answer.points;
        
        // Attach click listener to select the answer
        button.addEventListener('click', selectAnswer);
        
        li.appendChild(button);
        answerListElement.appendChild(li);
    });

    // Update button text for the last question
    if (currentQuestionIndex === quizQuestions.length - 1) {
        nextButton.textContent = 'See My Creature!';
    }
}

/**
 * Handles the selection of an answer.
 */
function selectAnswer(event) {
    // 1. Deselect all other answers
    answerListElement.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // 2. Select the clicked button
    const selectedButton = event.currentTarget;
    selectedButton.classList.add('selected');

    // 3. Store the selection
    currentSelection = parseInt(selectedButton.dataset.points);
    
    // 4. Enable the Next button
    nextButton.disabled = false;
}

/**
 * Moves to the next question, tallying the score.
 */
function nextQuestion() {
    if (currentSelection === null) {
        showAlert('Please select an answer first.', 'error');
        return;
    }

    // 1. Tally score
    totalScore += currentSelection;

    // 2. Move to next question index
    currentQuestionIndex++;

    // 3. Render the next question or the result screen
    renderQuestion();
}

/**
 * Determines and displays the final result screen.
 */
function showResult() {
    // 1. Determine the result based on the totalScore
    let finalResult = quizResults.MAGE; // Default to lowest range
    let resultKey = 'MAGE';

    // Logic to map score to a result
    if (totalScore >= 21) {
        finalResult = quizResults.VAMPIRE;
        resultKey = 'VAMPIRE';
    } else if (totalScore >= 16) {
        finalResult = quizResults.GRIFFIN;
        resultKey = 'GRIFFIN';
    } else if (totalScore >= 11) {
        finalResult = quizResults.DRAGON;
        resultKey = 'DRAGON';
    }
    
    // 2. Update Result Screen UI
    resultTitleElement.textContent = finalResult.title;
    resultTitleElement.style.color = finalResult.color;
    resultDescriptionElement.textContent = finalResult.desc;
    
    // Update the share button with the result data
    shareButton.dataset.resultTitle = finalResult.title;
    shareButton.dataset.resultKey = resultKey;
    
    // 3. Transition Screens
    quizCard.style.display = 'none';
    quizResultScreen.style.display = 'block';

    showAlert(`You are the ${finalResult.title}!`, 'success');
}


// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    resetQuiz();

    // Start Button: Hide start, show content, render first question
    startButton.addEventListener('click', () => {
        quizStartScreen.style.display = 'none';
        quizContentScreen.style.display = 'block';
        rend!erQuestion();
    });

    // Next Button: Tally score and move on
    nextButton.addEventListener('click', nextQuestion);

    // Restart Button: Reset everything
    restartButton.addEventListener('click', resetQuiz);

    // Share Button: Use shared copy function
    shareButton.addEventListener('click', () => {
        const resultTitle = shareButton.dataset.resultTitle;
        
        const shareText = `I took the 'Which Legendary Creature Are You?' quiz on GRIFTS and I am ${resultTitle}! Take the quiz here: ${window.location.href} #ViralQuiz #Grifts`;
        
        // Use the shared copyToClipboard function from common.js
        copyToClipboard(shareText, shareButton);
    });
});
