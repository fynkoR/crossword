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
        const createNewBtn = document.getElementById('create-new-crossword-btn');
        if (createNewBtn) {
            createNewBtn.addEventListener('click', () => {
                this.showCreationScreen();
            });
        }

        // Кнопка создания первого кроссворда (когда список пуст)
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
                console.log('[CrosswordSelectionManager] ===== КНОПКА ИГРАТЬ НАЖАТА =====');
                console.log('[CrosswordSelectionManager] crossword объект:', crossword);
                console.log('[CrosswordSelectionManager] crossword.id:', crossword.id, 'тип:', typeof crossword.id);
                console.log('[CrosswordSelectionManager] this:', this);
                console.log('[CrosswordSelectionManager] Проверка gameManager перед вызовом:');
                
                // Безопасная проверка gameManager через window (избегаем ReferenceError)
                const windowManager = typeof window !== 'undefined' ? window.gameManager : null;
                console.log('  - window.gameManager:', windowManager);
                console.log('  - window.gameManager существует:', windowManager !== null && windowManager !== undefined);
                console.log('  - window.gameManager тип:', typeof windowManager);
                
                if (!crossword.id) {
                    console.error('[CrosswordSelectionManager] Ошибка: у кроссворда отсутствует ID');
                    alert('Ошибка: у кроссворда отсутствует ID');
                    return;
                }
                
                console.log('[CrosswordSelectionManager] Вызываем this.startGame с ID:', crossword.id);
                this.startGame(crossword.id);
            });
            
            const detailBtn = document.createElement('button');
            detailBtn.className = 'btn btn-secondary';
            detailBtn.textContent = 'Детали';
            detailBtn.dataset.crosswordId = crossword.id;
            detailBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCrosswordDetails(crossword.id, detailBtn, crosswordCard);
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
            
            // Контейнер для деталей (скрыт по умолчанию)
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'crossword-details-container';
            detailsContainer.id = `crossword-details-${crossword.id}`;
            detailsContainer.style.display = 'none';
            
            crosswordCard.appendChild(title);
            crosswordCard.appendChild(info);
            crosswordCard.appendChild(actions);
            crosswordCard.appendChild(detailsContainer);
            
            crosswordsList.appendChild(crosswordCard);
        });
    }

    async startGame(crosswordId) {
        console.log('[CrosswordSelectionManager] startGame вызван с crosswordId:', crosswordId, 'тип:', typeof crosswordId);
        
        try {
            // Проверяем, что crosswordId передан
            if (!crosswordId) {
                console.error('[CrosswordSelectionManager] Ошибка: не указан ID кроссворда');
                alert('Ошибка: не указан ID кроссворда');
                return;
            }
            
            // Преобразуем в число, если это строка
            const id = typeof crosswordId === 'string' ? parseInt(crosswordId, 10) : crosswordId;
            if (isNaN(id)) {
                console.error('[CrosswordSelectionManager] Ошибка: некорректный ID кроссворда:', crosswordId);
                alert('Ошибка: некорректный ID кроссворда');
                return;
            }
            
            console.log('[CrosswordSelectionManager] Преобразованный ID:', id);
            
            // Проверяем наличие gameManager
            console.log('[CrosswordSelectionManager] Вызываем window.startGame с ID:', id);
            
            if (typeof window.startGame === 'function') {
                window.startGame({ crosswordId: id });
                
                // Переходим к экрану игры
                const selectionScreen = document.getElementById('crossword-selection-screen');
                const gameScreen = document.getElementById('game-screen');

                if (selectionScreen && gameScreen) {
                    selectionScreen.classList.remove('active');
                    gameScreen.classList.add('active');
                }
            } else {
                console.error('Функция window.startGame не найдена!');
                alert('Ошибка: функция запуска игры не найдена. Перезагрузите страницу.');
            }
        } catch (error) {
            console.error('[CrosswordSelectionManager] Ошибка запуска игры:', error);
            console.error('[CrosswordSelectionManager] Stack trace:', error.stack);
            alert('Ошибка запуска игры: ' + (error.message || 'Неизвестная ошибка'));
        }
    }

    async toggleCrosswordDetails(crosswordId, detailBtn, crosswordCard) {
        const detailsContainer = document.getElementById(`crossword-details-${crosswordId}`);
        
        // Закрываем все другие открытые детали
        document.querySelectorAll('.crossword-details-container').forEach(container => {
            if (container.id !== `crossword-details-${crosswordId}`) {
                container.style.display = 'none';
            }
        });
        
        document.querySelectorAll('.crossword-card .btn-secondary').forEach(btn => {
            if (btn.dataset.crosswordId && btn.dataset.crosswordId !== String(crosswordId)) {
                btn.textContent = 'Детали';
            }
        });
        
        // Если детали уже загружены и контейнер виден, просто скрываем/показываем
        if (detailsContainer.dataset.loaded === 'true') {
            const isVisible = detailsContainer.style.display !== 'none';
            detailsContainer.style.display = isVisible ? 'none' : 'block';
            detailBtn.textContent = isVisible ? 'Детали' : 'Скрыть';
            return;
        }

        // Если детали еще не загружены, показываем контейнер с индикатором загрузки
        detailsContainer.style.display = 'block';
        detailBtn.textContent = 'Загрузка...';
        detailBtn.disabled = true;
        
        detailsContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="loading-spinner" style="display: inline-block; width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div><p style="margin-top: 12px; color: var(--text-secondary); font-size: 14px;">Загрузка информации...</p></div>';

        try {
            // Загружаем детали кроссворда и статистику параллельно
            const [crossword, statistics] = await Promise.all([
                ApiService.getCrosswordDetail(crosswordId),
                ApiService.getCrosswordStatistics(crosswordId)
            ]);

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
            detailsHTML += '</div>';

            // Информация о создателе
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<h3>Создатель кроссворда</h3>';
            if (crossword.createdByUserId) {
                detailsHTML += `<div class="detail-item"><strong>ID создателя:</strong> ${crossword.createdByUserId}</div>`;
                detailsHTML += `<div class="detail-item"><strong>Логин создателя:</strong> ${crossword.createdByUserLogin || 'N/A'}</div>`;
            } else {
                detailsHTML += '<div class="detail-item">Создатель не указан</div>';
            }
            detailsHTML += '</div>';

            // Статистика выполнения
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<h3>Статистика выполнения</h3>';
            if (statistics && crossword.gridData && crossword.gridData.cells) {
                // Подсчитываем общее количество букв в кроссворде (не-черные клетки)
                const totalLetters = crossword.gridData.cells.filter(cell => !cell.isBlack).length;
                const guessedLetters = statistics.totalGuessedLetters || 0;
                
                detailsHTML += `<div class="detail-item"><strong>Всего букв в кроссворде:</strong> ${totalLetters}</div>`;
                detailsHTML += `<div class="detail-item"><strong>Отгадано букв:</strong> ${guessedLetters}</div>`;
                
                // Процент выполнения
                const completionPercentage = totalLetters > 0 
                    ? ((guessedLetters / totalLetters) * 100).toFixed(1)
                    : '0';
                detailsHTML += `<div class="detail-item"><strong>Процент выполнения:</strong> ${completionPercentage}%</div>`;
            } else if (statistics && statistics.totalGuessedLetters !== undefined && statistics.totalGuessedLetters !== null) {
                // Если нет данных о сетке, показываем только отгаданные буквы
                detailsHTML += `<div class="detail-item"><strong>Отгадано букв:</strong> ${statistics.totalGuessedLetters}</div>`;
                detailsHTML += '<div class="detail-item">Данные о сетке недоступны для расчета процента</div>';
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

            detailsContainer.innerHTML = detailsHTML;
            detailsContainer.dataset.loaded = 'true';
            detailBtn.textContent = 'Скрыть';
            detailBtn.disabled = false;
        } catch (error) {
            console.error('Ошибка загрузки деталей кроссворда:', error);
            
            // Показываем ошибку
            detailsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: var(--error-color); margin-bottom: 12px; font-size: 14px;">Не удалось загрузить информацию о кроссворде</p>
                    <p style="color: var(--text-secondary); font-size: 12px;">${error.message || 'Неизвестная ошибка'}</p>
                </div>
            `;
            detailBtn.textContent = 'Детали';
            detailBtn.disabled = false;
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

