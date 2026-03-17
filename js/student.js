document.addEventListener('DOMContentLoaded', () => {
    // Disable transitions during initialization
    document.documentElement.classList.add('no-transition');

    const sidebar = document.getElementById('sidebar');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const toggleBtn = document.getElementById('sidebarToggle');
    const pageTitle = document.getElementById('page-title');
    const navLinks = document.querySelectorAll('#sidebar nav a');

    // --- Sidebar Default State ---
    const isMobile = window.innerWidth < 1024;
    
    // Sidebar always starts collapsed (sidebar-collapsed) on refresh.
    // The HTML has this class by default, so we just ensure it stays that way.
    if (!isMobile) {
        sidebar.classList.add('sidebar-collapsed');
    }



    // Force reflow and re-enable transitions
    window.getComputedStyle(document.documentElement).opacity;
    document.documentElement.classList.remove('no-transition');


    // --- Sidebar Toggle Logic ---
    if (toggleBtn && sidebar && layoutWrapper) {
        toggleBtn.addEventListener('click', () => {
            const isMobile = window.innerWidth < 1024;

            if (isMobile) {
                // Mobile behavior: Toggle visible class
                sidebar.classList.toggle('sidebar-visible');
            } else {
                // Desktop behavior: Toggle collapsed class and rail margin
                sidebar.classList.toggle('sidebar-collapsed');
                // Save state
                if (sidebar.classList.contains('sidebar-collapsed')) {
                    localStorage.setItem('sidebarState', 'collapsed');
                } else {
                    localStorage.setItem('sidebarState', 'expanded');
                }
            }
        });
    }

    // --- Navigation & Dynamic Header Title ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Update Header & Browser Title
            const iconSpan = link.querySelector('.full-label');
            if (iconSpan && pageTitle) {
                const navText = iconSpan.textContent;
                // Special case: Home link shows "Dashboard" in header
                const displayTitle = (navText === 'Home') ? 'Dashboard' : navText;

                pageTitle.textContent = displayTitle;
                document.title = `${displayTitle} - ICC ELMS`;
            }


            // Manage Active State
            navLinks.forEach(l => l.classList.remove('bg-white/20'));
            navLinks.forEach(l => l.classList.add('hover:bg-white/10'));

            link.classList.add('bg-white/20');
            link.classList.remove('hover:bg-white/10');

            // Manage Sidebar State on Click
            const isMobile = window.innerWidth < 1024;
            const navText = iconSpan ? iconSpan.textContent : '';

            if (isMobile && sidebar) {
                // On mobile, hide the sidebar after picking a page
                sidebar.classList.remove('sidebar-visible');
            } else if (!isMobile && sidebar) {
                // On desktop, collapse the sidebar when ANY link is clicked
                sidebar.classList.add('sidebar-collapsed');
            }


            // Dynamic Section Switching Logic
            const sectionMap = {
                'nav-home': 'section-home',
                'nav-messages': 'section-messages',
                'nav-courses': 'section-courses',
                'nav-assignments': 'section-assignments',
                'nav-grades': 'section-grades',
                'nav-schedule': 'section-schedule',
                'nav-board': 'section-board',
                'nav-ai': 'section-ai',
                'nav-journal': 'section-journal'
            };

            const targetSectionId = sectionMap[link.id];
            if (targetSectionId) {
                // Hide all sections
                document.querySelectorAll('.dynamic-section').forEach(s => s.classList.add('hidden'));
                // Show selected section
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                }
            }

            // Prevent default for all nav links to avoid reload "sliding"
            e.preventDefault();
        });
    });

    // --- Dropdown Logic (Profile, Notifications, Messages, & Create) ---
    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileMenu = document.getElementById('profileDropdownMenu');
    const notifBtn = document.getElementById('notifDropdownBtn');
    const notifMenu = document.getElementById('notifDropdownMenu');
    const msgBtn = document.getElementById('msgDropdownBtn');
    const msgMenu = document.getElementById('msgDropdownMenu');
    const createBtn = document.getElementById('createDropdownBtn');
    const createMenu = document.getElementById('createDropdownMenu');

    if (profileBtn && profileMenu && notifBtn && notifMenu && msgBtn && msgMenu && createBtn && createMenu) {
        
        const closeAllDropdowns = () => {
            [profileMenu, notifMenu, msgMenu, createMenu].forEach(m => m.classList.add('hidden'));
            [profileBtn, notifBtn, msgBtn, createBtn].forEach(b => b.classList.remove('active'));
        };

        // Toggle Profile
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = profileMenu.classList.contains('hidden');
            closeAllDropdowns();
            if (isHidden) {
                profileMenu.classList.remove('hidden');
                profileBtn.classList.add('active');
            }
        });

        // Toggle Notifications
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = notifMenu.classList.contains('hidden');
            closeAllDropdowns();
            if (isHidden) {
                notifMenu.classList.remove('hidden');
                notifBtn.classList.add('active');
            }
        });

        // Toggle Messages
        msgBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = msgMenu.classList.contains('hidden');
            closeAllDropdowns();
            if (isHidden) {
                msgMenu.classList.remove('hidden');
                msgBtn.classList.add('active');
            }
        });

        // Toggle Create
        createBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = createMenu.classList.contains('hidden');
            closeAllDropdowns();
            if (isHidden) {
                createMenu.classList.remove('hidden');
                createBtn.classList.add('active');
            }
        });

        // Close when clicking outside
        window.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target) &&
                !notifBtn.contains(e.target) && !notifMenu.contains(e.target) &&
                !msgBtn.contains(e.target) && !msgMenu.contains(e.target) &&
                !createBtn.contains(e.target) && !createMenu.contains(e.target)) {
                closeAllDropdowns();
            }
        });
    }

});

