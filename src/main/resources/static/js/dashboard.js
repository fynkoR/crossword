// Управление главным экраном
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        // Кнопка выхода
        document.getElementById('logout-btn').addEventListener('click', () => {
            authManager.logout();
        });

        // Карточки действий
        document.getElementById('play-card').addEventListener('click', () => {
            this.showCrosswordSelection();
        });

        document.getElementById('dictionary-card').addEventListener('click', () => {
            this.showDictionaryScreen();
        });

        document.getElementById('create-crossword-card').addEventListener('click', () => {
            this.showCrosswordCreation();
        });
    }

    showDictionaryScreen() {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('dictionary-screen').classList.add('active');
        dictionaryManager.loadDictionaries();
    }

    showCrosswordSelection() {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('crossword-selection-screen').classList.add('active');
        
        if (typeof crosswordSelectionManager !== 'undefined') {
            crosswordSelectionManager.show();
        }
    }

    showCrosswordCreation() {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('crossword-creation-screen').classList.add('active');
        
        if (typeof crosswordCreationManager !== 'undefined') {
            crosswordCreationManager.show();
        }
    }
}

// Глобальный экземпляр
const dashboardManager = new DashboardManager();
