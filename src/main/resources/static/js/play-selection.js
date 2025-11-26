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
            await this.renderCrosswords();
        } catch (error) {
            console.error('Ошибка загрузки кроссвордов:', error);
            await this.renderCrosswords();
        }
    }

    async renderCrosswords() {
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

        // Получаем текущего пользователя
        const user = typeof authManager !== 'undefined' ? authManager.getCurrentUser() : null;
        const userId = user && user.id ? user.id : null;

        // Загружаем игры пользователя для расчета оставшихся подсказок
        let userGames = [];
        if (userId) {
            try {
                userGames = await ApiService.getUserGames(userId);
                console.log('[PlaySelection] Загружено игр пользователя:', userGames.length, userGames);
            } catch (error) {
                console.error('Ошибка загрузки игр пользователя:', error);
            }
        }
        
        // Создаем Map: crosswordId -> hintsUsed (суммируем из всех игр для этого кроссворда)
        const hintsUsedMap = new Map();
        userGames.forEach(game => {
            const crosswordId = Number(game.crosswordId);
            const currentHints = hintsUsedMap.get(crosswordId) || 0;
            const gameHints = game.hintsUsed || 0;
            // Берем максимум использованных подсказок (на случай нескольких игр)
            hintsUsedMap.set(crosswordId, Math.max(currentHints, gameHints));
        });
        console.log('[PlaySelection] hintsUsedMap:', hintsUsedMap);

        // Загружаем статистику для всех кроссвордов параллельно
        const statsPromises = this.crosswords.map(async (crossword) => {
            try {
                const [detail, statistics] = await Promise.all([
                    ApiService.getCrosswordDetail(crossword.id),
                    ApiService.getCrosswordStatistics(crossword.id)
                ]);
                return { crosswordId: crossword.id, detail, statistics };
            } catch (error) {
                console.error(`Ошибка загрузки статистики для кроссворда ${crossword.id}:`, error);
                return { crosswordId: crossword.id, detail: null, statistics: null };
            }
        });

        const allStats = await Promise.all(statsPromises);
        const statsMap = new Map(allStats.map(s => [s.crosswordId, s]));

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
            
            // Оставшиеся подсказки
            const hintsInfo = document.createElement('span');
            hintsInfo.className = 'info-item';
            const maxHints = crossword.maxHints !== null && crossword.maxHints !== undefined ? crossword.maxHints : 0;
            const crosswordIdNum = Number(crossword.id);
            const hintsUsed = hintsUsedMap.get(crosswordIdNum) || 0;
            const remainingHints = Math.max(0, maxHints - hintsUsed);
            hintsInfo.innerHTML = `<strong>Подсказок осталось:</strong> ${remainingHints}`;
            
            // Информация о создателе
            const creatorInfo = document.createElement('span');
            creatorInfo.className = 'info-item';
            const creatorName = crossword.createdByUserLogin || 'Неизвестен';
            creatorInfo.innerHTML = `<strong>Создатель:</strong> ${creatorName}`;
            
            // Процент выполнения
            const completionInfo = document.createElement('span');
            completionInfo.className = 'info-item';
            const statsData = statsMap.get(crossword.id);
            let completionText = 'N/A';
            
            if (statsData && statsData.detail && statsData.statistics) {
                const { detail, statistics } = statsData;
                if (detail.gridData && detail.gridData.cells) {
                    const totalLetters = detail.gridData.cells.filter(cell => !cell.isBlack).length;
                    const guessedLetters = statistics.totalGuessedLetters || 0;
                    const completionPercentage = totalLetters > 0 
                        ? ((guessedLetters / totalLetters) * 100).toFixed(1)
                        : '0';
                    completionText = `${completionPercentage}%`;
                }
            }
            completionInfo.innerHTML = `<strong>Выполнено:</strong> ${completionText}`;
            
            info.appendChild(gridSize);
            info.appendChild(dictionaryInfo);
            info.appendChild(hintsInfo);
            info.appendChild(creatorInfo);
            info.appendChild(completionInfo);
            
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

