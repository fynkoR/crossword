// Управление главным экраном
class DashboardManager {
    constructor() {
        this.selectedDictionary = null;
        this.gameSettings = {
            dictionaryId: null,
            wordCount: 5
        };
        this.init();
    }

    init() {
        // Кнопка выхода
        document.getElementById('logout-btn').addEventListener('click', () => {
            authManager.logout();
        });

        // Карточки действий
        document.getElementById('play-card').addEventListener('click', () => {
            this.showGameSettings();
        });

        document.getElementById('dictionary-card').addEventListener('click', () => {
            this.showDictionaryScreen();
        });

        document.getElementById('settings-card').addEventListener('click', () => {
            this.showGameSettings();
        });

        // Кнопка начала игры
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Загрузка словарей для выбора
        this.loadDictionaries();
    }

    async loadDictionaries() {
        try {
            const dictionaries = await ApiService.getDictionaries();
            const select = document.getElementById('dictionary-select');
            
            select.innerHTML = '<option value="">Выберите словарь...</option>';
            
            dictionaries.forEach(dict => {
                const option = document.createElement('option');
                option.value = dict.id;
                option.textContent = `${dict.title} (${dict.description || 'без описания'})`;
                select.appendChild(option);
            });
            
            // Добавляем обработчик изменения словаря
            select.removeEventListener('change', this.handleDictionaryChange);
            this.handleDictionaryChange = (e) => {
                const dictionaryId = e.target.value;
                if (dictionaryId) {
                    this.onDictionarySelected(parseInt(dictionaryId));
                } else {
                    this.resetWordCountSelect();
                }
            };
            select.addEventListener('change', this.handleDictionaryChange);
        } catch (error) {
            console.error('Ошибка загрузки словарей:', error);
            document.getElementById('dictionary-select').innerHTML = 
                '<option value="">Ошибка загрузки словарей</option>';
        }
    }

    showGameSettings() {
        const settingsPanel = document.getElementById('game-settings');
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        
        if (settingsPanel.style.display === 'block') {
            this.loadDictionaries();
        }
    }

    onDictionarySelected(dictionaryId) {
        const wordCountSelect = document.getElementById('word-count-select');
        const statusDiv = document.getElementById('variants-status');
        
        // Активируем селект количества слов
        wordCountSelect.disabled = false;
        wordCountSelect.innerHTML = '';
        
        // Заполняем опции от 3 до 10 слов
        for (let count = 3; count <= 10; count++) {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = `${count} ${this.getWordForm(count)}`;
            wordCountSelect.appendChild(option);
        }
        
        // Очищаем статус
        statusDiv.innerHTML = '';
        document.getElementById('start-game-btn').disabled = true;
        
        // Сохраняем ID словаря
        this.selectedDictionaryId = dictionaryId;
        
        // Добавляем обработчик изменения количества слов
        wordCountSelect.removeEventListener('change', this.handleWordCountChange);
        this.handleWordCountChange = (e) => {
            const wordCount = parseInt(e.target.value);
            if (wordCount) {
                this.checkVariantForWordCount(this.selectedDictionaryId, wordCount);
            }
        };
        wordCountSelect.addEventListener('change', this.handleWordCountChange);
    }

    resetWordCountSelect() {
        const wordCountSelect = document.getElementById('word-count-select');
        const statusDiv = document.getElementById('variants-status');
        
        wordCountSelect.disabled = true;
        wordCountSelect.innerHTML = '<option value="">Сначала выберите словарь</option>';
        statusDiv.innerHTML = '';
        document.getElementById('start-game-btn').disabled = true;
    }

    async checkVariantForWordCount(dictionaryId, wordCount) {
        const statusDiv = document.getElementById('variants-status');
        const startBtn = document.getElementById('start-game-btn');
        
        statusDiv.innerHTML = '<span class="status-icon">⏳</span><span class="status-text">Проверка возможности генерации...</span>';
        startBtn.disabled = true;
        
        try {
            // Проверяем только один вариант для заданного количества слов
            const variants = await ApiService.checkCrosswordVariants(dictionaryId, wordCount, wordCount);
            
            console.log('Результат проверки вариантов:', variants);
            console.log('Проверяем для количества слов:', wordCount, 'Тип:', typeof wordCount);
            console.log('Значение variants[wordCount]:', variants[wordCount]);
            console.log('Значение variants[String(wordCount)]:', variants[String(wordCount)]);
            
            // API возвращает ключи как строки, поэтому используем String(wordCount)
            const isAvailable = variants[String(wordCount)] === true;
            
            if (isAvailable) {
                statusDiv.innerHTML = '<span class="status-icon success">✓</span><span class="status-text success">Вариант доступен для генерации</span>';
                startBtn.disabled = false;
            } else {
                statusDiv.innerHTML = '<span class="status-icon error">⚠</span><span class="status-text error">Невозможно создать кроссворд с таким количеством слов</span>';
                startBtn.disabled = true;
            }
        } catch (error) {
            console.error('Ошибка проверки варианта:', error);
            statusDiv.innerHTML = '<span class="status-icon error">⚠</span><span class="status-text error">Ошибка при проверке варианта</span>';
            startBtn.disabled = true;
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

    async startGame() {
        const dictionaryId = document.getElementById('dictionary-select').value;
        const wordCount = parseInt(document.getElementById('word-count-select').value);

        if (!dictionaryId) {
            alert('Пожалуйста, выберите словарь');
            return;
        }

        if (!wordCount) {
            alert('Пожалуйста, выберите количество слов');
            return;
        }

        this.gameSettings = {
            dictionaryId: parseInt(dictionaryId),
            wordCount
        };

        // Переходим к экрану игры
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        // Запускаем игру
        gameManager.startGame(this.gameSettings);
    }

    showDictionaryScreen() {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('dictionary-screen').classList.add('active');
        dictionaryManager.loadDictionaries();
    }
}

// Глобальный экземпляр
const dashboardManager = new DashboardManager();

