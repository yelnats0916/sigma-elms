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
            const currentActive = document.querySelector('#sidebar nav a.bg-white\\/20');
            if (currentActive && currentActive.id === link.id && hasSubSidebar.includes(link.id)) {
                // Toggle sub-sidebar for already active item
                subSidebar.classList.toggle('sub-sidebar-visible');
                updateLayout();
            } else {
                switchTab(link.id);
            }
            e.preventDefault();
        });
    });

    // --- Phase 6 & 7: Sub-Sidebar & Home Reels Data ---
    const subjectsData = {
        enrolled: [
            { id: 'card-prog1', text: 'Computer Programming 1', icon: 'fa-solid fa-code', bg: 'image/book1.svg', progress: '40%' },
            { id: 'card-webdev', text: 'Web Development 1', icon: 'fa-solid fa-globe', bg: 'image/book2.svg', progress: '65%' },
            { id: 'card-sysarch', text: 'Computer Systems Arch', icon: 'fa-solid fa-microchip', bg: 'image/book3.svg', progress: '25%' },
            { id: 'card-empowerment', text: 'Empowerment Technologies', icon: 'fa-solid fa-lightbulb', bg: 'image/book4.svg', progress: '10%' },
            { id: 'card-networks', text: 'Network Basics', icon: 'fa-solid fa-network-wired', bg: 'image/book5.svg', progress: '20%' },
            { id: 'card-database', text: 'Database Management 1', icon: 'fa-solid fa-database', bg: 'image/book6.svg', progress: '50%' },
            { id: 'card-graphics', text: 'Graphic Design & Layout', icon: 'fa-solid fa-palette', bg: 'image/book7.svg', progress: '35%' },
            { id: 'card-mobile', text: 'Mobile App Development', icon: 'fa-solid fa-mobile-screen', bg: 'image/book8.svg', progress: '15%' }
        ],
        completed: [
            { id: 'card-introcomp', text: 'Intro to Computing', icon: 'fa-solid fa-desktop' },
            { id: 'card-oralcomm', text: 'Oral Communication', icon: 'fa-solid fa-comments' },
            { id: 'card-genmath', text: 'General Mathematics', icon: 'fa-solid fa-infinity' },
            { id: 'card-animation', text: 'Animation (Basic)', icon: 'fa-solid fa-palette' }
        ]
    };

    function renderHomeReels() {
        const container = document.querySelector('.reels-container');
        const prevBtn = document.getElementById('reel-prev');
        const nextBtn = document.getElementById('reel-next');
        if (!container) return;

        container.innerHTML = ''; // Clear skeletons
        subjectsData.enrolled.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'reel-card group';
            card.innerHTML = `
                <div class="reel-image-container">
                    <img src="${subject.bg}" alt="${subject.text}" class="reel-image">
                    <div class="reel-overlay">
                        <div class="mb-4">
                            <h3 class="font-bold text-lg leading-tight mb-2">${subject.text}</h3>
                            <div class="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <div class="h-full bg-icc-yellow shadow-[0_0_8px_rgba(255,208,0,0.5)]" style="width: ${subject.progress}"></div>
                            </div>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-[9px] font-black tracking-widest uppercase opacity-60">Course Feed</span>
                                <span class="text-[9px] font-black tracking-widest text-icc-yellow uppercase">${subject.progress}</span>
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
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        target.classList.add('ring-2', 'ring-icc-yellow', 'ring-offset-4');
                        setTimeout(() => target.classList.remove('ring-2', 'ring-icc-yellow', 'ring-offset-4'), 2000);
                    }
                }, 100);
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
                            <a href="#" data-scroll-to="${item.id}" class="flex items-center gap-3 px-4 py-2 text-[11px] text-gray-600 hover:bg-icc/5 hover:text-icc rounded-lg transition-all font-medium">
                                <i class="${item.icon} text-center w-4"></i>
                                <span>${item.text}</span>
                            </a>
                        `).join('')}
                    </div>
                `;

                // Accordion Toggle
                const header = groupDiv.querySelector('.sub-nav-group-header');
                header.addEventListener('click', (e) => {
                    if (e.target.closest('.group-label') || e.target.closest('.fa-chevron-right')) {
                        groupDiv.classList.toggle('active');
                    } else {
                        // Clicking header background scrolls to section
                        const section = document.getElementById(sectionId);
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                    }
                });

                // Auto-Scroll to card
                groupDiv.querySelectorAll('[data-scroll-to]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const card = document.getElementById(link.dataset.scrollTo);
                        if (card) {
                            card.scrollIntoView({ behavior: 'smooth' });
                            // Subtle highlight pulse
                            card.style.borderColor = '#FFD000';
                            card.style.boxShadow = '0 0 15px rgba(255,208,0,0.3)';
                            setTimeout(() => {
                                card.style.borderColor = '#f1f5f9';
                                card.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                            }, 2000);
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

    // --- Phase 6: Interactive Subject Details Toggle ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.subject-card-wide');
        if (card) {
            // Find the immediate next .subject-details sibling
            const details = card.nextElementSibling;
            if (details && details.classList.contains('subject-details')) {
                const isHidden = details.classList.contains('hidden');

                // Optional: Close all other details first? (Accordion behavior)
                // document.querySelectorAll('.subject-details').forEach(d => d.classList.add('hidden'));

                if (isHidden) {
                    details.classList.remove('hidden');
                    card.classList.add('ring-2', 'ring-icc-yellow/30', 'bg-gray-50/50');
                } else {
                    details.classList.add('hidden');
                    card.classList.remove('ring-2', 'ring-icc-yellow/30', 'bg-gray-50/50');
                }
            }
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
            events: [{ name: "Technical Audit Session", time: "10:00 AM â€¢ Lab 1", link: "#" }],
            tasks: [{ name: "Physics Problem Set #4", time: "Due 11:59 PM" }],
            notes: "Please finalize the audit documentation before the meeting."
        },
        "22-3-2026": {
            events: [{ name: "Biology Midterms", time: "1:30 PM â€¢ Main Hall", link: "#" }],
            tasks: [{ name: "Pre-Calculus Quiz Review", time: "9:00 AM" }]
        },
        "25-3-2026": {
            notes: "Holiday - No classes scheduled."
        },
        "26-3-2026": {
            events: [{ name: "Advanced Physics Lab", time: "2:00 PM â€¢ Lab 4", link: "#" }],
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

        let stickyDateKey = null; // Track clicked date for "retain" logic

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

            // Mark Today as Green (Priority highlight)
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

            dayDiv.addEventListener('mouseenter', (e) => {
                // ALWAYS highlight current hover in yellow
                document.querySelectorAll('.calendar-day').forEach(d => {
                    const dn = parseInt(d.textContent);
                    applyDayStyle(d, isToday(dn) ? 'today' : 'none');
                });
                applyDayStyle(dayDiv, 'active');

                // Sync the bottom event panel on hover
                updateEventPanel(dayNum, month, year);
            });

            dayDiv.addEventListener('mouseleave', () => {
                // Reset Highlights
                document.querySelectorAll('.calendar-day').forEach(d => {
                    const dn = parseInt(d.textContent);
                    applyDayStyle(d, isToday(dn) ? 'today' : 'none');
                });

                if (stickyDateKey) {
                    // Restore sticky state in bottom panel
                    const stickyParts = stickyDateKey.split('-');
                    const sDay = parseInt(stickyParts[0]);
                    const sMonth = parseInt(stickyParts[1]) - 1;
                    const sYear = parseInt(stickyParts[2]);

                    const stickyEl = Array.from(document.querySelectorAll('.calendar-day')).find(d => parseInt(d.textContent) === sDay && !d.classList.contains('py-2-empty'));

                    if (stickyEl) {
                        applyDayStyle(stickyEl, 'active');
                        updateEventPanel(sDay, sMonth, sYear);
                    }
                } else {
                    // Revert to Today's data
                    updateEventPanel(todayDate, todayMonth, todayYear);
                }
            });

            dayDiv.addEventListener('click', (e) => {
                const data = calendarSchedule[dateKey];
                if (data && (data.events || data.tasks || data.notes)) {
                    if (stickyDateKey === dateKey) {
                        stickyDateKey = null;
                    } else {
                        stickyDateKey = dateKey;
                    }
                    // Sync view
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
    // TODO: Replace classEndHour / classEndMin with values from your database API
    const classTimerEl = document.getElementById('class-timer');
    if (classTimerEl) {
        const classEndHour = 11;   // Class ends at 11:00 AM
        const classEndMin = 0;

        function updateClassTimer() {
            const now = new Date();
            const end = new Date();
            end.setHours(classEndHour, classEndMin, 0, 0);

            const diffMs = end - now;

            if (diffMs <= 0) {
                classTimerEl.textContent = 'Class ended';
                classTimerEl.style.color = '#ef4444'; // red
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
                classTimerEl.style.color = '#ef4444'; // turn red in last minute
            }
        }

        updateClassTimer(); // run immediately
        const classTimerInterval = setInterval(updateClassTimer, 1000);
    }

    window.addEventListener('resize', updateLayout);
    switchTab('nav-home');
});
