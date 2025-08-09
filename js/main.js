// Persian Web Development Tutorial - Main JavaScript

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main application initialization
function initializeApp() {
    initializeTheme();
    initializeMobileMenu();
    initializeSearch();
    initializeProgress();
    initializeNavigation();
}

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.theme-toggle-icon');
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }
}

// Mobile Menu Management
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            
            // Update aria-expanded attribute
            const isOpen = sidebar.classList.contains('open');
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                    sidebar.classList.remove('open');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1024) {
                sidebar.classList.remove('open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(event) {
            const query = event.target.value.toLowerCase().trim();
            performSearch(query);
        });
        
        // Handle Enter key
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const query = event.target.value.toLowerCase().trim();
                if (query) {
                    performSearch(query);
                }
            }
        });
    }
}

function performSearch(query) {
    const navLinks = document.querySelectorAll('.nav-link');
    const navSections = document.querySelectorAll('.nav-section');
    
    if (!query) {
        // Show all items if search is empty
        navLinks.forEach(link => {
            link.style.display = 'flex';
        });
        navSections.forEach(section => {
            section.style.display = 'block';
        });
        return;
    }
    
    let hasVisibleItems = false;
    
    navSections.forEach(section => {
        let sectionHasVisibleItems = false;
        const linksInSection = section.querySelectorAll('.nav-link');
        
        linksInSection.forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes(query)) {
                link.style.display = 'flex';
                sectionHasVisibleItems = true;
                hasVisibleItems = true;
            } else {
                link.style.display = 'none';
            }
        });
        
        section.style.display = sectionHasVisibleItems ? 'block' : 'none';
    });
    
    // Show "no results" message if needed
    showSearchResults(hasVisibleItems, query);
}

function showSearchResults(hasResults, query) {
    // Remove existing search results message
    const existingMessage = document.querySelector('.search-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (!hasResults && query) {
        const sidebar = document.getElementById('sidebar');
        const message = document.createElement('div');
        message.className = 'search-results-message';
        message.style.cssText = 'padding: 1rem; text-align: center; color: var(--text-secondary);';
        message.innerHTML = `<p>نتیجه‌ای برای "${query}" یافت نشد.</p>`;
        sidebar.appendChild(message);
    }
}

// Progress Management
function initializeProgress() {
    updateProgress();
}

function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar && progressText) {
        const completedLessons = getCompletedLessons();
        const totalLessons = 20;
        const progressPercentage = (completedLessons.length / totalLessons) * 100;
        
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${convertToPersianNumbers(completedLessons.length)} از ${convertToPersianNumbers(totalLessons)} درس`;
    }
}

// Navigation Management
function initializeNavigation() {
    // Mark current page as active
    markCurrentPageActive();
    
    // Add click handlers for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Close mobile menu when navigating
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                const mobileMenuToggle = document.getElementById('mobileMenuToggle');
                if (sidebar && mobileMenuToggle) {
                    sidebar.classList.remove('open');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
}

function markCurrentPageActive() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// Utility Functions
function convertToPersianNumbers(num) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, digit => persianDigits[digit]);
}

function getCompletedLessons() {
    const completed = localStorage.getItem('completedLessons');
    return completed ? JSON.parse(completed) : [];
}

function markLessonCompleted(lessonId) {
    const completed = getCompletedLessons();
    if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        localStorage.setItem('completedLessons', JSON.stringify(completed));
        updateProgress();
    }
}

function isLessonCompleted(lessonId) {
    const completed = getCompletedLessons();
    return completed.includes(lessonId);
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Keyboard navigation support
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Escape key closes mobile menu
        if (event.key === 'Escape') {
            const sidebar = document.getElementById('sidebar');
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (mobileMenuToggle) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.focus();
                }
            }
        }
        
        // Ctrl/Cmd + K opens search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initializeSmoothScrolling();
    initializeKeyboardNavigation();
});

// Export functions for use in other modules
window.PersianWebTutorial = {
    markLessonCompleted,
    isLessonCompleted,
    updateProgress,
    convertToPersianNumbers
};

