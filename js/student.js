document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('no-transition');

    const sidebar = document.getElementById('sidebar');
    const subSidebar = document.getElementById('sub-sidebar');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const navLinks = document.querySelectorAll('#sidebar nav a');

    const sectionMap = {
        'nav-home': 'section-home',
        'nav-classrooms': 'section-classrooms',
        'nav-courses': 'section-courses',
        'nav-assignments': 'section-assignments',
        'nav-grades': 'section-grades',
        'nav-attendance': 'section-attendance',
        'nav-mail': 'section-messages',
        'nav-notes': 'section-notes',
        'nav-topic-detail': 'section-topic-detail',
        'nav-topic-content': 'section-topic-content'
    };

    const navIdByPage = {
        'home': 'nav-home', 'classrooms': 'nav-classrooms', 'courses': 'nav-courses',
        'assignments': 'nav-assignments', 'grades': 'nav-grades',
        'attendance': 'nav-attendance', 'messages': 'nav-mail', 'notes': 'nav-notes'
    };

    const hasSubSidebar = ['nav-courses', 'nav-assignments', 'nav-mail'];

    const isMobile = window.innerWidth < 1024;
    if (!isMobile) sidebar.classList.add('sidebar-collapsed');

    window.getComputedStyle(document.documentElement).opacity;
    document.documentElement.classList.remove('no-transition');

    // ─── Layout ────────────────────────────────────────────────
    function updateLayout() {
        if (window.innerWidth < 1024) { layoutWrapper.style.marginLeft = '0'; return; }
        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        const isSubVisible = subSidebar.classList.contains('sub-sidebar-visible');
        const mainWidth = isCollapsed ? 82 : 220;
        const subWidth = isSubVisible ? 240 : 0;
        layoutWrapper.style.marginLeft = (mainWidth + subWidth) + 'px';
    }

    function hideAllSections() {
        document.querySelectorAll('.dynamic-section').forEach(s => {
            s.classList.add('hidden');
            s.style.display = 'none';
        });
    }

    function showSection(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('hidden');
        el.style.display = '';
    }

    // ─── Nav Context Title ──────────────────────────────────────
    function setNavContext(text) {
        const ctx = document.getElementById('nav-context');
        const ctxText = document.getElementById('nav-context-text');
        if (!ctx || !ctxText) return;
        if (text) { ctxText.textContent = text; ctx.classList.add('visible'); }
        else { ctx.classList.remove('visible'); }
    }

    // ─── Tab Switching (internal — no history push) ─────────────
    function _applyTab(navId) {
        const targetSectionId = sectionMap[navId];
        if (!targetSectionId) return;

        const navCtx = document.getElementById('nav-subject-context');
        if (navCtx) { navCtx.classList.add('hidden'); navCtx.classList.remove('flex'); }

        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        const activeLink = document.getElementById(navId);
        if (activeLink) activeLink.classList.add('bg-white/20');

        hideAllSections();
        showSection(targetSectionId);

        // Nav context title per tab
        const navContextMap = {
            'nav-home': '', 'nav-classrooms': 'Classes', 'nav-courses': 'ICT Strand',
            'nav-assignments': 'Assessments', 'nav-grades': 'Grades',
            'nav-attendance': 'Attendance', 'nav-mail': 'Mail', 'nav-notes': 'Notes'
        };
        setNavContext(navContextMap[navId] || '');

        const shouldShowSub = hasSubSidebar.includes(navId);

        if (navId === 'nav-home') {
            document.body.classList.remove('sidebar-collapsed');
            sidebar.classList.remove('sidebar-collapsed');
            _hideSubSidebarInstant();
        } else {
            document.body.classList.add('sidebar-collapsed');
            sidebar.classList.add('sidebar-collapsed');
            if (shouldShowSub) {
                _showSubSidebarInstant();
                updateSubSidebar(navId);
            } else {
                _hideSubSidebarInstant();
            }
        }

        updateLayout();
        if (window.innerWidth < 1024) sidebar.classList.remove('sidebar-visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ─── Sub-sidebar instant show/hide (NO slide animation) ────
    function _hideSubSidebarInstant() {
        subSidebar.style.transition = 'none';
        subSidebar.classList.remove('sub-sidebar-visible');
        subSidebar.classList.add('hidden');
        // restore transition after frame
        requestAnimationFrame(() => { subSidebar.style.transition = ''; });
    }

    function _showSubSidebarInstant() {
        subSidebar.style.transition = 'none';
        subSidebar.classList.remove('hidden');
        subSidebar.classList.add('sub-sidebar-visible');
        requestAnimationFrame(() => { subSidebar.style.transition = ''; });
    }

    // ─── Public switchTab — pushes history ─────────────────────
    function switchTab(navId, pushState = true) {
        const pageKey = Object.entries(navIdByPage).find(([k, v]) => v === navId)?.[0] || 'home';
        if (pushState) history.pushState({ page: pageKey }, '', '#' + pageKey);
        _applyTab(navId);
    }
    window.switchTab = switchTab;

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchTab(link.id);
        });
    });

    // ─── Browser back/forward ──────────────────────────────────
    window.addEventListener('popstate', e => {
        const state = e.state;
        if (!state || !state.page) { _applyTab('nav-home'); return; }
        if (state.page.startsWith('topic-content:')) {
            const [, subjectId, topicIdx, tab] = state.page.split(':');
            _showTopicContent(subjectId, parseInt(topicIdx), tab || 'videos');
        } else if (state.page.startsWith('topic:')) {
            _buildAndShowTopicPage(state.page.replace('topic:', ''));
        } else {
            _applyTab(navIdByPage[state.page] || 'nav-home');
        }
    });

    // ─── Subjects Data (q1Percent + q2Percent for bar) ─────────
    const subjectsData = {
        enrolled: [
            { id: 'card-prog1', text: 'Computer Programming 1', subtitle: 'ICT Strand • Java Foundations', instructor: 'Mr. Alex Reyes', icon: 'fa-solid fa-code', bg: 'image/book1.jpg', q1Percent: 80, q2Percent: 0, summary: 'Computer Programming 1 introduces students to the foundations of software development using Java. Students will explore core programming concepts including variables, data types, control structures, methods, and object-oriented principles.' },
            { id: 'card-webdev', text: 'Web Development 1', subtitle: 'ICT Strand • HTML/CSS/JS', instructor: 'Ms. Sarah Lim', icon: 'fa-solid fa-globe', bg: 'image/book2.jpg', q1Percent: 67, q2Percent: 0, summary: 'Web Development 1 covers the fundamentals of building modern, responsive websites using HTML5, CSS3, and JavaScript. Students learn to structure web content, apply visual styling, and add interactivity to web pages.' },
            { id: 'card-sysarch', text: 'Computer Systems Arch', subtitle: 'ICT Strand • Hardware', instructor: 'Engr. Marco Diaz', icon: 'fa-solid fa-microchip', bg: 'image/book3.jpg', q1Percent: 50, q2Percent: 0, summary: 'Computer Systems Architecture explores the internal design and organization of computer hardware components. Topics include number systems, CPU architecture, memory hierarchy, input/output systems, and instruction set design.' },
            { id: 'card-empowerment', text: 'Empowerment Technologies', subtitle: 'ICT Strand • Digital Literacy', instructor: 'Mr. Juan Dela Cruz', icon: 'fa-solid fa-lightbulb', bg: 'image/book4.jpg', q1Percent: 20, q2Percent: 0, summary: 'Empowerment Technologies equips students with knowledge and skills to use digital tools responsibly and effectively. Topics cover online safety, social media ethics, digital citizenship, and ICT for social empowerment.' },
            { id: 'card-networks', text: 'Network Basics', subtitle: 'ICT Strand • Networking', instructor: 'Mr. Alex Chen', icon: 'fa-solid fa-network-wired', bg: 'image/book5.jpg', q1Percent: 40, q2Percent: 0, summary: 'Network Basics introduces students to the principles and technologies behind computer networking. Students study the OSI model, IP addressing, subnetting, network topologies, and fundamental routing and switching concepts.' },
            { id: 'card-database', text: 'Database Management 1', subtitle: 'ICT Strand • SQL/Data', instructor: 'Ms. Elena Reyes', icon: 'fa-solid fa-database', bg: 'image/book6.jpg', q1Percent: 60, q2Percent: 0, summary: 'Database Management 1 teaches students how to design and manage relational databases using SQL. Core topics include entity-relationship modeling, normalization, SQL data definition and manipulation, joins, and subqueries.' },
            { id: 'card-graphics', text: 'Graphic Design & Layout', subtitle: 'ICT Strand • Visual Arts', instructor: 'Mr. Paulo Cruz', icon: 'fa-solid fa-palette', bg: 'image/book7.jpg', q1Percent: 70, q2Percent: 0, summary: 'Graphic Design and Layout develops creative and technical skills in visual communication. Topics include design principles, color theory, typography, layout composition, and digital illustration for print and digital media.' },
            { id: 'card-mobile', text: 'Mobile App Development', subtitle: 'ICT Strand • Flutter/React', instructor: 'Ms. Lara Santos', icon: 'fa-solid fa-mobile-screen', bg: 'image/book8.jpg', q1Percent: 30, q2Percent: 0, summary: 'Mobile App Development introduces cross-platform mobile application development using modern frameworks. Students learn UI/UX design patterns, state management, API integration, and app deployment to major platforms.' }
        ],
        completed: [
            { id: 'card-introcomp', text: 'Intro to Computing', subtitle: 'Foundations • Grade 11', instructor: 'Mr. Carlo Bautista', grade: '1.25 Excellent', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-desktop', bg: 'image/book4.jpg' },
            { id: 'card-oralcomm', text: 'Oral Communication', subtitle: 'Core Subject • Grade 11', instructor: 'Ms. Ana Reyes', grade: '1.50 Very Good', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-comments', bg: 'image/book1.jpg' },
            { id: 'card-genmath', text: 'General Mathematics', subtitle: 'Core Subject • Grade 11', instructor: 'Mr. Jose Santos', grade: '1.75 Good', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-infinity', bg: 'image/book2.jpg' },
            { id: 'card-animation', text: 'Animation (Basic)', subtitle: 'ICT Strand • Grade 11', instructor: 'Ms. Tricia Villanueva', grade: '1.25 Excellent', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-palette', bg: 'image/book3.jpg' }
        ]
    };

    // ─── Daily Schedule / Notifications ───────────────────────
    const dailySchedule = [
        { time: '08:00', endTime: '09:30', subject: 'Computer Programming 1', room: 'Room 301', teacher: 'Mr. Alex Reyes' },
        { time: '09:45', endTime: '11:15', subject: 'Web Development 1', room: 'Lab 2', teacher: 'Ms. Sarah Lim' },
        { time: '11:30', endTime: '13:00', subject: 'Database Management 1', room: 'Lab 1', teacher: 'Ms. Elena Reyes' },
        { time: '13:00', endTime: '14:00', subject: 'Lunch Break', room: '', teacher: '' },
        { time: '14:00', endTime: '15:30', subject: 'Computer Systems Arch', room: 'Room 204', teacher: 'Engr. Marco Diaz' },
        { time: '15:45', endTime: '17:15', subject: 'Empowerment Technologies', room: 'Room 102', teacher: 'Mr. Juan Dela Cruz' }
    ];
    function parseTime(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
    function formatTime12(t) { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; }

    function getScheduleStatus() {
        const now = new Date(), nowMins = now.getHours() * 60 + now.getMinutes();
        if (nowMins < parseTime('08:00')) return { type: 'before', next: dailySchedule[0] };
        if (nowMins >= parseTime('17:15')) return { type: 'done' };
        for (let i = 0; i < dailySchedule.length; i++) {
            const s = dailySchedule[i];
            if (nowMins >= parseTime(s.time) && nowMins < parseTime(s.endTime)) return { type: 'ongoing', current: s, next: dailySchedule[i + 1] || null };
            if (nowMins < parseTime(s.time)) return { type: 'between', next: s };
        }
        return { type: 'done' };
    }

    const featureNotifications = [
        { icon: 'fa-solid fa-bolt', title: 'SIGMA AI Study Tips', message: 'Get personalized AI recommendations for your next class.', nav: 'nav-courses' },
        { icon: 'fa-solid fa-calendar-check', title: 'New Assignments Posted', message: 'Your teacher uploaded new tasks. Review deadlines today.', nav: 'nav-assignments' },
        { icon: 'fa-solid fa-envelope', title: 'Inbox Update', message: 'You have 2 unread messages from teachers.', nav: 'nav-mail' },
        { icon: 'fa-solid fa-trophy', title: 'Quiz Results Available', message: 'Your latest score for Computer Programming 1 is ready.', nav: 'nav-grades' }
    ];

    function buildScheduleNotifications() {
        const notifList = document.getElementById('notif-list');
        const notifBadge = document.getElementById('notifBadge');
        if (!notifList) return;
        const status = getScheduleStatus();
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        let html = `<div class="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">${dateStr}</div>`;
        let hasAlert = false;

        if (status.type === 'ongoing' && status.current.subject !== 'Lunch Break') {
            hasAlert = true;
            html += `<div class="notif-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-icc" data-nav="nav-attendance"><div class="flex gap-3 items-start"><div class="w-9 h-9 bg-icc-light rounded-full flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-chalkboard-teacher text-icc text-sm"></i></div><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5"><p class="text-xs font-bold text-gray-800">Class in Session</p><div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span class="text-[9px] font-black text-green-600 uppercase">Live</span></div></div><p class="text-[12px] font-bold text-icc">${status.current.subject}</p><p class="text-[10px] text-gray-400 mt-0.5">${formatTime12(status.current.time)}–${formatTime12(status.current.endTime)} • ${status.current.room}</p><p class="text-[10px] text-gray-500 mt-0.5">${status.current.teacher}</p></div></div></div>`;
            if (status.next && status.next.subject !== 'Lunch Break') html += `<div class="notif-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50" data-nav="nav-attendance"><div class="flex gap-3 items-start"><div class="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-forward text-gray-400 text-xs"></i></div><div class="flex-1 min-w-0"><p class="text-[10px] text-gray-500 font-medium">Up Next</p><p class="text-[12px] font-bold text-gray-800">${status.next.subject}</p><p class="text-[10px] text-gray-400">${formatTime12(status.next.time)} • ${status.next.room}</p></div></div></div>`;
        } else if (status.type === 'between' || status.type === 'before') {
            hasAlert = true;
            html += `<div class="notif-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-icc-yellow border-b border-gray-50" data-nav="nav-attendance"><div class="flex gap-3 items-start"><div class="w-9 h-9 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-clock text-yellow-500 text-sm"></i></div><div class="flex-1 min-w-0"><p class="text-xs font-bold text-gray-800">Upcoming Class</p><p class="text-[12px] font-bold text-yellow-700 mt-0.5">${status.next.subject}</p><p class="text-[10px] text-gray-400 mt-0.5">${formatTime12(status.next.time)}–${formatTime12(status.next.endTime)} • ${status.next.room}</p><p class="text-[10px] text-icc font-bold mt-0.5">${status.next.teacher}</p></div></div></div>`;
        } else {
            html += `<div class="px-4 py-8 text-center"><i class="fa-regular fa-moon text-3xl text-gray-200 block mb-2"></i><p class="text-xs text-gray-400">No more classes today</p></div>`;
        }

        // Show feature notifications below the class status area
        html += `<div class="px-4 pt-3 pb-1"><p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Feature Notifications</p>`;
        featureNotifications.forEach(item => {
            html += `<div class="notif-item px-3 py-3 hover:bg-gray-50 cursor-pointer rounded-lg border-b border-gray-50" data-nav="${item.nav}"><div class="flex gap-3"><div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs"><i class="${item.icon}"></i></div><div class="flex-1 min-w-0"><p class="text-xs font-bold text-gray-800">${item.title}</p><p class="text-[10px] text-gray-500 truncate">${item.message}</p></div></div></div>`;
        });

        html += `</div>`;
        notifList.innerHTML = html;

        // keep badge visible if anything to show
        hasAlert = hasAlert || featureNotifications.length > 0;
        if (notifBadge) notifBadge.classList.toggle('hidden', !hasAlert);

        notifList.querySelectorAll('.notif-item[data-nav]').forEach(item => {
            item.addEventListener('click', () => { switchTab(item.dataset.nav); document.getElementById('notifDropdownMenu')?.classList.add('hidden'); });
        });
    }

    // ─── Home Reels ────────────────────────────────────────────
    function renderHomeReels() {
        const container = document.querySelector('.reels-container');
        const prevBtn = document.getElementById('reel-prev'), nextBtn = document.getElementById('reel-next');
        if (!container) return;
        container.innerHTML = '';
        subjectsData.enrolled.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'reel-card';
            card.style.cssText = 'min-width:160px;max-width:185px;height:280px;border-radius:12px;overflow:hidden;position:relative;cursor:pointer;flex-shrink:0;background:#1e293b;box-shadow:0 2px 8px rgba(0,0,0,.2);transition:box-shadow .22s ease,transform .22s ease';
            const overall = Math.round((subject.q1Percent + subject.q2Percent) / 2);
            const barColor = overall >= 80 ? '#22c55e' : overall >= 60 ? '#FFD000' : overall >= 40 ? '#f97316' : '#ef4444';
            const statusText = overall === 0 ? 'Not Started' : overall < 100 ? 'In Progress' : 'Completed';
            card.innerHTML = `
                <img src="${subject.bg}" alt="${subject.text}" class="reel-img" style="width:100%;height:100%;object-fit:cover;object-position:center top;opacity:.7;display:block;transition:opacity .22s ease">
                <!-- base gradient + title always visible -->
                <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,0) 55%);display:flex;flex-direction:column;justify-content:flex-end;padding:1rem 1rem 1.1rem">
                    <p class="reel-title" style="font-size:15px;font-weight:900;line-height:1.3;color:white;transition:opacity .18s ease">${subject.text}</p>
                </div>
                <!-- hover overlay: slides up from bottom, frosted dark, no border -->
                <div class="reel-hover-overlay" style="position:absolute;left:0;right:0;bottom:0;padding:1rem;background:rgba(0,0,0,0.74);backdrop-filter:blur(8px);border-radius:0 0 12px 12px;transform:translateY(100%);transition:transform .2s ease">
                    <p style="font-size:15px;font-weight:900;color:white;line-height:1.3;margin-bottom:8px">${subject.text}</p>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
                        <div style="flex:1;height:4px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden">
                            <div style="height:100%;width:${overall}%;background:${barColor};border-radius:4px"></div>
                        </div>
                        <span style="font-size:12px;font-weight:900;color:${barColor}">${overall}%</span>
                    </div>
                    <p style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.38);text-transform:uppercase;letter-spacing:.06em">${statusText}</p>
                </div>
            `;
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = '0 10px 28px rgba(0,0,0,0.40)';
                card.style.transform = 'translateY(-3px)';
                card.querySelector('.reel-img').style.opacity = '.85';
                card.querySelector('.reel-hover-overlay').style.transform = 'translateY(0)';
                card.querySelector('.reel-title').style.opacity = '0';
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,.2)';
                card.style.transform = '';
                card.querySelector('.reel-img').style.opacity = '.7';
                card.querySelector('.reel-hover-overlay').style.transform = 'translateY(100%)';
                card.querySelector('.reel-title').style.opacity = '1';
            });
            card.addEventListener('click', () => scrollToSubjectCard(subject.id));
            container.appendChild(card);
        });
        const updateNav = () => {
            const sl = container.scrollLeft, max = container.scrollWidth - container.offsetWidth;
            if (prevBtn) sl <= 5 ? prevBtn.classList.remove('visible') : prevBtn.classList.add('visible');
            if (nextBtn) sl >= max - 5 ? nextBtn.classList.remove('visible') : nextBtn.classList.add('visible');
        };
        container.addEventListener('scroll', updateNav);
        window.addEventListener('resize', updateNav);
        if (prevBtn) prevBtn.onclick = () => container.scrollBy({ left: -220, behavior: 'smooth' });
        if (nextBtn) nextBtn.onclick = () => container.scrollBy({ left: 220, behavior: 'smooth' });
        setTimeout(updateNav, 300);
    }

    function scrollToSubjectCard(subjectId) {
        switchTab('nav-courses');
        setTimeout(() => {
            const card = document.getElementById(subjectId);
            if (card) {
                window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
                card.style.outline = '3px solid #FFD000';
                card.style.outlineOffset = '-3px';
                setTimeout(() => { card.style.outline = ''; card.style.outlineOffset = ''; }, 1800);
            }
        }, 120);
    }

    // ─── Subject Lists: bar = (q1Percent + q2Percent) / 2 ─────
    function renderSubjectLists() {
        const enrolledContainer = document.getElementById('enrolled-subjects-list');
        const completedContainer = document.getElementById('completed-subjects-list');

        if (enrolledContainer) {
            enrolledContainer.innerHTML = '';
            subjectsData.enrolled.forEach(subject => {
                // Overall = average of Q1 + Q2
                const overall = Math.round((subject.q1Percent + subject.q2Percent) / 2);
                const card = document.createElement('div');
                card.id = subject.id;
                card.className = 'subject-card-wide group cursor-pointer';
                card.setAttribute('data-subject', subject.text);
                card.innerHTML = `
                    <img src="${subject.bg}" alt="${subject.text}" class="subject-card-book-img">
                    <div class="subject-card-body">
                        <h4 class="font-bold text-gray-800 group-hover:text-icc-yellow text-xl leading-tight mb-3">${subject.text}</h4>
                        <p class="text-sm text-gray-700 font-medium leading-relaxed" style="max-width:600px;text-align:justify">${subject.summary}</p>
                    </div>
                    <div class="subject-card-right">
                        <div class="text-right" style="align-self:flex-start;padding-top:1.5rem">
                            <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Instructor</p>
                            <p class="text-xs font-bold text-gray-600">${subject.instructor}</p>
                        </div>
                        <div class="flex flex-col items-center gap-1">
                            <span class="text-xs font-black text-gray-800">${overall}%</span>
                            <p class="text-[8px] text-gray-400 font-bold uppercase">Overall</p>
                            <div class="subject-card-vbar">
                                <div class="subject-card-vbar-fill" style="height:${overall}%"></div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-gray-300 text-base group-hover:text-icc-yellow transition-colors"></i>
                    </div>
                `;
                card.addEventListener('click', () => switchToTopicPage(subject.id));
                enrolledContainer.appendChild(card);
            });
        }

        if (completedContainer) {
            completedContainer.innerHTML = '';
            subjectsData.completed.forEach(subject => {
                const overall = Math.round(((subject.q1Percent || 100) + (subject.q2Percent || 100)) / 2);
                const card = document.createElement('div');
                card.id = subject.id;
                card.className = 'subject-card-wide group cursor-pointer bg-gray-50/50';
                card.setAttribute('data-subject', subject.text);
                card.innerHTML = `
                    <img src="${subject.bg}" alt="${subject.text}" class="subject-card-book-img">
                    <div class="subject-card-body">
                        <h4 class="font-bold text-gray-800 group-hover:text-icc-yellow text-sm leading-tight mb-1">${subject.text}</h4>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${subject.subtitle || ''}</p>
                    </div>
                    <div class="subject-card-right">
                        <div class="text-right">
                            <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Final Grade</p>
                            <p class="text-xs font-bold text-icc">${subject.grade}</p>
                        </div>
                        <div class="flex flex-col items-center gap-1">
                            <span class="text-xs font-black text-gray-800">${overall}%</span>
                            <div class="subject-card-vbar"><div class="subject-card-vbar-fill bg-icc" style="height:${overall}%"></div></div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-gray-300 text-base group-hover:text-icc-yellow transition-colors"></i>
                    </div>
                `;
                card.addEventListener('click', () => switchToTopicPage(subject.id));
                completedContainer.appendChild(card);
            });
        }
    }

    // ─── Calendar ──────────────────────────────────────────────
    const calendarSchedule = {
        "20-3-2026": { events: [{ name: "Technical Audit Session", time: "10:00 AM • Lab 1", link: "#" }], tasks: [{ name: "Physics Problem Set #4", time: "Due 11:59 PM" }], notes: "Please finalize the audit documentation before the meeting." },
        "22-3-2026": { events: [{ name: "Biology Midterms", time: "1:30 PM • Main Hall", link: "#" }], tasks: [{ name: "Pre-Calculus Quiz Review", time: "9:00 AM" }] },
        "25-3-2026": { notes: "Holiday - No classes scheduled." },
        "26-3-2026": { events: [{ name: "Advanced Physics Lab", time: "2:00 PM • Lab 4", link: "#" }], tasks: [{ name: "Lab Report Draft", time: "Due Midnight" }] }
    };

    function initCalendar() {
        const monthYearEl = document.getElementById('calendar-month-year');
        const daysGridEl = document.getElementById('calendar-days-grid');
        const prevBtn = document.getElementById('prevMonthBtn'), nextBtn = document.getElementById('nextMonthBtn');
        const eventPanel = document.getElementById('calendar-event-panel'), eventContent = document.getElementById('calendar-event-content');
        if (!monthYearEl || !daysGridEl) return;
        let calDate = new Date(), stickyKey = null;

        function updateEventPanel(day, month, year) {
            if (!eventPanel || !eventContent) return;
            const key = `${day}-${month + 1}-${year}`, data = calendarSchedule[key];
            if (!data || (!data.events && !data.tasks && !data.notes)) { eventPanel.classList.add('hidden'); return; }
            let html = '';
            if (data.events?.length) { html += `<div><p class="text-[9px] text-icc-yellow font-black uppercase tracking-widest mb-2.5"><i class="fa-solid fa-calendar-star mr-1.5"></i> EVENTS</p><div class="space-y-3">`; data.events.forEach(e => { html += `<div class="flex items-center justify-between"><div><p class="text-xs font-bold text-gray-800">${e.name}</p><p class="text-[10px] text-gray-400">${e.time}</p></div><a href="${e.link}" class="px-3 py-1 bg-icc/10 text-icc text-[10px] font-black rounded-lg">GO</a></div>`; }); html += `</div></div>`; }
            if (data.tasks?.length) { if (html) html += '<div class="border-t border-gray-200 my-4"></div>'; html += `<div><p class="text-[9px] text-icc font-black uppercase tracking-widest mb-2.5"><i class="fa-solid fa-list-check mr-1.5"></i> TASKS</p><div class="space-y-2.5">`; data.tasks.forEach(t => { html += `<div><p class="text-xs font-bold text-gray-700">${t.name}</p><p class="text-[9px] ${t.time.includes('Due') ? 'text-red-500 font-bold' : 'text-gray-400'}">${t.time}</p></div>`; }); html += `</div></div>`; }
            if (data.notes) { if (html) html += '<div class="border-t border-gray-200 my-4"></div>'; html += `<div><p class="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2.5"><i class="fa-solid fa-note-sticky mr-1.5"></i> NOTES</p><div class="bg-white/50 border border-gray-100 p-3 rounded-xl"><p class="text-[11px] text-gray-600 italic">"${data.notes}"</p></div></div>`; }
            eventContent.innerHTML = html; eventPanel.classList.remove('hidden');
        }

        function applyDayStyle(el, state) {
            if (state === 'today') { el.style.setProperty('background-color', '#15803d', 'important'); el.style.setProperty('color', 'white', 'important'); }
            else if (state === 'active') { el.style.setProperty('background-color', '#FFD000', 'important'); el.style.setProperty('color', '#1e293b', 'important'); }
            else { el.style.setProperty('background-color', 'transparent', 'important'); el.style.setProperty('color', '', ''); }
            el.style.borderRadius = '8px';
        }

        function renderCalendar() {
            daysGridEl.innerHTML = '';
            const month = calDate.getMonth(), year = calDate.getFullYear();
            monthYearEl.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
            const td = new Date(), tDate = td.getDate(), tMonth = td.getMonth(), tYear = td.getFullYear();
            const isToday = d => d === tDate && month === tMonth && year === tYear;
            for (let i = 0; i < firstDay; i++) { const e = document.createElement('div'); e.className = 'py-2'; daysGridEl.appendChild(e); }
            for (let d = 1; d <= daysInMonth; d++) {
                const div = document.createElement('div');
                div.className = 'calendar-day text-xs font-bold py-2 cursor-pointer rounded-lg text-center';
                const dateKey = `${d}-${month + 1}-${year}`, data = calendarSchedule[dateKey];
                div.innerHTML = `<span>${d}</span>`;
                if (isToday(d)) { applyDayStyle(div, 'today'); updateEventPanel(d, month, year); }
                if (data) { const dr = document.createElement('div'); dr.className = 'flex justify-center gap-[2px] mt-[1px]'; if (data.events?.length) { const dot = document.createElement('div'); dot.className = 'w-[3px] h-[3px] rounded-full bg-icc-yellow'; dr.appendChild(dot); } if (data.tasks?.length) { const dot = document.createElement('div'); dot.className = 'w-[3px] h-[3px] rounded-full bg-icc'; dr.appendChild(dot); } if (data.notes) { const dot = document.createElement('div'); dot.className = 'w-[3px] h-[3px] rounded-full bg-gray-400'; dr.appendChild(dot); } div.appendChild(dr); }
                div.addEventListener('mouseenter', () => { document.querySelectorAll('.calendar-day').forEach(x => applyDayStyle(x, isToday(parseInt(x.textContent)) ? 'today' : 'none')); applyDayStyle(div, 'active'); if (data) updateEventPanel(d, month, year); });
                div.addEventListener('mouseleave', () => { document.querySelectorAll('.calendar-day').forEach(x => applyDayStyle(x, isToday(parseInt(x.textContent)) ? 'today' : 'none')); if (stickyKey) { const [sd, sm, sy] = stickyKey.split('-').map(Number); const sEl = Array.from(document.querySelectorAll('.calendar-day')).find(x => parseInt(x.textContent) === sd); if (sEl) { applyDayStyle(sEl, 'active'); updateEventPanel(sd, sm - 1, sy); } } else updateEventPanel(tDate, tMonth, tYear); });
                div.addEventListener('click', () => { if (data) stickyKey = (stickyKey === dateKey) ? null : dateKey; });
                daysGridEl.appendChild(div);
            }
        }
        if (prevBtn) prevBtn.onclick = () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); };
        if (nextBtn) nextBtn.onclick = () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); };
        renderCalendar();
    }

    // ─── SIGMA AI ──────────────────────────────────────────────
    const sigmaAiBtn = document.getElementById('sigmaAiBtn');
    const sigmaAiPanel = document.getElementById('sigmaAiPanel');
    const sigmaAiCloseBtn = document.getElementById('sigmaAiCloseBtn');
    const sigmaAiExpandBtn = document.getElementById('sigmaAiExpandBtn');
    const sigmaAiMessages = document.getElementById('sigmaAiMessages');
    const sigmaAiInput = document.getElementById('sigmaAiInput');
    const sigmaAiSendBtn = document.getElementById('sigmaAiSendBtn');
    const WELCOME_MSG = `Hello, <strong>Stanley!</strong> I'm <span class="font-black">SIGMA AI</span>, your academic assistant. What do you need today?`;

    function addAiMessage(content, isUser = false) {
        const msg = document.createElement('div');
        msg.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
        msg.innerHTML = `${!isUser ? `<div class="w-7 h-7 rounded-lg bg-icc flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fa-solid fa-bolt text-icc-yellow text-[10px]"></i></div>` : ''}<div class="max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${isUser ? 'bg-icc text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'}">${content}</div>${isUser ? `<div class="w-7 h-7 rounded-lg bg-icc-light flex items-center justify-center flex-shrink-0 mt-0.5 text-icc text-[10px] font-black">SG</div>` : ''}`;
        sigmaAiMessages.appendChild(msg);
        sigmaAiMessages.scrollTop = sigmaAiMessages.scrollHeight;
    }
    function openAiPanel() { sigmaAiPanel.classList.remove('hidden'); sigmaAiPanel.classList.add('flex'); sigmaAiBtn.classList.add('hidden'); sessionStorage.setItem('sigmaPanelOpen', 'true'); }
    function closeAiPanel() { sigmaAiPanel.classList.add('hidden'); sigmaAiPanel.classList.remove('flex'); sigmaAiBtn.classList.remove('hidden'); sessionStorage.setItem('sigmaPanelOpen', 'false'); }
    if (sigmaAiBtn) sigmaAiBtn.addEventListener('click', openAiPanel);
    if (sigmaAiCloseBtn) sigmaAiCloseBtn.addEventListener('click', closeAiPanel);
    if (sigmaAiExpandBtn) sigmaAiExpandBtn.addEventListener('click', closeAiPanel);
    document.querySelectorAll('.sigma-chip').forEach(chip => { chip.addEventListener('click', () => { addAiMessage(chip.textContent.trim(), true); setTimeout(() => addAiMessage('Full AI integration coming soon!', false), 600); }); });
    function sendAiMessage() { const v = sigmaAiInput?.value.trim(); if (!v) return; addAiMessage(v, true); sigmaAiInput.value = ''; setTimeout(() => addAiMessage('Wireframe mode — Gemini AI coming next semester.', false), 600); }
    if (sigmaAiSendBtn) sigmaAiSendBtn.addEventListener('click', sendAiMessage);
    if (sigmaAiInput) sigmaAiInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendAiMessage(); });
    const isFirstVisit = sessionStorage.getItem('sigmaFirstVisit') !== 'true';
    const panelWasOpen = sessionStorage.getItem('sigmaPanelOpen') === 'true';
    if (isFirstVisit) { sessionStorage.setItem('sigmaFirstVisit', 'true'); setTimeout(() => { openAiPanel(); addAiMessage(WELCOME_MSG, false); }, 900); }
    else if (panelWasOpen) openAiPanel();

    // ─── Sub-Sidebar (Subjects list) ───────────────────────────
    function updateSubSidebar(tabId) {
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        if (!content) return;
        // Hide header on subjects list — no redundancy
        if (header) header.classList.add('hidden');
        content.innerHTML = '';

        if (tabId === 'nav-courses' || tabId === 'nav-notes') {
            // No header text — clear title and hide header, just add top spacer
            if (title) title.innerHTML = '';
            if (header) header.classList.add('hidden');
            content.style.paddingTop = '8px';
            const renderGroup = (label, items, isOpen = true) => {
                const sorted = [...items].sort((a, b) => a.text.localeCompare(b.text));
                const g = document.createElement('div');
                g.className = `sub-nav-group ${isOpen ? 'active' : ''}`;
                g.innerHTML = `
                    <div class="sub-nav-group-header flex items-center justify-between cursor-pointer select-none">
                        <span class="group-label">${label}</span>
                        <i class="fa-solid fa-chevron-right text-[8px] transition-transform"></i>
                    </div>
                    <div class="sub-nav-items space-y-1 mt-1 pb-4">
                        ${sorted.map(item => `<a href="#" data-scroll-to="${item.id}" class="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:text-icc"><i class="${item.icon} text-center w-4 text-gray-400"></i><span>${item.text}</span></a>`).join('')}
                    </div>
                `;
                g.querySelector('.sub-nav-group-header').addEventListener('click', () => g.classList.toggle('active'));
                g.querySelectorAll('[data-scroll-to]').forEach(l => l.addEventListener('click', e => { e.preventDefault(); scrollToSubjectCard(l.dataset.scrollTo); }));
                content.appendChild(g);
            };
            renderGroup('Enrolled', subjectsData.enrolled, true);
            renderGroup('Completed', subjectsData.completed, false);
        } else if (tabId === 'nav-assignments') {
            title.textContent = 'Subjects';
            if (header) header.classList.remove('hidden');
            
            // Get unique subjects from assessments
            const assessmentRows = document.querySelectorAll('#assessments-body tr');
            const subjects = [...new Set(Array.from(assessmentRows).map(row => row.dataset.subject).filter(Boolean))];
            
            content.innerHTML = `
                <div class="px-2 space-y-1">
                    <button class="subject-filter w-full text-left px-4 py-2.5 text-[12px] font-bold text-icc rounded-lg bg-icc/5 hover:bg-icc/10 transition-all" data-subject="all">
                        All Subjects
                    </button>
                    ${subjects.map(subject => `
                        <button class="subject-filter w-full text-left px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all" data-subject="${subject}">
                            ${subject}
                        </button>
                    `).join('')}
                </div>
            `;
            
            // Add click listeners to filter assessments
            content.querySelectorAll('.subject-filter').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedSubject = btn.dataset.subject;
                    const bodyRows = document.querySelectorAll('#assessments-body tr');
                    
                    // Update button styles
                    content.querySelectorAll('.subject-filter').forEach(b => {
                        b.classList.remove('bg-icc/5', 'text-icc', 'font-bold');
                        b.classList.add('text-gray-600', 'font-medium');
                    });
                    btn.classList.add('bg-icc/5', 'text-icc', 'font-bold');
                    btn.classList.remove('text-gray-600', 'font-medium');
                    
                    // Filter rows
                    bodyRows.forEach(row => {
                        if (selectedSubject === 'all') {
                            row.style.display = '';
                        } else {
                            row.style.display = row.dataset.subject === selectedSubject ? '' : 'none';
                        }
                    });
                });
            });
        } else if (tabId === 'nav-mail') {
            title.textContent = 'Mail';
            content.innerHTML = `<div class="px-2 pt-2 space-y-1"><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-icc rounded-lg bg-icc/5"><i class="fa-solid fa-inbox w-4 text-center"></i>Inbox<span class="ml-auto text-[10px] font-black text-white bg-icc px-1.5 py-0.5 rounded-full">2</span></a><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg"><i class="fa-solid fa-paper-plane w-4 text-center"></i>Sent</a><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg"><i class="fa-regular fa-file w-4 text-center"></i>Drafts</a><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg"><i class="fa-solid fa-trash w-4 text-center"></i>Trash</a></div>`;
        }
    }

    // ─── Sub-sidebar topic mode (no animation — instant swap) ──
    function loadTopicSubSidebar(subject, data, statusIconClass) {
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        if (!content || !title) return;
        if (header) header.classList.remove('hidden');

        const q1Done = data.q1Topics.filter(t => t.status === 'completed').length;
        const q1Total = data.q1Topics.length;

        title.innerHTML = `<button id="topicSideBackBtn" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-all mr-2"><i class="fa-solid fa-arrow-left text-xs text-gray-700"></i></button><span class="truncate">${subject.text}</span>`;

        content.innerHTML = `
            <div class="px-4 pt-4 pb-2">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Topics</p>
                <p class="text-sm font-bold text-gray-700">${q1Done}/${q1Total} completed</p>
            </div>
            <div class="px-2 space-y-0.5 pb-4">
                ${data.q1Topics.map((t, i) => `
                    <button class="topic-nav-item w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-icc flex items-center gap-2.5 transition-colors" data-topic-idx="${i}">
                        <i class="fa-solid ${statusIconClass[t.status]} text-xs flex-shrink-0"></i>
                        <span class="truncate">${t.title}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Back button → restore subjects list and go back in history
        document.getElementById('topicSideBackBtn')?.addEventListener('click', () => history.back());

        // Nav items scroll to topic card in main content
        content.querySelectorAll('.topic-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const list = document.getElementById('q1-topics-list');
                const idx = parseInt(item.dataset.topicIdx);
                if (list?.children[idx]) {
                    list.children[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ─── Subject Details ───────────────────────────────────────
    const subjectDetails = {
        'card-prog1': { bg: 'image/book1.jpg', q1Percent: 80, q2Percent: 0, q1Topics: [{ title: 'Introduction to Java', status: 'completed', grades: { quiz: 92, assignment: 88, activity: 95, performance: 90 } }, { title: 'Variables & Data Types', status: 'completed', grades: { quiz: 85, assignment: 90, activity: 88, performance: 87 } }, { title: 'Control Structures', status: 'completed', grades: { quiz: 78, assignment: 82, activity: 80, performance: 84 } }, { title: 'Methods & Functions', status: 'in-progress', grades: { quiz: 0, assignment: 75, activity: 0, performance: 0 } }, { title: 'Arrays & Collections', status: 'not-started', grades: null }, { title: 'Object-Oriented Programming', status: 'not-started', grades: null }] },
        'card-webdev': { bg: 'image/book2.jpg', q1Percent: 67, q2Percent: 0, q1Topics: [{ title: 'HTML5 Fundamentals', status: 'completed', grades: { quiz: 95, assignment: 92, activity: 90, performance: 93 } }, { title: 'CSS3 & Flexbox', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 90, performance: 87 } }, { title: 'CSS Grid Layout', status: 'completed', grades: { quiz: 82, assignment: 80, activity: 85, performance: 83 } }, { title: 'Responsive Design', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 92, performance: 91 } }, { title: 'JavaScript Basics', status: 'in-progress', grades: { quiz: 0, assignment: 78, activity: 0, performance: 0 } }, { title: 'DOM Manipulation', status: 'not-started', grades: null }] },
        'card-sysarch': { bg: 'image/book3.jpg', q1Percent: 50, q2Percent: 0, q1Topics: [{ title: 'Number Systems & Binary', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 90, performance: 87 } }, { title: 'CPU Architecture', status: 'completed', grades: { quiz: 82, assignment: 80, activity: 78, performance: 83 } }, { title: 'Memory Hierarchy', status: 'in-progress', grades: { quiz: 0, assignment: 70, activity: 0, performance: 0 } }, { title: 'Input/Output Systems', status: 'not-started', grades: null }, { title: 'Instruction Set Architecture', status: 'not-started', grades: null }] },
        'card-empowerment': { bg: 'image/book4.jpg', q1Percent: 20, q2Percent: 0, q1Topics: [{ title: 'Digital Literacy Overview', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 92, performance: 89 } }, { title: 'Online Safety & Privacy', status: 'in-progress', grades: { quiz: 0, assignment: 75, activity: 0, performance: 0 } }, { title: 'Social Media Responsibility', status: 'not-started', grades: null }, { title: 'Digital Citizenship', status: 'not-started', grades: null }] },
        'card-networks': { bg: 'image/book5.jpg', q1Percent: 40, q2Percent: 0, q1Topics: [{ title: 'Network Fundamentals', status: 'completed', grades: { quiz: 85, assignment: 82, activity: 88, performance: 84 } }, { title: 'OSI Model', status: 'in-progress', grades: { quiz: 0, assignment: 72, activity: 0, performance: 0 } }, { title: 'IP Addressing & Subnetting', status: 'not-started', grades: null }, { title: 'Network Topologies', status: 'not-started', grades: null }] },
        'card-database': { bg: 'image/book6.jpg', q1Percent: 60, q2Percent: 0, q1Topics: [{ title: 'Database Concepts', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 88, performance: 91 } }, { title: 'Entity-Relationship Diagrams', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 90, performance: 87 } }, { title: 'SQL: DDL & DML', status: 'completed', grades: { quiz: 85, assignment: 82, activity: 86, performance: 84 } }, { title: 'Normalization', status: 'in-progress', grades: { quiz: 0, assignment: 78, activity: 0, performance: 0 } }, { title: 'Joins & Subqueries', status: 'not-started', grades: null }] },
        'card-graphics': { bg: 'image/book7.jpg', q1Percent: 70, q2Percent: 0, q1Topics: [{ title: 'Design Principles', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 94, performance: 91 } }, { title: 'Color Theory', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 92, performance: 89 } }, { title: 'Typography Fundamentals', status: 'completed', grades: { quiz: 85, assignment: 82, activity: 88, performance: 86 } }, { title: 'Layout & Composition', status: 'in-progress', grades: { quiz: 0, assignment: 80, activity: 0, performance: 0 } }, { title: 'Digital Illustration', status: 'not-started', grades: null }] },
        'card-mobile': { bg: 'image/book8.jpg', q1Percent: 30, q2Percent: 0, q1Topics: [{ title: 'Mobile UI/UX Principles', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 90, performance: 87 } }, { title: 'Flutter Basics', status: 'in-progress', grades: { quiz: 0, assignment: 72, activity: 0, performance: 0 } }, { title: 'Widgets & Layouts', status: 'not-started', grades: null }, { title: 'State Management', status: 'not-started', grades: null }] },
        'card-introcomp': { bg: 'image/book4.jpg', q1Percent: 100, q2Percent: 100, q1Topics: [{ title: 'History of Computing', status: 'completed', grades: { quiz: 95, assignment: 92, activity: 90, performance: 94 } }, { title: 'Computer Hardware Components', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 88, performance: 91 } }, { title: 'Operating Systems Basics', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 92, performance: 90 } }, { title: 'Software & Applications', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 90, performance: 87 } }] },
        'card-oralcomm': { bg: 'image/book1.jpg', q1Percent: 100, q2Percent: 100, q1Topics: [{ title: 'Nature & Elements of Communication', status: 'completed', grades: { quiz: 88, assignment: 90, activity: 92, performance: 89 } }, { title: 'Models of Communication', status: 'completed', grades: { quiz: 85, assignment: 88, activity: 90, performance: 87 } }, { title: 'Communication Breakdown', status: 'completed', grades: { quiz: 82, assignment: 85, activity: 88, performance: 84 } }, { title: 'Types of Speech Context', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 92, performance: 91 } }, { title: 'Types of Speech Act', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 90, performance: 88 } }] },
        'card-genmath': { bg: 'image/book2.jpg', q1Percent: 100, q2Percent: 100, q1Topics: [{ title: 'Functions & Their Graphs', status: 'completed', grades: { quiz: 82, assignment: 80, activity: 85, performance: 83 } }, { title: 'Rational Functions', status: 'completed', grades: { quiz: 80, assignment: 78, activity: 82, performance: 80 } }, { title: 'Inverse Functions', status: 'completed', grades: { quiz: 78, assignment: 76, activity: 80, performance: 78 } }, { title: 'Exponential & Logarithmic Functions', status: 'completed', grades: { quiz: 75, assignment: 74, activity: 78, performance: 76 } }, { title: 'Simple & Compound Interest', status: 'completed', grades: { quiz: 85, assignment: 82, activity: 88, performance: 84 } }] },
        'card-animation': { bg: 'image/book3.jpg', q1Percent: 100, q2Percent: 100, q1Topics: [{ title: '12 Principles of Animation', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 94, performance: 92 } }, { title: 'Animation Tools Overview', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 92, performance: 90 } }, { title: 'Keyframing Basics', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 90, performance: 88 } }, { title: 'Character Design Fundamentals', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 95, performance: 93 } }] }
    };

    // ─── Topic Page ────────────────────────────────────────────
    function switchToTopicPage(subjectId) {
        const data = subjectDetails[subjectId];
        const subject = [...subjectsData.enrolled, ...subjectsData.completed].find(s => s.id === subjectId);
        if (!data || !subject) return;
        history.pushState({ page: `topic:${subjectId}` }, '', `#topic-${subjectId}`);
        _buildAndShowTopicPage(subjectId);
    }

    function _buildAndShowTopicPage(subjectId) {
        const data = subjectDetails[subjectId];
        const subject = [...subjectsData.enrolled, ...subjectsData.completed].find(s => s.id === subjectId);
        if (!data || !subject) return;

        const statusIconClass = {
            completed: 'fa-check-circle text-green-500',
            'in-progress': 'fa-circle-half-stroke text-yellow-500',
            'not-started': 'fa-circle text-gray-300',
            locked: 'fa-lock text-gray-300'
        };

        buildTopicPage(subjectId, subject, data, statusIconClass);
        hideAllSections();
        showSection('section-topic-detail');

        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        document.getElementById('nav-courses')?.classList.add('bg-white/20');
        setNavContext('Subjects');

        document.body.classList.add('sidebar-collapsed');
        sidebar.classList.add('sidebar-collapsed');

        _showSubSidebarInstant();
        subSidebar.classList.add('sub-sidebar-visible');
        loadTopicSubSidebar(subject, data, statusIconClass);
        updateLayout();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function buildTopicPage(subjectId, subject, data, statusIconClass) {
        const page = document.getElementById('section-topic-detail');
        if (!page) return;

        const q1Done = data.q1Topics.filter(t => t.status === 'completed').length;
        const q1Total = data.q1Topics.length;
        const q1Pct = data.q1Percent; // use stored q1Percent (matches subject card)
        const q2Pct = data.q2Percent;
        const overallPct = Math.round((q1Pct + q2Pct) / 2);

        const statusLabel = { completed: 'Done', 'in-progress': 'In Progress', 'not-started': 'Not Started', locked: 'Locked' };
        const statusBadgeClass = { completed: 'bg-green-50 text-green-600', 'in-progress': 'bg-yellow-50 text-yellow-700', locked: 'bg-gray-100 text-gray-400', 'not-started': 'bg-red-50 text-red-500' };
        const getTopicImg = i => i === 1 ? 'image/Topic2.jpg' : 'image/Topic.jpg';
        const q1BarColor = q1Pct === 100 ? 'bg-icc' : 'bg-icc-yellow';

        // Grade row per topic
        function renderGradeRow(t, i) {
            if (!t.grades) return '';
            const { quiz, assignment, activity, performance } = t.grades;
            const avg = quiz && activity && performance ? Math.round((quiz + assignment + activity + performance) / 4) : null;
            const gradeCell = (v, label) => v > 0
                ? `<td class="px-3 py-2 text-center text-xs font-bold ${v >= 90 ? 'text-green-600' : v >= 80 ? 'text-icc' : v >= 75 ? 'text-yellow-600' : 'text-red-500'}">${v}</td>`
                : `<td class="px-3 py-2 text-center text-xs text-gray-300 font-medium">—</td>`;
            return `
                <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td class="px-3 py-2.5 text-xs font-bold text-gray-700">${t.title}</td>
                    ${gradeCell(quiz)}
                    ${gradeCell(assignment)}
                    ${gradeCell(activity)}
                    ${gradeCell(performance)}
                    <td class="px-3 py-2 text-center">
                        ${avg !== null ? `<span class="text-xs font-black px-2 py-0.5 rounded-full ${avg >= 90 ? 'bg-green-50 text-green-700' : avg >= 80 ? 'bg-icc-light text-icc' : avg >= 75 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}">${avg}</span>` : '<span class="text-xs text-gray-300">—</span>'}
                    </td>
                </tr>
            `;
        }

        const renderTopicCard = (t, i) => `
            <div class="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden flex transition-all group/tc cursor-pointer hover:border-icc-yellow"
                 onclick="openTopicContent('${subjectId}', ${i})">
                <div class="w-48 h-48 flex-shrink-0 overflow-hidden">
                    <img src="${getTopicImg(i)}" alt="Topic ${i + 1}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 p-6 flex flex-col justify-between min-w-0">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topic ${i + 1}</span>
                            <i class="fa-solid ${statusIconClass[t.status]} text-lg ml-auto"></i>
                        </div>
                        <p class="text-xl font-black text-gray-800 leading-tight group-hover/tc:text-icc-yellow transition-colors">${t.title}</p>
                        <p class="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">${getTopicOverview(t.title)}</p>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-xs font-bold px-3 py-1.5 rounded-full ${statusBadgeClass[t.status]}">${statusLabel[t.status]}</span>
                        <span class="text-xs font-bold text-gray-400 flex items-center gap-1">Open <i class="fa-solid fa-arrow-right text-[10px]"></i></span>
                    </div>
                </div>
            </div>
        `;

        // Compute overall grade from all topics that have grades
        const gradedTopics = data.q1Topics.filter(t => t.grades && t.grades.quiz > 0 && t.grades.activity > 0 && t.grades.performance > 0);
        const overallGrade = gradedTopics.length > 0
            ? Math.round(gradedTopics.reduce((sum, t) => {
                const { quiz, assignment, activity, performance } = t.grades;
                return sum + Math.round((quiz + assignment + activity + performance) / 4);
            }, 0) / gradedTopics.length)
            : null;
        const gradeColor = overallGrade === null ? 'text-gray-400' : overallGrade >= 90 ? 'text-green-600' : overallGrade >= 80 ? 'text-icc' : overallGrade >= 75 ? 'text-yellow-600' : 'text-red-500';

        page.innerHTML = `
            <div class="flex-1 p-8 flex gap-8 min-w-0">
                <!-- Topics list -->
                <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject • ${subject.text}</p>
                    <h1 class="text-5xl font-black text-gray-900 mb-8 tracking-tight">Topics</h1>
                    <div class="space-y-5" id="q1-topics-list">
                        ${data.q1Topics.map((t, i) => renderTopicCard(t, i)).join('')}
                    </div>
                </div>

                <!-- RIGHT: progress panel — aligned with topic cards, not page top -->
                <div class="w-72 flex-shrink-0 flex flex-col gap-4" style="align-self:flex-start;margin-top:96px">
                    <div class="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</p>

                        <!-- Q1 big % -->
                        <div class="text-center py-1">
                            <div class="text-4xl font-black text-gray-900">${q1Pct}%</div>
                            <p class="text-[10px] text-gray-400 mt-1">${q1Done} of ${q1Total} topics done</p>
                        </div>

                        <!-- Q1 bar -->
                        <div>
                            <div class="flex justify-between items-center mb-1.5">
                                <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">1st Quarter</span>
                                <span class="text-[10px] font-black text-gray-900">${q1Pct}%</span>
                            </div>
                            <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full ${q1BarColor} rounded-full transition-all" style="width:${q1Pct}%"></div>
                            </div>
                        </div>

                        <!-- Q2 locked row -->
                        <div class="pt-3 border-t border-gray-100">
                            <div class="flex justify-between items-center">
                                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <i class="fa-solid fa-lock text-[9px]"></i> 2nd Quarter
                                </span>
                                <span class="text-[10px] font-black text-gray-300">${q2Pct}%</span>
                            </div>
                            <p class="text-[9px] text-gray-300 mt-1">Unlocks next quarter</p>
                        </div>
                    </div>

                    <!-- Overall Average panel -->
                    <div class="bg-white border border-gray-100 rounded-2xl p-5 space-y-2">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Grade</p>
                        <div class="text-center py-3">
                            <div class="text-5xl font-black ${gradeColor}">${overallGrade !== null ? overallGrade : '—'}</div>
                            <p class="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">Average</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        page.querySelectorAll('.sigma-topic-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const dialog = btn.closest('.sigma-topic-wrapper').querySelector('.sigma-topic-dialog');
                const typingEl = dialog.querySelector('.sigma-typing-text');
                if (!dialog.classList.contains('hidden')) { dialog.classList.add('hidden'); return; }
                page.querySelectorAll('.sigma-topic-dialog').forEach(d => d.classList.add('hidden'));
                dialog.classList.remove('hidden'); typingEl.textContent = '';
                const msg = `Analyzing: ${btn.dataset.topic}...`;
                let i = 0; const iv = setInterval(() => { if (i < msg.length) typingEl.textContent += msg[i++]; else clearInterval(iv); }, 35);
            });
        });
    }

    function getTopicOverview(title) {
        const o = { 'Introduction to Java': 'Learn Java syntax, data types, and basic program structure.', 'Variables & Data Types': 'Explore how Java stores and manages different kinds of data.', 'Control Structures': 'Master program flow using conditions and loop constructs.', 'Methods & Functions': 'Organize code into reusable blocks using method declarations.', 'Arrays & Collections': 'Work with ordered data using arrays and Java collection classes.', 'Object-Oriented Programming': 'Apply OOP concepts: classes, objects, encapsulation, abstraction.', 'HTML5 Fundamentals': 'Build well-structured web pages using semantic HTML5 elements.', 'CSS3 & Flexbox': 'Style web layouts with modern CSS3 and the flexible box model.', 'Number Systems & Binary': 'Understand binary, octal, hex and their conversions.', 'CPU Architecture': 'Explore how the CPU executes instructions and manages data.' };
        return o[title] || 'This topic covers key concepts and practical applications essential to mastering this subject.';
    }

    // ─── Topic Content System ──────────────────────────────────
    // Tracks current context for topic content pages
    let _tcSubjectId = null, _tcTopicIdx = 0, _tcTab = 'videos';

    // Sample video data per topic (future: from backend)
    const topicVideos = {
        default: [
            { id: 1, title: 'Lecture 1: Introduction & Overview', duration: '24:15', teacher: 'Mr. Alex Reyes', thumb: null, url: '' },
            { id: 2, title: 'Lecture 2: Core Concepts Explained', duration: '18:42', teacher: 'Mr. Alex Reyes', thumb: null, url: '' },
            { id: 3, title: 'Lecture 3: Practical Demonstration', duration: '31:08', teacher: 'Mr. Alex Reyes', thumb: null, url: '' },
        ]
    };

    // Expose globally so onclick in rendered HTML can call it
    window.openTopicContent = function (subjectId, topicIdx, tab = 'videos') {
        _tcSubjectId = subjectId;
        _tcTopicIdx = topicIdx;
        _tcTab = tab;

        const data = subjectDetails[subjectId];
        const subject = [...subjectsData.enrolled, ...subjectsData.completed].find(s => s.id === subjectId);
        if (!data || !subject) return;
        const topic = data.q1Topics[topicIdx];
        if (!topic) return;

        history.pushState({ page: `topic-content:${subjectId}:${topicIdx}:${tab}` }, '', `#tc-${subjectId}-${topicIdx}-${tab}`);
        _showTopicContent(subjectId, topicIdx, tab);
    };

    window.switchTopicTab = function (tab) {
        if (!_tcSubjectId) return;
        _tcTab = tab;
        history.replaceState({ page: `topic-content:${_tcSubjectId}:${_tcTopicIdx}:${tab}` }, '', `#tc-${_tcSubjectId}-${_tcTopicIdx}-${tab}`);
        _renderTopicContentMain(_tcSubjectId, _tcTopicIdx, tab);
        // Update sub-sidebar active item
        document.querySelectorAll('.topic-content-nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.tab === tab);
        });
    };

    function _showTopicContent(subjectId, topicIdx, tab) {
        const data = subjectDetails[subjectId];
        const subject = [...subjectsData.enrolled, ...subjectsData.completed].find(s => s.id === subjectId);
        if (!data || !subject) return;
        const topic = data.q1Topics[topicIdx];

        hideAllSections();
        showSection('section-topic-content');

        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        document.getElementById('nav-courses')?.classList.add('bg-white/20');

        // Nav header = Topics
        setNavContext('Topics');

        document.body.classList.add('sidebar-collapsed');
        sidebar.classList.add('sidebar-collapsed');

        // Sub-sidebar = topic content nav
        _showSubSidebarInstant();
        subSidebar.classList.add('sub-sidebar-visible');
        _buildTopicContentSubSidebar(subject, data, subjectId, topicIdx, tab);
        updateLayout();

        _renderTopicContentMain(subjectId, topicIdx, tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function _buildTopicContentSubSidebar(subject, data, subjectId, topicIdx, tab) {
        const title = document.getElementById('sub-sidebar-title');
        const content = document.getElementById('sub-sidebar-content');
        const header = document.getElementById('sub-sidebar-header');
        if (!title || !content) return;
        if (header) header.classList.remove('hidden');
        const topic = data.q1Topics[topicIdx];

        title.innerHTML = `
            <button onclick="history.back()" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-all mr-2">
                <i class="fa-solid fa-arrow-left text-xs text-gray-700"></i>
            </button>
            <span class="truncate">${topic.title}</span>
        `;

        const navItems = [
            { tab: 'videos', icon: 'fa-solid fa-play-circle', label: 'Videos' },
            { tab: 'handouts', icon: 'fa-solid fa-file-pdf', label: 'Handouts' },
            { tab: 'assignments', icon: 'fa-solid fa-file-pen', label: 'Assignments' },
            { tab: 'quiz', icon: 'fa-solid fa-square-poll-vertical', label: 'Quiz' },
            { tab: 'activity', icon: 'fa-solid fa-flask', label: 'Activity' },
            { tab: 'performance', icon: 'fa-solid fa-star', label: 'Performance Task' },
        ];

        content.innerHTML = `
            <div class="px-2 pt-3 space-y-0.5">
                ${navItems.map(item => `
                    <button class="topic-content-nav-item ${tab === item.tab ? 'active' : ''}" data-tab="${item.tab}"
                        onclick="switchTopicTab('${item.tab}')">
                        <i class="${item.icon} text-sm"></i>
                        <span>${item.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    function _renderTopicContentMain(subjectId, topicIdx, tab) {
        const page = document.getElementById('section-topic-content');
        if (!page) return;
        const data = subjectDetails[subjectId];
        const subject = [...subjectsData.enrolled, ...subjectsData.completed].find(s => s.id === subjectId);
        const topic = data.q1Topics[topicIdx];

        const assessmentTabs = ['assignments', 'quiz', 'activity', 'performance'];
        const isAssessment = assessmentTabs.includes(tab);

        // Main content by tab — no right panel on any tab

        // Main content by tab
        let mainContent = '';
        if (tab === 'videos') mainContent = _buildVideosTab(subject, topic, subjectId, topicIdx);
        else if (tab === 'handouts') mainContent = _buildHandoutsTab(subject, topic, subjectId, topicIdx);
        else if (isAssessment) mainContent = _buildAssessmentTab(tab, subject, topic, data);
        else mainContent = _buildComingSoonTab(tab, subject, topic);

        page.innerHTML = isAssessment
            ? `<div class="flex-1 p-8 min-w-0">${mainContent}</div>`
            : `<div class="flex-1 p-8 min-w-0">${mainContent}</div>`;

        if (tab === 'videos') _attachVideoHandlers();
    }

    // ─── Tab linear navigation helper ─────────────────────────
    const TAB_ORDER = ['videos', 'handouts', 'assignments', 'quiz', 'activity', 'performance'];
    const TAB_LABELS = { videos: 'Videos', handouts: 'Handouts', assignments: 'Assignments', quiz: 'Quiz', activity: 'Activity', performance: 'Performance Task' };

    function _tabNav(currentTab) {
        const idx = TAB_ORDER.indexOf(currentTab);
        const prev = idx > 0 ? TAB_ORDER[idx - 1] : null;
        const next = idx < TAB_ORDER.length - 1 ? TAB_ORDER[idx + 1] : null;
        return `
            <div class="flex items-center gap-2">
                ${prev ? `
                <button onclick="switchTopicTab('${prev}')"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 text-xs font-bold transition-all">
                    <i class="fa-solid fa-chevron-left text-[10px]"></i> ${TAB_LABELS[prev]}
                </button>` : ''}
                ${next ? `
                <button onclick="switchTopicTab('${next}')"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-icc hover:bg-icc-dark text-white text-xs font-bold transition-all shadow-sm">
                    ${TAB_LABELS[next]} <i class="fa-solid fa-chevron-right text-[10px]"></i>
                </button>` : ''}
            </div>
        `;
    }

    // ─── VIDEOS TAB ────────────────────────────────────────────
    function _buildVideosTab(subject, topic, subjectId, topicIdx) {
        const videos = topicVideos[`${subjectId}-${topicIdx}`] || topicVideos.default;
        const first = videos[0];

        const playlistItems = videos.map((v, i) => `
            <div class="video-playlist-item ${i === 0 ? 'active' : ''}" data-video-idx="${i}">
                <div class="thumb bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0" style="width:80px;height:52px;">
                    <i class="fa-solid fa-play text-white/60 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-gray-800 leading-tight line-clamp-2">${v.title}</p>
                    <p class="text-[10px] text-gray-400 mt-1">${v.duration} • ${v.teacher}</p>
                </div>
                ${i === 0 ? '<span class="text-[9px] font-black text-icc bg-icc-light px-2 py-0.5 rounded-full flex-shrink-0">Playing</span>' : ''}
            </div>
        `).join('');

        return `
            <!-- Page header -->
            <div class="flex items-start justify-between mb-6">
                <div>
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject • ${subject.text} • ${topic.title}</p>
                    <h1 class="text-4xl font-black text-gray-900 tracking-tight">Videos</h1>
                </div>
                ${_tabNav('videos')}
            </div>

            <!-- Main video player -->
            <div class="bg-gray-900 rounded-2xl overflow-hidden mb-4" style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">
                <div class="text-center text-white/40">
                    <i class="fa-solid fa-play-circle text-6xl mb-3 block"></i>
                    <p class="text-sm font-bold" id="video-title-display">${first.title}</p>
                    <p class="text-xs mt-1 text-white/30" id="video-teacher-display">${first.teacher} • ${first.duration}</p>
                    <p class="text-[10px] mt-4 text-white/20">Video player — connect to backend to stream</p>
                </div>
            </div>

            <!-- Now playing label -->
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Now Playing</p>
                    <p class="text-base font-black text-gray-800 mt-0.5" id="now-playing-title">${first.title}</p>
                </div>
                <span class="text-[10px] font-black text-gray-400" id="now-playing-duration">${first.duration}</span>
            </div>

            <!-- Playlist -->
            <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p class="text-xs font-black text-gray-800 uppercase tracking-widest">More Videos</p>
                    <span class="text-[10px] text-gray-400 font-bold">${videos.length} videos</span>
                </div>
                <div class="divide-y divide-gray-50 p-2" id="video-playlist">
                    ${playlistItems}
                </div>
            </div>
        `;
    }

    function _attachVideoHandlers() {
        const videos = topicVideos[`${_tcSubjectId}-${_tcTopicIdx}`] || topicVideos.default;
        document.querySelectorAll('.video-playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.videoIdx);
                const v = videos[idx];
                // Update active state
                document.querySelectorAll('.video-playlist-item').forEach(el => {
                    el.classList.remove('active');
                    const badge = el.querySelector('span.bg-icc-light');
                    if (badge) badge.remove();
                });
                item.classList.add('active');
                // Update player info
                document.getElementById('video-title-display').textContent = v.title;
                document.getElementById('video-teacher-display').textContent = `${v.teacher} • ${v.duration}`;
                document.getElementById('now-playing-title').textContent = v.title;
                document.getElementById('now-playing-duration').textContent = v.duration;
            });
        });
    }

    // ─── HANDOUTS TAB ─────────────────────────────────────────
    function _buildHandoutsTab(subject, topic, subjectId, topicIdx) {
        const handouts = topicHandouts[`${subjectId}-${topicIdx}`] || topicHandouts.default;

        const handoutCards = handouts.map((h, i) => `
            <!-- AI panel — hidden by default, shown above the card -->
            <div id="ai-panel-${i}" class="hidden mb-2 rounded-2xl overflow-hidden" style="background:linear-gradient(135deg,#0f2027,#15803d);border:1px solid rgba(255,255,255,0.08)">
                <div class="p-4 flex items-start gap-3">
                    <div class="w-9 h-9 bg-icc-yellow rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <i class="fa-solid fa-bolt text-gray-900 text-base"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-black text-white/50 uppercase tracking-widest mb-1">SIGMA AI · About this handout</p>
                        <p class="text-sm font-black text-white leading-snug mb-1">${h.title}</p>
                        <p class="text-[11px] text-white/60 leading-relaxed">This handout covers key concepts from <strong class="text-white/80">${topic.title}</strong>. It contains ${h.pages} pages of reference material uploaded by ${h.uploader}. Use this alongside your class lectures for deeper understanding.</p>
                        <div class="flex items-center gap-3 mt-2.5">
                            <span class="text-[10px] font-bold text-white/40">${h.pages} pages</span>
                            <span class="text-white/20">•</span>
                            <span class="text-[10px] font-bold text-white/40">${h.size}</span>
                            <span class="text-white/20">•</span>
                            <span class="text-[10px] font-bold text-icc-yellow/80">AI-generated summary</span>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation();toggleHandoutAiPanel(${i})" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-all">
                        <i class="fa-solid fa-xmark text-white/60 text-xs"></i>
                    </button>
                </div>
            </div>

            <!-- Handout card — entire card clickable for preview, bolt stops propagation -->
            <div class="handout-card bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer"
                 id="handout-card-${i}"
                 onclick="openHandoutModal(${i},'${subjectId}',${topicIdx})">
                <div class="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-file-pdf text-red-500 text-3xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-gray-800 leading-tight">${h.title}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">${h.pages} pages • ${h.size} • Uploaded by ${h.uploader}</p>
                </div>
                <!-- Only bolt button — no download -->
                <button onclick="event.stopPropagation();toggleHandoutAiPanel(${i})"
                    title="SIGMA AI Summary"
                    class="w-12 h-12 rounded-xl bg-icc hover:bg-icc-dark flex items-center justify-center transition-all shadow-sm flex-shrink-0">
                    <i class="fa-solid fa-bolt text-icc-yellow text-xl"></i>
                </button>
            </div>
        `).join('');

        return `
            <div class="flex items-start justify-between mb-6">
                <div>
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject • ${subject.text} • ${topic.title}</p>
                    <h1 class="text-4xl font-black text-gray-900 tracking-tight">Handouts</h1>
                </div>
                ${_tabNav('handouts')}
            </div>
            <div class="space-y-3" id="handout-list">
                ${handoutCards}
            </div>
        `;
    }

    // Toggle AI panel above a handout card

    // Toggle AI panel above a handout card
    window.toggleHandoutAiPanel = function (idx) {
        const panel = document.getElementById(`ai-panel-${idx}`);
        if (!panel) return;
        panel.classList.toggle('hidden');
    };

    // Open PDF as full-screen browser-layout modal
    window.openHandoutModal = function (idx, subjectId, topicIdx) {
        const handouts = topicHandouts[`${subjectId}-${topicIdx}`] || topicHandouts.default;
        const h = handouts[idx];
        if (!h) return;
        document.getElementById('handout-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'handout-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;background:#404040;';
        const iframeAttr = h.url
            ? `src="${h.url}"`
            : `srcdoc="<html><body style='margin:0;display:flex;align-items:center;justify-content:center;height:100%;background:#f8fafc;font-family:sans-serif;'><div style='text-align:center;color:#94a3b8;'><div style='font-size:72px;margin-bottom:16px'>📄</div><p style='font-size:18px;font-weight:800;color:#374151'>${h.title}</p><p style='font-size:13px;margin-top:8px'>${h.pages} pages • ${h.size}</p><p style='font-size:11px;margin-top:20px;color:#cbd5e1;max-width:340px;line-height:1.6'>PDF will render here once connected to backend.</p></div></body></html>"`;
        modal.innerHTML = `
            <!-- Minimal top bar — just back button and filename -->
            <div style="height:48px;background:#1e1e2e;display:flex;align-items:center;padding:0 16px;gap:14px;flex-shrink:0;">
                <button onclick="document.getElementById('handout-modal').remove()"
                    style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.1);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s"
                    onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    <i class="fa-solid fa-arrow-left" style="color:white;font-size:13px"></i>
                </button>
                <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
                    <i class="fa-solid fa-file-pdf" style="color:#ef4444;font-size:14px;flex-shrink:0"></i>
                    <span style="font-size:13px;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.title}</span>
                    <span style="font-size:11px;color:rgba(255,255,255,0.4);flex-shrink:0">• ${h.pages} pages • ${h.size}</span>
                </div>
                <span style="font-size:11px;color:rgba(255,255,255,0.35);white-space:nowrap;flex-shrink:0">Uploaded by ${h.uploader}</span>
            </div>
            <!-- PDF iframe fills all remaining height — Chrome renders its own toolbar inside -->
            <iframe ${iframeAttr}
                style="flex:1;border:none;width:100%;display:block;background:#404040"
            ></iframe>`;
        document.body.appendChild(modal);
        const esc = e => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); } };
        document.addEventListener('keydown', esc);
    };

    window.toggleHandoutPreview = window.openHandoutModal;
    window.previewHandout = window.openHandoutModal;
    window.closePdfPreview = function () { document.getElementById('handout-modal')?.remove(); };


    // ─── Sample handout data (future: from backend) ────────────
    const topicHandouts = {
        default: [
            { title: 'Lesson Notes — Chapter 1', pages: 12, size: '1.2 MB', uploader: 'Admin', url: '' },
            { title: 'Reference Guide & Glossary', pages: 8, size: '0.8 MB', uploader: 'Admin', url: '' },
            { title: 'Practice Exercises Sheet', pages: 4, size: '0.4 MB', uploader: 'Admin', url: '' },
        ]
    };


    // ─── ASSESSMENT TABS (assignments/quiz/activity/performance) ─
    // Sample assessment data — teacher/admin will populate via backend
    const assessmentData = {
        default: {
            startDate: 'March 20, 2026', startTime: '8:00 AM',
            dueDate: 'March 27, 2026', dueTime: '5:00 PM',
            maxScore: 100, maxAttempts: 3,
            latePermission: true,
            instructionType: 'text', // 'text' or 'pdf'
            instructionPdf: { title: 'Activity Instructions Sheet', pages: 4, size: '0.6 MB', uploader: 'Teacher' },
            submission: null // null = not yet submitted
        }
    };

    function _buildAssessmentTab(tab, subject, topic, data) {
        const labels = { assignments: 'Assignment', quiz: 'Quiz', activity: 'Activity', performance: 'Performance Task' };
        const icons = { assignments: 'fa-file-pen', quiz: 'fa-square-poll-vertical', activity: 'fa-flask', performance: 'fa-star' };
        const iconColors = {
            assignments: 'bg-blue-100 text-blue-600',
            quiz: 'bg-purple-100 text-purple-600',
            activity: 'bg-amber-100 text-amber-600',
            performance: 'bg-icc-light text-icc'
        };
        const label = labels[tab];
        const icon = icons[tab];
        const iconCls = iconColors[tab];

        const gradeKey = { assignments: 'assignment', quiz: 'quiz', activity: 'activity', performance: 'performance' }[tab];
        const gradeVal = topic.grades ? topic.grades[gradeKey] : null;
        const gradeColor = !gradeVal || gradeVal === 0 ? 'text-gray-300'
            : gradeVal >= 90 ? 'text-green-600' : gradeVal >= 80 ? 'text-icc'
                : gradeVal >= 75 ? 'text-yellow-600' : 'text-red-500';
        const gradeLabel = gradeVal && gradeVal > 0 ? gradeVal : '—';
        const gradeRemarks = !gradeVal || gradeVal === 0 ? 'Not yet graded'
            : gradeVal >= 90 ? 'Excellent' : gradeVal >= 80 ? 'Very Good'
                : gradeVal >= 75 ? 'Good' : 'Needs Improvement';

        const instructionTexts = {
            assignments: `Write a structured program in Java that demonstrates the concepts covered in <strong>${topic.title}</strong>. Your code must include proper variable declarations, control structures, and methods. Include comments for each major section. Save your file as <strong>LastName_Assignment.java</strong> and submit via the upload form.`,
            quiz: `Answer all questions in the quiz for <strong>${topic.title}</strong>. This is a closed-book assessment — do not use reference materials unless specified. Each item is worth equal points. Read each question carefully before answering. Once submitted, your responses cannot be changed.`,
            activity: `Complete the hands-on activity for <strong>${topic.title}</strong>. Follow the step-by-step instructions in the provided reference sheet. Document your results with screenshots or written output as required. Submit your completed activity report in PDF format.`,
            performance: `Create a comprehensive output that demonstrates your mastery of <strong>${topic.title}</strong>. Your work will be graded based on accuracy, completeness, creativity, and adherence to the rubric. Review the rubric carefully before starting. Submit all required files before the deadline.`
        };

        const amd = assessmentData.default;
        const isPdf = amd.instructionType === 'pdf';
        const isSubmitted = !!amd.submission;
        const sub = amd.submission;

        const statusBadge = topic.status === 'completed'
            ? `<span class="px-3 py-1.5 text-xs font-black rounded-full bg-green-100 text-green-700 uppercase">Submitted</span>`
            : topic.status === 'in-progress'
                ? `<span class="px-3 py-1.5 text-xs font-black rounded-full bg-yellow-100 text-yellow-700 uppercase">In Progress</span>`
                : `<span class="px-3 py-1.5 text-xs font-black rounded-full bg-gray-100 text-gray-500 uppercase">Not Started</span>`;

        // Instructions block — PDF panel or text
        const instructionBlock = isPdf ? `
            <div id="assess-ai-panel-0" class="hidden mb-3 rounded-2xl overflow-hidden" style="background:linear-gradient(135deg,#0f2027,#15803d);border:1px solid rgba(255,255,255,0.08)">
                <div class="p-4 flex items-start gap-3">
                    <div class="w-9 h-9 bg-icc-yellow rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"><i class="fa-solid fa-bolt text-gray-900 text-base"></i></div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-black text-white/50 uppercase tracking-widest mb-1">SIGMA AI · About this instruction</p>
                        <p class="text-[11px] text-white/60 leading-relaxed">This instruction PDF covers the requirements for <strong class="text-white/80">${label}</strong> in <strong class="text-white/80">${topic.title}</strong>. Review it carefully before starting your work.</p>
                    </div>
                    <button onclick="document.getElementById('assess-ai-panel-0').classList.add('hidden')" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid fa-xmark text-white/60 text-xs"></i>
                    </button>
                </div>
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div class="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-file-pdf text-red-500 text-3xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-base font-black text-gray-900 leading-tight">${amd.instructionPdf.title}</p>
                    <p class="text-sm text-gray-400 mt-0.5">${amd.instructionPdf.pages} pages • ${amd.instructionPdf.size} • By ${amd.instructionPdf.uploader}</p>
                </div>
                <div class="flex items-center gap-2.5 flex-shrink-0">
                    <button onclick="document.getElementById('assess-ai-panel-0').classList.toggle('hidden')" title="SIGMA AI"
                        class="w-11 h-11 rounded-xl bg-icc hover:bg-icc-dark flex items-center justify-center transition-all shadow-sm">
                        <i class="fa-solid fa-bolt text-icc-yellow text-lg"></i>
                    </button>
                    <button title="Download" class="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all">
                        <i class="fa-solid fa-download text-lg"></i>
                    </button>
                </div>
            </div>` : `
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <p class="text-lg font-black text-gray-900 mb-3">Instructions</p>
                <p class="text-base text-gray-800 leading-relaxed font-medium">${instructionTexts[tab]}</p>
            </div>`;

        const barColor = gradeVal && gradeVal >= 90 ? 'bg-green-500'
            : gradeVal && gradeVal >= 80 ? 'bg-icc'
                : gradeVal && gradeVal >= 75 ? 'bg-icc-yellow'
                    : gradeVal && gradeVal > 0 ? 'bg-red-400' : 'bg-gray-200';

        return `
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid ${icon} text-base"></i>
                    </div>
                    <div>
                        <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest">Subject • ${subject.text} • ${topic.title}</p>
                        <h1 class="text-3xl font-black text-gray-900 tracking-tight leading-tight">${label}</h1>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    ${statusBadge}
                    ${_tabNav(tab)}
                </div>
            </div>

            <!-- Two-column layout -->
            <div class="flex gap-6 min-w-0 items-start">

                <!-- LEFT: Instructions first, then Activity Details -->
                <div class="flex-1 min-w-0 space-y-5">

                    ${instructionBlock}

                    <!-- Activity Details: Start, Due, Max Score -->
                    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-gray-100">
                            <p class="text-base font-black text-gray-900">Activity Details</p>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-3 gap-4">
                                <div class="bg-gray-50 rounded-2xl p-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="fa-solid fa-calendar-check text-icc text-sm"></i>
                                        <p class="text-xs font-black text-gray-500 uppercase tracking-widest">Start</p>
                                    </div>
                                    <p class="text-base font-black text-gray-900">${amd.startDate}</p>
                                    <p class="text-sm text-gray-500 font-medium mt-0.5">${amd.startTime}</p>
                                </div>
                                <div class="bg-red-50 rounded-2xl p-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="fa-solid fa-clock text-red-500 text-sm"></i>
                                        <p class="text-xs font-black text-red-400 uppercase tracking-widest">Due</p>
                                    </div>
                                    <p class="text-base font-black text-gray-900">${amd.dueDate}</p>
                                    <p class="text-sm text-red-500 font-bold mt-0.5">${amd.dueTime}</p>
                                </div>
                                <div class="bg-icc-light rounded-2xl p-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="fa-solid fa-star text-icc text-sm"></i>
                                        <p class="text-xs font-black text-icc uppercase tracking-widest">Max Score</p>
                                    </div>
                                    <p class="text-3xl font-black text-icc leading-none">${amd.maxScore}</p>
                                    <p class="text-sm text-icc/60 font-medium mt-1">points</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- RIGHT: Grade + Submission info -->
                <div class="w-64 flex-shrink-0 space-y-4">

                    <!-- Grade panel -->
                    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                        <div class="px-5 py-4 border-b border-gray-100">
                            <p class="text-sm font-black text-gray-900">Your Grade</p>
                        </div>
                        <div class="p-5 text-center">
                            <div class="text-6xl font-black ${gradeColor} mb-1">${gradeLabel}</div>
                            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">out of ${amd.maxScore}</p>
                            <div class="mt-3 h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full rounded-full ${barColor}" style="width:${gradeVal && gradeVal > 0 ? gradeVal : 0}%"></div>
                            </div>
                            <p class="text-xs text-gray-400 mt-1.5 text-right font-medium">${gradeRemarks}</p>
                        </div>
                    </div>

                    <!-- Submission info panel -->
                    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                        <div class="px-5 py-4 border-b border-gray-100">
                            <p class="text-sm font-black text-gray-900">Submission</p>
                        </div>
                        <div class="p-5 space-y-3 text-sm">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500 font-medium">Max Attempts</span>
                                <span class="font-black text-gray-900">${amd.maxAttempts}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500 font-medium">Attempts Used</span>
                                <span class="font-black text-gray-900">${isSubmitted ? '1' : '0'} / ${amd.maxAttempts}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500 font-medium">Late Permission</span>
                                <span class="font-black ${amd.latePermission ? 'text-icc' : 'text-red-500'}">${amd.latePermission ? 'Permitted' : 'Not Allowed'}</span>
                            </div>
                            ${isSubmitted ? `
                            <div class="pt-3 border-t border-gray-100 space-y-2.5">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-500 font-medium">Submitted</span>
                                    <span class="font-black text-gray-900">1 / ${amd.maxAttempts}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 font-medium block">Submitted On</span>
                                    <span class="font-bold text-gray-800">${sub.date}</span>
                                    <span class="text-gray-400 font-medium block text-xs">${sub.time}</span>
                                </div>
                                ${sub.isLate ? `<div class="flex justify-between items-center"><span class="text-gray-500 font-medium">Overdue</span><span class="font-black text-red-500">Yes</span></div>` : ''}
                                <button class="w-full py-2.5 bg-icc-light hover:bg-icc/20 text-icc font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-eye text-sm"></i> View Submission
                                </button>
                            </div>` : `
                            <div class="pt-3 border-t border-gray-100">
                                <p class="text-xs text-gray-400 text-center font-medium">No submission yet.</p>
                            </div>`}
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    function _buildComingSoonTab(tab, subject, topic) {
        const labels = { assignments: 'Assignments', quiz: 'Quiz', activity: 'Activity', performance: 'Performance Task' };
        const icons = { assignments: 'fa-file-pen', quiz: 'fa-square-poll-vertical', activity: 'fa-flask', performance: 'fa-star' };
        const breadcrumb = subject && topic
            ? `<p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject • ${subject.text} • ${topic.title}</p>`
            : '';
        return `
            <div class="flex items-start justify-between mb-6">
                <div>
                    ${breadcrumb}
                    <h1 class="text-4xl font-black text-gray-900 tracking-tight">${labels[tab] || tab}</h1>
                </div>
                ${_tabNav(tab)}
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                <i class="fa-solid ${icons[tab] || 'fa-folder'} text-5xl text-gray-200 mb-4"></i>
                <p class="text-base font-black text-gray-400">${labels[tab] || tab}</p>
                <p class="text-sm text-gray-300 mt-1">Content will appear here when uploaded by your teacher.</p>
            </div>
        `;
    }

    // ─── Header Dropdowns ─────────────────────────────────────
    const setupDropdown = (btnId, menuId) => {
        const btn = document.getElementById(btnId), menu = document.getElementById(menuId);
        if (!btn || !menu) return;
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = !menu.classList.contains('hidden');
            document.querySelectorAll('.absolute.shadow-xl, .absolute.shadow-lg').forEach(m => { if (m !== menu) m.classList.add('hidden'); });
            document.querySelectorAll('.relative button').forEach(b => { if (b !== btn) b.classList.remove('active'); });
            if (isOpen) { menu.classList.add('hidden'); btn.classList.remove('active'); }
            else { menu.classList.remove('hidden'); btn.classList.add('active'); }
        });
        menu.addEventListener('click', e => e.stopPropagation());
    };
    setupDropdown('notesDropdownBtn', 'notesPanel');
    setupDropdown('notifDropdownBtn', 'notifDropdownMenu');
    setupDropdown('mailDropdownBtn', 'mailDropdownMenu');
    setupDropdown('profileDropdownBtn', 'profileDropdownMenu');

    document.getElementById('viewAllMailBtn')?.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.absolute.shadow-xl,.absolute.shadow-lg').forEach(m => m.classList.add('hidden')); switchTab('nav-mail'); });
    document.getElementById('viewAllNotesBtn')?.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.absolute.shadow-xl').forEach(m => m.classList.add('hidden')); switchTab('nav-notes'); });
    window.addEventListener('click', () => { document.querySelectorAll('.absolute.shadow-xl,.absolute.shadow-lg').forEach(m => m.classList.add('hidden')); document.querySelectorAll('.relative button').forEach(b => b.classList.remove('active')); });
    document.querySelectorAll('[data-assignment]').forEach(el => el.addEventListener('click', () => switchTab('nav-assignments')));

    // ─── Classroom Detail ──────────────────────────────────────
    const classroomData = {
        'card-prog1': {
            subject: 'Computer Programming 1',
            teacher: 'Mr. Alex Reyes',
            section: 'ICT-11A',
            room: 'Room 301',
            students: 38,
            schedule: 'Mon / Wed / Fri • 8:00 – 9:30 AM',
            icon: 'fa-solid fa-code',
            bgColor: 'bg-icc',
            color: 'text-icc',
            topicColor: 'bg-icc-light'
        },
        'card-webdev': {
            subject: 'Web Development 1',
            teacher: 'Ms. Sarah Lim',
            section: 'ICT-11A',
            room: 'Lab 2',
            students: 38,
            schedule: 'Tue / Thu • 9:45 – 11:15 AM',
            icon: 'fa-solid fa-globe',
            bgColor: 'bg-blue-500',
            color: 'text-blue-600',
            topicColor: 'bg-blue-50'
        },
        'card-database': {
            subject: 'Database Management 1',
            teacher: 'Ms. Elena Reyes',
            section: 'ICT-11A',
            room: 'Lab 1',
            students: 40,
            schedule: 'Mon / Wed • 11:30 AM – 1:00 PM',
            icon: 'fa-solid fa-database',
            bgColor: 'bg-orange-500',
            color: 'text-orange-600',
            topicColor: 'bg-orange-50'
        }
    };

    function showClassroomDetail(classroomId) {
        const data = classroomData[classroomId];
        if (!data) return;

        const content = document.getElementById('classroom-detail-content');
        if (!content) return;

        setNavContext('Classrooms');

        content.innerHTML = `
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl ${data.topicColor} flex items-center justify-center flex-shrink-0">
                        <i class="${data.icon} ${data.color} text-3xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-black text-gray-900 tracking-tight leading-tight">${data.subject}</h1>
                        <p class="text-sm text-gray-500 font-medium mt-1">${data.teacher} • ${data.section}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('nav-classrooms').click()" class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                    <i class="fa-solid fa-arrow-left text-sm"></i>
                </button>
            </div>

            <div class="grid grid-cols-4 gap-4 mb-8">
                <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Room</p>
                    <p class="text-xl font-black text-gray-900">${data.room}</p>
                </div>
                <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Students</p>
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-users ${data.color} text-lg"></i>
                        <p class="text-xl font-black text-gray-900">${data.students}</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm col-span-2">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Schedule</p>
                    <p class="text-base font-black text-gray-900">${data.schedule}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 class="text-lg font-black text-gray-900 mb-4">Quick Actions</h3>
                        <div class="space-y-3">
                            <button class="w-full py-3 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 ${data.bgColor} text-white">
                                <i class="fa-solid fa-video text-lg"></i> Join Class
                            </button>
                            <button class="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                <i class="fa-solid fa-file-lines text-lg"></i> View Assignments
                            </button>
                            <button class="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                <i class="fa-solid fa-folder text-lg"></i> Materials & Resources
                            </button>
                            <button class="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                <i class="fa-solid fa-envelope text-lg"></i> Message Teacher
                            </button>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 class="text-lg font-black text-gray-900 mb-4">Attendance</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Present</span>
                                <span class="text-2xl font-black text-green-600">28</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Absent</span>
                                <span class="text-2xl font-black text-red-600">2</span>
                            </div>
                            <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-green-500 rounded-full" style="width: 93%"></div>
                            </div>
                            <p class="text-xs text-gray-400 text-right">93% Attendance Rate</p>
                        </div>
                    </div>
                    <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 class="text-lg font-black text-gray-900 mb-4">Grade Summary</h3>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600 text-sm">Current Average</span>
                                <span class="text-3xl font-black ${data.color}">85%</span>
                            </div>
                            <p class="text-xs text-gray-400">Based on quizzes & assignments</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        hideAllSections();
        showSection('section-classroom-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.showClassroomDetail = showClassroomDetail;

    // Classroom card click handlers
    document.querySelectorAll('.classroom-card').forEach(card => {
        card.addEventListener('click', () => {
            const classroomId = card.dataset.classroomId;
            showClassroomDetail(classroomId);
        });
    });

    // ─── Init ──────────────────────────────────────────────────
    window.addEventListener('resize', updateLayout);
    history.replaceState({ page: 'home' }, '', window.location.pathname + window.location.search);
    switchTab('nav-home', false);
    initCalendar();
    renderHomeReels();
    renderSubjectLists();
    buildScheduleNotifications();
    setInterval(buildScheduleNotifications, 60000);
});
