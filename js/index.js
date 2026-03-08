const openLoginBtn = document.getElementById('openLoginBtn');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const loginModal = document.getElementById('loginModal');
const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const html = document.documentElement;
const body = document.body;

openLoginBtn.addEventListener('click', () => {
    loginModal.classList.add('show');
    body.classList.add('modal-open');
    html.classList.add('modal-open');
});

closeLoginBtn.addEventListener('click', () => {
    loginModal.classList.remove('show');
    body.classList.remove('modal-open');
    html.classList.remove('modal-open');
});

// Help Guide for Students (Sub-Modal)
function showLoginHelp() {
    helpModal.classList.add('show');
    // Keep scroll lock as it's already on from the login modal
}

function closeHelp() {
    helpModal.classList.remove('show');
}

closeHelpBtn.addEventListener('click', closeHelp);

// Close on clicking outside the box is disabled per user request
// No listener for window.onclick ensures only the 'X' button works.

// --- Slider Logic ---
const sliderContainer = document.getElementById('slider');
const dotsContainer = document.getElementById('dotsContainer');
const slides = Array.from(sliderContainer.getElementsByClassName('slide'));
let currentIndex = 0;
let slideInterval;

// Generate Dots dynamically based on number of slides
function createDots() {
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    currentIndex = index;
    updateSlider();
    resetInterval();
}

// --- Swipe Logic for Tablet/Mobile ---
let touchStartX = 0;
let touchEndX = 0;

sliderContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, {passive: true});

sliderContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    if (touchEndX < touchStartX - 40) {
        // Swiped Left -> View Next
        nextSlide();
    }
    if (touchEndX > touchStartX + 40) {
        // Swiped Right -> View Previous
        prevSlide();
    }
}

function updateSlider() {
    // Update Slides
    slides.forEach((slide, index) => {
        slide.className = 'slide';

        if (index === currentIndex) {
            slide.classList.add('active');
        } else if (index === (currentIndex - 1 + slides.length) % slides.length) {
            slide.classList.add('prev');
        } else if (index === (currentIndex + 1) % slides.length) {
            slide.classList.add('next');
        } else {
            const half = Math.floor(slides.length / 2);
            let diff = index - currentIndex;
            if (diff < -half) diff += slides.length;
            if (diff > half) diff -= slides.length;

            if (diff < 0) {
                slide.classList.add('hidden-left');
            } else {
                slide.classList.add('hidden-right');
            }
        }
    });

    // Update Dots
    const dots = Array.from(dotsContainer.getElementsByClassName('dot'));
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
    resetInterval();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlider();
    resetInterval();
}

function handleSlideClick(slideElement) {
    // If on tablet mode (width <= 820), let swiping handle the navigation instead of clicks
    if (window.innerWidth <= 820) return;
    
    if (slideElement.classList.contains('prev')) {
        prevSlide();
    } else if (slideElement.classList.contains('next')) {
        nextSlide();
    }
}

function resetInterval() {
    clearInterval(slideInterval);
    // ONLY Auto-Slide if we are on a Desktop Desktop View
    if (window.innerWidth > 820) {
        slideInterval = setInterval(nextSlide, 3500); 
    }
}

// Disable interval and recalculate layout shifts on resize
window.addEventListener('resize', resetInterval);

createDots();
updateSlider();
resetInterval();

// --- Login Redirect Logic (Mock Authentication) ---
const loginForm = document.getElementById('landingLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const schoolId = document.getElementById('schoolId').value.toUpperCase();
        
        // Simple Mock logic for Capstone demonstration:
        // If ID starts with 'T' (Teacher) -> Teacher Dashboard
        // Otherwise -> Student Dashboard
        if (schoolId.startsWith('T')) {
            window.location.href = 'sigma-teacher-dashboard.html';
        } else {
            window.location.href = 'sigma-student-dashboard.html';
        }
    });
}
