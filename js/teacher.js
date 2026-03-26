/* TEACHER DASHBOARD CORE LOGIC */

document.addEventListener('DOMContentLoaded', () => {
    // Disable transitions during initialization
    document.documentElement.classList.add('no-transition');

    const sidebar = document.getElementById('sidebar');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const navLinks = document.querySelectorAll('#sidebar nav a');
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');

    // SIGMA AI Elements
    const sigmaAiNotch = document.getElementById('sigmaAiNotch');
    const sigmaAiPanel = document.getElementById('sigmaAiPanel');
    const sigmaAiMessages = document.getElementById('sigmaAiMessages');
    const sigmaAiInput = document.getElementById('sigmaAiInput');
    const sigmaAiSendBtn = document.getElementById('sigmaAiSendBtn');
    const sigmaAiCloseBtn = document.getElementById('sigmaAiCloseBtn');

    // --- Navigation Setup ---
    const sectionMap = {
        'nav-dashboard': 'section-dashboard',
        'nav-classes': 'section-classes',
        'nav-subjects': 'section-subjects',
        'nav-gradebook': 'section-gradebook',
        'nav-analytics': 'section-analytics',
        'nav-attendance': 'section-attendance',
        'nav-mail': 'section-messages',
        'nav-advisory': 'section-advisory'
    };

    // Header Logo Link
    const navLogoBtn = document.getElementById('nav-logo-btn');
    if (navLogoBtn) {
        navLogoBtn.onclick = () => switchTab('nav-dashboard');
    }

    // --- Sidebar Default State ---
    // Start collapsed on desktop, similar to student page
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) {
        document.body.classList.add('sidebar-collapsed');
        if (sidebar) sidebar.classList.add('sidebar-collapsed');
    }

    // Force reflow and re-enable transitions
    window.getComputedStyle(document.documentElement).opacity;
    document.documentElement.classList.remove('no-transition');

    // Update layout on load and force initial tab state
    updateLayout();
    switchTab('nav-dashboard');

    // --- Sample Data ---
    const subjectsData = {
        core: [
            { id: 'subj-effcomm', text: 'Effective Communication', icon: 'fa-solid fa-comments', grade: 'Grade 11', sections: ['Grade 11 - A', 'Grade 11 - B', 'Grade 11 - C'] },
            { id: 'subj-lifecareer', text: 'Life and Career Skills', icon: 'fa-solid fa-heart-circle-check', grade: 'Grade 11', sections: ['Grade 11 - A', 'Grade 11 - B'] },
            { id: 'subj-genmath', text: 'General Mathematics', icon: 'fa-solid fa-square-root-variable', grade: 'Grade 11', sections: ['Grade 11 - A', 'Grade 11 - D'] },
            { id: 'subj-gensci', text: 'General Science', icon: 'fa-solid fa-flask', grade: 'Grade 11', sections: ['Grade 11 - B', 'Grade 11 - C'] },
            { id: 'subj-history', text: 'Pag-aaral ng Kasaysayan at Lipunang Pilipino', icon: 'fa-solid fa-landmark', grade: 'Grade 11', sections: ['Grade 11 - A', 'Grade 11 - B'] }
        ],
        academic: [
            { 
                id: 'acad-cluster-arts', 
                text: 'Arts, Social Sciences, and Humanities', 
                icon: 'fa-solid fa-palette',
                subjects: [
                    { id: 'subj-arts-1', text: 'Arts 1 - Creative Industries', icon: 'fa-solid fa-palette', grade: 'Grade 11', sections: ['Grade 11 - A', 'Grade 11 - B'] },
                    { id: 'subj-lit-1', text: 'Contemporary Literature 1', icon: 'fa-solid fa-book-open', grade: 'Grade 11', sections: ['Grade 11 - C'] },
                    { id: 'subj-civic', text: 'Citizenship and Civic Engagement', icon: 'fa-solid fa-people-arrows', grade: 'Grade 12', sections: ['Grade 12 - A', 'Grade 12 - B'] }
                ]
            },
            { 
                id: 'acad-cluster-stem', 
                text: 'Science, Tech, Engineering, and Math', 
                icon: 'fa-solid fa-atom',
                subjects: [
                    { id: 'subj-bio-1', text: 'Biology 1', icon: 'fa-solid fa-dna', grade: 'Grade 11', sections: ['Grade 11 - A', 'Grade 11 - B'] },
                    { id: 'subj-phys-1', text: 'Physics 1', icon: 'fa-solid fa-microscope', grade: 'Grade 12', sections: ['Grade 12 - A'] }
                ]
            }
        ],
        techpro: [
            { 
                id: 'tech-cluster-ict', 
                text: 'ICT Support and Computer Programming', 
                icon: 'fa-solid fa-laptop-code',
                subjects: [
                    { id: 'subj-prog1', text: 'Programming 1', icon: 'fa-solid fa-code', grade: 'Grade 11', sections: ['Grade 11 - A', 'Grade 11 - B'] },
                    { id: 'subj-css', text: 'Computer Systems Servicing', icon: 'fa-solid fa-screwdriver-wrench', grade: 'Grade 11', sections: ['Grade 11 - C'] }
                ]
            },
            { 
                id: 'tech-cluster-hospitality', 
                text: 'Hospitality and Tourism', 
                icon: 'fa-solid fa-hotel',
                subjects: [
                    { id: 'subj-frontoffice', text: 'Front Office Services', icon: 'fa-solid fa-bell-concierge', grade: 'Grade 11', sections: ['Grade 11 - A'] },
                    { id: 'subj-foodbev', text: 'Food and Beverage', icon: 'fa-solid fa-utensils', grade: 'Grade 12', sections: ['Grade 12 - A', 'Grade 12 - B'] }
                ]
            }
        ],
        immersion: [
            { id: 'subj-immersion', text: 'Work Immersion', icon: 'fa-solid fa-briefcase', grade: 'Grade 12', sections: ['Grade 12 - A', 'Grade 12 - B', 'Grade 12 - C'] }
        ]
    };

    const studentsBySection = {
        'Grade 11 - ICT A': Array.from({ length: 25 }, (_, i) => ({
            id: `2026-${String(i + 1).padStart(3, '0')}`,
            name: `${['Abad', 'Bautista', 'Cruz', 'Dela Cruz', 'Estacio', 'Ferrer', 'Garcia', 'Hernandez', 'Ignacio', 'Jimenez', 'Lozano', 'Mendoza', 'Navarro', 'Ocampo', 'Perez', 'Quinto', 'Ramos', 'Santos', 'Torres', 'Umali', 'Valdez', 'Villanueva', 'Wong', 'Yabut', 'Zosa'][i % 25]}, ${['Juan', 'Maria', 'Jose', 'Ana', 'Ricardo', 'Liza', 'Antonio', 'Elena', 'Fernando', 'Gloria', 'Gabriel', 'Hilda', 'Ismael', 'Juliana', 'Kevin', 'Lourdes', 'Manuel', 'Nina', 'Oscar', 'Pilar', 'Quentin', 'Rosa', 'Samuel', 'Teresa', 'Victor'][i % 25]}`,
            status: Math.random() > 0.1 ? 'Active' : 'At Risk',
            attendance: Math.floor(Math.random() * 20) + 80 // 80-100%
        })),
        'Grade 11 - STEM A': Array.from({ length: 25 }, (_, i) => ({
            id: `2026-S-${String(i + 1).padStart(3, '0')}`,
            name: `Student ${i + 1}`,
            status: 'Active',
            attendance: 95
        }))
    };
    window.studentsBySection = studentsBySection; // Expose for showStudentList

    // --- Sub-Sidebar Logic ---
    function updateSubSidebar(tabId, clusterSubjects = null, clusterTitle = null) {
        const subSidebar = document.getElementById('sub-sidebar');
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        
        if (!subSidebar || !content) return;

        // Reset visibility
        if (!clusterSubjects) {
            subSidebar.classList.add('hidden');
            document.body.classList.remove('sub-sidebar-open');
            if (header) header.classList.add('hidden');
            content.innerHTML = '';
        }

        if (tabId === 'nav-subjects') {
            subSidebar.classList.remove('hidden');
            document.body.classList.add('sub-sidebar-open');
            if (header) header.classList.remove('hidden');
            
            if (clusterSubjects) {
                // RENDER SUBJECTS FOR SELECTED CLUSTER
                if (title) title.innerHTML = `<div class="flex items-center gap-2"><button id="back-to-clusters" class="hover:text-icc transition-colors"><i class="fa-solid fa-arrow-left text-xs"></i></button> <span class="truncate">${clusterTitle}</span></div>`;
                content.innerHTML = '';
                
                const backBtn = title.querySelector('#back-to-clusters');
                if (backBtn) backBtn.onclick = () => updateSubSidebar('nav-subjects');

                clusterSubjects.forEach(subject => {
                    const link = document.createElement('a');
                    link.href = '#';
                    link.className = 'sub-sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-bold text-black hover:bg-gray-100 rounded-lg transition-all hover:text-icc mb-1';
                    link.innerHTML = `<i class="${subject.icon} text-center w-4 text-gray-400"></i><span>${subject.text}</span>`;
                    link.onclick = (e) => {
                        e.preventDefault();
                        renderSubjectManagement(subject);
                    };
                    content.appendChild(link);
                });
                return;
            }

            // DEFAULT VIEW: CLUSTERS AND TRACKS
            if (title) title.textContent = 'Subjects';
            content.innerHTML = '';
            
            const renderGroup = (label, items, isOpen = false) => {
                if (!items || items.length === 0) return;
                const g = document.createElement('div');
                g.className = `sub-nav-group ${isOpen ? 'active' : ''}`;
                g.innerHTML = `
                    <div class="sub-nav-group-header flex items-center justify-between cursor-pointer select-none">
                        <span class="group-label text-black">${label}</span>
                        <i class="fa-solid fa-chevron-right text-[8px] text-black transition-transform"></i>
                    </div>
                    <div class="sub-nav-items">
                        ${items.map(item => `
                            <a href="#" class="sub-sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-bold text-black hover:bg-gray-100 rounded-lg transition-all hover:text-icc mb-1" 
                               data-id="${item.id}" data-has-subjects="${!!item.subjects}">
                                <i class="${item.icon} text-center w-4 text-gray-400"></i>
                                <span>${item.text}</span>
                            </a>
                        `).join('')}
                    </div>
                `;
                g.querySelector('.sub-nav-group-header').addEventListener('click', () => g.classList.toggle('active'));
                
                // Add click listeners to items
                g.querySelectorAll('.sub-sidebar-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const id = link.getAttribute('data-id');
                        const hasSubjects = link.getAttribute('data-has-subjects') === 'true';
                        
                        if (hasSubjects) {
                            // Find cluster and its subjects
                            const cluster = [...subjectsData.academic, ...subjectsData.techpro].find(c => c.id === id);
                            if (cluster) {
                                updateSubSidebar('nav-subjects', cluster.subjects, cluster.text);
                            }
                        } else {
                            // Direct subject (Core or Immersion)
                            const subject = [...subjectsData.core, ...subjectsData.immersion].find(s => s.id === id);
                            if (subject) renderSubjectManagement(subject);
                        }
                    });
                });

                content.appendChild(g);
            };

            renderGroup('Core Subject', subjectsData.core, false);
            renderGroup('Academic track', subjectsData.academic, false);
            renderGroup('TechPro track', subjectsData.techpro, false);
            renderGroup('Work Immersion', subjectsData.immersion, false);
        }
    }

    // --- Layout Utility ---
    function updateLayout() {
        if (!layoutWrapper) return;
        
        if (window.innerWidth < 1024) {
            layoutWrapper.style.marginLeft = '0';
            return;
        }

        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        const subSidebar = document.getElementById('sub-sidebar');
        const isSubVisible = subSidebar && !subSidebar.classList.contains('hidden');
        
        const mainWidth = isCollapsed ? 82 : 220;
        const subWidth = isSubVisible ? 240 : 0;
        
        layoutWrapper.style.marginLeft = (mainWidth + subWidth) + 'px';
    }

    // --- Navigation Logic ---
    function switchTab(navId) {
        const targetSectionId = sectionMap[navId];
        if (!targetSectionId) return;

        // Close side panels when switching main sections
        closeAiPanel();
        document.querySelectorAll('[id$="Menu"], [id$="Panel"]').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.relative button').forEach(b => b.classList.remove('active'));

        // Update active nav link
        navLinks.forEach(l => l.classList.remove('bg-white/20'));
        const activeLink = document.getElementById(navId);
        if (activeLink) activeLink.classList.add('bg-white/20');

        // Handle Sections
        document.querySelectorAll('.dynamic-section').forEach(s => s.classList.add('hidden'));
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) targetSection.classList.remove('hidden');

        // Update Nav Context Title (except Dashboard)
        const navContext = document.getElementById('nav-context');
        const navContextText = document.getElementById('nav-context-text');
        if (navContext && navContextText) {
            if (navId === 'nav-dashboard') {
                navContext.classList.remove('visible');
            } else {
                navContext.classList.add('visible');
                const titles = {
                    'nav-classes': 'Classrooms',
                    'nav-subjects': 'Subjects',
                    'nav-gradebook': 'Gradebook',
                    'nav-analytics': 'Analytics',
                    'nav-advisory': 'Advisory',
                    'nav-attendance': 'Attendance',
                    'nav-mail': 'Messages'
                };
                navContextText.textContent = titles[navId] || 'Teacher Dashboard';
            }
        }

        // Update Sub-Sidebar
        updateSubSidebar(navId);

        // --- SCROLLBAR FIX FOR SUBJECTS ---
        if (navId === 'nav-subjects') {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }

        // Initialize section-specific features
        if (navId === 'nav-dashboard') {
            setTimeout(() => {
                setupInsightsCarousel();
                renderDashboardSchedule();
            }, 100); // Ensure carousel is initialized when dashboard is shown
        }
        if (navId === 'nav-subjects') {
            renderSubjectManagement(null); // Clear main content when switching to subjects
        }
        if (navId === 'nav-attendance') {
            setTimeout(() => setupAttendanceCalendar(), 100); // Small delay to ensure DOM is ready
        }
        if (navId === 'nav-gradebook') {
            setTimeout(() => initGradebook(), 100);
        }
        if (navId === 'nav-analytics') {
            setTimeout(() => setupAnalyticsTab(), 100);
        }

        // Sidebar behavior: Expanded on Dashboard, Collapsed on others
        const shouldCollapse = navId !== 'nav-dashboard';
        document.body.classList.toggle('sidebar-collapsed', shouldCollapse);
        if (sidebar) sidebar.classList.toggle('sidebar-collapsed', shouldCollapse);

        updateLayout();
    }

    // Expose switchTab globally for inline event handlers (logo button etc.)
    window.switchTab = switchTab;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.id);
        });
    });

    // --- View All Messages/Notes Buttons ---
    document.getElementById('viewAllMailBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideHeaderOverlays();
        switchTab('nav-mail');
    });
    document.getElementById('createMailBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideHeaderOverlays();
        switchTab('nav-mail');
    });
    document.getElementById('viewAllNotesBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideHeaderOverlays();
        switchTab('nav-notes');
    });

    // --- Classroom Navigation ---
    window.showStudentList = function(className, subject) {
        const grid = document.getElementById('classrooms-grid');
        const detailView = document.getElementById('classroom-detail-view');
        const studentBody = document.getElementById('student-roster-body');
        const recordingBody = document.getElementById('attendance-recording-body');
        const rightPanel = document.getElementById('classes-right-panel');
        const mainCol = document.getElementById('classes-main-col');
        
        // Unified Header Elements
        const mainTitle = document.getElementById('classes-section-title');
        const headerSubject = document.getElementById('classes-header-subject');
        const headerDivider = document.getElementById('classes-header-divider');
        const backBtn = document.getElementById('class-back-btn');
        const detailTabs = document.getElementById('classes-detail-tabs');

        if (!grid || !detailView || !studentBody) return;

        // Update main content headers
        if (mainTitle) mainTitle.textContent = className;
        if (headerSubject) {
            headerSubject.textContent = subject;
            headerSubject.classList.remove('hidden');
        }
        if (headerDivider) headerDivider.classList.remove('hidden');
        if (backBtn) backBtn.classList.remove('hidden');
        if (detailTabs) detailTabs.classList.remove('hidden');
        
        // Hide advisory panel when inside a specific room
        if (rightPanel) rightPanel.classList.add('hidden');
        if (mainCol) {
            mainCol.classList.remove('lg:col-span-3');
            mainCol.classList.add('lg:col-span-4');
        }

        const students = studentsBySection[className] || [];

        // 1. Calculate Statistics
        const total = students.length;
        const atRisk = students.filter(s => s.status === 'At Risk').length;
        const active = total - atRisk;
        const avgAtt = Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / (total || 1));

        const statTotal = document.getElementById('stat-total-students');
        const statActive = document.getElementById('stat-active-students');
        const statAtRisk = document.getElementById('stat-at-risk-students');
        const statAvg = document.getElementById('stat-avg-attendance');

        if (statTotal) statTotal.textContent = total;
        if (statActive) statActive.textContent = active;
        if (statAtRisk) statAtRisk.textContent = atRisk;
        if (statAvg) statAvg.textContent = `${avgAtt}%`;

        // 2. Render Student Roster
        studentBody.innerHTML = students.map(s => `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-icc-light flex items-center justify-center text-icc font-bold text-xs uppercase">
                            ${s.name.split(', ')[1][0]}${s.name[0]}
                        </div>
                        <span class="text-sm font-bold text-gray-800">${s.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-xs font-medium text-gray-500">${s.id}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-icc rounded-full" style="width: ${s.attendance}%"></div>
                        </div>
                        <span class="text-[10px] font-bold text-gray-600">${s.attendance}%</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 ${s.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-[9px] font-black uppercase rounded-lg">
                        ${s.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button class="text-icc font-bold text-[10px] uppercase tracking-widest hover:underline">View Profile</button>
                </td>
            </tr>
        `).join('');

        // 3. Render Attendance Recording Grid
        if (recordingBody) {
            recordingBody.innerHTML = students.map(s => `
                <tr class="hover:bg-white transition-colors group">
                    <td class="px-6 py-4">
                        <span class="text-sm font-bold text-gray-800">${s.name}</span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-center gap-2">
                            <button onclick="markAttendance(this, 'P')" class="attendance-btn w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:border-icc hover:text-icc transition-all flex items-center justify-center text-[10px] font-black active-present" data-status="P">P</button>
                            <button onclick="markAttendance(this, 'A')" class="attendance-btn w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center text-[10px] font-black active-absent" data-status="A">A</button>
                            <button onclick="markAttendance(this, 'L')" class="attendance-btn w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:border-yellow-500 hover:text-yellow-500 transition-all flex items-center justify-center text-[10px] font-black active-late" data-status="L">L</button>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <input type="text" placeholder="Add excuse note..." class="w-full bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-icc/20 outline-none placeholder:text-gray-300">
                    </td>
                </tr>
            `).join('');
        }

        grid.classList.add('hidden');
        detailView.classList.remove('hidden');
        
        // Reset to first tab
        switchClassDetailTab('students');
    };

    window.markAttendance = function(btn, status) {
        const row = btn.closest('tr');
        const btns = row.querySelectorAll('.attendance-btn');
        
        btns.forEach(b => {
            b.classList.remove('bg-icc', 'text-white', 'border-icc', 'bg-red-500', 'bg-yellow-500');
            b.classList.add('bg-white', 'text-gray-400', 'border-gray-200');
        });

        btn.classList.remove('bg-white', 'text-gray-400', 'border-gray-200');
        if (status === 'P') btn.classList.add('bg-icc', 'text-white', 'border-icc');
        if (status === 'A') btn.classList.add('bg-red-500', 'text-white', 'border-red-500');
        if (status === 'L') btn.classList.add('bg-yellow-500', 'text-white', 'border-yellow-500');
    };

    window.submitAttendance = function() {
        const btn = event.target.closest('button');
        const originalHtml = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-2"></i>Processing...';

        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Attendance Submitted!';
            btn.classList.replace('bg-icc', 'bg-green-600');
            
            setTimeout(() => {
                alert('SUCCESS: Daily attendance has been recorded and synced to the Gradebook.');
                btn.innerHTML = originalHtml;
                btn.disabled = false;
                btn.classList.replace('bg-green-600', 'bg-icc');
                
                // Switch back to student roster
                switchClassDetailTab('students');
            }, 1000);
        }, 1500);
    };

    window.switchClassDetailTab = function(tabId) {
        const sections = ['students', 'attendance', 'analytics', 'materials'];
        sections.forEach(id => {
            const section = document.getElementById(`detail-section-${id}`);
            const btn = document.getElementById(`tab-btn-${id}`);
            if (section) section.classList.toggle('hidden', id !== tabId);
            if (btn) {
                if (id === tabId) {
                    btn.classList.add('border-icc', 'text-icc');
                    btn.classList.remove('border-transparent', 'text-gray-400');
                } else {
                    btn.classList.remove('border-icc', 'text-icc');
                    btn.classList.add('border-transparent', 'text-gray-400');
                }
            }
        });
    };

    window.backToClassrooms = function() {
        const grid = document.getElementById('classrooms-grid');
        const detailView = document.getElementById('classroom-detail-view');
        const rightPanel = document.getElementById('classes-right-panel');
        const mainCol = document.getElementById('classes-main-col');
        
        const mainTitle = document.getElementById('classes-section-title');
        const headerSubject = document.getElementById('classes-header-subject');
        const headerDivider = document.getElementById('classes-header-divider');
        const backBtn = document.getElementById('class-back-btn');
        const detailTabs = document.getElementById('classes-detail-tabs');

        if (grid && detailView) {
            detailView.classList.add('hidden');
            grid.classList.remove('hidden');
            
            // Reset main content headers
            if (mainTitle) mainTitle.textContent = 'Classrooms';
            if (headerSubject) headerSubject.classList.add('hidden');
            if (headerDivider) headerDivider.classList.add('hidden');
            if (backBtn) backBtn.classList.add('hidden');
            if (detailTabs) detailTabs.classList.add('hidden');
            
            // Show advisory panel again
            if (rightPanel) rightPanel.classList.remove('hidden');
            if (mainCol) {
                mainCol.classList.remove('lg:col-span-4');
                mainCol.classList.add('lg:col-span-3');
            }
        }
    };

    // --- Sigma AI Insights Carousel ---
    function setupInsightsCarousel() {
        const wrapper = document.getElementById('ai-insights-wrapper');
        const dotsContainer = document.getElementById('insight-dots');
        const prevBtn = document.getElementById('prev-insight');
        const nextBtn = document.getElementById('next-insight');

        if (!wrapper || !dotsContainer || !prevBtn || !nextBtn) return;

        const insights = [
            {
                icon: 'fa-solid fa-triangle-exclamation',
                iconColor: 'text-red-500',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                title: 'Critical Student Concerns',
                text: `<div class="space-y-2">
                    <div class="bg-white/50 p-3 rounded-lg">
                        <div class="font-semibold text-red-700 mb-1">At-Risk Students (5 total)</div>
                        <div class="text-xs space-y-1">
                            <div>• Maria Santos: Gen Math (72%)</div>
                            <div>• Juan Dela Cruz: Programming (68%)</div>
                            <div>• Ana Reyes: Empowerment Tech (71%)</div>
                        </div>
                    </div>
                    <div class="bg-white/30 p-3 rounded-lg">
                        <div class="font-semibold text-red-600 mb-1">Immediate Actions Required</div>
                        <div class="text-xs space-y-1">
                            <div>• Schedule parent-teacher conferences</div>
                            <div>• Arrange tutoring for Programming</div>
                            <div>• Monitor progress weekly</div>
                        </div>
                    </div>
                </div>`
            },
            {
                icon: 'fa-solid fa-user-shield',
                iconColor: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                title: 'Behavioral & Participation',
                text: `<div class="space-y-3">
                    <div class="bg-white/50 p-3 rounded-lg">
                        <div class="font-semibold text-amber-700 mb-2">Engagement Drop: -15%</div>
                        <div class="text-xs space-y-1">
                            <div>• 4 students consistently silent in class</div>
                            <div>• Reduced participation in forum discussions</div>
                            <div>• Late logins to LMS recorded for 6 students</div>
                        </div>
                    </div>
                    <div class="bg-white/30 p-3 rounded-lg">
                        <div class="font-semibold text-amber-600 mb-1">Suggested Outreach</div>
                        <div class="text-xs">Individual check-ins during advisory hour recommended.</div>
                    </div>
                </div>`
            },
            {
                icon: 'fa-solid fa-file-circle-exclamation',
                iconColor: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                title: 'Submission Trends',
                text: `<div class="space-y-3">
                    <div class="bg-white/50 p-3 rounded-lg">
                        <div class="font-semibold text-orange-700 mb-2">Missing Lab Exercises</div>
                        <div class="text-xs space-y-1">
                            <div>• Lab #4: 8 students have not submitted</div>
                            <div>• Quiz #2: 3 students missed deadline</div>
                        </div>
                    </div>
                    <div class="bg-white/30 p-3 rounded-lg">
                        <div class="font-semibold text-orange-600 mb-1">Auto-Reminders</div>
                        <div class="text-xs">SIGMA has drafted reminders for these students. Review and send?</div>
                    </div>
                </div>`
            },
            {
                icon: 'fa-solid fa-chart-line',
                iconColor: 'text-green-500',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                title: 'Section Performance Alert',
                text: `<div class="space-y-3">
                    <div class="bg-white/50 p-3 rounded-lg">
                        <div class="font-semibold text-green-700 mb-2">Performance Drop: -8% GPA</div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>• Database normalization: 45% errors</div>
                            <div>• CSS Grid layouts: 38% incomplete</div>
                        </div>
                    </div>
                    <div class="bg-white/30 p-3 rounded-lg">
                        <div class="font-semibold text-green-600 mb-2">Recommended Interventions</div>
                        <div class="text-xs space-y-1">
                            <div>• Schedule review sessions</div>
                            <div>• Provide practice materials</div>
                            <div>• One-on-one consultations</div>
                        </div>
                    </div>
                </div>`
            },
            {
                icon: 'fa-solid fa-person-chalkboard',
                iconColor: 'text-blue-500',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                title: 'Teaching Intervention Needed',
                text: `<div class="space-y-3">
                    <div class="bg-white/50 p-3 rounded-lg">
                        <div class="font-semibold text-blue-700 mb-2">Learning Gap: OOP Concepts</div>
                        <div class="text-xs space-y-1">
                            <div>• 12 students affected</div>
                            <div>• Inheritance: 65% struggling</div>
                            <div>• Polymorphism: 58% incomplete</div>
                        </div>
                    </div>
                    <div class="bg-white/30 p-3 rounded-lg">
                        <div class="font-semibold text-blue-600 mb-2">Implementation Plan</div>
                        <div class="text-xs space-y-1">
                            <div>• Peer tutoring program</div>
                            <div>• Interactive coding exercises</div>
                            <div>• Visual learning aids</div>
                        </div>
                    </div>
                </div>`
            },
            {
                icon: 'fa-solid fa-calendar-check',
                iconColor: 'text-orange-500',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                title: 'Attendance & Engagement',
                text: `<div class="space-y-3">
                    <div class="bg-white/50 p-3 rounded-lg">
                        <div class="font-semibold text-orange-700 mb-2">Attendance Issues</div>
                        <div class="text-xs space-y-1">
                            <div>• Carlo Mendoza: 3 consecutive days</div>
                            <div>• Sofia Garcia: 2 consecutive days</div>
                            <div>• Assignment submissions: -15%</div>
                        </div>
                    </div>
                    <div class="bg-white/30 p-3 rounded-lg">
                        <div class="font-semibold text-orange-600 mb-2">Follow-up Actions</div>
                        <div class="text-xs space-y-1">
                            <div>• Contact parents immediately</div>
                            <div>• Provide catch-up materials</div>
                            <div>• Monitor engagement patterns</div>
                        </div>
                    </div>
                </div>`
            },
            {
                icon: 'fa-solid fa-brain',
                iconColor: 'text-purple-500',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200',
                title: 'Academic Progress Insights',
                text: `<div class="space-y-3">
                    <div class="bg-white/50 p-3 rounded-lg">
                        <div class="font-semibold text-purple-700 mb-2">Performance Trends</div>
                        <div class="text-xs space-y-1">
                            <div class="text-green-600">✓ 8 students improved in Web Dev (+12% avg)</div>
                            <div class="text-red-600">⚠ 6 students showing burnout signs</div>
                            <div>• Declining quiz scores despite attendance</div>
                        </div>
                    </div>
                    <div class="bg-white/30 p-3 rounded-lg">
                        <div class="font-semibold text-purple-600 mb-2">Support Recommendations</div>
                        <div class="text-xs space-y-1">
                            <div>• Adjust workload distribution</div>
                            <div>• Provide mental health resources</div>
                            <div>• Implement progress check-ins</div>
                        </div>
                    </div>
                </div>`
            }
        ];

        let currentIndex = 0;

        function renderInsights() {
            wrapper.innerHTML = insights.map(insight => `
                <div class="flex-shrink-0 p-4" style="width: ${100 / insights.length}%">
                    <div class="p-6 rounded-xl border-l-4 ${insight.borderColor} ${insight.bgColor} h-full flex flex-col">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                                <i class="${insight.icon} ${insight.iconColor} text-base"></i>
                            </div>
                            <h4 class="font-bold text-gray-800 text-base leading-tight">${insight.title}</h4>
                        </div>
                        <div class="flex-1 text-sm text-gray-700 leading-relaxed whitespace-normal break-words space-y-3">
                            ${insight.text}
                        </div>
                        <div class="mt-4 pt-3 border-t border-white/30">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Priority</span>
                                <div class="flex items-center gap-1">
                                    <div class="w-2 h-2 rounded-full bg-red-400"></div>
                                    <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <div class="w-2 h-2 rounded-full bg-green-400"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Set wrapper width for proper sliding
            wrapper.style.width = `${insights.length * 100}%`;

            dotsContainer.innerHTML = insights.map((_, i) => `
                <button class="w-2 h-2 rounded-full ${i === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors"></button>
            `).join('');

            // Add dot listeners
            dotsContainer.querySelectorAll('button').forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateCarousel();
                });
            });
        }

        function updateCarousel() {
            const translateX = -currentIndex * (100 / insights.length);
            wrapper.style.transform = `translateX(${translateX}%)`;
            // Update dots
            dotsContainer.querySelectorAll('button').forEach((dot, i) => {
                dot.className = `w-2 h-2 rounded-full ${i === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors`;
            });
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + insights.length) % insights.length;
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % insights.length;
            updateCarousel();
        });

        renderInsights();
        updateCarousel();
    }

    // --- Attendance Calendar ---
    function setupAttendanceCalendar() {
        const monthYearEl = document.getElementById('attendance-calendar-month-year');
        const daysGridEl = document.getElementById('attendance-calendar-days-grid');
        const prevBtn = document.getElementById('attendance-prevMonthBtn');
        const nextBtn = document.getElementById('attendance-nextMonthBtn');
        const eventPanel = document.getElementById('attendance-calendar-event-panel');
        const eventContent = document.getElementById('attendance-calendar-event-content');

        if (!monthYearEl || !daysGridEl || !prevBtn || !nextBtn) return;

        let currentDate = new Date(2026, 2, 22); // March 2026

        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            // Update month/year header
            monthYearEl.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            // Clear previous content
            daysGridEl.innerHTML = '';

            // Add day headers
            const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayHeaders.forEach(day => {
                const headerEl = document.createElement('div');
                headerEl.className = 'text-[10px] font-black text-gray-400 uppercase tracking-widest py-2';
                headerEl.textContent = day;
                daysGridEl.appendChild(headerEl);
            });

            // Get first day of month and last day
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            // Sample attendance events
            const attendanceEvents = {
                '2026-03-15': { type: 'attendance', title: 'Daily Attendance', status: 'completed', present: 43, absent: 2, late: 0 },
                '2026-03-16': { type: 'attendance', title: 'Daily Attendance', status: 'completed', present: 42, absent: 3, late: 0 },
                '2026-03-17': { type: 'attendance', title: 'Daily Attendance', status: 'completed', present: 44, absent: 1, late: 0 },
                '2026-03-18': { type: 'attendance', title: 'Daily Attendance', status: 'completed', present: 41, absent: 4, late: 0 },
                '2026-03-19': { type: 'attendance', title: 'Daily Attendance', status: 'completed', present: 43, absent: 2, late: 0 },
                '2026-03-20': { type: 'attendance', title: 'Daily Attendance', status: 'scheduled', time: '8:00 AM' },
                '2026-03-21': { type: 'attendance', title: 'Daily Attendance', status: 'scheduled', time: '8:00 AM' },
                '2026-03-22': { type: 'attendance', title: 'Daily Attendance', status: 'in-progress', time: '8:00 AM' }
            };

            // Render calendar days
            for (let i = 0; i < 42; i++) {
                const dayEl = document.createElement('div');
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);

                const dateStr = date.toISOString().split('T')[0];
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === new Date().toDateString();
                const hasEvent = attendanceEvents[dateStr];

                dayEl.className = `relative p-1 text-center cursor-pointer hover:bg-gray-50 rounded-lg transition-all ${
                    isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
                } ${isToday ? 'bg-icc/10 text-icc font-bold' : ''}`;

                dayEl.innerHTML = `
                    <div class="text-xs font-medium mb-1">${date.getDate()}</div>
                    ${hasEvent ? `<div class="w-1.5 h-1.5 rounded-full mx-auto ${
                        hasEvent.status === 'completed' ? 'bg-green-500' :
                        hasEvent.status === 'in-progress' ? 'bg-icc' : 'bg-gray-300'
                    }"></div>` : ''}
                `;

                if (hasEvent) {
                    dayEl.addEventListener('click', () => showAttendanceEvent(hasEvent, date));
                }

                daysGridEl.appendChild(dayEl);
            }
        }

        function showAttendanceEvent(event, date) {
            eventContent.innerHTML = `
                <div class="text-center mb-3">
                    <div class="text-sm font-bold text-gray-800 mb-1">${event.title}</div>
                    <div class="text-xs text-gray-500">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
                ${event.status === 'completed' ? `
                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div class="p-2 bg-green-50 rounded-lg">
                            <div class="text-lg font-bold text-green-600">${event.present}</div>
                            <div class="text-[9px] font-bold text-green-500 uppercase">Present</div>
                        </div>
                        <div class="p-2 bg-red-50 rounded-lg">
                            <div class="text-lg font-bold text-red-500">${event.absent}</div>
                            <div class="text-[9px] font-bold text-red-500 uppercase">Absent</div>
                        </div>
                        <div class="p-2 bg-yellow-50 rounded-lg">
                            <div class="text-lg font-bold text-yellow-600">${event.late || 0}</div>
                            <div class="text-[9px] font-bold text-yellow-500 uppercase">Late</div>
                        </div>
                    </div>
                ` : `
                    <div class="p-3 bg-blue-50 rounded-lg text-center">
                        <div class="text-sm font-bold text-blue-600 mb-1">Scheduled for ${event.time}</div>
                        <div class="text-xs text-blue-500">Click to take attendance</div>
                    </div>
                `}
            `;
            eventPanel.classList.remove('hidden');
        }

        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        renderCalendar();
    }

    // Initialize Attendance Calendar on load
    setupAttendanceCalendar();

    // --- Message Interactions ---
    function setupMessageInteractions() {
        const messageReader = document.getElementById('message-reader');

        // Sample message data
        const messages = {
            1: {
                sender: 'Maria Santos',
                role: 'Parent of Juan Dela Cruz • Grade 11 - ICT A',
                avatar: 'MS',
                avatarColor: 'bg-icc-light text-icc',
                date: 'March 22, 2026',
                time: '2:15 PM',
                subject: 'Regarding Juan\'s performance in General Mathematics',
                content: `
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Dear Teacher,
                    </p>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        I wanted to discuss Juan's recent grades in General Mathematics. He's been struggling with the new topics and I noticed his grades have dropped significantly. He's been trying his best but seems to be having difficulty understanding the concepts.
                    </p>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Could we schedule a parent-teacher conference to discuss this matter? I'd like to understand what we can do at home to support his learning. Juan mentioned that he finds the trigonometry lessons particularly challenging.
                    </p>
                    <p class="text-gray-700 leading-relaxed">
                        Thank you for your attention to this matter. I look forward to your response.
                    </p>
                    <p class="text-gray-700 leading-relaxed mt-4">
                        Best regards,<br>
                        Maria Santos
                    </p>
                `
            },
            2: {
                sender: 'Anna Garcia',
                role: 'Student • Grade 11 - ICT A',
                avatar: 'AG',
                avatarColor: 'bg-blue-100 text-blue-600',
                date: 'March 22, 2026',
                time: '9:30 AM',
                subject: 'Question about Programming assignment',
                content: `
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Hi Teacher,
                    </p>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        I'm having trouble with the database normalization exercise. Could you please clarify what the difference is between 1NF, 2NF, and 3NF? I understand the basic concepts but I'm getting confused when trying to apply them to the sample database schema we were given.
                    </p>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Also, for the practical exercise, do we need to create the actual tables in MySQL or just draw the ER diagram?
                    </p>
                    <p class="text-gray-700 leading-relaxed">
                        Thank you for your help!
                    </p>
                    <p class="text-gray-700 leading-relaxed mt-4">
                        Best,<br>
                        Anna
                    </p>
                `
            },
            3: {
                sender: 'Carlo Dela Cruz',
                role: 'Parent of Carlo Mendoza • Grade 11 - ICT A',
                avatar: 'CD',
                avatarColor: 'bg-red-100 text-red-600',
                date: 'March 21, 2026',
                time: '4:45 PM',
                subject: 'Concern about attendance',
                content: `
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Dear Teacher,
                    </p>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        I wanted to reach out regarding Carlo's attendance. I noticed that he has been absent for 3 consecutive days now. Is there something wrong at school? Carlo hasn't mentioned any issues to me, but I'm concerned about his education.
                    </p>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Could you please let me know what's happening? I'd like to make sure everything is okay and see if there's anything we can do to help Carlo get back on track.
                    </p>
                    <p class="text-gray-700 leading-relaxed">
                        Thank you for your attention to this matter.
                    </p>
                    <p class="text-gray-700 leading-relaxed mt-4">
                        Sincerely,<br>
                        Carlo Dela Cruz
                    </p>
                `
            }
        };

        function showMessage(messageId) {
            const message = messages[messageId];
            if (!message || !messageReader) return;

            messageReader.innerHTML = `
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full ${message.avatarColor} flex items-center justify-center font-bold text-base flex-shrink-0">
                        ${message.avatar}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <div>
                                <h4 class="text-lg font-bold text-gray-800">${message.sender}</h4>
                                <p class="text-sm text-gray-500">${message.role}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-medium text-gray-800">${message.date}</p>
                                <p class="text-xs text-gray-400">${message.time}</p>
                            </div>
                        </div>
                        <div class="prose prose-sm max-w-none">
                            ${message.content}
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button class="px-4 py-2 bg-icc text-white rounded-lg text-sm font-bold hover:bg-icc-dark transition-all">
                        <i class="fa-solid fa-reply mr-2"></i>Reply
                    </button>
                    <button class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all">
                        <i class="fa-solid fa-reply-all mr-2"></i>Reply All
                    </button>
                    <button class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all">
                        <i class="fa-solid fa-forward mr-2"></i>Forward
                    </button>
                    <div class="ml-auto flex gap-2">
                        <button class="p-2 text-gray-400 hover:text-yellow-500 rounded-lg hover:bg-gray-50">
                            <i class="fa-solid fa-star text-sm"></i>
                        </button>
                        <button class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50">
                            <i class="fa-solid fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => {
                // Remove active state from all messages
                document.querySelectorAll('.message-item').forEach(msg => {
                    msg.classList.remove('bg-icc/5', 'border-l-4', 'border-icc');
                    msg.classList.add('border-l-4', 'border-transparent');
                });

                // Add active state to clicked message
                item.classList.add('bg-icc/5', 'border-l-4', 'border-icc');
                item.classList.remove('border-l-4', 'border-transparent');

                // Show message content
                const messageId = item.getAttribute('data-message-id');
                showMessage(messageId);
            });
        });

        // Show first message by default
        showMessage(1);
    }

    // Initialize Message Interactions
    setupMessageInteractions();

    // --- Dropdown Logic (Universal) ---
    const setupDropdown = (btnId, menuId) => {
        const btn = document.getElementById(btnId), menu = document.getElementById(menuId);
        if (!btn || !menu) return;
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = !menu.classList.contains('hidden');
            
            hideHeaderOverlays(menu, btn, false);

            if (isOpen) { 
                menu.classList.add('hidden'); 
                btn.classList.remove('active'); 
            } else { 
                menu.classList.remove('hidden'); 
                btn.classList.add('active'); 
            }
        });
        menu.addEventListener('click', e => e.stopPropagation());
    };

    // Setup all Header Dropdowns
    setupDropdown('notesDropdownBtn', 'notesPanel');
    setupDropdown('notifDropdownBtn', 'notifDropdownMenu');
    setupDropdown('mailDropdownBtn', 'mailDropdownMenu');
    setupDropdown('profileDropdownBtn', 'profileDropdownMenu');

    // Close dropdowns on outside click
    window.addEventListener('click', () => {
        hideHeaderOverlays(null, null, true);
    });

    // --- Action Simulations ---
    document.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('button');
        if (actionBtn && actionBtn.textContent) {
            const btnText = actionBtn.textContent.trim();
            if (btnText.includes('Create') || btnText.includes('Generate') || btnText.includes('Take') || btnText.includes('Remind') || btnText.includes('Schedule')) {
                const originalContent = actionBtn.innerHTML;
                actionBtn.disabled = true;
                actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-2"></i>Processing...';
                
                setTimeout(() => {
                    actionBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Success';
                    actionBtn.classList.add('bg-green-600', 'text-white');
                    
                    setTimeout(() => {
                        actionBtn.innerHTML = originalContent;
                        actionBtn.disabled = false;
                        actionBtn.classList.remove('bg-green-600', 'text-white');
                        
                        if (btnText.includes('Remind')) {
                            alert(`ADVISORY ACTION: Notifications sent to subject teachers for students failing General Math & Pre-Calculus.`);
                        } else if (btnText.includes('Schedule')) {
                            alert(`ADVISORY ACTION: Meeting request sent to Maria Santos's parents.`);
                        } else {
                            alert(`FACULTY WIRE-ACTION: ${btnText} initiated in prototype.`);
                        }
                    }, 1000);
                }, 800);
            }
        }
    });

    // --- Daily Schedule / Notifications ---
    const dailySchedule = [
        { time: '08:00', endTime: '09:30', subject: 'Programming 1', section: 'Grade 11 - ICT A', room: 'Lab 1' },
        { time: '10:30', endTime: '12:00', subject: 'Empowerment Tech', section: 'Grade 11 - HUMSS B', room: 'Room 304' },
        { time: '13:30', endTime: '15:00', subject: 'Programming 1', section: 'Grade 11 - ICT B', room: 'Lab 2' }
    ];

    // --- Dashboard Schedule Rendering ---
    function renderDashboardSchedule() {
        const container = document.getElementById('dashboard-schedule-list');
        if (!container) return;

        container.innerHTML = dailySchedule.map(item => `
            <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-50 hover:bg-white hover:border-icc transition-all group cursor-pointer">
                <div class="text-center min-w-[60px]">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">${item.time}</p>
                    <div class="w-1 h-4 bg-gray-200 mx-auto rounded-full group-hover:bg-icc transition-colors"></div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">${item.endTime}</p>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-bold text-gray-800">${item.subject}</p>
                    <p class="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">${item.section} • ${item.room}</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-icc transition-colors">
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </div>
            </div>
        `).join('');
    }

    // --- Topic Release Storage ---
    const topicStorage = [
        { id: 't1', title: 'Nature and Elements of Communication', term: 1 },
        { id: 't2', title: 'Functions of Communication', term: 1 },
        { id: 't3', title: 'Communication Models', term: 1 },
        { id: 't4', title: 'Functions and Their Graphs', term: 2 },
        { id: 't5', title: 'Rational Functions', term: 2 },
        { id: 't6', title: 'Simple and Compound Interest', term: 3 },
        { id: 't7', title: 'Stocks, Bonds, and Logic', term: 3 }
    ];

    let currentReleaseTerm = 1;
    let releasedTopics = []; // Format: { id, topicId, topicTitle, type, term, section }
    let selectedTopicForRelease = null;
    let releaseMode = 'single'; // 'single' or 'batch'
    let batchSelected = []; // Array of types

    function getMaterialIcon(type) {
        switch (type) {
            case 'Handouts': return 'fa-file-lines';
            case 'Assignment': return 'fa-file-signature';
            case 'Quiz': return 'fa-file-circle-question';
            case 'Activity': return 'fa-file-pen';
            case 'Performance Task': return 'fa-file-video';
            default: return 'fa-file';
        }
    }

    function renderSubjectManagement(subject) {
        const container = document.getElementById('subject-management-content');
        if (!container) return;

        // Ensure the parent section doesn't have extra spacing and fits the screen
        const parentSection = container.closest('#section-subjects');
        if (parentSection) {
            parentSection.classList.remove('space-y-8');
            parentSection.style.height = 'calc(100vh - 80px)'; // Adjusted for top nav
            parentSection.style.overflow = 'hidden';
            parentSection.style.marginTop = '0';
            parentSection.style.paddingTop = '0';
            // Hide the default header to maximize space
            const header = parentSection.querySelector('div:first-child');
            if (header && !header.id) header.classList.add('hidden');
        }

        if (!subject) {
            container.innerHTML = `
                <div class="lg:col-span-4 flex flex-col items-center justify-center h-full bg-white rounded-none border border-dashed border-gray-200">
                    <i class="fa-solid fa-hand-pointer text-4xl text-gray-200 mb-4"></i>
                    <p class="text-gray-400 font-medium text-sm font-black uppercase tracking-widest">Select a subject from the sidebar</p>
                </div>
            `;
            return;
        }

        // Reset container classes for full height/width
        container.className = 'h-full w-full block';
        container.style.marginTop = '0';

        container.innerHTML = `
            <div class="h-full flex flex-col bg-white border border-gray-100 shadow-sm rounded-none overflow-hidden">
                <!-- Top Toolbar -->
                <div class="p-4 border-b border-gray-100 flex items-center bg-gray-50/50 flex-shrink-0">
                    <div class="relative w-48">
                        <select id="section-selector" class="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-none text-[12px] font-bold text-gray-800 focus:outline-none focus:border-icc appearance-none cursor-pointer transition-all hover:bg-gray-50 shadow-sm">
                            <option value="" disabled selected>Select section...</option>
                            ${subject.sections.map(section => `<option value="${section}">${section}</option>`).join('')}
                        </select>
                        <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <i class="fa-solid fa-chevron-down text-gray-400 text-[9px]"></i>
                        </div>
                    </div>
                </div>

                <!-- Main Release Interface -->
                <div id="release-panel" class="flex-1 flex hidden overflow-hidden">
                    <!-- Left: Materials (Storage) -->
                    <div class="w-1/2 border-r border-gray-100 flex flex-col bg-[#F9FAFB]">
                        <div class="h-12 px-6 bg-white border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Materials Storage</h4>
                            
                            <div class="flex items-center gap-3">
                                <!-- Top Level Release Button -->
                                <button id="top-release-btn" onclick="executeTopRelease()" class="w-8 h-8 bg-gray-50 text-gray-400 hover:bg-icc hover:text-white transition-all flex items-center justify-center shadow-sm opacity-50 cursor-not-allowed" disabled>
                                    <i class="fa-solid fa-paper-plane text-[12px]"></i>
                                </button>

                                <!-- Options Dropdown -->
                                <div class="relative">
                                    <button id="release-options-btn" class="text-[9px] font-black text-icc uppercase tracking-widest hover:underline flex items-center gap-1 leading-none">
                                        Release <i class="fa-solid fa-chevron-down text-[8px]"></i>
                                    </button>
                                    <div id="release-options-menu" class="hidden absolute right-0 top-full mt-2 w-36 bg-white border border-gray-100 shadow-xl z-30 rounded-none">
                                        <button onclick="setReleaseMode('single')" class="w-full text-left px-4 py-3 text-[10px] font-bold text-gray-700 hover:bg-gray-50 border-b border-gray-50 flex items-center justify-between">
                                            Release <i class="fa-solid fa-check text-[8px] text-icc ${releaseMode === 'single' ? '' : 'hidden'}"></i>
                                        </button>
                                        <button onclick="setReleaseMode('batch')" class="w-full text-left px-4 py-3 text-[10px] font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                            Batch Release <i class="fa-solid fa-check text-[8px] text-icc ${releaseMode === 'batch' ? '' : 'hidden'}"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto p-6" id="storage-container">
                            <div id="storage-list" class="space-y-4"></div>
                            <div id="release-options" class="hidden h-full flex flex-col -m-6">
                                <div class="h-12 px-6 border-b border-gray-100 flex items-center gap-3 flex-shrink-0 bg-white">
                                    <button id="back-to-storage" class="text-gray-400 hover:text-icc transition-colors"><i class="fa-solid fa-arrow-left text-xs"></i></button>
                                    <span id="selected-topic-title" class="text-xs font-bold text-gray-800 truncate"></span>
                                </div>
                                <div class="p-6 space-y-4 flex-1 overflow-y-auto bg-gray-50/50">
                                    <div id="options-list-header" class="mb-2">
                                        <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Materials</p>
                                    </div>
                                    <div id="options-list" class="space-y-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Term View (Released) -->
                    <div class="w-1/2 flex flex-col bg-[#F3F4F6]">
                        <div class="h-12 px-6 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <button id="prev-term" class="text-gray-400 hover:text-icc transition-colors flex items-center justify-center"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
                            <h4 id="current-term-label" class="text-[10px] font-black text-icc uppercase tracking-widest leading-none">1st Term</h4>
                            <button id="next-term" class="text-gray-400 hover:text-icc transition-colors flex items-center justify-center"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
                        </div>
                        <div class="flex-1 overflow-y-auto p-6" id="released-container">
                            <div id="released-list" class="space-y-4"></div>
                        </div>
                    </div>
                </div>

                <!-- Initial Empty State -->
                <div id="release-empty-state" class="flex-1 flex flex-col items-center justify-center text-gray-300 bg-white">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <i class="fa-solid fa-layer-group text-2xl opacity-20"></i>
                    </div>
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest">Select a section to manage materials</p>
                </div>
            </div>
        `;

        // Logic for dropdown
        const optionsBtn = document.getElementById('release-options-btn');
        const optionsMenu = document.getElementById('release-options-menu');
        if (optionsBtn && optionsMenu) {
            optionsBtn.onclick = (e) => {
                e.stopPropagation();
                optionsMenu.classList.toggle('hidden');
            };
            window.addEventListener('click', () => {
                if (optionsMenu) optionsMenu.classList.add('hidden');
            });
        }

        // Re-attach logic
        const selector = document.getElementById('section-selector');
        const releasePanel = document.getElementById('release-panel');
        const emptyState = document.getElementById('release-empty-state');
        const backBtn = document.getElementById('back-to-storage');

        selector.onchange = () => {
            const section = selector.value;
            if (section) {
                releasePanel.classList.remove('hidden');
                emptyState.classList.add('hidden');
                selectedTopicForRelease = null;
                showStorageList(section);
                updateReleasedView(section);
            }
        };

        if (backBtn) {
            backBtn.onclick = () => {
                const section = selector.value;
                selectedTopicForRelease = null;
                batchSelected = [];
                showStorageList(section);
            };
        }
    }

    window.setReleaseMode = (mode) => {
        releaseMode = mode;
        const section = document.getElementById('section-selector')?.value;
        const optionsBtn = document.getElementById('release-options-btn');
        const topReleaseBtn = document.getElementById('top-release-btn');
        
        // Reset state when switching modes
        batchSelected = [];
        if (topReleaseBtn) {
            topReleaseBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-50', 'text-gray-400');
            topReleaseBtn.classList.remove('bg-icc', 'text-white');
            topReleaseBtn.disabled = true;
        }

        if (optionsBtn) {
            const label = mode === 'batch' ? 'Batch Release' : 'Release';
            optionsBtn.innerHTML = `${label} <i class="fa-solid fa-chevron-down text-[8px]"></i>`;
        }

        if (section) {
            showStorageList(section);
            if (selectedTopicForRelease) {
                selectTopic(selectedTopicForRelease.id, section);
            }
        }
        // Update checkmarks in menu
        document.querySelectorAll('#release-options-menu i.fa-check').forEach((i, idx) => {
            if ((idx === 0 && mode === 'single') || (idx === 1 && mode === 'batch')) {
                i.classList.remove('hidden');
            } else {
                i.classList.add('hidden');
            }
        });
    };

    function showStorageList(section) {
        const storageList = document.getElementById('storage-list');
        const releaseOptions = document.getElementById('release-options');
        const topReleaseBtn = document.getElementById('top-release-btn');

        if (!storageList) return;

        storageList.parentElement.classList.remove('hidden');
        storageList.classList.remove('hidden');
        releaseOptions.classList.add('hidden');
        
        // Hide top release button when in topic list
        if (topReleaseBtn) topReleaseBtn.classList.add('hidden');

        // Filter topics: Only show topics that have AT LEAST ONE material NOT yet released for THIS term/section
        const materialTypes = ['Handouts', 'Assignment', 'Quiz', 'Activity', 'Performance Task'];
        const filteredTopics = topicStorage.filter(topic => {
            const existingReleases = releasedTopics.filter(rt => rt.topicId === topic.id && rt.section === section && rt.term === currentReleaseTerm);
            return existingReleases.length < materialTypes.length;
        });

        storageList.innerHTML = filteredTopics.map(topic => `
            <div onclick="selectTopic('${topic.id}', '${section}')" class="p-4 bg-white border border-gray-100 hover:border-icc hover:bg-gray-50 cursor-pointer transition-all group flex items-center justify-between shadow-sm">
                <span class="text-sm font-bold text-gray-700 group-hover:text-icc">${topic.title}</span>
            </div>
        `).join('');
    }

    window.selectTopic = (topicId, section) => {
        const topic = topicStorage.find(t => t.id === topicId);
        selectedTopicForRelease = topic;
        batchSelected = [];
        
        const storageList = document.getElementById('storage-list');
        const releaseOptions = document.getElementById('release-options');
        const titleLabel = document.getElementById('selected-topic-title');
        const optionsList = document.getElementById('options-list');
        const topReleaseBtn = document.getElementById('top-release-btn');

        if (storageList) storageList.classList.add('hidden');
        if (releaseOptions) releaseOptions.classList.remove('hidden');
        if (titleLabel) titleLabel.textContent = topic.title;
        
        // Show and reset top release button
        if (topReleaseBtn) {
            topReleaseBtn.classList.remove('hidden');
            topReleaseBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-50', 'text-gray-400');
            topReleaseBtn.classList.remove('bg-icc', 'text-white');
            topReleaseBtn.disabled = true;
        }

        // Only show materials NOT yet released for this topic in this term
        const materialTypes = ['Handouts', 'Assignment', 'Quiz', 'Activity', 'Performance Task'];
        const existingReleases = releasedTopics.filter(rt => rt.topicId === topicId && rt.section === section && rt.term === currentReleaseTerm);
        const availableTypes = materialTypes.filter(type => !existingReleases.some(rt => rt.type === type));

        if (optionsList) {
            optionsList.innerHTML = availableTypes.map(type => `
                <div onclick="toggleMaterialSelection(this, '${type}')" class="flex items-center gap-3 p-4 bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all group shadow-sm material-option-panel">
                    <div class="flex-1">
                        <span class="text-xs font-bold text-gray-700 group-hover:text-icc">${type}</span>
                    </div>
                </div>
            `).join('');
        }
    };

    window.toggleMaterialSelection = (el, type) => {
        if (!selectedTopicForRelease) {
            alert('Please choose a topic first.');
            return;
        }

        const topReleaseBtn = document.getElementById('top-release-btn');

        if (releaseMode === 'single') {
            // Deselect others
            document.querySelectorAll('.material-option-panel').forEach(p => p.classList.remove('bg-icc/5', 'border-icc'));
            batchSelected = [type];
            el.classList.add('bg-icc/5', 'border-icc');
        } else {
            // Toggle
            const index = batchSelected.indexOf(type);
            if (index > -1) {
                batchSelected.splice(index, 1);
                el.classList.remove('bg-icc/5', 'border-icc');
            } else {
                batchSelected.push(type);
                el.classList.add('bg-icc/5', 'border-icc');
            }
        }

        // Update button state
        if (topReleaseBtn) {
            if (batchSelected.length > 0) {
                topReleaseBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-50', 'text-gray-400');
                topReleaseBtn.classList.add('bg-icc', 'text-white');
                topReleaseBtn.disabled = false;
            } else {
                topReleaseBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-50', 'text-gray-400');
                topReleaseBtn.classList.remove('bg-icc', 'text-white');
                topReleaseBtn.disabled = true;
            }
        }
    };

    window.executeTopRelease = () => {
        if (!selectedTopicForRelease || batchSelected.length === 0) return;
        const section = document.getElementById('section-selector').value;
        
        batchSelected.forEach(type => {
            releasedTopics.push({
                id: Date.now() + Math.random(),
                topicId: selectedTopicForRelease.id,
                topicTitle: selectedTopicForRelease.title,
                type: type,
                term: currentReleaseTerm,
                section: section
            });
        });
        
        batchSelected = [];
        updateReleasedView(section);
        showStorageList(section);
    };

    window.confirmRelease = (materialType) => {
        if (!selectedTopicForRelease) return;
        
        const section = document.getElementById('section-selector').value;
        // User said: "instead of one click then asked" (referring to batch, but let's make single more direct too if they want)
        // Let's just do it directly without confirm() if that's what "instead of one click then asked" implies for the whole system overhaul
        
        releasedTopics.push({
            id: Date.now(),
            topicId: selectedTopicForRelease.id,
            topicTitle: selectedTopicForRelease.title,
            type: materialType,
            term: currentReleaseTerm,
            section: section
        });
        updateReleasedView(section);
        showStorageList(section);
    };

    function updateReleasedView(section) {
        const releasedList = document.getElementById('released-list');
        const termLabel = document.getElementById('current-term-label');
        
        if (!releasedList) return;

        const termNames = ['1st Term', '2nd Term', '3rd Term'];
        termLabel.textContent = termNames[currentReleaseTerm - 1];

        const currentReleased = releasedTopics.filter(rt => rt.section === section && rt.term === currentReleaseTerm);

        if (currentReleased.length === 0) {
            releasedList.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-gray-300">
                    <i class="fa-solid fa-inbox text-3xl mb-3 opacity-20"></i>
                    <p class="text-[10px] font-black uppercase tracking-widest">No materials released</p>
                </div>`;
        } else {
            // Group materials by topic
            const grouped = currentReleased.reduce((acc, item) => {
                if (!acc[item.topicTitle]) acc[item.topicTitle] = [];
                acc[item.topicTitle].push(item);
                return acc;
            }, {});

            releasedList.innerHTML = Object.entries(grouped).map(([topicTitle, materials]) => `
                <div class="flex flex-col bg-white border border-gray-100 shadow-sm rounded-none mb-4 animate-slide-down overflow-hidden">
                    <!-- Clickable Topic Header -->
                    <div class="p-4 border-b border-gray-50 bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all" 
                         onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')">
                        <span class="text-sm font-bold text-icc">${topicTitle}</span>
                        <i class="fa-solid fa-chevron-down text-[10px] text-gray-300 transition-transform"></i>
                    </div>
                    
                    <!-- Table Body (Hidden by default) -->
                    <div class="divide-y divide-gray-50 hidden">
                        ${materials.map(rt => `
                            <div class="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-all group/item">
                                <div class="flex items-center gap-4">
                                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span class="text-[13px] font-bold text-gray-700">${rt.type}</span>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="text-[10px] font-black text-gray-300 uppercase tracking-widest">Released</span>
                                    <button onclick="removeReleased('${rt.id}', '${section}')" class="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100">
                                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('prev-term').onclick = () => { if (currentReleaseTerm > 1) { currentReleaseTerm--; updateReleasedView(section); showStorageList(section); } };
        document.getElementById('next-term').onclick = () => { if (currentReleaseTerm < 3) { currentReleaseTerm++; updateReleasedView(section); showStorageList(section); } };
    }

    window.removeReleased = (id, section) => {
        releasedTopics = releasedTopics.filter(rt => rt.id.toString() !== id.toString());
        updateReleasedView(section);
    };

    // --- Gradebook Logic ---
    let gradebookState = {
        currentTerm: 1,
        currentView: 'overview', // 'overview' or 'assignment', 'quiz', etc.
        currentMode: '', // Default to empty
        selectedSection: '',
        selectedSubject: ''
    };

    // Data storage for scores
    let gradebookScores = {}; // { studentId: { category: { itemId: score } } }

    function setupAnalyticsTab() {
        // This is a simulation of the SIGMA AI processing class data
        const insightsPanel = document.querySelector('#section-analytics .bg-indigo-600');
        if (insightsPanel) {
            const originalIcon = insightsPanel.innerHTML;
            insightsPanel.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin text-lg"></i>';
            setTimeout(() => {
                insightsPanel.innerHTML = originalIcon;
            }, 800);
        }
    }

    function initGradebook() {
        const sectionSelector = document.getElementById('gradebook-section-selector');
        const subjectSelector = document.getElementById('gradebook-subject-selector');
        const modeSelector = document.getElementById('gradebook-mode-selector');

        if (!sectionSelector || !subjectSelector || !modeSelector) return;

        sectionSelector.onchange = () => {
            gradebookState.selectedSection = sectionSelector.value;
            if (sectionSelector.value) {
                subjectSelector.disabled = false;
                subjectSelector.classList.remove('cursor-not-allowed', 'opacity-50');
                subjectSelector.classList.add('cursor-pointer', 'hover:bg-white');
                const firstOption = subjectSelector.querySelector('option[disabled]');
                if (firstOption) firstOption.textContent = 'Select Subject';
            } else {
                subjectSelector.disabled = true;
                subjectSelector.value = "";
                modeSelector.disabled = true;
                modeSelector.value = "";
                document.getElementById('gradebook-term-tabs')?.classList.add('hidden');
            }
            gradebookState.currentView = 'overview';
            gradebookState.currentMode = '';
            modeSelector.value = "";
            renderGradebookSpreadsheet();
        };

        subjectSelector.onchange = () => {
            gradebookState.selectedSubject = subjectSelector.value;
            if (subjectSelector.value) {
                modeSelector.disabled = false;
                modeSelector.classList.remove('cursor-not-allowed', 'opacity-50');
                modeSelector.classList.add('cursor-pointer', 'hover:bg-white');
            } else {
                modeSelector.disabled = true;
                modeSelector.value = "";
                document.getElementById('gradebook-term-tabs')?.classList.add('hidden');
            }
            gradebookState.currentView = 'overview';
            gradebookState.currentMode = '';
            modeSelector.value = "";
            renderGradebookSpreadsheet();
        };

        modeSelector.onchange = () => {
            gradebookState.currentMode = modeSelector.value;
            gradebookState.currentTerm = 1;
            
            const tabs = document.getElementById('gradebook-term-tabs');
            if (gradebookState.currentMode) {
                tabs?.classList.remove('hidden');
            } else {
                tabs?.classList.add('hidden');
            }

            updateGradebookTabLabels();
            setGradebookTerm(1);
            renderGradebookSpreadsheet();
        };
    }

    function updateGradebookTabLabels() {
        const mode = gradebookState.currentMode;
        let labels = [];
        
        if (mode === 'quarters') {
            labels = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'];
        } else if (mode === 'terms') {
            labels = ['1st Term', '2nd Term', '3rd Term'];
        } else if (mode === 'immersion') {
            labels = ['Stage 1', 'Stage 2', 'Stage 3'];
        }
        
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`term-btn-${i}`);
            if (btn) {
                if (labels[i-1]) {
                    btn.textContent = labels[i-1];
                    btn.classList.remove('hidden');
                } else {
                    btn.classList.add('hidden');
                }
            }
        }
    }

    window.setGradebookTerm = (term) => {
        gradebookState.currentTerm = term;
        // Update tab buttons
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`term-btn-${i}`);
            if (btn) {
                if (i === term) {
                    btn.classList.add('bg-white', 'text-icc', 'shadow-sm');
                    btn.classList.remove('text-gray-400');
                } else {
                    btn.classList.remove('bg-white', 'text-icc', 'shadow-sm');
                    btn.classList.add('text-gray-400');
                }
            }
        }
        renderGradebookSpreadsheet();
    };

    window.setGradebookView = (view) => {
        gradebookState.currentView = view;
        renderGradebookSpreadsheet();
    };

    // Drag and Drop Handlers
    window.handleGradebookDragStart = (e, status) => {
        e.dataTransfer.setData('text/plain', status);
    };

    window.handleGradebookDragOver = (e) => {
        e.preventDefault();
        const td = e.target.closest('td');
        if (td) td.classList.add('bg-gray-100', 'ring-2', 'ring-icc/20', 'ring-inset');
    };

    window.handleGradebookDragLeave = (e) => {
        const td = e.target.closest('td');
        if (td) td.classList.remove('bg-gray-100', 'ring-2', 'ring-icc/20', 'ring-inset');
    };

    window.handleGradebookDrop = (e) => {
        e.preventDefault();
        const td = e.target.closest('td');
        if (!td) return;
        
        td.classList.remove('bg-gray-100', 'ring-2', 'ring-icc/20', 'ring-inset');
        
        const status = e.dataTransfer.getData('text/plain');
        const colors = {
            'missing': 'bg-red-50',
            'incomplete': 'bg-amber-50',
            'absent': 'bg-gray-100',
            'excuse': 'bg-blue-50'
        };

        // Clear existing status bg colors
        Object.values(colors).forEach(c => td.classList.remove(c));

        const input = td.querySelector('input');
        if (colors[status]) {
            td.classList.add(colors[status]);
            if (input) {
                input.value = ''; // Clear score if status is dropped
                input.placeholder = status.charAt(0).toUpperCase() + status.slice(1, 3);
            }
            
            // Sync with status button if present
            const btn = td.querySelector(`.status-btn[title="${status.charAt(0).toUpperCase() + status.slice(1)}"]`);
            if (btn) toggleStudentStatus(btn, status);
        }
    };

    function renderGradebookSpreadsheet() {
        if (gradebookState.currentView === 'overview') {
            renderGradebookOverview();
        } else if (gradebookState.currentView === 'ww-sub') {
            renderWWSubCategories();
        } else {
            renderGradebookDetailView(gradebookState.currentView);
        }
    }

    // Extended Student List
    const gradebookStudents = [
        { id: '2024-001', name: 'Dela Cruz, Juan' },
        { id: '2024-002', name: 'Santos, Maria' },
        { id: '2024-003', name: 'Garcia, Anna' },
        { id: '2024-004', name: 'Mendoza, Carlo' },
        { id: '2024-005', name: 'Reyes, Sofia' },
        { id: '2024-006', name: 'Aquino, Paolo' },
        { id: '2024-007', name: 'Bautista, Elena' },
        { id: '2024-008', name: 'Castro, Miguel' },
        { id: '2024-009', name: 'Domingo, Clara' },
        { id: '2024-010', name: 'Estrada, Luis' },
        { id: '2024-011', name: 'Fernando, Gina' },
        { id: '2024-012', name: 'Guevarra, Rico' },
        { id: '2024-013', name: 'Hernandez, Rosa' },
        { id: '2024-014', name: 'Ibarra, Simon' },
        { id: '2024-015', name: 'Javier, Teresa' }
    ];

    function calculateCategoryPercentage(studentId, category) {
        const studentScores = gradebookScores[studentId]?.[category];
        if (!studentScores) return null;

        const details = getCategoryDetails(category);
        let totalScore = 0;
        let totalMax = 0;
        let count = 0;

        details.forEach((item, index) => {
            const score = studentScores[index];
            if (score !== undefined && score !== null && score !== '') {
                totalScore += parseFloat(score);
                totalMax += item.max;
                count++;
            }
        });

        if (count === 0) return null;
        return ((totalScore / totalMax) * 100).toFixed(1);
    }

    function getCategoryDetails(category) {
        const details = {
            'assignment': [
                { title: 'ASG #1', date: 'Mar 10', max: 20 },
                { title: 'ASG #2', date: 'Mar 15', max: 20 },
                { title: 'ASG #3', date: 'Mar 22', max: 20 }
            ],
            'quiz': [
                { title: 'Quiz 1', date: 'Mar 12', max: 30 },
                { title: 'Quiz 2', date: 'Mar 26', max: 30 }
            ],
            'activity': [
                { title: 'ACT #1', date: 'Mar 08', max: 50 },
                { title: 'ACT #2', date: 'Mar 18', max: 50 }
            ],
            'perf. task': [
                { title: 'PT #1', date: 'Mar 20', max: 100 }
            ],
            'term-assessment': [
                { title: 'Term Exam', date: 'Mar 30', max: 100 }
            ],
            'qa': [
                { title: 'Quarterly Assessment', date: 'Mar 30', max: 100 }
            ]
        };
        return details[category] || [];
    }

    function renderGradebookOverview() {
        document.getElementById('gradebook-drag-toolbar')?.classList.add('hidden');
        const section = gradebookState.selectedSection;
        const subject = gradebookState.selectedSubject;
        const mode = gradebookState.currentMode;
        const body = document.getElementById('gradebook-body');

        if (!section || !subject || !mode) {
            if (body) body.innerHTML = '<tr><td colspan="10" class="py-20 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">Please select section, subject and mode</td></tr>';
            return;
        }

        if (mode === 'quarters') {
            renderQuarterlyOverview();
        } else if (mode === 'terms') {
            renderTermOverview();
        } else if (mode === 'immersion') {
            renderImmersionOverview();
        }
    }

    function renderImmersionOverview() {
        const body = document.getElementById('gradebook-body');
        const avgEl = document.getElementById('gradebook-avg');
        const passingEl = document.getElementById('gradebook-passing');
        const spreadsheet = document.getElementById('gradebook-spreadsheet');
        const headerRow = spreadsheet.querySelector('thead tr');

        const nameTh = `
            <th class="w-48 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-r border-gray-50 bg-gray-50/50 sticky left-0 z-20">
                Student Name
            </th>`;

        // Immersion Categories
        const categories = [
            { id: 'pre-immersion', label: 'Pre-Immersion', icon: 'fa-briefcase', color: 'text-blue-500' },
            { id: 'immersion-proper', label: 'Immersion Proper', icon: 'fa-building-user', color: 'text-green-500' },
            { id: 'post-immersion', label: 'Post-Immersion', icon: 'fa-clipboard-check', color: 'text-purple-500' }
        ];

        let headerHtml = nameTh;
        categories.forEach(cat => {
            headerHtml += `
                <th onclick="setGradebookView('${cat.id}')" 
                    class="w-40 px-2 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center bg-white border-r border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div class="flex flex-col items-center gap-1.5">
                        <div class="w-6 h-6 rounded bg-gray-50 flex items-center justify-center ${cat.color} group-hover:bg-white transition-all shadow-sm border border-gray-100">
                            <i class="fa-solid ${cat.icon} text-[10px]"></i>
                        </div>
                        <span class="group-hover:text-icc transition-colors">${cat.label}</span>
                        <i class="fa-solid fa-chevron-right text-[7px] text-gray-300 group-hover:text-icc"></i>
                    </div>
                </th>`;
        });

        headerHtml += `
            <th class="w-24 px-4 py-4 text-[10px] font-black text-icc uppercase tracking-widest text-center bg-icc/5 border-r border-icc/10">Initial</th>
            <th class="w-24 px-4 py-4 text-[10px] font-black text-icc uppercase tracking-widest text-center bg-icc/10">Final Grade</th>
        `;

        headerRow.innerHTML = headerHtml;

        // Render Rows
        body.innerHTML = gradebookStudents.map(student => {
            return `
                <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-6 py-4 border-r border-gray-50 bg-white sticky left-0 z-10 group-hover:bg-gray-50 transition-colors">
                        <p class="text-[13px] font-bold text-gray-800">${student.name}</p>
                        <p class="text-[9px] text-gray-400 font-medium uppercase tracking-widest">ID: ${student.id}</p>
                    </td>
                    <td class="px-2 py-4 text-center border-r border-gray-50 text-xs font-black text-gray-300">—</td>
                    <td class="px-2 py-4 text-center border-r border-gray-50 text-xs font-black text-gray-300">—</td>
                    <td class="px-2 py-4 text-center border-r border-gray-50 text-xs font-black text-gray-300">—</td>
                    
                    <td class="px-4 py-4 text-center bg-icc/5 border-r border-icc/10 text-xs font-black text-icc">—</td>
                    <td class="px-4 py-4 text-center bg-icc/10 text-xs font-black text-icc">—</td>
                </tr>
            `;
        }).join('');

        if (avgEl) avgEl.textContent = '—';
        if (passingEl) passingEl.textContent = '—';
    }

    function renderQuarterlyOverview() {
        const body = document.getElementById('gradebook-body');
        const avgEl = document.getElementById('gradebook-avg');
        const passingEl = document.getElementById('gradebook-passing');
        const spreadsheet = document.getElementById('gradebook-spreadsheet');
        const headerRow = spreadsheet.querySelector('thead tr');

        const nameTh = `
            <th class="w-48 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-r border-gray-50 bg-gray-50/50 sticky left-0 z-20">
                Student Name
            </th>`;

        // Quarterly Categories (WW, PT, QA)
        const categories = [
            { id: 'ww-sub', label: 'Written Works', icon: 'fa-pen-to-square', color: 'text-blue-500', isWW: true },
            { id: 'pt', label: 'Performance Task', icon: 'fa-gauge-high', color: 'text-green-500', isPT: true },
            { id: 'qa', label: 'Quarterly Assessment', icon: 'fa-file-invoice', color: 'text-purple-500', isExam: true }
        ];

        let headerHtml = nameTh;
        categories.forEach(cat => {
            headerHtml += `
                <th onclick="setGradebookView('${cat.id}')" 
                    class="w-40 px-2 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center bg-white border-r border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div class="flex flex-col items-center gap-1.5">
                        <div class="w-6 h-6 rounded bg-gray-50 flex items-center justify-center ${cat.color} group-hover:bg-white transition-all shadow-sm border border-gray-100">
                            <i class="fa-solid ${cat.icon} text-[10px]"></i>
                        </div>
                        <span class="group-hover:text-icc transition-colors">${cat.label}</span>
                        <i class="fa-solid fa-chevron-right text-[7px] text-gray-300 group-hover:text-icc"></i>
                    </div>
                </th>`;
        });

        headerHtml += `
            <th class="w-24 px-4 py-4 text-[10px] font-black text-icc uppercase tracking-widest text-center bg-icc/5 border-r border-icc/10">Initial</th>
            <th class="w-24 px-4 py-4 text-[10px] font-black text-icc uppercase tracking-widest text-center bg-icc/10">Quarterly</th>
        `;
        headerRow.innerHTML = headerHtml;

        // Render Rows for Quarterly Mode
        body.innerHTML = gradebookStudents.map(student => {
            const wwPct = calculateWWPercentage(student.id);
            const ptPct = calculatePTPercentage(student.id);
            const qaPct = calculateQAPercentage(student.id);

            return `
                <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-4 py-2 border-r border-gray-50 bg-white sticky left-0 z-10 group-hover:bg-gray-50 transition-colors">
                        <p class="text-[12px] font-bold text-gray-800">${student.name}</p>
                        <p class="text-[8px] text-gray-400 font-medium uppercase tracking-widest">ID: ${student.id}</p>
                    </td>
                    <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${wwPct ? 'text-blue-600' : 'text-gray-300'}">${wwPct ? wwPct + '%' : '—'}</td>
                    <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${ptPct ? 'text-green-600' : 'text-gray-300'}">${ptPct ? ptPct + '%' : '—'}</td>
                    <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${qaPct ? 'text-purple-600' : 'text-gray-300'}">${qaPct ? qaPct + '%' : '—'}</td>
                    
                    <td class="px-4 py-2 text-center bg-icc/5 border-r border-icc/10 text-xs font-black text-icc">—</td>
                    <td class="px-4 py-2 text-center bg-icc/10 text-xs font-black text-icc">—</td>
                </tr>
            `;
        }).join('');

        if (avgEl) avgEl.textContent = '—';
        if (passingEl) passingEl.textContent = '—';
    }

    function calculateWWPercentage(studentId) {
        const cats = ['assignment', 'quiz', 'activity'];
        let totalScore = 0;
        let totalMax = 0;
        let hasAnyScore = false;

        cats.forEach(cat => {
            const scores = gradebookScores[studentId]?.[cat];
            if (scores) {
                const details = getCategoryDetails(cat);
                details.forEach((item, index) => {
                    const score = scores[index];
                    if (score !== undefined && score !== null && score !== '') {
                        totalScore += parseFloat(score);
                        totalMax += item.max;
                        hasAnyScore = true;
                    }
                });
            }
        });

        if (!hasAnyScore) return null;
        return ((totalScore / totalMax) * 100).toFixed(1);
    }

    function calculatePTPercentage(studentId) {
        return calculateCategoryPercentage(studentId, 'perf. task');
    }

    function calculateQAPercentage(studentId) {
        return calculateCategoryPercentage(studentId, 'qa');
    }

    function calculateExamPercentage(studentId) {
        return calculateCategoryPercentage(studentId, 'term-assessment');
    }

    function renderTermOverview() {
        const avgEl = document.getElementById('gradebook-avg');
        const passingEl = document.getElementById('gradebook-passing');
        const body = document.getElementById('gradebook-body');
        const spreadsheet = document.getElementById('gradebook-spreadsheet');
        const headerRow = spreadsheet.querySelector('thead tr');
        
        const nameTh = `
            <th class="w-48 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-r border-gray-50 bg-gray-50/50 sticky left-0 z-20">
                Student Name
            </th>`;
        
        const categories = [
            { id: 'ww-sub', label: 'Written Works', icon: 'fa-pen-to-square', color: 'text-blue-500', isWW: true },
            { id: 'perf. task', label: 'Performance Task', icon: 'fa-gauge-high', color: 'text-green-500', isPT: true },
            { id: 'term-assessment', label: 'Term Assessment', icon: 'fa-file-invoice', color: 'text-purple-500', isExam: true }
        ];

        let headerHtml = nameTh;
        categories.forEach(cat => {
            headerHtml += `
                <th onclick="setGradebookView('${cat.id}')" 
                    class="w-40 px-2 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center bg-white border-r border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div class="flex flex-col items-center gap-1.5">
                        <div class="w-6 h-6 rounded bg-gray-50 flex items-center justify-center ${cat.color} group-hover:bg-white transition-all shadow-sm border border-gray-100">
                            <i class="fa-solid ${cat.icon} text-[10px]"></i>
                        </div>
                        <span class="group-hover:text-icc transition-colors">${cat.label}</span>
                        <i class="fa-solid fa-chevron-right text-[7px] text-gray-300 group-hover:text-icc"></i>
                    </div>
                </th>`;
        });

        headerHtml += `
            <th class="w-24 px-4 py-4 text-[10px] font-black text-icc uppercase tracking-widest text-center bg-icc/5 border-r border-icc/10">Initial</th>
            <th class="w-24 px-4 py-4 text-[10px] font-black text-icc uppercase tracking-widest text-center bg-icc/10">Final Grade</th>
        `;

        headerRow.innerHTML = headerHtml;

        // Render Rows
        body.innerHTML = gradebookStudents.map(student => {
            const wwPct = calculateWWPercentage(student.id);
            const ptPct = calculatePTPercentage(student.id);
            const examPct = calculateExamPercentage(student.id);

            return `
                <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-4 py-2 border-r border-gray-50 bg-white sticky left-0 z-10 group-hover:bg-gray-50 transition-colors">
                        <p class="text-[12px] font-bold text-gray-800">${student.name}</p>
                        <p class="text-[8px] text-gray-400 font-medium uppercase tracking-widest">ID: ${student.id}</p>
                    </td>
                    <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${wwPct ? 'text-blue-600' : 'text-gray-300'}">${wwPct ? wwPct + '%' : '—'}</td>
                    <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${ptPct ? 'text-green-600' : 'text-gray-300'}">${ptPct ? ptPct + '%' : '—'}</td>
                    <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${examPct ? 'text-purple-600' : 'text-gray-300'}">${examPct ? examPct + '%' : '—'}</td>
                    
                    <td class="px-4 py-2 text-center bg-icc/5 border-r border-icc/10 text-xs font-black text-icc">—</td>
                    <td class="px-4 py-2 text-center bg-icc/10 text-xs font-black text-icc">—</td>
                </tr>
            `;
        }).join('');

        if (avgEl) avgEl.textContent = '—';
        if (passingEl) passingEl.textContent = '—';
    }

    function renderWWSubCategories() {
        document.getElementById('gradebook-drag-toolbar')?.classList.add('hidden');
        const body = document.getElementById('gradebook-body');
        const spreadsheet = document.getElementById('gradebook-spreadsheet');
        const headerRow = spreadsheet.querySelector('thead tr');

        const nameTh = `
            <th class="w-48 px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left border-r border-gray-50 bg-gray-50/50 sticky left-0 z-20 min-w-[200px]">
                <div class="flex items-center gap-2">
                    <button onclick="setGradebookView('overview')" class="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:border-icc hover:text-icc transition-all">
                        <i class="fa-solid fa-arrow-left text-[9px]"></i>
                    </button>
                    <div>
                        <p class="text-icc font-black text-[10px]">WRITTEN WORKS</p>
                        <p class="text-[8px] text-gray-400 mt-0.5">Term ${gradebookState.currentTerm}</p>
                    </div>
                </div>
            </th>`;

        const subCats = [
            { id: 'assignment', label: 'Assignment', icon: 'fa-book-open', color: 'text-blue-500' },
            { id: 'quiz', label: 'Quiz', icon: 'fa-vial', color: 'text-orange-500' },
            { id: 'activity', label: 'Activity', icon: 'fa-puzzle-piece', color: 'text-indigo-500' }
        ];

        let headerHtml = nameTh;
        subCats.forEach(cat => {
            headerHtml += `
                <th onclick="setGradebookView('${cat.id}')" 
                    class="w-40 px-2 py-2 text-[8px] font-black text-gray-400 uppercase tracking-widest text-center bg-white border-r border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div class="flex flex-col items-center gap-1">
                        <div class="w-5 h-5 rounded bg-gray-50 flex items-center justify-center ${cat.color} group-hover:bg-white transition-all shadow-sm border border-gray-100">
                            <i class="fa-solid ${cat.icon} text-[9px]"></i>
                        </div>
                        <span class="group-hover:text-icc transition-colors">${cat.label}</span>
                        <i class="fa-solid fa-chevron-right text-[6px] text-gray-300 group-hover:text-icc"></i>
                    </div>
                </th>`;
        });

        headerHtml += `
            <th class="w-24 px-4 py-2 text-[9px] font-black text-icc uppercase tracking-widest text-center bg-icc/5 border-r border-icc/10">Overall %</th>
        `;

        headerRow.innerHTML = headerHtml;

        // Render Rows
        body.innerHTML = gradebookStudents.map(student => {
            const asgPct = calculateCategoryPercentage(student.id, 'assignment');
            const quizPct = calculateCategoryPercentage(student.id, 'quiz');
            const actPct = calculateCategoryPercentage(student.id, 'activity');
            const wwPct = calculateWWPercentage(student.id);

            return `
                 <tr class="hover:bg-gray-50/50 transition-colors group">
                     <td class="px-4 py-2 border-r border-gray-50 bg-white sticky left-0 z-10 group-hover:bg-gray-50 transition-colors">
                         <p class="text-[12px] font-bold text-gray-800">${student.name}</p>
                         <p class="text-[8px] text-gray-400 font-medium uppercase tracking-widest">ID: ${student.id}</p>
                     </td>
                     <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${asgPct ? 'text-blue-600' : 'text-gray-300'}">${asgPct ? asgPct + '%' : '—'}</td>
                     <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${quizPct ? 'text-orange-600' : 'text-gray-300'}">${quizPct ? quizPct + '%' : '—'}</td>
                     <td class="px-2 py-2 text-center border-r border-gray-50 text-xs font-black ${actPct ? 'text-indigo-600' : 'text-gray-300'}">${actPct ? actPct + '%' : '—'}</td>
                     <td class="px-4 py-2 text-center bg-icc/5 border-r border-icc/10 text-xs font-black text-icc">${wwPct ? wwPct + '%' : '—'}</td>
                 </tr>
            `;
        }).join('');
    }

    function renderGradebookDetailView(category) {
        document.getElementById('gradebook-drag-toolbar')?.classList.remove('hidden');
        const body = document.getElementById('gradebook-body');
        const spreadsheet = document.getElementById('gradebook-spreadsheet');
        const headerRow = spreadsheet.querySelector('thead tr');

        const items = getCategoryDetails(category);

        const isWWSub = ['assignment', 'quiz', 'activity'].includes(category);
        const backView = isWWSub ? 'ww-sub' : 'overview';

        // Render Header - Reduced name column width
        let headerHtml = `
            <th class="w-48 px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left border-r border-gray-50 bg-gray-50/50 sticky left-0 z-20 min-w-[200px]">
                <div class="flex items-center gap-2">
                    <button onclick="setGradebookView('${backView}')" class="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:border-icc hover:text-icc transition-all">
                        <i class="fa-solid fa-arrow-left text-[9px]"></i>
                    </button>
                    <div>
                        <p class="text-icc font-black text-[10px]">${category.toUpperCase()}</p>
                        <p class="text-[8px] text-gray-400 mt-0.5">Term ${gradebookState.currentTerm}</p>
                    </div>
                </div>
            </th>
        `;

        items.forEach(item => {
            headerHtml += `
                <th class="w-32 px-2 py-2 text-[8px] font-black text-gray-400 uppercase tracking-widest text-center bg-white border-r border-gray-50">
                    <div class="flex flex-col items-center gap-1">
                        <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">${item.date}</span>
                        <span class="text-gray-800 text-[10px] font-bold">${item.title}</span>
                        <span class="text-[8px] opacity-50">/${item.max}</span>
                    </div>
                </th>`;
        });

        headerRow.innerHTML = headerHtml;

        // Render Rows
        body.innerHTML = gradebookStudents.map(student => `
            <tr class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-4 py-2 border-r border-gray-50 bg-white sticky left-0 z-10 group-hover:bg-gray-50 transition-colors">
                    <p class="text-[12px] font-bold text-gray-800">${student.name}</p>
                    <p class="text-[8px] text-gray-400 font-medium uppercase tracking-widest">ID: ${student.id}</p>
                </td>
                ${items.map((item, index) => {
                    const savedScore = gradebookScores[student.id]?.[category]?.[index] || '';
                    return `
                        <td class="px-2 py-2 text-center border-r border-gray-50 transition-all duration-300"
                            ondragover="handleGradebookDragOver(event)"
                            ondragleave="handleGradebookDragLeave(event)"
                            ondrop="handleGradebookDrop(event)">
                            <div class="flex flex-col items-center gap-1 pointer-events-none">
                                <input type="number" placeholder="—" 
                                       value="${savedScore}"
                                       onchange="updateStudentScore('${student.id}', '${category}', ${index}, this.value)"
                                       class="w-16 py-0.5 bg-transparent border-none text-[11px] font-bold text-center focus:ring-1 focus:ring-icc/30 outline-none rounded transition-all hover:bg-gray-100 pointer-events-auto">
                                
                                <div class="status-group flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                    <button onclick="toggleStudentStatus(this, 'missing')" title="Missing" class="status-btn w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-[7px] text-gray-200 hover:border-red-200 transition-all">
                                        <i class="fa-solid fa-circle-xmark"></i>
                                    </button>
                                    <button onclick="toggleStudentStatus(this, 'incomplete')" title="Incomplete" class="status-btn w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-[7px] text-gray-200 hover:border-amber-200 transition-all">
                                        <i class="fa-solid fa-circle-exclamation"></i>
                                    </button>
                                    <button onclick="toggleStudentStatus(this, 'absent')" title="Absent" class="status-btn w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-[7px] text-gray-200 hover:border-gray-400 transition-all">
                                        <i class="fa-solid fa-user-slash"></i>
                                    </button>
                                    <button onclick="toggleStudentStatus(this, 'excuse')" title="Excuse" class="status-btn w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-[7px] text-gray-200 hover:border-blue-200 transition-all">
                                        <i class="fa-solid fa-file-signature"></i>
                                    </button>
                                </div>
                            </div>
                        </td>
                    `;
                }).join('')}
            </tr>
        `).join('');
    }

    window.updateStudentScore = (studentId, category, itemIndex, value) => {
        if (!gradebookScores[studentId]) gradebookScores[studentId] = {};
        if (!gradebookScores[studentId][category]) gradebookScores[studentId][category] = {};
        gradebookScores[studentId][category][itemIndex] = value;
        
        // Visual feedback
        const input = event.target;
        const td = input.closest('td');
        
        // Clear any status bg if manual score entered
        if (td) {
            const statusColors = ['bg-red-50', 'bg-amber-50', 'bg-gray-100', 'bg-blue-50'];
            statusColors.forEach(c => td.classList.remove(c));
            
            // Also reset status buttons
            const statusGroup = td.querySelector('.status-group');
            if (statusGroup) {
                statusGroup.querySelectorAll('.status-btn').forEach(b => {
                    b.classList.remove('text-red-600', 'bg-red-50', 'border-red-200',
                                     'text-amber-600', 'bg-amber-50', 'border-amber-200',
                                     'text-gray-600', 'bg-gray-100', 'border-gray-300',
                                     'text-blue-600', 'bg-blue-50', 'border-blue-200');
                    b.classList.add('text-gray-200', 'bg-transparent', 'border-gray-100');
                });
            }
        }

        input.classList.add('bg-green-50');
        setTimeout(() => input.classList.remove('bg-green-50'), 500);
    };

    window.toggleStudentStatus = (btn, type) => {
        const colors = {
            missing: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
            incomplete: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            absent: { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' },
            excuse: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
        };
        
        const td = btn.closest('td');
        const isActive = btn.classList.contains(colors[type].text);
        
        // Reset all in group
        const group = btn.closest('.status-group');
        group.querySelectorAll('.status-btn').forEach(b => {
            Object.values(colors).forEach(c => {
                b.classList.remove(c.text, c.bg, c.border);
            });
            b.classList.add('text-gray-200', 'bg-transparent', 'border-gray-100');
        });

        // Clear td bg
        if (td) {
            Object.values(colors).forEach(c => td.classList.remove(c.bg));
        }

        if (!isActive) {
            btn.classList.remove('text-gray-200', 'bg-transparent', 'border-gray-100');
            btn.classList.add(colors[type].text, colors[type].bg, colors[type].border);
            if (td) td.classList.add(colors[type].bg);
        }
    };

    window.calculateGrades = (input) => {
        // Logic to re-calculate row and summary stats
        const row = input.closest('tr');
        input.classList.add('bg-yellow-50');
        setTimeout(() => input.classList.remove('bg-yellow-50'), 1000);
    };

    window.saveGrades = () => {
        const btn = event.currentTarget;
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-2"></i>Saving...';
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Changes Saved';
            btn.classList.add('bg-green-600');
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.classList.remove('bg-green-600');
                btn.disabled = false;
            }, 2000);
        }, 1000);
    };

    window.exportGradebook = () => {
        alert('Gradebook data prepared for export to .xlsx format.');
    };

    function parseTime(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
    function formatTime12(t) { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; }

    function getScheduleStatus() {
        const now = new Date(), nowMins = now.getHours() * 60 + now.getMinutes();
        if (nowMins < parseTime(dailySchedule[0].time)) return { type: 'before', next: dailySchedule[0] };
        if (nowMins >= parseTime(dailySchedule[dailySchedule.length - 1].endTime)) return { type: 'done' };
        for (let i = 0; i < dailySchedule.length; i++) {
            const s = dailySchedule[i];
            if (nowMins >= parseTime(s.time) && nowMins < parseTime(s.endTime)) return { type: 'ongoing', current: s, next: dailySchedule[i + 1] || null };
            if (nowMins < parseTime(s.time)) return { type: 'between', next: s };
        }
        return { type: 'done' };
    }

    const featureNotifications = [
        { icon: 'fa-solid fa-users-rectangle', title: 'Advisory Alert', message: '3 students in Grade 11-ICT A are at risk of failing.', nav: 'nav-advisory' },
        { icon: 'fa-solid fa-calendar-check', title: 'Gradebook Sync', message: 'Quarter 1 grades have been successfully synced to the registrar.', nav: 'nav-grades' },
        { icon: 'fa-solid fa-envelope', title: 'Faculty Inbox', message: 'You have 2 unread messages from the administration.', nav: 'nav-mail' },
        { icon: 'fa-solid fa-clock', title: 'Upcoming Meeting', message: 'General faculty meeting at 4:00 PM in the auditorium.', nav: 'nav-dashboard' }
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

        // 1. CLASS NOTIFICATIONS
        if (status.type === 'ongoing') {
            hasAlert = true;
            html += `
                <div class="px-6 py-5 hover:bg-gray-50 cursor-pointer border-l-4 border-icc border-b border-gray-100 transition-all">
                    <div class="flex gap-4 items-start">
                        <div class="w-11 h-11 bg-icc-light rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <i class="fa-solid fa-chalkboard-teacher text-icc text-lg"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="text-[13px] font-bold text-gray-800">Class in Session</p>
                                <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span class="text-[10px] font-black text-green-600 uppercase">Live</span></div>
                            </div>
                            <p class="text-[14px] font-bold text-icc leading-tight">${status.current.subject}</p>
                            <p class="text-[12px] text-gray-500 mt-1.5">${formatTime12(status.current.time)}–${formatTime12(status.current.endTime)} • ${status.current.room}</p>
                        </div>
                    </div>
                </div>`;
            
            if (status.next) {
                html += `
                    <div class="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-all">
                        <div class="flex gap-4 items-start">
                            <div class="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fa-solid fa-forward text-gray-400 text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Up Next</p>
                                <p class="text-[13px] font-bold text-gray-800 mt-0.5">${status.next.subject}</p>
                                <p class="text-[11px] text-gray-400 mt-0.5">${formatTime12(status.next.time)} • ${status.next.room}</p>
                            </div>
                        </div>
                    </div>`;
            }
        } else if (status.type === 'between' || status.type === 'before') {
            hasAlert = true;
            html += `
                <div class="px-6 py-5 hover:bg-gray-50 cursor-pointer border-l-4 border-icc-yellow border-b border-gray-100 transition-all">
                    <div class="flex gap-4 items-start">
                        <div class="w-11 h-11 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <i class="fa-solid fa-clock text-yellow-500 text-lg"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[13px] font-bold text-gray-800">Upcoming Class</p>
                            <p class="text-[14px] font-bold text-yellow-700 mt-1 leading-tight">${status.next.subject}</p>
                            <p class="text-[12px] text-gray-500 mt-1.5">${formatTime12(status.next.time)}–${formatTime12(status.next.endTime)} • ${status.next.room}</p>
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

        // 2. FEATURE NOTIFICATIONS
        html += `<div class="px-6 pt-6 pb-4 border-t border-gray-100 bg-gray-50/30"><p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Other Notifications</p>`;
        featureNotifications.forEach(item => {
            html += `
                <div class="notif-item px-5 py-5 hover:bg-white cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm rounded-xl mb-3 transition-all" 
                     data-nav="${item.nav}">
                    <div class="flex gap-4 items-start">
                        <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 text-sm shadow-sm border border-gray-50">
                            <i class="${item.icon}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[13px] font-bold text-gray-800 leading-tight">${item.title}</p>
                            <p class="text-[12px] text-gray-500 mt-1.5 leading-normal">${item.message}</p>
                        </div>
                    </div>
                </div>`;
        });
        html += `</div>`;

        notifList.innerHTML = html;

        // Attach listeners to new items
        notifList.querySelectorAll('.notif-item[data-nav]').forEach(item => {
            item.addEventListener('click', () => {
                switchTab(item.dataset.nav);
                hideHeaderOverlays();
            });
        });

        if (notifBadge) notifBadge.classList.toggle('hidden', !hasAlert);
    }

    // Initialize schedule components
    buildScheduleNotifications();
    setInterval(buildScheduleNotifications, 60000);

    // Initialize layout
    updateLayout();

    // ─── SIGMA AI ──────────────────────────────────────────────
    const WELCOME_MSG = `Hello, <strong>Teacher Maria!</strong> I'm <span class="font-black">SIGMA AI</span>, your faculty assistant. How can I help with your classes today?`;

    let isDragging = false;
    let startX = 0;
    let startRight = 0;
    let wasDragged = false;

    function addAiMessage(content, isUser = false) {
        const msg = document.createElement('div');
        msg.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
        msg.innerHTML = `${!isUser ? `<div class="w-7 h-7 rounded-lg bg-icc flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fa-solid fa-bolt text-icc-yellow text-[10px]"></i></div>` : ''}<div class="max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${isUser ? 'bg-icc text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'}">${content}</div>${isUser ? `<div class="w-7 h-7 rounded-lg bg-icc-light flex items-center justify-center flex-shrink-0 mt-0.5 text-icc text-[10px] font-black uppercase">MR</div>` : ''}`;
        sigmaAiMessages.appendChild(msg);
        sigmaAiMessages.scrollTop = sigmaAiMessages.scrollHeight;
    }

    function openAiPanel() {
        document.querySelectorAll('.header-panel').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('header button').forEach(b => b.classList.remove('active'));
        sigmaAiPanel.classList.add('open');
        sigmaAiNotch.classList.add('open');
        sessionStorage.setItem('sigmaTeacherPanelOpen', 'true');
    }

    function closeAiPanel() {
        sigmaAiPanel.classList.remove('open');
        sigmaAiNotch.classList.remove('open');
        sessionStorage.setItem('sigmaTeacherPanelOpen', 'false');
    }

    function hideHeaderOverlays(exceptMenu = null, exceptButton = null, keepAiOpen = false) {
        document.querySelectorAll('.header-panel').forEach(panel => {
            if (panel !== exceptMenu) panel.classList.add('hidden');
        });
        document.querySelectorAll('header .relative button').forEach(button => {
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
            setTimeout(() => addAiMessage('Full faculty AI integration coming soon!', false), 600);
        });
    });

    function sendAiMessage() {
        const v = sigmaAiInput?.value.trim();
        if (!v) return;
        addAiMessage(v, true);
        sigmaAiInput.value = '';
        setTimeout(() => addAiMessage('Faculty wireframe mode — Gemini AI integration in progress.', false), 600);
    }

    if (sigmaAiSendBtn) sigmaAiSendBtn.addEventListener('click', sendAiMessage);
    if (sigmaAiCloseBtn) sigmaAiCloseBtn.addEventListener('click', closeAiPanel);
    if (sigmaAiInput) sigmaAiInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendAiMessage(); });

    const isFirstVisit = sessionStorage.getItem('sigmaTeacherFirstVisit') !== 'true';
    const panelWasOpen = sessionStorage.getItem('sigmaTeacherPanelOpen') === 'true';

    if (isFirstVisit) {
        sessionStorage.setItem('sigmaTeacherFirstVisit', 'true');
        setTimeout(() => {
            openAiPanel();
            addAiMessage(WELCOME_MSG, false);
        }, 1200);
    } else {
        addAiMessage(WELCOME_MSG, false);
    }

    if (panelWasOpen) openAiPanel();
});
