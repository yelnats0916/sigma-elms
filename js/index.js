document.addEventListener('DOMContentLoaded', function () {

    // --- Modals ---
    const openLoginBtn = document.getElementById('openLoginBtn');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const loginModal = document.getElementById('loginModal');
    const loginBox = document.getElementById('loginBox');
    const helpModal = document.getElementById('helpModal');
    const helpBox = document.getElementById('helpBox');
    const openHelpBtn = document.getElementById('openHelpBtn');
    const openHelpDesktopBtn = document.getElementById('openHelpDesktopBtn');
    const closeHelpBtn = document.getElementById('closeHelpBtn');

    function showModal(modal, box, isHelp = false) {
        if (!modal || !box) return;
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
        if (isHelp) { box.classList.remove('translate-y-[-100px]', 'opacity-0'); box.classList.add('translate-y-0', 'opacity-100'); }
        else { box.classList.remove('translate-y-5'); box.classList.add('translate-y-0'); }
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
    }

    function hideModal(modal, box, isHelp = false) {
        if (!modal || !box) return;
        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');
        if (isHelp) { box.classList.add('translate-y-[-100px]', 'opacity-0'); box.classList.remove('translate-y-0', 'opacity-100'); }
        else { box.classList.add('translate-y-5'); box.classList.remove('translate-y-0'); }
        if (loginModal && helpModal && loginModal.classList.contains('opacity-0') && helpModal.classList.contains('opacity-0')) {
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
        }
    }

    if (openLoginBtn) openLoginBtn.addEventListener('click', () => showModal(loginModal, loginBox));
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => hideModal(loginModal, loginBox));
    if (openHelpBtn) openHelpBtn.addEventListener('click', (e) => { e.preventDefault(); hideModal(loginModal, loginBox); showModal(helpModal, helpBox, true); });
    if (openHelpDesktopBtn) openHelpDesktopBtn.addEventListener('click', (e) => { e.preventDefault(); showModal(helpModal, helpBox, true); });
    if (closeHelpBtn) closeHelpBtn.addEventListener('click', () => hideModal(helpModal, helpBox, true));
    // --- Login forms ---
    const landingLoginForm = document.getElementById('landingLoginForm');
    if (landingLoginForm) {
        landingLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('schoolId').value.toUpperCase();
            window.location.href = id.startsWith('T') ? 'sigma-teacher-dashboard.html' : 'sigma-student-dashboard.html';
        });
    }

    const mobileLoginForm = document.getElementById('mobileLoginForm');
    if (mobileLoginForm) {
        mobileLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('mobileSchoolId').value.toUpperCase();
            window.location.href = id.startsWith('T') ? 'sigma-teacher-dashboard.html' : 'sigma-student-dashboard.html';
        });
    }

    // --- Slider (works for both desktop left panel and mobile) ---
    const sliderContainer = document.getElementById('slider');
    const dotsContainer = document.getElementById('dotsContainer');

    if (sliderContainer && dotsContainer) {
        const slides = Array.from(sliderContainer.querySelectorAll('.slide'));
        let currentIndex = 0;
        let slideInterval;

        // Build dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => { currentIndex = i; update(); resetInterval(); });
            dotsContainer.appendChild(dot);
        });

        // Touch swipe
        let touchStartX = 0;
        sliderContainer.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        sliderContainer.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (diff < -40) next();
            if (diff > 40) prev();
        }, { passive: true });

        function update() {
            slides.forEach((s, i) => {
                s.className = 'slide';
                if (i === currentIndex) s.classList.add('active');
                else if (i === (currentIndex - 1 + slides.length) % slides.length) s.classList.add('prev');
                else if (i === (currentIndex + 1) % slides.length) s.classList.add('next');
                else {
                    const half = Math.floor(slides.length / 2);
                    let diff = i - currentIndex;
                    if (diff < -half) diff += slides.length;
                    if (diff > half) diff -= slides.length;
                    s.classList.add(diff < 0 ? 'hidden-left' : 'hidden-right');
                }
            });
            dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
        }

        function next() { currentIndex = (currentIndex + 1) % slides.length; update(); resetInterval(); }
        function prev() { currentIndex = (currentIndex - 1 + slides.length) % slides.length; update(); resetInterval(); }

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(next, 3500);
        }

        // Expose globally for onclick handlers
        window.nextSlide = next;
        window.prevSlide = prev;
        window.handleSlideClick = function (el) {
            if (el.classList.contains('prev')) prev();
            else if (el.classList.contains('next')) next();
        };

        update();
        resetInterval(); // always auto-slide
    }

    // --- Sigma AI ---
    const sigmaFab = document.getElementById('sigmaFab');
    const closeSigmaBtn = document.getElementById('closeSigmaAi');
    const sigmaPopup = document.getElementById('sigmaAiPopup');
    const sigmaBox = document.getElementById('sigmaAiBox');
    const sigmaMessages = document.getElementById('sigmaMessages');
    const sigmaInput = document.getElementById('sigmaInput');

    if (sigmaFab && sigmaPopup) {
        function showSigma() {
            sigmaPopup.classList.remove('opacity-0', 'pointer-events-none');
            sigmaPopup.classList.add('opacity-100', 'pointer-events-auto');
            sigmaBox.classList.remove('translate-y-8', 'opacity-0');
            sigmaBox.classList.add('translate-y-0', 'opacity-100');
        }
        function hideSigma() {
            sigmaPopup.classList.remove('opacity-100', 'pointer-events-auto');
            sigmaPopup.classList.add('opacity-0', 'pointer-events-none');
            sigmaBox.classList.add('translate-y-8', 'opacity-0');
            sigmaBox.classList.remove('translate-y-0', 'opacity-100');
        }

        const CONTACT = `📍 <strong>ICT Department</strong> — Room 204<br>📚 <strong>Registrar's Office</strong> — Ground Floor<br>🕐 Mon–Fri, 7:00 AM – 5:00 PM`;
        const FAQ = [
            { kw: ['what is sigma','sigma elms','about sigma','about elms'], a: `<strong>Sigma ELMS</strong> is ICC's AI-Integrated E-Learning Management System for Senior High School.` },
            { kw: ['about icc','what is icc','interface computer','tell me about interface computer college'], a: `🏫 <strong>Interface Computer College</strong> is a Senior High School in the Philippines offering quality education with modern digital tools.<br><br>📍 <strong>Integrity · Discipline · Excellence</strong> (Est. 1982)<br><br>Sigma ELMS is ICC's official E-Learning Management System for Senior High School students and teachers.` },
            { kw: ['admin concern','admin concerns','admin office','administration'], a: `For admin concerns, please visit the:<br><br>🏢 <strong>Administration Office</strong><br>📍 Ground Floor, ICC Building<br>🕐 Mon–Fri, 7:00 AM – 5:00 PM<br><br>The admin office handles enrollment, records, and other school concerns.` },
            { kw: ['how to login','how do i log','sign in','login','log in'], a: `1️⃣ Enter your <strong>School ID</strong><br>2️⃣ Enter your <strong>Password</strong><br>3️⃣ Click <strong>Sign In</strong><br><br>💡 Teachers use IDs starting with "T"` },
            { kw: ['forgot password','default password','reset password','password'], a: `Default password is your birthday: <strong>YYYYMMDD</strong><br><br>For resets: <strong>ICT Dept, Room 204</strong>` },
            { kw: ['forgot id','school id','find my id','lost id'], a: `Find your ID on your <strong>Registration Form</strong> or <strong>ID Card</strong>.<br><br>Still lost? Visit the <strong>Registrar's Office</strong>.` },
            { kw: ['grade','grades','analytics'], a: `Sigma ELMS has built-in <strong>Grade Monitoring Analytics</strong>. View grades in real-time on your dashboard.` },
            { kw: ['module','modules'], a: `Modules are uploaded by teachers. Go to your <strong>class dashboard</strong> to access them.` },
            { kw: ['contact','help','support'], a: CONTACT },
            { kw: ['hello','hi','hey','good morning','good afternoon'], a: `Hello! 👋 I'm <strong>Sigma AI</strong>. How can I help you?` },
            { kw: ['thank','thanks','salamat'], a: `You're welcome! 😊 Good luck with your studies! 📚` },
            { kw: ['who are you','what are you','are you ai'], a: `I'm <strong>Sigma FAQ</strong> 🤖 — ICC's virtual assistant!` },
        ];

        function findAnswer(input) {
            const q = input.toLowerCase();
            for (const f of FAQ) for (const k of f.kw) if (q.includes(k)) return f.a;
            return `I'm sorry, I don't have an answer for that. 😔<br><br>${CONTACT}`;
        }

        function addMsg(role, text) {
            const d = document.createElement('div');
            d.className = `flex ${role === 'assistant' ? 'justify-start' : 'justify-end'}`;
            d.innerHTML = `<div class="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${role === 'assistant' ? 'bg-white border border-gray-200 text-gray-800 shadow-sm' : 'bg-green-700 text-white'}">${text}</div>`;
            sigmaMessages.appendChild(d);
            sigmaMessages.scrollTop = sigmaMessages.scrollHeight;
        }

        function send() {
            const text = sigmaInput.value.trim(); if (!text) return;
            sigmaInput.value = ''; addMsg('user', text);
            const ind = document.createElement('div'); ind.id = 'typing'; ind.className = 'flex justify-start';
            ind.innerHTML = `<div class="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm flex gap-1"><span class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay:0ms"></span><span class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay:150ms"></span><span class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay:300ms"></span></div>`;
            sigmaMessages.appendChild(ind); sigmaMessages.scrollTop = sigmaMessages.scrollHeight;
            setTimeout(() => { const el = document.getElementById('typing'); if (el) el.remove(); addMsg('assistant', findAnswer(text)); }, 800);
        }

        window.sendSigmaMessage = send;
        window.askSuggestion = (q) => { sigmaInput.value = q; send(); };
        if (sigmaInput) sigmaInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
        if (closeSigmaBtn) closeSigmaBtn.addEventListener('click', hideSigma);
        sigmaFab.addEventListener('click', () => {
            if (sigmaMessages.children.length === 0) addMsg('assistant', `👋 I'm <strong>Sigma FAQ </strong>Need login help? <strong>Ask away</strong>!`);
            showSigma();
        });
    }

});