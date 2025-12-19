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
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const consent = document.getElementById('flexCheckDefault').checked;
            
            if (!consent) {
                showErrorMessage('Please agree to the data collection terms before submitting.');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';
            submitBtn.disabled = true;
            
            // Submit form data
            sendFormData(contactForm, submitBtn);
        });
    }

    // Contact Form Handling for index.html
    const contactFormHome = document.getElementById('contactFormHome');
    if (contactFormHome) {
        contactFormHome.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = contactFormHome.querySelector('button[type="submit"]');
            const consent = document.getElementById('flexCheckDefaultHome').checked;
            
            if (!consent) {
                showErrorMessage('Please agree to the data collection terms before submitting.');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';
            submitBtn.disabled = true;
            
            // Submit form data
            sendFormData(contactFormHome, submitBtn);
        });
    }

    // Function to send form data
    function sendFormData(form, submitBtn) {
        // Create FormData object
        const formData = new FormData(form);
        
        // Submit to backend
        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log('Form submission result:', result);
            if (result.success) {
                showSuccessMessage();
                form.reset();
            } else {
                showErrorMessage(result.message || 'An error occurred. Please try again.');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showErrorMessage('Sorry, there was an error sending your message. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = 'GET IN TOUCH';
            submitBtn.disabled = false;
        });
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

    // Function to show error message
    function showErrorMessage(message) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        errorAlert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; max-width: 400px;';
        errorAlert.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(errorAlert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.remove();
            }
        }, 5000);
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
