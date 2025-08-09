// Persian Web Development Tutorial - Interactive Code Editor

class CodeEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            theme: 'default',
            mode: 'htmlmixed',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            autoRefresh: true,
            direction: 'ltr',
            ...options
        };
        
        this.editors = {};
        this.previewFrame = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Editor container not found');
            return;
        }

        this.createEditorLayout();
        this.initializeEditors();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    createEditorLayout() {
        this.container.innerHTML = `
            <div class="code-editor-container">
                <div class="editor-tabs">
                    <button class="tab-button active" data-tab="html">
                        <span class="tab-icon">📄</span>
                        <span class="tab-text">HTML</span>
                    </button>
                    <button class="tab-button" data-tab="css">
                        <span class="tab-icon">🎨</span>
                        <span class="tab-text">CSS</span>
                    </button>
                    <button class="tab-button" data-tab="js">
                        <span class="tab-icon">⚡</span>
                        <span class="tab-text">JavaScript</span>
                    </button>
                    <div class="editor-controls">
                        <button class="control-button" id="runCode" title="اجرای کد">
                            <span>▶️</span>
                        </button>
                        <button class="control-button" id="resetCode" title="بازنشانی">
                            <span>🔄</span>
                        </button>
                        <button class="control-button" id="fullscreen" title="تمام صفحه">
                            <span>⛶</span>
                        </button>
                    </div>
                </div>
                
                <div class="editor-content">
                    <div class="editor-panes">
                        <div class="editor-pane">
                            <div class="editor-header">
                                <span class="editor-title">ویرایشگر کد</span>
                                <div class="editor-info">
                                    <span id="cursorPosition">خط 1، ستون 1</span>
                                </div>
                            </div>
                            <div class="editor-tabs-content">
                                <div class="tab-content active" id="html-tab">
                                    <textarea id="htmlEditor" placeholder="کد HTML خود را اینجا بنویسید..."></textarea>
                                </div>
                                <div class="tab-content" id="css-tab">
                                    <textarea id="cssEditor" placeholder="کد CSS خود را اینجا بنویسید..."></textarea>
                                </div>
                                <div class="tab-content" id="js-tab">
                                    <textarea id="jsEditor" placeholder="کد JavaScript خود را اینجا بنویسید..."></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div class="preview-pane">
                            <div class="preview-header">
                                <span class="preview-title">نمایش زنده</span>
                                <div class="preview-controls">
                                    <button class="preview-control" id="refreshPreview" title="بروزرسانی">
                                        🔄
                                    </button>
                                    <button class="preview-control" id="openInNewTab" title="باز کردن در تب جدید">
                                        🔗
                                    </button>
                                </div>
                            </div>
                            <div class="preview-content">
                                <iframe id="previewFrame" sandbox="allow-scripts allow-same-origin"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.previewFrame = document.getElementById('previewFrame');
    }

    initializeEditors() {
        // Initialize HTML Editor
        this.editors.html = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
            mode: 'htmlmixed',
            theme: this.getTheme(),
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            direction: 'ltr'
        });

        // Initialize CSS Editor
        this.editors.css = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
            mode: 'css',
            theme: this.getTheme(),
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            direction: 'ltr'
        });

        // Initialize JavaScript Editor
        this.editors.js = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
            mode: 'javascript',
            theme: this.getTheme(),
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            direction: 'ltr'
        });

        // Set up change listeners
        Object.keys(this.editors).forEach(key => {
            this.editors[key].on('change', () => {
                this.updatePreview();
                this.updateCursorPosition();
            });

            this.editors[key].on('cursorActivity', () => {
                this.updateCursorPosition();
            });
        });

        // Set initial content if provided
        if (this.options.initialContent) {
            this.setContent(this.options.initialContent);
        }

        // Initial preview update
        this.updatePreview();
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-button').dataset.tab);
            });
        });

        // Control buttons
        document.getElementById('runCode')?.addEventListener('click', () => {
            this.runCode();
        });

        document.getElementById('resetCode')?.addEventListener('click', () => {
            this.resetCode();
        });

        document.getElementById('fullscreen')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('refreshPreview')?.addEventListener('click', () => {
            this.updatePreview();
        });

        document.getElementById('openInNewTab')?.addEventListener('click', () => {
            this.openInNewTab();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.runCode();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetCode();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveCode();
                        break;
                }
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            }
        });

        // Update tab content
        const tabContents = this.container.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });

        // Refresh the active editor
        if (this.editors[tabName]) {
            setTimeout(() => {
                this.editors[tabName].refresh();
                this.editors[tabName].focus();
            }, 100);
        }

        this.updateCursorPosition();
    }

    getActiveEditor() {
        const activeTab = this.container.querySelector('.tab-button.active');
        if (activeTab) {
            return this.editors[activeTab.dataset.tab];
        }
        return this.editors.html;
    }

    updatePreview() {
        const html = this.editors.html.getValue();
        const css = this.editors.css.getValue();
        const js = this.editors.js.getValue();

        const previewContent = this.generatePreviewHTML(html, css, js);
        
        // Update iframe content
        const iframe = this.previewFrame;
        iframe.srcdoc = previewContent;
    }

    generatePreviewHTML(html, css, js) {
        return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نمایش زنده</title>
    <style>
        body {
            font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #333333;
        }
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        try {
            ${js}
        } catch (error) {
            console.error('JavaScript Error:', error);
            document.body.innerHTML += '<div style="background: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #ef5350;">خطا در JavaScript: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;
    }

    runCode() {
        this.updatePreview();
        
        // Add visual feedback
        const runButton = document.getElementById('runCode');
        if (runButton) {
            runButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                runButton.style.transform = 'scale(1)';
            }, 150);
        }
    }

    resetCode() {
        if (confirm('آیا مطمئن هستید که می‌خواهید کد را بازنشانی کنید؟')) {
            this.editors.html.setValue('');
            this.editors.css.setValue('');
            this.editors.js.setValue('');
            this.updatePreview();
        }
    }

    saveCode() {
        const code = this.getContent();
        const blob = new Blob([JSON.stringify(code, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    loadCode(codeData) {
        if (codeData.html !== undefined) this.editors.html.setValue(codeData.html);
        if (codeData.css !== undefined) this.editors.css.setValue(codeData.css);
        if (codeData.js !== undefined) this.editors.js.setValue(codeData.js);
        this.updatePreview();
    }

    getContent() {
        return {
            html: this.editors.html.getValue(),
            css: this.editors.css.getValue(),
            js: this.editors.js.getValue()
        };
    }

    setContent(content) {
        if (content.html) this.editors.html.setValue(content.html);
        if (content.css) this.editors.css.setValue(content.css);
        if (content.js) this.editors.js.setValue(content.js);
        this.updatePreview();
    }

    updateCursorPosition() {
        const editor = this.getActiveEditor();
        if (editor) {
            const cursor = editor.getCursor();
            const positionElement = document.getElementById('cursorPosition');
            if (positionElement) {
                positionElement.textContent = `خط ${cursor.line + 1}، ستون ${cursor.ch + 1}`;
            }
        }
    }

    getTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        return currentTheme === 'dark' ? 'monokai' : 'default';
    }

    updateTheme() {
        const theme = this.getTheme();
        Object.keys(this.editors).forEach(key => {
            this.editors[key].setOption('theme', theme);
        });
    }

    toggleFullscreen() {
        this.container.classList.toggle('fullscreen');
        
        // Refresh editors after fullscreen toggle
        setTimeout(() => {
            Object.keys(this.editors).forEach(key => {
                this.editors[key].refresh();
            });
        }, 100);
    }

    openInNewTab() {
        const content = this.generatePreviewHTML(
            this.editors.html.getValue(),
            this.editors.css.getValue(),
            this.editors.js.getValue()
        );
        
        const newWindow = window.open();
        newWindow.document.write(content);
        newWindow.document.close();
    }

    destroy() {
        Object.keys(this.editors).forEach(key => {
            this.editors[key].toTextArea();
        });
        this.container.innerHTML = '';
        this.isInitialized = false;
    }
}

// Export for global use
window.CodeEditor = CodeEditor;

