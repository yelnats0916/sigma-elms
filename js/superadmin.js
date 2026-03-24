document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dynamic-section');

    function switchTab(navId) {
        // Update Sidebar
        navLinks.forEach(link => {
            if (link.id === navId) {
                link.classList.add('bg-super-accent', 'text-white', 'shadow-xl');
                link.classList.remove('hover:bg-white/5', 'text-slate-400', 'hover:text-white');
            } else {
                link.classList.remove('bg-super-accent', 'text-white', 'shadow-xl');
                link.classList.add('hover:bg-white/5', 'text-slate-400', 'hover:text-white');
            }
        });

        // Update Sections
        const sectionId = navId.replace('nav-', '') + '-view';
        sections.forEach(section => {
            section.classList.toggle('hidden', section.id !== sectionId);
        });

        // Specific logic for Logs view
        if (sectionId === 'logs-view') {
            const logsContainer = document.getElementById('logs-terminal');
            if (logsContainer) {
                logsContainer.scrollTop = logsContainer.scrollHeight;
            }
        }
    }

    // Attach click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.id);
        });
    });

    // Mock Logs Data
    const logEntries = [
        "[INFO] SIGMA Neural Engine v2.4.0 initialized.",
        "[SYSTEM] Node ICC-MAIN-01 connected at 192.168.1.100.",
        "[SECURITY] Superadmin session started from terminal-alpha.",
        "[AI] Core weights sync successful. Loss: 0.0024.",
        "[SYNC] Backup Vault SIGMA-SAFE-7 completed sync.",
        "[INFO] Monitoring 45 institutional nodes...",
        "[AUTH] Institutional Admin logged in: Admin_Reyes@ICC.",
        "[SYSTEM] Patch 2.4.1 available for deployment."
    ];

    const logsTerminal = document.getElementById('logs-terminal');
    if (logsTerminal) {
        let logIndex = 0;
        setInterval(() => {
            const entry = logEntries[logIndex % logEntries.length];
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
            const logElement = document.createElement('div');
            logElement.className = 'py-1 border-b border-white/5 font-mono text-[10px]';
            logElement.innerHTML = `<span class="text-slate-500">[${timestamp}]</span> <span class="text-super-accent">${entry}</span>`;
            logsTerminal.appendChild(logElement);
            logsTerminal.scrollTop = logsTerminal.scrollHeight;
            logIndex++;
        }, 5000);
    }
});

// Global functions
window.toggleAdminForm = function() {
    const form = document.getElementById('provision-admin-form');
    if (form) {
        form.classList.toggle('hidden');
    }
};
