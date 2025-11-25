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
            
            // Определяем тип кроссворда из названия
            const isManual = crossword.title && crossword.title.includes('(Ручной)');
            const isAuto = crossword.title && crossword.title.includes('(Автоматический)');
            const typeInfo = document.createElement('span');
            typeInfo.className = 'info-item';
            if (isManual) {
                typeInfo.innerHTML = '<strong>Тип:</strong> <span style="color: #3b82f6;">Ручной</span>';
            } else if (isAuto) {
                typeInfo.innerHTML = '<strong>Тип:</strong> <span style="color: #10b981;">Автоматический</span>';
            } else {
                typeInfo.innerHTML = '<strong>Тип:</strong> Не указан';
            }
            
            if (crossword.maxHints !== null && crossword.maxHints !== undefined) {
                const hintsInfo = document.createElement('span');
                hintsInfo.className = 'info-item';
                hintsInfo.innerHTML = `<strong>Подсказок:</strong> ${crossword.maxHints}`;
                info.appendChild(hintsInfo);
            }
            
            info.appendChild(gridSize);
            info.appendChild(dictionaryInfo);
            info.appendChild(typeInfo);
            
            const actions = document.createElement('div');
            actions.className = 'crossword-actions';
            
            const playBtn = document.createElement('button');
            playBtn.className = 'btn btn-primary';
            playBtn.textContent = 'Играть';
            playBtn.addEventListener('click', () => {
                console.log('Клик на кнопку Играть, crossword.id:', crossword.id, 'тип:', typeof crossword.id);
                if (!crossword.id) {
                    alert('Ошибка: у кроссворда отсутствует ID');
                    return;
                }
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
            // Проверяем, что crosswordId передан
            if (!crosswordId) {
                alert('Ошибка: не указан ID кроссворда');
                return;
            }
            
            // Преобразуем в число, если это строка
            const id = typeof crosswordId === 'string' ? parseInt(crosswordId, 10) : crosswordId;
            if (isNaN(id)) {
                alert('Ошибка: некорректный ID кроссворда');
                return;
            }
            
            // Переходим к экрану игры
            document.getElementById('crossword-selection-screen').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            
            // Запускаем игру с выбранным кроссвордом
            if (typeof gameManager !== 'undefined') {
                console.log('Передаем в gameManager.startGame:', { crosswordId: id });
                await gameManager.startGame({
                    crosswordId: id
                });
            } else {
                alert('Ошибка: менеджер игры не инициализирован');
            }
        } catch (error) {
            console.error('Ошибка запуска игры:', error);
            alert('Ошибка запуска игры: ' + (error.message || 'Неизвестная ошибка'));
        }
    }

    async showCrosswordDetails(crosswordId) {
        // Сразу открываем модальное окно с индикатором загрузки
        const modal = document.getElementById('crossword-details-modal');
        const titleEl = document.getElementById('crossword-details-title');
        const bodyEl = document.getElementById('crossword-details-body');

        // Показываем модальное окно сразу
        modal.classList.add('active');
        
        // Показываем индикатор загрузки
        titleEl.textContent = 'Загрузка...';
        bodyEl.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading-spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div><p style="margin-top: 16px; color: var(--text-secondary);">Загрузка информации о кроссворде...</p></div>';

        // Обработчик закрытия (добавляем сразу)
        const closeBtn = document.getElementById('close-crossword-details-modal');
        const closeHandler = () => {
            modal.classList.remove('active');
            closeBtn.removeEventListener('click', closeHandler);
        };
        closeBtn.addEventListener('click', closeHandler);

        // Закрытие по клику вне модального окна
        const modalClickHandler = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                modal.removeEventListener('click', modalClickHandler);
            }
        };
        modal.addEventListener('click', modalClickHandler);

        try {
            // Загружаем детали кроссворда и статистику параллельно
            const [crossword, statistics] = await Promise.all([
                ApiService.getCrosswordDetail(crosswordId),
                ApiService.getCrosswordStatistics(crosswordId)
            ]);

            // Обновляем заголовок
            titleEl.textContent = crossword.title || 'Без названия';

            // Формируем HTML с деталями
            let detailsHTML = '<div class="crossword-details">';
            
            // Основная информация
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<h3>Основная информация</h3>';
            detailsHTML += `<div class="detail-item"><strong>ID:</strong> ${crossword.id || 'N/A'}</div>`;
            detailsHTML += `<div class="detail-item"><strong>Название:</strong> ${crossword.title || 'Без названия'}</div>`;
            detailsHTML += `<div class="detail-item"><strong>Размер сетки:</strong> ${crossword.gridWidth || 'N/A'} × ${crossword.gridHeight || 'N/A'}</div>`;
            detailsHTML += `<div class="detail-item"><strong>Максимум подсказок:</strong> ${crossword.maxHints !== null && crossword.maxHints !== undefined ? crossword.maxHints : 'Не указано'}</div>`;
            detailsHTML += '</div>';

            // Информация о словаре
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<h3>Словарь</h3>';
            if (crossword.dictionary) {
                detailsHTML += `<div class="detail-item"><strong>ID словаря:</strong> ${crossword.dictionary.id || 'N/A'}</div>`;
                detailsHTML += `<div class="detail-item"><strong>Название словаря:</strong> ${crossword.dictionary.title || 'N/A'}</div>`;
                if (crossword.dictionary.description) {
                    detailsHTML += `<div class="detail-item"><strong>Описание:</strong> ${crossword.dictionary.description}</div>`;
                }
            } else {
                detailsHTML += '<div class="detail-item">Словарь не указан</div>';
            }
            detailsHTML += '</div>';

            // Информация о словах
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<h3>Слова в кроссворде</h3>';
            const wordsCount = crossword.wordsData?.words?.length || 0;
            detailsHTML += `<div class="detail-item"><strong>Количество слов:</strong> ${wordsCount}</div>`;
            if (statistics && statistics.wordsCount !== undefined) {
                detailsHTML += `<div class="detail-item"><strong>Слов в кроссворде (из статистики):</strong> ${statistics.wordsCount}</div>`;
            }
            detailsHTML += '</div>';

            // Статистика игр
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<h3>Статистика игр</h3>';
            if (statistics) {
                detailsHTML += `<div class="detail-item"><strong>Всего попыток:</strong> ${statistics.gamesCount || 0}</div>`;
                detailsHTML += `<div class="detail-item"><strong>Завершенных игр:</strong> ${statistics.completedGamesCount || 0}</div>`;
                const completionRate = statistics.gamesCount > 0 
                    ? ((statistics.completedGamesCount / statistics.gamesCount) * 100).toFixed(1) 
                    : '0';
                detailsHTML += `<div class="detail-item"><strong>Процент завершения:</strong> ${completionRate}%</div>`;
            } else {
                detailsHTML += '<div class="detail-item">Статистика недоступна</div>';
            }
            detailsHTML += '</div>';

            // Дополнительная информация
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<h3>Дополнительная информация</h3>';
            if (crossword.wordsData && crossword.wordsData.words && crossword.wordsData.words.length > 0) {
                detailsHTML += '<div class="detail-item"><strong>Список слов:</strong></div>';
                detailsHTML += '<ul class="words-list">';
                crossword.wordsData.words.forEach((word, index) => {
                    detailsHTML += `<li>${index + 1}. ${word.text || 'N/A'} - ${word.definition || 'Без определения'}</li>`;
                });
                detailsHTML += '</ul>';
            }
            detailsHTML += '</div>';

            detailsHTML += '</div>';

            bodyEl.innerHTML = detailsHTML;
        } catch (error) {
            console.error('Ошибка загрузки деталей кроссворда:', error);
            
            // Показываем ошибку в модальном окне
            titleEl.textContent = 'Ошибка загрузки';
            bodyEl.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: var(--error-color); margin-bottom: 16px;">Не удалось загрузить информацию о кроссворде</p>
                    <p style="color: var(--text-secondary); font-size: 14px;">${error.message || 'Неизвестная ошибка'}</p>
                    <button class="btn btn-secondary" style="margin-top: 20px;" onclick="document.getElementById('crossword-details-modal').classList.remove('active')">Закрыть</button>
                </div>
            `;
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

