document.addEventListener('DOMContentLoaded', () => {
    // --- Reveal animations on scroll ---
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.1
    });

    // Add reveal class to main structural elements if they don't have it
    document.querySelectorAll('section, footer, .reveal-on-load').forEach(el => {
        // We use a small timeout to ensure the browser has a chance to apply initial styles
        setTimeout(() => {
            revealObserver.observe(el);
        }, 100);
    });

    // --- Smooth scroll for same-page anchor links ---
    // This enhances the native scroll-behavior: smooth with better header offset handling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL hash without jumping
                history.pushState(null, null, href);
            }
        });
    });

    // --- Header scroll effect ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('shadow-lg', 'backdrop-blur-lg');
                header.classList.remove('backdrop-blur-md');
            } else {
                header.classList.remove('shadow-lg', 'backdrop-blur-lg');
                header.classList.add('backdrop-blur-md');
            }
        });
    }

    // --- Cross-page Smooth Scroll Handler ---
    // If we just landed on a page with a hash (e.g. index.html#fale-conosco)
    if (window.location.hash) {
        const hash = window.location.hash;
        // Wait for page to fully load and layouts to settle
        window.addEventListener('load', () => {
            setTimeout(() => {
                const target = document.querySelector(hash);
                if (target) {
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 600); // Slightly longer delay to ensure all assets are loaded
        });
    }

    // --- Dynamic Copyright Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Form Handling (Getform.io) ---
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-error');
    const submitBtn = document.getElementById('submit-button');
    const btnText = document.getElementById('button-text');
    const spinner = document.getElementById('loading-spinner');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Basic validation
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            // Set loading state
            setLoading(true);
            formError.classList.add('hidden');

            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    showSuccess();
                } else {
                    console.error('Web3Forms error:', result);
                    throw new Error(result.message || 'Erro ao enviar o formulário.');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                formError.textContent = error.message;
                formError.classList.remove('hidden');
            } finally {
                setLoading(false);
            }
        });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'ENVIANDO...';
            spinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'ENVIAR';
            spinner.classList.add('hidden');
        }
    }

    function showSuccess() {
        formSuccess.classList.remove('opacity-0', 'pointer-events-none');
        formSuccess.classList.add('opacity-100');
        contactForm.reset();
    }

    // Global function to reset UI (called from HTML)
    window.resetFormUI = () => {
        formSuccess.classList.add('opacity-0', 'pointer-events-none');
        formSuccess.classList.remove('opacity-100');
    };
});
