// Управление экраном выбора кроссворда
class CrosswordSelectionManager {
    constructor() {
        this.allCrosswords = [];
        this.filteredCrosswords = [];
        this.init();
    }

    init() {
        // Кнопка назад
        document.getElementById('back-from-selection').addEventListener('click', () => {
            this.showDashboard();
        });

        // Кнопка создания нового кроссворда
        document.getElementById('create-new-crossword-btn').addEventListener('click', () => {
            this.showCreationScreen();
        });

        // Кнопка создания первого кроссворда
        const createFirstBtn = document.getElementById('create-first-crossword-btn');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => {
                this.showCreationScreen();
            });
        }

        // Фильтр по словарю
        const filterDictionarySelect = document.getElementById('filter-dictionary-select');
        filterDictionarySelect.addEventListener('change', () => {
            this.applyFilters();
        });

        // Поиск по названию
        const searchInput = document.getElementById('search-crossword-input');
        searchInput.addEventListener('input', () => {
            this.applyFilters();
        });
    }

    async show() {
        document.getElementById('crossword-selection-screen').classList.add('active');
        await this.loadDictionaries();
        await this.loadCrosswords();
    }

    async loadDictionaries() {
        try {
            const dictionaries = await ApiService.getDictionaries();
            const select = document.getElementById('filter-dictionary-select');
            
            select.innerHTML = '<option value="">Все словари</option>';
            
            dictionaries.forEach(dict => {
                const option = document.createElement('option');
                option.value = dict.id;
                option.textContent = dict.title;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка загрузки словарей:', error);
        }
    }

    async loadCrosswords() {
        try {
            this.allCrosswords = await ApiService.getCrosswords();
            this.applyFilters();
        } catch (error) {
            console.error('Ошибка загрузки кроссвордов:', error);
            this.renderCrosswords([]);
        }
    }

    applyFilters() {
        const dictionaryFilter = document.getElementById('filter-dictionary-select').value;
        const searchText = document.getElementById('search-crossword-input').value.toLowerCase().trim();

        this.filteredCrosswords = this.allCrosswords.filter(crossword => {
            // Фильтр по словарю
            if (dictionaryFilter && crossword.dictionary) {
                if (crossword.dictionary.id.toString() !== dictionaryFilter) {
                    return false;
                }
            }

            // Фильтр по названию
            if (searchText) {
                const title = (crossword.title || '').toLowerCase();
                if (!title.includes(searchText)) {
                    return false;
                }
            }

            return true;
        });

        this.renderCrosswords(this.filteredCrosswords);
    }

    renderCrosswords(crosswords) {
        const crosswordsList = document.getElementById('crosswords-list');
        const noCrosswordsMessage = document.getElementById('no-crosswords-message');

        if (crosswords.length === 0) {
            crosswordsList.style.display = 'none';
            noCrosswordsMessage.style.display = 'block';
            return;
        }

        crosswordsList.style.display = 'grid';
        noCrosswordsMessage.style.display = 'none';
        crosswordsList.innerHTML = '';

        crosswords.forEach(crossword => {
            const crosswordCard = document.createElement('div');
            crosswordCard.className = 'crossword-card';
            
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
            
            info.appendChild(gridSize);
            info.appendChild(dictionaryInfo);
            
            const actions = document.createElement('div');
            actions.className = 'crossword-actions';
            
            const playBtn = document.createElement('button');
            playBtn.className = 'btn btn-primary';
            playBtn.textContent = 'Играть';
            playBtn.addEventListener('click', () => {
                this.startGame(crossword.id);
            });
            
            const detailBtn = document.createElement('button');
            detailBtn.className = 'btn btn-secondary';
            detailBtn.textContent = 'Детали';
            detailBtn.addEventListener('click', () => {
                this.showCrosswordDetails(crossword.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.addEventListener('click', () => {
                this.deleteCrossword(crossword.id, crossword.title);
            });
            
            actions.appendChild(playBtn);
            actions.appendChild(detailBtn);
            actions.appendChild(deleteBtn);
            
            crosswordCard.appendChild(title);
            crosswordCard.appendChild(info);
            crosswordCard.appendChild(actions);
            
            crosswordsList.appendChild(crosswordCard);
        });
    }

    async startGame(crosswordId) {
        try {
            // Переходим к экрану игры
            document.getElementById('crossword-selection-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            
            // Запускаем игру с выбранным кроссвордом
            if (typeof gameManager !== 'undefined') {
                await gameManager.startGame({
                    crosswordId: crosswordId
                });
            }
        } catch (error) {
            console.error('Ошибка запуска игры:', error);
            alert('Ошибка запуска игры: ' + (error.message || 'Неизвестная ошибка'));
        }
    }

    async showCrosswordDetails(crosswordId) {
        try {
            const crossword = await ApiService.getCrosswordDetail(crosswordId);
            alert(`Кроссворд: ${crossword.title}\nСлов: ${crossword.wordsData?.words?.length || 0}`);
        } catch (error) {
            console.error('Ошибка загрузки деталей кроссворда:', error);
            alert('Ошибка загрузки деталей кроссворда');
        }
    }

    async deleteCrossword(crosswordId, crosswordTitle) {
        if (!confirm(`Вы уверены, что хотите удалить кроссворд "${crosswordTitle}"?`)) {
            return;
        }

        try {
            await ApiService.deleteCrossword(crosswordId);
            alert('Кроссворд успешно удален');
            // Обновляем список кроссвордов
            await this.loadCrosswords();
        } catch (error) {
            console.error('Ошибка удаления кроссворда:', error);
            alert('Ошибка удаления кроссворда: ' + (error.message || 'Неизвестная ошибка'));
        }
    }

    showCreationScreen() {
        document.getElementById('crossword-selection-screen').classList.remove('active');
        document.getElementById('crossword-creation-screen').classList.add('active');
        
        if (typeof crosswordCreationManager !== 'undefined') {
            crosswordCreationManager.show();
        }
    }

    showDashboard() {
        document.getElementById('crossword-selection-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
    }
}

// Глобальный экземпляр
const crosswordSelectionManager = new CrosswordSelectionManager();

