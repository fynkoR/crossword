// Управление ручным составлением кроссворда
class ManualCrosswordManager {
    constructor() {
        this.dictionaryId = null;
        this.allWords = [];
        this.selectedWords = [];
        this.availableWords = [];
        this.filteredWords = [];
        this.currentSortBy = null;
        this.searchQuery = '';
        this.init();
    }

    init() {
        // Кнопка назад
        document.getElementById('back-from-manual').addEventListener('click', () => {
            this.goBack();
        });

        // Кнопка очистки цепочки
        document.getElementById('clear-chain-btn').addEventListener('click', () => {
            this.clearChain();
        });

        // Кнопка создания кроссворда
        document.getElementById('create-manual-crossword-btn').addEventListener('click', () => {
            this.createCrossword();
        });

        // Кнопка удаления последнего слова
        document.getElementById('remove-last-word-btn').addEventListener('click', () => {
            this.removeLastWord();
        });

        // Обработчик поиска
        const searchInput = document.getElementById('manual-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.applyFiltersAndSort();
            });
        }

        // Обработчик сортировки
        const sortSelect = document.getElementById('manual-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSortBy = e.target.value || null;
                this.applyFiltersAndSort();
            });
        }
    }

    async start(dictionaryId) {
        this.dictionaryId = dictionaryId;
        this.selectedWords = [];
        this.availableWords = [];
        this.filteredWords = [];
        this.currentSortBy = null;
        this.searchQuery = '';

        // Сбрасываем поля поиска и сортировки
        const searchInput = document.getElementById('manual-search-input');
        const sortSelect = document.getElementById('manual-sort-select');
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = '';

        try {
            // Загружаем все слова из словаря
            this.allWords = await ApiService.getWordsFromDictionary(dictionaryId);
            this.updateAvailableWords();
            this.updateDisplay();
        } catch (error) {
            console.error('Ошибка загрузки слов:', error);
            alert('Ошибка загрузки слов из словаря');
        }
    }

    updateAvailableWords() {
        if (this.selectedWords.length === 0) {
            // Первое слово - все слова доступны
            this.availableWords = [...this.allWords];
        } else {
            // Следующие слова - только те, что начинаются с последней буквы последнего выбранного слова
            const lastWord = this.selectedWords[this.selectedWords.length - 1];
            const lastLetter = lastWord.word[lastWord.word.length - 1].toLowerCase();
            
            this.availableWords = this.allWords.filter(word => {
                // Исключаем уже выбранные слова
                if (this.selectedWords.some(sw => sw.id === word.id)) {
                    return false;
                }
                // Проверяем, что слово начинается с нужной буквы
                return word.word.toLowerCase().startsWith(lastLetter);
            });
        }
        // Применяем фильтры и сортировку
        this.applyFiltersAndSort();
    }

    applyFiltersAndSort() {
        // Начинаем с доступных слов
        this.filteredWords = [...this.availableWords];

        // Применяем поиск
        if (this.searchQuery) {
            this.filteredWords = this.filteredWords.filter(word => {
                const wordText = word.word.toLowerCase();
                const definition = (word.definition || '').toLowerCase();
                return wordText.includes(this.searchQuery) || definition.includes(this.searchQuery);
            });
        }

        // Применяем сортировку
        if (this.currentSortBy) {
            this.filteredWords.sort((a, b) => {
                switch (this.currentSortBy) {
                    case 'alphabet-asc':
                        return a.word.localeCompare(b.word, 'ru');
                    case 'alphabet-desc':
                        return b.word.localeCompare(a.word, 'ru');
                    case 'length-asc':
                        return a.word.length - b.word.length;
                    case 'length-desc':
                        return b.word.length - a.word.length;
                    default:
                        return 0;
                }
            });
        }

        // Обновляем отображение
        this.updateAvailableWordsList();
    }

    selectWord(word) {
        if (this.selectedWords.length >= 10) {
            alert('Максимум 10 слов в цепочке');
            return;
        }

        this.selectedWords.push(word);
        this.updateAvailableWords();
        this.updateDisplay();
    }

    removeLastWord() {
        if (this.selectedWords.length > 0) {
            this.selectedWords.pop();
            this.updateAvailableWords();
            this.updateDisplay();
        }
    }

    clearChain() {
        if (confirm('Очистить всю цепочку слов?')) {
            this.selectedWords = [];
            this.updateAvailableWords();
            this.updateDisplay();
        }
    }

    updateDisplay() {
        // Обновляем отображение цепочки
        this.updateWordChain();
        
        // Обновляем список доступных слов
        this.updateAvailableWordsList();
        
        // Обновляем счетчик и статус
        this.updateStatus();
    }

    updateWordChain() {
        const chainDisplay = document.getElementById('word-chain-display');
        
        if (this.selectedWords.length === 0) {
            chainDisplay.innerHTML = '<p class="empty-chain">Цепочка пуста. Выберите первое слово.</p>';
            return;
        }

        // Формируем цепочку в формате: слово1->слово2->слово3
        const chainText = this.selectedWords.map(w => w.word).join('->');
        chainDisplay.innerHTML = `<div class="word-chain"><strong>${chainText}</strong></div>`;
    }

    updateAvailableWordsList() {
        const wordsList = document.getElementById('available-words-list');
        const noWordsMessage = document.getElementById('no-words-message');
        const title = document.getElementById('word-selection-title');

        if (this.selectedWords.length === 0) {
            title.textContent = 'Выберите первое слово';
        } else {
            const lastWord = this.selectedWords[this.selectedWords.length - 1];
            const lastLetter = lastWord.word[lastWord.word.length - 1].toUpperCase();
            title.textContent = `Выберите слово, начинающееся с буквы "${lastLetter}"`;
        }

        // Используем отфильтрованные слова вместо доступных
        const wordsToDisplay = this.filteredWords.length > 0 ? this.filteredWords : this.availableWords;

        if (wordsToDisplay.length === 0) {
            wordsList.style.display = 'none';
            noWordsMessage.style.display = 'block';
            // Обновляем сообщение в зависимости от того, есть ли фильтры
            if (this.searchQuery) {
                noWordsMessage.querySelector('p').textContent = 'Нет слов, соответствующих поисковому запросу';
            } else if (this.availableWords.length === 0) {
                noWordsMessage.querySelector('p').textContent = 'Нет доступных слов для продолжения цепочки';
            } else {
                noWordsMessage.querySelector('p').textContent = 'Нет доступных слов для продолжения цепочки';
            }
        } else {
            wordsList.style.display = 'grid';
            noWordsMessage.style.display = 'none';
            wordsList.innerHTML = '';

            wordsToDisplay.forEach((word) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'available-word-item';
                wordItem.innerHTML = `
                    <div class="word-item-content">
                        <div class="word-text">${word.word}</div>
                        <div class="word-definition">${word.definition || 'Нет определения'}</div>
                    </div>
                    <button class="btn btn-primary btn-sm">Выбрать</button>
                `;
                const button = wordItem.querySelector('button');
                button.addEventListener('click', () => {
                    this.selectWord(word);
                });
                wordsList.appendChild(wordItem);
            });
        }
    }

    updateStatus() {
        const countElement = document.getElementById('selected-words-count');
        const statusElement = document.getElementById('chain-status');
        const createBtn = document.getElementById('create-manual-crossword-btn');

        countElement.textContent = this.selectedWords.length;

        if (this.selectedWords.length < 3) {
            statusElement.textContent = 'Минимум 3 слова';
            statusElement.className = 'chain-status warning';
            createBtn.disabled = true;
        } else if (this.selectedWords.length >= 3 && this.selectedWords.length <= 10) {
            statusElement.textContent = 'Готово к созданию';
            statusElement.className = 'chain-status success';
            createBtn.disabled = false;
        } else {
            statusElement.textContent = 'Максимум 10 слов';
            statusElement.className = 'chain-status error';
            createBtn.disabled = true;
        }
    }

    async createCrossword() {
        if (this.selectedWords.length < 3 || this.selectedWords.length > 10) {
            alert('Цепочка должна содержать от 3 до 10 слов');
            return;
        }

        // Валидация цепочки
        for (let i = 0; i < this.selectedWords.length - 1; i++) {
            const currentWord = this.selectedWords[i].word.toLowerCase();
            const nextWord = this.selectedWords[i + 1].word.toLowerCase();
            const lastLetter = currentWord[currentWord.length - 1];
            const firstLetter = nextWord[0];

            if (lastLetter !== firstLetter) {
                alert(`Ошибка: слово "${this.selectedWords[i + 1].word}" должно начинаться с буквы "${lastLetter.toUpperCase()}"`);
                return;
            }
        }

        try {
            // Создаем кроссворд из выбранных слов
            const wordIds = this.selectedWords.map(w => w.id);
            
            // Получаем название из поля ввода
            let baseTitle = document.getElementById('manual-crossword-title-input').value.trim();
            
            // Получаем количество подсказок
            const maxHintsInput = document.getElementById('manual-crossword-max-hints-input');
            let maxHints = null;
            if (maxHintsInput && maxHintsInput.value.trim() !== '') {
                const parsed = parseInt(maxHintsInput.value.trim(), 10);
                if (!isNaN(parsed) && parsed >= 0) {
                    maxHints = parsed;
                }
            }
            
            // Если название не указано, используем дефолтное
            if (!baseTitle) {
                baseTitle = `Кроссворд (${this.selectedWords.length} слов)`;
            }
            
            // Добавляем режим создания в скобках
            const title = `${baseTitle} (Ручной)`;
            
            // Получаем текущего пользователя
            const user = typeof authManager !== 'undefined' ? authManager.getCurrentUser() : null;
            const userId = user && user.id ? user.id : null;
            
            const crossword = await ApiService.createManualCrossword(this.dictionaryId, wordIds, title, maxHints, userId);
            
            // Переходим к экрану выбора кроссворда
            document.getElementById('manual-crossword-screen').classList.remove('active');
            document.getElementById('crossword-selection-screen').classList.add('active');
            
            // Обновляем список кроссвордов
            if (typeof crosswordSelectionManager !== 'undefined') {
                await crosswordSelectionManager.loadCrosswords();
            }
            
            alert(`Кроссворд "${crossword.title}" успешно создан!`);
        } catch (error) {
            console.error('Ошибка создания кроссворда:', error);
            alert('Ошибка создания кроссворда: ' + error.message);
        }
    }

    goBack() {
        document.getElementById('manual-crossword-screen').classList.remove('active');
        document.getElementById('crossword-creation-screen').classList.add('active');
        this.selectedWords = [];
        this.availableWords = [];
    }
}

// Глобальный экземпляр
const manualCrosswordManager = new ManualCrosswordManager();

