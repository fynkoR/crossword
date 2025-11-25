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

        // Кнопка использования подсказки
        document.getElementById('use-hint-btn').addEventListener('click', () => {
            this.useHint();
        });
    }

    async startGame(settings) {
        console.log('GameManager.startGame v2');
        // Сбрасываем настройки и устанавливаем новые
        this.gameSettings = settings || {};
        
        console.log('GameManager.startGame вызван с настройками:', this.gameSettings);
        console.log('settings параметр:', settings);
        
        try {
            // Если кроссворд уже создан, загружаем его
            // Проверяем crosswordId как число или строку
            const crosswordId = this.gameSettings.crosswordId;
            
            // Ранняя проверка: если есть crosswordId, сразу загружаем кроссворд
            if (crosswordId != null && crosswordId !== '' && crosswordId !== undefined) {
                // Преобразуем в число
                const id = typeof crosswordId === 'string' ? parseInt(crosswordId, 10) : crosswordId;
                
                if (!isNaN(id) && isFinite(id)) {
                    console.log('Найден crosswordId, загружаем кроссворд с ID:', id);
                    try {
                        this.crossword = await ApiService.getCrosswordDetail(id);
                        
                        if (!this.crossword) {
                            alert('Кроссворд не найден');
                            this.showDashboard();
                            return;
                        }
                        
                        console.log('Кроссворд загружен:', this.crossword);
                        
                        // Сохраняем dictionaryId из загруженного кроссворда для возможного рестарта
                        if (this.crossword.dictionary && this.crossword.dictionary.id) {
                            this.gameSettings.dictionaryId = this.crossword.dictionary.id;
                            console.log('DictionaryId сохранен из dictionary:', this.gameSettings.dictionaryId);
                        } else if (this.crossword.dictionaryId) {
                            this.gameSettings.dictionaryId = this.crossword.dictionaryId;
                            console.log('DictionaryId сохранен напрямую:', this.gameSettings.dictionaryId);
            } else {
                            console.warn('DictionaryId не найден в кроссворде');
                        }
                        
                        // Пропускаем остальную логику и переходим к отображению
                        this.grid = this.crossword.gridData;
                        this.words = this.crossword.wordsData.words || [];
                        
                        // Создаем игру на backend
                        const user = authManager.getCurrentUser();
                        if (!user || !user.id) {
                            alert('Пользователь не авторизован');
                            this.showDashboard();
                            return;
                        }
                        
                        // Создаем или загружаем игру
                        const gameResult = await ApiService.startGame(this.crossword.id, user.id);
                        if (gameResult && gameResult.game) {
                            this.currentGame = gameResult.game;
                            
                            // Восстанавливаем состояние сетки, если оно есть
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
                        return; // Выходим из метода, так как кроссворд загружен
                    } catch (error) {
                        console.error('Ошибка загрузки кроссворда:', error);
                        alert('Ошибка загрузки кроссворда: ' + (error.message || 'Неизвестная ошибка'));
                        this.showDashboard();
                        return;
                    }
                }
            }
            
            // Если дошли сюда, значит crosswordId не передан или невалиден - генерируем новый кроссворд
            console.log('Генерируем новый кроссворд, dictionaryId:', this.gameSettings.dictionaryId);
            
                // Генерируем кроссворд из словаря (автоматический режим)
            if (!this.gameSettings.dictionaryId) {
                alert('Не указан ID словаря');
                this.showDashboard();
                return;
            }
            
            if (!this.gameSettings.wordCount || this.gameSettings.wordCount === 'undefined' || this.gameSettings.wordCount === undefined) {
                alert('Не указано количество слов для генерации кроссворда');
                this.showDashboard();
                return;
            }
            
            // Преобразуем wordCount в число, если это строка
            const wordCount = typeof this.gameSettings.wordCount === 'string' ? parseInt(this.gameSettings.wordCount, 10) : this.gameSettings.wordCount;
            if (isNaN(wordCount) || wordCount < 1) {
                alert('Некорректное количество слов');
                this.showDashboard();
                return;
            }
            
            let baseTitle = `Кроссворд из словаря ${this.gameSettings.dictionaryId}`;
            // Добавляем режим создания в скобках
            const title = `${baseTitle} (Автоматический)`;
            // При генерации из дашборда используем дефолтное количество подсказок (null)
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
                
                // Восстанавливаем состояние сетки, если оно есть
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
        } catch (error) {
            console.error('Ошибка загрузки игры:', error);
            console.error('Настройки игры:', this.gameSettings);
            console.error('Кроссворд:', this.crossword);
            
            // Более информативное сообщение об ошибке
            let errorMessage = 'Ошибка загрузки игры';
            if (error.message) {
                errorMessage += ': ' + error.message;
            } else if (error.toString && error.toString() !== '[object Object]') {
                errorMessage += ': ' + error.toString();
            } else {
                errorMessage += ': Неизвестная ошибка';
            }
            
            alert(errorMessage);
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
                        if (cellData.isLocked) {
                        letterInput.disabled = true;
                            letterInput.classList.add('correct-letter');
                        cell.classList.add('solved');
                        } else {
                            // Буква введена пользователем, но не заблокирована
                            // Применяем правильный класс в зависимости от isCorrect
                            if (cellData.isCorrect === false) {
                                letterInput.classList.add('incorrect-letter');
                            } else if (cellData.isCorrect === true) {
                                letterInput.classList.add('correct-letter');
                            } else {
                                // Если isCorrect не определен, проверяем букву
                                // Находим слово, содержащее эту клетку
                                const word = this.findWordByCell(x, y);
                                if (word && word.positions) {
                                    // Находим позицию буквы в слове
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
                                        // Сохраняем isCorrect в cellData
                                        if (cellData) {
                                            cellData.isCorrect = isCorrect;
                                        }
                                    }
                                }
                            }
                        }
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
            
            // Обновляем состояние в grid
            if (this.grid && this.grid.cells) {
                const cell = this.grid.cells.find(c => c.x === x && c.y === y);
                if (cell) {
                    cell.letter = value;
                }
            }
            
            // Переходим к следующей клетке слова
            this.moveToNextCell(x, y);
        } else {
            // Если буква удалена, убираем подсветку
            input.classList.remove('correct-letter', 'incorrect-letter');
            
            // Обновляем состояние в grid
            if (this.grid && this.grid.cells) {
                const cell = this.grid.cells.find(c => c.x === x && c.y === y);
                if (cell && !cell.isLocked) {
                    cell.letter = null;
                }
            }
        }
        
        // Сохраняем состояние на сервере
        this.saveGridState();
        
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
        const isCorrect = userLetter === correctLetter;
        if (isCorrect) {
            input.classList.remove('incorrect-letter');
            input.classList.add('correct-letter');
        } else {
            input.classList.remove('correct-letter');
            input.classList.add('incorrect-letter');
        }
        
        // Сохраняем информацию о правильности в grid
        if (this.grid && this.grid.cells) {
            const cell = this.grid.cells.find(c => c.x === x && c.y === y);
            if (cell) {
                cell.isCorrect = isCorrect;
            }
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
                        
                        // Обновляем состояние в grid
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
            
            // Сохраняем состояние после отгадывания слова
            this.saveGridState();
            
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
        const hintsRemainingEl = document.getElementById('hints-remaining');
        
        if (wordsCountEl) wordsCountEl.textContent = totalWords;
        if (correctCountEl) correctCountEl.textContent = solvedWords;
        
        // Обновляем количество оставшихся подсказок
        if (hintsRemainingEl && this.crossword && this.currentGame) {
            const maxHints = this.crossword.maxHints || 0;
            const usedHints = this.currentGame.hintsUsed || 0;
            const remaining = Math.max(0, maxHints - usedHints);
            hintsRemainingEl.textContent = remaining;
            
            // Обновляем состояние кнопки подсказки
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
        
        // Если есть crosswordId, но нет wordCount - это готовый кроссворд, возвращаемся на экран выбора
        if (this.gameSettings && this.gameSettings.crosswordId && !this.gameSettings.wordCount) {
            this.showDashboard();
            return;
        }
        
        // Для автоматического режима создаем новый кроссворд с теми же настройками
        if (this.gameSettings && this.gameSettings.wordCount && this.gameSettings.dictionaryId) {
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

    async useHint() {
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
                // Парсим данные подсказки (JSON строка с координатами и буквой)
                if (result.data) {
                    try {
                        const hintData = JSON.parse(result.data);
                        const { x, y, letter } = hintData;
                        
                        // Находим соответствующую клетку и открываем букву
                        const cellInput = document.querySelector(`.cell-input[data-x="${x}"][data-y="${y}"]`);
                        if (cellInput) {
                            cellInput.value = letter.toUpperCase();
                            cellInput.disabled = true;
                            cellInput.classList.add('correct-letter');
                            cellInput.closest('.grid-cell').classList.add('solved');
                            
                            // Обновляем данные в grid
                            if (this.grid && this.grid.cells) {
                                const cell = this.grid.cells.find(c => c.x === x && c.y === y);
                                if (cell) {
                                    cell.letter = letter.toUpperCase();
                                    cell.isLocked = true;
                                }
                            }
                            
                            // Находим слово, содержащее эту клетку, и проверяем, не решено ли оно
                            const word = this.findWordByCell(x, y);
                            if (word) {
                                this.currentWord = word;
                                // Проверяем, не решено ли слово полностью
                                this.checkWord();
                            }
                        }
                    } catch (e) {
                        console.error('Ошибка парсинга данных подсказки:', e);
                    }
                }
                
                // Обновляем информацию об игре
                if (result.game) {
                    this.currentGame = result.game;
                }
                
                // Обновляем статистику
                this.updateStats();
                
                // Сохраняем состояние после использования подсказки
                this.saveGridState();
                
                alert(result.message || 'Подсказка использована');
            } else {
                alert(result.message || 'Не удалось использовать подсказку');
            }
        } catch (error) {
            console.error('Ошибка использования подсказки:', error);
            alert('Ошибка использования подсказки: ' + (error.message || 'Неизвестная ошибка'));
        } finally {
            // Обновляем состояние кнопки
            this.updateStats();
        }
    }

    /**
     * Получить текущее состояние сетки
     */
    getCurrentGridState() {
        if (!this.grid || !this.grid.cells) {
            return [];
        }
        
        const state = [];
        this.grid.cells.forEach(cell => {
            // Сохраняем только клетки с буквами или заблокированные
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
    }

    /**
     * Сохранить состояние сетки на сервере
     */
    async saveGridState() {
        if (!this.currentGame || !this.currentGame.id) {
            return;
        }
        
        try {
            const gridState = this.getCurrentGridState();
            const gridStateJson = JSON.stringify(gridState);
            
            await ApiService.saveGridState(this.currentGame.id, gridStateJson);
        } catch (error) {
            console.error('Ошибка сохранения состояния сетки:', error);
            // Не показываем ошибку пользователю, так как это фоновое сохранение
        }
    }

    /**
     * Восстановить состояние сетки из сохраненного
     */
    restoreGridState(savedState) {
        if (!savedState || !Array.isArray(savedState)) {
            return;
        }
        
        if (!this.grid || !this.grid.cells) {
            return;
        }
        
        // Восстанавливаем состояние клеток
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
        
        // Проверяем, какие слова полностью отгаданы
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
    }

    showDashboard() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        document.getElementById('game-complete-modal').classList.remove('active');
    }
}

// Глобальный экземпляр
const gameManager = new GameManager();
