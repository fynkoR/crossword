// Управление главным экраном
class DashboardManager {
    constructor() {
        // Отложенная инициализация после загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
        this.init();
        }
    }

    init() {
        // Кнопка выхода
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
            authManager.logout();
        });
        }

        // Карточки действий
        const playCard = document.getElementById('play-card');
        if (playCard) {
            playCard.addEventListener('click', () => {
                this.showPlaySelection();
            });
        }

        const dictionaryCard = document.getElementById('dictionary-card');
        if (dictionaryCard) {
            dictionaryCard.addEventListener('click', () => {
                this.showDictionaryScreen();
            });
    }

        const createCrosswordCard = document.getElementById('create-crossword-card');
        if (createCrosswordCard) {
            createCrosswordCard.addEventListener('click', () => {
                this.showCrosswordManagement();
            });
        }
    }

    showDictionaryScreen() {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('dictionary-screen').classList.add('active');
        dictionaryManager.loadDictionaries();
    }

    showPlaySelection() {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('play-selection-screen').classList.add('active');
        
        if (typeof playSelectionManager !== 'undefined') {
            playSelectionManager.show();
        }
    }

    showCrosswordManagement() {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('crossword-selection-screen').classList.add('active');
        
        if (typeof crosswordSelectionManager !== 'undefined') {
            crosswordSelectionManager.show();
        }
    }
}

// Глобальный экземпляр
const dashboardManager = new DashboardManager();
