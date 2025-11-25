// Управление игрой в кроссворд с сеткой
class GameManager {
    constructor() {
        this.currentGame = null;
        this.crossword = null;
        this.grid = null;
        this.words = [];
        this.selectedCell = null;
        this.currentWord = null;
        this.gameSettings = null;
        this.init();
    }

    init() {
        // Кнопка назад
        document.getElementById('back-to-dashboard-from-game').addEventListener('click', () => {
            this.showDashboard();
        });

        // Кнопки завершения игры
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showDashboard();
        });
    }

    async startGame(settings) {
        this.gameSettings = settings;
        
        try {
            // Если кроссворд уже создан (ручной режим), загружаем его
            if (settings.crosswordId) {
                this.crossword = await ApiService.getCrosswordDetail(settings.crosswordId);
            } else {
                // Генерируем кроссворд из словаря (автоматический режим)
                if (!settings.wordCount || settings.wordCount === 'undefined' || settings.wordCount === undefined) {
                    alert('Не указано количество слов для генерации кроссворда');
                    this.showDashboard();
                    return;
                }
                
                // Преобразуем wordCount в число, если это строка
                const wordCount = typeof settings.wordCount === 'string' ? parseInt(settings.wordCount, 10) : settings.wordCount;
                if (isNaN(wordCount) || wordCount < 1) {
                    alert('Некорректное количество слов');
                    this.showDashboard();
                    return;
                }
                
                const title = `Кроссворд из словаря ${settings.dictionaryId}`;
                this.crossword = await ApiService.generateCrossword(
                    settings.dictionaryId, 
                    wordCount, 
                    title
                );
            }
            
            if (!this.crossword || !this.crossword.gridData || !this.crossword.wordsData) {
                alert('Ошибка загрузки кроссворда');
                this.showDashboard();
                return;
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
            
            // Создаем игру
            const gameResult = await ApiService.startGame(this.crossword.id, user.id);
            if (gameResult && gameResult.game) {
                this.currentGame = gameResult.game;
            }
            
            // Отображаем кроссворд
            this.renderGrid();
            this.renderWordsList();
            this.updateStats();
        } catch (error) {
            console.error('Ошибка загрузки игры:', error);
            alert('Ошибка загрузки игры: ' + (error.message || 'Неизвестная ошибка'));
            this.showDashboard();
        }
    }

    renderGrid() {
        const gridContainer = document.getElementById('crossword-grid');
        if (!gridContainer) {
            console.error('Элемент crossword-grid не найден');
            return;
        }
        
        gridContainer.innerHTML = '';
        
        if (!this.grid || !this.grid.size) {
            console.error('Данные сетки отсутствуют');
            return;
        }
        
        const width = this.grid.size.width;
        const height = this.grid.size.height;
        
        // Создаем таблицу для сетки
        const table = document.createElement('table');
        table.className = 'crossword-table';
        
        // Создаем карту клеток для быстрого доступа
        const cellMap = new Map();
        if (this.grid.cells) {
            this.grid.cells.forEach(cell => {
                const key = `${cell.x},${cell.y}`;
                cellMap.set(key, cell);
            });
        }
        
        // Создаем строки и ячейки
        for (let y = 0; y < height; y++) {
            const row = document.createElement('tr');
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('td');
                const key = `${x},${y}`;
                const cellData = cellMap.get(key);
                
                if (cellData && cellData.isBlack) {
                    // Черная клетка (препятствие)
                    cell.className = 'grid-cell black';
                    cell.textContent = '';
                } else if (cellData) {
                    // Обычная клетка
                    cell.className = 'grid-cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    
                    // Номер слова
                    if (cellData.number) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        numberSpan.textContent = cellData.number;
                        cell.appendChild(numberSpan);
                    }
                    
                    // Буква (если есть)
                    const letterInput = document.createElement('input');
                    letterInput.type = 'text';
                    letterInput.maxLength = 1;
                    letterInput.className = 'cell-input';
                    letterInput.dataset.x = x;
                    letterInput.dataset.y = y;
                    
                    if (cellData.letter) {
                        letterInput.value = cellData.letter;
                        letterInput.disabled = true;
                        cell.classList.add('solved');
                    }
                    
                    // Обработчики событий
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
                    // Пустая клетка (вне сетки)
                    cell.className = 'grid-cell empty';
                }
                
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        
        gridContainer.appendChild(table);
    }

    renderWordsList() {
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
    }

    selectCell(x, y) {
        this.selectedCell = { x, y };
        
        // Находим слово, которое содержит эту клетку
        const word = this.findWordByCell(x, y);
        if (word) {
            this.currentWord = word;
            this.highlightWord(word);
        }
    }

    findWordByCell(x, y) {
        return this.words.find(word => {
            if (!word.positions || word.positions.length < 2) return false;
            
            for (let i = 0; i < word.positions.length; i += 2) {
                if (word.positions[i] === x && word.positions[i + 1] === y) {
                    return true;
                }
            }
            return false;
        });
    }

    highlightWord(word) {
        // Убираем предыдущее выделение
        document.querySelectorAll('.grid-cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        // Выделяем клетки слова
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
        
        // Выделяем слово в списке
        document.querySelectorAll('.word-item').forEach(item => {
            item.classList.remove('active');
        });
        const wordItem = document.querySelector(`.word-item[data-word-number="${word.number}"]`);
        if (wordItem) {
            wordItem.classList.add('active');
        }
        
        // Обновляем текущую подсказку
        this.updateCurrentHint(word);
    }

    updateCurrentHint(word) {
        const hintText = document.getElementById('current-hint-text');
        if (hintText && word) {
            hintText.textContent = `${word.number}. ${word.definition || 'Нет описания'}`;
        }
    }

    handleCellInput(input, x, y) {
        const value = input.value.toUpperCase().replace(/[^А-ЯA-Z]/g, '');
        input.value = value;
        
        if (value) {
            // Проверяем правильность буквы
            this.checkLetter(input, x, y, value);
            
            // Переходим к следующей клетке слова
            this.moveToNextCell(x, y);
        } else {
            // Если буква удалена, убираем подсветку
            input.classList.remove('correct-letter', 'incorrect-letter');
        }
        
        // Проверяем слово
        this.checkWord();
    }
    
    checkLetter(input, x, y, userLetter) {
        // Находим слово, содержащее эту клетку
        const word = this.findWordByCell(x, y);
        if (!word || !word.positions) return;
        
        // Находим позицию буквы в слове
        let letterIndex = -1;
        for (let i = 0; i < word.positions.length; i += 2) {
            if (word.positions[i] === x && word.positions[i + 1] === y) {
                letterIndex = i / 2;
                break;
            }
        }
        
        if (letterIndex === -1) return;
        
        // Получаем правильную букву
        const correctLetter = word.text.charAt(letterIndex).toUpperCase();
        
        // Сравниваем
        if (userLetter === correctLetter) {
            input.classList.remove('incorrect-letter');
            input.classList.add('correct-letter');
        } else {
            input.classList.remove('correct-letter');
            input.classList.add('incorrect-letter');
        }
    }

    handleCellKeydown(e, x, y) {
        if (e.key === 'Backspace' && !e.target.value) {
            // Переходим к предыдущей клетке
            this.moveToPreviousCell(x, y);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.moveToPreviousCell(x, y);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.moveToNextCell(x, y);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            // Можно добавить переход по вертикали
        }
    }

    moveToNextCell(x, y) {
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
    }

    moveToPreviousCell(x, y) {
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
    }

    selectWord(word) {
        this.currentWord = word;
        this.highlightWord(word);
        
        // Фокусируемся на первой клетке слова
        if (word.positions && word.positions.length >= 2) {
            const firstX = word.positions[0];
            const firstY = word.positions[1];
            const firstInput = document.querySelector(`.cell-input[data-x="${firstX}"][data-y="${firstY}"]`);
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }
    }

    async checkWord() {
        if (!this.currentWord) return;
        
        // Собираем буквы из клеток слова
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
            // Правильно! Блокируем клетки
            if (this.currentWord.positions) {
                for (let i = 0; i < this.currentWord.positions.length; i += 2) {
                    const x = this.currentWord.positions[i];
                    const y = this.currentWord.positions[i + 1];
                    const input = document.querySelector(`.cell-input[data-x="${x}"][data-y="${y}"]`);
                    const cell = input?.closest('.grid-cell');
                    if (input && cell) {
                        input.disabled = true;
                        cell.classList.add('solved');
                    }
                }
            }
            
            this.currentWord.isSolved = true;
            this.renderWordsList();
            this.updateStats();
            
            // Проверяем, завершена ли игра
            const allSolved = this.words.every(w => w.isSolved);
            if (allSolved) {
                setTimeout(() => this.completeGame(), 1000);
            }
        }
    }

    updateStats() {
        const totalWords = this.words.length;
        const solvedWords = this.words.filter(w => w.isSolved).length;
        
        const wordsCountEl = document.getElementById('words-count');
        const correctCountEl = document.getElementById('correct-count');
        
        if (wordsCountEl) wordsCountEl.textContent = totalWords;
        if (correctCountEl) correctCountEl.textContent = solvedWords;
    }

    completeGame() {
        document.getElementById('final-words-count').textContent = this.words.filter(w => w.isSolved).length;
        document.getElementById('game-complete-modal').classList.add('active');
    }

    restartGame() {
        document.getElementById('game-complete-modal').classList.remove('active');
        
        // Если это был ручной кроссворд, возвращаемся на дашборд
        if (this.gameSettings && this.gameSettings.isManual) {
            this.showDashboard();
            return;
        }
        
        // Для автоматического режима создаем новый кроссворд с теми же настройками
        if (this.gameSettings && this.gameSettings.wordCount) {
            // Убираем старый crosswordId, чтобы создать новый
            const newSettings = {
                dictionaryId: this.gameSettings.dictionaryId,
                wordCount: this.gameSettings.wordCount
            };
            this.startGame(newSettings);
        } else {
            // Если настроек нет или они некорректны, возвращаемся на дашборд
            this.showDashboard();
        }
    }

    showDashboard() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        document.getElementById('game-complete-modal').classList.remove('active');
    }
}

// Глобальный экземпляр
const gameManager = new GameManager();
