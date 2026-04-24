const { PDFParse } = require('pdf-parse');

async function test() {
    const buf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 70 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n306\n%%EOF');
    
    console.log('Testing new PDFParse({ data: buf, verbosity: 0 })...');
    try {
        const p = new PDFParse({ data: buf, verbosity: 0 });
        const result = await p.getText();
        console.log('Success! Extracted text:', result.text);
    } catch (e) {
        console.log('Final attempt failed:', e.message);
    }
}

test();
