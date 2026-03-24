/* ADMIN DASHBOARD CORE LOGIC (Clean & Professional) */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.admin-section');
    const sectionTitle = document.getElementById('section-title');
    const logoutBtn = document.getElementById('adminLogout');

    // 2. Navigation Handling (No Animation)
    const handleNavigation = (targetId) => {
        if (!targetId) return;

        // Update UI: Sidebar Links (if it's a primary section)
        const primaryLink = document.querySelector(`.nav-link[data-section="${targetId}"]`);
        if (primaryLink) {
            navLinks.forEach(l => {
                l.classList.remove('active', 'bg-admin-accent', 'text-white');
                l.classList.add('text-slate-400');
            });
            primaryLink.classList.add('active', 'bg-admin-accent', 'text-white');
            primaryLink.classList.remove('text-slate-400');
        }

        // Update UI: Main Sections
        sections.forEach(sec => {
            sec.classList.remove('active-section');
            sec.classList.add('hidden'); // Ensure tailwind hidden is there too
        });

        const targetSec = document.getElementById(`section-${targetId}`);
        if (targetSec) {
            targetSec.classList.remove('hidden');
            targetSec.classList.add('active-section');
            
            // Update Page Title (Pro labels)
            const labels = {
                'dashboard': 'System Dashboard',
                'mail': 'Official School Mail',
                'users': 'User Account Management',
                'register-user': 'Individual Registration',
                'bulk-enrollment': 'Bulk Enrollment Process',
                'subjects': 'Subject Catalog',
                'subject-editor': 'Curriculum Allocation',
                'strands': 'SHS Strand Management',
                'ai-insights': 'Sigma AI Analytics',
                'grade-analytics': 'Institutional Monitoring',
                'announcements': 'System Broadcast',
                'logs': 'Security & Audit Logs',
                'settings': 'System Configuration'
            };
            sectionTitle.textContent = labels[targetId] || 'Admin Portal';
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavigation(link.getAttribute('data-section'));
        });
    });

    // 3. Sub-Navigation (SPA Style for Registration)
    document.addEventListener('click', (e) => {
        const subBtn = e.target.closest('.sub-nav-btn');
        if (subBtn) {
            e.preventDefault();
            handleNavigation(subBtn.getAttribute('data-target'));
        }
    });

    // 4. Realistic Logout (Confirmation Dialog)
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (confirm('TERMINATE SESSION: Are you sure you want to log out of the SIGMA ELMS Admin Portal?')) {
                window.location.href = 'index.html';
            }
        };
    }

    // 5. Wireframe Feedback (Simulate actions)
    document.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('button');
        if (actionBtn && actionBtn.textContent) {
            const btnText = actionBtn.textContent;
            if (btnText.includes('Save') || btnText.includes('Release') || btnText.includes('Create')) {
                const originalText = btnText;
                actionBtn.textContent = 'Processing...';
                actionBtn.disabled = true;
                
                setTimeout(() => {
                    actionBtn.textContent = 'Success!';
                    actionBtn.classList.add('bg-green-500', 'text-white');
                    
                    setTimeout(() => {
                        actionBtn.textContent = originalText;
                        actionBtn.disabled = false;
                        actionBtn.classList.remove('bg-green-500', 'text-white');
                        alert(`WIRE-ACTION: ${originalText} executed successfully in this prototype.`);
                    }, 1000);
                }, 800);
            }
        }
    });

    // 6. Data Logic Placeholders (for future functionality)
    console.log('SIGMA ELMS Admin Portal Loaded | Session: Optimal');
});
