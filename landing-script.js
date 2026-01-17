// ==========================================
// RS Finance - Landing Page Script
// ==========================================

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Open mobile menu
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.add('active');
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });

    // Close mobile menu function
    const closeMobileMenu = () => {
        mobileMenuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };

    // Close via close button
    mobileNavClose.addEventListener('click', closeMobileMenu);

    // Close via overlay click
    mobileNavOverlay.addEventListener('click', closeMobileMenu);

    // Close when clicking navigation links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
});

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

    // Add your analytics tracking here
    // Example: Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'page_view', {
    //         page_title: 'Finanzierungen Landing Page',
    //         page_location: window.location.href,
    //         page_path: window.location.pathname
    //     });
    // }

    // Example: Facebook Pixel
    // if (typeof fbq !== 'undefined') {
    //     fbq('track', 'PageView');
    // }
}

function trackCTAClick(ctaName) {
    console.log('CTA clicked:', ctaName);

    // Track CTA clicks
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'cta_click', {
    //         cta_name: ctaName,
    //         event_category: 'engagement'
    //     });
    // }
}

// Add click tracking to CTA buttons
document.querySelectorAll('a[href*="index.html"], a[href*="#funnel"]').forEach(button => {
    button.addEventListener('click', function() {
        trackCTAClick(this.textContent.trim());
    });
});

// Track FAQ interactions
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
        const questionText = this.querySelector('span').textContent;
        console.log('FAQ clicked:', questionText);

        // if (typeof gtag !== 'undefined') {
        //     gtag('event', 'faq_interaction', {
        //         question: questionText,
        //         event_category: 'engagement'
        //     });
        // }
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
document.querySelectorAll('a[href*="index.html"]').forEach(link => {
    link.addEventListener('mouseenter', function() {
        const linkElement = document.createElement('link');
        linkElement.rel = 'prefetch';
        linkElement.href = 'index.html';
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
