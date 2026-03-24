/* TEACHER DASHBOARD CORE LOGIC */

document.addEventListener('DOMContentLoaded', () => {
    // Disable transitions during initialization
    document.documentElement.classList.add('no-transition');

    const sidebar = document.getElementById('sidebar');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const navLinks = document.querySelectorAll('#sidebar nav a');
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');

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
        teaching: [
            { id: 'subj-genmath', text: 'General Mathematics', section: 'Grade 11 - STEM A', icon: 'fa-solid fa-calculator' },
            { id: 'subj-oralcomm', text: 'Oral Communication', section: 'Grade 11 - HUMSS B', icon: 'fa-solid fa-book-open-reader' },
            { id: 'subj-prog1', text: 'Programming 1', section: 'Grade 11 - ICT A', icon: 'fa-solid fa-code' }
        ],
        advisory: [
            { id: 'adv-ict-a', text: 'Grade 11 - ICT A', section: 'Advisory Section', icon: 'fa-solid fa-users-rectangle' }
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
    function updateSubSidebar(tabId) {
        const subSidebar = document.getElementById('sub-sidebar');
        const content = document.getElementById('sub-sidebar-content');
        const title = document.getElementById('sub-sidebar-title');
        const header = document.getElementById('sub-sidebar-header');
        
        if (!subSidebar || !content) return;

        // Reset visibility
        subSidebar.classList.add('hidden');
        document.body.classList.remove('sub-sidebar-open');
        if (header) header.classList.add('hidden');
        content.innerHTML = '';

        if (tabId === 'nav-subjects') {
            subSidebar.classList.remove('hidden');
            document.body.classList.add('sub-sidebar-open');
            if (header) header.classList.remove('hidden');
            if (title) title.textContent = 'Subject Management';
            
            const renderGroup = (label, items, isOpen = true) => {
                const g = document.createElement('div');
                g.className = `sub-nav-group ${isOpen ? 'active' : ''}`;
                g.innerHTML = `
                    <div class="sub-nav-group-header flex items-center justify-between cursor-pointer select-none">
                        <span class="group-label">${label}</span>
                        <i class="fa-solid fa-chevron-right text-[8px] transition-transform"></i>
                    </div>
                    <div class="sub-nav-items space-y-1 mt-1 pb-4">
                        ${items.map(item => `
                            <a href="#" class="sub-sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:text-icc" 
                               data-id="${item.id}" data-type="${label.toLowerCase().includes('advisory') ? 'advisory' : 'subject'}">
                                <i class="${item.icon} text-center w-4 text-gray-400"></i>
                                <div class="flex flex-col">
                                    <span>${item.text}</span>
                                    <span class="text-[9px] text-gray-400 uppercase tracking-tighter">${item.section}</span>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                `;
                g.querySelector('.sub-nav-group-header').addEventListener('click', () => g.classList.toggle('active'));
                content.appendChild(g);
            };

            renderGroup('Teaching Load', subjectsData.teaching);
            renderGroup('Advisory Section', subjectsData.advisory, false);

            // Add click listeners to sub-sidebar links
            content.querySelectorAll('.sub-sidebar-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const type = link.getAttribute('data-type');
                    const id = link.getAttribute('data-id');
                    
                    if (type === 'advisory') {
                        switchTab('nav-advisory');
                    } else {
                        // Handle subject selection
                        const subject = subjectsData.teaching.find(s => s.id === id);
                        if (subject) {
                            renderSubjectManagement(subject);
                        }
                    }
                });
            });
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

        // Initialize section-specific features
        if (navId === 'nav-dashboard') {
            setTimeout(() => {
                setupInsightsCarousel();
                renderDashboardSchedule();
            }, 100); // Ensure carousel is initialized when dashboard is shown
        }
        if (navId === 'nav-attendance') {
            setTimeout(() => setupAttendanceCalendar(), 100); // Small delay to ensure DOM is ready
        }
        if (navId === 'nav-mail') {
            setTimeout(() => setupMessageInteractions(), 100);
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

    // --- View All Messages Button ---
    const viewAllMailBtn = document.getElementById('viewAllMailBtn');
    if (viewAllMailBtn) {
        viewAllMailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('nav-mail');
        });
    }

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
                <div class="flex-shrink-0 w-full p-4">
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
            
            // Close all other dropdowns AND remove active states from all buttons
            document.querySelectorAll('.absolute.shadow-xl, .absolute.shadow-lg, [id$="Panel"]').forEach(m => { 
                if (m !== menu) m.classList.add('hidden'); 
            });
            document.querySelectorAll('.relative button').forEach(b => { 
                if (b !== btn) b.classList.remove('active'); 
            });

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
        document.querySelectorAll('.absolute.shadow-xl, .absolute.shadow-lg, [id$="Panel"]').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.relative button').forEach(b => b.classList.remove('active'));
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

    function renderSubjectManagement(subject) {
        const container = document.getElementById('subject-management-content');
        if (!container) return;

        container.innerHTML = `
            <div class="lg:col-span-1 space-y-4">
                <button class="w-full p-4 bg-white border border-gray-100 rounded-2xl text-left hover:border-icc transition-all group">
                    <i class="fa-solid fa-file-circle-plus text-icc mb-2 block text-xl group-hover:scale-110 transition-transform"></i>
                    <span class="block text-sm font-bold text-gray-800">New Lesson Plan</span>
                    <span class="block text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Upload PDF or create online</span>
                </button>
                <button class="w-full p-4 bg-white border border-gray-100 rounded-2xl text-left hover:border-icc transition-all group">
                    <i class="fa-solid fa-clipboard-question text-yellow-500 mb-2 block text-xl group-hover:scale-110 transition-transform"></i>
                    <span class="block text-sm font-bold text-gray-800">Create Quiz</span>
                    <span class="block text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Multiple choice or Essay</span>
                </button>
                
                <!-- Sigma AI for this subject -->
                <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div class="flex items-center gap-2 mb-2 text-indigo-600">
                        <i class="fa-solid fa-bolt text-xs"></i>
                        <span class="text-[10px] font-black uppercase tracking-widest">Sigma AI Insight</span>
                    </div>
                    <p class="text-[11px] text-gray-600 leading-relaxed italic">
                        "For ${subject.text}, students in ${subject.section} are showing high engagement with 'Hands-on Labs'. I recommend adding more practical exercises for the next topic."
                    </p>
                </div>
            </div>

            <div class="lg:col-span-3 space-y-6">
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div class="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-bold text-gray-800 uppercase tracking-widest">Topics & Content</h3>
                            <p class="text-[10px] text-gray-400 font-medium mt-1">${subject.text} • ${subject.section}</p>
                        </div>
                        <button class="text-icc text-[10px] font-bold uppercase tracking-widest hover:underline">+ Add Topic</button>
                    </div>
                    <div class="divide-y divide-gray-50">
                        <div class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><i class="fa-solid fa-folder-open"></i></div>
                                <div>
                                    <p class="text-sm font-bold text-gray-800">Introduction to Java</p>
                                    <p class="text-[10px] text-gray-400 font-medium mt-0.5">4 Activities • 2 Quizzes</p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button class="p-2 text-gray-400 hover:text-icc transition-colors"><i class="fa-solid fa-eye text-sm"></i></button>
                                <button class="p-2 text-gray-400 hover:text-icc transition-colors"><i class="fa-solid fa-pen text-sm"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

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

    function buildScheduleNotifications() {
        const notifList = document.getElementById('notif-list');
        const notifBadge = document.getElementById('notifBadge');
        if (!notifList) return;

        const status = getScheduleStatus();
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        // Header
        let headerHtml = `<div class="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-white sticky top-0 z-10">${dateStr}</div>`;
        let classNotifHtml = '';
        let aiBriefHtml = '';
        let systemNotifHtml = '';
        let hasAlert = false;

        // 1. CLASS NOTIFICATION (Always Top Priority) - Like Student Page
        if (status.type === 'ongoing') {
            hasAlert = true;
            classNotifHtml = `
                <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-icc border-b border-gray-50">
                    <div class="flex gap-3 items-start">
                        <div class="w-9 h-9 bg-icc-light rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-chalkboard-teacher text-icc text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-0.5">
                                <p class="text-xs font-bold text-gray-800">Class in Session</p>
                                <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span class="text-[9px] font-black text-green-600 uppercase">Live</span></div>
                            </div>
                            <p class="text-[12px] font-bold text-icc">${status.current.subject}</p>
                            <p class="text-[10px] text-gray-400 mt-0.5">${formatTime12(status.current.time)}–${formatTime12(status.current.endTime)} • ${status.current.room}</p>
                        </div>
                    </div>
                </div>`;
        } else if (status.type === 'between' || status.type === 'before') {
            hasAlert = true;
            classNotifHtml = `
                <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-icc-yellow border-b border-gray-50">
                    <div class="flex gap-3 items-start">
                        <div class="w-9 h-9 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-clock text-yellow-500 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-gray-800">Upcoming Class</p>
                            <p class="text-[12px] font-bold text-yellow-700 mt-0.5">${status.next.subject}</p>
                            <p class="text-[10px] text-gray-400 mt-0.5">${formatTime12(status.next.time)}–${formatTime12(status.next.endTime)} • ${status.next.room}</p>
                        </div>
                    </div>
                </div>`;
        }

        // 2. SIGMA AI BRIEF (Triggers at 8:00 AM)
        const schoolStartMins = parseTime('08:00');
        const currentMins = now.getHours() * 60 + now.getMinutes();
        if (currentMins >= schoolStartMins) {
            hasAlert = true;
            aiBriefHtml = `
                <div class="px-4 py-4 hover:bg-indigo-50/30 cursor-pointer border-l-4 border-indigo-500 border-b border-gray-50 transition-colors">
                    <div class="flex gap-3 items-start">
                        <div class="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-bolt text-indigo-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-0.5">
                                <p class="text-xs font-black text-indigo-900 uppercase tracking-wider">Sigma Ai • Morning Brief</p>
                                <span class="text-[9px] font-bold text-indigo-400 uppercase">8:00 AM</span>
                            </div>
                            <p class="text-[11px] text-indigo-800 leading-relaxed font-medium">Good morning, Teacher! School has started. I've flagged 5 students in your advisory class who need academic follow-up today.</p>
                        </div>
                    </div>
                </div>`;
        }

        // 3. SYSTEM NOTIFICATIONS (Other features except messages)
        systemNotifHtml = `
            <div class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50">
                <div class="flex gap-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid fa-chart-line text-blue-600 text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800">Grade submission deadline</p>
                        <p class="text-xs text-gray-500">Q1 grades due in 2 days</p>
                        <p class="text-xs text-icc font-medium mt-1">Click to review</p>
                    </div>
                </div>
            </div>
            <div class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50">
                <div class="flex gap-3">
                    <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid fa-users-rectangle text-orange-600 text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800">Advisory meeting reminder</p>
                        <p class="text-xs text-gray-500">Parent-teacher conference tomorrow</p>
                        <p class="text-xs text-icc font-medium mt-1">3:00 PM • Room 201</p>
                    </div>
                </div>
            </div>
            <div class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                <div class="flex gap-3">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid fa-brain text-purple-600 text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800">AI insights available</p>
                        <p class="text-xs text-gray-500">New performance analytics ready</p>
                        <p class="text-xs text-icc font-medium mt-1">View in Analytics</p>
                    </div>
                </div>
            </div>`;

        // Combine in priority order: Next Class > AI Brief > System
        notifList.innerHTML = headerHtml + classNotifHtml + aiBriefHtml + systemNotifHtml;
        if (notifBadge) notifBadge.classList.toggle('hidden', !hasAlert);
    }

    // Initialize schedule components
    buildScheduleNotifications();
    setInterval(buildScheduleNotifications, 60000);

    // Initialize layout
    updateLayout();
});
