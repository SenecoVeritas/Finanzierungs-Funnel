// ==========================================
// RS Finance - Landing Page Script
// ==========================================

// FAQ Toggle Functionality
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // If the clicked item wasn't active, open it
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip if it's just "#"
        if (href === '#') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add fade-in animation to elements
document.addEventListener('DOMContentLoaded', () => {
    // Elements to animate
    const animateElements = document.querySelectorAll(
        '.type-card, .benefit-card, .timeline-item, .faq-item'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Track page view
    trackPageView();
});

// Sticky Header on Scroll
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
    } else {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }

    lastScroll = currentScroll;
});

// ==========================================
// Analytics & Tracking
// ==========================================

function trackPageView() {
    console.log('Landing page viewed');

    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: 'Finanzierungen Landing Page',
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }

    // Facebook Pixel (optional - uncomment if needed)
    // if (typeof fbq !== 'undefined') {
    //     fbq('track', 'PageView');
    // }
}

function trackCTAClick(ctaName) {
    console.log('CTA clicked:', ctaName);

    // Track CTA clicks
    if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
            cta_name: ctaName,
            event_category: 'engagement'
        });
    }
}

// Add click tracking to CTA buttons
document.querySelectorAll('a[href*="rechner.html"], a[href*="#funnel"]').forEach(button => {
    button.addEventListener('click', function() {
        trackCTAClick(this.textContent.trim());
    });
});

// Track FAQ interactions
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
        const questionText = this.querySelector('span').textContent;
        console.log('FAQ clicked:', questionText);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'faq_interaction', {
                question: questionText,
                event_category: 'engagement'
            });
        }
    });
});

// ==========================================
// Performance Optimizations
// ==========================================

// Lazy load images if needed
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Prefetch funnel page on hover over CTA buttons
document.querySelectorAll('a[href*="rechner.html"]').forEach(link => {
    link.addEventListener('mouseenter', function() {
        const linkElement = document.createElement('link');
        linkElement.rel = 'prefetch';
        linkElement.href = 'rechner.html';
        document.head.appendChild(linkElement);
    }, { once: true });
});

// ==========================================
// Cookie Consent (Optional)
// ==========================================

// If you need cookie consent functionality, add it here
function checkCookieConsent() {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
        // Show cookie banner
        // showCookieBanner();
    }
}

// Check on load
// checkCookieConsent();

// ==========================================
// Trust Section - Reviews Carousel
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const reviewsTrack = document.querySelector('.reviews-track');
    const dots = document.querySelectorAll('.reviews-dots .dot');
    const reviewSlides = document.querySelectorAll('.review-slide');

    if (!reviewsTrack || !dots.length) return; // Exit if elements not found

    let currentSlide = 0;
    let autoplayInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    function goToSlide(slideIndex) {
        // Ensure slide index is within bounds
        if (slideIndex < 0) slideIndex = 0;
        if (slideIndex >= reviewSlides.length) slideIndex = reviewSlides.length - 1;

        currentSlide = slideIndex;

        // Move track
        reviewsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % reviewSlides.length;
        goToSlide(nextIndex);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoplay(); // Reset autoplay on manual interaction
        });
    });

    // Touch/Swipe support for mobile
    reviewsTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    reviewsTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next slide
                goToSlide(currentSlide + 1);
            } else {
                // Swiped right - previous slide
                goToSlide(currentSlide - 1);
            }
            resetAutoplay();
        }
    }

    // Optional autoplay (subtle, every 8 seconds)
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 8000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // Start autoplay (optional - comment out if not desired)
    startAutoplay();

    // Pause autoplay when user hovers (desktop)
    const carousel = document.querySelector('.reviews-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startAutoplay();
        });
    }
});
