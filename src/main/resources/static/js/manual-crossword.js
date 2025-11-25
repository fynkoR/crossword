// Управление ручным составлением кроссворда
class ManualCrosswordManager {
    constructor() {
        this.dictionaryId = null;
        this.allWords = [];
        this.selectedWords = [];
        this.availableWords = [];
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
        document.getElementById('create-crossword-btn').addEventListener('click', () => {
            this.createCrossword();
        });

        // Кнопка удаления последнего слова
        document.getElementById('remove-last-word-btn').addEventListener('click', () => {
            this.removeLastWord();
        });
    }

    async start(dictionaryId) {
        this.dictionaryId = dictionaryId;
        this.selectedWords = [];
        this.availableWords = [];

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

        if (this.availableWords.length === 0) {
            wordsList.style.display = 'none';
            noWordsMessage.style.display = 'block';
        } else {
            wordsList.style.display = 'grid';
            noWordsMessage.style.display = 'none';
            wordsList.innerHTML = '';

            this.availableWords.forEach((word, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'available-word-item';
                wordItem.innerHTML = `
                    <div class="word-item-content">
                        <div class="word-text">${word.word}</div>
                        <div class="word-definition">${word.definition || 'Нет определения'}</div>
                    </div>
                    <button class="btn btn-primary btn-sm" data-word-index="${index}">Выбрать</button>
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
        const createBtn = document.getElementById('create-crossword-btn');

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
            const title = `Ручной кроссворд (${this.selectedWords.length} слов)`;
            
            const crossword = await ApiService.createManualCrossword(this.dictionaryId, wordIds, title);
            
            // Переходим к игре
            document.getElementById('manual-crossword-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            
            // Запускаем игру с уже созданным кроссвордом
            if (typeof gameManager !== 'undefined') {
                gameManager.startGame({
                    dictionaryId: this.dictionaryId,
                    crosswordId: crossword.id,
                    isManual: true  // Явно указываем, что это ручной режим
                });
            }
        } catch (error) {
            console.error('Ошибка создания кроссворда:', error);
            alert('Ошибка создания кроссворда: ' + error.message);
        }
    }

    goBack() {
        document.getElementById('manual-crossword-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        this.selectedWords = [];
        this.availableWords = [];
    }
}

// Глобальный экземпляр
const manualCrosswordManager = new ManualCrosswordManager();

