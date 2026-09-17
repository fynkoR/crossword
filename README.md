# Crossword

Веб-приложение для создания, генерации и решения кроссвордов. Backend на Spring Boot + встроенный фронтенд на статичном HTML/CSS/JS.

## Возможности
- **Словари слов** — импорт и управление словарями подсказок/слов (`Dictionary`, `Word`, `DictionaryController`, `WordController`), есть готовые файлы словарей (`crossword_dictionary.txt`, `crossword_dictionary_100.txt`).
- **Кроссворды** — создание кроссвордов вручную и автогенерация сетки по словарю (`CrosswordController`, `CrosswordGeneratorService`, `CrosswordService`).
- **Игровой режим** — запуск игры, ответы на вопросы, проверка правильности, подсчёт результата (`GameController`, `GameService`, `CheckAnswerResponse`, `GameResultDto`).
- **Пользователи** — регистрация и авторизация (`UserController`, `UserService`).
- **Готовый веб-интерфейс** — страницы логина/регистрации, дашборды пользователя и админа, создание кроссворда, сама игра (`static/html/*`, `static/js/*`, `static/styles/*`).

## Стек
- Java, Spring Boot (Web, Data JPA, Validation)
- MySQL (через `mysql-connector-j`)
- MapStruct + Lombok
- Jackson (в т.ч. поддержка `java.time` через `jackson-datatype-jsr310`)
- Фронтенд — обычные HTML/CSS/JS-страницы, отдаются самим Spring Boot (`src/main/resources/static`)

## Структура проекта
```
src/main/java/com/example/crossword/
  controller/   — REST-контроллеры (Crossword, Dictionary, Game, User, Word)
  service/      — бизнес-логика, включая генератор кроссвордов
  repository/   — Spring Data JPA репозитории
  enitity/      — JPA-сущности (Crossword, Dictionary, Game, User, Word)
  dto/          — DTO для запросов/ответов, разбиты по доменам
  mapper/       — MapStruct-мапперы
src/main/resources/
  static/html/  — страницы (логин, регистрация, дашборды, создание и игра в кроссворд)
  static/js/    — клиентская логика (auth, игра, создание/выбор кроссворда, словари)
  static/styles/— стили
crossword_dictionary*.txt — примеры словарей для импорта
```
