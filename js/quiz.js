/**
 * Persian Web Development Tutorial - Quiz System
 * سیستم آزمون آموزش توسعه وب فارسی
 * 
 * Features:
 * - Multiple choice questions
 * - Code completion questions
 * - Auto-grading with immediate feedback
 * - Progress tracking with localStorage
 * - Persian RTL support
 * - Interactive explanations
 */

class PersianQuizSystem {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeStarted = null;
        this.timeLimit = null;
        this.timer = null;
        
        // Load progress from localStorage
        this.loadProgress();
        
        console.log('🎯 سیستم آزمون فارسی راه‌اندازی شد');
    }
    
    /**
     * Initialize quiz with questions
     * @param {Object} quizData - Quiz configuration and questions
     */
    initializeQuiz(quizData) {
        this.currentQuiz = quizData;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeStarted = new Date();
        this.timeLimit = quizData.timeLimit || null;
        
        console.log(`📝 آزمون "${quizData.title}" شروع شد`);
        
        // Create quiz container if it doesn't exist
        this.createQuizContainer();
        
        // Start the quiz
        this.showQuestion();
        
        // Start timer if time limit is set
        if (this.timeLimit) {
            this.startTimer();
        }
    }
    
    /**
     * Create the main quiz container
     */
    createQuizContainer() {
        let container = document.getElementById('quizContainer');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'quizContainer';
            container.className = 'quiz-container';
            
            // Find a suitable place to insert the quiz
            const content = document.querySelector('.content') || document.body;
            content.appendChild(container);
        }
        
        container.innerHTML = `
            <div class="quiz-header">
                <h2 class="quiz-title"></h2>
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="progress-text"></span>
                </div>
                <div class="quiz-timer" style="display: none;">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text"></span>
                </div>
            </div>
            
            <div class="quiz-content">
                <div class="question-container">
                    <div class="question-number"></div>
                    <div class="question-text"></div>
                    <div class="question-code" style="display: none;"></div>
                    <div class="question-image" style="display: none;"></div>
                </div>
                
                <div class="answers-container"></div>
                
                <div class="quiz-actions">
                    <button class="quiz-btn quiz-btn-secondary" id="prevBtn" disabled>
                        سوال قبلی
                    </button>
                    <button class="quiz-btn quiz-btn-primary" id="nextBtn" disabled>
                        سوال بعدی
                    </button>
                    <button class="quiz-btn quiz-btn-success" id="submitBtn" style="display: none;">
                        ارسال آزمون
                    </button>
                </div>
            </div>
            
            <div class="quiz-results" style="display: none;">
                <div class="results-header">
                    <h3>نتایج آزمون</h3>
                    <div class="final-score"></div>
                </div>
                <div class="results-details"></div>
                <div class="results-actions">
                    <button class="quiz-btn quiz-btn-primary" id="retryBtn">
                        تلاش مجدد
                    </button>
                    <button class="quiz-btn quiz-btn-secondary" id="reviewBtn">
                        مرور پاسخ‌ها
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.attachEventListeners();
    }
    
    /**
     * Attach event listeners to quiz buttons
     */
    attachEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const retryBtn = document.getElementById('retryBtn');
        const reviewBtn = document.getElementById('reviewBtn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitQuiz());
        if (retryBtn) retryBtn.addEventListener('click', () => this.retryQuiz());
        if (reviewBtn) reviewBtn.addEventListener('click', () => this.reviewAnswers());
    }
    
    /**
     * Display current question
     */
    showQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.currentQuiz.questions.length) {
            return;
        }
        
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const container = document.getElementById('quizContainer');
        
        // Update quiz title
        container.querySelector('.quiz-title').textContent = this.currentQuiz.title;
        
        // Update progress
        this.updateProgress();
        
        // Update question content
        const questionNumber = container.querySelector('.question-number');
        const questionText = container.querySelector('.question-text');
        const questionCode = container.querySelector('.question-code');
        const questionImage = container.querySelector('.question-image');
        
        questionNumber.textContent = `سوال ${this.currentQuestionIndex + 1} از ${this.currentQuiz.questions.length}`;
        questionText.innerHTML = question.question;
        
        // Show code if available
        if (question.code) {
            questionCode.style.display = 'block';
            questionCode.innerHTML = `<pre><code>${question.code}</code></pre>`;
        } else {
            questionCode.style.display = 'none';
        }
        
        // Show image if available
        if (question.image) {
            questionImage.style.display = 'block';
            questionImage.innerHTML = `<img src="${question.image}" alt="تصویر سوال" class="question-img">`;
        } else {
            questionImage.style.display = 'none';
        }
        
        // Create answer options
        this.createAnswerOptions(question);
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        console.log(`❓ نمایش سوال ${this.currentQuestionIndex + 1}: ${question.question.substring(0, 50)}...`);
    }
    
    /**
     * Create answer options based on question type
     */
    createAnswerOptions(question) {
        const answersContainer = document.querySelector('.answers-container');
        answersContainer.innerHTML = '';
        
        switch (question.type) {
            case 'multiple-choice':
                this.createMultipleChoiceOptions(question, answersContainer);
                break;
            case 'true-false':
                this.createTrueFalseOptions(question, answersContainer);
                break;
            case 'code-completion':
                this.createCodeCompletionOptions(question, answersContainer);
                break;
            case 'fill-blank':
                this.createFillBlankOptions(question, answersContainer);
                break;
            default:
                console.error('نوع سوال ناشناخته:', question.type);
        }
        
        // Restore previous answer if exists
        this.restorePreviousAnswer();
    }
    
    /**
     * Create multiple choice options
     */
    createMultipleChoiceOptions(question, container) {
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            optionElement.innerHTML = `
                <input type="radio" id="option${index}" name="answer" value="${index}">
                <label for="option${index}" class="option-label">
                    <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${option}</span>
                </label>
            `;
            
            container.appendChild(optionElement);
            
            // Add click event
            optionElement.addEventListener('click', () => {
                this.selectAnswer(index);
            });
        });
    }
    
    /**
     * Create true/false options
     */
    createTrueFalseOptions(question, container) {
        const options = ['درست', 'غلط'];
        
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            optionElement.innerHTML = `
                <input type="radio" id="option${index}" name="answer" value="${index}">
                <label for="option${index}" class="option-label">
                    <span class="option-icon">${index === 0 ? '✅' : '❌'}</span>
                    <span class="option-text">${option}</span>
                </label>
            `;
            
            container.appendChild(optionElement);
            
            optionElement.addEventListener('click', () => {
                this.selectAnswer(index);
            });
        });
    }
    
    /**
     * Create code completion options
     */
    createCodeCompletionOptions(question, container) {
        const textareaElement = document.createElement('div');
        textareaElement.className = 'code-input-container';
        textareaElement.innerHTML = `
            <label for="codeInput" class="code-label">کد خود را تکمیل کنید:</label>
            <textarea id="codeInput" class="code-input" placeholder="${question.placeholder || 'کد خود را اینجا بنویسید...'}" rows="6"></textarea>
            <div class="code-hint" style="display: ${question.hint ? 'block' : 'none'}">
                <strong>راهنمایی:</strong> ${question.hint || ''}
            </div>
        `;
        
        container.appendChild(textareaElement);
        
        // Add input event
        const codeInput = textareaElement.querySelector('#codeInput');
        codeInput.addEventListener('input', (e) => {
            this.selectAnswer(e.target.value);
        });
    }
    
    /**
     * Create fill in the blank options
     */
    createFillBlankOptions(question, container) {
        const inputElement = document.createElement('div');
        inputElement.className = 'fill-blank-container';
        inputElement.innerHTML = `
            <label for="blankInput" class="blank-label">پاسخ خود را وارد کنید:</label>
            <input type="text" id="blankInput" class="blank-input" placeholder="${question.placeholder || 'پاسخ...'}" autocomplete="off">
            <div class="blank-hint" style="display: ${question.hint ? 'block' : 'none'}">
                <strong>راهنمایی:</strong> ${question.hint || ''}
            </div>
        `;
        
        container.appendChild(inputElement);
        
        // Add input event
        const blankInput = inputElement.querySelector('#blankInput');
        blankInput.addEventListener('input', (e) => {
            this.selectAnswer(e.target.value.trim());
        });
    }
    
    /**
     * Select an answer
     */
    selectAnswer(answer) {
        this.userAnswers[this.currentQuestionIndex] = answer;
        
        // Enable next button
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (nextBtn) nextBtn.disabled = false;
        if (submitBtn && this.currentQuestionIndex === this.currentQuiz.questions.length - 1) {
            submitBtn.style.display = 'inline-block';
            if (nextBtn) nextBtn.style.display = 'none';
        }
        
        // Visual feedback for radio buttons
        const radioButtons = document.querySelectorAll('input[name="answer"]');
        radioButtons.forEach(radio => {
            if (radio.type === 'radio') {
                radio.checked = (radio.value == answer);
            }
        });
        
        console.log(`✅ پاسخ انتخاب شد: ${answer}`);
    }
    
    /**
     * Restore previous answer for current question
     */
    restorePreviousAnswer() {
        const previousAnswer = this.userAnswers[this.currentQuestionIndex];
        
        if (previousAnswer !== undefined) {
            const question = this.currentQuiz.questions[this.currentQuestionIndex];
            
            switch (question.type) {
                case 'multiple-choice':
                case 'true-false':
                    const radio = document.querySelector(`input[value="${previousAnswer}"]`);
                    if (radio) radio.checked = true;
                    break;
                case 'code-completion':
                    const codeInput = document.getElementById('codeInput');
                    if (codeInput) codeInput.value = previousAnswer;
                    break;
                case 'fill-blank':
                    const blankInput = document.getElementById('blankInput');
                    if (blankInput) blankInput.value = previousAnswer;
                    break;
            }
            
            // Enable next button if answer exists
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) nextBtn.disabled = false;
        }
    }
    
    /**
     * Go to previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }
    
    /**
     * Go to next question
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    }
    
    /**
     * Update progress bar and navigation buttons
     */
    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${this.currentQuestionIndex + 1} از ${this.currentQuiz.questions.length}`;
    }
    
    /**
     * Update navigation button states
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        // Previous button
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
        
        // Next button
        if (nextBtn) {
            const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== undefined;
            nextBtn.disabled = !hasAnswer;
            
            // Show submit button on last question
            if (this.currentQuestionIndex === this.currentQuiz.questions.length - 1) {
                nextBtn.style.display = 'none';
                if (submitBtn) {
                    submitBtn.style.display = 'inline-block';
                    submitBtn.disabled = !hasAnswer;
                }
            } else {
                nextBtn.style.display = 'inline-block';
                if (submitBtn) submitBtn.style.display = 'none';
            }
        }
    }
    
    /**
     * Start timer for timed quizzes
     */
    startTimer() {
        if (!this.timeLimit) return;
        
        const timerElement = document.querySelector('.quiz-timer');
        const timerText = document.querySelector('.timer-text');
        
        if (timerElement) timerElement.style.display = 'flex';
        
        let timeRemaining = this.timeLimit * 60; // Convert minutes to seconds
        
        this.timer = setInterval(() => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            
            if (timerText) {
                timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Change color when time is running out
            if (timeRemaining <= 60) {
                timerElement.classList.add('timer-warning');
            }
            
            if (timeRemaining <= 0) {
                this.timeUp();
                return;
            }
            
            timeRemaining--;
        }, 1000);
    }
    
    /**
     * Handle time up
     */
    timeUp() {
        clearInterval(this.timer);
        alert('⏰ زمان آزمون به پایان رسید! آزمون به صورت خودکار ارسال می‌شود.');
        this.submitQuiz();
    }
    
    /**
     * Submit quiz and calculate results
     */
    submitQuiz() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Calculate score
        this.calculateScore();
        
        // Show results
        this.showResults();
        
        // Save progress
        this.saveProgress();
        
        console.log(`📊 آزمون ارسال شد. نمره: ${this.score}/${this.currentQuiz.questions.length}`);
    }
    
    /**
     * Calculate quiz score
     */
    calculateScore() {
        this.score = 0;
        
        this.currentQuiz.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            
            if (this.isAnswerCorrect(question, userAnswer)) {
                this.score++;
            }
        });
    }
    
    /**
     * Check if answer is correct
     */
    isAnswerCorrect(question, userAnswer) {
        if (userAnswer === undefined || userAnswer === null) {
            return false;
        }
        
        switch (question.type) {
            case 'multiple-choice':
            case 'true-false':
                return userAnswer == question.correct;
            
            case 'fill-blank':
                const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
                return correctAnswers.some(correct => 
                    userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
                );
            
            case 'code-completion':
                // Simple check - can be enhanced with more sophisticated code comparison
                const userCode = userAnswer.replace(/\s+/g, ' ').trim().toLowerCase();
                const correctCode = question.correct.replace(/\s+/g, ' ').trim().toLowerCase();
                return userCode.includes(correctCode) || userCode === correctCode;
            
            default:
                return false;
        }
    }
    
    /**
     * Show quiz results
     */
    showResults() {
        const quizContent = document.querySelector('.quiz-content');
        const quizResults = document.querySelector('.quiz-results');
        const finalScore = document.querySelector('.final-score');
        const resultsDetails = document.querySelector('.results-details');
        
        if (quizContent) quizContent.style.display = 'none';
        if (quizResults) quizResults.style.display = 'block';
        
        // Calculate percentage
        const percentage = Math.round((this.score / this.currentQuiz.questions.length) * 100);
        
        // Determine grade
        let grade, gradeClass, gradeEmoji;
        if (percentage >= 90) {
            grade = 'عالی';
            gradeClass = 'grade-excellent';
            gradeEmoji = '🏆';
        } else if (percentage >= 80) {
            grade = 'خوب';
            gradeClass = 'grade-good';
            gradeEmoji = '👍';
        } else if (percentage >= 70) {
            grade = 'متوسط';
            gradeClass = 'grade-average';
            gradeEmoji = '👌';
        } else if (percentage >= 60) {
            grade = 'قابل قبول';
            gradeClass = 'grade-pass';
            gradeEmoji = '✅';
        } else {
            grade = 'نیاز به تمرین بیشتر';
            gradeClass = 'grade-fail';
            gradeEmoji = '📚';
        }
        
        // Show final score
        if (finalScore) {
            finalScore.innerHTML = `
                <div class="score-display ${gradeClass}">
                    <div class="score-emoji">${gradeEmoji}</div>
                    <div class="score-number">${this.score}/${this.currentQuiz.questions.length}</div>
                    <div class="score-percentage">${percentage}%</div>
                    <div class="score-grade">${grade}</div>
                </div>
            `;
        }
        
        // Show detailed results
        if (resultsDetails) {
            let detailsHTML = '<div class="results-breakdown">';
            
            this.currentQuiz.questions.forEach((question, index) => {
                const userAnswer = this.userAnswers[index];
                const isCorrect = this.isAnswerCorrect(question, userAnswer);
                
                detailsHTML += `
                    <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                        <div class="result-header">
                            <span class="result-icon">${isCorrect ? '✅' : '❌'}</span>
                            <span class="result-question">سوال ${index + 1}</span>
                        </div>
                        <div class="result-content">
                            <div class="result-question-text">${question.question}</div>
                            ${this.getAnswerDisplay(question, userAnswer, isCorrect)}
                            ${question.explanation ? `<div class="result-explanation"><strong>توضیح:</strong> ${question.explanation}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            detailsHTML += '</div>';
            resultsDetails.innerHTML = detailsHTML;
        }
        
        // Calculate time taken
        const timeElapsed = Math.round((new Date() - this.timeStarted) / 1000 / 60);
        console.log(`⏱️ زمان صرف شده: ${timeElapsed} دقیقه`);
    }
    
    /**
     * Get answer display for results
     */
    getAnswerDisplay(question, userAnswer, isCorrect) {
        let display = '';
        
        switch (question.type) {
            case 'multiple-choice':
                const userOption = userAnswer !== undefined ? question.options[userAnswer] : 'پاسخ داده نشده';
                const correctOption = question.options[question.correct];
                
                display = `
                    <div class="answer-display">
                        <div class="user-answer">پاسخ شما: ${userOption}</div>
                        ${!isCorrect ? `<div class="correct-answer">پاسخ صحیح: ${correctOption}</div>` : ''}
                    </div>
                `;
                break;
                
            case 'true-false':
                const userTF = userAnswer !== undefined ? (userAnswer == 0 ? 'درست' : 'غلط') : 'پاسخ داده نشده';
                const correctTF = question.correct == 0 ? 'درست' : 'غلط';
                
                display = `
                    <div class="answer-display">
                        <div class="user-answer">پاسخ شما: ${userTF}</div>
                        ${!isCorrect ? `<div class="correct-answer">پاسخ صحیح: ${correctTF}</div>` : ''}
                    </div>
                `;
                break;
                
            case 'fill-blank':
            case 'code-completion':
                const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
                
                display = `
                    <div class="answer-display">
                        <div class="user-answer">پاسخ شما: ${userAnswer || 'پاسخ داده نشده'}</div>
                        ${!isCorrect ? `<div class="correct-answer">پاسخ صحیح: ${correctAnswers.join(' یا ')}</div>` : ''}
                    </div>
                `;
                break;
        }
        
        return display;
    }
    
    /**
     * Retry quiz
     */
    retryQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timeStarted = new Date();
        
        // Hide results and show quiz content
        const quizContent = document.querySelector('.quiz-content');
        const quizResults = document.querySelector('.quiz-results');
        
        if (quizContent) quizContent.style.display = 'block';
        if (quizResults) quizResults.style.display = 'none';
        
        // Restart timer if needed
        if (this.timeLimit) {
            this.startTimer();
        }
        
        // Show first question
        this.showQuestion();
        
        console.log('🔄 آزمون مجدداً شروع شد');
    }
    
    /**
     * Review answers
     */
    reviewAnswers() {
        // Implementation for reviewing answers
        // This could open a detailed review modal or navigate through questions in review mode
        console.log('👀 مرور پاسخ‌ها');
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        const progressData = {
            quizId: this.currentQuiz.id,
            score: this.score,
            totalQuestions: this.currentQuiz.questions.length,
            percentage: Math.round((this.score / this.currentQuiz.questions.length) * 100),
            completedAt: new Date().toISOString(),
            timeElapsed: Math.round((new Date() - this.timeStarted) / 1000 / 60)
        };
        
        // Get existing progress
        const existingProgress = JSON.parse(localStorage.getItem('persianWebTutorial_quizProgress') || '{}');
        
        // Update progress for this quiz
        existingProgress[this.currentQuiz.id] = progressData;
        
        // Save back to localStorage
        localStorage.setItem('persianWebTutorial_quizProgress', JSON.stringify(existingProgress));
        
        console.log('💾 پیشرفت ذخیره شد:', progressData);
    }
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const progress = JSON.parse(localStorage.getItem('persianWebTutorial_quizProgress') || '{}');
            this.progress = progress;
            console.log('📂 پیشرفت بارگذاری شد:', Object.keys(progress).length, 'آزمون');
        } catch (error) {
            console.error('خطا در بارگذاری پیشرفت:', error);
            this.progress = {};
        }
    }
    
    /**
     * Get progress for a specific quiz
     */
    getQuizProgress(quizId) {
        return this.progress[quizId] || null;
    }
    
    /**
     * Get overall progress statistics
     */
    getOverallProgress() {
        const quizzes = Object.values(this.progress);
        
        if (quizzes.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                totalTime: 0
            };
        }
        
        const totalScore = quizzes.reduce((sum, quiz) => sum + quiz.percentage, 0);
        const totalTime = quizzes.reduce((sum, quiz) => sum + quiz.timeElapsed, 0);
        
        return {
            totalQuizzes: quizzes.length,
            averageScore: Math.round(totalScore / quizzes.length),
            totalTime: totalTime
        };
    }
}

// Sample quiz data for testing
const sampleQuizzes = {
    html_basics: {
        id: 'html_basics',
        title: 'آزمون مقدمات HTML',
        description: 'آزمون مفاهیم پایه HTML',
        timeLimit: 10, // minutes
        questions: [
            {
                type: 'multiple-choice',
                question: 'HTML مخفف چه عبارتی است؟',
                options: [
                    'HyperText Markup Language',
                    'High Tech Modern Language',
                    'Home Tool Markup Language',
                    'Hyperlink and Text Markup Language'
                ],
                correct: 0,
                explanation: 'HTML مخفف HyperText Markup Language است که زبان نشانه‌گذاری برای ایجاد صفحات وب می‌باشد.'
            },
            {
                type: 'true-false',
                question: 'تگ <br> نیاز به تگ بسته شونده دارد.',
                correct: 1, // false
                explanation: 'تگ <br> یک تگ خودبسته است و نیاز به تگ بسته شونده ندارد.'
            },
            {
                type: 'fill-blank',
                question: 'برای ایجاد لینک در HTML از تگ _____ استفاده می‌کنیم.',
                correct: ['a', '<a>', 'anchor'],
                placeholder: 'نام تگ را وارد کنید',
                explanation: 'برای ایجاد لینک از تگ <a> (anchor) استفاده می‌کنیم.'
            },
            {
                type: 'code-completion',
                question: 'کد HTML زیر را تکمیل کنید تا یک عنوان اصلی ایجاد شود:',
                code: '<___>عنوان صفحه</___>',
                correct: 'h1',
                placeholder: 'تگ مناسب را وارد کنید',
                hint: 'برای عنوان اصلی از تگ h1 استفاده کنید',
                explanation: 'برای عنوان اصلی صفحه از تگ <h1> استفاده می‌کنیم.'
            }
        ]
    },
    
    css_basics: {
        id: 'css_basics',
        title: 'آزمون مقدمات CSS',
        description: 'آزمون مفاهیم پایه CSS',
        timeLimit: 15,
        questions: [
            {
                type: 'multiple-choice',
                question: 'کدام ویژگی CSS برای تغییر رنگ متن استفاده می‌شود؟',
                options: [
                    'background-color',
                    'color',
                    'text-color',
                    'font-color'
                ],
                correct: 1,
                explanation: 'ویژگی color برای تغییر رنگ متن استفاده می‌شود.'
            },
            {
                type: 'true-false',
                question: 'CSS مخفف Cascading Style Sheets است.',
                correct: 0, // true
                explanation: 'بله، CSS مخفف Cascading Style Sheets است.'
            }
        ]
    },
    
    javascript_basics: {
        id: 'javascript_basics',
        title: 'آزمون مقدمات JavaScript',
        description: 'آزمون مفاهیم پایه JavaScript',
        timeLimit: 20,
        questions: [
            {
                type: 'multiple-choice',
                question: 'کدام کلمه کلیدی برای تعریف متغیر در JavaScript استفاده می‌شود؟',
                options: [
                    'variable',
                    'var',
                    'define',
                    'set'
                ],
                correct: 1,
                explanation: 'از کلمه کلیدی var (یا let و const) برای تعریف متغیر استفاده می‌شود.'
            },
            {
                type: 'code-completion',
                question: 'کد JavaScript زیر را تکمیل کنید:',
                code: 'console.___("Hello World");',
                correct: 'log',
                explanation: 'برای نمایش پیام در کنسول از console.log() استفاده می‌کنیم.'
            }
        ]
    }
};

// Initialize global quiz system
window.PersianQuizSystem = PersianQuizSystem;
window.sampleQuizzes = sampleQuizzes;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.quizSystem = new PersianQuizSystem();
    });
} else {
    window.quizSystem = new PersianQuizSystem();
}

console.log('🎯 سیستم آزمون فارسی آماده است');

