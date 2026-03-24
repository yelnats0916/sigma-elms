/* =============================================================
   SIGMA ELMS — Login Page JavaScript
   Interface Computer College | Senior High School ELMS
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* ===== DOM SELECTORS: Cached references to all interactive elements ===== */
    const ui = {
        modals: {
            login: { el: document.getElementById('loginModal'), box: document.getElementById('loginBox') },
            help: { el: document.getElementById('helpModal'), box: document.getElementById('helpBox') }
        },
        btns: {
            openLogin: document.getElementById('openLoginBtn'),
            closeLogin: document.getElementById('closeLoginBtn'),
            openHelp: document.querySelectorAll('#openHelpBtn'),
            closeHelp: document.getElementById('closeHelpBtn')
        },
        form: document.getElementById('landingLoginForm')
    };


    /* ===== MODAL SYSTEM: Show/hide animated modal overlays ===== */

    function toggleModal(modal, show, isHelp = false) {
        if (!modal.el || !modal.box) return;

        if (show) {
            modal.el.classList.remove('opacity-0', 'pointer-events-none');
            modal.el.classList.add('opacity-100', 'pointer-events-auto');
            const translateClass = isHelp ? 'translate-y-[-100px]' : 'translate-y-5';
            modal.box.classList.remove(translateClass, 'opacity-0');
            modal.box.classList.add('translate-y-0', 'opacity-100');
            document.body.classList.add('modal-open');
        } else {
            modal.el.classList.add('opacity-0', 'pointer-events-none');
            modal.el.classList.remove('opacity-100', 'pointer-events-auto');
            const translateClass = isHelp ? 'translate-y-[-100px]' : 'translate-y-5';
            modal.box.classList.add(translateClass, 'opacity-0');
            modal.box.classList.remove('translate-y-0', 'opacity-100');

            setTimeout(() => {
                if (!document.querySelector('.opacity-100')) {
                    document.body.classList.remove('modal-open');
                }
            }, 300);
        }
    }

    /* MODAL LISTENERS */
    if (ui.btns.openLogin) ui.btns.openLogin.onclick = () => toggleModal(ui.modals.login, true);
    if (ui.btns.closeLogin) ui.btns.closeLogin.onclick = () => toggleModal(ui.modals.login, false);

    // Help Modal Toggle
    const openHelp = (e) => {
        if (e) e.preventDefault();
        toggleModal(ui.modals.login, false);
        toggleModal(ui.modals.help, true, true);
    };
    if (ui.btns.openHelp) {
        ui.btns.openHelp.forEach(btn => btn.onclick = openHelp);
    }
    if (ui.btns.closeHelp) ui.btns.closeHelp.onclick = () => toggleModal(ui.modals.help, false, true);


    /* ===== LOGIN LOGIC: Unified Role-based Redirect ===== */

    if (ui.form) {
        ui.form.onsubmit = (e) => {
            e.preventDefault();
            const idField = document.getElementById('schoolId');
            const idValue = idField ? idField.value.trim().toUpperCase() : '';

            if (!idValue) return alert("Please enter your Login ID.");

            // ROLE-BASED REDIRECTS (HiFi Logic)
            if (idValue === 'ADMIN') {
                window.location.replace('admin.html');
                return;
            }
            if (idValue === 'SUPERADMIN') {
                window.location.replace('superadmin.html');
                return;
            }

            const target = idValue.startsWith('T') ? 'teacher.html?id=' + idValue : 'student.html';
            window.location.replace(target);
        };
    }

    /* MODAL LOGIN FORM (if exists in HTML) */
    const modalForm = document.getElementById('modalLoginForm');
    if (modalForm) {
        modalForm.onsubmit = (e) => {
            e.preventDefault();
            const idValue = document.getElementById('modalSchoolId')?.value.trim().toUpperCase() || '';
            if (idValue) {
                const target = idValue.startsWith('T') ? 'teacher.html?id=' + idValue : 'student.html';
                window.location.replace(target);
            }
        };
    }



    /* ===== IMAGE SLIDER: Auto-rotating campus photo slideshow ===== */

    /* SLIDER CONFIG — image paths and alt text for all slides */
    const SLIDER_CONFIG = [
        { src: 'image/ICC image 4.jpg', alt: 'Welcome to ICC ELMS' },
        { src: 'image/ICC image3.jpg', alt: 'Classroom' },
        { src: 'image/ICC image2.jpg', alt: 'Study' },
        { src: 'image/ICC image.jpg', alt: 'Computer Lab' }
    ];

    /**
     * INIT SLIDER CONTENT — injects slide HTML (image + blurred background) into a container.
     * @param {string} containerId - The slider container element ID
     */
    function initSliderContent(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = SLIDER_CONFIG.map((img, i) => `
            <div class="slide ${i === 0 ? 'active' : ''}">
                <div class="slide-blur-bg" style="background-image: url('${img.src}')"></div>
                <img class="slide-img" src="${img.src}" alt="${img.alt}">
            </div>
        `).join('');
    }

    /* INJECT SLIDES — populate desktop slider container */
    initSliderContent('slider');

    /**
     * CREATE SLIDER — initializes auto-play slider with dot navigation.
     * @param {string} containerId - The slider container element ID
     * @param {string} dotsId      - The dots container element ID
     * @returns {Object|null} Slider controls { next, prev, jumpTo } or null if not found
     */
    function createSlider(containerId, dotsId) {
        const container = document.getElementById(containerId);
        const dotsBox = document.getElementById(dotsId);
        if (!container || !dotsBox) return null;

        const slides = Array.from(container.querySelectorAll('.slide'));
        if (slides.length === 0) return null;

        let current = 0;
        let timer;

        /* INIT DOTS — create one dot per slide */
        dotsBox.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => jumpTo(i);
            dotsBox.appendChild(dot);
        });

        /* UPDATE — sync active state between slides and dots */
        function update() {
            slides.forEach((s, i) => s.classList.toggle('active', i === current));
            Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle('active', i === current));
        }

        /* JUMP TO — go to a specific slide index */
        function jumpTo(index) {
            current = index;
            update();
            reset();
        }

        /* NEXT — advance to next slide (wraps around) */
        function next() {
            current = (current + 1) % slides.length;
            update();
        }

        /* PREV — go to previous slide (wraps around) */
        function prev() {
            current = (current - 1 + slides.length) % slides.length;
            update();
        }

        /* RESET TIMER — restart 4-second auto-advance interval */
        function reset() {
            clearInterval(timer);
            timer = setInterval(next, 5000);
        }

        /* START AUTO-PLAY */
        reset();
        return { next, prev, jumpTo };
    }

    /* INIT SLIDER — create desktop slider instance */
    const mainSlider = createSlider('slider', 'dotsContainer');


});