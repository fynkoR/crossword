// Управление словарями
class DictionaryManager {
    constructor() {
        this.currentDictionaryId = null;
        this.currentWords = [];
        this.currentSortType = 'alphabet-asc';
        this.init();
    }

    init() {
        // Кнопка назад
        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            this.showDashboard();
        });

        // Кнопка создания словаря
        document.getElementById('create-dictionary-btn').addEventListener('click', () => {
            this.showCreateDictionaryModal();
        });

        // Форма создания словаря
        document.getElementById('create-dictionary-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createDictionary();
        });

        // Закрытие модальных окон
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Вкладки в модальном окне словаря
        document.querySelectorAll('.dictionary-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchDictionaryTab(tab);
            });
        });

        // Импорт
        document.getElementById('import-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.importDictionary();
        });

        // Экспорт
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportDictionary();
        });

        // Добавление слова
        document.getElementById('add-word-btn').addEventListener('click', () => {
            this.showAddWordModal();
        });

        // Сортировка слов
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            console.log('Sort select element found, attaching listener');
            sortSelect.addEventListener('change', (e) => {
                console.log('Sort event triggered');
                this.currentSortType = e.target.value;
                console.log('New sort type selected:', this.currentSortType);
                console.log('Current words count:', this.currentWords.length);
                
                // Показываем индикатор загрузки
                const container = document.getElementById('words-list');
                container.style.opacity = '0.5';
                
                setTimeout(() => {
                    console.log('Executing displayWords inside timeout');
                    this.displayWords();
                    container.style.opacity = '1';
                }, 100);
            });
        } else {
            console.error('Sort select element NOT found in init()');
        }
    }

    updateWordsListWithAnimation() {
        // Метод больше не используется, логика перенесена в event listener для отладки
    }

    showDashboard() {
        document.getElementById('dictionary-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
    }

    async loadDictionaries() {
        try {
            const dictionaries = await ApiService.getDictionaries();
            const container = document.getElementById('dictionaries-list');
            
            container.innerHTML = '';

            if (dictionaries.length === 0) {
                container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Словари не найдены. Создайте первый словарь!</p>';
                return;
            }

            dictionaries.forEach(dict => {
                const card = document.createElement('div');
                card.className = 'dictionary-card';
                card.innerHTML = `
                    <h3>${dict.title}</h3>
                    <p>${dict.description || 'Нет описания'}</p>
                    <div class="dictionary-stats">
                        <span>ID: ${dict.id}</span>
                    </div>
                    <div class="dictionary-actions">
                        <button class="btn btn-primary" onclick="dictionaryManager.openDictionary(${dict.id})">Открыть</button>
                        <button class="btn btn-secondary" onclick="dictionaryManager.deleteDictionary(${dict.id})">Удалить</button>
                    </div>
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Ошибка загрузки словарей:', error);
            alert('Ошибка загрузки словарей');
        }
    }

    showCreateDictionaryModal() {
        document.getElementById('create-dictionary-modal').classList.add('active');
        document.getElementById('dictionary-title').value = '';
        document.getElementById('dictionary-description').value = '';
    }

    async createDictionary() {
        const title = document.getElementById('dictionary-title').value;
        const description = document.getElementById('dictionary-description').value;

        if (!title.trim()) {
            alert('Введите название словаря');
            return;
        }

        try {
            await ApiService.createDictionary(title, description);
            document.getElementById('create-dictionary-modal').classList.remove('active');
            this.loadDictionaries();
        } catch (error) {
            alert('Ошибка создания словаря: ' + error.message);
        }
    }

    async openDictionary(id) {
        this.currentDictionaryId = id;
        
        try {
            const dictionary = await ApiService.getDictionary(id);
            document.getElementById('dictionary-detail-title').textContent = dictionary.title;
            
            // Переключаемся на вкладку слов
            this.switchDictionaryTab('words');
            
            // Устанавливаем начальную сортировку
            this.currentSortType = 'alphabet-asc';
            document.getElementById('sort-select').value = 'alphabet-asc';
            
            // Загружаем слова
            await this.loadWords(id);
            
            // Показываем модальное окно
            document.getElementById('dictionary-detail-modal').classList.add('active');
        } catch (error) {
            alert('Ошибка загрузки словаря: ' + error.message);
        }
    }

    async loadWords(dictionaryId) {
        try {
            this.currentWords = await ApiService.getWordsFromDictionary(dictionaryId);
            this.displayWords();
        } catch (error) {
            console.error('Ошибка загрузки слов:', error);
        }
    }

    sortWords(words) {
        console.log('Sorting words with type:', this.currentSortType);
        console.log('Words before sort (first 3):', words.slice(0, 3).map(w => w.word));
        
        const sorted = [...words];
        
        switch (this.currentSortType) {
            case 'alphabet-asc':
                sorted.sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase(), 'ru'));
                break;
            case 'alphabet-desc':
                sorted.sort((a, b) => b.word.toLowerCase().localeCompare(a.word.toLowerCase(), 'ru'));
                break;
            case 'length-asc':
                sorted.sort((a, b) => {
                    const lenDiff = a.word.length - b.word.length;
                    if (lenDiff !== 0) return lenDiff;
                    return a.word.toLowerCase().localeCompare(b.word.toLowerCase(), 'ru');
                });
                break;
            case 'length-desc':
                sorted.sort((a, b) => {
                    const lenDiff = b.word.length - a.word.length;
                    if (lenDiff !== 0) return lenDiff;
                    return a.word.toLowerCase().localeCompare(b.word.toLowerCase(), 'ru');
                });
                break;
        }
        
        console.log('Words after sort (first 3):', sorted.slice(0, 3).map(w => w.word));
        return sorted;
    }

    displayWords() {
        const container = document.getElementById('words-list');
        container.innerHTML = '';

        if (this.currentWords.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">Слова не найдены. Добавьте слова или импортируйте из файла.</p>';
            return;
        }

        const sortedWords = this.sortWords(this.currentWords);

        sortedWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';
            item.innerHTML = `
                <div>
                    <div class="word-text">${word.word}</div>
                    <div class="word-definition">${word.definition || 'Нет определения'}</div>
                </div>
                <div class="word-item-actions">
                    <button class="btn btn-secondary" onclick="dictionaryManager.deleteWord(${word.id})">Удалить</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    async deleteWord(wordId) {
        if (!confirm('Удалить это слово?')) return;

        try {
            await ApiService.deleteWord(wordId);
            await this.loadWords(this.currentDictionaryId);
        } catch (error) {
            alert('Ошибка удаления слова: ' + error.message);
        }
    }

    async deleteDictionary(id) {
        if (!confirm('Удалить этот словарь? Все связанные слова также будут удалены.')) return;

        try {
            await ApiService.deleteDictionary(id);
            alert('Словарь успешно удалён');
            this.loadDictionaries();
            
            // Закрываем модальное окно, если оно открыто
            document.getElementById('dictionary-detail-modal').classList.remove('active');
        } catch (error) {
            console.error('Ошибка удаления словаря:', error);
            let errorMessage = 'Ошибка удаления словаря';
            
            if (error.message) {
                // Пробуем извлечь более понятное сообщение
                if (error.message.includes('кроссворд')) {
                    errorMessage = error.message;
                } else if (error.message.includes('не найден')) {
                    errorMessage = 'Словарь не найден';
                } else {
                    errorMessage = error.message;
                }
            }
            
            alert(errorMessage);
        }
    }

    switchDictionaryTab(tab) {
        document.querySelectorAll('.dictionary-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.querySelectorAll('#dictionary-detail-modal .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
    }

    async importDictionary() {
        const fileInput = document.getElementById('import-file');
        const skipDuplicates = document.getElementById('skip-duplicates').checked;
        const resultDiv = document.getElementById('import-result');

        if (!fileInput.files[0]) {
            alert('Выберите файл');
            return;
        }

        if (!this.currentDictionaryId) {
            alert('Словарь не выбран');
            return;
        }

        try {
            resultDiv.innerHTML = '<p>Импорт...</p>';
            resultDiv.className = 'import-result';

            const result = await ApiService.importDictionary(
                this.currentDictionaryId,
                fileInput.files[0],
                skipDuplicates
            );

            resultDiv.className = 'import-result success';
            resultDiv.innerHTML = `
                <h4>Импорт завершён успешно!</h4>
                <div class="import-stats">
                    <div class="import-stat">
                        <span class="import-stat-number">${result.totalLines}</span>
                        <span class="import-stat-label">Всего строк</span>
                    </div>
                    <div class="import-stat">
                        <span class="import-stat-number">${result.successfullyImported}</span>
                        <span class="import-stat-label">Импортировано</span>
                    </div>
                    <div class="import-stat">
                        <span class="import-stat-number">${result.skipped}</span>
                        <span class="import-stat-label">Пропущено</span>
                    </div>
                    <div class="import-stat">
                        <span class="import-stat-number">${result.failed}</span>
                        <span class="import-stat-label">Ошибок</span>
                    </div>
                </div>
            `;

            // Обновляем список слов
            await this.loadWords(this.currentDictionaryId);
        } catch (error) {
            resultDiv.className = 'import-result error';
            resultDiv.innerHTML = `<p>Ошибка импорта: ${error.message}</p>`;
        }
    }

    async exportDictionary() {
        if (!this.currentDictionaryId) {
            alert('Словарь не выбран');
            return;
        }

        try {
            await ApiService.exportDictionary(this.currentDictionaryId);
            alert('Словарь успешно экспортирован!');
        } catch (error) {
            alert('Ошибка экспорта: ' + error.message);
        }
    }

    showAddWordModal() {
        const word = prompt('Введите слово:');
        if (!word) return;

        const definition = prompt('Введите определение (необязательно):') || '';

        this.addWord(word, definition);
    }

    async addWord(word, definition) {
        if (!this.currentDictionaryId) return;

        try {
            await ApiService.createWord(this.currentDictionaryId, word, definition);
            await this.loadWords(this.currentDictionaryId);
        } catch (error) {
            alert('Ошибка добавления слова: ' + error.message);
        }
    }
}

// Глобальный экземпляр
const dictionaryManager = new DictionaryManager();

