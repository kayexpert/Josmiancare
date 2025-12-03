// Script for Josmiancare Website

document.addEventListener('DOMContentLoaded', function() {
    console.log('Josmiancare website loaded.');

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation (Bootstrap handles required fields visually)
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            if(name && email) {
                alert('Thank you for your message, ' + name + '! We will get back to you shortly.');
                contactForm.reset();
            }
        });
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
