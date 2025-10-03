// File: utilities/resume-builder.js

// DOM Elements
const fullNameInput = document.getElementById('full-name');
const contactInfoTextarea = document.getElementById('contact-info');
const experienceTextarea = document.getElementById('experience-summary');
const skillsTextarea = document.getElementById('skills-list');
const educationTextarea = document.getElementById('education-info');
const generatePdfButton = document.getElementById('generate-pdf-btn');
const templateBasic = document.getElementById('template-basic');
const templatePro = document.getElementById('template-pro');

// Global State (For MVP Steps 2/5)
let selectedTemplate = 'basic'; // 'basic' or 'pro'
let isProUnlocked = false; // Simulates the Stripe unlock status

// --- Template Selection Logic (MVP Step 2 Prep) ---

function selectTemplate(templateId) {
    selectedTemplate = templateId === 'template-pro' ? 'pro' : 'basic';

    // Update button text and class based on selection and lock status
    if (selectedTemplate === 'pro' && !isProUnlocked) {
        generatePdfButton.textContent = '🔒 Unlock Pro Templates ($9)';
        generatePdfButton.classList.remove('btn-primary');
        generatePdfButton.classList.add('btn-secondary');
    } else {
        generatePdfButton.textContent = `Generate ${selectedTemplate === 'pro' ? 'Pro' : 'Free'} PDF`;
        generatePdfButton.classList.remove('btn-secondary');
        generatePdfButton.classList.add('btn-primary');
    }

    // Update visual styles
    templateBasic.style.border = selectedTemplate === 'basic' ? '2px solid var(--accent-green)' : '2px dashed var(--text-secondary)';
    templatePro.style.border = selectedTemplate === 'pro' ? '2px solid var(--accent-blue)' : '2px dashed var(--text-secondary)';
    templateBasic.style.opacity = selectedTemplate === 'basic' ? 1.0 : 0.5;
    templatePro.style.opacity = selectedTemplate === 'pro' ? 1.0 : 0.5;
}


// --- Core Data Collection Function ---

/**
 * Collects and formats data from the form inputs.
 * @returns {object} The structured resume data.
 */
function collectResumeData() {
    return {
        name: fullNameInput.value.trim(),
        contact: contactInfoTextarea.value.trim().split('\n').filter(line => line.length > 0),
        experience: experienceTextarea.value.trim().split('\n').filter(line => line.length > 0),
        // Simplifies skills into a clean array of strings
        skills: skillsTextarea.value.trim().split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0),
        education: educationTextarea.value.trim().split('\n').filter(line => line.length > 0),
        template: selectedTemplate,
        isPro: isProUnlocked
    };
}


// --- Main Action Handler (Prep for MVP Steps 3, 4, 5) ---

function handleGenerateClick() {
    const resumeData = collectResumeData();

    if (!resumeData.name || !resumeData.experience.length) {
        // showAlert function assumed to be available from common.js
        showAlert('Please fill in your Full Name and at least some Experience.', 'error');
        return;
    }

    if (selectedTemplate === 'pro' && !isProUnlocked) {
        // MVP Step 5: Placeholder for Stripe Checkout redirect
        showAlert('Redirecting to Stripe checkout to unlock Pro Templates...', 'info');
        console.log('// TO DO: Implement Stripe Checkout logic here');
        return;
    }
    
    // MVP Step 3 & 4: Call the PDF generation function (to be built next)
    // generateResumePdf(resumeData); 

    showAlert(`Data collected for ${selectedTemplate} template. Next step is PDF generation!`, 'success');
    console.log('Collected Resume Data:', resumeData);
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize template state
    selectTemplate('template-basic');

    // 2. Event Listeners
    generatePdfButton.addEventListener('click', handleGenerateClick);
    
    templateBasic.addEventListener('click', () => selectTemplate('template-basic'));
    templatePro.addEventListener('click', () => selectTemplate('template-pro'));
});
