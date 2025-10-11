// Sidebar Functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');

// Check if elements exist to prevent errors
if (!sidebar || !sidebarToggle || !mainContent) {
    console.error('Sidebar elements not found! Check your HTML IDs');
}

// Create mobile overlay
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 998;
    display: none;
`;
document.body.appendChild(overlay);

function toggleSidebar() {
    if (window.innerWidth <= 768) {
        // Mobile behavior - use active class
        sidebar.classList.toggle('active');
        overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
        
        // Prevent body scroll when sidebar is open
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    } else {
        // Desktop behavior - use collapsed class
        sidebar.classList.toggle('collapsed');
        
        // Update main content margin
        updateMainContentMargin();
    }
}

function updateMainContentMargin() {
    if (sidebar.classList.contains('collapsed')) {
        mainContent.style.marginLeft = '60px';
    } else {
        mainContent.style.marginLeft = '240px';
    }
}

// Sidebar toggle click
sidebarToggle.addEventListener('click', toggleSidebar);

// Close sidebar when clicking overlay
overlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
});

// Close sidebar when clicking on a nav item (mobile)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    // Debounce resize events for better performance
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (window.innerWidth > 768) {
            // Reset for desktop
            sidebar.classList.remove('active');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            
            // Ensure proper desktop state
            updateMainContentMargin();
        } else {
            // Reset for mobile
            sidebar.classList.remove('collapsed');
            mainContent.style.marginLeft = '0';
        }
    }, 100);
});

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state based on screen size
    if (window.innerWidth > 768) {
        mainContent.style.marginLeft = '240px';
    } else {
        mainContent.style.marginLeft = '0';
    }
    
    // Load saved sidebar state from localStorage (optional)
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true' && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
        mainContent.style.marginLeft = '60px';
    }
});

// Save sidebar state when toggled (optional enhancement)
sidebarToggle.addEventListener('click', function() {
    if (window.innerWidth > 768) {
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
});