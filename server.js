const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 12000;

// Configure multer for handling multipart/form-data
const upload = multer();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

// Email configuration
let transporter;

async function createTransporter() {
    try {
        // For production, you can use environment variables:
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            console.log('Using configured email service');
        } else {
            // For testing, create a test account with Ethereal Email
            const testAccount = await nodemailer.createTestAccount();
            
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            
            console.log('Using Ethereal Email test account:');
            console.log('User:', testAccount.user);
            console.log('Pass:', testAccount.pass);
            console.log('Note: Emails will be captured for testing - check console for preview URLs');
        }
    } catch (error) {
        console.error('Error creating email transporter:', error);
        throw error;
    }
}

// Initialize transporter
createTransporter().catch(console.error);

// Contact form handler
app.post('/contact-handler.php', upload.none(), async (req, res) => {
    try {
        console.log('Form submission received!');
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);
        
        const { name, email, phone, subject, message } = req.body;
        
        console.log('Extracted fields:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Phone:', phone);
        console.log('Subject:', subject);
        console.log('Message:', message);
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        
        // Log the form data for debugging
        console.log('Contact form submission received:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Phone:', phone || 'Not provided');
        console.log('Subject:', subject);
        console.log('Message:', message);
        console.log('---');
        
        // Send the email
        const mailOptions = {
            from: `"Josmiancare Contact Form" <${process.env.EMAIL_USER || 'noreply@josmiancare.com'}>`,
            to: 'obodainiikelvin@gmail.com',
            subject: `Contact Form: ${subject}`,
            text: `
New contact form submission from Josmiancare website:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Josmiancare website contact form.
Submitted at: ${new Date().toLocaleString()}
            `,
            html: `
<h2>New Contact Form Submission</h2>
<p>A new message has been submitted through the Josmiancare website contact form:</p>

<table style="border-collapse: collapse; width: 100%; max-width: 600px;">
    <tr style="background-color: #f5f5f5;">
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
    </tr>
    <tr style="background-color: #f5f5f5;">
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${phone || 'Not provided'}</td>
    </tr>
    <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Subject:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
    </tr>
</table>

<h3>Message:</h3>
<div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
    ${message.replace(/\n/g, '<br>')}
</div>

<hr style="margin: 20px 0;">
<p style="color: #666; font-size: 12px;">
    This message was sent from the Josmiancare website contact form.<br>
    Submitted at: ${new Date().toLocaleString()}
</p>
            `
        };
        
        console.log('Attempting to send email...');
        
        // Ensure transporter is ready
        if (!transporter) {
            await createTransporter();
        }
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        
        // If using Ethereal Email, log the preview URL
        if (info.messageId && transporter.options.host === 'smtp.ethereal.email') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
            console.log('Note: This is a test email. In production, the email would be sent to obodainiikelvin@gmail.com');
        } else {
            console.log('Email sent to obodainiikelvin@gmail.com');
        }
        
        res.json({
            success: true,
            message: 'Thank you! Your message has been sent successfully.'
        });
        
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again.'
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Contact form submissions will be logged to the console');
});