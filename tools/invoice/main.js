// main.js for Invoice Generator (Updated for Multi-Item Support)

document.addEventListener("DOMContentLoaded", () => {
    const preview = document.getElementById('invoicePreview');
    const inputForm = document.querySelector('.input-form');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemInputsContainer = document.getElementById('itemInputs');
    const generatePdfButton = document.getElementById('generatePdf');
    let itemCounter = 0; // Unique ID for each item row

    // --- Core Functions ---

    // 1. Creates a new item input row HTML
    const createItemRow = (description = "", amount = 0) => {
        const id = ++itemCounter;
        const row = document.createElement('div');
        row.className = 'item-row';
        row.setAttribute('data-id', id);
        row.innerHTML = `
            <div style="flex: 4;">
                <label>Description</label>
                <input type="text" class="item-desc" value="${description}" data-id="${id}">
            </div>
            <div style="flex: 1;">
                <label>Amount ($)</label>
                <input type="number" class="item-amount" value="${amount}" min="0" data-id="${id}">
            </div>
            <button class="remove-btn" type="button" data-id="${id}">×</button>
        `;
        
        // Add listeners for dynamic update/removal
        row.querySelector('.remove-btn').addEventListener('click', removeItemRow);
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        return row;
    };

    // 2. Adds a new row to the DOM
    const addItemRow = () => {
        const newRow = createItemRow('', 0);
        itemInputsContainer.appendChild(newRow);
        updatePreview();
    };

    // 3. Removes a row from the DOM
    const removeItemRow = (event) => {
        const idToRemove = event.target.dataset.id;
        const rowToRemove = itemInputsContainer.querySelector(`.item-row[data-id="${idToRemove}"]`);
        if (rowToRemove) {
            rowToRemove.remove();
            updatePreview();
        }
    };

    // 4. Gathers all invoice data
    const getInvoiceData = () => {
        const items = [];
        let total = 0;
        
        document.querySelectorAll('.item-row').forEach(row => {
            const desc = row.querySelector('.item-desc').value.trim();
            let amount = parseFloat(row.querySelector('.item-amount').value) || 0;
            
            // Basic validation: ensure amount is non-negative
            if (amount < 0) amount = 0; 
            
            if (desc || amount > 0) {
                items.push({ desc, amount });
                total += amount;
            }
        });

        return {
            invNum: document.getElementById('invoiceNumber').value,
            invDate: document.getElementById('invoiceDate').value,
            dueDate: document.getElementById('dueDate').value || 'N/A',
            myDetails: document.getElementById('myDetails').value.replace(/\n/g, '<br>'),
            clientDetails: document.getElementById('clientDetails').value.replace(/\n/g, '<br>'),
            items,
            total
        };
    };

    // 5. Generates the HTML for the invoice preview
    function updatePreview() {
        const data = getInvoiceData();
        
        // Generate Item Rows HTML
        const itemRowsHtml = data.items.map(item => `
            <tr>
                <td>${item.desc}</td>
                <td>$${item.amount.toFixed(2)}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #870160; padding-bottom: 10px;">
                <div style="font-size: 28px; font-weight: bold; color: #870160;">INVOICE</div>
                <div>
                    <strong>#${data.invNum}</strong><br>
                    Date: ${data.invDate}<br>
                    Due: ${data.dueDate}
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>
                    <strong>From:</strong><br>
                    ${data.myDetails}
                </div>
                <div>
                    <strong>To:</strong><br>
                    ${data.clientDetails}
                </div>
            </div>

            <table style="margin-top: 30px; border: 1px solid #ddd;">
                <thead>
                    <tr>
                        <th style="width: 70%;">Description</th>
                        <th style="width: 30%;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRowsHtml}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td style="text-align: right;">TOTAL DUE:</td>
                        <td>$${data.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            <p style="margin-top: 50px; text-align: center; color: #aaa;">Thank you for your business!</p>
        `;

        preview.innerHTML = htmlContent;
    }

    // 6. Handles PDF generation
    function generatePdf() {
        const data = getInvoiceData();
        if (data.items.length === 0) {
            alert("Please add at least one item to the invoice before generating the PDF.");
            return;
        }

        const element = document.getElementById('invoicePreview');
        const options = {
            margin:       10,
            filename:     `invoice-${data.invNum || 'draft'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // This command generates and downloads the PDF client-side
        html2pdf().from(element).set(options).save();
    }

    // --- Event Listeners and Initialization ---

    // Listen for input changes in the main static fields
    const staticInputs = document.querySelectorAll('#invoiceNumber, #invoiceDate, #dueDate, #myDetails, #clientDetails');
    staticInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Button listeners
    addItemBtn.addEventListener('click', addItemRow);
    generatePdfButton.addEventListener('click', generatePdf);

    // Initialization: Add the first row upon load
    itemInputsContainer.appendChild(createItemRow('Web Design Service', 500));
    updatePreview(); 
});
