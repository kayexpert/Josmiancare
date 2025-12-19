// Script for Josmiancare Website

document.addEventListener('DOMContentLoaded', function() {
    console.log('Josmiancare website loaded.');

    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showSuccessMessage();
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Contact Form Handling for contact.html
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            const consent = document.getElementById('flexCheckDefault').checked;
            
            if (!consent) {
                alert('Please agree to the data collection terms before submitting.');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';
            submitBtn.disabled = true;
            
            // Try Formspree first, fallback to mailto
            sendFormData(contactForm, {name, email, phone, subject, message}, submitBtn);
        });
    }

    // Contact Form Handling for index.html
    const contactFormHome = document.getElementById('contactFormHome');
    if (contactFormHome) {
        contactFormHome.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtnHome');
            const name = document.getElementById('nameHome').value;
            const email = document.getElementById('emailHome').value;
            const phone = document.getElementById('phoneHome').value;
            const subject = document.getElementById('subjectHome').value;
            const message = document.getElementById('messageHome').value;
            const consent = document.getElementById('flexCheckDefaultHome').checked;
            
            if (!consent) {
                alert('Please agree to the data collection terms before submitting.');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';
            submitBtn.disabled = true;
            
            // Try Formspree first, fallback to mailto
            sendFormData(contactFormHome, {name, email, phone, subject, message}, submitBtn);
        });
    }

    // Function to send form data
    function sendFormData(form, data, submitBtn) {
        // Create FormData object
        const formData = new FormData(form);
        
        // Try to submit via Formspree
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                showSuccessMessage();
                form.reset();
            } else {
                throw new Error('Formspree submission failed');
            }
        })
        .catch(error => {
            console.log('Formspree failed, showing alternative message:', error);
            // Show a message with manual email option instead of automatic mailto
            showEmailFallbackMessage(data);
            form.reset();
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = 'Get In Touch';
            submitBtn.disabled = false;
        });
    }

    // Function to create mailto link
    function createMailtoLink(data) {
        const to = 'obodainiikelvin@gmail.com';
        const subject = encodeURIComponent(`Contact Form: ${data.subject || 'Website Inquiry'}`);
        const body = encodeURIComponent(`
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}

Message:
${data.message}

---
This message was sent from the Josmiancare website contact form.
        `.trim());
        
        return `mailto:${to}?subject=${subject}&body=${body}`;
    }

    // Function to show success message
    function showSuccessMessage() {
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        successAlert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; max-width: 400px;';
        successAlert.innerHTML = `
            <i class="bi bi-check-circle-fill me-2"></i>
            <strong>Thank you!</strong> Your message has been sent successfully. We'll get back to you within 1-2 business days.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(successAlert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successAlert.parentNode) {
                successAlert.remove();
            }
        }, 5000);
    }

    // Function to show email fallback message
    function showEmailFallbackMessage(data) {
        const fallbackAlert = document.createElement('div');
        fallbackAlert.className = 'alert alert-info alert-dismissible fade show position-fixed';
        fallbackAlert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; max-width: 450px;';
        
        const mailtoLink = createMailtoLink(data);
        
        fallbackAlert.innerHTML = `
            <i class="bi bi-envelope-fill me-2"></i>
            <strong>Almost there!</strong> Please click the button below to send your message via email.
            <br><br>
            <a href="${mailtoLink}" class="btn btn-primary btn-sm">
                <i class="bi bi-envelope me-1"></i>Send Email
            </a>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(fallbackAlert);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (fallbackAlert.parentNode) {
                fallbackAlert.remove();
            }
        }, 10000);
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-sm');
        } else {
            navbar.classList.remove('shadow-sm');
        }
    });

    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        heroSection.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
    });
});
