// Sidebar Functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');
const searchInput = document.querySelector('.search-bar input');
const searchMobileToggle = document.getElementById('searchmobiletoggle');
const searchBar = document.querySelector('.search-bar');

// Check if elements exist to prevent errors
if (!sidebar || !sidebarToggle || !mainContent) {
    console.error('Sidebar elements not found! Check your HTML IDs');
}

// Create mobile overlay for sidebar
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

// Create mobile search backdrop
const searchBackdrop = document.createElement('div');
searchBackdrop.className = 'search-backdrop';
searchBackdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: none;
`;
document.body.appendChild(searchBackdrop);

// Mobile search state
let isMobileSearchActive = false;

// Search data
const searchData = [
    // Core Features
    { title: 'Dashboard', section: 'dashboard', type: 'core', description: 'Main dashboard overview' },
    { title: 'To-Do List', section: 'todo', type: 'core', description: 'Manage your tasks and assignments' },
    { title: 'Pomodoro Timer', section: 'timer', type: 'core', description: 'Focus timer with work/break intervals' },
    { title: 'Quick Links', section: 'links', type: 'core', description: 'Access your frequently used links' },
    { title: 'Motivational Quotes', section: 'quotes', type: 'core', description: 'Get inspired with daily quotes' },
    
    // Tools
    { title: 'PDF Converter', section: 'pdf-converter', type: 'tool', description: 'Convert documents to PDF format' },
    { title: 'Flashcard Generator', section: 'flashcards', type: 'tool', description: 'Create study flashcards' },
    { title: 'Quiz Maker', section: 'quiz-maker', type: 'tool', description: 'Generate custom quizzes' },
    { title: 'PDF Combiner', section: 'pdf-combiner', type: 'tool', description: 'Merge multiple PDF files' },
    { title: 'PDF Summarizer', section: 'pdf-summarizer', type: 'tool', description: 'Summarize PDF documents' },
    
    // Settings
    { title: 'Theme Settings', section: 'theme', type: 'settings', description: 'Customize appearance and themes' },
    { title: 'Account', section: 'account', type: 'settings', description: 'Manage your account settings' }
];

// Sidebar Functions
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

// Search Functions
function activateMobileSearch() {
    if (window.innerWidth > 768) return;
    
    isMobileSearchActive = true;
    searchBar.classList.add('active');
    searchBackdrop.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Focus and show keyboard
    setTimeout(() => {
        searchInput.focus();
    }, 100);
}

function deactivateMobileSearch() {
    if (window.innerWidth > 768) return;
    
    isMobileSearchActive = false;
    searchBar.classList.remove('active');
    searchBackdrop.style.display = 'none';
    document.body.style.overflow = ''; // Re-enable scrolling
    hideSearchResults();
    searchInput.value = '';
    searchInput.blur();
}

function performSearch(query) {
    if (!query.trim()) {
        hideSearchResults();
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = searchData.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm)
    );
    
    displaySearchResults(results, searchTerm);
}

function displaySearchResults(results, searchTerm) {
    hideSearchResults(); // Clear previous results
    
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    
    // Base styles for both desktop and mobile
    if (window.innerWidth <= 768) {
        // Mobile styles
        searchResults.style.cssText = `
            position: fixed;
            top: calc(var(--navbar-height) + 80px);
            left: 10px;
            right: 10px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            max-height: 60vh;
            overflow-y: auto;
            z-index: 1002;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        `;
    } else {
        // Desktop styles
        searchResults.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 12px 12px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1002;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
    }
    
    if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'search-result-item';
        noResults.style.cssText = `
            padding: ${window.innerWidth <= 768 ? '20px' : '15px'}; 
            color: var(--text-muted); 
            text-align: center;
            font-size: ${window.innerWidth <= 768 ? '16px' : '14px'};
        `;
        noResults.textContent = `No results found for "${searchTerm}"`;
        searchResults.appendChild(noResults);
    } else {
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            // Responsive padding
            resultItem.style.cssText = `
                padding: ${window.innerWidth <= 768 ? '16px 20px' : '12px 15px'};
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            resultItem.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: ${window.innerWidth <= 768 ? '18px' : '14px'};">
                        ${highlightText(result.title, searchTerm)}
                    </div>
                    <div style="font-size: ${window.innerWidth <= 768 ? '14px' : '0.8rem'}; color: var(--text-muted);">
                        ${highlightText(result.description, searchTerm)}
                    </div>
                </div>
                <span style="font-size: 0.7rem; padding: 4px 8px; background: var(--primary-color); border-radius: 12px; text-transform: capitalize;">
                    ${result.type}
                </span>
            `;
            
            resultItem.addEventListener('click', function() {
                navigateToSection(result.section);
                hideSearchResults();
                searchInput.value = '';
                if (window.innerWidth <= 768) {
                    deactivateMobileSearch();
                }
            });
            
            resultItem.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 255, 255, 0.05)';
            });
            
            resultItem.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    // Append to appropriate parent based on screen size
    if (window.innerWidth <= 768) {
        document.body.appendChild(searchResults);
    } else {
        searchBar.appendChild(searchResults);
    }
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-color); color: white; padding: 2px 0;">$1</mark>');
}

function hideSearchResults() {
    const existingResults = document.querySelector('.search-results');
    if (existingResults) {
        existingResults.remove();
    }
}

function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update active nav item
        const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }
    }
}

// Event Listeners

// Sidebar toggle
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

// Mobile search toggle
searchMobileToggle.addEventListener('click', function() {
    if (window.innerWidth <= 768) {
        if (isMobileSearchActive) {
            deactivateMobileSearch();
        } else {
            activateMobileSearch();
        }
    }
});

// Close search when clicking backdrop
searchBackdrop.addEventListener('click', deactivateMobileSearch);

// Search input events
searchInput.addEventListener('input', function(e) {
    performSearch(e.target.value);
});

searchInput.addEventListener('focus', function() {
    if (this.value.trim() && window.innerWidth > 768) {
        performSearch(this.value);
    }
});

// Close search results when clicking outside (desktop)
document.addEventListener('click', function(e) {
    if (window.innerWidth > 768) {
        if (!searchBar.contains(e.target) && !searchMobileToggle.contains(e.target)) {
            hideSearchResults();
        }
    }
});

// Keyboard events
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const firstResult = document.querySelector('.search-result-item');
        if (firstResult && !firstResult.classList.contains('no-results')) {
            firstResult.click();
        }
    }
    
    if (e.key === 'Escape') {
        if (window.innerWidth <= 768 && isMobileSearchActive) {
            deactivateMobileSearch();
        } else {
            hideSearchResults();
            this.blur();
        }
    }
});

// Window resize handler
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
            
            // Close mobile search if open
            if (isMobileSearchActive) {
                deactivateMobileSearch();
            }
            
            // Ensure proper desktop state
            updateMainContentMargin();
        } else {
            // Reset for mobile
            sidebar.classList.remove('collapsed');
            mainContent.style.marginLeft = '0';
        }
        
        // Clear search results on resize
        hideSearchResults();
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