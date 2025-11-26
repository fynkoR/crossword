// Управление экраном выбора кроссворда для игры (простой список)
class PlaySelectionManager {
    constructor() {
        this.crosswords = [];
        this.init();
    }

    init() {
        // Кнопка назад
        const backBtn = document.getElementById('back-from-play-selection');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showDashboard();
            });
        }
    }

    async show() {
        document.getElementById('play-selection-screen').classList.add('active');
        await this.loadCrosswords();
    }

    async loadCrosswords() {
        try {
            this.crosswords = await ApiService.getCrosswords();
            this.renderCrosswords();
        } catch (error) {
            console.error('Ошибка загрузки кроссвордов:', error);
            this.renderCrosswords();
        }
    }

    renderCrosswords() {
        const listContainer = document.getElementById('play-crosswords-list');
        const noMessage = document.getElementById('no-play-crosswords-message');

        if (this.crosswords.length === 0) {
            listContainer.style.display = 'none';
            noMessage.style.display = 'block';
            return;
        }

        listContainer.style.display = 'grid';
        noMessage.style.display = 'none';
        listContainer.innerHTML = '';

        this.crosswords.forEach(crossword => {
            const card = document.createElement('div');
            card.className = 'crossword-card';
            
            const title = document.createElement('h3');
            title.textContent = crossword.title || 'Без названия';
            
            const info = document.createElement('div');
            info.className = 'crossword-info';
            
            const gridSize = document.createElement('span');
            gridSize.className = 'info-item';
            gridSize.innerHTML = `<strong>Размер:</strong> ${crossword.gridWidth || 'N/A'} × ${crossword.gridHeight || 'N/A'}`;
            
            const dictionaryInfo = document.createElement('span');
            dictionaryInfo.className = 'info-item';
            dictionaryInfo.innerHTML = `<strong>Словарь:</strong> ${crossword.dictionary?.title || 'N/A'}`;
            
            const hintsInfo = document.createElement('span');
            hintsInfo.className = 'info-item';
            hintsInfo.innerHTML = `<strong>Подсказок:</strong> ${crossword.maxHints !== null && crossword.maxHints !== undefined ? crossword.maxHints : 'N/A'}`;
            
            // Информация о создателе
            const creatorInfo = document.createElement('span');
            creatorInfo.className = 'info-item';
            const creatorName = crossword.createdByUserLogin || 'Неизвестен';
            creatorInfo.innerHTML = `<strong>Создатель:</strong> ${creatorName}`;
            
            info.appendChild(gridSize);
            info.appendChild(dictionaryInfo);
            info.appendChild(hintsInfo);
            info.appendChild(creatorInfo);
            
            const actions = document.createElement('div');
            actions.className = 'crossword-actions';
            
            const playBtn = document.createElement('button');
            playBtn.className = 'btn btn-primary';
            playBtn.textContent = '🎮 Играть';
            playBtn.style.width = '100%';
            playBtn.addEventListener('click', () => {
                this.startGame(crossword.id);
            });
            
            actions.appendChild(playBtn);
            
            card.appendChild(title);
            card.appendChild(info);
            card.appendChild(actions);
            
            listContainer.appendChild(card);
        });
    }

    async startGame(crosswordId) {
        try {
            // Переходим к экрану игры
            document.getElementById('play-selection-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            
            // Запускаем игру
            if (typeof window.Game !== 'undefined' && window.Game.startGame) {
                window.Game.startGame({ crosswordId: crosswordId });
            }
        } catch (error) {
            console.error('Ошибка запуска игры:', error);
            alert('Ошибка запуска игры: ' + (error.message || 'Неизвестная ошибка'));
        }
    }

    showDashboard() {
        document.getElementById('play-selection-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
    }
}

// Глобальный экземпляр
const playSelectionManager = new PlaySelectionManager();

