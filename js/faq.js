/**
 * FAQ PAGE JAVASCRIPT
 * Handles tab switching, mobile menu toggling, and scroll locking.
 */

document.addEventListener('DOMContentLoaded', () => {

    // UI Elements
    const navLinks = document.querySelectorAll('.faq-nav-link');
    const sections = document.querySelectorAll('.faq-section');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const faqAside = document.getElementById('faqAside');
    const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');

    /**
     * Toggles mobile menu visibility and handles scroll locking.
     */
    function toggleMobileMenu(forceClose = false) {
        const isOpen = faqAside.classList.contains('mobile-menu-visible');
        const shouldClose = isOpen || forceClose;

        if (shouldClose) {
            faqAside.classList.replace('mobile-menu-visible', 'mobile-menu-hidden');
            mobileMenuBackdrop.classList.remove('visible');
            document.body.classList.remove('mobile-nav-active');

            setTimeout(() => {
                if (!faqAside.classList.contains('mobile-menu-visible')) {
                    mobileMenuBackdrop.classList.add('hidden');
                }
            }, 400);
        } else {
            mobileMenuBackdrop.classList.remove('hidden');
            setTimeout(() => {
                faqAside.classList.replace('mobile-menu-hidden', 'mobile-menu-visible');
                mobileMenuBackdrop.classList.add('visible');
                document.body.classList.add('mobile-nav-active');
            }, 10);
        }
    }

    /**
     * Switches visible help category.
     */
    function switchTab(targetId) {
        const targetSection = document.querySelector(targetId);
        const targetLinks = document.querySelectorAll(`a[href="${targetId}"]`);

        if (!targetSection) return;

        // Reset all
        sections.forEach(s => s.classList.add('hidden'));
        navLinks.forEach(l => l.classList.remove('active'));

        // Activate target
        targetSection.classList.remove('hidden');
        targetLinks.forEach(link => link.classList.add('active'));

        // Auto-close mobile menu
        if (window.innerWidth < 1280) {
            toggleMobileMenu(true);
        }

        history.pushState(null, null, targetId);
    }

    // Event Listeners
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', () => toggleMobileMenu());
    if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', () => toggleMobileMenu(true));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.getAttribute('href'));
        });
    });

    // Initial Routing
    const initialHash = window.location.hash;
    if (initialHash && document.querySelector(initialHash)) {
        switchTab(initialHash);
    } else if (sections[0]) {
        sections[0].classList.remove('hidden');
    }
});
