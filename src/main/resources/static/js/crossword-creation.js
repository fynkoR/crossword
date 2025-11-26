// Управление экраном создания кроссворда
class CrosswordCreationManager {
    constructor() {
        this.selectedDictionaryId = null;
        this.init();
    }

    init() {
        // Кнопка назад
        document.getElementById('back-from-creation').addEventListener('click', () => {
            this.showDashboard();
        });

        // Обработчик выбора словаря
        const dictionarySelect = document.getElementById('creation-dictionary-select');
        dictionarySelect.addEventListener('change', (e) => {
            const dictionaryId = e.target.value;
            if (dictionaryId) {
                this.onDictionarySelected(parseInt(dictionaryId));
            } else {
                this.resetModeSelect();
            }
        });

        // Обработчик выбора режима
        const modeSelect = document.getElementById('creation-mode-select');
        modeSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            if (mode === 'auto') {
                this.showAutoModeSettings(this.selectedDictionaryId);
            } else if (mode === 'manual') {
                this.showManualMode(this.selectedDictionaryId);
            } else {
                document.getElementById('creation-auto-mode-settings').style.display = 'none';
                document.getElementById('create-crossword-btn').disabled = true;
            }
        });

        // Обработчик изменения количества слов
        const wordCountSelect = document.getElementById('creation-word-count-select');
        wordCountSelect.addEventListener('change', (e) => {
            const wordCount = parseInt(e.target.value);
            if (wordCount) {
                this.checkVariantForWordCount(this.selectedDictionaryId, wordCount);
            } else {
                document.getElementById('creation-variants-status').innerHTML = '';
                document.getElementById('create-crossword-btn').disabled = true;
            }
        });

        // Кнопка создания кроссворда
        document.getElementById('create-crossword-btn').addEventListener('click', () => {
            this.createCrossword();
        });
    }

    async show() {
        document.getElementById('crossword-creation-screen').classList.add('active');
        await this.loadDictionaries();
    }

    async loadDictionaries() {
        try {
            const dictionaries = await ApiService.getDictionaries();
            const select = document.getElementById('creation-dictionary-select');
            
            select.innerHTML = '<option value="">Выберите словарь...</option>';
            
            dictionaries.forEach(dict => {
                const option = document.createElement('option');
                option.value = dict.id;
                option.textContent = `${dict.title} (${dict.description || 'без описания'})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка загрузки словарей:', error);
            document.getElementById('creation-dictionary-select').innerHTML = 
                '<option value="">Ошибка загрузки словарей</option>';
        }
    }

    onDictionarySelected(dictionaryId) {
        this.selectedDictionaryId = dictionaryId;
        const modeSelect = document.getElementById('creation-mode-select');
        modeSelect.disabled = false;
        modeSelect.value = '';
        document.getElementById('creation-auto-mode-settings').style.display = 'none';
        document.getElementById('create-crossword-btn').disabled = true;
    }

    resetModeSelect() {
        const modeSelect = document.getElementById('creation-mode-select');
        modeSelect.disabled = true;
        modeSelect.value = '';
        document.getElementById('creation-auto-mode-settings').style.display = 'none';
        document.getElementById('create-crossword-btn').disabled = true;
        this.selectedDictionaryId = null;
    }

    showAutoModeSettings(dictionaryId) {
        const autoModeSettings = document.getElementById('creation-auto-mode-settings');
        const wordCountSelect = document.getElementById('creation-word-count-select');
        const statusDiv = document.getElementById('creation-variants-status');
        
        autoModeSettings.style.display = 'block';
        wordCountSelect.disabled = false;
        wordCountSelect.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Выберите количество слов';
        defaultOption.selected = true;
        wordCountSelect.appendChild(defaultOption);
        
        for (let count = 3; count <= 10; count++) {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = `${count} ${this.getWordForm(count)}`;
            wordCountSelect.appendChild(option);
        }
        
        statusDiv.innerHTML = '';
        document.getElementById('create-crossword-btn').disabled = true;
    }

    showManualMode(dictionaryId) {
        document.getElementById('creation-auto-mode-settings').style.display = 'none';
        document.getElementById('create-crossword-btn').disabled = true;
        
        // Переходим к экрану ручного составления
        document.getElementById('crossword-creation-screen').classList.remove('active');
        document.getElementById('manual-crossword-screen').classList.add('active');
        
        if (typeof manualCrosswordManager !== 'undefined') {
            manualCrosswordManager.start(dictionaryId);
        }
    }

    async checkVariantForWordCount(dictionaryId, wordCount) {
        const statusDiv = document.getElementById('creation-variants-status');
        const createBtn = document.getElementById('create-crossword-btn');
        
        statusDiv.innerHTML = '<span class="status-icon">⏳</span><span class="status-text">Проверка возможности генерации...</span>';
        createBtn.disabled = true;
        
        try {
            const variants = await ApiService.checkCrosswordVariants(dictionaryId, wordCount, wordCount);
            const isAvailable = variants[String(wordCount)] === true;
            
            if (isAvailable) {
                statusDiv.innerHTML = '<span class="status-icon success">✓</span><span class="status-text success">Вариант доступен для генерации</span>';
                createBtn.disabled = false;
            } else {
                statusDiv.innerHTML = '<span class="status-icon error">⚠</span><span class="status-text error">Невозможно создать кроссворд с таким количеством слов</span>';
                createBtn.disabled = true;
            }
        } catch (error) {
            console.error('Ошибка проверки варианта:', error);
            statusDiv.innerHTML = '<span class="status-icon error">⚠</span><span class="status-text error">Ошибка при проверке варианта</span>';
            createBtn.disabled = true;
        }
    }

    getWordForm(count) {
        const lastDigit = count % 10;
        const lastTwo = count % 100;
        
        if (lastTwo >= 11 && lastTwo <= 19) {
            return 'слов';
        }
        
        if (lastDigit === 1) {
            return 'слово';
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'слова';
        }
        
        return 'слов';
    }

    async createCrossword() {
        const dictionaryId = this.selectedDictionaryId;
        const wordCount = parseInt(document.getElementById('creation-word-count-select').value);
        let baseTitle = document.getElementById('creation-title-input').value.trim();
        
        // Получаем количество подсказок
        const maxHintsInput = document.getElementById('creation-max-hints-input');
        let maxHints = null;
        if (maxHintsInput && maxHintsInput.value.trim() !== '') {
            const parsed = parseInt(maxHintsInput.value.trim(), 10);
            if (!isNaN(parsed) && parsed >= 0) {
                maxHints = parsed;
            }
        }
        
        // Если название не указано, используем дефолтное
        if (!baseTitle) {
            baseTitle = `Кроссворд из словаря ${dictionaryId}`;
        }
        
        // Добавляем режим создания в скобках
        const title = `${baseTitle} (Автоматический)`;

        if (!dictionaryId) {
            alert('Пожалуйста, выберите словарь');
            return;
        }

        if (!wordCount) {
            alert('Пожалуйста, выберите количество слов');
            return;
        }

        try {
            // Получаем текущего пользователя
            const user = typeof authManager !== 'undefined' ? authManager.getCurrentUser() : null;
            const userId = user && user.id ? user.id : null;
            
            const crossword = await ApiService.generateCrossword(dictionaryId, wordCount, title, maxHints, userId);
            
            // Переходим к экрану выбора кроссворда
            this.showSelectionScreen();
            
            // Обновляем список кроссвордов
            if (typeof crosswordSelectionManager !== 'undefined') {
                await crosswordSelectionManager.loadCrosswords();
            }
            
            alert(`Кроссворд "${crossword.title}" успешно создан!`);
        } catch (error) {
            console.error('Ошибка создания кроссворда:', error);
            alert('Ошибка создания кроссворда: ' + (error.message || 'Неизвестная ошибка'));
        }
    }

    showDashboard() {
        document.getElementById('crossword-creation-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
    }

    showSelectionScreen() {
        document.getElementById('crossword-creation-screen').classList.remove('active');
        document.getElementById('crossword-selection-screen').classList.add('active');
        
        if (typeof crosswordSelectionManager !== 'undefined') {
            crosswordSelectionManager.show();
        }
    }
}

// Глобальный экземпляр
const crosswordCreationManager = new CrosswordCreationManager();

