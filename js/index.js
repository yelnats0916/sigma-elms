/* =============================================================
   SIGMA ELMS — Login Page JavaScript
   Interface Computer College | Senior High School ELMS
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* ===== DOM SELECTORS: Cached references to all interactive elements ===== */
    const ui = {
        /* MODAL ELEMENTS — overlay + content box pairs */
        modals: {
            login: { el: document.getElementById('loginModal'), box: document.getElementById('loginBox') },
            help: { el: document.getElementById('helpModal'), box: document.getElementById('helpBox') },
            sigma: { el: document.getElementById('sigmaAiPopup'), box: document.getElementById('sigmaAiBox') }
        },
        /* BUTTON ELEMENTS — open/close triggers for modals */
        btns: {
            openLogin: document.getElementById('openLoginBtn'),
            closeLogin: document.getElementById('closeLoginBtn'),
            openHelp: document.getElementById('openHelpBtn'),
            openHelpDesktop: document.getElementById('openHelpDesktopBtn'),
            closeHelp: document.getElementById('closeHelpBtn'),
            sigmaFab: document.getElementById('sigmaFab'),
            closeSigma: document.getElementById('closeSigmaAi')
        },
        /* FORM ELEMENTS — login forms (desktop + mobile) */
        forms: {
            landing: document.getElementById('landingLoginForm'),
            mobile: document.getElementById('mobileLoginForm')
        },
        /* SIGMA AI ELEMENTS — chat message container and input field */
        sigma: {
            messages: document.getElementById('sigmaMessages'),
            input: document.getElementById('sigmaInput')
        }
    };


    /* ===== MODAL SYSTEM: Show/hide animated modal overlays ===== */

    /**
     * TOGGLE MODAL — animates a modal overlay and content box in/out.
     * @param {Object} modal  - The modal object { el: overlay, box: content }
     * @param {boolean} show  - true = open, false = close
     * @param {boolean} isHelp - true = uses slide-down animation (help modal)
     */
    function toggleModal(modal, show, isHelp = false) {
        if (!modal.el || !modal.box) return;

        if (show) {
            // SHOW OVERLAY — fade in background
            modal.el.classList.remove('opacity-0', 'pointer-events-none');
            modal.el.classList.add('opacity-100', 'pointer-events-auto');

            // SHOW CONTENT — slide content box into view
            if (isHelp) {
                modal.box.classList.remove('translate-y-[-100px]', 'opacity-0');
                modal.box.classList.add('translate-y-0', 'opacity-100');
            } else {
                modal.box.classList.remove('translate-y-5', 'opacity-0');
                modal.box.classList.add('translate-y-0', 'opacity-100');
            }
            document.body.classList.add('modal-open');
        } else {
            // HIDE OVERLAY — fade out background
            modal.el.classList.add('opacity-0', 'pointer-events-none');
            modal.el.classList.remove('opacity-100', 'pointer-events-auto');

            // HIDE CONTENT — slide content box out of view
            if (isHelp) {
                modal.box.classList.add('translate-y-[-100px]', 'opacity-0');
                modal.box.classList.remove('translate-y-0', 'opacity-100');
            } else {
                modal.box.classList.add('translate-y-5', 'opacity-0');
                modal.box.classList.remove('translate-y-0', 'opacity-100');
            }

            // UNLOCK SCROLL — re-enable body scroll after animation ends
            setTimeout(() => {
                if (!document.querySelector('.opacity-100')) {
                    document.body.classList.remove('modal-open');
                }
            }, 300);
        }
    }

    /* MODAL LISTENERS — button click handlers for opening/closing modals */
    if (ui.btns.openLogin) ui.btns.openLogin.onclick = () => toggleModal(ui.modals.login, true);
    if (ui.btns.closeLogin) ui.btns.closeLogin.onclick = () => toggleModal(ui.modals.login, false);
    if (ui.btns.openHelp) ui.btns.openHelp.onclick = (e) => {
        e.preventDefault();
        toggleModal(ui.modals.login, false);
        toggleModal(ui.modals.help, true, true);
    };
    if (ui.btns.openHelpDesktop) ui.btns.openHelpDesktop.onclick = (e) => {
        e.preventDefault();
        toggleModal(ui.modals.help, true, true);
    };
    if (ui.btns.closeHelp) ui.btns.closeHelp.onclick = () => toggleModal(ui.modals.help, false, true);


    /* ===== LOGIN LOGIC: Form submission and role-based redirect ===== */

    /**
     * HANDLE LOGIN — attaches submit handler to a login form.
     * Redirects to teacher dashboard if ID starts with 'T', else student dashboard.
     * @param {string} formId    - The form element ID
     * @param {string} idFieldId - The login ID input element ID
     */
    function handleLogin(formId, idFieldId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.onsubmit = (e) => {
            e.preventDefault();
            const idField = document.getElementById(idFieldId);
            const idValue = idField ? idField.value.trim().toUpperCase() : '';

            if (!idValue) {
                alert("Please enter your Login ID.");
                return;
            }

            // ROLE REDIRECT — 'T' prefix = teacher, otherwise = student
            const target = idValue.startsWith('T') ? 'sigma-teacher-dashboard.html' : 'sigma-student-dashboard.html';
            window.location.href = target;
        };
    }

    /* INIT LOGIN FORMS — bind submit handlers to desktop, mobile, and modal forms */
    handleLogin('landingLoginForm', 'schoolId');
    handleLogin('mobileLoginForm', 'mobileSchoolId');
    handleLogin('modalLoginForm', 'modalSchoolId');

    /* PHONE HELP LINK — opens help modal from the phone layout forgot link */
    const helpPhoneBtn = document.getElementById('openHelpPhoneBtn');
    if (helpPhoneBtn) helpPhoneBtn.onclick = (e) => { e.preventDefault(); toggleModal(ui.modals.help, true, true); };


    /* ===== IMAGE SLIDER: Auto-rotating campus photo slideshow ===== */

    /* SLIDER CONFIG — image paths and alt text for all slides */
    const SLIDER_CONFIG = [
        { src: 'image/Campus.jpg', alt: 'Campus' },
        { src: 'image/Classroom.jpg', alt: 'Classroom' },
        { src: 'image/Study.jpg', alt: 'Study' },
        { src: 'image/ComputerLab.jpg', alt: 'Computer Lab' }
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

    /* INJECT SLIDES — populate both desktop and mobile slider containers */
    initSliderContent('slider');
    initSliderContent('mobileSlider');

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
            timer = setInterval(next, 4000);
        }

        /* START AUTO-PLAY */
        reset();
        return { next, prev, jumpTo };
    }

    /* INIT SLIDERS — create both desktop and mobile slider instances */
    const mainSlider = createSlider('slider', 'dotsContainer');
    const mobileSlider = createSlider('mobileSlider', 'mobileDotsContainer');

    /* GLOBAL SLIDER CONTROLS — exposed for mobile arrow buttons */
    window.nextSlide = () => mobileSlider?.next();
    window.prevSlide = () => mobileSlider?.prev();


    /* ===== SIGMA AI: FAQ Chatbot with keyword matching ===== */

    /* FAQ DATABASE — keyword-to-answer pairs for the chatbot */
    const FAQ = [
        { kw: ['hello', 'hi', 'hey'], a: "Hello! 👋 I'm <strong>Sigma AI</strong>. How can I help you with ICC or ELMS today?" },
        { kw: ['about icc', 'interface computer', 'what is icc'], a: "🏫 <strong>Interface Computer College</strong> (ICC) is a premier educational institution established in 1982, specializing in IT and Business. We focus on Integrity, Discipline, and Excellence!" },
        { kw: ['login', 'sign in', 'how to log'], a: "1️⃣ Enter your <strong>School ID</strong> (e.g. 2024-0001).<br>2️⃣ Use your <strong>Password</strong> (Default: Birthday YYYYMMDD).<br>3️⃣ Click <strong>Log In</strong>!<br><br>💡 Teachers: Use ID starting with 'T'." },
        { kw: ['forgot', 'password', 'id'], a: "Check your registration form for your ID. For password resets, visit the <strong>ICT Department in Room 204</strong>." },
        { kw: ['admin', 'office'], a: "The <strong>Administration Office</strong> is located on the Ground Floor. Open Mon-Fri, 7AM to 5PM." },
        { kw: ['who are you'], a: "I'm <strong>Sigma FAQ</strong>, your virtual assistant for Interface Computer College! 🤖" }
    ];

    /**
     * ADD SIGMA MESSAGE — appends a chat bubble to the message container.
     * @param {string} role - 'user' (right-aligned green) or 'assistant' (left-aligned white)
     * @param {string} text - HTML content of the message
     */
    function addSigmaMessage(role, text) {
        if (!ui.sigma.messages) return;
        const msg = document.createElement('div');
        msg.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        msg.innerHTML = `<div class="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${role === 'user' ? 'bg-icc text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
            }">${text}</div>`;
        ui.sigma.messages.appendChild(msg);
        ui.sigma.messages.scrollTop = ui.sigma.messages.scrollHeight;
    }

    /**
     * SEND SIGMA — processes user input, shows typing animation, then responds.
     * Matches user text against FAQ keywords and returns the best match.
     */
    function sendSigma() {
        const val = ui.sigma.input ? ui.sigma.input.value.trim() : '';
        if (!val) return;

        if (ui.sigma.input) ui.sigma.input.value = '';
        addSigmaMessage('user', val);

        /* TYPING INDICATOR — animated bouncing dots */
        const typing = document.createElement('div');
        typing.className = 'flex justify-start';
        typing.innerHTML = `<div class="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm flex gap-1"><span class="w-1.5 h-1.5 bg-icc rounded-full animate-bounce"></span><span class="w-1.5 h-1.5 bg-icc rounded-full animate-bounce" style="animation-delay:0.2s"></span><span class="w-1.5 h-1.5 bg-icc rounded-full animate-bounce" style="animation-delay:0.4s"></span></div>`;
        ui.sigma.messages.appendChild(typing);
        ui.sigma.messages.scrollTop = ui.sigma.messages.scrollHeight;

        /* DELAYED RESPONSE — simulates thinking time, then keyword-matches */
        setTimeout(() => {
            typing.remove();
            const lower = val.toLowerCase();
            const match = FAQ.find(f => f.kw.some(k => lower.includes(k))) ||
                (lower.includes('log') ? FAQ.find(f => f.kw.includes('login')) : null);
            addSigmaMessage('assistant', match ? match.a : "I'm sorry, I don't have information on that yet. Please visit the ICT Department (Room 204) for direct assistance! 📍");
        }, 800);
    }

    /* SIGMA FAB CLICK — opens chatbot and shows welcome message on first open */
    if (ui.btns.sigmaFab) {
        ui.btns.sigmaFab.onclick = () => {
            if (ui.sigma.messages && ui.sigma.messages.children.length === 0) {
                addSigmaMessage('assistant', "Hello! I'm Sigma FAQ. Need login help? Ask me.");
            }
            toggleModal(ui.modals.sigma, true);
        };
    }

    /* SIGMA CLOSE — closes the chatbot popup */
    if (ui.btns.closeSigma) ui.btns.closeSigma.onclick = () => toggleModal(ui.modals.sigma, false);

    /* SIGMA ENTER KEY — submit message on Enter keypress */
    if (ui.sigma.input) ui.sigma.input.onkeydown = (e) => { if (e.key === 'Enter') sendSigma(); };

    /* GLOBAL FUNCTIONS — exposed for inline onclick handlers in HTML */
    window.sendSigmaMessage = sendSigma;
    window.askSuggestion = (q) => {
        if (ui.sigma.input) {
            ui.sigma.input.value = q;
            sendSigma();
        }
    };

});