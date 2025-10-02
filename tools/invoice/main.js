// main.js for Invoice Generator

document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll('#invoiceNumber, #invoiceDate, #dueDate, #myDetails, #clientDetails, #itemDescription, #itemAmount');
    const preview = document.getElementById('invoicePreview');
    const generatePdfButton = document.getElementById('generatePdf');

    // Function to generate the HTML content for the invoice preview
    function updatePreview() {
        const invNum = document.getElementById('invoiceNumber').value;
        const invDate = document.getElementById('invoiceDate').value;
        const dueDate = document.getElementById('dueDate').value || 'N/A';
        const myDetails = document.getElementById('myDetails').value.replace(/\n/g, '<br>');
        const clientDetails = document.getElementById('clientDetails').value.replace(/\n/g, '<br>');
        const desc = document.getElementById('itemDescription').value;
        const amount = parseFloat(document.getElementById('itemAmount').value) || 0;

        const htmlContent = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #870160; padding-bottom: 10px;">
                <div style="font-size: 28px; font-weight: bold; color: #870160;">INVOICE</div>
                <div>
                    <strong>#${invNum}</strong><br>
                    Date: ${invDate}<br>
                    Due: ${dueDate}
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>
                    <strong>From:</strong><br>
                    ${myDetails}
                </div>
                <div>
                    <strong>To:</strong><br>
                    ${clientDetails}
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
                    <tr>
                        <td>${desc}</td>
                        <td>$${amount.toFixed(2)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td style="text-align: right;">TOTAL DUE:</td>
                        <td>$${amount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            <p style="margin-top: 50px; text-align: center; color: #aaa;">Thank you for your business!</p>
        `;

        preview.innerHTML = htmlContent;
    }

    // Function to handle PDF generation
    function generatePdf() {
        // Use the html2pdf library included via CDN
        const element = document.getElementById('invoicePreview');
        const options = {
            margin:       10,
            filename:     `invoice-${document.getElementById('invoiceNumber').value}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // This command generates and downloads the PDF client-side
        html2pdf().from(element).set(options).save();
    }

    // Event Listeners
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    generatePdfButton.addEventListener('click', generatePdf);

    // Initial load
    updatePreview();
});
