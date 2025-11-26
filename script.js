
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');
const searchInput = document.querySelector('.search-bar input');
const searchMobileToggle = document.getElementById('searchmobiletoggle');
const searchBar = document.querySelector('.search-bar');

function showNotification(message, type = 'info') {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Change this function to accept supabaseClient as parameter
async function testConnection(supabaseClient) {
    try {
        const { data, error } = await supabaseClient.from('tasks').select('*').limit(1);
        
        if (error) {
            console.error('Supabase connection failed:', error);
            
            showNotification('Database connection failed', 'error');
            return false;
        }
        
        console.log('✅ Supabase connected successfully!', data);
        return true;
    } catch (error) {
        console.error('Connection test failed:', error);
        showNotification('Connection test failed', 'error');
        return false;
    }
}

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
    { title: 'Background Remover', section: 'bg-remover', type: 'tool', description: 'Remove Background from images' },
    
    // Settings
    { title: 'Theme Settings', section: 'theme', type: 'settings', description: 'Customize appearance and themes' },
    { title: 'Account', section: 'account', type: 'settings', description: 'Manage your account settings' }
];

// Timer functionality
let timerInterval;
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerRunning = false;
let isBreakTime = false;

function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    const timerDisplay = document.querySelector('.timer-display');
    const statusDisplay = document.querySelector('.timer-status');
    
    statusDisplay.textContent = isBreakTime ? 'Break time! ☕' : 'Focus time! 🎯';
    
    timerInterval = setInterval(() => {
        if (timerSeconds === 0) {
            if (timerMinutes === 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                
                // Switch between work and break
                isBreakTime = !isBreakTime;
                if (isBreakTime) {
                    timerMinutes = parseInt(document.getElementById('breakDuration')?.value || 5);
                    statusDisplay.textContent = 'Break time! Session complete! 🎉';
                } else {
                    timerMinutes = parseInt(document.getElementById('workDuration')?.value || 25);
                    statusDisplay.textContent = 'Focus time! Break complete! ⏰';
                }
                
                timerSeconds = 0;
                updateTimerDisplay();
                
                // Optional: Play sound notification
                // new Audio('notification.mp3').play().catch(e => console.log('Audio play failed:', e));
                return;
            }
            timerMinutes--;
            timerSeconds = 59;
        } else {
            timerSeconds--;
        }
        
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timerInterval);
    isTimerRunning = false;
    const statusDisplay = document.querySelector('.timer-status');
    if (statusDisplay) statusDisplay.textContent = 'Paused ⏸️';
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    isBreakTime = false;
    timerMinutes = parseInt(document.getElementById('workDuration')?.value || 25);
    timerSeconds = 0;
    updateTimerDisplay();
    const statusDisplay = document.querySelector('.timer-status');
    if (statusDisplay) statusDisplay.textContent = 'Ready to focus! 🎯';
}

function updateTimerDisplay() {
    const minutesDisplay = document.getElementById('timerMinutes');
    const secondsDisplay = document.getElementById('timerSeconds');
    const minutesDisplayFull = document.getElementById('timerMinutesFull');
    const secondsDisplayFull = document.getElementById('timerSecondsFull');
    
    const formattedMinutes = timerMinutes.toString().padStart(2, '0');
    const formattedSeconds = timerSeconds.toString().padStart(2, '0');
    
    if (minutesDisplay) minutesDisplay.textContent = formattedMinutes;
    if (secondsDisplay) secondsDisplay.textContent = formattedSeconds;
    if (minutesDisplayFull) minutesDisplayFull.textContent = formattedMinutes;
    if (secondsDisplayFull) secondsDisplayFull.textContent = formattedSeconds;
}

// Todo List functionality
let tasks = [];

function openAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'flex';
    document.getElementById('taskTitle').focus();
}

function closeAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'none';
    document.getElementById('taskForm').reset();
}

function addTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    
    if (!title) return;
    
    const newTask = {
        id: Date.now(),
        title,
        description,
        dueDate,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closeAddTaskModal();
}

function renderTasks() {
    const todoList = document.getElementById('todoList');
    const todoListFull = document.getElementById('todoListFull');
    
    // Get current filter
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    
    // Filter tasks
    let filteredTasks = tasks;
    if (activeFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (activeFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // ✅ FIX DASHBOARD TODO LIST (check this part too!)
    if (todoList) {
        const dashboardTasks = filteredTasks.slice(0, 5);
        
        if (dashboardTasks.length === 0) {
            todoList.innerHTML = '<p class="empty-state">No tasks yet. Add your first task!</p>';
        } else {
            todoList.innerHTML = dashboardTasks.map(task => `
                <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                        <!-- EMPTY - NO CHECKMARK TEXT -->
                    </div>
                    <div class="task-content">
                        <div class="task-text">${task.title}</div>
                        ${task.dueDate ? `<div class="task-due">Due: ${new Date(task.dueDate).toLocaleString()}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }
    
    // ✅ FIX FULL TODO LIST (you already did this part)
    if (todoListFull) {
        if (filteredTasks.length === 0) {
            todoListFull.innerHTML = '<p class="empty-state">No tasks match your filter.</p>';
        } else {
            todoListFull.innerHTML = filteredTasks.map(task => `
                <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                        <!-- EMPTY - NO CHECKMARK TEXT -->
                    </div>
                    <div class="task-content">
                        <div class="task-text">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        ${task.dueDate ? `<div class="task-due">Due: ${new Date(task.dueDate).toLocaleString()}</div>` : ''}
                    </div>
                    <button class="btn-secondary delete-task" data-task-id="${task.id}">Delete</button>
                </div>
            `).join('');
        }
    }
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

// Local Storage for data persistence
function saveTasks() {
    localStorage.setItem('studysync-tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('studysync-tasks');
    if (saved) {
        tasks = JSON.parse(saved);
        renderTasks();
    }
}

// Quick Links functionality
let quickLinks = [
    { name: 'Google Drive', url: 'https://drive.google.com' },
    { name: 'University Portal', url: 'https://university.edu' },
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'Spotify', url: 'https://spotify.com' },
    { name: 'Notion', url: 'https://notion.so' }
];

function openAddLinkModal() {
    console.log('🔍 DEBUG: openAddLinkModal called');
    const modal = document.getElementById('addLinkModal');
    console.log('🔍 DEBUG: Modal found:', modal);
    
    if (modal) {
        modal.style.display = 'flex';
        console.log('🔍 DEBUG: Modal display set to flex');
        document.getElementById('linkName')?.focus();
    } else {
        console.log('❌ DEBUG: Modal not found!');
    }
}

function closeAddLinkModal() {
    const modal = document.getElementById('addLinkModal');
    modal.style.display = 'none';
    document.getElementById('linkForm').reset();
}

function addLink(event) {
    event.preventDefault();
    console.log('🔍 DEBUG: addLink function STARTED');
    
    const nameInput = document.getElementById('linkName');
    const urlInput = document.getElementById('linkUrl');
    
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    
    console.log('🔍 DEBUG: Raw input values - Name:', name, 'URL:', url);
    
    if (!name || !url) {
        console.log('❌ DEBUG: Validation failed - empty fields');
        showNotification('Please fill in both name and URL', 'error');
        return;
    }
    
    console.log('✅ DEBUG: Validation passed');
    
    // === ADD DEBUG LINES HERE ===
    console.log('🔍 DEBUG: Before cleanup:', url);
    let formattedUrl = url.replace(/\/+$/, '');
    console.log('🔍 DEBUG: After removing slashes:', formattedUrl);
    
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
        console.log('🔍 DEBUG: After adding https:', formattedUrl);
    }
    console.log('🔍 DEBUG: Final URL:', formattedUrl);
    // === END DEBUG LINES ===
    
    const newLink = {
        name,
        url: formattedUrl
    };
    
    console.log('🔍 DEBUG: New link object:', newLink);
    
    quickLinks.push(newLink);
    saveQuickLinks();
    renderQuickLinks();
    closeAddLinkModal();
    
    console.log('✅ DEBUG: Link added successfully!');
    showNotification('Link added successfully!', 'success');
}

function renderQuickLinks() {
    const linksGrid = document.querySelector('.links-grid');
    const linksGridFull = document.getElementById('linksGridFull');

    if (linksGrid) {
        linksGrid.innerHTML = quickLinks.map(link => `
            <a href="${link.url}" target="_blank" class="link-item">
                ${link.name}
            </a>
        `).join('') + '<button class="link-item" id="addLinkBtn">+ Add Link</button>';


    }

    
    // Render full links view
    if (linksGridFull) {
        linksGridFull.innerHTML = quickLinks.map(link => `
            <a href="${link.url}" target="_blank" class="link-item">
                ${link.name}
            </a>
        `).join('') + '<button class="link-item" id="addLinkFullBtn">+ Add Link</button>';
    }
    
    console.log('🔍 DEBUG: Quick links rendered');
}

function saveQuickLinks() {
    localStorage.setItem('studysync-links', JSON.stringify(quickLinks));
}

function loadQuickLinks() {
    const saved = localStorage.getItem('studysync-links');
    if (saved) {
        quickLinks = JSON.parse(saved);
        renderQuickLinks();
    }
}

// Motivational Quotes
const quotes = [
    "The secret of getting ahead is getting started. - Mark Twain",
    "Don't let what you cannot do interfere with what you can do. - John Wooden",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
    "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Success is the sum of small efforts, repeated day in and day out. - Robert Collier"
];

let savedQuotes = [];

function getRandomQuote() {
    console.log('New Quote button clicked');
    
    // Use local quotes only (more reliable)
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const newQuote = `"${quotes[randomIndex]}"`;
    
    console.log('Selected quote:', newQuote);
    
    // Update both quote displays
    const quoteElement = document.getElementById('currentQuote');
    const quoteElementFull = document.getElementById('currentQuoteFull');
    
    if (quoteElement) {
        quoteElement.textContent = newQuote;
        console.log('Updated dashboard quote');
    } else {
        console.warn('currentQuote element not found');
    }
    
    if (quoteElementFull) {
        quoteElementFull.textContent = newQuote;
        console.log('Updated full page quote');
    } else {
        console.warn('currentQuoteFull element not found');
    }
}

function saveCurrentQuote() {
    const currentQuote = document.getElementById('currentQuoteFull')?.textContent || 
                         document.getElementById('currentQuote')?.textContent;
    
    if (currentQuote && !savedQuotes.includes(currentQuote)) {
        savedQuotes.push(currentQuote);
        saveSavedQuotes();
        renderSavedQuotes();
    }
}

function renderSavedQuotes() {
    const savedQuotesList = document.getElementById('savedQuotesList');
    if (savedQuotesList) {
        if (savedQuotes.length === 0) {
            savedQuotesList.innerHTML = '<p class="empty-state">No saved quotes yet.</p>';
        } else {
            savedQuotesList.innerHTML = savedQuotes.map(quote => `
                <div class="saved-quote-item">${quote}</div>
            `).join('');
        }
    }
}

function saveSavedQuotes() {
    localStorage.setItem('studysync-saved-quotes', JSON.stringify(savedQuotes));
}

function loadSavedQuotes() {
    const saved = localStorage.getItem('studysync-saved-quotes');
    if (saved) {
        savedQuotes = JSON.parse(saved);
        renderSavedQuotes();
    }
}

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



// Background Remover Functionality
let currentImage = null;
let processedImageUrl = null;

// Remove.bg API Configuration
const BG_REMOVER_API = {
  removeBg: async (imageFile) => {
    const apiKey = 'jTZa6MtpPWM4L9K26a6ZuVko';
    
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', 'auto');
    
    try {
      console.log('Sending request to Remove.bg API...');
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Background removal failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('Received blob from API');
      return blob;
      
    } catch (error) {
      console.error('Network/API Error:', error);
      throw error;
    }
  }
};


function initBackgroundRemover() {
  const uploadArea = document.getElementById('uploadArea');
  const imageInput = document.getElementById('imageInput');
  const selectImageBtn = document.getElementById('selectImageBtn');
  const removeBgBtn = document.getElementById('removeBgBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  
  // Only initialize if elements exist (user is on bg-remover page)
  if (!uploadArea) return;
  
  // Clear any existing file input value (fixes mobile issue)
  if (imageInput) imageInput.value = '';
  
  // Event listeners
  selectImageBtn.addEventListener('click', () => {
    // Clear input first to ensure change event fires on mobile
    if (imageInput) imageInput.value = '';
    imageInput.click();
  });
  
  imageInput.addEventListener('change', function(e) {
    console.log('File input changed, files:', e.target.files);
    handleImageSelect(e);
  });
  
  uploadArea.addEventListener('click', () => {
    // Clear input first to ensure change event fires on mobile
    if (imageInput) imageInput.value = '';
    imageInput.click();
  });
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    console.log('Files dropped:', files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageFile(files[0]);
    }
  });
  
  removeBgBtn.addEventListener('click', removeBackground);
  downloadBtn.addEventListener('click', downloadResult);
  resetBtn.addEventListener('click', resetBgRemover);
  
  console.log('Background remover initialized successfully');
}

function handleImageSelect(e) {
  console.log('handleImageSelect called, files:', e.target.files);
  
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    console.log('Valid image selected:', file.name);
    handleImageFile(file);
  } else {
    console.log('No valid image file selected');
  }
}

function handleImageFile(file) {
  console.log('handleImageFile called with:', file.name);
  
  currentImage = file;
  
  const originalPreview = document.getElementById('originalPreview');
  const removeBgBtn = document.getElementById('removeBgBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resultPreview = document.getElementById('resultPreview');
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    console.log('FileReader loaded image successfully');
    
    if (originalPreview) {
      originalPreview.innerHTML = `<img src="${e.target.result}" alt="Original image">`;
      console.log('Original preview updated');
    }
    if (removeBgBtn) {
      removeBgBtn.disabled = false;
      console.log('Remove background button enabled');
    }
    if (downloadBtn) {
      downloadBtn.disabled = true;
    }
    
    // Clear previous result
    if (resultPreview) {
      resultPreview.innerHTML = '<p>Result will appear here</p>';
    }
    processedImageUrl = null;
  };
  
  reader.onerror = function(error) {
    console.error('FileReader error:', error);
    alert('Error reading the image file. Please try again.');
  };
  
  reader.readAsDataURL(file);
}

async function removeBackground() {
  if (!currentImage) return;
  
  const loadingSpinner = document.getElementById('loadingSpinner');
  const removeBgBtn = document.getElementById('removeBgBtn');
  const resultPreview = document.getElementById('resultPreview');
  const downloadBtn = document.getElementById('downloadBtn');
  
  if (loadingSpinner) loadingSpinner.style.display = 'block';
  if (removeBgBtn) removeBgBtn.disabled = true;
  
  try {
    console.log('=== BACKGROUND REMOVER DEBUG INFO ===');
    console.log('1. Current image:', currentImage);
    console.log('2. Image name:', currentImage.name);
    console.log('3. Image size:', currentImage.size, 'bytes');
    console.log('4. Image type:', currentImage.type);
    console.log('5. API Key being used:', 'jTZa6MtpPWM4L9K26a6ZuVko');
    
    // Test if the image is valid
    if (currentImage.size === 0) {
      throw new Error('Image file is empty');
    }
    if (currentImage.size > 12 * 1024 * 1024) {
      throw new Error('Image is too large (max 12MB)');
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(currentImage.type)) {
      throw new Error('Unsupported image format. Use JPG, PNG, or WEBP');
    }
    
    console.log('6. Making API request to Remove.bg...');
    
    const processedBlob = await BG_REMOVER_API.removeBg(currentImage);
    
    console.log('7. API response received!');
    console.log('8. Processed blob size:', processedBlob.size, 'bytes');
    console.log('9. Processed blob type:', processedBlob.type);
    
    if (processedBlob.size === 0) {
      throw new Error('Received empty response from API');
    }
    
    processedImageUrl = URL.createObjectURL(processedBlob);
    console.log('10. Created object URL:', processedImageUrl);
    
    if (resultPreview) {
      resultPreview.innerHTML = `<img src="${processedImageUrl}" alt="Background removed">`;
      console.log('11. Image displayed in result preview');
    } else {
      console.error('11. ERROR: resultPreview element not found!');
    }
    
    if (downloadBtn) {
      downloadBtn.disabled = false;
      console.log('12. Download button enabled');
    }
    
    console.log('=== BACKGROUND REMOVAL SUCCESSFUL ===');
    
  } catch (error) {
    console.error('=== BACKGROUND REMOVAL FAILED ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      alert('Network error. Please check your internet connection.');
    } 
    // Check for specific API errors
    else if (error.message.includes('401')) {
      alert('Invalid API key. Please check your Remove.bg API key.');
    } else if (error.message.includes('402')) {
      alert('No API credits remaining. Check your Remove.bg account.');
    } else if (error.message.includes('400')) {
      alert('Invalid image file. Please try a different image.');
    } else if (error.message.includes('413')) {
      alert('Image file is too large. Maximum size is 12MB.');
    } else if (error.message.includes('422')) {
      alert('Unable to process this image. Try a different one.');
    } else {
      alert('Failed to remove background: ' + error.message);
    }
  } finally {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (removeBgBtn) removeBgBtn.disabled = false;
    console.log('=== PROCESS COMPLETED ===');
  }
}

function downloadResult() {
  if (!processedImageUrl) return;
  
  const link = document.createElement('a');
  link.href = processedImageUrl;
  link.download = 'background-removed.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetBgRemover() {
  currentImage = null;
  if (processedImageUrl) {
    URL.revokeObjectURL(processedImageUrl);
    processedImageUrl = null;
  }
  
  const originalPreview = document.getElementById('originalPreview');
  const resultPreview = document.getElementById('resultPreview');
  const removeBgBtn = document.getElementById('removeBgBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const imageInput = document.getElementById('imageInput');
  
  if (originalPreview) originalPreview.innerHTML = '<p>No image selected</p>';
  if (resultPreview) resultPreview.innerHTML = '<p>Result will appear here</p>';
  if (removeBgBtn) removeBgBtn.disabled = true;
  if (downloadBtn) downloadBtn.disabled = true;
  if (imageInput) imageInput.value = '';
}

// Event Listeners
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
        const section = this.dataset.section;
        navigateToSection(section);
        
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

let currentAuthTab = 'login';

function openAuthModal() {
    console.log('🔍 DEBUG: Opening auth modal');
    const modal = document.getElementById('authModal');
    modal.style.display = 'flex';
}

function closeAuthModal() {
    console.log('🔍 DEBUG: Closing auth modal');
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
    document.getElementById('authForm').reset();
}

function validateAuthForm() {
    const isLogin = currentAuthTab === 'login';
    const email = document.getElementById(isLogin ? 'loginEmail' : 'signupEmail').value.trim();
    const password = document.getElementById(isLogin ? 'loginPassword' : 'signupPassword').value.trim();
    
    // Clear previous errors
    clearValidationErrors();
    
    let isValid = true;
    
    // Email validation
    if (!email) {
        showFieldError(isLogin ? 'loginEmail' : 'signupEmail', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(isLogin ? 'loginEmail' : 'signupEmail', 'Please enter a valid email');
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        showFieldError(isLogin ? 'loginPassword' : 'signupPassword', 'Password is required');
        isValid = false;
    } else if (!isLogin && password.length < 6) {
        showFieldError('signupPassword', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#f56565';
        // Create error message
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = 'color: #f56565; font-size: 0.8rem; margin-top: 5px;';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
}

function clearValidationErrors() {
    // Clear all field errors
    document.querySelectorAll('input').forEach(field => {
        field.style.borderColor = '';
    });
    document.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
}

async function handleAuth(event) {
    event.preventDefault();
    console.log('🔍 DEBUG: Auth form submitted');
    
    // ✅ ADD SIMPLE VALIDATION CHECK
    const isLogin = currentAuthTab === 'login';
    const email = document.getElementById(isLogin ? 'loginEmail' : 'signupEmail').value.trim();
    const password = document.getElementById(isLogin ? 'loginPassword' : 'signupPassword').value.trim();
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isLogin && password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (currentAuthTab === 'login') {
        await loginUser();
    } else {
        await signUpUser();
    }
}


async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('🔍 DEBUG: Attempting login for:', email);
    
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        console.log('✅ User logged in:', data.user);
        closeAuthModal();
        showNotification('Welcome back!', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, 'error');
    }
}

async function signUpUser() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    console.log('🔍 DEBUG: Attempting signup for:', email);
    
    try {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        console.log('✅ User signed up:', data.user);
        showNotification('Account created! Please check your email for verification.', 'success');
        closeAuthModal();
        
    } catch (error) {
        console.error('Sign up error:', error);
        showNotification(error.message, 'error');
    }
}

async function logoutUser() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    } else {
        showNotification('Logged out successfully', 'info');
    }
}

// Auth state listener


// Main DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG: DOMContentLoaded started');
    
    const supabaseUrl = 'https://ptkofufzalqzywbyypvq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a29mdWZ6YWxxenl3Ynl5cHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODI0MzksImV4cCI6MjA3OTU1ODQzOX0.89SH7XUmv4MKEFQZRq2Hvp2Z6H03wrTap1k_FmV9E9U';
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('🔍 Auth event:', event, 'User:', session?.user);
        updateUIForAuthState(session?.user);
        
        if (session) {
            console.log('✅ User is logged in:', session.user.email);
            showNotification('Welcome to StudySync!', 'success');
        } else {
            console.log('✅ User logged out');
        }
    });

    function updateUIForAuthState(user) {
        const authButtons = document.querySelector('.auth-buttons');
        if (user) {
            authButtons.innerHTML = `
                <span style="color: var(--text-secondary); margin-right: 10px;">
                    👋 ${user.email}
                </span>
                <button class="btn-secondary" id="logoutBtn">Logout</button>
            `;
        } else {
            authButtons.innerHTML = `
                <button class="btn-secondary" id="loginBtn">Login</button>
                <button class="btn-primary" id="signupBtn">Sign Up</button>
            `;
        }
    }

    // ✅ SINGLE EVENT LISTENER (no nesting)
    document.addEventListener('click', function(e) {
        console.log('🔍 DEBUG: Click detected on:', e.target.id, e.target.className);
        
        // Timer buttons
        if (e.target.id === 'startTimer' || e.target.id === 'startTimerFull') {
            console.log('🔍 DEBUG: Start timer clicked');
            startTimer();
        }
        if (e.target.id === 'pauseTimer' || e.target.id === 'pauseTimerFull') {
            console.log('🔍 DEBUG: Pause timer clicked');
            pauseTimer();
        }
        if (e.target.id === 'resetTimer' || e.target.id === 'resetTimerFull') {
            console.log('🔍 DEBUG: Reset timer clicked');
            resetTimer();
        }
        
        // Todo buttons
        if (e.target.id === 'addTaskBtn' || e.target.id === 'addTaskFullBtn') {
            console.log('🔍 DEBUG: Add task clicked');
            openAddTaskModal();
        }
        
        // Quick Links buttons
        if (e.target.id === 'addLinkBtn' || e.target.id === 'addLinkFullBtn') {
            console.log('🔍 DEBUG: Add link clicked - ID:', e.target.id);
            openAddLinkModal();
        }
        
        // Quote buttons
        if (e.target.id === 'newQuote' || e.target.id === 'newQuoteFull') {
            console.log('🔍 DEBUG: New quote clicked');
            getRandomQuote();
        }
        if (e.target.id === 'saveQuoteBtn') {
            console.log('🔍 DEBUG: Save quote clicked');
            saveCurrentQuote();
        }
        
        // Modal close buttons
        if (e.target.id === 'cancelTask' || e.target.id === 'closeTaskModal') {
            console.log('🔍 DEBUG: Close task modal clicked');
            closeAddTaskModal();
        }
        if (e.target.id === 'cancelLink' || e.target.id === 'closeLinkModal') {
            console.log('🔍 DEBUG: Close link modal clicked');
            closeAddLinkModal();
        }
        
        // Logout button
        if (e.target.id === 'logoutBtn') {
            console.log('🔍 DEBUG: Logout clicked');
            logoutUser();
        }

        if (e.target.id === 'loginBtn') {
            console.log('🔍 DEBUG: Login button clicked (dynamic)');
            openAuthModal();
        }
        if (e.target.id === 'signupBtn') {
            console.log('🔍 DEBUG: Signup button clicked (dynamic)');
            openAuthModal();
        }

        // Handle task checkbox clicks
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseInt(e.target.dataset.taskId);
            console.log('🔍 DEBUG: Toggle task clicked:', taskId);
            toggleTask(taskId);
        }
        
        // Handle delete task buttons
        if (e.target.classList.contains('delete-task')) {
            const taskId = parseInt(e.target.dataset.taskId);
            console.log('🔍 DEBUG: Delete task clicked:', taskId);
            deleteTask(taskId);
        }
    });

    // Form submissions
    document.getElementById('taskForm')?.addEventListener('submit', addTask);
    document.getElementById('linkForm')?.addEventListener('submit', function(e) {
        console.log('🔍 DEBUG: Link form submit triggered');
        addLink(e);
    });
    
    // Auth form submission
    document.getElementById('authForm')?.addEventListener('submit', function(e) {
        handleAuth(e);
    });
    
    // Todo filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
    
    // Close modal when clicking outside
    document.getElementById('addTaskModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddTaskModal();
        }
    });
    
    document.getElementById('addLinkModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddLinkModal();
        }
    });
   
    // Close auth modal
    document.getElementById('closeAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('authModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeAuthModal();
    });
    
    // Auth tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentAuthTab = this.dataset.tab;
            document.getElementById('login-form').style.display = 
                currentAuthTab === 'login' ? 'block' : 'none';
            document.getElementById('signup-form').style.display = 
                currentAuthTab === 'signup' ? 'block' : 'none';
        });
    });
    
    // Initialize displays
    console.log('🔍 DEBUG: Initializing app...');
    testConnection(window.supabaseClient);
    updateTimerDisplay();
    loadTasks();
    loadQuickLinks();
    loadSavedQuotes();
    getRandomQuote();
    initBackgroundRemover();
    
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
    
    console.log('🔍 DEBUG: DOMContentLoaded completed');
});

// Save sidebar state when toggled (optional enhancement)
sidebarToggle.addEventListener('click', function() {
    if (window.innerWidth > 768) {
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
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