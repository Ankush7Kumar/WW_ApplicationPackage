const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const PDFDocument = require('pdfkit');
const pdfParse = require('pdf-parse');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to read text file content
const readFileContent = (filePath) => {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
};

// Function to extract text from a PDF file
const readPdfContent = async (filePath) => {
    const dataBuffer = fs.readFileSync(path.join(__dirname, filePath));
    const data = await pdfParse(dataBuffer);
    return data.text;
};

(async () => {
    try {
        // Read input files
        const jobDescription = readFileContent('jobDescription.txt');
        const resume = await readPdfContent('resume.pdf');
        const sampleCoverLetter = await readPdfContent('sampleCL.pdf');

        // Construct prompt for ChatGPT
        const prompt = `
        You are a professional cover letter writer. Given the following:

        1. **Job Description:**
        ${jobDescription}

        2. **Resume:**
        ${resume}

        3. **Sample Cover Letter:**
        ${sampleCoverLetter}

        Refine the cover letter to better align with the job description while keeping it concise. Use bullet points to highlight key skills and experiences. Maintain a polite tone and avoid increasing the word count.

        Provide only the updated cover letter without additional explanations.
        `;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'system', content: 'You are an expert in writing professional cover letters.' }, { role: 'user', content: prompt }],
            max_tokens: 500,
        });

        const coverLetterText = response.choices[0].message.content;

        // Save generated cover letter as a formatted PDF
        const outputFilePath = path.join(__dirname, 'refinedCoverLetter.pdf');
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputFilePath);
        doc.pipe(writeStream);

        // Add Title
        doc.font('Helvetica-Bold').fontSize(11).text('Cover Letter', { align: 'center' });
        doc.moveDown();

        // Add content with formatting
        doc.font('Helvetica').fontSize(11);

        const paragraphs = coverLetterText.split('\n');
        paragraphs.forEach((para) => {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const parts = para.split(urlRegex);

            parts.forEach((part) => {
                if (part.match(urlRegex)) {
                    doc.fillColor('blue').text(part, { link: part, underline: true });
                } else {
                    doc.fillColor('black').text(part);
                }
            });

            doc.moveDown(0.5);
        });

        // Finalize and save PDF
        doc.end();
        writeStream.on('finish', () => {
            console.log('Refined cover letter saved as a well-formatted PDF:', outputFilePath);
        });
    } catch (error) {
        console.error('Error generating cover letter:', error);
    }
})();



//  <button type="button" class="btn__small--text btn--white outline pill margin--r--s"> Print </button>