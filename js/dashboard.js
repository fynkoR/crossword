// Управление главным экраном
class DashboardManager {
    constructor() {
        this.selectedDictionary = null;
        this.gameSettings = {
            dictionaryId: null,
            difficulty: 'medium',
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

    async startGame() {
        const dictionaryId = document.getElementById('dictionary-select').value;
        const difficulty = document.getElementById('difficulty-select').value;
        const wordCount = parseInt(document.getElementById('word-count').value);

        if (!dictionaryId) {
            alert('Пожалуйста, выберите словарь');
            return;
        }

        this.gameSettings = {
            dictionaryId: parseInt(dictionaryId),
            difficulty,
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

