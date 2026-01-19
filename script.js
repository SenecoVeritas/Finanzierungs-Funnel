// ==========================================
// RS Finance - Finanzierungs-Funnel Script
// ==========================================

// Global State
let currentStep = 1;
const totalSteps = 7;

const formData = {
    financingType: '',
    loanAmount: 200000,
    equity: 40000,
    duration: 25,
    monthlyRate: 0,
    rateRealistic: '',
    decisionTimeline: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    privacy: false,
    marketing: false
};

// ==========================================
// Navigation Functions
// ==========================================

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
            scrollToTop();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
        scrollToTop();
    }
}

function goToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        updateUI();
        scrollToTop();
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// UI Update Functions
// ==========================================

function updateUI() {
    // Update step content visibility
    document.querySelectorAll('.step-content').forEach((el, index) => {
        if (index + 1 === currentStep) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    // Update progress bar
    const progressPercentage = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progressPercentage + '%';

    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// ==========================================
// Validation Functions
// ==========================================

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return true;

        case 2:
            if (!formData.financingType) {
                alert('Bitte wählen Sie eine Finanzierungsart aus.');
                return false;
            }
            return true;

        case 3:
            return true;

        case 4:
            if (!formData.rateRealistic) {
                alert('Bitte wählen Sie eine Option aus.');
                return false;
            }
            return true;

        case 5:
            if (!formData.decisionTimeline) {
                alert('Bitte wählen Sie eine Option aus.');
                return false;
            }
            return true;

        case 6:
            return validateContactForm();

        default:
            return true;
    }
}

function validateContactForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const privacy = document.getElementById('privacy').checked;

    if (!firstName) {
        alert('Bitte geben Sie Ihren Vornamen ein.');
        document.getElementById('firstName').focus();
        return false;
    }

    if (!lastName) {
        alert('Bitte geben Sie Ihren Nachnamen ein.');
        document.getElementById('lastName').focus();
        return false;
    }

    if (!email) {
        alert('Bitte geben Sie Ihre E-Mail-Adresse ein.');
        document.getElementById('email').focus();
        return false;
    }

    if (!isValidEmail(email)) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        document.getElementById('email').focus();
        return false;
    }

    if (!phone) {
        alert('Bitte geben Sie Ihre Telefonnummer ein.');
        document.getElementById('phone').focus();
        return false;
    }

    if (!privacy) {
        alert('Bitte akzeptieren Sie die Datenschutzerklärung.');
        return false;
    }

    // Store form data
    formData.firstName = firstName;
    formData.lastName = lastName;
    formData.email = email;
    formData.phone = phone;
    formData.message = document.getElementById('message').value.trim();
    formData.marketing = document.getElementById('marketing').checked;

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==========================================
// Step 2: Financing Type Selection
// ==========================================

function selectFinancingType(type) {
    formData.financingType = type;

    // Update visual selection
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    event.currentTarget.classList.add('selected');

    // Update radio button
    const radio = document.getElementById(type);
    if (radio) {
        radio.checked = true;
    }

    // Enable next button
    const nextButton = document.getElementById('step2Next');
    if (nextButton) {
        nextButton.disabled = false;
    }
}

// ==========================================
// Step 4: Rate Realistic Selection
// ==========================================

function selectRateRealistic(value) {
    formData.rateRealistic = value;

    // Update visual selection
    document.querySelectorAll('#step4 .option-card').forEach(card => {
        card.classList.remove('selected');
    });

    event.currentTarget.classList.add('selected');

    // Update radio button
    const radio = document.getElementById('rate-' + value);
    if (radio) {
        radio.checked = true;
    }
}

// ==========================================
// Step 5: Decision Timeline Selection
// ==========================================

function selectDecisionTimeline(value) {
    formData.decisionTimeline = value;

    // Update visual selection
    document.querySelectorAll('#step5 .option-card').forEach(card => {
        card.classList.remove('selected');
    });

    event.currentTarget.classList.add('selected');

    // Update radio button
    const radio = document.getElementById('timeline-' + value);
    if (radio) {
        radio.checked = true;
    }
}

// ==========================================
// Step 3: Slider Updates & Calculations
// ==========================================

function updateLoanAmount(value) {
    formData.loanAmount = parseInt(value);
    document.getElementById('loanAmountDisplay').textContent = formatCurrency(value);
    calculateMonthlyRate();
}

function updateEquity(value) {
    formData.equity = parseInt(value);
    document.getElementById('equityDisplay').textContent = formatCurrency(value);
    calculateMonthlyRate();
}

function updateDuration(value) {
    formData.duration = parseInt(value);
    document.getElementById('durationDisplay').textContent = value + ' Jahre';
    calculateMonthlyRate();
}

function calculateMonthlyRate() {
    // Simple calculation for demonstration
    // In production, you would use a more accurate mortgage calculation formula
    const principal = formData.loanAmount - formData.equity;
    const annualRate = 0.035; // 3.5% example rate
    const monthlyRate = annualRate / 12;
    const numberOfPayments = formData.duration * 12;

    // Monthly payment calculation using amortization formula
    const monthlyPayment = principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Store calculated monthly rate in formData
    formData.monthlyRate = Math.round(monthlyPayment);

    document.getElementById('monthlyRate').textContent = formatCurrency(formData.monthlyRate);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('de-AT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// ==========================================
// Step 4: Form Submission
// ==========================================

function submitForm() {
    if (!validateContactForm()) {
        return;
    }

    // Show loading state
    const submitButton = event.target;
    submitButton.disabled = true;
    submitButton.textContent = 'Wird gesendet...';

    // Make.com Webhook URL
    const WEBHOOK_URL = 'https://hook.eu2.make.com/bgbsqrlu16mzzurjhuvpb2k1lnafeuk5';

    // Prepare data payload according to specification
    const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,

        financing_type: formData.financingType,
        financing_amount: formData.loanAmount,
        available_equity: formData.equity,
        desired_monthly_rate: formData.monthlyRate,

        realism_check: formData.rateRealistic,
        decision_timeframe: formData.decisionTimeline,

        message: formData.message || '',

        lead_status: 'New',
        call_status: 'Neu',
        source: 'RS Finance Funnel'
    };

    // Send to Make.com Webhook
    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Make webhooks typically return 200 even without JSON body
        if (response.ok) {
            console.log('Lead erfolgreich an Make gesendet');

            // Track successful submission (optional analytics)
            if (typeof trackFormSubmission === 'function') {
                trackFormSubmission();
            }

            // Go to success step
            nextStep();
        } else {
            throw new Error('Webhook-Fehler: ' + response.status);
        }
    })
    .catch(error => {
        console.error('Fehler beim Senden:', error);

        // Show user-friendly error message
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.');

        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = 'Angebot anfordern';
    });
}

// ==========================================
// Initialize on Page Load
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI
    updateUI();

    // Initialize sliders with default values
    calculateMonthlyRate();

    // Add event listeners for radio buttons
    document.querySelectorAll('input[name="financingType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectFinancingType(this.value);
        });
    });

    // Prevent form submission on Enter key (except in textarea)
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });

    // Track analytics (optional)
    trackPageView();
});

// ==========================================
// Analytics & Tracking (Optional)
// ==========================================

function trackPageView() {
    // Add your analytics tracking here
    // Example: Google Analytics, Facebook Pixel, etc.
    console.log('Page viewed - Step:', currentStep);
}

function trackStepChange(step) {
    // Track funnel step changes
    console.log('Step changed to:', step);

    // Example: Google Analytics event
    // gtag('event', 'funnel_step', {
    //     'step_number': step,
    //     'step_name': getStepName(step)
    // });
}

function trackFormSubmission() {
    console.log('Form submitted:', formData);

    // Example: Facebook Pixel conversion tracking
    // fbq('track', 'Lead', {
    //     value: formData.loanAmount,
    //     currency: 'EUR'
    // });
}

function getStepName(step) {
    const stepNames = {
        1: 'Welcome',
        2: 'Financing Type',
        3: 'Financing Details',
        4: 'Contact Information',
        5: 'Thank You'
    };
    return stepNames[step] || 'Unknown';
}

// ==========================================
// Utility Functions
// ==========================================

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Prevent double-click on buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        if (this.classList.contains('processing')) {
            return false;
        }
        this.classList.add('processing');
        setTimeout(() => {
            this.classList.remove('processing');
        }, 1000);
    });
});
