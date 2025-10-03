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


// --- PDF Generation Logic (NEW CORE MONETIZATION) ---
function generateResumePdf(data) {
    // window.jsPDF is available globally from the CDN
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, Millimeters, A4

    // Style Constants (in mm)
    const MARGIN = 15;
    let y = MARGIN;
    const LINE_HEIGHT = 5;
    const MAX_WIDTH = doc.internal.pageSize.getWidth() - 2 * MARGIN;

    // --- Title (Full Name) ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(data.name, MARGIN, y);
    y += LINE_HEIGHT * 2;

    // --- Contact Info ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    data.contactInfo.forEach(line => {
        doc.text(line, MARGIN, y);
        y += LINE_HEIGHT * 0.8;
    });
    y += LINE_HEIGHT * 1.5;

    // --- Helper function to add a section ---
    function addSection(title, contentArray) {
        if (contentArray.length === 0) return;
        
        // Add Title
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), MARGIN, y);
        y += LINE_HEIGHT;
        
        // Add Divider
        doc.setDrawColor(200);
        doc.line(MARGIN, y - 1, doc.internal.pageSize.getWidth() - MARGIN, y - 1);
        
        // Add Content
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        contentArray.forEach(line => {
            const splitText = doc.splitTextToSize(line, MAX_WIDTH);
            splitText.forEach(splitLine => {
                // Check for page overflow
                if (y > doc.internal.pageSize.getHeight() - MARGIN - 15) { 
                    doc.addPage();
                    y = MARGIN; // Reset Y position
                }
                doc.text(splitLine, MARGIN, y);
                y += LINE_HEIGHT * 0.7; // Tighter line spacing for body text
            });
        });
        y += LINE_HEIGHT * 1.5; // Space after section
    }

    // --- Resume Sections ---
    addSection("Experience Summary", data.experience);
    addSection("Skills List", data.skills);
    addSection("Education", data.education);


    // --- Watermark (THE MONETIZATION HOOK) ---
    if (data.template === 'basic') {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150); // Light gray color
        const watermarkText = "FREE VERSION | Watermarked by Grifts.co.uk | Unlock Pro for No Watermark";
        const wmX = doc.internal.pageSize.getWidth() / 2;
        const wmY = doc.internal.pageSize.getHeight() - 5;
        doc.text(watermarkText, wmX, wmY, null, null, "center");
    }
    
    // --- Final Step: Save/Download using common.js ---
    const filename = `${data.name.replace(/[^a-zA-Z0-9]/g, '_')}_Resume_Grifts.pdf`;
    const pdfDataURL = doc.output('datauristring');
    // downloadFile is from common.js
    downloadFile(pdfDataURL, filename, 'application/pdf');

    showAlert('PDF generated successfully!', 'success');
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
