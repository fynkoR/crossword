console.log('[Game.js] Скрипт загружается...');

// Глобальный объект игры (без использования классов и new)
window.Game = {
    currentGame: null,
    crossword: null,
    grid: null,
    words: [],
    selectedCell: null,
    currentWord: null,
    gameSettings: null,

    init: function() {
        console.log('[Game] Инициализация обработчиков событий...');
        // Кнопка назад
        const backBtn = document.getElementById('back-to-dashboard-from-game');
        if (backBtn) {
            // Удаляем старые обработчики
            const newBtn = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBtn, backBtn);
            newBtn.addEventListener('click', () => {
                this.showDashboard();
            });
        }

        // Кнопки завершения игры
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            const newBtn = playAgainBtn.cloneNode(true);
            playAgainBtn.parentNode.replaceChild(newBtn, playAgainBtn);
            newBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }

        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        if (backToMenuBtn) {
            const newBtn = backToMenuBtn.cloneNode(true);
            backToMenuBtn.parentNode.replaceChild(newBtn, backToMenuBtn);
            newBtn.addEventListener('click', () => {
                this.showDashboard();
            });
        }

        // Кнопка использования подсказки
        const useHintBtn = document.getElementById('use-hint-btn');
        if (useHintBtn) {
            const newBtn = useHintBtn.cloneNode(true);
            useHintBtn.parentNode.replaceChild(newBtn, useHintBtn);
            newBtn.addEventListener('click', () => {
                this.useHint();
            });
        }
    },

    startGame: async function(settings) {
        // Инициализируем обработчики при первом запуске
        this.init();

        console.log('[Game] ===== STARTGAME ВЫЗВАН =====');
        console.log('[Game] settings параметр:', settings);
        
        // Сбрасываем настройки и устанавливаем новые
        this.gameSettings = settings || {};
        
        try {
            // Если кроссворд уже создан, загружаем его
            const crosswordId = this.gameSettings.crosswordId;
            
            // Ранняя проверка: если есть crosswordId, сразу загружаем кроссворд
            if (crosswordId != null && crosswordId !== '' && crosswordId !== undefined) {
                const id = typeof crosswordId === 'string' ? parseInt(crosswordId, 10) : crosswordId;
                
                if (!isNaN(id) && isFinite(id)) {
                    console.log('[Game] Найден crosswordId, загружаем кроссворд с ID:', id);
                    try {
                        this.crossword = await ApiService.getCrosswordDetail(id);
                        
                        if (!this.crossword) {
                            alert('Кроссворд не найден');
                            this.showDashboard();
                            return;
                        }
                        
                        // Сохраняем dictionaryId из загруженного кроссворда
                        if (this.crossword.dictionary && this.crossword.dictionary.id) {
                            this.gameSettings.dictionaryId = this.crossword.dictionary.id;
                        } else if (this.crossword.dictionaryId) {
                            this.gameSettings.dictionaryId = this.crossword.dictionaryId;
                        }
                        
                        this.grid = this.crossword.gridData;
                        this.words = this.crossword.wordsData.words || [];
                        
                        // Создаем игру на backend
                        const user = authManager.getCurrentUser();
                        if (!user || !user.id) {
                            alert('Пользователь не авторизован');
                            this.showDashboard();
                            return;
                        }
                        
                        const gameResult = await ApiService.startGame(this.crossword.id, user.id);
                        if (gameResult && gameResult.game) {
                            this.currentGame = gameResult.game;
                            
                            // Восстанавливаем состояние сетки
                            if (this.currentGame.gridState) {
                                try {
                                    const savedState = JSON.parse(this.currentGame.gridState);
                                    this.restoreGridState(savedState);
                                } catch (e) {
                                    console.error('Ошибка восстановления состояния сетки:', e);
                                }
                            }
                        }
                        
                        // Отображаем кроссворд
                        this.renderGrid();
                        this.renderWordsList();
                        this.updateStats();
                        return;
                    } catch (error) {
                        console.error('Ошибка загрузки кроссворда:', error);
                        alert('Ошибка загрузки кроссворда: ' + (error.message || 'Неизвестная ошибка'));
                        this.showDashboard();
                        return;
                    }
                }
            }
            
            // Генерация нового кроссворда (автоматический режим)
            console.log('[Game] Генерируем новый кроссворд, dictionaryId:', this.gameSettings.dictionaryId);
            
            if (!this.gameSettings.dictionaryId) {
                alert('Не указан ID словаря');
                this.showDashboard();
                return;
            }
            
            if (!this.gameSettings.wordCount) {
                alert('Не указано количество слов');
                this.showDashboard();
                return;
            }
            
            const wordCount = parseInt(this.gameSettings.wordCount, 10);
            let baseTitle = `Кроссворд из словаря ${this.gameSettings.dictionaryId}`;
            const title = `${baseTitle} (Автоматический)`;
            
            const user = authManager.getCurrentUser();
            const userId = user && user.id ? user.id : null;
            
            this.crossword = await ApiService.generateCrossword(
                this.gameSettings.dictionaryId, 
                wordCount, 
                title,
                null,
                userId
            );
            
            if (!this.crossword || !this.crossword.gridData || !this.crossword.wordsData) {
                alert('Ошибка загрузки кроссворда');
                this.showDashboard();
                return;
            }
            
            this.grid = this.crossword.gridData;
            this.words = this.crossword.wordsData.words || [];
            
            if (!user || !user.id) {
                alert('Пользователь не авторизован');
                this.showDashboard();
                return;
            }
            
            const gameResult = await ApiService.startGame(this.crossword.id, user.id);
            if (gameResult && gameResult.game) {
                this.currentGame = gameResult.game;
                
                if (this.currentGame.gridState) {
                    try {
                        const savedState = JSON.parse(this.currentGame.gridState);
                        this.restoreGridState(savedState);
                    } catch (e) {
                        console.error('Ошибка восстановления состояния сетки:', e);
                    }
                }
            }
            
            this.renderGrid();
            this.renderWordsList();
            this.updateStats();
        } catch (error) {
            console.error('Ошибка загрузки игры:', error);
            alert('Ошибка загрузки игры: ' + (error.message || 'Неизвестная ошибка'));
            this.showDashboard();
        }
    },

    renderGrid: function() {
        const gridContainer = document.getElementById('crossword-grid');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';
        
        if (!this.grid || !this.grid.size) return;
        
        const width = this.grid.size.width;
        const height = this.grid.size.height;
        
        const table = document.createElement('table');
        table.className = 'crossword-table';
        
        const cellMap = new Map();
        if (this.grid.cells) {
            this.grid.cells.forEach(cell => {
                const key = `${cell.x},${cell.y}`;
                cellMap.set(key, cell);
            });
        }
        
        for (let y = 0; y < height; y++) {
            const row = document.createElement('tr');
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('td');
                const key = `${x},${y}`;
                const cellData = cellMap.get(key);
                
                if (cellData && cellData.isBlack) {
                    cell.className = 'grid-cell black';
                    cell.textContent = '';
                } else if (cellData) {
                    cell.className = 'grid-cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    
                    if (cellData.number) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        numberSpan.textContent = cellData.number;
                        cell.appendChild(numberSpan);
                    }
                    
                    const letterInput = document.createElement('input');
                    letterInput.type = 'text';
                    letterInput.maxLength = 1;
                    letterInput.className = 'cell-input';
                    letterInput.dataset.x = x;
                    letterInput.dataset.y = y;
                    
                    if (cellData.letter) {
                        letterInput.value = cellData.letter;
                        if (cellData.isLocked) {
                            letterInput.disabled = true;
                            letterInput.classList.add('correct-letter');
                            cell.classList.add('solved');
                        } else {
                            if (cellData.isCorrect === false) {
                                letterInput.classList.add('incorrect-letter');
                            } else if (cellData.isCorrect === true) {
                                letterInput.classList.add('correct-letter');
                            } else {
                                // Проверка "на лету" при рендеринге, если статус неизвестен
                                const word = this.findWordByCell(x, y);
                                if (word && word.positions) {
                                    let letterIndex = -1;
                                    for (let i = 0; i < word.positions.length; i += 2) {
                                        if (word.positions[i] === x && word.positions[i + 1] === y) {
                                            letterIndex = i / 2;
                                            break;
                                        }
                                    }
                                    if (letterIndex >= 0) {
                                        const correctLetter = word.text.charAt(letterIndex).toUpperCase();
                                        const isCorrect = cellData.letter.toUpperCase() === correctLetter;
                                        if (isCorrect) {
                                            letterInput.classList.add('correct-letter');
                                        } else {
                                            letterInput.classList.add('incorrect-letter');
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    letterInput.addEventListener('input', (e) => {
                        this.handleCellInput(e.target, x, y);
                    });
                    
                    letterInput.addEventListener('keydown', (e) => {
                        this.handleCellKeydown(e, x, y);
                    });
                    
                    letterInput.addEventListener('focus', (e) => {
                        this.selectCell(x, y);
                    });
                    
                    cell.appendChild(letterInput);
                } else {
                    cell.className = 'grid-cell empty';
                }
                
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        
        gridContainer.appendChild(table);
    },

    renderWordsList: function() {
        const wordsList = document.getElementById('words-list');
        if (!wordsList) return;
        
        wordsList.innerHTML = '';
        
        this.words.forEach((word, index) => {
            const wordItem = document.createElement('div');
            wordItem.className = `word-item ${word.isSolved ? 'solved' : ''}`;
            wordItem.dataset.wordId = word.wordId;
            wordItem.dataset.wordNumber = word.number;
            
            const numberSpan = document.createElement('span');
            numberSpan.className = 'word-number';
            numberSpan.textContent = word.number + '.';
            
            const definitionSpan = document.createElement('span');
            definitionSpan.className = 'word-definition';
            definitionSpan.textContent = word.definition || 'Нет определения';
            
            wordItem.appendChild(numberSpan);
            wordItem.appendChild(definitionSpan);
            
            wordItem.addEventListener('click', () => {
                this.selectWord(word);
            });
            
            wordsList.appendChild(wordItem);
        });
    },

    selectCell: function(x, y) {
        this.selectedCell = { x, y };
        const word = this.findWordByCell(x, y);
        if (word) {
            this.currentWord = word;
            this.highlightWord(word);
        }
    },

    findWordByCell: function(x, y) {
        return this.words.find(word => {
            if (!word.positions || word.positions.length < 2) return false;
            for (let i = 0; i < word.positions.length; i += 2) {
                if (word.positions[i] === x && word.positions[i + 1] === y) {
                    return true;
                }
            }
            return false;
        });
    },

    highlightWord: function(word) {
        document.querySelectorAll('.grid-cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        if (word.positions) {
            for (let i = 0; i < word.positions.length; i += 2) {
                const x = word.positions[i];
                const y = word.positions[i + 1];
                const cell = document.querySelector(`.cell-input[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.closest('.grid-cell').classList.add('highlighted');
                }
            }
        }
        
        document.querySelectorAll('.word-item').forEach(item => {
            item.classList.remove('active');
        });
        const wordItem = document.querySelector(`.word-item[data-word-number="${word.number}"]`);
        if (wordItem) {
            wordItem.classList.add('active');
        }
        
        this.updateCurrentHint(word);
    },

    updateCurrentHint: function(word) {
        const hintText = document.getElementById('current-hint-text');
        if (hintText && word) {
            hintText.textContent = `${word.number}. ${word.definition || 'Нет описания'}`;
        }
    },

    handleCellInput: function(input, x, y) {
        const value = input.value.toUpperCase().replace(/[^А-ЯA-Z]/g, '');
        input.value = value;
        
        if (value) {
            this.checkLetter(input, x, y, value);
            
            if (this.grid && this.grid.cells) {
                const cell = this.grid.cells.find(c => c.x === x && c.y === y);
                if (cell) {
                    cell.letter = value;
                }
            }
            
            this.moveToNextCell(x, y);
        } else {
            input.classList.remove('correct-letter', 'incorrect-letter');
            
            if (this.grid && this.grid.cells) {
                const cell = this.grid.cells.find(c => c.x === x && c.y === y);
                if (cell && !cell.isLocked) {
                    cell.letter = null;
                }
            }
        }
        
        this.saveGridState();
        this.checkWord();
    },
    
    checkLetter: function(input, x, y, userLetter) {
        const word = this.findWordByCell(x, y);
        if (!word || !word.positions) return;
        
        let letterIndex = -1;
        for (let i = 0; i < word.positions.length; i += 2) {
            if (word.positions[i] === x && word.positions[i + 1] === y) {
                letterIndex = i / 2;
                break;
            }
        }
        
        if (letterIndex === -1) return;
        
        const correctLetter = word.text.charAt(letterIndex).toUpperCase();
        const isCorrect = userLetter === correctLetter;
        
        if (isCorrect) {
            input.classList.remove('incorrect-letter');
            input.classList.add('correct-letter');
        } else {
            input.classList.remove('correct-letter');
            input.classList.add('incorrect-letter');
        }
        
        if (this.grid && this.grid.cells) {
            const cell = this.grid.cells.find(c => c.x === x && c.y === y);
            if (cell) {
                cell.isCorrect = isCorrect;
            }
        }
    },

    handleCellKeydown: function(e, x, y) {
        if (e.key === 'Backspace' && !e.target.value) {
            this.moveToPreviousCell(x, y);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.moveToPreviousCell(x, y);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.moveToNextCell(x, y);
        }
    },

    moveToNextCell: function(x, y) {
        const word = this.findWordByCell(x, y);
        if (!word || !word.positions) return;
        
        for (let i = 0; i < word.positions.length; i += 2) {
            if (word.positions[i] === x && word.positions[i + 1] === y) {
                if (i + 2 < word.positions.length) {
                    const nextX = word.positions[i + 2];
                    const nextY = word.positions[i + 3];
                    const nextInput = document.querySelector(`.cell-input[data-x="${nextX}"][data-y="${nextY}"]`);
                    if (nextInput) {
                        nextInput.focus();
                        nextInput.select();
                    }
                }
                break;
            }
        }
    },

    moveToPreviousCell: function(x, y) {
        const word = this.findWordByCell(x, y);
        if (!word || !word.positions) return;
        
        for (let i = 0; i < word.positions.length; i += 2) {
            if (word.positions[i] === x && word.positions[i + 1] === y) {
                if (i >= 2) {
                    const prevX = word.positions[i - 2];
                    const prevY = word.positions[i - 1];
                    const prevInput = document.querySelector(`.cell-input[data-x="${prevX}"][data-y="${prevY}"]`);
                    if (prevInput) {
                        prevInput.focus();
                        prevInput.select();
                    }
                }
                break;
            }
        }
    },

    selectWord: function(word) {
        this.currentWord = word;
        this.highlightWord(word);
        
        if (word.positions && word.positions.length >= 2) {
            const firstX = word.positions[0];
            const firstY = word.positions[1];
            const firstInput = document.querySelector(`.cell-input[data-x="${firstX}"][data-y="${firstY}"]`);
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }
    },

    checkWord: async function() {
        if (!this.currentWord) return;
        
        let userWord = '';
        if (this.currentWord.positions) {
            for (let i = 0; i < this.currentWord.positions.length; i += 2) {
                const x = this.currentWord.positions[i];
                const y = this.currentWord.positions[i + 1];
                const input = document.querySelector(`.cell-input[data-x="${x}"][data-y="${y}"]`);
                if (input) {
                    userWord += input.value.toUpperCase() || ' ';
                }
            }
        }
        
        userWord = userWord.trim();
        const correctWord = this.currentWord.text.toUpperCase();
        
        if (userWord.length === correctWord.length && userWord === correctWord) {
            if (this.currentWord.positions) {
                for (let i = 0; i < this.currentWord.positions.length; i += 2) {
                    const x = this.currentWord.positions[i];
                    const y = this.currentWord.positions[i + 1];
                    const input = document.querySelector(`.cell-input[data-x="${x}"][data-y="${y}"]`);
                    const cell = input?.closest('.grid-cell');
                    if (input && cell) {
                        input.disabled = true;
                        cell.classList.add('solved');
                        
                        if (this.grid && this.grid.cells) {
                            const gridCell = this.grid.cells.find(c => c.x === x && c.y === y);
                            if (gridCell) {
                                gridCell.isLocked = true;
                                if (!gridCell.letter) {
                                    gridCell.letter = input.value.toUpperCase();
                                }
                            }
                        }
                    }
                }
            }
            
            this.currentWord.isSolved = true;
            this.renderWordsList();
            this.updateStats();
            
            this.saveGridState();
            
            const allSolved = this.words.every(w => w.isSolved);
            if (allSolved) {
                setTimeout(() => this.completeGame(), 1000);
            }
        }
    },

    updateStats: function() {
        const totalWords = this.words.length;
        const solvedWords = this.words.filter(w => w.isSolved).length;
        
        const wordsCountEl = document.getElementById('words-count');
        const correctCountEl = document.getElementById('correct-count');
        const hintsRemainingEl = document.getElementById('hints-remaining');
        
        if (wordsCountEl) wordsCountEl.textContent = totalWords;
        if (correctCountEl) correctCountEl.textContent = solvedWords;
        
        if (hintsRemainingEl && this.crossword && this.currentGame) {
            const maxHints = this.crossword.maxHints || 0;
            const usedHints = this.currentGame.hintsUsed || 0;
            const remaining = Math.max(0, maxHints - usedHints);
            hintsRemainingEl.textContent = remaining;
            
            const useHintBtn = document.getElementById('use-hint-btn');
            if (useHintBtn) {
                useHintBtn.disabled = remaining <= 0;
                if (remaining <= 0) {
                    useHintBtn.textContent = '💡 Подсказки закончились';
                } else {
                    useHintBtn.textContent = `💡 Использовать подсказку (осталось: ${remaining})`;
                }
            }
        }
    },

    completeGame: function() {
        document.getElementById('final-words-count').textContent = this.words.filter(w => w.isSolved).length;
        document.getElementById('game-complete-modal').classList.add('active');
    },

    restartGame: function() {
        document.getElementById('game-complete-modal').classList.remove('active');
        
        if (this.gameSettings && this.gameSettings.isManual) {
            this.showDashboard();
            return;
        }
        
        if (this.gameSettings && this.gameSettings.crosswordId && !this.gameSettings.wordCount) {
            this.showDashboard();
            return;
        }
        
        if (this.gameSettings && this.gameSettings.wordCount && this.gameSettings.dictionaryId) {
            const newSettings = {
                dictionaryId: this.gameSettings.dictionaryId,
                wordCount: this.gameSettings.wordCount
            };
            this.startGame(newSettings);
        } else {
            this.showDashboard();
        }
    },

    useHint: async function() {
        if (!this.currentGame || !this.currentGame.id) {
            alert('Игра не запущена');
            return;
        }

        const useHintBtn = document.getElementById('use-hint-btn');
        if (useHintBtn) {
            useHintBtn.disabled = true;
            useHintBtn.textContent = '⏳ Загрузка...';
        }

        try {
            const result = await ApiService.useHint(this.currentGame.id);
            
            if (result && result.success) {
                if (result.data) {
                    try {
                        const hintData = JSON.parse(result.data);
                        const { x, y, letter } = hintData;
                        
                        const cellInput = document.querySelector(`.cell-input[data-x="${x}"][data-y="${y}"]`);
                        if (cellInput) {
                            cellInput.value = letter.toUpperCase();
                            cellInput.disabled = true;
                            cellInput.classList.add('correct-letter');
                            cellInput.closest('.grid-cell').classList.add('solved');
                            
                            if (this.grid && this.grid.cells) {
                                const cell = this.grid.cells.find(c => c.x === x && c.y === y);
                                if (cell) {
                                    cell.letter = letter.toUpperCase();
                                    cell.isLocked = true;
                                }
                            }
                            
                            const word = this.findWordByCell(x, y);
                            if (word) {
                                this.currentWord = word;
                                this.checkWord();
                            }
                        }
                    } catch (e) {
                        console.error('Ошибка парсинга данных подсказки:', e);
                    }
                }
                
                if (result.game) {
                    this.currentGame = result.game;
                }
                
                this.updateStats();
                this.saveGridState();
                
                alert(result.message || 'Подсказка использована');
            } else {
                alert(result.message || 'Не удалось использовать подсказку');
            }
        } catch (error) {
            console.error('Ошибка использования подсказки:', error);
            alert('Ошибка использования подсказки: ' + (error.message || 'Неизвестная ошибка'));
        } finally {
            this.updateStats();
        }
    },

    getCurrentGridState: function() {
        if (!this.grid || !this.grid.cells) {
            return [];
        }
        
        const state = [];
        this.grid.cells.forEach(cell => {
            if (cell.letter || cell.isLocked) {
                state.push({
                    x: cell.x,
                    y: cell.y,
                    letter: cell.letter || null,
                    isLocked: cell.isLocked || false,
                    isCorrect: cell.isCorrect !== undefined ? cell.isCorrect : null
                });
            }
        });
        
        return state;
    },

    saveGridState: async function() {
        if (!this.currentGame || !this.currentGame.id) {
            return;
        }
        
        try {
            const gridState = this.getCurrentGridState();
            const gridStateJson = JSON.stringify(gridState);
            
            await ApiService.saveGridState(this.currentGame.id, gridStateJson);
        } catch (error) {
            console.error('Ошибка сохранения состояния сетки:', error);
        }
    },

    restoreGridState: function(savedState) {
        if (!savedState || !Array.isArray(savedState)) {
            return;
        }
        
        if (!this.grid || !this.grid.cells) {
            return;
        }
        
        savedState.forEach(stateCell => {
            const cell = this.grid.cells.find(c => c.x === stateCell.x && c.y === stateCell.y);
            if (cell) {
                if (stateCell.letter) {
                    cell.letter = stateCell.letter;
                }
                if (stateCell.isLocked) {
                    cell.isLocked = true;
                }
                if (stateCell.isCorrect !== undefined && stateCell.isCorrect !== null) {
                    cell.isCorrect = stateCell.isCorrect;
                }
            }
        });
        
        this.words.forEach(word => {
            if (word.positions && word.positions.length >= 2) {
                let allLocked = true;
                for (let i = 0; i < word.positions.length; i += 2) {
                    const x = word.positions[i];
                    const y = word.positions[i + 1];
                    const cell = this.grid.cells.find(c => c.x === x && c.y === y);
                    if (!cell || !cell.isLocked) {
                        allLocked = false;
                        break;
                    }
                }
                if (allLocked) {
                    word.isSolved = true;
                }
            }
        });
    },

    showDashboard: function() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        document.getElementById('game-complete-modal').classList.remove('active');
    }
};

// Экспортируем функцию запуска для глобального доступа
window.startGame = function(settings) {
    console.log('window.startGame вызван с настройками:', settings);
    if (window.Game) {
        window.Game.startGame(settings);
    } else {
        console.error('Объект window.Game не инициализирован');
        alert('Ошибка инициализации игры. Перезагрузите страницу.');
    }
};

console.log('[Game.js] Глобальный объект Game и функция startGame созданы');