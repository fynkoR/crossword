// API конфигурация
const API_BASE_URL = 'http://localhost:8080';

// Утилиты для работы с API
class ApiService {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };
        
        // Если есть тело запроса и это не FormData, преобразуем в JSON
        if (config.body && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Проверяем успешные статусы (200-299)
            if (response.status >= 200 && response.status < 300) {
                // Если ответ пустой (например, 204 No Content), возвращаем null
                if (response.status === 204 || response.headers.get('content-length') === '0') {
                    return null;
                }
                
                // Пытаемся прочитать как JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    return text ? JSON.parse(text) : null;
                }
                
                // Если не JSON, возвращаем null
                return null;
            }

            // Обработка ошибок (статусы 400+)
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorText = await response.text();
                if (errorText) {
                    // Пытаемся распарсить как JSON
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || errorText;
                    } catch {
                        errorMessage = errorText;
                    }
                }
            } catch (e) {
                // Если не удалось прочитать текст ошибки, используем стандартное сообщение
                errorMessage = `HTTP error! status: ${response.status}`;
            }
            
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Пользователи
    static async register(login, password) {
        return this.request('/users/register', {
            method: 'POST',
            body: { login, password },
        });
    }

    static async login(login, password) {
        return this.request('/users/auth', {
            method: 'POST',
            body: { login, password },
        });
    }

    static async getUser(id) {
        return this.request(`/users/${id}`);
    }

    // Словари
    static async getDictionaries() {
        return this.request('/dictionaries');
    }

    static async getDictionary(id) {
        return this.request(`/dictionaries/${id}`);
    }

    static async createDictionary(title, description) {
        return this.request('/dictionaries', {
            method: 'POST',
            body: { title, description },
        });
    }

    static async updateDictionary(id, title, description) {
        return this.request(`/dictionaries/${id}`, {
            method: 'PUT',
            body: { title, description },
        });
    }

    static async deleteDictionary(id) {
        return this.request(`/dictionaries/${id}`, {
            method: 'DELETE',
        });
    }

    static async getWordsFromDictionary(dictionaryId, sortBy = null) {
        let url = `/dictionaries/${dictionaryId}/words`;
        if (sortBy) {
            url += `?sortBy=${encodeURIComponent(sortBy)}`;
        }
        return this.request(url);
    }

    static async importDictionary(dictionaryId, file, skipDuplicates = true) {
        const formData = new FormData();
        formData.append('file', file);
        
        return this.request(`/dictionaries/${dictionaryId}/import?skipDuplicates=${skipDuplicates}`, {
            method: 'POST',
            headers: {}, // Не устанавливаем Content-Type для FormData
            body: formData,
        });
    }

    static async exportDictionary(dictionaryId) {
        const url = `${API_BASE_URL}/dictionaries/${dictionaryId}/export`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'dictionary.txt';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
    }

    // Слова
    static async createWord(dictionaryId, word, definition) {
        return this.request('/words', {
            method: 'POST',
            body: { dictionaryId, word, definition },
        });
    }

    static async updateWord(id, word, definition) {
        return this.request(`/words/${id}`, {
            method: 'PUT',
            body: { word, definition },
        });
    }

    static async deleteWord(id) {
        return this.request(`/words/${id}`, {
            method: 'DELETE',
        });
    }

    // Кроссворды
    static async getCrosswords() {
        return this.request('/crosswords');
    }

    static async getCrossword(id) {
        return this.request(`/crosswords/${id}`);
    }

    static async getCrosswordDetail(id) {
        return this.request(`/crosswords/${id}/detail`);
    }

    static async getCrosswordStatistics(id) {
        return this.request(`/crosswords/${id}/statistics`);
    }

    static async generateCrossword(dictionaryId, wordCount, title, maxHints = null) {
        // Валидация параметров
        if (!dictionaryId) {
            throw new Error('Не указан ID словаря');
        }
        if (!wordCount || wordCount === 'undefined' || wordCount === undefined) {
            throw new Error('Не указано количество слов для генерации кроссворда');
        }
        if (!title) {
            throw new Error('Не указано название кроссворда');
        }
        
        // Преобразуем wordCount в число, если это строка
        const wordCountNum = typeof wordCount === 'string' ? parseInt(wordCount, 10) : wordCount;
        if (isNaN(wordCountNum) || wordCountNum < 1) {
            throw new Error('Некорректное количество слов');
        }
        
        let url = `/crosswords/generate?dictionaryId=${dictionaryId}&wordCount=${wordCountNum}&title=${encodeURIComponent(title)}`;
        if (maxHints !== null && maxHints !== undefined) {
            url += `&maxHints=${maxHints}`;
        }
        
        return this.request(url, {
            method: 'POST',
        });
    }

    static async checkCrosswordVariants(dictionaryId, minWords = 3, maxWords = 10) {
        return this.request(`/crosswords/check-variants?dictionaryId=${dictionaryId}&minWords=${minWords}&maxWords=${maxWords}`);
    }

    static async createManualCrossword(dictionaryId, wordIds, title, maxHints = null) {
        const body = { dictionaryId, wordIds, title };
        if (maxHints !== null && maxHints !== undefined) {
            body.maxHints = maxHints;
        }
        return this.request('/crosswords/create-manual', {
            method: 'POST',
            body: body,
        });
    }

    static async deleteCrossword(id) {
        return this.request(`/crosswords/${id}`, {
            method: 'DELETE',
        });
    }

    // Игры
    static async startGame(crosswordId, userId) {
        return this.request('/games', {
            method: 'POST',
            body: {
                crosswordId,
                userId,
                action: 'start'
            },
        });
    }

    static async getGame(id) {
        return this.request(`/games/${id}`);
    }

    static async checkAnswer(gameId, wordId, answer) {
        return this.request(`/games/${gameId}/action`, {
            method: 'POST',
            body: {
                action: 'check',
                wordId,
                answer
            },
        });
    }

    static async useHint(gameId) {
        return this.request(`/games/${gameId}/action`, {
            method: 'POST',
            body: {
                action: 'hint'
            },
        });
    }

    static async saveGridState(gameId, gridState) {
        return this.request(`/games/${gameId}/action`, {
            method: 'POST',
            body: {
                action: 'saveGridState',
                gridState: gridState
            },
        });
    }
}

