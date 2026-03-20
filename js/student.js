document.addEventListener('DOMContentLoaded', () => {
    // Disable transitions during initialization
    document.documentElement.classList.add('no-transition');

    const sidebar = document.getElementById('sidebar');
    const subSidebar = document.getElementById('sub-sidebar');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const toggleBtn = document.getElementById('sidebarToggle');
    const toggleSubBtn = document.getElementById('toggleSubSidebar');
    const subSidebarChevron = document.getElementById('subSidebarChevron');
    const pageTitle = document.getElementById('page-title');
    const navLinks = document.querySelectorAll('#sidebar nav a');

    // --- User Data (Future: Fetch from DB) ---
    const currentUser = {
        name: 'Stanley Garcia',
        strand: 'ICT Strand'
    };

    // --- Core Navigation Setup ---
    const sectionMap = {
        'nav-home': 'section-home',
        'nav-courses': 'section-courses',
        'nav-assignments': 'section-assignments',
        'nav-grades': 'section-grades',
        'nav-attendance': 'section-attendance',
        'nav-messages': 'section-messages',
        'nav-notes': 'section-notes',
        'nav-ai': 'section-ai'
    };

    const hasSubSidebar = ['nav-courses', 'nav-assignments', 'nav-attendance', 'nav-notes'];

    // --- Sidebar Default State ---
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) {
        sidebar.classList.add('sidebar-collapsed');
    }

    // Force reflow and re-enable transitions
    window.getComputedStyle(document.documentElement).opacity;
    document.documentElement.classList.remove('no-transition');

    // --- Layout Utility ---
    function updateLayout() {
        if (window.innerWidth < 1024) {
            layoutWrapper.style.marginLeft = '0';
            return;
        }

        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        const isSubVisible = subSidebar.classList.contains('sub-sidebar-visible');
        const mainWidth = isCollapsed ? 82 : 220; // Reverted to 220px baseline
        const subWidth = isSubVisible ? 200 : 0;

        layoutWrapper.style.marginLeft = (mainWidth + subWidth) + 'px';
    }

    // --- Navigation Logic ---
    function switchTab(navId, fromWidget = false) {
        const targetSectionId = sectionMap[navId];
        if (!targetSectionId) return;

        // Update active nav link
        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        const activeLink = document.getElementById(navId);
        if (activeLink) activeLink.classList.add('bg-white/20');

        // Update Title
        const navText = activeLink ? activeLink.querySelector('.full-label').textContent : 'Dashboard';
        if (pageTitle) {
            pageTitle.textContent = (navText === 'Home') ? 'Dashboard' : navText;
        }
        document.title = (navText === 'Home' ? 'Dashboard' : navText) + ' - ICC ELMS';

        // Handle Sections
        document.querySelectorAll('.dynamic-section').forEach(s => s.classList.add('hidden'));
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) targetSection.classList.remove('hidden');

        // Handle Sidebars Logic
        const shouldShowSub = hasSubSidebar.includes(navId);
        if (toggleSubBtn) {
            if (shouldShowSub) toggleSubBtn.classList.remove('hidden');
            else toggleSubBtn.classList.add('hidden');
        }

        if (navId === 'nav-home') {
            document.body.classList.remove('sidebar-collapsed');
            sidebar.classList.remove('sidebar-collapsed');
            subSidebar.classList.remove('sub-sidebar-visible');
            subSidebar.classList.add('hidden'); // Hardware hide for Home
        } else {
            document.body.classList.add('sidebar-collapsed');
            sidebar.classList.add('sidebar-collapsed');
            if (shouldShowSub) {
                subSidebar.classList.remove('hidden'); // Show for Course tabs
                subSidebar.classList.add('sub-sidebar-visible');
                updateSubSidebar(navId);
            } else {
                subSidebar.classList.remove('sub-sidebar-visible');
                subSidebar.classList.add('hidden');
            }
        }

        updateLayout();
        if (window.innerWidth < 1024) {
            sidebar.classList.remove('sidebar-visible');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const currentActive = document.querySelector('#sidebar nav a.bg-white\\/20');

            if (link.id === 'nav-home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                switchTab('nav-home');
                return;
            }

            if (currentActive && currentActive.id === link.id && hasSubSidebar.includes(link.id)) {
                subSidebar.classList.toggle('sub-sidebar-visible');
                updateLayout();
            } else {
                switchTab(link.id);
            }
        });
    });

    // --- Phase 6 & 7: Sub-Sidebar & Home Reels Data ---
    const subjectsData = {
        enrolled: [
            { id: 'card-prog1', text: 'Computer Programming 1', subtitle: 'ICT Strand • Java Foundations', instructor: 'Mr. Alex Reyes', icon: 'fa-solid fa-code', bg: 'image/book1.svg', q1Percent: 80, q2Percent: 0 },
            { id: 'card-webdev', text: 'Web Development 1', subtitle: 'ICT Strand • HTML/CSS/JS', instructor: 'Ms. Sarah Lim', icon: 'fa-solid fa-globe', bg: 'image/book2.svg', q1Percent: 67, q2Percent: 0 },
            { id: 'card-sysarch', text: 'Computer Systems Arch', subtitle: 'ICT Strand • Hardware', instructor: 'Engr. Marco Diaz', icon: 'fa-solid fa-microchip', bg: 'image/book3.svg', q1Percent: 50, q2Percent: 0 },
            { id: 'card-empowerment', text: 'Empowerment Technologies', subtitle: 'ICT Strand • Digital Literacy', instructor: 'Mr. Juan Dela Cruz', icon: 'fa-solid fa-lightbulb', bg: 'image/book4.svg', q1Percent: 20, q2Percent: 0 },
            { id: 'card-networks', text: 'Network Basics', subtitle: 'ICT Strand • Networking', instructor: 'Mr. Alex Chen', icon: 'fa-solid fa-network-wired', bg: 'image/book5.svg', q1Percent: 40, q2Percent: 0 },
            { id: 'card-database', text: 'Database Management 1', subtitle: 'ICT Strand • SQL/Data', instructor: 'Ms. Elena Reyes', icon: 'fa-solid fa-database', bg: 'image/book6.svg', q1Percent: 60, q2Percent: 0 },
            { id: 'card-graphics', text: 'Graphic Design & Layout', subtitle: 'ICT Strand • Visual Arts', instructor: 'Mr. Paulo Cruz', icon: 'fa-solid fa-palette', bg: 'image/book7.svg', q1Percent: 70, q2Percent: 0 },
            { id: 'card-mobile', text: 'Mobile App Development', subtitle: 'ICT Strand • Flutter/React', instructor: 'Ms. Lara Santos', icon: 'fa-solid fa-mobile-screen', bg: 'image/book8.svg', q1Percent: 30, q2Percent: 0 }
        ],
        completed: [
            { id: 'card-introcomp', text: 'Intro to Computing', subtitle: 'ICT Strand • Foundation', instructor: 'Mr. Carlo Bautista', grade: '1.25 Excellent', percent: 50, icon: 'fa-solid fa-desktop' },
            { id: 'card-oralcomm', text: 'Oral Communication', subtitle: 'Core Subject • Public Speaking', instructor: 'Ms. Ana Reyes', grade: '1.50 Very Good', percent: 50, icon: 'fa-solid fa-comments' },
            { id: 'card-genmath', text: 'General Mathematics', subtitle: 'Core Subject • Advanced Algebra', instructor: 'Mr. Jose Santos', grade: '1.75 Good', percent: 50, icon: 'fa-solid fa-infinity' },
            { id: 'card-animation', text: 'Animation (Basic)', subtitle: 'ICT Strand • 2D Animation', instructor: 'Ms. Tricia Villanueva', grade: '1.25 Excellent', percent: 50, icon: 'fa-solid fa-palette' }
        ]
    };

    function renderHomeReels() {
        const container = document.querySelector('.reels-container');
        const prevBtn = document.getElementById('reel-prev');
        const nextBtn = document.getElementById('reel-next');
        if (!container) return;

        container.innerHTML = ''; // Clear skeletons
        subjectsData.enrolled.forEach(subject => {
            const overall = Math.round((subject.q1Percent + subject.q2Percent) / 2);
            const card = document.createElement('div');
            card.className = 'reel-card group';
            card.innerHTML = `
                <div class="reel-image-container">
                    <img src="${subject.bg}" alt="${subject.text}" class="reel-image">
                    <div class="reel-overlay">
                        <div class="mb-4">
                            <h3 class="font-bold text-lg leading-tight mb-2">${subject.text}</h3>
                            <div class="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <div class="h-full bg-icc-yellow shadow-[0_0_8px_rgba(255,208,0,0.5)]" style="width: ${overall}%"></div>
                            </div>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-[9px] font-black tracking-widest uppercase opacity-60">In Progress</span>
                                <span class="text-[9px] font-black tracking-widest text-icc-yellow uppercase">${overall}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => {
                switchTab('nav-courses');
                setTimeout(() => {
                    const target = document.getElementById(subject.id);
                    if (target) {
                        const data = subjectDetails[subject.id];
                        if (data && !target.classList.contains('expanded')) {
                            target.classList.add('expanded');
                            buildSubjectPanel(subject.id, data);
                        }
                        setTimeout(() => {
                            const offset = target.getBoundingClientRect().top + window.scrollY - 120;
                            window.scrollTo({ top: offset, behavior: 'smooth' });
                        }, 350);
                    }
                }, 150);
            });

            container.appendChild(card);
        });

        // --- Smart Navigation Logic ---
        const updateNavButtons = () => {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.offsetWidth;

            if (prevBtn) {
                if (scrollLeft <= 5) prevBtn.classList.remove('visible');
                else prevBtn.classList.add('visible');
            }
            if (nextBtn) {
                if (scrollLeft >= maxScroll - 5) nextBtn.classList.remove('visible');
                else nextBtn.classList.add('visible');
            }
        };

        container.addEventListener('scroll', updateNavButtons);
        window.addEventListener('resize', updateNavButtons);

        if (prevBtn) prevBtn.onclick = () => container.scrollBy({ left: -220, behavior: 'smooth' });
        if (nextBtn) nextBtn.onclick = () => container.scrollBy({ left: 220, behavior: 'smooth' });

        // Initial check
        setTimeout(updateNavButtons, 300);
    }

    function renderSubjectLists() {
        const enrolledContainer = document.getElementById('enrolled-subjects-list');
        const completedContainer = document.getElementById('completed-subjects-list');

        if (enrolledContainer) {
            enrolledContainer.innerHTML = '';
            subjectsData.enrolled.forEach(subject => {
                const percentage = Math.round((subject.q1Percent + subject.q2Percent) / 2);
                const card = document.createElement('div');
                card.id = subject.id;
                card.className = 'subject-card-wide group cursor-pointer';
                card.setAttribute('data-subject', subject.text);

                card.innerHTML = `
                    <div class="flex-1 flex items-center gap-6">
                        <div class="subject-icon-box">
                            <i class="${subject.icon} text-xl"></i>
                        </div>
                        <div class="min-w-[200px]">
                            <h4 class="font-bold text-gray-800 group-hover:text-icc-green transition-colors">${subject.text}</h4>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">${subject.subtitle}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-12 pr-4">
                        <div class="text-right min-w-[140px]">
                            <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Instructor</p>
                            <p class="text-xs font-bold text-gray-600">${subject.instructor}</p>
                        </div>
                        <div class="w-64">
                            <div class="flex justify-between items-center mb-1.5">
                                <span class="text-[10px] font-black text-icc">${percentage}% In Progress</span>
                            </div>
                            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-icc-yellow shadow-[0_0_8px_rgba(255,208,0,0.5)]" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-gray-300 text-xs group-hover:text-icc-yellow transition-all group-hover:translate-x-1"></i>
                    </div>
                `;

                card.addEventListener('click', () => {
                    const data = subjectDetails[subject.id];
                    if (data) {
                        if (card.classList.contains('expanded')) {
                            card.classList.remove('expanded');
                            const panel = document.getElementById('expand-' + subject.id);
                            if (panel) {
                                panel.style.opacity = '0';
                                panel.style.transform = 'translateY(-10px)';
                                setTimeout(() => panel.remove(), 400);
                            }
                        } else {
                            card.classList.add('expanded');
                            buildSubjectPanel(subject.id, data);
                            setTimeout(() => {
                                const offset = card.getBoundingClientRect().top + window.scrollY - 120;
                                window.scrollTo({ top: offset, behavior: 'smooth' });
                            }, 50);
                        }
                    }
                });

                enrolledContainer.appendChild(card);
            });
        }

        if (completedContainer) {
            completedContainer.innerHTML = '';
            subjectsData.completed.forEach(subject => {
                const card = document.createElement('div');
                card.id = subject.id;
                card.className = 'subject-card-wide group cursor-pointer bg-gray-50/50';
                card.setAttribute('data-subject', subject.text);

                card.innerHTML = `
                    <div class="flex-1 flex items-center gap-6">
                        <div class="subject-icon-box"><i class="${subject.icon} text-xl"></i></div>
                        <div class="min-w-[200px]">
                            <h4 class="font-bold text-gray-800 group-hover:text-icc-green transition-colors">${subject.text}</h4>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">${subject.subtitle}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-12 pr-4">
                        <div class="text-right min-w-[140px]">
                            <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Instructor</p>
                            <p class="text-xs font-bold text-gray-600">${subject.instructor}</p>
                        </div>
                        <div class="text-right min-w-[140px]">
                            <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Final Grade</p>
                            <p class="text-xs font-black text-icc-green">${subject.grade}</p>
                        </div>
                        <div class="w-64">
                            <div class="flex justify-between items-center mb-1.5">
                                <span class="text-[10px] font-black text-icc">${subject.percent}% Completed</span>
                            </div>
                            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-icc" style="width: ${subject.percent}%"></div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-gray-300 text-xs group-hover:text-icc-yellow transition-all group-hover:translate-x-1"></i>
                    </div>
                `;
                completedContainer.appendChild(card);
            });
        }
    }

    function updateAISigma() {
        const aiText = document.getElementById('ai-summary-text');
        if (!aiText) return;

        // Welcoming first-time login experience (Phase 7.5)
        const summary = `
            Welcome to **Sigma ELMS**, Stanley! 🤖 I'm your AI academic assistant.
            I've analyzed your **ICT Strand** profile. You have 8 active subjects waiting for your exploration. 
            Check out the **Reels** in the center to resume your latest modules. Let's make this semester extraordinary!
        `;
        aiText.innerHTML = summary;
    }

    // Call Phase 7 inits
    renderHomeReels();
    renderSubjectLists();
    updateAISigma();

    function updateSubSidebar(tabId) {
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        if (!content || !title) return;

        content.innerHTML = ''; // Clear existing

        if (tabId === 'nav-courses') {
            title.textContent = 'Subjects';

            // Render Accordion Group
            const renderGroup = (label, items, sectionId, isOpen = true) => {
                const sorted = [...items].sort((a, b) => a.text.localeCompare(b.text));
                const groupDiv = document.createElement('div');
                groupDiv.className = `sub-nav-group ${isOpen ? 'active' : ''}`;

                groupDiv.innerHTML = `
                    <div class="sub-nav-group-header flex items-center justify-between cursor-pointer select-none">
                        <span class="group-label">${label}</span>
                        <i class="fa-solid fa-chevron-right text-[8px] transition-transform"></i>
                    </div>
                    <div class="sub-nav-items space-y-1 mt-1 pb-4">
                        ${sorted.map(item => `
                            <a href="#" data-scroll-to="${item.id}" class="flex items-center gap-3 px-4 py-2 text-[11px] text-gray-600 hover:bg-gray-100 rounded-lg transition-all font-medium">
                                <i class="${item.icon} text-center w-4"></i>
                                <span>${item.text}</span>
                            </a>
                        `).join('')}
                    </div>
                `;

                // Accordion Toggle
                const header = groupDiv.querySelector('.sub-nav-group-header');
                header.addEventListener('click', () => {
                    groupDiv.classList.toggle('active');
                });

                // Auto-expand and scroll to card
                groupDiv.querySelectorAll('[data-scroll-to]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const cardId = link.dataset.scrollTo;
                        const card = document.getElementById(cardId);
                        if (card) {
                            const data = subjectDetails[cardId];
                            if (data && !card.classList.contains('expanded')) {
                                // Close all others first
                                document.querySelectorAll('.subject-card-wide.expanded').forEach(c => {
                                    c.classList.remove('expanded');
                                    const p = document.getElementById('expand-' + c.id);
                                    if (p) { p.classList.remove('open'); setTimeout(() => p.remove(), 500); }
                                });
                                card.classList.add('expanded');
                                buildSubjectPanel(cardId, data);
                            }
                            setTimeout(() => {
                                const offset = card.getBoundingClientRect().top + window.scrollY - 120;
                                window.scrollTo({ top: offset, behavior: 'smooth' });
                            }, 350);
                        }
                    });
                });

                content.appendChild(groupDiv);
            };

            renderGroup('Enrolled', subjectsData.enrolled, 'subjects-enrolled', true);
            renderGroup('Completed', subjectsData.completed, 'subjects-completed', false);

        } else if (tabId === 'nav-assignments') {
            title.textContent = 'Deadlines';
            content.innerHTML = `<div class="p-4 text-center text-xs text-gray-400">Assignments coming soon...</div>`;
        } else {
            title.textContent = 'Quick Access';
            content.innerHTML = `<div class="p-4 text-center text-xs text-gray-400">Select a section to view details</div>`;
        }
    }

    // --- Subject Details Data ---
    const subjectDetails = {
        'card-prog1': {
            grade: '1.50', summary: 'Mastering Java syntax and object-oriented principles is the critical foundation for all future software engineering. This module focuses on pure logic and data structures.',
            bg: 'image/book1.svg',
            q1Topics: [
                { title: 'Introduction to Java', status: 'completed' },
                { title: 'Variables & Data Types', status: 'completed' },
                { title: 'Control Structures', status: 'completed' },
                { title: 'Methods & Functions', status: 'in-progress' },
                { title: 'Arrays & Collections', status: 'not-started' },
                { title: 'Object-Oriented Programming', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'Inheritance & Polymorphism', status: 'locked' },
                { title: 'Exception Handling', status: 'locked' },
                { title: 'File I/O', status: 'locked' },
                { title: 'Final Project', status: 'locked' }
            ]
        },
        'card-webdev': {
            grade: '1.25', summary: 'Responsive design and accessible UI/UX are critical for modern digital products. This module covers industrial-standard styling and interactive behavior.',
            bg: 'image/book2.svg',
            q1Topics: [
                { title: 'HTML5 Fundamentals', status: 'completed' },
                { title: 'CSS3 & Flexbox', status: 'completed' },
                { title: 'CSS Grid Layout', status: 'completed' },
                { title: 'Responsive Design', status: 'completed' },
                { title: 'JavaScript Basics', status: 'in-progress' },
                { title: 'DOM Manipulation', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'Fetch API & AJAX', status: 'locked' },
                { title: 'React Fundamentals', status: 'locked' },
                { title: 'Deployment & Hosting', status: 'locked' }
            ]
        },
        'card-sysarch': {
            grade: '1.75', summary: 'Understanding hardware foundations like CPU cycles and binary logic is essential for optimizing system-level software and firmware development.',
            bg: 'image/book3.svg',
            q1Topics: [
                { title: 'Number Systems & Binary', status: 'completed' },
                { title: 'CPU Architecture', status: 'completed' },
                { title: 'Memory Hierarchy', status: 'in-progress' },
                { title: 'Input/Output Systems', status: 'not-started' },
                { title: 'Instruction Set Architecture', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'Parallel Processing', status: 'locked' },
                { title: 'Cache Memory Design', status: 'locked' },
                { title: 'System Performance', status: 'locked' }
            ]
        },
        'card-empowerment': {
            grade: '2.00', summary: 'This module focuses on the ethical and effective use of digital tools for social change and individual empowerment. Essential for the modern ICT professional.',
            bg: 'image/book4.svg',
            q1Topics: [
                { title: 'Digital Literacy Overview', status: 'completed' },
                { title: 'Online Safety & Privacy', status: 'in-progress' },
                { title: 'Social Media Responsibility', status: 'not-started' },
                { title: 'Digital Citizenship', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'ICT for Social Change', status: 'locked' },
                { title: 'E-Commerce Basics', status: 'locked' },
                { title: 'Digital Entrepreneurship', status: 'locked' }
            ]
        },
        'card-networks': {
            grade: '1.75', summary: 'Covers the fundamentals of computer networks including protocols, topologies, and basic network administration skills.',
            bg: 'image/book5.svg',
            q1Topics: [
                { title: 'Network Fundamentals', status: 'completed' },
                { title: 'OSI Model', status: 'in-progress' },
                { title: 'IP Addressing & Subnetting', status: 'not-started' },
                { title: 'Network Topologies', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'Routing & Switching', status: 'locked' },
                { title: 'Network Security Basics', status: 'locked' },
                { title: 'Wireless Networks', status: 'locked' }
            ]
        },
        'card-database': {
            grade: '1.50', summary: 'Covers relational database design, SQL querying, normalization, and basic database administration for real-world applications.',
            bg: 'image/book6.svg',
            q1Topics: [
                { title: 'Database Concepts', status: 'completed' },
                { title: 'Entity-Relationship Diagrams', status: 'completed' },
                { title: 'SQL: DDL & DML', status: 'completed' },
                { title: 'Normalization', status: 'in-progress' },
                { title: 'Joins & Subqueries', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'Stored Procedures', status: 'locked' },
                { title: 'Database Security', status: 'locked' },
                { title: 'NoSQL Introduction', status: 'locked' }
            ]
        },
        'card-graphics': {
            grade: '1.50', summary: 'Introduces graphic design principles including typography, color theory, layout design, and production of digital visual assets.',
            bg: 'image/book7.svg',
            q1Topics: [
                { title: 'Design Principles', status: 'completed' },
                { title: 'Color Theory', status: 'completed' },
                { title: 'Typography Fundamentals', status: 'completed' },
                { title: 'Layout & Composition', status: 'in-progress' },
                { title: 'Digital Illustration', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'Print Design', status: 'locked' },
                { title: 'Web Graphics', status: 'locked' },
                { title: 'Brand Identity Design', status: 'locked' }
            ]
        },
        'card-mobile': {
            grade: '2.00', summary: 'Introduction to mobile application development covering UI design patterns, cross-platform frameworks, and app deployment.',
            bg: 'image/book8.svg',
            q1Topics: [
                { title: 'Mobile UI/UX Principles', status: 'completed' },
                { title: 'Flutter Basics', status: 'in-progress' },
                { title: 'Widgets & Layouts', status: 'not-started' },
                { title: 'State Management', status: 'not-started' }
            ],
            q2Topics: [
                { title: 'API Integration', status: 'locked' },
                { title: 'Local Storage & DB', status: 'locked' },
                { title: 'App Deployment', status: 'locked' }
            ]
        },
        // --- Completed Subjects ---
        'card-introcomp': {
            grade: '1.25', summary: 'Foundational module covering the broad context of digital technology, computer history, and its socio-economic impact on modern society. Completed with honors.',
            bg: 'image/book4.svg',
            q1Topics: [
                { title: 'History of Computing', status: 'completed' },
                { title: 'Computer Hardware Components', status: 'completed' },
                { title: 'Operating Systems Basics', status: 'completed' },
                { title: 'Software & Applications', status: 'completed' }
            ],
            q2Topics: [
                { title: 'Internet & Networking Basics', status: 'completed' },
                { title: 'Digital Citizenship', status: 'completed' },
                { title: 'Computer Ethics & Safety', status: 'completed' }
            ]
        },
        'card-oralcomm': {
            grade: '1.50', summary: 'Covers the fundamentals of oral communication including speech context, speech style, and effective verbal and non-verbal communication in various situations.',
            bg: 'image/book1.svg',
            q1Topics: [
                { title: 'Nature & Elements of Communication', status: 'completed' },
                { title: 'Models of Communication', status: 'completed' },
                { title: 'Communication Breakdown', status: 'completed' },
                { title: 'Types of Speech Context', status: 'completed' },
                { title: 'Types of Speech Act', status: 'completed' }
            ],
            q2Topics: [
                { title: 'Types of Speeches', status: 'completed' },
                { title: 'Oral Communication Strategies', status: 'completed' },
                { title: 'Public Speaking', status: 'completed' }
            ]
        },
        'card-genmath': {
            grade: '1.75', summary: 'Covers key mathematical concepts including functions, business mathematics, logic, and statistics essential for Senior High School students.',
            bg: 'image/book2.svg',
            q1Topics: [
                { title: 'Functions & Their Graphs', status: 'completed' },
                { title: 'Rational Functions', status: 'completed' },
                { title: 'Inverse Functions', status: 'completed' },
                { title: 'Exponential & Logarithmic Functions', status: 'completed' },
                { title: 'Simple & Compound Interest', status: 'completed' }
            ],
            q2Topics: [
                { title: 'Annuities & Loans', status: 'completed' },
                { title: 'Logic & Propositions', status: 'completed' },
                { title: 'Statistics & Probability', status: 'completed' }
            ]
        },
        'card-animation': {
            grade: '1.25', summary: 'Introduction to digital animation principles including the 12 principles of animation, basic keyframing, and simple 2D animation production.',
            bg: 'image/book3.svg',
            q1Topics: [
                { title: '12 Principles of Animation', status: 'completed' },
                { title: 'Animation Tools Overview', status: 'completed' },
                { title: 'Keyframing Basics', status: 'completed' },
                { title: 'Character Design Fundamentals', status: 'completed' }
            ],
            q2Topics: [
                { title: '2D Animation Production', status: 'completed' },
                { title: 'Motion Tweening', status: 'completed' },
                { title: 'Final Animation Project', status: 'completed' }
            ]
        }
    };

    // --- Build Subject Expand Panel ---
    function buildSubjectPanel(cardId, data) {
        const existingPanel = document.getElementById('expand-' + cardId);
        if (existingPanel) {
            existingPanel.classList.add('open');
            return;
        }

        const card = document.getElementById(cardId);
        if (!card) return;

        const progress = getProgressPercent(data.q1Topics);
        const q2Progress = getProgressPercent(data.q2Topics);
        const statusIcon = { completed: 'fa-check-circle', 'in-progress': 'fa-circle-half-stroke', 'not-started': 'fa-circle', locked: 'fa-lock' };
        const statusLabel = { completed: 'Completed', 'in-progress': 'In Progress', 'not-started': 'Not Started', locked: 'Locked' };

        const panel = document.createElement('div');
        panel.id = 'expand-' + cardId;
        panel.className = 'subject-expand-panel';
        panel.innerHTML = `
            <div class="subject-expand-details">
                <div class="flex-1">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">About This Subject</p>
                    <p class="text-xs text-gray-600 leading-relaxed font-medium">${data.summary}</p>
                </div>
                <div class="text-right flex-shrink-0 w-28">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1" id="q-grade-label-${cardId}">Q1 Grade</p>
                    <p class="text-2xl font-black text-icc" id="q-grade-val-${cardId}">${data.grade}</p>
                    <div class="mt-2">
                        <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-icc-yellow transition-all duration-300" id="q-progress-fill-${cardId}" style="width: ${progress}%"></div>
                        </div>
                        <p class="text-[9px] text-gray-400 font-bold mt-1" id="q-progress-text-${cardId}">${progress}% Q1</p>
                    </div>
                </div>
            </div>
            <div class="quarter-tabs">
                <div class="quarter-tab active" data-quarter="q1">Q1 <span class="text-[10px] opacity-60">(Current)</span></div>
                <div class="quarter-tab locked" data-quarter="q2"><i class="fa-solid fa-lock text-[9px]"></i> Q2</div>
            </div>
            <div class="quarter-content active" data-quarter-content="q1">
                <div class="topics-container">
                    <div class="topics-row-wrapper">
                        <button class="topic-nav-btn left" id="tnav-left-${cardId}"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="topic-nav-btn right" id="tnav-right-${cardId}"><i class="fa-solid fa-chevron-right"></i></button>
                        <div class="topics-row" id="topics-row-${cardId}">
                            ${data.q1Topics.map((t, i) => `
                                <div class="topic-widget ${t.status === 'locked' ? 'locked' : ''}">
                                    <div class="topic-image-wrap">
                                        <div class="topic-progress-bar">
                                            <div class="topic-progress-fill ${t.status}"></div>
                                        </div>
                                        <img src="${data.bg}" alt="${t.title}" class="topic-image">
                                    </div>
                                    <div class="topic-info">
                                        <span class="topic-number-label">Topic ${i + 1}</span>
                                        <span class="topic-title">${t.title}</span>
                                        <span class="topic-status-badge ${t.status}">
                                            <i class="fa-solid ${statusIcon[t.status]} text-[8px]"></i>
                                            ${statusLabel[t.status]}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="quarter-content" data-quarter-content="q2">
                <div class="topics-container">
                    <div class="topics-row-wrapper">
                        <div class="topics-row" id="topics-row-q2-${cardId}">
                            ${data.q2Topics.map((t, i) => `
                                <div class="topic-widget locked">
                                    <div class="topic-image-wrap">
                                        <div class="topic-progress-bar">
                                            <div class="topic-progress-fill ${t.status}"></div>
                                        </div>
                                        <img src="${data.bg}" alt="${t.title}" class="topic-image">
                                    </div>
                                    <div class="topic-info">
                                        <span class="topic-number-label">Topic ${i + 1}</span>
                                        <span class="topic-title">${t.title}</span>
                                        <span class="topic-status-badge locked">
                                            <i class="fa-solid fa-lock text-[8px]"></i> Locked
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        card.after(panel);
        setTimeout(() => panel.classList.add('open'), 10);

        // Quarter tab switching
        panel.querySelectorAll('.quarter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                panel.querySelectorAll('.quarter-tab').forEach(t => t.classList.remove('active'));
                panel.querySelectorAll('.quarter-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                panel.querySelector(`[data-quarter-content="${tab.dataset.quarter}"]`)?.classList.add('active');

                // Update Progress and Grade explicitly for wireframe toggle logic
                const q = tab.dataset.quarter;
                if (q === 'q1') {
                    document.getElementById('q-grade-label-' + cardId).textContent = 'Q1 Grade';
                    document.getElementById('q-grade-val-' + cardId).textContent = data.grade;
                    document.getElementById('q-grade-val-' + cardId).className = 'text-2xl font-black text-icc';
                    document.getElementById('q-progress-fill-' + cardId).style.width = progress + '%';
                    document.getElementById('q-progress-text-' + cardId).textContent = progress + '% Q1';
                } else if (q === 'q2') {
                    document.getElementById('q-grade-label-' + cardId).textContent = 'Q2 Grade';
                    document.getElementById('q-grade-val-' + cardId).textContent = '---';
                    document.getElementById('q-grade-val-' + cardId).className = 'text-2xl font-black text-gray-300';
                    document.getElementById('q-progress-fill-' + cardId).style.width = q2Progress + '%';
                    document.getElementById('q-progress-text-' + cardId).textContent = q2Progress + '% Q2';
                }
            });
        });

        // Topic nav buttons
        buildTopicWidgets(cardId);
    }

    function buildTopicWidgets(cardId) {
        const row = document.getElementById('topics-row-' + cardId);
        const leftBtn = document.getElementById('tnav-left-' + cardId);
        const rightBtn = document.getElementById('tnav-right-' + cardId);
        if (!row) return;

        const update = () => {
            const sl = row.scrollLeft;
            const max = row.scrollWidth - row.offsetWidth;
            if (leftBtn) leftBtn.classList.toggle('visible', sl > 5);
            if (rightBtn) rightBtn.classList.toggle('visible', sl < max - 5);
        };

        row.addEventListener('scroll', update);
        if (leftBtn) leftBtn.onclick = () => row.scrollBy({ left: -240, behavior: 'smooth' });
        if (rightBtn) rightBtn.onclick = () => row.scrollBy({ left: 240, behavior: 'smooth' });
        setTimeout(update, 100);
    }

    function getProgressPercent(topics) {
        if (!topics || topics.length === 0) return 0;
        const done = topics.filter(t => t.status === 'completed').length;
        return Math.round((done / topics.length) * 100);
    }

    // --- Subject Card Click Handler ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.subject-card-wide');
        if (!card) return;

        const cardId = card.id;
        const data = subjectDetails[cardId];
        if (!data) return;

        const existingPanel = document.getElementById('expand-' + cardId);

        if (card.classList.contains('expanded')) {
            // Collapse
            card.classList.remove('expanded');
            if (existingPanel) {
                existingPanel.classList.remove('open');
                setTimeout(() => existingPanel.remove(), 500);
            }
        } else {
            // Close all others first
            document.querySelectorAll('.subject-card-wide.expanded').forEach(c => {
                c.classList.remove('expanded');
                const p = document.getElementById('expand-' + c.id);
                if (p) { p.classList.remove('open'); setTimeout(() => p.remove(), 500); }
            });
            // Expand this one
            card.classList.add('expanded');
            buildSubjectPanel(cardId, data);
            setTimeout(() => {
                const offset = card.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }, 350);
        }
    });

    // --- Header Dropdowns ---
    const setupDropdown = (btnId, menuId) => {
        const btn = document.getElementById(btnId);
        const menu = document.getElementById(menuId);
        if (btn && menu) {
            btn.addEventListener('click', (e) => {
                const isOpen = !menu.classList.contains('hidden');
                document.querySelectorAll('.absolute.shadow-xl').forEach(m => m.classList.add('hidden'));
                document.querySelectorAll('.relative button').forEach(b => b.classList.remove('active'));
                if (!isOpen) {
                    menu.classList.remove('hidden');
                    btn.classList.add('active');
                }
                e.stopPropagation();
            });
            menu.addEventListener('click', (e) => e.stopPropagation());
        }
    };

    setupDropdown('notesDropdownBtn', 'notesPanel');
    setupDropdown('notifDropdownBtn', 'notifDropdownMenu');
    setupDropdown('profileDropdownBtn', 'profileDropdownMenu');

    // --- Scratchpad ---
    const scratchpad = document.getElementById('scratchpadInput');
    const saveBtn = document.getElementById('saveNotesBtn');
    const clearBtn = document.getElementById('clearNotesBtn');

    if (scratchpad) {
        const savedNote = localStorage.getItem('sigma_scratchpad');
        if (savedNote) scratchpad.value = savedNote;

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                localStorage.setItem('sigma_scratchpad', scratchpad.value);
                const originalHTML = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Saved!</span>';
                saveBtn.classList.replace('bg-icc', 'bg-green-600');
                setTimeout(() => {
                    saveBtn.innerHTML = originalHTML;
                    saveBtn.classList.replace('bg-green-600', 'bg-icc');
                }, 2000);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm("Clear all notes?")) {
                    scratchpad.value = '';
                    localStorage.removeItem('sigma_scratchpad');
                }
            });
        }
    }

    window.addEventListener('click', () => {
        document.querySelectorAll('.absolute.shadow-xl, .absolute.shadow-lg').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.relative button').forEach(b => b.classList.remove('active'));
    });

    // --- Home Logic ---
    document.querySelectorAll('[data-assignment]').forEach(el => {
        el.addEventListener('click', () => switchTab('nav-assignments'));
    });

    // --- Dynamic Calendar Core ---
    // --- Mock Data ---
    const calendarSchedule = {
        "20-3-2026": {
            events: [{ name: "Technical Audit Session", time: "10:00 AM • Lab 1", link: "#" }],
            tasks: [{ name: "Physics Problem Set #4", time: "Due 11:59 PM" }],
            notes: "Please finalize the audit documentation before the meeting."
        },
        "22-3-2026": {
            events: [{ name: "Biology Midterms", time: "1:30 PM • Main Hall", link: "#" }],
            tasks: [{ name: "Pre-Calculus Quiz Review", time: "9:00 AM" }]
        },
        "25-3-2026": {
            notes: "Holiday - No classes scheduled."
        },
        "26-3-2026": {
            events: [{ name: "Advanced Physics Lab", time: "2:00 PM • Lab 4", link: "#" }],
            tasks: [{ name: "Lab Report Draft", time: "Due Midnight" }]
        }
    };

    let calendarDate = new Date(); // Use system date
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const eventPanel = document.getElementById('calendar-event-panel');
    const eventContent = document.getElementById('calendar-event-content');

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function updateEventPanel(day, month, year) {
        if (!eventPanel || !eventContent) return;

        const key = `${day}-${month + 1}-${year}`;
        const data = calendarSchedule[key];

        if (!data || (!data.events && !data.tasks && !data.notes)) {
            eventPanel.classList.add('hidden');
            return;
        }

        let html = '';

        // --- EVENTS CATEGORY ---
        if (data.events && data.events.length > 0) {
            html += `<div>
                <p class="text-[9px] text-icc-yellow font-black uppercase tracking-widest mb-2.5 flex items-center justify-between">
                    <span><i class="fa-solid fa-calendar-star mr-1.5"></i> EVENTS</span>
                </p>
                <div class="space-y-3">`;
            data.events.forEach(evt => {
                html += `
                    <div class="flex items-center justify-between group/evt">
                        <div>
                            <p class="text-xs font-bold text-gray-800">${evt.name}</p>
                            <p class="text-[10px] text-gray-400 font-medium">${evt.time}</p>
                        </div>
                        <a href="${evt.link}" class="px-3 py-1 bg-icc-green/10 text-icc-green text-[10px] font-black rounded-lg hover:text-icc-yellow transition-all">GO</a>
                    </div>`;
            });
            html += `</div></div>`;
        }

        // --- TASKS CATEGORY ---
        if (data.tasks && data.tasks.length > 0) {
            const separator = html ? '<div class="border-t border-gray-200 my-4"></div>' : '';
            html += `${separator}<div>
                <p class="text-[9px] text-icc font-black uppercase tracking-widest mb-2.5 flex items-center">
                    <i class="fa-solid fa-list-check mr-1.5"></i> TASKS
                </p>
                <div class="space-y-2.5">`;
            data.tasks.forEach(task => {
                html += `
                    <div class="flex items-center gap-3 cursor-pointer group/task">
                        <div>
                            <p class="text-xs font-bold text-gray-700 leading-tight group-hover/task:text-icc-yellow">${task.name}</p>
                            <p class="text-[9px] ${task.time.includes('Due') ? 'text-red-500 font-bold' : 'text-gray-400'} font-medium">${task.time}</p>
                        </div>
                    </div>`;
            });
            html += `</div></div>`;
        }

        // --- NOTES CATEGORY ---
        if (data.notes) {
            const separator = html ? '<div class="border-t border-gray-200 my-4"></div>' : '';
            html += `${separator}<div>
                <p class="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2.5 flex items-center">
                    <i class="fa-solid fa-note-sticky mr-1.5"></i> NOTES
                </p>
                <div class="bg-white/50 border border-gray-100 p-3 rounded-xl">
                    <p class="text-[11px] text-gray-600 italic font-medium leading-relaxed">"${data.notes}"</p>
                    <div class="mt-2 flex justify-end">
                        <a href="#" class="text-[9px] text-icc font-black uppercase tracking-widest hover:text-icc-yellow">VIEW</a>
                    </div>
                </div>
            </div>`;
        }

        eventContent.innerHTML = html;
        eventPanel.classList.remove('hidden');
    }

    function renderCalendar() {
        if (!calendarDaysGrid || !calendarMonthYear) return;

        calendarDaysGrid.innerHTML = '';
        const month = calendarDate.getMonth();
        const year = calendarDate.getFullYear();

        calendarMonthYear.textContent = `${months[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Prev Month Empty Slots
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'py-2';
            calendarDaysGrid.appendChild(emptyDiv);
        }

        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        const isToday = (dayNum) => dayNum === todayDate && month === todayMonth && year === todayYear;

        let stickyDateKey = null;

        function applyDayStyle(el, state) {
            if (state === 'today') {
                el.style.setProperty('background-color', '#15803d', 'important');
                el.style.setProperty('color', 'white', 'important');
            } else if (state === 'active') {
                el.style.setProperty('background-color', '#FFD000', 'important');
                el.style.setProperty('color', '#1e293b', 'important');
            } else {
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('color', '', '');
            }
            el.style.borderRadius = '8px';
        }

        // Actual Days
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day text-xs font-bold py-2 cursor-pointer rounded-lg';
            const dateKey = `${dayNum}-${month + 1}-${year}`;
            const data = calendarSchedule[dateKey];

            dayDiv.innerHTML = `<span>${dayNum}</span>`;

            if (isToday(dayNum)) {
                applyDayStyle(dayDiv, 'today');
                updateEventPanel(dayNum, month, year);
            }

            if (data) {
                const dotContainer = document.createElement('div');
                dotContainer.className = 'flex justify-center gap-[2px] mt-[1px]';
                if (data.events && data.events.length > 0) {
                    const dot = document.createElement('div');
                    dot.className = 'w-[3px] h-[3px] rounded-full bg-icc-yellow';
                    dotContainer.appendChild(dot);
                }
                if (data.tasks && data.tasks.length > 0) {
                    const dot = document.createElement('div');
                    dot.className = 'w-[3px] h-[3px] rounded-full bg-icc';
                    dotContainer.appendChild(dot);
                }
                if (data.notes) {
                    const dot = document.createElement('div');
                    dot.className = 'w-[3px] h-[3px] rounded-full bg-gray-400';
                    dotContainer.appendChild(dot);
                }
                dayDiv.appendChild(dotContainer);
            }

            dayDiv.addEventListener('mouseenter', () => {
                document.querySelectorAll('.calendar-day').forEach(d => {
                    const dn = parseInt(d.textContent);
                    applyDayStyle(d, isToday(dn) ? 'today' : 'none');
                });
                applyDayStyle(dayDiv, 'active');
                // Only update event panel if this day has data
                const hoverData = calendarSchedule[dateKey];
                if (hoverData && (hoverData.events || hoverData.tasks || hoverData.notes)) {
                    updateEventPanel(dayNum, month, year);
                }
            });

            dayDiv.addEventListener('mouseleave', () => {
                document.querySelectorAll('.calendar-day').forEach(d => {
                    const dn = parseInt(d.textContent);
                    applyDayStyle(d, isToday(dn) ? 'today' : 'none');
                });

                if (stickyDateKey) {
                    const stickyParts = stickyDateKey.split('-');
                    const sDay = parseInt(stickyParts[0]);
                    const sMonth = parseInt(stickyParts[1]) - 1;
                    const sYear = parseInt(stickyParts[2]);
                    const stickyEl = Array.from(document.querySelectorAll('.calendar-day')).find(d => parseInt(d.textContent) === sDay);
                    if (stickyEl) {
                        applyDayStyle(stickyEl, 'active');
                        updateEventPanel(sDay, sMonth, sYear);
                    }
                } else {
                    updateEventPanel(todayDate, todayMonth, todayYear);
                }
            });

            dayDiv.addEventListener('click', () => {
                const data = calendarSchedule[dateKey];
                if (data && (data.events || data.tasks || data.notes)) {
                    stickyDateKey = (stickyDateKey === dateKey) ? null : dateKey;
                    updateEventPanel(dayNum, month, year);
                }
            });

            calendarDaysGrid.appendChild(dayDiv);
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    renderCalendar();

    // --- Live Class Countdown Timer ---
    const classTimerEl = document.getElementById('class-timer');
    if (classTimerEl) {
        const classEndHour = 11;
        const classEndMin = 0;

        function updateClassTimer() {
            const now = new Date();
            const end = new Date();
            end.setHours(classEndHour, classEndMin, 0, 0);

            const diffMs = end - now;

            if (diffMs <= 0) {
                classTimerEl.textContent = 'Class ended';
                classTimerEl.style.color = '#ef4444';
                clearInterval(classTimerInterval);
                return;
            }

            const totalSecs = Math.floor(diffMs / 1000);
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;

            if (hrs > 0) {
                classTimerEl.textContent = `${hrs}h ${mins}m remaining`;
            } else if (mins > 0) {
                classTimerEl.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`;
            } else {
                classTimerEl.textContent = `${secs}s remaining`;
                classTimerEl.style.color = '#ef4444';
            }
        }

        updateClassTimer();
        const classTimerInterval = setInterval(updateClassTimer, 1000);
    }

    window.addEventListener('resize', updateLayout);
    switchTab('nav-home');
});
