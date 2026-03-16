document.addEventListener('DOMContentLoaded', () => {
    // Disable transitions during initialization
    document.documentElement.classList.add('no-transition');

    const sidebar = document.getElementById('sidebar');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const toggleBtn = document.getElementById('sidebarToggle');
    const pageTitle = document.getElementById('page-title');
    const navLinks = document.querySelectorAll('#sidebar nav a');

    // --- Sidebar State Persistence ---
    const savedState = localStorage.getItem('sidebarState');
    const isMobile = window.innerWidth < 1024;

    // Default is collapsed in HTML. Only remove if user explicitly wanted it expanded.
    if (!isMobile) {
        if (savedState === 'expanded') {
            sidebar.classList.remove('sidebar-collapsed');
        } else if (savedState === null) {
            localStorage.setItem('sidebarState', 'collapsed'); // Keep default
        }
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
            if (isMobile && sidebar) {
                // On mobile, hide the sidebar after picking a page
                sidebar.classList.remove('sidebar-visible');
            }
            // On desktop, we do NOT change the sidebar-collapsed state.
            // It stays in whatever state the user set via the grid button.

            // Prevent default for all nav links to avoid reload "sliding"
            e.preventDefault();
        });
    });

    // --- Profile Dropdown Logic ---

    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileMenu = document.getElementById('profileDropdownMenu');

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('hidden');
            profileMenu.classList.toggle('dropdown-active');
            profileBtn.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.add('hidden');
                profileMenu.classList.remove('dropdown-active');
                profileBtn.classList.remove('active');
            }
        });
    }

});

