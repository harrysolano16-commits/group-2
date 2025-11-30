// StudySync Application
let currentPdfFile = null;
let generatedFlashcards = [];
const CLOUDCONVERT_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjk3ZDdlNTMyMjYzNmViMzNhZGFlYzkzMmUzYTEyZmZjMzFkNjgwY2YzOWMwYjVkOWZlZjEzZDI2MWU3ZGJiMzE1ODM2NGI4YTIzY2YwOGEiLCJpYXQiOjE3NjQ0MDU5MjUuNzQzNzE0LCJuYmYiOjE3NjQ0MDU5MjUuNzQzNzE2LCJleHAiOjQ5MjAwNzk1MjUuNzM2OTY2LCJzdWIiOiI3MzU5ODQ3MiIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.YanMCYvd1O_1THfgbF5NN8C2mflYC07D2K789fmXjeHOkOPY-vXF2k0TE216G6HKQN6FpZPL3HTLGy-tPZkG-SpSqm9msq7stbGntZ8s_tCE6nIdR3UgHVUsxi6xYOK9QAGe-j6OOx3gorJgciaYFk7sh9bZ-pilcZKHSSryUoXtUXzdFr4Hf_rXn5rbv85rpdd8sfspWEJ5qQL318I7_XOrWdBaYOLkRCOL_KtkNOiruaJrT7tB_nK3xvfhTkNKsHndpgePVq1YE61uUS8Fz3uNrce4Zxf436S7HBCcfhqyHr7ozoOqGadTrFkR04oeaPVOX3_MkDWwe4wDeD3LzuLZkcCUoQCOOVyYvTajI6Oto_hBrI66EGM6Qha6CnjchEXCLvdfXVdVYp0YBIhvaSxu0uERmidY9dUWxseRmpZm07csl1c2RPDm3Ppprfkhc4gZt99k428BaQgQsmgEePLOLzFVWn14KL6SCdHJXk7p1EXed1WV1YaYuqXa-GHy2iv_-Eu2ixz7ajRLRNuH_PF4ahW2gxnHg6B184J5daDyq3Dnyb5SFNkE_v0z7RQFE8bQs9rGZ_D9gEsCLV7aVIDXfQX_SqzF3yhPdffsuQubm9D3Fn1DfbaTt1bFWihHlIi_mS5ZJilvR3QYy7ho6CCv6SqbHZRmLxoUTW5lQzM';
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');
const searchInput = document.querySelector('.search-bar input');
const searchMobileToggle = document.getElementById('searchmobiletoggle');
const searchBar = document.querySelector('.search-bar');

// Flashcard data structures
let topics = [];
let manualFlashcards = [];
let currentStudyMode = false;
let currentStudyIndex = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG: DOMContentLoaded started');
    
    const supabaseUrl = 'https://ptkofufzalqzywbyypvq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a29mdWZ6YWxxenl3Ynl5cHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODI0MzksImV4cCI6MjA3OTU1ODQzOX0.89SH7XUmv4MKEFQZRq2Hvp2Z6H03wrTap1k_FmV9E9U';
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // Initialize all components
    initApp();
});

// Initialize all application components
function initApp() {
    // Set up authentication state listener
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('🔍 Auth event:', event, 'Session:', session);
        updateUIForAuthState(session);
    
        if (session) {
            console.log('✅ User is logged in:', session.user.email);
            showNotification('Welcome to StudySync!', 'success');
        } else {
            console.log('✅ User logged out');
        }
    });

    // Create mobile overlays
    createMobileOverlays();
    
    // Initialize core functionality
    initTimer();
    initTodoList();
    initQuickLinks();
    initQuotes();
    initBackgroundRemover();
    initFileConverter();
    initFlashcardGenerator();
    initSearch();
    initNavigation();
    initAuth();
    
    // Load initial data
    loadInitialData();
    
    console.log('🔍 DEBUG: App initialization completed');
}

// Create mobile overlays for sidebar and search
function createMobileOverlays() {
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
}

// Initialize timer functionality
function initTimer() {
    let timerInterval;
    let timerMinutes = 25;
    let timerSeconds = 0;
    let isTimerRunning = false;
    let isBreakTime = false;

    // Timer control functions
    window.startTimer = function() {
        if (isTimerRunning) return;
        
        isTimerRunning = true;
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
                    return;
                }
                timerMinutes--;
                timerSeconds = 59;
            } else {
                timerSeconds--;
            }
            
            updateTimerDisplay();
        }, 1000);
    };

    window.pauseTimer = function() {
        if (!isTimerRunning) return;
        
        clearInterval(timerInterval);
        isTimerRunning = false;
        const statusDisplay = document.querySelector('.timer-status');
        if (statusDisplay) statusDisplay.textContent = 'Paused ⏸️';
    };

    window.resetTimer = function() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        isBreakTime = false;
        timerMinutes = parseInt(document.getElementById('workDuration')?.value || 25);
        timerSeconds = 0;
        updateTimerDisplay();
        const statusDisplay = document.querySelector('.timer-status');
        if (statusDisplay) statusDisplay.textContent = 'Ready to focus! 🎯';
    };

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

    // Set initial display
    updateTimerDisplay();
}

// Initialize todo list functionality
function initTodoList() {
    let tasks = [];

    window.openAddTaskModal = function() {
        const modal = document.getElementById('addTaskModal');
        if (modal) {
            modal.removeAttribute('style');
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            document.getElementById('taskTitle').focus();
            modal.offsetHeight; // Force reflow
        }
    };

    window.closeAddTaskModal = function() {
        const modal = document.getElementById('addTaskModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.classList.remove('modal-open');
        document.getElementById('taskForm').reset();
    };

    window.addTask = async function(event) {
        event.preventDefault();
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            showNotification('Please log in to add tasks', 'error');
            return;
        }
        
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!title) return;
        
        try {
            const { data, error } = await window.supabaseClient
                .from('tasks')
                .insert([
                    {
                        user_id: user.id,
                        title,
                        description,
                        due_date: dueDate || null,
                        completed: false
                    }
                ])
                .select();

            if (error) throw error;

            tasks.unshift(data[0]);
            renderTasks();
            closeAddTaskModal();
            showNotification('Task added successfully!', 'success');
            
        } catch (error) {
            console.error('Error adding task:', error);
            showNotification('Failed to add task', 'error');
        }
    };

    window.renderTasks = function() {
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
        
        // Dashboard todo list
        if (todoList) {
            const dashboardTasks = filteredTasks.slice(0, 5);
        
            if (dashboardTasks.length === 0) {
                todoList.innerHTML = '<p class="empty-state">No tasks yet. Add your first task!</p>';
            } else {
                todoList.innerHTML = dashboardTasks.map(task => `
                    <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                            ${task.completed ? '✓' : ''}
                        </div>
                        <div class="task-content">
                            <div class="task-text">${task.title}</div>
                            ${task.due_date ? `<div class="task-due">Due: ${new Date(task.due_date).toLocaleString()}</div>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Full todo list
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
                            ${task.due_date ? `<div class="task-due">Due: ${new Date(task.due_date).toLocaleString()}</div>` : ''}
                        </div>
                        <button class="btn-secondary delete-task" data-task-id="${task.id}">Delete</button>
                    </div>
                `).join('');
            }
        }
    };

    window.toggleTask = async function(taskId) {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const { error } = await window.supabaseClient
                .from('tasks')
                .update({ completed: !task.completed })
                .eq('id', taskId);

            if (error) throw error;
            task.completed = !task.completed;

            renderTasks();
        
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    window.deleteTask = async function(taskId) {
        try {
            const { error } = await window.supabaseClient
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;

            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            showNotification('Task deleted', 'success');
        } catch (error) {
            console.error('Error deleting task:', error);
            showNotification('Failed to delete task', 'error');
        }
    };

    window.loadTasks = async function() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                tasks = []; // Clear tasks array
                renderTasks(); // Update UI to show empty state
                return;
            }

            const { data, error } = await window.supabaseClient
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            tasks = data || [];
            renderTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
            renderTasks();
        }
    };

    // Set up todo list event listeners
    document.getElementById('taskForm')?.addEventListener('submit', addTask);
    
    // Todo filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
}

// Initialize quick links functionality
function initQuickLinks() {
    let quickLinks = [
        { name: 'Google Drive', url: 'https://drive.google.com' },
        { name: 'University Portal', url: 'https://university.edu' },
        { name: 'YouTube', url: 'https://youtube.com' },
        { name: 'Spotify', url: 'https://spotify.com' },
        { name: 'Notion', url: 'https://notion.so' }
    ];

    window.openAddLinkModal = function() {
        const modal = document.getElementById('addLinkModal');
        if (modal) {
            modal.removeAttribute('style');
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            document.getElementById('linkName')?.focus();
            modal.offsetHeight; // Force reflow
        }
    };

    window.closeAddLinkModal = function() {
        const modal = document.getElementById('addLinkModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.classList.remove('modal-open');
        document.getElementById('linkForm').reset();
    };

    window.addLink = async function(event) {
        event.preventDefault();
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            showNotification('Please log in to add links', 'error');
            return;
        }
        
        const name = document.getElementById('linkName').value.trim();
        let url = document.getElementById('linkUrl').value.trim();
        
        if (!name || !url) {
            showNotification('Please fill in both name and URL', 'error');
            return;
        }
        
        // Format URL
        let formattedUrl = url.replace(/\/+$/, '');

        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = 'https://' + formattedUrl;
        }
        
        try {
            const { data, error } = await window.supabaseClient
                .from('quick_links')
                .insert([
                    {
                        user_id: user.id,
                        name,
                        url: formattedUrl
                    }
                ])
                .select();

            if (error) throw error;

            quickLinks.unshift(data[0]);
            renderQuickLinks();
            closeAddLinkModal();
            showNotification('Link added successfully!', 'success');
            
        } catch (error) {
            console.error('Error adding link:', error);
            showNotification('Failed to add link', 'error');
        }
    };

    window.renderQuickLinks = function() {
        const linksGrid = document.querySelector('.links-grid');
        const linksGridFull = document.getElementById('linksGridFull');

        if (linksGrid) {
            linksGrid.innerHTML = quickLinks.map(link => `
                <div class="link-item-container">
                    <a href="${link.url}" target="_blank" class="link-item">
                        ${link.name}
                    </a>
                    <button class="delete-link-btn" data-link-id="${link.id}" title="Delete link">
                        🗑️
                    </button>
                </div>
            `).join('') + '<button class="link-item" id="addLinkBtn">+ Add Link</button>';
        }

        // Full view
        if (linksGridFull) {
            linksGridFull.innerHTML = quickLinks.map(link => `
                <div class="link-item-container">
                    <a href="${link.url}" target="_blank" class="link-item">
                        ${link.name}
                    </a>
                    <button class="delete-link-btn" data-link-id="${link.id}" title="Delete link">
                        🗑️
                    </button>
                </div>
            `).join('') + '<button class="link-item" id="addLinkFullBtn">+ Add Link</button>';
        }
    };

    window.deleteLink = async function(linkId) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to delete links', 'error');
                return;
            }

            // Confirm deletion
            if (!confirm('Are you sure you want to delete this link?')) {
                return;
            }

            const { error } = await window.supabaseClient
                .from('quick_links')
                .delete()
                .eq('id', linkId)
                .eq('user_id', user.id); // Extra security check

            if (error) throw error;

            // Remove from local array
            quickLinks = quickLinks.filter(link => link.id !== linkId);
            
            // Re-render the UI
            renderQuickLinks();
            
            showNotification('Link deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting link:', error);
            showNotification('Failed to delete link', 'error');
        }
    };

    window.loadQuickLinks = async function() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                quickLinks = [];
                renderQuickLinks();
                return;
            }

            const { data, error } = await window.supabaseClient
                .from('quick_links')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            quickLinks = data || [];
            renderQuickLinks();
        } catch (error) {
            console.error('Error loading links:', error);
            quickLinks = [];
            renderQuickLinks();
        }
    };

    // Set up quick links event listeners
    document.getElementById('linkForm')?.addEventListener('submit', addLink);
}

// Initialize quotes functionality
function initQuotes() {
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

    window.getRandomQuote = function() {
        console.log('New Quote button clicked');
        
        try {
            const quoteElement = document.getElementById('currentQuote');
            const quoteElementFull = document.getElementById('currentQuoteFull');
            
            if (quoteElement) quoteElement.textContent = 'Loading quote...';
            if (quoteElementFull) quoteElementFull.textContent = 'Loading quote...';

            // Generate random key for variety
            const randomKey = Math.floor(Math.random() * 1000000);
            
            // Use CORS proxy to bypass restrictions
            const proxyUrl = 'https://corsproxy.io/?';
            const apiUrl = `http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en&key=${randomKey}`;
            
            fetch(proxyUrl + encodeURIComponent(apiUrl))
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`API request failed with status ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Forismatic API response:', data);
                    
                    // Format the quote (clean up the response)
                    let quoteText = data.quoteText || '';
                    let quoteAuthor = data.quoteAuthor || 'Unknown';
                    
                    // Clean up the text - remove extra spaces and trim
                    quoteText = quoteText.trim();
                    quoteAuthor = quoteAuthor.trim();
                    
                    // Handle cases where author might be empty
                    if (!quoteAuthor || quoteAuthor === ' ' || quoteAuthor === '""') {
                        quoteAuthor = 'Unknown';
                    }
                    
                    const newQuote = `"${quoteText}" - ${quoteAuthor}`;
                    
                    console.log('✅ New quote from Forismatic API:', newQuote);
                    
                    if (quoteElement) quoteElement.textContent = newQuote;
                    if (quoteElementFull) quoteElementFull.textContent = newQuote;
                })
                .catch(error => {
                    console.error('❌ Forismatic API failed:', error);
                    useEnhancedLocalQuotes();
                });
            
        } catch (error) {
            console.error('❌ Forismatic API failed:', error);
            useEnhancedLocalQuotes();
        }
    };

    function useEnhancedLocalQuotes() {
        const enhancedQuotes = [
            "The secret of getting ahead is getting started. - Mark Twain",
            "Don't let what you cannot do interfere with what you can do. - John Wooden",
            "The way to get started is to quit talking and begin doing. - Walt Disney",
            "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
            "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
            "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
            "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
            "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
            "Believe you can and you're halfway there. - Theodore Roosevelt",
            "The only way to do great work is to love what you do. - Steve Jobs"
        ];
        
        const randomIndex = Math.floor(Math.random() * enhancedQuotes.length);
        const fallbackQuote = `"${enhancedQuotes[randomIndex]}"`;
        
        const quoteElement = document.getElementById('currentQuote');
        const quoteElementFull = document.getElementById('currentQuoteFull');
        
        if (quoteElement) quoteElement.textContent = fallbackQuote;
        if (quoteElementFull) quoteElementFull.textContent = fallbackQuote;
        
        showNotification('Using enhanced offline quotes', 'info');
    }

    window.renderSavedQuotes = function() {
        const savedQuotesList = document.getElementById('savedQuotesList');
        if (savedQuotesList) {
            if (savedQuotes.length === 0) {
                savedQuotesList.innerHTML = '<p class="empty-state">No saved quotes yet.</p>';
            } else {
                savedQuotesList.innerHTML = savedQuotes.map((quote) => {
                    const quoteText = typeof quote === 'object' ? quote.quote_text : quote;
                    const quoteId = typeof quote === 'object' ? quote.id : null;
                    
                    return `
                        <div class="saved-quote-item">
                            <div class="quote-text">${quoteText}</div>
                            <button class="btn-secondary delete-quote-btn" data-quote-id="${quoteId}">
                                Delete
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }
    };

    window.loadSavedQuotes = async function() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                savedQuotes = [];
                renderSavedQuotes();
                return;
            }

            const { data, error } = await window.supabaseClient
                .from('saved_quotes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            savedQuotes = data || [];
            renderSavedQuotes();
            
        } catch (error) {
            console.error('Error loading quotes:', error);
            savedQuotes = [];
            renderSavedQuotes();
        }
    };

    window.saveCurrentQuote = async function() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to save quotes', 'error');
                return;
            }
            
            const currentQuote = document.getElementById('currentQuoteFull')?.textContent || 
                            document.getElementById('currentQuote')?.textContent;
            
            if (!currentQuote || savedQuotes.includes(currentQuote)) return;

            const { error } = await window.supabaseClient
                .from('saved_quotes')
                .insert([
                    {
                        user_id: user.id,
                        quote_text: currentQuote
                    }
                ]);

            if (error) throw error;

            savedQuotes.unshift(currentQuote);
            renderSavedQuotes();
            showNotification('Quote saved!', 'success');
            
        } catch (error) {
            console.error('Error saving quote:', error);
            showNotification('Failed to save quote', 'error');
        }
    };

    window.deleteQuote = async function(quoteId) {
        try {
            console.log('🗑️ Starting quote deletion - ID:', quoteId);
            
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to delete quotes', 'error');
                return;
            }

            if (!confirm('Are you sure you want to delete this quote?')) {
                return;
            }

            // Delete from database
            const { error } = await window.supabaseClient
                .from('saved_quotes')
                .delete()
                .eq('id', quoteId)
                .eq('user_id', user.id);

            if (error) throw error;

            // Remove from local array immediately
            savedQuotes = savedQuotes.filter(q => q.id !== quoteId);
            
            // Re-render the UI immediately
            renderSavedQuotes();
            
            showNotification('Quote deleted successfully', 'success');
            
        } catch (error) {
            console.error('❌ Error deleting quote:', error);
            showNotification('Failed to delete quote', 'error');
        }
    };

    // Set initial quote
    setTimeout(() => {
        getRandomQuote();
    }, 1000);
}

// Initialize background remover functionality
function initBackgroundRemover() {
    let currentImage = null;
    let processedImageUrl = null;

    // Remove.bg API Configuration
    const BG_REMOVER_API = {
        removeBg: async (imageFile) => {
            const apiKey = 'jTZa6MtpPWM4L9K26a6ZuVko';
            
            // Validate input
            if (!imageFile) {
                throw new Error('No image file provided');
            }

            const formData = new FormData();
            formData.append('image_file', imageFile);
            formData.append('size', 'auto');
            
            try {
                console.log('🌐 Making API request to Remove.bg...');
                const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: {
                        'X-Api-Key': apiKey,
                    },
                    body: formData,
                    // Add timeout
                    signal: AbortSignal.timeout(30000) // 30 second timeout
                });
                
                console.log('📨 API Response status:', response.status, response.statusText);
                
                if (!response.ok) {
                    let errorDetails = '';
                    try {
                        const errorText = await response.text();
                        errorDetails = errorText;
                        console.error('API Error Response:', errorText);
                    } catch (e) {
                        errorDetails = 'Could not read error response';
                    }
                    
                    // Handle specific HTTP status codes
                    if (response.status === 400) {
                        throw new Error('Invalid image format or corrupted file');
                    } else if (response.status === 402) {
                        throw new Error('API quota exceeded. Please try again later.');
                    } else if (response.status === 403) {
                        throw new Error('Invalid API key or access denied');
                    } else if (response.status === 429) {
                        throw new Error('Too many requests. Please wait and try again.');
                    } else {
                        throw new Error(`Background removal service error: ${response.status} ${response.statusText}`);
                    }
                }
                
                const blob = await response.blob();
                console.log('✅ Received processed blob:', blob.size, 'bytes, type:', blob.type);
                
                if (blob.size === 0) {
                    throw new Error('Received empty image from service');
                }
                
                return blob;
                
            } catch (error) {
                console.error('🚨 API Request failed:', error);
                
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout. Please try again.');
                } else if (error.name === 'TypeError') {
                    throw new Error('Network error. Please check your internet connection.');
                } else {
                    throw error; // Re-throw other errors
                }
            }
        }
    };

    window.removeBackground = async function() {
        // Get all required elements
        const loadingSpinner = document.getElementById('loadingSpinner');
        const removeBgBtn = document.getElementById('removeBgBtn');
        const resultPreview = document.getElementById('resultPreview');
        const downloadBtn = document.getElementById('downloadBtn');

        try {
            // Step 1: Check if user is authenticated
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to use the background remover', 'error');
                openAuthModal();
                return;
            }
            
            // Step 2: Validate that an image is selected
            if (!currentImage) {
                showNotification('Please select an image first', 'error');
                return;
            }

            // Step 3: Validate image file
            if (currentImage.size === 0) {
                throw new Error('Image file is empty or corrupted');
            }
            
            if (currentImage.size > 12 * 1024 * 1024) { // 12MB limit
                throw new Error('Image is too large (max 12MB)');
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(currentImage.type)) {
                throw new Error('Unsupported image format. Please use JPG, PNG, or WEBP');
            }

            // Step 4: Show loading state
            console.log('🔄 Starting background removal process...');
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (removeBgBtn) {
                removeBgBtn.disabled = true;
                removeBgBtn.textContent = 'Processing...';
            }
            if (resultPreview) {
                resultPreview.innerHTML = '<p>Processing image...</p>';
            }

            // Step 5: Call the Remove.bg API
            console.log('📤 Sending image to Remove.bg API...');
            const processedBlob = await BG_REMOVER_API.removeBg(currentImage);
            
            if (!processedBlob || processedBlob.size === 0) {
                throw new Error('Received empty response from background removal service');
            }

            console.log('✅ Background removed successfully!');
            
            // Step 6: Process the result
            processedImageUrl = URL.createObjectURL(processedBlob);
            
            if (resultPreview) {
                resultPreview.innerHTML = `<img src="${processedImageUrl}" alt="Background removed" style="max-width: 100%; max-height: 300px; border-radius: var(--border-radius);">`;
            }
            
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }

            // Step 7: Auto-save to Supabase Storage
            try {
                console.log('💾 Auto-saving processed image...');
                const savedImage = await saveProcessedImage(processedBlob, currentImage.name);
                console.log('✅ Image saved to storage:', savedImage);
                
                showNotification('Background removed and image saved successfully!', 'success');
                
                // Refresh the saved images gallery
                loadUserImages();
                
            } catch (saveError) {
                console.warn('⚠️ Could not auto-save image:', saveError);
                // Don't show error to user - saving is optional
                showNotification('Background removed! (Image not saved)', 'info');
            }

        } catch (error) {
            console.error('❌ Background removal failed:', error);
            
            // Step 8: Handle specific error types
            let errorMessage = 'Failed to remove background. ';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Network error. Please check your internet connection.';
            } else if (error.message.includes('API key')) {
                errorMessage += 'Service configuration error.';
            } else if (error.message.includes('size') || error.message.includes('large')) {
                errorMessage += 'Image is too large. Please use a smaller image.';
            } else if (error.message.includes('format') || error.message.includes('unsupported')) {
                errorMessage += 'Unsupported image format. Please use JPG, PNG, or WEBP.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorMessage += 'API limit reached. Please try again later.';
            } else {
                errorMessage += 'Please try again with a different image.';
            }
            
            showNotification(errorMessage, 'error');
            
            // Reset result preview on error
            if (resultPreview) {
                resultPreview.innerHTML = '<p style="color: var(--error-color);">Failed to process image. Please try again.</p>';
            }
            
        } finally {
            // Step 9: Always reset UI state
            console.log('🧹 Cleaning up UI...');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (removeBgBtn) {
                removeBgBtn.disabled = false;
                removeBgBtn.textContent = 'Remove Background';
            }
        }
    };

    window.downloadResult = function() {
        if (!processedImageUrl) return;
        
        const link = document.createElement('a');
        link.href = processedImageUrl;
        link.download = 'background-removed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.resetBgRemover = function() {
        console.log('🔄 Resetting background remover');
        
        try {
            currentImage = null;
            
            // Clean up processed image URL
            if (processedImageUrl) {
                URL.revokeObjectURL(processedImageUrl);
                processedImageUrl = null;
            }
            
            // Reset UI elements
            const originalPreview = document.getElementById('originalPreview');
            const resultPreview = document.getElementById('resultPreview');
            const removeBgBtn = document.getElementById('removeBgBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const imageInput = document.getElementById('imageInput');
            
            if (originalPreview) {
                originalPreview.innerHTML = '<p>No image selected</p>';
            }
            
            if (resultPreview) {
                resultPreview.innerHTML = '<p>Result will appear here</p>';
            }
            
            if (removeBgBtn) {
                removeBgBtn.disabled = true;
            }
            
            if (downloadBtn) {
                downloadBtn.disabled = true;
            }
            
            if (imageInput) {
                imageInput.value = '';
            }
            
            console.log('✅ Background remover reset successfully');
            
        } catch (error) {
            console.error('❌ Error resetting background remover:', error);
        }
    };

    // Initialize background remover UI
    function initBackgroundRemoverUI() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const selectImageBtn = document.getElementById('selectImageBtn');
        
        // Check if required elements exist
        if (!uploadArea || !imageInput) {
            console.error('❌ Background remover elements not found');
            return;
        }
        
        console.log('✅ Initializing background remover...');
        
        try {
            // Clear any existing file input value
            imageInput.value = '';
            
            // Event listeners with error handling
            selectImageBtn?.addEventListener('click', () => {
                imageInput.value = '';
                imageInput.click();
            });
            
            imageInput.addEventListener('change', function(e) {
                console.log('🖼️ File input changed, files:', e.target.files);
                handleImageSelect(e);
            });
            
            uploadArea.addEventListener('click', () => {
                imageInput.value = '';
                imageInput.click();
            });
            
            // Drag and drop handlers
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
                console.log('📁 Files dropped:', files);
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    handleImageFile(files[0]);
                } else {
                    showNotification('Please drop a valid image file', 'error');
                }
            });
            
            // Initialize other buttons if they exist
            const removeBgBtn = document.getElementById('removeBgBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const resetBtn = document.getElementById('resetBtn');
            
            if (removeBgBtn) removeBgBtn.addEventListener('click', removeBackground);
            if (downloadBtn) downloadBtn.addEventListener('click', downloadResult);
            if (resetBtn) resetBtn.addEventListener('click', resetBgRemover);
            
            // Load user images
            loadUserImages();
            
            console.log('✅ Background remover initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize background remover:', error);
        }
    }

    function handleImageSelect(e) {
        console.log('🖼️ handleImageSelect called, files:', e.target.files);
        
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            console.log('✅ Valid image selected:', file.name, file.size, 'bytes');
            handleImageFile(file);
        } else {
            console.log('❌ No valid image file selected');
            showNotification('Please select a valid image file (JPG, PNG, WEBP)', 'error');
        }
    }

    function handleImageFile(file) {
        console.log('📄 handleImageFile called with:', file.name);
        
        currentImage = file;
        
        const originalPreview = document.getElementById('originalPreview');
        const removeBgBtn = document.getElementById('removeBgBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const resultPreview = document.getElementById('resultPreview');
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            console.log('✅ FileReader loaded image successfully');
            
            if (originalPreview) {
                originalPreview.innerHTML = `<img src="${e.target.result}" alt="Original image" style="max-width: 100%; max-height: 300px; border-radius: var(--border-radius);">`;
            }
            if (removeBgBtn) {
                removeBgBtn.disabled = false;
            }
            if (downloadBtn) {
                downloadBtn.disabled = true;
            }
            
            // Clear previous result
            if (resultPreview) {
                resultPreview.innerHTML = '<p>Result will appear here</p>';
            }
            
            if (processedImageUrl) {
                URL.revokeObjectURL(processedImageUrl);
                processedImageUrl = null;
            }
        };
        
        reader.onerror = function(error) {
            console.error('❌ FileReader error:', error);
            showNotification('Error reading the image file. Please try again.', 'error');
        };
        
        reader.onabort = function() {
            console.error('❌ FileReader aborted');
            showNotification('Image reading was cancelled', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    // Storage functions for background remover
    async function saveProcessedImage(processedBlob, originalFileName) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                throw new Error('You must be logged in to save images');
            }

            // Create unique filename
            const fileExt = 'png';
            const timestamp = Date.now();
            const safeFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${user.id}/${timestamp}_${safeFileName}.${fileExt}`;

            console.log('💾 Saving image to storage:', fileName);
            
            const { data, error } = await window.supabaseClient.storage
                .from('background-removed-images')
                .upload(fileName, processedBlob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Storage upload error:', error);
                throw new Error(`Failed to save image: ${error.message}`);
            }

            console.log('✅ Image saved to storage successfully');
            
            // Get public URL
            const { data: urlData } = window.supabaseClient.storage
                .from('background-removed-images')
                .getPublicUrl(fileName);

            return {
                storagePath: fileName,
                publicUrl: urlData.publicUrl
            };
            
        } catch (error) {
            console.error('❌ Error saving image to storage:', error);
            throw error;
        }
    }

    async function getUserImages() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                return [];
            }

            const { data, error } = await window.supabaseClient.storage
                .from('background-removed-images')
                .list(user.id, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;

            // Get public URLs for each image
            const imagesWithUrls = data.map(item => ({
                name: item.name,
                publicUrl: window.supabaseClient.storage
                    .from('background-removed-images')
                    .getPublicUrl(`${user.id}/${item.name}`).publicUrl,
                createdAt: item.created_at
            }));

            return imagesWithUrls;
            
        } catch (error) {
            console.error('Error fetching user images:', error);
            return [];
        }
    }

    async function deleteUserImage(filePath) {
        try {
            const { error } = await window.supabaseClient.storage
                .from('background-removed-images')
                .remove([filePath]);

            if (error) throw error;
            
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    async function loadUserImages() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                // Hide the section if user is not logged in
                const savedImagesSection = document.getElementById('savedImagesSection');
                if (savedImagesSection) savedImagesSection.style.display = 'none';
                return;
            }   

            const userImages = await getUserImages();
            const savedImagesGrid = document.getElementById('savedImagesGrid');
            const savedImagesSection = document.getElementById('savedImagesSection');
            
            if (userImages.length === 0) {
                savedImagesGrid.innerHTML = '<p class="empty-state">No saved images yet. Process some images to see them here!</p>';
                if (savedImagesSection) savedImagesSection.style.display = 'block';
                return;
            }
            
            savedImagesGrid.innerHTML = userImages.map(image => `
                <div class="saved-image-item" style="text-align: center;">
                    <img src="${image.publicUrl}" alt="Saved image" style="max-width: 150px; max-height: 150px; border-radius: 8px;">
                    <div style="margin-top: 8px;">
                        <button class="btn-secondary download-saved-btn" data-url="${image.publicUrl}" data-filename="${image.name}" style="font-size: 0.8rem; padding: 5px 10px;">
                            Download
                        </button>
                        <button class="btn-secondary delete-saved-btn" data-path="${user.id}/${image.name}" style="font-size: 0.8rem; padding: 5px 10px; margin-left: 5px;">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners to the new buttons
            document.querySelectorAll('.download-saved-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    downloadSavedImage(this.dataset.url, this.dataset.filename);
                });
            });
            
            document.querySelectorAll('.delete-saved-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    deleteSavedImage(this.dataset.path);
                });
            });
            
            // Show the section
            if (savedImagesSection) savedImagesSection.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading user images:', error);
        }
    }

    function downloadSavedImage(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function deleteSavedImage(filePath) {
        if (!confirm('Are you sure you want to delete this image?')) return;
        
        try {
            await deleteUserImage(filePath);
            showNotification('Image deleted successfully', 'success');
            loadUserImages(); // Refresh the list
        } catch (error) {
            console.error('Error deleting image:', error);
            showNotification('Failed to delete image', 'error');
        }
    }

    // Initialize the UI
    initBackgroundRemoverUI();
}

// Initialize file converter functionality
function initFileConverter() {
    let currentConverterFile = null;
    let convertedFileUrl = null;

    function initFileConverterUI() {
        const converterTabs = document.querySelectorAll('.converter-tab');
        const converterSections = document.querySelectorAll('.converter-section');
        
        // Tab switching
        converterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const converterType = this.dataset.type;
                
                // Update active tab
                converterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding section
                converterSections.forEach(section => section.classList.remove('active'));
                document.getElementById(`${converterType}-converter`).classList.add('active');
                
                // Reset state when switching tabs
                resetConverter();
                
                // Check auth state when switching to converter
                checkConverterAuthState();
            });
        });
        
        // Initialize document converter
        initDocumentConverter();
        
        // Initialize image converter
        initImageConverter();
        
        // Check initial auth state
        checkConverterAuthState();
    }

    // Add this new function to check authentication state
    async function checkConverterAuthState() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            // Get all converter elements that should be protected
            const protectedElements = [
                'documentInput', 'selectDocumentBtn', 'convertDocumentBtn',
                'imageConvertInput', 'selectImageConvertBtn', 'convertImageBtn',
                'documentUploadArea', 'imageUploadArea'
            ];
            
            protectedElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    if (!user) {
                        element.disabled = true;
                        element.style.opacity = '0.6';
                        element.style.cursor = 'not-allowed';
                        element.title = 'Please log in to use file converter';
                        
                        // Add overlay for upload areas
                        if (elementId.includes('UploadArea')) {
                            element.style.position = 'relative';
                            if (!element.querySelector('.auth-overlay')) {
                                const overlay = document.createElement('div');
                                overlay.className = 'auth-overlay';
                                overlay.innerHTML = `
                                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                                            background: rgba(0,0,0,0.7); display: flex; align-items: center; 
                                            justify-content: center; border-radius: var(--border-radius); z-index: 10;">
                                        <div style="text-align: center; color: white; padding: 20px;">
                                            <div style="font-size: 2rem; margin-bottom: 10px;">🔒</div>
                                            <p style="font-weight: 600; margin-bottom: 5px;">Authentication Required</p>
                                            <p style="font-size: 0.9rem; opacity: 0.8;">Please log in to use file converter</p>
                                            <button class="btn-primary" onclick="openAuthModal()" 
                                                    style="margin-top: 15px; padding: 8px 16px; font-size: 0.9rem;">
                                                Login / Sign Up
                                            </button>
                                        </div>
                                    </div>
                                `;
                                element.appendChild(overlay);
                            }
                        }
                    } else {
                        element.disabled = false;
                        element.style.opacity = '1';
                        element.style.cursor = '';
                        element.title = '';
                        
                        // Remove overlay for upload areas
                        if (elementId.includes('UploadArea')) {
                            const overlay = element.querySelector('.auth-overlay');
                            if (overlay) {
                                overlay.remove();
                            }
                        }
                    }
                }
            });
            
            // Update converter buttons with auth state
            const convertButtons = document.querySelectorAll('#convertDocumentBtn, #convertImageBtn');
            convertButtons.forEach(btn => {
                if (!user) {
                    btn.innerHTML = '🔒 Login to Convert';
                    btn.classList.add('feature-protected');
                } else {
                    btn.innerHTML = btn.id === 'convertDocumentBtn' ? 'Convert Document' : 'Convert Image';
                    btn.classList.remove('feature-protected');
                }
            });
            
            // Update file input placeholders
            const fileInputs = document.querySelectorAll('#documentInput, #imageConvertInput');
            fileInputs.forEach(input => {
                if (!user) {
                    input.setAttribute('disabled', 'true');
                } else {
                    input.removeAttribute('disabled');
                }
            });
            
        } catch (error) {
            console.error('Error checking converter auth state:', error);
        }
    }

    function initDocumentConverter() {
        const documentInput = document.getElementById('documentInput');
        const selectDocumentBtn = document.getElementById('selectDocumentBtn');
        const documentUploadArea = document.getElementById('documentUploadArea');
        
        if (!documentInput || !selectDocumentBtn || !documentUploadArea) {
            console.error('Document converter elements not found');
            return;
        }
        
        // Set initial state
        documentUploadArea.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
                <p>Click to select a document</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Supports: PDF, DOCX, TXT</p>
            </div>
        `;
        
        // File selection - with authentication check
        selectDocumentBtn.addEventListener('click', async () => {
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    showNotification('Please log in to select files', 'error');
                    openAuthModal();
                    return;
                }
                documentInput.click();
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        });
        
        documentUploadArea.addEventListener('click', async () => {
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    showNotification('Please log in to select files', 'error');
                    openAuthModal();
                    return;
                }
                documentInput.click();
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        });
        
        documentInput.addEventListener('change', handleDocumentSelect);
        
        // ✅ ADD DRAG AND DROP FOR DOCUMENT CONVERTER
        setupDragAndDrop(documentUploadArea, handleDocumentSelect);
        
        // Conversion buttons
        document.getElementById('convertDocumentBtn')?.addEventListener('click', convertDocument);
        document.getElementById('downloadDocumentBtn')?.addEventListener('click', downloadConvertedFile);
    }

    function initImageConverter() {
        const imageInput = document.getElementById('imageConvertInput');
        const selectImageBtn = document.getElementById('selectImageConvertBtn');
        const imageUploadArea = document.getElementById('imageUploadArea');
        const convertImageBtn = document.getElementById('convertImageBtn');
        const downloadImageBtn = document.getElementById('downloadImageBtn');
        
        // File selection - with authentication check
        selectImageBtn.addEventListener('click', async () => {
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    showNotification('Please log in to select files', 'error');
                    openAuthModal();
                    return;
                }
                imageInput.value = '';
                imageInput.click();
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        });
        
        imageUploadArea.addEventListener('click', async () => {
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    showNotification('Please log in to select files', 'error');
                    openAuthModal();
                    return;
                }
                imageInput.value = '';
                imageInput.click();
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        });
        
        imageInput.addEventListener('change', handleImageConvertSelect);
        
        // Drag and drop
        setupDragAndDrop(imageUploadArea, handleImageConvertSelect);
        
        // Conversion
        convertImageBtn.addEventListener('click', convertImage);
        downloadImageBtn.addEventListener('click', downloadConvertedFile);
    }

    function setupDragAndDrop(uploadArea, handler) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            // ✅ CHECK AUTHENTICATION BEFORE PROCESSING DROPPED FILES
            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    showNotification('Please log in to use drag and drop', 'error');
                    openAuthModal();
                    return;
                }
            } catch (error) {
                console.error('Auth check failed in drag/drop:', error);
                return;
            }
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // Create a synthetic event object that matches what the file input would produce
                const event = { 
                    target: { 
                        files: files 
                    } 
                };
                handler(event);
            }
        });
    }

    async function handleDocumentSelect(e) {
        try {
            // Check if user is authenticated
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to select files', 'error');
                openAuthModal();
                
                // ✅ CLEAR THE FILE INPUT AND STOP ANY FURTHER PROCESSING
                if (e.target && e.target.value) {
                    e.target.value = '';
                }
                
                // ✅ HIDE ANY FILE PREVIEW THAT MIGHT HAVE SHOWN UP
                const documentUploadArea = document.getElementById('documentUploadArea');
                if (documentUploadArea) {
                    documentUploadArea.innerHTML = `
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
                            <p>Click to select a document</p>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">Supports: PDF, DOCX, TXT</p>
                        </div>
                    `;
                }
                
                // ✅ RESET ANY FILE INFO
                currentConverterFile = null;
                document.getElementById('convertDocumentBtn').disabled = true;
                
                return;
            }

            const file = e.target.files ? e.target.files[0] : (e.dataTransfer ? e.dataTransfer.files[0] : null);
            
            if (file) {
                console.log('📄 File selected:', file.name);
                
                // Get target format for validation
                const toFormat = document.getElementById('toDocumentFormat').value;
                validateFileForConversion(file, toFormat);
                
                currentConverterFile = file;
                
                // Update the upload area to show file info
                const documentUploadArea = document.getElementById('documentUploadArea');
                if (documentUploadArea) {
                    documentUploadArea.innerHTML = `
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
                            <p><strong>${file.name}</strong></p>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">
                                ${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type || 'Unknown type'}
                            </p>
                            <p style="font-size: 0.8rem; margin-top: 10px;">Click to select a different file</p>
                        </div>
                    `;
                }
                
                // Clear previous result
                const resultElement = document.getElementById('convertedDocumentResult');
                if (resultElement) {
                    resultElement.innerHTML = '<p>Ready to convert...</p>';
                }
                
                document.getElementById('convertDocumentBtn').disabled = false;
                showNotification(`Document selected: ${file.name}`, 'success');
                
            }
        } catch (error) {
            console.error('Error in handleDocumentSelect:', error);
            showNotification('Error selecting file. Please try again.', 'error');
            // Clear any file input
            if (e.target && e.target.value) {
                e.target.value = '';
            }
        }
    }

    async function handleImageConvertSelect(e) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to select files', 'error');
                openAuthModal();
                e.target.value = ''; // Clear the file input
                return;
            }

            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                currentConverterFile = file;
                
                // Update image upload area to show file info
                const imageUploadArea = document.getElementById('imageUploadArea');
                if (imageUploadArea) {
                    imageUploadArea.innerHTML = `
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">🖼️</div>
                            <p><strong>${file.name}</strong></p>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">
                                ${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type.split('/')[1].toUpperCase()}
                            </p>
                            <p style="font-size: 0.8rem; margin-top: 10px;">Click to select a different file</p>
                        </div>
                    `;
                }
                
                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    const originalPreview = document.getElementById('originalImagePreview');
                    if (originalPreview) {
                        originalPreview.innerHTML = `
                            <div style="text-align: center;">
                                <img src="${e.target.result}" alt="Original image" style="max-width: 100%; max-height: 200px; border-radius: var(--border-radius);">
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
                                    Original: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            </div>
                        `;
                    }
                };
                reader.readAsDataURL(file);
                
                document.getElementById('convertImageBtn').disabled = false;
                showNotification(`Image selected: ${file.name}`, 'success');
            } else {
                showNotification('Please select a valid image file', 'error');
            }
        } catch (error) {
            console.error('Error in handleImageConvertSelect:', error);
            showNotification('Error selecting file. Please try again.', 'error');
            e.target.value = ''; // Clear the file input
        }
    }

    function validateFileForConversion(file, targetFormat) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Supported formats for CloudConvert
        const supportedFormats = {
            'docx': ['docx', 'doc'],
            'pdf': ['pdf'],
            'txt': ['txt', 'text'],
            'html': ['html', 'htm'],
            'odt': ['odt'],
            'rtf': ['rtf'],
            'pptx': ['pptx', 'ppt'],
            'xlsx': ['xlsx', 'xls']
        };
        
        // Check if input format is supported
        const isInputSupported = Object.values(supportedFormats).some(extensions => 
            extensions.includes(fileExtension)
        );
        
        if (!isInputSupported) {
            throw new Error(`Unsupported input format: .${fileExtension}. Supported formats: DOCX, PDF, TXT, HTML, ODT.`);
        }
        
        // Check file size (CloudConvert limit is 1GB for paid, 25MB for free)
        if (file.size > 25 * 1024 * 1024) {
            throw new Error('File too large (max 25MB). Please use a smaller file.');
        }
        
        // Check for potentially incompatible conversions
        const incompatibleConversions = [
            { from: 'pdf', to: 'docx' }, // PDF to DOCX is often problematic
            { from: 'image', to: 'docx' } // Images to document formats
        ];
        
        const fromFormat = Object.keys(supportedFormats).find(key => 
            supportedFormats[key].includes(fileExtension)
        );
        
        const isIncompatible = incompatibleConversions.some(conv => 
            conv.from === fromFormat && conv.to === targetFormat
        );
        
        if (isIncompatible) {
            throw new Error(`Conversion from ${fromFormat} to ${targetFormat} may not work well. Try a different format.`);
        }
        
        return true;
    }

    async function convertDocument() {
        try {
            await requireAuth('file conversion');
        } catch (error) {
            showNotification('Please log in to convert files', 'error');
            return;
        }
        if (!currentConverterFile) {
            showNotification('Please select a file first', 'error');
            return;
        }
        
        const loadingSpinner = document.getElementById('converterLoading');
        const convertBtn = document.getElementById('convertDocumentBtn');
        const downloadBtn = document.getElementById('downloadDocumentBtn');
        
        try {
            loadingSpinner.style.display = 'block';
            setButtonLoading(convertBtn, true);
            
            const fromFormat = document.getElementById('fromDocumentFormat').value;
            const toFormat = document.getElementById('toDocumentFormat').value;
            
            console.log(`🔄 Converting from ${fromFormat} to ${toFormat}`);
            
            let convertedBlob;
            
            if (fromFormat === toFormat) {
                // Same format - just return the original file
                convertedBlob = currentConverterFile;
                showNotification('File format unchanged', 'info');
            } else {
                // Use CloudConvert API
                convertedBlob = await convertWithCloudConvert(currentConverterFile, toFormat);
                showNotification(`✅ Document converted to ${toFormat.toUpperCase()}!`, 'success');
            }
            
            // Create download URL
            convertedFileUrl = URL.createObjectURL(convertedBlob);
            downloadBtn.disabled = false;
            
            // Show success message
            const resultElement = document.getElementById('convertedDocumentResult');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="color: var(--success-color); font-size: 48px; margin-bottom: 10px;">✓</div>
                        <p>Conversion successful!</p>
                        <p style="font-size: 0.9rem; color: var(--text-muted);">
                            ${currentConverterFile.name} → converted.${toFormat}
                        </p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Conversion error:', error);
            
            let errorMessage = 'Conversion failed';
            if (error.message.includes('Daily limit') || error.message.includes('insufficient credits')) {
                errorMessage = 'Conversion limit reached. Try again tomorrow or check your CloudConvert account.';
            } else if (error.message.includes('Unsupported format')) {
                errorMessage = 'This file format conversion is not supported.';
            } else if (error.message.includes('Invalid API key')) {
                errorMessage = 'API configuration error. Please contact support.';
            } else {
                errorMessage = error.message;
            }
            
            showNotification(`❌ ${errorMessage}`, 'error');
            
            // Show error in result area
            const resultElement = document.getElementById('convertedDocumentResult');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--error-color);">
                        <p>Conversion failed</p>
                        <p style="font-size: 0.8rem;">${errorMessage}</p>
                    </div>
                `;
            }
            
        } finally {
            loadingSpinner.style.display = 'none';
            setButtonLoading(convertBtn, false);
        }
    }

    async function convertWithCloudConvert(file, toFormat) {
        console.log('🔄 Starting CloudConvert conversion...', {
            file: file.name,
            from: file.type,
            to: toFormat,
            size: file.size
        });

        try {
            // Step 1: Create a conversion job
            const jobPayload = {
                tasks: {
                    'import-1': {
                        operation: 'import/upload'
                    },
                    'convert-1': {
                        operation: 'convert',
                        input: ['import-1'],
                        output_format: toFormat,
                        engine: 'libreoffice', // Use libreoffice for document conversions
                        engine_version: '7.3'
                    },
                    'export-1': {
                        operation: 'export/url',
                        input: ['convert-1'],
                        inline: false,
                        archive_multiple_files: false
                    }
                },
                tag: 'studysync-conversion'
            };

            console.log('📦 Job payload:', jobPayload);

            const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobPayload)
            });

            if (!jobResponse.ok) {
                const errorText = await jobResponse.text();
                console.error('❌ Job creation failed:', jobResponse.status, errorText);
                
                if (jobResponse.status === 401) {
                    throw new Error('Invalid CloudConvert API key');
                } else if (jobResponse.status === 422) {
                    throw new Error('Invalid conversion request. Please check file format compatibility.');
                } else if (jobResponse.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(`API error: ${jobResponse.status} - ${errorText}`);
                }
            }

            const jobData = await jobResponse.json();
            console.log('✅ Job created:', jobData);

            // Step 2: Get upload URL and upload the file
            const uploadTask = jobData.data.tasks.find(task => task.operation === 'import/upload');
            if (!uploadTask) {
                throw new Error('Upload task not found in job response');
            }

            const uploadUrl = uploadTask.result.form.url;
            const uploadFormData = uploadTask.result.form.parameters;

            console.log('📤 Uploading file to CloudConvert...');

            // Create form data for upload
            const formData = new FormData();
            for (const [key, value] of Object.entries(uploadFormData)) {
                formData.append(key, value);
            }
            formData.append('file', file);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error(`File upload failed: ${uploadResponse.status}`);
            }

            console.log('✅ File uploaded successfully');

            // Step 3: Wait for conversion to complete with better error reporting
            const jobId = jobData.data.id;
            let conversionStatus = '';
            let downloadUrl = '';
            let lastError = '';

            // Poll for job completion (max 3 minutes)
            for (let i = 0; i < 90; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

                const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
                    }
                });

                if (!statusResponse.ok) {
                    throw new Error(`Status check failed: ${statusResponse.status}`);
                }

                const statusData = await statusResponse.json();
                conversionStatus = statusData.data.status;

                console.log(`🔄 Conversion status: ${conversionStatus} (attempt ${i + 1}/90)`);

                if (conversionStatus === 'finished') {
                    // Get download URL from export task
                    const exportTask = statusData.data.tasks.find(task => task.operation === 'export/url');
                    if (exportTask && exportTask.result && exportTask.result.files && exportTask.result.files.length > 0) {
                        downloadUrl = exportTask.result.files[0].url;
                        break;
                    }
                } else if (conversionStatus === 'error') {
                    // Get detailed error information
                    const errorTask = statusData.data.tasks.find(task => task.status === 'error');
                    if (errorTask) {
                        lastError = errorTask.result?.message || errorTask.status || 'Unknown conversion error';
                        console.error('❌ Task error details:', errorTask);
                    } else {
                        lastError = 'Unknown conversion error - no task details available';
                    }
                    throw new Error(`Conversion failed: ${lastError}`);
                } else if (conversionStatus === 'cancelled') {
                    throw new Error('Conversion was cancelled');
                }
            }

            if (!downloadUrl) {
                throw new Error('Conversion timeout or no download URL received');
            }

            // Step 4: Download the converted file
            console.log('📥 Downloading converted file from:', downloadUrl);
            const downloadResponse = await fetch(downloadUrl);
            
            if (!downloadResponse.ok) {
                throw new Error(`Download failed: ${downloadResponse.status}`);
            }

            const convertedBlob = await downloadResponse.blob();
            console.log('✅ Conversion completed successfully!', {
                size: convertedBlob.size,
                type: convertedBlob.type
            });

            return convertedBlob;

        } catch (error) {
            console.error('🚨 CloudConvert conversion error:', error);
            
            // Provide more specific error messages
            if (error.message.includes('Invalid API key')) {
                throw new Error('Invalid CloudConvert API key. Please check your API key.');
            } else if (error.message.includes('insufficient credits')) {
                throw new Error('Insufficient CloudConvert credits. Please check your account balance.');
            } else if (error.message.includes('Unsupported format')) {
                throw new Error(`Unsupported file format for conversion to ${toFormat}`);
            } else if (error.message.includes('Rate limit')) {
                throw new Error('Too many requests. Please wait and try again.');
            } else if (error.message.includes('Conversion failed')) {
                // This is your specific error - let's make it more helpful
                throw new Error(`Document conversion failed. The file might be corrupted or in an unsupported format. Try using a different file.`);
            } else {
                throw error;
            }
        }
    }

    async function convertImage() {
        try {
            await requireAuth('file conversion');
        } catch (error) {
            showNotification('Please log in to convert files', 'error');
            return;
        }
        if (!currentConverterFile) return;
        
        const loadingSpinner = document.getElementById('converterLoading');
        const convertBtn = document.getElementById('convertImageBtn');
        const downloadBtn = document.getElementById('downloadImageBtn');
        const toFormat = document.getElementById('toImageFormat').value;
        
        try {
            loadingSpinner.style.display = 'block';
            setButtonLoading(convertBtn, true);
            
            // Create a canvas to convert image format
            const img = new Image();
            img.src = URL.createObjectURL(currentConverterFile);
            
            await new Promise((resolve) => {
                img.onload = resolve;
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Convert to desired format
            canvas.toBlob((blob) => {
                convertedFileUrl = URL.createObjectURL(blob);
                
                // Show converted preview
                const convertedPreview = document.getElementById('convertedImagePreview');
                convertedPreview.innerHTML = `<img src="${convertedFileUrl}" alt="Converted image" style="max-width: 100%; max-height: 200px; border-radius: var(--border-radius);">`;
                
                downloadBtn.disabled = false;
                loadingSpinner.style.display = 'none';
                setButtonLoading(convertBtn, false);
                
                showNotification(`Image converted successfully to ${toFormat.toUpperCase()}!`, 'success');
            }, `image/${toFormat}`, 0.9);
            
        } catch (error) {
            console.error('Image conversion error:', error);
            showNotification('Image conversion failed. Please try again.', 'error');
            loadingSpinner.style.display = 'none';
            setButtonLoading(convertBtn, false);
        }
    }

    window.downloadConvertedFile = function() {
        if (!convertedFileUrl) return;
        
        const link = document.createElement('a');
        link.href = convertedFileUrl;
        
        // Determine filename based on conversion type
        const activeTab = document.querySelector('.converter-tab.active').dataset.type;
        const extension = activeTab === 'document' ? 
            document.getElementById('toDocumentFormat').value :
            document.getElementById('toImageFormat').value;
        
        link.download = `converted-file.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.resetConverter = function() {
        currentConverterFile = null;
        
        if (convertedFileUrl) {
            URL.revokeObjectURL(convertedFileUrl);
            convertedFileUrl = null;
        }
        
        // Reset all buttons
        document.querySelectorAll('#convertDocumentBtn, #convertImageBtn').forEach(btn => {
            btn.disabled = true;
        });
        
        document.querySelectorAll('#downloadDocumentBtn, #downloadImageBtn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Reset upload areas to original state
        const documentUploadArea = document.getElementById('documentUploadArea');
        if (documentUploadArea) {
            documentUploadArea.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
                    <p>Click to select a document</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Supports: PDF, DOCX, TXT</p>
                </div>
            `;
        }
        
        const imageUploadArea = document.getElementById('imageUploadArea');
        if (imageUploadArea) {
            imageUploadArea.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🖼️</div>
                    <p>Click to select an image</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Supports: JPG, PNG, WEBP, GIF</p>
                </div>
            `;
        }
        
        // Reset previews
        const documentFileInfo = document.getElementById('documentFileInfo');
        if (documentFileInfo) {
            documentFileInfo.innerHTML = '';
        }
        
        const originalPreview = document.getElementById('originalImagePreview');
        if (originalPreview) {
            originalPreview.innerHTML = '<p>Original image will appear here</p>';
        }
        
        const convertedPreview = document.getElementById('convertedImagePreview');
        if (convertedPreview) {
            convertedPreview.innerHTML = '<p>Result will appear here</p>';
        }
        
        const convertedDocumentResult = document.getElementById('convertedDocumentResult');
        if (convertedDocumentResult) {
            convertedDocumentResult.innerHTML = '<p>Converted document will appear here</p>';
        }
    };

    // Initialize the file converter UI
    initFileConverterUI();
}

// Initialize flashcard generator functionality
function initFlashcardGenerator() {
    // Initialize topics and flashcards from localStorage or create defaults
    function loadFlashcardData() {
        const savedTopics = localStorage.getItem('studysync_topics');
        const savedFlashcards = localStorage.getItem('studysync_flashcards');
        
        topics = savedTopics ? JSON.parse(savedTopics) : [
            { id: 1, name: 'General Knowledge' },
            { id: 2, name: 'Mathematics' },
            { id: 3, name: 'Science' }
        ];
        
        manualFlashcards = savedFlashcards ? JSON.parse(savedFlashcards) : [];
        
        renderTopics();
        renderTopicSelect();
        renderFlashcards();
    }

    function saveFlashcardData() {
        localStorage.setItem('studysync_topics', JSON.stringify(topics));
        localStorage.setItem('studysync_flashcards', JSON.stringify(manualFlashcards));
    }

    function renderTopics() {
        const topicsList = document.getElementById('topicsList');
        if (!topicsList) return;
        
        if (topics.length === 0) {
            topicsList.innerHTML = '<p class="empty-state">No topics yet. Create your first topic!</p>';
            return;
        }
        
        topicsList.innerHTML = topics.map(topic => `
            <div class="topic-item" data-topic-id="${topic.id}">
                <span class="topic-name">${topic.name}</span>
                <button class="delete-topic-btn" data-topic-id="${topic.id}" title="Delete topic">🗑️</button>
            </div>
        `).join('');
        
        // Add event listeners for topic selection and deletion
        document.querySelectorAll('.topic-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.classList.contains('delete-topic-btn')) {
                    // Select topic
                    document.querySelectorAll('.topic-item').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    const topicId = parseInt(this.dataset.topicId);
                    filterFlashcardsByTopic(topicId);
                }
            });
        });
        
        document.querySelectorAll('.delete-topic-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const topicId = parseInt(this.dataset.topicId);
                deleteTopic(topicId);
            });
        });
    }

    function renderTopicSelect() {
        const topicSelect = document.getElementById('flashcardTopic');
        if (!topicSelect) return;
        
        topicSelect.innerHTML = '<option value="">-- Select a topic --</option>' +
            topics.map(topic => `<option value="${topic.id}">${topic.name}</option>`).join('');
        
        // Also update the filter dropdown
        const filterSelect = document.getElementById('filterByTopic');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">All Topics</option>' +
                topics.map(topic => `<option value="${topic.id}">${topic.name}</option>`).join('');
        }
    }

    function renderFlashcards() {
        const flashcardsGrid = document.getElementById('manualFlashcardsGrid');
        if (!flashcardsGrid) return;
        
        // Get current filters
        const topicFilter = document.getElementById('filterByTopic')?.value || 'all';
        const difficultyFilter = document.getElementById('filterByDifficulty')?.value || 'all';
        
        // Filter flashcards
        let filteredFlashcards = manualFlashcards;
        
        if (topicFilter !== 'all') {
            filteredFlashcards = filteredFlashcards.filter(card => card.topicId === parseInt(topicFilter));
        }
        
        if (difficultyFilter !== 'all') {
            filteredFlashcards = filteredFlashcards.filter(card => card.difficulty === difficultyFilter);
        }
        
        if (filteredFlashcards.length === 0) {
            flashcardsGrid.innerHTML = '<p class="empty-state">No flashcards found. Create your first flashcard!</p>';
            return;
        }
        
        flashcardsGrid.innerHTML = filteredFlashcards.map((card, index) => {
            const topic = topics.find(t => t.id === card.topicId);
            const difficultyIcon = card.difficulty === 'easy' ? '🟢' : 
                                 card.difficulty === 'medium' ? '🟡' : '🔴';
            
            return `
                <div class="manual-flashcard" data-card-id="${card.id}">
                    <div class="manual-flashcard-content">
                        <div class="manual-flashcard-front">
                            <span class="manual-flashcard-number">${index + 1}</span>
                            <div class="manual-flashcard-text">
                                <h4>Question</h4>
                                <p>${card.question}</p>
                                <small>Click to reveal answer</small>
                            </div>
                            <div class="manual-flashcard-meta">
                                <span>${topic ? topic.name : 'Unknown'}</span>
                                <span>${difficultyIcon}</span>
                            </div>
                        </div>
                        <div class="manual-flashcard-back">
                            <div class="manual-flashcard-text">
                                <h4>Answer</h4>
                                <p>${card.answer}</p>
                                <small>Click to see question</small>
                            </div>
                            <div class="manual-flashcard-meta">
                                <span>${topic ? topic.name : 'Unknown'}</span>
                                <span>${difficultyIcon}</span>
                            </div>
                        </div>
                    </div>
                    <div class="manual-flashcard-actions">
                        <button class="delete-flashcard-btn" data-card-id="${card.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners for flashcard flipping and deletion
        document.querySelectorAll('.manual-flashcard').forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('delete-flashcard-btn')) {
                    this.classList.toggle('flipped');
                }
            });
        });
        
        document.querySelectorAll('.delete-flashcard-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const cardId = this.dataset.cardId;
                deleteFlashcard(cardId);
            });
        });
    }

    function filterFlashcardsByTopic(topicId) {
        const filterSelect = document.getElementById('filterByTopic');
        if (filterSelect) {
            filterSelect.value = topicId;
        }
        renderFlashcards();
    }

    function createTopic(name) {
        const newTopic = {
            id: Date.now(), // Simple ID generation
            name: name.trim()
        };
        
        topics.push(newTopic);
        saveFlashcardData();
        renderTopics();
        renderTopicSelect();
        
        showNotification(`Topic "${name}" created successfully!`, 'success');
    }

    function deleteTopic(topicId) {
        if (!confirm('Are you sure you want to delete this topic? All flashcards in this topic will also be deleted.')) {
            return;
        }
        
        // Remove topic
        topics = topics.filter(topic => topic.id !== topicId);
        
        // Remove flashcards associated with this topic
        manualFlashcards = manualFlashcards.filter(card => card.topicId !== topicId);
        
        saveFlashcardData();
        renderTopics();
        renderTopicSelect();
        renderFlashcards();
        
        showNotification('Topic deleted successfully', 'success');
    }

    function createFlashcard(topicId, question, answer, difficulty) {
        const newFlashcard = {
            id: Date.now(), // Simple ID generation
            topicId: parseInt(topicId),
            question: question.trim(),
            answer: answer.trim(),
            difficulty: difficulty,
            createdAt: new Date().toISOString()
        };
        
        manualFlashcards.push(newFlashcard);
        saveFlashcardData();
        renderFlashcards();
        
        showNotification('Flashcard created successfully!', 'success');
    }

    function deleteFlashcard(cardId) {
        if (!confirm('Are you sure you want to delete this flashcard?')) {
            return;
        }
        
        manualFlashcards = manualFlashcards.filter(card => card.id !== parseInt(cardId));
        saveFlashcardData();
        renderFlashcards();
        
        showNotification('Flashcard deleted successfully', 'success');
    }

    function exportFlashcards() {
        if (manualFlashcards.length === 0) {
            showNotification('No flashcards to export', 'error');
            return;
        }
        
        let exportText = 'StudySync Flashcards Export\n\n';
        
        manualFlashcards.forEach((card, index) => {
            const topic = topics.find(t => t.id === card.topicId);
            exportText += `Flashcard ${index + 1}:\n`;
            exportText += `Topic: ${topic ? topic.name : 'Unknown'}\n`;
            exportText += `Difficulty: ${card.difficulty}\n`;
            exportText += `QUESTION: ${card.question}\n`;
            exportText += `ANSWER: ${card.answer}\n\n`;
        });
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = 'studysync-flashcards-export.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('Flashcards exported successfully!', 'success');
    }

    function enterStudyMode() {
        const filteredFlashcards = getFilteredFlashcards();
        
        if (filteredFlashcards.length === 0) {
            showNotification('No flashcards to study', 'error');
            return;
        }
        
        currentStudyMode = true;
        currentStudyIndex = 0;
        
        // Create study mode overlay
        const studyMode = document.createElement('div');
        studyMode.className = 'study-mode';
        studyMode.innerHTML = `
            <div class="study-mode-header">
                <h2>Study Mode</h2>
                <button class="btn-secondary" id="exitStudyMode">Exit</button>
            </div>
            <div class="study-mode-flashcard">
                <div class="manual-flashcard" id="studyFlashcard">
                    <div class="manual-flashcard-content">
                        <div class="manual-flashcard-front">
                            <div class="manual-flashcard-text">
                                <h4>Question</h4>
                                <p id="studyQuestion">Loading...</p>
                                <small>Click to reveal answer</small>
                            </div>
                        </div>
                        <div class="manual-flashcard-back">
                            <div class="manual-flashcard-text">
                                <h4>Answer</h4>
                                <p id="studyAnswer">Loading...</p>
                                <small>Click to see question</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="study-mode-progress">
                <p id="studyProgress">1 of ${filteredFlashcards.length}</p>
            </div>
            <div class="study-mode-controls">
                <button class="btn-secondary" id="prevCard" disabled>Previous</button>
                <button class="btn-primary" id="nextCard">Next</button>
            </div>
        `;
        
        document.body.appendChild(studyMode);
        
        // Initialize study mode
        updateStudyCard();
        
        // Add study mode event listeners
        document.getElementById('exitStudyMode').addEventListener('click', exitStudyMode);
        document.getElementById('studyFlashcard').addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        document.getElementById('prevCard').addEventListener('click', showPreviousCard);
        document.getElementById('nextCard').addEventListener('click', showNextCard);
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleStudyModeKeyboard);
    }

    function exitStudyMode() {
        currentStudyMode = false;
        const studyMode = document.querySelector('.study-mode');
        if (studyMode) {
            studyMode.remove();
        }
        document.removeEventListener('keydown', handleStudyModeKeyboard);
    }

    function getFilteredFlashcards() {
        const topicFilter = document.getElementById('filterByTopic')?.value || 'all';
        const difficultyFilter = document.getElementById('filterByDifficulty')?.value || 'all';
        
        let filteredFlashcards = manualFlashcards;
        
        if (topicFilter !== 'all') {
            filteredFlashcards = filteredFlashcards.filter(card => card.topicId === parseInt(topicFilter));
        }
        
        if (difficultyFilter !== 'all') {
            filteredFlashcards = filteredFlashcards.filter(card => card.difficulty === difficultyFilter);
        }
        
        return filteredFlashcards;
    }

    function updateStudyCard() {
        const filteredFlashcards = getFilteredFlashcards();
        const currentCard = filteredFlashcards[currentStudyIndex];
        
        if (!currentCard) return;
        
        document.getElementById('studyQuestion').textContent = currentCard.question;
        document.getElementById('studyAnswer').textContent = currentCard.answer;
        document.getElementById('studyProgress').textContent = `${currentStudyIndex + 1} of ${filteredFlashcards.length}`;
        
        // Reset card to front
        const studyFlashcard = document.getElementById('studyFlashcard');
        if (studyFlashcard) {
            studyFlashcard.classList.remove('flipped');
        }
        
        // Update button states
        document.getElementById('prevCard').disabled = currentStudyIndex === 0;
        document.getElementById('nextCard').textContent = 
            currentStudyIndex === filteredFlashcards.length - 1 ? 'Finish' : 'Next';
    }

    function showPreviousCard() {
        if (currentStudyIndex > 0) {
            currentStudyIndex--;
            updateStudyCard();
        }
    }

    function showNextCard() {
        const filteredFlashcards = getFilteredFlashcards();
        
        if (currentStudyIndex < filteredFlashcards.length - 1) {
            currentStudyIndex++;
            updateStudyCard();
        } else {
            // Finished studying
            showNotification('Study session completed!', 'success');
            exitStudyMode();
        }
    }

    function handleStudyModeKeyboard(e) {
        if (!currentStudyMode) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (currentStudyIndex > 0) {
                    showPreviousCard();
                }
                break;
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                showNextCard();
                break;
            case 'Escape':
                exitStudyMode();
                break;
            case 'f':
            case 'F':
                // Flip card
                const studyFlashcard = document.getElementById('studyFlashcard');
                if (studyFlashcard) {
                    studyFlashcard.classList.toggle('flipped');
                }
                break;
        }
    }

    // Initialize flashcard generator UI
    function initFlashcardGeneratorUI() {
        // Load initial data
        loadFlashcardData();
        
        // Set up event listeners
        document.getElementById('createTopicBtn')?.addEventListener('click', function() {
            openAddTopicModal();
        });
        
        document.getElementById('manualFlashcardForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const topicId = document.getElementById('flashcardTopic').value;
            const question = document.getElementById('flashcardQuestion').value;
            const answer = document.getElementById('flashcardAnswer').value;
            const difficulty = document.getElementById('flashcardDifficulty').value;
            
            if (!topicId) {
                showNotification('Please select a topic', 'error');
                return;
            }
            
            if (!question.trim() || !answer.trim()) {
                showNotification('Please fill in both question and answer', 'error');
                return;
            }
            
            createFlashcard(topicId, question, answer, difficulty);
            
            // Reset form
            this.reset();
            document.getElementById('flashcardDifficulty').value = 'medium';
        });
        
        document.getElementById('clearFlashcardForm')?.addEventListener('click', function() {
            document.getElementById('manualFlashcardForm').reset();
            document.getElementById('flashcardDifficulty').value = 'medium';
        });
        
        document.getElementById('filterByTopic')?.addEventListener('change', renderFlashcards);
        document.getElementById('filterByDifficulty')?.addEventListener('change', renderFlashcards);
        
        document.getElementById('studyModeBtn')?.addEventListener('click', enterStudyMode);
        document.getElementById('exportFlashcardsBtn')?.addEventListener('click', exportFlashcards);
        
        // Set up topic modal
        document.getElementById('topicForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const topicName = document.getElementById('topicName').value.trim();
            
            if (!topicName) {
                showNotification('Please enter a topic name', 'error');
                return;
            }
            
            createTopic(topicName);
            closeAddTopicModal();
        });
    }

    // Topic modal functions
    function openAddTopicModal() {
        const modal = document.getElementById('addTopicModal');
        if (modal) {
            modal.removeAttribute('style');
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            document.getElementById('topicName').focus();
            modal.offsetHeight; // Force reflow
        }
    }

    function closeAddTopicModal() {
        const modal = document.getElementById('addTopicModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.classList.remove('modal-open');
        document.getElementById('topicForm').reset();
    }

    // Set up topic modal event listeners
    document.getElementById('cancelTopic')?.addEventListener('click', closeAddTopicModal);
    document.getElementById('closeTopicModal')?.addEventListener('click', closeAddTopicModal);
    document.getElementById('addTopicModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddTopicModal();
        }
    });

    // Initialize the UI
    initFlashcardGeneratorUI();
}

// Initialize search functionality
function initSearch() {
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
        { title: 'Flashcard Generator', section: 'flashcards', type: 'tool', description: 'Generate study flashcards from PDFs' }, 
        { title: 'Quiz Maker', section: 'quiz-maker', type: 'tool', description: 'Generate custom quizzes' },
        { title: 'PDF Combiner', section: 'pdf-combiner', type: 'tool', description: 'Merge multiple PDF files' },
        { title: 'File Converter', section: 'file-converter', type: 'tool', description: 'Convert between various file formats' },
        { title: 'Background Remover', section: 'bg-remover', type: 'tool', description: 'Remove Background from images' },
        
        // Settings
        { title: 'Theme Settings', section: 'theme', type: 'settings', description: 'Customize appearance and themes' },
        { title: 'Account', section: 'account', type: 'settings', description: 'Manage your account settings' }
    ];

    function activateMobileSearch() {
        if (window.innerWidth > 768) return;
        
        isMobileSearchActive = true;
        searchBar.classList.add('active');
        document.querySelector('.search-backdrop').style.display = 'block';
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
        document.querySelector('.search-backdrop').style.display = 'none';
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

    // Set up search event listeners
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
    document.querySelector('.search-backdrop').addEventListener('click', deactivateMobileSearch);

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
}

// Initialize navigation functionality
function initNavigation() {
    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            // Mobile behavior - use active class
            sidebar.classList.toggle('active');
            document.querySelector('.sidebar-overlay').style.display = sidebar.classList.contains('active') ? 'block' : 'none';
            
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

    window.navigateToSection = function(sectionId) {
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
    };

    // Set up navigation event listeners
    sidebarToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        toggleSidebar();
    });

    // Close sidebar when clicking on a nav item (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            navigateToSection(section);
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                document.querySelector('.sidebar-overlay').style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });

    // Close sidebar when clicking overlay
    document.querySelector('.sidebar-overlay').addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            this.style.display = 'none';
            document.body.style.overflow = '';
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
                document.querySelector('.sidebar-overlay').style.display = 'none';
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

    // Set initial state based on screen size
    if (window.innerWidth > 768) {
        mainContent.style.marginLeft = '240px';
    } else {
        mainContent.style.marginLeft = '0';
    }
}

// Initialize authentication functionality
function initAuth() {
    let currentAuthTab = 'login';

    window.openAuthModal = function() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    };

    window.closeAuthModal = function() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.classList.remove('modal-open');
        document.getElementById('authForm').reset();
    };

    window.handleAuth = async function(event) {
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
    };

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

    window.logoutUser = async function() {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            showNotification('Logout failed', 'error');
        } else {
            showNotification('Logged out successfully', 'info');
        }
    };

    // ========== AUTH GUARD FUNCTION ==========
    window.requireAuth = function(featureName = 'this feature') {
        return new Promise(async (resolve, reject) => {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) {
                // Show auth modal and reject promise
                showNotification(`Please log in to use ${featureName}`, 'info');
                openAuthModal();
                reject(new Error('Authentication required'));
            } else {
                resolve(user);
            }
        });
    };

    window.updateUIForAuthState = function(session) {
        const authButtons = document.querySelector('.auth-buttons');
        const user = session?.user;

        if (user) {
            authButtons.innerHTML = `
                <span style="color: var(--text-secondary); margin-right: 10px;">
                    👋 ${user.email}
                </span>
                <button class="btn-secondary" id="logoutBtn">Logout</button>
            `;
            
            enableProtectedFeatures();
            
            // ✅ Load user-specific data when logged in
            loadTasks();
            loadQuickLinks();
            loadSavedQuotes();
            
            // ✅ Enable file converter
            checkConverterAuthState();
            
        } else {
            authButtons.innerHTML = `
                <button class="btn-secondary" id="loginBtn">Login</button>
                <button class="btn-primary" id="signupBtn">Sign Up</button>
            `;
            
            // ✅ CLEAR ALL DATA FROM UI WHEN LOGGED OUT
            clearAllData();
            disableProtectedFeatures();
            
            // ✅ Disable file converter
            checkConverterAuthState();
        }
    };

    window.clearAllData = function() {
        // Clear tasks
        tasks = [];
        const todoList = document.getElementById('todoList');
        const todoListFull = document.getElementById('todoListFull');
        if (todoList) todoList.innerHTML = '<p class="empty-state">No tasks yet. Add your first task!</p>';
        if (todoListFull) todoListFull.innerHTML = '<p class="empty-state">No tasks yet. Add your first task!</p>';
        
        // Clear quick links (reset to default links)
        quickLinks = [
            { name: 'Google Drive', url: 'https://drive.google.com' },
            { name: 'University Portal', url: 'https://university.edu' },
            { name: 'YouTube', url: 'https://youtube.com' },
            { name: 'Spotify', url: 'https://spotify.com' },
            { name: 'Notion', url: 'https://notion.so' }
        ];
        renderQuickLinks();
        
        // Clear saved quotes
        savedQuotes = [];
        const savedQuotesList = document.getElementById('savedQuotesList');
        if (savedQuotesList) savedQuotesList.innerHTML = '<p class="empty-state">No saved quotes yet.</p>';
        
        // Clear any current image in background remover
        if (currentImage) {
            resetBgRemover();
        }
        
        // ✅ Clear file converter state
        resetConverter();
        currentConverterFile = null;
        if (convertedFileUrl) {
            URL.revokeObjectURL(convertedFileUrl);
            convertedFileUrl = null;
        }
        
        console.log('🧹 All user data cleared from UI');
    };

    window.disableProtectedFeatures = function() {
        console.log('🛑 Disabling protected features...');
        
        checkConverterAuthState();

        // Don't disable background remover button - let requireAuth handle it
        const removeBgBtn = document.getElementById('removeBgBtn');
        if (removeBgBtn) {
            removeBgBtn.disabled = false; // Keep it enabled for auth flow
            removeBgBtn.title = 'Please log in to use this feature';
            removeBgBtn.classList.add('feature-protected');
        }
        
        // Disable other protected buttons but NOT timer buttons
        const saveButtons = document.querySelectorAll('[id*="save"], [id*="add"]');
        saveButtons.forEach(btn => {
            // Don't disable timer-related buttons
            if (btn.id.includes('Timer')) return;
            
            if (btn.id !== 'loginBtn' && btn.id !== 'signupBtn') {
                btn.disabled = true;
                btn.title = 'Please log in to use this feature';
                btn.classList.add('feature-protected');
            }
        });
        
        // Hide saved images section
        const savedImagesSection = document.getElementById('savedImagesSection');
        if (savedImagesSection) savedImagesSection.style.display = 'none';
    };

    window.enableProtectedFeatures = function() {
        console.log('✅ Enabling protected features...');
        
        checkConverterAuthState();

        const removeBgBtn = document.getElementById('removeBgBtn');
        if (removeBgBtn) {
            removeBgBtn.disabled = !currentImage; // Only disable if no image selected
            removeBgBtn.title = '';
            removeBgBtn.classList.remove('feature-protected');
        }
        
        // Enable all other protected buttons (but timers are always enabled)
        const protectedButtons = document.querySelectorAll('[id*="save"], [id*="add"]');
        protectedButtons.forEach(btn => {
            if (btn.id !== 'loginBtn' && btn.id !== 'signupBtn' && !btn.id.includes('Timer')) {
                btn.disabled = false;
                btn.title = '';
                btn.classList.remove('feature-protected');
            }
        });
        
        // Show saved images section
        const savedImagesSection = document.getElementById('savedImagesSection');
        if (savedImagesSection) savedImagesSection.style.display = 'block';
        
        // Load user-specific data
        loadUserImages();
    };

    // Set up auth event listeners
    document.getElementById('authForm')?.addEventListener('submit', handleAuth);
    
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
}

// Load initial data
function loadInitialData() {
    window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateUIForAuthState(session);
        if (session) {
            loadTasks();
            loadQuickLinks();
            loadSavedQuotes();
        }
    });
    
    // Initialize displays
    console.log('🔍 DEBUG: Initializing app...');
    updateTimerDisplay();
    loadTasks();
    loadQuickLinks();
    loadSavedQuotes();

    // Check CloudConvert status on startup
    setTimeout(async () => {
        const isCloudConvertWorking = await checkCloudConvertStatus();
        if (!isCloudConvertWorking) {
            console.warn('⚠️ CloudConvert API may not be working properly');
            showNotification('File conversion service is currently unavailable', 'warning');
        }
    }, 2000);
}

// Utility functions
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

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        const originalText = button.textContent;
        button.setAttribute('data-original-text', originalText);
        button.textContent = 'Loading...';
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.textContent = originalText;
        }
    }
}

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

async function checkCloudConvertStatus() {
    try {
        console.log('🔍 Checking CloudConvert API status...');
        
        // Instead of checking user endpoint (which requires different permissions),
        // let's test with a simple job creation to see if API key is valid
        const testResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tasks: {
                    'test-import': {
                        operation: 'import/upload'
                    }
                },
                tag: 'test-connection'
            })
        });
        
        if (testResponse.ok) {
            const jobData = await testResponse.json();
            console.log('✅ CloudConvert API is working properly');
            console.log('📊 Test job created:', jobData.data.id);
            
            // Clean up the test job
            try {
                await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`
                    }
                });
                console.log('🧹 Test job cleaned up');
            } catch (cleanupError) {
                console.log('⚠️ Could not clean up test job (this is normal)');
            }
            
            return true;
        } else {
            const errorText = await testResponse.text();
            console.error('❌ CloudConvert API check failed:', testResponse.status, errorText);
            
            if (testResponse.status === 401 || testResponse.status === 403) {
                console.error('❌ Invalid CloudConvert API key or insufficient permissions');
                showNotification('CloudConvert API configuration issue. File conversion may not work.', 'error');
            } else if (testResponse.status === 429) {
                console.error('❌ CloudConvert rate limit exceeded');
                showNotification('CloudConvert rate limit exceeded. Please try again later.', 'warning');
            } else {
                console.error('❌ CloudConvert API error:', testResponse.status);
                showNotification('CloudConvert service is temporarily unavailable.', 'warning');
            }
            
            return false;
        }
    } catch (error) {
        console.error('❌ CloudConvert status check failed:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('❌ Network error - check internet connection');
            showNotification('Network error. Please check your internet connection.', 'error');
        } else {
            console.error('❌ Unexpected error:', error);
            showNotification('Unable to connect to conversion service.', 'warning');
        }
        
        return false;
    }
}

// Set up global event listeners
document.addEventListener('click', function(e) {
    
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

    if (e.target.classList.contains('delete-link-btn')) {
        const linkId = parseInt(e.target.dataset.linkId);
        console.log('🔍 DEBUG: Delete link clicked:', linkId);
        deleteLink(linkId);
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

    if (e.target.classList.contains('delete-quote-btn')) {
        const quoteId = parseInt(e.target.dataset.quoteId);
        console.log('🔍 DEBUG: Delete quote clicked - ID:', quoteId);
        
        if (quoteId) {
            deleteQuote(quoteId);
        } else {
            console.error('❌ No quote ID found on delete button');
        }
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