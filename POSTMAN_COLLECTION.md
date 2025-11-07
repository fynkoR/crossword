# 🚀 Crossword Backend API - Postman Collection

**Base URL:** `http://localhost:8080`

---

## 👤 USERS (Пользователи)

### 1. Регистрация пользователя
```
POST /users/register
Content-Type: application/json

{
  "login": "testuser",
  "password": "password123"
}
```
**Ответ:** `{ "id": 1, "login": "testuser", "admin": false }`

---

### 2. Получить всех пользователей
```
GET /users
```
**Ответ:** Массив пользователей

---

### 3. Получить пользователя по ID
```
GET /users/{id}

Пример: GET /users/1
```

---

### 4. Удалить пользователя
```
DELETE /users/{id}

Пример: DELETE /users/1
```

---

## 📚 DICTIONARIES (Словари)

### 5. Создать словарь
```
POST /dictionaries
Content-Type: application/json

{
  "title": "Общий словарь",
  "description": "Словарь общих слов"
}
```

---

### 6. Получить все словари
```
GET /dictionaries
```

---

### 7. Получить словарь по ID
```
GET /dictionaries/{id}

Пример: GET /dictionaries/1
```

---

### 8. Обновить словарь
```
PUT /dictionaries/{id}
Content-Type: application/json

{
  "id": 1,
  "title": "Обновленный словарь",
  "description": "Новое описание"
}

Пример: PUT /dictionaries/1
```

---

### 9. Удалить словарь
```
DELETE /dictionaries/{id}

Пример: DELETE /dictionaries/1
```

---

## 📝 WORDS (Слова)

### 10. Создать слово
```
POST /words
Content-Type: application/json

{
  "word": "кот",
  "definition": "Домашнее животное",
  "dictionaryId": 1
}
```

---

### 11. Получить все слова
```
GET /words
```

---

### 12. Получить слово по ID
```
GET /words/{id}

Пример: GET /words/1
```

---

### 13. Обновить слово
```
PUT /words/{id}
Content-Type: application/json

{
  "id": 1,
  "word": "кошка",
  "definition": "Домашнее животное семейства кошачьих",
  "dictionaryId": 1
}

Пример: PUT /words/1
```

---

### 14. Удалить слово
```
DELETE /words/{id}

Пример: DELETE /words/1
```

---

### 15. Получить слова по словарю
```
GET /words/dictionary/{dictionaryId}

Пример: GET /words/dictionary/1
```

---

## 🧩 CROSSWORDS (Кроссворды)

### 16. Создать кроссворд
```
POST /crosswords
Content-Type: application/json

{
  "title": "Простой кроссворд",
  "gridWidth": 10,
  "gridHeight": 10,
  "gridData": "{\"cells\":[]}",
  "wordsData": "{\"words\":[]}",
  "dictionaryId": 1
}
```

---

### 17. Получить все кроссворды
```
GET /crosswords
```

---

### 18. Получить кроссворд по ID
```
GET /crosswords/{id}

Пример: GET /crosswords/1
```

---

### 19. Обновить кроссворд
```
PUT /crosswords/{id}
Content-Type: application/json

{
  "title": "Обновленный кроссворд",
  "gridWidth": 15,
  "gridHeight": 15,
  "gridData": "{\"cells\":[]}",
  "wordsData": "{\"words\":[]}"
}

Пример: PUT /crosswords/1
```

---

### 20. Удалить кроссворд
```
DELETE /crosswords/{id}

Пример: DELETE /crosswords/1
```

---

### 21. Получить детальную информацию о кроссворде
```
GET /crosswords/{id}/detail

Пример: GET /crosswords/1/detail
```

---

### 22. Получить статистику кроссворда
```
GET /crosswords/{id}/statistics

Пример: GET /crosswords/1/statistics
```

---

## 🎮 GAMES (Игры)

### 23. Создать игру
```
POST /games
Content-Type: application/json

{
  "userId": 1,
  "crosswordId": 1
}
```

---

### 24. Получить игру по ID
```
GET /games/{id}

Пример: GET /games/1
```

---

### 25. Обновить игру
```
PUT /games/{id}
Content-Type: application/json

{
  "id": 1,
  "hintsUsed": 2,
  "gameOver": false,
  "solvedWordsCount": 5,
  "isPaused": false,
  "userId": 1,
  "crosswordId": 1
}

Пример: PUT /games/1
```

---

### 26. Удалить игру
```
DELETE /games/{id}

Пример: DELETE /games/1
```

---

### 27. Получить игры пользователя
```
GET /games/user/{userId}

Пример: GET /games/user/1
```

---

### 28. Получить игры по кроссворду
```
GET /games/crossword/{crosswordId}

Пример: GET /games/crossword/1
```

---

## ✅ РАБОТАЮЩИЕ ENDPOINTS (протестированы):

1. ✅ `POST /users/register` - Регистрация
2. ✅ `GET /users` - Список пользователей
3. ✅ `GET /users/{id}` - Получить пользователя
4. ✅ `POST /dictionaries` - Создать словарь
5. ✅ `GET /dictionaries` - Список словарей
6. ✅ `GET /dictionaries/{id}` - Получить словарь
7. ✅ `PUT /dictionaries/{id}` - Обновить словарь
8. ✅ `POST /words` - Создать слово
9. ✅ `GET /words` - Список слов

---

## 📊 Примеры ответов:

### Успешный ответ (200/201):
```json
{
  "id": 1,
  "login": "testuser",
  "admin": false
}
```

### Ошибка (404 Not Found):
```json
{
  "timestamp": "2025-11-07T10:37:32.435+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/users/999"
}
```

---

## 🔧 Тестовые данные в БД:

**Пользователи:**
- ID: 1, Login: testuser
- ID: 2, Login: admin

**Словари:**
- ID: 1, Title: "Обновленный словарь"

**Слова:**
- ID: 1, Word: "кот", Dictionary: 1
- ID: 2, Word: "дом", Dictionary: 1

---

## 🌐 Для импорта в Postman:

1. Откройте Postman
2. File → Import → Raw text
3. Скопируйте эти запросы
4. Или используйте URL: `http://localhost:8080`

