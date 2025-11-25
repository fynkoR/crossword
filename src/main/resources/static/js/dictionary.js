// Управление словарями
class DictionaryManager {
    constructor() {
        console.log('[DictionaryManager] Constructor called');
        this.currentDictionaryId = null;
        this.currentWords = [];
        this.currentSortBy = null;
        this.init();
    }

    init() {
        console.log('DictionaryManager: init() called');
        
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

        // Обработчик изменения сортировки через делегирование событий
        // Используем делегирование, так как элемент может быть создан динамически
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'sort-select') {
                console.log('[DELEGATION] Sort select changed:', e.target.value);
                this.handleSortChange(e.target.value);
            }
        });
        
        console.log('DictionaryManager: init() completed');
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
        console.log('[openDictionary] Opening dictionary with id:', id);
        this.currentDictionaryId = id;
        
        try {
            const dictionary = await ApiService.getDictionary(id);
            console.log('[openDictionary] Dictionary loaded:', dictionary.title);
            document.getElementById('dictionary-detail-title').textContent = dictionary.title;
            
            // Переключаемся на вкладку слов
            this.switchDictionaryTab('words');
            console.log('[openDictionary] Switched to words tab');
            
            // Сбрасываем сортировку при открытии словаря
            this.currentSortBy = null;
            const sortSelect = document.getElementById('sort-select');
            console.log('[openDictionary] sort-select element found:', !!sortSelect);
            
            if (sortSelect) {
                sortSelect.value = '';
                console.log('[openDictionary] Sort select value reset to empty');
                
                // Удаляем старый обработчик, если есть, и добавляем новый
                const newSortSelect = sortSelect.cloneNode(true);
                sortSelect.parentNode.replaceChild(newSortSelect, sortSelect);
                console.log('[openDictionary] Sort select element cloned and replaced');
                
                // Добавляем прямой обработчик
                newSortSelect.addEventListener('change', (e) => {
                    console.log('[DIRECT HANDLER] Sort select changed:', e.target.value);
                    this.handleSortChange(e.target.value);
                });
                console.log('[openDictionary] Direct change handler attached to sort-select');
            } else {
                console.warn('[openDictionary] sort-select element NOT FOUND!');
            }
            
            // Загружаем слова
            console.log('[openDictionary] Loading words...');
            await this.loadWords(id);
            
            // Показываем модальное окно
            document.getElementById('dictionary-detail-modal').classList.add('active');
            console.log('[openDictionary] Modal opened');
        } catch (error) {
            console.error('[openDictionary] Error:', error);
            alert('Ошибка загрузки словаря: ' + error.message);
        }
    }

    handleSortChange(sortValue) {
        console.log('[handleSortChange] Called with value:', sortValue);
        this.currentSortBy = sortValue || null;
        console.log('[handleSortChange] Current sortBy:', this.currentSortBy);
        console.log('[handleSortChange] Current dictionaryId:', this.currentDictionaryId);
        
        if (this.currentDictionaryId) {
            console.log('[handleSortChange] Loading words with sort:', this.currentSortBy);
            this.loadWords(this.currentDictionaryId);
        } else {
            console.warn('[handleSortChange] No dictionary ID, cannot load words');
        }
    }

    async loadWords(dictionaryId) {
        try {
            console.log('[loadWords] Called with dictionaryId:', dictionaryId, 'sortBy:', this.currentSortBy);
            // Загружаем слова с учетом текущей сортировки
            this.currentWords = await ApiService.getWordsFromDictionary(dictionaryId, this.currentSortBy);
            console.log('[loadWords] Words loaded from API:', this.currentWords.length, 'words');
            this.displayWords();
        } catch (error) {
            console.error('[loadWords] Error loading words:', error);
            alert('Ошибка загрузки слов: ' + error.message);
        }
    }

    displayWords() {
        console.log('[displayWords] Called');
        const container = document.getElementById('words-list');
        if (!container) {
            console.error('[displayWords] words-list container NOT FOUND!');
            return;
        }
        
        console.log('[displayWords] Container found, current words:', this.currentWords.length);
        container.innerHTML = '';

        if (this.currentWords.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">Слова не найдены. Добавьте слова или импортируйте из файла.</p>';
            return;
        }

        this.currentWords.forEach((word, index) => {
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
            if (index < 3) {
                console.log(`Added word ${index + 1}:`, word.word);
            }
        });
        console.log('displayWords() completed, total items:', container.children.length);
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
console.log('[DictionaryManager] Creating global instance...');
const dictionaryManager = new DictionaryManager();
console.log('[DictionaryManager] Global instance created:', dictionaryManager);

