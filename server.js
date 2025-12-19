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

// Email configuration (using Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // This would need to be configured
        pass: 'your-app-password'     // This would need to be configured
    }
});

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
        
        // For development, we'll just log the form data and return success
        console.log('Contact form submission received:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Phone:', phone || 'Not provided');
        console.log('Subject:', subject);
        console.log('Message:', message);
        console.log('---');
        
        // In a real environment, you would send the email here:
        /*
        const mailOptions = {
            from: 'noreply@josmiancare.com',
            to: 'obodainiikelvin@gmail.com',
            subject: `Contact Form: ${subject}`,
            text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Josmiancare website contact form.
            `
        };
        
        await transporter.sendMail(mailOptions);
        */
        
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