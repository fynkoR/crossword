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
            select.addEventListener('change', (e) => {
                const dictionaryId = e.target.value;
                if (dictionaryId) {
                    this.checkAvailableVariants(parseInt(dictionaryId));
                } else {
                    document.getElementById('generation-status').innerHTML = '';
                    document.getElementById('word-count').disabled = true;
                    document.getElementById('start-game-btn').disabled = true;
                }
            });
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

    async checkAvailableVariants(dictionaryId) {
        const statusDiv = document.getElementById('generation-status');
        const wordCountSelect = document.getElementById('word-count');
        
        if (!dictionaryId) {
            statusDiv.innerHTML = '';
            return;
        }
        
        statusDiv.innerHTML = '<p class="checking">Проверка доступных вариантов...</p>';
        
        try {
            const variants = await ApiService.checkCrosswordVariants(dictionaryId, 3, 10);
            
            // Обновляем опции в селекте
            const availableOptions = [];
            for (let count = 3; count <= 10; count++) {
                if (variants[count]) {
                    availableOptions.push(count);
                }
            }
            
            if (availableOptions.length === 0) {
                statusDiv.innerHTML = '<p class="error">⚠ В этом словаре недостаточно слов для создания кроссворда</p>';
                wordCountSelect.disabled = true;
                document.getElementById('start-game-btn').disabled = true;
                return;
            }
            
            // Обновляем селект
            wordCountSelect.innerHTML = '';
            availableOptions.forEach(count => {
                const option = document.createElement('option');
                option.value = count;
                option.textContent = `${count} ${this.getWordForm(count)}`;
                wordCountSelect.appendChild(option);
            });
            
            wordCountSelect.disabled = false;
            document.getElementById('start-game-btn').disabled = false;
            
            statusDiv.innerHTML = `<p class="success">✓ Доступно вариантов: ${availableOptions.length}</p>`;
        } catch (error) {
            console.error('Ошибка проверки вариантов:', error);
            statusDiv.innerHTML = '<p class="error">Ошибка при проверке вариантов</p>';
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
        const wordCount = parseInt(document.getElementById('word-count').value);

        if (!dictionaryId) {
            alert('Пожалуйста, выберите словарь');
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

