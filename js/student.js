document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('no-transition');

    const sidebar = document.getElementById('sidebar');
    const subSidebar = document.getElementById('sub-sidebar');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const navLinks = document.querySelectorAll('#sidebar nav a');

    // SIGMA AI Elements
    const sigmaAiNotch = document.getElementById('sigmaAiNotch');
    const sigmaAiPanel = document.getElementById('sigmaAiPanel');
    const sigmaAiMessages = document.getElementById('sigmaAiMessages');
    const sigmaAiInput = document.getElementById('sigmaAiInput');
    const sigmaAiSendBtn = document.getElementById('sigmaAiSendBtn');
    const sigmaAiCloseBtn = document.getElementById('sigmaAiCloseBtn');

    const sectionMap = {
        'nav-home': 'section-home',
        'nav-classrooms': 'section-classrooms',
        'nav-courses': 'section-courses',
        'nav-subject-archive': 'section-subject-archive',
        'nav-assignments': 'section-assignments',
        'nav-grades': 'section-grades',
        'nav-attendance': 'section-attendance',
        'nav-mail': 'section-messages',
        'nav-notes': 'section-notes',
        'nav-topic-detail': 'section-topic-detail',
        'nav-topic-content': 'section-topic-content'
    };

    const navIdByPage = {
        'home': 'nav-home', 'classrooms': 'nav-classrooms', 'courses': 'nav-courses', 'subject-archive': 'nav-subject-archive',
        'assignments': 'nav-assignments', 'grades': 'nav-grades',
        'attendance': 'nav-attendance', 'messages': 'nav-mail', 'notes': 'nav-notes'
    };

    const hasSubSidebar = ['nav-mail'];

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

    function setSubjectsPanelsMode(enabled) {
        document.body.classList.toggle('subjects-panels-mode', enabled && window.innerWidth >= 1024);
    }

    function setCurriculumMode(enabled) {
        document.body.classList.toggle('curriculum-mode', enabled && window.innerWidth >= 1024);
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

    function setGreenNavContext(trackText) {
        const gradeEl = document.getElementById('green-grade-label');
        const trackEl = document.getElementById('green-track-label');
        if (gradeEl) gradeEl.textContent = 'Grade 11';
        if (trackEl && trackText) trackEl.textContent = trackText;
    }

    // ─── Tab Switching (internal — no history push) ─────────────
    function _applyTab(navId) {
        const targetSectionId = sectionMap[navId];
        if (!targetSectionId) return;

        // Reset context-specific state if moving to main landing pages
        if (navId === 'nav-courses' || navId === 'nav-subject-archive') {
            currentCurriculumProgram = null;
            currentCurriculumCluster = null;
            resetSubjectsInlineExplorer();
        }

        const isSubjectsLanding = navId === 'nav-courses' && !currentCurriculumProgram;
        setSubjectsPanelsMode(isSubjectsLanding);
        setCurriculumMode(false);

        // Close other open side panels, but keep AI panel if user wants it persistent
        // closeAiPanel(); // Removed
        document.querySelectorAll('[id$="Menu"], [id$="Panel"]').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.relative button').forEach(b => b.classList.remove('active'));

        const navCtx = document.getElementById('nav-subject-context');
        if (navCtx) { navCtx.classList.add('hidden'); navCtx.classList.remove('flex'); }

        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        const activeLink = document.getElementById(navId);
        if (activeLink) activeLink.classList.add('bg-white/20');

        hideAllSections();
        showSection(targetSectionId);

        // Nav context title per tab
        const navContextMap = {
            'nav-home': '', 'nav-classrooms': 'Classes', 'nav-courses': 'Subjects', 'nav-subject-archive': 'Subject Pages',
            'nav-assignments': 'Assessments', 'nav-grades': 'Grades',
            'nav-attendance': 'Attendance', 'nav-mail': 'Mail', 'nav-notes': 'Notes'
        };
        const ctx = navContextMap[navId] || '';
        setNavContext(ctx);
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
        if (state.page.startsWith('inline-cluster:')) {
            const [, programKey, clusterKey] = state.page.split(':');
            _applyTab('nav-courses');
            openInlineProgramFocus(programKey, false, false);
            currentCurriculumCluster = clusterKey;
            renderSubjectsInlineDetail(programKey);
            syncInlinePanelBackButtons();
        } else if (state.page.startsWith('inline:')) {
            _applyTab('nav-courses');
            openInlineProgramFocus(state.page.replace('inline:', ''), false, false);
        } else if (state.page.startsWith('curriculum:')) {
            openCurriculumProgram(state.page.replace('curriculum:', ''), false);
        } else if (state.page.startsWith('cluster:')) {
            const [, programKey, clusterKey] = state.page.split(':');
            openCurriculumCluster(programKey, clusterKey, false);
        } else if (state.page === 'subject-archive') {
            openSubjectArchive(false);
        } else if (state.page.startsWith('topic-content:')) {
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
            { id: 'core-effective-communication', text: 'Effective Communication', subtitle: 'Core Subject', instructor: 'Ms. Ana Reyes', icon: 'fa-solid fa-comments', bg: 'image/book1.jpg', q1Percent: 84, q2Percent: 0, summary: 'Builds speaking, listening, reading, and writing skills for academic work, presentations, collaboration, and clear communication in daily life.' },
            { id: 'core-life-and-career-skills', text: 'Life and Career Skills', subtitle: 'Core Subject', instructor: 'Mr. Carlo Bautista', icon: 'fa-solid fa-briefcase', bg: 'image/book4.jpg', q1Percent: 79, q2Percent: 0, summary: 'Develops self-management, goal setting, career planning, decision-making, and workplace readiness for future study and employment.' },
            { id: 'core-general-mathematics', text: 'General Mathematics', subtitle: 'Core Subject', instructor: 'Mr. Jose Santos', icon: 'fa-solid fa-infinity', bg: 'image/book2.jpg', q1Percent: 88, q2Percent: 0, summary: 'Strengthens practical mathematical thinking through functions, business math, interest, and logical problem-solving for real-life situations.' },
            { id: 'core-general-science', text: 'General Science', subtitle: 'Core Subject', instructor: 'Dr. Leah Mendoza', icon: 'fa-solid fa-flask', bg: 'image/book3.jpg', q1Percent: 73, q2Percent: 0, summary: 'Introduces major ideas in earth science, life science, matter, energy, and scientific inquiry to connect science with the real world.' },
            { id: 'core-history-society', text: 'Kasaysayan at Lipunang Pilipino', subtitle: 'Core Subject', instructor: 'Mr. Ramon Torres', icon: 'fa-solid fa-landmark', bg: 'image/book5.jpg', q1Percent: 69, q2Percent: 0, summary: 'Explores Philippine history, governance, citizenship, culture, and social issues to help learners understand society and national identity.' },
            { id: 'acad-biology-1', text: 'Biology 1', subtitle: 'Academic Track • STEM Cluster', instructor: 'Dr. Elaine Cruz', icon: 'fa-solid fa-dna', bg: 'image/book6.jpg', q1Percent: 76, q2Percent: 0, summary: 'Covers cell structure, heredity, living systems, and biological processes that prepare learners for higher-level science study.' },
            { id: 'acad-contemporary-literature-1', text: 'Contemporary Literature 1', subtitle: 'Academic Track • ASH Cluster', instructor: 'Ms. Tricia Villanueva', icon: 'fa-solid fa-book-open', bg: 'image/book7.jpg', q1Percent: 82, q2Percent: 0, summary: 'Studies modern texts, themes, and literary forms to strengthen interpretation, analysis, and written response.' },
            { id: 'acad-citizenship-civic-engagement', text: 'Citizenship and Civic Engagement', subtitle: 'Academic Track • ASH Cluster', instructor: 'Atty. Miguel Navarro', icon: 'fa-solid fa-people-group', bg: 'image/book8.jpg', q1Percent: 64, q2Percent: 0, summary: 'Focuses on rights, duties, participation, and community involvement so students understand civic responsibility and public life.' }
        ],
        completed: [
            { id: 'card-introcomp', text: 'Intro to Computing', subtitle: 'Foundations • Grade 11', instructor: 'Mr. Carlo Bautista', grade: '1.25 Excellent', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-desktop', bg: 'image/book4.jpg' },
            { id: 'card-oralcomm', text: 'Oral Communication', subtitle: 'Core Subject • Grade 11', instructor: 'Ms. Ana Reyes', grade: '1.50 Very Good', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-comments', bg: 'image/book1.jpg' },
            { id: 'card-genmath', text: 'General Mathematics', subtitle: 'Core Subject • Grade 11', instructor: 'Mr. Jose Santos', grade: '1.75 Good', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-infinity', bg: 'image/book2.jpg' },
            { id: 'card-animation', text: 'Animation (Basic)', subtitle: 'ICT Strand • Grade 11', instructor: 'Ms. Tricia Villanueva', grade: '1.25 Excellent', q1Percent: 100, q2Percent: 100, icon: 'fa-solid fa-palette', bg: 'image/book3.jpg' }
        ]
    };

    const curriculumPrograms = {
        'core-subjects': {
            title: 'Core Subjects',
            kicker: 'Shared Foundation',
            image: 'image/core-subjects.jpg',
            overview: 'These five full-year subjects are taken by all learners. They build the shared foundation for communication, mathematics, science, life readiness, and Philippine society before students move deeper into specialized learning.',
            subjects: [
                { id: 'core-effective-communication', title: 'Effective Communication', overview: 'Speech, writing, listening, and communication for academic and real-life use.', image: 'image/book1.jpg' },
                { id: 'core-life-and-career-skills', title: 'Life and Career Skills', overview: 'Career planning, self-management, and workplace readiness.', image: 'image/book4.jpg' },
                { id: 'core-general-mathematics', title: 'General Mathematics', overview: 'Functions, interest, business math, and logical problem solving.', image: 'image/book2.jpg' },
                { id: 'core-general-science', title: 'General Science', overview: 'Earth systems, life science, matter, energy, and scientific reasoning.', image: 'image/book3.jpg' },
                { id: 'core-history-society', title: 'Pag-aaral ng Kasaysayan at Lipunang Pilipino', overview: 'Philippine society, governance, citizenship, and historical identity.', image: 'image/book5.jpg' }
            ]
        },
        'academic-track': {
            title: 'Academic Track',
            kicker: 'College Preparation',
            image: 'image/academic-track.jpg',
            overview: 'The Academic Track supports students preparing for higher education through theory-rich subjects, advanced reading, analysis, and electives that align with possible degree programs.',
            clusters: [
                {
                    key: 'acad-arts-social',
                    title: 'Arts, Social Sciences, and Humanities',
                    overview: 'Learners explore creative expression, literature, citizenship, and human-centered inquiry in this cluster.',
                    image: 'image/book7.jpg',
                    subjectCount: 5,
                    subjects: [
                        'Arts 1 - Creative Industries',
                        'Contemporary Literature 1',
                        'Citizenship and Civic Engagement',
                        'Philippine Politics and Governance',
                        'Biology 1'
                    ]
                },
                {
                    key: 'acad-stem',
                    title: 'Science, Technology, Engineering, and Mathematics',
                    overview: 'Students focus on analytical thinking, scientific exploration, and math-centered preparation for technical paths.',
                    image: 'image/book2.jpg',
                    subjectCount: 5,
                    subjects: [
                        'General Mathematics',
                        'General Science',
                        'Biology 1',
                        'Finite Mathematics 1',
                        'Physics 1'
                    ]
                },
                {
                    key: 'acad-sports-wellness',
                    title: 'Sports, Health, and Wellness',
                    overview: 'This cluster highlights physical literacy, health learning, and well-being related study paths.',
                    image: 'image/book4.jpg',
                    subjectCount: 4,
                    subjects: [
                        'Human Movement 1',
                        'Physical Education 1',
                        'Health and Wellness Foundations',
                        'Fitness and Recreation'
                    ]
                },
                {
                    key: 'acad-business',
                    title: 'Business and Entrepreneurship',
                    overview: 'Learners develop business awareness, enterprise thinking, and decision-making for work and livelihood.',
                    image: 'image/book6.jpg',
                    subjectCount: 4,
                    subjects: [
                        'Business Math',
                        'Entrepreneurship Fundamentals',
                        'Applied Economics',
                        'Financial Literacy'
                    ]
                },
                {
                    key: 'acad-field-exp',
                    title: 'Field Experience',
                    overview: 'This cluster centers on practical application, exposure, and field-based learning experiences.',
                    image: 'image/book5.jpg',
                    subjectCount: 3,
                    subjects: [
                        'Field Research',
                        'Community Immersion',
                        'Applied Project Work'
                    ]
                }
            ]
        },
        'techpro-track': {
            title: 'TechPro Track',
            kicker: 'Applied Technical Learning',
            image: 'image/techpro-track.jpg',
            overview: 'The TechPro Track focuses on practical and industry-aligned learning through technical specialization, outputs, lab work, demonstrations, and skills preparation.',
            clusters: [
                { key: 'tech-aesthetic', title: 'Aesthetic, Wellness, and Human Care', overview: 'Hands-on learning for care, service, and wellness-related work.', image: 'image/book4.jpg', subjectCount: 4, subjects: ['Contact Center Services', 'Health Care Fundamentals', 'Beauty and Wellness Services', 'Caregiving Basics'] },
                { key: 'tech-agri', title: 'Agri-Fishery Business and Food Innovation', overview: 'Skills for agriculture, food handling, and production work.', image: 'image/book5.jpg', subjectCount: 4, subjects: ['Agri-Food Processing', 'Crop Production', 'Fishery Basics', 'Food Innovation'] },
                { key: 'tech-artisanry', title: 'Artisanry and Creative Enterprise', overview: 'Creative production and enterprise-based craft learning.', image: 'image/book7.jpg', subjectCount: 4, subjects: ['Creative Design', 'Artisan Product Development', 'Visual Merchandising', 'Small Creative Business'] },
                { key: 'tech-automotive', title: 'Automotive and Small Engine Technologies', overview: 'Technical work focused on vehicles, engines, and maintenance systems.', image: 'image/book3.jpg', subjectCount: 4, subjects: ['Automotive Servicing', 'Engine Troubleshooting', 'Maintenance Procedures', 'Safety and Diagnostics'] },
                { key: 'tech-construction', title: 'Construction and Building Technologies', overview: 'Practical building, installation, and construction skills for technical work.', image: 'image/book6.jpg', subjectCount: 4, subjects: ['Construction Basics', 'Tool Handling', 'Blueprint Reading', 'Site Safety'] },
                { key: 'tech-creative-media', title: 'Creative Arts and Design Technologies', overview: 'Digital design, media production, and creative content work.', image: 'image/book1.jpg', subjectCount: 4, subjects: ['Graphic Design', 'Layout Production', 'Digital Illustration', 'Media Design'] },
                { key: 'tech-hospitality', title: 'Hospitality and Tourism', overview: 'Service, customer care, and tourism operations learning.', image: 'image/book2.jpg', subjectCount: 4, subjects: ['Front Office Services', 'Food and Beverage', 'Tourism Basics', 'Guest Service'] },
                { key: 'tech-industrial', title: 'Industrial Technologies', overview: 'Machine handling, production support, and technical systems skills.', image: 'image/book3.jpg', subjectCount: 4, subjects: ['Machine Operations', 'Industrial Safety', 'Basic Fabrication', 'Workshop Practice'] },
                { key: 'tech-ict', title: 'ICT Support and Computer Programming Technologies', overview: 'Digital systems, support work, networking, and programming learning.', image: 'image/book8.jpg', subjectCount: 5, subjects: ['Broadband Installation', 'Computer Programming - Java', 'Computer Systems Servicing', 'Electrical Installation Maintenance', 'Contact Center Services'] },
                { key: 'tech-maritime', title: 'Maritime Transport', overview: 'Sea transport, navigation basics, and marine safety learning.', image: 'image/book5.jpg', subjectCount: 4, subjects: ['Navigation Basics', 'Marine Safety', 'Deck Operations', 'Maritime Communications'] }
            ]
        },
        'work-immersion': {
            title: 'Work Immersion',
            kicker: 'Real-World Experience',
            image: 'image/work-immersion.jpg',
            overview: 'Work Immersion prepares learners for authentic workplace exposure through orientation, guided performance, documentation, and reflection across staged experiences.',
            stages: [
                { key: 'immersion-stage-1', title: 'Stage 1', overview: 'Orientation, clearance, forms, and worksite readiness requirements.', image: 'image/book6.jpg', requirements: ['Orientation', 'Clearance', 'Forms', 'Safety Rules'] },
                { key: 'immersion-stage-2', title: 'Stage 2', overview: 'Supervised performance with logs, tasks, and supervisor monitoring.', image: 'image/book7.jpg', requirements: ['Attendance Logs', 'Assigned Tasks', 'Supervisor Feedback', 'Output Documentation'] },
                { key: 'immersion-stage-3', title: 'Stage 3', overview: 'Reflection, portfolio building, and final presentation requirements.', image: 'image/book8.jpg', requirements: ['Reflection Journal', 'Portfolio', 'Final Evaluation', 'Presentation'] }
            ]
        }
    };

    const curriculumTopicCatalog = {
        'core-effective-communication': {
            text: 'Effective Communication',
            subtitle: 'Core Subject • Grade 11',
            instructor: 'DepEd Core Curriculum',
            icon: 'fa-solid fa-comments',
            bg: 'image/book1.jpg',
            q1Percent: 100,
            q2Percent: 100,
            summary: 'A core communication subject that strengthens speaking, listening, and writing for everyday and academic use.',
            q1Topics: [
                { title: 'Nature and Elements of Communication', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 94, performance: 91 } },
                { title: 'Functions of Communication', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 92, performance: 89 } },
                { title: 'Communication Models', status: 'completed', grades: { quiz: 88, assignment: 85, activity: 90, performance: 87 } },
                { title: 'Communication Breakdown', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Speech Context, Style, and Act', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Principles of Speech Writing and Delivery', status: 'not-started', grades: null }
            ]
        },
        'core-life-and-career-skills': {
            text: 'Life and Career Skills',
            subtitle: 'Core Subject • Grade 11',
            instructor: 'DepEd Core Curriculum',
            icon: 'fa-solid fa-heart-circle-check',
            bg: 'image/book4.jpg',
            q1Percent: 100,
            q2Percent: 100,
            summary: 'A core subject that prepares learners for career planning, self-management, financial literacy, and workplace readiness.',
            q1Topics: [
                { title: 'Self-Assessment and Personal Strengths', status: 'completed', grades: { quiz: 91, assignment: 90, activity: 92, performance: 90 } },
                { title: 'Career Choices and Pathways', status: 'completed', grades: { quiz: 89, assignment: 87, activity: 90, performance: 88 } },
                { title: 'Factors Affecting Goal Fulfillment', status: 'completed', grades: { quiz: 87, assignment: 86, activity: 88, performance: 86 } },
                { title: 'Work Readiness and Professional Habits', status: 'completed', grades: { quiz: 90, assignment: 89, activity: 92, performance: 90 } },
                { title: 'Rights, Responsibilities, and Entrepreneurial Mindset', status: 'in-progress', grades: { quiz: 0, assignment: 84, activity: 0, performance: 0 } },
                { title: 'Career Portfolio and Financial Literacy', status: 'not-started', grades: null }
            ]
        },
        'core-general-mathematics': {
            text: 'General Mathematics',
            subtitle: 'Core Subject • Grade 11',
            instructor: 'DepEd Core Curriculum',
            icon: 'fa-solid fa-square-root-variable',
            bg: 'image/book2.jpg',
            q1Percent: 100,
            q2Percent: 100,
            summary: 'A core mathematics subject focused on functions, business math, interest, loans, and logic for real-life use.',
            q1Topics: [
                { title: 'Functions and Their Graphs', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 91, performance: 89 } },
                { title: 'Rational Functions, Equations, and Inequalities', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'One-to-One and Inverse Functions', status: 'completed', grades: { quiz: 87, assignment: 85, activity: 88, performance: 86 } },
                { title: 'Exponential and Logarithmic Functions', status: 'completed', grades: { quiz: 84, assignment: 82, activity: 86, performance: 83 } },
                { title: 'Simple and Compound Interest', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'Stocks, Bonds, Loans, and Logic', status: 'in-progress', grades: { quiz: 0, assignment: 80, activity: 0, performance: 0 } }
            ]
        },
        'core-general-science': {
            text: 'General Science',
            subtitle: 'Core Subject • Grade 11',
            instructor: 'DepEd Core Curriculum',
            icon: 'fa-solid fa-flask',
            bg: 'image/book3.jpg',
            q1Percent: 100,
            q2Percent: 100,
            summary: 'A science foundation that connects earth systems, life science, matter, energy, and real-world scientific reasoning.',
            q1Topics: [
                { title: 'Origin and Structure of the Earth', status: 'completed', grades: { quiz: 91, assignment: 89, activity: 92, performance: 90 } },
                { title: 'Earth Materials and Processes', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Natural Hazards, Mitigation, and Adaptation', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'Perpetuation of Life and Reproduction', status: 'completed', grades: { quiz: 89, assignment: 87, activity: 90, performance: 88 } },
                { title: 'Evolution, Classification, and Ecosystems', status: 'completed', grades: { quiz: 87, assignment: 85, activity: 89, performance: 86 } },
                { title: 'Matter, Light, and the Cosmos', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } }
            ]
        },
        'core-history-society': {
            text: 'Pag-aaral ng Kasaysayan at Lipunang Pilipino',
            subtitle: 'Core Subject • Grade 11',
            instructor: 'DepEd Core Curriculum',
            icon: 'fa-solid fa-landmark',
            bg: 'image/book5.jpg',
            q1Percent: 100,
            q2Percent: 100,
            summary: 'A core subject that builds understanding of Philippine society, governance, citizenship, and historical identity.',
            q1Topics: [
                { title: 'Enculturation and Socialization', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'How Society Is Organized', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 90, performance: 87 } },
                { title: 'The Philippine Constitution and Governance', status: 'completed', grades: { quiz: 89, assignment: 87, activity: 90, performance: 88 } },
                { title: 'Elections, Suffrage, and Political Parties', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Civil Society, Social Movements, and Citizenship', status: 'completed', grades: { quiz: 91, assignment: 89, activity: 92, performance: 90 } },
                { title: 'Political Ideologies and Social Change', status: 'in-progress', grades: { quiz: 0, assignment: 83, activity: 0, performance: 0 } }
            ]
        },
        'acad-arts-1': {
            text: 'Arts 1 - Creative Industries',
            subtitle: 'Academic Track • Grade 11',
            instructor: 'Academic Track Faculty',
            icon: 'fa-solid fa-palette',
            bg: 'image/book7.jpg',
            q1Percent: 90,
            q2Percent: 90,
            summary: 'Focuses on creative expression, industry awareness, and the relationship between art, media, and society.',
            q1Topics: [
                { title: 'Introduction to Creative Industries', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 92, performance: 90 } },
                { title: 'Elements and Principles of Design', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 90, performance: 87 } },
                { title: 'Artistic Media and Techniques', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Cultural Identity in Art', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Creative Portfolio Development', status: 'not-started', grades: null }
            ]
        },
        'acad-contemporary-lit-1': {
            text: 'Contemporary Literature 1',
            subtitle: 'Academic Track • Grade 11',
            instructor: 'Academic Track Faculty',
            icon: 'fa-solid fa-book-open',
            bg: 'image/book1.jpg',
            q1Percent: 88,
            q2Percent: 88,
            summary: 'Introduces modern literary forms, themes, and interpretations through reading and discussion.',
            q1Topics: [
                { title: 'Literature in the Modern Context', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 91, performance: 89 } },
                { title: 'Themes in Contemporary Texts', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Poetry, Fiction, and Creative Nonfiction', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Literary Criticism and Response', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Writing a Critical Reflection', status: 'not-started', grades: null }
            ]
        },
        'acad-civic-engagement': {
            text: 'Citizenship and Civic Engagement',
            subtitle: 'Academic Track • Grade 11',
            instructor: 'Academic Track Faculty',
            icon: 'fa-solid fa-people-arrows',
            bg: 'image/book5.jpg',
            q1Percent: 87,
            q2Percent: 87,
            summary: 'Builds civic participation through rights, duties, community action, and service-oriented learning.',
            q1Topics: [
                { title: 'Rights, Duties, and Citizenship', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'Community Participation', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Social Issues and Public Service', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Advocacy and Volunteerism', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Civic Action Project', status: 'not-started', grades: null }
            ]
        },
        'acad-philippine-governance': {
            text: 'Philippine Politics and Governance',
            subtitle: 'Academic Track • Grade 11',
            instructor: 'Academic Track Faculty',
            icon: 'fa-solid fa-scale-balanced',
            bg: 'image/book6.jpg',
            q1Percent: 89,
            q2Percent: 89,
            summary: 'Covers the political system, public institutions, democratic participation, and governance in the Philippines.',
            q1Topics: [
                { title: 'Political Institutions and the State', status: 'completed', grades: { quiz: 91, assignment: 89, activity: 90, performance: 88 } },
                { title: 'The Executive, Legislative, and Judicial Branches', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Elections and Political Participation', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Public Policy and Governance', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Citizenship and Accountability', status: 'not-started', grades: null }
            ]
        },
        'acad-biology-1': {
            text: 'Biology 1',
            subtitle: 'Academic Track • Grade 11',
            instructor: 'Academic Track Faculty',
            icon: 'fa-solid fa-dna',
            bg: 'image/book3.jpg',
            q1Percent: 91,
            q2Percent: 91,
            summary: 'Introduces living systems, cell structures, heredity, and the diversity of life.',
            q1Topics: [
                { title: 'Introduction to Biology', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 91, performance: 89 } },
                { title: 'Cell Structure and Function', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Genetics and Heredity', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'Diversity of Organisms', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Biological Systems and Interactions', status: 'not-started', grades: null }
            ]
        },
        'tech-broadband-installation': {
            text: 'Broadband Installation',
            subtitle: 'TechPro Track • Grade 11',
            instructor: 'TechPro Faculty',
            icon: 'fa-solid fa-satellite-dish',
            bg: 'image/book5.jpg',
            q1Percent: 86,
            q2Percent: 86,
            summary: 'Introduces the installation workflow, tools, safety, and basic maintenance used in broadband deployment.',
            q1Topics: [
                { title: 'Tools, Materials, and Safety Procedures', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'Cable Types and Network Layout', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Installation Planning and Site Survey', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Testing and Signal Verification', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Basic Troubleshooting and Repair', status: 'not-started', grades: null }
            ]
        },
        'tech-computer-programming-java': {
            text: 'Computer Programming - Java',
            subtitle: 'TechPro Track • Grade 11',
            instructor: 'TechPro Faculty',
            icon: 'fa-solid fa-code',
            bg: 'image/book1.jpg',
            q1Percent: 88,
            q2Percent: 88,
            summary: 'A skills-based subject that develops coding logic, program structure, and practical Java development.',
            q1Topics: [
                { title: 'Java Syntax and Program Structure', status: 'completed', grades: { quiz: 92, assignment: 90, activity: 91, performance: 89 } },
                { title: 'Variables, Data Types, and Operators', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 89, performance: 87 } },
                { title: 'Control Structures and Loops', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 90, performance: 88 } },
                { title: 'Methods and Parameters', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Arrays and Object-Oriented Basics', status: 'not-started', grades: null }
            ]
        },
        'tech-computer-systems-servicing': {
            text: 'Computer Systems Servicing',
            subtitle: 'TechPro Track • Grade 11',
            instructor: 'TechPro Faculty',
            icon: 'fa-solid fa-microchip',
            bg: 'image/book2.jpg',
            q1Percent: 87,
            q2Percent: 87,
            summary: 'Covers hardware assembly, diagnostics, maintenance, and basic computer repair procedures.',
            q1Topics: [
                { title: 'Computer Hardware Components', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'System Assembly and Disassembly', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Preventive Maintenance', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Troubleshooting Procedures', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Repair and Replacement of Components', status: 'not-started', grades: null }
            ]
        },
        'tech-electrical-installation-maintenance': {
            text: 'Electrical Installation Maintenance',
            subtitle: 'TechPro Track • Grade 11',
            instructor: 'TechPro Faculty',
            icon: 'fa-solid fa-bolt',
            bg: 'image/book3.jpg',
            q1Percent: 85,
            q2Percent: 85,
            summary: 'Focuses on wiring, safety, electrical tools, and maintenance work in technical environments.',
            q1Topics: [
                { title: 'Electrical Safety and Tools', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'Wiring Diagrams and Layouts', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Circuit Installation', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Fault Detection and Maintenance', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Testing and Inspection Procedures', status: 'not-started', grades: null }
            ]
        },
        'tech-contact-center-services': {
            text: 'Contact Center Services',
            subtitle: 'TechPro Track • Grade 11',
            instructor: 'TechPro Faculty',
            icon: 'fa-solid fa-headset',
            bg: 'image/book4.jpg',
            q1Percent: 84,
            q2Percent: 84,
            summary: 'Develops workplace communication, customer service, and call-handling skills for service operations.',
            q1Topics: [
                { title: 'Customer Service Fundamentals', status: 'completed', grades: { quiz: 90, assignment: 88, activity: 91, performance: 89 } },
                { title: 'Call Handling and Listening Skills', status: 'completed', grades: { quiz: 88, assignment: 86, activity: 89, performance: 87 } },
                { title: 'Email and Chat Communication', status: 'completed', grades: { quiz: 86, assignment: 84, activity: 88, performance: 85 } },
                { title: 'Workplace Etiquette and Escalation', status: 'in-progress', grades: { quiz: 0, assignment: 82, activity: 0, performance: 0 } },
                { title: 'Service Recovery and Documentation', status: 'not-started', grades: null }
            ]
        },
        'immersion-stage-1': {
            text: 'Stage 1',
            subtitle: 'Work Immersion • Orientation',
            instructor: 'Work Immersion Supervisor',
            icon: 'fa-solid fa-flag-checkered',
            bg: 'image/book6.jpg',
            q1Percent: 70,
            q2Percent: 70,
            summary: 'Covers the pre-immersion requirements that prepare students for placement and worksite readiness.',
            q1Topics: [
                { title: 'Orientation and Program Briefing', status: 'completed', grades: { quiz: 90, assignment: 92, activity: 94, performance: 90 } },
                { title: 'Worksite Matching and Clearance', status: 'completed', grades: { quiz: 88, assignment: 90, activity: 91, performance: 87 } },
                { title: 'Parent Consent and Forms', status: 'completed', grades: { quiz: 86, assignment: 92, activity: 88, performance: 85 } },
                { title: 'Safety, Dress Code, and Attendance Rules', status: 'in-progress', grades: { quiz: 0, assignment: 88, activity: 0, performance: 0 } },
                { title: 'Pre-Immersion Plan Submission', status: 'not-started', grades: null }
            ]
        },
        'immersion-stage-2': {
            text: 'Stage 2',
            subtitle: 'Work Immersion • Performance',
            instructor: 'Work Immersion Supervisor',
            icon: 'fa-solid fa-briefcase',
            bg: 'image/book7.jpg',
            q1Percent: 70,
            q2Percent: 70,
            summary: 'Covers the supervised work period where students perform tasks, keep logs, and meet workplace expectations.',
            q1Topics: [
                { title: 'Daily Attendance and Time Logs', status: 'completed', grades: { quiz: 88, assignment: 92, activity: 94, performance: 91 } },
                { title: 'Assigned Work Tasks', status: 'completed', grades: { quiz: 86, assignment: 90, activity: 91, performance: 88 } },
                { title: 'Supervisor Feedback and Monitoring', status: 'completed', grades: { quiz: 84, assignment: 88, activity: 90, performance: 86 } },
                { title: 'Output Documentation', status: 'in-progress', grades: { quiz: 0, assignment: 87, activity: 0, performance: 0 } },
                { title: 'Workplace Conduct and Compliance', status: 'not-started', grades: null }
            ]
        },
        'immersion-stage-3': {
            text: 'Stage 3',
            subtitle: 'Work Immersion • Reflection',
            instructor: 'Work Immersion Supervisor',
            icon: 'fa-solid fa-award',
            bg: 'image/book8.jpg',
            q1Percent: 70,
            q2Percent: 70,
            summary: 'Covers the post-immersion phase where students reflect, compile evidence, and present their final outputs.',
            q1Topics: [
                { title: 'Reflection Journal and Learning Log', status: 'completed', grades: { quiz: 88, assignment: 92, activity: 90, performance: 89 } },
                { title: 'Portfolio Compilation', status: 'completed', grades: { quiz: 86, assignment: 90, activity: 91, performance: 88 } },
                { title: 'Final Supervisor Evaluation', status: 'completed', grades: { quiz: 84, assignment: 88, activity: 90, performance: 86 } },
                { title: 'Presentation and Defense', status: 'in-progress', grades: { quiz: 0, assignment: 87, activity: 0, performance: 0 } },
                { title: 'Completion and Exit Requirements', status: 'not-started', grades: null }
            ]
        }
    };

    let currentCurriculumProgram = null;
    let currentCurriculumCluster = null;
    const dynamicCurriculumSubjects = {};
    let currentInlineProgram = null;
    let inlineAnimationToken = 0;
    let inlineAnimationTimers = [];

    function getTopicSubject(subjectId) {
        return curriculumTopicCatalog[subjectId] || dynamicCurriculumSubjects[subjectId] || [...subjectsData.enrolled, ...subjectsData.completed].find(s => s.id === subjectId) || null;
    }

    function getTopicData(subjectId) {
        return curriculumTopicCatalog[subjectId] || dynamicCurriculumSubjects[subjectId] || subjectDetails[subjectId] || null;
    }

    function getInlineAnchor(programKey) {
        return ['techpro-track', 'work-immersion'].includes(programKey) ? 'right' : 'left';
    }

    function resetSubjectsInlineExplorer(animate = false) {
        inlineAnimationToken += 1;
        inlineAnimationTimers.forEach(timerId => window.clearTimeout(timerId));
        inlineAnimationTimers = [];
        const row = document.querySelector('.subject-paths-row');
        const detail = document.getElementById('subjects-inline-detail');
        if (!row || !detail) return;
        const programKey = currentInlineProgram;
        const anchor = programKey ? getInlineAnchor(programKey) : null;
        const panels = Array.from(row.querySelectorAll('.subject-path-panel[data-program-key]'));
        const selectedPanel = programKey ? panels.find(panel => panel.dataset.programKey === programKey) : null;
        const shouldAnimateReset = animate && programKey && selectedPanel && (row.classList.contains('inline-active-left') || row.classList.contains('inline-active-right'));

        row.getAnimations().forEach(animation => animation.cancel());
        detail.getAnimations().forEach(animation => animation.cancel());
        panels.forEach(panel => panel.getAnimations().forEach(animation => animation.cancel()));

        if (shouldAnimateReset) {
            const animationDuration = 560;
            const selectedIndex = panels.findIndex(panel => panel.dataset.programKey === programKey);
            const selectedStartRect = selectedPanel.getBoundingClientRect();

            detail.style.transition = 'opacity 180ms ease';
            detail.style.opacity = '0';
            detail.style.pointerEvents = 'none';
            row.classList.remove('inline-active-left', 'inline-active-right');
            detail.classList.add('hidden');
            detail.innerHTML = '';
            detail.style.visibility = '';

            panels.forEach(panel => {
                panel.classList.remove('is-hidden-left', 'is-hidden-right', 'is-selected-left', 'is-selected-right', 'is-collapsed');
                panel.style.transition = 'none';
                panel.style.opacity = '';
                panel.style.transform = '';
                panel.style.visibility = 'visible';
            });

            const selectedEndRect = selectedPanel.getBoundingClientRect();
            const selectedDeltaX = selectedStartRect.left - selectedEndRect.left;
            panels.forEach((panel, panelIndex) => {
                panel.getAnimations().forEach(animation => animation.cancel());
                if (panel.dataset.programKey === programKey) {
                    panel.animate(
                        [
                            { transform: `translateX(${selectedDeltaX}px)`, opacity: 1 },
                            { transform: 'translateX(0)', opacity: 1 }
                        ],
                        { duration: animationDuration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
                    );
                } else {
                    const direction = panelIndex < selectedIndex ? -1 : 1;
                    panel.animate(
                        [
                            { transform: `translateX(${direction * 140}%)`, opacity: 0 },
                            { transform: 'translateX(0)', opacity: 1 }
                        ],
                        { duration: animationDuration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
                    );
                }
            });

            const cleanupTimer = window.setTimeout(() => {
                row.classList.remove('inline-active-left', 'inline-active-right');
                detail.classList.add('hidden');
                detail.innerHTML = '';
                panels.forEach(panel => {
                    panel.getAnimations().forEach(animation => animation.cancel());
                    panel.classList.remove('is-selected-left', 'is-selected-right', 'is-collapsed');
                    panel.style.transition = '';
                    panel.style.transform = '';
                    panel.style.opacity = '';
                    panel.style.visibility = '';
                });
                detail.style.transition = '';
                detail.style.opacity = '';
                detail.style.visibility = '';
                detail.style.pointerEvents = '';
            }, animationDuration + 60);
            inlineAnimationTimers.push(cleanupTimer);

            currentInlineProgram = null;
            return;
        }

        currentInlineProgram = null;
        row.classList.remove('inline-active-left', 'inline-active-right');
        detail.classList.add('hidden');
        detail.innerHTML = '';
        detail.style.opacity = '';
        detail.style.visibility = '';
        detail.style.pointerEvents = '';
        detail.style.transition = '';
        row.querySelectorAll('.subject-path-panel').forEach(panel => {
            panel.getAnimations().forEach(animation => animation.cancel());
            panel.classList.remove('is-hidden-left', 'is-hidden-right', 'is-selected-left', 'is-selected-right', 'is-collapsed');
            panel.style.opacity = '';
            panel.style.transform = '';
            panel.style.transition = '';
        });
    }

    function buildInlineItems(programKey) {
        const program = curriculumPrograms[programKey];
        if (!program) return [];
        if (program.subjects) {
            const coreSubjectDescriptions = {
                'core-effective-communication': 'Builds clear speaking, active listening, reading, and writing skills for classroom discussions, presentations, collaboration, and everyday communication in real-life situations.',
                'core-life-and-career-skills': 'Develops self-management, goal setting, career planning, decision-making, financial awareness, and workplace readiness so learners can prepare for future study and employment.',
                'core-general-mathematics': 'Strengthens practical mathematical thinking through functions, business math, interest, loans, and logical problem-solving that students can apply in daily and professional contexts.',
                'core-general-science': 'Introduces scientific concepts in earth systems, life science, matter, energy, and inquiry so learners understand natural processes and connect science to real-world issues.',
                'core-history-society': 'Explores Philippine history, governance, citizenship, culture, and social issues to help learners understand society, identity, and their role in community life.'
            };
            const coreSubjectInsights = {
                'core-effective-communication': 'Effective Communication is one of the most practical subjects because it strengthens how students explain ideas, listen carefully, and present themselves clearly in both academic work and real-life situations.',
                'core-life-and-career-skills': 'Life and Career Skills gives students a strong personal foundation. It is valuable because it connects classroom learning to decision-making, self-discipline, career readiness, and the realities of future work.',
                'core-general-mathematics': 'General Mathematics matters because it makes math feel useful. It helps students apply numbers to budgeting, business situations, planning, and everyday problem-solving instead of treating math as pure theory only.',
                'core-general-science': 'General Science is important because it helps learners understand how the world works, from the environment to living systems to matter and energy, while building scientific thinking they can use in daily life.',
                'core-history-society': 'Pag-aaral ng Kasaysayan at Lipunang Pilipino is important because it helps students understand identity, citizenship, governance, and social change, so they can see their place and responsibility in Philippine society.'
            };
            return program.subjects.map(item => {
                const subjectData = getTopicData(item.id) || {};
                const progress = Math.round((((subjectData.q1Percent || 0) + (subjectData.q2Percent || 0)) / 2));
                return {
                    kind: 'subject',
                    id: item.id,
                    title: item.title,
                    copy: coreSubjectDescriptions[item.id] || subjectData.summary || item.overview,
                    media: item.image,
                    meta: programKey === 'core-subjects' ? '' : (subjectData.subtitle || ''),
                    aiInsight: coreSubjectInsights[item.id] || '',
                    progress
                };
            });
        }
        if (program.clusters) {
            return program.clusters.map(item => ({
                kind: 'cluster',
                key: item.key,
                title: item.title,
                copy: item.overview,
                media: item.image || '',
                meta: `${item.subjectCount} Subjects`
            }));
        }
        if (program.stages) {
            return program.stages.map(item => ({
                kind: 'stage',
                key: item.key,
                title: item.title,
                copy: item.overview,
                media: item.image || '',
                meta: 'Open Stage'
            }));
        }
        return [];
    }

    function handleInlineCardSelection(programKey, item) {
        if (item.kind === 'subject') {
            switchToTopicPage(item.id);
            return;
        }
        if (item.kind === 'stage') {
            switchToTopicPage(item.key);
            return;
        }
        if (item.kind === 'cluster') {
            currentCurriculumCluster = item.key;
            renderSubjectsInlineDetail(programKey);
            const detail = document.getElementById('subjects-inline-detail');
            if (detail) detail.scrollTo({ top: 0, behavior: 'auto' });
            history.pushState({ page: `inline-cluster:${programKey}:${item.key}` }, '', `#subjects-${programKey}-${item.key}`);
            return;
        }
        const subject = ensureSubjectDataForTitle(item.title, curriculumPrograms[programKey]?.title || 'Program');
        switchToTopicPage(subject.id);
    }

    function getProgramCluster(programKey, clusterKey) {
        const program = curriculumPrograms[programKey];
        if (!program?.clusters) return null;
        return program.clusters.find(cluster => cluster.key === clusterKey) || null;
    }

    function buildTrackClusterSubjectItems(programKey, clusterKey) {
        const cluster = getProgramCluster(programKey, clusterKey);
        if (!cluster) return [];
        return cluster.subjects.map(title => {
            const subject = ensureSubjectDataForTitle(title, cluster.title);
            const progress = Math.round((((subject.q1Percent || 0) + (subject.q2Percent || 0)) / 2));
            return {
                kind: 'subject',
                id: subject.id,
                title,
                copy: subject.summary || `${title} is part of the ${cluster.title} cluster and introduces the key lessons, activities, and outputs learners will complete in this track.`,
                media: subject.bg || cluster.image || 'image/book1.jpg',
                meta: cluster.title,
                aiInsight: subject.summary || `${title} is part of the ${cluster.title} cluster and helps students build knowledge, practice skills, and prepare for the requirements of this learning path.`,
                progress
            };
        });
    }

    function askSigmaAbout(title, insight) {
        const subjectTitle = title || 'This subject';
        const subjectInsight = insight || 'This subject helps build useful academic and real-life skills for students.';
        openAiPanel();
        addAiMessage(`What is ${subjectTitle} about?`, true);
        window.setTimeout(() => {
            addAiMessage(`<strong>${subjectTitle}</strong>: ${subjectInsight}`, false);
        }, 220);
    }
    window.askSigmaAbout = askSigmaAbout;

    function getProgressVisuals(progress) {
        if (progress >= 85) {
            return {
                color: '#22c55e',
                gradient: 'linear-gradient(180deg, #86efac 0%, #22c55e 100%)'
            };
        }
        if (progress >= 70) {
            return {
                color: '#eab308',
                gradient: 'linear-gradient(180deg, #fde68a 0%, #eab308 100%)'
            };
        }
        if (progress >= 50) {
            return {
                color: '#f97316',
                gradient: 'linear-gradient(180deg, #fdba74 0%, #f97316 100%)'
            };
        }
        return {
            color: '#ef4444',
            gradient: 'linear-gradient(180deg, #fca5a5 0%, #ef4444 100%)'
        };
    }

    function syncInlinePanelBackButtons() {
        document.querySelectorAll('.subject-path-back-btn').forEach(btn => btn.remove());
        document.querySelectorAll('.subject-path-panel.is-locked').forEach(panel => panel.classList.remove('is-locked'));
        if (!currentInlineProgram || !currentCurriculumCluster) return;
        if (!['academic-track', 'techpro-track'].includes(currentInlineProgram)) return;
        const panel = document.querySelector(`.subject-path-panel[data-program-key="${currentInlineProgram}"]`);
        if (!panel) return;
        panel.classList.add('is-locked');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'subject-path-back-btn';
        if (currentInlineProgram === 'academic-track') {
            button.classList.add('subject-path-back-btn--right');
        }
        button.innerHTML = '<i class="fa-solid fa-arrow-left"></i><span>Back</span>';
        button.addEventListener('click', event => {
            event.stopPropagation();
            currentCurriculumCluster = null;
            renderSubjectsInlineDetail(currentInlineProgram);
            const detail = document.getElementById('subjects-inline-detail');
            if (detail) detail.scrollTo({ top: 0, behavior: 'auto' });
            history.pushState({ page: `inline:${currentInlineProgram}` }, '', `#subjects-${currentInlineProgram}`);
        });
        panel.appendChild(button);
    }

    function renderSubjectsInlineDetail(programKey) {
        const detail = document.getElementById('subjects-inline-detail');
        const program = curriculumPrograms[programKey];
        if (!detail || !program) return;
        const items = buildInlineItems(programKey);
        const isCoreSubjects = programKey === 'core-subjects';
        const isTrackClusterProgram = programKey === 'academic-track' || programKey === 'techpro-track';
        const isWorkImmersion = programKey === 'work-immersion';
        detail.className = `subjects-inline-detail${isCoreSubjects ? ' subjects-inline-detail--core' : ''}${isTrackClusterProgram ? ' subjects-inline-detail--track' : ''}`;

        if (isTrackClusterProgram) {
            if (currentCurriculumCluster) {
                const subjectItems = buildTrackClusterSubjectItems(programKey, currentCurriculumCluster);
                detail.innerHTML = `
                    <div class="subjects-inline-shell subjects-inline-shell--core">
                        <div class="subjects-inline-grid subjects-inline-grid--list">
                            ${subjectItems.map(item => {
                                const progressVisuals = getProgressVisuals(item.progress ?? 0);
                                return `
                                <div class="subjects-inline-card subjects-inline-card--row" role="button" tabindex="0" data-inline-kind="${item.kind}" data-inline-id="${item.id || ''}">
                                    <img src="${item.media}" alt="${item.title}" class="subjects-inline-card-media">
                                    <div class="subjects-inline-card-body">
                                        ${item.meta ? `<span class="subjects-inline-card-meta">${item.meta}</span>` : ''}
                                        <h4 class="subjects-inline-card-title">${item.title}</h4>
                                        <p class="subjects-inline-card-copy">${item.copy}</p>
                                        <button type="button" class="subjects-inline-ai-icon" title="Ask SIGMA AI" aria-label="Ask SIGMA AI about ${item.title}" data-ai-subject="${item.title}" data-ai-insight="${item.aiInsight || ''}">
                                            <i class="fa-solid fa-bolt"></i>
                                        </button>
                                    </div>
                                    <div class="subjects-inline-card-progress">
                                        <span class="subjects-inline-card-progress-value" style="color:${progressVisuals.color}">${item.progress ?? 0}%</span>
                                        <div class="subjects-inline-card-progress-bar">
                                            <span class="subjects-inline-card-progress-fill" style="height:${item.progress ?? 0}%;background:${progressVisuals.gradient}"></span>
                                        </div>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
                detail.classList.remove('hidden');
                detail.querySelectorAll('.subjects-inline-card').forEach((card, index) => {
                    card.addEventListener('click', () => handleInlineCardSelection(programKey, subjectItems[index]));
                    card.addEventListener('keydown', event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleInlineCardSelection(programKey, subjectItems[index]);
                        }
                    });
                });
                detail.querySelectorAll('.subjects-inline-ai-icon').forEach(btn => {
                    btn.addEventListener('click', event => {
                        event.stopPropagation();
                        askSigmaAbout(btn.dataset.aiSubject, btn.dataset.aiInsight);
                    });
                });
                syncInlinePanelBackButtons();
                return;
            }

            detail.innerHTML = `
                <div class="subjects-track-list">
                    ${items.map(item => `
                        <div class="subjects-track-row" role="button" tabindex="0" data-inline-kind="${item.kind}" data-inline-id="${item.id || item.key || ''}">
                            ${item.meta ? `<span class="subjects-track-meta">${item.meta}</span>` : ''}
                            <h4 class="subjects-track-title">${item.title}</h4>
                            <p class="subjects-track-copy">${item.copy}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            detail.classList.remove('hidden');
            detail.querySelectorAll('.subjects-track-row').forEach((card, index) => {
                card.addEventListener('click', () => handleInlineCardSelection(programKey, items[index]));
                card.addEventListener('keydown', event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleInlineCardSelection(programKey, items[index]);
                    }
                });
            });
            syncInlinePanelBackButtons();
            return;
        }

        const detailTitle = program.subjects
            ? 'Subjects'
            : program.clusters
                ? 'Clusters'
                : 'Stages';

        detail.innerHTML = `
            <div class="subjects-inline-shell${isCoreSubjects ? ' subjects-inline-shell--core' : ''}">
                ${isCoreSubjects || isWorkImmersion ? '' : `
                <div class="subjects-inline-head">
                    <div>
                        <p class="subjects-inline-kicker">${program.title}</p>
                        <h3 class="subjects-inline-title">${detailTitle}</h3>
                    </div>
                    <span class="subjects-inline-hint">Pick one to open topics</span>
                </div>`}
                <div class="subjects-inline-grid${isCoreSubjects ? ' subjects-inline-grid--list' : ''}${isWorkImmersion ? ' subjects-inline-grid--immersion' : ''}">
                    ${items.map(item => `
                        <div class="subjects-inline-card${isCoreSubjects ? ' subjects-inline-card--row' : ''}" role="button" tabindex="0" data-inline-kind="${item.kind}" data-inline-id="${item.id || item.key || ''}">
                            ${item.media ? `<img src="${item.media}" alt="${item.title}" class="subjects-inline-card-media">` : '<div class="subjects-inline-card-media"></div>'}
                            <div class="subjects-inline-card-body">
                                ${item.meta ? `<span class="subjects-inline-card-meta">${item.meta}</span>` : ''}
                                <h4 class="subjects-inline-card-title">${item.title}</h4>
                                <p class="subjects-inline-card-copy">${item.copy}</p>
                                ${isCoreSubjects ? `
                                <button type="button" class="subjects-inline-ai-icon" title="Ask SIGMA AI" aria-label="Ask SIGMA AI about ${item.title}" data-ai-subject="${item.title}" data-ai-insight="${item.aiInsight || ''}">
                                    <i class="fa-solid fa-bolt"></i>
                                </button>` : ''}
                            </div>
                            ${isCoreSubjects ? `
                            <div class="subjects-inline-card-progress">
                                <span class="subjects-inline-card-progress-value">${item.progress ?? 0}%</span>
                                <div class="subjects-inline-card-progress-bar">
                                    <span class="subjects-inline-card-progress-fill" style="height:${item.progress ?? 0}%"></span>
                                </div>
                            </div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        detail.classList.remove('hidden');
        detail.querySelectorAll('.subjects-inline-card').forEach((card, index) => {
            card.addEventListener('click', () => handleInlineCardSelection(programKey, items[index]));
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleInlineCardSelection(programKey, items[index]);
                }
            });
        });
        detail.querySelectorAll('.subjects-inline-ai-icon').forEach(btn => {
            btn.addEventListener('click', event => {
                event.stopPropagation();
                askSigmaAbout(btn.dataset.aiSubject, btn.dataset.aiInsight);
            });
        });
        syncInlinePanelBackButtons();
    }

    function openInlineProgramFocus(programKey, pushState = true, animate = true) {
        const row = document.querySelector('.subject-paths-row');
        const panels = Array.from(document.querySelectorAll('.subject-path-panel[data-program-key]'));
        if (!row || !panels.length) return;
        if (currentInlineProgram === programKey) {
            resetSubjectsInlineExplorer(true);
            return;
        }
        resetSubjectsInlineExplorer();
        const animationToken = inlineAnimationToken;
        currentInlineProgram = programKey;
        currentCurriculumProgram = programKey;
        currentCurriculumCluster = null;
        if (pushState) {
            history.pushState({ page: `inline:${programKey}` }, '', `#subjects-${programKey}`);
        }
        const anchor = getInlineAnchor(programKey);
        const selectedIndex = panels.findIndex(p => p.dataset.programKey === programKey);
        const targetIndex = anchor === 'left' ? 0 : panels.length - 1;
        const animationDuration = 460;
        const selectedPanel = panels[selectedIndex];
        const selectedOffsetPercent = (selectedIndex - targetIndex) * 100;
        const detail = document.getElementById('subjects-inline-detail');

        if (!animate) {
            panels.forEach(panel => {
                panel.getAnimations().forEach(animation => animation.cancel());
                panel.style.transition = '';
                panel.style.transform = '';
                panel.style.opacity = '';
                panel.style.visibility = '';
                panel.classList.remove('is-hidden-left', 'is-hidden-right', 'is-selected-left', 'is-selected-right', 'is-collapsed', 'is-locked');
            });
            row.classList.toggle('inline-active-left', anchor === 'left');
            row.classList.toggle('inline-active-right', anchor === 'right');
            selectedPanel.classList.add(anchor === 'left' ? 'is-selected-left' : 'is-selected-right');
            panels.forEach(panel => {
                if (panel.dataset.programKey !== programKey) {
                    panel.classList.add('is-collapsed');
                }
            });
            renderSubjectsInlineDetail(programKey);
            return;
        }

        panels.forEach((panel, panelIndex) => {
            const panelKey = panel.dataset.programKey;
            panel.style.transition = 'none';
            panel.style.transform = 'translateX(0)';
            panel.style.opacity = '1';
            if (panelKey === programKey) {
                return;
            }
            const direction = panelIndex < selectedIndex ? -1 : 1;
        });

        panels.forEach(panel => panel.getBoundingClientRect());
        requestAnimationFrame(() => {
            if (animationToken !== inlineAnimationToken) return;
            panels.forEach((panel, panelIndex) => {
                panel.style.transition = `transform ${animationDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${animationDuration}ms ease`;
                if (panel.dataset.programKey === programKey) {
                    const directionToTarget = anchor === 'left' ? -1 : 1;
                    panel.style.transform = `translateX(${Math.abs(selectedOffsetPercent) * directionToTarget}%)`;
                    panel.style.opacity = '1';
                } else {
                    const direction = panelIndex < selectedIndex ? -1 : 1;
                    panel.style.transform = `translateX(${direction * 140}%)`;
                    panel.style.opacity = '0';
                }
            });
        });

        const settleTimer = window.setTimeout(() => {
            if (animationToken !== inlineAnimationToken) return;
            selectedPanel.style.visibility = 'hidden';
            row.classList.toggle('inline-active-left', anchor === 'left');
            row.classList.toggle('inline-active-right', anchor === 'right');
            selectedPanel.classList.add(anchor === 'left' ? 'is-selected-left' : 'is-selected-right');
            renderSubjectsInlineDetail(programKey);
            detail.style.transition = '';
            detail.style.opacity = '1';
            detail.style.visibility = '';
            detail.style.pointerEvents = '';
            panels.forEach(panel => {
                if (panel.dataset.programKey !== programKey) {
                    panel.classList.add('is-collapsed');
                }
                panel.style.transition = '';
                panel.style.transform = '';
                panel.style.opacity = '';
            });
            requestAnimationFrame(() => {
                if (animationToken !== inlineAnimationToken) return;
                selectedPanel.style.visibility = '';
                detail.style.visibility = '';
                detail.style.pointerEvents = '';
                detail.style.opacity = '1';
            });
        }, animationDuration);
        inlineAnimationTimers.push(settleTimer);
    }

    function slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function buildGenericSubjectData(title, subjectId, clusterTitle) {
        const baseTopics = [
            `Introduction to ${title}`,
            `Core Concepts in ${title}`,
            `Applied Practice in ${title}`,
            `Assessment and Reflection for ${title}`
        ];
        return {
            id: subjectId,
            text: title,
            subtitle: `${clusterTitle} • Grade 11`,
            instructor: 'Cluster Faculty',
            icon: 'fa-solid fa-book-open',
            bg: 'image/book1.jpg',
            q1Percent: 0,
            q2Percent: 0,
            summary: `${title} is part of the ${clusterTitle} cluster and introduces the essential ideas, skills, and outputs learners will study in this learning path.`,
            q1Topics: baseTopics.map((topic, index) => ({
                title: topic,
                status: index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'not-started',
                grades: index === 0 ? { quiz: 90, assignment: 88, activity: 90, performance: 89 } : index === 1 ? { quiz: 0, assignment: 82, activity: 0, performance: 0 } : null
            }))
        };
    }

    function ensureSubjectDataForTitle(title, clusterTitle) {
        const subjectId = `gen-${slugify(title)}`;
        if (!dynamicCurriculumSubjects[subjectId]) {
            dynamicCurriculumSubjects[subjectId] = buildGenericSubjectData(title, subjectId, clusterTitle);
        }
        return dynamicCurriculumSubjects[subjectId];
    }

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

        let html = `<div class="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white sticky top-0 z-10">${dateStr}</div>`;
        let hasAlert = false;

        if (status.type === 'ongoing' && status.current.subject !== 'Lunch Break') {
            hasAlert = true;
            html += `<div class="notif-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-icc" data-nav="nav-attendance"><div class="flex gap-3 items-start"><div class="w-9 h-9 bg-icc-light rounded-full flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-chalkboard-teacher text-icc text-sm"></i></div><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5"><p class="text-xs font-bold text-gray-800">Class in Session</p><div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span class="text-[9px] font-black text-green-600 uppercase">Live</span></div></div><p class="text-[12px] font-bold text-icc">${status.current.subject}</p><p class="text-[10px] text-gray-400 mt-0.5">${formatTime12(status.current.time)}–${formatTime12(status.current.endTime)} • ${status.current.room}</p><p class="text-[10px] text-gray-500 mt-0.5">${status.current.teacher}</p></div></div></div>`;
            if (status.next && status.next.subject !== 'Lunch Break') html += `<div class="notif-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50" data-nav="nav-attendance"><div class="flex gap-3 items-start"><div class="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-forward text-gray-400 text-xs"></i></div><div class="flex-1 min-w-0"><p class="text-[10px] text-gray-500 font-medium">Up Next</p><p class="text-[12px] font-bold text-gray-800">${status.next.subject}</p><p class="text-[10px] text-gray-400">${formatTime12(status.next.time)} • ${status.next.room}</p></div></div></div>`;
        } else if (status.type === 'between' || status.type === 'before') {
            hasAlert = true;
            html += `
                <div class="notif-item px-6 py-5 hover:bg-gray-50 cursor-pointer border-l-4 border-icc-yellow border-b border-gray-100 transition-all" data-nav="nav-attendance">
                    <div class="flex gap-4 items-start">
                        <div class="w-11 h-11 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <i class="fa-solid fa-clock text-yellow-500 text-lg"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[13px] font-bold text-gray-800">Upcoming Class</p>
                            <p class="text-[14px] font-bold text-yellow-700 mt-1 leading-tight">${status.next.subject}</p>
                            <p class="text-[12px] text-gray-500 mt-1.5">${formatTime12(status.next.time)}–${formatTime12(status.next.endTime)} • ${status.next.room}</p>
                            <p class="text-[12px] text-icc font-bold mt-1">${status.next.teacher}</p>
                        </div>
                    </div>
                </div>`;
        } else {
            html += `
                <div class="px-6 py-12 text-center">
                    <i class="fa-regular fa-moon text-4xl text-gray-200 block mb-3"></i>
                    <p class="text-sm text-gray-400 font-medium">No more classes today</p>
                </div>`;
        }

        // Show feature notifications below the class status area
        html += `<div class="px-4 pt-4 pb-2 border-t border-gray-100 bg-gray-50/30"><p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Feature Notifications</p>`;
        featureNotifications.forEach(item => {
            html += `
                <div class="notif-item px-4 py-4 hover:bg-white cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm rounded-xl mb-2 transition-all" data-nav="${item.nav}">
                    <div class="flex gap-4 items-start">
                        <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 text-sm shadow-sm border border-gray-50">
                            <i class="${item.icon}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[13px] font-bold text-gray-800 leading-tight">${item.title}</p>
                            <p class="text-[12px] text-gray-500 mt-1 leading-normal">${item.message}</p>
                        </div>
                    </div>
                </div>`;
        });

        html += `</div>`;
        notifList.innerHTML = html;

        // keep badge visible if anything to show
        hasAlert = hasAlert || featureNotifications.length > 0;
        if (notifBadge) notifBadge.classList.toggle('hidden', !hasAlert);

        notifList.querySelectorAll('.notif-item[data-nav]').forEach(item => {
            item.addEventListener('click', () => { 
                switchTab(item.dataset.nav); 
                document.querySelectorAll('[id$="Menu"], [id$="Panel"]').forEach(m => m.classList.add('hidden'));
                document.querySelectorAll('.relative button').forEach(b => b.classList.remove('active'));
            });
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
            const progressVisuals = getProgressVisuals(overall);
            const barColor = progressVisuals.color;
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
                            <div style="height:100%;width:${overall}%;background:${progressVisuals.gradient};border-radius:4px"></div>
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
        const subject = getTopicSubject(subjectId);
        if (!subject) {
            switchTab('nav-courses');
            return;
        }

        const locateCurriculumSubject = () => {
            const coreMatch = curriculumPrograms['core-subjects']?.subjects?.find(item => item.id === subjectId);
            if (coreMatch) {
                return { programKey: 'core-subjects', clusterKey: null };
            }

            const programEntries = ['academic-track', 'techpro-track'];
            for (const programKey of programEntries) {
                const clusters = curriculumPrograms[programKey]?.clusters || [];
                const cluster = clusters.find(entry => (entry.subjects || []).includes(subject.text));
                if (cluster) {
                    return { programKey, clusterKey: cluster.key };
                }
            }

            const stageMatch = curriculumPrograms['work-immersion']?.stages?.find(item => item.key === subjectId);
            if (stageMatch) {
                return { programKey: 'work-immersion', clusterKey: null };
            }

            return null;
        };

        const highlightInlineSubject = () => {
            const coursesSection = document.getElementById('section-courses');
            const detail = document.getElementById('subjects-inline-detail');
            const target = detail?.querySelector(`[data-inline-id="${subjectId}"]`);
            if (!target) return;
            if (coursesSection) {
                const sectionTop = coursesSection.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: Math.max(0, sectionTop), behavior: 'smooth' });
            }
            window.setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                target.style.outline = '3px solid #FFD000';
                target.style.outlineOffset = '-3px';
                window.setTimeout(() => {
                    target.style.outline = '';
                    target.style.outlineOffset = '';
                }, 1800);
            }, 220);
        };

        const targetLocation = locateCurriculumSubject();
        switchTab('nav-courses');

        if (!targetLocation) {
            return;
        }

        window.setTimeout(() => {
            currentInlineProgram = null;
            openInlineProgramFocus(targetLocation.programKey, false, false);

            if (targetLocation.clusterKey) {
                currentCurriculumCluster = targetLocation.clusterKey;
                renderSubjectsInlineDetail(targetLocation.programKey);
                history.replaceState({ page: `inline-cluster:${targetLocation.programKey}:${targetLocation.clusterKey}` }, '', `#subjects-${targetLocation.programKey}-${targetLocation.clusterKey}`);
                window.requestAnimationFrame(() => {
                    highlightInlineSubject();
                });
                return;
            }

            history.replaceState({ page: `inline:${targetLocation.programKey}` }, '', `#subjects-${targetLocation.programKey}`);
            window.requestAnimationFrame(() => {
                highlightInlineSubject();
            });
        }, 60);
    }
    window.scrollToSubjectCard = scrollToSubjectCard;

    function openAssessmentSubjectLink(subjectId) {
        scrollToSubjectCard(subjectId);
    }
    window.openAssessmentSubjectLink = openAssessmentSubjectLink;

    // ─── Subject Lists: bar = (q1Percent + q2Percent) / 2 ─────
    function renderSubjectLists() {
        const enrolledContainer = document.getElementById('enrolled-subjects-list');
        const completedContainer = document.getElementById('completed-subjects-list');

        if (enrolledContainer) {
            enrolledContainer.innerHTML = '';
            subjectsData.enrolled.forEach(subject => {
                // Overall = average of Q1 + Q2
                const overall = Math.round((subject.q1Percent + subject.q2Percent) / 2);
                const progressVisuals = getProgressVisuals(overall);
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
                            <span class="text-xs font-black" style="color:${progressVisuals.color}">${overall}%</span>
                            <p class="text-[8px] text-gray-400 font-bold uppercase">Overall</p>
                            <div class="subject-card-vbar">
                                <div class="subject-card-vbar-fill" style="height:${overall}%;background:${progressVisuals.gradient}"></div>
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

    function formatAssessmentDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function getEquivalentGrade(score) {
        if (score >= 98) return '1.00';
        if (score >= 95) return '1.25';
        if (score >= 92) return '1.50';
        if (score >= 89) return '1.75';
        if (score >= 86) return '2.00';
        if (score >= 83) return '2.25';
        if (score >= 80) return '2.50';
        if (score >= 77) return '2.75';
        if (score >= 75) return '3.00';
        return '5.00';
    }

    function buildAssessmentRows() {
        const seen = new Set();
        const sources = [
            ...subjectsData.enrolled.map(subject => subject.id),
            ...subjectsData.completed.map(subject => subject.id),
            ...Object.keys(curriculumTopicCatalog),
            ...Object.keys(dynamicCurriculumSubjects)
        ];

        const baseDate = new Date('2026-03-26T08:00:00');
        const rows = [];

        sources.forEach(subjectId => {
            if (seen.has(subjectId)) return;
            seen.add(subjectId);

            const subject = getTopicSubject(subjectId);
            const data = getTopicData(subjectId);
            if (!subject || !data?.q1Topics?.length) return;

            data.q1Topics.forEach((topic, index) => {
                const startDate = new Date(baseDate);
                startDate.setDate(baseDate.getDate() - (index * 3 + (subject.text.length % 5) + 2));

                const dueDate = new Date(startDate);
                dueDate.setDate(startDate.getDate() + 7);

                const activityScore = topic.grades?.activity || 0;
                const submittedOn = topic.status === 'not-started' ? null : new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);
                const gradedOn = activityScore > 0 ? new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000) : null;

                let status = 'pending';
                if (topic.status === 'completed') status = 'completed';
                else if (topic.status !== 'completed' && dueDate < baseDate) status = 'overdue';

                rows.push({
                    subjectId,
                    topicIdx: index,
                    subject: subject.text,
                    activity: topic.title,
                    startDate,
                    dueDate,
                    submittedOn,
                    gradedOn,
                    score: activityScore,
                    equivalent: activityScore > 0 ? getEquivalentGrade(activityScore) : '—',
                    status
                });
            });
        });

        return rows.sort((a, b) => a.dueDate - b.dueDate);
    }

    function renderAssessmentsPage() {
        const layout = document.getElementById('assessments-layout');
        if (!layout) return;

        const rows = buildAssessmentRows();
        const pendingCount = rows.filter(row => row.status === 'pending').length;
        const completedCount = rows.filter(row => row.status === 'completed').length;
        const overdueCount = rows.filter(row => row.status === 'overdue').length;
        const subjects = [...new Set(rows.map(row => row.subject))].sort((a, b) => a.localeCompare(b));
        const overdueRows = rows.filter(row => row.status === 'overdue').slice(0, 3);
        const pendingRows = rows.filter(row => row.status === 'pending').slice(0, 2);

        const concernItems = [];
        if (overdueCount > 0) {
            concernItems.push(`You have ${overdueCount} overdue ${overdueCount === 1 ? 'activity' : 'activities'} that need immediate attention.`);
        }
        overdueRows.forEach(row => {
            concernItems.push(`Submit ${row.activity} in ${row.subject} as soon as possible.`);
        });
        if (pendingCount > 0) {
            concernItems.push(`You still have ${pendingCount} pending ${pendingCount === 1 ? 'activity' : 'activities'} scheduled next.`);
        }
        pendingRows.forEach(row => {
            concernItems.push(`Prepare ${row.activity} for ${row.subject} before ${formatAssessmentDate(row.dueDate)}.`);
        });
        if (!concernItems.length) {
            concernItems.push('No urgent concerns right now. Keep maintaining your completed activities and upcoming deadlines.');
        }

        const statusBadge = status => {
            if (status === 'completed') return '<span class="px-2.5 py-1 bg-green-100 text-green-700 text-[9px] font-bold uppercase rounded-lg">Completed</span>';
            if (status === 'overdue') return '<span class="px-2.5 py-1 bg-red-100 text-red-600 text-[9px] font-bold uppercase rounded-lg">Overdue</span>';
            return '<span class="px-2.5 py-1 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase rounded-lg">Pending</span>';
        };

        layout.innerHTML = `
            <div class="flex gap-6 items-start min-w-0">
                <div class="w-72 flex-shrink-0">
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div class="px-5 py-4 bg-icc text-white flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-icc-yellow flex items-center justify-center flex-shrink-0">
                                <i class="fa-solid fa-bolt text-icc-dark text-base"></i>
                            </div>
                            <div>
                                <p class="text-sm font-black uppercase tracking-widest">SIGMA AI</p>
                                <p class="text-[10px] text-white/70 font-bold">Assessment Concerns</p>
                            </div>
                        </div>
                        <div class="p-5 space-y-3">
                            ${concernItems.map(item => `
                                <div class="flex items-start gap-3">
                                    <i class="fa-solid fa-angle-right text-icc mt-1 text-xs"></i>
                                    <p class="text-sm text-gray-700 leading-relaxed font-medium">${item}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
                        <div class="flex items-end justify-between gap-4">
                            <div>
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assessment Overview</p>
                                <div class="flex flex-wrap gap-3 mt-3">
                                    <div class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                                        <i class="fa-solid fa-hourglass-half text-amber-500 text-sm"></i>
                                        <span class="text-[10px] font-black text-amber-700 uppercase tracking-widest">Pending</span>
                                        <span class="text-sm font-black text-gray-800">${pendingCount}</span>
                                    </div>
                                    <div class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100">
                                        <i class="fa-solid fa-check-double text-green-500 text-sm"></i>
                                        <span class="text-[10px] font-black text-green-700 uppercase tracking-widest">Completed</span>
                                        <span class="text-sm font-black text-gray-800">${completedCount}</span>
                                    </div>
                                    <div class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                                        <i class="fa-solid fa-circle-exclamation text-red-500 text-sm"></i>
                                        <span class="text-[10px] font-black text-red-700 uppercase tracking-widest">Overdue</span>
                                        <span class="text-sm font-black text-gray-800">${overdueCount}</span>
                                    </div>
                                </div>
                            </div>
                            <select id="assessments-subject-filter" class="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:border-icc min-w-[220px]">
                                <option value="all">All Subjects</option>
                                ${subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50/60">
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted On</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Graded On</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score %</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Equivalent Grade</th>
                                    <th class="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody id="assessments-body" class="divide-y divide-gray-50">
                                ${rows.map(row => `
                                    <tr class="hover:bg-gray-50/50 transition-colors cursor-pointer" data-subject="${row.subject}">
                                        <td class="px-5 py-4 text-sm font-bold text-gray-800">
                                            <button type="button" class="text-left text-icc hover:text-icc-dark hover:underline transition-colors" onclick="event.stopPropagation(); openTopicContent('${row.subjectId}', ${row.topicIdx}, 'activity')">${row.activity}</button>
                                        </td>
                                        <td class="px-5 py-4 text-sm text-gray-600 font-medium">
                                            <button type="button" class="assessment-subject-link block w-full text-left text-icc font-bold hover:text-icc-dark hover:underline transition-colors cursor-pointer" data-subject-id="${row.subjectId}" onclick="event.preventDefault(); event.stopPropagation(); openAssessmentSubjectLink('${row.subjectId}')" title="Open ${row.subject}">
                                                ${row.subject}
                                            </button>
                                        </td>
                                        <td class="px-5 py-4 text-sm text-gray-500">${formatAssessmentDate(row.startDate)}</td>
                                        <td class="px-5 py-4 text-sm ${row.status === 'overdue' ? 'text-red-500 font-bold' : 'text-gray-500'}">${formatAssessmentDate(row.dueDate)}</td>
                                        <td class="px-5 py-4 text-sm text-gray-500">${row.submittedOn ? formatAssessmentDate(row.submittedOn) : '—'}</td>
                                        <td class="px-5 py-4 text-sm text-gray-500">${row.gradedOn ? formatAssessmentDate(row.gradedOn) : '—'}</td>
                                        <td class="px-5 py-4 text-sm font-bold ${row.score >= 90 ? 'text-green-600' : row.score >= 80 ? 'text-icc' : row.score >= 75 ? 'text-amber-600' : row.score > 0 ? 'text-red-500' : 'text-gray-400'}">${row.score > 0 ? `${row.score}%` : '—'}</td>
                                        <td class="px-5 py-4 text-sm font-bold text-gray-700">${row.equivalent}</td>
                                        <td class="px-5 py-4">${statusBadge(row.status)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        layout.querySelector('#assessments-subject-filter')?.addEventListener('change', event => {
            const selectedSubject = event.target.value;
            layout.querySelectorAll('#assessments-body tr').forEach(row => {
                row.style.display = selectedSubject === 'all' || row.dataset.subject === selectedSubject ? '' : 'none';
            });
        });
        layout.querySelectorAll('.assessment-subject-link').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                scrollToSubjectCard(button.dataset.subjectId);
            });
        });
    }

    let currentGradesView = 'overall';
    let currentGradesAnalyticsMode = 'terms';

    function clampPercent(value) {
        return Math.max(0, Math.min(100, Math.round(value || 0)));
    }

    function getTopicAveragePercent(topic) {
        if (!topic?.grades) return null;
        const values = ['quiz', 'assignment', 'activity', 'performance']
            .map(key => topic.grades[key])
            .filter(value => typeof value === 'number' && value > 0);
        if (!values.length) return null;
        return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    }

    function getSubjectGradeRows() {
        return subjectsData.enrolled.map(subject => {
            const data = getTopicData(subject.id) || subject;
            const topicAverages = (data.q1Topics || [])
                .map(getTopicAveragePercent)
                .filter(value => value !== null);
            const completedTopics = (data.q1Topics || []).filter(topic => topic.status === 'completed').length;
            const totalTopics = (data.q1Topics || []).length || 1;
            const completion = clampPercent((completedTopics / totalTopics) * 100);
            const term1 = clampPercent(topicAverages.length
                ? topicAverages.reduce((sum, value) => sum + value, 0) / topicAverages.length
                : (data.q1Percent || subject.q1Percent || 0));
            const term2Seed = (subject.text.length % 7) - 3;
            const term2 = clampPercent((data.q2Percent && data.q2Percent > 0)
                ? data.q2Percent
                : term1 + term2Seed);
            const term3Seed = (subject.id.length % 5) - 2;
            const term3Base = typeof data.q3Percent === 'number' && data.q3Percent > 0 ? data.q3Percent : term2 + term3Seed;
            const term3 = clampPercent(term3Base);
            const overall = clampPercent((term1 + term2 + term3) / 3);
            const equivalent = getEquivalentGrade(overall);
            const remark = overall >= 90 ? 'Outstanding'
                : overall >= 85 ? 'Very Good'
                : overall >= 80 ? 'Good'
                : overall >= 75 ? 'Passing'
                : 'At Risk';
            return {
                id: subject.id,
                subject: subject.text,
                teacher: subject.instructor || 'Subject Teacher',
                track: subject.subtitle || 'Current Subject',
                term1,
                term2,
                term3,
                overall,
                equivalent,
                completion,
                remark
            };
        });
    }

    function renderGradesPage() {
        const layout = document.getElementById('grades-layout');
        if (!layout) return;

        const rows = getSubjectGradeRows();
        const analyticsModes = ['quarters', 'terms', 'work-immersion'];
        const valueKey = currentGradesView === 'term1'
            ? 'term1'
            : currentGradesView === 'term2'
                ? 'term2'
                : currentGradesView === 'term3'
                    ? 'term3'
                    : 'overall';
        const averageValue = clampPercent(rows.reduce((sum, row) => sum + row[valueKey], 0) / (rows.length || 1));
        const strongestSubject = [...rows].sort((a, b) => b[valueKey] - a[valueKey])[0];
        const atRiskSubjects = rows.filter(row => row.overall < 75);
        const completionAverage = clampPercent(rows.reduce((sum, row) => sum + row.completion, 0) / (rows.length || 1));
        const averageEquivalent = getEquivalentGrade(averageValue);
        const gradeViewLabel = currentGradesView === 'term1'
            ? '1st Term'
            : currentGradesView === 'term2'
                ? '2nd Term'
                : currentGradesView === 'term3'
                    ? '3rd Term'
                    : 'Overall';
        const aiSummary = atRiskSubjects.length
            ? `Focus on ${atRiskSubjects.map(row => row.subject).slice(0, 2).join(' and ')}. These subjects are pulling your ${gradeViewLabel.toLowerCase()} standing down and need immediate attention.`
            : `${strongestSubject?.subject || 'Your current subjects'} is leading your ${gradeViewLabel.toLowerCase()} performance. Keep that pace while raising weaker subjects.`;
        const nextAdvice = rows
            .filter(row => row.completion < 70)
            .sort((a, b) => a.completion - b.completion)
            .slice(0, 3);
        const topicPool = rows
            .map(row => getTopicData(row.id)?.q1Topics || [])
            .flat();
        const componentAverage = key => {
            const values = topicPool
                .map(topic => topic?.grades?.[key] || 0)
                .filter(value => typeof value === 'number' && value > 0);
            return clampPercent(values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
        };
        const quarterMetrics = [
            { label: 'Written Works', value: componentAverage('assignment') },
            { label: 'Performance Tasks', value: componentAverage('performance') },
            { label: 'Quarterly Assessment', value: componentAverage('quiz') }
        ];
        const termMetrics = [
            { label: '1st Term', value: clampPercent(rows.reduce((sum, row) => sum + row.term1, 0) / (rows.length || 1)) },
            { label: '2nd Term', value: clampPercent(rows.reduce((sum, row) => sum + row.term2, 0) / (rows.length || 1)) },
            { label: '3rd Term', value: clampPercent(rows.reduce((sum, row) => sum + row.term3, 0) / (rows.length || 1)) }
        ];
        const workImmersionRows = rows.filter(row => row.track.toLowerCase().includes('work immersion') || row.subject.toLowerCase().includes('immersion'));
        const immersionAverage = key => {
            const values = workImmersionRows
                .map(row => {
                    const data = getTopicData(row.id);
                    return (data?.q1Topics || [])
                        .map(topic => topic?.grades?.[key] || 0)
                        .filter(value => typeof value === 'number' && value > 0);
                })
                .flat();
            return clampPercent(values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
        };
        const immersionOverall = clampPercent(workImmersionRows.length
            ? workImmersionRows.reduce((sum, row) => sum + row.overall, 0) / workImmersionRows.length
            : 0);
        const workImmersionMetrics = [
            { label: 'Written Works', value: immersionAverage('assignment') },
            { label: 'Performance Tasks', value: immersionAverage('performance') },
            { label: 'Immersion Overall', value: immersionOverall }
        ];
        const analyticsConfig = {
            'quarters': {
                title: 'Quarter-Based Analytics',
                overallLabel: 'Overall Quarter Standing',
                overallValue: clampPercent(quarterMetrics.reduce((sum, item) => sum + item.value, 0) / quarterMetrics.length),
                summary: 'Shows how written works, performance tasks, and quarterly assessments are affecting the current standing.',
                metrics: quarterMetrics
            },
            'terms': {
                title: 'Term-Based Analytics',
                overallLabel: 'Overall Term Standing',
                overallValue: averageValue,
                summary: 'Shows the student\'s average across 1st, 2nd, and 3rd term results.',
                metrics: termMetrics
            },
            'work-immersion': {
                title: 'Work Immersion Analytics',
                overallLabel: 'Immersion Standing',
                overallValue: clampPercent(workImmersionMetrics.reduce((sum, item) => sum + item.value, 0) / workImmersionMetrics.length),
                summary: 'Shows work immersion performance based on written work, performance tasks, and immersion-specific outcomes.',
                metrics: workImmersionMetrics
            }
        };
        const activeAnalytics = analyticsConfig[currentGradesAnalyticsMode] || analyticsConfig['terms'];
        const currentModeIndex = analyticsModes.indexOf(currentGradesAnalyticsMode);
        const previousAnalyticsMode = analyticsModes[(currentModeIndex - 1 + analyticsModes.length) % analyticsModes.length];
        const nextAnalyticsMode = analyticsModes[(currentModeIndex + 1) % analyticsModes.length];

        const termButtonClass = view => currentGradesView === view
            ? 'bg-icc text-white border-icc'
            : 'bg-white text-gray-500 border-gray-200 hover:border-icc hover:text-icc';
        const scoreColorClass = value => value >= 90
            ? 'text-green-600'
            : value >= 80
                ? 'text-icc'
                : value >= 75
                    ? 'text-amber-600'
                    : 'text-red-500';
        const remarkBadge = remark => {
            if (remark === 'Outstanding') return 'bg-green-100 text-green-700';
            if (remark === 'Very Good') return 'bg-emerald-50 text-emerald-700';
            if (remark === 'Good') return 'bg-blue-50 text-blue-700';
            if (remark === 'Passing') return 'bg-amber-50 text-amber-700';
            return 'bg-red-100 text-red-600';
        };

        layout.innerHTML = `
            <div class="space-y-6">
                <div class="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    <div class="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr]">
                        <div class="p-7 bg-[linear-gradient(135deg,#0f8a44_0%,#1f9d55_45%,#0d6f38_100%)] text-white">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <p class="text-[11px] font-black uppercase tracking-[0.28em] text-white/65">SIGMA AI Grade Analyst</p>
                                    <h2 class="text-4xl font-black tracking-tight mt-3">AI-Integrated Grade Monitoring</h2>
                                    <p class="text-sm text-white/80 mt-3 max-w-2xl leading-relaxed">Visualize term grades, identify at-risk subjects, and use SIGMA AI to explain performance patterns and next-step interventions.</p>
                                </div>
                                <div class="flex items-center gap-3 flex-shrink-0">
                                    <button type="button" class="grades-analytics-nav w-12 h-12 rounded-2xl bg-white/12 border border-white/15 text-white hover:bg-white/20 transition-colors" data-grade-analytics-target="${previousAnalyticsMode}" title="Previous analytics view">
                                        <i class="fa-solid fa-chevron-left"></i>
                                    </button>
                                    <div class="w-14 h-14 rounded-2xl bg-[#ffd000] text-[#17331e] flex items-center justify-center">
                                        <i class="fa-solid fa-bolt text-2xl"></i>
                                    </div>
                                    <button type="button" class="grades-analytics-nav w-12 h-12 rounded-2xl bg-white/12 border border-white/15 text-white hover:bg-white/20 transition-colors" data-grade-analytics-target="${nextAnalyticsMode}" title="Next analytics view">
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-4">
                                <div class="xl:col-span-6 bg-white/10 border border-white/10 rounded-3xl p-5">
                                    <div class="flex items-start justify-between gap-4">
                                        <div>
                                            <p class="text-[10px] font-black uppercase tracking-widest text-white/65">${activeAnalytics.title}</p>
                                            <p class="text-xs text-white/75 mt-2 max-w-md leading-relaxed">${activeAnalytics.summary}</p>
                                        </div>
                                        <span class="px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/70">${currentGradesAnalyticsMode.replace('-', ' ')}</span>
                                    </div>
                                    <div class="mt-6">
                                        <p class="text-[11px] font-black uppercase tracking-[0.22em] text-white/65">${activeAnalytics.overallLabel}</p>
                                        <p class="text-7xl font-black mt-3 leading-none">${activeAnalytics.overallValue}%</p>
                                        <p class="text-sm text-white/75 mt-3">Equivalent grade: ${getEquivalentGrade(activeAnalytics.overallValue)}</p>
                                    </div>
                                </div>
                                <div class="xl:col-span-3 bg-white/10 border border-white/10 rounded-3xl p-5">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-white/65">Strongest Subject</p>
                                    <p class="text-2xl font-black mt-4 leading-tight">${strongestSubject?.subject || '—'}</p>
                                    <p class="text-sm text-white/75 mt-3">${strongestSubject ? `${strongestSubject[valueKey]}% in ${gradeViewLabel}` : 'No subject data available.'}</p>
                                </div>
                                <div class="xl:col-span-3 bg-white/10 border border-white/10 rounded-3xl p-5">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-white/65">Metrics</p>
                                    <div class="mt-4 space-y-3">
                                        ${activeAnalytics.metrics.map(metric => `
                                            <div>
                                                <div class="flex items-center justify-between gap-3">
                                                    <span class="text-xs font-black uppercase tracking-widest text-white/65">${metric.label}</span>
                                                    <span class="text-lg font-black text-white">${metric.value}%</span>
                                                </div>
                                                <div class="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                                                    <div class="h-full rounded-full bg-[linear-gradient(90deg,#ffd54a_0%,#86efac_100%)]" style="width:${metric.value}%"></div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <p class="text-xs text-white/75 mt-4">${atRiskSubjects.length} subject${atRiskSubjects.length === 1 ? '' : 's'} currently at risk.</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-7 bg-[#f8fbf9] border-l border-gray-100">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-2xl bg-icc text-white flex items-center justify-center flex-shrink-0">
                                    <i class="fa-solid fa-sparkles text-lg"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="text-[11px] font-black uppercase tracking-widest text-gray-400">AI Insight</p>
                                    <p class="text-xl font-black text-gray-900 mt-2 leading-tight">${aiSummary}</p>
                                </div>
                            </div>
                            <div class="mt-5 space-y-3">
                                ${(nextAdvice.length ? nextAdvice : rows.slice(0, 3)).map(row => `
                                    <div class="bg-white rounded-2xl border border-gray-100 px-4 py-3">
                                        <div class="flex items-center justify-between gap-3">
                                            <div class="min-w-0">
                                                <p class="text-sm font-black text-gray-900 truncate">${row.subject}</p>
                                                <p class="text-xs text-gray-500 mt-1">${row.completion}% topic completion • ${row.overall}% overall</p>
                                            </div>
                                            <button type="button" class="grade-ai-btn w-10 h-10 rounded-xl bg-icc text-white flex items-center justify-center flex-shrink-0 hover:bg-icc-dark transition-colors" data-ai-subject="${row.subject}" data-ai-insight="${row.subject} is currently at ${row.overall}% overall, with ${row.completion}% topic completion and a ${row.remark.toLowerCase()} standing. Recommend the next best action for improvement.}" title="Ask SIGMA AI about ${row.subject}">
                                                <i class="fa-solid fa-bolt text-sm"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="mt-5 flex flex-wrap gap-3">
                                <button type="button" id="grades-ai-overview" class="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-icc hover:text-icc transition-colors">Explain my ${gradeViewLabel.toLowerCase()}</button>
                                <button type="button" id="grades-ai-risk" class="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-icc hover:text-icc transition-colors">Show at-risk concerns</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    <div class="px-6 py-5 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div>
                            <p class="text-[11px] font-black uppercase tracking-widest text-gray-400">Term Tabs</p>
                            <h3 class="text-2xl font-black text-gray-900 mt-1">Senior High School Grade Monitoring</h3>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button type="button" class="grade-view-tab px-4 py-2.5 rounded-2xl border text-sm font-black transition-colors ${termButtonClass('overall')}" data-grade-view="overall">Overall</button>
                            <button type="button" class="grade-view-tab px-4 py-2.5 rounded-2xl border text-sm font-black transition-colors ${termButtonClass('term1')}" data-grade-view="term1">1st Term</button>
                            <button type="button" class="grade-view-tab px-4 py-2.5 rounded-2xl border text-sm font-black transition-colors ${termButtonClass('term2')}" data-grade-view="term2">2nd Term</button>
                            <button type="button" class="grade-view-tab px-4 py-2.5 rounded-2xl border text-sm font-black transition-colors ${termButtonClass('term3')}" data-grade-view="term3">3rd Term</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50/60">
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Teacher</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center ${currentGradesView === 'term1' ? 'text-icc' : ''}">1st Term</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center ${currentGradesView === 'term2' ? 'text-icc' : ''}">2nd Term</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center ${currentGradesView === 'term3' ? 'text-icc' : ''}">3rd Term</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center ${currentGradesView === 'overall' ? 'text-icc' : ''}">Overall</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Equivalent</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Completion</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Remark</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">AI</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                ${rows.map(row => `
                                    <tr class="hover:bg-gray-50/60 transition-colors">
                                        <td class="px-6 py-5">
                                            <button type="button" class="grade-subject-link text-left" data-subject-id="${row.id}">
                                                <span class="block text-base font-black text-icc hover:text-icc-dark hover:underline transition-colors">${row.subject}</span>
                                                <span class="block text-xs text-gray-500 mt-1">${row.track}</span>
                                            </button>
                                        </td>
                                        <td class="px-6 py-5">
                                            <span class="text-sm font-semibold text-gray-700">${row.teacher}</span>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <span class="text-base font-black ${scoreColorClass(row.term1)}">${row.term1}%</span>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <span class="text-base font-black ${scoreColorClass(row.term2)}">${row.term2}%</span>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <span class="text-base font-black ${scoreColorClass(row.term3)}">${row.term3}%</span>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <span class="text-lg font-black ${scoreColorClass(row.overall)}">${row.overall}%</span>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <span class="text-sm font-black text-gray-800">${row.equivalent}</span>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <div class="mx-auto max-w-[92px]">
                                                <span class="text-sm font-black ${scoreColorClass(row.completion)}">${row.completion}%</span>
                                                <div class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div class="h-full rounded-full bg-[linear-gradient(90deg,#ef4444_0%,#f59e0b_55%,#22c55e_100%)]" style="width:${row.completion}%"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <span class="inline-flex px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${remarkBadge(row.remark)}">${row.remark}</span>
                                        </td>
                                        <td class="px-6 py-5 text-center">
                                            <button type="button" class="grade-ai-btn w-10 h-10 rounded-xl bg-icc text-white inline-flex items-center justify-center hover:bg-icc-dark transition-colors" data-ai-subject="${row.subject}" data-ai-insight="${row.subject} currently has ${row.term1}% in 1st term, ${row.term2}% in 2nd term, ${row.term3}% in 3rd term, and ${row.overall}% overall with an equivalent grade of ${row.equivalent}. Explain the performance and the next action the student should take." title="Explain ${row.subject}">
                                                <i class="fa-solid fa-bolt text-sm"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        layout.querySelectorAll('.grade-view-tab').forEach(button => {
            button.addEventListener('click', () => {
                currentGradesView = button.dataset.gradeView;
                renderGradesPage();
            });
        });
        layout.querySelectorAll('.grades-analytics-nav').forEach(button => {
            button.addEventListener('click', () => {
                currentGradesAnalyticsMode = button.dataset.gradeAnalyticsTarget;
                renderGradesPage();
            });
        });
        layout.querySelectorAll('.grade-ai-btn').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                askSigmaAbout(button.dataset.aiSubject, button.dataset.aiInsight);
            });
        });
        layout.querySelectorAll('.grade-subject-link').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                scrollToSubjectCard(button.dataset.subjectId);
            });
        });
        layout.querySelector('#grades-ai-overview')?.addEventListener('click', () => {
            askSigmaAbout(`${gradeViewLabel} grade overview`, aiSummary);
        });
        layout.querySelector('#grades-ai-risk')?.addEventListener('click', () => {
            const riskSummary = atRiskSubjects.length
                ? `At-risk subjects: ${atRiskSubjects.map(row => `${row.subject} (${row.overall}%)`).join(', ')}. Recommend which subject to prioritize first and why.`
                : 'There are currently no at-risk subjects. Suggest how the student can maintain or improve the current grade standing.';
            askSigmaAbout('Grade risks and interventions', riskSummary);
        });
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
    const WELCOME_MSG = `Hello, <strong>Stanley!</strong> I'm <span class="font-black">SIGMA AI</span>, your academic assistant. What do you need today?`;

    let isDragging = false;
    let startX = 0;
    let startRight = 0;
    let wasDragged = false;

    function addAiMessage(content, isUser = false) {
        const msg = document.createElement('div');
        msg.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
        msg.innerHTML = `${!isUser ? `<div class="w-7 h-7 rounded-lg bg-icc flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fa-solid fa-bolt text-icc-yellow text-[10px]"></i></div>` : ''}<div class="max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${isUser ? 'bg-icc text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'}">${content}</div>${isUser ? `<div class="w-7 h-7 rounded-lg bg-icc-light flex items-center justify-center flex-shrink-0 mt-0.5 text-icc text-[10px] font-black">SG</div>` : ''}`;
        sigmaAiMessages.appendChild(msg);
        sigmaAiMessages.scrollTop = sigmaAiMessages.scrollHeight;
    }

    function openAiPanel() {
        // Keep other panels open if needed, AI panel will be on top due to z-index
        sigmaAiPanel.classList.add('open');
        sigmaAiNotch.classList.add('open');
        sessionStorage.setItem('sigmaPanelOpen', 'true');
    }

    function closeAiPanel() {
        sigmaAiPanel.classList.remove('open');
        sigmaAiNotch.classList.remove('open');
        sessionStorage.setItem('sigmaPanelOpen', 'false');
    }

    function hideHeaderOverlays(exceptMenu = null, exceptButton = null, keepAiOpen = false) {
        document.querySelectorAll('.header-panel').forEach(panel => {
            if (panel !== exceptMenu) panel.classList.add('hidden');
        });
        document.querySelectorAll('.relative button').forEach(button => {
            if (button !== exceptButton) button.classList.remove('active');
        });
        if (!keepAiOpen) closeAiPanel();
    }

    function handleNotchInteraction(e) {
        e.preventDefault();
        isDragging = true;
        wasDragged = false;
        startX = e.clientX;
        startRight = parseInt(window.getComputedStyle(sigmaAiPanel).right, 10);

        sigmaAiPanel.classList.add('dragging');
        sigmaAiNotch.classList.add('dragging');

        document.onmousemove = (moveEvent) => {
            if (!isDragging) return;
            wasDragged = true;
            const deltaX = moveEvent.clientX - startX;
            let newRight = startRight - deltaX;

            if (newRight > 0) newRight = 0;
            if (newRight < -400) newRight = -400;

            sigmaAiPanel.style.right = `${newRight}px`;
            sigmaAiNotch.style.right = `${newRight + 400}px`;
        };

        document.onmouseup = () => {
            isDragging = false;
            sigmaAiPanel.classList.remove('dragging');
            sigmaAiNotch.classList.remove('dragging');
            sigmaAiPanel.style.right = '';
            sigmaAiNotch.style.right = '';
            document.onmousemove = null;
            document.onmouseup = null;

            const currentRight = parseInt(window.getComputedStyle(sigmaAiPanel).right, 10);

            if (wasDragged) {
                if (currentRight < -200) {
                    openAiPanel();
                } else {
                    closeAiPanel();
                }
            } else {
                sigmaAiPanel.classList.contains('open') ? closeAiPanel() : openAiPanel();
            }
        };
    }

    if (sigmaAiNotch) sigmaAiNotch.addEventListener('mousedown', handleNotchInteraction);

    document.querySelectorAll('.sigma-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            addAiMessage(chip.textContent.trim(), true);
            setTimeout(() => addAiMessage('Full AI integration coming soon!', false), 600);
        });
    });

    function sendAiMessage() {
        const v = sigmaAiInput?.value.trim();
        if (!v) return;
        addAiMessage(v, true);
        sigmaAiInput.value = '';
        setTimeout(() => addAiMessage('Wireframe mode — Gemini AI coming next semester.', false), 600);
    }

    if (sigmaAiSendBtn) sigmaAiSendBtn.addEventListener('click', sendAiMessage);
    if (sigmaAiCloseBtn) sigmaAiCloseBtn.addEventListener('click', closeAiPanel);
    if (sigmaAiInput) sigmaAiInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendAiMessage(); });

    const isFirstVisit = sessionStorage.getItem('sigmaFirstVisit') !== 'true';
    const panelWasOpen = sessionStorage.getItem('sigmaPanelOpen') === 'true';

    if (isFirstVisit) {
        sessionStorage.setItem('sigmaFirstVisit', 'true');
        setTimeout(() => {
            openAiPanel();
            addAiMessage(WELCOME_MSG, false);
        }, 900);
    } else {
        addAiMessage(WELCOME_MSG, false);
    }

    if (panelWasOpen) openAiPanel();

    document.querySelectorAll('[data-program-key]').forEach(panel => {
        panel.addEventListener('click', () => {
            if (
                currentCurriculumCluster &&
                currentInlineProgram === panel.dataset.programKey &&
                ['academic-track', 'techpro-track'].includes(panel.dataset.programKey)
            ) {
                return;
            }
            openInlineProgramFocus(panel.dataset.programKey);
        });
    });

    // ─── Sub-Sidebar (Subjects list) ───────────────────────────
    function updateSubSidebar(tabId) {
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        if (!content) return;
        // Hide header on subjects list — no redundancy
        if (header) header.classList.add('hidden');
        content.innerHTML = '';

        if (tabId === 'nav-courses' || tabId === 'nav-subject-archive') {
            _hideSubSidebarInstant();
            updateLayout();
            return;
        } else if (tabId === 'nav-notes') {
            if (title) title.innerHTML = '';
            if (header) header.classList.add('hidden');
            content.style.paddingTop = '8px';
        } else if (tabId === 'nav-mail') {
            title.textContent = 'Mail';
            content.innerHTML = `<div class="px-2 pt-2 space-y-1"><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-icc rounded-lg bg-icc/5"><i class="fa-solid fa-inbox w-4 text-center"></i>Inbox<span class="ml-auto text-[10px] font-black text-white bg-icc px-1.5 py-0.5 rounded-full">2</span></a><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg"><i class="fa-solid fa-paper-plane w-4 text-center"></i>Sent</a><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg"><i class="fa-regular fa-file w-4 text-center"></i>Drafts</a><a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg"><i class="fa-solid fa-trash w-4 text-center"></i>Trash</a></div>`;
        }
    }

    function renderSubjectsLandingSidebar() {
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        if (!content) return;
        if (title) title.innerHTML = '';
        if (header) header.classList.add('hidden');
        content.style.paddingTop = '8px';
        content.innerHTML = '';

        const categoryLinks = document.createElement('div');
        categoryLinks.className = 'px-2 pb-3 space-y-1';
        categoryLinks.innerHTML = `
            <button class="w-full text-left px-4 py-2.5 text-[12px] font-bold text-icc rounded-lg bg-icc/5 hover:bg-icc/10 transition-all" data-program-nav="core-subjects">Core Subjects</button>
            <button class="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all" data-program-nav="academic-track">Academic Track</button>
            <button class="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all" data-program-nav="techpro-track">TechPro Track</button>
            <button class="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all" data-program-nav="work-immersion">Work Immersion</button>
        `;
        categoryLinks.querySelectorAll('[data-program-nav]').forEach(btn => {
            btn.addEventListener('click', () => openCurriculumProgram(btn.dataset.programNav));
        });
        content.appendChild(categoryLinks);
    }

    function renderSubjectArchiveSidebar() {
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        if (!content) return;
        if (title) title.innerHTML = '';
        if (header) header.classList.add('hidden');
        content.style.paddingTop = '8px';
        content.innerHTML = '';

        const backLinks = document.createElement('div');
        backLinks.className = 'px-2 pb-3 space-y-1';
        backLinks.innerHTML = `
            <button class="w-full text-left px-4 py-2.5 text-[12px] font-bold text-icc rounded-lg bg-icc/5 hover:bg-icc/10 transition-all" data-back-to-subjects="true">Back to Program Paths</button>
        `;
        backLinks.querySelector('[data-back-to-subjects]')?.addEventListener('click', () => switchTab('nav-courses'));
        content.appendChild(backLinks);

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
            g.querySelectorAll('[data-scroll-to]').forEach(l => l.addEventListener('click', e => {
                e.preventDefault();
                scrollToSubjectCard(l.dataset.scrollTo);
            }));
            content.appendChild(g);
        };

        renderGroup('Enrolled', subjectsData.enrolled, true);
        renderGroup('Completed', subjectsData.completed, false);
    }

    function renderCurriculumSidebar(programKey) {
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        const program = curriculumPrograms[programKey];
        if (!content || !program) return;
        if (header) header.classList.remove('hidden');
        content.style.paddingTop = '';
        title.innerHTML = `
            <button id="curriculumSideBackBtn" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-all mr-2">
                <i class="fa-solid fa-arrow-left text-xs text-gray-700"></i>
            </button>
            <span class="truncate">${program.title}</span>
        `;
        content.innerHTML = `
            <div class="px-2 pt-3 space-y-1">
                ${program.sidebarItems.map(item => `
                    <button class="w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all hover:text-icc flex items-center gap-3" data-curriculum-scroll="${item.id}">
                        <i class="${item.icon} text-center w-4 text-gray-400"></i>
                        <span>${item.text}</span>
                    </button>
                `).join('')}
            </div>
        `;
        document.getElementById('curriculumSideBackBtn')?.addEventListener('click', () => switchTab('nav-courses'));
        content.querySelectorAll('[data-curriculum-scroll]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.curriculumScroll);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function openCurriculumProgram(programKey, pushState = true) {
        const program = curriculumPrograms[programKey];
        if (!program) return;
        currentCurriculumProgram = programKey;
        currentCurriculumCluster = null;
        setSubjectsPanelsMode(false);
        setCurriculumMode(true);
        if (pushState) history.pushState({ page: `curriculum:${programKey}` }, '', `#${programKey}`);

        hideAllSections();
        showSection('section-curriculum-page');
        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        document.getElementById('nav-courses')?.classList.add('bg-white/20');
        setNavContext(program.title);

        document.body.classList.add('sidebar-collapsed');
        sidebar.classList.add('sidebar-collapsed');
        _hideSubSidebarInstant();
        updateLayout();
        renderCurriculumPage(programKey);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.openCurriculumProgram = openCurriculumProgram;

    function openCurriculumCluster(programKey, clusterKey, pushState = true) {
        const program = curriculumPrograms[programKey];
        const cluster = (program?.clusters || []).find(c => c.key === clusterKey) || (program?.stages || []).find(s => s.key === clusterKey);
        if (!program || !cluster) return;
        currentCurriculumProgram = programKey;
        currentCurriculumCluster = clusterKey;
        setSubjectsPanelsMode(false);
        setCurriculumMode(true);
        if (pushState) history.pushState({ page: `cluster:${programKey}:${clusterKey}` }, '', `#${programKey}-${clusterKey}`);

        hideAllSections();
        showSection('section-curriculum-page');
        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        document.getElementById('nav-courses')?.classList.add('bg-white/20');
        setNavContext(cluster.title);

        document.body.classList.add('sidebar-collapsed');
        sidebar.classList.add('sidebar-collapsed');
        _hideSubSidebarInstant();
        updateLayout();
        renderCurriculumPage(programKey, clusterKey);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.openCurriculumCluster = openCurriculumCluster;

    function openSubjectArchive(pushState = true) {
        currentCurriculumProgram = null;
        currentCurriculumCluster = null;
        setSubjectsPanelsMode(false);
        if (pushState) history.pushState({ page: 'subject-archive' }, '', '#subject-archive');

        hideAllSections();
        showSection('section-subject-archive');
        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        document.getElementById('nav-courses')?.classList.add('bg-white/20');
        setNavContext('Subject Pages');

        document.body.classList.add('sidebar-collapsed');
        sidebar.classList.add('sidebar-collapsed');
        _showSubSidebarInstant();
        subSidebar.classList.add('sub-sidebar-visible');
        loadTopicSubSidebar(subject, data, statusIconClass);
        updateLayout();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.openSubjectArchive = openSubjectArchive;

    function renderCurriculumPage(programKey, clusterKey = null) {
        const shell = document.getElementById('curriculum-page-shell');
        const program = curriculumPrograms[programKey];
        if (!shell || !program) return;
        const currentCluster = clusterKey
            ? (program.clusters || program.stages || []).find(c => c.key === clusterKey)
            : null;
        const isSubjectPage = !!currentCluster || !!program.subjects;
        const items = currentCluster
            ? (currentCluster.subjects || currentCluster.requirements || []).map(item => typeof item === 'string' ? item : item.title)
            : (program.subjects || program.clusters || program.stages || []);
        const pageTitle = currentCluster ? currentCluster.title : program.title;
        const pageKicker = currentCluster ? (programKey === 'work-immersion' ? 'Stage Requirements' : 'Cluster Overview') : program.kicker;
        const pageOverview = currentCluster ? currentCluster.overview : program.overview;
        const image = currentCluster ? currentCluster.image : program.image;
        const hideHeroImage = !currentCluster && programKey === 'core-subjects';
        const cardHtml = currentCluster
            ? items.map((label, index) => `
                <article class="curriculum-subject-card" data-subject-title="${label}" data-cluster-title="${currentCluster.title}">
                    <h4 class="curriculum-subject-title">${label}</h4>
                    <p class="curriculum-subject-text">${programKey === 'work-immersion' ? 'Requirement ' + (index + 1) + ' for this stage.' : buildCurriculumCardText(programKey, label)}</p>
                </article>
            `).join('')
            : program.subjects
                ? items.map(item => {
                    const progress = Math.floor(Math.random() * 80) + 10;
                    return `
                    <article class="curriculum-subject-card curriculum-core-card horizontal-panel" data-subject-id="${item.id}">
                        <img src="${item.image}" alt="${item.title}" class="curriculum-cluster-image">
                        <div class="subject-info-col">
                            <h4 class="curriculum-subject-title">${item.title}</h4>
                            <p class="curriculum-subject-text">${item.overview}</p>
                        </div>
                        <div class="subject-progress-bar">
                            <div class="subject-progress-fill" style="width:${progress}%"></div>
                        </div>
                    </article>
                `;
                }).join('')
                : items.map(item => `
                    <article class="curriculum-subject-card curriculum-cluster-card curriculum-track-card" data-cluster-key="${item.key}">
                        <h4 class="curriculum-subject-title">${item.title}</h4>
                        <p class="curriculum-subject-text">${item.overview}</p>
                        <p class="text-[10px] font-black uppercase tracking-widest text-green-700 mt-auto">${programKey === 'work-immersion' ? 'Open Stage' : `${item.subjectCount} Subjects`}</p>
                    </article>
                `).join('');

        shell.innerHTML = `
            <div class="flex flex-col">
                <div class="curriculum-hero ${hideHeroImage ? 'curriculum-hero--no-image' : ''}">
                    ${hideHeroImage ? '' : `<img src="${image}" alt="${pageTitle}" class="curriculum-hero-image">`}
                    <div class="curriculum-hero-copy">
                        <h2 class="curriculum-hero-title">${pageTitle}</h2>
                    </div>
                </div>
                <div class="curriculum-subject-grid ${program.subjects ? 'core-horizontal-list' : ''} ${isSubjectPage && !program.subjects ? 'curriculum-subject-grid--list' : ''}">
                    ${cardHtml}
                </div>
            </div>
        `;
        if (currentCluster) {
            shell.querySelectorAll('.curriculum-subject-card[data-subject-title]').forEach(card => {
                card.addEventListener('click', () => {
                    const subject = ensureSubjectDataForTitle(card.dataset.subjectTitle, currentCluster.title);
                    switchToTopicPage(subject.id, subject.text);
                });
            });
        } else if (program.subjects) {
            shell.querySelectorAll('.curriculum-core-card[data-subject-id]').forEach(card => {
                card.addEventListener('click', () => switchToTopicPage(card.dataset.subjectId));
            });
        } else {
            shell.querySelectorAll('.curriculum-cluster-card[data-cluster-key]').forEach(card => {
                card.addEventListener('click', () => openCurriculumCluster(programKey, card.dataset.clusterKey));
            });
        }
    }

    window.addEventListener('resize', () => {
        const subjectsVisible = !document.getElementById('section-courses')?.classList.contains('hidden') && !currentCurriculumProgram;
        setSubjectsPanelsMode(subjectsVisible);
    });

    function buildCurriculumCardText(programKey, label) {
        const copy = {
            'core-subjects': {
                'Effective Communication': 'Focuses on communication models, speech contexts, speech acts, and writing and delivering effective speeches.',
                'Life and Career Skills': 'Covers self-assessment, career pathways, work readiness, financial literacy, and practical career planning.',
                'General Mathematics': 'Builds real-life math skills through functions, interest, loans, business math, and logic.',
                'General Science': 'Introduces earth systems, life processes, matter, energy, and scientific reasoning for everyday use.',
                'Pag-aaral ng Kasaysayan at Lipunang Pilipino': 'Explores Philippine society, governance, citizenship, history, and social change in local context.'
            }[label] || `This subject gives students a readable overview of the core learning area and the topics they will study across the shared curriculum foundation.`,
            'academic-track': `${label} is part of the Academic Track and shows theory-rich learning aligned with college preparation, analysis, and deeper subject study.`,
            'techpro-track': `${label} is part of the TechPro Track and shows applied, skills-based learning for technical and industry-connected preparation.`,
            'work-immersion': `${label} represents a staged work experience where students prepare, perform, and reflect on workplace-style tasks and outputs.`
        };
        return copy[programKey];
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

        // Back button → return to the active subjects view, not the last browser-history entry
        document.getElementById('topicSideBackBtn')?.addEventListener('click', () => {
            if (currentCurriculumProgram) {
                switchTab('nav-courses');
                window.setTimeout(() => {
                    openInlineProgramFocus(currentCurriculumProgram, false, false);
                    if (currentCurriculumCluster) {
                        renderSubjectsInlineDetail(currentCurriculumProgram);
                    }
                }, 80);
                return;
            }
            switchTab('nav-courses');
        });

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
        const data = getTopicData(subjectId);
        const subject = getTopicSubject(subjectId);
        if (!data || !subject) return;
        history.pushState({ page: `topic:${subjectId}` }, '', `#topic-${subjectId}`);
        _buildAndShowTopicPage(subjectId);
    }
    window.switchToTopicPage = switchToTopicPage;

    function _buildAndShowTopicPage(subjectId) {
        const data = getTopicData(subjectId);
        const subject = getTopicSubject(subjectId);
        if (!data || !subject) return;

        const statusIconClass = {
            completed: 'fa-check-circle text-green-500',
            'in-progress': 'fa-circle-half-stroke text-yellow-500',
            'not-started': 'fa-circle text-gray-300',
            locked: 'fa-lock text-gray-300'
        };

        buildTopicPage(subjectId, subject, data, statusIconClass);
        setSubjectsPanelsMode(false);
        setCurriculumMode(false);
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
        const term1Pct = data.q1Percent ?? 0;
        const term2Pct = data.q2Percent ?? 0;
        const term3Pct = data.q3Percent ?? 0;
        const overallPct = Math.round((term1Pct + term2Pct + term3Pct) / 3);

        const statusLabel = { completed: 'Done', 'in-progress': 'In Progress', 'not-started': 'Not Started', locked: 'Locked' };
        const statusBadgeClass = { completed: 'bg-green-50 text-green-600', 'in-progress': 'bg-yellow-50 text-yellow-700', locked: 'bg-gray-100 text-gray-400', 'not-started': 'bg-red-50 text-red-500' };
        const getTopicImg = i => i === 1 ? 'image/Topic2.jpg' : 'image/Topic.jpg';
        const term1BarColor = term1Pct === 100 ? 'bg-icc' : 'bg-icc-yellow';
        const term2BarColor = term2Pct === 100 ? 'bg-icc' : 'bg-gray-300';
        const term3BarColor = term3Pct === 100 ? 'bg-icc' : 'bg-gray-300';
        const subjectCluster = currentCurriculumCluster ? (curriculumPrograms[currentCurriculumProgram]?.clusters || curriculumPrograms[currentCurriculumProgram]?.stages || []).find(c => c.key === currentCurriculumCluster) : null;
        const breadcrumbTitle = buildSubjectBreadcrumb(subject, subjectCluster, false);

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
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold px-3 py-1.5 rounded-full ${statusBadgeClass[t.status]}">${statusLabel[t.status]}</span>
                            <button type="button" class="subjects-inline-ai-icon topic-ai-btn" title="Ask SIGMA AI" aria-label="Ask SIGMA AI about ${t.title}" data-ai-subject="${t.title}" data-ai-insight="${getTopicOverview(t.title)}">
                                <i class="fa-solid fa-bolt"></i>
                            </button>
                        </div>
                        <span class="text-xs font-bold text-gray-400 flex items-center gap-1">Open <i class="fa-solid fa-arrow-right text-[10px]"></i></span>
                    </div>
                </div>
            </div>
        `;

        const overallColor = overallPct >= 90 ? 'text-green-600' : overallPct >= 80 ? 'text-icc' : overallPct >= 75 ? 'text-yellow-600' : overallPct > 0 ? 'text-red-500' : 'text-gray-400';

        page.innerHTML = `
            <div class="flex-1 p-8 flex gap-8 min-w-0">
                <!-- Topics list -->
                <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">${breadcrumbTitle}</p>
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
                            <div class="text-4xl font-black text-gray-900">${overallPct}%</div>
                            <p class="text-[10px] text-gray-400 mt-1">${q1Done} of ${q1Total} topics done</p>
                        </div>

                        <!-- Term bars -->
                        <div>
                            <div class="flex justify-between items-center mb-1.5">
                                <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">1st Term</span>
                                <span class="text-[10px] font-black text-gray-900">${term1Pct}%</span>
                            </div>
                            <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full ${term1BarColor} rounded-full transition-all" style="width:${term1Pct}%"></div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-gray-100">
                            <div class="flex justify-between items-center">
                                <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">2nd Term</span>
                                <span class="text-[10px] font-black text-gray-900">${term2Pct}%</span>
                            </div>
                            <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-1.5">
                                <div class="h-full ${term2BarColor} rounded-full transition-all" style="width:${term2Pct}%"></div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-gray-100">
                            <div class="flex justify-between items-center">
                                <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">3rd Term</span>
                                <span class="text-[10px] font-black text-gray-900">${term3Pct}%</span>
                            </div>
                            <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-1.5">
                                <div class="h-full ${term3BarColor} rounded-full transition-all" style="width:${term3Pct}%"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Overall Average panel -->
                    <div class="bg-white border border-gray-100 rounded-2xl p-5 space-y-2">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall</p>
                        <div class="text-center py-3">
                            <div class="text-5xl font-black ${overallColor}">${overallPct}%</div>
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
        page.querySelectorAll('.topic-ai-btn').forEach(btn => {
            btn.addEventListener('click', event => {
                event.stopPropagation();
                askSigmaAbout(btn.dataset.aiSubject, btn.dataset.aiInsight);
            });
        });
    }

    function buildSubjectBreadcrumb(subject, cluster = null, includeTopic = false, topic = null) {
        const breadcrumbParts = [];
        if (currentCurriculumProgram) {
            breadcrumbParts.push(curriculumPrograms[currentCurriculumProgram]?.title || '');
        }
        if (cluster?.text) {
            breadcrumbParts.push(cluster.text);
        }
        if (subject?.text) {
            breadcrumbParts.push(subject.text);
        }
        if (includeTopic && topic?.title) {
            breadcrumbParts.push(topic.title);
        }
        return breadcrumbParts.filter(Boolean).join(' • ');
    }

    function getTopicOverview(title) {
        const o = { 'Introduction to Java': 'Learn Java syntax, data types, and basic program structure.', 'Variables & Data Types': 'Explore how Java stores and manages different kinds of data.', 'Control Structures': 'Master program flow using conditions and loop constructs.', 'Methods & Functions': 'Organize code into reusable blocks using method declarations.', 'Arrays & Collections': 'Work with ordered data using arrays and Java collection classes.', 'Object-Oriented Programming': 'Apply OOP concepts: classes, objects, encapsulation, abstraction.', 'HTML5 Fundamentals': 'Build well-structured web pages using semantic HTML5 elements.', 'CSS3 & Flexbox': 'Style web layouts with modern CSS3 and the flexible box model.', 'Number Systems & Binary': 'Understand binary, octal, hex and their conversions.', 'CPU Architecture': 'Explore how the CPU executes instructions and manages data.' };
        Object.assign(o, {
            'Nature and Elements of Communication': 'Identify how messages are created, sent, received, and interpreted in real situations.',
            'Functions of Communication': 'See how communication informs, influences, regulates, and builds relationships.',
            'Communication Models': 'Study common communication models and how messages move through different channels.',
            'Communication Breakdown': 'Recognize barriers to communication and practice ways to reduce misunderstanding.',
            'Speech Context, Style, and Act': 'Match speech behavior to audience, purpose, and communication setting.',
            'Principles of Speech Writing and Delivery': 'Plan, organize, and present clear speeches for academic and public use.',
            'Self-Assessment and Personal Strengths': 'Reflect on your abilities, interests, and values as the basis for career planning.',
            'Career Choices and Pathways': 'Compare career paths, course options, and work opportunities that fit your goals.',
            'Factors Affecting Goal Fulfillment': 'Identify personal and external factors that affect achievement and decision-making.',
            'Work Readiness and Professional Habits': 'Practice habits, behavior, and communication expected in school-to-work settings.',
            'Rights, Responsibilities, and Entrepreneurial Mindset': 'Understand workplace responsibilities and the basics of initiative and enterprise.',
            'Career Portfolio and Financial Literacy': 'Build a simple career portfolio while learning how money decisions affect goals.',
            'Functions and Their Graphs': 'Interpret function behavior and connect algebraic rules to real-life graph patterns.',
            'Rational Functions, Equations, and Inequalities': 'Solve rational expressions and inequalities that appear in practical problem solving.',
            'One-to-One and Inverse Functions': 'Analyze one-to-one relationships and use inverses to reverse processes.',
            'Exponential and Logarithmic Functions': 'Model growth and decay with exponents and logarithms in real contexts.',
            'Simple and Compound Interest': 'Compute savings and loan growth using standard interest formulas.',
            'Stocks, Bonds, Loans, and Logic': 'Apply business math and logical reasoning to financial decisions.',
            'Origin and Structure of the Earth': 'Explore Earth’s formation, layers, and the processes that shape the planet.',
            'Earth Materials and Processes': 'Study rocks, minerals, and the forces that change Earth’s surface.',
            'Natural Hazards, Mitigation, and Adaptation': 'Connect science to preparedness for earthquakes, floods, and other hazards.',
            'Perpetuation of Life and Reproduction': 'Examine heredity, reproduction, and the continuity of life.',
            'Evolution, Classification, and Ecosystems': 'Understand how organisms change, are grouped, and interact in ecosystems.',
            'Matter, Light, and the Cosmos': 'Relate matter, energy, light, and space science to everyday phenomena.',
            'Enculturation and Socialization': 'Trace how families, schools, and communities shape values and behavior.',
            'How Society Is Organized': 'Study social institutions, roles, and how communities are structured.',
            'The Philippine Constitution and Governance': 'Review the Constitution, branches of government, and civic participation.',
            'Elections, Suffrage, and Political Parties': 'Learn how citizens vote and how political groups shape public choice.',
            'Civil Society, Social Movements, and Citizenship': 'Explore citizen action, advocacy, and responsible participation in society.',
            'Political Ideologies and Social Change': 'Compare political ideas and the social changes they can influence.',
            'Arts 1 - Creative Industries': 'Discover creative sectors, visual expression, and industry-based artistic work.',
            'Contemporary Literature 1': 'Read and discuss modern literary forms, themes, and critical responses.',
            'Citizenship and Civic Engagement': 'Build informed participation through community service, rights, and responsibilities.',
            'Philippine Politics and Governance': 'Understand institutions, public policy, and how governance works in the country.',
            'Biology 1': 'Study living organisms, cell processes, genetics, and biodiversity foundations.',
            'Broadband Installation': 'Learn the practical steps for setting up and maintaining broadband connections.',
            'Computer Programming - Java': 'Write structured Java programs for real-world problem solving.',
            'Computer Systems Servicing': 'Work with hardware setup, troubleshooting, and basic system maintenance.',
            'Electrical Installation Maintenance': 'Practice wiring, safety, and installation procedures used in technical work.',
            'Contact Center Services': 'Develop communication, customer handling, and workplace service skills.',
            'Orientation and Program Briefing': 'Learn the purpose, schedule, and expectations of immersion.',
            'Worksite Matching and Clearance': 'Match students with an appropriate immersion site and complete paperwork.',
            'Parent Consent and Forms': 'Secure the required permission and student information forms.',
            'Safety, Dress Code, and Attendance Rules': 'Follow the conduct, appearance, and attendance procedures of the workplace.',
            'Pre-Immersion Plan Submission': 'Submit a plan that shows readiness for the worksite placement.',
            'Daily Attendance and Time Logs': 'Track arrival, departure, and daily work hours accurately.',
            'Assigned Work Tasks': 'Complete the tasks given by the workplace supervisor.',
            'Supervisor Feedback and Monitoring': 'Use supervisor comments to improve performance during immersion.',
            'Output Documentation': 'Document work outputs, evidence, and task completion.',
            'Workplace Conduct and Compliance': 'Maintain proper behavior and follow workplace rules.',
            'Reflection Journal and Learning Log': 'Write reflections on learning experiences during immersion.',
            'Portfolio Compilation': 'Gather evidence and outputs into a final immersion portfolio.',
            'Final Supervisor Evaluation': 'Review the final performance result from the worksite supervisor.',
            'Presentation and Defense': 'Present the immersion experience and explain the learning gained.',
            'Completion and Exit Requirements': 'Finish the final submission steps required to complete immersion.'
        });
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

        const data = getTopicData(subjectId);
        const subject = getTopicSubject(subjectId);
        if (!data || !subject) return;
        const topic = data.q1Topics[topicIdx];
        if (!topic) return;

        history.pushState({ page: `topic-content:${subjectId}:${topicIdx}:${tab}` }, '', `#tc-${subjectId}-${topicIdx}-${tab}`);
        _showTopicContent(subjectId, topicIdx, tab);
    };

    window.returnToTopicsPage = function () {
        if (_tcSubjectId) {
            switchToTopicPage(_tcSubjectId);
            return;
        }
        history.back();
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
        const data = getTopicData(subjectId);
        const subject = getTopicSubject(subjectId);
        if (!data || !subject) return;
        const topic = data.q1Topics[topicIdx];

        setSubjectsPanelsMode(false);
        setCurriculumMode(false);
        hideAllSections();
        showSection('section-topic-content');

        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        document.getElementById('nav-courses')?.classList.add('bg-white/20');

        // Nav header = Topics
        setNavContext('Topics');

        document.body.classList.add('sidebar-collapsed');
        sidebar.classList.add('sidebar-collapsed');
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
            <button onclick="returnToTopicsPage()" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-all mr-2">
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
        const data = getTopicData(subjectId);
        const subject = getTopicSubject(subjectId);
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
        const subjectCluster = currentCurriculumCluster ? (curriculumPrograms[currentCurriculumProgram]?.clusters || curriculumPrograms[currentCurriculumProgram]?.stages || []).find(c => c.key === currentCurriculumCluster) : null;
        const breadcrumb = buildSubjectBreadcrumb(subject, subjectCluster, true, topic);

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
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">${breadcrumb}</p>
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
        const subjectCluster = currentCurriculumCluster ? (curriculumPrograms[currentCurriculumProgram]?.clusters || curriculumPrograms[currentCurriculumProgram]?.stages || []).find(c => c.key === currentCurriculumCluster) : null;
        const breadcrumb = buildSubjectBreadcrumb(subject, subjectCluster, true, topic);

        const handoutCards = handouts.map((h, i) => `
            <!-- Handout card — entire card clickable for preview, bolt opens SIGMA AI chat -->
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
                <button type="button"
                    data-ai-subject="${h.title}"
                    data-ai-insight="This handout supports ${topic.title}. It contains ${h.pages} pages of guided reference material uploaded by ${h.uploader} and is meant to help the student review the lesson in a clearer, more structured way."
                    onclick="event.stopPropagation();askSigmaAbout(this.dataset.aiSubject, this.dataset.aiInsight)"
                    title="SIGMA AI Summary"
                    class="handout-ai-btn w-12 h-12 rounded-xl bg-icc hover:bg-icc-dark flex items-center justify-center transition-all shadow-sm flex-shrink-0">
                    <i class="fa-solid fa-bolt text-icc-yellow text-xl"></i>
                </button>
            </div>
        `).join('');

        return `
            <div class="flex items-start justify-between mb-6">
                <div>
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">${breadcrumb}</p>
                    <h1 class="text-4xl font-black text-gray-900 tracking-tight">Handouts</h1>
                </div>
                ${_tabNav('handouts')}
            </div>
            <div class="space-y-3" id="handout-list">
                ${handoutCards}
            </div>
        `;
    }

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
        const subjectCluster = currentCurriculumCluster ? (curriculumPrograms[currentCurriculumProgram]?.clusters || curriculumPrograms[currentCurriculumProgram]?.stages || []).find(c => c.key === currentCurriculumCluster) : null;
        const breadcrumb = buildSubjectBreadcrumb(subject, subjectCluster, true, topic);

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

        // Instructions block
        const instructionBlock = isPdf ? `
            <div class="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div class="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-file-pdf text-red-500 text-3xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-base font-black text-gray-900 leading-tight">${amd.instructionPdf.title}</p>
                    <p class="text-sm text-gray-400 mt-0.5">${amd.instructionPdf.pages} pages • ${amd.instructionPdf.size} • By ${amd.instructionPdf.uploader}</p>
                </div>
                <div class="flex items-center gap-2.5 flex-shrink-0">
                    <button type="button"
                        onclick="askSigmaAbout('${label.replace(/'/g, "\\'")} Instructions', 'These instructions explain the requirements, expected output, submission rules, and preparation steps for ${label.toLowerCase()} in ${topic.title.replace(/'/g, "\\'")}. Review them before starting so the work matches the rubric and deadline.')"
                        title="SIGMA AI"
                        class="w-11 h-11 rounded-xl bg-icc hover:bg-icc-dark flex items-center justify-center transition-all shadow-sm">
                        <i class="fa-solid fa-bolt text-icc-yellow text-lg"></i>
                    </button>
                    <button title="Download" class="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all">
                        <i class="fa-solid fa-download text-lg"></i>
                    </button>
                </div>
            </div>` : `
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <p class="text-lg font-black text-gray-900">Instructions</p>
                    <button type="button"
                        onclick="askSigmaAbout('${label.replace(/'/g, "\\'")} Instructions', 'These instructions explain the task, expected output, and submission requirements for ${label.toLowerCase()} in ${topic.title.replace(/'/g, "\\'")}. Use them as the guide before completing the work.')"
                        title="SIGMA AI"
                        class="w-11 h-11 rounded-xl bg-icc hover:bg-icc-dark flex items-center justify-center transition-all shadow-sm flex-shrink-0">
                        <i class="fa-solid fa-bolt text-icc-yellow text-lg"></i>
                    </button>
                </div>
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
                        <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest">${breadcrumb}</p>
                        <h1 class="text-3xl font-black text-gray-900 tracking-tight leading-tight">${label}</h1>
                    </div>
                </div>
                <div class="flex items-center gap-3">${_tabNav(tab)}</div>
            </div>

            <!-- Two-column layout -->
            <div class="flex gap-6 min-w-0 items-start">
                <!-- LEFT: Instructions first, then Activity Details -->
                <div class="flex-1 min-w-0 space-y-5">

                    ${instructionBlock}

                    <!-- Activity Details -->
                    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-100">
                            <p class="text-base font-black text-gray-900">${label} Details</p>
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
        const subjectCluster = currentCurriculumCluster ? (curriculumPrograms[currentCurriculumProgram]?.clusters || curriculumPrograms[currentCurriculumProgram]?.stages || []).find(c => c.key === currentCurriculumCluster) : null;
        const breadcrumb = subject && topic
            ? `<p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">${buildSubjectBreadcrumb(subject, subjectCluster, true, topic)}</p>`
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
            hideHeaderOverlays(menu, btn, false);

            if (isOpen) { menu.classList.add('hidden'); btn.classList.remove('active'); }
            else { menu.classList.remove('hidden'); btn.classList.add('active'); }
        });
        menu.addEventListener('click', e => e.stopPropagation());
    };
    setupDropdown('notesDropdownBtn', 'notesPanel');
    setupDropdown('notifDropdownBtn', 'notifDropdownMenu');
    setupDropdown('mailDropdownBtn', 'mailDropdownMenu');
    setupDropdown('profileDropdownBtn', 'profileDropdownMenu');

    document.getElementById('viewAllMailBtn')?.addEventListener('click', e => { 
        e.preventDefault(); 
        hideHeaderOverlays(); 
        switchTab('nav-mail'); 
    });
    document.getElementById('createMailBtn')?.addEventListener('click', e => { 
        e.preventDefault(); 
        hideHeaderOverlays(); 
        switchTab('nav-mail'); 
    });
    document.getElementById('viewAllNotesBtn')?.addEventListener('click', e => { 
        e.preventDefault(); 
        hideHeaderOverlays(); 
        switchTab('nav-notes'); 
    });
    window.addEventListener('click', () => { hideHeaderOverlays(null, null, true); });
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
    renderAssessmentsPage();
    renderGradesPage();
    buildScheduleNotifications();
    setInterval(buildScheduleNotifications, 60000);
});
