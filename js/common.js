const memoryStore = {};

function saveToMemory(key, value) {
    memoryStore[key] = JSON.stringify(value);
}

function loadFromMemory(key, defaultValue = null) {
    const data = memoryStore[key];
    return data ? JSON.parse(data) : defaultValue;
}

function clearMemory(key = null) {
    if (key) {
        delete memoryStore[key];
    } else {
        Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
    }
}

function copyToClipboard(text, buttonElement = null) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');

        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✅ Copied!';
            buttonElement.style.background = 'var(--accent-green)';
            buttonElement.style.color = 'var(--bg-dark)';

            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.background = '';
                buttonElement.style.color = '';
            }, 2000);
        }
    }).catch(() => {
        showAlert('Failed to copy', 'error');
    });
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    let alertStyle = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 250px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-sm);
        animation: slideIn 0.3s ease-out;
        box-shadow: var(--shadow-lg);
        font-weight: bold;
    `;

    if (type === 'success') {
        alertStyle += `
            background: rgba(0, 245, 160, 0.2);
            border: 1px solid var(--accent-green);
            color: var(--accent-green);
        `;
    } else if (type === 'error') {
        alertStyle += `
            background: rgba(255, 0, 0, 0.2);
            border: 1px solid #ff0000;
            color: #ff6b6b;
        `;
    } else {
        alertStyle += `
            background: rgba(0, 217, 245, 0.2);
            border: 1px solid var(--accent-blue);
            color: var(--accent-blue);
        `;
    }

    alertDiv.style.cssText = alertStyle;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert(`Downloaded ${filename}`, 'success');
}

function generateId(length = 8) {
    return Math.random().toString(36).substring(2, length + 2).toUpperCase();
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
