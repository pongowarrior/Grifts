// File: utilities/resume-builder.js

// DOM Elements (Keep these the same)
const fullNameInput = document.getElementById('full-name');
const contactInfoTextarea = document.getElementById('contact-info');
const experienceTextarea = document.getElementById('experience-summary');
const skillsTextarea = document.getElementById('skills-list');
const educationTextarea = document.getElementById('education-info');
const generatePdfButton = document.getElementById('generate-pdf-btn');
const templateBasic = document.getElementById('template-basic');
const templatePro = document.getElementById('template-pro');

// Global State
let selectedTemplate = 'basic'; // 'basic' or 'pro'
let isProUnlocked = false; // Simulates the Stripe unlock status

// --- Template Selection Logic ---

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
    templateBasic.style.opacity = selectedTemplate === 'basic' ? '1' : '0.5';

    templatePro.style.border = selectedTemplate === 'pro' ? '2px solid var(--accent-blue)' : '2px dashed var(--text-secondary)';
    templatePro.style.opacity = isProUnlocked || selectedTemplate === 'pro' ? '1' : '0.5';
    
    // Update the button text color for Free PDF
    if (selectedTemplate === 'basic') {
        generatePdfButton.style.backgroundColor = 'var(--accent-green)';
    } else if (selectedTemplate === 'pro' && isProUnlocked) {
        generatePdfButton.style.backgroundColor = 'var(--accent-blue)';
    }
}

// --- Data Collection Logic ---

function collectResumeData() {
    return {
        name: fullNameInput.value.trim(),
        contactInfo: contactInfoTextarea.value.split('\n').map(line => line.trim()).filter(line => line.length > 0),
        experience: experienceTextarea.value.split('\n').map(line => line.trim()).filter(line => line.length > 0),
        skills: skillsTextarea.value.split('\n').map(line => line.trim()).filter(line => line.length > 0),
        education: educationTextarea.value.split('\n').map(line => line.trim()).filter(line => line.length > 0),
        template: selectedTemplate,
        isPro: isProUnlocked
    };
}
// --- PDF Generation Function ---
function generateResumePdf(resumeData) {
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
        showAlert('PDF library not loaded. Please refresh the page.', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20; // Current Y position on the page
    const leftMargin = 20;
    const pageWidth = 170; // 210mm - 20mm margins on each side
    
    // --- Header: Name ---
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(resumeData.name, leftMargin, y);
    y += 10;
    
    // --- Contact Information ---
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    resumeData.contactInfo.forEach(line => {
        doc.text(line, leftMargin, y);
        y += 5;
    });
    y += 5; // Extra spacing after contact
    
    // --- Experience Section ---
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('EXPERIENCE', leftMargin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    resumeData.experience.forEach(line => {
        // Split long lines to fit page width
        const splitLines = doc.splitTextToSize(line, pageWidth);
        doc.text(splitLines, leftMargin, y);
        y += splitLines.length * 5;
        
        // Check if we need a new page
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });
    y += 5; // Extra spacing after experience
    
    // --- Skills Section ---
    if (y > 250) { // Start new page if close to bottom
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('SKILLS', leftMargin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const skillsText = resumeData.skills.join(' • ');
    const splitSkills = doc.splitTextToSize(skillsText, pageWidth);
    doc.text(splitSkills, leftMargin, y);
    y += splitSkills.length * 5 + 5;
    
    // --- Education Section ---
    if (y > 250) { // Start new page if close to bottom
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('EDUCATION', leftMargin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    resumeData.education.forEach(line => {
        const splitLines = doc.splitTextToSize(line, pageWidth);
        doc.text(splitLines, leftMargin, y);
        y += splitLines.length * 5;
    });
    
    // --- Watermark (for free version) ---
    if (!resumeData.isPro) {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Generated with GRIFTS - grifts.co.uk', leftMargin, 285);
        }
    }
    
    // --- Save the PDF ---
    const filename = `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`;
    doc.save(filename);
    showAlert('PDF downloaded successfully!', 'success');
}

// --- Main Action Handler (Updated) ---

function handleGenerateClick() {
    const resumeData = collectResumeData();

    if (!resumeData.name || !resumeData.experience.length) {
        showAlert('Please fill in your Full Name and at least some Experience.', 'error');
        return;
    }

    if (selectedTemplate === 'pro' && !isProUnlocked) {
        // MVP Step 5: Placeholder for Stripe Checkout redirect
        showAlert('Redirecting to Stripe checkout to unlock Pro Templates...', 'info');
        console.log('// TO DO: Implement Stripe Checkout logic here');
        return;
    }
    
    // Call the PDF generation function
    generateResumePdf(resumeData); 
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
