// Управление игрой в линейный кроссворд
class GameManager {
    constructor() {
        this.currentGame = null;
        this.words = [];
        this.currentWordIndex = 0;
        this.correctWords = [];
        this.gameSettings = null;
        this.init();
    }

    init() {
        // Кнопка назад
        document.getElementById('back-to-dashboard-from-game').addEventListener('click', () => {
            this.showDashboard();
        });

        // Обработка ввода слова
        document.getElementById('word-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkWord();
            }
        });

        // Кнопка проверки
        document.getElementById('check-word-btn').addEventListener('click', () => {
            this.checkWord();
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
        this.currentWordIndex = 0;
        this.correctWords = [];
        
        try {
            // Загружаем слова из словаря
            const words = await ApiService.getWordsFromDictionary(settings.dictionaryId);
            
            if (words.length < settings.wordCount) {
                alert(`В словаре недостаточно слов. Нужно минимум ${settings.wordCount} слов.`);
                this.showDashboard();
                return;
            }

            // Выбираем случайные слова для игры
            this.words = this.selectRandomWords(words, settings.wordCount);
            
            // Проверяем, можно ли составить цепочку
            if (!this.canFormChain(this.words)) {
                // Если нельзя, пытаемся найти подходящие слова
                this.words = this.findChainableWords(words, settings.wordCount);
                
                if (this.words.length < settings.wordCount) {
                    alert('Не удалось найти слова, которые можно соединить в цепочку. Попробуйте другой словарь.');
                    this.showDashboard();
                    return;
                }
            }

            // Перемешиваем слова для игры
            this.shuffleArray(this.words);
            
            // Инициализируем игру
            this.currentWordIndex = 0;
            this.updateGameDisplay();
            this.updateStats();
        } catch (error) {
            console.error('Ошибка загрузки игры:', error);
            alert('Ошибка загрузки игры: ' + error.message);
            this.showDashboard();
        }
    }

    selectRandomWords(words, count) {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    canFormChain(words) {
        // Проверяем, можно ли составить цепочку из слов
        // Для простоты проверяем, есть ли хотя бы одна пара слов, которые можно соединить
        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j < words.length; j++) {
                const word1 = words[i].word.toLowerCase();
                const word2 = words[j].word.toLowerCase();
                
                if (word1[word1.length - 1] === word2[0] || word2[word2.length - 1] === word1[0]) {
                    return true;
                }
            }
        }
        return false;
    }

    findChainableWords(allWords, count) {
        // Находим слова, которые можно соединить в цепочку
        const words = allWords.map(w => w.word.toLowerCase());
        const result = [];
        const used = new Set();
        
        // Начинаем с первого слова
        if (words.length === 0) return [];
        
        let currentWord = words[0];
        result.push(allWords[0]);
        used.add(0);
        
        // Ищем слова, которые можно добавить в цепочку
        while (result.length < count && result.length < words.length) {
            const lastLetter = currentWord[currentWord.length - 1];
            let found = false;
            
            for (let i = 0; i < words.length; i++) {
                if (used.has(i)) continue;
                
                if (words[i][0] === lastLetter) {
                    result.push(allWords[i]);
                    used.add(i);
                    currentWord = words[i];
                    found = true;
                    break;
                }
            }
            
            // Если не нашли подходящее слово, пробуем начать с другого
            if (!found) {
                for (let i = 0; i < words.length; i++) {
                    if (used.has(i)) continue;
                    
                    // Пробуем найти слово, которое начинается с последней буквы любого слова в цепочке
                    for (const word of result) {
                        const wordLower = word.word.toLowerCase();
                        const lastLetter = wordLower[wordLower.length - 1];
                        
                        if (words[i][0] === lastLetter) {
                            result.push(allWords[i]);
                            used.add(i);
                            currentWord = words[i];
                            found = true;
                            break;
                        }
                    }
                    
                    if (found) break;
                }
            }
            
            if (!found) break;
        }
        
        return result;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    updateGameDisplay() {
        const word = this.words[this.currentWordIndex];
        const definition = word.definition || 'Нет определения';
        
        document.getElementById('word-definition').textContent = definition;
        document.getElementById('word-input').value = '';
        document.getElementById('word-input').className = 'word-input';
        document.getElementById('word-feedback').classList.remove('show');
        
        // Обновляем цепочку слов
        this.updateWordsChain();
    }

    updateWordsChain() {
        const container = document.getElementById('words-chain');
        container.innerHTML = '';
        
        this.correctWords.forEach((wordData, index) => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word-in-chain correct';
            wordDiv.textContent = wordData.word;
            container.appendChild(wordDiv);
            
            // Добавляем стрелку между словами
            if (index < this.correctWords.length - 1) {
                const connector = document.createElement('span');
                connector.className = 'word-connector';
                connector.textContent = ' → ';
                container.appendChild(connector);
            }
        });
    }

    checkWord() {
        const input = document.getElementById('word-input');
        const userWord = input.value.trim().toLowerCase();
        const currentWord = this.words[this.currentWordIndex];
        const correctWord = currentWord.word.toLowerCase();
        const feedbackDiv = document.getElementById('word-feedback');
        
        // Проверяем правильность слова
        if (userWord === correctWord) {
            // Проверяем, можно ли добавить это слово в цепочку
            if (this.correctWords.length === 0) {
                // Первое слово - всегда можно добавить
                this.correctWords.push({
                    word: currentWord.word,
                    definition: currentWord.definition
                });
                input.className = 'word-input correct';
                feedbackDiv.className = 'word-feedback success show';
                feedbackDiv.textContent = '✓ Правильно!';
                
                this.currentWordIndex++;
                this.updateStats();
                
                // Проверяем, завершена ли игра
                if (this.currentWordIndex >= this.words.length) {
                    setTimeout(() => this.completeGame(), 1000);
                } else {
                    setTimeout(() => this.updateGameDisplay(), 1500);
                }
            } else {
                // Проверяем связь с предыдущим словом
                const lastWord = this.correctWords[this.correctWords.length - 1].word.toLowerCase();
                const lastLetter = lastWord[lastWord.length - 1];
                const firstLetter = correctWord[0];
                
                if (lastLetter === firstLetter) {
                    // Правильно! Слово можно добавить
                    this.correctWords.push({
                        word: currentWord.word,
                        definition: currentWord.definition
                    });
                    input.className = 'word-input correct';
                    feedbackDiv.className = 'word-feedback success show';
                    feedbackDiv.textContent = '✓ Правильно! Слово добавлено в цепочку.';
                    
                    this.currentWordIndex++;
                    this.updateStats();
                    
                    // Обновляем цепочку
                    this.updateWordsChain();
                    
                    // Проверяем, завершена ли игра
                    if (this.currentWordIndex >= this.words.length) {
                        setTimeout(() => this.completeGame(), 1000);
                    } else {
                        setTimeout(() => this.updateGameDisplay(), 1500);
                    }
                } else {
                    // Слово правильное, но не подходит для цепочки
                    input.className = 'word-input incorrect';
                    feedbackDiv.className = 'word-feedback error show';
                    feedbackDiv.textContent = `Слово правильное, но последняя буква предыдущего слова "${lastLetter.toUpperCase()}" не совпадает с первой буквой этого слова "${firstLetter.toUpperCase()}". Попробуйте другое слово.`;
                    
                    // Пропускаем это слово и переходим к следующему
                    this.currentWordIndex++;
                    if (this.currentWordIndex >= this.words.length) {
                        setTimeout(() => this.completeGame(), 2000);
                    } else {
                        setTimeout(() => this.updateGameDisplay(), 2000);
                    }
                }
            }
        } else {
            // Неправильное слово
            input.className = 'word-input incorrect';
            feedbackDiv.className = 'word-feedback error show';
            feedbackDiv.textContent = '✗ Неправильно. Попробуйте ещё раз.';
        }
    }

    updateStats() {
        document.getElementById('words-count').textContent = this.words.length;
        document.getElementById('correct-count').textContent = this.correctWords.length;
    }

    completeGame() {
        document.getElementById('final-words-count').textContent = this.correctWords.length;
        document.getElementById('game-complete-modal').classList.add('active');
    }

    restartGame() {
        document.getElementById('game-complete-modal').classList.remove('active');
        if (this.gameSettings) {
            this.startGame(this.gameSettings);
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

