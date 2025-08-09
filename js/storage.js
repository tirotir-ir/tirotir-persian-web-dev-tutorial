// Persian Web Development Tutorial - Storage Management

// Storage keys
const STORAGE_KEYS = {
    THEME: 'theme',
    COMPLETED_LESSONS: 'completedLessons',
    QUIZ_SCORES: 'quizScores',
    USER_PROGRESS: 'userProgress',
    LESSON_NOTES: 'lessonNotes',
    BOOKMARKS: 'bookmarks',
    SETTINGS: 'settings'
};

// Storage Manager Class
class StorageManager {
    constructor() {
        this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    }

    // Check if localStorage is available
    checkLocalStorageAvailability() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    // Generic get method
    get(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    }

    // Generic set method
    set(key, value) {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    }

    // Remove item
    remove(key) {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }

    // Clear all storage
    clear() {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }

    // Theme Management
    getTheme() {
        return this.get(STORAGE_KEYS.THEME, 'light');
    }

    setTheme(theme) {
        return this.set(STORAGE_KEYS.THEME, theme);
    }

    // Lesson Progress Management
    getCompletedLessons() {
        return this.get(STORAGE_KEYS.COMPLETED_LESSONS, []);
    }

    markLessonCompleted(lessonId) {
        const completed = this.getCompletedLessons();
        if (!completed.includes(lessonId)) {
            completed.push(lessonId);
            this.set(STORAGE_KEYS.COMPLETED_LESSONS, completed);
            this.updateUserProgress();
        }
        return true;
    }

    markLessonIncomplete(lessonId) {
        const completed = this.getCompletedLessons();
        const index = completed.indexOf(lessonId);
        if (index > -1) {
            completed.splice(index, 1);
            this.set(STORAGE_KEYS.COMPLETED_LESSONS, completed);
            this.updateUserProgress();
        }
        return true;
    }

    isLessonCompleted(lessonId) {
        const completed = this.getCompletedLessons();
        return completed.includes(lessonId);
    }

    // Quiz Scores Management
    getQuizScores() {
        return this.get(STORAGE_KEYS.QUIZ_SCORES, {});
    }

    saveQuizScore(lessonId, score, totalQuestions, timeSpent = null) {
        const scores = this.getQuizScores();
        scores[lessonId] = {
            score: score,
            totalQuestions: totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            timeSpent: timeSpent,
            completedAt: new Date().toISOString()
        };
        this.set(STORAGE_KEYS.QUIZ_SCORES, scores);
        
        // Mark lesson as completed if score is above 70%
        if (scores[lessonId].percentage >= 70) {
            this.markLessonCompleted(lessonId);
        }
        
        return scores[lessonId];
    }

    getQuizScore(lessonId) {
        const scores = this.getQuizScores();
        return scores[lessonId] || null;
    }

    // User Progress Management
    getUserProgress() {
        return this.get(STORAGE_KEYS.USER_PROGRESS, {
            totalLessons: 20,
            completedLessons: 0,
            averageQuizScore: 0,
            totalTimeSpent: 0,
            lastActiveDate: null,
            startDate: null
        });
    }

    updateUserProgress() {
        const progress = this.getUserProgress();
        const completedLessons = this.getCompletedLessons();
        const quizScores = this.getQuizScores();
        
        // Update basic stats
        progress.completedLessons = completedLessons.length;
        progress.lastActiveDate = new Date().toISOString();
        
        // Set start date if this is the first lesson
        if (progress.completedLessons === 1 && !progress.startDate) {
            progress.startDate = new Date().toISOString();
        }
        
        // Calculate average quiz score
        const scores = Object.values(quizScores);
        if (scores.length > 0) {
            const totalPercentage = scores.reduce((sum, score) => sum + score.percentage, 0);
            progress.averageQuizScore = Math.round(totalPercentage / scores.length);
        }
        
        // Calculate total time spent
        const totalTime = scores.reduce((sum, score) => sum + (score.timeSpent || 0), 0);
        progress.totalTimeSpent = totalTime;
        
        this.set(STORAGE_KEYS.USER_PROGRESS, progress);
        return progress;
    }

    // Lesson Notes Management
    getLessonNotes() {
        return this.get(STORAGE_KEYS.LESSON_NOTES, {});
    }

    saveLessonNote(lessonId, note) {
        const notes = this.getLessonNotes();
        notes[lessonId] = {
            content: note,
            updatedAt: new Date().toISOString()
        };
        return this.set(STORAGE_KEYS.LESSON_NOTES, notes);
    }

    getLessonNote(lessonId) {
        const notes = this.getLessonNotes();
        return notes[lessonId] || null;
    }

    deleteLessonNote(lessonId) {
        const notes = this.getLessonNotes();
        delete notes[lessonId];
        return this.set(STORAGE_KEYS.LESSON_NOTES, notes);
    }

    // Bookmarks Management
    getBookmarks() {
        return this.get(STORAGE_KEYS.BOOKMARKS, []);
    }

    addBookmark(lessonId, title, url) {
        const bookmarks = this.getBookmarks();
        const bookmark = {
            id: lessonId,
            title: title,
            url: url,
            addedAt: new Date().toISOString()
        };
        
        // Check if bookmark already exists
        const existingIndex = bookmarks.findIndex(b => b.id === lessonId);
        if (existingIndex > -1) {
            bookmarks[existingIndex] = bookmark;
        } else {
            bookmarks.push(bookmark);
        }
        
        return this.set(STORAGE_KEYS.BOOKMARKS, bookmarks);
    }

    removeBookmark(lessonId) {
        const bookmarks = this.getBookmarks();
        const filteredBookmarks = bookmarks.filter(b => b.id !== lessonId);
        return this.set(STORAGE_KEYS.BOOKMARKS, filteredBookmarks);
    }

    isBookmarked(lessonId) {
        const bookmarks = this.getBookmarks();
        return bookmarks.some(b => b.id === lessonId);
    }

    // Settings Management
    getSettings() {
        return this.get(STORAGE_KEYS.SETTINGS, {
            fontSize: 'medium',
            autoSave: true,
            showHints: true,
            soundEnabled: false,
            animationsEnabled: true,
            language: 'fa'
        });
    }

    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        return this.set(STORAGE_KEYS.SETTINGS, updatedSettings);
    }

    getSetting(key) {
        const settings = this.getSettings();
        return settings[key];
    }

    setSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.set(STORAGE_KEYS.SETTINGS, settings);
    }

    // Data Export/Import
    exportData() {
        const data = {
            theme: this.getTheme(),
            completedLessons: this.getCompletedLessons(),
            quizScores: this.getQuizScores(),
            userProgress: this.getUserProgress(),
            lessonNotes: this.getLessonNotes(),
            bookmarks: this.getBookmarks(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.exportDate) {
                throw new Error('Invalid data format');
            }
            
            // Import each section
            if (data.theme) this.setTheme(data.theme);
            if (data.completedLessons) this.set(STORAGE_KEYS.COMPLETED_LESSONS, data.completedLessons);
            if (data.quizScores) this.set(STORAGE_KEYS.QUIZ_SCORES, data.quizScores);
            if (data.userProgress) this.set(STORAGE_KEYS.USER_PROGRESS, data.userProgress);
            if (data.lessonNotes) this.set(STORAGE_KEYS.LESSON_NOTES, data.lessonNotes);
            if (data.bookmarks) this.set(STORAGE_KEYS.BOOKMARKS, data.bookmarks);
            if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
            
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }

    // Reset all data
    resetAllData() {
        const keys = Object.values(STORAGE_KEYS);
        keys.forEach(key => this.remove(key));
        return true;
    }

    // Get storage usage info
    getStorageInfo() {
        if (!this.isLocalStorageAvailable) {
            return { available: false };
        }

        let totalSize = 0;
        const keys = Object.values(STORAGE_KEYS);
        
        keys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length;
            }
        });

        return {
            available: true,
            totalSize: totalSize,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
            itemCount: keys.filter(key => localStorage.getItem(key)).length
        };
    }
}

// Create global storage manager instance
const storage = new StorageManager();

// Export for use in other modules
window.PersianWebTutorialStorage = storage;

// Backward compatibility
window.storage = storage;

