// StudySync Application - COMPLETE DATABASE-ONLY VERSION
let currentPdfFile = null;
let generatedFlashcards = [];
const OXFORD_APP_ID = 'f4b83c70';
const OXFORD_APP_KEY = '0820245d492648c9659f4f6d59645928';
const CLOUDCONVERT_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjk3ZDdlNTMyMjYzNmViMzNhZGFlYzkzMmUzYTEyZmZjMzFkNjgwY2YzOWMwYjVkOWZlZjEzZDI2MWU3ZGJiMzE1ODM2NGI4YTIzY2YwOGEiLCJpYXQiOjE3NjQ0MDU5MjUuNzQzNzE0LCJuYmYiOjE3NjQ0MDU5MjUuNzQzNzE2LCJleHAiOjQ5MjAwNzk1MjUuNzM2OTY2LCJzdWIiOiI3MzU5ODQ3MiIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.YanMCYvd1O_1THfgbF5NN8C2mflYC07D2K789fmXjeHOkOPY-vXF2k0TE216G6HKQN6FpZPL3HTLGy-tPZkG-SpSqm9msq7stbGntZ8s_tCE6nIdR3UgHVUsxi6xYOK9QAGe-j6OOx3gorJgciaYFk7sh9bZ-pilcZKHSSryUoXtUXzdFr4Hf_rXn5rbv85rpdd8sfspWEJ5qQL318I7_XOrWdBaYOLkRCOL_KtkNOiruaJrT7tB_nK3xvfhTkNKsHndpgePVq1YE61uUS8Fz3uNrce4Zxf436S7HBCcfhqyHr7ozoOqGadTrFkR04oeaPVOX3_MkDWwe4wDeD3LzuLZkcCUoQCOOVyYvTajI6Oto_hBrI66EGM6Qha6CnjchEXCLvdfXVdVYp0YBIhvaSxu0uERmidY9dUWxseRmpZm07csl1c2RPDm3Ppprfkhc4gZt99k428BaQgQsmgEePLOLzFVWn14KL6SCdHJXk7p1EXed1WV1YaYuqXa-GHy2iv_-Eu2ixz7ajRLRNuH_PF4ahW2gxnHg6B184J5daDyq3Dnyb5SFNkE_v0z7RQFE8bQs9rGZ_D9gEsCLV7aVIDXfQX_SqzF3yhPdffsuQubm9D3Fn1DfbaTt1bFWihHlIi_mS5ZJilvR3QYy7ho6CCv6SqbHZRmLxoUTW5lQzM';

// UI Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');
const searchInput = document.querySelector('.search-bar input');
const searchMobileToggle = document.getElementById('searchmobiletoggle');
const searchBar = document.querySelector('.search-bar');

// Data arrays (will be loaded from database when user logs in)
let topics = [];
let manualFlashcards = [];
let currentStudyMode = false;
let currentStudyIndex = 0;
let isMobileSearchActive = false;
let hideSearchResults = () => {};
let deactivateMobileSearch = () => {};
let hideSearchSuggestions = () => {};
let tasks = [];
let quickLinks = [];
let savedQuotes = [];
let currentImage = null;
let processedImageUrl = null;
let currentConverterFile = null;
let convertedFileUrl = null;
let savedWords = [];
window.savedWordsData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 StudySync: DOMContentLoaded started');
    
    const supabaseUrl = 'https://ptkofufzalqzywbyypvq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a29mdWZ6YWxxenl3Ynl5cHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODI0MzksImV4cCI6MjA3OTU1ODQzOX0.89SH7XUmv4MKEFQZRq2Hvp2Z6H03wrTap1k_FmV9E9U';
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    initApp();
});

// Initialize all application components
function initApp() {
    // Set up authentication state listener
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('🔍 Auth event:', event);
        updateUIForAuthState(session);
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
    initDictionary();  
    initSearch();
    initNavigation();
    initAuth(); 
    initThemeToggle();
    initStudyResources();
    // Load initial data
    loadInitialData();
    
    console.log('✅ StudySync: App initialization completed');
}

// ========== TIMER ==========
function initTimer() {
    let timerInterval;
    let timerMinutes = 25;
    let timerSeconds = 0;
    let isTimerRunning = false;
    let isBreakTime = false;

    window.updateTimerDisplay = function() {
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
    };

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

    updateTimerDisplay();
}

// ========== TODO LIST - DATABASE ONLY ==========
function initTodoList() {
    tasks = [];

    window.openAddTaskModal = function() {
        const modal = document.getElementById('addTaskModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            document.getElementById('taskTitle')?.focus();
        }
    };

    window.closeAddTaskModal = function() {
        const modal = document.getElementById('addTaskModal');
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.getElementById('taskForm')?.reset();
    };

    window.addTask = async function(event) {
        event.preventDefault();
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            showNotification('Please log in to add tasks', 'error');
            openAuthModal();
            return;
        }
        
        const title = document.getElementById('taskTitle')?.value.trim();
        const description = document.getElementById('taskDescription')?.value.trim();
        const dueDate = document.getElementById('taskDueDate')?.value;
        
        if (!title) {
            showNotification('Please enter a task title', 'error');
            return;
        }
        
        try {
            const { data, error } = await window.supabaseClient
                .from('tasks')
                .insert([{
                    user_id: user.id,
                    title,
                    description,
                    due_date: dueDate || null,
                    completed: false
                }])
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
        
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        let filteredTasks = tasks;
        if (activeFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (activeFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Dashboard view
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
                            ${task.due_date ? `<div class="task-due">Due: ${new Date(task.due_date).toLocaleDateString()}</div>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Full view
        if (todoListFull) {
            if (filteredTasks.length === 0) {
                todoListFull.innerHTML = '<p class="empty-state">No tasks match your filter.</p>';
            } else {
                todoListFull.innerHTML = filteredTasks.map(task => `
                    <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                            <!-- EMPTY -->
                        </div>
                        <div class="task-content">
                            <div class="task-text">${task.title}</div>
                            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                            ${task.due_date ? `<div class="task-due">Due: ${new Date(task.due_date).toLocaleDateString()}</div>` : ''}
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
            showNotification('Failed to update task', 'error');
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
                tasks = [];
                renderTasks();
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

    // Event listeners
    document.getElementById('taskForm')?.addEventListener('submit', addTask);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
}

// ========== QUICK LINKS - DATABASE ONLY ==========
function initQuickLinks() {
    quickLinks = [];

    window.openAddLinkModal = function() {
        const modal = document.getElementById('addLinkModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            document.getElementById('linkName')?.focus();
        }
    };

    window.closeAddLinkModal = function() {
        const modal = document.getElementById('addLinkModal');
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.getElementById('linkForm')?.reset();
    };

    window.addLink = async function(event) {
        event.preventDefault();
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            showNotification('Please log in to add links', 'error');
            openAuthModal();
            return;
        }
        
        const name = document.getElementById('linkName')?.value.trim();
        let url = document.getElementById('linkUrl')?.value.trim();
        
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
                .insert([{
                    user_id: user.id,
                    name,
                    url: formattedUrl
                }])
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

            if (!confirm('Are you sure you want to delete this link?')) return;

            const { error } = await window.supabaseClient
                .from('quick_links')
                .delete()
                .eq('id', linkId)
                .eq('user_id', user.id);

            if (error) throw error;

            quickLinks = quickLinks.filter(link => link.id !== linkId);
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

    document.getElementById('linkForm')?.addEventListener('submit', addLink);
}

// ========== QUOTES - DATABASE ONLY ==========
function initQuotes() {
    savedQuotes = [];

    window.getRandomQuote = function() {
        const quoteElement = document.getElementById('currentQuote');
        const quoteElementFull = document.getElementById('currentQuoteFull');
        
        if (quoteElement) quoteElement.textContent = 'Loading quote...';
        if (quoteElementFull) quoteElementFull.textContent = 'Loading quote...';

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
        
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        
        if (quoteElement) quoteElement.textContent = randomQuote;
        if (quoteElementFull) quoteElementFull.textContent = randomQuote;
    };

    window.renderSavedQuotes = function() {
        const savedQuotesList = document.getElementById('savedQuotesList');
        if (!savedQuotesList) return;
        
        if (savedQuotes.length === 0) {
            savedQuotesList.innerHTML = '<p class="empty-state">No saved quotes yet.</p>';
        } else {
            savedQuotesList.innerHTML = savedQuotes.map(quote => `
                <div class="saved-quote-item">
                    <div class="quote-text">${quote.quote_text}</div>
                    <button class="btn-secondary delete-quote-btn" data-quote-id="${quote.id}">
                        Delete
                    </button>
                </div>
            `).join('');
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
                openAuthModal();
                return;
            }
            
            const currentQuote = document.getElementById('currentQuoteFull')?.textContent || 
                               document.getElementById('currentQuote')?.textContent;
            
            if (!currentQuote) return;

            const { error } = await window.supabaseClient
                .from('saved_quotes')
                .insert([{
                    user_id: user.id,
                    quote_text: currentQuote
                }]);

            if (error) throw error;

            loadSavedQuotes();
            showNotification('Quote saved!', 'success');
            
        } catch (error) {
            console.error('Error saving quote:', error);
            showNotification('Failed to save quote', 'error');
        }
    };

    window.deleteQuote = async function(quoteId) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to delete quotes', 'error');
                return;
            }

            if (!confirm('Are you sure you want to delete this quote?')) return;

            const { error } = await window.supabaseClient
                .from('saved_quotes')
                .delete()
                .eq('id', quoteId)
                .eq('user_id', user.id);

            if (error) throw error;

            loadSavedQuotes();
            showNotification('Quote deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting quote:', error);
            showNotification('Failed to delete quote', 'error');
        }
    };

    getRandomQuote();
}

// ========== BACKGROUND REMOVER ==========
function initBackgroundRemover() {
    currentImage = null;
    processedImageUrl = null;

    const BG_REMOVER_API = {
        removeBg: async (imageFile) => {
            const apiKey = 'jTZa6MtpPWM4L9K26a6ZuVko';
            
            if (!imageFile) throw new Error('No image file provided');

            const formData = new FormData();
            formData.append('image_file', imageFile);
            formData.append('size', 'auto');
            
            try {
                const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: { 'X-Api-Key': apiKey },
                    body: formData,
                    signal: AbortSignal.timeout(30000)
                });
                
                if (!response.ok) {
                    if (response.status === 400) throw new Error('Invalid image format');
                    if (response.status === 402) throw new Error('API quota exceeded');
                    if (response.status === 403) throw new Error('Invalid API key');
                    if (response.status === 429) throw new Error('Too many requests');
                    throw new Error(`Service error: ${response.status}`);
                }
                
                const blob = await response.blob();
                if (blob.size === 0) throw new Error('Received empty image');
                
                return blob;
                
            } catch (error) {
                console.error('API Request failed:', error);
                if (error.name === 'AbortError') throw new Error('Request timeout');
                if (error.name === 'TypeError') throw new Error('Network error');
                throw error;
            }
        }
    };

    window.removeBackground = async function() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const removeBgBtn = document.getElementById('removeBgBtn');
        const resultPreview = document.getElementById('resultPreview');
        const downloadBtn = document.getElementById('downloadBtn');

        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to use background remover', 'error');
                openAuthModal();
                return;
            }
            
            if (!currentImage) {
                showNotification('Please select an image first', 'error');
                return;
            }

            if (currentImage.size === 0) throw new Error('Image file is empty');
            if (currentImage.size > 12 * 1024 * 1024) throw new Error('Image too large (max 12MB)');
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(currentImage.type)) {
                throw new Error('Unsupported format. Use JPG, PNG, or WEBP');
            }

            console.log('Starting background removal...');
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (removeBgBtn) {
                removeBgBtn.disabled = true;
                removeBgBtn.textContent = 'Processing...';
            }

            const processedBlob = await BG_REMOVER_API.removeBg(currentImage);
            
            processedImageUrl = URL.createObjectURL(processedBlob);
            
            if (resultPreview) {
                resultPreview.innerHTML = `<img src="${processedImageUrl}" alt="Background removed" style="max-width: 100%; max-height: 300px; border-radius: var(--border-radius);">`;
            }
            
            if (downloadBtn) downloadBtn.disabled = false;

            showNotification('Background removed successfully!', 'success');

        } catch (error) {
            console.error('Background removal failed:', error);
            
            let errorMessage = 'Failed to remove background. ';
            if (error.message.includes('Network error')) errorMessage += 'Check internet connection.';
            else if (error.message.includes('API key')) errorMessage += 'Service configuration error.';
            else if (error.message.includes('large')) errorMessage += 'Image is too large.';
            else if (error.message.includes('format')) errorMessage += 'Unsupported image format.';
            else if (error.message.includes('quota')) errorMessage += 'API limit reached.';
            else errorMessage += 'Please try again with a different image.';
            
            showNotification(errorMessage, 'error');
            
            if (resultPreview) {
                resultPreview.innerHTML = '<p style="color: var(--error-color);">Failed to process image.</p>';
            }
            
        } finally {
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
    };

    function initBackgroundRemoverUI() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const selectImageBtn = document.getElementById('selectImageBtn');
        
        if (!uploadArea || !imageInput) {
            console.error('Background remover elements not found');
            return;
        }
        
        selectImageBtn?.addEventListener('click', () => {
            imageInput.value = '';
            imageInput.click();
        });
        
        uploadArea.addEventListener('click', () => {
            imageInput.value = '';
            imageInput.click();
        });
        
        imageInput.addEventListener('change', handleImageSelect);
        
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
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                handleImageFile(files[0]);
            } else {
                showNotification('Please drop a valid image file', 'error');
            }
        });
        
        const removeBgBtn = document.getElementById('removeBgBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (removeBgBtn) removeBgBtn.addEventListener('click', removeBackground);
        if (downloadBtn) downloadBtn.addEventListener('click', downloadResult);
        if (resetBtn) resetBtn.addEventListener('click', resetBgRemover);
    }

    function handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            showNotification('Please select a valid image file', 'error');
        }
    }

    function handleImageFile(file) {
        currentImage = file;
        
        const originalPreview = document.getElementById('originalPreview');
        const removeBgBtn = document.getElementById('removeBgBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const resultPreview = document.getElementById('resultPreview');
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            if (originalPreview) {
                originalPreview.innerHTML = `<img src="${e.target.result}" alt="Original image" style="max-width: 100%; max-height: 300px; border-radius: var(--border-radius);">`;
            }
            if (removeBgBtn) removeBgBtn.disabled = false;
            if (downloadBtn) downloadBtn.disabled = true;
            
            if (resultPreview) resultPreview.innerHTML = '<p>Result will appear here</p>';
            
            if (processedImageUrl) {
                URL.revokeObjectURL(processedImageUrl);
                processedImageUrl = null;
            }
        };
        
        reader.onerror = function() {
            showNotification('Error reading the image file', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    initBackgroundRemoverUI();
}

// ========== FILE CONVERTER ==========
function initFileConverter() {
    currentConverterFile = null;
    convertedFileUrl = null;

    function initFileConverterUI() {
        const converterTabs = document.querySelectorAll('.converter-tab');
        const converterSections = document.querySelectorAll('.converter-section');
        
        converterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const converterType = this.dataset.type;
                
                converterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                converterSections.forEach(section => section.classList.remove('active'));
                document.getElementById(`${converterType}-converter`).classList.add('active');
                
                resetConverter();
                checkConverterAuthState();
            });
        });
        
        initDocumentConverter();
        initImageConverter();
        checkConverterAuthState();
    }

    window.checkConverterAuthState = async function() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
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
                    } else {
                        element.disabled = false;
                        element.style.opacity = '1';
                        element.style.cursor = '';
                        element.title = '';
                    }
                }
            });
            
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
            
        } catch (error) {
            console.error('Error checking converter auth state:', error);
        }
    };

    function initDocumentConverter() {
        const documentInput = document.getElementById('documentInput');
        const selectDocumentBtn = document.getElementById('selectDocumentBtn');
        const documentUploadArea = document.getElementById('documentUploadArea');
        
        if (!documentInput || !selectDocumentBtn || !documentUploadArea) return;
        
        documentUploadArea.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
                <p>Click to select a document</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Supports: PDF, DOCX, TXT</p>
            </div>
        `;
        
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
        
        document.getElementById('convertDocumentBtn')?.addEventListener('click', convertDocument);
        document.getElementById('downloadDocumentBtn')?.addEventListener('click', downloadConvertedFile);
    }

    function initImageConverter() {
        const imageInput = document.getElementById('imageConvertInput');
        const selectImageBtn = document.getElementById('selectImageConvertBtn');
        const imageUploadArea = document.getElementById('imageUploadArea');
        const convertImageBtn = document.getElementById('convertImageBtn');
        const downloadImageBtn = document.getElementById('downloadImageBtn');
        
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
        convertImageBtn.addEventListener('click', convertImage);
        downloadImageBtn.addEventListener('click', downloadConvertedFile);
    }

    async function handleDocumentSelect(e) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to select files', 'error');
                openAuthModal();
                if (e.target && e.target.value) e.target.value = '';
                
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
                
                currentConverterFile = null;
                document.getElementById('convertDocumentBtn').disabled = true;
                return;
            }

            const file = e.target.files ? e.target.files[0] : null;
            
            if (file) {
                console.log('File selected:', file.name);
                
                currentConverterFile = file;
                
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
                
                const resultElement = document.getElementById('convertedDocumentResult');
                if (resultElement) resultElement.innerHTML = '<p>Ready to convert...</p>';
                
                document.getElementById('convertDocumentBtn').disabled = false;
                showNotification(`Document selected: ${file.name}`, 'success');
            }
        } catch (error) {
            console.error('Error in handleDocumentSelect:', error);
            showNotification('Error selecting file', 'error');
            if (e.target && e.target.value) e.target.value = '';
        }
    }

    async function handleImageConvertSelect(e) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to select files', 'error');
                openAuthModal();
                e.target.value = '';
                return;
            }

            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                currentConverterFile = file;
                
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
            showNotification('Error selecting file', 'error');
            e.target.value = '';
        }
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
            convertBtn.disabled = true;
            convertBtn.textContent = 'Converting...';
            
            const toFormat = document.getElementById('toDocumentFormat').value;
            const fromFormat = document.getElementById('fromDocumentFormat').value;
            
            if (fromFormat === toFormat) {
                convertedFileUrl = URL.createObjectURL(currentConverterFile);
                showNotification('File format unchanged', 'info');
            } else {
                const convertedBlob = await convertWithCloudConvert(currentConverterFile, toFormat);
                convertedFileUrl = URL.createObjectURL(convertedBlob);
                showNotification(`✅ Document converted to ${toFormat.toUpperCase()}!`, 'success');
            }
            
            downloadBtn.disabled = false;
            
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
            if (error.message.includes('limit')) errorMessage = 'Conversion limit reached. Try again tomorrow.';
            else if (error.message.includes('Unsupported')) errorMessage = 'This format conversion is not supported.';
            else errorMessage = error.message;
            
            showNotification(`❌ ${errorMessage}`, 'error');
            
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
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert Document';
        }
    }

    async function convertWithCloudConvert(file, toFormat) {
        console.log('Starting CloudConvert conversion...');

        try {
            const jobPayload = {
                tasks: {
                    'import-1': { operation: 'import/upload' },
                    'convert-1': {
                        operation: 'convert',
                        input: ['import-1'],
                        output_format: toFormat,
                        engine: 'libreoffice',
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
                if (jobResponse.status === 401) throw new Error('Invalid CloudConvert API key');
                if (jobResponse.status === 422) throw new Error('Invalid conversion request');
                if (jobResponse.status === 429) throw new Error('Rate limit exceeded');
                throw new Error(`API error: ${jobResponse.status}`);
            }

            const jobData = await jobResponse.json();
            const uploadTask = jobData.data.tasks.find(task => task.operation === 'import/upload');
            if (!uploadTask) throw new Error('Upload task not found');

            const uploadUrl = uploadTask.result.form.url;
            const uploadFormData = uploadTask.result.form.parameters;

            const formData = new FormData();
            for (const [key, value] of Object.entries(uploadFormData)) {
                formData.append(key, value);
            }
            formData.append('file', file);

            const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
            if (!uploadResponse.ok) throw new Error('File upload failed');

            const jobId = jobData.data.id;
            let downloadUrl = '';

            for (let i = 0; i < 90; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));

                const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` }
                });

                if (!statusResponse.ok) throw new Error('Status check failed');

                const statusData = await statusResponse.json();
                const conversionStatus = statusData.data.status;

                if (conversionStatus === 'finished') {
                    const exportTask = statusData.data.tasks.find(task => task.operation === 'export/url');
                    if (exportTask && exportTask.result?.files?.[0]) {
                        downloadUrl = exportTask.result.files[0].url;
                        break;
                    }
                } else if (conversionStatus === 'error') {
                    throw new Error('Conversion failed');
                } else if (conversionStatus === 'cancelled') {
                    throw new Error('Conversion was cancelled');
                }
            }

            if (!downloadUrl) throw new Error('Conversion timeout');

            const downloadResponse = await fetch(downloadUrl);
            if (!downloadResponse.ok) throw new Error('Download failed');

            return await downloadResponse.blob();

        } catch (error) {
            console.error('CloudConvert conversion error:', error);
            if (error.message.includes('Invalid API key')) throw new Error('Invalid CloudConvert API key');
            if (error.message.includes('insufficient credits')) throw new Error('Insufficient CloudConvert credits');
            if (error.message.includes('Unsupported format')) throw new Error(`Unsupported format for conversion to ${toFormat}`);
            if (error.message.includes('Rate limit')) throw new Error('Too many requests');
            throw new Error('Document conversion failed. Try a different file.');
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
            convertBtn.disabled = true;
            convertBtn.textContent = 'Converting...';
            
            const img = new Image();
            img.src = URL.createObjectURL(currentConverterFile);
            
            await new Promise((resolve) => { img.onload = resolve; });
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                convertedFileUrl = URL.createObjectURL(blob);
                
                const convertedPreview = document.getElementById('convertedImagePreview');
                if (convertedPreview) {
                    convertedPreview.innerHTML = `<img src="${convertedFileUrl}" alt="Converted image" style="max-width: 100%; max-height: 200px; border-radius: var(--border-radius);">`;
                }
                
                downloadBtn.disabled = false;
                loadingSpinner.style.display = 'none';
                convertBtn.disabled = false;
                convertBtn.textContent = 'Convert Image';
                
                showNotification(`Image converted to ${toFormat.toUpperCase()}!`, 'success');
            }, `image/${toFormat}`, 0.9);
            
        } catch (error) {
            console.error('Image conversion error:', error);
            showNotification('Image conversion failed', 'error');
            loadingSpinner.style.display = 'none';
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert Image';
        }
    }

    window.downloadConvertedFile = function() {
        if (!convertedFileUrl) return;
        
        const link = document.createElement('a');
        link.href = convertedFileUrl;
        
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
        
        document.querySelectorAll('#convertDocumentBtn, #convertImageBtn').forEach(btn => {
            btn.disabled = true;
        });
        
        document.querySelectorAll('#downloadDocumentBtn, #downloadImageBtn').forEach(btn => {
            btn.disabled = true;
        });
        
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
        
        const originalPreview = document.getElementById('originalImagePreview');
        if (originalPreview) originalPreview.innerHTML = '<p>Original image will appear here</p>';
        
        const convertedPreview = document.getElementById('convertedImagePreview');
        if (convertedPreview) convertedPreview.innerHTML = '<p>Result will appear here</p>';
        
        const convertedDocumentResult = document.getElementById('convertedDocumentResult');
        if (convertedDocumentResult) convertedDocumentResult.innerHTML = '<p>Converted document will appear here</p>';
    };

    initFileConverterUI();
}

// ========== DICTIONARY - DATABASE ONLY ==========
function initDictionary() {
    let speechSynthesis = window.speechSynthesis;
    let lastSearchedWord = '';
    
    const DICTIONARY_CONFIG = {
        freeApiUrl: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
        translationApi: 'https://api.mymemory.translated.net/get',
        supportedLanguages: {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
            'zh': 'Chinese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi'
        },
        
        detectLanguage(word) {
            const cleanWord = word.trim();
            if (!cleanWord) return 'en';
            
            if (/[\u4e00-\u9fff]/.test(cleanWord)) return 'zh';
            if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cleanWord)) return 'ja';
            if (/[\uAC00-\uD7AF]/.test(cleanWord)) return 'ko';
            if (/[\u0600-\u06FF]/.test(cleanWord)) return 'ar';
            if (/[\u0400-\u04FF]/.test(cleanWord)) return 'ru';
            if (/[\u0900-\u097F]/.test(cleanWord)) return 'hi';
            
            const hasEuropeanAccents = /[áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛäëïöüÄËÏÖÜãõÃÕñÑçÇ]/.test(cleanWord);
            if (hasEuropeanAccents) {
                if (/[ñÑ]/.test(cleanWord)) return 'es';
                if (/[çÇ]/.test(cleanWord)) return 'fr';
                if (/[ãõÃÕ]/.test(cleanWord)) return 'pt';
                if (/[äöüÄÖÜß]/.test(cleanWord)) return 'de';
            }
            
            return 'en';
        },
        
        async lookupWord(word) {
            try {
                const cleanWord = word.trim();
                
                try {
                    const englishResult = await this.fetchFreeDictionary(cleanWord, 'en');
                    if (englishResult?.meanings?.length > 0) {
                        englishResult.language = 'en';
                        englishResult.isTranslated = false;
                        return englishResult;
                    }
                } catch (englishError) {
                    console.log('Not found in English dictionary');
                }
                
                const detectedLang = this.detectLanguage(cleanWord);
                if (detectedLang === 'en') {
                    throw new Error(`Word "${cleanWord}" not found`);
                }
                
                const translationResult = await this.translateAndLookup(cleanWord, detectedLang);
                if (translationResult) return translationResult;
                
                throw new Error(`Could not find or translate "${cleanWord}"`);
                
            } catch (error) {
                throw new Error(error.message || 'Dictionary service unavailable');
            }
        },
        
        async fetchFreeDictionary(word, lang) {
            if (lang !== 'en') throw new Error('Free dictionary only supports English');
            
            const response = await fetch(`${this.freeApiUrl}${encodeURIComponent(word)}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Word not found');
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            const wordData = data[0];
            
            return {
                word: wordData.word,
                phonetic: wordData.phonetic || wordData.phonetics?.[0]?.text || '',
                meanings: wordData.meanings || [],
                origin: wordData.origin || '',
                language: lang,
                isTranslated: false
            };
        },
        
        async translateAndLookup(word, sourceLang) {
            try {
                const translation = await this.translateWord(word, sourceLang, 'en');
                if (!translation) throw new Error('Translation failed');
                
                let englishDefinition;
                try {
                    englishDefinition = await this.fetchFreeDictionary(translation, 'en');
                } catch (lookupError) {
                    englishDefinition = {
                        word: translation,
                        phonetic: '',
                        meanings: [{
                            partOfSpeech: 'translation',
                            definitions: [{
                                definition: `The English translation of "${word}" (${sourceLang})`,
                                example: ''
                            }]
                        }],
                        origin: `Translated from ${this.supportedLanguages[sourceLang] || sourceLang}`,
                        isTranslated: true
                    };
                }
                
                return {
                    word: word,
                    englishWord: translation,
                    phonetic: englishDefinition.phonetic || '',
                    meanings: englishDefinition.meanings || [],
                    origin: englishDefinition.origin || `Translated from ${this.supportedLanguages[sourceLang] || sourceLang}`,
                    language: sourceLang,
                    isTranslated: true,
                    translation: translation
                };
                
            } catch (error) {
                console.error('Translation and lookup error:', error);
                return null;
            }
        },
        
        async translateWord(word, fromLang, toLang) {
            try {
                const response = await fetch(
                    `${this.translationApi}?q=${encodeURIComponent(word)}&langpair=${fromLang}|${toLang}`
                );
                
                if (!response.ok) return null;
                
                const data = await response.json();
                if (data.responseData?.translatedText) {
                    let translatedText = data.responseData.translatedText.trim();
                    translatedText = translatedText.replace(/\[NOT FOUND\]/gi, '');
                    translatedText = translatedText.replace(/\s+/g, ' ').replace(/^"|"$/g, '');
                    return translatedText;
                }
                
                return null;
            } catch (error) {
                console.error('Translation error:', error);
                return null;
            }
        }
    };
    
    function displayWordData(wordData) {
        const resultsContainer = document.getElementById('dictionaryResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        const languageName = DICTIONARY_CONFIG.supportedLanguages[wordData.language] || wordData.language;
        
        const wordHeader = document.createElement('div');
        wordHeader.className = 'word-header';
        
        let headerHTML = `
            <div class="word-title">
                <h2 id="wordTitle">${wordData.word}</h2>
                <div class="word-subtitle">
        `;
        
        if (wordData.phonetic) headerHTML += `<span class="phonetic">${wordData.phonetic}</span>`;
        headerHTML += `<span class="language-badge">${languageName}</span>`;
        
        if (wordData.isTranslated && wordData.translation) {
            headerHTML += `<span class="translation-badge" title="Translated from ${languageName}">↪ ${wordData.translation}</span>`;
        }
        
        headerHTML += `</div></div>`;
        
        const canPronounce = ['en', 'es', 'fr', 'de', 'it', 'pt'].includes(wordData.language);
        if (canPronounce) headerHTML += `<button class="btn-secondary" id="pronounceBtn">🔊 Pronounce</button>`;
        
        wordHeader.innerHTML = headerHTML;
        resultsContainer.appendChild(wordHeader);
        
        if (wordData.isTranslated && wordData.translation) {
            const translationNotice = document.createElement('div');
            translationNotice.className = 'translation-notice';
            translationNotice.innerHTML = `<p><strong>Note:</strong> "${wordData.word}" is a ${languageName} word.</p>`;
            resultsContainer.appendChild(translationNotice);
        }
        
        if (wordData.meanings && wordData.meanings.length > 0) {
            const definitionsSection = document.createElement('div');
            definitionsSection.className = 'definitions-section';
            definitionsSection.innerHTML = wordData.isTranslated ? `<h3>English Definition</h3>` : `<h3>Definitions</h3>`;
            
            const definitionsList = document.createElement('div');
            definitionsList.className = 'definitions-list';
            
            wordData.meanings.forEach((meaning, index) => {
                if (!meaning.definitions || meaning.definitions.length === 0) return;
                
                const definitionItem = document.createElement('div');
                definitionItem.className = 'definition-item';
                
                let definitionHTML = `<p><strong>${meaning.partOfSpeech || 'word'}</strong> ${index + 1}. ${meaning.definitions[0].definition}</p>`;
                
                if (meaning.definitions[0].example) {
                    definitionHTML += `<p class="example"><em>Example:</em> "${meaning.definitions[0].example}"</p>`;
                }
                
                if (meaning.synonyms && meaning.synonyms.length > 0) {
                    definitionHTML += `<div class="inline-synonyms"><small><strong>Synonyms:</strong> ${meaning.synonyms.slice(0, 3).join(', ')}</small></div>`;
                }
                
                definitionItem.innerHTML = definitionHTML;
                definitionsList.appendChild(definitionItem);
            });
            
            definitionsSection.appendChild(definitionsList);
            resultsContainer.appendChild(definitionsSection);
        }
        
        if (wordData.meanings) {
            const allSynonyms = wordData.meanings.flatMap(meaning => meaning.synonyms || []);
            const uniqueSynonyms = [...new Set(allSynonyms)].slice(0, 8);
            
            if (uniqueSynonyms.length > 0) {
                const synonymsSection = document.createElement('div');
                synonymsSection.className = 'synonyms';
                synonymsSection.innerHTML = '<h3>Synonyms</h3>';
                
                const synonymsList = document.createElement('div');
                synonymsList.className = 'word-tags';
                
                uniqueSynonyms.forEach(synonym => {
                    const tag = document.createElement('span');
                    tag.className = 'word-tag';
                    tag.textContent = synonym;
                    tag.addEventListener('click', () => {
                        document.getElementById('dictionarySearch').value = synonym;
                        searchWord(synonym);
                    });
                    synonymsList.appendChild(tag);
                });
                
                synonymsSection.appendChild(synonymsList);
                resultsContainer.appendChild(synonymsSection);
            }
        }
        
        if (wordData.origin) {
            const originSection = document.createElement('div');
            originSection.className = 'word-history';
            originSection.innerHTML = wordData.isTranslated ? 
                `<h3>Translation Note</h3><div class="history-content"><p>${wordData.origin}</p></div>` :
                `<h3>Word Origin</h3><div class="history-content"><p>${wordData.origin}</p></div>`;
            resultsContainer.appendChild(originSection);
        }
        
        resultsContainer.style.display = 'block';
        
        const pronounceBtn = document.getElementById('pronounceBtn');
        if (pronounceBtn) {
            pronounceBtn.addEventListener('click', () => pronounceWord(wordData.word, wordData.language));
        }
        
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function showWordNotFound(word) {
        const resultsContainer = document.getElementById('dictionaryResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'dictionary-error';
        errorMessage.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; color: var(--text-muted); margin-bottom: 20px;">🔍</div>
                <h3 style="margin-bottom: 10px;">Word Not Found</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">
                    Could not find "<strong>${word}</strong>" in the dictionary.
                </p>
                <button class="btn-primary" id="tryEnglishBtn" style="margin-top: 20px;">
                    Try English Dictionary
                </button>
            </div>
        `;
        
        resultsContainer.appendChild(errorMessage);
        resultsContainer.style.display = 'block';
        
        document.getElementById('tryEnglishBtn').addEventListener('click', function() {
            searchWord(word);
        });
    }
    
    async function searchWord(word) {
        try {
            const loadingSpinner = document.getElementById('dictionaryLoading');
            const resultsContainer = document.getElementById('dictionaryResults');
            
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (resultsContainer) resultsContainer.style.display = 'none';
            
            hideSearchSuggestions();
            lastSearchedWord = word;
            
            const wordData = await DICTIONARY_CONFIG.lookupWord(word);
            displayWordData(wordData);
            
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) {
                addToSavedWords(wordData);
            }
            
            const langName = DICTIONARY_CONFIG.supportedLanguages[wordData.language] || wordData.language;
            showNotification(`Found: "${word}" (${langName})`, 'success');
            
        } catch (error) {
            console.error('Search error:', error);
            showWordNotFound(word);
            showNotification(error.message, 'error');
        } finally {
            const loadingSpinner = document.getElementById('dictionaryLoading');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }
    
    function pronounceWord(word = lastSearchedWord, lang = 'en') {
        if (!word) {
            showNotification('No word to pronounce', 'error');
            return;
        }
        
        try {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = DICTIONARY_CONFIG.supportedLanguages[lang] ? `${lang}-${lang.toUpperCase()}` : 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            utterance.onerror = () => {
                showNotification('Could not pronounce word', 'error');
            };
            
            speechSynthesis.speak(utterance);
            
        } catch (error) {
            console.error('Speech synthesis error:', error);
            showNotification('Speech synthesis not supported', 'error');
        }
    }
    
    function showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;
        
        try {
            const commonWords = [
                { word: 'serendipity', hint: 'happy accident' },
                { word: 'ephemeral', hint: 'short-lived' },
                { word: 'ubiquitous', hint: 'found everywhere' },
                { word: 'eloquent', hint: 'expressive speech' },
                { word: 'resilient', hint: 'able to recover' }
            ];
            
            const filteredWords = commonWords.filter(item => 
                item.word.toLowerCase().startsWith(query.toLowerCase())
            ).slice(0, 5);
            
            if (filteredWords.length > 0) {
                suggestionsContainer.innerHTML = filteredWords.map(item => `
                    <div class="suggestion-item" data-word="${item.word}">
                        <span class="suggestion-word">${item.word}</span>
                        <span class="suggestion-hint">${item.hint}</span>
                    </div>
                `).join('');
                
                suggestionsContainer.style.display = 'block';
                
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const word = item.dataset.word;
                        document.getElementById('dictionarySearch').value = word;
                        searchWord(word);
                        hideSearchSuggestions();
                    });
                });
            } else {
                hideSearchSuggestions();
            }
            
        } catch (error) {
            console.error('Suggestions error:', error);
            hideSearchSuggestions();
        }
    }
    
    function hideSearchSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
            suggestionsContainer.innerHTML = '';
        }
    }
    
    async function loadSavedWords() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            savedWords = [];
            window.savedWordsData = {};
            renderSavedWords();
            
            if (!user) return;

            const { data, error } = await window.supabaseClient
                .from('saved_words')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            savedWords = data.map(item => item.word);
            
            window.savedWordsData = {};
            data.forEach(item => {
                if (item.word_data) {
                    window.savedWordsData[item.word] = item.word_data;
                }
            });

            renderSavedWords();
            
        } catch (error) {
            console.error('Error loading saved words:', error);
            savedWords = [];
            renderSavedWords();
        }
    }

    async function addToSavedWords(wordData) {
        const word = wordData.word.toLowerCase();
        
        if (savedWords.includes(word)) return;
        
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            savedWords.unshift(word);
            
            if (savedWords.length > 20) {
                const removedWord = savedWords.pop();
                delete window.savedWordsData?.[removedWord];
            }
            
            renderSavedWords();
            
            if (user) {
                await saveWordToSupabase(user.id, word, wordData);
            }
            
            showNotification(`Added "${word}" to saved words`, 'success');
            
        } catch (error) {
            console.error('Error saving word:', error);
            showNotification('Could not save word to cloud', 'error');
        }
    }

    async function saveWordToSupabase(userId, word, wordData) {
        try {
            const { error } = await window.supabaseClient
                .from('saved_words')
                .upsert({
                    user_id: userId,
                    word: word,
                    word_data: wordData,
                    language: wordData.language || 'en'
                }, { onConflict: 'user_id,word' });

            if (error) throw error;
            
            if (!window.savedWordsData) window.savedWordsData = {};
            window.savedWordsData[word] = wordData;
            
        } catch (error) {
            console.error('Error saving word to Supabase:', error);
            throw error;
        }
    }

    window.removeSavedWord = async function(word) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            savedWords = savedWords.filter(w => w !== word);
            delete window.savedWordsData?.[word];
            renderSavedWords();
            
            if (user) {
                const { error } = await window.supabaseClient
                    .from('saved_words')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('word', word);

                if (error) throw error;
            }
            
            showNotification(`Removed "${word}" from saved words`, 'info');
            
        } catch (error) {
            console.error('Error removing word:', error);
            showNotification('Could not remove word from cloud', 'error');
        }
    };

    function renderSavedWords() {
        const savedWordsList = document.getElementById('savedWordsList');
        if (!savedWordsList) return;
        
        if (savedWords.length === 0) {
            savedWordsList.innerHTML = '<p class="empty-state">No saved words yet. Search for words to save them here!</p>';
            return;
        }
        
        savedWordsList.innerHTML = savedWords.map(word => `
            <div class="saved-word-item" data-word="${word}">
                <span class="saved-word-name">${word}</span>
                <button class="delete-saved-word" data-word="${word}" title="Remove from saved words">×</button>
            </div>
        `).join('');
        
        document.querySelectorAll('.saved-word-item').forEach(item => {
            const word = item.dataset.word;
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-saved-word')) {
                    document.getElementById('dictionarySearch').value = word;
                    searchWord(word);
                }
            });
        });
        
        document.querySelectorAll('.delete-saved-word').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const word = btn.dataset.word;
                removeSavedWord(word);
            });
        });
    }
    
    async function clearAllSavedWords() {
        if (savedWords.length === 0) return;
        
        if (!confirm('Are you sure you want to clear all saved words?')) return;
        
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            savedWords = [];
            window.savedWordsData = {};
            renderSavedWords();
            
            if (user) {
                const { error } = await window.supabaseClient
                    .from('saved_words')
                    .delete()
                    .eq('user_id', user.id);

                if (error) throw error;
            }
            
            showNotification('All saved words cleared', 'info');
            
        } catch (error) {
            console.error('Error clearing words:', error);
            showNotification('Could not clear words from cloud', 'error');
        }
    }
    
    function initDictionaryUI() {
        const searchInput = document.getElementById('dictionarySearch');
        const searchBtn = document.getElementById('searchWordBtn');
        const clearSavedBtn = document.getElementById('clearSavedWords');
        
        loadSavedWords();
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const word = searchInput.value.trim();
                if (word) searchWord(word);
                else showNotification('Please enter a word to search', 'error');
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const word = searchInput.value.trim();
                    if (word) searchWord(word);
                }
            });
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) showSearchSuggestions(query);
                else hideSearchSuggestions();
            });
            
            document.addEventListener('click', (e) => {
                const suggestionsContainer = document.getElementById('searchSuggestions');
                if (suggestionsContainer && 
                    !searchInput.contains(e.target) && 
                    !suggestionsContainer.contains(e.target)) {
                    hideSearchSuggestions();
                }
            });
        }
        
        if (clearSavedBtn) {
            clearSavedBtn.addEventListener('click', clearAllSavedWords);
        }
    }
    
    initDictionaryUI();
}

// ========== TOPIC MODAL FUNCTIONS ==========
function openAddTopicModal() {
    const modal = document.getElementById('addTopicModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        document.getElementById('topicName')?.focus();
    }
}

function closeAddTopicModal() {
    const modal = document.getElementById('addTopicModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
    
    // Clear the form
    const topicForm = document.getElementById('topicForm');
    if (topicForm) {
        topicForm.reset();
    }
}

// ========== FLASHCARDS - DATABASE ONLY ==========
function initFlashcardGenerator() {
    
    // Make createTopic function globally accessible
    window.createTopic = async function(name) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) {
                showNotification('Please log in to create topics', 'error');
                openAuthModal();
                return null;
            }
            
            const { data, error } = await window.supabaseClient
                .from('flashcard_topics')
                .insert([{ user_id: user.id, name: name.trim() }])
                .select()
                .single();
            
            if (error) throw error;
            
            const newTopic = { id: data.id, name: data.name };
            topics.push(newTopic);
            renderTopics();
            renderTopicSelect();
            
            showNotification(`Topic "${name}" created!`, 'success');
            return data.id;
            
        } catch (error) {
            console.error('Error creating topic:', error);
            showNotification('Failed to create topic', 'error');
            return null;
        }
    };
    
    async function loadFlashcardData() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            topics = [];
            manualFlashcards = [];
            renderTopics();
            renderTopicSelect();
            renderFlashcards();
            
            if (!user) return;
            
            const { data: topicsData, error: topicsError } = await window.supabaseClient
                .from('flashcard_topics')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (topicsError) throw topicsError;
            
            const { data: flashcardsData, error: flashcardsError } = await window.supabaseClient
                .from('flashcards')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (flashcardsError) throw flashcardsError;
            
            topics = topicsData.map(topic => ({ id: topic.id, name: topic.name }));
            manualFlashcards = flashcardsData.map(card => ({
                id: card.id,
                topicId: card.topic_id,
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                createdAt: card.created_at,
                lastReviewed: card.last_reviewed,
                reviewCount: card.review_count || 0
            }));
            
            renderTopics();
            renderTopicSelect();
            renderFlashcards();
            
        } catch (error) {
            console.error('Error loading flashcard data:', error);
            topics = [];
            manualFlashcards = [];
            renderTopics();
            renderTopicSelect();
            renderFlashcards();
        }
    }

    // Remove the old createTopic function from here
    // It's now defined as window.createTopic above

    async function deleteTopic(topicId) {
        if (!confirm('Delete this topic? All flashcards in it will also be deleted.')) return;
        
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            topics = topics.filter(topic => topic.id !== topicId);
            manualFlashcards = manualFlashcards.filter(card => card.topicId !== topicId);
            
            if (user) {
                const { error } = await window.supabaseClient
                    .from('flashcard_topics')
                    .delete()
                    .eq('id', topicId)
                    .eq('user_id', user.id);

                if (error) throw error;
            }
            
            renderTopics();
            renderTopicSelect();
            renderFlashcards();
            showNotification('Topic deleted', 'success');
            
        } catch (error) {
            console.error('Error deleting topic:', error);
            showNotification('Failed to delete topic', 'error');
            renderTopics();
            renderTopicSelect();
            renderFlashcards();
        }
    }

    async function createFlashcard(topicId, question, answer, difficulty) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            const newFlashcard = {
                id: Date.now(),
                topicId: parseInt(topicId),
                question: question.trim(),
                answer: answer.trim(),
                difficulty: difficulty,
                createdAt: new Date().toISOString(),
                reviewCount: 0
            };
            
            manualFlashcards.push(newFlashcard);
            renderFlashcards();
            
            if (user) {
                const { data, error } = await window.supabaseClient
                    .from('flashcards')
                    .insert([{
                        user_id: user.id,
                        topic_id: topicId,
                        question: question.trim(),
                        answer: answer.trim(),
                        difficulty: difficulty
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                newFlashcard.id = data.id;
            }
            
            showNotification('Flashcard created!', 'success');
            
        } catch (error) {
            console.error('Error creating flashcard:', error);
            showNotification('Flashcard saved locally only', 'info');
        }
    }

    async function deleteFlashcard(cardId) {
        if (!confirm('Delete this flashcard?')) return;
        
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            manualFlashcards = manualFlashcards.filter(card => card.id !== parseInt(cardId));
            renderFlashcards();
            
            if (user) {
                const { error } = await window.supabaseClient
                    .from('flashcards')
                    .delete()
                    .eq('id', cardId)
                    .eq('user_id', user.id);

                if (error) throw error;
            }
            
            showNotification('Flashcard deleted', 'success');
            
        } catch (error) {
            console.error('Error deleting flashcard:', error);
            showNotification('Failed to delete flashcard', 'error');
        }
    }

    async function updateFlashcardReview(cardId) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) return;
            
            const cardIndex = manualFlashcards.findIndex(card => card.id === parseInt(cardId));
            if (cardIndex !== -1) {
                manualFlashcards[cardIndex].lastReviewed = new Date().toISOString();
                manualFlashcards[cardIndex].reviewCount = (manualFlashcards[cardIndex].reviewCount || 0) + 1;
            }
            
            if (user) {
                await window.supabaseClient
                    .from('flashcards')
                    .update({
                        last_reviewed: new Date().toISOString(),
                        review_count: manualFlashcards[cardIndex]?.reviewCount || 1
                    })
                    .eq('id', cardId)
                    .eq('user_id', user.id);
            }
            
        } catch (error) {
            console.error('Error updating flashcard review:', error);
        }
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
        
        document.querySelectorAll('.topic-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.classList.contains('delete-topic-btn')) {
                    document.querySelectorAll('.topic-item').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    filterFlashcardsByTopic(parseInt(this.dataset.topicId));
                }
            });
        });
        
        document.querySelectorAll('.delete-topic-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteTopic(parseInt(this.dataset.topicId));
            });
        });
    }

    function renderTopicSelect() {
        const topicSelect = document.getElementById('flashcardTopic');
        if (!topicSelect) return;
        
        topicSelect.innerHTML = '<option value="">-- Select a topic --</option>' +
            topics.map(topic => `<option value="${topic.id}">${topic.name}</option>`).join('');
        
        const filterSelect = document.getElementById('filterByTopic');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">All Topics</option>' +
                topics.map(topic => `<option value="${topic.id}">${topic.name}</option>`).join('');
        }
    }

    function renderFlashcards() {
        const flashcardsGrid = document.getElementById('manualFlashcardsGrid');
        if (!flashcardsGrid) return;
        
        const topicFilter = document.getElementById('filterByTopic')?.value || 'all';
        const difficultyFilter = document.getElementById('filterByDifficulty')?.value || 'all';
        
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
        
        document.querySelectorAll('.manual-flashcard').forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('delete-flashcard-btn')) {
                    this.classList.toggle('flipped');
                    if (this.classList.contains('flipped')) {
                        updateFlashcardReview(this.dataset.cardId);
                    }
                }
            });
        });
        
        document.querySelectorAll('.delete-flashcard-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteFlashcard(this.dataset.cardId);
            });
        });
    }

    function filterFlashcardsByTopic(topicId) {
        const filterSelect = document.getElementById('filterByTopic');
        if (filterSelect) filterSelect.value = topicId;
        renderFlashcards();
    }

    function enterStudyMode() {
        const filteredFlashcards = getFilteredFlashcards();
        
        if (filteredFlashcards.length === 0) {
            showNotification('No flashcards to study', 'error');
            return;
        }
        
        currentStudyMode = true;
        currentStudyIndex = 0;
        
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
        updateStudyCard();
        
        document.getElementById('exitStudyMode').addEventListener('click', exitStudyMode);
        document.getElementById('studyFlashcard').addEventListener('click', function() {
            this.classList.toggle('flipped');
            if (this.classList.contains('flipped')) {
                const filteredFlashcards = getFilteredFlashcards();
                const currentCard = filteredFlashcards[currentStudyIndex];
                if (currentCard) updateFlashcardReview(currentCard.id);
            }
        });
        document.getElementById('prevCard').addEventListener('click', showPreviousCard);
        document.getElementById('nextCard').addEventListener('click', showNextCard);
        
        document.addEventListener('keydown', handleStudyModeKeyboard);
    }

    function exitStudyMode() {
        currentStudyMode = false;
        const studyMode = document.querySelector('.study-mode');
        if (studyMode) studyMode.remove();
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
        
        const studyFlashcard = document.getElementById('studyFlashcard');
        if (studyFlashcard) studyFlashcard.classList.remove('flipped');
        
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
            showNotification('Study session completed!', 'success');
            exitStudyMode();
        }
    }

    function handleStudyModeKeyboard(e) {
        if (!currentStudyMode) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (currentStudyIndex > 0) showPreviousCard();
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
                const studyFlashcard = document.getElementById('studyFlashcard');
                if (studyFlashcard) studyFlashcard.classList.toggle('flipped');
                break;
        }
    }

    function initFlashcardGeneratorUI() {
        loadFlashcardData();
        
        // Create topic button
        document.getElementById('createTopicBtn')?.addEventListener('click', async function() {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to create topics', 'info');
                openAuthModal();
                return;
            }
            openAddTopicModal();
        });
        
        // Flashcard form submission
        document.getElementById('manualFlashcardForm')?.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent page reload
            
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) {
                showNotification('Please log in to create flashcards', 'info');
                openAuthModal();
                return;
            }
            
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
            
            await createFlashcard(topicId, question, answer, difficulty);
            this.reset();
            document.getElementById('flashcardDifficulty').value = 'medium';
        });
        
        // Clear flashcard form
        document.getElementById('clearFlashcardForm')?.addEventListener('click', function() {
            document.getElementById('manualFlashcardForm').reset();
            document.getElementById('flashcardDifficulty').value = 'medium';
        });
        
        // Filters
        document.getElementById('filterByTopic')?.addEventListener('change', renderFlashcards);
        document.getElementById('filterByDifficulty')?.addEventListener('change', renderFlashcards);
        
        // Study mode
        document.getElementById('studyModeBtn')?.addEventListener('click', enterStudyMode);
    }

    initFlashcardGeneratorUI();
}

// ========== SEARCH ==========
function initSearch() {
    const searchData = [
        { title: 'Dashboard', section: 'dashboard', type: 'core', description: 'Main dashboard overview' },
        { title: 'To-Do List', section: 'todo', type: 'core', description: 'Manage your tasks and assignments' },
        { title: 'Pomodoro Timer', section: 'timer', type: 'core', description: 'Focus timer with work/break intervals' },
        { title: 'Quick Links', section: 'links', type: 'core', description: 'Access your frequently used links' },
        { title: 'Motivational Quotes', section: 'quotes', type: 'core', description: 'Get inspired with daily quotes' },
        { title: 'Flashcard Generator', section: 'flashcards', type: 'tool', description: 'Generate study flashcards' }, 
        { title: 'Dictionary', section: 'dictionary', type: 'tool', description: 'Look up word definitions and synonyms' },
        { title: 'File Converter', section: 'file-converter', type: 'tool', description: 'Convert between various file formats' },
        { title: 'Background Remover', section: 'bg-remover', type: 'tool', description: 'Remove Background from images' }
    ];

    function activateMobileSearch() {
        if (window.innerWidth > 768) return;
        
        isMobileSearchActive = true;
        searchBar.classList.add('active');
        document.querySelector('.search-backdrop').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }

    function deactivateMobileSearch() {
        if (window.innerWidth > 768) return;
        
        isMobileSearchActive = false;
        searchBar.classList.remove('active');
        document.querySelector('.search-backdrop').style.display = 'none';
        document.body.style.overflow = '';
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
        hideSearchResults();
        
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        
        if (window.innerWidth <= 768) {
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
                            ${result.title}
                        </div>
                        <div style="font-size: ${window.innerWidth <= 768 ? '14px' : '0.8rem'}; color: var(--text-muted);">
                            ${result.description}
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
                    if (window.innerWidth <= 768) deactivateMobileSearch();
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
        
        if (window.innerWidth <= 768) {
            document.body.appendChild(searchResults);
        } else {
            searchBar.appendChild(searchResults);
        }
    }

    function hideSearchResults() {
        const existingResults = document.querySelector('.search-results');
        if (existingResults) existingResults.remove();
    }

    searchMobileToggle.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            if (isMobileSearchActive) deactivateMobileSearch();
            else activateMobileSearch();
        }
    });

    document.querySelector('.search-backdrop').addEventListener('click', deactivateMobileSearch);

    searchInput.addEventListener('input', function(e) {
        performSearch(e.target.value);
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.trim() && window.innerWidth > 768) {
            performSearch(this.value);
        }
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth > 768) {
            if (!searchBar.contains(e.target) && !searchMobileToggle.contains(e.target)) {
                hideSearchResults();
            }
        }
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = document.querySelector('.search-result-item');
            if (firstResult) firstResult.click();
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

// ========== NAVIGATION ==========
function initNavigation() {
    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('active');
            document.querySelector('.sidebar-overlay').style.display = sidebar.classList.contains('active') ? 'block' : 'none';
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        } else {
            sidebar.classList.toggle('collapsed');
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
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
            if (targetNavItem) targetNavItem.classList.add('active');
        }
    };

    sidebarToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });

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

    document.querySelector('.sidebar-overlay').addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            this.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
                document.querySelector('.sidebar-overlay').style.display = 'none';
                document.body.style.overflow = '';
                
                if (isMobileSearchActive) {
                    deactivateMobileSearch();
                }
                
                updateMainContentMargin();
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.style.marginLeft = '0';
            }
            
            hideSearchResults();
        }, 100);
    });

    if (window.innerWidth > 768) {
        mainContent.style.marginLeft = '240px';
    } else {
        mainContent.style.marginLeft = '0';
    }
}

// ========== AUTHENTICATION ==========
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
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.getElementById('authForm')?.reset();
    };

    window.handleAuth = async function(event) {
        event.preventDefault();
        
        const isLogin = currentAuthTab === 'login';
        const email = document.getElementById(isLogin ? 'loginEmail' : 'signupEmail')?.value.trim();
        const password = document.getElementById(isLogin ? 'loginPassword' : 'signupPassword')?.value.trim();
        
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
        
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
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
        
        try {
            const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
            if (error) throw error;
            
            showNotification('Account created! Please check your email.', 'success');
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

    window.requireAuth = function(featureName = 'this feature') {
        return new Promise(async (resolve, reject) => {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) {
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
            
        } else {
            authButtons.innerHTML = `
                <button class="btn-secondary" id="loginBtn">Login</button>
                <button class="btn-primary" id="signupBtn">Sign Up</button>
            `;
            
            clearAllData();
            disableProtectedFeatures();
        }
    };

    window.clearAllData = function() {
        console.log('Clearing all user data from UI...');
        
        tasks = [];
        quickLinks = [];
        savedQuotes = [];
        savedWords = [];
        window.savedWordsData = {};
        topics = [];
        manualFlashcards = [];
        
        renderTasks();
        renderQuickLinks();
        renderSavedQuotes();
        renderSavedWords();
        renderTopics();
        renderTopicSelect();
        renderFlashcards();
    };

    window.disableProtectedFeatures = function() {
        console.log('Disabling protected features...');
        
        if (typeof checkConverterAuthState === 'function') checkConverterAuthState();

        const removeBgBtn = document.getElementById('removeBgBtn');
        if (removeBgBtn) {
            removeBgBtn.disabled = false;
            removeBgBtn.title = 'Please log in to use this feature';
            removeBgBtn.classList.add('feature-protected');
        }
        
        const protectedButtons = document.querySelectorAll('[id*="save"], [id*="add"]');
        protectedButtons.forEach(btn => {
            if (btn.id.includes('Timer')) return;
            if (btn.id === 'searchWordBtn' || btn.id === 'clearSavedWords') return;
            if (btn.id === 'newQuote' || btn.id === 'newQuoteFull') return;
            
            if (btn.id !== 'loginBtn' && btn.id !== 'signupBtn') {
                btn.disabled = true;
                btn.title = 'Please log in to use this feature';
                btn.classList.add('feature-protected');
            }
        });
    };

    window.enableProtectedFeatures = function() {
        console.log('Enabling protected features...');
        
        if (typeof checkConverterAuthState === 'function') checkConverterAuthState();

        const removeBgBtn = document.getElementById('removeBgBtn');
        if (removeBgBtn) {
            removeBgBtn.disabled = !currentImage;
            removeBgBtn.title = '';
            removeBgBtn.classList.remove('feature-protected');
        }
        
        const protectedButtons = document.querySelectorAll('[id*="save"], [id*="add"]');
        protectedButtons.forEach(btn => {
            if (btn.id !== 'loginBtn' && btn.id !== 'signupBtn' && !btn.id.includes('Timer')) {
                btn.disabled = false;
                btn.title = '';
                btn.classList.remove('feature-protected');
            }
        });
    };

    document.getElementById('authForm')?.addEventListener('submit', handleAuth);
    
    document.getElementById('closeAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('authModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeAuthModal();
    });
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentAuthTab = this.dataset.tab;
            document.getElementById('login-form').style.display = currentAuthTab === 'login' ? 'block' : 'none';
            document.getElementById('signup-form').style.display = currentAuthTab === 'signup' ? 'block' : 'none';
        });
    });
}

// ========== UTILITY FUNCTIONS ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f56565' : type === 'success' ? '#48bb78' : '#4299e1'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 3000);
}

function createMobileOverlays() {
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

function loadInitialData() {
    window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateUIForAuthState(session);
        if (session) {
            loadTasks();
            loadQuickLinks();
            loadSavedQuotes();
        }
    });
    
    updateTimerDisplay();
    loadTasks();
    loadQuickLinks();
    loadSavedQuotes();
}

// ========== MODAL FUNCTIONS ==========
function openAddTopicModal() {
    const modal = document.getElementById('addTopicModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        document.getElementById('topicName')?.focus();
    }
}

function closeAddTopicModal() {
    const modal = document.getElementById('addTopicModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    document.getElementById('topicForm')?.reset();
}

// ========== GLOBAL EVENT LISTENERS ==========
document.addEventListener('click', function(e) {
    
    // Timer buttons
    if (e.target.id === 'startTimer' || e.target.id === 'startTimerFull') startTimer();
    if (e.target.id === 'pauseTimer' || e.target.id === 'pauseTimerFull') pauseTimer();
    if (e.target.id === 'resetTimer' || e.target.id === 'resetTimerFull') resetTimer();
    
    // Todo buttons
    if (e.target.id === 'addTaskBtn' || e.target.id === 'addTaskFullBtn') openAddTaskModal();
    
    // Quick Links buttons
    if (e.target.id === 'addLinkBtn' || e.target.id === 'addLinkFullBtn') openAddLinkModal();

    if (e.target.classList.contains('delete-link-btn')) {
        const linkId = parseInt(e.target.dataset.linkId);
        deleteLink(linkId);
    }
    
    // Quote buttons
    if (e.target.id === 'newQuote' || e.target.id === 'newQuoteFull') getRandomQuote();
    if (e.target.id === 'saveQuoteBtn') saveCurrentQuote();

    if (e.target.classList.contains('delete-quote-btn')) {
        const quoteId = parseInt(e.target.dataset.quoteId);
        deleteQuote(quoteId);
    }
    
    // Modal close buttons
    if (e.target.id === 'cancelTask' || e.target.id === 'closeTaskModal') closeAddTaskModal();
    if (e.target.id === 'cancelLink' || e.target.id === 'closeLinkModal') closeAddLinkModal();
    
    // Logout button
    if (e.target.id === 'logoutBtn') logoutUser();

    if (e.target.id === 'loginBtn') openAuthModal();
    if (e.target.id === 'signupBtn') openAuthModal();

    // Handle task checkbox clicks
    if (e.target.classList.contains('task-checkbox')) {
        const taskId = parseInt(e.target.dataset.taskId);
        toggleTask(taskId);
    }
    
    // Handle delete task buttons
    if (e.target.classList.contains('delete-task')) {
        const taskId = parseInt(e.target.dataset.taskId);
        deleteTask(taskId);
    }
});

// Close modals when clicking outside
document.getElementById('addTaskModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeAddTaskModal();
});

document.getElementById('addLinkModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeAddLinkModal();
});

// ========== TOPIC MODAL FUNCTIONS ==========
function openAddTopicModal() {
    const modal = document.getElementById('addTopicModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        document.getElementById('topicName')?.focus();
    }
}

// ========== TOPIC MODAL EVENT LISTENERS ==========
// Add this at the very bottom of your JavaScript file

// Wait for DOM to be fully loaded before adding these listeners
document.addEventListener('DOMContentLoaded', function() {
    // Topic form submission - FIXED VERSION
    const topicForm = document.getElementById('topicForm');
    if (topicForm) {
        topicForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent page reload
            
            const topicName = document.getElementById('topicName')?.value.trim();
            
            if (!topicName) {
                showNotification('Please enter a topic name', 'error');
                return;
            }
            
            try {
                // Check if createTopic function exists
                if (typeof window.createTopic === 'function') {
                    await window.createTopic(topicName);
                    closeAddTopicModal();
                } else {
                    console.error('createTopic function not found');
                    showNotification('Error creating topic. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error in topic form submission:', error);
                showNotification('Failed to create topic', 'error');
            }
        });
    }
    
    // Close topic modal buttons
    document.getElementById('cancelTopic')?.addEventListener('click', closeAddTopicModal);
    document.getElementById('closeTopicModal')?.addEventListener('click', closeAddTopicModal);
    
    // Close topic modal when clicking outside
    document.getElementById('addTopicModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeAddTopicModal();
    });
});

// ========== THEME TOGGLE FUNCTIONALITY ==========
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme or default to light
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the saved theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update button icon
    updateThemeIcon(currentTheme);
    
    // Toggle theme function
    function toggleTheme() {
        if (currentTheme === 'light') {
            currentTheme = 'dark';
        } else {
            currentTheme = 'light';
        }
        
        // Apply new theme
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', currentTheme);
        
        // Update button icon
        updateThemeIcon(currentTheme);
        
        // Show feedback
        showNotification(`${currentTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
    }
    
    function updateThemeIcon(theme) {
        const lightIcon = themeToggle.querySelector('.light-icon');
        const darkIcon = themeToggle.querySelector('.dark-icon');
        
        if (theme === 'dark') {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
        } else {
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
        }
    }
    
    // Event listener for theme toggle button
    themeToggle.addEventListener('click', toggleTheme);
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
}

// ========== STUDY RESOURCES CAROUSEL ==========
function initStudyResources() {
    try {
        const tipsCarousel = document.querySelector('.tips-carousel');
        const tips = document.querySelectorAll('.tip');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.tip-prev');
        const nextBtn = document.querySelector('.tip-next');
        
        if (!tipsCarousel || tips.length === 0) {
            console.log('Study resources elements not found');
            return;
        }
        
        let currentTip = 0;
        const totalTips = tips.length;
        
        function showTip(index) {
            // Hide all tips
            tips.forEach(tip => tip.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Show current tip
            tips[index].classList.add('active');
            dots[index].classList.add('active');
            currentTip = index;
        }
        
        function nextTip() {
            currentTip = (currentTip + 1) % totalTips;
            showTip(currentTip);
        }
        
        function prevTip() {
            currentTip = (currentTip - 1 + totalTips) % totalTips;
            showTip(currentTip);
        }
        
        // Initialize first tip
        showTip(0);
        
        // Event listeners
        if (prevBtn) prevBtn.addEventListener('click', prevTip);
        if (nextBtn) nextBtn.addEventListener('click', nextTip);
        
        // Auto-advance tips every 5 seconds
        const intervalId = setInterval(nextTip, 5000);
        
        // Dot click events
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showTip(index));
        });
        
        console.log('✅ Study resources initialized');
        
    } catch (error) {
        console.error('Error initializing study resources:', error);
    }
}